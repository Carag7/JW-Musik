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
