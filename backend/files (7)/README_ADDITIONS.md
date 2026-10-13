## API Endpoints

### Core APIs
- **GET /** — Returns the backend welcome message and version.
- **GET /health** — Checks backend health status.
- **POST /chat** — Provides AI-powered chatbot assistance.
- **POST /eligibility** — Checks eligibility for government schemes.

### Government Scheme APIs
- **GET /schemes** — Retrieves government schemes.
- **GET /schemes/search?keyword=farmer** — Searches schemes by keyword.
- **GET /schemes/source** — Returns the active scheme data source.
- **GET /schemes/{scheme_id}** — Retrieves details of a specific scheme.
- **GET / POST /schemes/compare** — Compares government schemes.

### User Authentication and Profile
- **POST /auth/register** — Registers a new user.
- **POST /auth/login** — Authenticates a user.
- **GET /profile/{user_id}** — Retrieves a user's profile.

### User Services
- **GET / POST / DELETE /saved-schemes/...** — Manages saved schemes.
- **GET / POST /chat-history/...** — Manages chat history.
- **GET / POST /notifications/...** — Handles notifications.
- **GET / POST /application/...** — Provides application guidance and demo operations.

### MCP APIs
- **GET /mcp/tools** — Lists available MCP tools.
- **POST /mcp/rpc** — Handles MCP JSON-RPC requests.

**Interactive API Documentation:** `/docs`

**Alternative API Documentation:** `/redoc`