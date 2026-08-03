# Development Guide

This guide is for contributors setting up a local development environment for IntelliGov AI.

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git
- (Optional) Docker & Docker Compose

## Repository Setup

```bash
git clone https://github.com/<org>/intelligov-ai.git
cd intelligov-ai
```

## Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

- API docs: `http://localhost:8000/docs`
- Run tests: `pytest tests/`
- Lint: follow PEP 8; a linting CI workflow runs on every PR (see [`.github/workflows/lint.yml`](../.github/workflows/lint.yml)).

### Adding a New Agent

1. Create a new folder under `backend/agents/<agent_name>/` with `agent.py`, `prompts.py`, and `models.py`.
2. Subclass `BaseAgent` from `backend/core/agent_base.py` and implement `run(request: AgentRequest) -> AgentResponse`.
3. Register the agent in `backend/core/agent_registry.py`.
4. If the agent needs LLM access, call it **only** through `backend/ibm_services/` — never import an external SDK directly in agent code.
5. Add the agent to the orchestrator pipeline in `backend/core/orchestrator.py` (sequential for core agents, fire-and-aggregate for stubs).
6. Write a unit test under `backend/tests/`.
7. Document the agent in [`docs/agent-workflow.md`](agent-workflow.md) using the standard template.

### Working with the Knowledge Layer

- Mock government data lives in `backend/knowledge/data/*.json`. Follow the existing schema (see `models/opportunity.py`) when adding entries.
- After changing mock data, restart the backend so `data_loader.py` re-ingests it into ChromaDB.
- The Knowledge Graph schema (nodes/edges) is defined in `backend/knowledge/knowledge_graph.py` — keep node/edge naming consistent across the codebase.

## Frontend Development

```bash
cd frontend
npm install
npm run dev
```

- Dev server: `http://localhost:5173`
- Build for production: `npm run build`

### Component Conventions

- `components/layout/` — Navbar, Sidebar, Footer.
- `components/dashboard/` — CitizenDashboard, OpportunityWallet, AILifeRoadmap, EligibilityScore, NotificationPanel.
- `components/chat/` — ChatInterface, MessageBubble, AgentStatusPanel.
- `components/agents/` — AgentWorkflowVisualizer.
- `components/shared/` — ScoreCard, OpportunityCard, LoadingSpinner.

Follow the existing Tailwind color palette: `intelligov-navy: #0a1628`, `intelligov-blue: #1a56db`, `intelligov-gold: #f59e0b` (configured in `tailwind.config.js`).

## Running the Full Stack Together

```bash
docker-compose up --build
```

Or manually in two terminals (backend on 8000, frontend on 5173) as described above.

## Testing Strategy

| Layer | Tool | Location |
|---|---|---|
| Backend unit/integration | Pytest + httpx | `backend/tests/` |
| Orchestrator end-to-end | Pytest, using the "Priya Sharma" persona | `backend/tests/test_orchestrator.py` |
| RAG pipeline | Pytest | `backend/tests/test_rag_pipeline.py` |
| IBM mock interface parity | Pytest | `backend/tests/test_watsonx_mock.py` |

Run the full backend suite before opening a PR:

```bash
cd backend
pytest tests/ -v
```

## Continuous Integration

Every pull request triggers:

- **Python CI** — dependency install + backend test suite ([`python-ci.yml`](../.github/workflows/python-ci.yml))
- **React Build** — frontend install + production build ([`react-build.yml`](../.github/workflows/react-build.yml))
- **Lint** — Python and JS linting ([`lint.yml`](../.github/workflows/lint.yml))
- **Test** — combined backend/frontend test execution ([`test.yml`](../.github/workflows/test.yml))

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for branch naming, commit conventions, and the PR process.
