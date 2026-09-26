import { Ticket, MapPin } from "lucide-react";
import { useContent } from "../lib/content";
import Reveal from "../components/Reveal";

export const STATUS_STYLE = {
  "Disponibile": "bg-green-500/15 text-green-400 border-green-500/30",
  "Ultimi biglietti": "bg-[#E6C200]/15 text-[#E6C200] border-[#E6C200]/40",
  "Sold out": "bg-white/5 text-zinc-500 border-white/10",
};

export function formatDate(d) {
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function Tour() {
  const { content } = useContent();
  const concerts = [...(content?.concerts || [])].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-16" data-testid="tour-page">
      <Reveal>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">Live</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4">Tour & Concerti</h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-14">
          Tutte le date dal vivo di Sarah. Prendi il biglietto prima che volino.
        </p>
      </Reveal>

      <div className="space-y-4">
        {concerts.map((c, i) => {
          const soldOut = c.status === "Sold out";
          return (
            <Reveal key={c.id} delay={i * 0.06}>
              <div
                data-testid={`concert-item-${i}`}
                className={`card-glass rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${soldOut ? "opacity-60" : "hover:border-[#E10078]/50"}`}
              >
                <div className="flex-none w-24 text-center sm:border-r sm:border-white/10 sm:pr-5">
                  <p className="font-display font-bold text-2xl text-[#FF2A85] leading-none">
                    {(c.date || "").split("-")[2]}
                  </p>
                  <p className="font-mono2 text-[10px] uppercase tracking-widest text-zinc-400 mt-1">
                    {formatDate(c.date).split(" ").slice(1).join(" ")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg flex items-center gap-2">
                    <MapPin size={16} className="text-[#E10078] flex-none" /> {c.city}
                  </p>
                  <p className="text-sm text-zinc-500 mt-0.5">{c.venue}</p>
                </div>
                <span className={`flex-none w-fit font-mono2 text-[9px] uppercase tracking-widest border rounded-full px-3 py-1.5 ${STATUS_STYLE[c.status] || STATUS_STYLE["Disponibile"]}`}>
                  {c.status}
                </span>
                {soldOut ? (
                  <span className="flex-none text-center text-xs text-zinc-600 border border-white/10 rounded-full px-6 py-3 cursor-not-allowed" data-testid={`concert-tickets-${i}`}>
                    Esaurito
                  </span>
                ) : (
                  <a
                    href={c.tickets_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`concert-tickets-${i}`}
                    className="flex-none inline-flex items-center justify-center gap-2 bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full px-6 py-3 transition-colors"
                  >
                    <Ticket size={15} /> Biglietti
                  </a>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
