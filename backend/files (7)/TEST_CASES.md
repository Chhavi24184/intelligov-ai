# Test Cases

## API: `/`

### Test Case 1: Default GET Request
- **Input:** GET request with no parameters.
- **Expected Result:** `200 OK` with the welcome message.

### Test Case 2: Trailing Slash Variations
- **Input:** GET request to `/` and supported trailing-slash variations.
- **Expected Result:** `200 OK` with the appropriate response for supported routes.

### Test Case 3: Unsupported HTTP Method
- **Input:** POST request to `/`.
- **Expected Result:** `405 Method Not Allowed`.

---

## API: `/health`

### Test Case 1: Health Check
- **Input:** GET request to `/health`.
- **Expected Result:** `200 OK` with the health status response, as defined by the backend.

### Test Case 2: Server or Database Failure
- **Input:** Request when the server is overloaded or a required database service is unavailable.
- **Expected Result:** An appropriate error or degraded status, if health checks cover these dependencies.

### Test Case 3: Unsupported HTTP Method
- **Input:** POST request to `/health`.
- **Expected Result:** `405 Method Not Allowed`, if POST is not supported.

---

## API: `/chat`

### Test Case 1: Farmer Scheme Recommendation
- **Input:** POST request with the message `"I am a farmer"`.
- **Expected Result:** A relevant response recommending suitable agricultural schemes, such as PM-KISAN when applicable.

### Test Case 2: Empty Message
- **Input:** POST request with an empty message: `""`.
- **Expected Result:** A validation error if empty messages are rejected by the backend.

### Test Case 3: Student Scheme Recommendation
- **Input:** POST request with the message `"I am a student"`.
- **Expected Result:** Relevant scholarship or education scheme recommendations, where applicable.

### Test Case 4: Missing Message Field
- **Input:** POST request with the required message field missing.
- **Expected Result:** `422 Unprocessable Entity` if the request schema requires a message or question.

---

## API: `/eligibility`

### Test Case 1: Valid User Profile
- **Input:** POST request with valid eligibility details, including age, occupation, income, gender, and state.
- **Expected Result:** `200 OK` with eligibility results or a list of matching schemes.

### Test Case 2: Missing Required Fields
- **Input:** POST request with one or more required fields missing.
- **Expected Result:** `422 Unprocessable Entity` if the missing fields are required by the request schema.

### Test Case 3: Invalid Data Type
- **Input:** POST request with an invalid value, such as `"abc"` for age.
- **Expected Result:** A validation error if the field requires a numeric value.

### Test Case 4: Ineligible User Profile
- **Input:** POST request with a valid profile that does not meet the eligibility criteria for a scheme.
- **Expected Result:** `200 OK` with no matching schemes or an appropriate eligibility result, depending on the API response format.

---

## API: `/schemes`

### Test Case 1: Retrieve All Schemes
- **Input:** GET request to `/schemes` without query parameters.
- **Expected Result:** `200 OK` with the available government schemes.

### Test Case 2: Filter Schemes by Category
- **Input:** GET request with a category filter, such as `/schemes?category=agriculture`, if supported.
- **Expected Result:** `200 OK` with schemes matching the requested category.

### Test Case 3: Empty Scheme Data
- **Input:** GET request when the scheme data source contains no records.
- **Expected Result:** An empty list (`[]`) with `200 OK`, if this is the API's defined behavior.

---

## Notes

- These test cases describe expected behavior and should be verified against the actual backend implementation.
- HTTP status codes and response formats may differ depending on the validation rules and error-handling logic.
- Use the interactive API documentation at `/docs` to verify supported routes, request schemas, and response formats.
