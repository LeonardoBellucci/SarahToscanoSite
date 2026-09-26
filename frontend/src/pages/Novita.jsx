import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useContent } from "../lib/content";
import Reveal from "../components/Reveal";

export default function Novita() {
  const { content } = useContent();
  const [filter, setFilter] = useState("Tutte");
  const [selected, setSelected] = useState(null);

  const news = useMemo(
    () => [...(content?.news || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [content]
  );
  const categories = useMemo(() => ["Tutte", ...new Set(news.map((n) => n.category).filter(Boolean))], [news]);
  const visible = filter === "Tutte" ? news : news.filter((n) => n.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="novita-page">
      <Reveal>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">Aggiornamenti</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-8">Novità</h1>
      </Reveal>

      <div className="flex flex-wrap gap-2 mb-10" data-testid="news-filters">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            data-testid={`news-filter-${c.toLowerCase()}`}
            className={`font-mono2 text-[10px] uppercase tracking-widest rounded-full px-4 py-2 border transition-colors ${
              filter === c
                ? "bg-[#E10078] border-[#E10078] text-white"
                : "border-white/15 text-zinc-400 hover:border-[#E10078]/60 hover:text-pink-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((n, i) => (
          <Reveal key={n.id} delay={(i % 3) * 0.08}>
            <button
              onClick={() => setSelected(n)}
              data-testid={`news-card-${i}`}
              className="group block w-full text-left card-glass rounded-2xl overflow-hidden hover:border-[#E10078]/50 transition-colors h-full"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={n.image} alt={n.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="font-mono2 text-[10px] uppercase tracking-widest text-pink-400 mb-2">{n.category} · {n.date}</p>
                <h3 className="font-semibold text-base leading-snug mb-2">{n.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{n.excerpt}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            data-testid="news-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.article
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="card-glass rounded-3xl overflow-hidden max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/8]">
                <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <button
                  data-testid="news-modal-close"
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-[#E10078] transition-colors"
                  aria-label="Chiudi articolo"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-7">
                <p className="font-mono2 text-[10px] uppercase tracking-widest text-pink-400 mb-3">{selected.category} · {selected.date}</p>
                <h2 className="font-display font-bold text-xl mb-4">{selected.title}</h2>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{selected.body || selected.excerpt}</p>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
