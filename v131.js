/* v131: Ähnliche Lieder (Daten: aehnlich.json – Liedtext, Titel, Bibeltexte, Themengruppe) */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lssv = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  let DATA = null, loading = null;
  const ID = "similar-auto";
  const thr = () => Math.max(10, Math.min(90, Number(lsv("simMin", "30")) || 30));
  const cur = () => (typeof state !== "undefined" && state.songs[state.index]) || null;
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (!loading) loading = fetch("aehnlich.json").then((r) => r.json()).then((j) => (DATA = j.s || {})).catch(() => { DATA = {}; });
    return loading;
  }
  /* Ähnlichkeit zu Lied n: Map Nummer → Prozent */
  function simOf(n) {
    const m = new Map(); const row = DATA && DATA[String(n)]; if (row) row.forEach(([k, p]) => m.set(Number(k), p)); return m;
  }
  const auto = () => lsv("simMin", "30") === "auto";
  const topN = () => Math.max(1, Math.min(60, Number(lsv("simTop", "10")) || 10));
  function similar(n, min) {
    const m = simOf(n); const out = [];
    const lim = auto() ? 1 : min;
    state.songs.forEach((s) => { if (!s.extra && s.number !== n && m.get(s.number) >= lim) out.push([s, m.get(s.number)]); });
    out.sort((a, b) => b[1] - a[1]);
    return auto() ? out.slice(0, topN()) : out;
  }
  const titleOf = (s) => (s ? `${s.id} ${s.title}` : "");

  /* Wiedergabeliste „Ähnlich zu …“ anlegen und aktivieren (aktuelles Lied zuerst) */
  function playSimilar(ref) {
    ref = ref || cur(); if (!ref) return;
    load().then(() => {
      const list = similar(ref.number, thr());
      if (!list.length) { try { showToast("Keine ähnlichen Lieder bei dieser Genauigkeit"); } catch { /* egal */ } return; }
      const songs = [ref.id, ...list.map(([s]) => s.id)];
      let pl = state.playlists.find((l) => l.id === ID);
      if (!pl) { pl = { id: ID, name: "", songs: [] }; state.playlists.push(pl); }
      pl.name = `Ähnlich zu „${ref.title}“`; pl.songs = songs;
      savePlaylists();
      if (!prev) prev = { mode: state.mode, activePlaylist: state.activePlaylist, selectMode: state.selectMode };
      state.simOn = false; state.mode = "playlists"; state.activePlaylist = ID; state.selectMode = false;
      try { $("eigeneToggle").setAttribute("aria-pressed", "true"); $("playlistBar").hidden = false; } catch { /* egal */ }
      fillPlaylists(); renderList();
      const isCur = cur() === ref;
      if (!isCur) selectSong(state.songs.indexOf(ref), true);
      try { showToast(`${list.length} ähnliche Lieder folgen als Nächstes`); } catch { /* egal */ }
    });
  }

  /* Knopf im Player: 1. Tippen = Bezugslied wählen und „Listen → Ähnliche Lieder“ öffnen, 2. Tippen = zurück */
  let prev = null;
  const active = () => (state.simOn && state.mode === "playlists") || (state.mode === "playlists" && state.activePlaylist === ID);
  function undo() {
    const p = prev || { mode: "songs", activePlaylist: "", selectMode: false }; prev = null;
    state.simOn = false; state.mode = p.mode; state.activePlaylist = p.activePlaylist; state.selectMode = p.selectMode;
    try {
      $("eigeneToggle").setAttribute("aria-pressed", p.mode === "playlists" ? "true" : "false");
      $("playlistBar").hidden = p.mode !== "playlists";
      if (p.mode !== "playlists") $("menuToggle").click();
    } catch { /* egal */ }
    fillPlaylists(); renderList(); try { updateEditTools(); } catch { /* egal */ }
  }
  function ensureBtn() {
    let b = $("similarBtn"); if (b) return b;
    const row = $("titleRow"); if (!row) return null;
    b = h("button", "star-btn sim-btn", "≈"); b.id = "similarBtn"; b.type = "button"; b.title = "Ähnliche Lieder (nochmal tippen = zurück)"; b.setAttribute("aria-label", "Ähnliche Lieder");
    b.onclick = () => {
      if (active()) { undo(); return; }
      const c = cur(); if (!c || c.extra) { try { showToast("Für dieses Lied gibt es keine Ähnlichkeitsdaten"); } catch { /* egal */ } return; }
      prev = { mode: state.mode, activePlaylist: state.activePlaylist, selectMode: state.selectMode };
      state.simRef = c.number;
      if (!(state.mode === "playlists" && state.sidebarOpen)) { $("eigeneToggle").click(); }
      startSim(true);
    };
    row.append(b); return b;
  }
  const paintBtn = () => {
    const b = ensureBtn(); document.body.classList.toggle("sim-off", lsv("simBtn", "1") !== "1");
    if (!b) return;
    const c = cur();
    b.classList.toggle("sim-ref", !!(state.simOn && state.mode === "playlists" && c && state.simRef === c.number));
    b.classList.toggle("sim-play", !!(state.mode === "playlists" && state.activePlaylist === ID));
  };

  /* Liste: Ähnliche Lieder zum gewählten Lied */
  function bar() {
    let b = $("simBar"); if (b) return b;
    const pb = $("playlistBar"); if (!pb) return null;
    b = h("div", "sim-bar"); b.id = "simBar"; b.hidden = true;
    const lab = h("label", "search-wrap sim-ref"); lab.append(h("span", "sr-only", "Bezugslied"));
    const sel = h("select"); sel.id = "simRef"; lab.append(sel);
    const rg = h("label", "sim-rng"); rg.append(h("span", "", "Genauigkeit "));
    const r = h("input"); r.type = "range"; r.min = "10"; r.max = "80"; r.step = "1"; r.id = "simRange";
    const o = h("output"); o.id = "simOut"; rg.append(r, o);
    const cnt = h("small", "sim-cnt"); cnt.id = "simCnt";
    const play = h("button", "chip", "Als Nächstes spielen"); play.type = "button"; play.id = "simPlay";
    b.append(lab, rg, cnt, play);
    sel.onchange = () => { state.simRef = Number(sel.value); renderList(); };
    r.oninput = () => { lssv("simMin", r.value); renderList(); };
    const ab = h("button", "chip", "Auto"); ab.type = "button"; ab.id = "simAuto"; ab.title = "Automatik: immer etwa die ähnlichsten Lieder (Anzahl in den Einstellungen)";
    ab.onclick = () => { lssv("simMin", auto() ? "30" : "auto"); renderList(); };
    rg.append(ab);
    play.onclick = () => playSimilar(state.songs.find((s) => s.number === state.simRef));
    pb.after(b); return b;
  }
  function paintBar() {
    const b = bar(); if (!b) return;
    const on = !!state.simOn && state.mode === "playlists";
    b.hidden = !on; if (!on) return;
    const sel = $("simRef");
    if (!sel.options.length) state.songs.filter((s) => !s.extra).forEach((s) => { const o = h("option", "", titleOf(s)); o.value = s.number; sel.append(o); });
    sel.value = String(state.simRef); $("simRange").value = String(thr()); $("simRange").disabled = auto(); $("simOut").textContent = auto() ? "Auto: " + topN() : thr() + " %"; $("simAuto").setAttribute("aria-pressed", auto() ? "true" : "false");
    $("simCnt").textContent = similar(state.simRef, thr()).length + " Lieder";
  }
  function startSim(keepRef) {
    load().then(() => {
      if (!prev) prev = { mode: "songs", activePlaylist: "", selectMode: false };
      state.simOn = true; state.activePlaylist = ""; state.selectMode = false;
      const c = cur(); if (!keepRef && !state.simRef) state.simRef = c && !c.extra ? c.number : 1;
      if (keepRef && c && !c.extra) state.simRef = c.number;
      fillPlaylists(); renderList(); try { updateEditTools(); } catch { /* egal */ }
    });
  }
  function badges() {
    if (!(state.simOn && state.mode === "playlists" && DATA)) return;
    const m = simOf(state.simRef);
    const fill = lsv("simFill", "1") === "1";
    const opR = Math.max(0, Math.min(100, Number(lsv("simOpRef", "35")))), opF = Math.max(0, Math.min(100, Number(lsv("simOpFill", "28"))));
    document.querySelectorAll("#songList .song-btn").forEach((btn) => {
      const s = state.songs.find((x) => x.id === btn.dataset.id); if (!s) return;
      const isRef = s.number === state.simRef, p = m.get(s.number) || 0;
      if (lsv("simPct", "1") === "1" || isRef) btn.append(h("em", "sim-pct", isRef ? "Bezug" : p + " %"));
      btn.classList.add("sim-row");
      if (isRef) btn.style.background = `color-mix(in srgb, var(--accent) ${opR}%, transparent)`;
      else if (fill) { const c = `color-mix(in srgb, var(--accent) ${opF}%, transparent)`; btn.style.background = `linear-gradient(to right, ${c} 0, ${c} ${p}%, transparent ${p}%)`; }
    });
  }

  function wrap(name, fn) { const orig = window[name] || eval(name); if (!orig) return; const w = fn(orig); try { window[name] = w; } catch { /* egal */ } try { (0, eval)(`${name} = window.${name}`); } catch { /* egal */ } }
  wrap("visibleSongs", (orig) => function () {
    if (state.simOn && state.mode === "playlists" && DATA) {
      const ref = state.songs.find((s) => s.number === state.simRef);
      return ref ? [ref, ...similar(ref.number, thr()).map(([s]) => s)] : [];
    }
    return orig.apply(this, arguments);
  });
  wrap("renderList", (orig) => function () {
    const r = orig.apply(this, arguments);
    try { paintBar(); badges(); paintBtn(); } catch { /* egal */ }
    return r;
  });
  wrap("fillPlaylists", (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      const box = $("playlistButtons");
      if (box) {
        const chip = h("button", "chip sim-chip", "Ähnliche Lieder"); chip.type = "button";
        if (state.simOn) { chip.setAttribute("aria-pressed", "true"); box.querySelectorAll(".chip[aria-pressed=true]").forEach((c) => { if (c !== chip) c.removeAttribute("aria-pressed"); }); }
        chip.onclick = (e) => { e.stopPropagation(); prev = prev || { mode: "playlists", activePlaylist: state.activePlaylist, selectMode: false }; startSim(); };
        box.prepend(chip);
        box.querySelectorAll(".chip:not(.sim-chip)").forEach((c) => {
          c.addEventListener("click", (e) => { if (c._lp) { e.stopImmediatePropagation(); e.preventDefault(); c._lp = false; return; } state.simOn = false; state.plEdit = false; }, true);
          const l = state.playlists.find((x) => x.name === c.textContent && x.id !== ID);
          if (!l) return;
          let t = null; const stop = () => clearTimeout(t);
          c.addEventListener("pointerdown", () => { stop(); t = setTimeout(() => {
            c._lp = true; state.simOn = false; state.activePlaylist = l.id; state.plEdit = !(state.plEdit && state.activePlaylist === l.id && c.dataset.ed === "1");
            fillPlaylists(); renderList(); try { updateEditTools(); } catch { /* egal */ }
            const pe = $("playlistEdit"); if (pe) pe.hidden = false;
          }, Math.max(2, Number(lsv("plHold", "2")) || 2) * 1000); });
          ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => c.addEventListener(ev, stop));
          c.addEventListener("contextmenu", (e) => e.preventDefault());
        });
      }
      const sel = $("playlistSelect"); if (sel && !sel._sim) { sel._sim = 1; sel.addEventListener("change", () => { state.simOn = false; }, true); }
    } catch { /* egal */ }
    return r;
  });
  wrap("updateEditTools", (orig) => function () {
    const r = orig.apply(this, arguments);
    try { const e = $("playlistEdit"); if (e && (state.activePlaylist === ID || state.simOn)) e.hidden = true; else if (e && state.plEdit && state.activePlaylist) e.hidden = false; } catch { /* egal */ }
    return r;
  });
  /* Neue Benutzer: Liste „meine Liste“, falls noch keine eigene Wiedergabeliste existiert */
  function defaultList() {
    try {
      if (typeof state === "undefined" || !Array.isArray(state.playlists)) return;
      if (state.playlists.some((l) => l.id !== ID)) { lssv("defListDone", "1"); return; }
      if (lsv("defListDone", "0") === "1") return;
      state.playlists.push({ id: "meine-liste", name: "meine Liste", songs: [] });
      savePlaylists();
    } catch { /* egal */ }
  }
  wrap("selectSong", (orig) => function () {
    const r = orig.apply(this, arguments);
    try { const c = cur(); if (c && !c.extra && !state.simOn) state.simRef = c.number; paintBtn(); } catch { /* egal */ }
    return r;
  });
  ["menuToggle", "ludwtToggle"].forEach((id) => { const b = $(id); if (b) b.addEventListener("click", () => { state.simOn = false; }, true); });
  /* Handy quer: --flyer-h = tatsächliche Höhe des Players (kein Leerraum darunter) */
  function flyerFit() {
    try {
      const root = document.documentElement, f = document.querySelector(".flyer");
      const mq = matchMedia("(orientation: landscape) and (max-height: 480px) and (max-width: 1000px) and (pointer: coarse)").matches;
      if (!mq || !f || getComputedStyle(f).display === "none") { root.style.removeProperty("--flyer-h"); return; }
      root.style.setProperty("--flyer-h", Math.ceil(f.getBoundingClientRect().height) + "px", "important");
    } catch { /* egal */ }
  }
  try { const f = document.querySelector(".flyer"); if (f && window.ResizeObserver) new ResizeObserver(flyerFit).observe(f); } catch { /* egal */ }
  window.addEventListener("resize", flyerFit); window.addEventListener("orientationchange", () => setTimeout(flyerFit, 300)); setTimeout(flyerFit, 500);
  function quick() {
    const box = document.querySelector("#toolsBox .adv-btns"); if (!box || $("advToStart")) return;
    const mk = (id, txt, fn) => { const b = h("button", "chip", txt); b.id = id; b.type = "button"; b.onclick = () => { const c = $("codeModal"); if (c) c.hidden = true; try { fn(); } catch { /* egal */ } }; box.append(b); };
    mk("advToStart", "Startseite öffnen", () => window.V116 && V116.toStart());
    mk("advToGal", "Galerie öffnen", () => window.COVERS && COVERS.openGallery());
  }
  window.V131 = { playSimilar, similar, load, paintBtn };
  const boot = () => { paintBtn(); load(); quick(); [2500, 6000, 12000].forEach((t) => setTimeout(() => { defaultList(); try { fillPlaylists(); } catch { /* egal */ } }, t)); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.addEventListener("storage", paintBtn);
})();
