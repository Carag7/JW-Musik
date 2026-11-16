/* „Besondere Lieder“: eigener Liederbestand (Worker carag-backblaze / Backblaze B2), getrennt von Karaoke, Zusammenkünfte, Instrumental und Video.
   Umschalter über der Liederliste; alle Ansichten der App arbeiten danach mit diesem Bestand. Reiter „Besondere Lieder“ (Synchronisieren). */
(function () {
  "use strict";
  const DEF_BASE = "https://carag-backblaze.carag.workers.dev";
  const base = () => String(window.BES_BASE || lsv("besBase", DEF_BASE) || DEF_BASE).replace(/\/+$/, "");
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pad = (n) => String(n).padStart(3, "0");
  const stash = {};            /* gemerkter Bestand: stash.main / stash.bes */
  let manifest = null;         /* geladene Titelliste */
  let busy = false;

  /* ---------- Titelliste laden ---------- */
  async function loadManifest(fresh) {
    if (!fresh && manifest) return manifest;
    try {
      const res = await fetch(`${base()}/bes/songs.json`, { cache: "no-store" });
      if (!res.ok) { let t = ""; try { t = ((await res.json()).fehler) || ""; } catch { /* egal */ } throw new Error(`HTTP ${res.status} ${t}`.trim()); }
      const m = await res.json();
      if (!m || !Array.isArray(m.songs)) throw new Error("keine Liste");
      manifest = m;
      try { localStorage.setItem("besCache", JSON.stringify(m)); } catch { /* egal */ }
    } catch (e) {
      try { manifest = JSON.parse(localStorage.getItem("besCache") || "null"); } catch { manifest = null; }
      if (!manifest) throw e;
    }
    return manifest;
  }
  /* aus der Titelliste: Lieder + Dateiverzeichnis im Format der App */
  function build(m) {
    const empty = () => ({ karaoke: { audio: {}, lrc: {} }, meeting: { audio: {}, video: {}, lrc: {}, sung: {}, sungLrc: {} } });
    const media = empty(); media.de = empty();
    const songs = [];
    for (const s of m.songs) {
      const n = Number(s.n); if (!n) continue;
      const f = s.files || {}, t = s.title || {};
      if (f.en && f.en.mp3) media.meeting.audio[n] = f.en.mp3;
      if (f.en && f.en.mp4) media.meeting.video[n] = f.en.mp4;
      if (f.de && f.de.mp3) media.de.meeting.audio[n] = f.de.mp3;
      if (f.de && f.de.mp4) media.de.meeting.video[n] = f.de.mp4;
      songs.push({ id: pad(n) + "b", number: n, title: t.en || t.de || `Lied ${n}`, _de: t.de || t.en || "", category: "", bes: true, extra: false });
    }
    wrapTitles(songs);
    songs.sort((a, b) => a.number - b.number);
    return { songs, media };
  }

  /* ---------- Umschalten ---------- */
  const cur = () => (state.lib === "bes" ? "bes" : "main");
  async function switchLib(to, quiet) {
    if (to === cur() || busy) return;
    busy = true; paintSwitch();
    try {
      let next = null;
      if (to === "bes") {
        const m = await loadManifest(false);
        next = build(m);
      } else next = stash.main;
      if (!next) { location.reload(); return; }
      stash[cur()] = { songs: state.songs, media: state.media, index: state.index };
      try { el.audio.pause(); } catch { /* egal */ }
      state.lib = to; lss("lib", to);
      document.body.classList.toggle("lib-bes", to === "bes");
      state.songs = next.songs; state.media = next.media;
      state.index = typeof next.index === "number" ? next.index : -1;
      state.category = ""; state.playFavorites = false;
      state.shufPlayed = new Set();
      fillCategories(); renderList(); updateVersionBar();
      el.status.textContent = to === "bes" ? `${state.songs.length} Besondere Lieder` : `${state.songs.length} Lieder`;
    } catch (e) {
      if (!quiet) await uiAlert("Besondere Lieder", `Die Liste der Besonderen Lieder konnte nicht geladen werden (${(e && e.message) || e}). Prüfe im Reiter „Besondere Lieder“ die Worker-Adresse und gleiche mit jw.org ab.`);
    } finally { busy = false; paintSwitch(); }
  }
  /* geladene Standard-Funktionen dürfen den Bestand nicht überschreiben, solange „Besondere Lieder“ aktiv sind */
  function guard(name) {
    const orig = window[name];
    if (typeof orig !== "function") return;
    const wrapped = function (...a) {
      if (state.lib === "bes") { if (name === "loadMedia" || name === "loadSongs") { stash.pendingMain = true; return Promise.resolve(); } return undefined; }
      return orig.apply(this, a);
    };
    try { window[name] = wrapped; } catch { /* egal */ }
    try { (0, eval)(`${name} = window.${name}`); } catch { /* egal */ }
  }

  /* ---------- Umschalter über der Liste ---------- */
  function paintSwitch() {
    const box = document.getElementById("libSwitch"); if (!box) return;
    if (!box.children.length) {
      [["main", "Lieder"], ["bes", "Besondere Lieder"]].forEach(([id, label]) => {
        const b = h("button", "chip lib-btn", label); b.type = "button"; b.dataset.lib = id;
        b.onclick = () => switchLib(id);
        box.append(b);
      });
    }
    box.querySelectorAll(".lib-btn").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.lib === cur())); b.disabled = busy; });
  }

  /* ---------- Reiter „Besondere Lieder“ ---------- */
  const FMT = [["en", "mp3", "EN MP3"], ["en", "mp4", "EN Video"], ["de", "mp3", "DE MP3"], ["de", "mp4", "DE Video"]];
  let plan = null, lastCheck = null;
  let logLines = [];
  async function api(action, key, post) {
    const pw = sessionStorage.getItem("besKey") || "";
    const res = await fetch(`${base()}/api/bes-sync?action=${action}${key ? "&key=" + encodeURIComponent(key) : ""}`, { method: post ? "POST" : "GET", headers: pw ? { "x-write-key": pw } : {} });
    let j = null; try { j = await res.json(); } catch { /* egal */ }
    if (res.status === 401) { sessionStorage.removeItem("besKey"); throw new Error("Passwort abgelehnt"); }
    if (!res.ok || !j || j.ok === false) throw new Error((j && j.fehler) || `HTTP ${res.status}`);
    return j;
  }
  function mount(box) {
    if (!box) return;
    if (lastCheck === null) lastCheck = lsv("besCheck", "");
    box.replaceChildren();
    const info = h("div", "fehl-info");
    const st = h("p", "set-hint");
    const addr = h("label", "set-row", "Worker-Adresse "); const inp = h("input"); inp.type = "url"; inp.value = base(); inp.style.minWidth = "16em";
    inp.onchange = () => { lss("besBase", inp.value.trim() || DEF_BASE); manifest = null; paint(); }; addr.append(inp);
    const btns = h("div", "v163-btns");
    const bCheck = h("button", "chip", "Mit jw.org abgleichen (prüfen)"), bLoad = h("button", "chip", "Fehlende Dateien laden"), bList = h("button", "chip", "Titelliste neu laden"), bOpen = h("button", "chip", "Besondere Lieder öffnen");
    [bCheck, bLoad, bList, bOpen].forEach((b) => { b.type = "button"; btns.append(b); });
    const prog = h("p", "set-hint"); const log = h("pre", "fehl-log"); log.style.cssText = "max-height:22vh;overflow:auto;white-space:pre-wrap;font-size:12px";
    const tbl = h("div", "dlg-table-wrap");
    box.append(h("h3", "", "Besondere Lieder"), info, addr, btns, st, prog, tbl, log);
    const say = (m) => { logLines.push(new Date().toLocaleTimeString("de-AT") + "  " + m); logLines = logLines.slice(-80); log.textContent = logLines.join("\n"); log.scrollTop = log.scrollHeight; };
    function paint() {
      info.textContent = "Eigene Lieder-Sammlung (Backblaze), getrennt von Karaoke, Zusammenkünfte, Instrumental und Video. Dateien liegen nach Sprache und Format sortiert in bes-Lieder-de-mp3, -de-mp4, -en-mp3, -en-mp4.";
      st.textContent = plan ? `Zuletzt geprüft: ${lastCheck || "gerade eben"} · fehlende Dateien: ${plan.fehlen}` : (lastCheck ? `Zuletzt geprüft: ${lastCheck}` : "Noch nicht mit jw.org abgeglichen.");
      tbl.replaceChildren();
      if (!plan) return;
      const rows = new Map();
      plan.items.forEach((i) => { const r = rows.get(i.track) || { n: i.track, t: { en: "", de: "" }, have: {} }; if (i.title) r.t[i.lang] = i.title; r.have[`${i.lang}-${i.fmt}`] = i.have; rows.set(i.track, r); });
      const table = h("table", "dlg-table");
      const head = h("tr"); ["Nr", "Titel (EN)", "Titel (DE)", ...FMT.map((f) => f[2])].forEach((t) => head.append(h("th", "", t))); table.append(head);
      [...rows.values()].sort((a, b) => a.n - b.n).forEach((r) => {
        const tr = h("tr"); tr.append(h("td", "", String(r.n)), h("td", "", r.t.en), h("td", "", r.t.de));
        FMT.forEach(([l, f]) => { const k = `${l}-${f}`; tr.append(h("td", "", k in r.have ? (r.have[k] ? "✓" : "fehlt") : "–")); });
        table.append(tr);
      });
      tbl.append(table);
    }
    bCheck.onclick = async () => {
      bCheck.disabled = true; say("Prüfe jw.org und Backblaze …");
      try { plan = await api("plan"); lastCheck = new Date().toLocaleString("de-AT"); lss("besCheck", lastCheck); say(`${plan.items.length} Dateien bei jw.org, ${plan.fehlen} fehlen in Backblaze.`); } catch (e) { say("Fehler: " + e.message); }
      bCheck.disabled = false; paint();
    };
    bLoad.onclick = async () => {
      if (!plan) { say("Bitte zuerst „Mit jw.org abgleichen“."); return; }
      const todo = plan.items.filter((i) => !i.have);
      if (!todo.length) { say("Nichts zu laden – alles vorhanden."); return; }
      if (!sessionStorage.getItem("besKey")) {
        const pw = await uiPrompt({ eyebrow: "Besondere Lieder", title: "Schreib-Passwort", type: "password", ok: "Weiter", text: "Das Passwort des Workers (WRITE_KEY). Leer lassen, wenn keines gesetzt ist." });
        if (pw === null) return; sessionStorage.setItem("besKey", pw || "");
      }
      bLoad.disabled = true; let ok = 0, bad = 0;
      for (let n = 0; n < todo.length; n++) {
        const it = todo[n]; prog.textContent = `Lade ${n + 1} von ${todo.length}: ${it.key}`;
        try { await api("get", it.key, true); it.have = true; ok++; say(`✓ ${it.key}`); } catch (e) { bad++; say(`✗ ${it.key}: ${e.message}`); if (/Passwort/.test(e.message)) break; }
      }
      try { const m = await api("manifest", "", true); say(`Titelliste aktualisiert (${m.lieder} Lieder).`); manifest = null; } catch (e) { say("Titelliste: " + e.message); }
      plan.fehlen = plan.items.filter((i) => !i.have).length;
      prog.textContent = `Fertig: ${ok} geladen, ${bad} Fehler.`; bLoad.disabled = false; paint();
    };
    bList.onclick = async () => { try { const m = await loadManifest(true); say(`Titelliste: ${m.songs.length} Lieder.`); if (cur() === "bes") { stash.bes = null; const nb = build(m); state.songs = nb.songs; state.media = nb.media; fillCategories(); renderList(); } } catch (e) { say("Fehler: " + e.message); } };
    bOpen.onclick = async () => { await switchLib("bes"); const f = document.getElementById("codeModal"); if (f) f.hidden = true; };
    paint();
    log.textContent = logLines.join("\n");
  }

  /* ---------- Start (nach dem Laden von app.js) ---------- */
  function start() {
    ["addMissingSongs", "rebuildExtras"].forEach(guard);
    paintSwitch();
    if (lsv("lib", "main") === "bes") {   /* zuletzt war „Besondere Lieder“ aktiv: nach dem Laden der normalen Lieder umschalten */
      let tries = 0;
      const t = setInterval(() => { if ((state.songs.length && state.media) || ++tries > 40) { clearInterval(t); if (state.songs.length) switchLib("bes", true); } }, 500);
    }
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
  window.BES = { base, mount, switchLib, build, loadManifest, current: cur };
})();
