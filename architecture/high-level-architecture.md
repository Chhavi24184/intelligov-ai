# High-Level Architecture

IntelliGov AI is built across five layers: **Input, Processing/Gateway, Multi-Agent, Knowledge, and Decision**.

1. **Input Layer** — React + Tailwind frontend (Citizen Dashboard, Chat Interface, Opportunity Wallet, AI Life Roadmap, Agent Workflow Visualizer).
2. **Processing Layer (Gateway)** — FastAPI Gateway exposing `/api/v1/citizen`, `/api/v1/orchestrator`, and `/api/v1/agents`, with CORS, JWT-stub auth, and logging middleware.
3. **Multi-Agent Layer** — Master Orchestrator coordinating 7 fully working agents and 11 stub agents via a shared `BaseAgent` interface.
4. **Knowledge Layer** — ChromaDB vector store, NetworkX Knowledge Graph, and mock government datasets (schemes, scholarships, jobs, internships, skill programs).
5. **Decision Layer** — the aggregated `DecisionEngineOutput`, combining eligibility, recommendations, and explanations, returned to the frontend and visualized live.

All LLM/conversational access is routed through the **IBM watsonx.ai Mock Layer** (`backend/ibm_services/`), which mirrors the real `ibm-watsonx-ai` SDK interface so production migration requires no changes to agent logic.

For the full technical breakdown, see [`docs/architecture-overview.md`](../docs/architecture-overview.md). For the system diagram, see the [README](../README.md#-system-architecture-diagram).
