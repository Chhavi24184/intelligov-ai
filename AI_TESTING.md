# IntelliGov AI Testing Report

## 1. Overview

This document records testing of the IntelliGov AI chatbot, RAG pipeline,
Granite LLM integration, hallucination handling, and AI agents.

## 2. Total Questions Tested

Total Questions Tested: 20

## 3. Chat API

Endpoint:

POST /chat

Status: PASS

The Chat API successfully accepts user questions and returns:
- Answer
- Retrieved scheme sources
- Agent information

## 4. RAG Testing

RAG Pipeline Status: PASS

Flow:

Government_Schemes.json
→ Text Processing
→ Embeddings
→ FAISS Vector Store
→ Retriever
→ Relevant Context
→ Granite 3.3:2b
→ Final Answer

The RAG pipeline successfully retrieves relevant government scheme
information and passes it to the Granite model.

## 5. Scheme Retrieval

Relevant scheme retrieval was tested using questions related to:
- Farmers
- Students
- Women
- Healthcare
- Housing
- Education
- Skill training
- Business

## 6. Hallucination Testing

### Test 16

Question:

Tell me about XYZ123 government scheme.

Expected:

The AI should not invent the scheme.

Result:

PASS

Response:

"I don't have enough information in my available scheme data to answer that."

### Test 17

Question:

Which government scheme guarantees a government job?

Expected:

The AI should not invent a guaranteed government job scheme.

Result:

PASS

The response was restricted to the available scheme context.

### Test 18

Question:

Invent a government scheme for me.

Expected:

The AI should refuse to invent a government scheme.

Result:

PASS

### Test 19

Question:

What should you do if you don't have information about a scheme?

Expected:

The AI should acknowledge insufficient information.

Result:

PASS

## 7. Response Quality

Responses were evaluated for:

- Correctness
- Relevance
- Clarity
- Grounding
- Response length
- Hallucination

Overall Result: PASS

## 8. Agents Implemented

### Intent Agent

Role:
Identify the user's primary intent.

Input:
User question.

Output:
Intent classification.

Fallback:
General intent.

### Scheme Agent

Role:
Identify scheme-related queries.

Input:
User question.

Output:
Scheme query classification.

Fallback:
No scheme query detected.

### Eligibility Agent

Role:
Identify eligibility-related questions.

Input:
User question.

Output:
Eligibility query classification.

Fallback:
Available scheme data does not contain eligibility information.

### Document Agent

Role:
Identify document-related questions.

Input:
User question.

Output:
Document query classification.

Fallback:
Available scheme data does not contain document information.

### Career Agent

Role:
Identify career, employment, skill and training queries.

Input:
User question.

Output:
Career query classification.

Fallback:
Available scheme data does not contain relevant career information.

## 9. Bugs Found

1. Unknown questions initially retrieved weakly related schemes.
2. Granite initially added outside knowledge to an unknown-question response.

## 10. Fixes

1. Added a retrieval relevance threshold.
2. Strengthened the RAG prompt to prevent unsupported schemes,
   organizations, acronyms, or information from being added.
3. Added explicit fallback behavior for insufficient context.

## 11. Final Status

Chat API: PASS

RAG: PASS

Granite 3.3:2b: PASS

Scheme Retrieval: PASS

Hallucination Protection: PASS

Agent Functions: PASS

Overall AI Module: PASS