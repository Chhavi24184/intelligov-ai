from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from core.logger import logger

# =========================================================
# Models  (must be imported before create_all)
# =========================================================

from models.user import User
from models.chat_history import ChatHistory
from models.notification import Notification
from models.saved_scheme import SavedScheme
from models.scheme import Scheme


# =========================================================
# API Routers
# =========================================================

from api.health import router as health_router
from api.chat import router as chat_router
from api.eligibility import router as eligibility_router
from api.schemes import router as schemes_router
from api.auth import router as auth_router
from api.chat_history import router as chat_history_router
from api.notifications import router as notifications_router
from api.profile import router as profile_router
from api.saved_schemes import router as saved_schemes_router
from api.application import router as application_router
from api.mcp import router as mcp_router


# =========================================================
# Create Database Tables (new tables only — never drops)
# =========================================================

Base.metadata.create_all(bind=engine)

# =========================================================
# Seed the government-scheme catalogue into SQL (idempotent)
# =========================================================
try:
    from services.scheme_service import seed_schemes_database
    seed_schemes_database()
except Exception as _scheme_seed_error:
    logger.warning(f"Government scheme database seeding skipped: {_scheme_seed_error}")



# =========================================================
# Safe column migration — adds missing profile columns
# to the existing users table without touching any data.
# Uses ADD COLUMN IF NOT EXISTS so it is idempotent.
# =========================================================

try:
    from migrate import run_migration
    run_migration()
    logger.info("Schema migration completed successfully.")
except Exception as _me:
    logger.warning(f"Schema migration skipped: {_me}")


# =========================================================
# Ensure ChromaDB is indexed on startup
# =========================================================

try:
    from services.rag_service import get_collection_count, index_schemes
    from services.scheme_service import get_all_schemes as _get_all_schemes
    _chroma_count = get_collection_count()
    _scheme_count = len(_get_all_schemes())
    if _chroma_count == 0 or _chroma_count != _scheme_count:
        logger.info(
            f"ChromaDB count ({_chroma_count}) vs schemes ({_scheme_count}) — re-indexing..."
        )
        index_schemes()
        logger.info(f"ChromaDB re-indexed: {get_collection_count()} documents")
    else:
        # Force re-index on startup to pick up enriched scheme fields (benefits, deadline, official_url)
        logger.info(f"ChromaDB: re-indexing to pick up enriched scheme data...")
        index_schemes()
        logger.info(f"ChromaDB re-indexed: {get_collection_count()} documents")
except Exception as _e:
    logger.warning(f"ChromaDB startup indexing skipped: {_e}")


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

import os

_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if _allowed_origins_env:
    allowed_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://intelligov-ai.onrender.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
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
app.include_router(auth_router)
app.include_router(chat_history_router)
app.include_router(notifications_router)
app.include_router(profile_router)
app.include_router(saved_schemes_router)
app.include_router(application_router)
app.include_router(mcp_router)


# =========================================================
# Root Endpoint
# =========================================================

@app.get("/")
def root():
    return {
        "message": "IntelliGov AI Backend is running",
        "version": "1.0.0"
    }


# =========================================================
# PostgreSQL Database Test
# =========================================================

@app.get("/db-test")
def database_test():

    try:

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "PostgreSQL connected successfully!"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }
