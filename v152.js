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
    if (failed || /Tesla/i.test(navigator.userAgent)) { showImg(true); return; }   /* Tesla sperrt Video in Fahrt → gleich das GIF zeigen */
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
    /* Entwurf: Änderungen in der Vorschau werden erst beim Speichern übernommen */
    const draft = {};
    const SAVED = { ly: () => String(Number(lsv("teslaKaraokeLyricsScale", "42")) || 42), ls: () => String(Number(lsv("teslaKaraokeListSize", "16")) || 16) };
    const dget = (k, d) => (k in draft ? draft[k] : d);
    const dirty = () => Object.keys(draft).length > 0;
    const on = (x) => dget("sv_" + x[0], lsv("sv_" + x[0], x[3])) === "1";
    const sideHidden = () => dget("sideHide", lsv("sideHide", "0")) === "1";
    const fLy = () => Number(dget("ly", SAVED.ly())), fLs = () => Number(dget("ls", SAVED.ls()));
    const setD = (k, v, saved) => { if (String(v) === String(saved)) delete draft[k]; else draft[k] = String(v); paintDirty(); };
    let dirtyEl = null;
    function paintDirty() { if (dirtyEl) { dirtyEl.hidden = !dirty(); } }
    function save() {
      Object.keys(draft).forEach((k) => {
        if (k === "ly") { lss("teslaKaraokeLyricsScale", draft[k]); try { state.scale = Number(draft[k]); if (typeof applyScale === "function") applyScale(); } catch { /* egal */ } }
        else if (k === "ls") { lss("teslaKaraokeListSize", draft[k]); try { state.listSize = Number(draft[k]); if (typeof applyListSize === "function") applyListSize(); } catch { /* egal */ } }
        else lss(k, draft[k]);
      });
      const sideChanged = "sideHide" in draft;
      Object.keys(draft).forEach((k) => delete draft[k]);
      try { window.dispatchEvent(new Event("storage")); } catch { /* egal */ }
      if (sideChanged) applySide();
    }
    function discard() { Object.keys(draft).forEach((k) => delete draft[k]); }
    let asking = false;
    async function leaveCheck() {
      if (!dirty() || asking) return;
      asking = true;
      let r = "keep";
      try {
        r = await uiDialog({ eyebrow: "Vorschau", title: "Änderungen speichern?", lines: ["In der Vorschau wurde etwas geändert. Soll es übernommen werden, oder zurück zum Ausgangspunkt?"], buttons: [{ value: "save", kind: "primary", label: "Speichern" }, { value: "discard", label: "Verwerfen (zurücksetzen)" }, { value: "keep", kind: "cancel", label: "Weiter bearbeiten" }], cancelValue: "keep" });
      } catch { r = "keep"; }
      asking = false;
      if (r === "save") save(); else if (r === "discard") discard();
      else { try { state.sub = "vorschau"; showSetTab("allgemein"); } catch { /* egal */ } }
    }
    const themeId = () => lsv("pvwTheme", "") || ((window.THEME && THEME.cfg && THEME.cfg().mode === "manual" && THEME.cfg().theme) || document.documentElement.getAttribute("data-skin") || document.documentElement.getAttribute("data-theme") || "klassisch");
    function url() {
      const T = window.THEME, id = themeId(), th = T && T.byId ? T.byId(id) : null;
      const hide = lupe ? [] : items().filter((x) => x[2] && !on(x)).map((x) => x[2]);
      const dyn = items().filter((x) => DYN.includes(x[0]) && (lupe || on(x))).map((x) => x[0]);
      const r = document.documentElement;
      const sk = th ? (th.skin ? 1 : 0) : (r.hasAttribute("data-skin") ? 1 : 0), lt = th ? (th.light ? 1 : 0) : (r.getAttribute("data-light") === "1" ? 1 : 0);
      const d = DEV.find((x) => x[0] === dev) || DEV[0];
      return `vorschau.html?t=${encodeURIComponent(id)}&s=${sk}&l=${lt}&v=play&b=${encodeURIComponent(typeof SYNC_BASE !== "undefined" ? SYNC_BASE : location.origin)}&hide=${encodeURIComponent(hide.join("|"))}&dyn=${dyn.join(",")}&lupe=${lupe ? 1 : 0}&side=${sideHidden() ? 0 : 1}&ly=${fLy()}&ls=${fLs()}&d=${d[0]}&_=${Date.now() % 100000}`;
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
      /* Benutzer wählen und gleich zu ihm umschalten */
      const usr = h("select", "pvw-sel pvw-usr"); usr.setAttribute("aria-label", "Benutzer");
      try {
        const uk = typeof userKnown === "function" ? userKnown() : [], un = typeof userName === "function" ? userName() : "";
        const add = (v, tx) => { const o = h("option", "", tx); o.value = v; usr.append(o); };
        add("", "Benutzer: keiner"); uk.forEach((n) => add(n, "Benutzer: " + n)); add("__other", "＋ Anderen Benutzer eingeben …"); usr.value = un && uk.includes(un) ? un : "";
      } catch { usr.hidden = true; }
      const umsg = h("small", "pvw-umsg", "");
      /* Anderen Benutzer eingeben: nur anzeigen, wenn es ihn auf dem Server gibt; Haken = für immer in diesem Browser merken */
      const uo = h("div", "pvw-uo"); uo.hidden = true;
      const uin = h("input"); uin.type = "text"; uin.placeholder = "Benutzername"; uin.autocomplete = "off"; uin.autocapitalize = "off";
      const ulab = h("label", "pvw-lupe"); const uck = h("input"); uck.type = "checkbox"; ulab.append(uck, document.createTextNode(" Für immer in diesem Browser anzeigen"));
      const ugo = h("button", "chip", "Prüfen und umschalten"); ugo.type = "button";
      uo.append(uin, ulab, ugo);
      const switchTo = async (name) => {
        umsg.textContent = "Bitte warten …";
        try { const r = await userLogin(name, ""); umsg.textContent = r && r.msg ? r.msg : ""; } catch { umsg.textContent = "Umschalten nicht möglich."; }
        setTimeout(() => { if (!box.classList.contains("tab-off")) { const keep = box.classList.contains("pvw-big"); build(box); if (keep) box.querySelector(".pvw-bigbtn").click(); } }, 900);
      };
      ugo.addEventListener("click", async () => {
        const name = typeof userCleanName === "function" ? userCleanName(uin.value) : uin.value.trim().toLowerCase();
        if (name.length < 2 || name.startsWith("_")) { umsg.textContent = "Benutzername: mindestens 2 Zeichen, nicht mit _ beginnen."; return; }
        umsg.textContent = "Suche …";
        let r; try { r = await fetchUser(name, ""); } catch { r = { state: "error" }; }
        if (r.state === "error") { umsg.textContent = "Server nicht erreichbar."; return; }
        if (r.state === "none") { umsg.textContent = `„${name}“ gibt es nicht.`; return; }
        if (uck.checked) { try { userKnownAdd([name]); } catch { /* egal */ } }
        await switchTo(name);
      });
      usr.addEventListener("change", async () => {
        if (usr.value === "__other") { uo.hidden = false; uin.focus(); umsg.textContent = ""; return; }
        uo.hidden = true;
        umsg.textContent = "Bitte warten …";
        try {
          if (usr.value === "") { userLogout(); umsg.textContent = "Abgemeldet."; }
          else { const r = await userLogin(usr.value, ""); umsg.textContent = r && r.msg ? r.msg : ""; }
        } catch { umsg.textContent = "Umschalten nicht möglich."; }
        setTimeout(() => { if (!box.classList.contains("tab-off")) { const keep = box.classList.contains("pvw-big"); build(box); if (keep) box.querySelector(".pvw-bigbtn").click(); } }, 900);
      });
      const sel = h("select", "pvw-sel"); sel.setAttribute("aria-label", "Design der Vorschau");
      const T = window.THEME; const cur = themeId();
      const o0 = h("option", "", "Design: wie in der App"); o0.value = ""; sel.append(o0);
      (T && T.THEMES ? T.THEMES : []).forEach((x) => { const o = h("option", "", x.name); o.value = x.id; sel.append(o); });
      sel.value = lsv("pvwTheme", ""); sel.addEventListener("change", () => { lss("pvwTheme", sel.value); reload(); });
      const big = h("button", "pvw-bigbtn"); big.type = "button"; big.innerHTML = FS_ON; big.title = "Vorschau im ganzen Fenster anzeigen (Esc = zurück)"; big.setAttribute("aria-label", big.title);
      big.addEventListener("click", () => { const on2 = box.classList.toggle("pvw-big"); big.innerHTML = on2 ? FS_OFF : FS_ON; big.title = on2 ? "Vorschau wieder klein (Esc)" : "Vorschau im ganzen Fenster anzeigen (Esc = zurück)"; document.documentElement.classList.toggle("pvw-big-on", on2); setTimeout(fit, 50); setTimeout(fit, 350); });
      /* Liste der Knöpfe: ein Knopf wechselt zwischen „links neben der Vorschau“ und „darunter“ */
      const lay = h("button", "pvw-dev pvw-laybtn"); lay.type = "button";
      const layPaint = () => { const left = lsv("pvwLay", "below") === "left"; lay.textContent = left ? "◧ Liste links" : "⬓ Liste unten"; lay.title = "Liste der Knöpfe: links oder unten (antippen zum Wechseln)"; box.classList.toggle("pvw-lay-left", left); };
      lay.addEventListener("click", () => { lss("pvwLay", lsv("pvwLay", "below") === "left" ? "below" : "left"); layPaint(); setTimeout(fit, 80); setTimeout(fit, 350); });
      layPaint();
      bar.append(devs, lay, chk("Lupe aktiv (zeigt alle Knöpfe)", lupe, (v) => { lupe = v; reload(); }), chk("Seitenleiste (Auswahlfenster) ausblenden", sideHidden(), (v) => { setD("sideHide", v ? "1" : "0", lsv("sideHide", "0")); reload(); }), sel, usr, big);
      const side = h("div", "pvw-side");
      const fnt = (label, key, min, max, step, get, saved) => {
        const row = h("label", "pvw-font"); const lab = h("span", "", label + ": "); const val = h("b", "", get() + " px");
        const r = h("input"); r.type = "range"; r.min = String(min); r.max = String(max); r.step = String(step); r.value = String(get());
        r.addEventListener("input", () => { val.textContent = r.value + " px"; setD(key, r.value, saved()); reload(); });
        lab.append(val); row.append(lab, r); return row;
      };
      side.append(fnt("Schrift Karaoke-Text", "ly", 10, 200, 2, fLy, SAVED.ly), fnt("Schrift Seitenleiste", "ls", 12, 36, 1, fLs, SAVED.ls));
      side.append(h("p", "pvw-hint", "Haken = Knopf wird angezeigt (ohne Lupe). Änderungen hier gelten erst nach „Speichern“."));
      items().forEach((x) => {
        const row = h("label", "pvw-row"); const c = h("input"); c.type = "checkbox"; c.checked = on(x);
        c.addEventListener("change", () => { setD("sv_" + x[0], c.checked ? "1" : "0", lsv("sv_" + x[0], x[3])); reload(); });
        row.append(c, h("span", "", x[1])); side.append(row);
      });
      stage = h("div", "pvw-stage"); const wrap = h("div", "pvw-wrap"); fr = h("iframe", "pvw-fr"); fr.setAttribute("title", "Vorschau"); wrap.append(fr); stage.append(wrap);
      info = h("small", "pvw-info");
      const right = h("div", "pvw-right"); right.append(stage, info);
      const main = h("div", "pvw-main"); main.append(side, right);
      const act = h("div", "pvw-act");
      const sv = h("button", "chip primary-chip", "💾 Speichern"); sv.type = "button"; sv.addEventListener("click", () => { save(); paintDirty(); umsg.textContent = "Gespeichert."; });
      const rs = h("button", "chip", "↺ Zurücksetzen"); rs.type = "button"; rs.title = "Alle Änderungen verwerfen und zum gespeicherten Stand zurück"; rs.addEventListener("click", () => { discard(); build(box); });
      dirtyEl = h("small", "pvw-dirty", "● nicht gespeichert"); dirtyEl.hidden = !dirty();
      act.append(sv, rs, dirtyEl);
      box.append(bar, act, uo, umsg, main);
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
        let wasOff = true; new MutationObserver(() => { const off = box.classList.contains("tab-off"); if (off === wasOff) return; wasOff = off; if (!off) { build(box); } else { built = false; fr = null; box.classList.remove("pvw-big"); document.documentElement.classList.remove("pvw-big-on"); leaveCheck(); } }).observe(box, { attributes: true, attributeFilter: ["class"] });
      }
    }
    window.addEventListener("resize", fit);
    setInterval(() => { const bx = $("pvwBox"); if (dirty() && bx && !asking && bx.offsetParent === null && !bx.classList.contains("pvw-big")) leaveCheck(); }, 700);
    document.addEventListener("keydown", (e) => { const bx = $("pvwBox"); if (e.key === "Escape" && bx && bx.classList.contains("pvw-big")) { const b = bx.querySelector(".pvw-bigbtn"); if (b) b.click(); } });
    new MutationObserver(ensure).observe(document.body, { childList: true, subtree: true }); ensure();
    /* Seitenleiste: gespeicherte Einstellung beim Start anwenden */
    if (sideHidden()) [1200, 3500].forEach((ms) => setTimeout(applySide, ms));
  })();

  /* ---------- Abmelden (hinter einem Pfeil) in „Sichern“ und „Favoriten-Abgleich“/„Daten“ ---------- */
  (function () {
    const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
    const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
    function make(tab) {
      const wrap = h("div", "lo-wrap tab-off"); wrap.dataset.tab = tab; wrap.dataset.lo = "1";
      const tg = h("button", "pw-toggle", "▸ Abmelden"); tg.type = "button"; tg.setAttribute("aria-expanded", "false");
      const box = h("div", "lo-box"); box.hidden = true;
      const st = h("small", "set-hint", "");
      const paint = () => { const u = lsv("userName", ""), c = lsv("sync-code", ""); st.textContent = `Benutzer: ${u || "nicht angemeldet"} · Favoriten-Code: ${c || "keiner"}`; ub.disabled = !u; cb.disabled = !c; };
      const ub = h("button", "chip", "Vom Benutzer abmelden"); ub.type = "button";
      const cb = h("button", "chip", "Vom Favoriten-Code abmelden"); cb.type = "button";
      const msg = h("small", "set-hint", "");
      ub.addEventListener("click", async () => {
        const ok = await uiConfirm({ eyebrow: "Abmelden", title: "Vom Benutzer abmelden?", lines: ["Die Werte auf diesem Gerät bleiben bestehen."], ok: "Abmelden", cancel: "Zurück" });
        if (!ok) return;
        try { userLogout(); } catch { /* egal */ }
        try { if (typeof renderPresetBox === "function") renderPresetBox(); } catch { /* egal */ }
        msg.textContent = "Vom Benutzer abgemeldet."; paint();
      });
      cb.addEventListener("click", async () => {
        const ok = await uiConfirm({ eyebrow: "Abmelden", title: "Vom Favoriten-Code abmelden?", lines: ["Die Favoriten auf diesem Gerät bleiben bestehen, werden aber nicht mehr mit dem Code abgeglichen."], ok: "Abmelden", cancel: "Zurück" });
        if (!ok) return;
        ["sync-code", "sync-pass-for", "sync-pass-hash"].forEach((k) => { try { localStorage.removeItem(k); } catch { /* egal */ } });
        try { if (typeof refreshSyncInfo === "function") refreshSyncInfo(); } catch { /* egal */ }
        msg.textContent = "Vom Favoriten-Code abgemeldet."; paint();
      });
      tg.addEventListener("click", () => { const open = box.hidden; box.hidden = !open; tg.setAttribute("aria-expanded", String(open)); tg.textContent = (open ? "▾" : "▸") + " Abmelden"; if (open) paint(); });
      const row = h("div", "adv-btns"); row.append(ub, cb);
      box.append(st, row, msg); wrap.append(tg, box);
      return wrap;
    }
    function ensure() {
      const form = $("codeForm"); if (!form) return;
      const INTRO = {
        abgleich: ["Favoriten-Abgleich", "Hält deine Favoriten und Listen dauerhaft auf mehreren Geräten gleich. Du legst einen Code (und bei Bedarf ein Passwort) fest und gibst denselben Code auf jedem Gerät ein.", "Nur einmal übertragen oder eine Sicherung anlegen?", "sichern", "Zu „Daten“"],
        sichern: ["Daten sichern und übertragen", "Einmalig von Hand: Favoriten und Listen als Code, QR oder Datei sichern und auf einem anderen Gerät laden. Es wird nichts dauerhaft abgeglichen.", "Dauerhaft auf mehreren Geräten gleich halten?", "abgleich", "Zu „Favoriten-Abgleich“"]
      };
      ["abgleich", "sichern"].forEach((tab) => {
        if (form.querySelector(`.lo-wrap[data-tab="${tab}"]`)) return;
        const mine = [...form.querySelectorAll(`[data-tab="${tab}"]`)].filter((n) => !n.classList.contains("lo-wrap") && !n.classList.contains("sx-intro")); if (!mine.length) return;
        const first = mine[0], last = mine[mine.length - 1]; if (!first.parentNode || !last.parentNode) return;
        const I = INTRO[tab], card = h("div", "sx-intro tab-off"); card.dataset.tab = tab;
        const go = h("button", "sx-go", I[4] + " →"); go.type = "button"; go.addEventListener("click", () => { try { showSetTab(I[3]); } catch { /* egal */ } });
        card.append(h("b", "", I[0]), h("p", "", I[1]), h("small", "", I[2] + " "), go);
        const hd = mine.find((n) => n.id === "authBanner");   /* Banner bleibt ganz oben */
        (hd || first).parentNode.insertBefore(card, hd ? hd.nextSibling : first);
        last.parentNode.insertBefore(make(tab), last.nextSibling);   /* Abmelden ganz unten */
      });
    }
    new MutationObserver(ensure).observe(document.body, { childList: true, subtree: true }); ensure();
  })();

  /* ---------- Tesla-Medientasten: Anmeldung immer wieder erneuern ---------- */
  (function () {
    const reg = () => { try { if (typeof state !== "undefined" && state.mediaReg) state.mediaReg(); } catch { /* egal */ } };
    const wire = () => {
      const a = document.querySelector("audio"); if (!a || a._v163) return; a._v163 = true;
      ["playing", "play", "loadedmetadata", "durationchange", "emptied", "seeked"].forEach((ev) => a.addEventListener(ev, () => setTimeout(reg, 60)));
    };
    setInterval(() => { wire(); const a = document.querySelector("audio"); if (a && !a.paused) reg(); }, 4000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) reg(); });
    wire();
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
