from fastapi import APIRouter
from core.logger import logger

router = APIRouter()


@router.get("/health")
def health():

    logger.info("Health API Called")

    return {
        "success": True,
        "status": "healthy",
        "service": "IntelliGov AI Backend"
    }