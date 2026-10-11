# AI / RAG Testing Documentation

## 1. Overview

This document contains testing details for the AI, RAG, Granite, agent, and hallucination-handling components of the IntelliGov AI system.

The objective of testing was to verify that the AI system:

- Understands citizen queries correctly.
- Selects the appropriate agent.
- Retrieves relevant government scheme information.
- Generates responses grounded in available data.
- Handles unknown queries safely.
- Avoids generating fake government scheme information.
- Provides fallback responses when relevant information is unavailable.

---

## 2. AI / Agent Architecture Tested

The following flow was tested:

User Query
↓
Chat API
↓
Orchestrator
↓
Intent Agent
↓
Relevant Specialized Agent
↓
Scheme / Eligibility Data
↓
RAG / Knowledge Retrieval
↓
Granite
↓
Final Response

---

## 3. Intent Agent Testing

### Purpose

The Intent Agent identifies the user's intention and determines which specialized agent should process the query.

### Test Cases

| Query Type | Expected Intent | Status |
|---|---|---|
| Government schemes for farmers | Scheme | PASS |
| Am I eligible for PM Kisan? | Eligibility | PASS |
| Which documents are required? | Document | PASS |
| Find government jobs | Career | PASS |
| Scholarship schemes | Scheme | PASS |
| Unknown query | Fallback | PASS |

### Result

The Intent Agent successfully classified supported query types and provided fallback behavior for unsupported or unclear queries.

---

## 4. Scheme Agent Testing

### Purpose

The Scheme Agent retrieves relevant government schemes based on the citizen's query.

### Test Cases

| Query | Expected Result | Status |
|---|---|---|
| Farmer schemes | Farmer-related schemes | PASS |
| Student schemes | Student-related schemes | PASS |
| Women schemes | Women-related schemes | PASS |
| Health schemes | Health-related schemes | PASS |
| PM Kisan | PM Kisan information | PASS |
| Scholarship | Education/scholarship schemes | PASS |
| xyz123 | No relevant scheme | PASS |

### Result

The Scheme Agent returned relevant scheme information for supported queries and safely handled unknown keywords.

---

## 5. Eligibility Agent Testing

### Purpose

The Eligibility Agent evaluates citizen information and identifies potentially eligible schemes.

### Test Profiles

Multiple profiles were tested using:

- Different age groups
- Students
- Farmers
- Job seekers
- Male users
- Female users
- Low-income users
- High-income users
- Haryana residents
- Punjab residents
- Other states

### Result

The Eligibility Agent successfully processed different citizen profiles and returned relevant recommendations where matching data was available.

---

## 6. Document Agent Testing

### Purpose

The Document Agent identifies documents required for government schemes.

### Test Cases

| Query | Expected Result | Status |
|---|---|---|
| Documents required for scheme | Document information | PASS |
| What documents are needed? | Document information | PASS |
| Required documents for application | Document information | PASS |
| Unknown scheme documents | Safe fallback | PASS |

### Result

The Document Agent successfully handled document-related queries and provided available information.

---

## 7. Career Agent Testing

### Purpose

The Career Agent handles career and employment-related citizen queries.

### Test Cases

| Query | Expected Result | Status |
|---|---|---|
| Government jobs | Career information | PASS |
| Government employment opportunities | Career information | PASS |
| Job-related query | Career response | PASS |
| Unknown career query | Safe fallback | PASS |

### Result

The Career Agent successfully processed career-related queries.

---

## 8. Orchestrator Testing

### Purpose

The Orchestrator coordinates the different agents and routes each query to the appropriate agent.

### Test Flow

```text
User Query
    ↓
Intent Detection
    ↓
Agent Selection
    ↓
Specialized Agent
    ↓
Data / RAG
    ↓
Granite
    ↓
Final Response
Test Cases
Query	Expected Agent	Status
Farmer schemes	Scheme Agent	PASS
Eligibility query	Eligibility Agent	PASS
Required documents	Document Agent	PASS
Government jobs	Career Agent	PASS
Unknown query	Fallback	PASS
Result

The Orchestrator successfully routed supported queries to the appropriate specialized agents.

9. RAG Testing
Objective

RAG testing was performed to verify that AI-generated responses are based on available government scheme data rather than unsupported information.

Relevant Query Testing

Examples:

Which government schemes are available for farmers?
Tell me about PM Kisan.
What scholarship schemes are available for students?
What health schemes are available?
What schemes are available for women?
Which schemes provide financial assistance?
What schemes are available for small businesses?
What education schemes are available?
Which schemes are available for skill development?
Which schemes are available for loans?
Expected Behavior

The system should retrieve relevant scheme information and generate a response based on the available data.

Result

Relevant queries returned relevant scheme information.

Status: PASS

10. Granite Testing
Objective

Granite was tested as the language generation component of the AI pipeline.

Test Cases
Test Case	Expected Behavior	Status
Relevant scheme query	Grounded response	PASS
Eligibility query	Relevant explanation	PASS
Document query	Relevant response	PASS
Unknown query	Safe fallback	PASS
Database-supported query	Data-based response	PASS
Result

Granite generated responses using the information supplied by the backend retrieval/agent pipeline.

Status: PASS

11. Unknown Query Testing

Unknown queries were used to verify that the system does not invent unsupported information.

Example Queries
Tell me about XYZ123 government scheme.
Tell me something not present in the database.
What is the XYZ999 government benefit?
Expected Behavior

The system should indicate that relevant information is unavailable instead of presenting unsupported facts as real government information.

Result

Unknown queries were handled using fallback behavior.

Status: PASS

12. Hallucination Testing

Hallucination testing was performed to check whether the AI generates fake government schemes or unsupported guarantees.

Test Queries
Tell me about XYZ123 government scheme.
Which government scheme guarantees a job?
Invent a scholarship scheme for me.
Tell me something not present in the database.
Give me a fake government scheme.
Is there a scheme that guarantees ₹1 lakh to every student?
Expected Behavior

The system should not present invented schemes, guarantees, benefits, or unsupported government policies as factual information.

Result

The system used fallback behavior for unsupported information.

Status: PASS

13. Negative Testing

Negative scenarios were tested to evaluate system robustness.

Scenarios
Scenario	Expected Behavior	Status
Unknown scheme	Safe fallback	PASS
Empty query	Validation/fallback	PASS
Unsupported request	Safe response	PASS
Fake scheme	Reject/fallback	PASS
Missing information	Request/handle missing data	PASS
No matching scheme	No-result response	PASS
14. AI Test Summary
Component	Testing Status
Intent Agent	PASS
Scheme Agent	PASS
Eligibility Agent	PASS
Document Agent	PASS
Career Agent	PASS
Orchestrator	PASS
RAG Retrieval	PASS
Granite Generation	PASS
Unknown Query Handling	PASS
Hallucination Testing	PASS
Negative Testing	PASS
15. Final Conclusion

The AI and RAG components of IntelliGov AI were tested using relevant, irrelevant, unknown, and negative queries.

The testing verified:

Intent detection
Agent routing
Scheme retrieval
Eligibility processing
Document handling
Career queries
RAG-based information retrieval
Granite response generation
Unknown query handling
Hallucination prevention
Fallback behavior

Overall, the tested AI pipeline performed according to the expected system behavior.