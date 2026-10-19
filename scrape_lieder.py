#!/usr/bin/env python3
"""Liest die Lieder der Zusammenkünfte von wol.jw.org und schreibt sie nach lieder.json.

Pro Woche (Montag-Sonntag) werden gespeichert:
  * Leben-und-Dienst-Zusammenkunft: 3 Lieder (Anfang, Mitte, Schluss)
  * Wachtturm-Studium:              2 Lieder (Anfang, Schluss)

Abfrage-Optionen (werden nacheinander versucht, bis eine funktioniert):
  Seitenabruf (pro URL):
    1. requests mit Browser-Headern
    2. requests mit frischer Session, Cookies von der Startseite und anderem User-Agent
    3. Headless-Browser (Playwright) - nur mit --browser
  Auffinden der Dokumente (pro Woche):
    A. Wochenseite  /meetings/r10/lp-x/<Jahr>/<Woche>  -> Links zu beiden Dokumenten
    B. Dokument-Kette: ab einem bekannten Dokument den "Weiter"-Links folgen
       (Startwerte: letzte lieder.json bzw. die Dokumente der Woche 19.-25. Oktober 2026)

Aufruf:  python scrape_lieder.py [--weeks 52] [--out lieder.json] [--browser]

Bei jedem Lauf werden ALLE gespeicherten Wochen neu abgefragt und danach so viele zukünftige
Wochen angehängt, wie auf wol.jw.org schon veröffentlicht sind. Alte Wochen werden nie gelöscht.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# --------------------------------------------------------------------------- #
# Einstellungen
# --------------------------------------------------------------------------- #
BASE = "https://wol.jw.org"
LANG = "de"
RSC = "r10/lp-x"
WEEK_URL = f"{BASE}/{LANG}/wol/meetings/{RSC}/{{year}}/{{week}}"
DOC_URL = f"{BASE}/{LANG}/wol/d/{RSC}/{{doc_id}}"
DOC_RE = re.compile(r"/wol/d/r\d+/lp-[a-z]+/(\d+)")

# Bekannte Startwerte für die Dokument-Kette (Montag -> Dokument-ID)
SEEDS = {
    "leben_und_dienst": {"2026-10-19": 202026258},
    "wachtturm": {"2026-10-19": 2026522},
}

# Stichwörter zur Erkennung der Abschnitte auf der Wochenseite (deutsch)
SECTION_KEYS = {
    "leben_und_dienst": ("leben und dienst", "arbeitsheft"),
    "wachtturm": ("wachtturm",),
}
POSITIONS = {
    "leben_und_dienst": ["anfang", "mitte", "schluss"],
    "wachtturm": ["anfang", "schluss"],
}

MONTHS = {
    "januar": 1, "februar": 2, "märz": 3, "april": 4, "mai": 5, "juni": 6,
    "juli": 7, "august": 8, "september": 9, "oktober": 10, "november": 11, "dezember": 12,
}
DASH = r"[-–—‑]"
WORD = r"([A-Za-zÄÖÜäöüß]+)"
LABEL_RANGE_MONTHS = re.compile(rf"(\d{{1,2}})\.\s*{WORD}\s*{DASH}\s*(\d{{1,2}})\.\s*{WORD}")  # 26. Oktober-1. November
LABEL_RANGE_SAME = re.compile(rf"(\d{{1,2}})\.\s*{DASH}\s*(\d{{1,2}})\.\s*{WORD}")             # 19.-25. Oktober
SONG_RE = re.compile(r"^\s*lied\s+(\d{1,3})\s*$", re.I)

UA_CHROME = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
UA_FIREFOX = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


# Protokoll aller fehlgeschlagenen Tests dieses Laufs (landet in status.json)
EVENTS: list[dict] = []
REPORT = True  # nur für die aktuelle Woche protokollieren (spätere Wochen sind oft noch nicht veröffentlicht)


def record(schritt: str, ziel: str, meldung: object) -> None:
    text = " ".join(str(meldung).split())[:400] or "unbekannter Fehler"
    if not REPORT:
        log(f"    Hinweis [{schritt}] {text}")
        return
    EVENTS.append({
        "zeit": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "schritt": schritt,
        "ziel": ziel,
        "meldung": text,
    })
    log(f"    FEHLER [{schritt}] {text}")


# --------------------------------------------------------------------------- #
# Seitenabruf mit Fallbacks
# --------------------------------------------------------------------------- #
class FetchError(Exception):
    pass


def make_session() -> requests.Session:
    s = requests.Session()
    retry = Retry(total=2, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retry))
    return s


class Fetcher:
    def __init__(self, use_browser: bool = False, delay: float = 1.0):
        self.delay = delay
        self.cache: dict[str, str] = {}
        self.strategies = ["requests", "requests_alt"] + (["browser"] if use_browser else [])

    # Option 1
    def _requests(self, url: str) -> str:
        r = make_session().get(url, timeout=30, headers={
            "User-Agent": UA_CHROME,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
        })
        r.raise_for_status()
        r.encoding = "utf-8"
        return r.text

    # Option 2
    def _requests_alt(self, url: str) -> str:
        s = make_session()
        s.headers.update({"User-Agent": UA_FIREFOX, "Accept-Language": "de,en;q=0.5"})
        s.get(f"{BASE}/{LANG}/wol/h/{RSC}", timeout=30)  # Cookies holen
        r = s.get(url, timeout=30, headers={"Referer": f"{BASE}/{LANG}/wol/h/{RSC}"})
        r.raise_for_status()
        r.encoding = "utf-8"
        return r.text

    # Option 3
    def _browser(self, url: str) -> str:
        from playwright.sync_api import sync_playwright  # erst hier importieren (optional)
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(user_agent=UA_CHROME, locale="de-DE")
            page.goto(url, wait_until="networkidle", timeout=60000)
            html = page.content()
            browser.close()
        return html

    @staticmethod
    def _plausible(html: str) -> bool:
        head = html[:4000].lower()
        return len(html) > 1500 and "just a moment" not in head and "cf-chl" not in head

    def get(self, url: str) -> str:
        if url in self.cache:
            return self.cache[url]
        errors = []
        for name in self.strategies:
            try:
                html = getattr(self, f"_{name}")(url)
                if not self._plausible(html):
                    raise FetchError("leere oder blockierte Antwort")
                self.cache[url] = html
                time.sleep(self.delay)
                return html
            except Exception as exc:  # noqa: BLE001 - jede Art von Fehler -> nächste Option
                errors.append(f"{name}: {exc}")
                record(f"Seitenabruf, Option '{name}'", url, exc)
        raise FetchError(f"{url} nicht abrufbar ({'; '.join(errors)})")


# --------------------------------------------------------------------------- #
# Parser
# --------------------------------------------------------------------------- #
def _classify(text: str) -> str | None:
    text = text.lower()
    for kind, keys in SECTION_KEYS.items():
        if any(k in text for k in keys):
            return kind
    return None


def parse_week_page(html: str) -> dict[str, tuple[int, str]]:
    """Wochenseite -> {'leben_und_dienst': (doc_id, url), 'wachtturm': (doc_id, url)}."""
    soup = BeautifulSoup(html, "html.parser")
    found: dict[str, tuple[int, str]] = {}
    section = ""
    for el in soup.find_all(["h1", "h2", "h3", "h4", "a"]):
        if el.name != "a":
            section = el.get_text(" ", strip=True)
            continue
        href = el.get("href", "")
        m = DOC_RE.search(href)
        if not m:
            continue
        kind = _classify(section) or _classify(el.get_text(" ", strip=True))
        if kind and kind not in found:
            found[kind] = (int(m.group(1)), urljoin(BASE, href))
    return found


def label_start(text: str) -> tuple[int, int] | None:
    """Liest 'Tag, Monat' vom Wochenanfang aus Texten wie '19.-25. OKTOBER'."""
    m = LABEL_RANGE_MONTHS.search(text)
    if m and m.group(2).lower() in MONTHS:
        return int(m.group(1)), MONTHS[m.group(2).lower()]
    m = LABEL_RANGE_SAME.search(text)
    if m and m.group(3).lower() in MONTHS:
        return int(m.group(1)), MONTHS[m.group(3).lower()]
    return None


def _root(soup: BeautifulSoup):
    for t in soup(["script", "style"]):
        t.decompose()
    return soup.select_one("#article") or soup.find("article") or soup.body or soup


def matches_week(html: str, monday: date) -> bool:
    text = _root(BeautifulSoup(html, "html.parser")).get_text(" ", strip=True)[:3000]
    return label_start(text) == (monday.day, monday.month)


def _nice(text: str) -> str:
    text = text.strip()
    return text.title() if text.isupper() else text


def parse_doc(html: str, kind: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    root = _root(soup)

    songs: list[tuple[int, str | None]] = []
    for a in root.find_all("a"):
        label = a.get_text(" ", strip=True)
        m = SONG_RE.match(label)
        if not m:
            continue
        title = None
        if kind == "wachtturm" and a.parent is not None:
            rest = a.parent.get_text(" ", strip=True).replace(label, "", 1).strip(" |–-")
            title = rest if 0 < len(rest) <= 60 else None
        songs.append((int(m.group(1)), title))

    if not songs:  # Fallback: reine Textsuche
        for line in root.get_text("\n").splitlines():
            m = re.match(r"^\s*lied\s+(\d{1,3})\b\s*(.*)$", line, re.I)
            if m:
                title = m.group(2).strip(" |") if kind == "wachtturm" else None
                songs.append((int(m.group(1)), title[:60] if title else None))

    names = POSITIONS[kind]
    if kind == "wachtturm" and len(songs) > 2:
        songs = [songs[0], songs[-1]]
    elif kind == "leben_und_dienst" and len(songs) > 3:
        songs = [songs[0], songs[1], songs[-1]]
    if len(songs) != len(names):
        log(f"    Warnung: {len(songs)} statt {len(names)} Lieder gefunden ({kind})")
        names = names[:1] + names[-1:] if len(songs) == 2 else [f"lied_{i + 1}" for i in range(len(songs))]

    heading = root.find("h1" if kind == "wachtturm" else "h2")
    entries = []
    for pos, (num, title) in zip(names, songs):
        entry = {"position": pos, "nummer": num}
        if title:
            entry["titel"] = title
        entries.append(entry)
    return {"lieder": entries, "thema": _nice(heading.get_text(" ", strip=True)) if heading else None}


def next_prev_ids(html: str, current: int) -> tuple[int | None, int | None]:
    """Vorherige/nächste Dokument-ID aus den Navigations-Links (Links ohne Text)."""
    ids = set()
    for a in BeautifulSoup(html, "html.parser").find_all("a", href=True):
        m = DOC_RE.search(a["href"])
        text = a.get_text(" ", strip=True)
        if m and (not text or text.startswith("/")) and int(m.group(1)) != current:
            ids.add(int(m.group(1)))
    nxt = min((i for i in ids if i > current), default=None)
    prv = max((i for i in ids if i < current), default=None)
    return nxt, prv


# --------------------------------------------------------------------------- #
# Auflösen einer Woche
# --------------------------------------------------------------------------- #
def build_part(kind: str, doc_id: int, html: str, method: str) -> dict | None:
    info = parse_doc(html, kind)
    if not info["lieder"]:
        return None
    return {**info, "doc_id": doc_id, "url": DOC_URL.format(doc_id=doc_id), "abfrage": method}


def chain_find(fetcher: Fetcher, monday: date, known: dict[str, int]) -> tuple[int, str] | None:
    """Option B: ab dem nächstgelegenen bekannten Dokument den Weiter/Zurück-Links folgen."""
    if not known:
        return None
    ref = min(known, key=lambda k: abs((date.fromisoformat(k) - monday).days))
    doc_id = known[ref]
    steps = (monday - date.fromisoformat(ref)).days // 7
    for _ in range(abs(steps)):
        html = fetcher.get(DOC_URL.format(doc_id=doc_id))
        nxt, prv = next_prev_ids(html, doc_id)
        doc_id = nxt if steps > 0 else prv
        if doc_id is None:
            return None
    html = fetcher.get(DOC_URL.format(doc_id=doc_id))
    return (doc_id, html) if matches_week(html, monday) else None


def resolve_week(fetcher: Fetcher, monday: date, known: dict[str, dict[str, int]]) -> dict[str, dict]:
    parts: dict[str, dict] = {}
    iso = monday.isocalendar()

    # Option A: Wochenseite
    try:
        page = fetcher.get(WEEK_URL.format(year=iso.year, week=iso.week))
        links = parse_week_page(page)
        if not links:
            record("Wochenseite auswerten", WEEK_URL.format(year=iso.year, week=iso.week),
                   "Seite geladen, aber keine Links zu Leben und Dienst / Wachtturm gefunden")
        for kind, (doc_id, url) in links.items():
            try:
                part = build_part(kind, doc_id, fetcher.get(url), "wochenseite")
                if part:
                    parts[kind] = part
            except FetchError as exc:
                record(f"Dokument lesen ({kind})", url, exc)
    except FetchError as exc:
        record("Wochenseite abrufen", WEEK_URL.format(year=iso.year, week=iso.week), exc)

    # Option B: Dokument-Kette für fehlende Teile
    for kind in POSITIONS:
        if kind in parts:
            continue
        try:
            hit = chain_find(fetcher, monday, known.get(kind, {}))
            part = build_part(kind, hit[0], hit[1], "dokument-kette") if hit else None
            if part:
                parts[kind] = part
        except FetchError as exc:
            record(f"Dokument-Kette ({kind})", "", exc)
    return parts


# --------------------------------------------------------------------------- #
# Hauptprogramm
# --------------------------------------------------------------------------- #
def week_entry(monday: date, parts: dict[str, dict]) -> dict:
    iso = monday.isocalendar()
    sunday = monday + timedelta(days=6)
    entry = {"woche": f"{iso.year}-W{iso.week:02d}", "montag": monday.isoformat(), "sonntag": sunday.isoformat()}
    for kind in POSITIONS:
        if kind in parts:
            entry[kind] = parts[kind]
    entry["playlist"] = [l["nummer"] for kind in POSITIONS for l in parts.get(kind, {}).get("lieder", [])]
    return entry


def write_status(path: Path, ok: bool, fresh: int, trigger: str) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        old = json.loads(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001 - fehlende/kaputte Datei -> neu beginnen
        old = {}
    run = {"zeit": now, "ok": ok, "ausloeser": trigger, "wochen_gefunden": fresh, "fehler": EVENTS}
    status = {
        "letzter_lauf": now,
        "letzter_erfolg": now if ok else old.get("letzter_erfolg"),
        "laeufe": ([run] + old.get("laeufe", []))[:30],  # neueste zuerst, max. 30 Läufe
    }
    path.write_text(json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--weeks", type=int, default=52,
                    help="Obergrenze für zukünftige Wochen (Standard: 52; gestoppt wird früher, sobald nichts mehr veröffentlicht ist)")
    ap.add_argument("--out", default="lieder.json")
    ap.add_argument("--status", default=None, help="Pfad für status.json (Standard: neben --out)")
    ap.add_argument("--browser", action="store_true", help="Playwright-Browser als letzte Option erlauben")
    ap.add_argument("--delay", type=float, default=1.0, help="Pause zwischen Abrufen in Sekunden")
    args = ap.parse_args()

    out = Path(args.out)
    status_path = Path(args.status) if args.status else out.with_name("status.json")
    trigger = os.environ.get("GITHUB_EVENT_NAME", "lokal")
    this_monday = date.today() - timedelta(days=date.today().weekday())
    old = json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
    weeks = {w["montag"]: w for w in old.get("wochen", [])}  # alte Wochen bleiben immer erhalten
    first_monday = min([this_monday] + [date.fromisoformat(k) for k in weeks])
    total_weeks = (this_monday - first_monday).days // 7 + 1 + args.weeks

    known = {k: dict(v) for k, v in SEEDS.items()}
    for w in old.get("wochen", []):
        for kind in POSITIONS:
            if kind in w:
                known[kind][w["montag"]] = w[kind]["doc_id"]

    fetcher = Fetcher(use_browser=args.browser, delay=args.delay)
    fresh: set[str] = set()  # Wochen, die in diesem Lauf wirklich neu abgerufen wurden
    empty_in_a_row = 0
    global REPORT
    for i in range(total_weeks):
        monday = first_monday + timedelta(weeks=i)
        log(f"Woche {monday.isoformat()} ...")
        REPORT = monday == this_monday  # Fehler nur für die aktuelle Woche protokollieren
        parts = resolve_week(fetcher, monday, known)
        if parts:
            fresh.add(monday.isoformat())
        if monday == this_monday:
            for kind in POSITIONS:
                if kind not in parts:
                    record("Aktuelle Woche auswerten", "", f"Keine Lieder für '{kind}' gefunden (Woche {monday.isoformat()})")
        existing = weeks.get(monday.isoformat(), {})
        for kind in POSITIONS:  # Fehlendes aus der alten Datei behalten
            if kind not in parts and kind in existing:
                parts[kind] = existing[kind]
        if not parts:
            log("    nichts gefunden")
            if monday > this_monday:  # zukünftige Wochen: nach 2 leeren in Folge aufhören
                empty_in_a_row += 1
                if empty_in_a_row >= 2:
                    break
            continue
        empty_in_a_row = 0
        weeks[monday.isoformat()] = week_entry(monday, parts)
        for kind, part in parts.items():
            known[kind][monday.isoformat()] = part["doc_id"]
        log(f"    Playlist: {weeks[monday.isoformat()]['playlist']}")

    ok = this_monday.isoformat() in fresh
    result = {
        "version": 1,
        "sprache": LANG,
        "quelle": BASE,
        "aktualisiert": old.get("aktualisiert") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "wochen": [weeks[k] for k in sorted(weeks)],
    }
    if old.get("wochen") != result["wochen"]:
        result["aktualisiert"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        log(f"{out} geschrieben ({len(result['wochen'])} Wochen).")
    else:
        log("Keine Änderungen an den Liedern.")

    write_status(status_path, ok, len(fresh), trigger)
    log("Lauf erfolgreich." if ok else "Lauf FEHLGESCHLAGEN (aktuelle Woche nicht abrufbar).")
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
