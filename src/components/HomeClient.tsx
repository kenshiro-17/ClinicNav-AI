"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Building2, Globe2, HeartPulse, Menu, X, type LucideIcon, ShieldCheck } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { CheckInForm, emptyForm, sampleDentalPain } from "./CheckInForm";
import { EmergencyCallButton } from "./EmergencyCallButton";
import { Glossary } from "./Glossary";
import { Hero } from "./Hero";
import { PhotoStoryCards } from "./PhotoStoryCards";
import { ResultCards } from "./ResultCards";
import { SafetyBanner } from "./SafetyBanner";
import { trackEvent } from "@/lib/analytics";
import { uiText } from "@/lib/uiText";
import type { NavigateRequest, NavigationResult } from "@/types";

const SECTION_IDS = ["overview", "how-it-works", "care-moments", "check-in", "results", "glossary", "roadmap"] as const;

function formSignature(form: NavigateRequest) {
  const normalized = {
    concern: form.concern.trim(),
    duration: form.duration.trim(),
    severity: form.severity,
    symptoms: [...form.symptoms].sort(),
    languagePreference: form.languagePreference,
    userType: form.userType,
    tried: (form.tried ?? "").trim(),
    severeConcern: Boolean(form.severeConcern),
  };

  return JSON.stringify(normalized);
}

export function HomeClient() {
  const [form, setForm] = useState<NavigateRequest>(emptyForm);
  const [language, setLanguage] = useState<"en" | "de">("en");
  const [activeSection, setActiveSection] = useState<(typeof SECTION_IDS)[number]>("overview");
  const [submittedFormSignature, setSubmittedFormSignature] = useState<string | null>(null);
  const [result, setResult] = useState<NavigationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentFormSignature = useMemo(() => formSignature(form), [form]);
  const isResultCurrent = Boolean(result) && submittedFormSignature === currentFormSignature;
  const t = uiText[language].home;
  const navLinks = [
    ["overview", t.nav.overview],
    ["how-it-works", t.nav.flow],
    ["care-moments", t.nav.stories],
    ["check-in", t.nav.checkIn],
    ["results", t.nav.result],
    ["glossary", t.nav.glossary],
    ["roadmap", t.nav.roadmap],
  ] as const;

  function setLanguageAndPersist(nextLanguage: "en" | "de", source: "manual" | "user_type") {
    setLanguage(nextLanguage);
    window.localStorage.setItem("clinicnav-language", nextLanguage);
    trackEvent("language_changed", { language: nextLanguage, source });
  }

  useEffect(() => {
    const persisted = window.localStorage.getItem("clinicnav-language");
    if (persisted === "en" || persisted === "de") {
      setLanguage(persisted);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id as (typeof SECTION_IDS)[number]);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  async function submit(nextForm = form) {
    setError("");
    setIsLoading(true);
    trackEvent("route_submit_started", { has_sample: nextForm.concern === sampleDentalPain.concern });

    try {
      const response = await fetch("/api/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create route.");
      setResult(data);
      setSubmittedFormSignature(formSignature(nextForm));
      trackEvent("route_submit_succeeded", { risk_level: data.riskLevel ?? "unknown" });
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.routeErrorGeneric);
      trackEvent("route_submit_failed", { reason: caught instanceof Error ? caught.message : "unknown" });
    } finally {
      setIsLoading(false);
    }
  }

  function runSample() {
    trackEvent("sample_scenario_used");
    setForm(sampleDentalPain);
    submit(sampleDentalPain);
  }

  function handleFormChange(nextForm: NavigateRequest) {
    const wasLocalResident = form.userType === "local_resident";
    setForm(nextForm);
    if (!wasLocalResident && nextForm.userType === "local_resident") {
      setLanguageAndPersist("de", "user_type");
    }
  }

  const productSignals: [LucideIcon, string, string][] = [
    [Building2, "Institution-ready", "Structured routing and safety guardrails for repeatable workflows."],
    [Globe2, "Expansion-ready", "Country data architecture prepared for additional healthcare systems."],
  ];
  const german = language === "de";
  const showEmergencyButton = Boolean(form.severeConcern) || result?.riskLevel === "emergency";

  return (
    <main className="min-h-screen pb-32 text-slate-950 lg:pb-0">
      <div className="sticky top-0 z-30 border-b border-[#bfa58c] bg-[#f4e2cb]/96 shadow-[0_6px_24px_rgba(76,59,43,0.12)] backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-5 md:px-8">
          <div className="flex items-center gap-3 justify-self-start">
            <div className="pastel-icon flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-ui whitespace-nowrap leading-none font-semibold tracking-tight text-[#332a22]">ClinicNav AI</span>
          </div>
          <nav className="font-ui hidden items-center justify-center gap-1 text-sm font-medium text-[#4f4338] lg:flex">
            {navLinks.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-label={label}
                aria-current={activeSection === id ? "page" : undefined}
                onClick={() => trackEvent("section_jump", { section: id, source: "top_nav_desktop" })}
                className={`nav-pill min-w-0 rounded-xl px-3 py-2 text-center hover:text-[#332a22] ${activeSection === id ? "nav-pill-active bg-[#f3e6d6] text-[#332a22]" : ""}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-self-end gap-2">
            <div className="pastel-chip hidden min-w-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] lg:flex">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="break-safe">{t.shield}</span>
            </div>
            <div className="pastel-chip hidden h-9 items-center gap-1 rounded-full p-1 pr-1.5 text-xs font-semibold lg:flex">
              <span className="px-2 text-[11px] uppercase tracking-[0.08em] text-[#6f6256]">{t.languageLabel}</span>
              {(["en", "de"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguageAndPersist(option, "manual")}
                  aria-pressed={language === option}
                  className={`h-7 rounded-full px-2 transition ${
                    language === option ? "bg-[#6c4f3d] text-white shadow-sm" : "text-[#5d5146] hover:bg-[#fff9ef]"
                  }`}
                >
                  {option === "en" ? "EN" : "DE"}
                </button>
              ))}
            </div>
            {showEmergencyButton ? (
              <div className="hidden lg:block">
                <EmergencyCallButton compact label={german ? "112 anrufen" : "Call 112"} />
              </div>
            ) : null}
            <button
              type="button"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navbar-panel"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => {
                setMobileNavOpen((value) => {
                  const next = !value;
                  trackEvent("mobile_nav_toggled", { open: next });
                  return next;
                });
              }}
              className="pastel-chip inline-flex h-9 w-9 items-center justify-center rounded-full leading-none lg:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div id="mobile-navbar-panel" className="border-t border-[#bfa58c] px-5 pb-4 pt-3 md:px-8">
            <nav className="grid gap-2">
              {navLinks.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={activeSection === id ? "page" : undefined}
                  onClick={() => {
                    trackEvent("section_jump", { section: id, source: "top_nav_mobile" });
                    setMobileNavOpen(false);
                  }}
                  className={`font-ui nav-pill rounded-xl px-3 py-2 text-sm font-medium leading-none text-[#4f4338] hover:text-[#332a22] ${
                    activeSection === id ? "nav-pill-active bg-[#f3e6d6] text-[#332a22]" : ""
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="pastel-chip flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.12em]">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t.shield}
              </div>
              <div className="pastel-chip flex h-9 items-center gap-1 rounded-full p-1 pr-1.5 text-xs font-semibold">
                <span className="px-2 text-[11px] uppercase tracking-[0.08em] text-[#6f6256]">{t.languageLabel}</span>
                {(["en", "de"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLanguageAndPersist(option, "manual")}
                    aria-pressed={language === option}
                    className={`h-7 rounded-full px-2.5 transition ${
                      language === option ? "bg-[#6c4f3d] text-white shadow-sm" : "text-[#5d5146] hover:bg-[#fff9ef]"
                    }`}
                  >
                    {option === "en" ? "English" : "Deutsch"}
                  </button>
                ))}
              </div>
              {showEmergencyButton ? <EmergencyCallButton compact label={german ? "112 anrufen" : "Call 112"} /> : null}
            </div>
          </div>
        ) : null}
      </div>

      <section id="overview">
        <Hero onSample={runSample} german={german} />
      </section>

      <section className="section-rhythm-a border-y border-[#d8c7b5] bg-[#fff9ef]/66">
        <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: "how-it-works",
                title: german ? "Verstehen" : "Understand",
                body: german ? "Ablauf und Sicherheitsregeln" : "Flow and safety guardrails",
              },
              {
                id: "check-in",
                title: german ? "Eingabe" : "Check-in",
                body: german ? "Anliegen und Symptome erfassen" : "Capture concern and symptoms",
              },
              {
                id: "results",
                title: german ? "Ergebnis" : "Result",
                body: german ? "Route, Formulierungen, Unterlagen" : "Route, Formulierungen, Unterlagen",
              },
              {
                id: "glossary",
                title: german ? "Glossar" : "Glossary",
                body: german ? "Begriffe schnell verstehen" : "Decode local terms quickly",
              },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "page" : undefined}
                onClick={() => trackEvent("section_jump", { section: item.id, source: "flow_row" })}
                className="premium-panel min-w-0 rounded-xl p-3 text-sm transition hover:-translate-y-0.5 hover:border-[#c4a68f]"
              >
                <p className="break-safe font-semibold text-[#332a22]">{item.title}</p>
                <p className="break-safe mt-1 text-xs leading-5 text-slate-600">{item.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-rhythm-b border-y border-[#d8c7b5] bg-[#fff9ef]/42">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="mb-7 max-w-3xl">
            <p className="premium-kicker text-sm font-semibold">{german ? "Produktablauf" : "Product flow"}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-[#332a22]">
              {german ? "Ein strukturierter Weg statt einer langen Seite." : "A structured journey, not one long page."}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {german
                ? "Jeder Bereich beantwortet eine konkrete Frage: Was ist los, wohin sollte ich gehen, was muss ich wissen und wie bereite ich mich vor?"
                : "Each section answers one job: what is happening, where should I go, what should I know, and how do I prepare?"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
          {(german
            ? [
                ["Lokale Begriffe, klare Wege", "ClinicNav AI ordnet Hausarzt, Apotheke, Facharzt, 116117 und 112 verständlich ein."],
                ["Orientierung, keine Diagnose", "Die Empfehlung hilft bei der Wahl des Versorgungswegs und ersetzt keine ärztliche Einschätzung."],
                ["Gut vorbereitet", "Sie erhalten Zusammenfassung, Unterlagenliste und konkrete nächste Schritte."],
              ]
            : [
                ["New country, new rules", "People often do not know if they need a Hausarzt, Apotheke, Facharzt, 116117, or 112."],
                ["Navigation, not diagnosis", "ClinicNav AI explains the care route and preparation steps without pretending to be a doctor."],
                ["Doctor-ready output", "The user leaves with documents, local terms, a German phrase, and a copyable summary."],
              ]).map(([title, body], index) => (
            <article
              key={title}
              className={`premium-panel rounded-2xl p-4 ${index === 0 ? "pastel-sky" : index === 1 ? "pastel-mint" : "pastel-lavender"}`}
            >
              <h2 className="font-display font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <PhotoStoryCards german={german} />

      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <SafetyBanner german={german} />
      </section>

      <section className="section-rhythm-a border-y border-[#d8c7b5] bg-[#f7efe3]/55">
        <CheckInForm value={form} onChange={handleFormChange} onSubmit={() => submit()} isLoading={isLoading} german={german} />
      </section>

      {error ? (
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e8bea5] bg-[#f7dfcd] p-4 text-sm text-[#8f352d]">
            <AlertCircle className="h-5 w-5" />
            <span className="flex-1">{error || t.routeErrorFallback}</span>
            <button
              type="button"
              onClick={() => submit()}
              className="rounded-lg border border-[#d39577] px-3 py-1 text-xs font-semibold text-[#7f2f29] transition hover:bg-[#f3ccb8]"
            >
              {t.retry}
            </button>
          </div>
        </div>
      ) : null}

      <section id="results" ref={resultRef} className="scroll-mt-24">
        {result ? (
          <>
            <ResultCards result={result} german={german} />
            <ChatPanel situation={form} report={result} german={german} />
          </>
        ) : (
          <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
            <div className="premium-panel rounded-2xl p-6">
              <p className="premium-kicker text-sm font-semibold">{german ? "Ergebnisbereich" : "Result area"}</p>
              <h2 className="font-display mt-3 text-2xl font-semibold text-[#332a22]">
                {german ? "Hier erscheint Ihre personalisierte Route." : "Your personalized care route appears here."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {german
                  ? "Nach dem Check-in sehen Sie die Empfehlung, Warnzeichen, Formulierungen und eine Zusammenfassung für den Termin."
                  : "After check-in, this section shows route guidance, warning signs, language support, and a doctor-ready summary."}
              </p>
            </div>
          </div>
        )}
      </section>

      <Glossary german={german} />

      <section id="roadmap" className="section-rhythm-b border-t border-[#d8c7b5] bg-[#fff9ef]/50 text-[#332a22]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div>
            <p className="premium-kicker text-sm font-semibold">{german ? "Weiterentwicklung" : "Product roadmap"}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold">
              {german ? "Eine Orientierungsschicht für den Zugang zur Versorgung." : "A navigation layer for cross-border healthcare access."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {german
                ? "ClinicNav AI ist darauf ausgelegt, von Deutschland aus in mehrsprachige, länderspezifische Navigation mit geprüften lokalen Daten zu wachsen."
                : "ClinicNav AI is designed to expand from Germany-first routing into multilingual, multi-country care navigation with verified local service directories and institution-grade safety controls."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {productSignals.map(([Icon, title, body]) => (
              <article key={String(title)} className="premium-panel rounded-2xl p-4">
                <div className="pastel-icon mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">
                  {german ? (title === "Institution-ready" ? "Für Einrichtungen geeignet" : "Erweiterbar") : title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {german
                    ? title === "Institution-ready"
                      ? "Strukturierte Orientierung und Sicherheitsregeln für wiederholbare Abläufe."
                      : "Die Datenstruktur ist für weitere Gesundheitssysteme vorbereitet."
                    : body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-3 z-40 px-4 lg:hidden">
        <div className="premium-shell rounded-2xl p-2 shadow-2xl shadow-[#3b3027]/20">
          <div className="font-ui mb-2 flex gap-1 overflow-x-auto pb-1 text-xs font-semibold text-[#5d5146] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" lang={language}>
            {[
              ["overview", t.mobile.top],
              ["how-it-works", t.mobile.flow],
              ["check-in", t.mobile.checkIn],
              ["results", t.mobile.result],
              ["glossary", t.mobile.terms],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={activeSection === id ? "page" : undefined}
                onClick={() => trackEvent("section_jump", { section: id, source: "mobile_dock" })}
                className={`font-ui nav-pill shrink-0 rounded-full border px-3 py-1.5 text-sm leading-none hover:border-[#c4a68f] ${
                  activeSection === id
                    ? "nav-pill-active border-[#8f5f45] bg-[#f1ddc8] text-[#3a2f26]"
                    : "border-[#d8c7b5] bg-[#fff9ef]/85"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={isResultCurrent ? "#results" : "#check-in"}
              onClick={() => trackEvent("mobile_cta_clicked", { cta: isResultCurrent ? "view_result" : "start_checkin" })}
              className="premium-button inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold"
            >
              {isResultCurrent ? t.mobile.viewResult : t.mobile.startCheckIn}
            </a>
            <button
              type="button"
              onClick={runSample}
              className="premium-secondary inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold"
            >
              {t.mobile.trySample}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
