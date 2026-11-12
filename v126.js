/* v126: X-Knopf, Anmelde-Hinweise, Sync-Fenster mit Anmeldung, KI-Scan direkt beim Lied, KI-Text mit Vorrang */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const dt = (ts) => (ts ? new Date(ts).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "medium" }) : "");
  const cur = () => state.songs[state.index];
  const keyNow = () => { try { return sessionStorage.getItem("aiKey") || state.writeKey || ""; } catch { return state.writeKey || ""; } };

  /* ---------- X oben rechts im Einstellungsfenster ---------- */
  function wireX() {
    const x = $("codeX"); if (!x || x._v126) return; x._v126 = true;
    x.addEventListener("click", () => { const c = $("codeCancel"); if (c) c.click(); });
  }

  /* ---------- Anmelden ---------- */
  async function loginDialog(title) {
    const box = h("div", "rt-box");
    const n = h("input", "rt-in"); n.type = "text"; n.placeholder = "Benutzername"; n.autocomplete = "off"; n.autocapitalize = "off"; n.value = "";
    const p = h("input", "rt-in"); p.type = "password"; p.placeholder = "Passwort (nur falls vorhanden)"; p.autocomplete = "new-password";
    box.append(n, p);
    const ok = await uiDialog({ eyebrow: "Benutzer", title: title || "Anmelden", cancelValue: false,
      lines: ["Mit einem Benutzernamen werden deine Einstellungen auf dem Server gespeichert. Auf einem anderen Gerät mit demselben Namen hast du dieselben Einstellungen.", { node: box }],
      buttons: [{ value: true, kind: "primary", label: "Anmelden" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
    if (ok !== true || !n.value.trim()) return;
    try {
      const r = await userLogin(n.value, p.value, true);
      if (r.sys) await uiAlert("Benutzer", `„${r.sys}“ ist eine Voreinstellung und kein Benutzer. Wähle einen eigenen Namen.`);
      else await uiAlert("Benutzer", r.msg || (r.ok ? "Angemeldet." : "Nicht angemeldet."));
      if (typeof renderPresetBox === "function") { try { renderPresetBox(); } catch { /* egal */ } }
    } catch (e) { await uiAlert("Benutzer", (e && e.message) || String(e)); }
    paintBanner();
  }
  async function whoDialog(v, pend, stampKey) {
    if (!v) { await loginDialog("Nicht angemeldet"); return; }
    const ts = Number(lsv(stampKey, "0")) || 0;
    const r = await uiDialog({ eyebrow: "Sync", title: `Angemeldet als „${v}“`, cancelValue: null,
      lines: [`Letzte Synchronisierung: ${ts ? dt(ts) : "noch nicht in diesem Browser"}`, pend ? "Aktuell wird noch abgeglichen …" : "Alles abgeglichen."].filter(Boolean),
      buttons: [{ value: null, kind: "primary", label: "OK" }, { value: "other", kind: "cancel", label: "Anderen Benutzer anmelden" }] });
    if (r === "other") await loginDialog("Anderen Benutzer anmelden");
  }

  /* ---------- Hinweis „angemeldet / nicht angemeldet“ in Sichern ---------- */
  function ensureBanner() {
    let b = $("authBanner"); if (b) return b;
    const form = $("codeForm"), first = form && form.querySelector("h3.set-h[data-tab=\"abgleich\"]"); if (!form || !first) return null;
    b = h("div", "auth-banner"); b.id = "authBanner"; b.dataset.tab = "abgleich sichern";
    first.before(b); return b;
  }
  function paintBanner() {
    const m = $("codeModal"); if (!m || m.hidden) return;
    const b = ensureBanner(); if (!b) return;
    if (window.V163 && window.V163.paintBanner) { window.V163.paintBanner(b); return; }
    const u = lsv("userName", ""), c = lsv("sync-code", "");
    const key = u + "|" + c; if (b.dataset.k === key) return; b.dataset.k = key;
    b.replaceChildren();
    const row = (ok, text, btn, fn) => { const r = h("div", "auth-row"); r.dataset.ok = ok ? "1" : "0"; r.append(h("span", "auth-ic", ok ? "✔" : "✖"), h("span", "auth-tx", text)); if (btn) { const bt = h("button", "chip", btn); bt.type = "button"; bt.onclick = fn; r.append(bt); } b.append(r); };
    row(!!u, u ? `Benutzer: angemeldet als „${u}“` : "Benutzer: NICHT angemeldet – bitte anmelden, damit deine Einstellungen gespeichert werden", u ? "" : "Anmelden", () => loginDialog("Anmelden"));
    row(!!c, c ? `Favoriten-Code: „${c}“` : "Favoriten-Code: nicht eingestellt – unter „Favoriten-Abgleich“ eintragen", "", null);
  }
  setInterval(paintBanner, 600);

  /* ---------- KI-Text (Scan direkt beim Lied) ---------- */
  const kiKey = (kind, id) => `kitext-${kind}-${id}`;
  const kiGet = (kind, id) => { try { return JSON.parse(localStorage.getItem(kiKey(kind, id)) || "null"); } catch { return null; } };
  const kiFirst = () => lsv("kiFirst", "1") === "1";
  const kiOff = new Set();
  const ACCN = { low: "schwach", normal: "normal", high: "sehr genau" };
  const mkLrc = (times, texts) => times.map((t, i) => { const m = Math.floor(t / 60), s = (t - m * 60).toFixed(2).padStart(5, "0"); return `[${String(m).padStart(2, "0")}:${s}]${texts[i]}`; }).join("\n");

  function kiLines(song, kind) {
    state.kiUsed = null;
    if (!kiFirst() || kiOff.has(kind + "-" + song.id)) return null;
    const k = kiGet(kind, song.id); if (!k || !k.lrc) return null;
    const lines = parseLrc(k.lrc); if (!lines.length) return null;
    state.kiUsed = { kind, id: song.id };
    return lines;
  }
  (() => {
    const fk = window.fetchKaraokeLines;
    if (typeof fk === "function" && !fk._v126) {
      const w = async function (song, stale) {
        const kind = musikLang() === "de" ? "lrcde" : "lrc";
        const k = kiLines(song, kind);
        if (k) { state.lyricLang = kind === "lrcde" ? "de" : "en"; return k; }
        return fk.apply(this, arguments);
      };
      w._v126 = true; window.fetchKaraokeLines = w;
    }
    const fm = window.fetchMeetingLines;
    if (typeof fm === "function" && !fm._v126) {
      const w = async function (song, stale, prefix) {
        const k = kiLines(song, prefix || "lrcm");
        if (k) return k;
        return fm.apply(this, arguments);
      };
      w._v126 = true; window.fetchMeetingLines = w;
    }
  })();

  async function scanSong(song) {
    if (!window.AIK) { await uiAlert("KI-Scan", "Die KI-Funktion ist nicht geladen."); return; }
    const kind = curLrcKind(song), lines = (state.lyrics || []).slice();
    if (!lines.length) { await uiAlert("KI-Scan", "Zu diesem Lied ist kein Liedtext geladen."); return; }
    if (!state.currentAudio || state.curVersion === "video" || /\.(mp4|m4v|webm|mov)(\?|$)/i.test(state.currentAudio)) { await uiAlert("KI-Scan", "Dafür wird eine MP3 gebraucht (Karaoke, Instrumental oder Zusammenkünfte), bei Video geht es nicht."); return; }
    const acc = lsv("kiScanAcc", "high");
    const ok = await uiDialog({ eyebrow: `Lied ${song.id}`, title: "Liedtext mit KI scannen", cancelValue: false,
      lines: [song.title, `Die KI hört das Lied ab und setzt die Zeiten neu. Genauigkeit: ${ACCN[acc]} (änderbar unter Einstellungen → Allgemein → Voreinstellungen → Wiedergabe → „KI-Text“, oder unter Bewertungen → KI-Verlauf). Das Ergebnis wird als eigener KI-Text auf diesem Gerät aufgehoben. Die gespeicherte LRC-Datei wird nicht verändert.`],
      buttons: [{ value: true, kind: "primary", label: "Starten" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
    if (ok !== true) return;
    const texts = lines.map((l) => l.text), lang = musikLang() === "de" && state.lyricLang === "de" ? "de" : "en";
    try {
      const words = await window.AIK.transcribe(texts, lang, acc);
      const res = window.AIK.alignLines(texts, words);
      if (!res || res.matched < Math.max(3, res.total * 0.2)) { await uiAlert("KI-Scan", `Die KI konnte nur ${res ? res.matched : 0} von ${res ? res.total : texts.join(" ").split(/\s+/).length} Wörtern zuordnen.`); return; }
      const times = res.times.map((t) => Math.max(0, t + (state.timeOffset || 0) / 1000));
      const lrc = mkLrc(times, texts);
      try { localStorage.setItem(kiKey(kind, song.id), JSON.stringify({ ts: Date.now(), acc, src: "song", lrc })); } catch { await uiAlert("KI-Scan", "Speicher des Browsers ist voll."); return; }
      const R = window.RATING;
      if (R && R.hadd) { R.hadd(kind, song.id, { type: "orig", lrc: mkLrc(lines.map((l) => l.time), texts) }); R.hadd(kind, song.id, { type: "ki", src: "song", acc, lrc }); }
      kiOff.delete(kind + "-" + song.id);
      showToast(`KI-Text erstellt (${Math.round(100 * res.matched / res.total)} % der Wörter zugeordnet).`);
      await loadLyrics(song, state.curVersion);
      paintKiBtn(true);
    } catch (e) { await uiAlert("KI-Scan", (e && e.message) || String(e)); }
    finally { try { window.AIK.prog(false); } catch { /* egal */ } }
  }

  /* Knopf „KI“ in der Titelzeile (nur wenn für dieses Lied ein KI-Text da ist) */
  function ensureKiBtn() {
    let b = $("kiTextBtn"); if (b) return b;
    const row = $("titleRow"); if (!row) return null;
    b = h("button", "star-btn ki-text-btn", "KI"); b.id = "kiTextBtn"; b.type = "button"; b.hidden = true;
    let timer = null, long = false;
    const start = () => { long = false; clearTimeout(timer); timer = setTimeout(() => { long = true; saveAsDefault(); }, 800); };
    const stop = () => clearTimeout(timer);
    b.addEventListener("pointerdown", start); b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
    b.addEventListener("contextmenu", (e) => e.preventDefault());
    b.addEventListener("click", async () => {
      if (long) { long = false; return; }
      const s = cur(); if (!s) return;
      const kind = curLrcKind(s), k = kind + "-" + s.id;
      if (!kiGet(kind, s.id) || (state.lrcPick && state.lrcPick.id === s.id)) { if (window.V130) window.V130.trackDialog(); return; }
      if (kiOff.has(k)) kiOff.delete(k); else kiOff.add(k);
      await loadLyrics(s, state.curVersion); paintKiBtn(true);
      showToast(kiOff.has(k) ? "Gespeicherter Liedtext (ohne KI)." : "KI-Text wird verwendet.");
    });
    const lang = row.querySelector("#langBtn, .lang-mini, .lang-btn");
    if (lang) row.insertBefore(b, lang); else row.append(b);
    return b;
  }
  function paintKiBtn() {
    const s = cur(), b = ensureKiBtn(); if (!b) return;
    if (!s || !s.id) { b.hidden = true; return; }
    const kind = curLrcKind(s), k = kiGet(kind, s.id);
    const picked = !!(state.lrcPick && state.lrcPick.id === s.id);
    const has = !!(k && k.lrc);
    let show = has || picked;
    if (!show && lsv("kiHide", "1") !== "1") { try { show = ((window.RATING && window.RATING.hget(kind, s.id)) || []).length > 0 || (window.V130 && window.V130.alts(s).length > 1); } catch { show = false; } }
    b.hidden = !show;
    b.dataset.pick = picked ? "1" : "0";
    if (!has) { b.setAttribute("aria-pressed", String(picked)); b.title = picked ? "Ein anderer Karaoke-Text ist gewählt. Lange drücken: Text wählen." : "Antippen oder lange drücken: Karaoke-Text wählen."; return; }
    const used = !!(state.kiUsed && state.kiUsed.id === s.id && state.kiUsed.kind === kind);
    b.setAttribute("aria-pressed", String(used));
    b.title = used ? `KI-Text wird verwendet (${dt(k.ts)}, Genauigkeit ${ACCN[k.acc] || "normal"}). Antippen: gespeicherten Text zeigen. Lange drücken: KI-Text als Standard speichern.` : "KI-Text ist vorhanden, wird aber nicht verwendet. Antippen: KI-Text verwenden. Lange drücken: als Standard speichern.";
  }
  setInterval(paintKiBtn, 800);

  async function saveAsDefault() {
    const s = cur(); if (!s) return;
    const kind = curLrcKind(s), k = kiGet(kind, s.id); if (!k) return;
    let saved = false, base = "";
    try { const r0 = await fetch(`${SYNC_BASE}/sync/${kind}-${s.id}`, { cache: "no-store" }); if (r0.ok) { const t0 = await r0.text(); const nz = (x) => String(x).replace(/\r/g, "").trim(); saved = nz(t0) === nz(k.lrc); if (t0.includes("[")) base = t0; } } catch { /* egal */ }
    if (!base) { try { const hs = ((window.RATING && window.RATING.hget(kind, s.id)) || []).filter((v) => v.type === "orig"); if (hs.length) base = hs[0].lrc; } catch { /* egal */ } }
    const fmtT = (x) => { const m = Math.floor(x / 60), sec = x - m * 60; return `${m}:${sec < 10 ? "0" : ""}${sec.toFixed(1)}`; };
    const diffLines = (() => {
      let A = [], B = [];
      try { A = parseLrc(base); B = parseLrc(k.lrc); } catch { /* egal */ }
      const mkd = (t) => { const d = document.createElement("small"); d.className = "set-hint"; d.textContent = t; return { node: d }; };
      if (!A.length || !B.length) return [mkd("Änderungen: kein gespeicherter Text zum Vergleich")];
      if (A.length !== B.length) return [mkd(`Änderungen: Zeilenzahl unterschiedlich (${A.length} gespeichert, ${B.length} KI)`)];
      const di = window.V130.diffInfo(B.map((b, i) => ({ old: Number(A[i].time) || 0, neu: Number(b.time) || 0, text: b.text })));
      const sm = document.createElement("div"); sm.className = "dlg-hint"; sm.textContent = di.note;
      return [{ title: "Änderungen gegenüber dem gespeicherten Text", group: [{ table: di.table, right: true }, { node: sm }, { node: di.det }] }];
    })();
    const ok = await uiDialog({ eyebrow: `Lied ${s.id}`, title: saved ? "KI-Text ist schon der Standard" : "KI-Text als Standard speichern?", cancelValue: false,
      lines: [s.title, saved ? { text: "✔ Dieser KI-Text ist bereits als Standard auf dem Server gespeichert (identisch mit der aktuellen LRC-Datei).", cls: "dlg-hint" } : { text: "Noch nicht gespeichert: Dieser KI-Text ist nur auf diesem Gerät.", cls: "dlg-hint" }, ...diffLines, "Speichern ersetzt die bisherige LRC-Datei auf dem Server. Dafür wird das Passwort des Bearbeitungsmodus gebraucht. Die bisherige Fassung bleibt im KI-Verlauf erhalten."],
      buttons: [{ value: true, kind: saved ? "primary" : "danger", label: saved ? "Trotzdem erneut speichern" : "Als Standard speichern" }, { value: "pick", label: "Anderen Karaoke-Text wählen …" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
    if (ok === "pick") { if (window.V130) window.V130.trackDialog(); return; }
    if (ok !== true) return;
    let key = "";   /* Passwort wird bei jedem Speichern des KI-Textes neu abgefragt */
    const R = window.RATING;
    /* bisherige Fassung sichern */
    try { const r = await fetch(`${SYNC_BASE}/sync/${kind}-${s.id}`, { cache: "no-store" }); if (r.ok) { const t = await r.text(); if (t.includes("[") && R && R.hadd) R.hadd(kind, s.id, { type: "orig", lrc: t.trim() }); } } catch { /* egal */ }
    for (let tries = 0; tries < 3; tries++) {
      if (!key) { key = window.askEditPass ? await window.askEditPass("KI-Text speichern") : await uiPrompt({ eyebrow: "Speichern", title: "Schreib-Schlüssel", type: "password", placeholder: "WRITE_KEY", ok: "Weiter" }); if (!key) return; }
      try {
        const res = await fetch(`${SYNC_BASE}/sync/${kind}-${s.id}`, { method: "PUT", headers: { "content-type": "text/plain; charset=utf-8", "x-write-key": key }, body: k.lrc });
        if (res.status === 401) { key = ""; continue; }
        if (!res.ok) throw new Error("Server " + res.status);
        try { sessionStorage.setItem("aiKey", key); } catch { /* egal */ }
        document.dispatchEvent(new CustomEvent("lrc-saved", { detail: { kind, id: s.id, lrc: k.lrc, key } }));
        try { localStorage.removeItem(kiKey(kind, s.id)); } catch { /* egal */ }
        kiOff.delete(kind + "-" + s.id);
        showToast("KI-Text ist jetzt der Standard.");
        await loadLyrics(s, state.curVersion); paintKiBtn();
        return;
      } catch (e) { await uiAlert("Speichern", (e && e.message) || String(e)); return; }
    }
  }

  /* ---------- „＋“-Fenster: versteckte Option „Liedtext mit KI scannen“ ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest && e.target.closest("#plAddBtn"); if (!t) return;
    setTimeout(() => {
      const body = $("dialogBody"); if (!body || body.querySelector(".ki-scan-box")) return;
      const s = cur(); if (!s) return;
      const d = h("details", "rt-more ki-scan-box"); const sm = h("summary", "", "▸ Liedtext mit KI scannen"); d.append(sm);
      const info = h("small", "rt-avg", `Wie „KI-Sync“ im Bearbeiten-Modus, aber direkt beim Lied. Genauigkeit: ${ACCN[lsv("kiScanAcc", "high")]}. Das Ergebnis ist ein eigener KI-Text für die LRC-Datei „${curLrcKind(s)}“.`);
      const go = h("button", "chip", "KI-Scan starten"); go.type = "button";
      go.onclick = () => { const c = $("dialogForm") && $("dialogForm").querySelector(".cancel, [data-v=\"cancel\"]"); const cb = [...$("dialogButtons").querySelectorAll("button")].find((x) => /abbrechen|schließen/i.test(x.textContent)); if (cb) cb.click(); setTimeout(() => scanSong(s), 120); void c; };
      d.append(info, go);
      body.append(d);
    }, 60);
  }, true);

  /* ---------- Einstellungen für den KI-Text (im Reiter KI-Verlauf) ---------- */
  function kiSettings(box) {
    if (box.querySelector(".ki-set")) return;
    const w = h("div", "ki-set rt-box");
    w.append(h("p", "dlg-group-title", "KI-Text (direkt beim Lied gescannt)"));
    const r1 = h("label", "set-row"); r1.append(document.createTextNode("Genauigkeit des KI-Scans "));
    const sel = h("select", "rt-sel"); [["low", "schwach (schnell)"], ["normal", "normal"], ["high", "sehr genau (Standard)"]].forEach(([v, n]) => { const o = h("option", "", n); o.value = v; sel.append(o); }); sel.value = lsv("kiScanAcc", "high"); sel.onchange = () => lss("kiScanAcc", sel.value); r1.append(sel);
    const r2 = h("label", "set-row check"); const c = h("input"); c.type = "checkbox"; c.checked = kiFirst(); c.onchange = () => { lss("kiFirst", c.checked ? "1" : "0"); }; r2.append(c, h("span", "", " KI-Text zuerst verwenden, wenn vorhanden"));
    w.append(r1, r2, h("small", "set-hint", "Bei vorhandenem KI-Text erscheint in der Titelzeile der Knopf „KI“. Kurz tippen: zwischen KI-Text und gespeichertem Text wechseln. Lange drücken: KI-Text als Standard speichern (mit Schreib-Schlüssel)."));
    const t = box.querySelector(".ap-title"); if (t) t.after(w); else box.prepend(w);
  }
  new MutationObserver(() => { const b = $("kihBox"); if (b && b.firstChild && !b.querySelector(".ki-set")) kiSettings(b); }).observe(document.body, { childList: true, subtree: true });

  window.V126 = { whoDialog, loginDialog, scanSong, paintKiBtn };
  const boot = () => { wireX(); ensureBanner(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
