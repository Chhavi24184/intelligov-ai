# Agent Sequence Diagram

Full orchestration sequence for a single citizen query, from frontend request to aggregated response.

```mermaid
sequenceDiagram
    autonumber
    participant FE as Frontend
    participant GW as FastAPI Gateway
    participant MO as Master Orchestrator
    participant ID as Intent Detection
    participant DT as Citizen Digital Twin
    participant OD as Opportunity Discovery
    participant EV as Eligibility Verification
    participant RC as Recommendation
    participant XAI as Explainable AI
    participant STUB as 11 Stub Agents

    FE->>GW: POST /orchestrator/query
    GW->>MO: orchestrate(query, profile)
    MO->>ID: run(request)
    ID-->>MO: IntentResult
    MO->>DT: run(request)
    DT-->>MO: CitizenDigitalTwin
    MO->>OD: run(request)
    OD-->>MO: Candidate Opportunities
    MO->>EV: run(request)
    EV-->>MO: EligibilityResult[]
    MO->>RC: run(request)
    RC-->>MO: RecommendationScore[]
    MO->>XAI: run(request)
    XAI-->>MO: Explanation[]
    MO->>STUB: run(request) [parallel]
    STUB-->>MO: Stub AgentResponse[]
    MO-->>GW: DecisionEngineOutput
    GW-->>FE: JSON response
    loop Every 1s while running
        FE->>GW: GET /orchestrator/status/{session_id}
        GW-->>FE: Agent status snapshot
    end
```

See [`docs/agent-workflow.md`](../../docs/agent-workflow.md) for the full per-agent specification and [`docs/data-flow.md`](../../docs/data-flow.md) for the narrative walkthrough.
