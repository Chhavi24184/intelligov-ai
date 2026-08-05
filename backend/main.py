from fastapi import FastAPI

app = FastAPI(
    title="IntelliGov AI Backend",
    description="Backend APIs for IntelliGov AI",
    version="1.0.0"
)

from api.health import router as health_router
from api.chat import router as chat_router
from api.eligibility import router as eligibility_router
from api.schemes import router as schemes_router

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(eligibility_router)
app.include_router(schemes_router)