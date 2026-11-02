/* v118: Einstellungen für Galerie, Player-Anordnung (die Werte liest covers.js) */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lss = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  function bind() {
    const nk = $("advGalNoKar"); if (nk) { nk.value = lsv("galNoKar", "1"); nk.onchange = () => { lss("galNoKar", nk.value); const g = $("coverGallery"); if (g) g.style.setProperty("--nk", String(Number(lsv("galNoKarAmt", "55")) / 100)); }; }
    const am = $("advGalNoKarAmt"); if (am) { am.value = lsv("galNoKarAmt", "55"); am.oninput = () => { lss("galNoKarAmt", am.value); const g = $("coverGallery"); if (g) g.style.setProperty("--nk", String(Number(am.value) / 100)); }; }
    const mi = $("advGalMini"); if (mi) { mi.value = lsv("galMini", "player"); mi.onchange = () => lss("galMini", mi.value); }
    const nl = $("advNpLayout"); if (nl) { nl.value = lsv("npLayout", "auto"); nl.onchange = () => lss("npLayout", nl.value); }
  }

  /* ---------- KI-Abstimmung (Bearbeiten-Panel) ---------- */
  const nw = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
  function close(a, b) {
    if (a === b) return true;
    if (a.length < 4 || b.length < 4) return false;
    if (a.startsWith(b) || b.startsWith(a)) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let d = 0, i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++d > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return d + (a.length - i) + (b.length - j) <= 1;
  }
  /* ordnet jeder Textzeile die Startzeit zu: Wort-für-Wort-Abgleich (Needleman-Wunsch), Lücken werden verteilt */
  function alignLines(lines, words) {
    const L = [];
    lines.forEach((ln, li) => ln.split(/\s+/).forEach((w) => { const n = nw(w); if (n) L.push({ n, li }); }));
    const W = words.map((x) => ({ n: nw(x.w), s: x.s })).filter((x) => x.n);
    const n = L.length, m = W.length;
    if (!n || !m) return null;
    const H = new Int16Array((n + 1) * (m + 1)), idx = (i, j) => i * (m + 1) + j;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
      const s = close(L[i - 1].n, W[j - 1].n) ? 3 : -1;
      H[idx(i, j)] = Math.max(H[idx(i - 1, j - 1)] + s, H[idx(i - 1, j)] - 1, H[idx(i, j - 1)] - 1, 0);
    }
    /* beste Spur: Rückverfolgung ab dem höchsten Wert */
    let bi = 0, bj = 0, bv = -1;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) if (H[idx(i, j)] > bv) { bv = H[idx(i, j)]; bi = i; bj = j; }
    const hit = new Array(n).fill(null); let i = bi, j = bj, matched = 0;
    while (i > 0 && j > 0 && H[idx(i, j)] > 0) {
      const cur = H[idx(i, j)], ok = close(L[i - 1].n, W[j - 1].n);
      if (ok && cur === H[idx(i - 1, j - 1)] + 3) { hit[i - 1] = W[j - 1].s; matched++; i--; j--; }
      else if (cur === H[idx(i - 1, j)] - 1) i--;
      else j--;
    }
    const first = new Array(lines.length).fill(null);
    L.forEach((x, k) => { if (hit[k] != null && first[x.li] == null) first[x.li] = hit[k]; });
    /* Lücken: zwischen bekannten Zeilen nach Wortzahl verteilen */
    const cnt = lines.map((ln) => Math.max(1, ln.split(/\s+/).filter(Boolean).length));
    const known = first.map((v, k) => (v == null ? -1 : k)).filter((k) => k >= 0);
    if (!known.length) return null;
    const out = first.slice();
    for (let k = 0; k < known.length - 1; k++) {
      const a = known[k], b = known[k + 1]; let tot = 0; for (let q = a; q < b; q++) tot += cnt[q];
      let acc = cnt[a]; for (let q = a + 1; q < b; q++) { out[q] = first[a] + (first[b] - first[a]) * (acc / tot); acc += cnt[q]; }
    }
    const rate = Math.max(0.2, (first[known[known.length - 1]] - first[known[0]]) / Math.max(1, cnt.slice(known[0], known[known.length - 1]).reduce((x, y) => x + y, 0)));
    for (let q = known[0] - 1; q >= 0; q--) out[q] = Math.max(0, out[q + 1] - cnt[q] * rate);
    for (let q = known[known.length - 1] + 1; q < lines.length; q++) out[q] = out[q - 1] + cnt[q - 1] * rate;
    for (let q = 1; q < out.length; q++) if (out[q] < out[q - 1]) out[q] = out[q - 1] + 0.01;
    return { times: out, matched, total: n };
  }
  async function aiSync(btn) {
    const rows = [...document.querySelectorAll("#lyrics .lyric-line")];
    if (!rows.length) { await uiAlert("KI-Abstimmung", "Zuerst muss ein Liedtext vorhanden sein (Vorlage oder Zeilen)."); return; }
    if (typeof state === "undefined" || !state.currentAudio) { await uiAlert("KI-Abstimmung", "Es ist keine Audiodatei geladen."); return; }
    if (state.curVersion === "video" || /\.(mp4|m4v|webm|mov)(\?|$)/i.test(state.currentAudio)) { await uiAlert("KI-Abstimmung", "Für Video geht das nicht. Wähle Karaoke-, Instrumental- oder Zusammenkünfte-MP3."); return; }
    const ok = await uiConfirm({ eyebrow: "KI-Abstimmung", title: "Zeiten automatisch setzen?", text: "Die KI hört das Lied ab (dauert etwa 10–60 Sekunden) und setzt die Zeit jeder Zeile. Bestehende Zeiten in der Liste werden überschrieben, gespeichert wird erst mit „Speichern“. Das Ergebnis ist ein Vorschlag, bitte stichprobenartig prüfen.", ok: "Starten" });
    if (!ok) return;
    const old = btn.textContent; btn.disabled = true; btn.textContent = "KI hört …";
    try {
      const texts = rows.map((r) => ((r.querySelector(".lyric-text") || {}).value || r.textContent || "").trim());
      const lang = typeof musikLang === "function" && musikLang() === "de" && state.lyricLang === "de" ? "de" : "en";
      const base = (typeof SYNC_BASE !== "undefined" ? SYNC_BASE : "");
      const res = await fetch(`${base}/api/transcribe`, { method: "POST", headers: { "content-type": "application/json", "x-write-key": state.writeKey || "" }, body: JSON.stringify({ path: state.currentAudio, lang, prompt: texts.join(" ").slice(0, 500) }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { await uiAlert("KI-Abstimmung", data.error || (res.status === 404 ? "Der Worker kennt /api/transcribe noch nicht: neuen Worker ausspielen." : `Fehler ${res.status}`)); return; }
      let words = data.words || [];
      if (!words.length && data.segs) data.segs.forEach((s) => { const ws = (s.text || "").trim().split(/\s+/); ws.forEach((w, k) => words.push({ w, s: s.start + (s.end - s.start) * k / ws.length })); });
      const r = alignLines(texts, words);
      if (!r || r.matched < Math.max(3, r.total * 0.2)) { await uiAlert("KI-Abstimmung", `Die KI konnte nur ${r ? r.matched : 0} von ${r ? r.total : texts.join(" ").split(/\s+/).length} Wörtern zuordnen. Bei Instrumental oder sehr leisem Gesang klappt das schlecht. Es wurde nichts geändert.`); return; }
      rows.forEach((row, k) => {
        const t = Math.max(0, r.times[k] + (state.timeOffset || 0) / 1000);
        row.dataset.time = String(t);
        const inp = row.querySelector(".time-edit"); if (inp && typeof formatTime === "function") inp.value = formatTime(t, true);
      });
      state.editDirty = true;
      await uiAlert("KI-Abstimmung", `Fertig: ${r.matched} von ${r.total} Wörtern zugeordnet (${Math.round(100 * r.matched / r.total)} %). Zeilen ohne Treffer wurden dazwischen verteilt. Bitte anhören, nachbessern und dann „Speichern“.`);
    } catch (e) { await uiAlert("KI-Abstimmung", "Fehler: " + (e && e.message || e)); }
    finally { btn.disabled = false; btn.textContent = old; }
  }
  new MutationObserver(() => {
    const p = $("editPanel"); if (!p || p.querySelector(".ai-sync")) return;
    const b = document.createElement("button"); b.className = "chip ai-sync"; b.type = "button"; b.textContent = "KI-Sync"; b.title = "Zeiten automatisch per KI setzen";
    b.addEventListener("click", () => aiSync(b));
    const save = [...p.querySelectorAll("button")].find((x) => x.textContent === "Speichern");
    p.insertBefore(b, save || null);
  }).observe(document.body, { childList: true });

  /* ---------- Karaoke-Schriftfarben getrennt ---------- */
  function lyricCols() {
    let st = $("lyricColStyle"); if (!st) { st = document.createElement("style"); st.id = "lyricColStyle"; document.head.append(st); }
    const on = lsv("lyrColOn", ""), off = lsv("lyrColOff", "");
    st.textContent = (on ? `body:not(.edit-mode) .lyric-line.active, body:not(.edit-mode) .lyric-line.active .lyric-text { color: ${on} !important; }\n` : "") + (off ? `body:not(.edit-mode) .lyric-line:not(.active) { color: ${off} !important; }\n` : "");
  }
  function bindLyr() {
    [["advLyrOn", "lyrColOn"], ["advLyrOff", "lyrColOff"]].forEach(([id, key]) => {
      const i = $(id); if (!i) return;
      const cur = lsv(key, ""); if (cur) i.value = cur;
      i.oninput = () => { lss(key, i.value); lyricCols(); };
    });
    const r = $("advLyrReset"); if (r) r.onclick = () => { lss("lyrColOn", ""); lss("lyrColOff", ""); lyricCols(); };
  }
  /* ---------- genaue Anzeigegröße messen ---------- */
  function bindMeasure() {
    const b = $("advMeasure"), out = $("advMeasureOut"); if (!b || !out) return;
    b.onclick = () => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;visibility:hidden;pointer-events:none";
      const pd = document.createElement("div"); pd.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;visibility:hidden;pointer-events:none";
      document.body.append(probe, pd);
      const vv = window.visualViewport;
      const rows = [
        `Sichtbarer Bereich (innerWidth × innerHeight): ${window.innerWidth} × ${window.innerHeight} px`,
        `Dokument (clientWidth × clientHeight): ${document.documentElement.clientWidth} × ${document.documentElement.clientHeight} px`,
        `100vw × 100vh gemessen: ${probe.offsetWidth} × ${probe.offsetHeight} px`,
        `100% × 100% gemessen (fest positioniert): ${pd.offsetWidth} × ${pd.offsetHeight} px`,
        vv ? `Visual Viewport: ${Math.round(vv.width)} × ${Math.round(vv.height)} px, Zoom ${vv.scale}` : "",
        `Gesamtfenster außen: ${window.outerWidth} × ${window.outerHeight} px`,
        `Bildschirm: ${screen.width} × ${screen.height} px (verfügbar ${screen.availWidth} × ${screen.availHeight})`,
        `Pixeldichte: ${window.devicePixelRatio} → echte Bildpunkte ca. ${Math.round(window.innerWidth * window.devicePixelRatio)} × ${Math.round(window.innerHeight * window.devicePixelRatio)}`,
        `Ausrichtung: ${(screen.orientation && screen.orientation.type) || (window.innerWidth > window.innerHeight ? "quer" : "hoch")}`
      ].filter(Boolean);
      probe.remove(); pd.remove();
      out.textContent = rows.join("\n");
      const ok = rows.join("\n");
      try { navigator.clipboard.writeText(ok).catch(() => {}); } catch { /* egal */ }
    };
  }
  /* Suche in den Einstellungen: findet Zeilen über alle Reiter, ein Tipp springt hin */
  const norm = (t) => (t || "").toLowerCase().replace(/\s+/g, " ").trim();
  function buildSearch() {
    const tabs = $("setTabs"); if (!tabs || $("setSearch")) return;
    const box = document.createElement("div"); box.className = "set-search";
    const inp = document.createElement("input"); inp.type = "search"; inp.id = "setSearch"; inp.placeholder = "Einstellung suchen …"; inp.setAttribute("aria-label", "Einstellungen durchsuchen");
    const res = document.createElement("div"); res.className = "set-search-res"; res.hidden = true;
    box.append(inp, res); tabs.after(box);
    const tabName = (k) => { const b = document.querySelector(`#setTabs [data-settab="${k}"]`); return b ? b.textContent : k; };
    const subName = (k) => { const b = document.querySelector(`#subTabs [data-sub="${k}"]`); return b ? b.textContent : ""; };
    function run() {
      const q = norm(inp.value); res.replaceChildren();
      if (q.length < 2) { res.hidden = true; return; }
      const words = q.split(" ");
      const out = [];
      document.querySelectorAll("#codeModal [data-tab]").forEach((c) => {
        if (c.id === "subTabs" || c.id === "setTabs") return;
        const t = c.getAttribute("data-tab"), s = c.getAttribute("data-sub") || "";
        const items = c.matches(".set-row, .ap-title, .set-grp, .set-grp-d, .set-h, .set-hint") ? [c] : [...c.querySelectorAll(".set-row, .ap-title, .set-hint, .set-h, label, h3, h4")];
        items.forEach((n) => {
          const tx = norm(n.textContent); if (!tx || tx.length > 400) return;
          if (!words.every((w) => tx.includes(w))) return;
          out.push({ n, t, s, tx });
        });
      });
      if (!out.length) { res.append(Object.assign(document.createElement("p"), { className: "set-hint", textContent: "Nichts gefunden." })); res.hidden = false; return; }
      const seen = new Set();
      out.slice(0, 60).forEach((o) => {
        const key = o.tx.slice(0, 60); if (seen.has(key)) return; seen.add(key);
        const b = document.createElement("button"); b.type = "button"; b.className = "set-hit";
        const path = [tabName(o.t), o.s ? subName(o.s) : ""].filter(Boolean).join(" › ");
        const label = document.createElement("b"); label.textContent = o.tx.length > 90 ? o.tx.slice(0, 90) + " …" : o.tx;
        const small = document.createElement("small"); small.textContent = path;
        b.append(label, small);
        b.addEventListener("click", () => {
          const tb = document.querySelector(`#setTabs [data-settab="${o.t}"]`); if (tb) tb.click();
          setTimeout(() => {
            if (o.s) { const sb = document.querySelector(`#subTabs [data-sub="${o.s}"]`); if (sb) sb.click(); }
            setTimeout(() => {
              let p = o.n; while (p && p !== document.body) { if (p.hidden) p.hidden = false; p = p.parentElement; }
              const sc = o.n.closest("#codeForm") || o.n.closest(".login-card");
              try { o.n.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { if (sc) sc.scrollTop = o.n.offsetTop - 80; }
              o.n.classList.add("set-flash"); setTimeout(() => o.n.classList.remove("set-flash"), 2200);
            }, 120);
          }, 80);
          res.hidden = true;
        });
        res.append(b);
      });
      res.hidden = false;
    }
    inp.addEventListener("input", run);
  }
  function init() {
    buildSearch();
    bind(); bindLyr(); bindMeasure(); lyricCols();
    const cm = $("codeModal"); if (cm) new MutationObserver(() => { if (!cm.hidden) setTimeout(bind, 40); }).observe(cm, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
