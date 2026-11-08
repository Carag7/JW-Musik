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
  const cur = () => (window.state && state.songs[state.index]) || null;
  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (!loading) loading = fetch("aehnlich.json").then((r) => r.json()).then((j) => (DATA = j.s || {})).catch(() => { DATA = {}; });
    return loading;
  }
  /* Ähnlichkeit zu Lied n: Map Nummer → Prozent */
  function simOf(n) {
    const m = new Map(); const row = DATA && DATA[String(n)]; if (row) row.forEach(([k, p]) => m.set(Number(k), p)); return m;
  }
  function similar(n, min) {
    const m = simOf(n); const out = [];
    state.songs.forEach((s) => { if (!s.extra && s.number !== n && m.get(s.number) >= min) out.push([s, m.get(s.number)]); });
    return out.sort((a, b) => b[1] - a[1]);
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
      state.simOn = false; state.mode = "playlists"; state.activePlaylist = ID; state.selectMode = false;
      try { $("eigeneToggle").setAttribute("aria-pressed", "true"); $("playlistBar").hidden = false; } catch { /* egal */ }
      fillPlaylists(); renderList();
      const isCur = cur() === ref;
      if (!isCur) selectSong(state.songs.indexOf(ref), true);
      try { showToast(`${list.length} ähnliche Lieder folgen als Nächstes`); } catch { /* egal */ }
    });
  }

  /* Knopf im Player */
  function ensureBtn() {
    let b = $("similarBtn"); if (b) return b;
    const row = $("titleRow"); if (!row) return null;
    b = h("button", "star-btn sim-btn", "≈"); b.id = "similarBtn"; b.type = "button"; b.title = "Ähnliche Lieder als Nächstes spielen"; b.setAttribute("aria-label", "Ähnliche Lieder");
    b.onclick = () => playSimilar();
    row.append(b); return b;
  }
  const paintBtn = () => { const b = ensureBtn(); document.body.classList.toggle("sim-off", lsv("simBtn", "1") !== "1"); if (b) b.hidden = false; };

  /* Liste: Ähnliche Lieder zum gewählten Lied */
  function bar() {
    let b = $("simBar"); if (b) return b;
    const pb = $("playlistBar"); if (!pb) return null;
    b = h("div", "sim-bar"); b.id = "simBar"; b.hidden = true;
    const lab = h("label", "sim-ref"); lab.append(h("span", "", "Lied: "));
    const sel = h("select"); sel.id = "simRef"; lab.append(sel);
    const rg = h("label", "sim-rng"); rg.append(h("span", "", "Genauigkeit: "));
    const r = h("input"); r.type = "range"; r.min = "10"; r.max = "80"; r.step = "1"; r.id = "simRange";
    const o = h("output"); o.id = "simOut"; rg.append(r, o);
    const cnt = h("small", "sim-cnt"); cnt.id = "simCnt";
    const play = h("button", "chip", "Als Nächstes spielen"); play.type = "button"; play.id = "simPlay";
    b.append(lab, rg, cnt, play);
    sel.onchange = () => { state.simRef = Number(sel.value); renderList(); };
    r.oninput = () => { lssv("simMin", r.value); renderList(); };
    play.onclick = () => playSimilar(state.songs.find((s) => s.number === state.simRef));
    pb.after(b); return b;
  }
  function paintBar() {
    const b = bar(); if (!b) return;
    const on = !!state.simOn && state.mode === "playlists";
    b.hidden = !on; if (!on) return;
    const sel = $("simRef");
    if (!sel.options.length) state.songs.filter((s) => !s.extra).forEach((s) => { const o = h("option", "", titleOf(s)); o.value = s.number; sel.append(o); });
    sel.value = String(state.simRef); $("simRange").value = String(thr()); $("simOut").textContent = thr() + " %";
    $("simCnt").textContent = similar(state.simRef, thr()).length + " Lieder";
  }
  function startSim() {
    load().then(() => {
      state.simOn = true; state.activePlaylist = ""; state.selectMode = false;
      const c = cur(); if (!state.simRef) state.simRef = c && !c.extra ? c.number : 1;
      fillPlaylists(); renderList();
    });
  }
  function badges() {
    if (!(state.simOn && state.mode === "playlists" && DATA)) return;
    const m = simOf(state.simRef);
    document.querySelectorAll("#songList .song-btn, .song-list .song-btn").forEach((btn) => {
      const s = state.songs.find((x) => x.id === btn.dataset.id); if (!s) return;
      const i = h("em", "sim-pct", s.number === state.simRef ? "Bezug" : (m.get(s.number) || 0) + " %");
      btn.append(i);
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
    try { paintBar(); badges(); } catch { /* egal */ }
    return r;
  });
  wrap("fillPlaylists", (orig) => function () {
    const r = orig.apply(this, arguments);
    try {
      const box = $("playlistButtons");
      if (box) {
        const chip = h("button", "chip sim-chip", "Ähnliche Lieder"); chip.type = "button";
        if (state.simOn) { chip.setAttribute("aria-pressed", "true"); box.querySelectorAll(".chip[aria-pressed=true]").forEach((c) => { if (c !== chip) c.removeAttribute("aria-pressed"); }); }
        chip.onclick = (e) => { e.stopPropagation(); startSim(); };
        box.prepend(chip);
        box.querySelectorAll(".chip:not(.sim-chip)").forEach((c) => c.addEventListener("click", () => { state.simOn = false; }, true));
      }
      const sel = $("playlistSelect"); if (sel && !sel._sim) { sel._sim = 1; sel.addEventListener("change", () => { state.simOn = false; }, true); }
    } catch { /* egal */ }
    return r;
  });
  wrap("selectSong", (orig) => function () {
    const r = orig.apply(this, arguments);
    try { const c = cur(); if (c && !c.extra && !state.simOn) state.simRef = c.number; } catch { /* egal */ }
    return r;
  });
  ["menuToggle", "ludwtToggle"].forEach((id) => { const b = $(id); if (b) b.addEventListener("click", () => { state.simOn = false; }, true); });
  window.V131 = { playSimilar, similar, load, paintBtn };
  const boot = () => { paintBtn(); load(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.addEventListener("storage", paintBtn);
})();
