# Agent Workflow — Full Specification

This document specifies all 18 agents using a consistent template: **Purpose, Inputs, Outputs, Prompt Strategy, Memory, Tools, Reasoning, Failure Cases, Guardrails, Metrics.**

---

## ✅ Fully Working Agents

### 1. Master Orchestrator

- **Purpose:** Coordinates all 18 agents for a citizen query and aggregates results into a `DecisionEngineOutput`.
- **Inputs:** `citizen_query` (str), `citizen_profile` (CitizenProfile)
- **Outputs:** `DecisionEngineOutput` (aggregated scores + agent statuses)
- **Prompt Strategy:** N/A (coordination logic, not LLM-driven itself)
- **Memory:** Session-scoped, in-memory status dictionary keyed by `session_id`
- **Tools:** `AgentRegistry`, all 18 registered agents
- **Reasoning:** Sequential execution for the 6 core working agents, followed by stub agent execution
- **Failure Cases:** Individual agent failure is caught and marked `FAILED` in status without halting the pipeline
- **Guardrails:** Timeout per agent; partial results are still returned if a downstream agent fails
- **Metrics:** Total pipeline latency, per-agent latency, success/failure rate

### 2. Intent Detection Agent

- **Purpose:** Classifies citizen queries into intent categories and extracts entities.
- **Inputs:** Raw citizen query text
- **Outputs:** `IntentResult` (intent_type, confidence, extracted_entities, language_detected)
- **Prompt Strategy:** Granite prompt classifying into `SCHEME_DISCOVERY`, `SCHOLARSHIP_SEARCH`, `JOB_SEARCH`, `ELIGIBILITY_CHECK`, `DOCUMENT_HELP`, `CAREER_GUIDANCE`, `GENERAL_QUERY`
- **Memory:** Stateless per query
- **Tools:** `MockGraniteClient.generate_structured()`, keyword-matching fallback
- **Reasoning:** Keyword matching combined with LLM classification for ambiguous queries
- **Failure Cases:** Falls back to `GENERAL_QUERY` if classification confidence is low
- **Guardrails:** Confidence threshold below which the orchestrator requests clarification
- **Metrics:** Classification accuracy, confidence distribution

### 3. Citizen Digital Twin Agent

- **Purpose:** Builds/updates a persistent AI persona per citizen.
- **Inputs:** `CitizenProfile`
- **Outputs:** `CitizenDigitalTwin` (profile snapshot, eligibility_cache, opportunity_history, preference_vector, life_stage)
- **Prompt Strategy:** Granite prompt inferring missing profile attributes from partial data
- **Memory:** In-memory twin store, keyed by `citizen_id`
- **Tools:** `MockGraniteClient.generate_structured()`
- **Reasoning:** Rule-based life-stage inference (student/job-seeker/farmer/etc.), supplemented by LLM inference for missing fields
- **Failure Cases:** Falls back to `UNKNOWN` life_stage if insufficient data
- **Guardrails:** Never overwrites explicitly-provided citizen fields with inferred values
- **Metrics:** Twin completeness score, inference confidence

### 4. Eligibility Verification Agent

- **Purpose:** Computes eligibility scores against opportunity criteria.
- **Inputs:** `CitizenProfile`, list of candidate `Opportunity` objects
- **Outputs:** `EligibilityResult` (scheme_id, eligible, score 0–100, missing_criteria, matched_criteria)
- **Prompt Strategy:** Granite prompt explaining eligibility/ineligibility in plain citizen-facing language
- **Memory:** Stateless per request; results cached in the Digital Twin's `eligibility_cache`
- **Tools:** Direct field comparison against machine-readable criteria (min/max age, max income, required caste/gender/state, min education)
- **Reasoning:** `score = (matched_criteria / total_criteria) * 100`
- **Failure Cases:** Missing citizen fields are treated as unmatched criteria, lowering the score conservatively
- **Guardrails:** Never claims eligibility without explicit criteria match
- **Metrics:** Average eligibility score, false-positive rate against known test personas

### 5. Opportunity Discovery Agent

- **Purpose:** Retrieves relevant opportunities via RAG.
- **Inputs:** Detected intent category, citizen query, citizen profile
- **Outputs:** Top-10 ranked `Opportunity` candidates
- **Prompt Strategy:** Granite query-expansion prompt (e.g., "scholarship" → "financial aid, stipend, fellowship")
- **Memory:** Stateless per query
- **Tools:** `RAGPipeline.retrieve_and_generate()`, ChromaDB `similarity_search()`
- **Reasoning:** Semantic similarity search filtered by intent category
- **Failure Cases:** Returns an empty set with a "no matches" flag rather than irrelevant results
- **Guardrails:** Category filter prevents cross-domain noise (e.g., jobs appearing in a scholarship search)
- **Metrics:** Retrieval precision@10, category-filter accuracy

### 6. Recommendation Agent

- **Purpose:** Ranks and scores discovered, eligible opportunities.
- **Inputs:** Eligible opportunities with `EligibilityResult` scores
- **Outputs:** Top-5 `RecommendationScore` with personalized narrative
- **Prompt Strategy:** Granite prompt generating a personalized recommendation narrative
- **Memory:** Stateless per request
- **Tools:** `MockGraniteClient.generate()`
- **Reasoning:** `score = eligibility_score × benefit_value × deadline_urgency × citizen_preference`
- **Failure Cases:** Falls back to eligibility-score-only ranking if benefit/deadline data is missing
- **Guardrails:** Never recommends an opportunity below the eligibility threshold
- **Metrics:** Click-through rate on recommendations (future), ranking stability

### 7. Explainable AI Agent

- **Purpose:** Generates transparent, Knowledge-Graph-backed explanations for recommendations.
- **Inputs:** Top recommendations, citizen profile
- **Outputs:** Step-by-step explanation with confidence score breakdown
- **Prompt Strategy:** Granite prompt: *"Explain in simple Hindi/English why [citizen] is eligible for [scheme] based on [criteria]"*
- **Memory:** Stateless per request
- **Tools:** `IntelliGovKnowledgeGraph.get_scheme_explanation()`
- **Reasoning:** Graph traversal: Citizen → matched EligibilityCriteria → Scheme, rendered as a reasoning chain
- **Failure Cases:** Falls back to a criteria-list explanation if no graph path exists
- **Guardrails:** Explanations must cite only criteria actually matched — no fabricated justification
- **Metrics:** Explanation completeness, citizen-reported clarity (future user testing)

---

## 🧪 Stub Agents

All stub agents share the following structure: `StubAgent` subclass, realistic mock response, full docstring documenting Purpose, Inputs, Outputs, IBM Service Used, and Production Implementation Notes.

### 8. Document Verification Agent
- **Purpose:** Validates uploaded citizen documents (Aadhaar, income certificate, etc.) against scheme requirements.
- **IBM Service (Production):** watsonx.ai vision/document models + IBM Cloud Object Storage.
- **Production Notes:** Would perform OCR + field validation; currently returns a mock "verified" status.

### 9. Policy Explanation Agent
- **Purpose:** Translates dense policy/scheme legal text into plain citizen-facing language.
- **IBM Service (Production):** watsonx.ai Granite summarization.
- **Production Notes:** Currently returns a canned plain-language summary keyed by scheme category.

### 10. Career Opportunity Agent
- **Purpose:** Surfaces career-path-specific opportunities aligned to a citizen's skills/education.
- **IBM Service (Production):** watsonx.ai + NCS API integration.
- **Production Notes:** Currently returns mock career-path suggestions from static job/skill data.

### 11. Future Eligibility Prediction Agent ⭐
- **Purpose:** Predicts which schemes a citizen will qualify for in 6–12 months based on trajectory (e.g., completing an education milestone).
- **IBM Service (Production):** watsonx.ai time-aware inference.
- **Production Notes:** Star innovation — currently returns a mock prediction ("in 6 months, if X changes, you may qualify for Y").

### 12. Opportunity Loss Detector Agent ⭐
- **Purpose:** Flags schemes a citizen missed or deadlines that have passed.
- **IBM Service (Production):** watsonx Orchestrate scheduled checks + Event Streams.
- **Production Notes:** Star innovation — currently compares mock deadline data against the current date and returns flagged entries.

### 13. Counterfactual AI Agent ⭐
- **Purpose:** Models "what-if" eligibility scenarios (e.g., *"If you complete 10th class, you qualify for 3 more schemes"*).
- **IBM Service (Production):** watsonx.ai + Knowledge Graph counterfactual traversal.
- **Production Notes:** Star innovation — currently returns a mock counterfactual statement derived from static criteria gaps.

### 14. Debate & Consensus Agent
- **Purpose:** Runs multiple agent "perspectives" that debate the best recommendation, converging on consensus.
- **IBM Service (Production):** watsonx Orchestrate multi-agent skill routing.
- **Production Notes:** Currently returns a mock consensus statement with simulated "votes."

### 15. Notification Agent
- **Purpose:** Manages citizen alerts and reminders (deadlines, new matching schemes).
- **IBM Service (Production):** IBM Event Streams + push/SMS gateway.
- **Production Notes:** Currently logs a mock notification payload without external delivery.

### 16. Memory Agent
- **Purpose:** Maintains long-term memory across citizen sessions beyond the Digital Twin cache.
- **IBM Service (Production):** watsonx.data / Db2 persistent store.
- **Production Notes:** Currently returns a mock "memory recalled" response from in-memory state.

### 17. Crawler Agent
- **Purpose:** Simulates ingestion of new government data sources into the Knowledge Layer.
- **IBM Service (Production):** IBM Cloud scheduled functions + watsonx.data ingestion.
- **Production Notes:** Currently returns a mock "N new schemes discovered" response without live crawling.

### 18. Knowledge Graph Update Agent
- **Purpose:** Simulates incremental updates to the Knowledge Graph as new data arrives.
- **IBM Service (Production):** IBM Knowledge Catalog + graph database service.
- **Production Notes:** Currently returns a mock diff summary of graph nodes/edges that would be added.

---

## Agent Sequence Diagram

See [`architecture/diagrams/agent-sequence.md`](../architecture/diagrams/agent-sequence.md) for the full Mermaid sequence diagram of the orchestration flow.
