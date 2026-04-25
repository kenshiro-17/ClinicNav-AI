"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bot, Loader2, MapPin, Navigation, Send, Sparkles, UserRound } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { uiText } from "@/lib/uiText";
import type { ChatMessage, NavigateRequest, NavigationResult } from "@/types";

function mapSearches(report: NavigationResult) {
  const route = `${report.recommendedRoute} ${report.nextStep}`.toLowerCase();

  if (route.includes("112") || route.includes("notaufnahme") || report.riskLevel === "emergency") {
    return [
      { label: "Emergency room", query: "Notaufnahme Krankenhaus in der Nähe" },
      { label: "Hospital", query: "Krankenhaus in der Nähe" },
    ];
  }

  if (route.includes("zahnarzt") || route.includes("dental")) {
    return [
      { label: "Dental emergency", query: "Zahnärztlicher Notdienst in der Nähe" },
      { label: "Dentist", query: "Zahnarzt in der Nähe" },
      { label: "Pharmacy", query: "Apotheke in der Nähe" },
    ];
  }

  if (route.includes("apotheke") || route.includes("pharmacy")) {
    return [
      { label: "Pharmacy", query: "Apotheke in der Nähe" },
      { label: "On-call pharmacy", query: "Notdienst Apotheke in der Nähe" },
    ];
  }

  if (route.includes("facharzt") || route.includes("hautarzt")) {
    return [
      { label: "Specialist", query: "Facharzt in der Nähe" },
      { label: "Dermatologist", query: "Hautarzt in der Nähe" },
      { label: "Hausarzt", query: "Hausarzt in der Nähe" },
    ];
  }

  if (route.includes("116117") || route.includes("bereitschaftspraxis") || report.riskLevel === "urgent") {
    return [
      { label: "On-call practice", query: "Bereitschaftspraxis in der Nähe" },
      { label: "Hausarzt", query: "Hausarzt in der Nähe" },
      { label: "Pharmacy", query: "Apotheke in der Nähe" },
    ];
  }

  return [
    { label: "Hausarzt", query: "Hausarzt in der Nähe" },
    { label: "Pharmacy", query: "Apotheke in der Nähe" },
  ];
}

function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function ChatPanel({ situation, report, german = false }: { situation: NavigateRequest; report: NavigationResult; german?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        german
          ? "Ich kann helfen, diese Empfehlung zu verstehen, den nächsten Schritt vorzubereiten und lokale Begriffe zu erklären. Ich stelle keine Diagnose."
          : "I can help you understand this report, prepare what to say, and decide what local service to contact next. I cannot diagnose or replace professional care.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleMessages = useMemo(() => messages.slice(-8), [messages]);
  const searches = useMemo(() => mapSearches(report), [report]);
  const starters = german ? uiText.de.chat.starters : uiText.en.chat.starters;
  const primarySearch = searches[0];

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      trackEvent("chat_message_sent", { message_length: trimmed.length });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, report, messages: nextMessages.slice(-10) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to answer right now.");

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
      trackEvent("chat_message_received", { urgent: Boolean(data.urgent) });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to answer right now.");
      trackEvent("chat_message_failed", { reason: caught instanceof Error ? caught.message : "unknown" });
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <section className="animate-rise mx-auto max-w-7xl px-5 py-6 md:px-8">
      <div className="premium-shell overflow-hidden rounded-2xl transition duration-300 hover:shadow-2xl hover:shadow-slate-900/10">
        <div className="border-b border-[#d8c7b5] bg-[#e7ddd0]/70 px-5 py-4 text-[#332a22]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="pastel-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="premium-kicker text-sm font-semibold">{german ? "Nachfragen" : "Follow-up chat"}</p>
                <h2 className="text-2xl font-semibold">{german ? "Fragen zu diesem Versorgungsweg" : "Ask about this care route"}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {german
                    ? "Sichere, situationsbezogene Hilfe zur Vorbereitung und zu nächsten Schritten."
                    : "Continue with safe, situation-specific guidance for preparation, language, and next steps."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border-b border-[#d8c7b5] bg-[#fff9ef]/42 p-5 lg:border-b-0 lg:border-r">
            <div className="hidden lg:block">
              <h3 className="font-semibold text-slate-950">{german ? "Sicherheitsrahmen" : "Conversation guardrails"}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>• {german ? "Orientierung, keine Diagnose" : "Navigation help only, not diagnosis"}</li>
                <li>• {german ? "Bei Lebensgefahr 112" : "Severe or life-threatening symptoms route to 112"}</li>
                <li>• {german ? "Bei Dringlichkeit kann 116117 helfen" : "Urgent non-emergency Germany questions can use 116117"}</li>
                <li>• {german ? "Keine Empfehlungen zu verschreibungspflichtigen Medikamenten" : "No prescription medication suggestions"}</li>
              </ul>
              <div className="mt-5 rounded-2xl border border-[#dcc98f] bg-[#efe1b8] p-3 text-sm leading-6 text-[#6f4e16]">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  {german ? "Sicherheitshinweis" : "Safety reminder"}
                </div>
                {german
                  ? "Bei schweren, sich verschlechternden oder lebensbedrohlichen Symptomen sofort den Notruf wählen."
                  : "If symptoms are severe, worsening, or life-threatening, call emergency services immediately."}
              </div>
            </div>

            <details className="mb-3 rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/86 p-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-[#332a22]">{german ? "Sicherheitsrahmen" : "Conversation guardrails"}</summary>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>• {german ? "Orientierung, keine Diagnose" : "Navigation help only, not diagnosis"}</li>
                <li>• {german ? "Bei Lebensgefahr 112" : "Severe or life-threatening symptoms route to 112"}</li>
                <li>• {german ? "Bei Dringlichkeit kann 116117 helfen" : "Urgent non-emergency Germany questions can use 116117"}</li>
                <li>• {german ? "Keine Empfehlungen zu verschreibungspflichtigen Medikamenten" : "No prescription medication suggestions"}</li>
              </ul>
            </details>

            <div className="premium-panel mt-5 rounded-2xl p-3">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6f856d]" />
                <h3 className="font-semibold text-slate-950">{german ? "Wohin gehen" : "Where to go"}</h3>
              </div>
              <div className="hidden overflow-hidden rounded-2xl border border-[#d8c7b5] bg-[#e7ddd0] lg:block">
                <iframe
                  title="Google Maps route-aware search"
                  src={mapsEmbedUrl(primarySearch.query)}
                  className="h-44 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <details className="mb-3 rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/86 p-3 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-[#332a22]">{german ? "Karte anzeigen" : "Show map"}</summary>
                <div className="mt-3 overflow-hidden rounded-xl border border-[#d8c7b5] bg-[#e7ddd0]">
                  <iframe
                    title="Google Maps route-aware search"
                    src={mapsEmbedUrl(primarySearch.query)}
                    className="h-44 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </details>
              <div className="mt-3 grid gap-2">
                {searches.map((search) => (
                  <a
                    key={search.query}
                    href={mapsUrl(search.query)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("map_search_opened", { label: search.label })}
                    className="premium-secondary inline-flex h-10 items-center justify-between rounded-xl px-3 text-sm font-semibold transition hover:-translate-y-0.5"
                  >
                    {search.label}
                    <Navigation className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {german
                  ? "Google Maps öffnet eine passende Suche. Bitte Öffnungszeiten, Zuständigkeit und Dringlichkeit prüfen."
                  : "Google Maps opens with a route-aware search. Verify opening hours, insurance acceptance, and urgency before traveling."}
              </p>
            </div>
          </aside>

          <div className="p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => {
                    trackEvent("chat_starter_clicked", { starter });
                    sendMessage(starter);
                  }}
                  className="premium-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {starter}
                </button>
              ))}
            </div>

            <div className="max-h-[430px] min-h-[300px] space-y-3 overflow-y-auto rounded-2xl border border-[#d8c7b5] bg-[#fff9ef]/48 p-4">
              {visibleMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                  className={message.role === "assistant" ? "flex justify-start" : "flex justify-end"}
                >
                  <div
                    className={
                      message.role === "assistant"
                        ? "max-w-[88%] rounded-2xl border border-[#d8c7b5] bg-[#fff9ef]/82 p-3 text-sm leading-6 text-slate-700 shadow-sm"
                        : "max-w-[88%] rounded-2xl bg-[#8f5f45] p-3 text-sm leading-6 text-white shadow-sm"
                    }
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
                      {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                      {message.role === "assistant" ? "ClinicNav" : "You"}
                    </div>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#d8c7b5] bg-[#fff9ef] p-3 text-sm text-slate-600 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#8f5f45]" />
                    {german ? "Prüfe den Versorgungsweg..." : "Thinking through the care route..."}
                  </div>
                </div>
              ) : null}
            </div>

            {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}

            <form onSubmit={onSubmit} className="mt-4 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={german ? "Frage zu dieser Empfehlung stellen..." : "Ask a follow-up about this report..."}
                className="h-12 min-w-0 flex-1 rounded-xl border border-[#d8c7b5] bg-[#fff9ef]/85 px-4 text-sm outline-none transition focus:border-[#c4a68f] focus:ring-4 focus:ring-[#efe1b8]/60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="premium-button inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {german ? "Senden" : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
