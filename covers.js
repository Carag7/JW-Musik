/* Cover: neue Bilder aus R2 (Ordner covers_edel/, Dateien 003.jpg …), Galerie (Raster · Liste · Karussell) und Vollbild „Jetzt läuft“.
 * Fehlt ein Cover, wird das alte Bild (start-bg.png) verwendet. Einstellung „coverMode“: neu (Standard) oder alt. */
(function () {
  "use strict";
  const OLD = "start-bg.png";
  const $ = (id) => document.getElementById(id);
  const base = () => (typeof SYNC_BASE !== "undefined" ? SYNC_BASE : location.origin);
  const lupe = () => document.body.classList.contains("glass-open");
  const mode = () => (lsv("coverMode", "neu") === "alt" || !lupe() ? "alt" : "neu");
  const numOf = (s) => { const n = parseInt(s && (s.number != null ? s.number : s.id), 10); return n > 0 ? n : 0; };
  let map = {};
  let loaded = 0, loading = null;

  try { const c = JSON.parse(lsv("coverIdx", "null")); if (c && c.map) { map = c.map; loaded = c.t || 0; } } catch { /* egal */ }

  function load(force) {
    if (loading) return loading;
    if (!force && loaded && Date.now() - loaded < 10 * 60 * 1000) return Promise.resolve(map);
    loading = fetch(`${base()}/api/covers`, { cache: force ? "reload" : "default" }).then((r) => r.ok ? r.json() : null).then((j) => {
      if (j && j.ok && j.map) { map = j.map; loaded = Date.now(); try { lss("coverIdx", JSON.stringify({ t: loaded, map })); } catch { /* egal */ } }
      return map;
    }).catch(() => map).finally(() => { loading = null; changed(); });
    return loading;
  }
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
    thumb.addEventListener("click", () => openNow());
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
    full: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>'
  };
  const svgBtn = (cls, svg, label) => { const b = h("button", cls); b.type = "button"; b.innerHTML = svg; b.setAttribute("aria-label", label); b.title = label; return b; };

  /* ---------- Vollbild „Jetzt läuft“ ---------- */
  let np = null, npTimer = 0, npFill = lsv("coverFill", "0") === "1";
  function openNow() {
    if (np) return;
    np = h("div", "np"); np.id = "npOverlay"; np.setAttribute("role", "dialog"); np.setAttribute("aria-label", "Jetzt läuft");
    np.classList.toggle("fill", npFill);
    const bg = h("div", "np-bg");
    const top = h("div", "np-top");
    const close = svgBtn("np-btn", '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>', "Schließen");
    close.addEventListener("click", closeNow);
    const lab = h("span", "np-label", "Jetzt läuft");
    const tools = h("div", "np-tools");
    const gb = svgBtn("np-btn", ic.grid, "Galerie"); gb.addEventListener("click", () => { closeNow(); openGallery(); });
    const fb = svgBtn("np-btn", ic.full, "Cover füllt den ganzen Bildschirm"); fb.id = "npFillBtn"; fb.setAttribute("aria-pressed", String(npFill));
    fb.addEventListener("click", () => { npFill = !npFill; lss("coverFill", npFill ? "1" : "0"); np.classList.toggle("fill", npFill); fb.setAttribute("aria-pressed", String(npFill)); });
    const sb = svgBtn("np-btn", '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z"/></svg>', "Browser-Vollbild");
    sb.addEventListener("click", () => fsToggle(np));
    tools.append(gb, fb, sb);
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
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { closeNow(); return; }   // Antippen: zurück zum Karaoke-Text (das kleine Cover öffnet wieder)
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { if (typeof stepAllowed !== "function" || stepAllowed()) step(dx < 0 ? 1 : -1); }
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeNow();
    });
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
  const G = { view: lsv("coverView", "grid"), size: Number(lsv("coverSize", "170")) || 170, q: "", only: lsv("coverOnly", "0") === "1", fav: false, cat: "", sort: "num" };
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
      b.addEventListener("click", () => { G.view = k; lss("coverView", k); seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === k))); paintGallery(true); });
      seg.append(b);
    });
    const fsb = svgBtn("cg-btn", ic.full, "Browser-Vollbild"); fsb.addEventListener("click", () => fsToggle(gal));
    top.append(close, ttl, q, seg, fsb);

    const tools = h("div", "cg-tools");
    const chip = (label, get, set) => { const b = h("button", "cg-chip", label); b.type = "button"; b.setAttribute("aria-pressed", String(get())); b.addEventListener("click", () => { set(!get()); b.setAttribute("aria-pressed", String(get())); paintGallery(); }); return b; };
    const cOnly = chip("Nur mit neuem Cover", () => G.only, (v) => { G.only = v; lss("coverOnly", v ? "1" : "0"); });
    const cFav = chip("★ Favoriten", () => G.fav, (v) => { G.fav = v; });
    const cat = document.createElement("select"); cat.className = "cg-sel"; cat.setAttribute("aria-label", "Kategorie");
    const cats = [...new Set(state.songs.map((s) => s.category).filter(Boolean))];
    cat.append(new Option("Alle Kategorien", "")); cats.forEach((c) => cat.append(new Option(c, c))); cat.value = G.cat;
    cat.addEventListener("change", () => { G.cat = cat.value; paintGallery(); });
    const srt = document.createElement("select"); srt.className = "cg-sel"; srt.setAttribute("aria-label", "Sortierung");
    [["num", "Nummer"], ["name", "Titel A–Z"], ["cat", "Kategorie"]].forEach(([v, n]) => srt.append(new Option(n, v))); srt.value = G.sort;
    srt.addEventListener("change", () => { G.sort = srt.value; paintGallery(); });
    const size = h("label", "cg-size"); size.append(h("span", "", "Größe"));
    const sz = document.createElement("input"); sz.type = "range"; sz.min = "100"; sz.max = "360"; sz.step = "10"; sz.value = String(G.size); sz.setAttribute("aria-label", "Größe der Cover");
    sz.addEventListener("input", () => { G.size = Number(sz.value); lss("coverSize", String(G.size)); gal.style.setProperty("--cg-size", G.size + "px"); });
    size.append(sz);
    const cnt = h("span", "cg-count"); cnt.id = "cgCount";
    tools.append(cOnly, cFav, cat, srt, size, cnt);

    const body = h("div", "cg-body"); body.id = "cgBody";
    const mini = h("div", "cg-mini"); mini.id = "cgMini";
    gal.append(top, tools, body, mini);
    gal.style.setProperty("--cg-size", G.size + "px");
    gal._r = { body, mini, cnt, size, last: "" };
    document.body.append(gal); document.body.classList.add("cg-open");
    document.addEventListener("keydown", galKey, true);
    paintGallery(true);
    galTimer = setInterval(paintMini, 400);
    setTimeout(() => { const a = body.querySelector(".cg-card.on, .cg-row.on, .cg-fl.on"); if (a && a.scrollIntoView) a.scrollIntoView({ block: "center", inline: "center" }); }, 60);
  }
  let galTimer = 0;
  function galKey(e) {
    if (!gal || np) return;
    if (e.key === "Escape" && document.activeElement && document.activeElement.tagName !== "INPUT") { e.stopPropagation(); closeGallery(); }
  }
  function closeGallery() {
    if (!gal) return;
    clearInterval(galTimer); gal.remove(); gal = null;
    document.removeEventListener("keydown", galKey, true);
    document.body.classList.remove("cg-open");
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
  function pickSong(s, autoplay) {
    const i = state.songs.indexOf(s); if (i < 0) return;
    if (state.index === i) { if (autoplay) togglePlay(); return; }
    selectSong(i, autoplay);
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
    r.size.hidden = G.view !== "grid";
    gal.dataset.view = G.view;
    const sig = G.view + "|" + list.map((s) => s.id).join(",") + "|" + Object.keys(map).length + "|" + (now ? now.id : "") + "|" + state.favorites.size;
    if (!force && sig === r.last) { paintMini(); return; }
    const keep = r.body.scrollTop;
    r.last = sig; r.body.replaceChildren();
    r.body.className = "cg-body v-" + G.view;
    if (!list.length) r.body.append(h("p", "cg-empty", state.songs.length ? "Keine Lieder gefunden." : "Die Lieder werden noch geladen …"));
    if (G.view === "grid") {
      const g = h("div", "cg-grid");
      list.forEach((s) => {
        const c = h("div", "cg-card" + (now === s ? " on" : "") + (has(s) ? "" : " nocover"));
        const wrap = h("button", "cg-art"); wrap.type = "button"; wrap.setAttribute("aria-label", `${s.id} ${s.title} abspielen`);
        wrap.append(coverImg(s));
        const pl = h("span", "cg-pl"); pl.innerHTML = (now === s && playing()) ? ic.pause : ic.play; wrap.append(pl);
        if (now === s) wrap.append(eq());
        if (!has(s)) wrap.append(h("span", "cg-tag", "altes Bild"));
        wrap.addEventListener("click", () => pickSong(s, true));
        const t = h("button", "cg-meta"); t.type = "button";
        t.append(h("b", "", `${s.id} · ${s.title}`), h("small", "", s.category || ""));
        t.addEventListener("click", () => { pickSong(s, false); openNow(); });
        c.append(wrap, t); g.append(c);
      });
      r.body.append(g);
    } else if (G.view === "list") {
      const ul = h("div", "cg-list");
      list.forEach((s) => {
        const row = h("div", "cg-row" + (now === s ? " on" : "") + (has(s) ? "" : " nocover"));
        const n = h("span", "cg-n", s.id);
        const th = h("button", "cg-thumb"); th.type = "button"; th.append(coverImg(s, "cg-img")); th.setAttribute("aria-label", "Cover groß");
        th.addEventListener("click", () => { pickSong(s, false); openNow(); });
        const tx = h("button", "cg-rowtxt"); tx.type = "button"; tx.append(h("b", "", s.title), h("small", "", s.category || ""));
        tx.addEventListener("click", () => pickSong(s, true));
        const st = h("button", "cg-star", state.favorites.has(s.id) ? "★" : "☆"); st.type = "button"; st.setAttribute("aria-label", "Favorit");
        st.addEventListener("click", () => { const i = state.songs.indexOf(s); if (i >= 0 && state.favorites.has(s.id) !== undefined) { if (state.favorites.has(s.id)) state.favorites.delete(s.id); else state.favorites.add(s.id); saveFavorites(); renderList(); paintGallery(true); } });
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
        const it = h("button", "cg-fl" + (now === s ? " on" : "") + (has(s) ? "" : " nocover")); it.type = "button";
        it.append(coverImg(s)); it._s = s; fl.append(it); return it;
      });
      const cap = h("div", "cg-cap"); const cn = h("p", "cg-capn"); const ct = h("h3", "cg-capt"); const cc = h("p", "cg-capc");
      const play = svgBtn("cg-bigplay", ic.play, "Abspielen");
      cap.append(cn, ct, cc, play);
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
      };
      fl.addEventListener("scroll", () => requestAnimationFrame(upd));
      items.forEach((it, i) => it.addEventListener("click", () => { if (i === cIdx) pickSong(it._s, true); else center(i, true); }));
      prev.addEventListener("click", () => center(Math.max(0, cIdx - 1), true));
      next.addEventListener("click", () => center(Math.min(items.length - 1, cIdx + 1), true));
      play.addEventListener("click", () => { const it = items[cIdx]; if (it) pickSong(it._s, true); });
      ct.addEventListener("click", () => { const it = items[cIdx]; if (it) { pickSong(it._s, false); openNow(); } });
      fl.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); center(Math.min(items.length - 1, cIdx + 1), true); } else if (e.key === "ArrowLeft") { e.preventDefault(); center(Math.max(0, cIdx - 1), true); } });
      requestAnimationFrame(() => { center(cIdx, false); upd(); });
    }
    if (G.view !== "flow") r.body.scrollTop = keep;
    paintMini();
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
      th.addEventListener("click", () => openNow());
      const tx = h("button", "cg-minitxt"); tx.type = "button"; tx.append(h("b", "", s.title), h("small", "", `Lied ${s.id}${s.category ? " · " + s.category : ""}`));
      tx.addEventListener("click", () => openNow());
      const pv = svgBtn("cg-minibtn", ic.prev, "Vorheriges Lied"), pl = svgBtn("cg-minibtn big", p ? ic.pause : ic.play, p ? "Pause" : "Wiedergabe"), nx = svgBtn("cg-minibtn", ic.next, "Nächstes Lied");
      pv.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(-1); });
      nx.addEventListener("click", () => { if (typeof stepAllowed !== "function" || stepAllowed()) step(1); });
      pl.addEventListener("click", () => togglePlay());
      const bar = h("div", "cg-minibar"); bar.append(h("i"));
      m.append(th, tx, pv, pl, nx, bar);
    }
    const d = el.audio.duration, c = el.audio.currentTime || 0;
    const bar = m.querySelector(".cg-minibar i"); if (bar) bar.style.width = d && isFinite(d) ? `${Math.min(100, (c / d) * 100)}%` : "0%";
    /* Raster/Liste: Abspiel-Symbol und Equalizer mitführen */
    gal.querySelectorAll(".cg-card.on .cg-pl, .cg-row.on .cg-rowplay").forEach((x) => { const want = p ? ic.pause : ic.play; if (x.dataset.p !== String(p)) { x.dataset.p = String(p); x.innerHTML = want; } });
    gal.classList.toggle("is-playing", p);
  }

  /* ---------- Start ---------- */
  function boot() {
    ensureThumb();
    try { let lp = lupe(); new MutationObserver(() => { if (lupe() !== lp) { lp = lupe(); changed(); } }).observe(document.body, { attributes: true, attributeFilter: ["class"] }); } catch { /* egal */ }
    const gb = $("coverGalleryBtn"); if (gb) gb.addEventListener("click", openGallery);
    load(false);
    setInterval(() => { const s = cur(); const k = s ? s.id : ""; if (boot.k !== k) { boot.k = k; paintThumb(); if (gal) paintGallery(); } if (gal) paintMini(); }, 500);
    window.addEventListener("pagehide", () => { /* nichts */ });
  }
  window.COVERS = { src, has, newUrl, artwork, load, mode, refresh: changed, openGallery, closeGallery, openNow, closeNow, get map() { return map; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
