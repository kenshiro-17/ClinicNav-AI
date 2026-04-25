export type LanguageCode = "en" | "de";

type HomeText = {
  nav: {
    overview: string;
    flow: string;
    stories: string;
    checkIn: string;
    result: string;
    glossary: string;
    roadmap: string;
  };
  mobile: {
    top: string;
    flow: string;
    checkIn: string;
    result: string;
    terms: string;
    viewResult: string;
    startCheckIn: string;
    trySample: string;
  };
  languageLabel: string;
  shield: string;
  routeErrorFallback: string;
  routeErrorGeneric: string;
  retry: string;
};

type ChatText = {
  starters: string[];
};

type HeroText = {
  badge: string;
  title: string;
  subtitle: string;
  chips: string[];
  ctaStart: string;
  ctaSample: string;
  panelTitle: string;
  panelUrgentLead: string;
  panelUrgentAction: string;
  panelEmergencyLead: string;
  panelEmergencyAction: string;
  panelPhraseReady: string;
  panelNextReady: string;
};

type ResultText = {
  kicker: string;
  title: string;
  exportPdf: string;
  statRisk: string;
  statRoute: string;
  statLanguage: string;
  statExport: string;
  statExportValue: string;
  routeHeading: string;
  warningHeading: string;
  summaryHeading: string;
  summaryConcern: string;
  summaryDuration: string;
  summarySeverity: string;
  copySummary: string;
  phraseHeading: string;
  copyPhrase: string;
  bringHeading: string;
  nextStepHeading: string;
  questionsHeading: string;
  summaryLineConcern: string;
  summaryLineDuration: string;
  summaryLineSeverity: string;
  summaryLineRoute: string;
  summaryLineSymptoms: string;
  summaryLineSay: string;
  summaryLineQuestions: string;
  emergencyCall: string;
};

type CheckInText = {
  kicker: string;
  title: string;
  subtitle: string;
  exampleLabel: string;
  exampleBody: string;
  country: string;
  profile: string;
  concern: string;
  concernPlaceholder: string;
  concernError: string;
  concernHint: string;
  duration: string;
  severity: string;
  symptoms: string;
  symptomOptions: Array<{ value: string; label: string }>;
  languageSupport: string;
  languageGerman: string;
  languageEnglish: string;
  tried: string;
  emergencyLabel: string;
  emergencyBody: string;
  submit: string;
  sample: string;
};

export const uiText: Record<LanguageCode, { home: HomeText; chat: ChatText; hero: HeroText; result: ResultText; checkIn: CheckInText }> = {
  en: {
    home: {
      nav: {
        overview: "Overview",
        flow: "How it works",
        stories: "Story cards",
        checkIn: "Start",
        result: "Result",
        glossary: "Glossary",
        roadmap: "Roadmap",
      },
      mobile: {
        top: "Top",
        flow: "Flow",
        checkIn: "Check-in",
        result: "Result",
        terms: "Terms",
        viewResult: "View result",
        startCheckIn: "Start check-in",
        trySample: "Try sample",
      },
      languageLabel: "Language",
      shield: "Navigation, not diagnosis",
      routeErrorFallback: "We could not process your request right now.",
      routeErrorGeneric: "Something went wrong.",
      retry: "Retry",
    },
    chat: {
      starters: [
        "What should I do first?",
        "What should I say when I call?",
        "What documents matter most?",
        "When should I call 112 instead?",
      ],
    },
    hero: {
      badge: "Germany-first healthcare navigation for newcomers",
      title: "Healthcare, made navigable.",
      subtitle: "Know where to go, what to bring, and what to say when the healthcare system feels unfamiliar.",
      chips: ["112 escalation", "116117 guidance", "German phrases"],
      ctaStart: "Start navigation",
      ctaSample: "Try dental pain scenario",
      panelTitle: "Recommended route",
      panelUrgentLead: "For urgent non-life-threatening concerns",
      panelUrgentAction: "Call 116117 or visit a Bereitschaftspraxis",
      panelEmergencyLead: "Life-threatening symptoms",
      panelEmergencyAction: "Call 112 immediately",
      panelPhraseReady: "German phrase ready",
      panelNextReady: "Doctor summary ready",
    },
    result: {
      kicker: "Care route",
      title: "Your navigation result",
      exportPdf: "Export as PDF",
      statRisk: "Risk level",
      statRoute: "Route",
      statLanguage: "Language",
      statExport: "Export",
      statExportValue: "PDF + copy",
      routeHeading: "Recommended care route",
      warningHeading: "Urgent warning signs",
      summaryHeading: "Doctor-ready summary",
      summaryConcern: "Concern",
      summaryDuration: "Duration",
      summarySeverity: "Severity",
      copySummary: "Copy summary",
      phraseHeading: "What to say in German",
      copyPhrase: "Copy phrase",
      bringHeading: "What to bring",
      nextStepHeading: "Suggested next step",
      questionsHeading: "Questions to ask",
      summaryLineConcern: "Main concern",
      summaryLineDuration: "Duration",
      summaryLineSeverity: "Severity",
      summaryLineRoute: "Recommended route",
      summaryLineSymptoms: "Key symptoms",
      summaryLineSay: "What to say",
      summaryLineQuestions: "Questions",
      emergencyCall: "Call 112",
    },
    checkIn: {
      kicker: "Navigation check-in",
      title: "Tell CareNav what is happening.",
      subtitle: "The app routes first, explains second. Emergency warning signs override AI output and send the user toward 112 or urgent help.",
      exampleLabel: "Example scenario:",
      exampleBody: "prefill a realistic case to see the full care route, summary, phrase, and follow-up support.",
      country: "Country",
      profile: "User type",
      concern: "Health concern",
      concernPlaceholder: "Example: I have dental pain and I do not know whether to go to a dentist, Apotheke, Hausarzt, or emergency room.",
      concernError: "Please describe the concern with at least 8 characters.",
      concernHint: "Short and specific details improve routing quality.",
      duration: "Duration",
      severity: "Severity",
      symptoms: "Symptoms checklist",
      symptomOptions: [
        { value: "Pain", label: "Pain" },
        { value: "Fever", label: "Fever" },
        { value: "Swelling", label: "Swelling" },
        { value: "Repeated vomiting", label: "Repeated vomiting" },
        { value: "Bleeding", label: "Bleeding" },
        { value: "Dizziness", label: "Dizziness" },
        { value: "Anxiety or panic", label: "Anxiety or panic" },
        { value: "Rash or itching", label: "Rash or itching" },
      ],
      languageSupport: "Language support",
      languageGerman: "English + German phrases",
      languageEnglish: "English only",
      tried: "What have you tried?",
      emergencyLabel: "Possible emergency:",
      emergencyBody: "This feels severe, rapidly worsening, or life-threatening.",
      submit: "Find my care route",
      sample: "Use example",
    },
  },
  de: {
    home: {
      nav: {
        overview: "Uberblick",
        flow: "Ablauf",
        stories: "Szenarien",
        checkIn: "Start",
        result: "Ergebnis",
        glossary: "Glossar",
        roadmap: "Roadmap",
      },
      mobile: {
        top: "Start",
        flow: "Ablauf",
        checkIn: "Eingabe",
        result: "Ergebnis",
        terms: "Glossar",
        viewResult: "Ergebnis ansehen",
        startCheckIn: "Navigation starten",
        trySample: "Beispiel nutzen",
      },
      languageLabel: "Sprache",
      shield: "Orientierung, keine Diagnose",
      routeErrorFallback: "Die Anfrage konnte gerade nicht verarbeitet werden.",
      routeErrorGeneric: "Etwas ist schiefgelaufen.",
      retry: "Erneut versuchen",
    },
    chat: {
      starters: [
        "Was sollte ich zuerst tun?",
        "Was sollte ich am Telefon sagen?",
        "Welche Unterlagen sind am wichtigsten?",
        "Wann sollte ich stattdessen 112 anrufen?",
      ],
    },
    hero: {
      badge: "Gesundheitsnavigation fuer Deutschland",
      title: "Gesundheitsversorgung, verstaendlich gemacht.",
      subtitle: "Verstehen Sie, wohin Sie gehen sollten, was Sie mitbringen und wie Sie Ihr Anliegen klar beschreiben.",
      chips: ["112 bei Notfaellen", "116117 bei Dringlichkeit", "Terminvorbereitung"],
      ctaStart: "Navigation starten",
      ctaSample: "Zahnschmerz-Beispiel",
      panelTitle: "Empfohlener Weg",
      panelUrgentLead: "Dringend, aber nicht lebensbedrohlich",
      panelUrgentAction: "116117 anrufen oder Bereitschaftspraxis nutzen",
      panelEmergencyLead: "Lebensbedrohliche Symptome",
      panelEmergencyAction: "Sofort 112 anrufen",
      panelPhraseReady: "Zusammenfassung bereit",
      panelNextReady: "Naechster Schritt bereit",
    },
    result: {
      kicker: "Versorgungsweg",
      title: "Ihre Empfehlung",
      exportPdf: "Als PDF exportieren",
      statRisk: "Einschaetzung",
      statRoute: "Weg",
      statLanguage: "Sprache",
      statExport: "Export",
      statExportValue: "PDF + Kopie",
      routeHeading: "Empfohlener Versorgungsweg",
      warningHeading: "Warnzeichen",
      summaryHeading: "Zusammenfassung",
      summaryConcern: "Anliegen",
      summaryDuration: "Dauer",
      summarySeverity: "Schweregrad",
      copySummary: "Kopieren",
      phraseHeading: "Formulierung",
      copyPhrase: "Text kopieren",
      bringHeading: "Mitbringen",
      nextStepHeading: "Naechster Schritt",
      questionsHeading: "Fragen fuer den Termin",
      summaryLineConcern: "Anliegen",
      summaryLineDuration: "Dauer",
      summaryLineSeverity: "Schweregrad",
      summaryLineRoute: "Empfohlener Weg",
      summaryLineSymptoms: "Wichtige Symptome",
      summaryLineSay: "Formulierung",
      summaryLineQuestions: "Fragen",
      emergencyCall: "112 anrufen",
    },
    checkIn: {
      kicker: "Navigation",
      title: "Beschreiben Sie kurz, was passiert ist.",
      subtitle: "Die App hilft bei der Orientierung im Versorgungssystem. Warnzeichen fuer Notfaelle haben immer Vorrang.",
      exampleLabel: "Beispiel:",
      exampleBody: "Nutzen Sie ein realistisches Beispiel, um Route, Zusammenfassung und naechste Schritte zu sehen.",
      country: "Land",
      profile: "Profil",
      concern: "Anliegen",
      concernPlaceholder: "Beispiel: Ich habe Zahnschmerzen und weiss nicht, ob ich zum Zahnarzt, in die Apotheke oder in die Notaufnahme soll.",
      concernError: "Bitte beschreiben Sie das Anliegen etwas genauer (mindestens 8 Zeichen).",
      concernHint: "Kurz und konkret hilft bei einer besseren Einordnung.",
      duration: "Dauer",
      severity: "Schweregrad",
      symptoms: "Symptome",
      symptomOptions: [
        { value: "Pain", label: "Schmerzen" },
        { value: "Fever", label: "Fieber" },
        { value: "Swelling", label: "Schwellung" },
        { value: "Repeated vomiting", label: "Wiederholtes Erbrechen" },
        { value: "Bleeding", label: "Blutung" },
        { value: "Dizziness", label: "Schwindel" },
        { value: "Anxiety or panic", label: "Angst oder Panik" },
        { value: "Rash or itching", label: "Ausschlag oder Juckreiz" },
      ],
      languageSupport: "Sprache",
      languageGerman: "Deutsch",
      languageEnglish: "Englisch",
      tried: "Was wurde bereits versucht?",
      emergencyLabel: "Moeglicher Notfall:",
      emergencyBody: "Die Situation fuehlt sich schwer, schnell schlechter oder lebensbedrohlich an.",
      submit: "Versorgungsweg finden",
      sample: "Beispiel nutzen",
    },
  },
};
