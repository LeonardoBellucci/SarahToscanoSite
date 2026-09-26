# PRD — Sarah Toscano: Sito Ufficiale & Admin Hub

## Problem statement originale
Sito ufficiale di Sarah Toscano (cantante, vincitrice Amici 23, Sanremo 2025) con: link social, animazioni, banner foto a scorrimento, menu di selezione, shop con prodotti che aprono il link d'acquisto esterno, sezione certificazioni/traguardi (disco d'oro, vittoria Amici), pagina novità, annunci in evidenza in cima alla home, tutto editabile da admin dashboard protetta da password "Leonardo.2009" (aggiungere prodotti shop, certificazioni, foto, ecc.), catalogo musicale con significati dei testi, AI integrata per rispondere a domande su Sarah. Tema scelto: scuro elegante con accenti vivaci. AI con chiave Gemini personale dell'utente.

## Architettura
- Frontend: React 19 + Tailwind + framer-motion + lenis (smooth scroll) + sonner (toast). Router: /, /musica, /shop, /traguardi, /novita, /admin.
- Backend: FastAPI + MongoDB (motor). Collezioni: announcements, products, awards, news, tracks, gallery, socials, chat_messages.
- Auth admin: POST /api/auth/login (password da env ADMIN_PASSWORD) → JWT 12h, Bearer token in localStorage. CRUD protetto: POST/PUT/DELETE /api/admin/content/{collection}.
- AI: POST /api/chat streaming SSE via emergentintegrations LlmChat, Gemini gemini-3-flash-preview, chiave personale in GEMINI_API_KEY, system prompt con bio Sarah, storico in chat_messages.
- Seed automatico all'avvio solo se collezione vuota.

## User personas
- Fan che esplora musica, compra merch, legge novità, chiede info alla Sarah AI.
- Admin (proprietario sito) che aggiorna contenuti da /admin.

## Requisiti core (statici)
1. Home con hero cinetico, annuncio in evidenza, marquee foto, teaser sezioni.
2. Shop vetrina con modal prodotto e link acquisto esterno.
3. Traguardi: timeline premi/certificazioni.
4. Novità: feed con filtri categoria e lettura articolo.
5. Musica: discografia con significato dei testi espandibile.
6. Admin editor completo protetto da password.
7. Chat AI su Sarah (italiano).
8. Social links nel footer.

## Implementato (26/09/2026)
- Tutti gli 8 requisiti core sopra, verificati con curl + screenshot (home 375/768/1366px, admin login/create/delete, shop modal, chat streaming).
- Credenziali: /app/memory/test_credentials.md (admin password Leonardo.2009).

### Iterazione 2 (26/09/2026)
- Sezione Tour (/tour): date, città, locale, stato (Disponibile/Ultimi biglietti/Sold out), pulsante Biglietti esterno; teaser in home; tab "Tour" nell'admin; collezione `concerts`.
- Upload foto diretto nell'editor (object storage Emergent): pulsante "Carica foto" su campi immagine/cover di Shop, Novità, Musica, Galleria; endpoint POST /api/admin/upload + GET /api/files/{path}; max 10MB, solo immagini.
- Link acquisto reali: shop aggiornato a sarahtoscanomerch.it, shop.warnermusic.it/collections/sarah, collab Horda Brand.
- Discografia aggiornata con "Met Gala" e "Atlantide".
- Fix editor: i contenuti pubblici ora si riaggiornano automaticamente a ogni cambio pagina e al ritorno sulla scheda (ContentProvider refetch su location + focus).

## Backlog prioritizzato
- P1: Upload immagini da admin (object storage) invece di URL manuali.
- P1: Date tour/concerti con biglietti.
- P2: Newsletter iscrizione fan.
- P2: Player audio anteprime brani.
- P2: Analytics visite per admin.
- P3: Multilingua (EN).
