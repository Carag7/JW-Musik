/* Skin „Schwebend“: Elemente (obere Leiste, Auswahlfenster, Titel, Art-Buttons, Text, Player) lassen sich frei verschieben.
   ✥ am rechten Rand schaltet das Verschieben ein; gezogen wird am kleinen Griff des jeweiligen Elements. Positionen: localStorage „flugPos“. */
(() => {
  "use strict";
  const root = document.documentElement;
  const PARTS = [["topbar", ".topbar", "Leiste"], ["sidebar", "#sidebar", "Lieder"], ["now", ".stage > .now", "Titel"], ["ver", "#versionBar", "Arten"], ["lyrics", "#lyrics", "Text"], ["flyer", ".flyer", "Player"]];
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const posAll = () => { try { const o = JSON.parse(lsGet("flugPos", "{}")); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; } catch { return {}; } };
  const isFlug = () => /^sk-pro-flug/.test(root.getAttribute("data-theme") || "");
  let moving = false, grips = [], timer = 0;

  function applyPos() {
    const pos = posAll(), on = isFlug();
    PARTS.forEach(([id, sel]) => {
      const e = document.querySelector(sel); if (!e) return;
      e.classList.toggle("flug-mv", on);
      const p = pos[id];
      if (on && Array.isArray(p)) { e.style.setProperty("--fx", `${Math.round(p[0])}px`); e.style.setProperty("--fy", `${Math.round(p[1])}px`); }
      else { e.style.removeProperty("--fx"); e.style.removeProperty("--fy"); }
    });
  }
  function placeGrips() {
    grips.forEach((g) => {
      const e = document.querySelector(g._sel);
      if (!e || e.hidden || !e.getClientRects().length) { g.style.display = "none"; return; }
      const r = e.getBoundingClientRect();
      g.style.display = "";
      g.style.left = `${Math.max(4, Math.min(innerWidth - 90, r.left + 10))}px`;
      g.style.top = `${Math.max(4, Math.min(innerHeight - 40, r.top + 8))}px`;
    });
  }
  function clearGrips() { grips.forEach((g) => g.remove()); grips = []; clearInterval(timer); }
  function makeGrips() {
    clearGrips();
    PARTS.forEach(([id, sel, name]) => {
      const e = document.querySelector(sel); if (!e) return;
      const g = document.createElement("div"); g.className = "flug-grip"; g.textContent = `✥ ${name}`; g._sel = sel; g._id = id;
      let sx = 0, sy = 0, bx = 0, by = 0, drag = false;
      g.addEventListener("pointerdown", (ev) => {
        ev.preventDefault(); g.setPointerCapture(ev.pointerId); drag = true; sx = ev.clientX; sy = ev.clientY;
        const p = posAll()[id] || [0, 0]; bx = p[0]; by = p[1];
      });
      g.addEventListener("pointermove", (ev) => {
        if (!drag) return;
        let nx = bx + ev.clientX - sx, ny = by + ev.clientY - sy;
        e.style.setProperty("--fx", `${Math.round(nx)}px`); e.style.setProperty("--fy", `${Math.round(ny)}px`);
        const r = e.getBoundingClientRect();
        /* nicht ganz aus dem Bild schieben */
        if (r.right < 80) nx += 80 - r.right; if (r.left > innerWidth - 80) nx -= r.left - (innerWidth - 80);
        if (r.bottom < 60) ny += 60 - r.bottom; if (r.top > innerHeight - 60) ny -= r.top - (innerHeight - 60);
        e.style.setProperty("--fx", `${Math.round(nx)}px`); e.style.setProperty("--fy", `${Math.round(ny)}px`);
        placeGrips();
      });
      const end = (ev) => {
        if (!drag) return; drag = false;
        const fx = parseFloat(e.style.getPropertyValue("--fx")) || 0, fy = parseFloat(e.style.getPropertyValue("--fy")) || 0;
        const o = posAll(); o[id] = [fx, fy]; lsSet("flugPos", JSON.stringify(o));
      };
      g.addEventListener("pointerup", end); g.addEventListener("pointercancel", end);
      document.body.append(g); grips.push(g);
    });
    placeGrips(); timer = setInterval(placeGrips, 400);
  }
  function setMove(on) {
    moving = !!on && isFlug();
    document.body.classList.toggle("flug-move", moving);
    const b = document.getElementById("flugMove"); if (b) { b.classList.toggle("on", moving); b.textContent = moving ? "✔" : "✥"; b.title = moving ? "Fertig" : "Elemente verschieben"; }
    if (moving) makeGrips(); else clearGrips();
  }
  function reset() { lsSet("flugPos", "{}"); applyPos(); placeGrips(); }
  function build() {
    if (document.getElementById("flugCtl")) return;
    const box = document.createElement("div"); box.className = "flug-ctl"; box.id = "flugCtl";
    const mv = document.createElement("button"); mv.type = "button"; mv.id = "flugMove"; mv.textContent = "✥"; mv.title = "Elemente verschieben"; mv.setAttribute("aria-label", "Elemente verschieben");
    mv.onclick = () => setMove(!moving);
    const rs = document.createElement("button"); rs.type = "button"; rs.id = "flugReset"; rs.textContent = "↺"; rs.title = "Positionen zurücksetzen"; rs.setAttribute("aria-label", "Positionen zurücksetzen");
    rs.onclick = reset;
    box.append(mv, rs); document.body.append(box);
  }
  function sync() { build(); applyPos(); if (!isFlug() && moving) setMove(false); }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("resize", () => { if (moving) placeGrips(); });
  window.addEventListener("storage", (e) => { if (e.key === "flugPos") applyPos(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync); else sync();
  window.FLUG = { setMove, reset, apply: applyPos };
})();
