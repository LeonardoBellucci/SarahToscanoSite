# Tutorial: Pubblicare il sito GRATIS su Vercel + Render + MongoDB Atlas

Tempo stimato: 30-45 minuti. Costo: 0 €. Nessun branding Emergent.

## Come funziona
- **Vercel** (gratis): ospita il sito pubblico (frontend)
- **Render** (gratis): ospita il cervello del sito (backend Python: editor admin, chat AI)
- **MongoDB Atlas** (gratis): ospita il database (contenuti del sito)

**Limiti del gratis:** il backend su Render "dorme" dopo 15 minuti senza visite: il primo visitatore aspetta 30-60 secondi, poi tutto va veloce. Il caricamento diretto delle foto dall'editor NON funzionerà fuori da Emergent (usa link immagine). Password admin e chat AI funzionano normalmente.

---

## PASSO 1 — Metti il codice su GitHub (10 min)

1. Vai su https://github.com e crea un account gratuito (se non ce l'hai)
2. Clicca **+** in alto a destra → **New repository**
3. Nome: `sarah-toscano-sito` → **Public** → **Create repository**
4. Nella pagina che si apre clicca **"uploading an existing file"**
5. Estrai lo ZIP del sito sul tuo computer. Trascina nella pagina GitHub TUTTE le cartelle e file dello ZIP, **TRANNE questi file (NON caricarli MAI, contengono le tue password):**
   - `backend/.env`
   - `frontend/.env`
   - il file ZIP stesso
6. Clicca **Commit changes** in fondo

---

## PASSO 2 — Database gratis su MongoDB Atlas (10 min)

1. Vai su https://cloud.mongodb.com → **Sign up** (gratis, anche con Google)
2. Crea un progetto (nome a piacere) → **Create a deployment** → scegli **M0 FREE** → regione Frankfurt → **Create**
3. Ti chiede di creare un utente: scegli username e password (semplici, senza caratteri speciali) e **SEGNATELI**
4. In "Network Access": **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) → conferma
5. Vai su **Database** → **Connect** → **Drivers** → copia la stringa di connessione, tipo:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
   Sostituisci `<username>` e `<password>` con quelli del punto 3

---

## PASSO 3 — Backend su Render (10 min)

1. Vai su https://render.com → **Sign up** con GitHub
2. **New +** → **Web Service** → collega il repo `sarah-toscano-sito`
3. Compila così:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** **Free**
4. In **Environment Variables** aggiungi (Add Environment Variable per ognuna):
   - `MONGO_URL` = la stringa di Atlas del Passo 2
   - `DB_NAME` = `sarah_toscano`
   - `ADMIN_PASSWORD` = `Leonardo.2009`
   - `JWT_SECRET` = `9f2c7a41d8b6e0531f7c4a9d2e8b6f1053a7c9d4e2f8b1a6c3d5e7f90182b4a6`
   - `GEMINI_API_KEY` = la tua chiave Gemini (quella che mi hai dato)
   - `CORS_ORIGINS` = `*` (poi la restringiamo)
5. **Deploy Web Service** → aspetta 3-5 minuti
6. In alto trovi l'URL tipo `https://sarah-toscano-sito.onrender.com` → **SEGNALO**
7. Prova: apri `https://TUO.onrender.com/api/` → deve rispondere `{"message":"Sarah Toscano API online"}`

---

## PASSO 4 — Frontend su Vercel (5 min)

1. Vai su https://vercel.com → **Sign up** con GitHub
2. **Add New...** → **Project** → **Import** il repo `sarah-toscano-sito`
3. Compila così:
   - **Root Directory:** clicca Edit → scegli `frontend`
   - **Framework Preset:** Create React App (lo riconosce da solo)
   - Build/Output: lascia quelli automatici
4. Apri **Environment Variables** e aggiungi:
   - `REACT_APP_BACKEND_URL` = `https://sarah-toscano-sito.onrender.com` (l'URL di Render del Passo 3, SENZA barra finale)
5. **Deploy** → aspetta 2-3 minuti
6. Vercel ti dà l'URL tipo `https://sarah-toscano-sito.vercel.app` → il sito è online!

---

## PASSO 5 — Ultimi ritocchi (5 min)

1. Su **Render** → il tuo servizio → **Environment** → modifica `CORS_ORIGINS` mettendo l'URL Vercel: `https://sarah-toscano-sito.vercel.app` → salva (fa redeploy da solo)
2. Apri l'URL Vercel: controlla che home, shop, tour, musica si vedano
3. Vai su `/admin`, entra con la password e prova ad aggiungere qualcosa
4. Prova la chat Sarah AI (usa la tua chiave Gemini)

## Problemi frequenti
- **Sito bianco o errore nel caricare i contenuti** → controlla che `REACT_APP_BACKEND_URL` su Vercel sia l'URL Render esatto e che il backend risponda su `/api/`
- **Il primo caricamento è lentissimo** → normale: è il "risveglio" di Render free
- **Il login admin dice "Non autenticato" subito** → CORS_ORIGINS su Render deve contenere l'URL Vercel esatto (senza barra finale)
- **"Carica foto" non funziona** → previsto fuori da Emergent: incolla il link dell'immagine nel campo testo (puoi caricare foto gratis su https://postimages.org e copiare il "Direct link")
- **Vuoi il dominio tuo (es. sarahtoscano.it)** → su Vercel: Settings → Domains → aggiungi il dominio e segui le istruzioni DNS (dominio a parte, ~10 €/anno)
