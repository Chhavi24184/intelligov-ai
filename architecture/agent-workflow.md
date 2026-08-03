# Agent Workflow

The complete specification for all 18 agents — Purpose, Inputs, Outputs, Prompt Strategy, Memory, Tools, Reasoning, Failure Cases, Guardrails, and Metrics for each — lives in [`docs/agent-workflow.md`](../docs/agent-workflow.md).

For the runtime execution sequence, see [`diagrams/agent-sequence.md`](diagrams/agent-sequence.md).

## Quick Reference — Execution Order

**Sequential (fully working agents):**
1. Intent Detection
2. Citizen Digital Twin
3. Opportunity Discovery
4. Eligibility Verification
5. Recommendation
6. Explainable AI

**Fired last (11 stub agents, order-independent):**
Document Verification · Policy Explanation · Career Opportunity · Future Eligibility Prediction ⭐ · Opportunity Loss Detector ⭐ · Counterfactual AI ⭐ · Debate & Consensus · Notification · Memory · Crawler · Knowledge Graph Update
