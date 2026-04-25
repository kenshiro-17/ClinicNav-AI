import re

from app.schemas import NavigateRequest, NavigationResult, RiskLevel

DISCLAIMER = (
    "ClinicNav AI does not provide diagnosis or medical advice. It helps you navigate care options. "
    "If symptoms are severe, worsening, or life-threatening, call emergency services immediately."
)

GERMANY_TERMS = [
    {"term": "Hausarzt", "meaning": "General practitioner or family doctor, often the first routine contact."},
    {"term": "Facharzt", "meaning": "Specialist doctor."},
    {"term": "Hautarzt", "meaning": "Dermatologist."},
    {"term": "Apotheke", "meaning": "Pharmacy."},
    {"term": "Notaufnahme", "meaning": "Emergency room."},
    {"term": "Bereitschaftspraxis", "meaning": "Out-of-hours/on-call medical practice."},
    {"term": "116117", "meaning": "Medical on-call service for urgent issues that are not life-threatening."},
    {"term": "112", "meaning": "Emergency number for life-threatening emergencies."},
]

EMERGENCY_PATTERNS = [
    r"can't breathe|cannot breathe|breathing difficulty|shortness of breath",
    r"chest pain|pressure in my chest",
    r"severe bleeding|bleeding heavily",
    r"fainting|passed out|loss of consciousness",
    r"stroke|face droop|slurred speech",
    r"suicidal|kill myself|self-harm|self harm",
    r"vomiting blood|throwing up blood",
    r"black stool|black stools",
    r"severe allergic reaction|swollen throat|throat swelling",
    r"sudden weakness|confusion",
    r"worst headache|sudden severe headache",
    r"severe abdominal pain|unbearable stomach pain",
]

URGENT_PATTERNS = [
    r"fever",
    r"worsening",
    r"repeated vomiting|can't keep fluids|cannot keep fluids",
    r"lower-right abdominal pain|right lower abdomen",
    r"severe pain",
    r"infection|pus|spreading redness",
    r"dental swelling|swollen face",
]


def combined_text(payload: NavigateRequest) -> str:
    return " ".join([payload.concern, payload.duration, " ".join(payload.symptoms), payload.tried or ""])


def detect_risk(payload: NavigateRequest) -> RiskLevel:
    text = combined_text(payload)
    if payload.severeConcern:
        return "emergency"
    if payload.severity >= 9 or any(re.search(pattern, text, re.I) for pattern in EMERGENCY_PATTERNS):
        return "emergency"
    if payload.severity >= 7 or any(re.search(pattern, text, re.I) for pattern in URGENT_PATTERNS):
        return "urgent"
    if re.search(r"insurance|card|krankenkasse|bill|coverage|paperwork", text, re.I):
        return "administrative"
    if payload.severity <= 3 and re.search(r"cold|minor|mild|cough|sore throat", text, re.I):
        return "self_care_or_pharmacy"
    return "routine"


def german_phrase(payload: NavigateRequest) -> str:
    text = payload.concern.lower()
    if any(word in text for word in ["tooth", "teeth", "dental", "dentist", "gum"]):
        return f"Ich habe Zahnschmerzen. Die Schmerzen bestehen seit {payload.duration}. Ich brauche zahnärztlichen Rat."
    if any(word in text for word in ["rash", "skin", "itch", "mole"]):
        return f"Ich habe Hautbeschwerden seit {payload.duration}. Können Sie mir sagen, ob ich zum Hautarzt gehen sollte?"
    return f"Ich habe seit {payload.duration} Beschwerden. Ich möchte ärztlichen Rat."


def route_for(payload: NavigateRequest, risk: RiskLevel) -> str:
    text = payload.concern.lower()
    if risk == "emergency":
        return "Emergency: call 112 now or go to the nearest Notaufnahme."
    if risk == "urgent":
        return "Urgent non-emergency: call 116117 or visit a Bereitschaftspraxis, especially out of hours."
    if any(word in text for word in ["tooth", "teeth", "dental", "dentist", "gum"]):
        return "Dentist: contact a Zahnarzt. Use 116117 if pain is urgent and you cannot find care."
    if risk == "administrative":
        return "Insurance or administrative help: contact your Krankenkasse, university international office, or clinic registration desk."
    if risk == "self_care_or_pharmacy":
        return "Pharmacy route: ask an Apotheke for guidance, and contact a Hausarzt if symptoms persist or worsen."
    return "General doctor: book a Hausarzt appointment. Call 116117 if you are unsure or need out-of-hours care."


def fallback_result(payload: NavigateRequest, source: str = "mock") -> NavigationResult:
    risk = detect_risk(payload)
    newcomer_docs = ["Student ID, if relevant", "Insurance confirmation if the physical card has not arrived"]
    documents = [
        "Health insurance card / Gesundheitskarte",
        "Passport, ID card, or residence permit",
        "Medication list and dosage information",
        "Allergy information",
        "Previous reports or test results, if available",
    ]
    if payload.userType in ["international_student", "migrant_new_resident"]:
        documents.extend(newcomer_docs)

    return NavigationResult(
        riskLevel=risk,
        recommendedRoute=route_for(payload, risk),
        reasoning="Deterministic safety rules run first, then the app explains the safest Germany-specific navigation path without diagnosis.",
        urgentWarningSigns=[
            "Chest pain, breathing difficulty, fainting, or sudden confusion",
            "Severe or rapidly worsening pain",
            "Vomiting blood, black stool, or severe bleeding",
            "Severe allergic reaction, swollen throat, or trouble breathing",
            "Suicidal thoughts or immediate self-harm risk",
        ],
        localTerms=GERMANY_TERMS[:7],
        documentsToBring=documents,
        doctorSummary={
            "mainConcern": payload.concern,
            "duration": payload.duration,
            "severity": f"{payload.severity}/10",
            "keySymptoms": payload.symptoms or ["No checklist symptoms selected"],
            "whatToSay": german_phrase(payload),
            "questionsToAsk": [
                "Does this need urgent examination?",
                "Should I see a specialist or start with a Hausarzt?",
                "What warning signs mean I should call 112 or 116117?",
            ],
        },
        localLanguagePhrase={
            "language": "German",
            "phrase": german_phrase(payload),
            "meaning": "A simple phrase to describe the concern and ask for medical guidance.",
        },
        nextStep="Call 112 for life-threatening symptoms. Otherwise, use the recommended route and bring the listed documents.",
        disclaimer=DISCLAIMER,
        source=source,
    )
