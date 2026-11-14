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
  const el2 = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
  async function saveOther(name) {
    let hash = "";
    let r = await fetchUser(name, "");
    if (r.state === "locked") {
      const pw = await uiPrompt({ eyebrow: "Benutzer", title: `Passwort für „${name}“`, type: "password", ok: "Speichern" });
      if (!pw) return "abgebrochen";
      hash = await userHashOf(name, pw);
      r = await fetchUser(name, hash);
      if (r.state === "locked") return "Passwort falsch";
    }
    if (r.state === "error") return "Server nicht erreichbar";
    const d = r.state === "ok" ? normPresets(r.presets) : normPresets({});
    ids.forEach((id) => { d.on[id] = true; });
    presetCapture(d, ids);
    return (await putUser(name, hash, { presets: d })) ? "gespeichert" : "nicht gespeichert";
  }
  async function saveSys(name) {
    let key = sysKey();
    if (!key || !(await verifyKey(name, key))) {
      key = await askKey(`${SYS_LABEL[name]}-Voreinstellung ändern`);
      if (!key) return "abgebrochen";
      if (!(await verifyKey(name, key))) return "Schreib-Passwort falsch";
      sysKeyMem = key;
    }
    const draft = await sysData(name);
    ids.forEach((id) => { draft.on[id] = true; });
    presetCapture(draft, ids);
    return (await putUser(SYS[name], "", { presets: draft }, { "x-write-key": key })) ? "gespeichert" : "Server nicht erreichbar";
  }
  async function ask() {
    if (asking) return;
    asking = true;
    try {
      const un = typeof userName === "function" ? userName() : "";
      const active = un && !SYS[un] && !String(un).startsWith("_") ? un : "";
      const others = userKnown().filter((n) => n !== active && !n.startsWith("_"));
      const box = el2("div", "v180-box"); box.style.cssText = "display:grid;gap:8px";
      const st = el2("small", "set-hint", active ? `Die Änderungen sind schon im Benutzer „${active}“ gespeichert.` : "Du bist nicht angemeldet – die Änderungen gelten nur auf diesem Gerät.");
      box.append(st);
      const run = async (label, fn, b) => { b.disabled = true; st.textContent = `${label}: bitte warten …`; let m = "Fehler"; try { m = await fn(); } catch { /* egal */ } st.textContent = `${label}: ${m}`; b.disabled = false; };
      if (others.length) {
        box.append(el2("small", "set-hint", "Zusätzlich in einem anderen Benutzer speichern:"));
        others.forEach((n) => { const b = el2("button", "chip", `Auch in „${n}“ speichern`); b.type = "button"; b.style.cssText = "justify-self:start"; b.onclick = () => run(`„${n}“`, () => saveOther(n), b); box.append(b); });
      } else if (!active) box.append(el2("small", "set-hint", "Melde dich über das Benutzer-Symbol an, dann werden Designs automatisch im Benutzer gespeichert."));
      const tog = el2("button", "pw-toggle", "▸ Voreinstellungen (Tesla, Handy, Standard)"); tog.type = "button"; tog.setAttribute("aria-expanded", "false");
      const pre = el2("div"); pre.hidden = true; pre.style.cssText = "display:grid;gap:6px";
      pre.append(el2("small", "set-hint", "Gilt für alle, die diese Voreinstellung verwenden. Dafür brauchst du das Schreib-Passwort."));
      ["tesla", "handy", "standard"].forEach((k) => { const b = el2("button", "chip", `In Voreinstellung ${SYS_LABEL[k]} speichern`); b.type = "button"; b.style.cssText = "justify-self:start"; b.onclick = () => run(SYS_LABEL[k], () => saveSys(k), b); pre.append(b); });
      tog.onclick = () => { pre.hidden = !pre.hidden; tog.setAttribute("aria-expanded", String(!pre.hidden)); tog.textContent = (pre.hidden ? "▸" : "▾") + " Voreinstellungen (Tesla, Handy, Standard)"; };
      box.append(tog, pre);
      await uiDialog({ eyebrow: "Designs", title: "Design-Änderungen zusätzlich speichern?", lines: [{ node: box }], buttons: [{ value: "ok", kind: "primary", label: "Fertig" }], cancelValue: "ok" });
      quiet = true;
    } catch { /* egal */ } finally { asking = false; }
  }
  window.V180 = { ask };
})();
