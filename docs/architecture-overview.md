# Architecture Overview

IntelliGov AI is organized into five logical layers. Each layer has a single responsibility and communicates with adjacent layers through well-defined interfaces, so that mock components (IBM services, data stores) can be swapped for production equivalents without touching business logic.

## 1. Input Layer — React + Tailwind Frontend

- **Citizen Dashboard** — eligibility score, top opportunities, notifications.
- **Chat Interface** — conversational entry point (backed by `MockWatsonxAssistant`).
- **Opportunity Wallet** — saved/tracked opportunities.
- **AI Life Roadmap** — timeline visualization of the citizen's opportunity journey.
- **Agent Workflow Visualizer** — real-time animated view of the 18-agent pipeline.

## 2. Gateway Layer — FastAPI

A single FastAPI application (`backend/main.py`) exposes three route groups:

- `/api/v1/citizen/*` — citizen profile CRUD and Digital Twin retrieval.
- `/api/v1/orchestrator/*` — the main orchestration entry point and status polling.
- `/api/v1/agents/*` — direct, individual agent invocation for testing/debugging.

CORS, authentication (JWT stub), and request logging are applied as middleware (`backend/api/middleware/`).

## 3. Multi-Agent Layer — Master Orchestrator

The `MasterOrchestrator` (`backend/core/orchestrator.py`) sequences the 7 fully working agents, then fires the 11 stub agents, aggregating everything into a single `DecisionEngineOutput`. All agents implement a common `BaseAgent` interface (`backend/core/agent_base.py`), registered centrally in `AgentRegistry` (`backend/core/agent_registry.py`).

**Sequential execution (working agents):**

1. Intent Detection
2. Citizen Digital Twin
3. Opportunity Discovery
4. Eligibility Verification
5. Recommendation
6. Explainable AI

**Fired last (stub agents, order-independent):** Document Verification, Policy Explanation, Career Opportunity, Future Eligibility Prediction, Opportunity Loss Detector, Counterfactual AI, Debate & Consensus, Notification, Memory, Crawler, Knowledge Graph Update.

## 4. Knowledge Layer

- **Vector Store** (`backend/knowledge/vector_store.py`) — ChromaDB local persistence, embeddings via `sentence-transformers/all-MiniLM-L6-v2`.
- **Knowledge Graph** (`backend/knowledge/knowledge_graph.py`) — NetworkX `DiGraph` linking Citizen → EligibilityCriteria → Scheme → Ministry → Benefit nodes.
- **RAG Pipeline** (`backend/knowledge/rag_pipeline.py`) — combines retrieval with `MockGraniteClient` generation.
- **Mock Government Data** — 5 JSON datasets (schemes, scholarships, jobs, internships, skill programs) loaded at startup by `data_loader.py`.

## 5. IBM watsonx.ai Mock Layer

All LLM and conversational AI access goes through `backend/ibm_services/`:

- `watsonx_client.py` — `MockGraniteClient`, interface-compatible with `ibm_watsonx_ai.foundation_models.Model`.
- `watsonx_assistant.py` — `MockWatsonxAssistant`, session-based conversational mock.
- `watsonx_orchestrate.py` — `MockWatsonxOrchestrate`, documents the agent-skill registration API.

**Architectural rule:** No agent may import an external SDK directly — every LLM/assistant call is routed through `ibm_services/`, so swapping mock → real IBM services requires changes in exactly one place.

## Design Principles

- **Separation of mock and logic.** Business logic in agents never depends on whether it's talking to a mock or a real IBM service.
- **Everything is explainable.** The Explainable AI agent can always produce a Knowledge Graph path justifying a recommendation — this is a structural guarantee, not a best-effort feature.
- **Stub agents are first-class citizens.** Even unimplemented agents return structured, documented responses so the orchestrator and frontend never have to special-case "not implemented."
