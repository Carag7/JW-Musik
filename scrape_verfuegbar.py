#!/usr/bin/env python3
"""
scrape_verfuegbar.py – prüft einmal pro Woche, welche Lieder von „Singt voller Freude“ auf jw.org veröffentlicht sind
und schreibt verfuegbar.json (Liednummer -> Titel + Download-Adressen je Art).

Arten (ohne Kinderlieder), nur für das aktuelle Liederbuch „Sing Out Joyfully“ (Nummern aus der Meetings-Liste sjjm):
  karaoke       Vocals       (pub=sjjc, MP3)
  instrumental  Meetings-Audio = „Instrumental“ (pub=sjjm, MP3)
  video         Meetings-Video (pub=sjjm, MP4, 720p)

Quelle: die offene Medien-Schnittstelle von jw.org (dieselbe, die die Download-Seite
https://www.jw.org/download/?pub=sjjc&... im Hintergrund verwendet). Die Liste aller Lieder (Nummern + Titel)
kommt von der Bibliotheksseite https://www.jw.org/en/library/music-songs/sing-out-joyfully/.
"""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

API = "https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS"
LIBRARY = "https://www.jw.org/en/library/music-songs/sing-out-joyfully/"
LANG = "E"
ARTEN = [
    ("karaoke", "sjjc", "MP3"),
    ("instrumental", "sjjm", "MP3"),
    ("video", "sjjm", "MP4"),
]
OUT = Path(__file__).with_name("verfuegbar.json")
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; JW-Musik wöchentliche Prüfung)", "Accept-Language": "en"}


def nummer_aus_name(name: str):
    name = re.sub(r"\d{3,4}[pP](?![a-zA-Z0-9])", "", name.rsplit("/", 1)[-1].rsplit(".", 1)[0])
    m = re.search(r"(?<!\d)(\d{1,3})(?!\d)", name)
    return int(m.group(1)) if m and int(m.group(1)) > 0 else None


def hole_dateien(pub: str, fmt: str, fehler: list):
    """-> {nummer: {url, titel, groesse}}"""
    params = {"output": "json", "pub": pub, "fileformat": fmt, "alllangs": "0", "langwritten": LANG, "txtCMSLang": LANG, "isBible": "0"}
    try:
        r = requests.get(API, params=params, headers=HEADERS, timeout=40)
        r.raise_for_status()
        data = r.json()
    except Exception as e:  # noqa: BLE001
        fehler.append(f"{pub}/{fmt}: {e}")
        return {}
    eintraege = (((data or {}).get("files") or {}).get(LANG) or {}).get(fmt) or []
    best = {}
    for e in eintraege:
        f = e.get("file") or {}
        url = f.get("url")
        if not url:
            continue
        n = nummer_aus_name(url)
        if n is None and isinstance(e.get("track"), int) and e["track"] > 0:
            n = e["track"]
        if n is None:
            continue
        label = str(e.get("label") or "")
        # bei Videos mehrere Auflösungen: 720p bevorzugen, sonst die größte
        rang = 0 if label.lower() in ("", "0") else int(re.sub(r"\D", "", label) or 0)
        if fmt == "MP4":
            rang = 10000 if label.lower() == "720p" else rang
        alt = best.get(n)
        if alt is None or rang > alt["_rang"]:
            best[n] = {"url": url, "titel": e.get("title") or "", "groesse": e.get("filesize") or 0, "_rang": rang}
    for v in best.values():
        v.pop("_rang", None)
    return best


def hole_bibliothek(fehler: list):
    """-> {nummer: titel} aus der Bibliotheksseite (Fallback: leer)"""
    try:
        r = requests.get(LIBRARY, headers=HEADERS, timeout=40)
        r.raise_for_status()
    except Exception as e:  # noqa: BLE001
        fehler.append(f"Bibliothek: {e}")
        return {}
    out = {}
    for m in re.finditer(r'href="[^"]*/sing-out-joyfully/(\d{1,3})-([a-z0-9\-]+)/?"[^>]*>(.*?)</a>', r.text, re.S | re.I):
        n = int(m.group(1))
        text = re.sub(r"<[^>]+>", " ", m.group(3))
        text = re.sub(r"\s+", " ", text).strip()
        text = re.sub(r"^\d+\.?\s*", "", text)
        out.setdefault(n, text or m.group(2).replace("-", " ").title())
    return out


def main():
    fehler = []
    lieder = {}
    gefunden = {}
    for art, pub, fmt in ARTEN:
        dateien = hole_dateien(pub, fmt, fehler)
        gefunden[art] = len(dateien)
        for n, info in dateien.items():
            eintrag = lieder.setdefault(str(n), {})
            eintrag[art] = {"url": info["url"], "groesse": info["groesse"]}
            if info["titel"] and not eintrag.get("titel"):
                eintrag["titel"] = info["titel"]
    bib = hole_bibliothek(fehler)
    # nur das aktuelle Liederbuch: Nummern aus der Meetings-Audio-Liste (sjjm MP3)
    buch = sorted(int(n) for n, e in lieder.items() if "instrumental" in e)
    if buch:
        erlaubt = {str(n) for n in buch}
        for n in [k for k in lieder if k not in erlaubt]:
            del lieder[n]
        bib = {n: t for n, t in bib.items() if str(n) in erlaubt}
    for n, titel in bib.items():
        eintrag = lieder.setdefault(str(n), {})
        if titel and not eintrag.get("titel"):
            eintrag["titel"] = titel
    if not lieder or not any(gefunden.values()):
        print("Keine Daten erhalten – verfuegbar.json bleibt unverändert.", *fehler, sep="\n  ")
        sys.exit(1)
    gesamt = max([int(k) for k in lieder] + [max(bib) if bib else 0])
    buch = buch or sorted(int(k) for k in lieder)
    result = {
        "stand": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "gesamt": gesamt,
        "buch": buch,
        "gefunden": gefunden,
        "fehler": fehler,
        "lieder": dict(sorted(lieder.items(), key=lambda kv: int(kv[0]))),
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"verfuegbar.json: {len(lieder)} Lieder, gefunden: {gefunden}")
    for f in fehler:
        print("Warnung:", f)


if __name__ == "__main__":
    main()
