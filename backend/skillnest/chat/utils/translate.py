# chat/utils/translate.py
import hashlib
import json
from langdetect import detect, DetectorFactory
import httpx
from django.core.cache import cache

DetectorFactory.seed = 0

MYMEMORY_URL = "https://api.mymemory.translated.net/get"
CACHE_TTL = 60 * 60 * 24  # 24h

def _cache_key_for(text: str, target_lang: str):
    h = hashlib.sha256(f"{text}||{target_lang}".encode("utf-8")).hexdigest()
    return f"translate:{h}"

async def translate_text(text: str, target_lang: str = "en") -> str:
    if not text:
        return text

    key = _cache_key_for(text, target_lang)
    cached = cache.get(key)
    if cached:
        return cached

    try:
        try:
            src = detect(text)
        except Exception:
            src = None

        # if detection fails or detects same as target, force a default
        if not src or src == target_lang:
            src = "es"  # assume Spanish for unknown → adjust as needed

        params = {"q": text, "langpair": f"{src}|{target_lang}"}

        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get(MYMEMORY_URL, params=params)
            if r.status_code == 200:
                data = r.json()
                translated = data.get("responseData", {}).get("translatedText") or text
                cache.set(key, translated, CACHE_TTL)
                return translated

        return text

    except Exception as e:
        # Always log so we can debug next time
        print(f"[translate_text ERROR]: {e}")
        return text
