from agents.orchestrator import OrchestratorAgent


orchestrator = OrchestratorAgent()


# ============================================================
# TEST 1: SCHEME
# ============================================================

print("\n--- TEST 1: SCHEME ---")

result = orchestrator.run(
    "Which government schemes are available for students?"
)

print(result)


# ============================================================
# TEST 2: ELIGIBILITY
# ============================================================

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


# ============================================================
# TEST 3: DOCUMENT
# ============================================================

print("\n--- TEST 3: DOCUMENT ---")

result = orchestrator.run(
    "What documents are required for scholarship?"
)

print(result)


# ============================================================
# TEST 4: CAREER
# ============================================================

print("\n--- TEST 4: CAREER ---")

result = orchestrator.run(
    "I am looking for government jobs and internships"
)

print(result)


# ============================================================
# TEST 5: POLICY
# ============================================================

print("\n--- TEST 5: POLICY ---")

result = orchestrator.run(
    "Explain the PM Kisan policy"
)

print(result)


# ============================================================
# TEST 6: NOTIFICATION
# ============================================================

print("\n--- TEST 6: NOTIFICATION ---")

result = orchestrator.run(
    "Remind me about scholarship application deadline",
    user_id=4
)

print(result)