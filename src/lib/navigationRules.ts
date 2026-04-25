import type { NavigateRequest, NavigationResult, RiskLevel } from "@/types";
import { commonDocuments, germanyGlossary, newcomerDocuments, safetyDisclaimer } from "./countryData";

const emergencyPatterns = [
  /can't breathe|cannot breathe|breathing difficulty|shortness of breath/i,
  /chest pain|pressure in my chest/i,
  /severe bleeding|bleeding heavily/i,
  /fainting|passed out|loss of consciousness/i,
  /stroke|face droop|slurred speech/i,
  /suicidal|kill myself|self-harm|self harm/i,
  /vomiting blood|throwing up blood/i,
  /black stool|black stools/i,
  /severe allergic reaction|swollen throat|throat swelling/i,
  /sudden weakness|confusion/i,
  /worst headache|sudden severe headache/i,
  /severe abdominal pain|unbearable stomach pain/i,
];

const urgentPatterns = [
  /fever/i,
  /worsening/i,
  /repeated vomiting|can't keep fluids|cannot keep fluids/i,
  /lower-right abdominal pain|right lower abdomen/i,
  /severe pain/i,
  /infection|pus|spreading redness/i,
  /dental swelling|swollen face/i,
];

function joinedInput(input: NavigateRequest) {
  return [input.concern, input.duration, input.symptoms.join(" "), input.tried ?? ""].join(" ");
}

export function detectRisk(input: NavigateRequest): { riskLevel: RiskLevel; matches: string[] } {
  const text = joinedInput(input);
  if (input.severeConcern) {
    return { riskLevel: "emergency", matches: ["user marked the situation as severe or life-threatening"] };
  }

  const emergencyMatches = emergencyPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source.replaceAll("\\", ""));

  if (emergencyMatches.length > 0 || input.severity >= 9) {
    return { riskLevel: "emergency", matches: emergencyMatches };
  }

  const urgentMatches = urgentPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.source.replaceAll("\\", ""));

  if (urgentMatches.length > 0 || input.severity >= 7) {
    return { riskLevel: "urgent", matches: urgentMatches };
  }

  if (/insurance|card|krankenkasse|bill|coverage|appointment paperwork/i.test(text)) {
    return { riskLevel: "administrative", matches: ["administrative help"] };
  }

  if (/rash|skin|itch|acne|mole/i.test(text)) {
    return { riskLevel: "routine", matches: ["skin concern"] };
  }

  if (/tooth|teeth|dental|dentist|gum/i.test(text)) {
    return { riskLevel: "routine", matches: ["dental concern"] };
  }

  if (/sad|anxiety|panic|mental|depressed|therapy/i.test(text)) {
    return { riskLevel: "urgent", matches: ["mental health support"] };
  }

  if (input.severity <= 3 && /cold|minor|mild|cough|sore throat/i.test(text)) {
    return { riskLevel: "self_care_or_pharmacy", matches: ["mild pharmacy-suitable concern"] };
  }

  return { riskLevel: "routine", matches: ["routine medical navigation"] };
}

function routeFor(input: NavigateRequest, riskLevel: RiskLevel) {
  const text = joinedInput(input);
  const german = input.userType === "local_resident";

  if (riskLevel === "emergency") return german ? "Notfall: Rufen Sie jetzt 112 an oder gehen Sie in die nächste Notaufnahme." : "Emergency: call 112 now or go to the nearest Notaufnahme.";
  if (riskLevel === "urgent") return german ? "Dringend, aber nicht lebensbedrohlich: Rufen Sie 116117 an oder nutzen Sie eine Bereitschaftspraxis." : "Urgent non-emergency: call 116117 or visit a Bereitschaftspraxis, especially out of hours.";
  if (/tooth|teeth|dental|dentist|gum/i.test(text)) return german ? "Zahnarzt: Kontaktieren Sie eine Zahnarztpraxis. Bei akuten Beschwerden außerhalb der Zeiten kann 116117 helfen." : "Dentist: contact a Zahnarzt. Use 116117 if pain is urgent and you cannot find care.";
  if (/rash|skin|itch|acne|mole/i.test(text)) return german ? "Facharztweg: Starten Sie beim Hausarzt oder buchen Sie, wenn möglich, direkt einen Termin beim Hautarzt." : "Specialist route: start with a Hausarzt or book a Hautarzt if available.";
  if (riskLevel === "administrative") return german ? "Administrative Hilfe: Kontaktieren Sie Krankenkasse, Praxisanmeldung oder zuständige Stelle." : "Insurance or administrative help: contact your Krankenkasse, university international office, or clinic registration desk.";
  if (riskLevel === "self_care_or_pharmacy") return german ? "Apotheke: Fragen Sie in einer Apotheke nach Einschätzung. Bei anhaltenden oder schlimmeren Beschwerden zum Hausarzt." : "Pharmacy route: ask an Apotheke for guidance, and contact a Hausarzt if symptoms persist or worsen.";
  return german ? "Hausarzt: Vereinbaren Sie einen Termin. Bei Unsicherheit oder außerhalb der Sprechzeiten kann 116117 helfen." : "General doctor: book a Hausarzt appointment. Call 116117 if you are unsure or need out-of-hours care.";
}

function germanPhrase(input: NavigateRequest) {
  const concern = input.concern.toLowerCase();
  if (/tooth|teeth|dental|dentist|gum/.test(concern)) {
    return "Ich habe Zahnschmerzen. Die Schmerzen bestehen seit " + input.duration + ". Ich brauche zahnärztlichen Rat.";
  }
  if (/rash|skin|itch|acne|mole/.test(concern)) {
    return "Ich habe Hautbeschwerden seit " + input.duration + ". Können Sie mir sagen, ob ich zum Hautarzt gehen sollte?";
  }
  if (/anxiety|mental|sad|depressed|panic/.test(concern)) {
    return "Ich brauche Unterstützung wegen psychischer Belastung. Können Sie mir sagen, an wen ich mich wenden kann?";
  }
  return "Ich habe seit " + input.duration + " Bauchschmerzen. Die Schmerzen sind mittelstark. Ich möchte ärztlichen Rat.";
}

export function buildNavigationResult(input: NavigateRequest, source: NavigationResult["source"] = "mock"): NavigationResult {
  const { riskLevel } = detectRisk(input);
  const german = input.userType === "local_resident";
  const isNewcomer = input.userType === "international_student" || input.userType === "migrant_new_resident";
  const documents = isNewcomer ? [...commonDocuments, ...newcomerDocuments] : commonDocuments;
  const route = routeFor(input, riskLevel);

  return {
    riskLevel,
    recommendedRoute: route,
    reasoning:
      german
        ? riskLevel === "emergency"
          ? "Die Angaben enthalten mögliche Warnzeichen. Eine sofortige Notfallabklärung ist der sicherere Weg."
          : "Aus Anliegen, Dauer, Schweregrad und deutschen Versorgungswegen ergibt sich diese Orientierung. Dies ist keine Diagnose."
        : riskLevel === "emergency"
          ? "Your description includes possible warning signs where immediate emergency assessment is the safer route."
          : "Based on the concern, duration, severity, and Germany-specific care pathways, this route helps you reach the right level of care without treating the app as a diagnosis tool.",
    urgentWarningSigns: [
      german ? "Brustschmerzen, Atemnot, Ohnmacht oder plötzliche Verwirrtheit" : "Chest pain, breathing difficulty, fainting, or sudden confusion",
      german ? "Starke oder schnell schlimmer werdende Schmerzen" : "Severe or rapidly worsening pain",
      german ? "Bluterbrechen, schwarzer Stuhl oder starke Blutung" : "Vomiting blood, black stool, or severe bleeding",
      german ? "Schwere allergische Reaktion, geschwollener Hals oder Atemprobleme" : "Severe allergic reaction, swollen throat, or trouble breathing",
      german ? "Akute Selbstgefährdung oder Suizidgedanken" : "Suicidal thoughts or immediate self-harm risk",
    ],
    localTerms: germanyGlossary.slice(0, 7),
    documentsToBring: documents,
    doctorSummary: {
      mainConcern: input.concern,
      duration: input.duration,
      severity: `${input.severity}/10`,
      keySymptoms: input.symptoms.length ? input.symptoms : ["No checklist symptoms selected"],
      whatToSay: germanPhrase(input),
      questionsToAsk: [
        german ? "Muss das dringend untersucht werden?" : "Does this need urgent examination?",
        german ? "Soll ich zum Facharzt oder zuerst zum Hausarzt?" : "Should I see a specialist or start with a Hausarzt?",
        german ? "Bei welchen Warnzeichen soll ich 112 oder 116117 anrufen?" : "What warning signs mean I should call 112 or 116117?",
      ],
    },
    localLanguagePhrase: {
      language: german ? "Deutsch" : "German",
      phrase: germanPhrase(input),
      meaning: german ? "Eine klare Formulierung für das Gespräch mit medizinischem Personal." : "A simple phrase to describe the concern and ask for medical guidance.",
    },
    nextStep:
      german
        ? riskLevel === "emergency"
          ? "Bei lebensbedrohlichen Symptomen sofort 112 anrufen. Nicht auf einen Termin warten."
          : "Zusammenfassung bereithalten, Unterlagen mitnehmen und den empfohlenen Versorgungsweg nutzen. Bei Dringlichkeit ohne Lebensgefahr 116117."
        : riskLevel === "emergency"
          ? "Call 112 immediately if symptoms are life-threatening. Do not wait for an appointment."
          : "Save the summary, bring your documents, and contact the recommended care route. Use 116117 if it is urgent but not life-threatening.",
    disclaimer: german
      ? "CareNav AI stellt keine Diagnose und ersetzt keine medizinische Beratung. Bei schweren, sich verschlechternden oder lebensbedrohlichen Symptomen sofort den Notruf wählen."
      : safetyDisclaimer,
    source,
  };
}
