# Contributing to IntelliGov AI

Thank you for your interest in contributing to **IntelliGov AI**! This document outlines the workflow, standards, and process for contributing to the project.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📋 Table of Contents

- [Contribution Workflow](#contribution-workflow)
- [Branch Naming](#branch-naming)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Issue Reporting](#issue-reporting)
- [Code of Conduct](#code-of-conduct)

---

## 🔄 Contribution Workflow

1. **Fork** the repository and clone your fork locally.
2. Create a new branch from `main` following the [branch naming](#branch-naming) convention.
3. Make your changes, following the [coding standards](#coding-standards) below.
4. Add or update tests for any new functionality (`backend/tests/`).
5. Run the full test suite locally before pushing:
   ```bash
   cd backend
   pytest tests/
   ```
6. Commit your changes using the [commit message guidelines](#commit-message-guidelines).
7. Push your branch to your fork and open a Pull Request against `main`.
8. Respond to review feedback and update your PR as needed.

---

## 🌿 Branch Naming

Use the following prefixes for branch names:

| Prefix | Use Case | Example |
|---|---|---|
| `feature/` | New feature or enhancement | `feature/opportunity-loss-detector` |
| `fix/` | Bug fix | `fix/eligibility-score-rounding` |
| `docs/` | Documentation changes only | `docs/update-api-flow` |
| `refactor/` | Code restructuring, no behavior change | `refactor/agent-base-interface` |
| `test/` | Test additions or fixes | `test/orchestrator-e2e` |
| `chore/` | Tooling, CI, dependency updates | `chore/update-ci-workflow` |

---

## 📝 Commit Message Guidelines

We follow a simplified [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(agents): implement Future Eligibility Prediction agent logic
fix(orchestrator): correct agent execution order for stub agents
docs(readme): update architecture diagram and installation steps
test(rag): add coverage for empty query edge case
```

- Keep the subject line under 72 characters.
- Use the imperative mood ("add", not "added" or "adds").
- Reference related issues in the footer, e.g. `Closes #42`.

---

## 🔍 Pull Request Process

1. Ensure your branch is up to date with `main` before opening a PR.
2. Fill out the PR template completely, including:
   - What the change does and why.
   - Which agent(s) or layer(s) are affected.
   - Screenshots for any UI changes.
3. Ensure all CI checks pass (Python CI, React Build, Lint, Test workflows).
4. At least **one maintainer approval** is required before merging.
5. PRs should be focused — avoid bundling unrelated changes.
6. Squash commits on merge to keep history clean.

---

## 🧑‍💻 Coding Standards

### Backend (Python / FastAPI)

- Follow **PEP 8** style conventions.
- Use type hints for all function signatures.
- All agents must implement the `BaseAgent` interface (`backend/core/agent_base.py`).
- Document every agent with: Purpose, Inputs, Outputs, IBM Service Used, Production Implementation Notes.
- New agents must import LLM access **only** via `backend/ibm_services/` — never call an external SDK directly.
- Write unit tests for new agent logic under `backend/tests/`.

### Frontend (React / Tailwind)

- Use functional components with Hooks.
- Follow the existing component structure (`components/layout`, `components/dashboard`, `components/chat`, `components/agents`, `components/shared`).
- Use Tailwind utility classes; avoid inline styles where a utility class exists.
- Keep the IntelliGov AI color palette consistent: navy `#0a1628`, blue `#1a56db`, gold `#f59e0b`.

### General

- No secrets, API keys, or credentials committed to the repository — use `.env` files (gitignored).
- Keep pull requests scoped to a single concern.

---

## 🐛 Issue Reporting

Before opening a new issue, please search existing issues to avoid duplicates.

When reporting a bug, include:

- A clear, descriptive title.
- Steps to reproduce.
- Expected vs. actual behavior.
- Environment details (OS, Python/Node version).
- Relevant logs or screenshots.

When requesting a feature, include:

- The problem it solves.
- Proposed approach (if any).
- Which agent(s) or layer(s) it touches.

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

Thank you for helping make IntelliGov AI better! 🙏
