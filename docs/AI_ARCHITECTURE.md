# IntelliGov AI — AI / RAG Architecture

## 1. Overview

IntelliGov AI uses an AI-assisted architecture to provide government
scheme discovery, eligibility assistance, document guidance, and
citizen support.

The backend combines:

- Multi-Agent Architecture
- Government Scheme Knowledge Base
- Retrieval-Based Context
- Granite Service
- Grounded Response Generation

The system is designed to provide responses based on the available
government scheme data instead of generating unsupported scheme
information.

---

## 2. What is IBM Granite?

IBM Granite is a family of foundation models developed by IBM for
enterprise-focused generative AI applications.

Granite models can be used for:

- Natural language understanding
- Text generation
- Question answering
- Summarization
- Classification
- Enterprise AI applications

In IntelliGov AI, Granite represents the language-model layer responsible
for generating natural-language responses from retrieved government
scheme information.

---

## 3. Why Granite?

Granite is considered for IntelliGov AI because the project is focused on
an enterprise-oriented government citizen-service application.

The main reasons for using Granite include:

- Enterprise AI focus
- Natural-language interaction
- Compatibility with IBM's AI ecosystem
- Potential integration with IBM watsonx
- Ability to generate responses using retrieved context

The current implementation uses a Mock Granite client to simulate the
Granite response-generation layer.

---

## 4. Where Granite is Used

The Granite service is located at:

```text
backend/services/granite_service.py