/* v180: Design-Änderungen werden still im angemeldeten Benutzer / Gerät gespeichert; dieser Knopf speichert zusätzlich in einen anderen Benutzer oder eine Voreinstellung */
(function () {
  "use strict";
  let asking = false;
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
      await uiDialog({ eyebrow: "Designs", title: "Designs zusätzlich speichern", lines: [{ node: box }], buttons: [{ value: "ok", kind: "primary", label: "Fertig" }], cancelValue: "ok" });
    } catch { /* egal */ } finally { asking = false; }
  }
  /* Knopf am Ende jedes Design-Reiters (Einstellungen → Design) */
  const addBtn = () => {
    const root = document.getElementById("themeBox");
    if (!root || root.querySelector(".v180-save") || !root.children.length) return;
    const b = el2("button", "chip v180-save", "💾 Designs zusätzlich speichern …"); b.type = "button"; b.style.cssText = "margin:14px 0 40px";
    b.onclick = ask; root.append(b);
  };
  new MutationObserver(addBtn).observe(document.body, { childList: true, subtree: true });
  window.V180 = { ask };
})();
