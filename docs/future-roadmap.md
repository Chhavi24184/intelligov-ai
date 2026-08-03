# Future Roadmap

## v1.0.0 — Hackathon Submission (Current)

- 7 fully working agents (Master Orchestrator, Intent Detection, Citizen Digital Twin, Eligibility Verification, Opportunity Discovery, Recommendation, Explainable AI).
- 11 documented, wired stub agents returning realistic mock responses.
- Local RAG pipeline (ChromaDB + sentence-transformers) and mock Knowledge Graph (NetworkX).
- Mock IBM watsonx.ai layer (`MockGraniteClient`, `MockWatsonxAssistant`, `MockWatsonxOrchestrate`) with drop-in real-SDK interface parity.
- Polished React + Tailwind dashboard with the Agent Workflow Visualizer, Opportunity Wallet, and AI Life Roadmap.
- Full architecture documentation, demo script, and slide deck outline.

## v1.1.0 — Star Innovation Activation (Planned)

- Activate **Future Eligibility Prediction** with real trajectory modeling against education/life-stage milestones.
- Activate **Opportunity Loss Detector** with real deadline-tracking logic against live mock data updates.
- Activate **Counterfactual AI** with Knowledge-Graph-driven "what-if" scenario generation.
- Expand test coverage for all three star agents.

## v1.2.0 — Real IBM watsonx.ai Integration (Credential-Gated)

- Swap `MockGraniteClient` for the real `ibm-watsonx-ai` SDK once credentials are available.
- Swap `MockWatsonxAssistant` for real watsonx Assistant sessions.
- Introduce watsonx Orchestrate for true multi-agent skill registration, replacing the current in-process orchestrator coordination where appropriate.
- Add AI Governance instrumentation (IBM OpenScale / AI Factsheets) using the confidence scores already emitted by every `AgentResponse`.

## v2.0.0 — Production IBM Cloud Deployment

- Migrate ChromaDB → watsonx.data / Milvus for production-scale vector search.
- Migrate NetworkX → a managed IBM Knowledge Graph service.
- Replace JWT stub → IBM App ID OAuth 2.0.
- Migrate in-memory stores → IBM Db2 / Cloudant.
- Migrate local file storage → IBM Cloud Object Storage.
- Front the API with IBM API Connect for rate limiting and analytics.
- Replace the in-memory notification queue with IBM Event Streams (Kafka) for real-time citizen alerts.
- Activate the remaining stub agents (Document Verification, Policy Explanation, Career Opportunity, Debate & Consensus, Notification, Memory, Crawler, Knowledge Graph Update) with production logic.

## Beyond v2.0.0 — Exploratory Ideas

- Real government API integrations (MyScheme, NCS, NSP, Skill India) replacing static mock JSON datasets.
- Multi-language conversational support beyond Hindi/English.
- Mobile app companion built on the same FastAPI backend.
- Citizen-facing notification delivery via SMS/push in low-connectivity regions.

> Roadmap items are directional and subject to change based on hackathon feedback, judge input, and future contributor priorities. See [`CONTRIBUTING.md`](../CONTRIBUTING.md) to propose or pick up roadmap items.
