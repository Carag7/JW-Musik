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
