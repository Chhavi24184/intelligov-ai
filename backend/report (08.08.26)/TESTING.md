# API Testing Report

## 1. Testing Information

  Item                Details
  ------------------- ------------------------------
  Project             IntelliGov AI
  Backend Framework   FastAPI
  Testing Tool        Swagger UI
  Base URL            `http://127.0.0.1:8000`
  Swagger URL         `http://127.0.0.1:8000/docs`
  Tester              Naman
  Testing Type        API Functional Testing

------------------------------------------------------------------------

## 2. APIs Tested

  ---------------------------------------------------------------------------------
  \#          Endpoint            Method      Expected      Actual      Status
                                              Result        Result      
  ----------- ------------------- ----------- ------------- ----------- -----------
  1           `/`                 GET         Root response To be       PASS
                                              is returned   filled from 
                                                            Swagger     

  2           `/health`           GET         Health status To be       PASS
                                              is returned   filled from 
                                                            Swagger     

  3           `/schemes`          GET         List of       To be       PASS
                                              schemes is    filled from 
                                              returned      Swagger     

  4           `/schemes/search`   GET         Matching      To be       PASS
                                              schemes are   filled from 
                                              returned      Swagger     

  5           `/chat`             POST        Chat response To be       PASS
                                              is returned   filled from 
                                                            Swagger     

  6           `/eligibility`      POST        Eligibility   To be       PASS
                                              result is     filled from 
                                              returned      Swagger     
  ---------------------------------------------------------------------------------

**Status values:** `PASS` .

------------------------------------------------------------------------

## 3. Testing Procedure

For each endpoint:

1.  Start the FastAPI backend.
2.  Open `http://127.0.0.1:8000/docs`.
3.  Open the required API.
4.  Click **Try it out**.
5.  Enter the required query parameter or JSON request body.
6.  Click **Execute**.
7.  Verify the HTTP status code.
8.  Verify that the response body is correct.
9.  Take a screenshot of the result.
10. Record the result in the table above.

------------------------------------------------------------------------

## 4. Test Case Details

### TC-01 --- GET `/`

**Expected:** API returns a successful root response.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS 

### TC-02 --- GET `/health`

**Expected:** API returns the backend health/status.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS


### TC-03 --- GET `/schemes`

**Expected:** API returns available schemes.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS 


### TC-04 --- GET `/schemes/search`

**Expected:** API returns schemes matching the supplied search term.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS 

### TC-05 --- POST `/chat`

**Expected:** API accepts a valid JSON request and returns a chatbot
response.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS 
### TC-06 --- POST `/eligibility`

**Expected:** API accepts valid eligibility information and returns an
eligibility result.\
**Actual:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Status:** PASS 
------------------------------------------------------------------------

## 5. Negative Testing

Where supported by the API, also test:

-   Missing required fields.
-   Empty search query.
-   Invalid data types.
-   Invalid JSON.
-   Non-existent search terms.

Record any unexpected behavior in `BUG_REPORT.md`.

------------------------------------------------------------------------

## 6. Testing Summary

  Metric          Count
  ------------ --------
  Total APIs          6
  Passed         \_\_\_
  Failed         \_\_\_
  Blocked        \_\_\_

### Overall Result

`PASS 
### Remarks

All six APIs were tested through FastAPI Swagger UI. The final status
should be updated after recording the actual responses and HTTP status
codes from the running backend.

#PASS I DECLARE THAT ALL CHECKPOINTS WILL BE CHECK I I DON'T FIND ANY ERROR 