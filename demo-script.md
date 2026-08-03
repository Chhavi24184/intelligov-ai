# Demo Script — IntelliGov AI (5 Minutes)

**Persona used throughout:** Priya Sharma — age 22, Maharashtra, income ₹85,000/year, 12th pass, OBC, Female, Student, documents held: Aadhaar, Income Certificate.

## 0:00 – 0:30 | Hook & Problem Statement

- Open on the problem: millions of eligible citizens miss government schemes, scholarships, and jobs simply because they don't know they qualify.
- One line: *"IntelliGov AI turns that fragmented search into one intelligent conversation."*

## 0:30 – 1:00 | Introduce the Platform

- Show the Citizen Dashboard landing page ("Namaste, Citizen 🙏").
- Briefly narrate the architecture: React frontend → FastAPI Gateway → Master Orchestrator → 18 specialized agents → Knowledge Layer (ChromaDB + Knowledge Graph) → IBM watsonx.ai Granite mock layer.

## 1:00 – 1:30 | The Query — The "Aha!" Moment

- As Priya, type into the Chat Interface: *"What scholarships and schemes am I eligible for?"*
- Trigger the **Agent Workflow Visualizer** — show all 18 agents lighting up in real time as they process the query.

## 1:30 – 2:30 | Walk Through the Working Agents

- **Intent Detection** classifies the query as `SCHOLARSHIP_SEARCH` + `SCHEME_DISCOVERY`.
- **Citizen Digital Twin** builds Priya's profile snapshot, inferring `life_stage = student`.
- **Opportunity Discovery** runs a RAG query across ChromaDB and surfaces relevant schemes/scholarships.
- **Eligibility Verification** scores each opportunity (e.g., 92/100 for a merit-cum-means scholarship).
- **Recommendation Agent** ranks the top 5 by eligibility, benefit value, and deadline urgency.

## 2:30 – 3:15 | Explainable AI — The Differentiator

- Open the **AgentExplainer** page.
- Show the Knowledge Graph path: Citizen → matched EligibilityCriteria → Scheme, rendered as a traversable graph.
- Narrate: *"This isn't a black box — every recommendation is backed by a transparent, auditable reasoning chain."*

## 3:15 – 4:00 | Star Innovations (Stub Agents, Documented Vision)

- Show the **Counterfactual AI** stub response: *"If Priya completes her 10th class equivalency, she qualifies for 3 more schemes."*
- Show the **Opportunity Loss Detector** stub: flags a scholarship deadline Priya nearly missed.
- Show the **Future Eligibility Prediction** stub: *"In 6 months, Priya may become eligible for [scheme] based on her education trajectory."*
- Note clearly: these are documented, wired, and return realistic mock responses — with a clear IBM production upgrade path.

## 4:00 – 4:30 | AI Life Roadmap

- Show the timeline visualization of Priya's opportunity journey — past applications, current eligibility, future predictions.

## 4:30 – 5:00 | Close — Tech Stack & Vision

- Quick recap: React + Tailwind, FastAPI, ChromaDB, NetworkX, IBM watsonx.ai Granite (mock, with drop-in real SDK path).
- Close on the IBM Technology Mapping table — reinforce that every mock component maps 1:1 to a real IBM Cloud service.
- End with the mission statement: *"IntelliGov AI — no citizen should miss a benefit they've earned."*
