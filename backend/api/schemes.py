from typing import Optional

from fastapi import APIRouter

from core.logger import logger

from services.scheme_service import (
    get_all_schemes,
    get_schemes_by_category,
    get_schemes_source,
    search_schemes,
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