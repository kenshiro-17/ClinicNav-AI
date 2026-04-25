"use client";

import { Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { uiText } from "@/lib/uiText";
import type { NavigateRequest } from "@/types";

const emptyForm: NavigateRequest = {
  country: "Germany",
  concern: "",
  duration: "2 days",
  severity: 5,
  symptoms: [],
  languagePreference: "german_phrase",
  userType: "international_student",
  tried: "",
  severeConcern: false,
};

export const sampleDentalPain: NavigateRequest = {
  country: "Germany",
  userType: "international_student",
  concern:
    "I have dental pain in Germany. My cheek feels a bit swollen and I do not know whether to go to a dentist, Hausarzt, Apotheke, or emergency room.",
  duration: "1 day",
  severity: 7,
  symptoms: ["Pain", "Swelling"],
  languagePreference: "german_phrase",
  tried: "I took rest and tried to find a dentist appointment online.",
  severeConcern: false,
};

export function CheckInForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  german = false,
}: {
  value: NavigateRequest;
  onChange: (value: NavigateRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
  german?: boolean;
}) {
  const [concernError, setConcernError] = useState("");
  const t = uiText[german ? "de" : "en"].checkIn;

  function update<K extends keyof NavigateRequest>(key: K, next: NavigateRequest[K]) {
    onChange({ ...value, [key]: next });

    if (key === "concern" && String(next).trim().length >= 8) {
      setConcernError("");
    }
  }

  function toggleSymptom(symptom: string) {
    const exists = value.symptoms.includes(symptom);
    update("symptoms", exists ? value.symptoms.filter((item) => item !== symptom) : [...value.symptoms, symptom]);
  }

  return (
    <section id="check-in" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="premium-kicker text-sm font-semibold">{german ? "Navigation" : "Navigation check-in"}</p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[#332a22]">
            {german ? "Beschreiben Sie kurz, was passiert ist." : "Tell CareNav what is happening."}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {german
              ? "Die App hilft bei der Orientierung im Versorgungssystem. Warnzeichen für Notfälle haben immer Vorrang."
              : "The app routes first, explains second. Emergency warning signs override AI output and send the user toward 112 or urgent help."}
          </p>
          <div className="premium-panel pastel-butter mt-6 rounded-2xl p-4 text-sm leading-6 text-slate-600">
            <strong className="text-slate-950">{german ? "Beispiel:" : "Example scenario:"}</strong>{" "}
            {german
              ? "Nutzen Sie ein realistisches Beispiel, um Route, Zusammenfassung und nächste Schritte zu sehen."
              : "prefill a realistic case to see the full care route, summary, phrase, and follow-up support."}
          </div>
        </div>

        <form
          className="premium-panel animate-rise rounded-2xl p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (value.concern.trim().length < 8) {
              setConcernError(t.concernError);
              return;
            }
            onSubmit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-ui text-sm font-semibold text-slate-800">{t.country}</span>
              <select
                value={value.country}
                onChange={(event) => update("country", event.target.value as NavigateRequest["country"])}
                className="mt-2 h-11 w-full rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-3 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              >
                <option>Germany</option>
              </select>
            </label>

            <label className="block">
              <span className="font-ui text-sm font-semibold text-slate-800">{t.profile}</span>
              <select
                value={value.userType}
                onChange={(event) => update("userType", event.target.value as NavigateRequest["userType"])}
                className="mt-2 h-11 w-full rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-3 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              >
                <option value="international_student">{german ? "Internationale:r Studierende:r" : "International student"}</option>
                <option value="tourist">{german ? "Tourist:in" : "Tourist"}</option>
                <option value="migrant_new_resident">{german ? "Neu zugezogen" : "Migrant / new resident"}</option>
                <option value="local_resident">{german ? "Einheimisch / Deutschsprachig" : "Local resident"}</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="font-ui text-sm font-semibold text-slate-800">{t.concern}</span>
            <textarea
              value={value.concern}
              onChange={(event) => update("concern", event.target.value)}
              onBlur={() => {
                if (value.concern.trim().length < 8) {
                  setConcernError(t.concernError);
                }
              }}
              rows={5}
              required
              minLength={8}
              aria-invalid={Boolean(concernError)}
              aria-describedby="concern-help"
              placeholder={t.concernPlaceholder}
              className={`mt-2 w-full rounded-xl border bg-[#fff9ef]/85 px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60 ${
                concernError ? "border-[#d92d20]" : "border-[#d8c7b5]"
              }`}
            />
            <p id="concern-help" className={`mt-2 text-xs ${concernError ? "text-[#b42318]" : "text-slate-500"}`}>
              {concernError || t.concernHint}
            </p>
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="font-ui text-sm font-semibold text-slate-800">{t.duration}</span>
              <input
                value={value.duration}
                onChange={(event) => update("duration", event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-3 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-ui flex items-center justify-between text-sm font-semibold text-slate-800">
                {t.severity} <span className="text-[#8f5f45]">{value.severity}/10</span>
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={value.severity}
                onChange={(event) => update("severity", Number(event.target.value))}
                className="mt-4 w-full accent-[#8f5f45]"
              />
            </label>
          </div>

          <div className="mt-4">
            <span className="font-ui text-sm font-semibold text-slate-800">{t.symptoms}</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {t.symptomOptions.map((symptom) => (
                <label key={symptom.value} className="flex items-center gap-2 rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/70 px-3 py-2 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-[#c4a68f] hover:bg-[#fff9ef]">
                  <input
                    type="checkbox"
                    checked={value.symptoms.includes(symptom.value)}
                    onChange={() => toggleSymptom(symptom.value)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#8f5f45]"
                  />
                  {symptom.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-ui text-sm font-semibold text-slate-800">{t.languageSupport}</span>
              <select
                value={value.languagePreference}
                onChange={(event) => update("languagePreference", event.target.value as NavigateRequest["languagePreference"])}
                className="mt-2 h-11 w-full rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-3 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              >
                <option value="german_phrase">{t.languageGerman}</option>
                <option value="english">{t.languageEnglish}</option>
              </select>
            </label>
            <label className="block">
              <span className="font-ui text-sm font-semibold text-slate-800">{t.tried}</span>
              <input
                value={value.tried}
                onChange={(event) => update("tried", event.target.value)}
                placeholder="Optional"
                className="mt-2 h-11 w-full rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-3 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              />
            </label>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8bea5] bg-[#f7dfcd]/75 p-3 text-sm leading-6 text-[#8f352d]">
            <input
              type="checkbox"
              checked={Boolean(value.severeConcern)}
              onChange={(event) => update("severeConcern", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#c78e77] accent-[#d92d20]"
            />
            <span>
              <strong>{t.emergencyLabel}</strong> {t.emergencyBody}
            </span>
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="font-ui premium-button inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t.submit}
            </button>
            <button
              type="button"
              onClick={() => onChange(sampleDentalPain)}
              className="font-ui premium-secondary inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition"
            >
              <Sparkles className="h-4 w-4" />
              {t.sample}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export { emptyForm };
