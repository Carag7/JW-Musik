#!/usr/bin/env python3
"""
video_zu_lrc.py – holt aus Karaoke-MP4-Videos (1) die Tonspur als MP3 und (2) den Text als LRC-Datei.

Der Text wird in dieser Reihenfolge gesucht:
  A. eingebettete Untertitel-Spur im MP4 (genau und schnell)
  B. Texterkennung (OCR) auf den Videobildern: Jedes Bild wird mehrmals pro Sekunde gelesen, der Zeitpunkt,
     an dem eine Textzeile zum ersten Mal erscheint, wird zum Zeitstempel der LRC-Zeile.

Ergebnis pro Video (im Ausgabeordner):
  003.mp3   Tonspur  -> in R2 nach meeting/audio/ hochladen (spielt im Tesla auch während der Fahrt)
  003.lrc   Text     -> in R2 nach meeting/lrc/ hochladen (Name = dreistellige Liednummer)
  003.txt   Bericht: wie der Text gefunden wurde, unsichere Zeilen

Einrichtung (Mac, einmalig):
  brew install ffmpeg tesseract
  pip3 install pillow pytesseract

Aufruf:
  python3 video_zu_lrc.py ordner_mit_videos --out ergebnis
  python3 video_zu_lrc.py lied.mp4 --crop 0.55:0.45        # nur der untere Bildbereich (ab 55 %, 45 % hoch)
  python3 video_zu_lrc.py ordner --fps 5 --lang eng
Tipp: Mit --crop den Bereich wählen, in dem der Text steht – das macht die Erkennung genauer und schneller.
Die Texte sollten danach kurz kontrolliert werden (im Bearbeitungsmodus der Seite lassen sich die Zeiten feinjustieren).
"""
import argparse
import difflib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

VIDEO_EXT = {".mp4", ".m4v", ".mov", ".webm", ".mkv"}


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def song_number(name: str):
    """Gleiche Regel wie auf dem Server: erste 1-3-stellige Zahl, Auflösungen wie 720P werden ignoriert."""
    base = re.sub(r"\.[^.]+$", "", name)
    base = re.sub(r"\d{3,4}[pP](?![a-zA-Z0-9])", "", base)
    m = re.search(r"(?<!\d)(\d{1,3})(?!\d)", base)
    return int(m.group(1)) if m and int(m.group(1)) > 0 else None


def lrc_time(sec: float) -> str:
    sec = max(0.0, sec)
    m = int(sec // 60)
    return f"[{m:02d}:{sec - m * 60:05.2f}]"


def extract_audio(video: Path, target: Path):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-vn", "-c:a", "libmp3lame", "-q:a", "2", str(target)])


def subtitle_lines(video: Path, tmp: Path):
    """A. Eingebettete Untertitel (SRT/WebVTT/mov_text) -> [(sekunden, text)]"""
    try:
        probe = run(["ffprobe", "-v", "error", "-select_streams", "s", "-show_entries", "stream=index", "-of", "json", str(video)])
        if not json.loads(probe.stdout or "{}").get("streams"):
            return []
        srt = tmp / "sub.srt"
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-map", "0:s:0", str(srt)])
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []
    out = []
    for block in re.split(r"\n\s*\n", srt.read_text(encoding="utf-8", errors="ignore")):
        m = re.search(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->", block)
        if not m:
            continue
        t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) + int(m[4].ljust(3, "0")[:3]) / 1000
        text = " ".join(l.strip() for l in block.splitlines()[2:] if l.strip())
        text = re.sub(r"<[^>]+>", "", text).strip()
        if text:
            out.append((t, text))
    return out


def ocr_lines(video: Path, tmp: Path, fps: float, crop, lang: str, invert: bool, min_conf: int):
    """B. Texterkennung auf den Bildern -> [(sekunden, text)] (erstes Erscheinen jeder Zeile)"""
    try:
        from PIL import Image, ImageOps
        import pytesseract
    except ImportError:
        sys.exit("Für die Texterkennung fehlt: pip3 install pillow pytesseract (und brew install tesseract)")
    frames = tmp / "frames"
    frames.mkdir()
    vf = f"fps={fps}"
    if crop:
        top, height = crop
        vf += f",crop=iw:ih*{height}:0:ih*{top}"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-vf", vf, str(frames / "f_%06d.png")])
    files = sorted(frames.glob("f_*.png"))
    tracks = []  # {text, first, hits, last, variants}
    for i, f in enumerate(files):
        t = i / fps
        img = Image.open(f).convert("L")
        if invert:
            img = ImageOps.invert(img)
        img = ImageOps.autocontrast(img)
        if img.width < 1400:
            img = img.resize((img.width * 2, img.height * 2))
        data = pytesseract.image_to_data(img, lang=lang, config="--psm 6", output_type=pytesseract.Output.DICT)
        lines = {}
        for n in range(len(data["text"])):
            word = data["text"][n].strip()
            try:
                conf = float(data["conf"][n])
            except ValueError:
                conf = -1
            if not word or conf < 0:
                continue
            key = (data["block_num"][n], data["par_num"][n], data["line_num"][n])
            lines.setdefault(key, []).append((word, conf))
        for words in lines.values():
            text = " ".join(w for w, _ in words)
            conf = sum(c for _, c in words) / len(words)
            if conf < min_conf or len(re.sub(r"[^A-Za-zÄÖÜäöüß]", "", text)) < 3:
                continue
            best = None
            for tr in tracks:
                if difflib.SequenceMatcher(None, tr["text"].lower(), text.lower()).ratio() >= 0.8:
                    best = tr
                    break
            if best is None:
                tracks.append({"text": text, "first": t, "hits": 1, "last": i, "variants": {text: conf}})
            else:
                best["hits"] += 1
                best["last"] = i
                best["variants"][text] = max(best["variants"].get(text, 0), conf)
    out = []
    for tr in tracks:
        if tr["hits"] < 2:  # einzelne Fehlgriffe verwerfen
            continue
        text = max(tr["variants"].items(), key=lambda kv: kv[1])[0]
        out.append((tr["first"], text))
    out.sort(key=lambda x: x[0])
    return out


def process(video: Path, out_dir: Path, args):
    n = song_number(video.name)
    stem = f"{n:03d}" if n else video.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    report = [f"Video: {video.name}", f"Ausgabe-Name: {stem}"]
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        if not args.no_audio:
            extract_audio(video, out_dir / f"{stem}.mp3")
            report.append("Tonspur: gespeichert")
        lines = [] if args.ocr_only else subtitle_lines(video, tmp)
        method = "Untertitel-Spur"
        if not lines:
            method = "Texterkennung (OCR)"
            crop = tuple(float(x) for x in args.crop.split(":")) if args.crop else None
            lines = ocr_lines(video, tmp, args.fps, crop, args.lang, args.invert, args.min_conf)
        report.append(f"Text-Quelle: {method}, {len(lines)} Zeilen")
        if lines:
            (out_dir / f"{stem}.lrc").write_text("\n".join(f"{lrc_time(t)}{txt}" for t, txt in lines) + "\n", encoding="utf-8")
        else:
            report.append("Kein Text gefunden. Tipp: --crop (Textbereich) oder --invert (helle Schrift auf dunklem Grund) probieren.")
    (out_dir / f"{stem}.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n".join(report))


def main():
    ap = argparse.ArgumentParser(description="Tonspur und Text (LRC) aus Karaoke-Videos holen")
    ap.add_argument("quelle", help="Video oder Ordner mit Videos")
    ap.add_argument("--out", default="ergebnis", help="Ausgabeordner (Standard: ergebnis)")
    ap.add_argument("--fps", type=float, default=4, help="Bilder pro Sekunde für die Texterkennung (Standard 4)")
    ap.add_argument("--crop", help="Textbereich als 'start:höhe' in Bruchteilen der Bildhöhe, z. B. 0.55:0.45")
    ap.add_argument("--lang", default="eng", help="Tesseract-Sprache (eng, deu, ...)")
    ap.add_argument("--invert", action="store_true", help="Bild invertieren (helle Schrift auf dunklem Grund)")
    ap.add_argument("--min-conf", type=int, default=60, help="Mindest-Sicherheit der Erkennung in Prozent (Standard 60)")
    ap.add_argument("--ocr-only", action="store_true", help="Untertitel-Spur ignorieren")
    ap.add_argument("--no-audio", action="store_true", help="keine MP3 erzeugen")
    args = ap.parse_args()
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"{tool} fehlt: brew install ffmpeg")
    src = Path(args.quelle)
    videos = sorted(p for p in src.iterdir() if p.suffix.lower() in VIDEO_EXT) if src.is_dir() else [src]
    if not videos:
        sys.exit("Keine Videos gefunden.")
    for v in videos:
        print(f"--- {v.name}")
        process(v, Path(args.out), args)


if __name__ == "__main__":
    main()
