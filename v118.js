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
    return { times: out, matched, total: n, hit: first.map((v) => v != null) };
  }
  /* ----- Anzeige: Fortschritt, Farben, Auswahl ----- */
  const AI = { words: null, key: "", old: null, neu: null, hit: null, reverted: new Set(), mode: "ki", song: "" };
  const rowsAll = () => [...document.querySelectorAll("#lyrics .lyric-line")];
  const rowText = (r) => ((r.querySelector(".lyric-text") || {}).value || r.textContent || "").trim();
  function prog(show, pct, label) {
    let p = $("aiProg");
    if (!show) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement("div"); p.id = "aiProg"; p.innerHTML = '<div class="ai-prog-t"></div><div class="ai-prog-bar"><i></i></div><small class="ai-prog-s"></small>'; document.body.append(p); }
    p.querySelector("i").style.width = Math.max(2, Math.min(100, pct)) + "%";
    p.querySelector(".ai-prog-t").textContent = label;
  }
  function estimateSecs(level) {
    const d = (typeof el !== "undefined" && el.audio && isFinite(el.audio.duration) && el.audio.duration > 0) ? el.audio.duration : 180;
    return Math.max(8, d * (level === "low" ? 0.12 : level === "high" ? 0.4 : 0.22));
  }
  function mark(rows, olds, res) {
    const cnt = { d0: 0, d1: 0, d2: 0, d3: 0, un: 0 };
    rows.forEach((row, k) => {
      ["ai-d0", "ai-d1", "ai-d2", "ai-d3", "ai-un"].forEach((c) => row.classList.remove(c));
      const old = olds[k]; if (old == null) return;
      const t = Number(row.dataset.time), d = t - old;
      let cls, txt;
      if (res.hit && res.hit[k] === false) { cls = "ai-un"; txt = "nicht zugeordnet"; cnt.un++; }
      else { const a = Math.abs(d); cls = a < 0.15 ? "ai-d0" : a < 0.6 ? "ai-d1" : a < 2 ? "ai-d2" : "ai-d3"; cnt[cls.slice(3)]++; txt = a < 0.15 ? "unverändert" : (d > 0 ? "+" : "−") + a.toFixed(1) + " s"; }
      row.classList.add(cls);
      let b = row.querySelector(".ai-delta"); if (!b) { b = document.createElement("span"); b.className = "ai-delta"; row.append(b); }
      b.textContent = txt;
      let rv = row.querySelector(".ai-rev");
      if (!rv) { rv = document.createElement("button"); rv.type = "button"; rv.className = "ai-rev"; row.append(rv); rv.addEventListener("click", (e) => { e.stopPropagation(); revertRow(rowsAll().indexOf(row), row); }); }
      rv.textContent = "KI"; rv.className = "ai-rev"; rv.title = "Diese Zeile verwendet die KI-Zeit – antippen für die alte Zeit"; row.classList.remove("ai-useold");
    });
    return cnt;
  }
  function countAll() {
    const c = { d0: 0, d1: 0, d2: 0, d3: 0, un: 0 };
    rowsAll().forEach((r) => ["d0", "d1", "d2", "d3", "un"].forEach((k) => { if (r.classList.contains("ai-" + k)) c[k]++; }));
    return c;
  }
  function legend(cnt0) {
    const cnt = countAll();
    let lg = $("aiLegend"); if (!lg) { lg = document.createElement("div"); lg.id = "aiLegend"; }
    const hd = $("colHead"); if (hd) hd.after(lg); else if (typeof editHeadBox === "function") editHeadBox().append(lg); else { const l = $("lyrics"); l.prepend(lg); }
    lg.innerHTML = "";
    const add = (cls, txt) => { const s = document.createElement("span"); s.className = "ai-chip " + cls; s.textContent = txt; lg.append(s); };
    add("ai-d0", `unverändert ${cnt.d0}`); add("ai-d1", `klein (<0,6 s) ${cnt.d1}`); add("ai-d2", `mittel (<2 s) ${cnt.d2}`); add("ai-d3", `groß (≥2 s) ${cnt.d3}`); add("ai-un", `nicht zugeordnet ${cnt.un}`);
    const pick = document.createElement("button"); pick.type = "button"; pick.className = "chip"; pick.textContent = "Große + nicht zugeordnete wählen";
    pick.onclick = () => { rowsAll().forEach((r) => { const c = r.querySelector(".row-pick"); if (c) c.checked = r.classList.contains("ai-d3") || r.classList.contains("ai-un"); }); };
    const off = document.createElement("button"); off.type = "button"; off.className = "chip"; off.textContent = "Markierung aus";
    off.onclick = () => { rowsAll().forEach((r) => { ["ai-d0", "ai-d1", "ai-d2", "ai-d3", "ai-un"].forEach((c) => r.classList.remove(c)); r.querySelectorAll(".ai-delta,.ai-rev").forEach((d) => d.remove()); }); lg.remove(); };
    const ab = document.createElement("span"); ab.className = "ai-ab";
    [["ki", "KI-Zeiten"], ["alt", "Original"]].forEach(([m, n]) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.m = m; b.textContent = n; b.setAttribute("aria-pressed", String(m === AI.mode)); b.onclick = () => useTimes(m); ab.append(b); });
    const ov = document.createElement("button"); ov.type = "button"; ov.className = "chip"; ov.textContent = "Übersicht"; ov.title = "KI-Abstimmung: Tabelle der Änderungen"; ov.onclick = () => report();
    lg.prepend(ab); lg.append(pick, ov, off);
  }
  function setPick(on) { document.body.classList.toggle("ai-pick", on); }
  const picked = () => rowsAll().map((r, k) => (r.querySelector(".row-pick") && r.querySelector(".row-pick").checked ? k : -1)).filter((k) => k >= 0);
  const setT = (row, t) => { row.dataset.time = String(t); const inp = row.querySelector(".time-edit"); if (inp && typeof formatTime === "function") inp.value = formatTime(t, true); };
  /* KI-Zeiten <-> Original-Zeiten umschalten (Abspielen nutzt die Zeit der Zeile) */
  function useTimes(which) {
    if (!AI.old || !AI.neu) return;
    if (which === 'alt') AI.old.forEach((_, k) => AI.reverted.add(k)); else AI.reverted.clear();
    rowsAll().forEach((r, k) => { if (AI.neu[k] == null) return; const useNew = which === "ki" && !AI.reverted.has(k); setT(r, useNew ? AI.neu[k] : AI.old[k]); if (r.querySelector('.ai-rev')) paintRev(r, !useNew); });
    AI.mode = which; state.editDirty = true;
    document.querySelectorAll("#aiLegend .ai-ab button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === which)));
  }
  function paintRev(row, old) {
    row.classList.toggle("ai-useold", old);
    const b = row.querySelector(".ai-rev"); if (!b) return;
    b.textContent = old ? "alt" : "KI"; b.classList.toggle("old", old);
    b.title = old ? "Diese Zeile verwendet die alte Zeit – antippen für die KI-Zeit" : "Diese Zeile verwendet die KI-Zeit – antippen für die alte Zeit";
  }
  function revertRow(k, row) {
    if (!AI.old || AI.old[k] == null) return;
    const back = !AI.reverted.has(k);
    if (back) AI.reverted.add(k); else AI.reverted.delete(k);
    setT(row, back ? AI.old[k] : AI.neu[k]);
    paintRev(row, back);
    state.editDirty = true;
  }

  const songKey = () => { try { const sg = state.songs[state.index]; return curLrcKind(sg) + "-" + sg.id; } catch { return ""; } };
  const fmtP = (x, n) => (n ? Math.round(100 * x / n) : 0) + " %";
  function stats() {
    if (!AI.old || !AI.neu) return null;
    const n = AI.old.length, b = { d0: 0, d1: 0, d2: 0, d3: 0, un: 0 }; let sum = 0, mx = 0, m = 0;
    for (let k = 0; k < n; k++) {
      if (AI.old[k] == null || AI.neu[k] == null) continue;
      const a = Math.abs(AI.neu[k] - AI.old[k]);
      if (AI.hit && AI.hit[k] === false) { b.un++; continue; }
      b[a < 0.15 ? "d0" : a < 0.6 ? "d1" : a < 2 ? "d2" : "d3"]++; sum += a; m++; if (a > mx) mx = a;
    }
    return { n, b, avg: m ? sum / m : 0, mx };
  }
  async function report(head) {
    const st = stats();
    if (!st) { await uiAlert("KI-Abstimmung", "Es gibt noch keine KI-Abstimmung für dieses Lied. „KI-Sync“ starten oder „Letzte KI-Änderung“ laden."); return; }
    const { n, b } = st, strong = b.d2 + b.d3, weak = b.d0 + b.d1;
    const f1 = (x) => String(x.toFixed(1)).replace(".", ",");
    const v = await uiDialog({ eyebrow: "KI-Abstimmung", title: "Übersicht der Änderungen", cancelValue: null,
      lines: [
        ...(head ? [head] : []),
        { text: `Von ${n} Zeilen wurden ${strong} (${fmtP(strong, n)}) deutlich verändert (ab 0,6 s) und ${weak} (${fmtP(weak, n)}) wenig oder gar nicht. ${b.un} Zeilen (${fmtP(b.un, n)}) konnte die KI nicht zuordnen.` },
        { table: [["Änderung der Startzeit", "Zeilen", "Anteil"],
          ["unverändert (unter 0,15 s)", b.d0, fmtP(b.d0, n)],
          ["klein (0,15 – 0,6 s)", b.d1, fmtP(b.d1, n)],
          ["mittel (0,6 – 2 s)", b.d2, fmtP(b.d2, n)],
          ["groß (ab 2 s)", b.d3, fmtP(b.d3, n)],
          ["nicht zugeordnet", b.un, fmtP(b.un, n)],
          ["Summe", n, "100 %"]], right: true },
        { text: `Durchschnittliche Verschiebung ${f1(st.avg)} s, größte ${f1(st.mx)} s. Farben in den Zeilen: grün = unverändert, gelb = klein, orange = mittel, rot = groß, violett = nicht zugeordnet.`, cls: "dlg-hint" }
      ],
      buttons: [{ value: null, kind: "primary", label: "OK" }] });
    if (v === "bad") rowsAll().forEach((r) => { const c = r.querySelector(".row-pick"); if (c) c.checked = r.classList.contains("ai-d3") || r.classList.contains("ai-un"); });
    syncPickAll();
  }
  /* letzte KI-Änderung pro Lied merken, damit man sie später ohne neues Einlesen wieder abrufen kann */
  function saveLast() {
    try { localStorage.setItem("aiLast-" + songKey(), JSON.stringify({ old: AI.old, neu: AI.neu, hit: AI.hit, ts: Date.now() })); } catch { /* egal */ }
    try { document.dispatchEvent(new CustomEvent("ki-run", { detail: { old: AI.old, neu: AI.neu, acc: lsv("aiAcc", "normal") } })); } catch { /* egal */ }
    tools();
  }
  const getLast = () => { try { return JSON.parse(localStorage.getItem("aiLast-" + songKey()) || "null"); } catch { return null; } };
  async function loadLast() {
    const d = getLast(), rows = rowsAll();
    if (!d || !d.old || d.old.length !== rows.length) { await uiAlert("KI-Abstimmung", d ? "Die Zeilenzahl des Liedes hat sich seit der letzten KI-Abstimmung geändert, darum kann sie nicht geladen werden." : "Für dieses Lied gibt es noch keine gemerkte KI-Abstimmung."); return; }
    AI.old = d.old.slice(); AI.neu = d.neu.slice(); AI.hit = d.hit ? d.hit.slice() : rows.map(() => true); AI.reverted = new Set(); AI.song = songKey(); AI.mode = "ki";
    rows.forEach((r, k) => { if (AI.neu[k] != null) setT(r, AI.neu[k]); });
    const cnt = mark(rows, AI.old, { hit: AI.hit });
    state.editDirty = true; legend(cnt);
    await report("Letzte KI-Abstimmung vom " + new Date(d.ts).toLocaleString("de-AT") + " geladen (ohne neues Einlesen).");
  }
  const level = () => lsv("aiAcc", "normal") === "low" ? "low" : lsv("aiAcc", "normal") === "high" ? "high" : "normal";

  const btnPct = (p) => { const b = document.querySelector(".ai-sync"); if (b) b.textContent = `KI ${Math.round(p)} %`; };
  async function transcribe(texts, lang, lvo) {
    const lv = lvo || level(), base = (typeof SYNC_BASE !== "undefined" ? SYNC_BASE : "");
    const key0 = state.currentAudio + "|" + lang + "|" + lv;
    if (AI.words && AI.key === key0) return AI.words;
    const call = (k) => fetch(`${base}/api/transcribe`, { method: "POST", headers: { "content-type": "application/json", "x-write-key": k }, body: JSON.stringify({ path: state.currentAudio, lang, level: lv, prompt: lv === "low" ? "" : texts.join(" ").slice(0, 600) }) });
    let key = ""; try { key = sessionStorage.getItem("aiKey") || ""; } catch { /* egal */ }
    if (!key) key = state.writeKey || "";
    if (!key && window.askEditPass) { const k0 = await window.askEditPass("KI-Abstimmung"); if (!k0) throw new Error("Abgebrochen."); key = k0; }
    const t0 = Date.now(), T = estimateSecs(lv) * 1000;
    prog(true, 3, "KI-Abstimmung: Audio wird gesendet …");
    const tick = setInterval(() => {
      const f = (Date.now() - t0) / T, pct = 6 + 86 * (1 - Math.exp(-f * 1.6));
      const left = Math.max(1, Math.round((T - (Date.now() - t0)) / 1000));
      btnPct(pct); prog(true, pct, f < 0.12 ? "KI-Abstimmung: Audio wird gesendet …" : "KI hört das Lied ab …");
      const s = document.querySelector("#aiProg .ai-prog-s"); if (s) s.textContent = f < 1 ? `geschätzt noch ca. ${left} s (Genauigkeit: ${lv === "low" ? "schwach" : lv === "high" ? "sehr genau" : "normal"})` : "dauert etwas länger als geschätzt …";
    }, 400);
    try {
      let res = await call(key);
      for (let tries = 0; res.status === 401 && tries < 3; tries++) {
        clearInterval(tick); prog(false);
        const k2 = await uiPrompt({ eyebrow: "KI-Abstimmung", title: "Schreib-Schlüssel", type: "password", placeholder: "WRITE_KEY aus Cloudflare", ok: "Weiter" });
        if (k2 === null || k2 === "") throw new Error("Abgebrochen. Der Schreib-Schlüssel ist das Secret WRITE_KEY des Workers (Cloudflare → Worker → Einstellungen → Variablen und Secrets).");
        key = k2; res = await call(key);
      }
      if (res.ok) { try { sessionStorage.setItem("aiKey", key); } catch { /* egal */ } }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || (res.status === 404 ? "Der Worker kennt /api/transcribe noch nicht: neuen Worker ausspielen." : `Fehler ${res.status}`));
      let words = data.words || [];
      if (!words.length && data.segs) data.segs.forEach((s) => { const ws = (s.text || "").trim().split(/\s+/); ws.forEach((w, k) => words.push({ w, s: s.start + (s.end - s.start) * k / ws.length })); });
      AI.words = words; AI.key = key0;
      prog(true, 100, "Zeiten werden zugeordnet …");
      return words;
    } finally { clearInterval(tick); }
  }

  async function aiSync(btn) {
    const rows = rowsAll();
    if (!rows.length) { await uiAlert("KI-Abstimmung", "Zuerst muss ein Liedtext vorhanden sein (Vorlage oder Zeilen)."); return; }
    if (typeof state === "undefined" || !state.currentAudio) { await uiAlert("KI-Abstimmung", "Es ist keine Audiodatei geladen."); return; }
    if (state.curVersion === "video" || /\.(mp4|m4v|webm|mov)(\?|$)/i.test(state.currentAudio)) { await uiAlert("KI-Abstimmung", "Für Video geht das nicht. Wähle Karaoke-, Instrumental- oder Zusammenkünfte-MP3."); return; }
    const havePicks = picked().length > 0, haveMarks = rows.some((r) => r.classList.contains("ai-d3") || r.classList.contains("ai-un"));
    let scope = havePicks ? "pick" : "all", acc = level();
    const cached = AI.words && AI.key.startsWith(state.currentAudio + "|");
    const ok = await uiDialog({ eyebrow: "KI-Abstimmung", title: "Zeiten automatisch setzen", cancelValue: false,
      lines: [
        { text: "Die KI hört das Lied ab (10–60 Sekunden, bei „sehr genau“ länger). Gespeichert wird erst mit „Speichern“. Danach siehst du farbig, was sich geändert hat, und kannst zwischen KI- und Original-Zeiten umschalten." + (cached ? " Die Wörter der letzten Auswertung werden wiederverwendet (schnell)." : "") },
        { select: { label: "Genauigkeit:", value: acc, options: [["low", "schwach (schnell)"], ["normal", "normal"], ["high", "sehr genau (langsam)"]], onChange: (x) => { acc = x; } } },
        { select: { label: "Zeilen:", value: scope, options: [["all", "alle Zeilen"], ["pick", "nur angehakte (☑ links in der Zeile)"], ["bad", "nur große Abweichung / nicht zugeordnet"]], onChange: (x) => { scope = x; } } },
        ...(haveMarks || havePicks ? [] : [{ text: "Tipp: Vor den Zeilen stehen Haken. Mit ihnen kannst du einzelne Zeilen wählen.", cls: "dlg-hint" }])
      ],
      buttons: [{ value: true, kind: "primary", label: "Starten" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
    if (ok !== true) return;
    lss("aiAcc", acc);
    let sel = [];
    if (scope === "pick") sel = picked();
    else if (scope === "bad") sel = rows.map((r, k) => (r.classList.contains("ai-d3") || r.classList.contains("ai-un") ? k : -1)).filter((k) => k >= 0);
    if (scope !== "all" && !sel.length) { await uiAlert("KI-Abstimmung", scope === "pick" ? "Es ist keine Zeile angehakt." : "Es gibt keine markierten Problemzeilen. Zuerst einmal alle Zeilen abstimmen."); return; }
    const only = sel.length > 0 && sel.length < rows.length;
    const old = btn.textContent; btn.disabled = true; btn.textContent = "KI arbeitet …";
    try {
      const texts = rows.map(rowText);
      const lang = typeof musikLang === "function" && musikLang() === "de" && state.lyricLang === "de" ? "de" : "en";
      const words = await transcribe(texts, lang);
      const olds = rows.map((r) => Number(r.dataset.time));
      if (!AI.old || AI.old.length !== rows.length || AI.song !== songKey()) { AI.old = olds.slice(); AI.neu = null; AI.hit = null; AI.reverted = new Set(); AI.song = songKey(); }
      const fin = (idxs, hits) => { if (!AI.hit || AI.hit.length !== rows.length) AI.hit = rows.map(() => true); (idxs || rows.map((_, k) => k)).forEach((k) => { AI.hit[k] = hits ? hits[k] !== false : true; }); AI.neu = AI.neu && AI.neu.length === rows.length ? AI.neu : olds.slice(); (idxs || rows.map((_, k) => k)).forEach((k) => { AI.neu[k] = Number(rows[k].dataset.time); AI.reverted.delete(k); }); AI.mode = "ki"; };
      let res, idxs;
      if (only) {
        idxs = sel; res = { hit: rows.map(() => null), matched: 0, total: 0 };
        /* zusammenhängende Gruppen gewählter Zeilen: nur im Zeitfenster zwischen den Nachbarzeilen suchen */
        const groups = []; sel.forEach((k) => { const g = groups[groups.length - 1]; if (g && g[g.length - 1] === k - 1) g.push(k); else groups.push([k]); });
        groups.forEach((g) => {
          const a = g[0], z = g[g.length - 1];
          const t0 = a > 0 ? olds[a - 1] : 0, t1 = z < rows.length - 1 ? olds[z + 1] : Infinity;
          const win = words.filter((w) => w.s >= t0 - 0.8 && w.s <= t1 + 0.8);
          const r = alignLines(g.map((k) => texts[k]), win);
          if (!r) { g.forEach((k) => { res.hit[k] = false; }); return; }
          g.forEach((k, i) => { res.hit[k] = r.hit[i]; rows[k].dataset.time = String(Math.max(0, r.times[i] + (state.timeOffset || 0) / 1000)); const inp = rows[k].querySelector(".time-edit"); if (inp && typeof formatTime === "function") inp.value = formatTime(Number(rows[k].dataset.time), true); });
          res.matched += r.matched; res.total += r.total;
        });
        const cnt = mark(rows.filter((_, k) => sel.includes(k)), sel.map((k) => olds[k]), { hit: sel.map((k) => res.hit[k]) });
        fin(sel, res.hit); state.editDirty = true; legend(cnt); saveLast();
        await report(`${sel.length} Zeilen neu zugeordnet (${res.matched} von ${res.total} Wörtern gefunden).`);
        return;
      }
      res = alignLines(texts, words);
      if (!res || res.matched < Math.max(3, res.total * 0.2)) { await uiAlert("KI-Abstimmung", `Die KI konnte nur ${res ? res.matched : 0} von ${res ? res.total : texts.join(" ").split(/\s+/).length} Wörtern zuordnen. Bei Instrumental oder sehr leisem Gesang klappt das schlecht. Es wurde nichts geändert.`); return; }
      rows.forEach((row, k) => {
        const t = Math.max(0, res.times[k] + (state.timeOffset || 0) / 1000);
        row.dataset.time = String(t);
        const inp = row.querySelector(".time-edit"); if (inp && typeof formatTime === "function") inp.value = formatTime(t, true);
      });
      const cnt = mark(rows, olds, res);
      fin(null, res.hit); state.editDirty = true; legend(cnt); saveLast();
      await report(`Fertig: ${res.matched} von ${res.total} Wörtern zugeordnet (${Math.round(100 * res.matched / res.total)} %).`);
    } catch (e) { await uiAlert("KI-Abstimmung", (e && e.message) || String(e)); }
    finally { prog(false); btn.disabled = false; btn.textContent = old; }
  }
  new MutationObserver(() => {
    const p = $("editPanel"); if (!p || p.querySelector(".ai-sync")) return;
    const b = document.createElement("button"); b.className = "chip ai-sync"; b.type = "button"; b.textContent = "KI-Sync"; b.title = "Zeiten automatisch per KI setzen (Optionen im Dialog)";
    b.addEventListener("click", () => aiSync(b));
    const save = [...p.querySelectorAll("button")].find((x) => x.textContent === "Speichern");
    p.insertBefore(b, save || null);
  }).observe(document.body, { childList: true });



  /* ----- Werkzeugleiste unter der Kopfzeile (KI-Übersicht, letzte KI, Auswahl-Knöpfe) ----- */
  const selBarOn = () => lsv("selBar", "0") === "1";
  function selAction(v) {
    const c = pickCbs();
    if (v === "all") c.forEach((x) => { x.checked = true; });
    else if (v === "none") c.forEach((x) => { x.checked = false; });
    else if (v === "inv") c.forEach((x) => { x.checked = !x.checked; });
    else if (v === "bad") c.forEach((x) => { const r = x.closest(".lyric-line"); x.checked = !!r && (r.classList.contains("ai-d3") || r.classList.contains("ai-un")); });
    else if (v === "ki") useTimes("ki");
    else if (v === "alt") useTimes("alt");
    else if (v === "pickalt") { rowsAll().forEach((r, k) => { const cb = r.querySelector(".row-pick"); if (cb && cb.checked && AI.old && AI.old[k] != null && !AI.reverted.has(k)) revertRow(k, r); }); }
    syncPickAll();
  }
  function tools() {
    const hd = typeof editHeadBox === "function" && $("colHead") ? editHeadBox() : null; if (!hd) return;
    let t = $("aiTools"); if (!t) { t = document.createElement("div"); t.id = "aiTools"; const lg = $("aiLegend"), ch = $("colHead"); (lg || ch).after(t); }
    if (t.previousElementSibling !== ($("aiLegend") || $("colHead"))) ($("aiLegend") || $("colHead")).after(t);
    t.replaceChildren();
    const mk = (txt, fn, title, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = txt; if (title) b.title = title; b.disabled = !!dis; b.onclick = fn; t.append(b); return b; };
    const hasAI = !!(AI.old && AI.neu), last = getLast();
    mk("KI-Übersicht", () => report(), "Tabelle: wie viele Zeilen wurden wie stark verändert", !hasAI);
    mk("Letzte KI-Änderung", () => loadLast(), last ? "Letzte KI-Abstimmung dieses Liedes ohne neues Einlesen wieder laden (" + new Date(last.ts).toLocaleString("de-AT") + ")" : "Noch keine KI-Abstimmung für dieses Lied gespeichert", !last);
    if (selBarOn()) {
      const sp = document.createElement("span"); sp.className = "ai-sep"; sp.textContent = "Auswahl:"; t.append(sp);
      mk("Alle", () => selAction("all")); mk("Keine", () => selAction("none")); mk("Umkehren", () => selAction("inv"));
      mk("Große + n. z.", () => selAction("bad"), "Große Abweichung und nicht zugeordnete wählen", !hasAI);
      mk("→ KI-Zeit", () => selAction("ki"), "Alle Zeilen auf KI-Zeit", !hasAI); mk("→ alte Zeit", () => selAction("alt"), "Alle Zeilen auf alte Zeit", !hasAI);
      mk("Gewählte → alt", () => selAction("pickalt"), "Nur gewählte Zeilen auf alte Zeit", !hasAI);
    }
  }
  /* ----- Lokal gespeicherte, nicht auf dem Server liegende Zeiten ----- */
  const pendKey = () => "pend-" + songKey();
  const getPend = () => { try { return JSON.parse(localStorage.getItem(pendKey()) || "null"); } catch { return null; } };
  function pendCompare(p) {
    const rows = rowsAll(); if (!p || !p.lines) return null;
    if (p.lines.length !== rows.length) return { same: false, lenDiff: true, n: p.lines.length, m: rows.length };
    let diff = 0; rows.forEach((r, k) => { if (Math.abs(Number(r.dataset.time) - Number(p.lines[k].time)) > 0.05 || (p.lines[k].text || "").trim() !== rowText(r)) diff++; });
    return { same: diff === 0, diff, n: rows.length };
  }
  async function pendShow(p) {
    const rows = rowsAll(), c = pendCompare(p);
    if (!c || c.lenDiff) { /* Text weicht ab: lokale Fassung komplett laden */
      if (!(await uiConfirm({ eyebrow: "Lokal gespeichert", title: "Lokale Fassung laden?", text: `Lokal gibt es ${c ? c.n : "?"} Zeilen, auf dem Server ${c ? c.m : "?"}. Die lokale Fassung ersetzt die angezeigten Zeilen (gespeichert wird erst mit „Speichern“).`, ok: "Laden" }))) return false;
      state.lyrics = p.lines.map((l) => ({ time: Number(l.time), text: l.text })); renderLyrics(state.lyrics); state.editDirty = true; return true;
    }
    AI.old = rows.map((r) => Number(r.dataset.time)); AI.neu = p.lines.map((l) => Number(l.time)); AI.hit = rows.map(() => true); AI.reverted = new Set(); AI.song = songKey(); AI.mode = "ki";
    rows.forEach((r, k) => setT(r, AI.neu[k]));
    const cnt = mark(rows, AI.old, { hit: AI.hit }); state.editDirty = true; legend(cnt); tools();
    await report("Vergleich: lokal gespeicherte Zeiten (neu) gegenüber dem Server (alt). Mit „↶/alt“ in der Zeile stellst du einzelne Zeilen auf die Server-Zeit zurück.");
    return true;
  }
  function pendBar() {
    const hd = typeof editHeadBox === "function" && $("colHead") ? editHeadBox() : null;
    let bar = $("pendBar"); if (bar) bar.remove();
    if (!hd) return;
    const p = getPend(); if (!p) return;
    const c = pendCompare(p);
    if (c && c.same) { try { localStorage.removeItem(pendKey()); } catch { /* egal */ } return; }
    bar = document.createElement("div"); bar.id = "pendBar";
    const when = new Date(p.ts).toLocaleString("de-AT");
    const msg = document.createElement("span");
    msg.textContent = "⚠ Nur lokal gespeichert (" + when + "): " + (c && c.lenDiff ? `Zeilenzahl weicht ab (lokal ${c.n}, Server ${c.m}).` : `${c ? c.diff : "?"} von ${c ? c.n : "?"} Zeilen anders als auf dem Server.`);
    const mkb = (txt, fn, title) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = txt; if (title) b.title = title; b.onclick = fn; return b; };
    bar.append(msg,
      mkb("Unterschiede zeigen", async () => { await pendShow(p); }, "Zeigt die Unterschiede wie bei einer KI-Abstimmung"),
      mkb("Auf Server speichern", async () => { if (await pendShow(p)) { const ok = await saveTimecode(true); if (ok) pendBar(); } }, "Lokale Zeiten übernehmen und auf dem Server speichern"),
      mkb("Verwerfen", async () => { if (await uiConfirm({ eyebrow: "Lokal gespeichert", title: "Lokale Zeiten verwerfen?", text: "Die nur lokal gespeicherten Zeiten werden gelöscht. Der Server-Stand bleibt.", ok: "Verwerfen" })) { try { localStorage.removeItem(pendKey()); } catch { /* egal */ } pendBar(); } }));
    const anchor = $("aiTools") || $("aiLegend") || $("colHead"); anchor.after(bar);
  }
  function onRows() {
    const sk = songKey();
    if (AI.song && AI.song !== sk) { AI.old = AI.neu = AI.hit = null; AI.reverted = new Set(); const lg = $("aiLegend"); if (lg) lg.remove(); }
    tools(); pendBar();
  }
  document.addEventListener("edit-rows", onRows);
  document.addEventListener("pending-changed", () => { tools(); pendBar(); });

  /* ----- Auswahl-Werkzeuge in der Kopfzeile ----- */
  const pickCbs = () => [...document.querySelectorAll("#lyrics .row-pick")];
  function syncPickAll() {
    const all = $("pickAll"); if (!all) return; const c = pickCbs(), n = c.filter((x) => x.checked).length;
    all.checked = c.length > 0 && n === c.length; all.indeterminate = n > 0 && n < c.length;
  }
  document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "pickAll") { pickCbs().forEach((c) => { c.checked = e.target.checked; }); syncPickAll(); }
    else if (e.target && e.target.classList && e.target.classList.contains("row-pick")) syncPickAll();
  });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest && e.target.closest("#colHead .hd-sel"); if (!b) return;
    e.stopPropagation();
    const hasAI = AI.old && AI.neu;
    const buttons = [
      { value: "all", kind: "primary", label: "Alle Zeilen wählen" },
      { value: "none", kind: "primary", label: "Keine Zeile wählen" },
      { value: "inv", kind: "primary", label: "Auswahl umkehren" },
      { value: "bad", kind: "primary", label: "Große Abweichung + nicht zugeordnete wählen" },
      ...(hasAI ? [{ value: "ki", kind: "primary", label: "Alle Zeilen auf KI-Zeit" }, { value: "alt", kind: "primary", label: "Alle Zeilen auf alte Zeit" }, { value: "pickalt", kind: "primary", label: "Nur gewählte Zeilen auf alte Zeit" }] : []),
      { value: null, kind: "cancel", label: "Schließen" }
    ];
    const v = await uiDialog({ eyebrow: "Bearbeiten", title: "Zeilen auswählen", cancelValue: null, lines: ["Mit den Haken legst du fest, welche Zeilen „KI-Sync“ neu berechnet.", { check: { label: "Auswahl-Knöpfe dauerhaft in der Leiste anzeigen", value: selBarOn(), onChange: (x) => { lss("selBar", x ? "1" : "0"); tools(); } } }], buttons });
    if (v) selAction(v);
    syncPickAll();
  }, true);

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
  window.AIK = { transcribe, alignLines, prog, level };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
