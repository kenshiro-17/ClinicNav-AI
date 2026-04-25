export type RiskLevel =
  | "emergency"
  | "urgent"
  | "routine"
  | "self_care_or_pharmacy"
  | "administrative";

export type UserType =
  | "international_student"
  | "tourist"
  | "migrant_new_resident"
  | "local_resident";

export type NavigateRequest = {
  country: "Germany";
  concern: string;
  duration: string;
  severity: number;
  symptoms: string[];
  languagePreference: "english" | "german_phrase";
  userType: UserType;
  tried?: string;
  severeConcern?: boolean;
};

export type LocalTerm = {
  term: string;
  meaning: string;
};

export type NavigationResult = {
  riskLevel: RiskLevel;
  recommendedRoute: string;
  reasoning: string;
  urgentWarningSigns: string[];
  localTerms: LocalTerm[];
  documentsToBring: string[];
  doctorSummary: {
    mainConcern: string;
    duration: string;
    severity: string;
    keySymptoms: string[];
    whatToSay: string;
    questionsToAsk: string[];
  };
  localLanguagePhrase: {
    language: string;
    phrase: string;
    meaning: string;
  };
  nextStep: string;
  disclaimer: string;
  source: "rules" | "gemini" | "mock" | "fastapi";
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  situation: NavigateRequest;
  report: NavigationResult;
  messages: ChatMessage[];
};

export type ChatResponse = {
  reply: string;
  source: "rules" | "gemini" | "mock" | "fastapi";
  urgent: boolean;
};
