## API Endpoints

| Endpoint      | Method | Purpose                          |
|---------------|--------|-----------------------------------|
| `/`           | GET    | Health/welcome check              |
| `/health`     | GET    | Server status check               |
| `/chat`       | POST   | Chatbot query & recommendation    |
| `/eligibility`| POST   | Scheme eligibility check          |
| `/schemes`    | GET    | List all government schemes       |

Full request/response details: [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

## Project Architecture

<describe your stack, e.g.:>
- **Backend:** FastAPI (Python)
- **Frontend:** <your stack>
- **Database:** <your DB>
- Flow: Client → API → (chatbot/eligibility logic) → Response

## Folder Structure

```
project/
├── backend/
│   ├── main.py
│   ├── API_DOCUMENTATION.md
│   ├── TEST_CASES.md
│   └── ...
├── frontend/
└── README.md
```
