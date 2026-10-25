/* Designs: festes Design, automatisch nach Gerät/Tesla (hell/dunkel) oder nach Sonnenaufgang/-untergang mit Zeitverschiebung */
(function () {
  "use strict";
  const THEMES = [
    { id: "klassisch", name: "Klassisch", bar: "#070b14", light: false, sw: ["#070b14", "#101826", "#f0b429"], hint: "bisheriges Design" },
    { id: "graphit", name: "Graphit", bar: "#171a20", light: false, sw: ["#171a20", "#2b2f38", "#3e6ae1"], hint: "Tesla-Look, Anthrazit mit Blau" },
    { id: "tag", name: "Tag", bar: "#eef0f3", light: true, sw: ["#eef0f3", "#ffffff", "#3e6ae1"], hint: "hell, hoher Kontrast" },
    { id: "amber", name: "Amber", bar: "#000000", light: false, sw: ["#000000", "#17140f", "#ffb300"], hint: "Schwarz + Bernstein, blendet nachts wenig" },
    { id: "mitternacht", name: "Mitternacht", bar: "#0c0a1f", light: false, sw: ["#0c0a1f", "#1c1840", "#a78bfa"], hint: "tiefes Indigo mit Lavendel" },
    { id: "wald", name: "Wald", bar: "#0a1410", light: false, sw: ["#0a1410", "#16291f", "#d9b44a"], hint: "dunkles Grün mit Gold, ruhig" },
    { id: "rubin", name: "Rubin", bar: "#14080a", light: false, sw: ["#14080a", "#2a1115", "#ff5a5f"], hint: "dunkles Rot, schont die Nachtsicht" },
    { id: "himmel", name: "Himmel", bar: "#e6f0fa", light: true, sw: ["#e6f0fa", "#ffffff", "#0b7bbf"], hint: "helles Blau, frisch und klar" },
    { id: "sand", name: "Sand", bar: "#f3ead8", light: true, sw: ["#f3ead8", "#fffaf0", "#c2410c"], hint: "warmes Papier, augenschonend hell" }
  ];
  const REC = { day: ["tag"], night: ["amber"] };
  const byId = (id) => THEMES.find((t) => t.id === id);

  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const getJ = (k, d) => { try { return JSON.parse(get(k, "")) ?? d; } catch { return d; } };

  function cfg() {
    let mode = get("themeMode", "");
    let theme = get("theme", "klassisch");
    if (theme === "auto") { theme = "klassisch"; if (!mode) mode = "device"; }   // frühere Version
    if (!mode) mode = "manual";
    if (!byId(theme)) theme = "klassisch";
    const list = (k, rec) => { const a = getJ(k, null); const ok = Array.isArray(a) ? a.filter(byId) : []; return ok.length ? ok : rec.slice(); };
    const shift = getJ("themeShift", null) || {};
    const norm = (s, dir) => ({ h: Math.max(0, Math.min(12, +(s && s.h) || 0)), m: Math.max(0, Math.min(59, +(s && s.m) || 0)), dir: (s && s.dir) || dir });
    return {
      mode, theme,
      day: list("themeDay", REC.day), night: list("themeNight", REC.night),
      rise: norm(shift.rise, "after"), set: norm(shift.set, "before"),
      lat: Number(get("geoLat", "48.21")), lon: Number(get("geoLon", "16.37")), geoSrc: get("geoSrc", "default")
    };
  }

  /* Sonnenauf-/untergang (Sunrise-Equation), liefert Date oder null (Polartag/-nacht) */
  function sunTimes(date, lat, lon) {
    const rad = Math.PI / 180;
    const jd0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12) / 86400000 + 2440587.5;
    const localNoon = jd0 - lon / 360;      // ungefähr der lokale Sonnenhöchststand
    let best = null;
    for (const dn of [-1, 0, 1]) {
      const n = Math.round(jd0 - 2451545.0 + 0.0008) + dn;
      const js = n - lon / 360;
      const M = (357.5291 + 0.98560028 * js) % 360;
      const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
      const lam = (M + C + 180 + 102.9372) % 360;
      const jt = 2451545.0 + js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad);
      if (best === null || Math.abs(jt - localNoon) < Math.abs(best.jt - localNoon)) best = { jt, lam };
    }
    const dec = Math.asin(Math.sin(best.lam * rad) * Math.sin(23.4397 * rad));
    const cosw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
    if (cosw > 1) return { rise: null, set: null, polar: "nacht" };
    if (cosw < -1) return { rise: null, set: null, polar: "tag" };
    const w = Math.acos(cosw) / rad / 360;
    const toDate = (jd) => new Date((jd - 2440587.5) * 86400000);
    return { rise: toDate(best.jt - w), set: toDate(best.jt + w) };
  }

  function sunWindow(c, now) {
    const s = sunTimes(now, c.lat, c.lon);
    if (s.polar) return { day: s.polar === "tag", s };
    const sh = (x) => (x.h * 60 + x.m) * 60000;
    const start = new Date(s.rise.getTime() + (c.rise.dir === "before" ? -1 : 1) * sh(c.rise));
    const end = new Date(s.set.getTime() + (c.set.dir === "before" ? -1 : 1) * sh(c.set));
    return { day: now >= start && now < end, start, end, s };
  }

  const firstOf = (ids) => THEMES.find((t) => ids.includes(t.id));

  function resolve(now) {
    const c = cfg();
    now = now || new Date();
    if (c.mode === "manual") return { id: c.theme, period: null, c };
    let day;
    if (c.mode === "device") day = !(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    else day = sunWindow(c, now).day;
    const pick = firstOf(day ? c.day : c.night) || byId(day ? REC.day[0] : REC.night[0]);
    return { id: pick.id, period: day ? "day" : "night", c };
  }

  let current = null;
  function apply(fade) {
    const r = resolve();
    const t = byId(r.id);
    const root = document.documentElement;
    if (current === r.id) return r;
    if (fade) { root.classList.add("theme-fade"); setTimeout(() => root.classList.remove("theme-fade"), 450); }
    if (r.id === "klassisch") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", r.id);
    if (t.light) root.setAttribute("data-light", "1"); else root.removeAttribute("data-light");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t.bar);
    current = r.id;
    document.querySelectorAll("#themeSeg [data-theme]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.theme === r.c.theme && r.c.mode === "manual")));
    if (typeof api.onChange === "function") api.onChange(r);
    return r;
  }

  /* ◐ oben: im festen Modus alle Designs durchschalten; bei Automatik wird auf „fest“ umgestellt */
  function cycle() {
    const c = cfg();
    const i = THEMES.findIndex((t) => t.id === (current || c.theme));
    const next = THEMES[(i + 1) % THEMES.length];
    put("themeMode", "manual"); put("theme", next.id);
    apply(true);
    return { name: next.name, wasAuto: c.mode !== "manual" };
  }

  /* ---------- Oberfläche im Einstellungsfenster ---------- */
  function h(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  const hm = (d) => new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit" }).format(d);

  function mountUi(root) {
    if (!root) return;
    root.replaceChildren();
    const c = cfg();
    const redraw = () => { apply(true); mountUi(root); };

    root.append(h("p", "ap-title", "Design (für dieses Gerät)"));
    const modes = h("div", "theme-modes");
    [["manual", "Fest"], ["device", "Automatisch: wie Gerät / Tesla"], ["sun", "Automatisch: Sonnenaufgang / -untergang"]].forEach(([id, label]) => {
      const lab = h("label", "set-row check");
      const r = document.createElement("input");
      r.type = "radio"; r.name = "themeMode"; r.checked = c.mode === id;
      r.addEventListener("change", () => { put("themeMode", id); if (id === "sun") tryGeo(true); redraw(); });
      lab.append(r, document.createTextNode(" " + label));
      modes.append(lab);
    });
    root.append(modes);

    const status = resolve();
    root.append(h("p", "set-hint theme-now", status.period
      ? `Jetzt aktiv: ${byId(status.id).name} (${status.period === "day" ? "Tag" : "Nacht"})`
      : `Jetzt aktiv: ${byId(status.id).name}`));

    if (c.mode === "manual") {
      const seg = h("div", "theme-seg"); seg.id = "themeSeg";
      THEMES.forEach((t) => {
        const b = h("button", "seg-btn theme-opt", ""); b.type = "button"; b.dataset.theme = t.id;
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        b.append(sw, document.createTextNode(t.name)); b.title = t.hint;
        b.setAttribute("aria-pressed", String(t.id === c.theme));
        b.addEventListener("click", () => { put("theme", t.id); redraw(); });
        seg.append(b);
      });
      root.append(seg);
    } else {
      root.append(h("p", "set-hint", "Welche Designs sollen am Tag und welche in der Nacht verwendet werden? Bei mehreren Häkchen gilt das erste in der Liste; das ◐ oben schaltet dann ebenfalls durch."));
      const tbl = h("table", "theme-tbl");
      const hd = h("tr"); ["Design", "Tag", "Nacht"].forEach((x) => hd.append(h("th", "", x))); tbl.append(hd);
      THEMES.forEach((t) => {
        const tr = h("tr");
        const name = h("td", "");
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        name.append(sw, document.createTextNode(t.name));
        tr.append(name);
        for (const [key, list] of [["themeDay", c.day], ["themeNight", c.night]]) {
          const td = h("td", "center");
          const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = list.includes(t.id);
          cb.addEventListener("change", () => {
            const cur = new Set(cfg()[key === "themeDay" ? "day" : "night"]);
            if (cb.checked) cur.add(t.id); else cur.delete(t.id);
            if (!cur.size) cur.add(t.id);   // mindestens eins
            put(key, JSON.stringify([...cur])); redraw();
          });
          td.append(cb);
          const rec = (key === "themeDay" ? REC.day : REC.night).includes(t.id);
          if (rec) td.append(h("span", "rec", "★ empfohlen"));
          tr.append(td);
        }
        tbl.append(tr);
      });
      root.append(tbl);
      const rec = h("button", "chip", "Empfehlung übernehmen (Tag: Tag · Nacht: Amber)"); rec.type = "button";
      rec.addEventListener("click", () => { put("themeDay", JSON.stringify(REC.day)); put("themeNight", JSON.stringify(REC.night)); redraw(); });
      root.append(rec);
      root.append(h("small", "set-hint", "Empfehlung: Tagsüber „Tag“ (hell, hoher Kontrast bei Sonne), nachts „Amber“ (Schwarz mit warmem Ton, wenig Blendung im dunklen Auto)."));

      if (c.mode === "sun") {
        const box = h("div", "sun-box");
        const row = (label, key, ev, dirs) => {
          const r = h("div", "sun-row");
          r.append(h("span", "lbl", label));
          const hh = document.createElement("input"); hh.type = "number"; hh.min = "0"; hh.max = "12"; hh.value = String(c[key].h);
          const mm = document.createElement("input"); mm.type = "number"; mm.min = "0"; mm.max = "59"; mm.value = String(c[key].m);
          const sel = document.createElement("select");
          dirs.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; if (c[key].dir === v) o.selected = true; sel.append(o); });
          const save = () => {
            const sh = getJ("themeShift", {}) || {};
            sh[key] = { h: +hh.value || 0, m: +mm.value || 0, dir: sel.value };
            put("themeShift", JSON.stringify(sh)); redraw();
          };
          hh.addEventListener("change", save); mm.addEventListener("change", save); sel.addEventListener("change", save);
          r.append(hh, h("span", "u", "Std"), mm, h("span", "u", "Min"), sel, h("span", "", ev));
          return r;
        };
        box.append(h("p", "ap-title", "Zeitpunkt des Wechsels"));
        box.append(row("Tag beginnt:", "rise", "Sonnenaufgang", [["after", "nach"], ["before", "vor"]]));
        box.append(row("Nacht beginnt:", "set", "Sonnenuntergang", [["before", "vor"], ["after", "nach"]]));
        box.append(h("small", "set-hint", "Beispiele: 1 Std 15 Min vor Sonnenuntergang, oder 1 Std 45 Min nach Sonnenaufgang."));

        const w = sunWindow(c, new Date());
        box.append(h("p", "set-hint sun-today", w.s.polar ? `Heute: Polar${w.s.polar} – ${w.s.polar === "tag" ? "immer Tag" : "immer Nacht"}`
          : `Heute: Sonnenaufgang ${hm(w.s.rise)}, Sonnenuntergang ${hm(w.s.set)} → Tag von ${hm(w.start)} bis ${hm(w.end)}, danach Nacht`));

        const loc = h("div", "set-row");
        loc.append(h("span", "", "Standort: Breite "));
        const la = document.createElement("input"); la.type = "number"; la.step = "0.01"; la.value = String(c.lat);
        const lo = document.createElement("input"); lo.type = "number"; lo.step = "0.01"; lo.value = String(c.lon);
        const saveLoc = () => { if (isFinite(+la.value) && isFinite(+lo.value)) { put("geoLat", la.value); put("geoLon", lo.value); put("geoSrc", "manual"); redraw(); } };
        la.addEventListener("change", saveLoc); lo.addEventListener("change", saveLoc);
        const gb = h("button", "chip", "Standort ermitteln"); gb.type = "button";
        gb.addEventListener("click", () => tryGeo(false, redraw, gb));
        loc.append(la, document.createTextNode(" Länge "), lo, gb);
        box.append(loc);
        box.append(h("small", "set-hint", c.geoSrc === "gps" ? "Standort vom Gerät ermittelt." : "Standard: Wien. Im Tesla-Browser ist die Standortfreigabe oft nicht verfügbar – dann Werte hier eintragen."));
        root.append(box);
      }
    }
  }

  function tryGeo(silent, done, btn) {
    if (!navigator.geolocation) { if (btn) btn.textContent = "Nicht verfügbar"; return; }
    if (btn) btn.textContent = "Suche …";
    navigator.geolocation.getCurrentPosition((p) => {
      put("geoLat", p.coords.latitude.toFixed(2)); put("geoLon", p.coords.longitude.toFixed(2)); put("geoSrc", "gps");
      if (done) done(); else apply(true);
    }, () => { if (btn) btn.textContent = "Nicht möglich"; }, { timeout: 8000, maximumAge: 86400000 });
  }

  /* Auswahl aller Designs als Fenster (bei aktiver Lupe: Design-Taste ca. 1 s gedrückt halten) */
  function openPicker() {
    let box = document.getElementById("themePicker");
    if (box) box.remove();
    box = h("div", "theme-picker"); box.id = "themePicker";
    const card = h("div", "theme-picker-card");
    card.append(h("p", "theme-picker-title", "Design wählen"));
    const wide = window.innerWidth >= 560;
    const cur = (cfg().mode === "manual" ? cfg().theme : "");
    THEMES.forEach((th) => {
      const b = h("button", "theme-pick");
      b.type = "button";
      if (th.id === cur) b.setAttribute("aria-pressed", "true");
      const prev = h("span", "theme-prev");
      prev.style.background = th.sw[0]; prev.style.borderColor = th.sw[2];
      const card2 = h("i", "theme-prev-card"); card2.style.background = th.sw[1];
      const dot = h("i", "theme-prev-dot"); dot.style.background = th.sw[2];
      const txt = h("b", "theme-prev-txt", "Aa"); txt.style.color = th.light ? "#10141c" : "#f4f4f4";
      prev.append(card2, dot, txt);
      const name = h("span", "theme-pick-name", th.name);
      b.append(prev, name);
      if (wide) b.append(h("small", "theme-pick-hint", th.hint));
      b.addEventListener("click", () => { put("themeMode", "manual"); put("theme", th.id); apply(true); box.remove(); });
      card.append(b);
    });
    const x = h("button", "theme-pick-close", "Schließen"); x.type = "button";
    x.addEventListener("click", () => box.remove());
    card.append(x);
    box.append(card);
    box.addEventListener("click", (e) => { if (e.target === box) box.remove(); });
    document.body.append(box);
  }

  const api = { THEMES, REC, resolve, apply, cycle, mountUi, sunTimes, cfg, openPicker, onChange: null };
  window.THEME = api;

  apply(false);
  setInterval(() => apply(true), 60000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") apply(true); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => apply(true));
})();
