/* „Besondere Lieder“: eigener Liederbestand (Worker carag-backblaze / Backblaze B2), getrennt von Karaoke, Zusammenkünfte, Instrumental und Video.
   Umschalter über der Liederliste; alle Ansichten der App arbeiten danach mit diesem Bestand. Reiter „Besondere Lieder“ (Synchronisieren). */
(function () {
  "use strict";
  const DEF_BASE = "https://carag-backblaze.carag.workers.dev";
  const DEF_ORA = "https://carag-oracle.carag.workers.dev";
  const base = () => String(window.BES_BASE || lsv("besBase", DEF_BASE) || DEF_BASE).replace(/\/+$/, "");   /* Backblaze: Englisch + Titelliste */
  const oraBase = () => String(window.BES_ORACLE || lsv("besOra", DEF_ORA) || DEF_ORA).replace(/\/+$/, "");  /* Oracle: Deutsch */
  const baseFor = (key) => (/^bes-Lieder-de-/.test(key) ? oraBase() : base());
  const urlFor = (key) => `${baseFor(key)}/media/${String(key).split("/").map(encodeURIComponent).join("/")}`;
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
      if (!m.songs.length) throw new Error("noch keine Titelliste – im Reiter „Besondere Lieder“ abgleichen und Dateien laden");
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

  /* ---------- Reiter „Besondere Lieder“ (gleiche Übersicht wie „Fehlende Lieder“) ---------- */
  const KINDS = [["en", "mp3", "Englisch MP3"], ["en", "mp4", "Englisch Video"], ["de", "mp3", "Deutsch MP3"], ["de", "mp4", "Deutsch Video"]];
  const FOLDER = (l, f) => `bes-Lieder-${l}-${f}`;
  const LIMIT = 10 * 1024 ** 3;
  const fmtSize = (b) => b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : b >= 1024 ** 2 ? `${Math.round(b / 1024 ** 2)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const opt = (k, d) => lsv(k, d ? "1" : "0") === "1";
  const kid = (l, f) => `${l}-${f}`;
  let P = null;                 /* Abgleich: {stand, items:[{lang,fmt,track,title,url,size,key}], haveB:[{key,size}], haveO:[{key,size}]} */
  try { P = JSON.parse(localStorage.getItem("besPlan") || "null"); } catch { P = null; }
  let logLines = [];
  const savePlan = () => { try { localStorage.setItem("besPlan", JSON.stringify(P)); } catch { /* zu groß: egal */ } };

  async function jget(url, init, tries) {
    let last;
    for (let i = 0; i < (tries || 2); i++) {
      try {
        const res = await fetch(url, init);
        let j = null; try { j = await res.json(); } catch { /* egal */ }
        if (res.status === 401) { const e = new Error("Passwort abgelehnt"); e.fatal = true; throw e; }
        if (!res.ok || !j || j.ok === false) throw new Error((j && j.fehler) || `HTTP ${res.status}`);
        return j;
      } catch (e) { last = e; if (e.fatal) break; await sleep(900); }
    }
    throw last;
  }
  const pw = () => sessionStorage.getItem("besKey") || "";
  async function ensurePw() {
    if (sessionStorage.getItem("besKey") !== null) return true;
    const p = await uiPrompt({ eyebrow: "Besondere Lieder", title: "Schreib-Passwort", type: "password", ok: "Weiter", text: "Das Passwort des Backblaze-Workers (WRITE_KEY). Leer lassen, wenn keines gesetzt ist." });
    if (p === null) return false;
    sessionStorage.setItem("besKey", p || ""); return true;
  }
  const wh = () => (pw() ? { "x-write-key": pw() } : {});

  /* Liste von jw.org: zuerst direkt, sonst über den Worker */
  function parseJw(d, lang, fmt) {
    const code = lang === "de" ? "X" : "E";
    const files = (d.files && d.files[code]) || {};
    const best = new Map();
    for (const f of Object.keys(files)) {
      if (fmt === "mp3" ? f !== "MP3" : (f !== "MP4" && f !== "M4V")) continue;
      for (const x of files[f]) {
        const track = Number(x.track || x.booknum || 0), url = x.file && x.file.url; if (!url || !track) continue;
        const hh = Number(x.frameHeight || String(x.label || "").replace(/\D/g, "") || 0);
        const score = fmt === "mp3" ? 1 : (hh <= 720 ? hh : 1);
        const old = best.get(track);
        if (!old || score > old.score) best.set(track, { track, title: String(x.title || "").replace(/\s+/g, " ").trim(), url, size: Number(x.filesize || 0), score });
      }
    }
    return [...best.values()].map((it) => ({ track: it.track, title: it.title, url: it.url, size: it.size, key: `${FOLDER(lang, fmt)}/${decodeURIComponent(it.url.split("?")[0].split("/").pop())}` }));
  }
  async function jwList(lang, fmt) {
    const code = lang === "de" ? "X" : "E", ff = fmt === "mp3" ? "MP3" : "MP4,M4V";
    try {
      const res = await fetch(`https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?output=json&pub=osg&fileformat=${encodeURIComponent(ff)}&alllangs=0&langwritten=${code}&txtCMSLang=${code}`);
      if (res.ok) { const items = parseJw(await res.json(), lang, fmt); if (items.length) return items; }
    } catch { /* weiter über den Worker */ }
    return (await jget(`${base()}/api/bes-sync?action=jw&lang=${lang}&fmt=${fmt}`)).items;
  }
  async function runCheck(say) {
    say("Lese Backblaze …");
    const hb = (await jget(`${base()}/api/bes-sync?action=have`)).dateien;
    say(`Backblaze: ${hb.length} Dateien. Lese Oracle …`);
    let ho = [];
    try { ho = (await jget(`${oraBase()}/api/list`)).dateien.filter((o) => /^bes-Lieder-de-/.test(o.key)); } catch (e) { say("Oracle: " + e.message); throw e; }
    say(`Oracle: ${ho.length} Dateien. Lese jw.org …`);
    const items = [];
    for (const [l, f] of KINDS) { const li = await jwList(l, f); li.forEach((x) => items.push({ lang: l, fmt: f, ...x })); say(`jw.org ${l.toUpperCase()} ${f}: ${li.length} Dateien`); }
    P = { stand: new Date().toLocaleString("de-AT"), items, haveB: hb, haveO: ho }; savePlan();
    return P;
  }
  /* Auswertung des Abgleichs */
  function model() {
    const hv = new Map();
    P.haveB.forEach((o) => hv.set(o.key, o.size)); P.haveO.forEach((o) => hv.set(o.key, o.size));
    const oKeys = new Set(P.haveO.map((o) => o.key));
    const tracks = new Map();
    P.items.forEach((it) => {
      const t = tracks.get(it.track) || { n: it.track, t: { en: "", de: "" }, k: {} };
      if (it.title) t.t[it.lang] = it.title;
      /* Deutsch zählt nur, wenn die Datei auf Oracle liegt, Englisch nur, wenn sie auf Backblaze liegt */
      const have = it.lang === "de" ? oKeys.has(it.key) : hv.has(it.key);
      t.k[kid(it.lang, it.fmt)] = { ...it, have, hsize: have ? hv.get(it.key) : 0 };
      tracks.set(it.track, t);
    });
    const known = new Set(P.items.map((i) => i.key));
    const extra = [...hv.entries()].filter(([k]) => !known.has(k) && !/^bes-songs/.test(k) && (/^bes-Lieder-en-/.test(k) || oKeys.has(k))).map(([key, size]) => ({ key, size }));
    const legacy = P.haveB.filter((o) => /^bes-Lieder-de-/.test(o.key));
    return { tracks: [...tracks.values()].sort((a, b) => a.n - b.n), extra, legacy, oKeys, usedB: P.haveB.reduce((s, o) => s + o.size, 0), usedO: P.haveO.reduce((s, o) => s + o.size, 0) };
  }
  function buildManifest(m) {
    const songs = [];
    m.tracks.forEach((t) => {
      const files = { en: {}, de: {} }; let any = false;
      for (const [l, f] of KINDS) { const k = t.k[kid(l, f)]; if (k && k.have) { files[l][f] = k.key; any = true; } }
      if (any) songs.push({ n: t.n, title: t.t, files });
    });
    return songs;
  }
  async function postManifest() {
    const songs = buildManifest(model());
    const j = await jget(`${base()}/api/bes-sync?action=manifest`, { method: "POST", headers: { "content-type": "application/json", ...wh() }, body: JSON.stringify({ songs }) });
    manifest = null; return j.lieder;
  }
  /* eine Datei laden: Englisch über Backblaze, Deutsch über Oracle */
  async function fetchOne(it) {
    if (it.lang === "de") {
      try { return await jget(`${oraBase()}/api/bes-sync?action=get&key=${encodeURIComponent(it.key)}`, { headers: wh() }, 2); }
      catch (e) { if (e.fatal) return await jget(`${oraBase()}/api/bes-sync?action=get&key=${encodeURIComponent(it.key)}`, { headers: wh() }, 1); throw e; }
    }
    return jget(`${base()}/api/bes-sync?action=get&key=${encodeURIComponent(it.key)}&u=${encodeURIComponent(it.url)}`, { headers: wh() }, 2);
  }

  function mount(box) {
    if (!box) return;
    box.replaceChildren();
    const say0 = (m) => { logLines.push(new Date().toLocaleTimeString("de-AT") + "  " + m); logLines = logLines.slice(-120); const pre = box.querySelector(".fehl-log"); if (pre) { pre.textContent = logLines.join("\n"); pre.scrollTop = pre.scrollHeight; } };
    const msg = (text, cls) => { const m = box.querySelector(".fl-msg"); if (m) { m.textContent = text; m.className = `fl-msg set-hint ls-msg${cls ? " " + cls : ""}`; } };
    let busy = false;

    async function check() {
      if (busy) return; busy = true; msg("Prüfe jw.org, Backblaze und Oracle …", "busy");
      try { await runCheck(say0); msg("Abgleich fertig.", "ok"); } catch (e) { say0("Fehler: " + e.message); msg("Abgleich fehlgeschlagen: " + e.message, "bad"); }
      busy = false; render();
    }
    async function loadMany(list, ask) {
      if (busy || !list.length) return;
      const bytes = list.reduce((s, i) => s + (i.size || 0), 0), m = model();
      if (ask) {
        const bB = list.filter((i) => i.lang === "en").reduce((s, i) => s + (i.size || 0), 0), bO = list.filter((i) => i.lang === "de").reduce((s, i) => s + (i.size || 0), 0);
        const lines = [`${list.length} Dateien, ca. ${fmtSize(bytes)}.`];
        if (bB) lines.push(`Backblaze (Englisch): danach ${fmtSize(m.usedB + bB)} von ${fmtSize(LIMIT)}${m.usedB + bB > LIMIT ? " – ÜBER der kostenlosen Grenze!" : ""}.`);
        if (bO) lines.push(`Oracle (Deutsch): danach ${fmtSize(m.usedO + bO)} von ${fmtSize(LIMIT)}${m.usedO + bO > LIMIT ? " – ÜBER dem gebuchten Speicher!" : ""}.`);
        const go = await uiConfirm({ eyebrow: "Besondere Lieder", title: `${list.length} Dateien laden?`, lines, ok: "Laden" });
        if (!go) return;
      }
      if (!(await ensurePw())) return;
      busy = true; let ok = 0, bad = 0;
      for (let n = 0; n < list.length; n++) {
        const it = list[n]; msg(`Lade ${n + 1} von ${list.length}: ${it.key}`, "busy");
        try {
          await fetchOne(it); ok++; say0(`✓ ${it.key}`);
          const arr = it.lang === "de" ? P.haveO : P.haveB; if (!arr.some((o) => o.key === it.key)) arr.push({ key: it.key, size: it.size });
        } catch (e) { bad++; say0(`✗ ${it.key}: ${e.message}`); if (/Passwort/.test(e.message)) { sessionStorage.removeItem("besKey"); break; } }
        if (n % 5 === 4) savePlan();
      }
      savePlan();
      try { const c = await postManifest(); say0(`Titelliste gespeichert (${c} Lieder).`); } catch (e) { say0("Titelliste: " + e.message); bad++; }
      busy = false; render(); msg(`Fertig: ${ok} geladen${bad ? `, ${bad} Fehler (siehe Protokoll)` : ""}.`, bad ? "bad" : "ok");
    }
    async function purge(m) {
      const missing = m.legacy.filter((o) => !m.oKeys.has(o.key));
      if (missing.length) { await uiAlert("Noch nicht löschen", `${missing.length} der deutschen Dateien in Backblaze sind noch nicht auf Oracle (z. B. ${missing[0].key.split("/").pop()}). Die Kopie läuft noch – bitte später erneut abgleichen.`); return; }
      const sz = m.legacy.reduce((s, o) => s + o.size, 0);
      const go = await uiConfirm({ eyebrow: "Backblaze aufräumen", title: `${m.legacy.length} deutsche Dateien löschen?`, danger: true, ok: "Endgültig löschen", lines: [`${fmtSize(sz)} werden in Backblaze endgültig gelöscht (alle Versionen). Alle diese Dateien liegen bereits auf Oracle.`, "Das lässt sich nicht rückgängig machen."] });
      if (!go || !(await ensurePw())) return;
      busy = true; let total = 0;
      try {
        for (let i = 0; i < 400; i++) {
          msg(`Lösche … (${total} Einträge gelöscht)`, "busy");
          const j = await jget(`${base()}/api/bes-sync?action=purge&prefix=${encodeURIComponent("bes-Lieder-de-")}`, { method: "POST", headers: wh() }, 2);
          total += j.geloescht; if (!j.rest || !j.geloescht) break;
        }
        say0(`Backblaze: ${total} deutsche Einträge gelöscht.`);
      } catch (e) { say0("Löschen: " + e.message); msg("Löschen abgebrochen: " + e.message, "bad"); }
      busy = false; await check();
    }

    function render() {
      const keepTop = box.closest("#codeForm") ? box.closest("#codeForm").scrollTop : 0;
      box.replaceChildren();
      const head = h("div", "ls-top"); head.append(h("p", "ap-title", "Besondere Lieder")); box.append(head);
      /* Adressen */
      const adr = h("details", "fl-help");
      adr.append(h("summary", "", "Worker-Adressen"));
      [["Backblaze (Englisch + Titelliste)", "besBase", DEF_BASE, base], ["Oracle (Deutsch)", "besOra", DEF_ORA, oraBase]].forEach(([lab, k, def, get]) => {
        const row = h("label", "set-row", lab + " "); const inp = h("input"); inp.type = "url"; inp.value = get(); inp.style.minWidth = "16em";
        inp.onchange = () => { lss(k, inp.value.trim() || def); manifest = null; }; row.append(inp); adr.append(row);
      });
      box.append(adr);
      if (!P) {
        const b = h("div", "fo-banner fo-warn fl-status"); const t = h("div", "fo-head"); t.append(h("span", "ls-dot busy"), h("b", "", "⚠ Noch nicht abgeglichen"));
        b.append(t, h("p", "fo-sub", "Englisch liegt bei Backblaze, Deutsch bei Oracle. Tippe auf „Mit jw.org abgleichen“, um zu sehen, was fehlt."));
        const acts = h("div", "fo-acts"); const c = h("button", "chip fo-go", "Mit jw.org abgleichen"); c.type = "button"; c.onclick = check; acts.append(c); b.append(acts); box.append(b);
        box.append(h("p", "fl-msg set-hint ls-msg", ""), h("pre", "fehl-log"));
        box.querySelector(".fehl-log").style.cssText = "max-height:22vh;overflow:auto;white-space:pre-wrap;font-size:12px"; box.querySelector(".fehl-log").textContent = logLines.join("\n");
        return;
      }
      const m = model();
      const incK = (l, f) => opt(`besInc_${kid(l, f)}`, true);
      const stats = KINDS.map(([l, f, name]) => {
        const r = { l, f, name, have: 0, pub: 0, ready: [], bytes: 0 };
        m.tracks.forEach((t) => { const k = t.k[kid(l, f)]; if (!k) return; r.pub++; if (k.have) r.have++; else if (incK(l, f)) { r.ready.push(k); r.bytes += k.size || 0; } });
        return r;
      });
      const ready = stats.flatMap((s) => s.ready), rbytes = stats.reduce((s, x) => s + x.bytes, 0);
      /* Banner */
      const cls = ready.length ? "new" : "ok";
      const ban = h("div", `fo-banner fo-${cls} fl-status`);
      const top = h("div", "fo-head"); top.append(h("span", "ls-dot ok"), h("b", "", ready.length ? `⬇ ${ready.length} Dateien auf jw.org – noch nicht auf dem Server` : "✓ Alles aktuell"));
      ban.append(top, h("p", "fo-sub", ready.length ? `Zum Herunterladen bereit (${fmtSize(rbytes)}). Letzter Abgleich: ${P.stand}.` : `Alle auf jw.org veröffentlichten Besonderen Lieder sind auf dem Server. Letzter Abgleich: ${P.stand}.`));
      const acts = h("div", "fo-acts");
      if (ready.length) { const g = h("button", "chip fo-go", `Alle ${ready.length} laden (${fmtSize(rbytes)})`); g.type = "button"; g.onclick = () => loadMany(ready, true); acts.append(g); }
      const c = h("button", "chip", "Mit jw.org abgleichen"); c.type = "button"; c.onclick = check; acts.append(c);
      const tl = h("button", "chip", "Titelliste speichern"); tl.type = "button"; tl.title = "Schreibt die Liste der vorhandenen Lieder, die der Player verwendet"; tl.onclick = async () => { if (!(await ensurePw())) return; try { const n = await postManifest(); say0(`Titelliste gespeichert (${n} Lieder).`); msg(`Titelliste gespeichert (${n} Lieder).`, "ok"); } catch (e) { say0("Titelliste: " + e.message); msg("Titelliste: " + e.message, "bad"); } }; acts.append(tl);
      const op = h("button", "chip", "Besondere Lieder öffnen"); op.type = "button"; op.onclick = async () => { manifest = null; await switchLib("bes"); const f = document.getElementById("codeModal"); if (f && state.lib === "bes") f.hidden = true; }; acts.append(op);
      ban.append(acts);
      const tab = h("div", "fo-tab");
      ["Art", "Auf dem Server", "Auf jw.org", "Neu zum Laden"].forEach((x, i) => tab.append(h("span", "fo-th" + (i ? " r" : ""), x)));
      stats.forEach((x) => {
        tab.append(h("span", "fo-nm fl-gn", x.name), h("span", "fo-c r", `${x.have} / ${m.tracks.length}`), h("span", "fo-c r", String(x.pub)));
        const cc = h("span", "fo-c r");
        if (x.ready.length) { const b = h("button", "chip fo-mini", `⬇ ${x.ready.length}${x.bytes ? " · " + fmtSize(x.bytes) : ""}`); b.type = "button"; b.onclick = () => loadMany(x.ready, true); cc.append(b); }
        else cc.append(x.pub === 0 ? h("span", "fo-grey", "keine") : h("span", "fo-okm", "✓ aktuell"));
        tab.append(cc);
      });
      ban.append(tab);
      /* Speicher */
      [["Backblaze (Englisch)", m.usedB, stats.filter((s) => s.l === "en").reduce((n, s) => n + s.bytes, 0)], ["Oracle (Deutsch)", m.usedO, stats.filter((s) => s.l === "de").reduce((n, s) => n + s.bytes, 0)]].forEach(([nm, used, add]) => {
        const mem = h("div", "fo-mem"); const pct = Math.min(100, used / LIMIT * 100);
        mem.append(h("div", "fo-memt", `Speicher ${nm}: ${fmtSize(used)} von ${fmtSize(LIMIT)} belegt (${Math.round(pct)} %) · frei ${fmtSize(Math.max(0, LIMIT - used))}`));
        const bar = h("div", "fo-bar"); const f1 = h("i"); f1.style.width = pct + "%"; bar.append(f1);
        if (add) { const f2 = h("i", "add"); f2.style.width = Math.min(100 - pct, add / LIMIT * 100) + "%"; bar.append(f2); }
        mem.append(bar); if (add) mem.append(h("small", used + add > LIMIT ? "set-hint bad" : "set-hint", `Nach dem Laden: ${fmtSize(used + add)}${used + add > LIMIT ? " – ÜBER der Grenze!" : ""}`));
        ban.append(mem);
      });
      box.append(ban);
      if (m.legacy.length) {
        const lb = h("div", "fl-high"); const sz = m.legacy.reduce((s, o) => s + o.size, 0);
        lb.append(h("p", "", `In Backblaze liegen noch ${m.legacy.length} deutsche Dateien (${fmtSize(sz)}). Deutsch wird jetzt von Oracle geliefert.`));
        const del = h("button", "chip danger", `Deutsche Dateien aus Backblaze löschen (${fmtSize(sz)})`); del.type = "button"; del.onclick = () => purge(m); lb.append(del); box.append(lb);
      }
      box.append(h("p", "fl-msg set-hint ls-msg", ""));
      /* Tabelle mit Schaltern */
      const grid = h("div", "fl-grid");
      ["Zeigen", "Art", "Server", "jw.org"].forEach((t, i) => grid.append(h("span", `fl-gh${i === 1 ? " l" : ""}`, t)));
      grid.style.gridTemplateColumns = "auto 1fr auto auto";
      stats.forEach((s) => {
        const lab = h("label", "fl-cb"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = opt(`besT_${kid(s.l, s.f)}`, true); cb.setAttribute("aria-label", s.name + " anzeigen");
        cb.onchange = () => { lss(`besT_${kid(s.l, s.f)}`, cb.checked ? "1" : "0"); refresh(); }; lab.append(cb);
        grid.append(lab, h("span", "fl-gn", s.name), h("span", "fl-gv", `${s.have}/${m.tracks.length}`), h("span", "fl-gv", String(s.pub)));
      });
      box.append(grid);
      const ib = h("div", "fl-inc"); ib.append(h("small", "set-hint", "Beim Laden berücksichtigen:"));
      const rowI = h("div", "fl-modes");
      KINDS.forEach(([l, f, name]) => { const lab = h("label", "fl-mode"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = incK(l, f); cb.onchange = () => { lss(`besInc_${kid(l, f)}`, cb.checked ? "1" : "0"); render(); }; lab.append(cb, document.createTextNode(" " + name)); rowI.append(lab); });
      ib.append(rowI); box.append(ib);
      const modes = h("div", "fl-modes"); const mode0 = lsv("besMode", "missing");
      [["missing", "Fehlende"], ["have", "Vorhandene"], ["both", "Beide"], ["nojw", "Nicht auf jw.org"]].forEach(([v, label]) => {
        const lab = h("label", "fl-mode"); const rb = document.createElement("input"); rb.type = "radio"; rb.name = "besMode"; rb.value = v; rb.checked = mode0 === v;
        rb.onchange = () => { if (rb.checked) { lss("besMode", v); refresh(); } }; lab.append(rb, document.createTextNode(" " + label)); modes.append(lab);
      });
      box.append(h("small", "set-hint", "In der Liste zeigen:"), modes);
      const dyn = h("div", "fl-dyn"); box.append(dyn);
      const pre = h("pre", "fehl-log"); pre.style.cssText = "max-height:22vh;overflow:auto;white-space:pre-wrap;font-size:12px"; pre.textContent = logLines.join("\n"); box.append(pre);
      refresh();
      function refresh() {
        const mode = lsv("besMode", "missing");
        const shown = KINDS.filter(([l, f]) => opt(`besT_${kid(l, f)}`, true));
        dyn.replaceChildren();
        if (!shown.length) { dyn.append(h("p", "set-hint", "Bitte oben mindestens eine Art auswählen.")); return; }
        const sum = h("div", "fl-sum");
        shown.forEach(([l, f, name]) => { const s = stats.find((x) => x.l === l && x.f === f); const b = h("span", "fl-pill"); b.append(h("b", "", name), document.createTextNode(` ${s.have}/${m.tracks.length}`)); const nojw = m.tracks.length - s.pub; if (s.ready.length || nojw) b.append(h("em", "", ` · ${s.ready.length} ladbar${s.bytes ? ` (${fmtSize(s.bytes)})` : ""}${nojw ? ` · ${nojw} nicht auf jw.org` : ""}`)); sum.append(b); });
        dyn.append(sum);
        const groups = new Map();
        m.tracks.forEach((t) => {
          const miss = shown.filter(([l, f]) => t.k[kid(l, f)] && !t.k[kid(l, f)].have), pres = shown.filter(([l, f]) => t.k[kid(l, f)] && t.k[kid(l, f)].have), nojw = shown.filter(([l, f]) => !t.k[kid(l, f)]);
          const show = mode === "both" || (mode === "missing" && miss.length) || (mode === "have" && pres.length) || (mode === "nojw" && nojw.length);
          const g = Math.floor(t.n / 100) * 100; if (!groups.has(g)) groups.set(g, { all: [], rows: [] });
          groups.get(g).all.push(t); if (show) groups.get(g).rows.push(t);
        });
        const ordered = [...groups.entries()].filter(([, g]) => g.rows.length).sort((a, b) => a[0] - b[0]);
        if (!ordered.length) dyn.append(h("p", "set-hint", mode === "missing" ? "Es fehlt nichts. 🎉" : "Nichts zu zeigen."));
        ordered.forEach(([g0, g]) => {
          const det = h("details", "fl-cat"); const sm = h("summary", "");
          sm.append(h("span", "fl-cat-name", `Lieder ${g0 === 0 ? "001" : g0}–${g0 + 99} (${g.all.length})`));
          const counts = h("span", "fl-cat-counts");
          shown.forEach(([l, f, name]) => { const have = g.all.filter((t) => t.k[kid(l, f)] && t.k[kid(l, f)].have).length, tot = g.all.filter((t) => t.k[kid(l, f)]).length; counts.append(h("span", `fl-cc ${have === tot ? "full" : have ? "part" : "none"}`, `${name.replace("Englisch", "EN").replace("Deutsch", "DE")} ${have}/${tot}`)); });
          sm.append(counts); det.append(sm); det.open = g.rows.length <= 12 && mode !== "both";
          g.rows.forEach((t) => {
            const row = h("div", "fl-row"); row.append(h("b", "fl-n", String(t.n).padStart(3, "0")), h("span", "fl-t", t.t.de || t.t.en || `Lied ${t.n}`));
            const chips = h("span", "fl-chips");
            shown.forEach(([l, f, name]) => {
              const k = t.k[kid(l, f)];
              const pair = h("span", `fl-pair ${k ? (k.have ? "has" : "dl") : "no"}`);
              if (!k) pair.append(h("span", "fl-no", `${name}: nicht auf jw.org`));
              else if (k.have) pair.append(h("span", "fl-ok", `✓ ${name}${k.hsize ? ` (${fmtSize(k.hsize)})` : ""}`));
              else { const lab = `⬇ ${name}${k.size ? ` (${fmtSize(k.size)})` : ""}`; const b = h("button", "chip fl-dl", lab); b.type = "button"; b.onclick = async () => { b.disabled = true; b.textContent = "lädt …"; await loadMany([k], false); }; pair.append(b); }
              chips.append(pair);
            });
            row.append(chips); det.append(row);
          });
          dyn.append(det);
        });
        if (m.extra.length && (mode === "nojw" || mode === "both")) {
          const det = h("details", "fl-cat"); det.append(h("summary", "", `Nur auf dem Server, nicht (mehr) auf jw.org (${m.extra.length})`));
          m.extra.forEach((o) => { const row = h("div", "fl-row"); row.append(h("span", "fl-t", o.key), h("span", "fl-no", fmtSize(o.size))); det.append(row); });
          dyn.append(det);
        }
      }
      const f = box.closest("#codeForm"); if (f) f.scrollTop = keepTop;
    }
    render();
  }

  /* ---------- Start (nach dem Laden von app.js) ---------- */
  function start() {
    ["addMissingSongs", "rebuildExtras"].forEach(guard);
    paintSwitch();
    const lw = document.getElementById("ludwtToggle");
    if (lw) lw.addEventListener("click", () => { if (cur() === "bes") switchLib("main", true); }, true);
    if (lsv("lib", "main") === "bes") {   /* zuletzt war „Besondere Lieder“ aktiv: nach dem Laden der normalen Lieder umschalten */
      let tries = 0;
      const t = setInterval(() => { if ((state.songs.length && state.media) || ++tries > 40) { clearInterval(t); if (state.songs.length) switchLib("bes", true); } }, 500);
    }
  }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
  window.BES = { base, oraBase, urlFor, mount, switchLib, build, loadManifest, current: cur };
})();
