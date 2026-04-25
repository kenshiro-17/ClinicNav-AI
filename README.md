# CareNav AI

CareNav AI helps international students, migrants, tourists, and newcomers understand where to go, what to bring, and what to say when navigating an unfamiliar healthcare system.

## Problem Statement

Newcomers in Germany often do not know whether to go to an Apotheke, Hausarzt, Facharzt, Notaufnahme, 116117, 112, or an insurance office. Language barriers and unfamiliar documents make routine care feel urgent and urgent care feel confusing.

## Solution

CareNav AI is a safe healthcare navigation assistant. It does not diagnose. It routes users to the right type of care, explains local healthcare terms, creates a doctor-ready summary, suggests documents to bring, and generates simple German phrases.

## Target Users

- International students
- Migrants and new residents
- Tourists
- People with language barriers
- Anyone trying to understand the German healthcare pathway

## Features

- Germany-first care-route recommendation
- Deterministic red-flag safety routing before AI
- Gemini API integration in the FastAPI backend
- Mock/rule-based fallback when the API key or backend is unavailable
- German healthcare glossary
- Doctor-ready summary
- German phrase generator
- Document checklist
- PDF export through browser print-to-PDF
- One-click demo scenario

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic
- AI: Gemini API with rule-based fallback
- Database-ready path: PostgreSQL with Prisma schema
- Deployment target: Vercel for the frontend, any Python host for FastAPI

## Safety Approach

CareNav AI does not provide diagnosis or medical advice. It helps users navigate care options. Severe or life-threatening red flags force emergency guidance before any AI generation. For Germany, the app uses local static data that states 112 is for life-threatening emergencies and 116117 is the medical on-call service for urgent non-life-threatening care.

## Run Locally

Install frontend dependencies:

```bash
npm install
```

Start the Next.js app:

```bash
npm run dev
```

Optional FastAPI backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then set `FASTAPI_URL=http://localhost:8000` in `.env.local`.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
FASTAPI_URL=http://localhost:8000
GEMINI_API_KEY=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/carenav_ai
```

The app still works without `GEMINI_API_KEY` by using deterministic rules and mock responses.

## Demo Scenario

Country: Germany

User type: International student

Concern: "I have dental pain in Germany. My cheek feels a bit swollen and I do not know whether to go to a dentist, Hausarzt, Apotheke, or emergency room."

Expected result:

- Recommended route: dentist or 116117 if urgent/out of hours
- Urgent signs: severe swelling, fever, breathing difficulty, rapidly worsening pain
- German phrase for dental pain
- Documents: health insurance card, ID, medication list, allergy information
- Doctor-ready summary and PDF export

## Future Improvements

- Maps integration
- Appointment booking
- richer PDF export
- multilingual support
- multiple country healthcare systems
- insurance-specific guidance
- caregiver mode
- emergency contact card
- offline mode
- verified medical institution data
- integration with 116117 doctor search or appointment services, if appropriate and available

## Judging Criteria Mapping

### Problem & Solution
CareNav AI solves the confusion newcomers face when navigating unfamiliar healthcare systems.

### Technical Execution
The app uses structured input, deterministic safety routing, optional AI-generated guidance, and clean reusable components.

### Innovation & Creativity
Unlike symptom checkers, CareNav AI does not diagnose. It acts as “Google Maps for healthcare systems.”

### Impact & Potential
The app can support international students, migrants, tourists, and people with language barriers.

### Presentation
The app includes a polished demo flow, sample scenario, clear result cards, and doctor-ready summaries.
