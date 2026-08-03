from fastapi import FastAPI

app = FastAPI(
    title="IntelliGov AI Backend",
    description="Backend APIs for IntelliGov AI",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "IntelliGov AI Backend Running 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "IntelliGov AI Backend"
    }