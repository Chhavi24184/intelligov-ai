# ============================================
# IntelliGov AI — Backend Dockerfile (FastAPI)
# ============================================

FROM python:3.11-slim AS base

# Prevent Python from writing pyc files & buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Pre-cache directory for the ChromaDB / sentence-transformers
# ONNX model (all-MiniLM-L6-v2 ~79 MB).
# Setting these env vars tells both chromadb and sentence-transformers
# to store and load the model from /app/.chroma_cache, which is
# baked into the image at build time — no runtime download needed.
ENV CHROMA_CACHE_DIR=/app/.chroma_cache \
    SENTENCE_TRANSFORMERS_HOME=/app/.chroma_cache

WORKDIR /app

# System dependencies required by chromadb / sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Pre-download the all-MiniLM-L6-v2 ONNX model used by
# chromadb.utils.embedding_functions.DefaultEmbeddingFunction.
# This runs once during the image build and caches the model
# at CHROMA_CACHE_DIR so it is never downloaded at request time.
RUN python -c " \
from chromadb.utils import embedding_functions; \
ef = embedding_functions.DefaultEmbeddingFunction(); \
ef(['warmup']); \
print('ONNX model pre-cached successfully.') \
"

# Copy application source
COPY . .

# Persistent volume mount point for ChromaDB
VOLUME ["/app/knowledge/chroma_db"]

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
