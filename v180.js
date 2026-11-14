/* v180: Design-Änderungen (Auswahl, Reihenfolge, Reiter, Anpassungen, Filter) nach Rückfrage im Benutzer oder in einer Voreinstellung (Tesla/Handy/Standard) speichern */
(function () {
  "use strict";
  const WATCH = ["themeShown", "themeOrder", "themeTabs", "themeTabList", "themeCustom", "themeNames", "themeAll", "themeListMode", "skinOnlyMode", "skinProf"];
  const T0 = Date.now();
  let lastTap = 0, timer = 0, asking = false, quiet = false;
  document.addEventListener("pointerdown", () => { lastTap = Date.now(); }, true);
  document.addEventListener("keydown", () => { lastTap = Date.now(); }, true);

  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    const old = this === localStorage ? this.getItem(k) : null;
    orig.call(this, k, v);
    if (this !== localStorage || !WATCH.includes(k) || old === String(v)) return;
    if (typeof state !== "undefined" && state.applyingPreset) return;
    if (Date.now() - T0 < 8000 || Date.now() - lastTap > 20000 || quiet) return;
    clearTimeout(timer); timer = setTimeout(ask, 4000);
  };

  const ids = ["themeshown", "skinfilter"];
  async function saveUser() {
    state.touched.add("themeshown"); state.touched.add("skinfilter");
    state.designSave = true;
    try { await userSaveSettings(); } finally { state.designSave = false; }
  }
  async function saveSys(name) {
    let key = sysKey();
    if (!key || !(await verifyKey(name, key))) {
      key = await askKey(`${SYS_LABEL[name]}-Voreinstellung ändern`);
      if (!key) return "abgebrochen";
      if (!(await verifyKey(name, key))) { await uiAlert("Passwort falsch", "Das Schreib-Passwort stimmt nicht (oder der Server ist nicht erreichbar). Nichts wurde gespeichert."); return "Passwort falsch"; }
      sysKeyMem = key;
    }
    const draft = await sysData(name);
    state.designSave = true;
    try { ids.forEach((id) => { draft.on[id] = true; }); presetCapture(draft, ids); } finally { state.designSave = false; }
    const ok = await putUser(SYS[name], "", { presets: draft }, { "x-write-key": key });
    return ok ? "gespeichert" : "Server nicht erreichbar";
  }
  async function ask() {
    if (asking) return;
    asking = true;
    try {
      const un = typeof userName === "function" ? userName() : "";
      const user = un && !SYS[un] && !String(un).startsWith("_") ? un : "";
      const buttons = [];
      if (user) buttons.push({ value: "user", kind: "primary", label: `Im Benutzer „${user}“ speichern` });
      buttons.push({ value: "tesla", kind: user ? "" : "primary", label: "In Voreinstellung Tesla speichern" }, { value: "handy", label: "In Voreinstellung Handy speichern" }, { value: "standard", label: "In Voreinstellung Standard speichern" }, { value: "no", kind: "cancel", label: "Nur auf diesem Gerät lassen" });
      const r = await uiDialog({ eyebrow: "Designs", title: "Design-Änderungen speichern?",
        lines: ["Du hast bei den Designs etwas geändert (Auswahl, Reihenfolge, Reiter, eigene Anpassungen oder den Filter im Auswahlfenster).", user ? "Soll das auch im Benutzer oder in einer Voreinstellung (gilt für alle) gespeichert werden?" : "Soll das auch in einer Voreinstellung (gilt für alle) gespeichert werden? Voreinstellungen brauchen das Schreib-Passwort."],
        buttons, cancelValue: "no" });
      if (r === "user") { await saveUser(); showToast(`Designs im Benutzer „${user}“ gespeichert`); }
      else if (r === "tesla" || r === "handy" || r === "standard") { const m = await saveSys(r); showToast(`${SYS_LABEL[r]}: ${m}`); }
      else quiet = true;   /* bis zum nächsten Neuladen nicht mehr fragen */
    } catch { /* egal */ } finally { asking = false; }
  }
  window.V180 = { ask };
})();
