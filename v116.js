/* v116: Sprache der Musik (DE/EN), Warnung bei unpassendem Cover, Startseite mit Anzeige-Arten (Karussell, Überblenden, Schweben),
 * lang auf × drücken = zurück zur Startseite, Lied zu Wiedergabeliste hinzufügen, Wiedergabe auf anderes Gerät (Cast). */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const lupe = () => document.body.classList.contains("glass-open");
  const lang = () => (lsv("musikLang", "en") === "de" ? "de" : "en");
  const NAME = { de: "Deutsch", en: "Englisch" };
  const C = () => window.COVERS;
  const cur = () => state.songs[state.index] || null;
  const numOf = (s) => { const n = parseInt(s && (s.number != null ? s.number : s.id), 10); return n > 0 ? n : 0; };

  /* ---------- Sprache der Musik ---------- */
  const langBtns = new Set();
  function paintLang(b) {
    const l = lang();
    b.textContent = l.toUpperCase();
    b.title = l === "de" ? "Musik: Deutsch – antippen für Englisch" : "Musik: Englisch – antippen für Deutsch";
    b.setAttribute("aria-label", b.title);
  }
  function langBtn(cls) {
    const b = h("button", `lang-mini${cls ? " " + cls : ""}`); b.type = "button";
    b.addEventListener("click", (e) => { e.stopPropagation(); switchLang(lang() === "de" ? "en" : "de"); });
    langBtns.add(b); paintLang(b);
    return b;
  }
  const paintAllLang = () => { langBtns.forEach((b) => { if (b.isConnected) paintLang(b); else langBtns.delete(b); }); const s = $("advMusikLang"); if (s) s.value = lang(); };
  async function applyLang(next) {
    lss("musikLang", next);
    paintAllLang();
    try { if (!state.media || !state.media.de) await loadMedia(true); } catch { /* egal */ }
    const song = cur();
    if (song) {
      const was = !!(el.audio && !el.audio.paused);
      try { await selectSong(state.index, was); } catch { /* egal */ }
    }
    try { if (typeof renderList === "function") renderList(); } catch { /* egal */ }
  }
  /* Musik-Sprache wechseln; passt das Cover (Sprache der Serie) nicht, kommt eine Rückfrage */
  async function switchLang(next) {
    if (next === lang()) return true;
    const c = C(); const cl = c ? c.setLang() : "";
    let pair = "";
    if (cl && cl !== next && lsv("langWarnOff", "0") !== "1") {
      const pr = c.pairOf();
      const buttons = [];
      if (pr) buttons.push({ value: "pair", kind: "primary", label: `Cover auf ${NAME[next]} umstellen`, sub: "gleiche Serie in der anderen Sprache" });
      buttons.push({ value: "keep", label: "Nur die Musik wechseln" }, { value: null, kind: "cancel", label: "Abbrechen" });
      const r = await uiDialog({
        eyebrow: "Sprache", title: "Cover und Musik passen nicht zusammen",
        lines: [`Die Musik wird auf ${NAME[next]} umgestellt, das gewählte Cover ist aber ${NAME[cl]}.`],
        buttons, check: { label: "Nicht mehr nachfragen", value: false, onChange: (v) => lss("langWarnOff", v ? "1" : "0") }
      });
      if (!r) return false;
      if (r === "pair") pair = pr;
    }
    if (pair) c.setSet(pair);
    await applyLang(next);
    return true;
  }
  /* Cover-Serie wählen: gehört sie zu einer anderen Sprache als die Musik, kommt eine Warnung (true = übernehmen) */
  async function guardCover(id) {
    const c = C(); const cl = c ? c.setLang(id) : "";
    if (!cl || cl === lang() || lsv("langWarnOff", "0") === "1") return true;
    const r = await uiDialog({
      eyebrow: "Cover", title: "Cover und Musik passen nicht zusammen",
      lines: [`Diese Cover-Serie ist ${NAME[cl]}, die Musik und der Karaoke-Text sind aber ${NAME[lang()]}.`],
      buttons: [
        { value: "use", kind: "primary", label: "Trotzdem verwenden" },
        { value: "lang", label: `Musik auf ${NAME[cl]} umstellen`, sub: "Karaoke-Lied und Text wechseln mit" },
        { value: null, kind: "cancel", label: "Abbrechen" }
      ],
      check: { label: "Nicht mehr nachfragen", value: false, onChange: (v) => lss("langWarnOff", v ? "1" : "0") }
    });
    if (!r) return false;
    if (r === "lang") await applyLang(cl);
    return true;
  }

  /* ---------- Lied zu einer Wiedergabeliste hinzufügen ---------- */
  async function addToPlaylist() {
    const s = cur(); if (!s) return;
    const buttons = state.playlists.map((l) => ({ value: l.id, label: l.name, sub: `${l.songs.includes(s.id) ? "✓ schon drin · " : ""}${l.songs.length} Lieder` }));
    buttons.push({ value: "__new", kind: "primary", label: "＋ Neue Liste …" }, { value: null, kind: "cancel", label: "Abbrechen" });
    const lines = [s.title];
    try { if (window.RATE && window.RATE.on()) lines.push({ node: window.RATE.node(s) }); } catch { /* egal */ }
    const r = await uiDialog({ eyebrow: `Lied ${s.id}`, title: "Zu Wiedergabeliste hinzufügen", lines, buttons });
    if (!r) return;
    let list;
    if (r === "__new") {
      const name = await uiPrompt({ eyebrow: "Neue Wiedergabeliste", title: "Name der Liste", placeholder: "Name", ok: "Erstellen" });
      if (!name || !String(name).trim()) return;
      list = { id: `${Date.now()}`, name: String(name).trim(), songs: [] };
      state.playlists.push(list);
    } else list = state.playlists.find((l) => l.id === r);
    if (!list) return;
    if (list.songs.includes(s.id)) { showToast(`„${s.title}“ ist schon in „${list.name}“.`); return; }
    list.songs.push(s.id);
    savePlaylists();
    try { if (typeof fillPlaylists === "function") fillPlaylists(); if (state.mode === "playlists") renderList(); } catch { /* egal */ }
    showToast(`„${s.title}“ zu „${list.name}“ hinzugefügt.`);
  }
  function setupPlAdd() {
    const row = $("titleRow"); if (!row || $("plAddBtn")) return;
    const b = h("button", "star-btn pl-add", "＋"); b.id = "plAddBtn"; b.type = "button";
    b.title = "Zu Wiedergabeliste hinzufügen"; b.setAttribute("aria-label", b.title);
    b.addEventListener("click", addToPlaylist);
    row.append(b);
  }

  /* ---------- Wiedergabe auf anderes Gerät (Cast / AirPlay) ---------- */
  /* Einstellung „castMode“: off = nie, lupe = nur bei aktiver Lupe, always = immer (Standard) */
  const castMode = () => { const v = lsv("castMode", "always"); return v === "off" || v === "lupe" ? v : "always"; };
  function paintCast() { document.body.dataset.cast = castMode(); const s = $("advCastMode"); if (s) s.value = castMode(); }
  /* Pfeil als Zeichnung: Tesla-Schrift hat „▾“ nicht (zeigte ein Rechteck) */
  const CHEV = (up) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="${up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  window.CHEV = CHEV;
  function setupCast() {
    const a = $("audio"); const row = $("titleRow");
    if (!a || !row || $("castBtn")) return;
    const b = h("button", "lang-mini cast-btn"); b.id = "castBtn"; b.type = "button";
    b.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v3h2V5h18v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM1 18v3h3a3 3 0 0 0-3-3zm0-4v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7zm0-4v2a9 9 0 0 1 9 9h2A11 11 0 0 0 1 10z"/></svg>';
    b.title = "Auf anderem Gerät abspielen (Fernseher, Lautsprecher …)"; b.setAttribute("aria-label", b.title);
    b.addEventListener("click", async (e) => {
      e.stopPropagation();
      /* ohne geladene Datei kann kein Gerät übernehmen: erst Quelle setzen */
      let src = ""; try { src = (typeof state !== "undefined" && state.currentAudio) || ""; } catch { /* egal */ }
      if (!a.currentSrc && !a.getAttribute("src")) {
        if (!src) { showToast("Zuerst ein Lied auswählen, dann übertragen."); return; }
        a.src = src; try { a.load(); } catch { /* egal */ }
      }
      /* „preload none“ lässt Safari/Chrome glauben, es gäbe noch nichts zu übertragen: Metadaten laden und kurz warten */
      if (a.preload !== "metadata" && a.preload !== "auto") { try { a.preload = "metadata"; a.load(); } catch { /* egal */ } }
      if (a.readyState < 1) { showToast("Verbindung wird vorbereitet …"); await new Promise((res) => { const f = () => { a.removeEventListener("loadedmetadata", f); a.removeEventListener("error", f); res(); }; a.addEventListener("loadedmetadata", f); a.addEventListener("error", f); setTimeout(f, 4000); }); }
      try { a.disableRemotePlayback = false; a.removeAttribute("disableremoteplayback"); a.setAttribute("x-webkit-airplay", "allow"); } catch { /* egal */ }
      /* Safari / iPhone / iPad: AirPlay-Auswahl des Systems (die „remote“-Schnittstelle meldet dort oft „nicht übertragbar“) */
      if (a.webkitShowPlaybackTargetPicker) { try { a.webkitShowPlaybackTargetPicker(); return; } catch { /* weiter mit remote */ } }
      if (a.remote && a.remote.prompt) {
        try { await a.remote.prompt(); }
        catch (err) {
          const n = err && err.name;
          if (n === "AbortError") return;
          const chrome = /Chrome|Chromium|Edg/.test(navigator.userAgent);
          showToast(n === "NotFoundError"
            ? (chrome ? "Kein Gerät gefunden. Chrome findet nur Chromecast und Google-Geräte, kein AirPlay. Für AirPlay Safari verwenden, oder in Chrome ⋮ → Streamen (Tab übertragen)." : "Kein Gerät im Netzwerk gefunden.")
            : n === "NotSupportedError" ? "Dieser Browser kann diese Wiedergabe nicht übertragen. Tipp: In Chrome ⋮ → Streamen (Tab übertragen), in Safari das AirPlay-Symbol des Systems nutzen."
            : "Übertragen nicht möglich.");
        }
      } else showToast("Dieser Browser kann nicht auf andere Geräte übertragen. Safari (AirPlay) oder Chrome (Chromecast) verwenden.");
    });
    try { if (a.remote) { a.remote.addEventListener("connect", () => b.classList.add("on")); a.remote.addEventListener("disconnect", () => b.classList.remove("on")); } } catch { /* egal */ }
    row.append(b);
    paintCast();
  }

  /* ---------- lang auf × drücken: zurück zur Startseite ---------- */
  function toStart() {
    try { sessionStorage.setItem("noAutoOnce", "1"); } catch { /* egal */ }
    try { if (C()) { C().closeNow(); C().closeGallery(); } } catch { /* egal */ }
    location.reload();
  }
  function setupHoldX() {
    const x = $("closeSidebar"); if (!x) return;
    let t = 0, fired = false;
    const stop = () => { clearTimeout(t); x.classList.remove("holding"); };
    x.addEventListener("pointerdown", () => { fired = false; stop(); x.classList.add("holding"); t = setTimeout(() => { fired = true; stop(); toStart(); }, 1000); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => x.addEventListener(ev, stop));
    x.addEventListener("click", (e) => { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
    x.addEventListener("contextmenu", (e) => e.preventDefault());
    x.title = "Auswahlliste ausblenden – 1 Sekunde gedrückt halten: Startseite";
  }

  /* ---------- Startseite: Anzeige-Arten ---------- */
  const SHOWS = [["image", "Bild"], ["chor", "Video"], ["carousel", "Karussell"], ["fade", "Überblenden"], ["float", "Schweben"]];
  const isShow = (m) => m === "carousel" || m === "fade" || m === "float";
  const startMode = () => { const m = lsv("startShow", ""); if (isShow(m)) return m; return lsv("startGif", "0") === "1" ? "chor" : "image"; };
  const setIds = () => (C() ? C().SETS.map((x) => x[0]).filter((x) => x !== "alt") : []);
  function chosenSets() {
    const v = lsv("startFolders", "cur"); const all = setIds();
    if (v === "all") return all;
    if (v && v !== "cur") { const l = v.split(",").filter((x) => all.includes(x)); if (l.length) return l; }
    const s = C() ? C().set : "edel"; return [s === "alt" ? all[0] : s];
  }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  async function buildItems() {
    const c = C(); if (!c) return [];
    const sets = chosenSets();
    const maps = await Promise.all(sets.map((id) => c.loadSetMap(id)));
    const nums = new Set(); maps.forEach((m) => Object.keys(m).forEach((n) => nums.add(Number(n))));
    const have = new Map(state.songs.map((s, i) => [numOf(s), i]));
    let list = [...nums].filter((n) => have.has(n)).sort((a, b) => a - b);
    if (lsv("startOrder", "seq") === "rand") shuffle(list);
    let k = 0; const out = [];
    list.forEach((n) => {
      for (let t = 0; t < sets.length; t++) {
        const m = maps[(k + t) % sets.length];
        if (m[String(n)]) { out.push({ n, url: c.urlOfKey(m[String(n)]) }); k++; break; }
      }
    });
    return out;
  }
  const playNum = (n) => { const i = state.songs.findIndex((s) => numOf(s) === n); if (i >= 0) selectSong(i, true); };
  const secs = () => Math.max(1, Number(lsv("startSec", "6")) || 6);
  const carSecs = () => { const v = Number(lsv("startCarSec", "")); return v >= 1 ? v : secs(); };
  const carMs = () => { const v = Number(lsv("startCarMs", "")); return v >= 50 ? v : Math.min(1200, fadeMs() + 300); };
  const floatSpd = () => Math.max(0.1, Math.min(5, (Number(lsv("startFloatSpd", "100")) || 100) / 100));
  const TRANS = [["fade", "Überblenden"], ["stack", "Kartenstapel (oberste Karte wird weggeschoben)"], ["slide", "Schieben"], ["zoom", "Zoom"], ["flip", "Drehen (Karte wenden)"], ["mosaic", "Mosaik (Bild baut sich aus Kacheln auf)"], ["rand", "Zufällig gemischt"]];
  const startTrans = () => { const v = lsv("startTrans", "fade"); return TRANS.some((t) => t[0] === v) ? v : "fade"; };
  const car3d = () => lsv("startCar3d", "1") !== "0";
  const fadeMs = () => Math.max(50, Number(lsv("startFade", "900")) || 900);
  const animMs = () => Math.max(200, Number(lsv("startAnim", "1800")) || 1800);   // Dauer von Kartenstapel/Schieben/Zoom/Drehen/Mosaik
  let stopFn = null, runId = 0;
  const media = () => $("startMedia") || $("startPanel");
  function stopShow() { runId++; if (stopFn) { try { stopFn(); } catch { /* egal */ } stopFn = null; } const b = $("startShow"); if (b) b.remove(); }
  function mkImg(it, cls) { const im = h("img", cls); im.src = it.url; im.alt = ""; im.draggable = false; im.decoding = "async"; im.addEventListener("click", () => playNum(it.n)); return im; }

  /* Lange auf Karussell / Überblenden / Schweben drücken: Wechselzeit (bzw. Tempo) eingeben, gleiche Werte wie in den Einstellungen */
  function longPress(b, v) {
    if (v !== "carousel" && v !== "fade" && v !== "float") return;
    let t = 0;
    const stop = () => { clearTimeout(t); t = 0; };
    const ask = async () => {
      b._lp = true; setTimeout(() => { b._lp = false; }, 600);
      let key, min, max, cur, title, text, id;
      if (v === "carousel") { key = "startCarSec"; min = 1; max = 120; cur = carSecs(); title = "Karussell: Wechselzeit"; text = "Sekunden bis zum nächsten Cover."; id = "advCarSec"; }
      else if (v === "fade") { key = "startSec"; min = 2; max = 120; cur = secs(); title = "Überblenden: Wechselzeit"; text = "Sekunden bis zum nächsten Cover."; id = "advStartSec"; }
      else { key = "startFloatSpd"; min = 20; max = 300; cur = Math.round(floatSpd() * 100); title = "Schweben: Geschwindigkeit"; text = "Tempo in Prozent (100 = normal)."; id = "advFloatSpd"; }
      let nv = String(cur), tv = startTrans(), cv = car3d() ? "3d" : "2d", sv = startMode();
      const lines = [{ text }, { num: { label: v === "float" ? "Tempo (%)" : "Sekunden", value: cur, min, max, onChange: (x) => { nv = String(x); } } }];
      lines.push({ select: { label: "Anzeige:", value: sv, options: SHOWS.map(([a, b]) => [a, b]), onChange: (x) => { sv = x; } } });
      let fd2 = String(fadeMs()), an2 = String(animMs()), cm3 = String(carMs());
      if (v === "fade") {
        lines.push({ select: { label: "Übergang:", value: tv, options: TRANS, onChange: (x) => { tv = x; } } });
        lines.push({ num: { label: "Dauer Überblenden (ms)", value: fadeMs(), min: 100, max: 5000, step: 100, onChange: (x) => { fd2 = String(x); } } });
        lines.push({ num: { label: "Dauer Kartenstapel, Schieben, Zoom, Drehen, Mosaik (ms)", value: animMs(), min: 300, max: 6000, step: 100, onChange: (x) => { an2 = String(x); } } });
      }
      if (v === "carousel") lines.push({ num: { label: "Dauer der Drehung (ms)", value: carMs(), min: 100, max: 5000, step: 100, onChange: (x) => { cm3 = String(x); } } });
      if (v === "carousel") lines.push({ select: { label: "Karussell:", value: cv, options: [["3d", "3D (gedreht, mit Tiefe)"], ["2d", "2D (nur verschoben)"]], onChange: (x) => { cv = x; } } });
      const ok = await uiDialog({ eyebrow: "Startseite", title, cancelValue: false, lines, buttons: [{ value: true, kind: "primary", label: "Übernehmen" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
      if (ok !== true) return;
      const n = Number(String(nv).replace(",", ".")); if (!(n > 0)) return;
      const val = await askLimit(n, min, max);
      lss(key, String(val)); const f = $(id); if (f) f.value = String(val);
      if (v === "fade") {
        lss("startTrans", tv); const ts = $("advStartTrans"); if (ts) ts.value = tv;
        const f1 = Number(fd2) > 0 ? await askLimit(Number(fd2), 100, 5000) : fadeMs(); lss("startFade", String(f1)); const e1 = $("advStartFade"); if (e1) e1.value = String(f1);
        const f2 = Number(an2) > 0 ? await askLimit(Number(an2), 300, 6000) : animMs(); lss("startAnim", String(f2)); const e2 = $("advStartAnim"); if (e2) e2.value = String(f2);
      }
      if (v === "carousel") {
        lss("startCar3d", cv === "3d" ? "1" : "0"); const cs2 = $("advCar3d"); if (cs2) cs2.value = cv === "3d" ? "1" : "0";
        const c4 = Number(cm3) > 0 ? await askLimit(Number(cm3), 100, 5000) : carMs(); lss("startCarMs", String(c4)); const e3 = $("advCarMs"); if (e3) e3.value = String(c4);
      }
      if (sv !== v) { setStartMode(sv); return; }
      if (startMode() !== v) setStartMode(v); else applyStart();
    };
    b.addEventListener("pointerdown", () => { stop(); t = setTimeout(() => { t = 0; ask(); }, 700); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, stop));
    b.addEventListener("contextmenu", (e) => { e.preventDefault(); stop(); ask(); });
    b.title = "Tippen: Anzeige wählen – lange drücken: " + (v === "float" ? "Geschwindigkeit" : "Wechselzeit") + " eingeben";
  }
  function mosaic(box, nxt, old, done) {
    const iw = nxt.naturalWidth || 1000, ih = nxt.naturalHeight || 1475, W = box.clientWidth, H = box.clientHeight;
    const sc = Math.min(W / iw, H / ih), dw = iw * sc, dh = ih * sc, dx = (W - dw) / 2, dy = (H - dh) / 2;
    const cv = document.createElement("canvas"); cv.className = "sf-mos"; cv.width = W; cv.height = H; cv.addEventListener("click", () => { if (nxt._n != null) playNum(nxt._n); });
    box.append(cv); const g = cv.getContext("2d");
    const cols = 10, rows = Math.max(8, Math.round(cols * ih / iw)), tiles = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push([c, r]);
    for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
    const dur = Math.max(600, animMs()), t0 = performance.now(); let shown = 0;
    const tw = iw / cols, th = ih / rows;
    (function step(now) {
      const f = Math.min(1, (now - t0) / dur), want = Math.floor(f * tiles.length);
      for (; shown < want; shown++) { const [c, r] = tiles[shown]; g.drawImage(nxt, c * tw, r * th, tw, th, dx + c * dw / cols, dy + r * dh / rows, dw / cols + 0.6, dh / rows + 0.6); }
      if (f < 1) requestAnimationFrame(step); else done(cv);
    })(t0);
  }
  function runFade(box, items) {
    let i = 0, a = mkImg(items[0], "sf-img on"), busy = false;
    box.style.setProperty("--sf-ms", fadeMs() + "ms"); box.append(a);
    const modes = ["fade", "stack", "slide", "zoom", "flip", "mosaic"];
    const t = setInterval(() => {
      if (document.hidden || busy) return;
      let tr = startTrans(); if (tr === "rand") tr = modes[Math.floor(Math.random() * modes.length)];
      i = (i + 1) % items.length; const nxt = mkImg(items[i], "sf-img tr-" + tr); nxt._n = items[i].n; busy = true;
      nxt.addEventListener("error", () => { busy = false; }, { once: true });
      nxt.addEventListener("load", () => {
        const old = a, ms = tr === "fade" ? fadeMs() : animMs(); box.style.setProperty("--sf-ms", ms + "ms");
        const fin = () => { setTimeout(() => { old.remove(); busy = false; }, 60); a = nxt; };
        if (tr === "mosaic") {
          nxt.style.opacity = "0"; box.append(nxt);
          mosaic(box, nxt, old, (cv) => { nxt.style.transition = "none"; nxt.classList.add("on"); nxt.style.opacity = "1"; old.classList.remove("on"); old.style.opacity = "0"; cv.remove(); fin(); });
          return;
        }
        if (tr === "stack") { box.insertBefore(nxt, old); nxt.style.transition = "none"; nxt.classList.add("on"); old.classList.add("sf-away"); }
        else { box.append(nxt); void nxt.offsetWidth; nxt.classList.add("on"); old.classList.remove("on"); if (tr !== "fade") old.classList.add("sf-out-" + tr); }
        setTimeout(fin, ms + 100);
      }, { once: true });
    }, secs() * 1000);
    return () => clearInterval(t);
  }
  function runCarousel(box, items) {
    const N = items.length; let idx = 0; const nodes = new Map();
    const W = () => box.clientWidth || 600, H = () => box.clientHeight || 600;
    function layout() {
      const ch = Math.min(H() * 0.98, W() * 1.475 * 0.7), cw = ch / 1.475, step = Math.min(cw * 0.62, W() * 0.3);
      for (let d = -3; d <= 3; d++) {
        const i = idx + d; let nd = nodes.get(i);
        if (!nd) { const it = items[((i % N) + N) % N]; nd = mkImg(it, "sc-item"); nd.style.opacity = "0"; box.append(nd); nodes.set(i, nd); void nd.offsetWidth; }
        const ad = Math.abs(d), sg = Math.sign(d);
        nd.style.height = ch + "px"; nd.style.width = cw + "px";
        nd.style.transform = car3d() ? `translate(-50%,-50%) translateX(${sg * (ad ? step * (1 + (ad - 1) * 0.55) + cw * 0.12 : 0)}px) translateZ(${-ad * 140}px) rotateY(${-sg * Math.min(52, 34 + ad * 6)}deg) scale(${ad ? 0.9 : 1})` : `translate(-50%,-50%) translateX(${sg * (ad ? cw * 1.04 * ad : 0)}px) scale(${ad ? 0.88 : 1})`;
        nd.style.opacity = String(ad === 0 ? 1 : Math.max(0, 0.85 - ad * 0.22)); nd.style.zIndex = String(10 - ad);
      }
      nodes.forEach((nd, i) => { if (Math.abs(i - idx) > 3) { nd.style.opacity = "0"; setTimeout(() => nd.remove(), 900); nodes.delete(i); } });
    }
    box.style.setProperty("--sc-ms", carMs() + "ms");
    layout();
    const t = setInterval(() => { if (document.hidden) return; idx++; layout(); }, carSecs() * 1000);
    const ro = new ResizeObserver(layout); ro.observe(box);
    return () => { clearInterval(t); ro.disconnect(); };
  }
  function runFloat(box, items) {
    const n = Math.min(items.length, 14); let next = n; const objs = [];
    const W = () => box.clientWidth || 600, H = () => box.clientHeight || 600;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const base = () => Math.min(W() * 0.42, H() * 0.5);
    function place(o, fresh) {
      const it = items[next % items.length]; next++;
      o.im.src = it.url; o.n = it.n; o.im.style.opacity = "0";
      o.z = rnd(-380, 140); o.s = base() * (1 + o.z / 1400);
      o.x = fresh ? rnd(-0.1, 1.05) * W() : -o.s * 1.2; o.y = rnd(-0.05, 0.85) * H();
      o.vx = rnd(7, 22); o.vy = rnd(-3, 3); o.ph = rnd(0, 6.28); o.rp = rnd(0.2, 0.6);
      setTimeout(() => { o.im.style.opacity = "1"; }, 40);
    }
    for (let i = 0; i < n; i++) { const im = mkImg(items[i], "sw-item"); box.append(im); const o = { im }; objs.push(o); next = i + 1; place(o, true); }
    next = n;
    let raf = 0, last = performance.now(), tt = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; if (document.hidden) return; tt += dt;
      objs.forEach((o) => {
        const fs = floatSpd(); o.x += o.vx * dt * fs; o.y += (o.vy + Math.sin(tt * 0.8 + o.ph) * 6) * dt * fs;
        const w = o.s, hh = o.s * 1.475;
        if (o.x > W() + 40 || o.y > H() + hh * 0.3 || o.y < -hh * 1.1) place(o, false);
        o.im.style.width = w + "px"; o.im.style.height = hh + "px"; o.im.style.zIndex = String(Math.round(o.z + 500));
        o.im.style.transform = `translate3d(${o.x}px,${o.y}px,${o.z}px) rotateY(${Math.sin(tt * o.rp + o.ph) * 28}deg) rotateX(${Math.cos(tt * o.rp * 0.8 + o.ph) * 9}deg) rotateZ(${Math.sin(tt * 0.3 + o.ph) * 4}deg)`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }
  async function startShow(mode) {
    const id = ++runId; const panel = $("startPanel"); if (!panel) return;
    let items = await buildItems();
    /* beim ersten Aufruf antwortet der Server manchmal noch nicht: mehrmals versuchen, erst dann aufgeben */
    for (let k = 0; k < 4 && !items.length && id === runId; k++) {
      let w = $("startShow"); if (!w) { w = h("div", `start-show ss-${mode}`); w.id = "startShow"; media().append(w); }
      w.replaceChildren(h("p", "start-show-empty", k ? `Cover werden geladen … (Versuch ${k + 1} von 4)` : "Cover werden geladen …"));
      await new Promise((r) => setTimeout(r, 900 + k * 900));
      items = await buildItems();
    }
    if (id !== runId || panel.hidden) return;
    const old = $("startShow"); if (old) old.remove();
    const box = h("div", `start-show ss-${mode}`); box.id = "startShow";
    if (!items.length) { const p = h("p", "start-show-empty", "In den gewählten Ordnern liegen noch keine Cover. "); const rb = h("button", "chip", "Erneut versuchen"); rb.type = "button"; rb.addEventListener("click", () => applyStart()); p.append(rb); box.append(p); media().append(box); return; }
    media().append(box);
    stopFn = (mode === "fade" ? runFade : mode === "carousel" ? runCarousel : runFloat)(box, items);
  }
  /* Größe der einzelnen Ansichten (in Prozent des freien Platzes) */
  const SZ_DEF = { image: 100, chor: 100, carousel: 100, fade: 100, float: 100 };
  const SZ_NAME = { image: "Bild", chor: "Video (Chor)", carousel: "Karussell", fade: "Überblenden", float: "Schweben" };
  const sizes = () => { let o = {}; try { o = JSON.parse(lsv("startSizes", "{}")) || {}; } catch { o = {}; } const r = {}; Object.keys(SZ_DEF).forEach((k) => { const v = Number(o[k]); r[k] = v >= 10 && v <= 500 ? Math.round(v) : SZ_DEF[k]; }); return r; };
  const sizeOf = () => sizes()[startMode()] || 100;
  function paintDrawer() {
    const d = $("startDrawer"); if (!d) return;
    const m = startMode();
    d.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    const sel = $("startFolderSel"); if (sel) { const v = lsv("startFolders", "cur"); sel.value = [...sel.options].some((o) => o.value === v) ? v : "list"; if (sel._paint) sel._paint(); }
  }
  /* Die Startseite nutzt den ganzen freien Platz: Höhe = Fenster − Oberkante − Wiedergabeleiste */
  function fit() {
    const panel = $("startPanel"); if (!panel || panel.hidden) return;
    const fl = document.querySelector(".flyer");
    const top = panel.getBoundingClientRect().top + window.scrollY;
    const free = window.innerHeight - (fl ? fl.offsetHeight : 70) - top - 10;
    panel.style.height = Math.max(300, Math.floor(free)) + "px";
    const mm = $("startMedia"); if (mm) mm.style.setProperty("--ms", String(sizeOf() / 100));
  }
  function applyStart() {
    try { rowsByMode(); } catch { /* egal */ }
    const panel = $("startPanel"); if (!panel) return;
    stopShow();
    const m = startMode(); const want = isShow(m);
    document.body.classList.toggle("start-show", want); panel.classList.toggle("show-on", want);
    paintDrawer(); fit(); setTimeout(fit, 400); setTimeout(fit, 1500);
    if (want && !panel.hidden) startShow(m);
  }
  /* In den Einstellungen nur die Felder zeigen, die zur gewählten Anzeige gehören */
  const MODE_ROWS = { fade: ["advStartSec", "advStartFade", "advStartTrans", "advStartAnim"], carousel: ["advCarSec", "advCarMs", "advCar3d"], float: ["advFloatSpd"] };
  const MODE_HINTS = [["Gilt für Karussell und Überblenden", ["fade", "carousel"]], ["Übergang gilt für", ["fade"]], ["Nur für das Karussell", ["carousel"]]];
  function rowsByMode() {
    const m = startMode();
    Object.entries(MODE_ROWS).forEach(([mode, ids]) => ids.forEach((id) => { const e = $(id), r = e && e.closest(".set-row"); if (r) r.hidden = mode !== m; }));
    document.querySelectorAll("#advStartShow ~ small.set-hint, #codeModal small.set-hint").forEach((s) => {
      const hit = MODE_HINTS.find(([p]) => (s.textContent || "").trim().startsWith(p)); if (hit) s.hidden = !hit[1].includes(m);
    });
  }
  function setStartMode(m) {
    if (isShow(m)) lss("startShow", m);
    else { lss("startShow", "image"); lss("startGif", m === "chor" ? "1" : "0"); try { applyStartGif(); } catch { /* egal */ } const cb = $("startGif"); if (cb) cb.checked = m === "chor"; }
    applyStart();
  }
  function setupStart() {
    const panel = $("startPanel"); const title = $("currentTitle"); if (!panel || !title || $("startMore")) return;
    /* Bild in einen Rahmen setzen, der den freien Platz füllt; die Anzeige-Art kommt in denselben Rahmen */
    const media = h("div", "start-media"); media.id = "startMedia";
    const img = panel.querySelector(".start-image"); if (img) { img.before(media); media.append(img); } else panel.querySelector(".start-actions").before(media);
    /* Pfeil und Leiste stehen oben neben der Überschrift „Königreichslieder“ */
    const wrap = h("div", "title-wrap"); wrap.id = "titleWrap"; title.before(wrap); wrap.append(title);
    const ctl = h("div", "start-ctl"); ctl.id = "startCtl";
    const more = h("button", "start-more-btn"); more.innerHTML = CHEV(false); more.id = "startMore"; more.type = "button"; more.setAttribute("aria-expanded", "false");
    more.title = "Anzeige der Startseite wählen"; more.setAttribute("aria-label", more.title);
    const d = h("div", "start-drawer"); d.id = "startDrawer"; d.hidden = true;
    const seg = h("div", "seg"); seg.setAttribute("role", "group");
    SHOWS.forEach(([v, n]) => { const b = h("button", "seg-btn", n); b.type = "button"; b.dataset.m = v; b.addEventListener("click", (e) => { if (b._lp) { b._lp = false; e.preventDefault(); return; } setStartMode(v); }); longPress(b, v); seg.append(b); });
    const lab = h("label", "start-folder"); lab.title = "Cover-Ordner für die Startseite";
    lab.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z"/></svg>';
    const sel = document.createElement("select"); sel.id = "startFolderSel"; sel.setAttribute("aria-label", "Cover-Ordner für die Startseite");
    sel.append(new Option("Gewählter Ordner", "cur"), new Option("Alle abwechselnd", "all"));
    (C() ? C().SETS : []).filter((x) => x[0] !== "alt").forEach(([id, n]) => sel.append(new Option(n, id)));
    sel.append(new Option("Auswahl aus den Einstellungen", "list"));
    const badge = h("span", "sf-badge"); lab.append(badge);
    const paintBadge = () => { const B = { edel: "G·D", edel_eng: "G·E", modern: "M·E", modern_de: "M·D", all: "alle", list: "Aus." }; let v = sel.value; if (v === "cur") v = (C() && C().set) || "edel"; badge.textContent = B[v] || ""; badge.title = (sel.options[sel.selectedIndex] || {}).text || ""; };
    sel.addEventListener("change", paintBadge); sel._paint = paintBadge;
    sel.addEventListener("change", () => { if (sel.value !== "list") { lss("startFolders", sel.value); applyStart(); const b = $("advStartFolders"); if (b) bindStartSettings(); } });
    lab.append(sel); d.append(seg, lab);
    more.addEventListener("click", () => { d.hidden = !d.hidden; more.setAttribute("aria-expanded", String(!d.hidden)); more.innerHTML = CHEV(!d.hidden); ctl.classList.toggle("open", !d.hidden); try { lss("startBarOpen", d.hidden ? "0" : "1"); } catch { /* egal */ } });
    ctl.append(more, d); wrap.append(ctl);
    if (lsv("startBarOpen", "0") === "1") { d.hidden = false; more.innerHTML = CHEV(true); more.setAttribute("aria-expanded", "true"); ctl.classList.add("open"); }
    const sync = () => { ctl.hidden = panel.hidden; if (panel.hidden) stopShow(); else applyStart(); };
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    sync();
    window.addEventListener("resize", fit); window.addEventListener("orientationchange", () => setTimeout(fit, 250));
    try { new ResizeObserver(fit).observe(document.querySelector(".flyer")); } catch { /* egal */ }
  }
  let lastLupe = null;

  /* ---------- Einstellungen (Allgemein) ---------- */
  function bindStartSettings() {
    const get = (id) => $(id); const c = C();
    const m = get("advMusikLang"); if (m) { m.value = lang(); m.onchange = () => switchLang(m.value).then((ok) => { if (!ok) m.value = lang(); }); }
    const w = get("advLangWarn"); if (w) { w.checked = lsv("langWarnOff", "0") !== "1"; w.onchange = () => lss("langWarnOff", w.checked ? "0" : "1"); }
    const sh = get("advStartShow"); if (sh) { sh.value = startMode(); sh.onchange = () => { setStartMode(sh.value); }; }
    const fo = get("advStartFolders"), pick = get("advStartPick");
    const fv = lsv("startFolders", "cur"); const mode = fv === "cur" || fv === "all" ? fv : "list";
    if (fo) { fo.value = mode; fo.onchange = () => { if (fo.value === "list") { const l = [...pick.querySelectorAll("input:checked")].map((x) => x.value); lss("startFolders", l.length ? l.join(",") : (c ? c.set : "edel")); } else lss("startFolders", fo.value); bindStartSettings(); applyStart(); }; }
    if (pick) {
      pick.hidden = mode !== "list"; pick.replaceChildren();
      const have = fv.split(",");
      (c ? c.SETS : []).filter((x) => x[0] !== "alt").forEach(([id, n]) => {
        const l = h("label", "set-row check"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.value = id; cb.checked = have.includes(id);
        cb.onchange = () => { const list = [...pick.querySelectorAll("input:checked")].map((x) => x.value); lss("startFolders", list.length ? list.join(",") : "cur"); applyStart(); };
        l.append(cb, document.createTextNode(" " + n)); pick.append(l);
      });
    }
    const ord = get("advStartOrder"); if (ord) { ord.value = lsv("startOrder", "seq"); ord.onchange = () => { lss("startOrder", ord.value); applyStart(); }; }
    const sc = get("advStartSec"); if (sc) { sc.value = String(secs()); sc.onchange = async () => { lss("startSec", String(await askLimit(Number(sc.value) || 6, 2, 120))); applyStart(); }; }
    const fd = get("advStartFade"); if (fd) { fd.value = String(fadeMs()); fd.onchange = async () => { lss("startFade", String(await askLimit(Number(fd.value) || 900, 100, 5000))); applyStart(); }; }
    const fsp = get("advFloatSpd"); if (fsp) { fsp.value = String(Math.round(floatSpd() * 100)); fsp.onchange = async () => { lss("startFloatSpd", String(await askLimit(Number(fsp.value) || 100, 20, 300))); applyStart(); }; }
    const an = get("advStartAnim"); if (an) { an.value = String(animMs()); an.onchange = async () => { lss("startAnim", String(await askLimit(Number(an.value) || 1800, 300, 6000))); applyStart(); }; }
    const tr = get("advStartTrans"); if (tr) { tr.value = startTrans(); tr.onchange = () => { lss("startTrans", tr.value); applyStart(); }; }
    const c3 = get("advCar3d"); if (c3) { c3.value = car3d() ? "1" : "0"; c3.onchange = () => { lss("startCar3d", c3.value); applyStart(); }; }
    const cs = get("advCarSec"); if (cs) { cs.value = String(carSecs()); cs.onchange = async () => { lss("startCarSec", String(await askLimit(Number(cs.value) || 6, 1, 120))); applyStart(); }; }
    const cm2 = get("advCarMs"); if (cm2) { cm2.value = String(carMs()); cm2.onchange = async () => { lss("startCarMs", String(await askLimit(Number(cm2.value) || 1000, 100, 5000))); applyStart(); }; }
    rowsByMode();
    const sz = sizes();
    Object.keys(SZ_DEF).forEach((k) => {
      const inp = get("advSz_" + k); if (!inp) return;
      inp.value = String(sz[k]);
      inp.onchange = async () => { const cur = sizes(); cur[k] = await askLimit(Math.round(Number(inp.value) || SZ_DEF[k]), 30, 100); lss("startSizes", JSON.stringify(cur)); inp.value = String(cur[k]); fit(); };
    });
    const rs = get("advSzReset"); if (rs) rs.onclick = () => { lss("startSizes", JSON.stringify(SZ_DEF)); bindStartSettings(); fit(); showToast("Größen auf die Standardwerte zurückgesetzt."); };
    const cm = get("advCastMode"); if (cm) { cm.value = castMode(); cm.onchange = () => { lss("castMode", cm.value); paintCast(); }; }
    paintDrawer();
  }

  function init() {
    setupPlAdd(); setupCast(); setupHoldX(); setupStart();
    const sc = $("songCount"); if (sc && !document.querySelector(".lang-filters")) { const w = h("span", "count-wrap"); sc.before(w); w.append(sc, langBtn("lang-filters")); const tb = $("tagsBtn"); if (tb) w.append(tb); }
    const tr = $("titleRow"); if (tr && !tr.querySelector(".lang-title")) { const lb = langBtn("lang-title"); const castB = $("castBtn"); if (castB) castB.before(lb); else tr.append(lb); }
    bindStartSettings();
    const cm = $("codeModal"); if (cm) new MutationObserver(() => { if (!cm.hidden) setTimeout(bindStartSettings, 30); }).observe(cm, { attributes: true, attributeFilter: ["hidden"] });
    applyStart();
    new MutationObserver(() => { const l = lupe(); if (l !== lastLupe) { lastLupe = l; fit(); } }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("storage", () => { paintAllLang(); applyStart(); });
  }
  window.V116 = { fit, paintCast, langBtn, switchLang, guardCover, addToPlaylist, toStart, applyStart, paintAllLang };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
