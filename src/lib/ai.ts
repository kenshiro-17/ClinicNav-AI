import type { ChatMessage, ChatResponse, NavigateRequest, NavigationResult } from "@/types";
import { buildNavigationResult, detectRisk } from "./navigationRules";
import { chatResponseSchema, navigationResultSchema } from "./schemas";

const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function hasUsableKey(key: string | undefined) {
  return Boolean(key && key.trim() && !key.includes("replace_with"));
}

function clinicNavPrompt(input: NavigateRequest) {
  return `
You are CareNav AI, a healthcare navigation assistant for Germany.

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
{
  "riskLevel": "emergency" | "urgent" | "routine" | "self_care_or_pharmacy" | "administrative",
  "recommendedRoute": string,
  "reasoning": string,
  "urgentWarningSigns": string[],
  "localTerms": [{"term": string, "meaning": string}],
  "documentsToBring": string[],
  "doctorSummary": {
    "mainConcern": string,
    "duration": string,
    "severity": string,
    "keySymptoms": string[],
    "whatToSay": string,
    "questionsToAsk": string[]
  },
  "localLanguagePhrase": {"language": string, "phrase": string, "meaning": string},
  "nextStep": string,
  "disclaimer": string,
  "source": "gemini"
}

Germany facts:
- 112 is for life-threatening emergencies.
- 116117 is the medical on-call service for urgent non-life-threatening care.
- Common terms: Hausarzt, Facharzt, Hautarzt, Apotheke, Notaufnahme, Bereitschaftspraxis, Gesundheitskarte.

User input:
${JSON.stringify(input)}
`;
}

export async function generateWithGemini(input: NavigateRequest): Promise<NavigationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!hasUsableKey(apiKey)) {
    return buildNavigationResult(input, "mock");
  }

  try {
    const text = await callGeminiJson(clinicNavPrompt(input), 0.2);
    if (typeof text !== "string") {
      return buildNavigationResult(input, "mock");
    }

    const data = JSON.parse(text);
    const valid = navigationResultSchema.safeParse({ ...data, source: "gemini" });
    return valid.success ? valid.data : buildNavigationResult(input, "mock");
  } catch {
    return buildNavigationResult(input, "mock");
  }
}

async function callGeminiJson(prompt: string, temperature: number): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!hasUsableKey(apiKey)) return null;

  const models = [process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];

  for (const model of [...new Set(models)]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature,
          },
        }),
        cache: "no-store",
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string") return text;
    } catch {
      continue;
    }
  }

  return null;
}

function latestUserMessage(messages: ChatMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function chatPrompt(situation: NavigateRequest, report: NavigationResult, messages: ChatMessage[]) {
  return `
You are CareNav AI's follow-up chat assistant.

The user already received a healthcare navigation report. Your job is to help them understand the report, prepare for the recommended care route, clarify German healthcare terms, refine what to say, and identify whether a new warning sign means urgent escalation.

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
{
  "reply": string,
  "source": "gemini",
  "urgent": boolean
}

Original situation:
${JSON.stringify(situation)}

Navigation report:
${JSON.stringify(report)}

Conversation:
${JSON.stringify(messages)}
`;
}

function fallbackChatReply(situation: NavigateRequest, report: NavigationResult, messages: ChatMessage[], source: ChatResponse["source"] = "mock"): ChatResponse {
  const userText = latestUserMessage(messages);
  const risk = detectRisk({ ...situation, concern: `${situation.concern}\n${userText}` });

  if (risk.riskLevel === "emergency") {
    return {
      reply:
        "Your new message includes possible emergency warning signs. If symptoms are severe, worsening, or life-threatening, call 112 immediately or go to the nearest Notaufnahme. CareNav AI cannot assess emergencies through chat.",
      source: "rules",
      urgent: true,
    };
  }

  return {
    reply: `Based on your report, the safest next step is: ${report.nextStep} Bring your Gesundheitskarte or insurance confirmation, ID, medication list, and allergy information. If symptoms worsen or you feel unsure outside normal hours, call 116117. This is not medical advice or a diagnosis.`,
    source,
    urgent: false,
  };
}

export async function generateChatWithGemini(
  situation: NavigateRequest,
  report: NavigationResult,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const userText = latestUserMessage(messages);
  const risk = detectRisk({ ...situation, concern: `${situation.concern}\n${userText}` });
  if (risk.riskLevel === "emergency") {
    return fallbackChatReply(situation, report, messages, "rules");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!hasUsableKey(apiKey)) {
    return fallbackChatReply(situation, report, messages, "mock");
  }

  try {
    const text = await callGeminiJson(chatPrompt(situation, report, messages), 0.25);
    if (typeof text !== "string") return fallbackChatReply(situation, report, messages, "mock");

    const valid = chatResponseSchema.safeParse({ ...JSON.parse(text), source: "gemini" });
    return valid.success ? valid.data : fallbackChatReply(situation, report, messages, "mock");
  } catch {
    return fallbackChatReply(situation, report, messages, "mock");
  }
}
