import json
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).parent.parent

SCHEMES_FILE = BASE_DIR / "data" / "schemes.json"

CHROMA_DIR = BASE_DIR / "vector_store"


# ============================================================
# EMBEDDING MODEL
# ============================================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# CHROMA CLIENT
# ============================================================

chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)


# ============================================================
# COLLECTION
# ============================================================

collection = chroma_client.get_or_create_collection(
    name="government_schemes"
)


# ============================================================
# LOAD SCHEMES
# ============================================================

def load_schemes():

    with open(
        SCHEMES_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


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
    # Generate embeddings
    # --------------------------------------------------------

    embeddings = embedding_model.encode(
        documents
    ).tolist()

    # --------------------------------------------------------
    # Store in ChromaDB
    # --------------------------------------------------------

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
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

    query_embedding = embedding_model.encode(
        [query]
    ).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )

    return results


# ============================================================
# RAG SEARCH
# RETURN COMPLETE SCHEME OBJECTS
# ============================================================

# Maximum ChromaDB L2 distance to consider a scheme relevant.
# Distances are squared-Euclidean in cosine-normalised space,
# so 1.0 ≈ cos-similarity 0.5. Values above this threshold
# indicate the scheme is semantically unrelated to the query.
_MAX_RELEVANT_DISTANCE = 0.9


def search_full_schemes(
    query: str,
    top_k: int = 8,
    distance_threshold: float = _MAX_RELEVANT_DISTANCE
):

    """
    Performs semantic search using ChromaDB
    and returns complete scheme objects
    from schemes.json.

    Schemes whose ChromaDB distance exceeds *distance_threshold*
    are dropped so that only genuinely relevant results reach
    IBM Granite.

    Additional internal fields:

    _rag_distance
        ChromaDB semantic distance.

    _rag_score
        Converted semantic relevance score.

    _rag_rank
        Position returned by ChromaDB.
    """

    # --------------------------------------------------------
    # Validate query
    # --------------------------------------------------------

    if not query or not query.strip():

        return []

    # --------------------------------------------------------
    # Semantic search — fetch more than needed so the
    # distance filter still leaves enough candidates.
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
        # Distance threshold filter:
        # Drop schemes that are semantically too far from the
        # query so that irrelevant results never reach Granite.
        # ----------------------------------------------------

        if (
            distance is not None
            and distance_threshold is not None
            and distance > distance_threshold
        ):
            continue

        # ----------------------------------------------------
        # Convert distance to relevance score
        #
        # Lower distance = better match
        #
        # relevance = 1 / (1 + distance)
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