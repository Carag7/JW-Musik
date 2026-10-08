# Tesla Karaoke

Karaoke-Web-App für GitHub Pages, Smartphone, Tablet und den Tesla-Browser.

Die MP3s werden nicht ins Repository kopiert. `songs.json` zeigt auf das vorhandene Release **JW-Vocals / Version1**:

`https://github.com/Carag7/karaoke-app/releases/download/Version1/sjjc_E_001.mp3`

137 Dateien aus diesem Release sind eingetragen. Titel 1–30 stammen aus der öffentlichen Liederliste „Sing Out Joyfully“ to Jehovah. Ab Lied 31 steht vorerst „Lied N“, damit kein falscher Titel erfunden wird.

Liedtexte sind urheberrechtlich geschützt und deshalb nicht enthalten. Lege eigene `.lrc`-Dateien ab oder lade sie in der App über **LRC laden**.

## Dateien

```
index.html
style.css
app.js
manifest.json
sw.js
icon.svg
songs.json
songs/beispiel.lrc
```

## Bedienung

- Links: Suche nach Nummer oder Titel, Favoriten
- Play, Pause, Vor, Zurück, Fortschrittsbalken
- Aktive LRC-Zeile wird gold hervorgehoben und in die Mitte gescrollt
- A− / A+ für die Tesla-Schrift
- Vollbild und Bildschirm-Wachhalten beim Abspielen, soweit der Browser das kann

Nicht als `file://` öffnen. `fetch` braucht einen Webserver.

```bash
python3 -m http.server 8080
```

## Neues Lied

1. MP3 ins Release oder nach `songs/` legen.
2. LRC im Format `[mm:ss.xx]Text` als `songs/sjjc_E_012.lrc` speichern.
3. In `songs.json` einen Eintrag ergänzen:

```json
{
  "id": "012",
  "number": 12,
  "title": "Mein Titel",
  "category": "Sing Out Joyfully",
  "audio": "songs/lied012.mp3",
  "lyrics": "songs/lied012.lrc"
}
```

Relative Pfade gehen für eigene Dateien. Release-URLs gehen für die schon hochgeladenen MP3s.

## GitHub Pages

Repository öffentlich, Branch `main`, Ordner `/ (root)`, dann speichern. Die Seite liegt unter `https://carag7.github.io/karaoke-app/`.

## Tesla

Im Browser des Autos die Pages-URL öffnen, Lied antippen, **Vollbild**, Schrift mit A+ vergrößern. Der Tesla-Browser installiert PWAs nicht zuverlässig. Online reicht. Der Service Worker speichert nur die App-Oberfläche, nicht die MP3s.
