import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Trophy, Disc3, ShoppingBag, Newspaper, Ticket } from "lucide-react";
import { useContent } from "../lib/content";
import Marquee, { TextMarquee } from "../components/Marquee";
import Reveal from "../components/Reveal";

const HERO_IMG = "https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwb3AlMjBzaW5nZXIlMjBjb25jZXJ0JTIwc3RhZ2UlMjBtaWNyb3Bob25lJTIwbGlnaHRzfGVufDB8fHx8MTc5MDQwODM1Mnww&ixlib=rb-4.1.0&q=85";
const PORTRAIT = "https://images.unsplash.com/photo-1509650695346-96796d06faf7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzaW5nZXIlMjBwb3J0cmFpdCUyMHBpbmslMjBsaWdodCUyMGRhcmslMjBtb29keXxlbnwwfHx8fDE3OTA0MDg0NjJ8MA&ixlib=rb-4.1.0&q=85";

const HeroLine = ({ children, delay }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className="block"
      initial={{ y: "115%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-end overflow-hidden noise-overlay" data-testid="hero-section">
      <motion.div style={{ y: imgY }} className="absolute inset-0 -top-[15%] h-[130%]">
        <img src={HERO_IMG} alt="Sarah Toscano sul palco" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090D] via-[#09090D]/45 to-[#09090D]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090D]/85 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-20 pt-40 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex flex-wrap gap-2 mb-7"
        >
          {["Vincitrice Amici 23", "Sanremo 2025", "Disco d'Oro"].map((b) => (
            <span key={b} className="font-mono2 text-[10px] md:text-xs uppercase tracking-[0.2em] border border-[#E10078]/50 text-pink-300 rounded-full px-3.5 py-1.5 bg-[#E10078]/10 backdrop-blur-sm">
              {b}
            </span>
          ))}
        </motion.div>

        <h1 className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl" data-testid="hero-title">
          <HeroLine delay={0.25}>Sarah Toscano</HeroLine>
          <HeroLine delay={0.4}>
            <span className="text-stroke">La nuova voce</span>
          </HeroLine>
          <HeroLine delay={0.55}>
            del pop <span className="text-[#E10078]">italiano</span>
          </HeroLine>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 max-w-md text-sm md:text-base text-zinc-300 leading-relaxed"
        >
          Da Cavi di Lavagna all'Ariston: vincitrice di Amici 23, sul palco di Sanremo 2025 con
          "Amarcord". Questa è la casa ufficiale della sua musica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <Link
            to="/musica"
            data-testid="hero-cta-musica"
            className="group inline-flex items-center gap-2 bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full px-7 py-3.5 transition-colors glow-magenta"
          >
            Esplora la musica
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/shop"
            data-testid="hero-cta-shop"
            className="inline-flex items-center gap-2 border border-white/20 hover:border-[#E10078] hover:text-[#FF2A85] text-zinc-200 text-sm rounded-full px-7 py-3.5 transition-colors backdrop-blur-sm"
          >
            Visita lo shop
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Spotlight({ track }) {
  if (!track) return null;
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-24" data-testid="spotlight-section">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-4 bg-[#E10078]/25 blur-3xl rounded-full" />
            <motion.div whileHover={{ rotate: -2, scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }} className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square">
              <img src={track.cover || PORTRAIT} alt={`Cover ${track.title}`} className="w-full h-full object-cover" />
            </motion.div>
            <div className="absolute -bottom-4 -right-4 bg-[#E6C200] text-black font-mono2 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full rotate-3">
              Ultimo singolo
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-4">In rotazione ora</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-5">{track.title}</h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">{track.meaning}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/musica" data-testid="spotlight-cta" className="group inline-flex items-center gap-2 bg-white text-black font-semibold text-sm rounded-full px-6 py-3 hover:bg-[#FF2A85] hover:text-white transition-colors">
              <Disc3 size={16} /> Tutti i brani
            </Link>
            <span className="font-mono2 text-xs text-zinc-500 uppercase tracking-widest">{track.year} — {track.kind}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, linkTo, linkLabel, testid }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-3">{eyebrow}</p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight">{title}</h2>
      </div>
      <Link to={linkTo} data-testid={testid} className="group hidden sm:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#FF2A85] transition-colors flex-none">
        {linkLabel}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function Home() {
  const { content } = useContent();

  if (!content) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" data-testid="home-loading">
        <div className="w-8 h-8 rounded-full border-2 border-[#E10078] border-t-transparent animate-spin" />
      </div>
    );
  }

  const news = [...(content.news || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const awards = [...(content.awards || [])].sort((a, b) => (b.year || "").localeCompare(a.year || ""));
  const tracks = [...(content.tracks || [])].sort((a, b) => (b.year || "").localeCompare(a.year || ""));
  const products = content.products || [];
  const concerts = [...(content.concerts || [])].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div data-testid="home-page">
      <Hero />
      <Marquee images={content.gallery} />

      <Spotlight track={tracks[0]} />

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="home-shop-teaser">
        <Reveal>
          <SectionHead eyebrow="Merch ufficiale" title="Dallo Shop" linkTo="/shop" linkLabel="Tutto lo shop" testid="home-shop-link" />
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <Link to="/shop" data-testid={`home-product-${i}`} className="group block card-glass rounded-2xl overflow-hidden hover:border-[#E10078]/40 transition-colors">
                <div className="aspect-square overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="font-mono2 text-xs text-[#E6C200] mt-1">€ {p.price}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="home-awards-teaser">
        <Reveal>
          <SectionHead eyebrow="Premi & certificazioni" title="I Traguardi" linkTo="/traguardi" linkLabel="Tutti i traguardi" testid="home-awards-link" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {awards.slice(0, 3).map((a, i) => (
            <Reveal key={a.id} delay={i * 0.1}>
              <div className="card-glass rounded-2xl p-6 h-full hover:border-[#E6C200]/40 transition-colors" data-testid={`home-award-${i}`}>
                <Trophy size={20} className="text-[#E6C200] mb-4" />
                <p className="font-mono2 text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{a.year} — {a.kind}</p>
                <p className="font-semibold text-base leading-snug">{a.title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="home-tour-teaser">
        <Reveal>
          <SectionHead eyebrow="Dal vivo" title="Prossime Date" linkTo="/tour" linkLabel="Tutte le date" testid="home-tour-link" />
        </Reveal>
        <div className="space-y-3">
          {concerts.slice(0, 3).map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <div className="card-glass rounded-2xl px-6 py-5 flex flex-wrap items-center gap-4 hover:border-[#E10078]/50 transition-colors" data-testid={`home-concert-${i}`}>
                <p className="font-display font-bold text-xl text-[#FF2A85] w-28 flex-none">
                  {new Date(c.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </p>
                <div className="flex-1 min-w-[140px]">
                  <p className="font-semibold">{c.city}</p>
                  <p className="text-xs text-zinc-500">{c.venue}</p>
                </div>
                <span className={`font-mono2 text-[9px] uppercase tracking-widest ${c.status === "Sold out" ? "text-zinc-600" : "text-[#E6C200]"}`}>
                  {c.status}
                </span>
                <Link to="/tour" className="flex-none inline-flex items-center gap-2 text-xs border border-white/15 hover:border-[#E10078] hover:text-[#FF2A85] text-zinc-300 rounded-full px-4 py-2 transition-colors">
                  <Ticket size={13} /> Biglietti
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <TextMarquee items={["Sarah Toscano", "Amarcord", "Sexy Magica", "Sanremo 2025", "Amici 23"]} />

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16" data-testid="home-news-teaser">
        <Reveal>
          <SectionHead eyebrow="Ultimi aggiornamenti" title="Novità" linkTo="/novita" linkLabel="Tutte le novità" testid="home-news-link" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {news.slice(0, 3).map((n, i) => (
            <Reveal key={n.id} delay={i * 0.1}>
              <Link to="/novita" data-testid={`home-news-${i}`} className="group block card-glass rounded-2xl overflow-hidden hover:border-[#E10078]/40 transition-colors h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={n.image} alt={n.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="font-mono2 text-[10px] uppercase tracking-widest text-pink-400 mb-2">{n.category} · {n.date}</p>
                  <p className="font-semibold text-sm leading-snug">{n.title}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20" data-testid="home-cta-final">
        <Reveal>
          <div className="relative card-glass rounded-3xl p-10 md:p-16 overflow-hidden text-center">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E10078]/25 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-pink-400 mb-4">Resta aggiornato</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-6">
                Non perdere nemmeno <span className="text-[#E10078]">una nota</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/novita" className="inline-flex items-center gap-2 bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full px-7 py-3.5 transition-colors">
                  <Newspaper size={16} /> Leggi le novità
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-2 border border-white/20 hover:border-[#E10078] text-zinc-200 text-sm rounded-full px-7 py-3.5 transition-colors">
                  <ShoppingBag size={16} /> Merch ufficiale
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
