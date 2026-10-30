/* Skin-Benutzer und eigene Farb-Skins
   - Jedem Design lässt sich ein Benutzer zuordnen (Name = Name des Designs). Beim Wechsel auf das Design werden dessen Einstellungen geladen,
     beim Verlassen kommt (wenn gewünscht) wieder der ursprüngliche Stand zurück. Pro Einstellung: Haken = wird geändert, ohne Haken = bleibt.
   - Mit den Farben lässt sich aus jedem Design ein zusätzliches Design in eigenen Farben anlegen (Liste „themeCustom“). */
(() => {
  "use strict";
  const T = window.THEME;
  if (!T) return;
  const EXCL = new Set(["theme", "themeMode", "themeDay", "themeNight", "themeShown", "themeTabs", "themeOrder", "themeTabList", "themeCustom", "skinProf", "skinActive", "skinBackup", "themeNames", "flugPos"]);
  const SKIN_ROWS = ["fontkar", "lyricalign", "cover", "fontlist", "sidebar", "verbar"];
  /* Empfehlungen je Art von Design (Werte; nur die zugehörigen Zeilen werden angehakt) */
  const REC_SETS = {
    pro: { vals: { [STORAGE.scale]: "48", [STORAGE.listSize]: "17", lyricAlign: "center", coverMode: "neu", coverFlip: "1", sidebarW: "340", verBarAlways: "1", verBarFade: "1" }, txt: "Professionell: größerer Text mittig, breiteres Auswahlfenster, Cover mit Drehung, Art-Buttons nur kurz." },
    tesla: { vals: { [STORAGE.scale]: "56", [STORAGE.listSize]: "20", lyricAlign: "center", sidebarW: "380", srcTags: "0", verBarAlways: "1", coverMode: "neu", coverFlip: "1" }, txt: "Tesla: sehr große Schrift in Text und Liste, breites Auswahlfenster, keine kleinen Kennzeichen." },
    handy: { vals: { [STORAGE.scale]: "40", [STORAGE.listSize]: "16", lyricAlign: "center", sidebarW: "0", srcTags: "0", verBarAlways: "0", verBarFade: "1", coverMode: "neu", coverFlip: "1" }, txt: "Handy: kompakt, Auswahlfenster in ganzer Breite, Kennzeichen und Art-Buttons nur kurz." },
    skin: { vals: { [STORAGE.scale]: "46", [STORAGE.listSize]: "17", lyricAlign: "skin", coverMode: "neu", coverFlip: "1" }, txt: "Skin: etwas größerer Text, Ausrichtung wie vom Design vorgegeben." },
    anim: { vals: { [STORAGE.scale]: "46", [STORAGE.listSize]: "17", lyricAlign: "center", coverMode: "neu", coverFlip: "1" }, txt: "Animiert: Text mittig, etwas größer." },
    farbe: { vals: { lyricAlign: "skin", coverMode: "neu", coverFlip: "1" }, txt: "Farbdesign: nur Cover-Einstellungen; Größen bleiben wie im Standard." }
  };
  function recOf(t) {
    const b = t.custom ? (T.byId(t.base) || t) : t;
    const k = b.grp === "Pro" ? "pro" : b.grp === "Tesla" ? "tesla" : b.grp === "Handy" ? "handy" : b.grp === "Skin" ? "skin" : b.grp === "Animiert" ? "anim" : "farbe";
    return REC_SETS[k];
  }
  const REC_ROWS = { [STORAGE.scale]: "fontkar", [STORAGE.listSize]: "fontlist", lyricAlign: "lyricalign", coverMode: "cover", coverFlip: "cover", sidebarW: "sidebar", srcTags: "tags", verBarAlways: "verbar", verBarFade: "verbar" };

  const j = (k, d) => { try { const v = JSON.parse(lsv(k, "")); return v === null || v === undefined ? d : v; } catch { return d; } };
  const profAll = () => { const o = j("skinProf", {}); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; };
  const profOf = (id) => profAll()[id] || null;
  const setProf = (id, p) => { const o = profAll(); if (p) o[id] = p; else delete o[id]; lss("skinProf", JSON.stringify(o)); };
  const el$ = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  const skinUserName = (t) => userCleanName(String(t.name).trim().replace(/\s+/g, "-"));

  /* ---------- Wechsel des Designs ---------- */
  let busy = false;
  async function enter(id, prof) {
    const r = await fetchUser(prof.user, "");
    if (r.state !== "ok" || r.none) return;
    const data = normPresets(r.presets);
    const target = presetTarget(data, "user").filter((x) => !EXCL.has(x.key));
    if (!target.length) { lss("skinActive", id); return; }
    if (!lsv("skinActive", "")) {
      const bk = {}; target.forEach((x) => { bk[x.key] = lsv(x.key, null); });
      lss("skinBackup", JSON.stringify(bk));
    } else {
      /* Wechsel von Skin zu Skin: Backup um neue Schlüssel ergänzen */
      const bk = j("skinBackup", {}); target.forEach((x) => { if (!(x.key in bk)) bk[x.key] = lsv(x.key, null); });
      lss("skinBackup", JSON.stringify(bk));
    }
    lss("skinActive", id);
    applyTarget(target);
  }
  function leave() {
    const bk = j("skinBackup", null);
    try { localStorage.removeItem("skinActive"); localStorage.removeItem("skinBackup"); } catch { /* egal */ }
    if (!bk) return;
    const target = [];
    state.applyingPreset = true;
    try { Object.entries(bk).forEach(([k, v]) => { if (v === null) { try { localStorage.removeItem(k); } catch { /* egal */ } } else target.push({ key: k, val: String(v) }); }); } finally { state.applyingPreset = false; }
    applyTarget(target);
  }
  async function onTheme(r) {
    if (busy) return;
    busy = true;
    try {
      const id = r.id, prof = profOf(id), act = lsv("skinActive", "");
      if (prof && prof.on && prof.user) { if (act !== id) await enter(id, prof); }
      else if (act) { const ap = profOf(act); if (!ap || ap.restore !== false) leave(); else { try { localStorage.removeItem("skinActive"); localStorage.removeItem("skinBackup"); } catch { /* egal */ } } }
    } catch { /* egal */ } finally { busy = false; }
  }
  T.onChange = (r) => { onTheme(r); };
  try { onTheme(T.resolve()); } catch { /* egal */ }

  /* ---------- Editor ---------- */
  const COLS = [["bg", "Hintergrund"], ["panel", "Flächen"], ["text", "Text"], ["accent", "Akzent"], ["accent2", "Akzent 2"]];
  const hex = (v) => (/^#[0-9a-f]{6}$/i.test(v) ? v : "#000000");
  function baseColors(t) {
    if (t.colors) return { ...t.colors };
    const light = !!t.light, ac = t.sw[2];
    return { bg: t.sw[0], panel: t.sw[1], text: light ? "#1c1f24" : "#f1f2f5", accent: ac, accent2: ac };
  }
  const customList = () => { const a = j("themeCustom", []); return Array.isArray(a) ? a : []; };
  function refreshList() { const hd = document.querySelector(".theme-embedded"); if (hd && hd.parentElement) T.mountUi(hd.parentElement); }
  const PV_KEYS = Object.keys(T.customVars({ bg: "#000000", panel: "#000000", text: "#ffffff", accent: "#ffffff", accent2: "#ffffff" }).v);
  function clearPreview() {
    const root = document.documentElement;
    PV_KEYS.forEach((k) => root.style.removeProperty(k));
    delete root.dataset.customSig; T.apply(false);
  }
  function preview(cols, node) { Object.entries(T.customVars(cols).v).forEach(([k, v]) => node.style.setProperty(k, v)); node.style.background = cols.panel; node.style.color = cols.text; }

  /* Vorschau auf dem Hauptbildschirm: Farben ausprobieren, ohne zu speichern; „Vorschau beenden“ führt zurück zum Editor */
  function mainPreview(t, cols, done) {
    const root = document.documentElement;
    document.getElementById("skinPv")?.remove();
    const orig = { ...cols };   /* Stand vor der Vorschau (für „Abbrechen“) */
    const base = t.custom ? t.base : t.id, bt = T.byId(base) || t;
    const put = () => {
      const cv = T.customVars(cols);
      if (base === "klassisch") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", base);
      if (cv.light) root.setAttribute("data-light", "1"); else root.removeAttribute("data-light");
      if (bt.skin) root.setAttribute("data-skin", base); else root.removeAttribute("data-skin");
      Object.entries(cv.v).forEach(([k, v]) => root.style.setProperty(k, v));
      paintSample();
    };
    const bar = el$("div", "sk-pvbar"); bar.id = "skinPv";
    bar.append(el$("b", "", `Vorschau: ${t.name}`));
    const sample = el$("div", "sk-pvsample");
    sample.innerHTML = '<p class="sk-s1">Karaoke-Text in der Textfarbe</p><p class="sk-s2">Zweite Zeile, gedämpft</p>';
    const paintSample = () => { sample.style.background = cols.panel; sample.style.borderColor = cols.accent; sample.querySelector(".sk-s1").style.color = cols.text; sample.querySelector(".sk-s2").style.color = T.customVars(cols).v["--muted"]; };
    const row = el$("div", "sk-pvcols");
    const inps = {};
    COLS.forEach(([k, n]) => {
      const l = el$("label", "sk-col"); l.append(document.createTextNode(n));
      const i = el$("input"); i.type = "color"; i.value = hex(cols[k]); inps[k] = i;
      i.oninput = () => { cols[k] = i.value; put(); };
      l.append(i); row.append(l);
    });
    const tools = el$("div", "sk-pvtools");
    const tb = (txt, label, fn) => { const b = el$("button", "chip", txt); b.type = "button"; b.setAttribute("aria-label", label); b.onclick = fn; return b; };
    const side = () => bar.classList.toggle("right", lsv("skPvSide", "bottom") === "right");
    tools.append(
      tb("A−", "Karaoke-Text kleiner", () => document.getElementById("smallerBtn") && document.getElementById("smallerBtn").click()),
      tb("A+", "Karaoke-Text größer", () => document.getElementById("largerBtn") && document.getElementById("largerBtn").click()),
      tb("⇆", "Leiste auf die andere Seite", () => { lss("skPvSide", lsv("skPvSide", "bottom") === "right" ? "bottom" : "right"); side(); }));
    /* Vorschau komplett beenden: Leiste weg, Hauptbildschirm wieder im ursprünglichen Design, zurück in den Editor */
    const finish = () => {
      bar.remove();
      PV_KEYS.forEach((k) => root.style.removeProperty(k));
      delete root.dataset.customSig;
      try { T.reapply(); } catch { /* egal */ }
      done();
    };
    const end = el$("button", "chip sk-pvend", "Vorschau beenden"); end.type = "button"; end.onclick = finish;
    const cancel = el$("button", "chip", "Abbrechen (zurück zum Stand vorher)"); cancel.type = "button";
    cancel.onclick = () => { Object.assign(cols, orig); COLS.forEach(([k]) => { inps[k].value = hex(orig[k]); }); finish(); };
    const reset = el$("button", "chip", "Zurücksetzen"); reset.type = "button";
    reset.onclick = () => { Object.assign(cols, orig); COLS.forEach(([k]) => { inps[k].value = hex(orig[k]); }); put(); };
    bar.append(sample, tools, row, reset, cancel, end);
    side(); put();
    document.body.append(bar);
  }

  async function openEditor(id) {
    const t = T.byId(id); if (!t) return;
    document.getElementById("skinEd")?.remove();
    const box = el$("div", "theme-picker"); box.id = "skinEd";
    const card = el$("div", "theme-picker-card sk-ed");
    box.append(card);
    const close = () => { box.remove(); refreshList(); };
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    card.append(el$("p", "theme-picker-title", `⚙ ${t.name}`));
    const body = el$("div", "sk-ed-body"); card.append(body);

    /* --- Benutzer --- */
    const prof = profOf(id) || { on: false, user: skinUserName(t), restore: true };
    const save = () => setProf(id, prof);
    body.append(el$("p", "ap-title", "Benutzer für dieses Design"));
    const row = (cb, txt) => { const l = el$("label", "set-row check"); l.append(cb, document.createTextNode(" " + txt)); return l; };
    const on = el$("input"); on.type = "checkbox"; on.checked = !!prof.on;
    on.onchange = () => { prof.on = on.checked; save(); sync(); };
    body.append(row(on, "Beim Wechsel auf dieses Design die Einstellungen dieses Benutzers laden"));
    const nameRow = el$("label", "set-row"); nameRow.append(document.createTextNode("Benutzername "));
    const nm = el$("input"); nm.type = "text"; nm.value = prof.user || skinUserName(t); nm.setAttribute("list", "skinUserList"); nm.maxLength = 40; nm.autocapitalize = "none";
    const dl = el$("datalist"); dl.id = "skinUserList"; userKnown().forEach((n) => { const o = el$("option"); o.value = n; dl.append(o); });
    nameRow.append(nm, dl); body.append(nameRow);
    const rs = el$("input"); rs.type = "checkbox"; rs.checked = prof.restore !== false;
    rs.onchange = () => { prof.restore = rs.checked; save(); };
    body.append(row(rs, "Beim Verlassen des Designs zu den ursprünglichen Einstellungen zurückkehren"));
    const msg = el$("small", "set-hint", "Ist kein Benutzer zugeordnet (Haken aus), ändert sich beim Wechsel nichts.");
    const rowsBox = el$("div", "sk-ed-rows");
    const btns = el$("div", "sk-ed-btns");
    const bStd = el$("button", "chip", "Aus Voreinstellung „Standard“ kopieren"); bStd.type = "button";
    const bPro = el$("button", "chip", "Empfehlung für dieses Design"); bPro.type = "button"; bPro.title = recOf(t).txt;
    const bSave = el$("button", "chip", "Benutzer speichern"); bSave.type = "button";
    btns.append(bStd, bPro, bSave); body.append(btns, msg);
    body.append(el$("small", "set-hint", "Haken = diese Einstellung wird beim Wechsel geändert. Ohne Haken bleibt sie wie sie ist."), rowsBox);

    let draft = { on: {}, vals: {} };
    const fresh = async () => {
      const std = await sysData("standard");
      const d = { on: Object.fromEntries(PRESETS.map((p) => [p.id, SKIN_ROWS.includes(p.id)])), vals: { ...std.vals } };
      return d;
    };
    const paintRows = () => buildPresetRows(rowsBox, { live: false, name: nm.value, skip: ["theme", "themeshown"], get: () => draft, save: async (d) => { draft = d; await persist(true); } });
    let tm = 0, exists = false;
    const stat = el$("small", "sk-stat", "");
    nameRow.after(stat);
    const paintStat = () => { nm.classList.toggle("sk-new", !exists); nm.classList.toggle("sk-exist", exists); stat.className = "sk-stat " + (exists ? "ok" : "new"); stat.textContent = exists ? "● vorhandener Benutzer – wird bearbeitet" : "● neuer Benutzer – wird erst nach Rückfrage angelegt"; };
    async function persist(quiet) {
      const name = userCleanName(nm.value);
      if (!name) { msg.textContent = "Bitte einen Namen eingeben."; return false; }
      if (!exists) {
        const yes = await uiDialog({ eyebrow: "Benutzer", title: `Benutzer „${name}“ neu anlegen?`, cancelValue: false, lines: ["Diesen Benutzer gibt es noch nicht. Er speichert die Einstellungen für dieses Design."], buttons: [{ value: true, kind: "primary", label: "Anlegen" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
        if (!yes) { msg.textContent = "Nicht angelegt."; return false; }
      }
      prof.user = name; save();
      const ok = await putUser(name, "", { presets: draft, hash: "", links: [] });
      if (ok) { exists = true; paintStat(); userKnownAdd([name]); if (!quiet) msg.textContent = `Benutzer „${name}“ gespeichert.`; else { clearTimeout(tm); msg.textContent = "Gespeichert."; } }
      else msg.textContent = "Konnte nicht gespeichert werden (offline oder Benutzer mit Passwort geschützt).";
      return ok;
    }
    async function loadUser() {
      const name = userCleanName(nm.value);
      const r = name ? await fetchUser(name, "") : { state: "none" };
      exists = r.state === "ok" && !r.none && Object.keys(r.presets).length > 0;
      if (exists) { draft = normPresets(r.presets); msg.textContent = `Benutzer „${name}“ geladen.`; }
      else if (r.state === "locked") { draft = await fresh(); msg.textContent = "Dieser Benutzer ist mit Passwort geschützt – bitte einen anderen Namen wählen."; }
      else { draft = await fresh(); msg.textContent = `Benutzer „${name}“ gibt es noch nicht – Vorschlag aus „Standard“; mit „Benutzer speichern“ anlegen.`; }
      paintStat(); paintRows();
    }
    function sync() { rowsBox.style.opacity = on.checked ? "1" : ".55"; }
    nm.onchange = () => { nm.value = userCleanName(nm.value); loadUser(); prof.user = nm.value; save(); };
    bStd.onclick = async () => { const std = await sysData("standard"); draft.vals = { ...draft.vals, ...std.vals }; paintRows(); msg.textContent = "Werte aus „Standard“ kopiert (Haken unverändert). Zum Sichern „Benutzer speichern“."; };
    bPro.onclick = async () => {
      const rec = recOf(t); draft = await fresh();
      Object.assign(draft.vals, rec.vals);
      PRESETS.forEach((p) => { draft.on[p.id] = false; });
      Object.keys(rec.vals).forEach((k) => { if (REC_ROWS[k]) draft.on[REC_ROWS[k]] = true; });
      paintRows(); msg.textContent = `Empfehlung eingetragen – ${rec.txt} Zum Sichern „Benutzer speichern“.`;
    };
    bSave.onclick = () => persist(false);
    sync();
    await loadUser();

    /* --- Farben --- */
    body.append(el$("p", "ap-title sk-ed-sep", "Farben – eigenes Design anlegen"));
    const cols = baseColors(t);
    const cr = el$("div", "sk-ed-cols");
    const inputs = {};
    COLS.forEach(([k, n]) => {
      const l = el$("label", "sk-col"); l.append(document.createTextNode(n));
      const i = el$("input"); i.type = "color"; i.value = hex(cols[k]); inputs[k] = i;
      i.oninput = () => { cols[k] = i.value; preview(cols, pv); };
      l.append(i); cr.append(l);
    });
    const pv = el$("div", "sk-prev");
    pv.innerHTML = '<div class="sk-prev-bar"><b>Vorschau</b><span>Lied 117</span></div><div class="sk-prev-body"><p>Karaoke-Text in der Textfarbe</p><p class="sk-prev-m">Zweite Zeile, gedämpft</p><button type="button">Akzent</button> <button type="button" class="sk-prev-2">Akzent 2</button></div>';
    preview(cols, pv);
    body.append(cr, pv);
    const nrow = el$("label", "set-row"); nrow.append(document.createTextNode("Name des Designs "));
    const dn = el$("input"); dn.type = "text"; dn.maxLength = 28; dn.value = t.custom ? t.name : `${t.name} eigen`;
    nrow.append(dn); body.append(nrow);
    const cm = el$("small", "set-hint", "Die Farben sind nur in diesem Fenster als Vorschau sichtbar; das aktuelle Design bleibt unverändert, bis du ein neues Design speicherst. Designs mit fest eingebauten Farben (z. B. blaue Leiste bei Bibliothek) folgen nur teilweise.");
    const cb = el$("div", "sk-ed-btns");
    const bNew = el$("button", "chip", "Als neues Design speichern"); bNew.type = "button";
    const bTry = el$("button", "chip", "👁 Vorschau auf dem Hauptbildschirm"); bTry.type = "button";
    bTry.onclick = () => {
      box.style.display = "none";
      mainPreview(t, cols, () => { COLS.forEach(([k]) => { inputs[k].value = hex(cols[k]); }); preview(cols, pv); box.style.display = ""; });
    };
    cb.append(bTry, bNew);
    const base = t.custom ? t.base : t.id;
    const writeList = (a) => lss("themeCustom", JSON.stringify(a));
    bNew.onclick = () => {
      const nid = "u-" + Date.now().toString(36);
      const a = customList(); a.push({ id: nid, name: (dn.value.trim() || "Eigenes Design").slice(0, 28), base, colors: { ...cols } });
      writeList(a); lss("themeMode", "manual"); lss("theme", nid);
            T.apply(true); cm.textContent = "Neues Design gespeichert und eingeschaltet."; box.remove(); refreshList();
    };
    if (t.custom) {
      const bUp = el$("button", "chip", "Änderungen speichern"); bUp.type = "button";
      bUp.onclick = () => { const a = customList().map((c) => (c.id === id ? { ...c, name: (dn.value.trim() || c.name).slice(0, 28), colors: { ...cols } } : c)); writeList(a); clearPreview(); T.apply(true); cm.textContent = "Gespeichert."; refreshList(); };
      const bDel = el$("button", "chip danger", "Dieses Design löschen"); bDel.type = "button";
      bDel.onclick = () => {
        if (lsv("theme", "") === id) lss("theme", base);
        const o = profAll(); delete o[id]; lss("skinProf", JSON.stringify(o));
        writeList(customList().filter((c) => c.id !== id)); clearPreview(); T.apply(true); box.remove(); refreshList();
      };
      cb.append(bUp, bDel);
    }
    body.append(cb, cm);
    const x = el$("button", "theme-pick-close", "Schließen"); x.type = "button"; x.onclick = close;
    card.append(x);
    document.body.append(box);
  }

  /* ---------- Benutzername-Vorschlag im Feld „Benutzername“ (Voreinstellungen) ---------- */
  function wireUserName() {
    const inp = document.getElementById("userName"), box = document.getElementById("userNew");
    if (!inp || !box || inp._skinWired) return;
    inp._skinWired = true;
    const st = document.createElement("small"); st.id = "userNameState"; st.className = "set-hint un-state";
    inp.parentElement.append(st);
    let tm = 0, seq = 0;
    const suggest = () => { try { const t = T.byId(T.resolve().id); return t ? skinUserName(t) : ""; } catch { return ""; } };
    const check = () => {
      clearTimeout(tm);
      tm = setTimeout(async () => {
        const name = userCleanName(inp.value), my = ++seq;
        inp.classList.remove("un-new", "un-ex");
        if (name.length < 2) { st.textContent = ""; return; }
        if (typeof SYS !== "undefined" && SYS[name]) { st.textContent = "Voreinstellung (gemeinsam für alle)."; return; }
        const r = await fetchUser(name, "");
        if (my !== seq) return;
        if (r.state === "none") { inp.classList.add("un-new"); st.textContent = "Neu – wird nach einer Rückfrage angelegt."; }
        else if (r.state === "ok" || r.state === "locked") { inp.classList.add("un-ex"); st.textContent = r.state === "locked" ? "Vorhanden (mit Passwort geschützt) – wird bearbeitet." : "Vorhanden – wird bearbeitet."; }
        else st.textContent = "Server nicht erreichbar.";
      }, 350);
    };
    inp.addEventListener("input", check);
    const fill = () => { if (!box.hidden && !inp.value.trim()) { inp.value = suggest(); check(); } };
    new MutationObserver(fill).observe(box, { attributes: true, attributeFilter: ["hidden"] });
    inp.addEventListener("focus", fill);
    fill();
  }
  wireUserName();
  document.addEventListener("click", () => setTimeout(wireUserName, 0), true);

  /* ---------- Verwalten: alle Designs (umbenennen, löschen) und Benutzer (Liste, löschen) ---------- */
  const namesMap = () => { const o = j("themeNames", {}); return o && typeof o === "object" && !Array.isArray(o) ? o : {}; };
  async function openManage() {
    document.getElementById("skinMan")?.remove();
    const box = el$("div", "theme-picker"); box.id = "skinMan";
    const card = el$("div", "theme-picker-card sk-ed"); box.append(card);
    const close = () => { box.remove(); refreshList(); };
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    card.append(el$("p", "theme-picker-title", "Designs und Benutzer verwalten"));
    const body = el$("div", "sk-ed-body"); card.append(body);
    const paint = () => {
      body.replaceChildren();
      body.append(el$("p", "ap-title", "Alle Designs"));
      body.append(el$("small", "set-hint", "Namen ändern (leer = Originalname). ⚙ öffnet Benutzer und Farben. Eigene Designs lassen sich löschen."));
      const nm = namesMap();
      T.THEMES.forEach((t) => {
        const row = el$("div", "sk-man-row");
        const sw = el$("span", "theme-sw"); t.sw.forEach((c) => { const i = el$("i"); i.style.background = c; sw.append(i); });
        const inp = el$("input"); inp.type = "text"; inp.maxLength = 28; inp.value = t.name; inp.setAttribute("aria-label", "Name");
        inp.onchange = () => {
          const v = inp.value.trim().slice(0, 28);
          if (t.custom) lss("themeCustom", JSON.stringify(customList().map((c) => (c.id === t.id ? { ...c, name: v || c.name } : c))));
          else { const o = namesMap(); if (!v || v === t.orig) delete o[t.id]; else o[t.id] = v; lss("themeNames", JSON.stringify(o)); }
          T.apply(true); paint();
        };
        const pr = profOf(t.id);
        const tag = el$("small", "sk-man-tag", pr && pr.on ? `Benutzer: ${pr.user}` : t.custom ? "eigen" : "");
        const g = el$("button", "chip", "⚙"); g.type = "button"; g.onclick = () => { box.remove(); openEditor(t.id); };
        row.append(sw, inp, tag, g);
        if (t.custom) { const d = el$("button", "chip danger", "Löschen"); d.type = "button"; d.onclick = () => { if (lsv("theme", "") === t.id) lss("theme", t.base); const o = profAll(); delete o[t.id]; lss("skinProf", JSON.stringify(o)); lss("themeCustom", JSON.stringify(customList().filter((c) => c.id !== t.id))); T.apply(true); paint(); }; row.append(d); }
        body.append(row);
      });
      body.append(el$("p", "ap-title sk-ed-sep", "Benutzer"));
      const msg = el$("small", "set-hint", "Die Liste aller Benutzer auf dem Server braucht das Schreib-Passwort.");
      const ub = el$("div", "sk-man-users");
      const load = el$("button", "chip", "Benutzerliste laden"); load.type = "button";
      load.onclick = async () => {
        const key = await askKey("Benutzerliste");
        if (!key) return;
        msg.textContent = "Bitte warten …";
        try {
          const r = await fetch(`${SYNC_BASE}/api/users`, { headers: { "x-write-key": key } });
          const d = await r.json().catch(() => ({}));
          if (!r.ok || !d.ok) { msg.textContent = d.fehler || `Fehler ${r.status}`; return; }
          ub.replaceChildren();
          const mine = new Set(Object.values(profAll()).map((p) => p.user));
          d.benutzer.forEach((u) => {
            const row = el$("div", "sk-man-row");
            row.append(el$("span", "sk-man-name", u.name + (u.system ? " (Voreinstellung)" : "")), el$("small", "sk-man-tag", (u.passwort ? "Passwort · " : "") + (mine.has(u.name) ? "Design-Benutzer" : "")));
            if (!u.system) {
              const del = el$("button", "chip danger", "Löschen"); del.type = "button";
              del.onclick = async () => {
                if (!(await uiConfirm({ eyebrow: "Benutzer", title: `„${u.name}“ löschen?`, lines: ["Der Benutzer und seine Voreinstellungen werden auf dem Server gelöscht."], ok: "Löschen", danger: true }))) return;
                try {
                  const rr = await fetch(`${SYNC_BASE}/user/${encodeURIComponent(u.name)}`, { method: "DELETE", headers: { "x-write-key": key } });
                  if (!rr.ok) { msg.textContent = rr.status === 401 ? "Schlüssel falsch." : "Löschen fehlgeschlagen."; return; }
                } catch { msg.textContent = "Server nicht erreichbar."; return; }
                lss("userList", JSON.stringify(userKnown().filter((n) => n !== u.name)));
                const o = profAll(); Object.keys(o).forEach((k) => { if (o[k].user === u.name) o[k].on = false; }); lss("skinProf", JSON.stringify(o));
                row.remove(); msg.textContent = `„${u.name}“ gelöscht.`;
              };
              row.append(del);
            }
            ub.append(row);
          });
          msg.textContent = `${d.anzahl} Benutzer.`;
        } catch { msg.textContent = "Server nicht erreichbar."; }
      };
      body.append(load, msg, ub);
    };
    paint();
    const x = el$("button", "theme-pick-close", "Schließen"); x.type = "button"; x.onclick = close; card.append(x);
    document.body.append(box);
  }
  T.onManage = openManage;
  T.onGear = openEditor;
  window.SKINPROF = { open: openEditor, profOf, setProf };
})();
