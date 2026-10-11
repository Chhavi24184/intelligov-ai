import requests

TEST_QUESTIONS = [
    "I am a student. Which scholarships can I get?",
    "I am a farmer. Which schemes are available?",
    "Which schemes are available for women?",
    "Which schemes are available in Haryana?",
    "I need skill training. Which scheme should I apply for?",
    "What documents are required for Ayushman Bharat?",
    "I want to start a small business. Which scheme can help me?",
    "Which government schemes help farmers?",
    "Which schemes provide housing assistance?",
    "I need financial assistance for education. What schemes are available?",
    "What documents do I need to apply for PM Kisan?",
    "Who is eligible for PM Kisan Samman Nidhi?",
    "Which schemes are available for unemployed people?",
    "I need healthcare assistance. Which scheme should I look at?",
    "Which schemes are available for senior citizens?",
    "Tell me about XYZ123 government scheme.",
    "Which government scheme guarantees a government job?",
    "Invent a government scheme for me.",
    "What should you do if you don't have information about a scheme?",
    "Can you tell me which scheme is best for my situation?"
]


def test_chat_api():
    url = "http://127.0.0.1:8000/chat"

    for number, question in enumerate(TEST_QUESTIONS, start=1):
        print("\n" + "=" * 70)
        print(f"TEST {number}")
        print("QUESTION:", question)

        response = requests.post(
            url,
            json={"question": question},
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        print("ANSWER:")
        print(result.get("answer"))

        print("SOURCES:")
        for source in result.get("sources", []):
            print(
                f"- {source.get('name')} "
                f"(score={source.get('score')})"
            )


if __name__ == "__main__":
    test_chat_api()