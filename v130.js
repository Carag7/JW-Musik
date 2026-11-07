/* v130: Spur-/Textauswahl (lang auf den Sprach-Knopf), Tempo-Anzeige im Player, Hilfen */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const cur = () => { try { return state.songs[state.index] || null; } catch { return null; } };
  const NAME = { de: "Deutsch", en: "Englisch" };
  const dt = (ts) => (ts ? new Date(ts).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }) : "");
  const nz = (x) => String(x || "").replace(/\r/g, "").trim();

  /* ---------- gewählter Karaoke-Text (state.lrcPick) ---------- */
  function lang() { return musikLang() === "de" ? "de" : "en"; }
  function kindsFor(art) { return art === "karaoke" ? ["lrc", "lrcde"] : art === "meeting" ? ["lrcm"] : art === "sung" ? ["lrcs"] : []; }
  const kLang = (k) => (k === "lrcde" ? "de" : "en");
  const kiGet = (kind, id) => { try { return JSON.parse(localStorage.getItem(`kitext-${kind}-${id}`) || "null"); } catch { return null; } };
  /* lokal bekannte Texte (ohne Server) – für die Anzeige des Knopfes */
  function alts(song) {
    const art = state.curVersion || "karaoke", out = [{ std: true }];
    const R = window.RATING;
    kindsFor(art).forEach((kind) => {
      const k = kiGet(kind, song.id); if (k && k.lrc) out.push({ kind, lrc: k.lrc });
      try { ((R && R.hget(kind, song.id)) || []).forEach((v) => out.push({ kind, lrc: v.lrc })); } catch { /* egal */ }
    });
    return out;
  }
  async function serverText(kind, id) { try { const r = await fetch(`${SYNC_BASE}/sync/${kind}-${id}`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) return t; } } catch { /* egal */ } return ""; }
  async function fileText(kind, song) {
    try {
      const n = String(song.number), m = state.media || {}, md = m.de || {};
      const key = kind === "lrc" ? ((m.karaoke || {}).lrc || {})[n] : kind === "lrcde" ? ((md.karaoke || {}).lrc || {})[n] : kind === "lrcm" ? ((m.meeting || {}).lrc || {})[n] : ((m.meeting || {}).sungLrc || {})[n];
      if (key) { const r = await fetch(mediaUrl(key), { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) return t; } }
    } catch { /* egal */ }
    return "";
  }
  async function collect(song) {
    const art = state.curVersion || "karaoke", R = window.RATING, res = [], seen = new Set();
    const add = (kind, lrc, label, sub) => { const k = kind + "|" + nz(lrc); if (!lrc || seen.has(k)) return; seen.add(k); res.push({ kind, lrc, label, sub }); };
    for (const kind of kindsFor(art)) {
      const L = art === "karaoke" ? NAME[kLang(kind)] : "";
      let sv = await serverText(kind, song.id); let lab = "gespeichert (Server)"; if (!sv) { sv = await fileText(kind, song); lab = "LRC-Datei"; } if (sv) add(kind, sv, `${L ? L + " · " : ""}${lab}`, "aktuelle LRC-Datei");
      const k = kiGet(kind, song.id); if (k && k.lrc) add(kind, k.lrc, `${L ? L + " · " : ""}KI-Text (noch nicht gespeichert)`, dt(k.ts));
      try { ((R && R.hget(kind, song.id)) || []).slice().reverse().forEach((v) => add(kind, v.lrc, `${L ? L + " · " : ""}${v.type === "orig" ? "Original vor KI" : v.type === "ki" ? "KI-Fassung" : "Gespeichert"}`, dt(v.ts))); } catch { /* egal */ }
    }
    return res;
  }
  async function trackDialog() {
    const s = cur(); if (!s) return;
    const art = state.curVersion || "karaoke", L = lang();
    const items = await collect(s), pick = state.lrcPick && state.lrcPick.id === s.id ? state.lrcPick : null;
    const buttons = [];
    if (art === "karaoke" || art === "video") {
      ["de", "en"].forEach((l) => buttons.push({ value: "lang:" + l, kind: l === L ? "primary" : undefined, label: `${l === L ? "✓ " : ""}Musik: ${NAME[l]}`, sub: l === L ? "läuft gerade" : "Lied und Text wechseln" }));
    }
    buttons.push({ value: "std", kind: pick ? undefined : "primary", label: `${pick ? "" : "✓ "}Standard (wie bisher)`, sub: "Text wird automatisch gewählt" });
    items.forEach((it, i) => buttons.push({ value: "t:" + i, kind: pick && nz(pick.lrc) === nz(it.lrc) && pick.kind === it.kind ? "primary" : undefined, label: `${pick && nz(pick.lrc) === nz(it.lrc) && pick.kind === it.kind ? "✓ " : ""}${it.label}`, sub: it.sub }));
    buttons.push({ value: null, kind: "cancel", label: "Schließen" });
    const r = await uiDialog({ eyebrow: `Lied ${s.id}`, title: "Spur und Karaoke-Text wählen", cancelValue: null,
      lines: [s.title, { text: items.length ? "Tippe auf einen Text, um ihn jetzt zu spielen. Der Knopf „KI“ leuchtet, solange ein anderer Text gewählt ist." : "Für dieses Lied gibt es nur den Standardtext.", cls: "dlg-hint" }], buttons });
    if (!r) return;
    if (r.startsWith("lang:")) {
      state.lrcPick = null;
      try { await window.V116.switchLang(r.slice(5)); } catch { /* egal */ }
      paintPick(); return;
    }
    if (r === "std") { state.lrcPick = null; await reload(); showToast("Standardtext."); return; }
    const it = items[Number(r.slice(2))]; if (!it) return;
    if (art === "karaoke" && kLang(it.kind) !== L && lsv("langWarnOff", "0") !== "1") {
      const go = await uiDialog({ eyebrow: "Sprache", title: "Text und Musik passen nicht zusammen", cancelValue: false,
        lines: [`Dieser Text ist ${NAME[kLang(it.kind)]}, die Musik läuft aber auf ${NAME[L]}.`],
        buttons: [{ value: true, kind: "primary", label: "Trotzdem verwenden" }, { value: "lang", label: `Musik auf ${NAME[kLang(it.kind)]} umstellen` }, { value: false, kind: "cancel", label: "Abbrechen" }] });
      if (!go) return;
      if (go === "lang") { state.lrcPick = null; try { await window.V116.switchLang(kLang(it.kind)); } catch { /* egal */ } }
    }
    state.lrcPick = { id: s.id, art: art === "karaoke" ? "karaoke" : "meeting", kind: it.kind, lrc: it.lrc, label: it.label };
    await reload(); showToast("Gewählt: " + it.label);
  }
  async function reload() {
    const s = cur(); if (s) { try { await loadLyrics(s, state.curVersion); } catch { /* egal */ } }
    paintPick(); try { window.V126 && window.V126.paintKiBtn(true); } catch { /* egal */ }
  }
  function paintPick() {
    const s = cur(), on = !!(s && state.lrcPick && state.lrcPick.id === s.id);
    document.querySelectorAll(".lang-mini:not(.tags-mini), #kiTextBtn").forEach((b) => { b.dataset.pick = on ? "1" : "0"; });
    document.body.classList.toggle("lrc-picked", on);
  }
  setInterval(paintPick, 900);

  /* gewählten Text anstelle des automatisch gefundenen liefern */
  function wrap(name, art) {
    const f = window[name]; if (typeof f !== "function" || f._v130) return;
    const w = async function (song, stale, prefix) {
      const p = state.lrcPick;
      if (p && song && p.id !== song.id) state.lrcPick = null;
      if (state.lrcPick && song && p.art === art && (art === "karaoke" || p.kind === (prefix || "lrcm"))) {
        const lines = parseLrc(p.lrc);
        if (lines.length) { if (art === "karaoke") state.lyricLang = kLang(p.kind); state.kiUsed = null; return lines; }
      }
      return f.apply(this, arguments);
    };
    w._v130 = true; window[name] = w;
  }
  wrap("fetchKaraokeLines", "karaoke"); wrap("fetchMeetingLines", "meeting");

  /* ---------- Lang auf den Sprach-Knopf (EN/DE) ---------- */
  (function langLong() {
    let t = 0, fired = false;
    const isLang = (e) => e.target && e.target.closest && e.target.closest(".lang-mini:not(.tags-mini)");
    document.addEventListener("pointerdown", (e) => { const b = isLang(e); if (!b || !b.closest("#titleRow")) return; fired = false; clearTimeout(t); t = setTimeout(() => { fired = true; trackDialog(); }, 650); }, true);
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => document.addEventListener(ev, () => clearTimeout(t), true));
    document.addEventListener("click", (e) => { if (fired && isLang(e)) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
    document.addEventListener("contextmenu", (e) => { const b = isLang(e); if (b && b.closest("#titleRow")) { e.preventDefault(); clearTimeout(t); fired = true; setTimeout(() => { fired = false; }, 700); trackDialog(); } }, true);
  })();

  /* ---------- Tempo-Anzeige im Player ---------- */
  async function tempoDialog() {
    const a = $("audio"); if (!a) return;
    let v = Math.round((a.playbackRate || 1) * 100) / 100;
    const set = (x) => { const n = Number(String(x).replace(",", ".")); if (n >= 0.1 && n <= 4) { v = Math.round(n * 100) / 100; a.defaultPlaybackRate = v; a.playbackRate = v; } };
    const r = await uiDialog({ eyebrow: "Wiedergabe", title: "Wiedergabegeschwindigkeit", cancelValue: false, lines: [
      { num: { label: "Tempo (1 = normal)", value: v, min: 0.1, max: 4, step: 0.05, onChange: set } },
      { text: "Regler oder Wert direkt eintippen (0,1 bis 4).", cls: "dlg-hint" }],
      buttons: [{ value: true, kind: "primary", label: "OK" }, { value: "reset", kind: "cancel", label: "Normal (1x)" }] });
    if (r === "reset") { a.defaultPlaybackRate = 1; a.playbackRate = 1; }
  }
  function tempoBadge() {
    const a = $("audio"), t = $("currentTime"); if (!a || !t || $("tempoBadge")) return;
    const b = h("button", "tempo-badge", ""); b.id = "tempoBadge"; b.type = "button"; b.hidden = true; b.title = "Wiedergabe-Tempo – antippen zum Ändern";
    b.addEventListener("click", tempoDialog);
    t.after(b);
    const paint = () => { const v = Math.round((a.playbackRate || 1) * 100) / 100; b.hidden = Math.abs(v - 1) < 0.005; b.textContent = String(v).replace(".", ",") + "×"; document.body.classList.toggle("tempo-off1", !b.hidden); };
    a.addEventListener("ratechange", () => { paint(); if (Math.abs((a.defaultPlaybackRate || 1) - a.playbackRate) > 0.001 && !a._v130g) { a._v130g = 1; a.defaultPlaybackRate = a.playbackRate; a._v130g = 0; } });
    a.addEventListener("loadedmetadata", paint);
    paint();
  }

  /* „im Liedtext suchen“ steht an zweiter Stelle, direkt unter „Lied suchen“ */
  function moveSearch() {
    const w = $("lyricSearchWrap"), ss = $("songSearch"), l = ss && ss.closest("label");
    if (w && l && l.nextElementSibling !== w) l.after(w);
  }
/* Änderungs-Übersicht (Tabelle) + aufklappbare Einzelzeilen; items = [{old, neu, text, miss}] */
  function diffInfo(items) {
    const f1 = (x) => String(x.toFixed(1)).replace(".", ","), pc = (x, n) => (n ? Math.round(100 * x / n) : 0) + " %";
    const fmtT = (x) => { const m = Math.floor(x / 60), sec = x - m * 60; return `${m}:${sec < 10 ? "0" : ""}${sec.toFixed(1)}`; };
    const n = items.length, b = { d0: 0, d1: 0, d2: 0, d3: 0, un: 0 }; let sum = 0, mx = 0, m = 0;
    items.forEach((it) => { if (it.miss) { b.un++; return; } const a = Math.abs(it.neu - it.old); b[a < 0.15 ? "d0" : a < 0.6 ? "d1" : a < 2 ? "d2" : "d3"]++; sum += a; m++; if (a > mx) mx = a; });
    const table = [["Änderung der Startzeit", "Zeilen", "Anteil"], ["unverändert (unter 0,15 s)", b.d0, pc(b.d0, n)], ["klein (0,15 – 0,6 s)", b.d1, pc(b.d1, n)], ["mittel (0,6 – 2 s)", b.d2, pc(b.d2, n)], ["groß (ab 2 s)", b.d3, pc(b.d3, n)], ["nicht zugeordnet", b.un, pc(b.un, n)], ["Summe", n, "100 %"]];
    const note = `Durchschnittliche Verschiebung ${f1(m ? sum / m : 0)} s, größte ${f1(mx)} s.`;
    const det = document.createElement("details"); det.className = "ki-diff";
    const rows = [];
    items.forEach((it, i) => { if (it.miss) rows.push({ i, c: "#a855f7", t: `${i + 1}. nicht zugeordnet  ${String(it.text || "").slice(0, 40)}` }); else { const d = it.neu - it.old, ad = Math.abs(d); if (ad >= 0.15) rows.push({ i, c: ad >= 2 ? "#e5484d" : ad >= 0.6 ? "#f08a00" : "#d9b400", t: `${i + 1}. ${fmtT(it.old)} → ${fmtT(it.neu)} (${d > 0 ? "+" : "−"}${f1(ad)} s)  ${String(it.text || "").slice(0, 40)}` }); } });
    const sm = document.createElement("summary"); sm.textContent = `Einzelne Zeilen (${rows.length} geändert)`; det.append(sm);
    const box = document.createElement("div"); box.style.cssText = "max-height:30vh;overflow:auto;font-size:12px;text-align:left;margin-top:6px";
    rows.forEach((r) => { const d = document.createElement("div"); d.textContent = r.t; d.style.color = r.c; box.append(d); });
    if (!rows.length) box.textContent = "Keine Zeile geändert.";
    det.append(box);
    return { n, b, table, note, det };
  }
/* Tesla-Knopf: oben groß oder links in der Liste */
  function teslaTop() { const v = lsv("teslaTab", "auto"); return v === "top" || (v === "auto" && typeof isTesla === "function" && isTesla()); }
  function applyTeslaMode(refresh) {
    const top = teslaTop();
    document.body.classList.toggle("tesla-tab-top", top); document.body.classList.toggle("tesla-tab-list", !top);
    if (refresh) {
      try {
        if (!top && state.sub === "tesla") { state.sub = "einst"; showSetTab(state.setTab || "allgemein"); try { window.V119 && V119.apply && V119.apply("tesla"); } catch { /* egal */ } }
        else if (top && state.sub !== "tesla") { /* bleibt */ }
      } catch { /* egal */ }
    }
  }
  const boot = () => { applyTeslaMode(); };
  const boot0 = () => { tempoBadge(); paintPick(); moveSearch(); applyTeslaMode(); };
  window.V130 = { applyTeslaMode, diffInfo, trackDialog, alts, tempoDialog, paintPick };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot0); else boot0();
})();
