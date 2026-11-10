/* v152: Startseite – Video (Chor) als echtes MP4 mit GIF-Rückfall, und Vollbild für die Anzeige */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let failed = false, timer = 0;

  /* ---------- Video (Chor) ---------- */
  function showImg(on) { const im = document.querySelector("#startMedia > .start-image"); if (im) im.classList.toggle("chor-hide", !on); }
  function dropVideo() { const v = $("startChorVid"); if (v) { try { v.pause(); } catch { /* egal */ } v.remove(); } clearTimeout(timer); }
  function giveUp() { failed = true; dropVideo(); showImg(true); }
  function sync() {
    const media = $("startMedia"), im = media && media.querySelector(".start-image");
    if (!media || !im) return;
    const want = (im.getAttribute("src") || "").startsWith("chor.gif");
    let v = $("startChorVid");
    if (!want) { if (v) dropVideo(); showImg(true); failed = false; return; }
    if (failed) { showImg(true); return; }
    if (!v) {
      v = document.createElement("video"); v.id = "startChorVid"; v.className = "start-vid";
      v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.controls = false;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.setAttribute("disablepictureinpicture", "");
      v.preload = "auto"; v.poster = "start-bg.png";
      v.addEventListener("error", giveUp);
      v.addEventListener("playing", () => { clearTimeout(timer); showImg(false); });
      v.src = "chor.mp4";
      im.after(v);
      /* Läuft das Video nicht an (z. B. Tesla blockiert Video, Stromsparmodus), nach 4 s das GIF zeigen */
      timer = setTimeout(() => { if (v.paused || v.readyState < 3) giveUp(); }, 4000);
    }
    const p = v.play && v.play(); if (p && p.catch) p.catch(() => { /* Timer entscheidet */ });
  }
  const retry = () => { const v = $("startChorVid"); if (v && v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { retry(); sync(); } });
  document.addEventListener("pointerdown", retry, { passive: true });

  /* ---------- Vollbild ---------- */
  const FS_ON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M5 5h5v2H7v3H5V5zm9 0h5v5h-2V7h-3V5zM5 14h2v3h3v2H5v-5zm12 0h2v5h-5v-2h3v-3z"/></svg>';
  const FS_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5h2v5H5V8h3V5zm6 0h2v3h3v2h-5V5zM5 14h5v5H8v-3H5v-2zm9 0h5v2h-3v3h-2v-5z"/></svg>';
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  function resized() { setTimeout(() => window.dispatchEvent(new Event("resize")), 60); setTimeout(() => window.dispatchEvent(new Event("resize")), 400); }
  function setFs(on) {
    const m = $("startMedia"), b = $("startFsBtn"); if (!m) return;
    m.classList.toggle("fs", on); document.documentElement.classList.toggle("start-fs-active", on);
    if (b) { b.innerHTML = on ? FS_OFF : FS_ON; b.title = on ? "Vollbild beenden" : "Nur diese Anzeige im Vollbild"; b.setAttribute("aria-label", b.title); }
    resized();
  }
  async function toggleFs() {
    const m = $("startMedia"); if (!m) return;
    if (m.classList.contains("fs")) {
      try { if (isFs()) { await (document.exitFullscreen || document.webkitExitFullscreen).call(document); } } catch { /* egal */ }
      setFs(false); return;
    }
    setFs(true);   /* Vollbild per CSS – klappt auch dort, wo der Browser keins erlaubt (iPhone, Tesla) */
    try { const rq = m.requestFullscreen || m.webkitRequestFullscreen; if (rq) await rq.call(m); } catch { /* CSS-Vollbild bleibt */ }
  }
  ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, () => { if (!isFs() && $("startMedia") && $("startMedia").classList.contains("fs")) setFs(false); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("startMedia") && $("startMedia").classList.contains("fs")) setFs(false); });


  /* ---------- Pop-ups im Browser-Vollbild (Galerie): Dialog und Hinweis in das Vollbild-Element verschieben ---------- */
  const POP = ["dialogModal", "toast"];
  function movePops() {
    const fe = document.fullscreenElement || document.webkitFullscreenElement;
    POP.forEach((id) => { const n = $(id) || (pops[id]); if (!n) return; pops[id] = n; const host = fe && fe.tagName !== "VIDEO" ? fe : document.body; if (n.parentNode !== host) host.append(n); });
  }
  const pops = {};
  POP.forEach((id) => { const n = $(id); if (n) pops[id] = n; });
  ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, movePops));
  /* wird das Vollbild-Element (z. B. die Galerie) entfernt, die Pop-ups zurück in die Seite holen */
  new MutationObserver(() => { POP.forEach((id) => { const n = pops[id]; if (n && !n.isConnected) document.body.append(n); }); }).observe(document.body, { childList: true });

  /* ---------- Lange drücken (2 s) auf „10 Lieder“ / „30 %“ in „Ähnliche Lieder“: Wert ändern ---------- */
  (function () {
    const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
    let tm = 0, sx = 0, sy = 0;
    const clear = () => { clearTimeout(tm); tm = 0; };
    async function edit(kind) {
      const auto = lsv("simMin", "30") === "auto";
      const pct = kind === "pct" && !auto;
      const cur = pct ? lsv("simMin", "30") : lsv("simTop", "10");
      const v = await uiPrompt(pct
        ? { eyebrow: "Ähnliche Lieder", title: "Genauigkeit in Prozent", text: "Mindest-Ähnlichkeit, 10 bis 90 %. Höher = weniger, aber ähnlichere Lieder.", value: String(parseInt(cur) || 30), type: "number", inputMode: "numeric", ok: "Übernehmen" }
        : { eyebrow: "Ähnliche Lieder", title: "Anzahl der Lieder", text: auto ? "Automatik: so viele ähnlichste Lieder werden gezeigt (1 bis 60)." : "Anzahl der ähnlichsten Lieder bei Automatik (1 bis 60). Die Zahl gilt, sobald „Auto“ aktiv ist.", value: String(parseInt(cur) || 10), type: "number", inputMode: "numeric", ok: "Übernehmen" });
      if (v == null || v === false || String(v).trim() === "") return;
      const n = Math.round(Number(String(v).replace(",", ".")));
      if (!isFinite(n)) return;
      try { localStorage.setItem(pct ? "simMin" : "simTop", String(pct ? Math.max(10, Math.min(90, n)) : Math.max(1, Math.min(60, n)))); } catch { /* egal */ }
      if (window.V131 && V131.refresh) V131.refresh();
    }
    document.addEventListener("pointerdown", (e) => {
      const t = e.target && e.target.closest && e.target.closest("#simOut, #simCnt, .sim-pct-edit");
      if (!t) return;
      clear(); sx = e.clientX; sy = e.clientY;
      tm = setTimeout(() => { tm = 0; edit(t.id === "simOut" ? "pct" : "cnt"); }, 2000);
    }, true);
    document.addEventListener("pointermove", (e) => { if (tm && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) clear(); }, true);
    ["pointerup", "pointercancel"].forEach((ev) => document.addEventListener(ev, clear, true));
    document.addEventListener("contextmenu", (e) => { if (e.target && e.target.closest && e.target.closest("#simOut, #simCnt")) e.preventDefault(); }, true);
  })();

  /* ---------- Reiter „Vorschau“ (Einstellungen → Allgemein) ---------- */
  (function () {
    const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
    const lss = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
    const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
    /* Auflösungen aus den Screenshots: Desktop-Fenster 2032 × 1169 px, Handy 393 × 793 px, Tesla 804 × 638 px */
    const DEV = [["desk", "🖥 Desktop", 2032, 1169], ["phone", "📱 Handy", 393, 793], ["tesla", "🚗 Tesla", 804, 638]];
    const DYN = ["pl", "lang", "cast", "ki", "langList"];   /* Knöpfe, die die App erst zur Laufzeit baut – die Vorschau zeichnet Platzhalter */
    let dev = lsv("pvwDev", "desk"), lupe = false, fr = null, stage = null, info = null, tmr = 0, built = false;
    const items = () => (typeof SV_ITEMS !== "undefined" ? SV_ITEMS : []);
    const on = (x) => lsv("sv_" + x[0], x[3]) === "1";
    const sideHidden = () => lsv("sideHide", "0") === "1";
    const themeId = () => lsv("pvwTheme", "") || ((window.THEME && THEME.cfg && THEME.cfg().mode === "manual" && THEME.cfg().theme) || document.documentElement.getAttribute("data-skin") || document.documentElement.getAttribute("data-theme") || "klassisch");
    function url() {
      const T = window.THEME, id = themeId(), th = T && T.byId ? T.byId(id) : null;
      const hide = lupe ? [] : items().filter((x) => x[2] && !on(x)).map((x) => x[2]);
      const dyn = items().filter((x) => DYN.includes(x[0]) && (lupe || on(x))).map((x) => x[0]);
      const r = document.documentElement;
      const sk = th ? (th.skin ? 1 : 0) : (r.hasAttribute("data-skin") ? 1 : 0), lt = th ? (th.light ? 1 : 0) : (r.getAttribute("data-light") === "1" ? 1 : 0);
      const d = DEV.find((x) => x[0] === dev) || DEV[0];
      return `vorschau.html?t=${encodeURIComponent(id)}&s=${sk}&l=${lt}&v=play&b=${encodeURIComponent(typeof SYNC_BASE !== "undefined" ? SYNC_BASE : location.origin)}&hide=${encodeURIComponent(hide.join("|"))}&dyn=${dyn.join(",")}&lupe=${lupe ? 1 : 0}&side=${sideHidden() ? 0 : 1}&d=${d[0]}&_=${Date.now() % 100000}`;
    }
    function fit() {
      if (!built || !stage || !fr || !stage.clientWidth) return;
      const d = DEV.find((x) => x[0] === dev) || DEV[0], W = d[2], H = d[3];
      const aw = stage.clientWidth - 8, ah = stage.clientHeight - 8, s = Math.max(0.05, Math.min(aw / W, ah / H, 1));
      fr.style.width = W + "px"; fr.style.height = H + "px"; fr.style.transform = `scale(${s})`;
      stage.firstChild.style.width = Math.round(W * s) + "px"; stage.firstChild.style.height = Math.round(H * s) + "px";
      info.textContent = `${d[1].replace(/^\S+\s/, "")} · ${W} × ${H} px · Anzeige ${Math.round(s * 100)} %`;
    }
    function reload() { clearTimeout(tmr); tmr = setTimeout(() => { if (fr) fr.src = url(); }, 100); }
    function applySide() { try { if (typeof setSidebar === "function") setSidebar(!sideHidden()); } catch { /* egal */ } }
    function build(box) {
      box.replaceChildren(); built = true;
      const head = h("p", "ap-title", "Vorschau: Wiedergabe-Fenster"); box.append(head);
      box.append(h("small", "set-hint", "Zeigt die aktuellen Einstellungen. Änderungen hier gelten sofort auch für die App auf diesem Gerät."));
      const bar = h("div", "pvw-bar");
      const devs = h("div", "pvw-devs");
      DEV.forEach((d) => { const b = h("button", "pvw-dev" + (d[0] === dev ? " on" : ""), d[1]); b.type = "button"; b.dataset.d = d[0]; b.addEventListener("click", () => { dev = d[0]; lss("pvwDev", dev); devs.querySelectorAll(".pvw-dev").forEach((x) => x.classList.toggle("on", x.dataset.d === dev)); fit(); reload(); }); devs.append(b); });
      const chk = (label, val, fn) => { const l = h("label", "pvw-lupe"); const c = h("input"); c.type = "checkbox"; c.checked = val; c.addEventListener("change", () => fn(c.checked)); l.append(c, document.createTextNode(" " + label)); return l; };
      const sel = h("select", "pvw-sel"); sel.setAttribute("aria-label", "Design der Vorschau");
      const T = window.THEME; const cur = themeId();
      const o0 = h("option", "", "Design: wie in der App"); o0.value = ""; sel.append(o0);
      (T && T.THEMES ? T.THEMES : []).forEach((x) => { const o = h("option", "", x.name); o.value = x.id; sel.append(o); });
      sel.value = lsv("pvwTheme", ""); sel.addEventListener("change", () => { lss("pvwTheme", sel.value); reload(); });
      const big = h("button", "pvw-dev pvw-bigbtn", "⤢ Größer"); big.type = "button"; big.title = "Vorschau im ganzen Fenster anzeigen (Esc = zurück)";
      big.addEventListener("click", () => { const on2 = box.classList.toggle("pvw-big"); big.textContent = on2 ? "⤡ Kleiner" : "⤢ Größer"; document.documentElement.classList.toggle("pvw-big-on", on2); setTimeout(fit, 50); setTimeout(fit, 350); });
      bar.append(devs, big, chk("Lupe aktiv (zeigt alle Knöpfe)", lupe, (v) => { lupe = v; reload(); }), chk("Seitenleiste (Auswahlfenster) ausblenden", sideHidden(), (v) => { lss("sideHide", v ? "1" : "0"); applySide(); reload(); }), sel);
      const side = h("div", "pvw-side");
      side.append(h("p", "pvw-hint", "Haken = Knopf wird angezeigt (ohne Lupe)."));
      items().forEach((x) => {
        const row = h("label", "pvw-row"); const c = h("input"); c.type = "checkbox"; c.checked = on(x);
        c.addEventListener("change", () => { lss("sv_" + x[0], c.checked ? "1" : "0"); try { window.dispatchEvent(new Event("storage")); } catch { /* egal */ } reload(); });
        row.append(c, h("span", "", x[1])); side.append(row);
      });
      stage = h("div", "pvw-stage"); const wrap = h("div", "pvw-wrap"); fr = h("iframe", "pvw-fr"); fr.setAttribute("title", "Vorschau"); wrap.append(fr); stage.append(wrap);
      info = h("small", "pvw-info");
      const right = h("div", "pvw-right"); right.append(stage, info);
      const main = h("div", "pvw-main"); main.append(side, right);
      box.append(bar, main);
      fr.src = url(); requestAnimationFrame(() => { fit(); setTimeout(fit, 300); });
    }
    function ensure() {
      const tabs = $("subTabs"), pb = $("presetBox"); if (!tabs || !pb) return;
      if (!tabs.querySelector('[data-sub="vorschau"]')) {
        const b = h("button", "seg-btn", "Vorschau"); b.type = "button"; b.dataset.sub = "vorschau";
        b.addEventListener("click", () => { try { state.sub = "vorschau"; showSetTab("allgemein"); } catch { /* egal */ } });
        const after = tabs.querySelector('[data-sub="vor"]'); if (after) after.after(b); else tabs.append(b);
      }
      if (!$("pvwBox")) {
        const box = h("div", "autoplay-box pvw-box tab-off"); box.id = "pvwBox"; box.dataset.tab = "allgemein"; box.dataset.sub = "vorschau";
        pb.after(box);
        let wasOff = true; new MutationObserver(() => { const off = box.classList.contains("tab-off"); if (off === wasOff) return; wasOff = off; if (!off) { build(box); } else { built = false; fr = null; box.classList.remove("pvw-big"); document.documentElement.classList.remove("pvw-big-on"); } }).observe(box, { attributes: true, attributeFilter: ["class"] });
      }
    }
    window.addEventListener("resize", fit);
    document.addEventListener("keydown", (e) => { const bx = $("pvwBox"); if (e.key === "Escape" && bx && bx.classList.contains("pvw-big")) { const b = bx.querySelector(".pvw-bigbtn"); if (b) b.click(); } });
    new MutationObserver(ensure).observe(document.body, { childList: true, subtree: true }); ensure();
    /* Seitenleiste: gespeicherte Einstellung beim Start anwenden */
    if (sideHidden()) [1200, 3500].forEach((ms) => setTimeout(applySide, ms));
  })();

  function ensureBtn() {
    const m = $("startMedia"); if (!m) return;
    if (!$("startFsBtn")) {
      const b = document.createElement("button"); b.id = "startFsBtn"; b.type = "button"; b.className = "start-fs-btn"; b.innerHTML = FS_ON;
      b.title = "Nur diese Anzeige im Vollbild"; b.setAttribute("aria-label", b.title);
      b.addEventListener("click", (e) => { e.stopPropagation(); toggleFs(); });
      m.append(b);
    }
    sync();
  }
  const mo = new MutationObserver(() => { ensureBtn(); });
  const start = () => { ensureBtn(); mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] }); setInterval(sync, 3000); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
