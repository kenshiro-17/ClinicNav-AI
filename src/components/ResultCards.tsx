"use client";

import { AlertTriangle, ClipboardList, FileText, Languages, MapPinned, Printer, Route, Stethoscope } from "lucide-react";
import { uiText } from "@/lib/uiText";
import type { NavigationResult } from "@/types";
import { CopyButton } from "./CopyButton";
import { EmergencyCallButton } from "./EmergencyCallButton";
import { SafetyBanner } from "./SafetyBanner";

function riskStyles(riskLevel: NavigationResult["riskLevel"]) {
  if (riskLevel === "emergency") return "border-[#e8bea5] bg-[#f7dfcd] text-[#8f352d]";
  if (riskLevel === "urgent") return "border-[#dcc98f] bg-[#efe1b8] text-[#6f4e16]";
  return "border-[#c9d7bb] bg-[#e3ead9] text-[#455d45]";
}

export function ResultCards({ result, german = false }: { result: NavigationResult; german?: boolean }) {
  const t = uiText[german ? "de" : "en"].result;

  const summaryText = [
    `${t.summaryLineConcern}: ${result.doctorSummary.mainConcern}`,
    `${t.summaryLineDuration}: ${result.doctorSummary.duration}`,
    `${t.summaryLineSeverity}: ${result.doctorSummary.severity}`,
    `${t.summaryLineRoute}: ${result.recommendedRoute}`,
    `${t.summaryLineSymptoms}: ${result.doctorSummary.keySymptoms.join(", ")}`,
    `${t.summaryLineSay}: ${result.doctorSummary.whatToSay}`,
    `${t.summaryLineQuestions}: ${result.doctorSummary.questionsToAsk.join(" | ")}`,
    result.disclaimer,
  ].join("\n");

  return (
    <section className="animate-rise mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="premium-kicker text-sm font-semibold">{t.kicker}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">{t.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="font-ui premium-secondary inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold shadow-sm transition"
            title={t.exportPdf}
          >
            <Printer className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          [t.statRisk, result.riskLevel.replaceAll("_", " ")],
          [t.statRoute, result.recommendedRoute.split(":")[0]],
          [t.statLanguage, result.localLanguagePhrase.language],
          [t.statExport, t.statExportValue],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`premium-panel min-w-0 rounded-2xl p-4 ${index === 0 ? "pastel-lavender" : index === 1 ? "pastel-sky" : index === 2 ? "pastel-mint" : "pastel-peach"}`}
          >
            <p className="font-ui break-safe text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="break-safe mt-2 text-sm font-semibold capitalize text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className={`rounded-2xl border p-5 shadow-sm ${riskStyles(result.riskLevel)}`}>
          <div className="flex gap-3">
            <MapPinned className="mt-1 h-6 w-6 shrink-0" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">{t.routeHeading}</p>
              <h3 className="font-display mt-2 text-2xl font-semibold">{result.recommendedRoute}</h3>
              <p className="mt-3 leading-7">{result.reasoning}</p>
              {result.riskLevel === "emergency" ? (
                <div className="mt-4">
                  <EmergencyCallButton label={t.emergencyCall} />
                </div>
              ) : null}
            </div>
          </div>
        </article>

        <article className="premium-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#b7791f]" />
            <h3 className="font-display font-semibold text-slate-950">{t.warningHeading}</h3>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-slate-600">
            {result.urgentWarningSigns.map((sign) => (
              <li key={sign}>• {sign}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="premium-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#8f5f45]" />
            <h3 className="font-display font-semibold text-slate-950">{t.summaryHeading}</h3>
          </div>
          <dl className="space-y-2 text-sm leading-6 text-slate-700">
            <div><dt className="font-semibold text-slate-950">{t.summaryConcern}</dt><dd>{result.doctorSummary.mainConcern}</dd></div>
            <div><dt className="font-semibold text-slate-950">{t.summaryDuration}</dt><dd>{result.doctorSummary.duration}</dd></div>
            <div><dt className="font-semibold text-slate-950">{t.summarySeverity}</dt><dd>{result.doctorSummary.severity}</dd></div>
          </dl>
          <div className="mt-4">
            <CopyButton text={summaryText} label={t.copySummary} />
          </div>
        </article>

        <article className="premium-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Languages className="h-5 w-5 text-[#6c4f3d]" />
            <h3 className="font-display font-semibold text-slate-950">{t.phraseHeading}</h3>
          </div>
          <p className="text-lg font-semibold leading-7 text-slate-950">{result.localLanguagePhrase.phrase}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{result.localLanguagePhrase.meaning}</p>
          <div className="mt-4">
            <CopyButton text={result.localLanguagePhrase.phrase} label={t.copyPhrase} />
          </div>
        </article>

        <article className="premium-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#6f856d]" />
            <h3 className="font-display font-semibold text-slate-950">{t.bringHeading}</h3>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {result.documentsToBring.map((document) => (
              <li key={document}>• {document}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="premium-panel rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Route className="h-5 w-5 text-[#6f856d]" />
            <h3 className="font-display font-semibold text-slate-950">{t.nextStepHeading}</h3>
          </div>
          <p className="text-sm leading-6 text-slate-700">{result.nextStep}</p>
        </article>
        <SafetyBanner emergency={result.riskLevel === "emergency"} german={german} />
      </div>

      <div className="premium-panel mt-4 rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-[#6f856d]" />
          <h3 className="font-display font-semibold text-slate-950">{t.questionsHeading}</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {result.doctorSummary.questionsToAsk.map((question) => (
            <p key={question} className="rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/68 p-3 text-sm leading-6 text-slate-700">
              {question}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
