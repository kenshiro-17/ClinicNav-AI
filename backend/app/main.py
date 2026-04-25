from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.gemini import chat_with_gemini, generate_with_gemini
from app.rules import detect_risk, fallback_result
from app.schemas import ChatRequest, ChatResponse, NavigateRequest, NavigationResult

app = FastAPI(title="CareNav AI API", version="0.1.0")

origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|141\.43\.44\.202)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/navigate", response_model=NavigationResult)
async def navigate(payload: NavigateRequest) -> NavigationResult:
    if detect_risk(payload) == "emergency":
        return fallback_result(payload, "rules")
    return await generate_with_gemini(payload)


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    return await chat_with_gemini(payload.situation, payload.report, payload.messages)
