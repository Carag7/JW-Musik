/* Cover: neue Bilder aus R2 (Ordner covers_edel/, Dateien 003.jpg …), Galerie (Raster · Liste · Karussell) und Vollbild „Jetzt läuft“.
 * Fehlt ein Cover, wird das alte Bild (start-bg.png) verwendet. Einstellung „coverMode“: neu (Standard) oder alt. */
(function () {
  "use strict";
  const OLD = "start-bg.png";
  const $ = (id) => document.getElementById(id);
  const base = () => (typeof SYNC_BASE !== "undefined" ? SYNC_BASE : location.origin);
  const lupe = () => document.body.classList.contains("glass-open");
  const mode = () => (lsv("coverMode", "neu") === "alt" || lsv("coverSet", "edel") === "alt" || !lupe() ? "alt" : "neu");
  const numOf = (s) => { const n = parseInt(s && (s.number != null ? s.number : s.id), 10); return n > 0 ? n : 0; };
  /* Cover-Ordner: edel = Goldrahmen Deutsch, edel_eng = Goldrahmen Englisch, modern = modern Englisch */
  const SETS = [["edel", "Goldrahmen · Deutsch"], ["edel_eng", "Goldrahmen · Englisch"], ["modern", "Modern · Englisch"], ["modern_de", "Modern · Deutsch"], ["alt", "Original (altes Bild)"]];
  const SET_LANG = { edel: "de", edel_eng: "en", modern: "en", modern_de: "de", alt: "" };
  const SET_PAIR = { edel: "edel_eng", edel_eng: "edel", modern: "modern_de", modern_de: "modern" };   // gleiche Serie in der anderen Sprache
  const setOk = (v) => SETS.some((x) => x[0] === v);
  let set = lsv("coverSet", "edel"); if (!setOk(set)) set = "edel";
  const idxKey = () => (set === "edel" ? "coverIdx" : "coverIdx_" + set);
  let map = {};
  let loaded = 0, loading = null;

  function readIdx() { map = {}; loaded = 0; try { const c = JSON.parse(lsv(idxKey(), "null")); if (c && c.map) { map = c.map; loaded = c.t || 0; } } catch { /* egal */ } }
  readIdx();
  function setSet(v, noSave) {
    if (!setOk(v) || v === set) return;
    set = v; if (!noSave) lss("coverSet", v);
    loading = null; readIdx(); lastKey = "";
    changed(); load(true);
  }

  /* Serie wählen; gehört sie zu einer anderen Sprache als die Musik, fragt V116.guardCover vorher nach (true = übernommen) */
  async function pick(v) {
    if (!setOk(v) || v === set) return true;
    let ok = true;
    try { if (window.V116) ok = await V116.guardCover(v); } catch { /* egal */ }
    if (ok) setSet(v);
    return ok;
  }
  function load(force) {
    if (loading) return loading;
    if (set === "alt") { map = {}; return Promise.resolve(map); }
    if (!force && loaded && Date.now() - loaded < 10 * 60 * 1000) return Promise.resolve(map);
    const mine = set;
    const p = fetchMap(mine, force).then((m) => {
      if (mine === set && m) { map = m; loaded = Date.now(); try { lss(idxKey(), JSON.stringify({ t: loaded, map })); } catch { /* egal */ } }
      return map;
    }).finally(() => { if (loading === p) loading = null; if (mine === set) changed(); });
    loading = p;
    return p;
  }
  /* Verzeichnis einer beliebigen Serie (für die Startseite: mehrere Ordner abwechselnd) */
  const setMaps = {};
  /* Verzeichnis holen; beim ersten Aufruf antwortet der Server manchmal nicht: bis zu 4 Versuche, Fehlschläge werden nicht gemerkt */
  async function fetchMap(id, force) {
    for (let k = 0; k < 4; k++) {
      try {
        const r = await fetch(`${base()}/api/covers?set=${id}`, { cache: force || k ? "reload" : "default" });
        if (r.ok) { const j = await r.json(); if (j && j.ok && j.map && Object.keys(j.map).length) return j.map; }
      } catch { /* nächster Versuch */ }
      await new Promise((res) => setTimeout(res, 500 + k * 700));
    }
    return null;
  }
  function loadSetMap(id) {
    if (id === set) return load(false).then(() => map);
    if (id === "alt") return Promise.resolve({});
    if (setMaps[id] && Date.now() - setMaps[id].t < 10 * 60 * 1000) return Promise.resolve(setMaps[id].map);
    return fetchMap(id, false).then((m) => { if (m && Object.keys(m).length) setMaps[id] = { t: Date.now(), map: m }; return m || {}; });
  }
  const urlOfKey = (key) => imgUrl(key);
  const keyOf = (song) => { const n = numOf(song); return n ? map[String(n)] : ""; };
  const imgUrl = (key) => `${base()}/media/${key.split("/").map(encodeURIComponent).join("/")}`;
  /* neues Cover (Adresse) oder leer; immer, auch wenn die Anzeige auf „alt“ steht – für die Galerie */
  const newUrl = (song) => { const k = keyOf(song); return k ? imgUrl(k) : ""; };
  /* Cover für die Anzeige im Programm: gemäß Einstellung, sonst das alte Bild */
  const src = (song) => (mode() === "neu" && song && newUrl(song)) || OLD;
  const has = (song) => !!(song && newUrl(song));
  const artwork = (song) => { const u = mode() === "neu" && song ? newUrl(song) : ""; return u ? [{ src: u, sizes: "512x512" }] : []; };

  /* ---------- kleines Cover neben dem Liedtitel ---------- */
  let thumb = null, lastKey = "";
  function ensureThumb() {
    if (thumb && thumb.isConnected) return thumb;
    const row = document.querySelector(".stage > .now .meta-row") || $("titleRow"); if (!row) return null;
    thumb = document.createElement("button"); thumb.id = "coverThumb"; thumb.type = "button"; thumb.className = "cover-thumb"; thumb.hidden = true;
    thumb.setAttribute("aria-label", "Cover groß anzeigen");
    const im = document.createElement("img"); im.alt = ""; im.decoding = "async"; thumb.append(im);
    thumb.addEventListener("click", () => openNowFlip());
    row.append(thumb);
    return thumb;
  }
  function paintThumb() {
    const t = ensureThumb(); if (!t) return;
    const song = state.songs[state.index];
    const u = song && mode() === "neu" ? newUrl(song) : "";
    if (!u) { t.hidden = true; lastKey = ""; return; }
    if (lastKey !== u) { t.firstChild.src = u; lastKey = u; }
    t.hidden = false;
  }
  function changed() {
    { const v = lsv("coverSet", "edel"); if (setOk(v) && v !== set) { set = v; readIdx(); lastKey = ""; load(true); if (gal && gal._dir) gal._dir.value = set; } }
    paintThumb();
    try { if (state.songs[state.index] && "mediaSession" in navigator && typeof setMediaSession === "function") setMediaSession(state.songs[state.index]); } catch { /* egal */ }
    if (gal) paintGallery();
    if (np) paintNow(true);
  }

  /* ---------- Hilfen ---------- */
  function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const cur = () => state.songs[state.index] || null;
  const playing = () => !!(el.audio && !el.audio.paused);
  const ic = {
    play: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M3 5h4v4H3zm6 1h12v2H9zM3 10h4v4H3zm6 1h12v2H9zM3 15h4v4H3zm6 1h12v2H9z"/></svg>',
    flow: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M2 7h4v10H2zm16 0h4v10h-4zM8 4h8v16H8z"/></svg>',
    player: '<svg viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M10 8v8l6-4z"/></svg>',
    jump: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-1-6v3.1A7 7 0 0 0 5.1 11H2v2h3.1A7 7 0 0 0 11 18.9V22h2v-3.1a7 7 0 0 0 5.9-5.9H22v-2h-3.1A7 7 0 0 0 13 5.1V2z"/></svg>',
    fill: '<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M6 16.5l4-5 3 3.5 2-2.5 3 4z"/><circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/></svg>',
    full: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>'
  };
  /* v118: nur den Container scrollen (scrollIntoView verschob im Tesla-Browser die ganze Seite) */
  function centerIn(box, node, smooth) {
    if (!box || !node) return;
    const b = box.getBoundingClientRect(), n = node.getBoundingClientRect();
    const dy = (n.top + n.height / 2) - (b.top + b.height / 2), dx = (n.left + n.width / 2) - (b.left + b.width / 2);
    try { box.scrollBy({ top: dy, left: dx, behavior: smooth ? "smooth" : "auto" }); } catch { box.scrollTop += dy; box.scrollLeft += dx; }
  }
  const resetPage = () => { try { window.scrollTo(0, 0); const se = document.scrollingElement; if (se) { se.scrollTop = 0; se.scrollLeft = 0; } document.body.scrollTop = 0; } catch { /* egal */ } };
  /* Lieder, die es in der gewählten Sprache nicht als Karaoke gibt (nur wenn die Liste vom Server geladen ist) */
  const noKar = (s) => { try { if (lsv("galNoKar", "1") !== "1") return false; if (s.extra) return true; return !!(state.media && typeof mediaKey === "function" && !mediaKey("karaoke", numOf(s))); } catch { return false; } };
  const nkAmt = () => { const v = Number(lsv("galNoKarAmt", "55")); return v >= 0 && v <= 100 ? v : 55; };
  const svgBtn = (cls, svg, label) => { const b = h("button", cls); b.type = "button"; b.innerHTML = svg; b.setAttribute("aria-label", label); b.title = label; return b; };

  /* ---------- Vollbild „Jetzt läuft“ ---------- */
  let np = null, npTimer = 0, npFill = lsv("coverFill", "0") === "1";
  function applyLay() {
    if (!np) return;
    const lay = lsv("npLayout", "auto");
    const fill = lay === "fill" || (lay === "auto" && npFill);
    np.classList.toggle("fill", fill); np.classList.toggle("split", lay === "split");
  }
  function openNow() {
    if (np) return;
    np = h("div", "np"); np.id = "npOverlay"; np.setAttribute("role", "dialog"); np.setAttribute("aria-label", "Jetzt läuft");
    applyLay();
    const bg = h("div", "np-bg");
    const top = h("div", "np-top");
    const close = svgBtn("np-btn", '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>', "Schließen");
    close.addEventListener("click", closeNow);
    const lab = h("span", "np-label", "Jetzt läuft");
    const tools = h("div", "np-tools");
    const gb = svgBtn("np-btn", ic.grid, "Galerie"); gb.addEventListener("click", () => { closeNow(); openGallery(); });
    const fb = svgBtn("np-btn", ic.fill, "Cover füllt den ganzen Bildschirm (Bild-Symbol)"); fb.id = "npFillBtn"; fb.setAttribute("aria-pressed", String(npFill));
    fb.addEventListener("click", () => { const f = !np.classList.contains("fill"); lss("npLayout", f ? "fill" : "split"); npFill = f; lss("coverFill", f ? "1" : "0"); applyLay(); fb.setAttribute("aria-pressed", String(f)); });
    const sb = svgBtn("np-btn", '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z"/></svg>', "Browser-Vollbild");
    sb.addEventListener("click", () => fsToggle(np));
    tools.append(gb, fb, sb, ...(window.V116 ? [V116.langBtn("lang-np")] : []));
    top.append(close, lab, tools);
    const art = h("div", "np-art"); const im = h("img"); im.alt = ""; art.append(im);
    const info = h("div", "np-info");
    const num = h("p", "np-num"); const ttl = h("h2", "np-title"); const cat = h("p", "np-cat"); const line = h("p", "np-line");
    info.append(num, ttl, cat);
    const prog = h("div", "np-prog");
    const rng = document.createElement("input"); rng.type = "range"; rng.min = "0"; rng.max = "1000"; rng.value = "0"; rng.setAttribute("aria-label", "Position");
    const times = h("div", "np-times"); const t1 = h("span", "", "0:00"), t2 = h("span", "", "0:00"); times.append(t1, t2);
    rng.addEventListener("input", () => { const d = el.audio.duration; if (d && isFinite(d)) el.audio.currentTime = d * (Number(rng.value) / 1000); });
    prog.append(rng, times);
    const ctl = h("div", "np-ctl");
    const bPrev = svgBtn("np-c", ic.prev, "Vorheriges Lied"); const b15m = h("button", "np-c np-s", "−15"); b15m.type = "button";
    const bPlay = svgBtn("np-c np-play", ic.play, "Wiedergabe"); const b15p = h("button", "np-c np-s", "+15"); b15p.type = "button";
    const bNext = svgBtn("np-c", ic.next, "Nächstes Lied");
    bPrev.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(-1); });
    bNext.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(1); });
    bPlay.addEventListener("click", () => togglePlay());
    b15m.addEventListener("click", () => { el.audio.currentTime = Math.max(0, el.audio.currentTime - 15); });
    b15p.addEventListener("click", () => { el.audio.currentTime = Math.min(el.audio.duration || 1e9, el.audio.currentTime + 15); });
    ctl.append(b15m, bPrev, bPlay, bNext, b15p);
    const fav = h("button", "np-fav", "☆"); fav.type = "button"; fav.setAttribute("aria-label", "Favorit");
    fav.addEventListener("click", () => { toggleFavorite(); paintNow(); });
    const body = h("div", "np-body"); body.append(art, h("div", "np-side"));
    const side = body.lastChild; side.append(info, line, prog, ctl, fav);
    np.append(bg, top, body);
    np._r = { bg, im, num, ttl, cat, line, rng, t1, t2, bPlay, fav, last: "", dragging: false };
    rng.addEventListener("pointerdown", () => { np._r.dragging = true; });
    ["pointerup", "pointercancel", "change"].forEach((e) => rng.addEventListener(e, () => { if (np) np._r.dragging = false; }));
    /* Wischen: links/rechts = nächstes/vorheriges Lied, nach unten = schließen */
    let sx = 0, sy = 0, st = 0;
    art.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); });
    art.addEventListener("pointerup", (e) => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Date.now() - st > 800) return;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { if (lsv("coverFlip", "1") === "1") flipToText(); return; }   // Antippen: mit Drehung zurück zum Karaoke-Text (das kleine Cover öffnet wieder)
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { if (typeof stepAllowed !== "function" || stepAllowed()) step(dx < 0 ? 1 : -1); }
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeNow();
    });
    np.classList.add("flip-in");
    setTimeout(() => { if (np) np.classList.remove("flip-in"); }, 420);
    document.body.append(np);
    document.body.classList.add("np-open");
    document.addEventListener("keydown", npKey, true);
    paintNow(true);
    npTimer = setInterval(() => paintNow(false), 350);
    try { bPlay.focus({ preventScroll: true }); } catch { /* egal */ }
  }
  function npKey(e) {
    if (!np) return;
    if (e.key === "Escape") { e.stopPropagation(); closeNow(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); if (typeof stepAllowed !== "function" || stepAllowed()) step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); if (typeof stepAllowed !== "function" || stepAllowed()) step(-1); }
  }
  /* Cover antippen: Drehung um 180° (Cover → Karaoke-Text) – und das kleine Cover dreht zurück */
  function flipToText() {
    if (!np) return;
    np.classList.add("flip-out");
    const st = document.querySelector(".stage");
    setTimeout(() => {
      closeNow(); closeGallery();
      if (st) { st.classList.add("flip-in"); setTimeout(() => st.classList.remove("flip-in"), 450); }
    }, 230);
  }
  function openNowFlip() {
    const st = document.querySelector(".stage");
    if (!st) { openNow(); return; }
    st.classList.add("flip-out");
    setTimeout(() => { st.classList.remove("flip-out"); openNow(); }, 200);
  }
  function closeNow() {
    if (!np) return;
    clearInterval(npTimer); np.remove(); np = null;
    document.removeEventListener("keydown", npKey, true);
    document.body.classList.remove("np-open");
    if (document.fullscreenElement && !gal) { try { document.exitFullscreen(); } catch { /* egal */ } }
  }
  function paintNow(force) {
    if (!np) return;
    const r = np._r, s = cur();
    const u = s ? src(s) : OLD;
    const key = (s ? s.id : "") + "|" + u;
    if (force || r.last !== key) {
      r.last = key;
      r.im.src = u; r.bg.style.backgroundImage = `url("${u}")`;
      r.num.textContent = s ? `Lied ${s.id}` : "";
      r.ttl.textContent = s ? s.title : "Kein Lied gewählt";
      r.cat.textContent = s ? (s.category || "") : "";
      np.classList.toggle("no-cover", !s || !has(s) || mode() !== "neu");
    }
    const d = el.audio.duration, c = el.audio.currentTime || 0;
    if (!r.dragging && d && isFinite(d)) r.rng.value = String(Math.round((c / d) * 1000));
    r.t1.textContent = fmt(c); r.t2.textContent = d && isFinite(d) ? "−" + fmt(d - c) : "0:00";
    const p = playing();
    if (r.bPlay.dataset.p !== String(p)) { r.bPlay.dataset.p = String(p); r.bPlay.innerHTML = p ? ic.pause : ic.play; r.bPlay.setAttribute("aria-label", p ? "Pause" : "Wiedergabe"); }
    r.fav.textContent = s && state.favorites.has(s.id) ? "★" : "☆";
    const ln = document.querySelector(".lyric-line.active");
    r.line.textContent = ln ? (ln.textContent || "").trim().slice(0, 160) : "";
  }
  function fsToggle(elm) {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (elm.requestFullscreen) elm.requestFullscreen();
      else if (elm.webkitRequestFullscreen) elm.webkitRequestFullscreen();
    } catch { /* egal */ }
  }

  /* ---------- Galerie ---------- */
  let gal = null;
  const G = { view: lsv("coverView", "grid"), size: Number(lsv("coverSize", "170")) || 170, q: "", only: lsv("coverOnly", "0") === "1", fav: false, mark: lsv("coverFavMark", "0") === "1", next: lsv("coverNext", "off"), fromGal: false, cat: "", sort: "num" };
  /* Position und Größe je Ansicht (Raster / Liste / Karussell) */
  const galJ = (k) => { try { return JSON.parse(lsv(k, "{}")) || {}; } catch { return {}; } };
  const galSz = (v) => Number(galJ("galSizes")[v || G.view]) || G.size;
  function galApply() {
    if (!gal) return; const a = galJ("galAdj")[G.view] || [0, 0];
    gal.style.setProperty("--gdx", (Number(a[0]) || 0) + "px"); gal.style.setProperty("--gdy", (Number(a[1]) || 0) + "px");
    gal.style.setProperty("--cg-size", galSz() + "px");
  }
  const VN = { grid: "Raster", list: "Liste", flow: "Karussell" };
  function galAdjust(view) {
    if (!window.V116 || !V116.adjust) return;
    const v = view || G.view;
    V116.adjust({
      title: () => "Galerie anpassen: " + VN[v],
      info: () => { const a = galJ("galAdj")[v] || [0, 0], b = gal && gal._r ? gal._r.body.getBoundingClientRect() : { width: 0, height: 0 }; return `Fenster ${window.innerWidth} × ${window.innerHeight} px · Fläche ${Math.round(b.width)} × ${Math.round(b.height)} px · Versatz ${a[0] || 0} / ${a[1] || 0} px · Cover-Größe ${galSz(v)} px`; },
      move: (dx, dy) => { const o = galJ("galAdj"), c = o[v] || [0, 0]; o[v] = [(Number(c[0]) || 0) + dx, (Number(c[1]) || 0) + dy]; lss("galAdj", JSON.stringify(o)); galApply(); },
      size: (d) => { const o = galJ("galSizes"); o[v] = Math.max(100, Math.min(360, galSz(v) + d)); lss("galSizes", JSON.stringify(o)); if (v === G.view) { G.size = o[v]; lss("coverSize", String(o[v])); } galApply(); },
      setSize: (x) => { const o = galJ("galSizes"); o[v] = x; lss("galSizes", JSON.stringify(o)); galApply(); },
      step: 20, full: 360, small: 140, fullLabel: "Groß (360)", smallLabel: "Klein (140)",
      reset: () => { const a = galJ("galAdj"), z = galJ("galSizes"); delete a[v]; delete z[v]; lss("galAdj", JSON.stringify(a)); lss("galSizes", JSON.stringify(z)); galApply(); }
    });
  }
  function openGallery() {
    if (gal) return;
    load(true);
    gal = h("div", "cg"); gal.id = "coverGallery"; gal.setAttribute("role", "dialog"); gal.setAttribute("aria-label", "Cover-Galerie");
    const top = h("div", "cg-top");
    const close = svgBtn("cg-btn", '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>', "Galerie schließen");
    close.addEventListener("click", closeGallery);
    const ttl = h("h2", "cg-title", "Cover");
    const q = document.createElement("input"); q.type = "search"; q.className = "cg-search"; q.placeholder = "Nummer, Titel oder Kategorie"; q.value = G.q; q.setAttribute("aria-label", "Suchen");
    q.addEventListener("input", () => { G.q = q.value; paintGallery(); });
    const seg = h("div", "cg-seg"); seg.setAttribute("role", "group");
    [["grid", ic.grid, "Raster"], ["list", ic.list, "Liste"], ["flow", ic.flow, "Karussell"]].forEach(([k, svg, name]) => {
      const b = svgBtn("cg-segbtn", svg, name); b.dataset.v = k; b.setAttribute("aria-pressed", String(G.view === k));
      b.addEventListener("click", () => { if (b._lp) return; G.view = k; lss("coverView", k); seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === k))); galApply(); paintGallery(true); scrollNow(); });
      { let t = 0; const go = () => { b._lp = true; setTimeout(() => { b._lp = false; }, 700); galAdjust(k); };
        b.addEventListener("pointerdown", () => { clearTimeout(t); t = setTimeout(go, 700); });
        ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, () => clearTimeout(t)));
        b.addEventListener("contextmenu", (e) => { e.preventDefault(); clearTimeout(t); go(); });
        b.title = (b.title || VN[k]) + " – lange drücken: Position und Größe anpassen"; }
      seg.append(b);
    });
    const fsb = svgBtn("cg-btn", ic.full, "Browser-Vollbild"); fsb.addEventListener("click", () => fsToggle(gal));
    const pbtn = svgBtn("cg-btn cg-playerbtn", ic.player, "Player (Vollbild)"); pbtn.addEventListener("click", () => openNow());
    top.append(close, ttl, q, seg, pbtn, ...(window.V116 ? [V116.langBtn("lang-gal")] : []), fsb);

    const tools = h("div", "cg-tools");
    const chip = (label, get, set) => { const b = h("button", "cg-chip", label); b.type = "button"; b.setAttribute("aria-pressed", String(get())); b.addEventListener("click", () => { set(!get()); b.setAttribute("aria-pressed", String(get())); paintGallery(); }); return b; };
    const cOnly = chip("Nur mit neuem Cover", () => G.only, (v) => { G.only = v; lss("coverOnly", v ? "1" : "0"); });
    const cFav = chip("★ Nur Favoriten", () => G.fav, (v) => { G.fav = v; });
    const cMark = chip("★ Favoriten zeigen", () => G.mark, (v) => { G.mark = v; lss("coverFavMark", v ? "1" : "0"); gal.classList.toggle("fav-mark", v); });
    cMark.title = "Favoriten bekommen einen goldenen Rahmen";
    const nxt = document.createElement("select"); nxt.className = "cg-sel"; nxt.setAttribute("aria-label", "Danach spielen");
    [["off", "Danach: nichts extra"], ["order", "Danach: Reihenfolge"], ["rand", "Danach: Zufall"]].forEach(([v, n]) => nxt.append(new Option(n, v))); nxt.value = G.next;
    nxt.addEventListener("change", () => { G.next = nxt.value; lss("coverNext", G.next); if (G.next === "off") G.fromGal = false; });
    const dirSel = document.createElement("select"); dirSel.className = "cg-sel cg-dir"; dirSel.setAttribute("aria-label", "Cover-Ordner");
    SETS.forEach(([v, n]) => dirSel.append(new Option(n, v))); dirSel.value = set;
    dirSel.addEventListener("change", () => { pick(dirSel.value).then((ok) => { if (!ok) dirSel.value = set; }); });
    gal._dir = dirSel;
    const cat = document.createElement("select"); cat.className = "cg-sel"; cat.setAttribute("aria-label", "Kategorie");
    const cats = [...new Set(state.songs.map((s) => s.category).filter(Boolean))];
    cat.append(new Option("Alle Kategorien", "")); cats.forEach((c) => cat.append(new Option(c, c))); cat.value = G.cat;
    cat.addEventListener("change", () => { G.cat = cat.value; paintGallery(); });
    const srt = document.createElement("select"); srt.className = "cg-sel"; srt.setAttribute("aria-label", "Sortierung");
    [["num", "Nummer"], ["name", "Titel A–Z"], ["cat", "Kategorie"]].forEach(([v, n]) => srt.append(new Option(n, v))); srt.value = G.sort;
    srt.addEventListener("change", () => { G.sort = srt.value; paintGallery(); });
    const size = h("label", "cg-size"); size.append(h("span", "", "Größe"));
    const sz = document.createElement("input"); sz.type = "range"; sz.min = "100"; sz.max = "360"; sz.step = "10"; sz.value = String(G.size); sz.setAttribute("aria-label", "Größe der Cover");
    sz.addEventListener("input", () => { G.size = Number(sz.value); lss("coverSize", String(G.size)); gal.style.setProperty("--cg-size", G.size + "px"); { const o = galJ("galSizes"); o[G.view] = G.size; lss("galSizes", JSON.stringify(o)); } });
    size.append(sz);
    const cnt = h("span", "cg-count"); cnt.id = "cgCount";
    tools.append(dirSel, cOnly, cFav, cMark, cat, srt, nxt, size, cnt);
    gal.classList.toggle("fav-mark", G.mark);

    const body = h("div", "cg-body"); body.id = "cgBody";
    const mini = h("div", "cg-mini"); mini.id = "cgMini";
    const jump = svgBtn("cg-jump", ic.jump, "Zum aktuellen Lied springen"); jump.hidden = true; jump.append(h("span", "", "Aktuelles Lied"));
    jump.addEventListener("click", jumpNow);
    body.addEventListener("scroll", () => updJump(), { passive: true });
    gal.append(top, tools, body, mini, jump);
    gal.style.setProperty("--nk", String(nkAmt() / 100));
    gal.style.setProperty("--cg-size", G.size + "px");
    gal._r = { body, mini, cnt, size, cOnly, jump, last: "" };
    document.body.append(gal); document.body.classList.add("cg-open"); galApply();
    document.addEventListener("keydown", galKey, true);
    paintGallery(true);
    galTimer = setInterval(paintMini, 400);
    resetPage(); settleNow();
  }
  let galTimer = 0;
  function curNode() {
    if (!gal) return null; const s = cur(); if (!s) return null;
    return [...gal.querySelectorAll("[data-sid]")].find((n) => n.dataset.sid === s.id) || null;
  }
  function jumpNow() {
    const n = curNode(); if (!n || !gal) return;
    const fl = n.closest(".cg-flow");
    if (fl) fl.scrollTo({ left: n.offsetLeft - (fl.clientWidth - n.clientWidth) / 2, behavior: "smooth" });
    else centerIn(gal._r.body, n, true);
  }
  function updJump() {
    if (!gal) return;
    const j = gal._r.jump, n = curNode();
    if (!n) { j.hidden = true; return; }
    const box = n.closest(".cg-flow") || gal._r.body, b = box.getBoundingClientRect(), r = n.getBoundingClientRect();
    const vis = r.bottom > b.top + 8 && r.top < b.bottom - 8 && r.right > b.left + 8 && r.left < b.right - 8;
    j.hidden = vis;
  }
  function galKey(e) {
    if (!gal || np) return;
    if (e.key === "Escape" && document.activeElement && document.activeElement.tagName !== "INPUT") { e.stopPropagation(); closeGallery(); }
  }
  function closeGallery() {
    if (!gal) return;
    clearInterval(galTimer); gal.remove(); gal = null;
    document.removeEventListener("keydown", galKey, true);
    document.body.classList.remove("cg-open"); resetPage();
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch { /* egal */ } }
  }
  function songsFiltered() {
    const q = G.q.trim().toLowerCase();
    let l = state.songs.filter((s) => numOf(s) > 0 || s.title);
    if (G.only) l = l.filter(has);
    if (G.fav) l = l.filter((s) => state.favorites.has(s.id));
    if (G.cat) l = l.filter((s) => s.category === G.cat);
    if (q) l = l.filter((s) => `${s.id} ${numOf(s)} ${s.title} ${s.category || ""}`.toLowerCase().includes(q));
    l = l.slice();
    if (G.sort === "name") l.sort((a, b) => a.title.localeCompare(b.title, "de"));
    else if (G.sort === "cat") l.sort((a, b) => (a.category || "").localeCompare(b.category || "", "de") || numOf(a) - numOf(b));
    else l.sort((a, b) => numOf(a) - numOf(b));
    return l;
  }
  /* Auf das aktuelle Lied scrollen; Bilder laden nach und verschieben das Layout, deshalb mehrmals nachziehen (bis der Nutzer selbst scrollt) */
  let settleT = [];
  function settleNow() {
    settleT.forEach(clearTimeout); settleT = [];
    if (!gal) return;
    const body = gal._r.body; let moved = false;
    const stop = () => { moved = true; };
    ["wheel", "touchstart", "pointerdown", "keydown"].forEach((e) => body.addEventListener(e, stop, { once: true, passive: true }));
    [40, 300, 900, 1800].forEach((ms) => settleT.push(setTimeout(() => {
      if (!gal || moved) return;
      const a = gal._r.body.querySelector(".cg-card.on, .cg-row.on"); if (a) centerIn(gal._r.body, a, false);
    }, ms)));
  }
  const scrollNow = settleNow;
  function favToggle(s) {
    if (state.favorites.has(s.id)) state.favorites.delete(s.id); else state.favorites.add(s.id);
    saveFavorites(); try { renderList(); } catch { /* egal */ }
    if (gal) { gal.querySelectorAll(`[data-sid="${s.id}"]`).forEach((n) => { n.classList.toggle("isfav", state.favorites.has(s.id)); const f = n.querySelector(".cg-fv, .cg-star"); if (f) f.textContent = state.favorites.has(s.id) ? "★" : "☆"; }); if (G.fav) paintGallery(true); }
  }
  /* nach Liedende: in der Reihenfolge der Galerie weiterspielen oder zufällig (nur wenn die Option gewählt und ein Lied aus der Galerie gestartet wurde) */
  function galleryNext() {
    if (G.next === "off" || !G.fromGal) return false;
    const list = songsFiltered(); if (!list.length) return false;
    const now = cur(); const i = now ? list.findIndex((x) => x.id === now.id) : -1;
    let nx;
    if (G.next === "rand") { if (list.length === 1) nx = list[0]; else { do { nx = list[Math.floor(Math.random() * list.length)]; } while (now && nx.id === now.id); } }
    else nx = list[(i + 1) % list.length];
    const k = idxOf(nx); if (k < 0) return false;
    selectSong(k, true); return true;
  }
  const idxOf = (s) => { const k = state.songs.indexOf(s); return k >= 0 ? k : state.songs.findIndex((x) => x.id === s.id); };
  function pickSong(s, autoplay) {
    G.fromGal = true;
    const i = idxOf(s); if (i < 0) return;
    if (state.index === i) { if (autoplay) togglePlay(); return; }
    selectSong(i, autoplay);
  }
  /* Cover antippen: Lied starten (falls es nicht schon läuft) und den Player öffnen */
  function pickOpen(s) {
    G.fromGal = true;
    const i = idxOf(s);
    if (i < 0) return;
    if (state.index !== i) selectSong(i, true);
    openNow();
  }
  function eq() { const e = h("span", "cg-eq"); e.innerHTML = "<i></i><i></i><i></i>"; return e; }
  function coverImg(s, cls) {
    const u = newUrl(s);
    const im = h("img", cls || "cg-img"); im.alt = ""; im.loading = "lazy"; im.decoding = "async";
    im.src = u || OLD; if (!u) im.classList.add("old");
    return im;
  }
  function paintGallery(force) {
    if (!gal) return;
    const r = gal._r, list = songsFiltered(), now = cur();
    const withCover = state.songs.filter(has).length;
    r.cnt.textContent = `${list.length} Lieder · ${withCover} mit Cover`;
    gal.dataset.view = G.view;
    const sig = G.view + "|" + list.map((s) => s.id).join(",") + "|" + Object.keys(map).length + "|" + (state.media ? 1 : 0) + lsv("musikLang", "en") + lsv("galNoKar", "1");
    if (!force && sig === r.last) { markNow(); paintMini(); return; }
    const keep = r.body.scrollTop;
    r.last = sig; r.body.replaceChildren();
    r.body.className = "cg-body v-" + G.view;
    if (!list.length) r.body.append(h("p", "cg-empty", state.songs.length ? "Keine Lieder gefunden." : "Die Lieder werden noch geladen …"));
    if (G.view === "grid") {
      const g = h("div", "cg-grid");
      list.forEach((s) => {
        const c = h("div", "cg-card" + (now === s ? " on" : "") + (has(s) ? "" : " nocover") + (noKar(s) ? " nokar" : "") + (state.favorites.has(s.id) ? " isfav" : "")); c.dataset.sid = s.id;
        const wrap = h("button", "cg-art"); wrap.type = "button"; wrap.setAttribute("aria-label", `${s.id} ${s.title} abspielen`);
        wrap.append(coverImg(s));
        const pl = h("span", "cg-pl"); pl.innerHTML = (now === s && playing()) ? ic.pause : ic.play; wrap.append(pl);
        const fv = h("span", "cg-fv", state.favorites.has(s.id) ? "★" : "☆"); fv.setAttribute("role", "button"); fv.setAttribute("aria-label", "Favorit"); wrap.append(fv);
        if (now === s) wrap.append(eq());
        if (!has(s)) wrap.append(h("span", "cg-tag", "altes Bild"));
        wrap.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".cg-fv")) { favToggle(s); return; } if (e.target.closest && e.target.closest(".cg-pl")) { pickSong(s, true); return; } pickOpen(s); });
        const t = h("button", "cg-meta"); t.type = "button";
        t.append(h("b", "", `${s.id} · ${s.title}`), h("small", "", s.category || ""));
        t.addEventListener("click", () => { pickOpen(s); });
        c.append(wrap, t); g.append(c);
      });
      r.body.append(g);
    } else if (G.view === "list") {
      const ul = h("div", "cg-list");
      list.forEach((s) => {
        const row = h("div", "cg-row" + (now === s ? " on" : "") + (has(s) ? "" : " nocover") + (noKar(s) ? " nokar" : "") + (state.favorites.has(s.id) ? " isfav" : "")); row.dataset.sid = s.id;
        const n = h("span", "cg-n", s.id);
        const th = h("button", "cg-thumb"); th.type = "button"; th.append(coverImg(s, "cg-img")); th.setAttribute("aria-label", "Cover groß");
        th.addEventListener("click", () => { pickOpen(s); });
        const tx = h("button", "cg-rowtxt"); tx.type = "button"; tx.append(h("b", "", s.title), h("small", "", s.category || ""));
        tx.addEventListener("click", () => pickSong(s, true));
        const st = h("button", "cg-star", state.favorites.has(s.id) ? "★" : "☆"); st.type = "button"; st.setAttribute("aria-label", "Favorit");
        st.addEventListener("click", () => favToggle(s));
        const pb = svgBtn("cg-rowplay", now === s && playing() ? ic.pause : ic.play, "Abspielen"); pb.addEventListener("click", () => pickSong(s, true));
        row.append(n, th, tx, st, pb);
        if (now === s) row.append(eq());
        ul.append(row);
      });
      r.body.append(ul);
    } else {
      const wrap = h("div", "cg-flowwrap");
      const fl = h("div", "cg-flow"); fl.tabIndex = 0;
      const items = list.map((s) => {
        const it = h("button", "cg-fl" + (now === s ? " on" : "") + (has(s) ? "" : " nocover") + (noKar(s) ? " nokar" : "") + (state.favorites.has(s.id) ? " isfav" : "")); it.type = "button"; it.dataset.sid = s.id;
        it.append(coverImg(s)); it._s = s; fl.append(it); return it;
      });
      const cap = h("div", "cg-cap"); const cn = h("p", "cg-capn"); const ct = h("h3", "cg-capt"); const cc = h("p", "cg-capc");
      const play = svgBtn("cg-bigplay", ic.play, "Abspielen");
      const fvb = h("button", "cg-capfav", "☆"); fvb.type = "button"; fvb.setAttribute("aria-label", "Favorit");
      cap.append(cn, ct, cc, play, fvb);
      const prev = svgBtn("cg-arrow l", ic.prev, "Vorheriges"), next = svgBtn("cg-arrow r", ic.next, "Nächstes");
      wrap.append(prev, fl, next, cap);
      r.body.append(wrap);
      let cIdx = Math.max(0, items.findIndex((x) => x._s === now));
      const center = (i, smooth) => { const it = items[i]; if (!it) return; fl.scrollTo({ left: it.offsetLeft - (fl.clientWidth - it.clientWidth) / 2, behavior: smooth ? "smooth" : "auto" }); };
      const upd = () => {
        const mid = fl.scrollLeft + fl.clientWidth / 2; let best = 0, bd = 1e9;
        items.forEach((it, i) => { const d = (it.offsetLeft + it.clientWidth / 2 - mid) / (it.clientWidth || 1); it.style.setProperty("--d", d.toFixed(2)); it.style.setProperty("--a", Math.min(1, Math.abs(d)).toFixed(2)); if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; } });
        if (best !== cIdx || !cn.textContent) { cIdx = best; const s = items[best] && items[best]._s; if (s) { cn.textContent = `Lied ${s.id}`; ct.textContent = s.title; cc.textContent = s.category || ""; } }
        play.innerHTML = (items[cIdx] && items[cIdx]._s === cur() && playing()) ? ic.pause : ic.play;
        fvb.textContent = items[cIdx] && state.favorites.has(items[cIdx]._s.id) ? "★" : "☆";
      };
      fl.addEventListener("scroll", () => requestAnimationFrame(upd));
      items.forEach((it, i) => it.addEventListener("click", () => { if (i === cIdx) { pickOpen(it._s); } else center(i, true); }));
      prev.addEventListener("click", () => center(Math.max(0, cIdx - 1), true));
      next.addEventListener("click", () => center(Math.min(items.length - 1, cIdx + 1), true));
      play.addEventListener("click", () => { const it = items[cIdx]; if (it) pickSong(it._s, true); });
      fvb.addEventListener("click", () => { const it = items[cIdx]; if (it) { favToggle(it._s); it.classList.toggle("isfav", state.favorites.has(it._s.id)); upd(); } });
      ct.addEventListener("click", () => { const it = items[cIdx]; if (it) { pickOpen(it._s); } });
      fl.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); center(Math.min(items.length - 1, cIdx + 1), true); } else if (e.key === "ArrowLeft") { e.preventDefault(); center(Math.max(0, cIdx - 1), true); } });
      const target = cIdx; let userMv = false;
      ["pointerdown", "wheel", "keydown", "touchstart"].forEach((e) => wrap.addEventListener(e, () => { userMv = true; }, { once: true, passive: true }));
      requestAnimationFrame(() => { center(target, false); upd(); });
      [300, 900, 1800].forEach((ms) => setTimeout(() => { if (!userMv && gal && fl.isConnected) { center(target, false); upd(); } }, ms));
    }
    if (G.view !== "flow") r.body.scrollTop = keep;
    paintMini();
    clearTimeout(r.chk);
    r.chk = setTimeout(() => { if (!gal) return; const all = state.songs.length && Object.keys(map).length && state.songs.filter((x) => numOf(x) > 0).every(has); r.cOnly.hidden = !!all; if (all && G.only) { G.only = false; lss("coverOnly", "0"); } }, 1500);
  }
  /* aktuelles Lied markieren, ohne die Galerie neu aufzubauen (Bildlauf bleibt stehen) */
  function markNow() {
    if (!gal) return;
    const now = cur();
    gal.querySelectorAll(".cg-card.on, .cg-row.on, .cg-fl.on").forEach((x) => { x.classList.remove("on"); const e = x.querySelector(".cg-eq"); if (e) e.remove(); });
    gal.querySelectorAll(".cg-pl, .cg-rowplay").forEach((x) => { x.innerHTML = ic.play; delete x.dataset.p; });
    if (!now) return;
    const x = [...gal.querySelectorAll("[data-sid]")].find((n) => n.dataset.sid === now.id);
    if (x) { x.classList.add("on"); (x.querySelector(".cg-art") || x).append(eq()); }
  }
  function paintMini() {
    if (!gal) return;
    const m = gal._r.mini, s = cur();
    m.hidden = !s;
    if (!s) return;
    const p = playing();
    const sig = s.id + "|" + src(s) + "|" + p;
    if (m._sig !== sig) {
      m._sig = sig; m.replaceChildren();
      const th = h("button", "cg-minithumb"); th.type = "button"; const im = h("img"); im.alt = ""; im.src = src(s); th.append(im);
      th.addEventListener("click", () => { if (lsv("galMini", "player") === "player") openNow(); });
      const tx = h("button", "cg-minitxt"); tx.type = "button"; tx.append(h("b", "", s.title), h("small", "", `Lied ${s.id}${s.category ? " · " + s.category : ""}`));
      tx.addEventListener("click", () => { if (lsv("galMini", "player") === "player") openNow(); });
      const pv = svgBtn("cg-minibtn", ic.prev, "Vorheriges Lied"), pl = svgBtn("cg-minibtn big", p ? ic.pause : ic.play, p ? "Pause" : "Wiedergabe"), nx = svgBtn("cg-minibtn", ic.next, "Nächstes Lied");
      pv.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(-1); });
      nx.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(1); });
      pl.addEventListener("click", () => togglePlay());
      const bar = document.createElement("input"); bar.type = "range"; bar.className = "cg-minibar"; bar.min = "0"; bar.max = "1000"; bar.value = "0"; bar.setAttribute("aria-label", "Position");
      bar.addEventListener("pointerdown", () => { m._drag = true; });
      ["pointerup", "pointercancel", "change"].forEach((e) => bar.addEventListener(e, () => { m._drag = false; }));
      bar.addEventListener("input", () => { const d = el.audio.duration; if (d && isFinite(d)) el.audio.currentTime = d * (Number(bar.value) / 1000); });
      m.append(th, tx, pv, pl, nx, bar);
    }
    const d = el.audio.duration, c = el.audio.currentTime || 0;
    const bar = m.querySelector(".cg-minibar"); if (bar && !m._drag) { const v = d && isFinite(d) ? Math.round(Math.min(1, c / d) * 1000) : 0; bar.value = String(v); bar.style.setProperty("--p", v / 10 + "%"); }
    /* Raster/Liste: Abspiel-Symbol und Equalizer mitführen */
    gal.querySelectorAll(".cg-card.on .cg-pl, .cg-row.on .cg-rowplay").forEach((x) => { const want = p ? ic.pause : ic.play; if (x.dataset.p !== String(p)) { x.dataset.p = String(p); x.innerHTML = want; } });
    gal.classList.toggle("is-playing", p);
  }

  /* ---------- Start ---------- */
  function boot() {
    ensureThumb();
    try { let lp = lupe(); new MutationObserver(() => { if (lupe() !== lp) { lp = lupe(); changed(); } }).observe(document.body, { attributes: true, attributeFilter: ["class"] }); } catch { /* egal */ }
    const gb = $("coverGalleryBtn"); if (gb) gb.addEventListener("click", openGallery);
    const fg = $("footGallery"); if (fg) fg.addEventListener("click", () => { openGallery(); });
    load(false);
    setInterval(() => { const s = cur(); const k = s ? s.id : ""; if (boot.k !== k) { boot.k = k; paintThumb(); if (gal) paintGallery(); } if (gal) { paintMini(); updJump(); } }, 500);
    window.addEventListener("pagehide", () => { /* nichts */ });
  }
  window.COVERS = { galAdjust, galApply, setSet, pick, setLang: (id) => SET_LANG[id === undefined ? set : id] || "", pairOf: (id) => SET_PAIR[id === undefined ? set : id] || "", loadSetMap, urlOfKey, get set() { return set; }, SETS, galleryNext, src, has, newUrl, artwork, load, mode, refresh: changed, openGallery, closeGallery, openNow, closeNow, get map() { return map; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
