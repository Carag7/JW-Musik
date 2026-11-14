/* v171: zweite Sprache als kleine Zeile unter dem Karaoke-Text (gleicher Timecode) + Menü am DE/EN-Knopf */
(function () {
  "use strict";
  const on = () => lsv("subLang", "0") === "1";
  const pct = () => Math.max(30, Math.min(100, Number(lsv("subSize", "60")) || 60));
  const mainLang = () => (state.lyricLang === "de" ? "de" : "en");
  const paintSize = () => document.documentElement.style.setProperty("--sub-pct", String(pct() / 100));
  let seq = 0;

  async function otherLines(song, token) {
    const want = mainLang() === "de" ? "en" : "de";
    const keep = state.lyricLang;
    let lines = [];
    try {
      lines = await fetchKaraokeLines(song, () => token !== state.selectToken, want);
      if (want === "de" && state.lyricLang !== "de") lines = [];
    } catch { lines = []; }
    state.lyricLang = keep;
    return lines || [];
  }
  function pair(main, other) {
    if (main.length === other.length) return other.map((o) => o.text);
    return main.map((m) => {
      let best = null, bd = 1e9;
      other.forEach((o) => { const d = Math.abs(o.time - m.time); if (d < bd) { bd = d; best = o; } });
      return best && bd <= 2.5 ? best.text : "";
    });
  }
  function clear() { document.querySelectorAll("#lyrics .lyric-sub").forEach((e) => e.remove()); }
  async function apply(song, main, token) {
    clear(); paintSize();
    if (!on() || !song || !main || !main.length) return;
    const my = ++seq;
    const other = await otherLines(song, token);
    if (my !== seq || token !== state.selectToken || !other.length) return;
    const texts = pair(main, other);
    const rows = el.lyrics.querySelectorAll(".lyric-line");
    clear();
    rows.forEach((row, i) => {
      if (!texts[i]) return;
      const p = document.createElement("p");
      p.className = "lyric-sub"; p.textContent = texts[i];
      row.after(p);
    });
    try { updateLyrics(); } catch { /* egal */ }
  }
  function refresh() {
    const song = state.songs[state.index];
    if (!song) return;
    const main = state.lyrics || [];
    if (!on()) { clear(); return; }
    apply(song, main, state.selectToken);
  }
  async function menu() {
    const sw = window.V116 && window.V116.switchLang;
    const cur = lsv("musikLang", "en") === "de" ? "de" : "en";
    const r = await uiDialog({
      eyebrow: "Sprache", title: "Sprache der Musik und des Textes",
      lines: [`Aktuell: ${cur === "de" ? "Deutsch" : "Englisch"}. Mit der Option unten erscheint die andere Sprache klein unter jeder Zeile (gleicher Timecode).`],
      buttons: [
        { value: "de", kind: cur === "de" ? "primary" : "", label: "Deutsch" },
        { value: "en", kind: cur === "en" ? "primary" : "", label: "Englisch" },
        { value: null, kind: "cancel", label: "Schließen" }
      ],
      check: { label: "Zweite Sprache klein darunter anzeigen", value: on(), onChange: (v) => { lss("subLang", v ? "1" : "0"); const s = document.getElementById("advSubLang"); if (s) s.value = v ? "1" : "0"; refresh(); } }
    });
    if (r && r !== cur && sw) sw(r);
  }
  function bind() {
    const a = document.getElementById("advSubLang");
    if (a) { a.value = on() ? "1" : "0"; a.onchange = () => { lss("subLang", a.value); refresh(); }; }
    const z = document.getElementById("advSubSize");
    if (z) { z.value = String(pct()); z.onchange = () => { const v = Math.max(30, Math.min(100, Math.round(Number(z.value) || 60))); lss("subSize", String(v)); z.value = String(v); paintSize(); }; }
  }
  paintSize();
  const cm = document.getElementById("codeModal");
  if (cm) new MutationObserver(() => { if (!cm.hidden) setTimeout(bind, 40); }).observe(cm, { attributes: true, attributeFilter: ["hidden"] });
  setTimeout(bind, 300);

  /* Themenliste der Einstellungen: Höhe = sichtbarer Rest des Fensters, damit sie für sich scrollt */
  (function topicsHeight() {
    let t = 0;
    const fit = () => {
      t = 0;
      const l = document.getElementById("setTopics"), f = document.getElementById("codeForm");
      if (!l || !f || !f.classList.contains("topics-on") || !l.offsetParent) return;
      if (getComputedStyle(l).flexDirection !== "column") return;
      const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      const top = Math.max(0, l.getBoundingClientRect().top);
      l.style.setProperty("max-height", Math.max(220, vh - top - 8) + "px", "important");
    };
    const q = () => { if (!t) t = requestAnimationFrame(fit); };
    document.addEventListener("scroll", q, true);
    window.addEventListener("resize", q);
    new MutationObserver(q).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "hidden"] });
    setTimeout(q, 500);
  })();
  window.V171 = { apply, menu, refresh, bind };
})();
