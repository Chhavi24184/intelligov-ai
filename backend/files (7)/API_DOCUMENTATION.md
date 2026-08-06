# API Documentation

## 1. Root
- **Endpoint:** `/`
- **Method:** `GET`
- **Request Body:** None
- **Sample Response:**
```json
<paste actual response>
```
- **Purpose:** Health/welcome route confirming the API is live.

---

## 2. Health Check
- **Endpoint:** `/health`
- **Method:** `GET`
- **Request Body:** None
- **Sample Response:**
```json
<paste actual response>
```
- **Purpose:** Used for uptime/monitoring checks.

---

## 3. Chat
- **Endpoint:** `/chat`
- **Method:** `POST`
- **Request Body:**
```json
{
  "message": "I am a farmer"
}
```
- **Sample Response:**
```json
<paste actual response>
```
- **Purpose:** Accepts user query and returns a chatbot-generated reply/recommendation.

---

## 4. Eligibility
- **Endpoint:** `/eligibility`
- **Method:** `POST`
- **Request Body:**
```json
{
  "<field1>": "<value>",
  "<field2>": "<value>"
}
```
- **Sample Response:**
```json
<paste actual response>
```
- **Purpose:** Checks user eligibility for government schemes based on submitted details.

---

## 5. Schemes
- **Endpoint:** `/schemes`
- **Method:** `GET`
- **Request Body:** None
- **Sample Response:**
```json
<paste actual response>
```
- **Purpose:** Returns list of all available government schemes.
