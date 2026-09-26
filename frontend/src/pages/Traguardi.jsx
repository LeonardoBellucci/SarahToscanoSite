import { Trophy, Medal, Star } from "lucide-react";
import { useContent } from "../lib/content";
import Reveal from "../components/Reveal";

const KIND_ICON = { Premio: Trophy, Certificazione: Medal, Tappa: Star };

export default function Traguardi() {
  const { content } = useContent();
  const awards = [...(content?.awards || [])].sort((a, b) => (b.year || "").localeCompare(a.year || ""));

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16" data-testid="traguardi-page">
      <Reveal>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">Premi & certificazioni</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4">I Traguardi</h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-16">
          Ogni tappa del percorso di Sarah: dalle certificazioni FIMI ai palchi che hanno fatto la storia.
        </p>
      </Reveal>

      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#E10078] via-[#E6C200]/60 to-transparent" />
        <div className="space-y-10">
          {awards.map((a, i) => {
            const Icon = KIND_ICON[a.kind] || Trophy;
            return (
              <Reveal key={a.id} delay={i * 0.08}>
                <div className="relative pl-16" data-testid={`award-item-${i}`}>
                  <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#12121C] border border-[#E6C200]/50 flex items-center justify-center">
                    <Icon size={16} className="text-[#E6C200]" />
                  </div>
                  <div className="card-glass rounded-2xl p-6 hover:border-[#E6C200]/40 transition-colors">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-display font-bold text-2xl text-[#E6C200]">{a.year}</span>
                      <span className="font-mono2 text-[9px] uppercase tracking-widest border border-[#E10078]/40 text-pink-300 rounded-full px-2.5 py-1">
                        {a.kind}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{a.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
