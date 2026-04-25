import { z } from "zod";

export const navigateRequestSchema = z.object({
  country: z.literal("Germany"),
  concern: z.string().min(8, "Tell us a little more about the concern."),
  duration: z.string().min(1, "Choose a duration."),
  severity: z.coerce.number().min(1).max(10),
  symptoms: z.array(z.string()).default([]),
  languagePreference: z.enum(["english", "german_phrase"]).default("german_phrase"),
  userType: z
    .enum([
      "international_student",
      "tourist",
      "migrant_new_resident",
      "local_resident",
    ])
    .default("international_student"),
  tried: z.string().optional().default(""),
  severeConcern: z.boolean().optional().default(false),
});

export const navigationResultSchema = z.object({
  riskLevel: z.enum([
    "emergency",
    "urgent",
    "routine",
    "self_care_or_pharmacy",
    "administrative",
  ]),
  recommendedRoute: z.string(),
  reasoning: z.string(),
  urgentWarningSigns: z.array(z.string()),
  localTerms: z.array(z.object({ term: z.string(), meaning: z.string() })),
  documentsToBring: z.array(z.string()),
  doctorSummary: z.object({
    mainConcern: z.string(),
    duration: z.string(),
    severity: z.string(),
    keySymptoms: z.array(z.string()),
    whatToSay: z.string(),
    questionsToAsk: z.array(z.string()),
  }),
  localLanguagePhrase: z.object({
    language: z.string(),
    phrase: z.string(),
    meaning: z.string(),
  }),
  nextStep: z.string(),
  disclaimer: z.string(),
  source: z.enum(["rules", "gemini", "mock", "fastapi"]).default("mock"),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(1600),
});

export const chatRequestSchema = z.object({
  situation: navigateRequestSchema,
  report: navigationResultSchema,
  messages: z.array(chatMessageSchema).min(1).max(12),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
  source: z.enum(["rules", "gemini", "mock", "fastapi"]),
  urgent: z.boolean(),
});
