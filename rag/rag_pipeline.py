import requests

from rag.data_loader import load_schemes, prepare_documents
from rag.embeddings import EmbeddingModel
from rag.retriever import SchemeRetriever


class RAGPipeline:

    def __init__(
        self,
        data_path="Government_Schemes.json",
        ollama_model="granite3.3:2b"
    ):

        self.ollama_model = ollama_model

        # Load scheme data
        schemes = load_schemes(data_path)

        # Convert schemes to documents
        documents = prepare_documents(schemes)

        # Load embedding model
        self.embedding_model = EmbeddingModel()

        # Create retriever
        self.retriever = SchemeRetriever(
            self.embedding_model
        )

        # Build FAISS index
        self.retriever.build_index(documents)

        print("RAG pipeline initialized successfully.")

    def retrieve(self, query, top_k=3):
        """
        Retrieve relevant government schemes.
        """

        return self.retriever.search(
            query,
            top_k=top_k
        )

    def build_prompt(self, query, results):
        """
        Create a grounded prompt for the LLM.
        """

        if not results:
            context = "No relevant government schemes were found."
        else:
            context = "\n\n".join(
                result["text"]
                for result in results
            )

        prompt = f"""
You are IntelliGov AI, a government scheme assistant.

Answer the user's question ONLY using the government scheme
information provided in the CONTEXT.

IMPORTANT RULES:

1. Do not invent government schemes.
2. Do not invent eligibility criteria.
3. Do not invent benefits.
4. Do not invent required documents.
5. Do not claim that a scheme exists if it is not present in the context.
6. If the context does not contain enough information, clearly say:
   "I don't have enough information in my available scheme data to answer that."
7. Keep the answer clear and concise.
8. If multiple schemes are relevant, mention them separately.
9. Never present assumptions as facts.
10. Do not mention any scheme, exam, organization, program, or acronym unless it appears in the provided CONTEXT.
11. Do not use your general knowledge to supplement the CONTEXT.
12. When the CONTEXT is insufficient, stop after explaining that the available scheme data does not contain the answer.

CONTEXT:

{context}

USER QUESTION:

{query}

ANSWER:
"""

        return prompt

    def generate_answer(self, prompt):
        """
        Send grounded prompt to Ollama.
        """

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        return data.get(
            "response",
            "I could not generate a response."
        )

    def ask(self, query, top_k=3):
        """
        Complete RAG pipeline.
        """

        results = self.retrieve(
            query,
            top_k=top_k
        )

        # Minimum relevance threshold
        relevant_results = [
            result
            for result in results
            if result["score"] >= 0.50
        ]

        prompt = self.build_prompt(
            query,
            relevant_results
        )

        answer = self.generate_answer(prompt)

        return {
            "question": query,
            "answer": answer,
            "sources": [
                {
                    "id": result["id"],
                    "name": result["name"],
                    "category": result["category"],
                    "score": round(result["score"], 4)
                }
                for result in relevant_results
            ]
        }