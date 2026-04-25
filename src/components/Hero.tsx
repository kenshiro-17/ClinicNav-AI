import { ArrowRight, BadgeCheck, Globe2, Languages, MapPinned } from "lucide-react";
import { uiText } from "@/lib/uiText";

export function Hero({ onSample, german = false }: { onSample: () => void; german?: boolean }) {
  const t = uiText[german ? "de" : "en"].hero;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,187,217,0.20),transparent_34%),linear-gradient(215deg,rgba(187,222,251,0.28),transparent_44%)]" />
      <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-[1fr_0.85fr] md:px-8">
        <div className="animate-rise max-w-3xl">
          <div className="font-ui pastel-chip mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow-sm">
            <Globe2 className="h-4 w-4" />
            {t.badge}
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-normal text-[#332a22] sm:text-6xl lg:text-7xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">{t.subtitle}</p>
          <div className="mt-6 grid max-w-2xl gap-3 grid-cols-2 sm:grid-cols-3">
            {t.chips.map((item) => (
              <div key={item} className="font-ui premium-shell break-safe rounded-xl p-3 text-sm font-semibold text-slate-750">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#check-in"
              className="font-ui premium-button inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition"
            >
              {t.ctaStart} <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onSample}
              className="font-ui premium-secondary inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition"
            >
              <BadgeCheck className="h-4 w-4" />
              {t.ctaSample}
            </button>
          </div>
        </div>

        <div className="premium-dark animate-rise rounded-2xl p-5 [animation-delay:120ms]">
          <div className="mb-5 flex items-center justify-between border-b border-white/50 pb-4">
            <div>
              <p className="text-sm font-medium text-[#8f5f45]">CareNav AI</p>
              <h2 className="font-display break-safe text-2xl font-semibold">{t.panelTitle}</h2>
            </div>
            <div className="pastel-icon flex h-12 w-12 items-center justify-center rounded-full">
              <MapPinned className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-[#bdcec9] bg-[#dfe8e4]/80 p-4">
              <p className="text-sm text-slate-600">{t.panelUrgentLead}</p>
              <p className="mt-1 text-lg font-semibold">{t.panelUrgentAction}</p>
            </div>
            <div className="rounded-xl border border-[#e8bea5] bg-[#f7dfcd]/85 p-4">
              <p className="text-sm text-[#8f352d]">{t.panelEmergencyLead}</p>
              <p className="mt-1 text-lg font-semibold">{t.panelEmergencyAction}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-[#d4c4b3] bg-[#e7ddd0]/80 p-3">
                <Languages className="mb-2 h-4 w-4 text-[#8f5f45]" />
                {t.panelPhraseReady}
              </div>
              <div className="rounded-xl border border-[#c9d7bb] bg-[#e3ead9]/80 p-3">
                <BadgeCheck className="mb-2 h-4 w-4 text-[#6f856d]" />
                {t.panelNextReady}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
