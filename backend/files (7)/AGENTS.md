# IntelliGov AI — Multi-Agent Architecture

## 1. Overview

IntelliGov AI uses a multi-agent architecture to process citizen queries
and route them to specialized agents.

The system contains the following agents:

1. Orchestrator Agent
2. Intent Detection Agent
3. Scheme Recommendation Agent
4. Eligibility Agent
5. Document Assistance Agent
6. Career Agent

The Orchestrator acts as the master routing agent. It first identifies the
user's intent and then routes the request to the appropriate specialized
agent.

---

# 2. Agent Architecture

The overall agent flow is:

```text
                         User Query
                              |
                              v
                    +-------------------+
                    | OrchestratorAgent |
                    +---------+---------+
                              |
                              v
                   +----------------------+
                   | IntentDetectionAgent |
                   +----------+-----------+
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
       Scheme Intent    Eligibility Intent  Document Intent
              |               |               |
              v               v               v
       Scheme Agent    Eligibility Agent   Document Agent
              |               |               |
              +---------------+---------------+
                              |
                              v
                       Data / Services
                              |
                              v
                      Granite Service
                              |
                              v
                       Final Response