# Test Credentials

## Admin (area editor sito)
- URL: /admin
- Password: `Leonardo.2009`
- Ruolo: admin unico (gate a password, token JWT 12h in localStorage `st_admin_token`)

## Endpoint auth
- POST /api/auth/login { "password": "..." } → { token }
- GET /api/auth/verify (Bearer token)

## Note
- Nessun utente registrabile: il sito è pubblico, solo l'admin modifica i contenuti.
- Chat AI: POST /api/chat { message, session_id } (streaming SSE, Gemini con chiave personale in backend/.env GEMINI_API_KEY)
