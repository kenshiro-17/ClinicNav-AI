import json

import httpx

from app.config import settings
from app.rules import detect_risk, fallback_result
from app.schemas import ChatMessage, ChatResponse, NavigateRequest, NavigationResult

FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]


async def call_gemini_json(prompt: str, temperature: float) -> str | None:
    if not settings.gemini_api_key:
        return None

    models = list(dict.fromkeys([settings.gemini_model, *FALLBACK_MODELS]))

    for model in models:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:"
            f"generateContent?key={settings.gemini_api_key}"
        )
        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": temperature},
        }

        try:
            async with httpx.AsyncClient(timeout=12) as client:
                response = await client.post(url, json=body)
                response.raise_for_status()
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            if isinstance(text, str):
                return text
        except Exception:
            continue

    return None


async def generate_with_gemini(payload: NavigateRequest) -> NavigationResult:
    if not settings.gemini_api_key:
        return fallback_result(payload, "mock")

    prompt = f"""
You are ClinicNav AI, a healthcare navigation assistant for Germany.

Safety rules:
- Do not diagnose diseases or claim certainty.
- Do not suggest prescription medication.
- Do not tell users to avoid medical care.
- Do not give emergency treatment instructions beyond safe routing.
- Keep wording cautious and navigation-focused.
- Explain care routes, local terms, documents, and what to say.
- If symptoms may be severe, worsening, or life-threatening, route to 112.
- For urgent non-life-threatening care in Germany, mention 116117 or Bereitschaftspraxis.
- Do not say "this strongly suggests" a disease. Say "this may need prompt professional assessment."
- If userType is "local_resident", return every user-facing string in German.
- If userType is not "local_resident", return user-facing strings in English with German phrases where useful.

Return only valid JSON matching this schema:
{{
  "riskLevel": "emergency" | "urgent" | "routine" | "self_care_or_pharmacy" | "administrative",
  "recommendedRoute": string,
  "reasoning": string,
  "urgentWarningSigns": string[],
  "localTerms": [{{"term": string, "meaning": string}}],
  "documentsToBring": string[],
  "doctorSummary": {{
    "mainConcern": string,
    "duration": string,
    "severity": string,
    "keySymptoms": string[],
    "whatToSay": string,
    "questionsToAsk": string[]
  }},
  "localLanguagePhrase": {{"language": string, "phrase": string, "meaning": string}},
  "nextStep": string,
  "disclaimer": string,
  "source": "gemini"
}}

Germany facts: 112 is for life-threatening emergencies. 116117 is the medical on-call service for urgent non-life-threatening care.
User input: {payload.model_dump_json()}
"""
    try:
        text = await call_gemini_json(prompt, 0.2)
        if not text:
            return fallback_result(payload, "mock")
        data = json.loads(text)
        data["source"] = "gemini"
        return NavigationResult.model_validate(data)
    except Exception:
        return fallback_result(payload, "mock")


def latest_user_message(messages: list[ChatMessage]) -> str:
    for message in reversed(messages):
        if message.role == "user":
            return message.content
    return ""


def fallback_chat_reply(payload: NavigateRequest, report: NavigationResult, messages: list[ChatMessage], source: str = "mock") -> ChatResponse:
    user_text = latest_user_message(messages)
    risk = detect_risk(payload.model_copy(update={"concern": f"{payload.concern}\n{user_text}"}))

    if risk == "emergency":
        return ChatResponse(
            reply=(
                "Your new message includes possible emergency warning signs. If symptoms are severe, worsening, "
                "or life-threatening, call 112 immediately or go to the nearest Notaufnahme. ClinicNav AI cannot "
                "assess emergencies through chat."
            ),
            source="rules",
            urgent=True,
        )

    return ChatResponse(
        reply=(
            f"Based on your report, the safest next step is: {report.nextStep} Bring your Gesundheitskarte or "
            "insurance confirmation, ID, medication list, and allergy information. If symptoms worsen or you feel "
            "unsure outside normal hours, call 116117. This is not medical advice or a diagnosis."
        ),
        source=source,
        urgent=False,
    )


async def chat_with_gemini(payload: NavigateRequest, report: NavigationResult, messages: list[ChatMessage]) -> ChatResponse:
    user_text = latest_user_message(messages)
    risk = detect_risk(payload.model_copy(update={"concern": f"{payload.concern}\n{user_text}"}))
    if risk == "emergency":
        return fallback_chat_reply(payload, report, messages, "rules")

    if not settings.gemini_api_key:
        return fallback_chat_reply(payload, report, messages, "mock")

    prompt = f"""
You are ClinicNav AI's follow-up chat assistant.

The user already received a healthcare navigation report. Help them understand the report, prepare what to say, clarify German healthcare terms, refine next steps, and identify warning signs.

Hard safety rules:
- Do not diagnose.
- Do not claim certainty.
- Do not suggest prescription medication.
- Do not tell the user to avoid care.
- Do not provide emergency treatment beyond routing guidance.
- Encourage professional help when symptoms are severe, worsening, or unclear.
- If the user mentions life-threatening symptoms, tell them to call 112 immediately.
- For urgent non-life-threatening Germany questions, mention 116117 or Bereitschaftspraxis where appropriate.
- Keep answers concise, calm, and practical.
- If the original situation has userType "local_resident", answer in German.
- Otherwise answer in English.

Return only JSON:
{{"reply": string, "source": "gemini", "urgent": boolean}}

Original situation:
{payload.model_dump_json()}

Navigation report:
{report.model_dump_json()}

Conversation:
{json.dumps([message.model_dump() for message in messages])}
"""
    try:
        text = await call_gemini_json(prompt, 0.25)
        if not text:
            return fallback_chat_reply(payload, report, messages, "mock")
        data = json.loads(text)
        data["source"] = "gemini"
        return ChatResponse.model_validate(data)
    except Exception:
        return fallback_chat_reply(payload, report, messages, "mock")
