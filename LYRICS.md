# Texte selbst als LRC

Die App verlinkt die RTF-Dateien, sie kopiert sie nicht.

Beispiel Lied 1: https://github.com/Carag7/JW-Musik/releases/download/JW-Lyrics/sjj_E_01.rtf
Beispiel Lied 100: https://github.com/Carag7/JW-Musik/releases/download/JW-Lyrics/sjj_E_100.rtf

So trägst du die Zeitstempel selbst ein:

1. RTF aus dem Release öffnen.
2. Neue Datei anlegen, zum Beispiel `songs/sjjc_E_001.lrc`.
3. Jede Zeile so schreiben, während die MP3 läuft:

```
[00:05.00]Erste Zeile
[00:10.50]Zweite Zeile
[00:18.75]Dritte Zeile
```

4. Datei ins Repository legen und pushen.
5. In `songs.json` beim Lied `"lyrics": "songs/sjjc_E_001.lrc"` setzen.

Die App hebt dann die Zeile hervor, deren Zeitstempel zur Spielzeit passt. Die RTF-Dateien haben keine Zeiten, die musst du selbst setzen.
