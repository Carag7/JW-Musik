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
  async function collect(song) {
    const art = state.curVersion || "karaoke", R = window.RATING, res = [], seen = new Set();
    const add = (kind, lrc, label, sub) => { const k = kind + "|" + nz(lrc); if (!lrc || seen.has(k)) return; seen.add(k); res.push({ kind, lrc, label, sub }); };
    for (const kind of kindsFor(art)) {
      const L = art === "karaoke" ? NAME[kLang(kind)] : "";
      const sv = await serverText(kind, song.id); if (sv) add(kind, sv, `${L ? L + " · " : ""}gespeichert (Server)`, "aktuelle LRC-Datei");
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
  const boot = () => { tempoBadge(); paintPick(); moveSearch(); };
  window.V130 = { trackDialog, alts, tempoDialog, paintPick };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
