import type { LocalTerm } from "@/types";

export const safetyDisclaimer =
  "CareNav AI does not provide diagnosis or medical advice. It helps you navigate care options. If symptoms are severe, worsening, or life-threatening, call emergency services immediately.";

export const germanyGlossary: LocalTerm[] = [
  { term: "Hausarzt", meaning: "General practitioner or family doctor, often the first routine contact." },
  { term: "Facharzt", meaning: "Specialist doctor, such as cardiologist, orthopedist, or neurologist." },
  { term: "Hautarzt", meaning: "Dermatologist for skin, hair, and nail concerns." },
  { term: "Apotheke", meaning: "Pharmacy for non-prescription advice and medication pickup." },
  { term: "Notaufnahme", meaning: "Emergency room for serious or life-threatening problems." },
  { term: "Bereitschaftspraxis", meaning: "Out-of-hours/on-call medical practice for urgent non-emergencies." },
  { term: "116117", meaning: "Germany's medical on-call service for urgent issues that are not life-threatening." },
  { term: "112", meaning: "Emergency number for life-threatening emergencies." },
  { term: "Gesundheitskarte", meaning: "Health insurance card, also called Krankenkassenkarte." },
  { term: "Überweisung", meaning: "Referral from one doctor to another, sometimes needed for specialists." },
  { term: "Termin", meaning: "Appointment." },
  { term: "Krankschreibung", meaning: "Sick note or certificate for work or university." },
];

export const commonDocuments = [
  "Health insurance card / Gesundheitskarte",
  "Passport, ID card, or residence permit",
  "Medication list and dosage information",
  "Allergy information",
  "Previous reports or test results, if available",
];

export const newcomerDocuments = [
  "Student ID, if relevant",
  "Insurance confirmation if the physical card has not arrived",
  "Residence permit or registration document, if applicable",
];
