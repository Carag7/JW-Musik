/* Skin-Benutzer und eigene Farb-Skins
   - Jedem Design lässt sich ein Benutzer zuordnen (Name = Name des Designs). Beim Wechsel auf das Design werden dessen Einstellungen geladen,
     beim Verlassen kommt (wenn gewünscht) wieder der ursprüngliche Stand zurück. Pro Einstellung: Haken = wird geändert, ohne Haken = bleibt.
   - Mit den Farben lässt sich aus jedem Design ein zusätzliches Design in eigenen Farben anlegen (Liste „themeCustom“). */
(() => {
  "use strict";
  const T = window.THEME;
  if (!T) return;
  const EXCL = new Set(["theme", "themeMode", "themeDay", "themeNight", "themeShown", "themeTabs", "themeOrder", "themeTabList", "themeCustom", "skinProf", "skinActive", "skinBackup"]);
  const SKIN_ROWS = ["fontkar", "lyricalign", "cover", "fontlist", "sidebar", "verbar"];
  /* Empfehlung für die „professionellen“ Skins (Aurora Pro, Atelier, Bibliothek) */
  const PRO_VALS = { [STORAGE.scale]: "48", [STORAGE.listSize]: "17", lyricAlign: "center", coverMode: "neu", coverFlip: "1", sidebarW: "340", verBarAlways: "1" };
  const PRO_FAMS = ["f-pro", "f-atl", "f-jwl"];

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
  function preview(cols) { const root = document.documentElement; Object.entries(T.customVars(cols).v).forEach(([k, v]) => root.style.setProperty(k, v)); }

  async function openEditor(id) {
    const t = T.byId(id); if (!t) return;
    document.getElementById("skinEd")?.remove();
    const box = el$("div", "theme-picker"); box.id = "skinEd";
    const card = el$("div", "theme-picker-card sk-ed");
    box.append(card);
    const close = () => { clearPreview(); box.remove(); refreshList(); };
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
    const bPro = el$("button", "chip", "Empfehlung für dieses Design"); bPro.type = "button";
    const bSave = el$("button", "chip", "Benutzer speichern"); bSave.type = "button";
    btns.append(bStd, bPro, bSave); body.append(btns, msg);
    body.append(el$("small", "set-hint", "Haken = diese Einstellung wird beim Wechsel geändert. Ohne Haken bleibt sie wie sie ist."), rowsBox);

    let draft = { on: {}, vals: {} };
    const fresh = async () => {
      const std = await sysData("standard");
      const d = { on: Object.fromEntries(PRESETS.map((p) => [p.id, SKIN_ROWS.includes(p.id)])), vals: { ...std.vals } };
      const f = T.famOf(t) || (t.base && T.famOf(T.byId(t.base)));
      if (f && PRO_FAMS.includes(f.id)) Object.assign(d.vals, PRO_VALS);
      return d;
    };
    const paintRows = () => buildPresetRows(rowsBox, { live: false, name: nm.value, skip: ["theme", "themeshown"], get: () => draft, save: async (d) => { draft = d; await persist(true); } });
    let tm = 0;
    async function persist(quiet) {
      const name = userCleanName(nm.value);
      if (!name) { msg.textContent = "Bitte einen Namen eingeben."; return false; }
      prof.user = name; save();
      const ok = await putUser(name, "", { presets: draft, hash: "", links: [] });
      if (ok) { userKnownAdd([name]); if (!quiet) msg.textContent = `Benutzer „${name}“ gespeichert.`; else { clearTimeout(tm); msg.textContent = "Gespeichert."; } }
      else msg.textContent = "Konnte nicht gespeichert werden (offline oder Benutzer mit Passwort geschützt).";
      return ok;
    }
    async function loadUser() {
      const name = userCleanName(nm.value);
      const r = name ? await fetchUser(name, "") : { state: "none" };
      if (r.state === "ok" && !r.none && Object.keys(r.presets).length) { draft = normPresets(r.presets); msg.textContent = `Benutzer „${name}“ geladen.`; }
      else if (r.state === "locked") { draft = await fresh(); msg.textContent = "Dieser Benutzer ist mit Passwort geschützt – bitte einen anderen Namen wählen."; }
      else { draft = await fresh(); msg.textContent = `Benutzer „${name}“ gibt es noch nicht – Vorschlag aus „Standard“; mit „Benutzer speichern“ anlegen.`; }
      paintRows();
    }
    function sync() { rowsBox.style.opacity = on.checked ? "1" : ".55"; }
    nm.onchange = () => { nm.value = userCleanName(nm.value); loadUser(); prof.user = nm.value; save(); };
    bStd.onclick = async () => { const std = await sysData("standard"); draft.vals = { ...draft.vals, ...std.vals }; paintRows(); msg.textContent = "Werte aus „Standard“ kopiert (Haken unverändert). Zum Sichern „Benutzer speichern“."; };
    bPro.onclick = async () => { draft = await fresh(); Object.assign(draft.vals, PRO_VALS); SKIN_ROWS.forEach((k) => { draft.on[k] = true; }); paintRows(); msg.textContent = "Empfehlung eingetragen. Zum Sichern „Benutzer speichern“."; };
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
      i.oninput = () => { cols[k] = i.value; preview(cols); };
      l.append(i); cr.append(l);
    });
    body.append(cr);
    const nrow = el$("label", "set-row"); nrow.append(document.createTextNode("Name des Designs "));
    const dn = el$("input"); dn.type = "text"; dn.maxLength = 28; dn.value = t.custom ? t.name : `${t.name} eigen`;
    nrow.append(dn); body.append(nrow);
    const cm = el$("small", "set-hint", "Die Farben sind eine Vorschau, bis du speicherst. Designs mit fest eingebauten Farben (z. B. blaue Leiste bei Bibliothek) folgen nur teilweise.");
    const cb = el$("div", "sk-ed-btns");
    const bNew = el$("button", "chip", "Als neues Design speichern"); bNew.type = "button";
    cb.append(bNew);
    const base = t.custom ? t.base : t.id;
    const writeList = (a) => lss("themeCustom", JSON.stringify(a));
    bNew.onclick = () => {
      const nid = "u-" + Date.now().toString(36);
      const a = customList(); a.push({ id: nid, name: (dn.value.trim() || "Eigenes Design").slice(0, 28), base, colors: { ...cols } });
      writeList(a); lss("themeMode", "manual"); lss("theme", nid);
      document.documentElement.style.cssText = document.documentElement.style.cssText; /* Vorschau-Variablen bleiben bis apply */
      clearPreview(); T.apply(true); cm.textContent = "Neues Design gespeichert und eingeschaltet."; box.remove(); refreshList();
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
  T.onGear = openEditor;
  window.SKINPROF = { open: openEditor, profOf, setProf };
})();
