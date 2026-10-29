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
    { id: "sk-jwl", name: "Bibliothek", bar: "#4a6da7", light: true, skin: true, grp: "Pro", sw: ["#ececee", "#ffffff", "#4a6da7"], hint: "Skin: flach, Blau und Violett, Liste mit Trennlinien, runde Play-Taste" },
    { id: "sk-pro", name: "Aurora Pro", bar: "#07080d", light: false, skin: true, grp: "Pro", sw: ["#07080d", "#2a2650", "#8b7cff"], hint: "Skin: Premium mit Glas, schwebendem Player und großer Schrift" },
    { id: "sk-pro-gold", name: "Aurora Gold", bar: "#0a0805", light: false, skin: true, grp: "Pro", sw: ["#0a0805", "#3a2c12", "#f2c36b"], hint: "Aurora Pro in Gold und Bernstein" },
    { id: "sk-pro-rose", name: "Aurora Rosé", bar: "#0c0509", light: false, skin: true, grp: "Pro", sw: ["#0c0509", "#3a1226", "#ff5d9e"], hint: "Aurora Pro in Pink und Orange" },
    { id: "sk-pro-ozean", name: "Aurora Ozean", bar: "#040a12", light: false, skin: true, grp: "Pro", sw: ["#040a12", "#10284a", "#3da8ff"], hint: "Aurora Pro in Blau und Cyan" },
    { id: "sk-pro-smaragd", name: "Aurora Smaragd", bar: "#040c09", light: false, skin: true, grp: "Pro", sw: ["#040c09", "#0f3322", "#2fe08a"], hint: "Aurora Pro in Grün und Limette" },
    { id: "sk-pro-platin", name: "Aurora Platin", bar: "#08090b", light: false, skin: true, grp: "Pro", sw: ["#08090b", "#2a2e38", "#d9dde6"], hint: "Aurora Pro in Silber und Weiß" },
    { id: "sk-atelier", name: "Atelier", bar: "#0b0b0d", light: false, skin: true, grp: "Pro", sw: ["#0b0b0d", "#2a2418", "#d6bd8f"], hint: "ganz anderer Aufbau: Player-Leiste links, Verzeichnis rechts, Serifenschrift, Champagner auf Schwarz" },
    { id: "sk-atelier-saphir", name: "Atelier Saphir", bar: "#090b11", light: false, skin: true, grp: "Pro", sw: ["#090b11", "#151925", "#8fb0ee"], hint: "Atelier in Saphirblau" },
    { id: "sk-atelier-rose", name: "Atelier Rosé", bar: "#0e090b", light: false, skin: true, grp: "Pro", sw: ["#0e090b", "#1c1317", "#e8a9b6"], hint: "Atelier in Altrosa" },
    { id: "sk-atelier-salbei", name: "Atelier Salbei", bar: "#090d0b", light: false, skin: true, grp: "Pro", sw: ["#090d0b", "#141c18", "#aecfa6"], hint: "Atelier in Salbeigrün" },
    { id: "sk-atelier-kupfer", name: "Atelier Kupfer", bar: "#0d0807", light: false, skin: true, grp: "Pro", sw: ["#0d0807", "#1b1210", "#e0925f"], hint: "Atelier in Kupfer" },
    { id: "sk-atelier-elfenbein", name: "Atelier Elfenbein", bar: "#f5f0e6", light: true, skin: true, grp: "Pro", sw: ["#f5f0e6", "#e8dfce", "#8a6420"], hint: "Atelier hell: Elfenbein mit Bronze" },
    { id: "sk-jwl-petrol", name: "Bibliothek Petrol (weiß)", bar: "#0f6e8c", light: true, skin: true, grp: "Pro", sw: ["#ffffff", "#e6f4f8", "#0f6e8c"], hint: "Bibliothek: weißer Hintergrund, Petrol-Leiste" },
    { id: "sk-jwl-beere", name: "Bibliothek Beere (weiß)", bar: "#b3264a", light: true, skin: true, grp: "Pro", sw: ["#ffffff", "#fdeff2", "#b3264a"], hint: "Bibliothek: weißer Hintergrund, Beeren-Rot" },
    { id: "sk-jwl-nacht", name: "Bibliothek Nacht", bar: "#2a3a58", light: false, skin: true, grp: "Pro", sw: ["#101114", "#1b1c21", "#7ea2e6"], hint: "Bibliothek: dunkel, Blau" },
    { id: "sk-jwl-schiefer", name: "Bibliothek Schiefer", bar: "#1f4a47", light: false, skin: true, grp: "Pro", sw: ["#16191c", "#20262a", "#4fc6b5"], hint: "Bibliothek: dunkler Schiefer, Türkis" },
    { id: "sk-jwl-burgund", name: "Bibliothek Burgund", bar: "#5a1f33", light: false, skin: true, grp: "Pro", sw: ["#151012", "#231a1d", "#e5849a"], hint: "Bibliothek: dunkel, Burgund und Rosé" },
    { id: "an-disco", name: "Disco ✦ animiert", bar: "#12002b", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#12002b", "#2c1066", "#ff2ea6"], hint: "Animiert: tanzende Farben, hüpfende Tasten" },
    { id: "an-aquarium", name: "Aquarium ✦ animiert", bar: "#021b33", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#021b33", "#0a3a66", "#2ee6c5"], hint: "Animiert: Blasen, Wellen, schwimmender Fisch" },
    { id: "an-weltall", name: "Weltall ✦ animiert", bar: "#05030f", light: false, skin: true, anim: true, grp: "Animiert", sw: ["#05030f", "#17123a", "#ffb703"], hint: "Animiert: Sterne, Rakete, kreisende Planeten-Taste" },
    { id: "tx-nacht", name: "Tesla Nacht", bar: "#0e0f12", light: false, skin: true, grp: "Tesla", sw: ["#0e0f12", "#22242a", "#e82127"], hint: "Tesla: große Tasten, dunkel, wenig Blendung" },
    { id: "tx-tag", name: "Tesla Tag", bar: "#f2f4f7", light: true, skin: true, grp: "Tesla", sw: ["#f2f4f7", "#e1e5ea", "#1c5fe0"], hint: "Tesla: große Tasten, hell, hoher Kontrast" },
    { id: "tx-kontrast", name: "Tesla Kontrast", bar: "#000000", light: false, skin: true, grp: "Tesla", sw: ["#000000", "#1a1a1a", "#ffd400"], hint: "Tesla: Schwarz-Gelb, extra dicke Balken" },
    { id: "tx-blau", name: "Tesla Blau", bar: "#171a20", light: false, skin: true, grp: "Tesla", sw: ["#171a20", "#2b303a", "#3e6ae1"], hint: "Tesla: Anthrazit mit Tesla-Blau, weiche Kacheln" },
    { id: "tx-karte", name: "Tesla Karte", bar: "#121a26", light: false, skin: true, grp: "Tesla", sw: ["#121a26", "#25354a", "#4fc3f7"], hint: "Tesla: Nacht-Kartenblau mit Cyan und Gelb" },
    { id: "tx-energie", name: "Tesla Energie", bar: "#0f1512", light: false, skin: true, grp: "Tesla", sw: ["#0f1512", "#223027", "#3ecf6b"], hint: "Tesla: Dunkelgrün wie die Energie-Anzeige" },
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
  const BASE_TABS = [["normal", "Normal"], ["pro", "Professionell"], ["tesla", "Tesla"], ["handy", "Handy"]];
  /* Reiterliste: standardmäßig die vier Reiter; der Benutzer kann eigene anlegen, umbenennen und entfernen */
  const tabsList = () => {
    const a = getJ("themeTabList", null);
    const ok = Array.isArray(a) ? a.filter((x) => Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "string" && x[0] && x[1].trim()) : [];
    return ok.length ? ok : BASE_TABS.map((x) => x.slice());
  };
  const saveTabs = (l) => put("themeTabList", JSON.stringify(l));
  function addTab(name) {
    name = String(name || "").trim().slice(0, 24); if (!name) return null;
    const l = tabsList(); const id = "u" + Date.now().toString(36);
    l.push([id, name]); saveTabs(l); return id;
  }
  function removeTab(id) {
    const l = tabsList(); if (l.length <= 1) return false;
    saveTabs(l.filter((x) => x[0] !== id));
    const m = tabMap(); Object.keys(m).forEach((k) => { if (m[k] === id) delete m[k]; }); put("themeTabs", JSON.stringify(m));
    return true;
  }
  function renameTab(id, name) { name = String(name || "").trim().slice(0, 24); if (!name) return; saveTabs(tabsList().map((x) => (x[0] === id ? [id, name] : x))); }
  function resetTabs() { try { localStorage.removeItem("themeTabList"); } catch { /* egal */ } }
  const defTab = (t) => (t.grp === "Tesla" ? "tesla" : t.grp === "Handy" ? "handy" : t.grp === "Pro" ? "pro" : "normal");
  const tabMap = () => { const m = getJ("themeTabs", null); return m && typeof m === "object" && !Array.isArray(m) ? m : {}; };
  const tabOf = (t) => {
    const l = tabsList(); const v = tabMap()[t.id];
    if (l.some((x) => x[0] === v)) return v;
    const d = defTab(t);
    return l.some((x) => x[0] === d) ? d : l[0][0];
  };
  /* Gruppen: Designs mit gleichem Aufbau, die sich nur in der Farbe unterscheiden */
  const FAMILIES = [
    { id: "f-pro", name: "Aurora Pro", ids: ["sk-pro", "sk-pro-gold", "sk-pro-rose", "sk-pro-ozean", "sk-pro-smaragd", "sk-pro-platin"], hint: "Glas, schwebender Player – 6 Farben" },
    { id: "f-jwl", name: "Bibliothek", ids: ["sk-jwl", "sk-jwl-petrol", "sk-jwl-beere", "sk-jwl-nacht", "sk-jwl-schiefer", "sk-jwl-burgund"], hint: "Flach, Liste mit Trennlinien – 2 weiße und 3 dunkle Varianten" },
    { id: "f-atl", name: "Atelier", ids: ["sk-atelier", "sk-atelier-saphir", "sk-atelier-rose", "sk-atelier-salbei", "sk-atelier-kupfer", "sk-atelier-elfenbein"], hint: "Magazin-Aufbau, Serifenschrift – 6 Farben" },
    { id: "f-txk", name: "Tesla Kacheln", ids: ["tx-blau", "tx-karte", "tx-energie"], hint: "Tesla-Bildschirm-Look – 3 Farben" },
    { id: "f-farb", name: "Farbdesigns", ids: ["klassisch", "graphit", "tag", "amber", "mitternacht", "wald", "rubin", "himmel", "sand"], hint: "gleiches Aussehen, nur andere Farben" }
  ];

  /* Eigene Farb-Skins: Kopie eines vorhandenen Designs mit selbst gewählten Farben (Liste „themeCustom“, wird mit dem Benutzer gesichert) */
  const hex2rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "")); if (!m) return [0, 0, 0]; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgb2hex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, p) => { const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(x.map((v, i) => v + (y[i] - v) * p)); };
  const lum = (h) => { const [r, g, b] = hex2rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function customVars(c) {
    const bg = c.bg, panel = c.panel, text = c.text, ac = c.accent, ac2 = c.accent2;
    const light = lum(bg) > 0.4;
    const v = {
      "--bg": bg, "--panel": panel, "--panel-2": mix(panel, text, 0.07), "--text": text, "--muted": mix(text, bg, 0.42), "--strong": text,
      "--accent": ac, "--accent-rgb": hex2rgb(ac).join(", "), "--accent-2": ac2, "--accent2-rgb": hex2rgb(ac2).join(", "),
      "--on-accent": lum(ac) > 0.45 ? "#14110a" : "#ffffff", "--on-accent-2": lum(ac2) > 0.45 ? "#14110a" : "#ffffff",
      "--ink-rgb": hex2rgb(text).join(", "), "--line": `rgba(${hex2rgb(text).join(",")},${light ? .14 : .12})`,
      "--sel-bg": mix(bg, ac, light ? 0.18 : 0.22), "--sel-text": text, "--lyric-active": ac, "--bar-bg": mix(bg, ac, light ? 0.1 : 0.08), "--pro-bg": bg, "--info": ac
    };
    return { v, light };
  }
  let customSig = "";
  function loadCustom() {
    const raw = get("themeCustom", "");
    if (raw === customSig) return;
    customSig = raw;
    for (let i = THEMES.length - 1; i >= 0; i--) if (THEMES[i].custom) THEMES.splice(i, 1);
    FAMILIES.forEach((f) => { f.ids = f.ids.filter((x) => !String(x).startsWith("u-")); });
    let a = []; try { a = JSON.parse(raw) || []; } catch { a = []; }
    if (!Array.isArray(a)) a = [];
    a.forEach((c) => {
      const base = THEMES.find((x) => x.id === c.base && !x.custom);
      if (!base || !c.id || !c.colors) return;
      const cv = customVars(c.colors);
      THEMES.push({ ...base, id: c.id, name: c.name || "Eigenes Design", bar: c.colors.bg, light: cv.light, custom: true, base: base.id, colors: c.colors, grp: base.grp,
        sw: [c.colors.bg, c.colors.panel, c.colors.accent], hint: `Eigene Farben auf Basis „${base.name}“` });
      const f = FAMILIES.find((x) => x.ids.includes(base.id));
      if (f) f.ids.push(c.id);
    });
  }
  const famOf = (t) => FAMILIES.find((f) => f.ids.includes(t.id));
  const shortName = (t, f) => {
    if (!f) return t.name;
    if (f.id === "f-farb") return t.name;
    if (t.name === f.name) return "Original";
    const base = f.id === "f-pro" ? "Aurora " : f.id === "f-jwl" ? "Bibliothek " : f.id === "f-atl" ? "Atelier " : "Tesla ";
    return t.name.startsWith(base) ? t.name.slice(base.length) : t.name;
  };
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
  function resetOrder() { try { localStorage.removeItem("themeOrder"); localStorage.removeItem("themeTabs"); localStorage.removeItem("themeTabList"); } catch { /* egal */ } }

  /* Welche Designs vorne (◐ und Auswahlfenster) angezeigt werden */
  const allOn = () => get("themeAll", "0") === "1";
  function shownIds() {
    if (allOn()) return THEMES.map((t) => t.id);
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
    const TL = tabsList();
    const again = () => mountShown(root);
    root.append(h("small", "set-hint", "Haken = im Hauptfenster (◐) anzeigen. Reiter = in welchem Reiter das Design im Auswahlfenster steht. Mit ▲ ▼ änderst du die Reihenfolge. Gruppen (gleicher Aufbau, andere Farben) lassen sich auf- und zuklappen."));
    if (allOn()) root.append(h("small", "set-hint theme-all-note", "Die Einstellung „alle Designs“ ist an – die Haken gelten erst wieder, wenn er ausgeschaltet ist."));

    /* Reiter verwalten */
    const mg = h("div", "tab-manager");
    mg.append(h("p", "ap-title", "Reiter verwalten"));
    TL.forEach(([id, name]) => {
      const r = h("div", "set-row tab-mg-row");
      const inp = document.createElement("input"); inp.type = "text"; inp.value = name; inp.maxLength = 24; inp.setAttribute("aria-label", "Name des Reiters");
      inp.addEventListener("change", () => { renameTab(id, inp.value); again(); });
      const del = h("button", "ghost shown-mv", "✕"); del.type = "button"; del.title = "Reiter entfernen"; del.setAttribute("aria-label", "Reiter entfernen"); del.disabled = TL.length <= 1;
      del.addEventListener("click", () => { if (removeTab(id)) again(); });
      r.append(inp, del); mg.append(r);
    });
    const nr = h("div", "set-row tab-mg-row");
    const ni = document.createElement("input"); ni.type = "text"; ni.placeholder = "Neuer Reiter, z. B. Auto"; ni.maxLength = 24;
    const nb = h("button", "chip", "＋ Reiter anlegen"); nb.type = "button";
    const doAdd = () => { if (addTab(ni.value)) again(); };
    nb.addEventListener("click", doAdd); ni.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doAdd(); } });
    nr.append(ni, nb); mg.append(nr);
    mg.append(h("small", "set-hint", "Entfernst du einen Reiter, wandern seine Designs in ihren ursprünglichen Reiter (oder in den ersten). Mindestens ein Reiter bleibt."));
    root.append(mg);

    const rowFor = (t, list, idx) => {
      const row = h("div", "set-row shown-row2");
      const lab = h("label", "shown-lab");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = shown.has(t.id); cb.disabled = allOn();
      cb.addEventListener("change", () => { setShown(t.id, cb.checked); });
      const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
      lab.append(cb, sw, document.createTextNode(" " + t.name));
      const sel = document.createElement("select"); sel.className = "shown-tab"; sel.setAttribute("aria-label", "Reiter");
      TL.forEach(([k, n]) => { const o = document.createElement("option"); o.value = k; o.textContent = n; sel.append(o); });
      sel.value = tabOf(t);
      sel.addEventListener("change", () => { setTab(t.id, sel.value); again(); });
      const up = h("button", "ghost shown-mv", "▲"); up.type = "button"; up.disabled = idx === 0; up.setAttribute("aria-label", "nach oben");
      const dn = h("button", "ghost shown-mv", "▼"); dn.type = "button"; dn.disabled = idx === list.length - 1; dn.setAttribute("aria-label", "nach unten");
      up.addEventListener("click", () => { move(t.id, -1); again(); });
      dn.addEventListener("click", () => { move(t.id, 1); again(); });
      row.append(lab, sel, up, dn);
      return row;
    };
    TL.forEach(([tk, tn]) => {
      const list = all.filter((t) => tabOf(t) === tk);
      root.append(h("p", "ap-title shown-grp", `Reiter „${tn}“ (${list.length})`));
      const doneFam = new Set();
      list.forEach((t, idx) => {
        const f = famOf(t);
        const mem = f ? list.filter((x) => famOf(x) === f) : [];
        if (f && mem.length >= 2) {
          if (doneFam.has(f.id)) return;
          doneFam.add(f.id);
          const d = document.createElement("details"); d.className = "shown-fam";
          d.open = get("themeFam_" + f.id, "0") === "1";
          d.addEventListener("toggle", () => put("themeFam_" + f.id, d.open ? "1" : "0"));
          const s = document.createElement("summary");
          const all = document.createElement("input"); all.type = "checkbox"; all.disabled = allOn(); all.title = "Alle Farben dieser Gruppe vorne anzeigen";
          all.checked = mem.every((x) => shown.has(x.id));
          all.addEventListener("click", (e) => e.stopPropagation());
          all.addEventListener("change", () => { mem.forEach((x) => { const cur = new Set(shownIds()); if (all.checked) cur.add(x.id); else cur.delete(x.id); if (!cur.size) cur.add(x.id); put("themeShown", JSON.stringify(THEMES.filter((q) => cur.has(q.id)).map((q) => q.id))); }); again(); });
          s.append(all, document.createTextNode(` ${f.name} (${mem.length} Farben)`));
          d.append(s);
          mem.forEach((x) => d.append(rowFor(x, list, list.indexOf(x))));
          root.append(d);
        } else root.append(rowFor(t, list, idx));
      });
    });
    const rec = h("button", "chip", "Empfehlung wählen"); rec.type = "button";
    rec.addEventListener("click", () => { put("themeShown", JSON.stringify(REC_SHOWN)); again(); });
    const rst = h("button", "chip", "Reihenfolge und Reiter zurücksetzen"); rst.type = "button";
    rst.addEventListener("click", () => { resetOrder(); again(); });
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
    loadCustom();
    const r = resolve();
    const t = byId(r.id);
    const root = document.documentElement;
    if (current === r.id && !(t.custom && root.dataset.customSig !== JSON.stringify(t.colors))) return r;
    if (fade) { root.classList.add("theme-fade"); setTimeout(() => root.classList.remove("theme-fade"), 450); }
    const tid = t.custom ? t.base : r.id;
    if (tid === "klassisch") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", tid);
    if (t.light) root.setAttribute("data-light", "1"); else root.removeAttribute("data-light");
    if (t.skin) root.setAttribute("data-skin", tid); else root.removeAttribute("data-skin");
    Object.keys(customVars({ bg: "#000000", panel: "#000000", text: "#ffffff", accent: "#ffffff", accent2: "#ffffff" }).v).forEach((k) => root.style.removeProperty(k));
    if (t.custom) { Object.entries(customVars(t.colors).v).forEach(([k, v]) => root.style.setProperty(k, v)); root.dataset.customSig = JSON.stringify(t.colors); } else delete root.dataset.customSig;
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
    /* drei Reiter: Wählen · Anzeigen & Reiter · Alle Designs */
    let sub = get("themeSub", "wahl"); if (!["wahl", "anz", "alle"].includes(sub)) sub = "wahl";
    const st = h("div", "set-tabs sub-tabs theme-subtabs"); st.setAttribute("role", "tablist");
    [["wahl", "Wählen"], ["anz", "Anzeigen & Reiter"], ["alle", "Alle Designs"]].forEach(([k, n]) => {
      const b = h("button", "seg-btn", n); b.type = "button"; b.setAttribute("aria-pressed", String(k === sub));
      b.addEventListener("click", () => { put("themeSub", k); mountUi(root); });
      st.append(b);
    });
    root.append(st);
    if (sub === "anz") {
      const all = h("label", "set-row check");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = allOn(); cb.id = "themeAllOpt";
      cb.addEventListener("change", () => { put("themeAll", cb.checked ? "1" : "0"); mountUi(root); });
      all.append(cb, document.createTextNode(" Alle Designs einschalten"));
      root.append(all);
      root.append(h("small", "set-hint", "Mit Haken wechselt das ◐ oben (bei aktiver Lupe) durch alle Designs. Ohne Haken gelten nur die unten angehakten."));
      const edBody = h("div", "theme-edit-body"); root.append(edBody);
      mountShown(edBody);
      return;
    }
    if (sub === "alle") {
      root.append(h("small", "set-hint", "Alle Designs ansehen: Tippen wählt das Design sofort (Wechsel auf „Fest“)."));
      const holder = h("div", "theme-picker-holder theme-embedded"); root.append(holder);
      const inner = buildPicker(holder, { gear: true, onPick: () => { inner.paint(); } });
      return;
    }
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
      shownThemes().forEach((t) => {
        const b = h("button", "seg-btn theme-opt", ""); b.type = "button"; b.dataset.theme = t.id;
        const sw = h("span", "theme-sw"); t.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
        b.append(sw, document.createTextNode(t.name)); b.title = t.hint;
        b.setAttribute("aria-pressed", String(t.id === c.theme));
        b.addEventListener("click", () => { put("theme", t.id); redraw(); });
        seg.append(b);
      });
      root.append(seg);
      root.append(h("small", "set-hint", "Hier stehen die vorne angebotenen Designs. Alle anderen findest du im Reiter „Alle Designs“, welche vorne erscheinen, stellst du unter „Anzeigen & Reiter“ ein."));
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
  /* Auswahlfenster: alle Designs in Reitern mit kleiner Vorschau; Designs mit gleichem Aufbau sind als Gruppe mit Farbauswahl zusammengefasst */
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
  /* ⚙ am Design (nur im Reiter „Alle Designs“): öffnet die Skin-Einstellungen (Benutzer, Farben) */
  let gearOn = false;
  function gearFor(btn, th) {
    if (!gearOn || typeof api.onGear !== "function") return;
    const g = h("span", "theme-gear", "⚙"); g.setAttribute("role", "button"); g.tabIndex = 0; g.title = "Skin-Einstellungen: Benutzer und Farben";
    const hasProf = (() => { try { const p = JSON.parse(get("skinProf", "{}"))[th.id]; return !!(p && p.on); } catch { return false; } })();
    if (hasProf) g.classList.add("on");
    const go = (e) => { e.preventDefault(); e.stopPropagation(); api.onGear(th.id); };
    g.addEventListener("click", go); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") go(e); });
    btn.append(g);
  }
  function famCard(f, mem, cur, pick) {
    const shownSet = new Set(shownIds());
    const card = h("div", "theme-fam" + (mem.some((x) => shownSet.has(x.id)) ? " has-shown" : ""));
    const active = mem.find((x) => x.id === cur) || mem[0];
    const head = h("div", "theme-fam-head");
    head.append(preview(active), (() => { const w = h("span", "theme-fam-txt"); w.append(h("b", "", f.name), h("small", "", f.hint + (mem.some((x) => x.id === cur) ? ` · aktiv: ${shortName(active, f)}` : ""))); return w; })());
    card.append(head);
    const chips = h("div", "theme-fam-chips");
    mem.forEach((x) => {
      const b = h("button", "theme-chip"); b.type = "button"; b.title = x.hint;
      if (x.id === cur) b.setAttribute("aria-pressed", "true");
      if (shownSet.has(x.id)) b.classList.add("is-shown");
      const sw = h("span", "theme-sw"); x.sw.forEach((col) => { const i = h("i"); i.style.background = col; sw.append(i); });
      b.append(sw, document.createTextNode(shortName(x, f)));
      b.addEventListener("click", () => pick(x));
      gearFor(b, x);
      chips.append(b);
    });
    card.append(chips);
    return card;
  }
  function renderThemeList(body, tab, cur, pick) {
    const list = ordered().filter((t) => tabOf(t) === tab);
    const done = new Set(); let last = "";
    const shownNow = new Set(shownIds());
    if (!list.length) body.append(h("p", "set-hint", "In diesem Reiter sind noch keine Designs. Unter „Anzeigen & Reiter“ kannst du Designs hierher verschieben."));
    list.forEach((th) => {
      const f = famOf(th);
      const mem = f ? list.filter((x) => famOf(x) === f) : [];
      const grouped = f && mem.length >= 2;
      if (grouped && done.has(f.id)) return;
      if (tab === "normal" && !customOrder() && subOf(th) !== last && !(grouped && f.id === "f-farb" && last === "Farbdesigns")) { last = subOf(th); body.append(h("p", "theme-sub", last)); }
      if (grouped) { done.add(f.id); body.append(famCard(f, mem, cur, pick)); return; }
      const b = h("button", "theme-pick"); b.type = "button";
      if (th.id === cur) b.setAttribute("aria-pressed", "true");
      if (shownNow.has(th.id)) b.classList.add("is-shown");
      b.append(preview(th), h("span", "theme-pick-name", th.name), h("small", "theme-pick-hint", th.hint));
      b.addEventListener("click", () => pick(th));
      gearFor(b, th);
      body.append(b);
    });
  }
  /* baut Reiter + Liste in einen Behälter (Fenster oder eingebettet im Einstellungsfenster) */
  function buildPicker(card, opts) {
    opts = opts || {};
    const cur = (cfg().mode === "manual" ? cfg().theme : "");
    const curTh = byId(cur);
    const TL = tabsList();
    let tab = curTh ? tabOf(curTh) : (get("themeTab", "") || "normal");
    if (!TL.some((x) => x[0] === tab)) tab = TL[0][0];
    const tabs = h("div", "theme-tabs"); tabs.setAttribute("role", "tablist");
    const body = h("div", "theme-picker-body");
    gearOn = !!opts.gear;
    const pick = (th) => { put("themeMode", "manual"); put("theme", th.id); apply(true); if (opts.onPick) opts.onPick(th); };
    const paint = () => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.k === tab)));
      body.replaceChildren();
      renderThemeList(body, tab, cfg().mode === "manual" ? cfg().theme : "", pick);
    };
    TL.forEach(([k, n]) => { const b = h("button", "theme-tab", n); b.type = "button"; b.dataset.k = k; b.setAttribute("role", "tab"); b.addEventListener("click", () => { tab = k; put("themeTab", k); paint(); }); tabs.append(b); });
    const legend = h("small", "set-hint theme-legend", "");
    legend.innerHTML = '<i class="lg-on"></i> farbig hinterlegt = aktiv (wird vorne im Hauptfenster angeboten) &nbsp; <i class="lg-cur"></i> Rahmen = gerade benutzt';
    card.append(legend, tabs, body);
    paint();
    return { paint };
  }
  function openPicker() {
    let box = document.getElementById("themePicker");
    if (box) box.remove();
    box = h("div", "theme-picker"); box.id = "themePicker";
    const card = h("div", "theme-picker-card");
    card.append(h("p", "theme-picker-title", "Design wählen"));
    const close = () => box.remove();
    const holder = h("div", "theme-picker-holder"); card.append(holder);
    let inner = buildPicker(holder, { onPick: close });
    const ed = h("button", "chip theme-pick-edit", "✎ Reiter und Reihenfolge bearbeiten"); ed.type = "button";
    let editing = false;
    ed.addEventListener("click", () => {
      editing = !editing;
      ed.textContent = editing ? "✔ Fertig" : "✎ Reiter und Reihenfolge bearbeiten";
      holder.replaceChildren();
      if (editing) mountShown(holder); else inner = buildPicker(holder, { onPick: close });
    });
    card.append(ed);
    const x = h("button", "theme-pick-close", "Schließen"); x.type = "button";
    x.addEventListener("click", close);
    card.append(x);
    box.append(card);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.body.append(box);
  }

  const api = { THEMES, FAMILIES, byId, famOf, shortName, customVars, loadCustom, onGear: null, repaint: null, REC, REC_SHOWN, shownIds, mountShown, resolve, apply, cycle, mountUi, sunTimes, cfg, openPicker, onChange: null };
  window.THEME = api;

  loadCustom();
  apply(false);
  setInterval(() => apply(true), 60000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") apply(true); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => apply(true));
})();
