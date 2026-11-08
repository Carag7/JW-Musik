/* v125: Bewertungen (Lied + Karaoke-Text), Ampel, KI-Verlauf, Reiter-Gruppen, Bearbeiten-Leiste */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const ART = [["karaoke", "Karaoke"], ["meeting", "Instrumental"], ["video", "Video"], ["sung", "Zusammenkünfte"]];
  const LANG = [["en", "Englisch"], ["de", "Deutsch"]];
  const artName = (a) => (ART.find((x) => x[0] === a) || [])[1] || a;
  const langName = (l) => (LANG.find((x) => x[0] === l) || [])[1] || l;
  const kindOf = (art, lang) => (art === "meeting" || art === "video" ? "lrcm" : art === "sung" ? "lrcs" : lang === "de" ? "lrcde" : "lrc");
  const f1 = (x) => x.toFixed(1).replace(".", ",");
  const dt = (ts) => (ts ? new Date(ts).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }) : "–");
  const dd = (ts) => (ts ? new Date(ts).toLocaleDateString("de-AT") : "–");
  const rateOn = () => lsv("rateOn", "1") === "1";
  const ampOn = () => lsv("ampelOn", "1") === "1";
  const cur = () => state.songs[state.index];
  const curArt = () => state.version || state.curVersion || "karaoke";
  const curLang = () => (musikLang() === "de" ? "de" : "en");
  const keyNow = () => { try { return sessionStorage.getItem("aiKey") || ""; } catch { return ""; } };
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  async function get(path) {
    const r = await fetch(SYNC_BASE + path, { cache: "no-store" });
    if (!r.ok) throw new Error("Server " + r.status);
    return r.json();
  }
  async function post(path, body, key) {
    const r = await fetch(SYNC_BASE + path, { method: "POST", headers: { "content-type": "application/json", "x-write-key": key || "" }, body: JSON.stringify(body) });
    let j = {}; try { j = await r.json(); } catch { /* egal */ }
    if (!r.ok || j.ok === false) { const e = new Error(j.error || "Server " + r.status); e.status = r.status; throw e; }
    return j;
  }

  /* ---------- Übersicht aller Bewertungen (Index vom Server, lokal zwischengespeichert) ---------- */
  let IDX = (() => { try { return JSON.parse(localStorage.getItem("rateIdx") || "{}"); } catch { return {}; } })();
  async function loadIdx() {
    try { IDX = await get("/api/rate-index"); try { localStorage.setItem("rateIdx", JSON.stringify(IDX)); } catch { /* egal */ } } catch { /* offline oder Worker noch alt */ }
    paintAmpel();
    return IDX;
  }
  const stat = (id, t, art, lang) => { const o = ((IDX[id] || {}).k || {})[`${t}|${art}|${lang}`]; return o ? { n: o.n, avg: o.s / o.n, last: o.last } : null; };
  const ampel = (id, art, lang) => ((IDX[id] || {}).status || {})[`${art}|${lang}`] || "";
  const lrcInfo = (id, art, lang) => ((IDX[id] || {}).lrc || {})[kindOf(art, lang)] || null;
  const AMP_NAME = { red: "rot – muss überarbeitet werden", orange: "orange – fast fertig", green: "grün – passt" };

  /* ---------- Ampel in der Liedliste ---------- */
  function paintAmpel() {
    const list = document.querySelectorAll(".song-row .song-btn[data-id]");
    const art = curArt(), lang = curLang();
    list.forEach((b) => {
      const row = b.closest(".song-row"); if (!row) return;
      const c = ampOn() ? ampel(b.dataset.id, art, lang) : "";
      let dot = b.querySelector(":scope > .amp-dot");
      if (!c) { if (dot) dot.remove(); delete row.dataset.amp; return; }
      row.dataset.amp = c;
      if (!dot) { dot = h("i", "amp-dot"); b.prepend(dot); }
      dot.dataset.c = c; dot.title = "Karaoke-Text: " + AMP_NAME[c];
    });
  }
  (() => {
    const o = window.renderList;
    if (typeof o === "function" && !o._v125) { const w = function () { const r = o.apply(this, arguments); try { paintAmpel(); } catch { /* egal */ } return r; }; w._v125 = true; window.renderList = w; }
  })();

  /* ---------- Bewertungs-Oberfläche im ＋-Dialog ---------- */
  function starRow(onChange) {
    const w = h("span", "rt-stars"); let v = 0;
    const bs = [1, 2, 3, 4, 5].map((i) => { const b = h("button", "rt-star", "★"); b.type = "button"; b.setAttribute("aria-label", i + " Sterne"); b.onclick = () => { v = v === i ? 0 : i; paint(); onChange && onChange(v); }; w.append(b); return b; });
    const paint = () => bs.forEach((b, k) => b.classList.toggle("on", k < v));
    w.get = () => v; w.reset = () => { v = 0; paint(); };
    return w;
  }
  function ratingNode(s) {
    const box = h("div", "rt-box");
    const st = { art: curArt(), lang: curLang() };
    box.append(h("p", "dlg-group-title", "Bewertung"));
    const avg = h("small", "rt-avg", "…");
    const lSong = h("label", "rt-row"); lSong.append(h("span", "rt-l", "Lied")); const sSong = starRow(); lSong.append(sSong);
    box.append(lSong, avg);
    const name = h("input", "rt-in"); name.type = "text"; name.placeholder = "Name (freiwillig)"; name.maxLength = 40; name.value = lsv("rateName", "");
    const anon = h("label", "rt-chk"); const ac = h("input"); ac.type = "checkbox"; ac.checked = lsv("rateAnon", "0") === "1"; anon.append(ac, document.createTextNode(" anonym"));
    const tag = h("input", "rt-in"); tag.type = "text"; tag.placeholder = "Eigener Text / Stichwort zum Sortieren (freiwillig)"; tag.maxLength = 60;
    const nameRow = h("div", "rt-row"); nameRow.append(name, anon);
    box.append(nameRow, tag);
    const more = h("details", "rt-more"); const sum = h("summary"); more.append(sum);
    const paintSum = () => { sum.textContent = `▸ Karaoke-Text bewerten · ${artName(st.art)} · ${langName(st.lang)}`; };
    paintSum();
    const selArt = h("select", "rt-sel"); ART.forEach(([v, n]) => { const o = h("option", "", n); o.value = v; selArt.append(o); }); selArt.value = st.art;
    const selLang = h("select", "rt-sel"); LANG.forEach(([v, n]) => { const o = h("option", "", n); o.value = v; selLang.append(o); }); selLang.value = st.lang;
    const sel = h("div", "rt-row"); sel.append(h("span", "rt-l", "Fassung"), selArt, selLang);
    const lText = h("label", "rt-row"); lText.append(h("span", "rt-l", "Text")); const sText = starRow(); lText.append(sText);
    const note = h("textarea", "rt-in"); note.rows = 2; note.maxLength = 600; note.placeholder = "Notiz zum Karaoke-Text, z. B. „Zeile 5 zu früh“ (freiwillig)";
    const info = h("small", "rt-avg", "");
    more.append(sel, lText, note, info);
    box.append(more);
    const send = h("button", "chip rt-send", "Bewertung senden"); send.type = "button";
    const msg = h("small", "rt-msg", ""); box.append(send, msg);
    box.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") e.preventDefault(); });
    let rec = null;
    function paintAvg() {
      if (!rec) return;
      const es = (t) => rec.entries.filter((e) => e.t === t && e.art === st.art && e.lang === st.lang);
      const m = (a) => (a.length ? `Ø ${f1(a.reduce((x, e) => x + e.s, 0) / a.length)} (${a.length})` : "noch keine");
      avg.textContent = `Alle Fassungen: Lied ${m(rec.entries.filter((e) => e.t === "song"))}`;
      const li = (rec.lrc || {})[kindOf(st.art, st.lang)];
      info.textContent = `Text ${artName(st.art)}/${langName(st.lang)}: ${m(es("text"))} · gespeichert: ${li ? dt(li.ts) + (li.u ? " von " + li.u : "") : "–"}`;
    }
    selArt.onchange = () => { st.art = selArt.value; paintSum(); paintAvg(); };
    selLang.onchange = () => { st.lang = selLang.value; paintSum(); paintAvg(); };
    get("/api/rate?id=" + encodeURIComponent(s.id)).then((r) => { rec = r; paintAvg(); }).catch(() => { avg.textContent = "Bewertungen sind gerade nicht erreichbar."; });
    send.onclick = async () => {
      const a = sSong.get(), t = sText.get();
      if (!a && !t) { msg.textContent = "Bitte zuerst Sterne wählen."; return; }
      const u = ac.checked ? "" : name.value.trim();
      lss("rateName", name.value.trim()); lss("rateAnon", ac.checked ? "1" : "0");
      send.disabled = true; msg.textContent = "Wird gesendet …";
      try {
        let r;
        if (a) r = await post("/api/rate", { id: s.id, op: "add", art: st.art, lang: st.lang, entry: { t: "song", s: a, u, tag: tag.value, note: "" } });
        if (t) r = await post("/api/rate", { id: s.id, op: "add", art: st.art, lang: st.lang, entry: { t: "text", s: t, u, tag: tag.value, note: note.value } });
        rec = r; paintAvg(); sSong.reset(); sText.reset(); note.value = "";
        msg.textContent = "Danke für die Bewertung!"; loadIdx();
      } catch (e) { msg.textContent = "Nicht gesendet: " + (e.message || e); }
      send.disabled = false;
    };
    return box;
  }
  window.RATE = { on: rateOn, node: ratingNode };

  /* ---------- Einträge eines Liedes ansehen (und mit Schlüssel löschen) ---------- */
  async function showEntries(song, art, lang) {
    let rec;
    try { rec = await get("/api/rate?id=" + encodeURIComponent(song.id)); } catch (e) { await uiAlert("Bewertungen", "Server nicht erreichbar: " + (e.message || e)); return; }
    const es = rec.entries.map((e, i) => ({ ...e, i })).filter((e) => !art || (e.art === art && e.lang === lang)).sort((a, b) => b.ts - a.ts);
    const li = (rec.lrc || {})[kindOf(art, lang)];
    const lines = [{ text: `${artName(art)} · ${langName(lang)} · Karaoke-Text gespeichert: ${li ? dt(li.ts) + (li.u ? " von " + li.u : "") : "noch nie"}`, cls: "dlg-hint" }];
    if (es.length) lines.push({ table: [["Datum", "Art", "Wer", "Sterne", "Notiz"], ...es.map((e) => [dt(e.ts), e.t === "text" ? "Text" : "Lied", (e.u || "anonym") + (e.tag ? " · " + e.tag : ""), stars(e.s), e.note || ""])] });
    else lines.push("Noch keine Bewertungen für diese Fassung.");
    const buttons = [{ value: null, kind: "cancel", label: "Schließen" }];
    if (es.length) buttons.unshift({ value: "del", kind: "danger", label: "Eintrag löschen …" });
    const r = await uiDialog({ eyebrow: `Lied ${song.id}`, title: "Bewertungen im Detail", lines: [song.title, ...lines], buttons, cancelValue: null });
    if (r !== "del") return;
    let pick = es[0].i;
    const ok = await uiDialog({ eyebrow: "Löschen", title: "Welchen Eintrag löschen?", cancelValue: false, lines: [{ select: { label: "Eintrag", value: String(pick), options: es.map((e) => [String(e.i), `${dd(e.ts)} · ${e.t === "text" ? "Text" : "Lied"} · ${e.u || "anonym"} · ${stars(e.s)}`]), onChange: (v) => { pick = Number(v); } } }], buttons: [{ value: true, kind: "danger", label: "Löschen" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
    if (ok !== true) return;
    let key = keyNow();
    for (let tries = 0; tries < 3; tries++) {
      if (!key) { key = window.askEditPass ? await window.askEditPass("Löschen") : await uiPrompt({ eyebrow: "Löschen", title: "Schreib-Schlüssel", text: "Zum Löschen wird der Schlüssel WRITE_KEY gebraucht.", type: "password", placeholder: "WRITE_KEY", ok: "Weiter" }); if (!key) return; }
      try { await post("/api/rate", { id: song.id, op: "del", index: pick, art, lang }, key); try { sessionStorage.setItem("aiKey", key); } catch { /* egal */ } showToast("Eintrag gelöscht."); loadIdx().then(() => { if (state.setTab === "bew") mountBew(); }); return; }
      catch (e) { if (e.status === 401) { key = ""; continue; } await uiAlert("Löschen", e.message || String(e)); return; }
    }
  }

  /* ---------- Reiter „Bewertungen“ ---------- */
  const BV = { lrc: "", desc: false, art: "karaoke", lang: "en", sort: "nr", filt: "all", q: "", us: "", sg: "0", sx: "0" };
  function hasText(song, art, lang) {
    const m = state.media; if (!m) return !song.extra && art === "karaoke" && lang === "en";
    const num = String(song.number);
    if (art === "karaoke") { const src = lang === "de" ? (m.de || {}) : m; return lang === "en" ? (!song.extra || !!((src.karaoke || {}).lrc || {})[num]) : !!((src.karaoke || {}).lrc || {})[num]; }
    const mt = m.meeting || {};
    if (art === "sung") return !!(mt.sungLrc || {})[num];
    return !!(mt.lrc || {})[num];
  }
  function lrcFiles(song) {
    const m = state.media || {}, md = m.de || {}, n = String(song.number), out = [];
    if (((m.karaoke || {}).lrc || {})[n]) out.push("Karaoke EN");
    if (((md.karaoke || {}).lrc || {})[n]) out.push("Karaoke DE");
    if (((m.meeting || {}).lrc || {})[n]) out.push("Instrumental");
    if (((m.meeting || {}).sungLrc || {})[n]) out.push("Zusammenkünfte");
    return out;
  }
  function openSongEdit(song, art, lang) {
    const i = state.songs.findIndex((x) => x.id === song.id); if (i < 0) return;
    $("codeModal").hidden = true;
    if (art === "karaoke") lss("musikLang", lang);
    state.version = art === "video" ? "meeting" : art;
    state.returnTab = state.setTab || "bew";
    state.editReturn = state.setTab || "bew";
    Promise.resolve(selectSong(i, false)).then(() => { if (!document.body.classList.contains("edit-mode")) openTimecode(); }).catch(() => {});
  }
  function mountBew() {
    const box = $("bewBox"); if (!box) return;
    box.replaceChildren();
    const mkSel = (opts, val, fn) => { const s = h("select", "rt-sel"); opts.forEach(([v, n]) => { const o = h("option", "", n); o.value = v; s.append(o); }); s.value = val; s.onchange = () => fn(s.value); return s; };
    box.append(h("p", "ap-title", "Bewertungen"));
    box.append(h("small", "set-hint", "Sterne für das Lied (gefällt es?) und getrennt dafür, wie gut der Karaoke-Text zeitlich stimmt. So sieht man, welche Texte noch überarbeitet werden müssen. Jeder kann mithelfen."));
    const c1 = h("label", "set-row check"); const k1 = h("input"); k1.type = "checkbox"; k1.checked = rateOn(); k1.onchange = () => lss("rateOn", k1.checked ? "1" : "0"); c1.append(k1, h("span", "", " Bewertung im „＋“-Fenster zeigen"));
    const c2 = h("label", "set-row check"); const k2 = h("input"); k2.type = "checkbox"; k2.checked = ampOn(); k2.onchange = () => { lss("ampelOn", k2.checked ? "1" : "0"); paintAmpel(); }; c2.append(k2, h("span", "", " Korrektur-Status in der Liedliste zeigen"));
    const nm = h("label", "set-row"); nm.append(document.createTextNode("Mein Name "), (() => { const i = h("input"); i.type = "text"; i.maxLength = 40; i.placeholder = "leer = anonym"; i.value = lsv("rateName", ""); i.onchange = () => lss("rateName", i.value.trim()); return i; })());
    box.append(c1, c2, nm);
    const f = h("div", "rt-filters");
    const selArt = mkSel(ART, BV.art, (v) => { BV.art = v; draw(); }), selLang = mkSel(LANG, BV.lang, (v) => { BV.lang = v; draw(); });
    f.append(selArt, selLang,
      mkSel([["nr", "Sortieren: Nummer"], ["song", "Lied: beste zuerst"], ["text", "Text: schlechteste zuerst"], ["textbest", "Text: beste zuerst"], ["recent", "Text: zuletzt gespeichert"], ["amp", "Status: rot zuerst"], ["title", "Titel A–Z"], ["lrcn", "LRC-Dateien: wenige zuerst"], ["nrat", "Bewertungen: meiste zuerst"]], BV.sort, (v) => { BV.sort = v; draw(); }),
      mkSel([["all", "Filter: alle"], ["note", "nur mit Notiz"], ["notext", "ohne Text-Bewertung"], ["low", "Text Ø unter 3,5"], ["red", "Status rot"], ["orange", "Status orange"], ["green", "Status grün"], ["none", "ohne Ampel"], ["unsaved", "KI-Text / lokal ungespeichert"], ["fresh", "neu: noch nicht geprüft"]], BV.filt, (v) => { BV.filt = v; try { paintChips(); } catch { /* egal */ } draw(); }),
      mkSel([["0", "Lied: alle Sterne"], ["5", "Lied: 5 Sterne"], ["4", "Lied: 4 Sterne"], ["3", "Lied: 3 Sterne"], ["2", "Lied: 2 Sterne"], ["1", "Lied: 1 Stern"]], BV.sg, (v) => { BV.sg = v; draw(); }),
      mkSel([["0", "Text: alle Sterne"], ["5", "Text: 5 Sterne"], ["4", "Text: 4 Sterne"], ["3", "Text: 3 Sterne"], ["2", "Text: 2 Sterne"], ["1", "Text: 1 Stern"]], BV.sx, (v) => { BV.sx = v; draw(); }));
    const q = h("input", "rt-in rt-q"); q.type = "search"; q.placeholder = "Nummer oder Titel suchen"; q.value = BV.q; q.oninput = () => { BV.q = q.value; draw(); };
    const qu = h("input", "rt-in rt-q"); qu.type = "search"; qu.placeholder = "Benutzer oder Stichwort suchen"; qu.value = BV.us; qu.oninput = () => { BV.us = qu.value; draw(); };
    const dirB = h("button", "chip rt-dir", BV.desc ? "↑ Reihenfolge: umgekehrt" : "↓ Reihenfolge: normal"); dirB.type = "button"; dirB.onclick = () => { BV.desc = !BV.desc; dirB.textContent = BV.desc ? "↑ Reihenfolge: umgekehrt" : "↓ Reihenfolge: normal"; draw(); };
    const ab = h("div", "rt-amprow");
    ab.append(h("span", "rt-cnt-t", "Korrektur-Status:"));
    [["all", "alle", ""], ["red", "überarbeiten", "red"], ["orange", "fast fertig", "orange"], ["green", "passt", "green"], ["none", "ohne Markierung", ""], ["unsaved", "ungespeichert", ""]].forEach(([v, n, c]) => {
      const b = h("button", "rt-cnt rt-ampchip"); b.type = "button"; b.dataset.f = v; if (c) { const i = h("i", "amp-dot"); i.dataset.c = c; b.append(i); } b.append(document.createTextNode(n));
      b.onclick = () => { BV.filt = v; paintChips(); const sf = f.querySelectorAll("select")[3]; if (sf) sf.value = v; draw(); };
      ab.append(b);
    });
    const paintChips = () => ab.querySelectorAll("button").forEach((x) => { x.classList.toggle("on", x.dataset.f === BV.filt); x.setAttribute("aria-pressed", String(x.dataset.f === BV.filt)); });
    paintChips();
    box.append(f, ab, dirB, q, qu);
    const info = h("small", "set-hint", ""); const list = h("div", "rt-list"); const cnt = h("div", "rt-cnts");
    box.append(cnt, info, list);
    function draw() {
      list.replaceChildren();
      const { art, lang } = BV;
      let rows = state.songs.filter((s) => BV.lrc ? lrcFiles(s).includes(BV.lrc) : (hasText(s, art, lang) || stat(s.id, "text", art, lang) || ampel(s.id, art, lang))).map((s) => ({ s, sg: stat(s.id, "song", art, lang), tx: stat(s.id, "text", art, lang), am: ampel(s.id, art, lang), li: lrcInfo(s.id, art, lang) }));
      const qq = BV.q.trim().toLowerCase();
      if (qq) rows = rows.filter((r) => String(r.s.id).toLowerCase() === qq || String(r.s.number) === qq || r.s.title.toLowerCase().includes(qq));
      const uq = BV.us.trim().toLowerCase();
      if (uq) rows = rows.filter((r) => ["song", "text"].some((t) => ((((IDX[r.s.id] || {}).k || {})[`${t}|${art}|${lang}`] || {}).u || []).some((x) => x.includes(uq))));
      if (BV.sg !== "0") rows = rows.filter((r) => r.sg && Math.round(r.sg.avg) === Number(BV.sg));
      if (BV.sx !== "0") rows = rows.filter((r) => r.tx && Math.round(r.tx.avg) === Number(BV.sx));
      const F = BV.filt;
      if (F === "note") rows = rows.filter((r) => ((((IDX[r.s.id] || {}).k || {})[`text|${art}|${lang}`] || {}).notes || 0) > 0 || ((((IDX[r.s.id] || {}).k || {})[`song|${art}|${lang}`] || {}).notes || 0) > 0);
      else if (F === "notext") rows = rows.filter((r) => !r.tx);
      else if (F === "low") rows = rows.filter((r) => r.tx && r.tx.avg < 3.5);
      else if (F === "none") rows = rows.filter((r) => !r.am);
      else if (F === "unsaved") { const kd = kindOf(art, lang); rows = rows.filter((r) => { try { return !!(localStorage.getItem(`kitext-${kd}-${r.s.id}`) || localStorage.getItem(`pend-${kd}-${r.s.id}`)); } catch { return false; } }); }
      else if (F === "fresh") rows = rows.filter((r) => !r.am && !r.tx);
      else if (F !== "all") rows = rows.filter((r) => r.am === F);
      const o = { red: 0, orange: 1, green: 2, "": 3 };
      const cmp = { nr: (a, b) => a.s.number - b.s.number || String(a.s.id).localeCompare(String(b.s.id)), song: (a, b) => (b.sg ? b.sg.avg : -1) - (a.sg ? a.sg.avg : -1), text: (a, b) => (a.tx ? a.tx.avg : 9) - (b.tx ? b.tx.avg : 9), textbest: (a, b) => (b.tx ? b.tx.avg : -1) - (a.tx ? a.tx.avg : -1), recent: (a, b) => (b.li ? b.li.ts : 0) - (a.li ? a.li.ts : 0), amp: (a, b) => o[a.am] - o[b.am], title: (a, b) => a.s.title.localeCompare(b.s.title, "de"), lrcn: (a, b) => lrcFiles(a.s).length - lrcFiles(b.s).length || a.s.number - b.s.number, nrat: (a, b) => ((b.sg ? b.sg.n : 0) + (b.tx ? b.tx.n : 0)) - ((a.sg ? a.sg.n : 0) + (a.tx ? a.tx.n : 0)) }[BV.sort];
      rows.sort(cmp); if (BV.desc) rows.reverse();
      const cn = (o) => Object.keys(o || {}).length, m = state.media || {}, md = m.de || {};
      cnt.replaceChildren(...[["Karaoke EN", cn((m.karaoke || {}).lrc)], ["Karaoke DE", cn((md.karaoke || {}).lrc)], ["Instrumental", cn((m.meeting || {}).lrc)], ["Zusammenkünfte", cn((m.meeting || {}).sungLrc)]].map(([n, v]) => { const c = h("button", "rt-cnt" + (BV.lrc === n ? " on" : "")); c.type = "button"; c.setAttribute("aria-pressed", String(BV.lrc === n)); c.title = "Antippen: nur Lieder mit dieser LRC-Datei zeigen"; c.append(h("b", "", String(v)), document.createTextNode(" " + n));
        c.onclick = () => { if (BV.lrc === n) BV.lrc = ""; else { BV.lrc = n; const m = { "Karaoke EN": ["karaoke", "en"], "Karaoke DE": ["karaoke", "de"], Instrumental: ["meeting", "en"], "Zusammenkünfte": ["sung", "en"] }[n]; BV.art = m[0]; BV.lang = m[1]; selArt.value = m[0]; selLang.value = m[1]; } draw(); }; return c; }));
      cnt.prepend(h("span", "rt-cnt-t", "LRC-Dateien:"));
      info.textContent = `${rows.length} Lieder in der Liste (${artName(art)}, ${langName(lang)})${BV.lrc ? " – nur mit LRC-Datei „" + BV.lrc + "“ (erneut auf die Zahl tippen = alle)" : ""}. Tippe auf ein Lied, um den Text zu bearbeiten.`;
      rows.forEach((r) => {
        const card = h("div", "rt-card"); if (r.am) card.dataset.amp = r.am;
        const top = h("div", "rt-top");
        const t = h("button", "rt-title"); t.type = "button"; t.innerHTML = ""; t.append(h("b", "", String(r.s.id)), document.createTextNode(" " + r.s.title)); t.title = "Karaoke-Text dieses Liedes bearbeiten"; t.onclick = () => openSongEdit(r.s, art, lang);
        const amp = h("button", "rt-ampbtn"); amp.type = "button"; amp.dataset.c = r.am || "";
        amp.append(h("i", "amp-dot"), h("span", "", r.am ? ({ red: "überarbeiten", orange: "fast fertig", green: "passt" })[r.am] : "Korrektur-Status"));
        amp.firstChild.dataset.c = r.am || ""; amp.title = "Korrektur-Status des Karaoke-Textes setzen";
        amp.onclick = async () => {
          const v = await uiDialog({ eyebrow: `Lied ${r.s.id} · ${artName(art)} · ${langName(lang)}`, title: "Korrektur-Status des Karaoke-Textes", cancelValue: null, lines: [r.s.title, { text: "Rot: muss überarbeitet werden. Orange: fast fertig. Grün: passt.", cls: "dlg-hint" }],
            buttons: [{ value: "red", kind: "primary", label: "● Rot – überarbeiten" }, { value: "orange", kind: "primary", label: "● Orange – fast fertig" }, { value: "green", kind: "primary", label: "● Grün – passt" }, { value: "", kind: "danger", label: "Keine Farbe" }, { value: null, kind: "cancel", label: "Abbrechen" }] });
          if (v === null) return;
          try { const res = await post("/api/rate", { id: r.s.id, op: "status", art, lang, value: v }); (IDX[r.s.id] = IDX[r.s.id] || {}).status = res.status; try { localStorage.setItem("rateIdx", JSON.stringify(IDX)); } catch { /* egal */ } paintAmpel(); draw(); } catch (e) { showToast("Status nicht gespeichert: " + (e.message || e)); }
        };
        top.append(t, amp);
        const meta = h("div", "rt-meta");
        meta.append(h("span", "", "Lied " + (r.sg ? `${f1(r.sg.avg)} ★ (${r.sg.n})` : "–")), h("span", "", "Text " + (r.tx ? `${f1(r.tx.avg)} ★ (${r.tx.n})` : "–")), h("span", "", "gespeichert " + (r.li ? dd(r.li.ts) : "–")), (() => { const f = lrcFiles(r.s); const e = h("span", "rt-lf", `LRC-Dateien: ${f.length}`); e.title = f.length ? f.join(", ") : "keine"; return e; })());
        const act = h("div", "rt-act");
        const bD = h("button", "chip", "Details"); bD.type = "button"; bD.onclick = () => showEntries(r.s, art, lang);
        const bP = h("button", "chip", "＋ Bewerten"); bP.type = "button"; bP.onclick = async () => { const sv = { art: state.version, lang: lsv("musikLang", "en") }; state.version = art; if (art === "karaoke") lss("musikLang", lang); await uiDialog({ eyebrow: `Lied ${r.s.id}`, title: "Bewerten", lines: [r.s.title, { node: ratingNode(r.s) }], buttons: [{ value: null, kind: "cancel", label: "Schließen" }], cancelValue: null }); state.version = sv.art; lss("musikLang", sv.lang); await loadIdx(); draw(); };
        const bH = h("button", "chip", "KI-Verlauf"); bH.type = "button"; bH.onclick = () => { KV.id = r.s.id; KV.art = art; KV.lang = lang; showSetTab("kihist"); };
        act.append(bD, bP, bH);
        card.append(top, meta, act); list.append(card);
      });
    }
    draw();
    loadIdx().then(() => { if (state.setTab === "bew" && box.isConnected) draw(); });
  }

  /* ---------- KI-Verlauf: Fassungen speichern ---------- */
  const hkey = (kind, id) => `kih-${kind}-${id}`;
  const hget = (kind, id) => { try { return JSON.parse(localStorage.getItem(hkey(kind, id)) || "[]"); } catch { return []; } };
  function hput(kind, id, arr) { try { localStorage.setItem(hkey(kind, id), JSON.stringify(arr.slice(-24))); } catch { /* Speicher voll */ } }
  function hadd(kind, id, v) {
    const arr = hget(kind, id), last = arr[arr.length - 1];
    if (last && last.lrc === v.lrc && last.type === v.type) return;
    if (v.type === "orig" && arr.some((x) => x.type === "orig")) return;
    arr.push({ ts: Date.now(), ...v }); hput(kind, id, arr); flush(kind, id);
  }
  async function flush(kind, id, key) {
    const k = key || keyNow(); if (!k) return;
    const arr = hget(kind, id); let ch = false;
    for (const v of arr) {
      if (v.srv) continue;
      try { await post("/api/kihist", { id, kind, type: v.type, src: v.src || "edit", acc: v.acc || "", u: lsv("rateName", ""), lrc: v.lrc }, k); v.srv = 1; ch = true; } catch (e) { if (e.status === 401) break; }
    }
    if (ch) hput(kind, id, arr);
  }
  const mkLrc = (times, texts) => times.map((t, i) => { const m = Math.floor(t / 60), s = (t - m * 60).toFixed(2).padStart(5, "0"); return `[${String(m).padStart(2, "0")}:${s}]${texts[i]}`; }).join("\n");
  document.addEventListener("ki-run", (e) => {
    try {
      const song = cur(), d = e.detail || {}; if (!song || !d.old || !d.neu) return;
      const kind = curLrcKind(song), rows = [...document.querySelectorAll("#lyrics .lyric-line")];
      const texts = rows.map((r) => ((r.querySelector(".lyric-text") || {}).value || r.textContent || "").trim());
      if (texts.length !== d.old.length) return;
      hadd(kind, song.id, { type: "orig", lrc: mkLrc(d.old, texts) });
      hadd(kind, song.id, { type: "ki", src: "edit", acc: d.acc || "normal", lrc: mkLrc(d.neu, texts) });
    } catch { /* egal */ }
  });
  document.addEventListener("lrc-saved", (e) => {
    const d = e.detail || {}; if (!d.id || !d.lrc) return;
    const arr = hget(d.kind, d.id); arr.push({ ts: Date.now(), type: "saved", lrc: d.lrc }); hput(d.kind, d.id, arr);
    flush(d.kind, d.id, d.key);
    const song = state.songs.find((x) => x.id === d.id);
    post("/api/rate", { id: d.id, op: "lrc", kind: d.kind, u: lsv("rateName", "") }).then(() => loadIdx()).catch(() => {});
    void song;
  });

  /* ---------- Reiter „KI-Verlauf“ ---------- */
  const KV = { id: "", art: "karaoke", lang: "en", l: "", r: "", diffOnly: false, sel: -1, selR: -1, both: false };
  const ACC = { low: "schwach", normal: "normal", high: "sehr genau" };
  const parse = (txt) => String(txt || "").split(/\r?\n/).map((ln) => { const m = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/.exec(ln.trim()); return m ? { t: Number(m[1]) * 60 + Number(m[2]), x: m[3].trim() } : null; }).filter(Boolean);
  const tf = (t) => { const m = Math.floor(t / 60); return `${m}:${(t - m * 60).toFixed(2).padStart(5, "0")}`; };
  async function versionsOf(id, kind) {
    const out = [];
    const loc = hget(kind, id);
    let srv = [];
    try { srv = (await get(`/api/kihist?id=${encodeURIComponent(id)}&kind=${kind}`)).versions || []; } catch { /* offline */ }
    const seen = new Set();
    [...srv.map((v) => ({ ...v, from: "server" })), ...loc.map((v) => ({ ...v, from: "lokal" }))].forEach((v) => { const k = v.type + "|" + v.lrc; if (seen.has(k)) return; seen.add(k); out.push(v); });
    out.sort((a, b) => a.ts - b.ts);
    const L = (v) => ({ ...v, label: v.type === "orig" ? `Original (vor der ersten KI) · ${dt(v.ts)}` : v.type === "ki" ? `KI-Download${v.src === "song" ? " (direkt beim Lied)" : " (Bearbeiten-Modus)"} · ${dt(v.ts)} · Genauigkeit ${ACC[v.acc] || "normal"}` : `Gespeichert · ${dt(v.ts)}${v.u ? " · " + v.u : ""}` });
    const res = out.map(L);
    try { const r = await fetch(`${SYNC_BASE}/sync/${kind}-${id}`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) res.unshift({ ts: 0, type: "server", lrc: t, label: "Aktuell auf dem Server" }); } } catch { /* egal */ }
    if (!res.some((v) => v.type === "server")) {   /* kein bearbeiteter Text: die LRC-Datei aus dem Medienordner (R2) zeigen */
      try {
        const sg = state.songs.find((x) => x.id === id), n = sg ? String(sg.number) : "", m = state.media || {}, md = m.de || {};
        const key = kind === "lrc" ? ((m.karaoke || {}).lrc || {})[n] : kind === "lrcde" ? ((md.karaoke || {}).lrc || {})[n] : kind === "lrcm" ? ((m.meeting || {}).lrc || {})[n] : ((m.meeting || {}).sungLrc || {})[n];
        if (key) { const r = await fetch(mediaUrl(key), { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) res.unshift({ ts: 0, type: "server", lrc: t, label: "Aktuell (LRC-Datei)" }); } }
        if (!res.some((v) => v.type === "server") && kind === "lrc" && sg) { const r = await fetch(sg.lyrics || `lyrics/sjj_E_${String(sg.number).padStart(2, "0")}.lrc`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) res.unshift({ ts: 0, type: "server", lrc: t, label: "Aktuell (LRC-Datei)" }); } }
      } catch { /* egal */ }
    }
    try { const p = JSON.parse(localStorage.getItem("pend-" + kind + "-" + id) || "null"); if (p && p.lines) res.push({ ts: p.ts, type: "pend", lrc: mkLrc(p.lines.map((l) => Number(l.time)), p.lines.map((l) => l.text || "")), label: `Nur lokal gespeichert · ${dt(p.ts)}` }); } catch { /* egal */ }
    return res;
  }
  async function mountKih() {
    const box = $("kihBox"); if (!box) return;
    box.replaceChildren();
    const sg = cur();
    if (!KV.id && sg) { KV.id = sg.id; KV.art = curArt(); KV.lang = curLang(); if (KV.art === "video") KV.art = "meeting"; }
    box.append(h("p", "ap-title", "KI-Verlauf"));
    box.append(h("small", "set-hint", "Jeder KI-Download und jedes Speichern eines Karaoke-Textes wird aufgehoben. Hier kannst du zwei Fassungen nebeneinander vergleichen. Farben wie im Bearbeiten-Modus: grün gleich, gelb klein, orange mittel, rot groß, violett ohne Gegenstück."));
    const top = h("div", "rt-filters");
    const num = h("select", "rt-sel kv-song");
    { const o0 = h("option", "", "– Lied wählen –"); o0.value = ""; num.append(o0); }
    state.songs.filter((s) => hasText(s, KV.art, KV.lang) || s.id === KV.id).forEach((s) => { const o = h("option", "", `${s.id} ${s.title}`); o.value = s.id; num.append(o); });
    num.value = KV.id;
    const sa = h("select", "rt-sel"); [["karaoke", "Karaoke"], ["meeting", "Instrumental"], ["sung", "Zusammenkünfte"]].forEach(([v, n]) => { const o = h("option", "", n); o.value = v; sa.append(o); }); sa.value = KV.art === "video" ? "meeting" : KV.art;
    const sl = h("select", "rt-sel"); LANG.forEach(([v, n]) => { const o = h("option", "", n); o.value = v; sl.append(o); }); sl.value = KV.lang;
    const chg = () => { KV.id = num.value; KV.art = sa.value; KV.lang = sl.value; KV.l = KV.r = ""; mountKih(); };
    num.onchange = chg; sa.onchange = chg; sl.onchange = chg;
    top.append(num, sa, sl);
    box.append(top);
    const song = state.songs.find((s) => s.id === KV.id);
    if (!song) { box.append(h("small", "set-hint", "Kein Lied gewählt.")); return; }
    const kind = kindOf(KV.art, KV.lang), li = lrcInfo(song.id, KV.art, KV.lang), am = ampel(song.id, KV.art, KV.lang), sT = stat(song.id, "text", KV.art, KV.lang), sS = stat(song.id, "song", KV.art, KV.lang);
    const key = h("div", "kv-key");
    key.append(h("b", "", `Lied ${song.id} · ${song.title}`), h("span", "", `Text gespeichert: ${li ? dt(li.ts) : "–"}`), h("span", "", `Lied ${sS ? f1(sS.avg) + " ★ (" + sS.n + ")" : "–"} · Text ${sT ? f1(sT.avg) + " ★ (" + sT.n + ")" : "–"}`), h("span", "", "Ampel: " + (am ? AMP_NAME[am] : "keine")));
    box.append(key);
    const act = h("div", "rt-act");
    const bE = h("button", "chip", "Zum Bearbeiten"); bE.type = "button"; bE.onclick = () => openSongEdit(song, KV.art, KV.lang);
    act.append(bE); box.append(act);
    const body = h("div", "kv-body"); box.append(body);
    body.append(h("small", "set-hint", "Lade Fassungen …"));
    let vs;
    {
      /* alle für dieses Lied vorhandenen LRC-Dateien stehen auf beiden Seiten zur Wahl */
      const all = [["lrc", "Karaoke EN"], ["lrcde", "Karaoke DE"], ["lrcm", "Instrumental"], ["lrcs", "Zusammenkünfte"]];
      const parts = await Promise.all(all.map(([k]) => versionsOf(song.id, k).catch(() => [])));
      const list = all.filter((x, n) => parts[n].length || x[0] === kind);
      vs = []; list.forEach((x) => { const arr = parts[all.indexOf(x)]; arr.forEach((v) => vs.push({ ...v, label: (list.length > 1 ? x[1] + " · " : "") + v.label })); });
    }
    if (state.setTab !== "kihist" || !box.isConnected || KV.id !== song.id) return;
    body.replaceChildren();
    if (vs.length < 1) {
      /* kein Verlauf: den Standardtext auf beiden Seiten zeigen */
      let std = "";
      if (state.songs[state.index] && state.songs[state.index].id === song.id && (state.lyrics || []).length && kind === curLrcKind(song)) std = mkLrc(state.lyrics.map((l) => Number(l.time) || 0), state.lyrics.map((l) => l.text || ""));
      if (!std) { try { const r = await fetch(`${SYNC_BASE}/sync/${kind}-${song.id}`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) std = t; } } catch { /* egal */ } }
      if (!std) { body.append(h("small", "set-hint", "Für dieses Lied ist noch kein Liedtext vorhanden.")); return; }
      vs = [{ ts: 0, type: "server", lrc: std, label: "Standardtext" }];
      body.append(h("small", "set-hint", "Noch kein Verlauf – links und rechts steht der Standardtext. Weitere Fassungen entstehen durch „KI-Sync“ oder Speichern."));
    }
    if (!KV.l || !vs[KV.l]) { KV.l = String(0); KV.r = String(vs.length - 1); }
    if (!vs[KV.r]) KV.r = String(vs.length - 1);
    const opt = (s, val) => { vs.forEach((v, i) => { const o = h("option", "", v.label); o.value = String(i); s.append(o); }); s.value = val; };
    const sum = h("div", "kv-sum"), grid = h("div", "kv-grid"), det = h("div", "kv-det", "Zeile antippen: Sie wird in beiden Spalten umrahmt, darunter stehen die Zeiten.");
    const chk = (label, key, def, fn) => { const l = h("label", "set-row check"); const c = h("input"); c.type = "checkbox"; c.checked = lsv(key, def) === "1"; c.onchange = () => { lss(key, c.checked ? "1" : "0"); fn && fn(); }; l.append(c, h("span", "", " " + label)); return l; };
    const dsel = h("label", "set-row check"); const dc = h("input"); dc.type = "checkbox"; dc.checked = KV.diffOnly; dc.onchange = () => { KV.diffOnly = dc.checked; draw(); }; dsel.append(dc, h("span", "", " nur abweichende Zeilen zeigen"));
    const opts = h("div", "kv-opts");
    opts.append(dsel, chk("beide Spalten gemeinsam scrollen", "kvSync", "0"));
    if (window.innerWidth >= 900) opts.append(chk("breit anzeigen (großer Bildschirm)", "kvWide", "0", applyWide));
    const mkPane = (side) => { const p = h("div", "kv-pane"); const s = h("select", "rt-sel"); opt(s, KV[side]); s.onchange = () => { KV[side] = s.value; KV.sel = -1; draw(); }; p.append(h("small", "kv-side", side === "l" ? "Links" : "Rechts"), s); const ls = h("div", "kv-lines"); p.append(ls); p.ls = ls; return p; };
    const pl = mkPane("l"), pr = mkPane("r");
    let lock = false;
    [[pl, pr], [pr, pl]].forEach(([a, b]) => a.ls.addEventListener("scroll", () => { if (lsv("kvSync", "0") !== "1" || lock) return; lock = true; const m = a.ls.scrollHeight - a.ls.clientHeight, f = m > 0 ? a.ls.scrollTop / m : 0; b.ls.scrollTop = f * (b.ls.scrollHeight - b.ls.clientHeight); requestAnimationFrame(() => { lock = false; }); }));
    grid.append(pl, pr); body.append(opts, sum, det, grid);
    applyWide();
    let map = { ab: [], ba: [] }, AA = [], BB = [];
    function pick(side, i) {
      const j = side === "l" ? map.ab[i] : map.ba[i];
      KV.sel = side === "l" ? i : (j >= 0 ? j : -1); KV.selR = side === "r" ? i : j;
      [[pl, KV.sel], [pr, KV.selR]].forEach(([p, k]) => { p.ls.querySelectorAll(".kv-line.kv-sel").forEach((e) => e.classList.remove("kv-sel")); const e = p.ls.querySelector(`.kv-line[data-i="${k}"]`); if (e) { e.classList.add("kv-sel"); e.scrollIntoView({ block: "nearest" }); } });
      const a = AA[KV.sel], b = BB[KV.selR];
      if (a && b) { const d = b.t - a.t, ad = Math.abs(d); det.textContent = `„${a.x}“ · links ${tf(a.t)} · rechts ${tf(b.t)} · Unterschied ${ad < 0.005 ? "keiner" : (d > 0 ? "+" : "−") + ad.toFixed(2).replace(".", ",") + " s (rechts " + (d > 0 ? "später" : "früher") + ")"}`; }
      else if (a) det.textContent = `„${a.x}“ · links ${tf(a.t)} · rechts: kein Gegenstück`;
      else if (b) det.textContent = `„${b.x}“ · rechts ${tf(b.t)} · links: kein Gegenstück`;
    }
    function draw() {
      const A = parse(vs[KV.l].lrc), B = parse(vs[KV.r].lrc); AA = A; BB = B;
      const cnt = { d0: 0, d1: 0, d2: 0, d3: 0, un: 0 };
      const n = Math.max(A.length, B.length);
      const bi = new Array(A.length).fill(-1);
      if (A.length === B.length) A.forEach((_, i) => { bi[i] = i; });
      else { let j = 0; A.forEach((a, i) => { for (let k = j; k < B.length; k++) if (B[k].x === a.x) { bi[i] = k; j = k + 1; break; } }); }
      const ba = new Array(B.length).fill(-1); bi.forEach((k, i) => { if (k >= 0) ba[k] = i; });
      map = { ab: bi, ba };
      const clsA = A.map((a, i) => { if (bi[i] < 0) { cnt.un++; return "ai-un"; } const d = Math.abs(a.t - B[bi[i]].t); const c = d < 0.15 ? "d0" : d < 0.6 ? "d1" : d < 2 ? "d2" : "d3"; cnt[c]++; return "ai-" + c; });
      const clsB = B.map((b, k) => (ba[k] < 0 ? "ai-un" : clsA[ba[k]]));
      const badge = (a, b) => { if (!a || !b) return "ohne Gegenstück"; const d = b.t - a.t, ad = Math.abs(d); return ad < 0.15 ? "gleich" : (d > 0 ? "+" : "−") + ad.toFixed(1).replace(".", ",") + " s"; };
      const fill = (p, L, cl, side) => { p.ls.replaceChildren(); L.forEach((l, i) => { if (KV.diffOnly && cl[i] === "ai-d0") return; const r = h("div", "kv-line lyric-line " + cl[i]); r.dataset.i = String(i); const o = side === "l" ? B[bi[i]] : A[ba[i]]; r.append(h("span", "kv-t", tf(l.t)), h("span", "kv-x", l.x), h("span", "kv-d", side === "l" ? badge(l, o) : badge(o, l))); r.onclick = () => pick(side, i); p.ls.append(r); }); };
      fill(pl, A, clsA, "l"); fill(pr, B, clsB, "r");
      const tot = n || 1, pc = (x) => Math.round((100 * x) / tot) + " %";
      sum.textContent = `${A.length} / ${B.length} Zeilen · gleich ${cnt.d0} (${pc(cnt.d0)}) · klein ${cnt.d1} · mittel ${cnt.d2} · groß ${cnt.d3} · ohne Gegenstück ${cnt.un}`;
      if (KV.sel >= 0 && A[KV.sel]) pick("l", KV.sel);
    }
    draw();
  }
  function applyWide() { const f = $("codeForm"); if (f) f.classList.toggle("kv-wide", state.setTab === "kihist" && window.innerWidth >= 900 && lsv("kvWide", "0") === "1"); }


  /* ---------- Diagramme: Stand der LRC-Dateien auf einen Blick ---------- */
  const STAT_KINDS = [["karaoke", "en", "Karaoke EN"], ["karaoke", "de", "Karaoke DE"], ["meeting", "en", "Instrumental"], ["sung", "en", "Zusammenkünfte"]];
  const COL = { green: "#2e9e5b", orange: "#e8912d", red: "#d64545", none: "#7a8190", ok: "#3b82c4", miss: "#7a8190", ed: "#8e6cd1" };
  function svgEl(t, a, txt) { const e = document.createElementNS("http://www.w3.org/2000/svg", t); Object.entries(a || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (txt != null) e.textContent = txt; return e; }
  function donut(parts, size, title) {
    const tot = parts.reduce((a, p) => a + p.v, 0) || 1, r = size / 2 - 6, c = size / 2, w = size * 0.2;
    const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size, role: "img", "aria-label": title });
    let ang = -Math.PI / 2;
    parts.forEach((p) => {
      if (p.v <= 0) return;
      const a2 = ang + (p.v / tot) * Math.PI * 2, big = a2 - ang > Math.PI ? 1 : 0;
      if (p.v === tot) { svg.append(svgEl("circle", { cx: c, cy: c, r: r - w / 2, fill: "none", stroke: p.c, "stroke-width": w })); }
      else {
        const x1 = c + r * Math.cos(ang), y1 = c + r * Math.sin(ang), x2 = c + r * Math.cos(a2), y2 = c + r * Math.sin(a2), ri = r - w, x3 = c + ri * Math.cos(a2), y3 = c + ri * Math.sin(a2), x4 = c + ri * Math.cos(ang), y4 = c + ri * Math.sin(ang);
        svg.append(svgEl("path", { d: `M${x1} ${y1} A${r} ${r} 0 ${big} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${big} 0 ${x4} ${y4}Z`, fill: p.c }));
      }
      ang = a2;
    });
    svg.append(svgEl("text", { x: c, y: c - 2, "text-anchor": "middle", "font-size": size * 0.2, "font-weight": 800, fill: "currentColor" }, String(tot === 1 && !parts.some((p) => p.v) ? 0 : tot)));
    svg.append(svgEl("text", { x: c, y: c + size * 0.12, "text-anchor": "middle", "font-size": size * 0.08, fill: "currentColor", opacity: .7 }, "Lieder"));
    return svg;
  }
  const legend = (parts, tot) => { const l = h("div", "st-leg"); parts.forEach((p) => { const i = h("span", "st-l"); const d = h("i"); d.style.background = p.c; i.append(d, document.createTextNode(` ${p.n}: ${p.v}${tot ? " (" + Math.round((p.v / tot) * 100) + " %)" : ""}`)); l.append(i); }); return l; };
  async function mountStat() {
    const box = $("statBox"); if (!box) return;
    box.replaceChildren(h("p", "ap-title", "Diagramme: Stand der Karaoke-Texte"));
    box.append(h("small", "set-hint", "Auf einen Blick: wie viele Texte vorhanden sind, wie viele bearbeitet wurden und wie die Ampel steht (grün passt · orange fast fertig · rot muss überarbeitet werden)."));
    await loadIdx().catch(() => {});
    const songs = state.songs.filter((s) => !s.extra);
    const rows = STAT_KINDS.map(([art, lang, name]) => {
      let have = 0, edited = 0, g = 0, o = 0, r = 0, n = 0, rated = 0, sum = 0;
      songs.forEach((s) => {
        const hv = hasText(s, art, lang); if (hv) have++;
        if (lrcInfo(s.id, art, lang)) edited++;
        const a = ampel(s.id, art, lang); if (a === "green") g++; else if (a === "orange") o++; else if (a === "red") r++; else if (hv) n++;
        const st = stat(s.id, "text", art, lang); if (st) { rated++; sum += st.avg; }
      });
      return { name, total: songs.length, have, miss: songs.length - have, edited, todo: Math.max(0, have - edited), g, o, r, n, rated, avg: rated ? sum / rated : 0 };
    });
    const grid = h("div", "st-grid");
    rows.forEach((x) => {
      const card = h("section", "st-card"); card.append(h("h4", "", x.name));
      const ps = [{ n: "bearbeitet", v: x.edited, c: COL.ed }, { n: "vorhanden, noch nicht bearbeitet", v: x.todo, c: COL.ok }, { n: "fehlt", v: x.miss, c: COL.miss }];
      const pa = [{ n: "grün", v: x.g, c: COL.green }, { n: "orange", v: x.o, c: COL.orange }, { n: "rot", v: x.r, c: COL.red }, { n: "ohne Ampel", v: x.n, c: COL.none }];
      const pr = h("div", "st-pies");
      const p1 = h("div", "st-pie"); p1.append(donut(ps, 120, x.name + ": Stand"), h("small", "", "Stand"), legend(ps, x.total));
      const p2 = h("div", "st-pie"); p2.append(donut(pa, 120, x.name + ": Ampel"), h("small", "", "Ampel"), legend(pa, x.have));
      pr.append(p1, p2); card.append(pr);
      if (x.rated) card.append(h("small", "set-hint", `Bewertung der Texte: ${x.avg.toFixed(1).replace(".", ",")} ★ im Schnitt (${x.rated} Lieder bewertet)`));
      grid.append(card);
    });
    box.append(grid);
    /* Balkendiagramm: alle vier Arten im Vergleich */
    const bars = h("section", "st-card st-wide"); bars.append(h("h4", "", "Vergleich aller Arten"));
    rows.forEach((x) => {
      const line = h("div", "st-bar"); line.append(h("span", "st-bn", x.name));
      const tr = h("div", "st-track");
      [[x.g, COL.green, "grün"], [x.o, COL.orange, "orange"], [x.r, COL.red, "rot"], [Math.max(0, x.have - x.g - x.o - x.r), COL.none, "ohne Ampel"], [x.miss, "transparent", "fehlt"]].forEach(([v, c, n]) => { if (!v) return; const seg = h("i"); seg.style.width = (v / x.total) * 100 + "%"; seg.style.background = c; seg.title = `${n}: ${v}`; if (c === "transparent") seg.style.boxShadow = "inset 0 0 0 1px var(--line, #888)"; tr.append(seg); });
      line.append(tr, h("span", "st-bv", `${x.have}/${x.total}`)); bars.append(line);
    });
    bars.append(legend([{ n: "grün", v: 0, c: COL.green }, { n: "orange", v: 0, c: COL.orange }, { n: "rot", v: 0, c: COL.red }, { n: "ohne Ampel", v: 0, c: COL.none }, { n: "fehlt", v: 0, c: "transparent" }].map((p) => ({ ...p })), 0));
    box.append(bars);
    const sum = h("table", "st-tab"); sum.innerHTML = "<thead><tr><th>Art</th><th>vorhanden</th><th>bearbeitet</th><th>grün</th><th>orange</th><th>rot</th></tr></thead>";
    const tb = document.createElement("tbody"); rows.forEach((x) => { const tr = document.createElement("tr"); [x.name, `${x.have}/${x.total}`, x.edited, x.g, x.o, x.r].forEach((v) => { const td = document.createElement("td"); td.textContent = v; tr.append(td); }); tb.append(tr); }); sum.append(tb); box.append(sum);
  }

  /* ---------- Reiter-Gruppen ---------- */
  const GRP = {
    daten: ["Sichern", [["abgleich", "Favoriten-Abgleich"], ["sichern", "Daten"]]],
    sync: ["Synchronisieren", [["fehlend", "Fehlende Lieder"], ["ludwt", "Wochenlieder LuD+WT"]]],
    bewert: ["Anpassungen", [["bew", "Bewertungen"], ["kihist", "KI-Verlauf"], ["stat", "Diagramme"]]]
  };
  const grpOf = (t) => Object.keys(GRP).find((g) => GRP[g][1].some((x) => x[0] === t)) || "";
  const lastSub = {};
  function paintGrp(tab) {
    const g = grpOf(tab); if (g) lastSub[g] = tab;
    document.querySelectorAll("#setTabs [data-grp]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.grp === g)));
    const bar = $("grpTabs"); if (!bar) return;
    bar.replaceChildren();
    if (!g) { bar.hidden = true; return; }
    bar.hidden = false;
    GRP[g][1].forEach(([k, n]) => { const b = h("button", "seg-btn", n); b.type = "button"; b.dataset.gsub = k; b.setAttribute("aria-pressed", String(k === tab)); b.onclick = () => showSetTab(k); bar.append(b); });
  }
  function wireGrp() {
    document.querySelectorAll("#setTabs [data-grp]").forEach((b) => { if (b._v125) return; b._v125 = true; b.addEventListener("click", () => showSetTab(lastSub[b.dataset.grp] || GRP[b.dataset.grp][1][0][0])); });
    const o = window.showSetTab;
    if (typeof o === "function" && !o._v125) {
      const w = function (t) { o(t); try { applyWide(); paintGrp(t); if (t === "bew") mountBew(); else if (t === "kihist") mountKih(); else if (t === "stat") mountStat(); } catch (e) { console.error(e); } };
      w._v125 = true; window.showSetTab = w;
    }
  }
  wireGrp();

  /* ---------- Bearbeiten-Modus: Leiste, Rückkehr, Zeile ganz oben ---------- */
  function editBar() {
    const t = $("aiTools"); if (!t || t.querySelector(".v125")) return;
    const sg = cur(); if (!sg) return;
    const mk = (txt, title, fn) => { const b = h("button", "chip v125", txt); b.type = "button"; b.title = title; b.onclick = fn; t.append(b); };
    mk("KI-Verlauf", "Fassungen dieses Liedes vergleichen", () => { const art = curArt() === "video" ? "meeting" : curArt(); KV.id = sg.id; KV.art = art; KV.lang = curLang(); KV.l = KV.r = ""; state.returnEdit = true; if (typeof syncFavorites === "function") syncFavorites("kihist"); });
    mk("Bewerten", "Karaoke-Text und Lied bewerten", () => { uiDialog({ eyebrow: `Lied ${sg.id}`, title: "Bewerten", lines: [sg.title, { node: ratingNode(sg) }], buttons: [{ value: null, kind: "cancel", label: "Schließen" }], cancelValue: null }).then(() => loadIdx()); });
    if (state.returnTab) mk("← Bewertungen", "Zurück zur Liste der Bewertungen", () => { const r = state.returnTab; state.returnTab = null; if (typeof syncFavorites === "function") syncFavorites(r); });
  }
  new MutationObserver(() => { if (document.body.classList.contains("edit-mode")) editBar(); }).observe(document.body, { childList: true, subtree: true });
  let wasEdit = false;
  new MutationObserver(() => {
    const on = document.body.classList.contains("edit-mode");
    if (on && !wasEdit) setTimeout(() => { const l = $("lyrics"); if (l) { l.style.scrollBehavior = "auto"; l.scrollTop = 0; setTimeout(() => { l.style.scrollBehavior = ""; }, 50); } }, 350);
    wasEdit = on;
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("DOMContentLoaded", () => { wireGrp(); setTimeout(loadIdx, 1500); });
  if (document.readyState !== "loading") setTimeout(loadIdx, 1500);
  window.RATING = { loadIdx, mountBew, mountKih, paintAmpel, hadd, hget, mkLrc, curArt, curLang, AMP_NAME, getStatus: (id, art, lang) => ampel(id, art, lang),
    setStatus: async (id, art, lang, v) => { const res = await post("/api/rate", { id, op: "status", art, lang, value: v }); (IDX[id] = IDX[id] || {}).status = res.status; try { localStorage.setItem("rateIdx", JSON.stringify(IDX)); } catch { /* egal */ } paintAmpel(); return res; } };
})();
