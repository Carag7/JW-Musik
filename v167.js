/* v167: Fehlersuche-Protokoll (Tasten, Gerät, Wiedergabe) und Anzeige-Protokoll – anzeigen und auf dem Server speichern */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
  const T0 = Date.now();
  const hms = (t) => new Date(t || Date.now()).toLocaleTimeString("de-AT", { hour12: false }) + "." + String((t || Date.now()) % 1000).padStart(3, "0");
  const tail = (s) => String(s || "").slice(-60);

  /* ---------- Ereignis-Protokoll (Ringspeicher, bleibt über Neuladen erhalten) ---------- */
  const KEY = "dbgLog";
  let log = [];
  try { log = JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || "[]"); if (!Array.isArray(log)) log = []; } catch { log = []; }
  let saveT = 0;
  const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(log.slice(-250))); } catch { /* egal */ } }, 600); };
  const add = (kind, text) => { log.push(`${hms()}  ${kind.padEnd(8)} ${text}`); if (log.length > 400) log.splice(0, log.length - 400); persist(); };
  window.DBG = { add };
  /* Test: echtes Audio-Element statt Video-Element (muss vor app.js passieren) */
  try {
    if (localStorage.getItem("testForceAudio") === "1") {
      const v = document.getElementById("audio");
      if (v && v.tagName === "VIDEO") { const au = document.createElement("audio"); au.id = "audio"; au.preload = "none"; if (v.className) au.className = v.className; v.replaceWith(au); log.push(`${hms()}  TEST     <audio> statt <video> eingesetzt`); }
    }
  } catch { /* egal */ }
  add("START", `Seite geladen (${location.pathname})`);

  window.addEventListener("error", (e) => add("FEHLER", `${e.message} @ ${tail(e.filename)}:${e.lineno}`));
  window.addEventListener("unhandledrejection", (e) => add("FEHLER", `Promise: ${e.reason && (e.reason.message || e.reason)}`));
  document.addEventListener("visibilitychange", () => add("SEITE", document.hidden ? "im Hintergrund" : "sichtbar"));
  window.addEventListener("online", () => add("NETZ", "online")); window.addEventListener("offline", () => add("NETZ", "offline"));
  document.addEventListener("keydown", (e) => { if (e.key && e.key.length > 1 && !/^(Shift|Control|Alt|Meta)$/.test(e.key)) add("TASTE", `keydown ${e.key} (${e.code})`); }, true);

  /* Media Session: jede Anmeldung und jeden Tastendruck von Tesla mitschreiben */
  const handlers = {};
  try {
    if ("mediaSession" in navigator && window.MediaSession && localStorage.getItem("keyVar") !== "7") {
      const proto = MediaSession.prototype, orig = proto.setActionHandler;
      proto.setActionHandler = function (action, fn) {
        handlers[action] = fn ? "angemeldet" : "abgemeldet";
        let wrapped = fn;
        if (fn) wrapped = function (d) { add("TASTE", `Tesla/Browser sendet „${action}“${d && d.seekTime != null ? " " + d.seekTime : ""}`); return fn.apply(this, arguments); };
        try { return orig.call(this, action, wrapped); } catch (err) { handlers[action] = "FEHLER: " + err.message; add("FEHLER", `setActionHandler(${action}): ${err.message}`); }
      };
    }
  } catch { /* egal */ }

  /* Audio-/Video-Element beobachten */
  const watch = () => {
    const a = $("audio"); if (!a || a._dbg) return; a._dbg = true;
    ["loadstart", "loadedmetadata", "canplay", "play", "playing", "pause", "ended", "emptied", "waiting", "stalled", "error", "abort"].forEach((n) => a.addEventListener(n, () => {
      add("AUDIO", `${n}  t=${(a.currentTime || 0).toFixed(1)}/${Number.isFinite(a.duration) ? a.duration.toFixed(1) : "?"} paused=${a.paused} state=${a.readyState}${n === "error" && a.error ? " code=" + a.error.code : ""} …${tail(a.currentSrc || a.src)}`);
    }));
  };
  watch(); document.addEventListener("DOMContentLoaded", watch); setInterval(watch, 3000);

  /* ---------- Zustand ---------- */
  function glyphTable() {
    try {
      const cv = document.createElement("canvas").getContext("2d");
      cv.font = `16px ${getComputedStyle(document.body).fontFamily || "sans-serif"}`;
      const bad = cv.measureText("").width;
      return ["▸", "▾", "⏵", "▶", "❚", "★", "☆", "♪", "✓", "✕", "⏮", "⏭"].map((g) => `${g}${Math.abs(cv.measureText(g).width - bad) < 0.01 ? "✗" : "✓"}`).join(" ");
    } catch { return "?"; }
  }
  async function snapshot() {
    const L = []; const p = (k, v) => L.push(`${k}: ${v}`);
    const a = $("audio");
    L.push(`=== Protokoll ${new Date().toLocaleString("de-AT")} ===`);
    p("Seite", location.href.replace(/[?#].*$/, ""));
    let cache = "?"; try { cache = (await caches.keys()).join(", ") || "–"; } catch { /* egal */ }
    p("Zwischenspeicher", cache);
    try { const rs = navigator.serviceWorker && (await navigator.serviceWorker.getRegistrations()); p("Service Worker", rs && rs.length ? `${rs.length} aktiv, Controller=${!!navigator.serviceWorker.controller}` : "keiner"); } catch { /* egal */ }
    p("Browserkennung (UA)", navigator.userAgent);
    try { const d = navigator.userAgentData; if (d) p("UA-Daten", `${d.platform} · ${(d.brands || []).map((b) => b.brand + " " + b.version).join(", ")} · mobile=${d.mobile}`); } catch { /* egal */ }
    p("Plattform / Sprache", `${navigator.platform} · ${navigator.language}`);
    let tesla = "?"; try { tesla = String(isTesla()); } catch { /* egal */ }
    p("Als Tesla erkannt", `${tesla} (forceTesla=${lget("forceTesla", "–")}, Gerät=${(() => { try { return deviceKind(); } catch { return "?"; } })()})`);
    p("Bildschirm", `${screen.width}×${screen.height} · Fenster ${innerWidth}×${innerHeight} · Pixeldichte ${devicePixelRatio}`);
    p("Touch", `Punkte=${navigator.maxTouchPoints} · grober Zeiger=${matchMedia("(pointer: coarse)").matches} · hover=${matchMedia("(hover: hover)").matches}`);
    p("Dreiecke/Symbole", glyphTable());
    p("html-Klassen / Größe", `${document.documentElement.className || "–"} · selsize=${document.documentElement.dataset.selsize || "–"} · theme=${document.documentElement.dataset.theme || "–"}`);
    p("Media Session", "mediaSession" in navigator ? `vorhanden · playbackState=${navigator.mediaSession.playbackState}` : "FEHLT");
    try { const m = navigator.mediaSession.metadata; p("Anzeige im Player", m ? `„${m.title}“ · ${m.artist} · ${m.album} · Bilder=${(m.artwork || []).length}` : "keine Metadaten"); } catch { /* egal */ }
    p("Angemeldete Tasten", Object.keys(handlers).length ? Object.entries(handlers).map(([k, v]) => `${k}=${v}`).join(", ") : "(noch keine – erst nach Wahl eines Liedes)");
    if (a) {
      p("Player-Element", `<${a.tagName.toLowerCase()}> paused=${a.paused} ended=${a.ended} t=${(a.currentTime || 0).toFixed(1)}/${Number.isFinite(a.duration) ? a.duration.toFixed(1) : "?"} ready=${a.readyState} net=${a.networkState} muted=${a.muted} vol=${a.volume} Fehler=${a.error ? a.error.code : "–"}`);
      p("Quelle", tail(a.currentSrc || a.src) || "–");
    }
    p("Tasten-Tests", `silent=${lget("testSilent","1")} forceAudio=${lget("testForceAudio","0")} posAlways=${lget("testPosAlways","0")} reReg=${lget("testReReg","1")} keyVar=${lget("keyVar","0")}`);
    p("Tasten-Einstellungen", `mediaKeys=${lget("mediaKeys", "step")} · mediaHold=${lget("mediaHold", "–")} · favSeek=${lget("favSeek", "off")} · skipBack/Fwd=${lget("skipBack", "–")}/${lget("skipFwd", "–")}`);
    p("Weitere Einstellungen", `autoStart=${lget("autoStart", "–")} · resumeMode=${lget("resumeMode", "–")} · selSize=${lget("selSize", "auto")} · karaokeOnly=${lget("karaokeOnly", "–")} · musikLang=${lget("musikLang", "–")} · preset=${lget("presetActive", "–")}`);
    p("Stilles Dauersignal (Apple-Music-Schutz)", window.__v128ka ? "installiert" : "NICHT installiert");
    try { p("Lied", `Nr. ${state.songs[state.index] && state.songs[state.index].id} · wantPlay=${!!state.wantPlay} · userPaused=${!!state.userPaused} · Wiedergabe-Fassung=${state.curVersion || "–"}`); } catch { /* egal */ }
    p("Benutzer / Favoriten", `${lget("userName", "–")} / ${lget("sync-code", "–")}`);
    try { p("Netz", navigator.connection ? `${navigator.connection.effectiveType} ${navigator.connection.downlink} Mbit/s` : "?"); } catch { /* egal */ }
    L.push("", `--- Ereignisse (seit Seitenstart ${Math.round((Date.now() - T0) / 1000)} s, älteste zuerst) ---`);
    return L.join("\n") + "\n" + (log.slice(-150).join("\n") || "(keine)");
  }

  /* ---------- auf den Server speichern (Speicher „protokoll-…“, ohne Änderung am Worker) ---------- */
  async function toServer(name, text) {
    const base = typeof SYNC_BASE !== "undefined" ? SYNC_BASE : "";
    const r = await fetch(`${base}/sync/${name}`, { method: "PUT", headers: { "content-type": "text/plain; charset=utf-8" }, body: text });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return `${base || location.origin}/sync/${name}`;
  }

  /* ---------- Oberfläche unter „Anzeigegröße genau messen“ ---------- */
  const mkBtn = (t, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = t; b.onclick = fn; return b; };
  /* Anzeige-Protokoll: Knopf direkt unter „Anzeigegröße genau messen“ */
  function build() {
    const anchor = $("advMeasureOut"); if (!anchor || $("dspSaveBtn")) return;
    const msg = document.createElement("small"); msg.className = "set-hint"; msg.style.cssText = "display:block;word-break:break-all;user-select:text";
    const dsp = mkBtn("Anzeige-Protokoll auf dem Server speichern", async () => {
      const text = `=== Anzeige-Protokoll ${new Date().toLocaleString("de-AT")} ===\n${($("advInfo") && $("advInfo").textContent) || ""}\n\n${($("advMeasureOut") && $("advMeasureOut").textContent) || "(noch nicht gemessen – erst „Anzeigegröße genau messen“ drücken)"}\n\nBrowserkennung: ${navigator.userAgent}\nBildschirm ${screen.width}×${screen.height}, Fenster ${innerWidth}×${innerHeight}, Pixeldichte ${devicePixelRatio}, selsize=${document.documentElement.dataset.selsize || "–"}\n`;
      msg.textContent = "Wird gespeichert …";
      try { const u = await toServer("protokoll-anzeige", text); msg.textContent = `Gespeichert: ${u}`; } catch (e) { msg.textContent = "Speichern nicht möglich: " + e.message; }
    });
    dsp.id = "dspSaveBtn";
    anchor.after(dsp, msg);
  }
  /* Eigenes Untermenü „Fehlersuche“ (wird von v128.js eingebaut) */
  function makeBox() {
    const mk = mkBtn;
    const msg = document.createElement("small"); msg.className = "set-hint"; msg.style.cssText = "display:block;word-break:break-all;user-select:text";
    const box = document.createElement("div"); box.id = "dbgBox"; box.className = "autoplay-box";
    box.style.cssText = "display:grid;gap:8px";
    const h = document.createElement("b"); h.textContent = "Fehlersuche: Tasten und Gerät";
    const info = document.createElement("small"); info.className = "set-hint"; info.textContent = "Zeigt, was der Browser meldet und welche Tasten-Signale ankommen. Auf dem Server speichern, dann kann der Inhalt von dort abgerufen werden.";
    const ta = document.createElement("textarea"); ta.readOnly = true; ta.rows = 12; ta.style.cssText = "width:100%;font:12px/1.35 monospace;box-sizing:border-box"; ta.onclick = () => ta.select();
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";
    const refresh = async () => { ta.value = await snapshot(); ta.scrollTop = ta.scrollHeight; };
    row.append(mk("Protokoll anzeigen / aktualisieren", refresh),
      mk("Auf dem Server speichern", async () => { msg.textContent = "Wird gespeichert …"; try { const u = await toServer("protokoll-tasten", await snapshot()); await refresh(); msg.textContent = `Gespeichert: ${u}`; } catch (e) { msg.textContent = "Speichern nicht möglich: " + e.message; } }),
      mk("Ereignisse leeren", () => { log = []; try { localStorage.removeItem(KEY); } catch { /* egal */ } add("START", "Protokoll geleert"); refresh(); }));
    /* Tasten-Tests (wirken nach Neuladen) */
    const tests = document.createElement("div"); tests.style.cssText = "display:grid;gap:6px;border:1px dashed currentColor;border-radius:10px;padding:8px 10px";
    const tt = document.createElement("b"); tt.textContent = "Tasten-Tests (Tesla)"; tests.append(tt);
    const cb = (key, def, text) => { const l = document.createElement("label"); l.className = "set-row check"; const i = document.createElement("input"); i.type = "checkbox"; i.checked = lget(key, def) === "1"; i.onchange = () => { try { localStorage.setItem(key, i.checked ? "1" : "0"); } catch { /* egal */ } add("TEST", `${key}=${i.checked ? 1 : 0}`); }; l.append(i, " " + text); tests.append(l); };
    cb("testSilent", "1", "Stilles Dauersignal (Apple-Music-Schutz) aktiv");
    cb("testForceAudio", "0", "Echtes Audio-Element statt Video-Element verwenden");
    cb("testPosAlways", "0", "Position und Dauer laufend an Tesla melden");
    cb("testReReg", "1", "Tasten bei jedem Lied/Start neu anmelden");
    const vl = document.createElement("label"); vl.className = "set-row"; vl.append("Anmelde-Variante ");
    const sel = document.createElement("select"); [["0", "0 – Standard (Vor/Zurück + Spul-Tasten + seekto)"], ["1", "1 – nur Vor/Zurück"], ["2", "2 – Vor/Zurück + Spul-Tasten, ohne seekto"], ["4", "4 – erst 1,5 s nach Start anmelden"], ["5", "5 – wie 0 + Stopp-Taste"], ["6", "6 – nur Vor/Zurück + Stopp-Taste"], ["7", "7 – wie die alte Version (ohne Protokoll der Tasten, ohne Zusätze)"]].forEach(([v, n]) => { const o = document.createElement("option"); o.value = v; o.textContent = n; sel.append(o); });
    sel.value = lget("keyVar", "0"); sel.onchange = () => { try { localStorage.setItem("keyVar", sel.value); } catch { /* egal */ } add("TEST", `keyVar=${sel.value}`); };
    vl.append(sel); tests.append(vl);
    const rl = mk("Jetzt neu laden (Tests anwenden)", () => location.reload()); tests.append(rl);
    const ar = mk("▶ Geführten Testlauf starten (alle Varianten nacheinander)", startRun); ar.style.fontWeight = "800"; tests.insertBefore(ar, tests.children[1]);
    const th = document.createElement("small"); th.className = "set-hint"; th.textContent = "Ablauf: eine Einstellung ändern, neu laden, ein Lied wählen, schauen ob die Tesla-Tasten schwarz (aktiv) sind, danach das Protokoll auf dem Server speichern."; tests.append(th);
    box.append(h, info, tests, row, msg, ta);
    refresh();
    return box;
  }

  /* ---- Geführter Testlauf: stellt nacheinander alle Varianten ein, fragt je Variante „Tasten aktiv oder grau?“ und speichert alles im Protokoll ---- */
  const RUNKEY = "testRun";
  const VARS = [
    ["Standard", { keyVar: "0", testSilent: "1", testForceAudio: "0", testPosAlways: "0", testReReg: "1" }],
    ["wie die alte Version (7)", { keyVar: "7", testSilent: "1", testForceAudio: "0", testPosAlways: "0", testReReg: "1" }],
    ["nur Vor/Zurück (1)", { keyVar: "1", testSilent: "1", testForceAudio: "0", testPosAlways: "0", testReReg: "1" }],
    ["ohne seekto (2)", { keyVar: "2", testSilent: "1", testForceAudio: "0", testPosAlways: "0", testReReg: "1" }],
    ["mit Stopp-Taste (5)", { keyVar: "5", testSilent: "1", testForceAudio: "0", testPosAlways: "0", testReReg: "1" }],
    ["Audio-Element statt Video", { keyVar: "0", testSilent: "1", testForceAudio: "1", testPosAlways: "0", testReReg: "1" }],
    ["Audio-Element, ohne stilles Signal", { keyVar: "0", testSilent: "0", testForceAudio: "1", testPosAlways: "0", testReReg: "1" }],
    ["Position dauernd melden", { keyVar: "0", testSilent: "1", testForceAudio: "0", testPosAlways: "1", testReReg: "1" }],
    ["alles abgespeckt (nur Vor/Zurück, Audio, ohne stilles Signal, ohne Neuanmeldung)", { keyVar: "1", testSilent: "0", testForceAudio: "1", testPosAlways: "0", testReReg: "0" }]
  ];
  const KEYS = ["keyVar", "testSilent", "testForceAudio", "testPosAlways", "testReReg"];
  const rjson = () => { try { return JSON.parse(localStorage.getItem(RUNKEY) || "null"); } catch { return null; } };
  const wjson = (o) => { try { if (o) localStorage.setItem(RUNKEY, JSON.stringify(o)); else localStorage.removeItem(RUNKEY); } catch { /* egal */ } };
  const apply = (set) => KEYS.forEach((k) => { try { localStorage.setItem(k, set[k]); } catch { /* egal */ } });
  function startRun() {
    const orig = {}; KEYS.forEach((k) => { orig[k] = lget(k, ""); });
    add("TESTLAUF", "Start (" + VARS.length + " Varianten)");
    wjson({ i: 0, res: [], orig });
    apply(VARS[0][1]); location.reload();
  }
  function endRun(run) {
    KEYS.forEach((k) => { try { if (run.orig[k] === "") localStorage.removeItem(k); else localStorage.setItem(k, run.orig[k]); } catch { /* egal */ } });
    wjson(null);
    const sum = run.res.map((r, n) => `${n + 1}. ${VARS[n][0]}: ${r}`).join("\n");
    add("TESTLAUF", "Ende\n" + sum);
    return sum;
  }
  async function continueRun() {
    const run = rjson(); if (!run || typeof uiDialog !== "function") return;
    const i = run.i; if (i >= VARS.length) { endRun(run); return; }
    /* warten, bis ein Lied spielt (max. 12 s) */
    for (let n = 0; n < 24; n++) { try { if (el.audio && !el.audio.paused && el.audio.currentTime > 0.5) break; } catch { /* egal */ } await new Promise((r) => setTimeout(r, 500)); }
    let playing = false, handlers = ""; try { playing = !el.audio.paused; handlers = String(navigator.mediaSession && navigator.mediaSession.playbackState); } catch { /* egal */ }
    add("TESTLAUF", `Variante ${i + 1}/${VARS.length}: ${VARS[i][0]} · spielt=${playing} · Session=${handlers} · ${el.audio && el.audio.tagName}`);
    const r = await uiDialog({ eyebrow: `Testlauf ${i + 1} von ${VARS.length}`, title: VARS[i][0],
      lines: ["Schau jetzt auf die Tesla-Tasten (Zurück / Vor) und drücke sie einmal.", "Läuft kein Lied, starte bitte eins (Antippen), dann erst antworten.", "Wie sehen die Tasten aus?"],
      buttons: [{ value: "ok", kind: "primary", label: "Aktiv (schwarz / funktioniert)" }, { value: "grau", label: "Grau" }, { value: "stop", kind: "cancel", label: "Testlauf beenden" }], cancelValue: "stop" });
    if (r === "stop") { const sum = endRun(run); await finish(sum, true); return; }
    run.res.push(r === "ok" ? "AKTIV" : "grau");
    add("TESTLAUF", `Ergebnis ${i + 1}: ${run.res[i]}`);
    run.i = i + 1;
    if (run.i >= VARS.length) { const sum = endRun(run); await finish(sum, false); return; }
    wjson(run); apply(VARS[run.i][1]); location.reload();
  }
  async function finish(sum, aborted) {
    let u = "";
    try { u = await toServer("protokoll-tasten", await snapshot()); } catch { u = "(Speichern auf dem Server fehlgeschlagen – im Protokoll-Feld kopieren)"; }
    await uiDialog({ eyebrow: "Testlauf", title: aborted ? "Testlauf beendet" : "Testlauf fertig", lines: [sum.split("\n").join(" · "), "Protokoll gespeichert: " + u, "Deine vorherigen Einstellungen sind wieder hergestellt (Seite neu laden)."], buttons: [{ value: "ok", kind: "primary", label: "OK" }] });
    location.reload();
  }
  if (rjson()) { const go = () => setTimeout(continueRun, 2500); if (document.readyState === "complete") go(); else window.addEventListener("load", go); }
  window.V167 = { makeBox, startRun };
  const mo = new MutationObserver(build); mo.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
