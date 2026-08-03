# GitHub Repository — Setup & Polish Recommendations

This document is a checklist for configuring the GitHub repository settings and visual polish once this codebase is pushed. It is not code — it's a setup guide for whoever owns the repository on GitHub.

## 📌 Repository Metadata

**Suggested Description:**
> Enterprise Multi-Agent Citizen Service Intelligence Platform — 18 AI agents, RAG + Knowledge Graph, IBM watsonx.ai (Granite) — built for the IBM SkillsBuild BOB Hackathon.

**Suggested Website:** Link to the deployed demo (if any) or the demo video.

**Suggested Topics:**
`ibm-watsonx` · `granite-llm` · `multi-agent-systems` · `fastapi` · `react` · `rag` · `knowledge-graph` · `chromadb` · `hackathon` · `ai-agents` · `explainable-ai` · `govtech`

## 🏷️ Release Tags

- Tag the hackathon submission commit as `v1.0.0`.
- Use [Semantic Versioning](https://semver.org/) for all future releases (`MAJOR.MINOR.PATCH`).
- Attach the demo video link and a summary in each GitHub Release description (see [`RELEASE_NOTES.md`](RELEASE_NOTES.md)).

## 🏷️ Suggested Issue Labels

| Label | Color | Use |
|---|---|---|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `agent` | `#0e8a16` | Related to a specific agent's logic |
| `docs` | `#0075ca` | Documentation improvements |
| `good first issue` | `#7057ff` | Good for newcomers |
| `star-innovation` | `#f59e0b` | Future Eligibility Prediction, Opportunity Loss Detector, Counterfactual AI |
| `ibm-integration` | `#052FAD` | Real IBM watsonx.ai / Cloud service integration work |
| `frontend` | `#e99695` | React / Tailwind UI work |
| `backend` | `#c2e0c6` | FastAPI / agent backend work |

## 🎯 Suggested Milestones

- `v1.0.0 — Hackathon Submission` (current)
- `v1.1.0 — Star Agent Activation`
- `v1.2.0 — Real watsonx.ai Integration`
- `v2.0.0 — Production IBM Cloud Deployment`

## 📋 Suggested GitHub Projects Board

Columns: `Backlog` → `In Progress` → `In Review` → `Done`, seeded from the 10 sub-tasks in the original build plan (Scaffolding, Data Models, IBM Mock Layer, Knowledge Layer, Orchestrator, 7 Working Agents, REST API, React Dashboard, Architecture Docs, Demo Polish).

## ⚙️ GitHub Actions Already Configured

- `python-ci.yml` — backend dependency install + pytest suite.
- `react-build.yml` — frontend install + production build.
- `lint.yml` — Python (ruff/black) and JS (ESLint) linting.
- `test.yml` — combined backend + frontend test execution with coverage.

## 🎨 Repository Polish Recommendations

- **Repository Banner:** A wide (1280×640) banner image using the IntelliGov AI palette (navy `#0a1628`, blue `#1a56db`, gold `#f59e0b`), placed at `docs/assets/banner.png` and referenced at the top of the README.
- **Screenshots:** Place under `docs/assets/screenshots/` — Dashboard, Chat Interface, Agent Pipeline Visualizer, AI Life Roadmap, Explainable AI graph view (see the README's Screenshots section for the expected filenames).
- **GIF Demos:** A short (10–15s) looping GIF of the Agent Workflow Visualizer animating is the single highest-impact visual for the README — place at `docs/assets/agent-pipeline-demo.gif`.
- **Architecture Images:** Export the Mermaid diagrams (in the README and `architecture/diagrams/`) as PNG/SVG for judges viewing on platforms that don't render Mermaid, and store under `docs/assets/diagrams/`.
- **Folder Icons:** Not natively supported by GitHub, but a consistent emoji-prefixed naming convention in documentation (as used throughout this README) improves scannability.
- **README Styling:** Keep badges at the top, a working Table of Contents, and consistent heading emoji usage (already applied) for visual scannability during judging.
