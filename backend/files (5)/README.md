# Project Name

<!-- e.g. Scheme Eligibility Chatbot -->

## Team Members
| Name | Role |
|------|------|
| Naman | Backend Support / Testing & Docs |
| ... | ... |

## Tech Stack
- Backend: FastAPI (Python)
- LLM/AI: IBM Watsonx (IBM_API_KEY, IBM_PROJECT_ID)
- Docs: Swagger (auto via FastAPI `/docs`)
- ... (add DB, frontend if any)

## Folder Structure
```
project-root/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── SETUP.md
│   ├── TESTING.md
│   └── routes/
├── README.md
```

## Installation Steps
1. Clone repo: `git clone <repo_url>`
2. Go to backend: `cd backend`
3. Create venv: `python -m venv venv`
4. Activate venv (see SETUP.md)
5. Install deps: `pip install -r requirements.txt`
6. Copy `.env.example` → `.env` and fill real values

## Run Commands
```bash
cd backend
uvicorn main:app --reload
```
Visit: `http://127.0.0.1:8000/docs`
