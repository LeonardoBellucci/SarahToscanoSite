from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import json
import uuid
import hmac
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict

import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

COLLECTIONS = ["announcements", "products", "awards", "news", "tracks", "gallery", "socials", "concerts"]

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "sarah-toscano"
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


SARAH_SYSTEM = (
    "Sei l'assistente virtuale ufficiale del sito di Sarah Toscano, giovane cantante pop italiana. "
    "Rispondi SEMPRE in italiano, con tono amichevole ed entusiasta da fan club ufficiale, in massimo 120 parole. "
    "Fatti principali: Sarah Toscano, nata a Cavi di Lavagna (Genova) il 9 giugno 2006. "
    "Vincitrice di Amici di Maria De Filippi 23 (maggio 2024). "
    "Ha partecipato al Festival di Sanremo 2025 con il brano 'Amarcord'. "
    "Singoli principali: '9 Giugno' (esordio), 'Mappa', 'Touché', 'Sexy Magica' (Disco d'Oro FIMI), 'Amarcord' (Disco d'Oro), 'Met Gala', 'Atlantide', 'Tacchi (Fra le Dita)'. "
    "Il sito ha sezioni: Home, Musica (discografia con significati dei testi), Shop (merch ufficiale con link d'acquisto), Traguardi (premi e certificazioni), Tour (date dei concerti con biglietti), Novità. "
    "Se ti chiedono cose che non riguardano Sarah o che non sai, rispondi gentilmente che non hai quell'informazione."
)

IMG = {
    "hero": "https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwb3AlMjBzaW5nZXIlMjBjb25jZXJ0JTIwc3RhZ2UlMjBtaWNyb3Bob25lJTIwbGlnaHRzfGVufDB8fHx8MTc5MDQwODM1Mnww&ixlib=rb-4.1.0&q=85",
    "live": "https://images.unsplash.com/photo-1576967402682-19976eb930f2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw3fHxwb3AlMjBzaW5nZXIlMjBjb25jZXJ0JTIwc3RhZ2UlMjBtaWNyb3Bob25lJTIwbGlnaHRzfGVufDB8fHx8MTc5MDQwODM1Mnww&ixlib=rb-4.1.0&q=85",
    "vinyl_black": "https://images.unsplash.com/photo-1669801158950-f663cf15298c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljJTIwYWxidW0lMjB2aW55bCUyMGNvdmVyfGVufDB8fHx8MTc5MDQwODM1Mnww&ixlib=rb-4.1.0&q=85",
    "vinyl_purple": "https://images.unsplash.com/photo-1619983081563-430f63602796?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHx2aW55bCUyMHJlY29yZCUyMG11c2ljJTIwYWxidW0lMjB2aW55bCUyMGNvdmVyfGVufDB8fHx8MTc5MDQwODM1Mnww&ixlib=rb-4.1.0&q=85",
    "hoodie_black": "https://images.unsplash.com/photo-1572986339313-6fb01aa14717?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHw0fHxwb3AlMjBhcnRpc3QlMjBob29kaWUlMjBob29kaWUlMjBtZXJjaGFuZGlzZSUyMHQtc2hpcnR8ZW58MHx8fHwxNzkwNDA4MzUyfDA&ixlib=rb-4.1.0&q=85",
    "hoodie_white": "https://images.unsplash.com/photo-1616030257764-0fe6a2f05138?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxwb3AlMjBhcnRpc3QlMjBob29kaWUlMjBob29kaWUlMjBtZXJjaGFuZGlzZSUyMHQtc2hpcnR8ZW58MHx8fHwxNzkwNDA4MzUyfDA&ixlib=rb-4.1.0&q=85",
    "gallery": [
        "https://images.unsplash.com/photo-1559228461-4fa1e7eb677c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxjb25jZXJ0JTIwc3RhZ2UlMjBwaW5rJTIwcHVycGxlJTIwbGlnaHRzJTIwc2lsaG91ZXR0ZSUyMGNyb3dkJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1523973740062-18e700e8da35?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxjb25jZXJ0JTIwc3RhZ2UlMjBwaW5rJTIwcHVycGxlJTIwbGlnaHRzJTIwc2lsaG91ZXR0ZSUyMGNyb3dkJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1609800029525-b91fdea39774?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxjb25jZXJ0JTIwc3RhZ2UlMjBwaW5rJTIwcHVycGxlJTIwbGlnaHRzJTIwc2lsaG91ZXR0ZSUyMGNyb3dkJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBwaW5rJTIwcHVycGxlJTIwbGlnaHRzJTIwc2lsaG91ZXR0ZSUyMGNyb3dkJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1561409695-ce8315e7b9a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHw0fHxjb25jZXJ0JTIwc3RhZ2UlMjBwdXJwbGUlMjBwaW5rJTIwbGlnaHRzJTIwY3Jvd2QlMjBzaWxob3VldHRlJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NjJ8MA&ixlib=rb-4.1.0&q=85",
    ],
    "merch": [
        "https://images.unsplash.com/photo-1584049042964-365526ac2862?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxibGFjayUyMHQtc2hpcnQlMjBibGFjayUyMGNhcCUyMHRvdGUlMjBiYWclMjBtdXNpYyUyMHBvc3RlciUyMG1lcmNoYW5kaXNlJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1643096654257-e7e967359a0d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxibGFjayUyMHQtc2hpcnQlMjBibGFjayUyMGNhcCUyMHRvdGUlMjBiYWclMjBtdXNpYyUyMHBvc3RlciUyMG1lcmNoYW5kaXNlJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1577991712260-4ee45603dab8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxibGFjayUyMHQtc2hpcnQlMjBibGFjayUyMGNhcCUyMHRvdGUlMjBiYWclMjBtdXNpYyUyMHBvc3RlciUyMG1lcmNoYW5kaXNlJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1569044730150-ac0e547bee49?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBibGFjayUyMGNhcCUyMHRvdGUlMjBiYWclMjBtdXNpYyUyMHBvc3RlciUyMG1lcmNoYW5kaXNlJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
    ],
    "covers": [
        "https://images.unsplash.com/photo-1746470320824-6491a582096d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w8NjAzMjh8MHwxfHNlYXJjaHw0fHxuZW9uJTIwcGluayUyMGFsYnVtJTIwY292ZXIlMjBhcnQlMjBhYnN0cmFjdCUyMGRhcmslMjBzeW50aHdhdmUlMjBuZW9uJTIwZ29sZHxlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1764258560295-21e74c3d0d15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHx2aW55bCUyMGFsYnVtJTIwYXJ0d29yayUyMG5lb24lMjBkYXJrJTIwc3ludGh3YXZlJTIwbWFnZW50YSUyMGdvbGR8ZW58MHx8fDE3OTA0MDg0ODd8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1634146330658-b052db81cd15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxuZW9uJTIwcGluayUyMGFsYnVtJTIwY292ZXIlMjBhcnQlMjBhYnN0cmFjdCUyMGRhcmslMjBzeW50aHdhdmUlMjBuZW9uJTIwZ29sZHxlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1727004795721-45878cee0d29?crop=entropy&cs=srgb&fm=jpg&ixid=M3w8NjAzMjh8MHwxfHNlYXJjaHwyfHxuZW9uJTIwcGluayUyMGFsYnVtJTIwY292ZXIlMjBhcnQlMjBhYnN0cmFjdCUyMGRhcmslMjBzeW50aHdhdmUlMjBuZW9uJTIwZ29sZHxlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
    ],
    "news": [
        "https://images.unsplash.com/photo-1623055878129-928642e334d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw3fHxnb2xkJTIwYXdhcmQlMjB0cm9waHklMjBzdHVkaW8lMjBtaWNyb3Bob25lJTIwYmFja3N0YWdlJTIwc2luZ2VyJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1648538836903-aa4e9ea103ac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw0fHxnb2xkJTIwYXdhcmQlMjB0cm9waHklMjBzdHVkaW8lMjBtaWNyb3Bob25lJTIwYmFja3N0YWdlJTIwc2luZ2VyJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1526398977052-654221a252b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxnb2xkJTIwYXdhcmQlMjB0cm9waHklMjBzdHVkaW8lMjBtaWNyb3Bob25lJTIwYmFja3N0YWdlJTIwc2luZ2VyJTIwZGFya3xlbnwwfHx8fDE3OTA0MDg0NzB8MA&ixlib=rb-4.1.0&q=85",
    ],
}

SEEDS = {
    "announcements": [
        {"text": "NUOVO SINGOLO 'TACCHI (FRA LE DITA)' FUORI OVUNQUE", "link": "/musica", "active": True},
    ],
    "products": [
        {"name": "Felpa Nera 'Sexy Magica'", "price": "59.00", "tag": "Best Seller", "image": IMG["hoodie_black"], "buy_url": "https://sarahtoscanomerch.it/", "description": "Felpa oversize nera in cotone pesante con stampa logo Sexy Magica sul retro e monogramma ST sul petto."},
        {"name": "Hoodie Bianca 'Amarcord'", "price": "59.00", "tag": "Nuovo", "image": IMG["hoodie_white"], "buy_url": "https://sarahtoscanomerch.it/", "description": "Hoodie bianca edizione Sanremo 2025, stampa Amarcord dorata e interno felpato."},
        {"name": "Vinile 45 Giri 'Amarcord'", "price": "24.00", "tag": "Limited", "image": IMG["vinyl_purple"], "buy_url": "https://shop.warnermusic.it/collections/sarah", "description": "Vinile colorato edizione limitata del brano sanremese, con inner sleeve autografata."},
        {"name": "Vinile Nero 'Riflessi'", "price": "29.00", "tag": "Esclusivo", "image": IMG["vinyl_black"], "buy_url": "https://shop.warnermusic.it/collections/sarah", "description": "LP nero 180g con tutti i singoli dal 2023 a oggi, gatefold con foto esclusive dal tour."},
        {"name": "T-Shirt 'Tour 2025'", "price": "35.00", "tag": "", "image": IMG["merch"][0], "buy_url": "https://sarahtoscanomerch.it/", "description": "T-shirt nera con date del tour stampate sul retro in rosa magenta."},
        {"name": "Cappellino 'ST' Ricamato", "price": "25.00", "tag": "", "image": IMG["merch"][1], "buy_url": "https://sarahtoscanomerch.it/", "description": "Cappellino nero con monogramma ST ricamato in filo oro."},
        {"name": "Poster 'Sanremo 2025'", "price": "19.00", "tag": "Autografato", "image": IMG["merch"][2], "buy_url": "https://sarahtoscanomerch.it/", "description": "Poster 50x70 del look di Sarah all'Ariston, tiratura numerata."},
    ],
    "awards": [
        {"title": "Vittoria Amici di Maria De Filippi 23", "year": "2024", "kind": "Premio", "description": "Il 18 maggio 2024 Sarah vince la ventitreesima edizione di Amici, conquistando il pubblico con la sua voce e la sua autenticità."},
        {"title": "Disco d'Oro — 'Sexy Magica'", "year": "2024", "kind": "Certificazione", "description": "Certificazione FIMI per oltre 50.000 unità vendute del singolo estivo Sexy Magica."},
        {"title": "Festival di Sanremo 2025 — 'Amarcord'", "year": "2025", "kind": "Tappa", "description": "Debutto sul palco dell'Ariston nella sezione Campioni con il brano Amarcord."},
        {"title": "Disco d'Oro — 'Amarcord'", "year": "2025", "kind": "Certificazione", "description": "Seconda certificazione FIMI Oro in carriera per il brano presentato a Sanremo."},
    ],
    "news": [
        {"title": "Nuovo singolo 'Tacchi (Fra le Dita)' fuori ora", "category": "Musica", "date": "2026-06-20", "image": IMG["news"][2], "excerpt": "Il nuovo capitolo pop di Sarah è arrivato: un brano sull'amore imperfetto e sulle scarpe lasciate in giro.", "body": "Dopo il successo di Amarcord, Sarah Toscano torna con 'Tacchi (Fra le Dita)', un singolo che mescola pop elettronico e confessioni da diario. Il brano racconta le relazioni che restano addosso come i tacchi lasciati in giro per casa. Prodotto tra Milano e Londra, anticipa il primo album atteso per l'autunno."},
        {"title": "'Amarcord' certificata Disco d'Oro", "category": "Certificazioni", "date": "2025-04-10", "image": IMG["news"][0], "excerpt": "La FIMI certifica Oro il brano portato da Sarah al Festival di Sanremo 2025.", "body": "A due mesi dal Festival, 'Amarcord' supera le 50.000 unità e ottiene la certificazione FIMI Disco d'Oro. Un traguardo che conferma Sarah tra le voci più solide della nuova scena pop italiana."},
        {"title": "Sarah debutta al Festival di Sanremo 2025", "category": "Sanremo", "date": "2025-02-11", "image": IMG["news"][1], "excerpt": "Da Amici all'Ariston: Sarah calca per la prima volta il palco più importante della musica italiana.", "body": "A febbraio 2025 Sarah Toscano debutta al Festival di Sanremo con 'Amarcord', brano dedicato alla memoria e alle radici liguri. Cinque serate all'Ariston che segnano il suo ingresso ufficiale tra i grandi nomi della musica italiana."},
        {"title": "Il trionfo ad Amici 23", "category": "Premi", "date": "2024-05-18", "image": IMG["news"][0], "excerpt": "La finale che ha cambiato tutto: Sarah vince la ventitreesima edizione di Amici di Maria De Filippi.", "body": "Dopo mesi di esibizioni, sfide e crescita, il 18 maggio 2024 Sarah Toscano alza la coppa di Amici 23. Una vittoria costruita con costanza, emozione e una voce capace di arrivare dritta al pubblico."},
    ],
    "tracks": [
        {"title": "Tacchi (Fra le Dita)", "year": "2026", "kind": "Singolo", "duration": "3:05", "cover": IMG["covers"][0], "meaning": "Un pop scintillante che parla delle relazioni che lasciano segni invisibili: i tacchi fra le dita sono il ricordo di chi è passato nella nostra vita e ha lasciato qualcosa di sé."},
        {"title": "Atlantide", "year": "2026", "kind": "Singolo", "duration": "3:09", "cover": IMG["covers"][3], "meaning": "Un tuffo nell'oceano delle emozioni: Atlantide è il luogo sommerso dove finiscono le parole non dette, e dove bisogna immergersi per ritrovarsi."},
        {"title": "Met Gala", "year": "2025", "kind": "Singolo", "duration": "2:56", "cover": IMG["covers"][2], "meaning": "Il brano della svolta: un invito a brillare sotto i riflettori restando sé stessi, tra tappeti rossi immaginari e insicurezze vere."},
        {"title": "Amarcord", "year": "2025", "kind": "Singolo · Sanremo 2025", "duration": "3:24", "cover": IMG["covers"][1], "meaning": "Omaggio alla memoria felliniana e alle radici: un viaggio nei ricordi d'infanzia in Liguria, tra il mare d'inverno e le voci di casa. Disco d'Oro FIMI."},
        {"title": "Sexy Magica", "year": "2024", "kind": "Singolo", "duration": "2:58", "cover": IMG["covers"][2], "meaning": "Il singolo dell'estate 2024: un inno alla libertà di essere se stessi, magnetici e imperfetti. Primo Disco d'Oro della carriera di Sarah."},
        {"title": "Touché", "year": "2024", "kind": "Singolo", "duration": "3:11", "cover": IMG["covers"][3], "meaning": "Un duello d'amore raccontato come una scherma di parole: ogni stoccata è un sentimento che non si riesce a trattenere."},
        {"title": "Mappa", "year": "2024", "kind": "Singolo", "duration": "3:02", "cover": IMG["covers"][0], "meaning": "La prima canzone dopo la vittoria di Amici: una mappa emotiva per ritrovarsi quando tutto cambia troppo in fretta."},
        {"title": "9 Giugno", "year": "2023", "kind": "Singolo d'esordio", "duration": "3:18", "cover": IMG["covers"][1], "meaning": "Il giorno del suo compleanno diventa una canzone: il punto di partenza di tutto, scritta prima che il sogno diventasse realtà."},
    ],
    "gallery": [
        {"image": IMG["gallery"][0], "caption": "Live — Milano 2025"},
        {"image": IMG["gallery"][1], "caption": "Luci magenta sul palco"},
        {"image": IMG["gallery"][2], "caption": "Il pubblico di Sarah"},
        {"image": IMG["gallery"][3], "caption": "Soundcheck prima del live"},
        {"image": IMG["gallery"][4], "caption": "Finale di concerto"},
        {"image": IMG["live"], "caption": "Sul palco dell'Ariston"},
    ],
    "socials": [
        {"name": "Instagram", "handle": "@sarahtoscano", "url": "https://www.instagram.com/sarahtoscano"},
        {"name": "TikTok", "handle": "@sarahtoscano", "url": "https://www.tiktok.com/@sarahtoscano"},
        {"name": "YouTube", "handle": "Sarah Toscano", "url": "https://www.youtube.com/@SarahToscano"},
        {"name": "Spotify", "handle": "Sarah Toscano", "url": "https://open.spotify.com/search/Sarah%20Toscano"},
    ],
    "concerts": [
        {"date": "2026-10-18", "city": "Milano", "venue": "Fabrique", "tickets_url": "https://www.ticketone.it/search/?q=Sarah%20Toscano", "status": "Ultimi biglietti"},
        {"date": "2026-10-22", "city": "Roma", "venue": "Atlantico", "tickets_url": "https://www.ticketone.it/search/?q=Sarah%20Toscano", "status": "Disponibile"},
        {"date": "2026-10-25", "city": "Napoli", "venue": "Casa della Musica", "tickets_url": "https://www.ticketone.it/search/?q=Sarah%20Toscano", "status": "Disponibile"},
        {"date": "2026-10-29", "city": "Torino", "venue": "Hiroshima Mon Amour", "tickets_url": "https://www.ticketone.it/search/?q=Sarah%20Toscano", "status": "Sold out"},
        {"date": "2026-11-05", "city": "Bologna", "venue": "Estragon", "tickets_url": "https://www.ticketone.it/search/?q=Sarah%20Toscano", "status": "Disponibile"},
    ],
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class LoginRequest(BaseModel):
    password: str


class ChatRequest(BaseModel):
    message: str
    session_id: str = "ospite"


@api_router.get("/")
async def root():
    return {"message": "Sarah Toscano API online"}


@api_router.post("/auth/login")
async def login(req: LoginRequest):
    if not hmac.compare_digest(req.password.encode(), os.environ["ADMIN_PASSWORD"].encode()):
        raise HTTPException(status_code=401, detail="Password errata")
    token = jwt.encode(
        {"sub": "admin", "type": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=12)},
        os.environ["JWT_SECRET"], algorithm="HS256",
    )
    return {"token": token, "role": "admin"}


async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Non autenticato")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Token non valido")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessione scaduta, accedi di nuovo")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token non valido")


@api_router.get("/auth/verify")
async def verify(admin=Depends(require_admin)):
    return {"ok": True, "role": "admin"}


@api_router.get("/content")
async def get_all_content():
    out = {}
    for name in COLLECTIONS:
        query = {"active": True} if name == "announcements" else {}
        out[name] = await db[name].find(query, {"_id": 0}).to_list(500)
    return out


@api_router.get("/content/{name}")
async def get_collection(name: str):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collezione non trovata")
    return await db[name].find({}, {"_id": 0}).to_list(500)


@api_router.post("/admin/content/{name}")
async def create_item(name: str, payload: Dict[str, Any], admin=Depends(require_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collezione non trovata")
    doc = dict(payload)
    doc.pop("id", None)
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db[name].insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/content/{name}/{item_id}")
async def update_item(name: str, item_id: str, payload: Dict[str, Any], admin=Depends(require_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collezione non trovata")
    doc = dict(payload)
    doc.pop("id", None)
    doc.pop("_id", None)
    doc["updated_at"] = now_iso()
    res = await db[name].update_one({"id": item_id}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    return await db[name].find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/admin/content/{name}/{item_id}")
async def delete_item(name: str, item_id: str, admin=Depends(require_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collezione non trovata")
    res = await db[name].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    return {"ok": True}


ALLOWED_UPLOAD = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), admin=Depends(require_admin)):
    if file.content_type not in ALLOWED_UPLOAD:
        raise HTTPException(status_code=400, detail="Formato non supportato: usa JPG, PNG, WEBP o GIF")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File troppo grande (max 10 MB)")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    path = f"{APP_NAME}/uploads/admin/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, file.content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "is_deleted": False,
        "created_at": now_iso(),
    })
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File non trovato")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


@api_router.post("/chat")
async def chat(req: ChatRequest):
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    await db.chat_messages.insert_one({
        "session_id": req.session_id, "role": "user", "text": req.message, "ts": now_iso(),
    })

    async def event_stream():
        full = ""
        try:
            llm = LlmChat(
                api_key=os.environ["GEMINI_API_KEY"],
                session_id=req.session_id,
                system_message=SARAH_SYSTEM,
            ).with_model("gemini", "gemini-3-flash-preview")
            async for ev in llm.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content}, ensure_ascii=False)}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.error("chat error: %s", e)
            yield f"data: {json.dumps({'error': 'Assistente momentaneamente non disponibile.'}, ensure_ascii=False)}\n\n"
        if full:
            await db.chat_messages.insert_one({
                "session_id": req.session_id, "role": "assistant", "text": full, "ts": now_iso(),
            })
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def seed_content():
    for name, docs in SEEDS.items():
        if await db[name].count_documents({}) == 0:
            for d in docs:
                doc = dict(d)
                doc["id"] = str(uuid.uuid4())
                doc["created_at"] = now_iso()
                await db[name].insert_one(doc)
            logger.info("seeded %s (%d)", name, len(docs))
    try:
        init_storage()
        logger.info("storage initialized")
    except Exception as e:
        logger.error("storage init failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
