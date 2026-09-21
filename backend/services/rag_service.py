import json
import os
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).parent.parent

SCHEMES_FILE = BASE_DIR / "data" / "schemes.json"

CHROMA_DIR = BASE_DIR / "vector_store"


# ============================================================
# CHROMA ONNX CACHE — point to a stable directory so the
# all-MiniLM-L6-v2 model is not re-downloaded on every cold
# start on Render or similar ephemeral environments.
# Dockerfile pre-bakes the model into /app/.chroma_cache.
# Falls back to a writable local path when not in Docker.
# ============================================================

_DEFAULT_CACHE = str(BASE_DIR / ".chroma_cache")
os.environ.setdefault("CHROMA_CACHE_DIR", _DEFAULT_CACHE)
os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", _DEFAULT_CACHE)


# ============================================================
# CHROMA CLIENT
# ============================================================

chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)


# ============================================================
# EMBEDDING FUNCTION
# ============================================================

embedding_function = embedding_functions.DefaultEmbeddingFunction()


# ============================================================
# COLLECTION
# ============================================================

collection = chroma_client.get_or_create_collection(
    name="government_schemes",
    embedding_function=embedding_function
)


# ============================================================
# LOAD SCHEMES — cached so schemes.json is read only once
# per process, not on every query.
# ============================================================

_schemes_cache: list | None = None


def load_schemes() -> list:

    global _schemes_cache

    if _schemes_cache is not None:
        return _schemes_cache

    with open(
        SCHEMES_FILE,
        "r",
        encoding="utf-8"
    ) as file:
        _schemes_cache = json.load(file)

    return _schemes_cache


# ============================================================
# CREATE SEARCHABLE TEXT
# ============================================================

def create_scheme_text(scheme):

    return (
        f"Scheme Name: {scheme.get('name', '')}. "
        f"Category: {scheme.get('category', '')}. "
        f"Description: {scheme.get('description', '')}. "
        f"Eligibility: {scheme.get('eligibility', '')}. "
        f"Documents: {', '.join(scheme.get('documents', []))}."
    )


# ============================================================
# INDEX SCHEMES
# ============================================================

def index_schemes():

    schemes = load_schemes()

    if not schemes:

        print("No schemes found.")

        return

    documents = []
    ids = []
    metadatas = []

    for scheme in schemes:

        scheme_id = str(
            scheme["id"]
        )

        documents.append(
            create_scheme_text(scheme)
        )

        ids.append(
            scheme_id
        )

        metadatas.append({
            "scheme_id": scheme_id,
            "name": scheme.get(
                "name",
                ""
            ),
            "category": scheme.get(
                "category",
                ""
            )
        })

    # --------------------------------------------------------
    # Store documents in ChromaDB
    # ChromaDB generates embeddings automatically
    # --------------------------------------------------------

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    print(
        f"Successfully indexed {len(schemes)} schemes."
    )


# ============================================================
# RAW CHROMADB SEARCH
# ============================================================

def search_schemes(
    query: str,
    top_k: int = 5
):

    if not query or not query.strip():

        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]]
        }

    # --------------------------------------------------------
    # ChromaDB automatically generates query embedding
    # --------------------------------------------------------

    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )

    return results


# ============================================================
# RAG SEARCH
# RETURN COMPLETE SCHEME OBJECTS
# ============================================================

# Maximum ChromaDB L2 distance to consider a scheme relevant.
# The all-MiniLM-L6-v2 L2 distances for this scheme corpus
# typically range from ~0.6 (exact name match) to ~1.5
# (thematically related). A threshold of 0.9 was too strict
# and filtered out almost all valid employment/career results.
_MAX_RELEVANT_DISTANCE = 1.5


# For document queries, use an even higher threshold.
_MAX_DOCUMENT_QUERY_DISTANCE = 1.8


def search_full_schemes(
    query: str,
    top_k: int = 8,
    distance_threshold: float = _MAX_RELEVANT_DISTANCE,
    is_document_query: bool = False,
    prefer_with_documents: bool = False
):

    """
    Performs semantic search using ChromaDB
    and returns complete scheme objects
    from schemes.json.
    """

    # --------------------------------------------------------
    # Adjust distance threshold for document queries
    # --------------------------------------------------------

    if is_document_query:

        distance_threshold = _MAX_DOCUMENT_QUERY_DISTANCE

    if not query or not query.strip():

        return []

    # --------------------------------------------------------
    # Semantic search
    # --------------------------------------------------------

    results = search_schemes(
        query=query,
        top_k=top_k
    )

    # --------------------------------------------------------
    # Get IDs returned by ChromaDB
    # --------------------------------------------------------

    result_ids = []

    if results.get("ids"):

        result_ids = results["ids"][0]

    if not result_ids:

        return []

    # --------------------------------------------------------
    # Get distances
    # --------------------------------------------------------

    distances = []

    if results.get("distances"):

        distances = results["distances"][0]

    # --------------------------------------------------------
    # Load complete scheme database
    # --------------------------------------------------------

    schemes = load_schemes()

    # --------------------------------------------------------
    # Create ID -> Scheme mapping
    # --------------------------------------------------------

    scheme_map = {
        str(scheme.get("id")): scheme
        for scheme in schemes
    }

    # --------------------------------------------------------
    # Convert ChromaDB IDs
    # into complete scheme objects
    # --------------------------------------------------------

    retrieved_schemes = []

    for index, scheme_id in enumerate(
        result_ids
    ):

        scheme = scheme_map.get(
            str(scheme_id)
        )

        if not scheme:

            continue

        # ----------------------------------------------------
        # Distance
        # ----------------------------------------------------

        distance = None

        if index < len(distances):

            distance = distances[index]

        # ----------------------------------------------------
        # Distance threshold filter
        # ----------------------------------------------------

        if (
            distance is not None
            and distance_threshold is not None
            and distance > distance_threshold
        ):

            continue

        # ----------------------------------------------------
        # Convert distance to relevance score
        # ----------------------------------------------------

        if distance is not None:

            relevance_score = 1 / (
                1 + distance
            )

        else:

            relevance_score = 0

        # ----------------------------------------------------
        # Add internal RAG metadata
        # ----------------------------------------------------

        retrieved_scheme = {
            **scheme,

            "_rag_distance": distance,

            "_rag_score": round(
                relevance_score,
                4
            ),

            "_rag_rank": index + 1
        }

        retrieved_schemes.append(
            retrieved_scheme
        )

    # --------------------------------------------------------
    # For document queries, prioritize schemes
    # with non-empty documents
    # --------------------------------------------------------

    if prefer_with_documents:

        with_docs = [
            s
            for s in retrieved_schemes
            if s.get("documents")
            and len(s.get("documents", [])) > 0
        ]

        without_docs = [
            s
            for s in retrieved_schemes
            if not s.get("documents")
            or len(s.get("documents", [])) == 0
        ]

        retrieved_schemes = (
            with_docs + without_docs
        )

    return retrieved_schemes


# ============================================================
# COLLECTION COUNT
# ============================================================

def get_collection_count():

    return collection.count()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print(
        "Indexing government schemes..."
    )

    index_schemes()

    print(
        "Total documents in ChromaDB:",
        get_collection_count()
    )