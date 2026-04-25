import { MapPinned, MessageSquareText, Route } from "lucide-react";
import Image from "next/image";

const storyCards = [
  {
    icon: Route,
    title: "New system, unclear next step",
    titleDe: "Neues System, unklarer naechster Schritt",
    body: "ClinicNav turns unfamiliar terms and care options into a clear route.",
    bodyDe: "ClinicNav macht unbekannte Begriffe und Versorgungswege verstaendlich.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    alt: "Healthcare professional speaking with a patient at a clinic desk",
  },
  {
    icon: MessageSquareText,
    title: "Better prepared conversations",
    titleDe: "Besser vorbereitet ins Gespraech",
    body: "Users get a concise summary, local phrases, and questions to ask.",
    bodyDe: "Nutzer erhalten eine kurze Zusammenfassung, passende Formulierungen und Fragen.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80",
    alt: "Doctor reviewing notes and preparing a patient conversation",
  },
  {
    icon: MapPinned,
    title: "Find the right care point",
    titleDe: "Den passenden Anlaufpunkt finden",
    body: "The follow-up flow helps users search for pharmacies, doctors, and urgent care options.",
    bodyDe: "Der Follow-up-Bereich hilft bei der Suche nach Apotheken, Aerzten und dringender Hilfe.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    alt: "Modern clinic hallway with calm healthcare environment",
  },
  {
    icon: MessageSquareText,
    title: "Bridge language gaps quickly",
    titleDe: "Sprachbarrieren schnell ueberbruecken",
    body: "Short local phrases reduce stress at reception and during triage conversations.",
    bodyDe: "Kurze lokale Formulierungen reduzieren Stress an der Anmeldung und bei der Ersteinschaetzung.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    alt: "Healthcare worker and patient discussing information with tablet",
  },
  {
    icon: Route,
    title: "Safer escalation logic",
    titleDe: "Sichere Eskalationslogik",
    body: "Emergency signals are highlighted early so users can move to 112 when needed.",
    bodyDe: "Notfallsignale werden frueh hervorgehoben, damit Nutzer bei Bedarf direkt zu 112 wechseln.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    alt: "Emergency department sign in a hospital corridor",
  },
  {
    icon: MapPinned,
    title: "Prepared for expansion",
    titleDe: "Auf Expansion vorbereitet",
    body: "The same guided layout can support additional countries with local rule sets.",
    bodyDe: "Das gleiche gefuehrte Layout kann weitere Laender mit lokalen Regelwerken unterstuetzen.",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
    alt: "Travel map with route lines and planning notes",
  },
];

export function PhotoStoryCards({ german = false }: { german?: boolean }) {
  return (
    <section id="care-moments" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <div className="mb-7 max-w-3xl">
        <p className="premium-kicker text-sm font-semibold">{german ? "Versorgungsmomente" : "Care moments"}</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#332a22]">
          {german ? "Von Unsicherheit zu einem klaren Plan." : "From uncertainty to a clear plan."}
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {german
            ? "Die Oberflaeche ist in klaren Schritten aufgebaut: Anliegen erfassen, Route verstehen, Gespraech vorbereiten und passenden Ort suchen."
            : "The experience is split into focused sections: describe the concern, understand the route, prepare the conversation, and find where to go."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {storyCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="premium-panel animate-rise group overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-[#c4a68f]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  loading={index < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#332a22]/42 via-transparent to-transparent" />
                <div className="pastel-icon absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#332a22]">{german ? card.titleDe : card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{german ? card.bodyDe : card.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
