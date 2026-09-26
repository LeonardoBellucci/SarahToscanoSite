import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { Instagram, Youtube, Music2, Disc3, Twitter, Menu, X, Megaphone, Lock } from "lucide-react";
import { useContent } from "../lib/content";
import Logo from "./Logo";
import ChatWidget from "./ChatWidget";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/musica", label: "Musica" },
  { to: "/shop", label: "Shop" },
  { to: "/tour", label: "Tour" },
  { to: "/traguardi", label: "Traguardi" },
  { to: "/novita", label: "Novità" },
];

const SOCIAL_ICONS = { instagram: Instagram, tiktok: Music2, youtube: Youtube, spotify: Disc3, twitter: Twitter, x: Twitter };

export function SocialIcon({ name, size = 18 }) {
  const Icon = SOCIAL_ICONS[(name || "").toLowerCase()] || Music2;
  return <Icon size={size} />;
}

function AnnouncementBar() {
  const { content } = useContent();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("st_ann_off") === "1");
  const ann = content?.announcements?.[0];
  if (!ann || dismissed) return null;
  const close = () => {
    sessionStorage.setItem("st_ann_off", "1");
    setDismissed(true);
  };
  const inner = (
    <span className="font-mono2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-white">
      {ann.text}
    </span>
  );
  return (
    <div data-testid="announcement-bar" className="relative z-[60] bg-gradient-to-r from-[#E10078] via-[#FF2A85] to-[#E10078] px-4 py-2.5 flex items-center justify-center gap-4">
      <Megaphone size={14} className="text-white/80 flex-none hidden sm:block" />
      {ann.link ? (
        <Link to={ann.link} data-testid="announcement-link" className="hover:underline underline-offset-4">{inner}</Link>
      ) : inner}
      <button data-testid="announcement-dismiss" onClick={close} aria-label="Chiudi annuncio" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
        <X size={15} />
      </button>
    </div>
  );
}

export default function Layout() {
  const { content } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const socials = content?.socials || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090D]">
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090D]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo-link">
            <Logo size={34} />
            <span className="font-display font-bold tracking-tight text-sm md:text-base uppercase">
              Sarah <span className="text-[#E10078]">Toscano</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                data-testid={`nav-link-${n.label.toLowerCase().replace("à", "a")}`}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors hover:text-[#FF2A85] ${isActive ? "text-[#FF2A85]" : "text-zinc-400"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              data-testid="nav-admin-link"
              className="flex items-center gap-1.5 text-xs font-mono2 uppercase tracking-widest border border-white/15 rounded-full px-3.5 py-1.5 text-zinc-300 hover:border-[#E10078] hover:text-[#FF2A85] transition-colors"
            >
              <Lock size={12} /> Admin
            </Link>
          </div>
          <button className="md:hidden text-zinc-300" onClick={() => setMenuOpen(!menuOpen)} data-testid="nav-menu-toggle" aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0d0d14] px-5 py-4 flex flex-col gap-4" data-testid="nav-mobile-menu">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setMenuOpen(false)} className="text-sm text-zinc-300">
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-[#FF2A85]">
              Area Admin
            </NavLink>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-[#0b0b11] mt-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size={30} />
              <span className="font-display font-bold uppercase tracking-tight">Sarah Toscano</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              La nuova voce del pop italiano. Vincitrice di Amici 23, Sanremo 2025.
            </p>
          </div>
          <div>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-pink-400 mb-4">Seguimi</p>
            <div className="flex flex-wrap gap-3" data-testid="footer-socials">
              {socials.map((s) => (
                <a
                  key={s.id || s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`social-link-${(s.name || "").toLowerCase()}`}
                  aria-label={s.name}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#E10078] hover:bg-[#E10078]/20 transition-all"
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-pink-400 mb-4">Esplora</p>
            <div className="flex flex-col gap-2 text-sm text-zinc-400">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="hover:text-[#FF2A85] transition-colors w-fit">{n.label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center font-mono2 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          © 2026 Sarah Toscano — Tutti i diritti riservati
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
