import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import { useContent } from "../lib/content";
import Reveal from "../components/Reveal";

export default function Musica() {
  const { content } = useContent();
  const [openId, setOpenId] = useState(null);
  const tracks = [...(content?.tracks || [])].sort((a, b) => (b.year || "").localeCompare(a.year || ""));

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-16" data-testid="musica-page">
      <Reveal>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">Discografia & significati</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4">La Musica</h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-14">
          Tutti i brani di Sarah con la storia e il significato dietro ogni testo.
        </p>
      </Reveal>

      <div className="space-y-4">
        {tracks.map((t, i) => {
          const open = openId === t.id;
          return (
            <Reveal key={t.id} delay={i * 0.05}>
              <div className={`card-glass rounded-2xl overflow-hidden transition-colors ${open ? "border-[#E10078]/50" : ""}`} data-testid={`track-item-${i}`}>
                <button
                  onClick={() => setOpenId(open ? null : t.id)}
                  data-testid={`track-toggle-${i}`}
                  className="w-full flex items-center gap-4 md:gap-6 p-4 md:p-5 text-left"
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-none group">
                    <img src={t.cover} alt={`Cover ${t.title}`} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base md:text-lg truncate">{t.title}</p>
                    <p className="font-mono2 text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                      {t.year} · {t.kind}{t.duration ? ` · ${t.duration}` : ""}
                    </p>
                  </div>
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent("Sarah Toscano " + t.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`track-listen-${i}`}
                    className="hidden sm:inline-flex flex-none items-center gap-2 border border-white/15 hover:border-[#E10078] hover:text-[#FF2A85] text-zinc-300 text-xs rounded-full px-4 py-2 transition-colors"
                  >
                    <Play size={12} /> Ascolta
                  </a>
                  <ChevronDown size={18} className={`flex-none text-zinc-500 transition-transform duration-300 ${open ? "rotate-180 text-[#FF2A85]" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 md:px-6 pb-6 pt-1 md:pl-[104px]" data-testid={`track-meaning-${i}`}>
                        <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#E6C200] mb-2">Il significato</p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{t.meaning}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
