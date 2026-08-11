from fastapi import FastAPI
from pydantic import BaseModel

from rag.rag_pipeline import RAGPipeline

from agents.intent_agent import intent_agent
from agents.scheme_agent import scheme_agent
from agents.eligibility_agent import eligibility_agent
from agents.document_agent import document_agent
from agents.career_agent import career_agent

app = FastAPI(title="IntelliGov AI")

rag = RAGPipeline(
    data_path="Government_Schemes.json",
    ollama_model="granite3.3:2b"
)


class ChatRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "IntelliGov AI is running"}


@app.post("/chat")
def chat(request: ChatRequest):
    intent_result = intent_agent(request.question)

    scheme_result = scheme_agent(request.question)
    eligibility_result = eligibility_agent(request.question)
    document_result = document_agent(request.question)
    career_result = career_agent(request.question)
    result = rag.ask(request.question)

    return {
    "question": request.question,
    "intent": intent_result,
    "scheme_agent": scheme_result,
    "eligibility_agent": eligibility_result,
    "document_agent": document_result,
    "career_agent": career_result,
    "answer": result["answer"],
    "sources": result["sources"]
}