from agents.orchestrator import OrchestratorAgent

orchestrator = OrchestratorAgent()

print("\n--- TEST 1: SCHEME ---")
result = orchestrator.run(
    "Which government schemes are available for students?"
)
print(result)


print("\n--- TEST 2: ELIGIBILITY ---")
result = orchestrator.run(
    "Am I eligible for any government scheme?",
    {
        "age": 21,
        "occupation": "Student",
        "income": 200000,
        "gender": "Female",
        "state": "Haryana"
    }
)
print(result)


print("\n--- TEST 3: DOCUMENT ---")
result = orchestrator.run(
    "What documents are required for scholarship?"
)
print(result)


print("\n--- TEST 4: CAREER ---")
result = orchestrator.run(
    "I am looking for government jobs and internships"
)
print(result)