/* v132: Synchronisieren › „Zeiten übertragen“: Timecodes des englischen Karaoke-Textes auf den deutschen übertragen (und umgekehrt) */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const DIR = { "en-de": { from: "lrc", to: "lrcde", fl: "Englisch", tl: "Deutsch" }, "de-en": { from: "lrcde", to: "lrc", fl: "Deutsch", tl: "Englisch" } };
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
      const det = h("details", "zt-det"); det.open = true; det.append(h("summary", "", "Vorschau (Zeit alt → neu)"));
      const tab = h("table", "st-tab"); const tb = document.createElement("tbody");
      p.rows.forEach((r) => { const tr = document.createElement("tr"); const same = Math.abs(r.time - r.old) <= 0.05;
        [`${fmt(r.old)} → ${fmt(r.time)}`, r.text].forEach((v, i) => { const td = document.createElement("td"); td.textContent = v; td.style.textAlign = "left"; if (i === 0 && !same) td.style.color = "var(--accent)"; tr.append(td); }); tb.append(tr); });
      tab.append(tb); det.append(tab); out.append(det);
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
    all.append(h("small", "set-hint", `Sucht alle Lieder, bei denen beide Texte vorhanden sind, die Zeilenzahl gleich ist und die Zeiten abweichen (${d.fl} → ${d.tl}).`));
    const chk = h("button", "chip", "Alle Lieder prüfen"); chk.type = "button"; const res = h("div", "zt-res");
    chk.onclick = async () => {
      chk.disabled = true; res.replaceChildren(h("small", "set-hint", "Prüfe …"));
      const cand = [];
      for (let i = 0; i < songs.length; i++) {
        res.firstChild.textContent = `Prüfe … ${i + 1} / ${songs.length}`;
        const q = await plan(songs[i].id, d); if (q.err || !q.diff) continue; cand.push({ id: songs[i].id, title: songs[i].title, q });
      }
      chk.disabled = false; res.replaceChildren();
      if (!cand.length) { res.append(h("small", "set-hint", "Nichts zu übertragen: überall gleich oder nicht möglich (Text fehlt).")); return; }
      cand.sort((x, y) => (y.q.same - x.q.same) || (y.q.pct - x.q.pct));
      res.append(h("p", "", `${cand.length} Lieder haben abweichende Zeiten (${d.fl} → ${d.tl}). Wähle aus, welche übertragen werden sollen.`));
      const run = h("button", "chip danger", "Ausgewählte übertragen"); run.type = "button";
      const tools = h("div", "zt-tools");
      const list = h("div", "zt-list"); const cbs = [];
      const upd = () => { const n = cbs.filter((c) => c.checked).length; run.textContent = `${n} ausgewählte Lieder übertragen`; run.disabled = !n; };
      const setAll = (f) => { cbs.forEach((c, i) => { c.checked = f(cand[i]); }); upd(); };
      [["Alle auswählen", () => true], ["Keine", () => false], ["Nur gleiche Zeilenzahl", (c) => c.q.same]].forEach(([n, f]) => { const b2 = h("button", "chip", n); b2.type = "button"; b2.onclick = () => setAll(f); tools.append(b2); });
      cand.forEach((c) => {
        const row = h("label", "zt-row" + (c.q.same ? "" : " warn")); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = c.q.same; cb.onchange = upd; cbs.push(cb);
        const t = h("span", "zt-t"); t.append(h("b", "", `${c.id} `), document.createTextNode(c.title));
        const info = h("small", "", c.q.same ? `${c.q.S.length} Zeilen` : `Zeilenzahl ${d.fl} ${c.q.S.length} ≠ ${d.tl} ${c.q.T.length}`);
        const bar = h("span", "zt-bar"); const fill = h("i"); fill.style.width = Math.max(4, c.q.pct) + "%"; bar.append(fill);
        const pc = h("span", "zt-pc", `${c.q.pct} % · Ø ${c.q.avg.toFixed(1).replace(".", ",")} s · max ${c.q.max.toFixed(1).replace(".", ",")} s`);
        const mid = h("span", "zt-m"); mid.append(t, info); row.append(cb, mid, bar, pc); list.append(row);
      });
      upd();
      run.onclick = async () => {
        const todo = cand.filter((_, i) => cbs[i].checked); if (!todo.length) return;
        const warn = todo.filter((t) => !t.q.same).length;
        if (!(await uiConfirm({ eyebrow: "Zeiten übertragen", title: `${todo.length} Lieder übertragen?`, lines: [`In ${todo.length} ${d.tl}en Texten werden die Zeiten durch die ${d.fl}en ersetzt und auf dem Server gespeichert.`, warn ? `${warn} davon haben eine andere Zeilenzahl – bitte danach prüfen.` : "", "Die bisherigen Fassungen bleiben im KI-Verlauf."].filter(Boolean), ok: "Übertragen", danger: true }))) return;
        const keyRef = { k: "" }; let ok = 0, bad = ""; run.disabled = true;
        for (const t of todo) { run.textContent = `Speichere ${ok + 1} / ${todo.length} …`; const r = await saveOne(t.id, d, t.q, keyRef); if (r === "ok") ok++; else { bad = r; break; } }
        run.textContent = `${ok} von ${todo.length} gespeichert`; run.disabled = false; if (bad && bad !== "abbruch") await uiAlert("Speichern", bad);
      };
      res.append(tools, list, run);
    };
    all.append(chk, res); box.append(all);
  }
  window.V132 = { mount, parse, transfer };
})();
