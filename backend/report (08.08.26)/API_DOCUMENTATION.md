# API Documentation

## Project API Documentation

**Base URL:** `http://127.0.0.1:8000`\
**Testing Tool:** FastAPI Swagger UI (`/docs`)\
**API Framework:** FastAPI

------------------------------------------------------------------------
ALL THIS ARE CHECKED NOT GO FOR EXAMPLE I TAKEN



## 1. GET `/`

### Endpoint

`/`

### Method

`GET`

### Request

No request body is required.

### Response

Returns the root/welcome response of the backend.

### Example Request

``` text
GET http://127.0.0.1:8000/
```

### Example Response

``` json
{
  "message": "API is running"
}
```

> **Note:** Replace the example response above with the exact response
> shown by your Swagger UI if your backend returns different data.

------------------------------------------------------------------------

## 2. GET `/health`

### Endpoint

`/health`

### Method

`GET`

### Request

No request body is required.

### Response

Returns the health/status of the backend service.

### Example Request

``` text
GET http://127.0.0.1:8000/health
```

### Example Response

``` json
{
  "status": "healthy"
}
```

> **Note:** Replace the example response with the exact response from
> Swagger if your implementation uses different field names.

------------------------------------------------------------------------

## 3. GET `/schemes`

### Endpoint

`/schemes`

### Method

`GET`

### Request

No request body is required.

### Response

Returns the available government schemes.

### Example Request

``` text
GET http://127.0.0.1:8000/schemes
```

### Example Response

``` json
[
  {
    "name": "Example Scheme",
    "description": "Example scheme description"
  }
]
```

> **Note:** Replace the example response with the actual scheme data
> returned by your backend.

------------------------------------------------------------------------

## 4. GET `/schemes/search`

### Endpoint

`/schemes/search`

### Method

`GET`

### Request

This endpoint uses a query parameter. The exact parameter name is
defined by the FastAPI Swagger schema.

### Example Request

If Swagger shows the parameter as `query`:

``` text
GET http://127.0.0.1:8000/schemes/search?query=scholarship
```

### Response

Returns schemes matching the supplied search term.

### Example Response

``` json
[
  {
    "name": "Example Scholarship Scheme",
    "description": "Example description"
  }
]
```

> **Important:** Use the exact query-parameter name and response format
> displayed in your project's Swagger UI.

------------------------------------------------------------------------

## 5. POST `/chat`

### Endpoint

`/chat`

### Method

`POST`

### Request

The request body must follow the JSON schema displayed by Swagger.

### Example Request

If the Swagger schema contains a `message` field:

``` json
{
  "message": "What government schemes are available for students?"
}
```

### Response

Returns the chatbot's response.

### Example Response

``` json
{
  "response": "Example chatbot response"
}
```

> **Important:** Replace the request and response examples with the
> exact schema and response returned by your implementation.

------------------------------------------------------------------------

## 6. POST `/eligibility`

### Endpoint

`/eligibility`

### Method

`POST`

### Request

The request body must contain the fields required by the Swagger schema.

### Example Request

``` json
{
  "example": "Use the exact fields shown in Swagger"
}
```

### Response

Returns the eligibility result according to the submitted information.

### Example Response

``` json
{
  "eligible": true
}
```

> **Important:** Replace the example request and response with the exact
> schema and response returned by your implementation.

------------------------------------------------------------------------

## Common HTTP Status Codes

  Status Code   Meaning
  ------------- ----------------------------------------------
  `200`         Request successful
  `201`         Resource created successfully, if applicable
  `400`         Bad request
  `404`         Endpoint/resource not found
  `422`         Validation error
  `500`         Internal server error

------------------------------------------------------------------------

## Swagger Documentation

Open:

`http://127.0.0.1:8000/docs`

Use **Try it out → Execute** to test each endpoint.
