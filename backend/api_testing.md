


# API Testing Documentation

## 1. Overview

This document contains testing details for the IntelliGov AI backend APIs.

The following endpoints were tested:

- GET `/health`
- POST `/chat`
- POST `/eligibility`
- GET `/schemes`
- GET `/schemes/search`

Testing included normal inputs, invalid inputs, missing inputs, empty inputs, wrong data types, and no-result scenarios.

---

## 2. GET /health

### Purpose
Checks whether the backend server is running correctly.

### Method
GET

### Endpoint
`/health`

### Test Cases

| Test Case | Input | Expected Result | Status |
|---|---|---|---|
| Normal request | No input | Server health response | PASS |
| Invalid method | POST | Method Not Allowed | PASS |

### Result
The health endpoint was successfully tested and the backend server responded correctly.

---

## 3. POST /chat

### Purpose
Processes citizen queries through the chatbot/orchestrator pipeline.

### Method
POST

### Endpoint
`/chat`

### Sample Request

```json
{
  "message": "Which government schemes are available for farmers?"
}
Test Scenarios
Test Case	Input	Expected Result	Status
Normal query	Farmer scheme query	Relevant response	PASS
Student query	Scholarship query	Relevant response	PASS
Empty message	""	Validation/fallback response	PASS
Missing message	{}	Validation/fallback response	PASS
Unknown query	XYZ123	Safe fallback	PASS
Irrelevant query	General unrelated query	Appropriate fallback	PASS
Result

The chat API successfully processed queries and returned responses through the backend AI pipeline.

4. POST /eligibility
Purpose

Checks citizen eligibility and recommends relevant government schemes.

Method

POST

Endpoint

/eligibility

Sample Request
{
  "age": 35,
  "occupation": "Farmer",
  "gender": "Male",
  "income": 150000,
  "state": "Haryana"
}
Test Scenarios
Test Case	Input	Expected Result	Status
Valid profile	Complete citizen details	Relevant schemes	PASS
Student	Student profile	Student-related schemes	PASS
Farmer	Farmer profile	Farmer-related schemes	PASS
Female user	Female profile	Relevant schemes	PASS
High income	High income profile	Correct filtering	PASS
Invalid age	Text instead of number	Validation/error	PASS
Missing field	Missing age/income/etc.	Validation/error	PASS
Empty input	{}	Validation/error	PASS
No-result profile	No matching criteria	Empty/no-result response	PASS
Result

Eligibility API successfully handled valid, invalid, and edge-case profiles.

5. GET /schemes
Purpose

Returns available government scheme data.

Method

GET

Endpoint

/schemes

Test Scenarios
Test Case	Expected Result	Status
Normal request	Scheme list returned	PASS
Empty database scenario	Safe empty response	PASS
Invalid method	Method validation	PASS
Result

The schemes endpoint successfully returned available scheme information.

6. GET /schemes/search
Purpose

Searches government schemes using keywords.

Method

GET

Endpoint

/schemes/search

Sample Request
/schemes/search?keyword=farmer
Search Test Cases

The following queries were tested:

farmer
Farmer
FARMER
farm
student
scholarship
education
health
women
skill
loan
business
PM Kisan
Ayushman
xyz123

Additional search queries were also tested.

Test Scenarios
Test Case	Input	Expected Result	Status
Normal keyword	farmer	Relevant schemes	PASS
Different case	FARMER	Relevant schemes	PASS
Partial keyword	farm	Relevant schemes	PASS
Student keyword	student	Student schemes	PASS
Unknown keyword	xyz123	No-result response	PASS
Empty keyword	Empty	Validation/no-result	PASS
Missing keyword	No parameter	Validation/error	PASS
Result

Scheme search successfully handled normal, case variations, partial keywords, and unknown queries.

7. Overall API Testing Result

All major backend API endpoints were tested.

Final Status
Endpoint	Status
GET /health	PASS
POST /chat	PASS
POST /eligibility	PASS
GET /schemes	PASS
GET /schemes/search	PASS
Conclusion

The IntelliGov AI backend APIs were tested for normal operations, invalid inputs, missing inputs, empty inputs, wrong data types, and no-result scenarios.

The tested APIs responded according to the expected application behavior.


### Save karne ke baad

PowerShell mein:

```powershell
Get-ChildItem API_TESTING.md