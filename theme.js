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
    { id: "sand", name: "Sand", bar: "#f3ead8", light: true, sw: ["#f3ead8", "#fffaf0", "#c2410c"], hint: "warmes Papier, augenschonend hell" },
    { id: "sk-studio", name: "Studio Glas", bar: "#0b1220", light: false, skin: true, grp: "Skin", sw: ["#0b1220", "#1a2540", "#4cc9f0"], hint: "Skin: Glas, runde Tasten, feine Linie" },
    { id: "sk-retro", name: "Retro Deck", bar: "#1a1410", light: false, skin: true, grp: "Skin", sw: ["#1a1410", "#33271d", "#d9a441"], hint: "Skin: Hi-Fi-Deck, Messing, Segment-Balken" },
    { id: "sk-neon", name: "Neon Linie", bar: "#05060d", light: false, skin: true, grp: "Skin", sw: ["#05060d", "#12152b", "#00f0ff"], hint: "Skin: Neon-Umrisse mit Leuchten" },
    { id: "sk-papier", name: "Papier Minimal", bar: "#f6f2ea", light: true, skin: true, grp: "Skin", sw: ["#f6f2ea", "#ebe5d8", "#1d1b17"], hint: "Skin: hell, feine Linien, Serifenschrift" },
    { id: "sk-kontur", name: "Kontur Pop", bar: "#fff6d6", light: true, skin: true, grp: "Skin", sw: ["#fff6d6", "#ffe58a", "#ff3d81"], hint: "Skin: dicke Rahmen, harte Schatten, bunt" },
    { id: "an-disco", name: "Disco ✦ animiert", bar: "#12002b", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#12002b", "#2c1066", "#ff2ea6"], hint: "Animiert: tanzende Farben, hüpfende Tasten" },
    { id: "an-aquarium", name: "Aquarium ✦ animiert", bar: "#021b33", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#021b33", "#0a3a66", "#2ee6c5"], hint: "Animiert: Blasen, Wellen, schwimmender Fisch" },
    { id: "an-weltall", name: "Weltall ✦ animiert", bar: "#05030f", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#05030f", "#17123a", "#ffb703"], hint: "Animiert: Sterne, Rakete, kreisende Planeten-Taste" },
    { id: "tx-nacht", name: "Tesla Nacht", bar: "#0e0f12", light: false, skin: true, grp: "Tesla", sw: ["#0e0f12", "#22242a", "#e82127"], hint: "Tesla: große Tasten, dunkel, wenig Blendung" },
    { id: "tx-tag", name: "Tesla Tag", bar: "#f2f4f7", light: true, skin: true, grp: "Tesla", sw: ["#f2f4f7", "#e1e5ea", "#1c5fe0"], hint: "Tesla: große Tasten, hell, hoher Kontrast" },
    { id: "tx-kontrast", name: "Tesla Kontrast", bar: "#000000", light: false, skin: true, grp: "Tesla", sw: ["#000000", "#1a1a1a", "#ffd400"], hint: "Tesla: Schwarz-Gelb, extra dicke Balken" },
    { id: "hy-amoled", name: "Handy AMOLED", bar: "#000000", light: false, skin: true, grp: "Handy", sw: ["#000000", "#17171b", "#5eead4"], hint: "Handy: Reinschwarz, Mint, kompakt" },
    { id: "hy-pastell", name: "Handy Pastell", bar: "#f3effb", light: true, skin: true, grp: "Handy", sw: ["#f3effb", "#e6def7", "#8b5cf6"], hint: "Handy: hell, weiche Karten, Flieder" },
    { id: "hy-sunset", name: "Handy Sunset", bar: "#1b0f1f", light: false, skin: true, grp: "Handy", sw: ["#1b0f1f", "#3a1f3f", "#ff7a45"], hint: "Handy: Abendrot-Verlauf, Daumen-freundlich" }
  ];
  const REC_SHOWN = ["klassisch", "graphit", "tag", "amber", "sk-studio", "sk-retro", "tx-nacht", "tx-tag", "hy-amoled", "an-weltall"];
  const REC = { day: ["tag"], night: ["amber"] };
  const byId = (id) => THEMES.find((t) => t.id === id);

  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const getJ = (k, d) => { try { return JSON.parse(get(k, "")) ?? d; } catch { return d; } };

  /* Reihenfolge und Reiter (Normal / Tesla / Handy) pro Design, vom Benutzer einstellbar */
  const TABS = [["normal", "Normal"], ["tesla", "Tesla"], ["handy", "Handy"]];
  const defTab = (t) => (t.grp === "Tesla" ? "tesla" : t.grp === "Handy" ? "handy" : "normal");
  const tabMap = () => { const m = getJ("themeTabs", null); return m && typeof m === "object" && !Array.isArray(m) ? m : {}; };
  const tabOf = (t) => { const v = tabMap()[t.id]; return TABS.some((x) => x[0] === v) ? v : defTab(t); };
  function ordered() {
    const o = getJ("themeOrder", null);
    const ids = Array.isArray(o) ? o.filter(byId) : [];
    const rest = THEMES.filter((t) => !ids.includes(t.id)).map((t) => t.id);
    return [...ids, ...rest].map(byId);
  }
  const customOrder = () => Array.isArray(getJ("themeOrder", null)) && getJ("themeOrder", []).length > 0;
  function setTab(id, tab) { const m = tabMap(); if (tab === defTab(byId(id))) delete m[id]; else m[id] = tab; put("themeTabs", JSON.stringify(m)); }
  function move(id, dir) {
    const all = ordered().map((t) => t.id);
    const tab = tabOf(byId(id));
    const same = all.filter((x) => tabOf(byId(x)) === tab);
    const i = same.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= same.length) return;
    const a = all.indexOf(id), b = all.indexOf(same[j]);
    [all[a], all[b]] = [all[b], all[a]];
    put("themeOrder", JSON.stringify(all));
  }
  function resetOrder() { try { localStorage.removeItem("themeOrder"); localStorage.removeItem("themeTabs"); } catch { /* egal */ } }

  /* Welche Designs vorne (◐ und Auswahlfenster) angezeigt werden */
  function shownIds() {
    const a = getJ("themeShown", null);
    let ids = Array.isArray(a) ? a.filter(byId) : REC_SHOWN.slice();
    if (!ids.length) ids = REC_SHOWN.slice();
    return ids;
  }
  function shownThemes() {
    const ids = new Set(shownIds());
    const c = cfg();
    if (c.mode === "manual") ids.add(c.theme);
    return ordered().filter((t) => ids.has(t.id));
  }
  function setShown(id, on) {
    const cur = new Set(shownIds());
    if (on) cur.add(id); else cur.delete(id);
    if (!cur.size) cur.add(id);
    put("themeShown", JSON.stringify(THEMES.filter((t) => cur.has(t.id)).map((t) => t.id)));
  }
  /* Liste mit Häkchen „im Hauptfenster anzeigen“ (Einstellungen und Voreinstellungen) */
  function mountShown(root) {
    if (!root) return;
    root.replaceChildren();
    const shown = new Set(shownIds());
    const all = ordered();
    root.append(h("small", "set-hint", "Haken = im Hauptfenster (◐) anzeigen. Reiter = in welchem Reiter das Design im Auswahlfenster steht. Mit ▲ ▼ änderst du die Reihenfolge."));
    TABS.forEach(([tk, tn]) => {
      const list = all.filter((t) => tabOf(t) === tk);
      root.append(h("p", "ap-title shown-grp", `Reiter „${tn}“ (${list.length})`));
      list.forEach((t, idx) => {
        const row = h("div", "set-row shown-row2");
        const lab = h("label", "shown-lab");
        const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = shown.has(t.id);
        cb.addEventListener("change", () => { setShown(t.id, cb.checked); });
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        lab.append(cb, sw, document.createTextNode(" " + t.name));
        const sel = document.createElement("select"); sel.className = "shown-tab"; sel.setAttribute("aria-label", "Reiter");
        TABS.forEach(([k, n]) => { const o = document.createElement("option"); o.value = k; o.textContent = n; sel.append(o); });
        sel.value = tk;
        sel.addEventListener("change", () => { setTab(t.id, sel.value); mountShown(root); });
        const up = h("button", "ghost shown-mv", "▲"); up.type = "button"; up.disabled = idx === 0; up.setAttribute("aria-label", "nach oben");
        const dn = h("button", "ghost shown-mv", "▼"); dn.type = "button"; dn.disabled = idx === list.length - 1; dn.setAttribute("aria-label", "nach unten");
        up.addEventListener("click", () => { move(t.id, -1); mountShown(root); });
        dn.addEventListener("click", () => { move(t.id, 1); mountShown(root); });
        row.append(lab, sel, up, dn);
        root.append(row);
      });
    });
    const rec = h("button", "chip", "Empfehlung wählen"); rec.type = "button";
    rec.addEventListener("click", () => { put("themeShown", JSON.stringify(REC_SHOWN)); mountShown(root); });
    const rst = h("button", "chip", "Reihenfolge und Reiter zurücksetzen"); rst.type = "button";
    rst.addEventListener("click", () => { resetOrder(); mountShown(root); });
    root.append(rec, rst);
  }

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
    if (t.skin) root.setAttribute("data-skin", t.id); else root.removeAttribute("data-skin");
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
    const list = shownThemes();
    const i = list.findIndex((t) => t.id === (current || c.theme));
    const next = list[(i + 1) % list.length];
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
      const shownNow = new Set(shownIds());
      THEMES.forEach((t) => {
        const wrap = h("span", "theme-opt-wrap");
        const cbx = document.createElement("input"); cbx.type = "checkbox"; cbx.checked = shownNow.has(t.id); cbx.title = "Im Hauptfenster anzeigen";
        cbx.addEventListener("change", () => setShown(t.id, cbx.checked));
        const b = h("button", "seg-btn theme-opt", ""); b.type = "button"; b.dataset.theme = t.id;
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        b.append(sw, document.createTextNode(t.name)); b.title = t.hint;
        b.setAttribute("aria-pressed", String(t.id === c.theme));
        b.addEventListener("click", () => { put("theme", t.id); redraw(); });
        wrap.append(cbx, b);
        seg.append(wrap);
      });
      root.append(seg);
      root.append(h("small", "set-hint", "Häkchen = Design wird vorne im Hauptfenster (◐ und Auswahl) angeboten."));
    } else {
      root.append(h("p", "set-hint", "Welche Designs sollen am Tag und welche in der Nacht verwendet werden? Bei mehreren Häkchen gilt das erste in der Liste; das ◐ oben schaltet dann ebenfalls durch."));
      const tbl = h("table", "theme-tbl");
      const hd = h("tr"); ["☑ vorne · Design", "Tag", "Nacht"].forEach((x) => hd.append(h("th", "", x))); tbl.append(hd);
      THEMES.forEach((t) => {
        const tr = h("tr");
        const name = h("td", "");
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        const cbs = document.createElement("input"); cbs.type = "checkbox"; cbs.checked = shownIds().includes(t.id); cbs.title = "Im Hauptfenster anzeigen";
        cbs.addEventListener("change", () => setShown(t.id, cbs.checked));
        name.append(cbs, sw, document.createTextNode(t.name));
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
  /* Auswahlfenster: alle Designs in drei Reitern (Normal / Tesla / Handy) mit kleiner Vorschau */
  const subOf = (t) => (t.anim ? "Animiert" : t.skin ? "Skins (Tasten, Regler, Menüs)" : "Farbdesigns");
  function preview(th) {
    const prev = h("span", "theme-prev");
    prev.style.background = th.sw[0]; prev.style.borderColor = th.sw[2];
    const bar = h("i", "theme-prev-bar"); bar.style.background = th.sw[2];
    const card2 = h("i", "theme-prev-card"); card2.style.background = th.sw[1];
    const dot = h("i", "theme-prev-dot"); dot.style.background = th.sw[2];
    const txt = h("b", "theme-prev-txt", "Aa"); txt.style.color = th.light ? "#10141c" : "#f4f4f4";
    prev.append(card2, bar, dot, txt);
    return prev;
  }
  function openPicker() {
    let box = document.getElementById("themePicker");
    if (box) box.remove();
    box = h("div", "theme-picker"); box.id = "themePicker";
    const card = h("div", "theme-picker-card");
    card.append(h("p", "theme-picker-title", "Design wählen"));
    const cur = (cfg().mode === "manual" ? cfg().theme : "");
    const curTh = byId(cur);
    let tab = curTh ? tabOf(curTh) : (get("themeTab", "") || (document.documentElement.dataset.theme && /^(tx-)/.test(cur) ? "tesla" : "normal"));
    if (!TABS.some((x) => x[0] === tab)) tab = "normal";
    const tabs = h("div", "theme-tabs"); tabs.setAttribute("role", "tablist");
    const body = h("div", "theme-picker-body");
    const paint = () => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.k === tab)));
      body.replaceChildren();
      let last = "";
      ordered().filter((t) => tabOf(t) === tab).forEach((th) => {
        if (tab === "normal" && !customOrder() && subOf(th) !== last) { last = subOf(th); body.append(h("p", "theme-sub", last)); }
        const b = h("button", "theme-pick"); b.type = "button";
        if (th.id === cur) b.setAttribute("aria-pressed", "true");
        b.append(preview(th), h("span", "theme-pick-name", th.name), h("small", "theme-pick-hint", th.hint));
        b.addEventListener("click", () => { put("themeMode", "manual"); put("theme", th.id); apply(true); box.remove(); });
        body.append(b);
      });
    };
    TABS.forEach(([k, t]) => { const b = h("button", "theme-tab", t); b.type = "button"; b.dataset.k = k; b.setAttribute("role", "tab"); b.addEventListener("click", () => { tab = k; put("themeTab", k); paint(); }); tabs.append(b); });
    card.append(tabs, body);
    const x = h("button", "theme-pick-close", "Schließen"); x.type = "button";
    x.addEventListener("click", () => box.remove());
    card.append(x);
    box.append(card);
    box.addEventListener("click", (e) => { if (e.target === box) box.remove(); });
    document.body.append(box);
    paint();
  }

  const api = { THEMES, REC, REC_SHOWN, shownIds, mountShown, resolve, apply, cycle, mountUi, sunTimes, cfg, openPicker, onChange: null };
  window.THEME = api;

  apply(false);
  setInterval(() => apply(true), 60000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") apply(true); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => apply(true));
})();
