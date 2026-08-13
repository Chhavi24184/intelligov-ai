# IntelliGov AI — API Documentation

## 1. Overview

IntelliGov AI provides a FastAPI-based backend for government scheme discovery,
eligibility checking, AI-powered citizen assistance, document guidance,
and career-related recommendations.

The backend exposes REST APIs that are consumed by the IntelliGov AI frontend.

### Base URL

```text
http://127.0.0.1:8000
```

### Technology

- FastAPI
- Python
- Pydantic
- REST APIs
- Agent-based architecture
- JSON-based government scheme data
- Mock IBM Granite service

---

# 2. API Endpoints

The IntelliGov AI backend currently provides the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend health |
| POST | `/chat` | AI-powered citizen assistant |
| POST | `/eligibility` | Check government scheme eligibility |
| GET | `/schemes` | Retrieve government schemes |
| GET | `/schemes/search` | Search government schemes |

---

# 3. Health Check API

## GET /health

### Purpose

Checks whether the IntelliGov AI backend is running and healthy.

This endpoint can be used by the frontend or deployment environment to verify
that the backend service is available.

### Method

```text
GET
```

### URL

```text
/health
```

### Full URL

```text
http://127.0.0.1:8000/health
```

### Request Body

No request body is required.

### Request Example

```http
GET /health
```

### Response Example

```json
{
  "success": true,
  "status": "healthy",
  "service": "IntelliGov AI Backend"
}
```

### Success Status

```text
200 OK
```

### Error Status

No custom error response is defined for this endpoint.

### Frontend Usage

The frontend can use this endpoint to verify that the backend is running.

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/health"
);

const data = await response.json();

console.log(data);
```

---

# 4. Chat API

## POST /chat

### Purpose

Provides AI-powered citizen assistance.

The API accepts a natural-language user query and optionally a citizen
profile.

The request is processed through the IntelliGov AI agent architecture.

The Orchestrator Agent detects the user's intent and routes the query to
the appropriate specialized agent.

Supported areas include:

- Government schemes
- Eligibility
- Documents
- Employment
- Career opportunities

### Method

```text
POST
```

### URL

```text
/chat
```

### Full URL

```text
http://127.0.0.1:8000/chat
```

### Request Body

The request accepts:

- `message` — User's natural-language query
- `profile` — Optional citizen profile

### Request Example — Without Profile

```json
{
  "message": "What schemes are available for farmers?",
  "profile": null
}
```

### Request Example — With Profile

```json
{
  "message": "Am I eligible for any government scheme?",
  "profile": {
    "age": 25,
    "occupation": "student",
    "income": 200000,
    "gender": "female",
    "state": "Haryana"
  }
}
```

### Request Headers

```text
Content-Type: application/json
```

### Request Example

```http
POST /chat
Content-Type: application/json
```

```json
{
  "message": "What schemes are available for farmers?",
  "profile": null
}
```

### Response Structure

The API returns:

- `success`
- `message`
- `data`

The `data` object contains:

- `reply`
- `recommended_schemes`
- `agent_flow`

### Response Example

```json
{
  "success": true,
  "message": "Chat response generated successfully.",
  "data": {
    "reply": "Based on the available government scheme data, the following schemes may be relevant to your query.",
    "recommended_schemes": [],
    "agent_flow": [
      "OrchestratorAgent",
      "IntentDetectionAgent",
      "SchemeRecommendationAgent",
      "Granite"
    ]
  }
}
```

The exact response depends on the user's query and the available government
scheme data.

### Success Status

```text
200 OK
```

### Error Status

Possible errors include:

```text
400 Bad Request
```

when the request does not satisfy the expected request model.

Other server-side errors may occur if an internal backend service fails.

### Frontend Usage

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/chat",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: userMessage,
      profile: userProfile
    })
  }
);

const data = await response.json();

console.log(data);
```

---

# 5. Eligibility API

## POST /eligibility

### Purpose

Checks a citizen's eligibility for government schemes.

The eligibility engine considers the following factors:

- Age
- Occupation
- Income
- Gender
- State

The backend uses the Eligibility Service to evaluate the citizen profile
against the available government scheme data.

### Method

```text
POST
```

### URL

```text
/eligibility
```

### Full URL

```text
http://127.0.0.1:8000/eligibility
```

### Request Body

The request requires the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `age` | Integer | Yes | Citizen's age |
| `occupation` | String | Yes | Citizen's occupation |
| `income` | Number | Yes | Citizen's income |
| `gender` | String | Yes | Citizen's gender |
| `state` | String | Yes | Citizen's state |

### Request Example

```http
POST /eligibility
Content-Type: application/json
```

```json
{
  "age": 25,
  "occupation": "student",
  "income": 200000,
  "gender": "female",
  "state": "Haryana"
}
```

### Processing

The eligibility engine evaluates schemes using:

1. Occupation matching
2. Income matching
3. Gender matching
4. Age matching
5. State matching

Relevant schemes receive a match score.

The recommended schemes are sorted by match score in descending order.

### Response Example

```json
{
  "success": true,
  "message": "Eligibility checked successfully.",
  "data": {
    "eligible": true,
    "total_matches": 2,
    "recommended_schemes": [
      {
        "name": "Example Scheme",
        "category": "Education",
        "match_score": 6,
        "eligibility_reasons": [
          "Relevant for students",
          "Available in your state"
        ]
      }
    ]
  }
}
```

The actual scheme results depend on the contents of:

```text
backend/data/schemes.json
```

### Success Status

```text
200 OK
```

### Error Status

The API returns `400 Bad Request` for invalid input.

#### Invalid Age

If age is less than or equal to zero:

```json
{
  "detail": "Age must be greater than 0."
}
```

#### Invalid Income

If income is negative:

```json
{
  "detail": "Income cannot be negative."
}
```

#### Missing Occupation

```json
{
  "detail": "Occupation is required."
}
```

#### Missing Gender

```json
{
  "detail": "Gender is required."
}
```

#### Missing State

```json
{
  "detail": "State is required."
}
```

### Frontend Usage

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/eligibility",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      age: 25,
      occupation: "student",
      income: 200000,
      gender: "female",
      state: "Haryana"
    })
  }
);

const data = await response.json();

console.log(data);
```

---

# 6. Government Schemes API

## GET /schemes

### Purpose

Retrieves government schemes from the scheme database.

The API supports:

- Retrieving all schemes
- Filtering schemes by category

### Method

```text
GET
```

### URL

```text
/schemes
```

### Full URL

```text
http://127.0.0.1:8000/schemes
```

### Query Parameter

The `category` parameter is optional.

```text
category
```

### Get All Schemes

Request:

```http
GET /schemes
```

Full URL:

```text
http://127.0.0.1:8000/schemes
```

### Filter by Category

Request:

```http
GET /schemes?category=Education
```

Full URL:

```text
http://127.0.0.1:8000/schemes?category=Education
```

### Request Body

No request body is required.

### Response Example

```json
{
  "success": true,
  "message": "Schemes fetched successfully.",
  "data": [
    {
      "name": "Example Scheme",
      "category": "Education",
      "description": "Example government scheme description.",
      "eligibility": "Example eligibility criteria."
    }
  ]
}
```

The actual response contains schemes available in:

```text
backend/data/schemes.json
```

### Success Status

```text
200 OK
```

### Error Status

No custom error response is defined for this endpoint.

### Frontend Usage — Get All Schemes

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/schemes"
);

const data = await response.json();

console.log(data);
```

### Frontend Usage — Category Filter

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/schemes?category=Education"
);

const data = await response.json();

console.log(data);
```

---

# 7. Scheme Search API

## GET /schemes/search

### Purpose

Searches the government scheme database using a keyword.

The search service checks the following scheme fields:

- Scheme name
- Category
- Description

### Method

```text
GET
```

### URL

```text
/schemes/search
```

### Full URL

```text
http://127.0.0.1:8000/schemes/search
```

### Query Parameter

The `keyword` parameter is required.

```text
keyword
```

### Request Example

```http
GET /schemes/search?keyword=farmer
```

### Full URL Example

```text
http://127.0.0.1:8000/schemes/search?keyword=farmer
```

### Request Body

No request body is required.

### Response Example

```json
{
  "success": true,
  "message": "Search completed successfully.",
  "data": [
    {
      "name": "Example Farmer Scheme",
      "category": "Agriculture",
      "description": "Government support for farmers.",
      "eligibility": "Eligible farmers can apply."
    }
  ]
}
```

### Success Status

```text
200 OK
```

### Error Status

If the required `keyword` query parameter is not provided, FastAPI
validation returns a validation error.

Example:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "query",
        "keyword"
      ],
      "msg": "Field required"
    }
  ]
}
```

### Frontend Usage

```javascript
const keyword = "farmer";

const response = await fetch(
  `http://127.0.0.1:8000/schemes/search?keyword=${encodeURIComponent(keyword)}`
);

const data = await response.json();

console.log(data);
```

---

# 8. API Response Format

Most successful IntelliGov AI API responses follow this general structure:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

The exact contents of `data` depend on the endpoint.

---

# 9. API Architecture

The APIs are connected to the IntelliGov AI agent and service architecture.

```text
                         USER
                           |
                           v
                   React Frontend
                           |
                           v
                    FastAPI Backend
                           |
              +------------+------------+
              |            |            |
              v            v            v
           /chat      /eligibility   /schemes
              |            |            |
              v            v            v
       Orchestrator   Eligibility    Scheme
           Agent         Service      Service
              |
              v
       Intent Detection
           Agent
              |
      +-------+--------+---------+
      |       |        |         |
      v       v        v         v
   Scheme  Eligibility Document Career
   Agent     Agent      Agent   Agent
      |
      v
 Scheme Data
      |
      v
Granite Service
      |
      v
Final Response
```

---

# 10. Agent Flow for Chat API

The `/chat` endpoint follows this general flow:

```text
User Query
    |
    v
OrchestratorAgent
    |
    v
IntentDetectionAgent
    |
    +-------------------+
    |        |          |
    v        v          v
 Scheme  Eligibility  Document
 Agent      Agent       Agent
    |        |          |
    |        |          |
    +--------+----------+
             |
             v
       Scheme / Data
             |
             v
      Granite Service
             |
             v
      Final Response
```

Career-related queries are routed to the Career Agent.

```text
User Query
    |
    v
OrchestratorAgent
    |
    v
IntentDetectionAgent
    |
    v
CareerAgent
    |
    v
Career Recommendations
```

---

# 11. Backend Project Structure

The relevant backend structure is:

```text
backend/
│
├── agents/
│   ├── career_agent.py
│   ├── document_agent.py
│   ├── eligibility_agent.py
│   ├── intent_agent.py
│   ├── orchestrator.py
│   └── schemes_agent.py
│
├── api/
│   ├── chat.py
│   ├── eligibility.py
│   ├── health.py
│   └── schemes.py
│
├── services/
│   ├── chat_service.py
│   ├── eligibility_service.py
│   ├── granite_service.py
│   └── scheme_service.py
│
├── models/
│   ├── chat.py
│   └── eligibility.py
│
├── core/
│   ├── config.py
│   ├── constants.py
│   └── logger.py
│
├── data/
│   └── schemes.json
│
├── utils/
│
├── main.py
└── requirements.txt
```

---

# 12. Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The backend will start at:

```text
http://127.0.0.1:8000
```

---

# 13. Interactive API Documentation

FastAPI automatically provides Swagger UI.

Open:

```text
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to:

- View available endpoints
- View request models
- Test APIs
- Send request parameters
- Inspect API responses

FastAPI also provides ReDoc.

Open:

```text
http://127.0.0.1:8000/redoc
```

---

# 14. API Testing Examples

## Health Test

```http
GET http://127.0.0.1:8000/health
```

Expected:

```json
{
  "success": true,
  "status": "healthy",
  "service": "IntelliGov AI Backend"
}
```

---

## Scheme Test

```http
GET http://127.0.0.1:8000/schemes
```

Expected:

```text
HTTP 200 OK
```

---

## Scheme Search Test

```http
GET http://127.0.0.1:8000/schemes/search?keyword=farmer
```

Expected:

```text
HTTP 200 OK
```

---

## Eligibility Test

```http
POST http://127.0.0.1:8000/eligibility
```

Request:

```json
{
  "age": 25,
  "occupation": "student",
  "income": 200000,
  "gender": "female",
  "state": "Haryana"
}
```

Expected:

```text
HTTP 200 OK
```

---

## Chat Test

```http
POST http://127.0.0.1:8000/chat
```

Request:

```json
{
  "message": "What schemes are available for farmers?",
  "profile": null
}
```

Expected:

```text
HTTP 200 OK
```

---

# 15. Important Notes

1. The backend is implemented using FastAPI.

2. API routes are organized inside the `api/` directory.

3. Business logic is implemented inside the `services/` directory.

4. Agent-based routing is implemented inside the `agents/` directory.

5. Request models are defined inside the `models/` directory.

6. Government scheme information is currently loaded from:

```text
data/schemes.json
```

7. The current Granite implementation uses a mock Granite client.

8. The mock Granite service generates responses using the retrieved scheme
   context instead of directly generating unsupported scheme information.

9. Eligibility results are calculated using the current eligibility rules
   implemented in `services/eligibility_service.py`.

10. Exact government scheme eligibility and application requirements should
    be verified against official government sources before applying.

---

# 16. API Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks backend health |
| POST | `/chat` | Provides AI citizen assistance |
| POST | `/eligibility` | Checks citizen eligibility |
| GET | `/schemes` | Retrieves government schemes |
| GET | `/schemes/search` | Searches government schemes |

---

# 17. Future API Enhancements

Future versions of IntelliGov AI may include:

- User authentication
- Citizen profile management
- Personalized scheme recommendations
- Document upload APIs
- OCR-based document verification
- Real-time government scheme updates
- Official application links
- Multilingual API responses
- Voice-based citizen assistance
- Real IBM watsonx / Granite integration
- Vector database based retrieval
- Knowledge graph integration
- Notification APIs

---

# 18. Conclusion

The IntelliGov AI backend provides a modular FastAPI-based API layer for
government scheme discovery, eligibility checking, citizen assistance,
document guidance, and career recommendations.

The backend follows a modular architecture where API routes, services,
agents, models, and government scheme data are separated for easier
maintenance and future expansion.