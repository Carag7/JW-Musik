# Tesla Karaoke

Karaoke-Web-App für GitHub Pages, Smartphone, Tablet und den Tesla-Browser.

Die MP3s liegen im Release https://github.com/Carag7/JW-Musik/releases/tag/JW-Vocals. GitHub hängt dort `Content-Type: application/octet-stream` und `Content-Disposition: attachment` an. Chrome spielt das oft trotzdem. Safari, Firefox und der Tesla-Browser melden dann Audio-Fehler 4.

Damit es in jedem Browser läuft, müssen die MP3s im Ordner `songs/` des Repositories liegen. GitHub Pages sendet dann `audio/mpeg`. Die App nimmt zuerst `songs/sjjc_E_001.mp3` und nur sonst die Release-URL.

137 Dateien aus dem Release JW-Vocals / Version1 sind eingetragen. Jeder Eintrag hat Nummer und Titel. Die Titel stammen aus der Liederliste, nicht aus nachgedichteten Namen.

Die Strophen aus „Sing Out Joyfully“ to Jehovah—Lyrics Only sind urheberrechtlich geschützt (© 2016 Watch Tower Bible and Tract Society of Pennsylvania) und sind deshalb nicht in diesem Paket. Eigene LRC-Dateien als `songs/sjjc_E_001.lrc` ablegen oder über **LRC laden** öffnen. Favoriten bleiben im Browser unter `localStorage`.

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
