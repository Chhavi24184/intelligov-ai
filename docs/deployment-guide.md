# Deployment Guide

This guide covers running IntelliGov AI locally (current build) and the upgrade path to a real IBM Cloud deployment (future scope).

## Local Deployment

### Option A — Manual (Two Processes)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Option B — Docker Compose

```bash
docker-compose up --build
```

This brings up:
- `backend` service — FastAPI app on port `8000`, with a persistent volume for the ChromaDB store.
- `frontend` service — Vite dev/preview server on port `5173`.

See [`docker-compose.yml`](../docker-compose.yml), [`backend/Dockerfile`](../backend/Dockerfile), and [`frontend/Dockerfile`](../frontend/Dockerfile).

### Seeding the Demo Persona

Run the seed script to pre-populate the "Priya Sharma" citizen persona and pre-warm orchestrator caches so the demo starts in under 60 seconds:

```bash
python backend/seed_data.py
```

---

## Production Upgrade Path

Every mock component is built to the exact interface its real IBM counterpart exposes. Moving to production is a matter of swapping implementations, not rewriting business logic.

| Mock Layer (Current) | Real IBM Service (Target) |
|---|---|
| `MockGraniteClient` | `ibm-watsonx-ai` SDK `Model()` class |
| ChromaDB (local) | IBM watsonx.data + Milvus |
| NetworkX (in-memory) | IBM Knowledge Graph (managed graph DB on IBM Cloud) |
| JWT stub | IBM App ID OAuth 2.0 |
| In-memory citizen/session store | IBM Db2 / Cloudant |
| Local file system (data JSON) | IBM Cloud Object Storage |
| FastAPI direct routing | IBM API Connect Gateway |
| In-memory event queue | IBM Event Streams (Kafka) |

### Step-by-Step Production Migration

1. **Obtain IBM Cloud credentials** — watsonx.ai project ID and API key, IBM App ID tenant, IBM Cloud Object Storage instance.
2. **Swap the LLM client** — replace `MockGraniteClient` in `backend/ibm_services/watsonx_client.py` with:
   ```python
   from ibm_watsonx_ai.foundation_models import Model
   model = Model(model_id, credentials, project_id)
   response = model.generate_text(prompt, params)
   ```
3. **Migrate the vector store** — point `vector_store.py` at watsonx.data/Milvus instead of local ChromaDB persistence.
4. **Migrate the Knowledge Graph** — export the NetworkX graph schema (Citizen, Scheme, Ministry, EligibilityCriteria, Benefit nodes; `ELIGIBLE_FOR`, `PROVIDES`, `REQUIRES`, `OFFERED_BY` edges) to a managed graph database.
5. **Replace authentication** — swap the JWT stub middleware for IBM App ID OAuth 2.0 token validation.
6. **Migrate persistence** — move citizen profiles, Digital Twins, and session state from in-memory stores to Db2/Cloudant.
7. **Migrate object storage** — move static JSON government datasets to IBM Cloud Object Storage, with the Crawler Agent (currently a stub) performing real ingestion.
8. **Introduce event streaming** — replace the in-memory notification queue with IBM Event Streams for real-time citizen alerts.
9. **Front the API with IBM API Connect** — apply rate limiting, API key management, and analytics at the gateway layer.
10. **Enable AI Governance** — wire confidence scores already present in every `AgentResponse` into IBM OpenScale / AI Factsheets for auditability.

### Environment Configuration for Production

All required environment variables are documented in [`.env.example`](../.env.example). Production deployments should manage these via a secrets manager (e.g., IBM Cloud Secrets Manager) rather than plain `.env` files.

### Health & Observability

- `/health` should be extended to check real IBM service connectivity (not just mock status) once credentials are live.
- Structured JSON logging (`LOG_FORMAT=json`) is already in place and should be piped to a centralized logging service (e.g., IBM Log Analysis) in production.
