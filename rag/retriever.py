import faiss
import numpy as np


class SchemeRetriever:

    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.index = None
        self.documents = []

    def build_index(self, documents):
        """
        Create FAISS vector index from scheme documents.
        """

        self.documents = documents

        texts = [
            document["text"]
            for document in documents
        ]

        embeddings = self.embedding_model.encode(texts)

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dimension)

        self.index.add(
            np.asarray(embeddings, dtype="float32")
        )

        print(f"FAISS index created with {len(documents)} schemes.")

    def search(self, query, top_k=3):
        """
        Retrieve the most relevant schemes.
        """

        if self.index is None:
            raise RuntimeError("FAISS index has not been built.")

        query_embedding = self.embedding_model.encode([query])

        scores, indices = self.index.search(
            np.asarray(query_embedding, dtype="float32"),
            top_k
        )

        results = []

        for score, index in zip(scores[0], indices[0]):

            if index == -1:
                continue

            document = self.documents[index].copy()

            document["score"] = float(score)

            results.append(document)

        return results