/* v132: Synchronisieren › „Zeiten übertragen“: Timecodes des englischen Karaoke-Textes auf den deutschen übertragen (und umgekehrt) */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const DIR = { "en-de": { from: "lrc", to: "lrcde", fl: "Englisch", tl: "Deutsch" }, "de-en": { from: "lrcde", to: "lrc", fl: "Deutsch", tl: "Englisch" } };
  const STALE = 3;   /* Tage, ab denen eine gespeicherte Prüfung als alt gilt */
  let dir = "en-de", sel = "";
  const parse = (t) => String(t || "").split(/\r?\n/).map((l) => { const m = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/.exec(l.trim()); return m ? { time: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() } : null; }).filter(Boolean);
  const mk = (rows) => rows.map((r) => { const m = Math.floor(r.time / 60), s = (r.time - m * 60).toFixed(2).padStart(5, "0"); return `[${String(m).padStart(2, "0")}:${s}]${r.text}`; }).join("\n");
  const fmt = (t) => { const m = Math.floor(t / 60); return `${m}:${(t - m * 60).toFixed(2).padStart(5, "0")}`; };
  async function current(kind, id) {
    try { const r = await fetch(`${SYNC_BASE}/sync/${kind}-${id}`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) return t; } } catch { /* egal */ }
    try {
      const sg = state.songs.find((x) => x.id === id), n = sg ? String(sg.number) : "", m = state.media || {}, md = m.de || {};
      const key = kind === "lrc" ? ((m.karaoke || {}).lrc || {})[n] : ((md.karaoke || {}).lrc || {})[n];
      if (key) { const r = await fetch(mediaUrl(key), { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) return t; } }
      if (kind === "lrc" && sg) { const r = await fetch(sg.lyrics || `lyrics/sjj_E_${String(sg.number).padStart(2, "0")}.lrc`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[")) return t; } }
    } catch { /* egal */ }
    return null;
  }
  /* Zeit der Quellzeile i auf Zielzeile i; fehlen Quellzeilen, bekommen die letzten Zeilen +4 s Abstand */
  function transfer(src, tgt) {
    return tgt.map((x, i) => ({ text: x.text, time: i < src.length ? src[i].time : (src.length ? src[src.length - 1].time : 0) + (i - src.length + 1) * 4, old: x.time }));
  }
  async function plan(id, d) {
    const [a, b] = await Promise.all([current(d.from, id), current(d.to, id)]);
    if (!a) return { err: `Für ${d.fl} gibt es bei diesem Lied noch keinen Text mit Zeiten.` };
    if (!b) return { err: `Für ${d.tl} gibt es bei diesem Lied noch keinen Text. Zuerst den ${d.tl}en Text anlegen.` };
    const S = parse(a), T = parse(b);
    if (!S.length || !T.length) return { err: "Ein Text konnte nicht gelesen werden." };
    const rows = transfer(S, T), same = S.length === T.length;
    const dev = rows.map((r) => Math.abs(r.time - r.old)), diff = dev.filter((x) => x > 0.05).length;
    return { S, T, rows, same, diff, tgtRaw: b, pct: Math.round((diff / rows.length) * 100), avg: dev.reduce((a, x) => a + x, 0) / dev.length, max: Math.max(...dev) };
  }
  async function putLrc(kind, id, lrc, keyRef) {
    for (let tries = 0; tries < 3; tries++) {
      if (!keyRef.k) { try { keyRef.k = sessionStorage.getItem("aiKey") || ""; } catch { /* egal */ } }
      if (!keyRef.k) { keyRef.k = window.askEditPass ? await window.askEditPass("Zeiten übertragen") : await uiPrompt({ eyebrow: "Speichern", title: "Schreib-Schlüssel", type: "password", placeholder: "WRITE_KEY", ok: "Weiter" }); if (!keyRef.k) return "abbruch"; }
      const res = await fetch(`${SYNC_BASE}/sync/${kind}-${id}`, { method: "PUT", headers: { "content-type": "text/plain; charset=utf-8", "x-write-key": keyRef.k }, body: lrc });
      if (res.status === 401) { keyRef.k = ""; try { sessionStorage.removeItem("aiKey"); } catch { /* egal */ } continue; }
      if (!res.ok) return "Server " + res.status;
      try { sessionStorage.setItem("aiKey", keyRef.k); } catch { /* egal */ }
      return "ok";
    }
    return "Schreib-Schlüssel abgelehnt";
  }
  async function saveOne(id, d, p, keyRef) {
    const R = window.RATING;
    try { if (R && R.hadd && p.tgtRaw) R.hadd(d.to, id, { type: "orig", lrc: p.tgtRaw.trim() }); } catch { /* egal */ }
    const lrc = mk(p.rows);
    const r = await putLrc(d.to, id, lrc, keyRef);
    if (r !== "ok") return r;
    try { localStorage.setItem(`${d.to}-${id}`, JSON.stringify(p.rows.map((x) => ({ time: x.time, text: x.text })))); } catch { /* egal */ }
    document.dispatchEvent(new CustomEvent("lrc-saved", { detail: { kind: d.to, id, lrc, key: keyRef.k } }));
    return "ok";
  }
  const lg = (k) => (k === "lrcde" ? "Karaoke DE" : "Karaoke EN");
  function openEdit(id, d) { const sg = state.songs.find((x) => x.id === id); if (sg && window.RATING) RATING.openSongEdit(sg, "karaoke", d.to === "lrcde" ? "de" : "en"); }
  function compare(id, d) { if (window.RATING) RATING.kihCompare(id, lg(d.to) + " · Aktuell", lg(d.from) + " · Aktuell"); }
  async function mount() {
    const box = $("zeitBox"); if (!box) return;
    box.replaceChildren(h("p", "ap-title", "Zeiten übertragen: Englisch ⇄ Deutsch"));
    box.append(h("small", "set-hint", "Läuft der englische Karaoke-Song, kann man Deutsch mitsingen – die Zeilen beginnen gleichzeitig. Wenn du die Zeiten im englischen Text angepasst hast, überträgst du sie hier Zeile für Zeile auf den deutschen Text (oder umgekehrt). Die bisherige Fassung bleibt im KI-Verlauf erhalten."));
    if (!state.media && typeof loadMedia === "function") { try { await loadMedia(true); } catch { /* egal */ } }
    const songs = state.songs.filter((s) => !s.extra);
    if (!sel || !songs.some((s) => s.id === sel)) { const c = state.songs[state.index]; sel = c && !c.extra ? c.id : (songs[0] || {}).id; }
    const top = h("div", "rt-filters");
    const num = h("select", "rt-sel"); songs.forEach((s) => { const o = h("option", "", `${s.id} ${s.title}`); o.value = s.id; num.append(o); }); num.value = sel;
    const seg = h("div", "seg"); seg.setAttribute("role", "group");
    Object.entries(DIR).forEach(([k, d]) => { const b = h("button", "seg-btn", `${d.fl} → ${d.tl}`); b.type = "button"; b.setAttribute("aria-pressed", String(dir === k)); b.onclick = () => { dir = k; mount(); }; seg.append(b); });
    num.onchange = () => { sel = num.value; mount(); };
    top.append(num); box.append(top, seg);
    const out = h("div", "zt-out"); box.append(out);
    out.append(h("small", "set-hint", "Lade Texte …"));
    const d = DIR[dir], p = await plan(sel, d);
    out.replaceChildren();
    if (p.err) out.append(h("p", "set-hint bad", p.err)); else {
      out.append(h("p", "", `${d.fl}: ${p.S.length} Zeilen · ${d.tl}: ${p.T.length} Zeilen`));
      if (!p.same) out.append(h("p", "set-hint bad", "Die Zeilenzahl ist unterschiedlich. Die Zeiten werden der Reihe nach übertragen; überzählige Zeilen am Ende bekommen je 4 Sekunden Abstand. Bitte danach prüfen."));
      else out.append(h("p", "set-hint", p.diff ? `${p.diff} von ${p.T.length} Zeilen bekommen eine neue Zeit.` : "Die Zeiten sind schon gleich – nichts zu übertragen."));
      const det = h("details", "zt-det"); det.open = true; det.append(h("summary", "", `Vorschau: ${d.tl} und ${d.fl} Zeile für Zeile`));
      const tab = h("table", "st-tab zt-tab"); tab.innerHTML = `<thead><tr><th>Nr</th><th>Zeit alt → neu</th><th>${d.tl}</th><th>${d.fl}</th></tr></thead>`; const tb = document.createElement("tbody");
      p.rows.forEach((r, i) => { const tr = document.createElement("tr"); const same = Math.abs(r.time - r.old) <= 0.05;
        [String(i + 1), `${fmt(r.old)} → ${fmt(r.time)}`, r.text, (p.S[i] || {}).text || "–"].forEach((v, k) => { const td = document.createElement("td"); td.textContent = v; td.style.textAlign = "left"; if (k === 1 && !same) td.style.color = "var(--accent)"; tr.append(td); }); tb.append(tr); });
      tab.append(tb); det.append(tab); out.append(det);
      const edit = h("button", "chip", `${d.tl}en Text im Bearbeiten-Fenster öffnen`); edit.type = "button"; edit.onclick = () => openEdit(sel, d); out.append(edit);
      const cmp = h("button", "chip", "Vergleichsansicht (KI-Verlauf)"); cmp.type = "button"; cmp.onclick = () => compare(sel, d); out.append(cmp);
      const go = h("button", "chip", `Zeiten übertragen und ${d.tl}en Text speichern`); go.type = "button"; go.disabled = !p.diff;
      go.onclick = async () => {
        if (!(await uiConfirm({ eyebrow: `Lied ${sel}`, title: "Zeiten übertragen?", lines: [`Die Zeiten des ${d.fl}en Textes werden in den ${d.tl}en Text übernommen und auf dem Server gespeichert.`, "Die bisherige Fassung bleibt im KI-Verlauf."], ok: "Übertragen" }))) return;
        const r = await saveOne(sel, d, p, { k: "" });
        if (r === "ok") { showToast && showToast("Zeiten übertragen und gespeichert."); mount(); } else if (r !== "abbruch") await uiAlert("Speichern", r);
      };
      out.append(go);
    }
    /* alle Lieder auf einmal */
    const all = h("div", "zt-all"); all.append(h("p", "ap-title", "Alle Lieder prüfen"));
    all.append(h("small", "set-hint", `Sucht alle Lieder, bei denen beide Texte vorhanden sind und die Zeiten abweichen (${d.fl} → ${d.tl}). Die Liste wird mit Datum gespeichert und bleibt nach dem Wechsel des Reiters erhalten.`));
    const chk = h("button", "chip", "Alle Lieder neu prüfen"); chk.type = "button"; const res = h("div", "zt-res");
    const store = () => { try { return JSON.parse(localStorage.getItem("zeitScans") || "{}"); } catch { return {}; } };
    const put = (o) => { try { localStorage.setItem("zeitScans", JSON.stringify(o)); } catch { /* egal */ } };
    const when = (ts) => new Date(ts).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" });
    const scans = () => store()[dir] || [];
    const saveScan = (sc, i) => { const o = store(); const l = o[dir] || []; l[i] = sc; o[dir] = l; put(o); };
    let showIdx = 0;
    function renderScan() {
      res.replaceChildren(); const list0 = scans(); const sc = list0[showIdx];
      if (!sc) { res.append(h("small", "set-hint", "Noch keine gespeicherte Prüfung. „Alle Lieder neu prüfen“ startet sie.")); return; }
      const days = (Date.now() - sc.ts) / 86400000;
      const bar0 = h("div", "zt-tools");
      if (list0.length > 1) { const sl = h("select", "rt-sel"); list0.forEach((x, i) => { const o = h("option", "", `${when(x.ts)} · ${x.items.length} Lieder`); o.value = String(i); sl.append(o); }); sl.value = String(showIdx); sl.onchange = () => { showIdx = Number(sl.value); renderScan(); }; bar0.append(sl); }
      const del = h("button", "chip", "Diese Prüfung löschen"); del.type = "button"; del.onclick = () => { const o = store(); (o[dir] = o[dir] || []).splice(showIdx, 1); put(o); showIdx = 0; renderScan(); }; bar0.append(del);
      res.append(h("p", "", `Geprüft am ${when(sc.ts)} · ${sc.items.length} Lieder mit abweichenden Zeiten (${d.fl} → ${d.tl}).`), bar0);
      if (days >= STALE) res.append(h("p", "set-hint bad", `Achtung: Diese Prüfung ist ${days < 2 ? "über einen Tag" : Math.floor(days) + " Tage"} alt. Die Texte können sich inzwischen geändert haben – bitte neu prüfen. Beim Übertragen wird jedes Lied vorher noch einmal frisch geprüft.`));
      if (!sc.items.length) { res.append(h("small", "set-hint", "Nichts zu übertragen: überall gleich oder nicht möglich (Text fehlt).")); return; }
      const run = h("button", "chip danger", "Ausgewählte übertragen"); run.type = "button";
      const tools = h("div", "zt-tools"), list = h("div", "zt-list"), cbs = [];
      const upd = () => { const n = cbs.filter((c, i) => c.checked && !sc.items[i].done).length; run.textContent = `${n} ausgewählte Lieder übertragen`; run.disabled = !n; sc.items.forEach((x, i) => { x.sel = cbs[i].checked; }); saveScan(sc, showIdx); };
      const setAll = (f) => { cbs.forEach((c, i) => { if (!sc.items[i].done) c.checked = f(sc.items[i]); }); upd(); };
      [["Alle auswählen", () => true], ["Keine", () => false], ["Nur gleiche Zeilenzahl", (c) => c.same]].forEach(([n, f]) => { const b2 = h("button", "chip", n); b2.type = "button"; b2.onclick = () => setAll(f); tools.append(b2); });
      const head = h("div", "zt-row zt-head"); head.append(h("span", ""), h("span", "", "Lied (antippen = bearbeiten)"), h("span", "zt-n", `Zeilen ${d.fl}`), h("span", "zt-n", `Zeilen ${d.tl}`), h("span", "zt-n", "Unterschied (antippen = vergleichen)")); list.append(head);
      sc.items.forEach((c) => {
        const row = h("div", "zt-row" + (c.same ? "" : " warn") + (c.done ? " done" : "")); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !c.done && (c.sel != null ? c.sel : c.same); cb.disabled = !!c.done; cb.onchange = upd; cbs.push(cb); cb.setAttribute("aria-label", `Lied ${c.id} übertragen`);
        const t = h("button", "zt-t"); t.type = "button"; t.title = `Lied ${c.id} im Bearbeiten-Fenster öffnen`; t.append(h("b", "", `${c.id} `), document.createTextNode(c.title + (c.done ? " ✓ übertragen" : ""))); t.onclick = () => openEdit(c.id, d);
        const n1 = h("span", "zt-n", String(c.s)), n2 = h("span", "zt-n" + (c.same ? "" : " bad"), String(c.t));
        const bar = h("button", "zt-bar"); bar.type = "button"; bar.title = `Vergleichsansicht öffnen (Prüfung vom ${when(sc.ts)})`; const fill = h("i"); fill.style.width = Math.max(4, c.pct) + "%"; bar.append(fill);
        bar.onclick = () => { try { showToast(`Vergleich mit den aktuellen Texten · Liste vom ${when(sc.ts)}`); } catch { /* egal */ } compare(c.id, d); };
        const pc = h("span", "zt-pc", `${c.pct} % der Zeilen · Ø ${String(c.avg.toFixed(1)).replace(".", ",")} s · max ${String(c.max.toFixed(1)).replace(".", ",")} s`);
        row.append(cb, t, n1, n2, bar, pc); list.append(row);
      });
      upd();
      run.onclick = async () => {
        const todo = sc.items.filter((x, i) => cbs[i].checked && !x.done); if (!todo.length) return;
        const warn = todo.filter((t) => !t.same).length;
        if (!(await uiConfirm({ eyebrow: "Zeiten übertragen", title: `${todo.length} Lieder übertragen?`, lines: [`In ${todo.length} ${d.tl}en Texten werden die Zeiten durch die ${d.fl}en ersetzt und auf dem Server gespeichert.`, days >= STALE ? "Die Liste ist alt – jedes Lied wird vorher frisch geprüft." : "", warn ? `${warn} davon haben eine andere Zeilenzahl – bitte danach prüfen.` : "", "Die bisherigen Fassungen bleiben im KI-Verlauf."].filter(Boolean), ok: "Übertragen", danger: true }))) return;
        const keyRef = { k: "" }; let ok = 0, bad = ""; run.disabled = true;
        for (let i = 0; i < todo.length; i++) {
          const t = todo[i]; run.textContent = `Speichere ${i + 1} / ${todo.length} …`;
          const fr = await plan(t.id, d);
          if (fr.err || !fr.diff) { t.done = true; continue; }
          const r = await saveOne(t.id, d, fr, keyRef); if (r === "ok") { t.done = true; ok++; } else { bad = r; break; }
        }
        saveScan(sc, showIdx); renderScan(); if (bad && bad !== "abbruch") await uiAlert("Speichern", bad); else try { showToast(`${ok} Lieder gespeichert`); } catch { /* egal */ }
      };
      res.append(tools, list, run);
    }
    chk.onclick = async () => {
      chk.disabled = true; res.replaceChildren(h("small", "set-hint", "Prüfe …"));
      const items = [];
      for (let i = 0; i < songs.length; i++) {
        res.firstChild.textContent = `Prüfe … ${i + 1} / ${songs.length}`;
        const q = await plan(songs[i].id, d); if (q.err || !q.diff) continue;
        items.push({ id: songs[i].id, title: songs[i].title, s: q.S.length, t: q.T.length, same: q.same, pct: q.pct, avg: q.avg, max: q.max, sel: q.same });
      }
      items.sort((x, y) => (y.same - x.same) || (y.pct - x.pct));
      const o = store(); const l = o[dir] || []; l.unshift({ ts: Date.now(), items }); o[dir] = l.slice(0, 5); put(o);
      chk.disabled = false; showIdx = 0; renderScan();
    };
    renderScan();
    all.append(chk, res); box.append(all);
  }
  window.V132 = { mount, parse, transfer };
})();
