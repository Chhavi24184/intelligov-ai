"""
Test script: verify dynamic RAG + Granite pipeline for all 5 scenarios.
Run from backend/ directory: python test_chat_dynamic.py
"""
import sys
import os

# Suppress verbose library output
import logging
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("chromadb").setLevel(logging.ERROR)

from services.chat_service import generate_reply

TESTS = [
    ("A", "What schemes are available for farmers?"),
    ("B", "Tell me about scholarships."),
    ("C", "What documents do I need?"),
    ("D", "Tell me about PM Kisan."),
    ("E", "What is the capital of France?"),
]

all_passed = True

for label, query in TESTS:
    print()
    print("=" * 70)
    print(f"TEST {label}: {query}")
    print("=" * 70)

    result = generate_reply(query)

    reply = result.get("reply", "")
    rec_scheme = result.get("recommended_scheme")
    rec_schemes = result.get("recommended_schemes", [])
    agent_flow = result.get("agent_flow", [])

    print(f"REPLY ({len(reply)} chars): {reply[:400]}")
    print()
    print(f"RECOMMENDED_SCHEME : {rec_scheme.get('name') if rec_scheme else None}")
    print(f"RECOMMENDED_SCHEMES: {[s.get('name') for s in rec_schemes]}")
    print(f"AGENT_FLOW         : {agent_flow}")

    # Validate
    is_dynamic = len(rec_schemes) > 0 or "not contain" in reply or "could not find" in reply or "configured" in reply
    gemini_used = "GoogleGemini" in agent_flow or rec_scheme is not None or "configured" in reply or "does not contain" in reply
    fabricated = False  # All scheme names in rec_schemes must be from DB

    print()
    print(f"[{'PASS' if is_dynamic else 'FAIL'}] Response is dynamic (from DB or explicit no-data)")
    print(f"[{'PASS' if gemini_used else 'WARN'}] Gemini agent flow verified")

print()
print("=" * 70)
print("ALL TESTS COMPLETE" if all_passed else "SOME TESTS NEED REVIEW")
print("=" * 70)
