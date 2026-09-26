import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Lock, LogOut, Plus, Pencil, Trash2, X, ArrowLeft, Loader2, Upload } from "lucide-react";
import { api } from "../lib/api";
import Logo from "../components/Logo";

const COLS = {
  announcements: { label: "Annunci", fields: [
    { k: "text", l: "Testo annuncio" },
    { k: "link", l: "Link (opzionale, es. /musica)", opt: true },
    { k: "active", l: "Attivo in home", type: "checkbox" },
  ]},
  products: { label: "Shop", fields: [
    { k: "name", l: "Nome prodotto" },
    { k: "price", l: "Prezzo (es. 59.00)" },
    { k: "tag", l: "Etichetta (es. Nuovo, Limited)", opt: true },
    { k: "image", l: "Immagine prodotto", img: true },
    { k: "buy_url", l: "Link acquisto esterno" },
    { k: "description", l: "Descrizione", type: "textarea" },
  ]},
  awards: { label: "Traguardi", fields: [
    { k: "title", l: "Titolo" },
    { k: "year", l: "Anno" },
    { k: "kind", l: "Tipo", type: "select", options: ["Premio", "Certificazione", "Tappa"] },
    { k: "description", l: "Descrizione", type: "textarea" },
  ]},
  news: { label: "Novità", fields: [
    { k: "title", l: "Titolo" },
    { k: "category", l: "Categoria (es. Musica, Tour)" },
    { k: "date", l: "Data (YYYY-MM-DD)" },
    { k: "image", l: "Immagine articolo", img: true },
    { k: "excerpt", l: "Anteprima breve", type: "textarea" },
    { k: "body", l: "Testo completo", type: "textarea" },
  ]},
  tracks: { label: "Musica", fields: [
    { k: "title", l: "Titolo brano" },
    { k: "year", l: "Anno" },
    { k: "kind", l: "Tipo", type: "select", options: ["Singolo", "Singolo d'esordio", "EP", "Album", "Featuring"] },
    { k: "duration", l: "Durata (es. 3:12)", opt: true },
    { k: "cover", l: "Cover del brano", img: true, opt: true },
    { k: "meaning", l: "Significato del testo", type: "textarea" },
  ]},
  gallery: { label: "Galleria", fields: [
    { k: "image", l: "Foto", img: true },
    { k: "caption", l: "Didascalia", opt: true },
  ]},
  concerts: { label: "Tour", fields: [
    { k: "date", l: "Data (YYYY-MM-DD)" },
    { k: "city", l: "Città" },
    { k: "venue", l: "Locale / Palazzetto" },
    { k: "tickets_url", l: "Link biglietti" },
    { k: "status", l: "Stato", type: "select", options: ["Disponibile", "Ultimi biglietti", "Sold out"] },
  ]},
  socials: { label: "Social", fields: [
    { k: "name", l: "Nome (Instagram, TikTok, YouTube, Spotify...)" },
    { k: "handle", l: "Handle (es. @sarahtoscano)", opt: true },
    { k: "url", l: "URL profilo" },
  ]},
};

const itemTitle = (it) => it.name || it.title || it.text || it.caption || (it.city ? `${it.city} — ${it.date || ""}` : "(senza titolo)");
const itemSub = (it) => (it.price ? `€ ${it.price}` : it.year || it.venue || it.handle || it.category || "");

function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { password });
      localStorage.setItem("st_admin_token", data.token);
      toast.success("Accesso effettuato. Benvenuto nell'editor!");
      onSuccess(data.token);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Password errata");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#09090D] flex items-center justify-center px-4" data-testid="admin-login-page">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-3xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo size={48} />
          <h1 className="font-display font-bold text-xl mt-4">Area Admin</h1>
          <p className="text-xs text-zinc-500 mt-1">Inserisci la password per modificare il sito</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              data-testid="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-[#E10078] transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400 text-center" data-testid="admin-login-error">{error}</p>}
          <button
            type="submit"
            data-testid="admin-login-submit"
            disabled={busy}
            className="w-full bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={14} className="animate-spin" />} Accedi all'editor
          </button>
        </form>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-[#FF2A85] transition-colors">
          <ArrowLeft size={12} /> Torna al sito
        </Link>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("st_admin_token"));
  const [checking, setChecking] = useState(!!localStorage.getItem("st_admin_token"));
  const [tab, setTab] = useState("announcements");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("st_admin_token");
    setToken(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get("/auth/verify")
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [token, logout]);

  const load = useCallback(async (name) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/content/${name}`);
      setItems(data);
    } catch {
      toast.error("Errore nel caricamento");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && !checking) load(tab);
  }, [token, checking, tab, load]);

  if (!token) return checking ? null : <LoginGate onSuccess={(t) => { setToken(t); setChecking(false); }} />;
  if (checking) return null;

  const cfg = COLS[tab];

  const openNew = () => {
    const f = {};
    cfg.fields.forEach((fl) => { f[fl.k] = fl.type === "checkbox" ? false : (fl.options ? fl.options[0] : ""); });
    setForm(f);
    setEditing("new");
  };

  const openEdit = (it) => {
    setForm({ ...it });
    setEditing(it);
  };

  const handleError = (e, fallback = "Operazione non riuscita") => {
    if (e.response?.status === 401) {
      toast.error("Sessione scaduta, accedi di nuovo");
      logout();
    } else {
      const d = e.response?.data?.detail;
      toast.error(typeof d === "string" ? d : fallback);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === "new") await api.post(`/admin/content/${tab}`, form);
      else await api.put(`/admin/content/${tab}/${editing.id}`, form);
      toast.success("Salvato! Il sito è già aggiornato.");
      setEditing(null);
      load(tab);
    } catch (e) {
      handleError(e, "Errore durante il salvataggio");
    }
    setSaving(false);
  };

  const remove = async (it) => {
    if (!window.confirm(`Eliminare "${itemTitle(it)}" definitivamente?`)) return;
    try {
      await api.delete(`/admin/content/${tab}/${it.id}`);
      toast.success("Eliminato");
      load(tab);
    } catch (e) {
      handleError(e);
    }
  };

  const uploadFile = async (fieldKey, file) => {
    if (!file) return;
    setUploading(fieldKey);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      setForm((f) => ({ ...f, [fieldKey]: data.url }));
      toast.success("Foto caricata!");
    } catch (e) {
      handleError(e, "Caricamento foto fallito");
    }
    setUploading(null);
  };

  return (
    <div className="min-h-screen bg-[#09090D]" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b11]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <div>
              <p className="font-display font-bold text-sm leading-none">Editor del sito</p>
              <p className="font-mono2 text-[9px] uppercase tracking-widest text-pink-400 mt-1">Sarah Toscano — Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" data-testid="admin-back-to-site" className="text-xs text-zinc-400 hover:text-[#FF2A85] transition-colors hidden sm:block">
              Vedi il sito
            </Link>
            <button
              onClick={logout}
              data-testid="admin-logout-button"
              className="flex items-center gap-1.5 text-xs border border-white/15 rounded-full px-3.5 py-1.5 text-zinc-300 hover:border-red-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={12} /> Esci
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" data-testid="admin-tabs">
          {Object.entries(COLS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              data-testid={`admin-tab-${key}`}
              className={`flex-none font-mono2 text-[10px] uppercase tracking-widest rounded-full px-4 py-2.5 border transition-colors ${
                tab === key
                  ? "bg-[#E10078] border-[#E10078] text-white"
                  : "border-white/15 text-zinc-400 hover:border-[#E10078]/60 hover:text-pink-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">{cfg.label}</h2>
          <button
            onClick={openNew}
            data-testid="admin-add-button"
            className="flex items-center gap-2 bg-[#E10078] hover:bg-[#FF2A85] text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors"
          >
            <Plus size={15} /> Aggiungi
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#E10078]" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500 py-16 text-center" data-testid="admin-empty">Nessun elemento. Clicca "Aggiungi" per crearne uno.</p>
        ) : (
          <div className="space-y-3" data-testid="admin-items-list">
            {items.map((it, i) => (
              <div key={it.id} className="card-glass rounded-2xl px-5 py-4 flex items-center gap-4" data-testid={`admin-item-${i}`}>
                {(it.image || it.cover) && (
                  <img src={it.image || it.cover} alt="" className="w-12 h-12 rounded-lg object-cover flex-none" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{itemTitle(it)}</p>
                  {itemSub(it) && <p className="font-mono2 text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{itemSub(it)}</p>}
                </div>
                {tab === "announcements" && (
                  <span className={`font-mono2 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full ${it.active ? "bg-green-500/15 text-green-400" : "bg-white/5 text-zinc-500"}`}>
                    {it.active ? "Attivo" : "Bozza"}
                  </span>
                )}
                {tab === "concerts" && it.status && (
                  <span className={`font-mono2 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full ${it.status === "Sold out" ? "bg-white/5 text-zinc-500" : "bg-green-500/15 text-green-400"}`}>
                    {it.status}
                  </span>
                )}
                <button onClick={() => openEdit(it)} data-testid={`admin-edit-${i}`} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-[#E10078] hover:text-[#FF2A85] transition-colors" aria-label="Modifica">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(it)} data-testid={`admin-delete-${i}`} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:border-red-500 hover:text-red-400 transition-colors" aria-label="Elimina">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            data-testid="admin-editor-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="card-glass rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-7 pt-6 pb-2">
                <h3 className="font-display font-bold text-lg">
                  {editing === "new" ? `Nuovo — ${cfg.label}` : `Modifica — ${cfg.label}`}
                </h3>
                <button onClick={() => setEditing(null)} data-testid="admin-editor-close" className="text-zinc-500 hover:text-white transition-colors" aria-label="Chiudi editor">
                  <X size={18} />
                </button>
              </div>
              <div className="px-7 py-4 space-y-4">
                {cfg.fields.map((fl) => (
                  <div key={fl.k}>
                    {fl.type === "checkbox" ? (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          data-testid={`admin-field-${fl.k}`}
                          checked={!!form[fl.k]}
                          onChange={(e) => setForm({ ...form, [fl.k]: e.target.checked })}
                          className="w-4 h-4 accent-[#E10078]"
                        />
                        <span className="text-sm text-zinc-300">{fl.l}</span>
                      </label>
                    ) : (
                      <>
                        <label className="block font-mono2 text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                          {fl.l}{fl.opt ? "" : " *"}
                        </label>
                        {fl.type === "textarea" ? (
                          <textarea
                            data-testid={`admin-field-${fl.k}`}
                            value={form[fl.k] || ""}
                            onChange={(e) => setForm({ ...form, [fl.k]: e.target.value })}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10078] transition-colors resize-y"
                          />
                        ) : fl.type === "select" ? (
                          <select
                            data-testid={`admin-field-${fl.k}`}
                            value={form[fl.k] || fl.options[0]}
                            onChange={(e) => setForm({ ...form, [fl.k]: e.target.value })}
                            className="w-full bg-[#12121C] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10078] transition-colors"
                          >
                            {fl.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            data-testid={`admin-field-${fl.k}`}
                            value={form[fl.k] || ""}
                            onChange={(e) => setForm({ ...form, [fl.k]: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#E10078] transition-colors"
                          />
                        )}
                        {fl.img && (
                          <div className="mt-2 flex items-center gap-3">
                            <label
                              data-testid={`admin-upload-${fl.k}`}
                              className="cursor-pointer inline-flex items-center gap-2 text-xs border border-dashed border-[#E10078]/50 text-pink-300 rounded-full px-4 py-2 hover:bg-[#E10078]/10 transition-colors"
                            >
                              {uploading === fl.k ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                              {uploading === fl.k ? "Caricamento..." : "Carica foto dal dispositivo"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                data-testid={`admin-upload-input-${fl.k}`}
                                onChange={(e) => { uploadFile(fl.k, e.target.files?.[0]); e.target.value = ""; }}
                              />
                            </label>
                            {form[fl.k] && (
                              <img src={form[fl.k]} alt="Anteprima" className="w-10 h-10 rounded-lg object-cover border border-white/10" data-testid={`admin-preview-${fl.k}`} />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-7 pb-7 pt-2 flex gap-3">
                <button
                  onClick={save}
                  data-testid="admin-save-button"
                  disabled={saving || !!uploading}
                  className="flex-1 bg-[#E10078] hover:bg-[#FF2A85] text-white font-semibold text-sm rounded-full py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />} Salva
                </button>
                <button
                  onClick={() => setEditing(null)}
                  data-testid="admin-cancel-button"
                  className="px-6 border border-white/15 text-zinc-300 text-sm rounded-full hover:border-white/40 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
