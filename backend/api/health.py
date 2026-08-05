from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def root():
    return {
        "success": True,
        "message": "IntelliGov AI Backend Running 🚀"
    }

@router.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "service": "IntelliGov AI Backend"
    }