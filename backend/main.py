from fastapi import FastAPI

app = FastAPI(
    title="My First FastAPI",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "Welcome to FastAPI!"}

@app.get("/health")
def health():
    return {"status": "healthy"}