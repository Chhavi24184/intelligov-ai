import json
from pathlib import Path

import networkx as nx


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).parent.parent

SCHEMES_FILE = BASE_DIR / "data" / "schemes.json"


# ============================================================
# KNOWLEDGE GRAPH
# ============================================================

knowledge_graph = nx.MultiDiGraph()


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
# NORMALIZE NODE ID
# ============================================================

def normalize(value: str):

    return (
        value
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


# ============================================================
# BUILD KNOWLEDGE GRAPH
# ============================================================

def build_knowledge_graph():

    global knowledge_graph

    knowledge_graph = nx.MultiDiGraph()

    schemes = load_schemes()

    if not schemes:

        print("No schemes found.")

        return knowledge_graph

    for scheme in schemes:

        scheme_id = str(
            scheme.get("id")
        )

        scheme_name = scheme.get(
            "name",
            ""
        )

        category = scheme.get(
            "category",
            ""
        )

        description = scheme.get(
            "description",
            ""
        )

        eligibility = scheme.get(
            "eligibility",
            ""
        )

        documents = scheme.get(
            "documents",
            []
        )

        # ====================================================
        # SCHEME NODE
        # ====================================================

        scheme_node = f"scheme:{scheme_id}"

        knowledge_graph.add_node(
            scheme_node,
            node_type="scheme",
            id=scheme_id,
            name=scheme_name,
            category=category,
            description=description,
            eligibility=eligibility
        )

        # ====================================================
        # CATEGORY NODE
        # ====================================================

        if category:

            category_node = (
                f"category:{normalize(category)}"
            )

            knowledge_graph.add_node(
                category_node,
                node_type="category",
                name=category
            )

            knowledge_graph.add_edge(
                scheme_node,
                category_node,
                relation="BELONGS_TO"
            )

        # ====================================================
        # DOCUMENT NODES
        # ====================================================

        for document in documents:

            if not document:
                continue

            document_node = (
                f"document:{normalize(document)}"
            )

            knowledge_graph.add_node(
                document_node,
                node_type="document",
                name=document
            )

            knowledge_graph.add_edge(
                scheme_node,
                document_node,
                relation="REQUIRES_DOCUMENT"
            )

        # ====================================================
        # ELIGIBILITY NODE
        # ====================================================

        if eligibility:

            eligibility_node = (
                f"eligibility:{scheme_id}"
            )

            knowledge_graph.add_node(
                eligibility_node,
                node_type="eligibility",
                text=eligibility
            )

            knowledge_graph.add_edge(
                scheme_node,
                eligibility_node,
                relation="HAS_ELIGIBILITY"
            )

        # ====================================================
        # DESCRIPTION NODE
        # ====================================================

        if description:

            description_node = (
                f"description:{scheme_id}"
            )

            knowledge_graph.add_node(
                description_node,
                node_type="description",
                text=description
            )

            knowledge_graph.add_edge(
                scheme_node,
                description_node,
                relation="HAS_DESCRIPTION"
            )

    return knowledge_graph


# ============================================================
# GET SCHEME BY NAME
# ============================================================

def find_scheme(
    scheme_name: str
):

    if not scheme_name:
        return None

    query = scheme_name.lower().strip()

    for node, data in knowledge_graph.nodes(
        data=True
    ):

        if data.get("node_type") != "scheme":
            continue

        name = data.get(
            "name",
            ""
        ).lower()

        if query in name:

            return {
                "node": node,
                **data
            }

    return None


# ============================================================
# GET SCHEME DOCUMENTS
# ============================================================

def get_scheme_documents(
    scheme_name: str
):

    scheme = find_scheme(
        scheme_name
    )

    if not scheme:

        return []

    scheme_node = scheme["node"]

    documents = []

    for _, target, edge_data in knowledge_graph.out_edges(
        scheme_node,
        data=True
    ):

        if edge_data.get(
            "relation"
        ) != "REQUIRES_DOCUMENT":

            continue

        target_data = knowledge_graph.nodes[
            target
        ]

        documents.append(
            target_data.get(
                "name"
            )
        )

    return documents


# ============================================================
# GET SCHEMES BY CATEGORY
# ============================================================

def get_schemes_by_category(
    category: str
):

    if not category:
        return []

    query = category.lower().strip()

    matching_schemes = []

    for node, data in knowledge_graph.nodes(
        data=True
    ):

        if data.get("node_type") != "scheme":
            continue

        scheme_category = data.get(
            "category",
            ""
        ).lower()

        if query in scheme_category:

            matching_schemes.append({
                "id": data.get("id"),
                "name": data.get("name"),
                "category": data.get("category"),
                "description": data.get("description"),
                "eligibility": data.get("eligibility")
            })

    return matching_schemes


# ============================================================
# GET SCHEME DETAILS
# ============================================================

def get_scheme_details(
    scheme_name: str
):

    scheme = find_scheme(
        scheme_name
    )

    if not scheme:

        return None

    documents = get_scheme_documents(
        scheme_name
    )

    return {
        "id": scheme.get("id"),
        "name": scheme.get("name"),
        "category": scheme.get("category"),
        "description": scheme.get("description"),
        "eligibility": scheme.get("eligibility"),
        "documents": documents
    }


# ============================================================
# GRAPH STATISTICS
# ============================================================

def get_graph_stats():

    return {
        "nodes": knowledge_graph.number_of_nodes(),
        "edges": knowledge_graph.number_of_edges()
    }


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    graph = build_knowledge_graph()

    print(
        "Knowledge Graph built successfully."
    )

    print(
        "Total nodes:",
        graph.number_of_nodes()
    )

    print(
        "Total edges:",
        graph.number_of_edges()
    )