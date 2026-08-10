from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.health import router as health_router
from api.chat import router as chat_router
from api.eligibility import router as eligibility_router
from api.schemes import router as schemes_router


# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(
    title="IntelliGov AI Backend",
    description="Backend APIs for IntelliGov AI",
    version="1.0.0"
)


# =========================================================
# CORS Configuration
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Register API Routers
# =========================================================

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(eligibility_router)
app.include_router(schemes_router)


# =========================================================
# Root Endpoint
# =========================================================

@app.get("/")
def root():
    return {
        "message": "IntelliGov AI Backend is running",
        "version": "1.0.0"
    }