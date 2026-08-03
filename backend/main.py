from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="IntelliGov AI Backend",
    description="Backend APIs for IntelliGov AI",
    version="1.0.0"
)


# =========================
# Root API
# =========================
@app.get("/")
def root():
    return {
        "success": True,
        "message": "IntelliGov AI Backend Running 🚀"
    }


# =========================
# Health Check API
# =========================
@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "service": "IntelliGov AI Backend"
    }


# =========================
# Chat API
# =========================
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(request: ChatRequest):
    return {
        "success": True,
        "reply": f"You said: {request.message}"
    }


# =========================
# Eligibility API
# =========================
class EligibilityRequest(BaseModel):
    age: int
    occupation: str


@app.post("/eligibility")
def check_eligibility(request: EligibilityRequest):
    return {
        "success": True,
        "eligible": True,
        "message": "Eligibility checking module is working.",
        "user": {
            "age": request.age,
            "occupation": request.occupation
        }
    }


# =========================
# Government Schemes API
# =========================
@app.get("/schemes")
def get_schemes():
    return {
        "success": True,
        "schemes": [
            {
                "name": "PM Kisan",
                "category": "Farmer",
                "description": "Income support scheme for farmers."
            },
            {
                "name": "Ayushman Bharat",
                "category": "Healthcare",
                "description": "Health insurance scheme for eligible families."
            },
            {
                "name": "PM Awas Yojana",
                "category": "Housing",
                "description": "Affordable housing scheme for eligible citizens."
            }
        ]
    }