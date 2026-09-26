import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { API } from "../lib/api";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ciao! Sono l'assistente ufficiale di Sarah. Chiedimi tutto su musica, testi, concerti e traguardi!" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("st_chat_session");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("st_chat_session", id);
    }
    return id;
  });

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const pushDelta = (delta) =>
    setMessages((m) => {
      const c = [...m];
      c[c.length - 1] = { role: "assistant", text: c[c.length - 1].text + delta };
      return c;
    });

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          if (!p.startsWith("data:")) continue;
          const data = p.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const j = JSON.parse(data);
            if (j.delta) pushDelta(j.delta);
            if (j.error) pushDelta(j.error);
          } catch { /* ignore partial chunk */ }
        }
      }
    } catch {
      pushDelta("Connessione non riuscita. Riprova tra poco.");
    }
    setBusy(false);
  };

  return (
    <>
      <motion.button
        data-testid="chat-open-button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-gradient-to-br from-[#FF2A85] to-[#E10078] glow-magenta flex items-center justify-center text-white ${open ? "hidden" : ""}`}
        aria-label="Apri assistente Sarah AI"
      >
        <Sparkles size={22} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="chat-panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[70] w-[92vw] max-w-sm h-[480px] card-glass rounded-2xl overflow-hidden flex flex-col border border-[#E10078]/30"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#E10078] to-[#FF2A85]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <div>
                  <p className="text-sm font-semibold leading-none">Sarah AI</p>
                  <p className="text-[10px] text-white/70 font-mono2 uppercase tracking-widest mt-0.5">Assistente ufficiale</p>
                </div>
              </div>
              <button data-testid="chat-close-button" onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Chiudi chat">
                <X size={18} />
              </button>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="chat-message-list">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#E10078] text-white rounded-br-md"
                        : "bg-white/5 border border-white/10 text-zinc-200 rounded-bl-md"
                    }`}
                  >
                    {m.text || (busy && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin" /> : "")}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Chiedi qualcosa su Sarah..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#E10078] transition-colors placeholder:text-zinc-600"
              />
              <button
                data-testid="chat-send-button"
                onClick={send}
                disabled={busy}
                className="w-10 h-10 rounded-full bg-[#E10078] flex items-center justify-center text-white hover:bg-[#FF2A85] transition-colors disabled:opacity-50"
                aria-label="Invia messaggio"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
