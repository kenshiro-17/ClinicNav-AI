from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["emergency", "urgent", "routine", "self_care_or_pharmacy", "administrative"]


class NavigateRequest(BaseModel):
    country: Literal["Germany"] = "Germany"
    concern: str = Field(min_length=8)
    duration: str
    severity: int = Field(ge=1, le=10)
    symptoms: list[str] = []
    languagePreference: Literal["english", "german_phrase"] = "german_phrase"
    userType: Literal["international_student", "tourist", "migrant_new_resident", "local_resident"] = "international_student"
    tried: str = ""
    severeConcern: bool = False


class LocalTerm(BaseModel):
    term: str
    meaning: str


class DoctorSummary(BaseModel):
    mainConcern: str
    duration: str
    severity: str
    keySymptoms: list[str]
    whatToSay: str
    questionsToAsk: list[str]


class LocalLanguagePhrase(BaseModel):
    language: str
    phrase: str
    meaning: str


class NavigationResult(BaseModel):
    riskLevel: RiskLevel
    recommendedRoute: str
    reasoning: str
    urgentWarningSigns: list[str]
    localTerms: list[LocalTerm]
    documentsToBring: list[str]
    doctorSummary: DoctorSummary
    localLanguagePhrase: LocalLanguagePhrase
    nextStep: str
    disclaimer: str
    source: Literal["rules", "gemini", "mock", "fastapi"] = "fastapi"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1600)


class ChatRequest(BaseModel):
    situation: NavigateRequest
    report: NavigationResult
    messages: list[ChatMessage] = Field(min_length=1, max_length=12)


class ChatResponse(BaseModel):
    reply: str
    source: Literal["rules", "gemini", "mock", "fastapi"]
    urgent: bool
