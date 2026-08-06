# Test Cases

## API: `/`
1. **Input:** GET request, no params
   **Expected:** 200 OK, welcome message
2. **Input:** GET request with trailing slash variations
   **Expected:** 200 OK, same response
3. **Input:** Wrong method (POST /)
   **Expected:** 405 Method Not Allowed

---

## API: `/health`
1. **Input:** GET request
   **Expected:** 200 OK, `{"status": "ok"}` (or actual shape)
2. **Input:** Server under load / DB down (if applicable)
   **Expected:** 503 or degraded status
3. **Input:** Wrong method (POST /health)
   **Expected:** 405 Method Not Allowed

---

## API: `/chat`
1. **Input:** `"I am a farmer"`
   **Expected:** PM Kisan recommendation
2. **Input:** `""` (empty message)
   **Expected:** 400 Bad Request / validation error
3. **Input:** `"I am a student"`
   **Expected:** Scholarship/education scheme recommendation
4. **Input:** Missing `message` field in body
   **Expected:** 422 Unprocessable Entity

---

## API: `/eligibility`
1. **Input:** Valid farmer profile (age, income, land ownership)
   **Expected:** 200 OK, eligible schemes list
2. **Input:** Missing required field(s)
   **Expected:** 422 Unprocessable Entity
3. **Input:** Invalid data type (e.g., age as string "abc")
   **Expected:** 422 Unprocessable Entity
4. **Input:** Ineligible profile (income too high)
   **Expected:** 200 OK, empty/no matching schemes

---

## API: `/schemes`
1. **Input:** GET request, no params
   **Expected:** 200 OK, full list of schemes
2. **Input:** GET with query filter (if supported, e.g. `?category=agriculture`)
   **Expected:** 200 OK, filtered list
3. **Input:** GET when scheme DB is empty
   **Expected:** 200 OK, empty array `[]`
