from fastapi import APIRouter
from services.scheme_service import get_all_schemes

router = APIRouter()

@router.get("/schemes")
def schemes():
    return {
        "success": True,
        "schemes": get_all_schemes()
    }