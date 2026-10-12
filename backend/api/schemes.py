from typing import Optional

from fastapi import APIRouter, HTTPException

from core.logger import logger

from services.scheme_service import (
    get_all_schemes,
    get_schemes_by_category,
    get_schemes_source,
    search_schemes,
    get_scheme_by_id_or_name,
)

router = APIRouter()


@router.get("/schemes")
def schemes(category: Optional[str] = None):

    logger.info(f"Schemes API Called | Category: {category}")

    if category:
        data = get_schemes_by_category(category)
    else:
        data = get_all_schemes()

    return {
        "success": True,
        "message": "Schemes fetched successfully.",
        "data": data
    }


@router.get("/schemes/source")
def schemes_source():
    """Returns which data source is active (static JSON vs live API)."""
    return get_schemes_source()


@router.get("/schemes/search")
def search(keyword: str):

    logger.info(f"Search API Called | Keyword: {keyword}")

    data = search_schemes(keyword)

    return {
        "success": True,
        "message": "Search completed successfully.",
        "data": data
    }


@router.get("/schemes/{scheme_id}")
def get_scheme_details(scheme_id: str):
    logger.info(f"Scheme Detail API Called | ID: {scheme_id}")

    scheme = get_scheme_by_id_or_name(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=404,
            detail=f"Scheme '{scheme_id}' not found"
        )

    return {
        "success": True,
        "message": "Scheme fetched successfully.",
        "data": scheme
    }