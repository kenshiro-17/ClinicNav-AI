import { BookOpen } from "lucide-react";
import { germanyGlossary } from "@/lib/countryData";

export function Glossary({ german = false }: { german?: boolean }) {
  return (
    <section id="glossary" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="pastel-icon flex h-10 w-10 items-center justify-center rounded-full">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="premium-kicker text-sm font-semibold">{german ? "Glossar" : "Germany glossary"}</p>
          <h2 className="text-3xl font-semibold text-slate-950">
            {german ? "Wichtige Begriffe im deutschen Gesundheitssystem" : "Healthcare words newcomers meet fast"}
          </h2>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {germanyGlossary.map((item) => (
          <article key={item.term} className="premium-panel rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#c4a68f]">
            <h3 className="font-semibold text-slate-950">{item.term}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.meaning}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
