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
    if ("mediaSession" in navigator && window.MediaSession) {
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
    const sel = document.createElement("select"); [["0", "0 – Standard (Vor/Zurück + Spul-Tasten + seekto)"], ["1", "1 – nur Vor/Zurück"], ["2", "2 – Vor/Zurück + Spul-Tasten, ohne seekto"], ["4", "4 – erst 1,5 s nach Start anmelden"], ["5", "5 – wie 0 + Stopp-Taste"], ["6", "6 – nur Vor/Zurück + Stopp-Taste"]].forEach(([v, n]) => { const o = document.createElement("option"); o.value = v; o.textContent = n; sel.append(o); });
    sel.value = lget("keyVar", "0"); sel.onchange = () => { try { localStorage.setItem("keyVar", sel.value); } catch { /* egal */ } add("TEST", `keyVar=${sel.value}`); };
    vl.append(sel); tests.append(vl);
    const rl = mk("Jetzt neu laden (Tests anwenden)", () => location.reload()); tests.append(rl);
    const th = document.createElement("small"); th.className = "set-hint"; th.textContent = "Ablauf: eine Einstellung ändern, neu laden, ein Lied wählen, schauen ob die Tesla-Tasten schwarz (aktiv) sind, danach das Protokoll auf dem Server speichern."; tests.append(th);
    box.append(h, info, tests, row, msg, ta);
    refresh();
    return box;
  }
  window.V167 = { makeBox };
  const mo = new MutationObserver(build); mo.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
