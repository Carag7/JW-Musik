# LuD+WT – Einrichtung (einmalig)

## 1. Dateien ins Repo Carag7/JW-Musik hochladen (Hauptverzeichnis, vorhandene ersetzen)

Neu: `ludwt.js`, `lieder.json`, `status.json`, `scrape_lieder.py`, `.github/workflows/update.yml`
Ersetzen: `index.html`, `app.js`, `style.css`, `sw.js`, `wrangler.jsonc`, `src/index.js`

Den Workflow auf GitHub über „Add file → Create new file“ anlegen: ins Namensfeld
`.github/workflows/update.yml` tippen (die Schrägstriche erzeugen die Ordner) und den Inhalt einfügen.

## 2. Token für den Button „Jetzt aktualisieren“ (einmalig)

1. GitHub → Profilbild → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
2. Repository access: „Only select repositories“ → JW-Musik
3. Permissions → Repository permissions → **Actions: Read and write** (Metadata: Read-only kommt automatisch)
4. Token kopieren
5. Cloudflare → Workers & Pages → `musik` → Settings → Variables and Secrets → Add
   - Type **Secret**, Name `GITHUB_TOKEN`, Wert = der Token
   - optional: Type **Secret**, Name `REFRESH_PIN`, Wert = eine PIN; der Button fragt sie dann ab

`GITHUB_REPO` und `GITHUB_BRANCH` stehen schon in `wrangler.jsonc`.

## 3. Erster Lauf

GitHub → Actions → „Lieder aktualisieren“ → Run workflow. Danach läuft es automatisch einmal pro Woche (montags 04:17 UTC).

## Bedienung

- Oben **LuD+WT**: Woche wählen (Standard: aktuelle Woche), die fünf Lieder anzeigen und abspielen.
- ⌕ öffnen → **Synchronisieren**: ganz oben stehen letztes erfolgreiches Update, Anzahl der Wochen,
  „Jetzt aktualisieren“, die aktuelle Woche, „Alle Wochen anzeigen“ (aktuelle Woche in der Mitte) und das Fehlerprotokoll.
- Lieder, die nicht in `songs.json` stehen, erscheinen grau („nicht in der Liederliste“) und werden übersprungen.

## Liegen die Daten auf einer anderen Seite?

Vor `ludwt.js` in `index.html` einfügen: `<script>window.LUDWT_BASE = "https://andere-seite/";</script>`
(die andere Seite muss `lieder.json` und `status.json` mit CORS ausliefern).

## Hinweis (Update Oktober 2026)
- "Jetzt aktualisieren" ist jetzt im Synchronisieren-Fenster hinter dem kleinen "i" der LuD+WT-Box (nur für den Notfall).
- Neue Dateien/Änderungen: index.html, app.js, style.css, ludwt.js, sw.js, src/index.js – alle ersetzen.

## Einmalig einrichten (Cloudflare)

Cloudflare → Workers & Pages → Worker „musik“ → **Einstellungen → Variablen und Geheimnisse → Hinzufügen** (Typ **Geheimnis/Secret**):

| Name | Wert | wofür |
|---|---|---|
| `GITHUB_TOKEN` | Fine-grained Token von GitHub (Repo `Carag7/JW-Musik`, Berechtigung **Actions: Read and write**) | Button „Jetzt aktualisieren“ |
| `REFRESH_PIN` (optional) | eine PIN | schützt diesen Button |
| `WRITE_KEY` (optional) | dein Timecode-Passwort im Klartext | nur wer es kennt, kann Liedtext-Zeiten speichern |

GitHub-Token erzeugen: GitHub → Profilbild → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token → Repository access: nur `JW-Musik` → Permissions → Repository permissions → **Actions: Read and write** → Generate → Wert kopieren.

## Passwörter nicht mehr im Klartext
1. `passwort-hash.html` im Browser öffnen (oder lokal), beide Passwörter eingeben, die erzeugten Zeilen kopieren.
2. In `password.js` die alten Zeilen `APP_PASSWORD` / `TIMECODE_PASSWORD` durch die neuen `..._HASH`-Zeilen ersetzen.
3. `passwort-hash.html` aus dem Repository löschen.
Hinweis: Das hält neugierige Besucher draußen, ist aber kein Tresor (der Hash steht weiter in `password.js`).

## R2-Ordner (Ziel-Struktur)
```
karaoke/audio/   gesungene Karaoke-MP3 (sjjc_E_003.mp3 ...)
karaoke/lrc/     Liedtext-Zeiten dazu (003.lrc)
meeting/audio/   instrumentale MP3 für die Zusammenkünfte
meeting/lrc/     Liedtext-Zeiten für die Instrumental-Fassung (003.lrc)
meeting/video/   MP4-Videos
favoriten/       Sync-Speicher (<name>.json)
```
Aufräumen: Seite `https://musik.carag.workers.dev/r2-aufraeumen.html` öffnen, WRITE_KEY eingeben, „Plan anzeigen“ prüfen, dann „Aufräumen starten“. Es wird kopiert, geprüft und erst dann das Original gelöscht. Die Liednummer wird aus dem Dateinamen gelesen (erste 1–3-stellige Zahl, „720P“ zählt nicht).

## Text und Ton aus den MP4-Videos
`python3 video_zu_lrc.py <Ordner mit Videos> --out ergebnis [--crop 0.55:0.45]`
→ `003.mp3` nach `meeting/audio/`, `003.lrc` nach `meeting/lrc/` hochladen. Einrichtung: `brew install ffmpeg tesseract` und `pip3 install pillow pytesseract`.

## Wenn „Jetzt aktualisieren“ einen Fehler meldet
Die Meldung nennt jetzt die Ursache (Token ohne Zugriff, falscher Workflow-Name, fehlende Berechtigung „Actions: Read and write“). Optionale Variablen in Cloudflare: `GITHUB_WORKFLOW` (Dateiname, falls nicht `update.yml`), `GITHUB_BRANCH`.
