from rag.rag_pipeline import RAGPipeline


def main():

    print("Initializing IntelliGov RAG...")

    rag = RAGPipeline()

    questions = [
        "I am a farmer. Which schemes are available?",
        "What documents are required for Ayushman Bharat?",
        "I need housing assistance. Which scheme can help me?",
        "Tell me about XYZ123 government scheme."
    ]

    for question in questions:

        print("\n" + "=" * 70)
        print("QUESTION:", question)

        result = rag.ask(question)

        print("\nSOURCES:")

        for source in result["sources"]:
            print(
                f"- {source['name']} "
                f"(score={source['score']})"
            )

        print("\nANSWER:")
        print(result["answer"])


if __name__ == "__main__":
    main()