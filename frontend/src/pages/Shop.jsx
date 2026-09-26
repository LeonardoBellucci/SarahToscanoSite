import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ShoppingBag } from "lucide-react";
import { useContent } from "../lib/content";
import Reveal from "../components/Reveal";

export default function Shop() {
  const { content } = useContent();
  const [selected, setSelected] = useState(null);
  const products = content?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="shop-page">
      <Reveal>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">Merch ufficiale</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-4">Lo Shop</h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-12">
          Felpe, vinili e accessori ufficiali. Clicca su un prodotto per i dettagli e il link diretto all'acquisto.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}>
            <button
              onClick={() => setSelected(p)}
              data-testid={`shop-product-${i}`}
              className="group block w-full text-left card-glass rounded-2xl overflow-hidden hover:border-[#E10078]/50 transition-colors"
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-[#E10078] text-white font-mono2 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="font-mono2 text-sm text-[#E6C200] flex-none">€ {p.price}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            data-testid="shop-product-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="card-glass rounded-3xl overflow-hidden max-w-2xl w-full grid md:grid-cols-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-square md:aspect-auto">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-7 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  {selected.tag ? (
                    <span className="bg-[#E10078]/20 border border-[#E10078]/40 text-pink-300 font-mono2 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {selected.tag}
                    </span>
                  ) : <span />}
                  <button data-testid="shop-modal-close" onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white transition-colors" aria-label="Chiudi">
                    <X size={18} />
                  </button>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{selected.name}</h3>
                <p className="font-mono2 text-lg text-[#E6C200] mb-4">€ {selected.price}</p>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">{selected.description}</p>
                <a
                  href={selected.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="shop-buy-button"
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full px-6 py-3.5 transition-colors glow-magenta"
                >
                  <ShoppingBag size={16} /> Compra ora <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
