/* v163: Benutzer (Einstellungen) und Favoriten-Benutzer getrennt anmelden/anlegen, Statusanzeige mit Zeiten und Serverzahlen,
   Bestätigung vor dem Abgleich, Voreinstellungen unter „Sichern“ */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const lget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
  const lset = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const when = (ts) => { const n = Number(ts); return n ? new Date(n).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" }) : "noch nie"; };
  const cleanStore = (n) => String(n || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const SYSN = { tesla: "Tesla", handy: "Handy", standard: "Standard" };

  /* Tesla-Browser erkennen (für Auswahlpfeil-Darstellung) */
  try { if (/Tesla/i.test(navigator.userAgent) || /[?&]tesla=1/.test(location.search)) document.documentElement.classList.add("tesla-ua"); } catch { /* egal */ }
  /* Tesla-Tasten: „Halten = Spulen“ verzögert das Lied-Weiterschalten – einmalig ausschalten (Tasten wirken wieder sofort) */
  try { if (!lget("mediaHoldMig164", "")) { lset("mediaHold", "0"); lset("mediaHoldMig164", "1"); } } catch { /* egal */ }
  /* Beim Löschen aller Browserdaten dürfen keine Werte mehr geschrieben werden (z. B. beim Schließen der Seite) */
  try {
    const rawSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) { if (window.__wipe) return; return rawSet.call(this, k, v); };
  } catch { /* egal */ }

  /* Früher wurde für Favoriten und Einstellungen automatisch derselbe Name genommen – jetzt getrennt (einmal zurücksetzen) */
  try { if (!lget("sameNameMig163", "")) { lset("sameName", "0"); lset("sameNameMig163", "1"); } } catch { /* egal */ }

  /* ---------- Server abfragen ---------- */
  async function fetchFav(store, hash) {
    try {
      const r = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: { "x-store-hash": hash || "" } });
      if (r.status === 401) return { state: "locked" };
      if (r.status === 404) return { state: "none" };
      if (!r.ok) return { state: "error" };
      const raw = await r.json();
      return { state: "ok", data: normalizeSync(raw), saved: raw && raw.saved ? raw.saved : "" };
    } catch { return { state: "error" }; }
  }
  const favNow = () => ({ code: lget("sync-code", ""), pf: lget("sync-pass-for", ""), ph: lget("sync-pass-hash", "") });
  const favStamps = () => ({ code: lget("sync-code", ""), hash: lget("sync-pass-for", "") === lget("sync-code", "") ? lget("sync-pass-hash", "") : "" });
  const stamp = (k) => lset(k, String(Date.now()));

  /* ---------- Favoriten-Benutzer anmelden / anlegen ---------- */
  async function favConnect(rawName, pass, mode) {
    const store = cleanStore(rawName);
    if (store.length < 3) return { ok: false, msg: "Der Name für die Favoriten braucht mindestens 3 Zeichen (a–z, 0–9, Bindestrich)." };
    const prev = favNow();
    const restore = () => { lset("sync-code", prev.code); lset("sync-pass-for", prev.pf); lset("sync-pass-hash", prev.ph); };
    let hash = "", needLock = false, r = await fetchFav(store, "");
    if (r.state === "error") return { ok: false, msg: "Server nicht erreichbar." };
    if (r.state === "locked") {
      if (!pass) {
        pass = await uiPrompt({ eyebrow: "Favoriten", title: `Passwort für „${store}“`, type: "password", ok: "Anmelden" });
        if (!pass) return { ok: false, cancelled: true, msg: "Abgebrochen." };
      }
      hash = await storeHashOf(store, pass);
      r = await fetchFav(store, hash);
      if (r.state === "locked") return { ok: false, wrong: true, msg: `Das Passwort für „${store}“ ist falsch.` };
      if (r.state === "error") return { ok: false, msg: "Server nicht erreichbar." };
    } else if (pass) { hash = await storeHashOf(store, pass); needLock = true; }
    if (r.state === "ok" && mode === "new") return { ok: false, exists: true, msg: `„${store}“ gibt es schon. Bitte mit „Anmelden“ verwenden (oder einen anderen Namen wählen).` };
    const local = syncSnapshot();
    if (r.state === "none") {
      const hasAny = local.favorites.length > 0 || local.playlists.length > 0;
      const buttons = hasAny
        ? [{ value: "keep", kind: "primary", label: "Mit diesen Favoriten anlegen" }, { value: "empty", kind: "danger", label: "Leer anlegen (hier alles löschen)" }, { value: null, kind: "cancel", label: "Abbrechen" }]
        : [{ value: "keep", kind: "primary", label: "Neu anlegen" }, { value: null, kind: "cancel", label: "Abbrechen" }];
      const lines = [{ text: `„${store}“ gibt es noch nicht und wird neu angelegt.`, cls: "dlg-store" },
        hasAny ? { text: `In der App sind schon ${totalsText(local)} gespeichert.` } : { text: "In der App sind noch keine Favoriten oder Listen gespeichert." }];
      if (hasAny) lines.push({ text: "„Mit diesen Favoriten anlegen“ lädt sie unter diesem Namen hoch. „Leer anlegen“ löscht alle Favoriten und Listen auf diesem Gerät, der neue Benutzer startet ohne etwas.", cls: "dlg-hint" });
      const pick = await uiDialog({ eyebrow: "Favoriten-Benutzer", title: "Neuen Favoriten-Benutzer anlegen?", lines, buttons, cancelValue: null });
      if (!pick) return { ok: false, cancelled: true, msg: "Nicht angelegt." };
      let data = local;
      if (pick === "empty") {
        const sure = await uiConfirm({ eyebrow: "Achtung", title: "Alle Favoriten hier löschen?", lines: [`Auf diesem Gerät werden ${totalsText(local)} gelöscht. Das lässt sich nicht rückgängig machen.`], ok: "Löschen und leer anlegen", cancel: "Zurück", danger: true });
        if (!sure) return { ok: false, cancelled: true, msg: "Nicht angelegt." };
        data = normalizeSync({ favorites: [], playlists: [] });
        applySyncData(data);
      }
      try {
        storeRemember(store, hash); lset("sync-code", store);
        await putSync(store, data);
        if (needLock) await setStoreLock(store, hash);
        writeSyncBase(store, data);
      } catch { restore(); return { ok: false, msg: "Anlegen fehlgeschlagen (Server nicht erreichbar)." }; }
      stamp("lastSyncFav"); stamp("lastSyncFavOk");
      return { ok: true, created: true, msg: `Favoriten-Benutzer „${store}“ angelegt (${totalsText(data)}).` };
    }
    /* Es gibt ihn: erst zeigen, was abgeglichen würde, dann erst abgleichen */
    storeRemember(store, hash); lset("sync-code", store);
    state.syncSwitch = "";
    const msg = await runSync(store, true, !!pass, true);
    if (/^Abgebrochen/.test(msg || "")) { restore(); const sw = state.syncSwitch; state.syncSwitch = ""; return { ok: false, cancelled: true, switchTo: sw, msg: "Abgebrochen. Der Favoriten-Benutzer bleibt unverändert." }; }
    if (/^(Server nicht|Passwort)/.test(msg || "")) { restore(); return { ok: false, wrong: /^Passwort/.test(msg), msg }; }
    if (needLock) await setStoreLock(store, hash);
    try { refreshSyncInfo(); } catch { /* egal */ }
    return { ok: true, msg: `Favoriten-Benutzer „${store}“ angemeldet. ${msg || ""}`.trim() };
  }

  /* ---------- Benutzer (Einstellungen) ---------- */
  async function userConnect(rawName, pass, mode) {
    const name = userCleanName(rawName);
    if (name.length >= 2 && !name.startsWith("_") && mode === "new") {
      const probe = await fetchUser(name, "");
      if (probe.state === "ok" || probe.state === "locked") return { ok: false, exists: true, msg: `„${name}“ gibt es schon. Bitte mit „Anmelden“ verwenden (oder einen anderen Namen wählen).` };
    }
    const r = await userLogin(name, pass, false);
    if (r.ok) return { ok: true, msg: r.msg };
    return { ok: false, sys: r.sys, wrong: !!r.locked, msg: r.msg || "Nicht angemeldet." };
  }

  /* ---------- Voreinstellung direkt anwenden ---------- */
  async function applyPreset(name) {
    const ok = name === "tesla" ? await applyTeslaPreset() : await applyProfilePreset(name);
    if (ok) showToast(`${SYSN[name]}-Voreinstellung angewendet`);
    try { paintPresets(); } catch { /* egal */ }
    return ok;
  }
  async function sysNameDialog(name) {
    const v = await uiDialog({ eyebrow: "Voreinstellung", title: `„${name}“ ist eine Voreinstellung`, cancelValue: null,
      lines: ["Das ist kein Benutzer. Du kannst die Voreinstellung auf dieses Gerät anwenden oder (mit dem Schreib-Passwort) ändern."],
      buttons: [{ value: "apply", kind: "primary", label: `${SYSN[name]}-Voreinstellung anwenden` }, { value: "edit", kind: "", label: "Voreinstellung bearbeiten …" }, { value: null, kind: "cancel", label: "Abbrechen" }] });
    if (v === "apply") await applyPreset(name);
    else if (v === "edit") { try { await syncFavorites("allgemein"); state.sub = "vor"; showSetTab("allgemein"); await openSysEditor(name); } catch { /* egal */ } }
  }

  /* ---------- Anmelden-Fenster (getrennt oder zusammen) ---------- */
  async function accountDialog(which, opt) {
    opt = opt || {};
    let err = opt.err || "", name = opt.name || "", pass = "", mode = opt.mode || "login";
    for (let round = 0; round < 6; round++) {
      let scope = which;
      const box = h("div", "rt-box v163-box");
      if (err) box.append(h("p", "v163-err", err));
      const segRow = h("div", "v163-seg"); const segBtns = {};
      [["user", "Nur Einstellungen"], ["fav", "Nur Favoriten"], ["both", "Beides"]].forEach(([k, t]) => {
        const b = h("button", "chip", t); b.type = "button"; b.setAttribute("aria-pressed", String(k === scope)); segBtns[k] = b;
        b.onclick = () => { scope = k; Object.entries(segBtns).forEach(([kk, bb]) => bb.setAttribute("aria-pressed", String(kk === scope))); expl.textContent = EXPL[scope]; };
        segRow.append(b);
      });
      const EXPL = { user: "Der Benutzer speichert deine Einstellungen (Design, Schriftgröße, Schalter …) auf dem Server.", fav: "Der Favoriten-Benutzer gleicht deine Favoriten und Wiedergabelisten zwischen deinen Geräten ab.", both: "Beides mit demselben Namen und Passwort anmelden." };
      const expl = h("small", "set-hint", EXPL[scope]);
      const n = h("input", "rt-in"); n.type = "text"; n.placeholder = "Name"; n.autocomplete = "off"; n.autocapitalize = "off"; n.value = name; n.setAttribute("list", "v163Known");
      const dl = h("datalist"); dl.id = "v163Known"; try { userKnown().forEach((u) => { const o = h("option"); o.value = u; dl.append(o); }); } catch { /* egal */ }
      const p = h("input", "rt-in"); p.type = "password"; p.placeholder = "Passwort (nur falls vorhanden)"; p.autocomplete = "new-password"; p.value = pass;
      const modeRow = h("div", "v163-seg"); const mBtn = {};
      [["login", "Anmelden"], ["new", "Neu anlegen"]].forEach(([k, t]) => { const b = h("button", "chip", t); b.type = "button"; b.setAttribute("aria-pressed", String(k === mode)); mBtn[k] = b; b.onclick = () => { mode = k; Object.entries(mBtn).forEach(([kk, bb]) => bb.setAttribute("aria-pressed", String(kk === mode))); hint.textContent = HINT[mode]; }; modeRow.append(b); });
      const HINT = { login: "Gibt es den Namen noch nicht, wirst du gefragt, ob er neu angelegt werden soll.", new: "Der Name muss noch frei sein. Ein Passwort ist freiwillig." };
      const hint = h("small", "set-hint", HINT[mode]);
      const pre = h("div", "v163-pre"); pre.append(h("small", "set-hint", "Oder direkt eine Voreinstellung anwenden:"));
      const preRow = h("div", "v163-seg"); [["tesla", "🚗 Tesla"], ["handy", "📱 Handy"], ["standard", "🖥 Standard"]].forEach(([k, t]) => { const b = h("button", "chip", t); b.type = "button"; b.onclick = () => { box._preset = k; const go = document.querySelector("#dialogButtons .dlg-btn.primary"); if (go) go.click(); }; preRow.append(b); }); pre.append(preRow);
      box.append(segRow, expl, n, p, modeRow, hint, dl, pre);
      const go = await uiDialog({ eyebrow: "Anmelden", title: "Benutzer anmelden oder anlegen", cancelValue: false, lines: [{ node: box }],
        buttons: [{ value: true, kind: "primary", label: mode === "new" ? "Anlegen" : "Anmelden" }, { value: false, kind: "cancel", label: "Abbrechen" }] });
      if (box._preset) { await applyPreset(box._preset); return { done: true }; }
      if (go !== true) return { done: false };
      name = n.value.trim(); pass = p.value; which = scope;
      if (!name) { err = "Bitte einen Namen eingeben."; continue; }
      const sysKey2 = userCleanName(name);
      if (SYSN[sysKey2]) { await sysNameDialog(sysKey2); return { done: true }; }
      const out = [];
      let retry = "", sw = "";
      if (scope === "user" || scope === "both") {
        const r = await userConnect(name, pass, mode);
        out.push((r.ok ? "✔ Einstellungen: " : "✖ Einstellungen: ") + r.msg);
        if (r.wrong) retry = "Das Passwort ist falsch. Bitte noch einmal eingeben.";
        if (r.exists) retry = r.msg;
      }
      if (scope === "fav" || scope === "both") {
        const r = await favConnect(name, pass, mode);
        out.push((r.ok ? "✔ Favoriten: " : "✖ Favoriten: ") + r.msg);
        if (r.wrong) retry = "Das Passwort ist falsch. Bitte noch einmal eingeben.";
        if (r.exists) retry = r.msg;
        if (r.switchTo) sw = r.switchTo;
      }
      try { renderPresetBox(); } catch { /* egal */ }
      try { cache.t = 0; if ($("authBanner")) $("authBanner").dataset.k = ""; updateWhoNow(); } catch { /* egal */ }
      if (sw) { which = "fav"; mode = sw === "new" ? "new" : "login"; name = ""; pass = ""; err = ""; continue; }
      if (retry) { err = retry; pass = ""; continue; }
      await uiAlert("Ergebnis", out.join("\n"));
      return { done: true };
    }
    return { done: false };
  }
  const updateWhoNow = () => { const b = $("whoBadge"); if (b) b.dataset.k = ""; };

  /* ---------- Klick auf die kleine Sync-Anzeige ---------- */
  async function srvInfo(kind) {
    if (kind === "fav") {
      const { code, hash } = favStamps(); if (!code) return null;
      const r = await fetchFav(code, hash);
      return r.state === "ok" ? { text: totalsText(r.data), data: r.data, saved: r.saved } : { text: r.state === "locked" ? "Passwort wird verlangt" : r.state === "none" ? "Den Speicher gibt es auf dem Server nicht (mehr)" : "Server nicht erreichbar" };
    }
    const u = lget("userName", ""); if (!u) return null;
    if (SYS[u]) return { text: "Voreinstellung (für alle)" };
    const r = await fetchUser(u, lget("userHash", ""));
    if (r.state !== "ok") return { text: r.state === "locked" ? "Passwort stimmt nicht mehr" : r.state === "none" ? "Benutzer gibt es auf dem Server nicht (mehr)" : "Server nicht erreichbar" };
    const d = normPresets(r.presets), n = Object.keys(d.vals || {}).length;
    return { text: `${n} gespeicherte Einstellung${n === 1 ? "" : "en"}`, updated: r.updated };
  }
  async function who(kind) {
    const logged = kind === "fav" ? lget("sync-code", "") : lget("userName", "");
    if (!logged) { await accountDialog(kind); return; }
    const info = await srvInfo(kind);
    const lines = [];
    if (kind === "fav") {
      lines.push({ text: `Favoriten-Benutzer: „${logged}“`, cls: "dlg-store" });
      lines.push(`Zuletzt abgeglichen: ${when(lget("lastSyncFavOk", ""))}`);
      lines.push(`Auf diesem Gerät: ${totalsText(syncSnapshot())}`);
      lines.push(`Auf dem Server: ${info ? info.text : "–"}`);
      if (info && info.data) lines.push({ text: sameSync(info.data, syncSnapshot()) ? "Gerät und Server sind gleich." : "Gerät und Server sind unterschiedlich – „Jetzt abgleichen“ zeigt, was sich ändert.", cls: sameSync(info.data, syncSnapshot()) ? "dlg-add" : "dlg-hint" });
    } else {
      lines.push({ text: `Benutzer: „${logged}“`, cls: "dlg-store" });
      lines.push(`Zuletzt mit dem Server abgeglichen: ${when(lget("lastSyncUser", ""))}`);
      lines.push(`Auf dem Server: ${info ? info.text : "–"}`);
      if (info && info.updated) lines.push(`Auf dem Server zuletzt geändert: ${when(Date.parse(info.updated))}`);
    }
    const buttons = [];
    if (kind === "fav") buttons.push({ value: "sync", kind: "primary", label: "Jetzt abgleichen" });
    buttons.push({ value: "other", kind: kind === "fav" ? "" : "primary", label: kind === "fav" ? "Anderen Favoriten-Benutzer anmelden" : "Anderen Benutzer anmelden" }, { value: "new", kind: "", label: "Neuen anlegen" }, { value: "out", kind: "", label: "Abmelden" }, { value: null, kind: "cancel", label: "Schließen" });
    const v = await uiDialog({ eyebrow: "Sync", title: kind === "fav" ? "Favoriten-Benutzer" : "Benutzer (Einstellungen)", lines, buttons, cancelValue: null });
    if (v === "other") await accountDialog(kind, { mode: "login" });
    else if (v === "new") await accountDialog(kind, { mode: "new" });
    else if (v === "out") await signOut(kind);
    else if (v === "sync") {
      const code = lget("sync-code", "");
      const msg = await runSync(code, true, false, true);
      if (/^Abgebrochen/.test(msg || "") && state.syncSwitch) { const s = state.syncSwitch; state.syncSwitch = ""; await accountDialog("fav", { mode: s === "new" ? "new" : "login" }); }
      else showToast(msg || "Abgeglichen");
    }
    updateWhoNow();
  }
  async function signOut(kind) {
    if (kind === "fav") {
      if (!(await uiConfirm({ eyebrow: "Abmelden", title: "Vom Favoriten-Benutzer abmelden?", lines: ["Die Favoriten auf diesem Gerät bleiben bestehen, werden aber nicht mehr abgeglichen."], ok: "Abmelden", cancel: "Zurück" }))) return;
      ["sync-code", "sync-pass-for", "sync-pass-hash"].forEach((k) => { try { localStorage.removeItem(k); } catch { /* egal */ } });
      try { refreshSyncInfo(); } catch { /* egal */ }
    } else {
      if (!(await uiConfirm({ eyebrow: "Abmelden", title: "Vom Benutzer abmelden?", lines: ["Die Einstellungen auf diesem Gerät bleiben bestehen."], ok: "Abmelden", cancel: "Zurück" }))) return;
      try { userLogout(); renderPresetBox(); } catch { /* egal */ }
    }
    updateWhoNow(); const b = $("authBanner"); if (b) b.dataset.k = "";
  }

  /* ---------- Banner oben in „Sichern“ ---------- */
  const cache = { t: 0, busy: false, fav: "", user: "" };
  async function refreshCache() {
    if (cache.busy) return; cache.busy = true;
    try {
      const f = await srvInfo("fav"), u = await srvInfo("user");
      cache.fav = f ? f.text : ""; cache.user = u ? u.text : ""; cache.t = Date.now();
    } catch { /* egal */ } finally { cache.busy = false; const b = $("authBanner"); if (b) b.dataset.k = ""; }
  }
  function paintBanner(b) {
    const u = lget("userName", ""), c = lget("sync-code", "");
    const key = [u, c, lget("lastSyncUser", ""), lget("lastSyncFavOk", ""), cache.fav, cache.user].join("|");
    if (Date.now() - cache.t > 30000) refreshCache();
    if (b.dataset.k === key) return; b.dataset.k = key;
    b.replaceChildren();
    b.classList.add("v163-banner");
    const card = (kind, title, who_, detail, last) => {
      const ok = !!who_;
      const r = h("div", "auth-row v163-row"); r.dataset.ok = ok ? "1" : "0";
      const tx = h("div", "auth-tx");
      tx.append(h("b", "", `${ok ? "✔" : "✖"} ${title}`));
      tx.append(h("span", "v163-l", ok ? `Angemeldet als „${who_}“` : "Nicht angemeldet"));
      if (ok && detail) tx.append(h("span", "v163-l", `Auf dem Server: ${detail}`));
      if (ok) tx.append(h("span", "v163-l", `Zuletzt abgeglichen: ${when(last)}`));
      const bt = h("div", "v163-btns");
      const mk = (t, fn, cls) => { const x = h("button", "chip" + (cls ? " " + cls : ""), t); x.type = "button"; x.onclick = fn; bt.append(x); };
      if (ok) { mk("Details", () => who(kind)); mk("Wechseln", () => accountDialog(kind)); }
      else mk("Anmelden / anlegen", () => accountDialog(kind), "primary-chip");
      r.append(tx, bt); b.append(r);
    };
    card("user", "Benutzer (Einstellungen)", u, cache.user, lget("lastSyncUser", ""));
    card("fav", "Favoriten-Benutzer", c, cache.fav, lget("lastSyncFavOk", ""));
    const ov = h("button", "chip v163-ov", "📋 Favoriten und Listen anzeigen (Tabelle, CSV)"); ov.type = "button"; ov.onclick = favOverview; b.append(ov);
  }


  /* ---------- Vorschau: alle Werte einer Voreinstellung, dann erst anwenden ---------- */
  async function previewPreset(pn) {
    let target, title;
    try {
      if (pn === "tesla") { target = presetTarget(await teslaData(), "tesla"); title = "Tesla"; }
      else if (pn === "mine") { target = presetTarget(userData(), "user"); title = "Meine gespeicherten Werte"; }
      else { target = presetTarget(await sysData(pn), "user"); title = SYSN[pn]; }
    } catch { await uiAlert("Vorschau", "Die Werte konnten nicht geladen werden."); return; }
    if (!target.length) { await uiAlert(title, "In dieser Voreinstellung sind keine Werte gespeichert."); return; }
    const diff = target.filter((x) => lget(x.key, null) !== x.val).length;
    const rows = [["Bereich", "Einstellung", "Wert", "Jetzt"], ...target.map((x) => { const cur = lget(x.key, null); return [x.label, x.key, niceVal(x.val), cur === x.val ? "gleich" : niceVal(cur)]; })];
    const go = await uiDialog({ eyebrow: "Voreinstellung", title: `${title}: Vorschau`, cancelValue: false,
      lines: [`${target.length} Werte sind hinterlegt, davon würden ${diff} etwas ändern.`, { table: rows }],
      buttons: [{ value: true, kind: "primary", label: "Anwenden" }, { value: false, kind: "cancel", label: "Schließen" }] });
    if (!go) return;
    let ok;
    if (pn === "tesla") ok = await applyTeslaPreset(true);
    else if (pn === "mine") ok = await applyWithPreview(target, "", true);
    else ok = await applyProfilePreset(pn, true);
    if (ok) showToast(`${title} angewendet`);
    try { paintPresets(); } catch { /* egal */ }
  }

  /* ---------- Favoriten & Listen als Tabelle + CSV ---------- */
  const song = (id) => { const s = (state.songs || []).find((x) => x.id === id); return s ? { n: s.number, t: s.title } : { n: "", t: String(id) }; };
  const byNum = (a, b) => (Number(a.n) || 99999) - (Number(b.n) || 99999);
  function favRows(d) {
    const fav = d.favorites.map(song).sort(byNum).map((s) => ["Favorit", "", s.n, s.t]);
    const lists = [];
    d.playlists.forEach((l) => { if (!l.songs.length) lists.push(["Liste", l.name || "Liste", "", "(leer)"]); l.songs.forEach((id) => { const s = song(id); lists.push(["Liste", l.name || "Liste", s.n, s.t]); }); });
    return { fav, lists };
  }
  const csvEsc = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  function downloadCsv(blocks) {
    const out = [["Quelle", "Art", "Liste", "Nummer", "Titel"]];
    blocks.forEach(({ src, d }) => { const r = favRows(d); [...r.fav, ...r.lists].forEach((x) => out.push([src, ...x])); });
    const blob = new Blob(["\ufeff" + out.map((r) => r.map(csvEsc).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `favoriten-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  async function favOverview() {
    const code = lget("sync-code", ""), local = syncSnapshot();
    let srv = null, srvMsg = "";
    if (code) { const { hash } = favStamps(); const r = await fetchFav(code, hash); if (r.state === "ok") srv = r.data; else srvMsg = r.state === "locked" ? "Passwort wird verlangt." : r.state === "none" ? "Der Speicher ist auf dem Server nicht vorhanden." : "Server nicht erreichbar."; }
    for (;;) {
      const lines = [];
      const block = (title, d) => {
        const r = favRows(d);
        lines.push({ text: `${title}: ${totalsText(d)}`, cls: "dlg-store" });
        lines.push({ table: [["Nr.", "Favorit (Lied)"], ...(r.fav.length ? r.fav.map((x) => [x[2], x[3]]) : [["", "keine Favoriten"]])] });
        lines.push({ table: [["Liste", "Nr.", "Lied"], ...(r.lists.length ? r.lists.map((x) => [x[1], x[2], x[3]]) : [["", "", "keine Listen"]])] });
      };
      if (code) { if (srv) block(`Auf dem Server (Benutzer „${code}“)`, srv); else lines.push({ text: `Auf dem Server (Benutzer „${code}“): ${srvMsg}`, cls: "dlg-hint" }); }
      else lines.push({ text: "Kein Favoriten-Benutzer angemeldet – nur dieses Gerät wird angezeigt.", cls: "dlg-hint" });
      block("Auf diesem Gerät (Browser)", local);
      const v = await uiDialog({ eyebrow: "Favoriten-Abgleich", title: "Favoriten und Listen", lines, cancelValue: null,
        buttons: [{ value: "csv", kind: "primary", label: "Als CSV herunterladen" }, { value: null, kind: "cancel", label: "Schließen" }] });
      if (v !== "csv") return;
      downloadCsv([...(srv ? [{ src: `Server (${code})`, d: srv }] : []), { src: "Dieses Gerät", d: local }]);
      showToast("CSV-Datei heruntergeladen");
    }
  }

  /* ---------- Reiter „Voreinstellungen“ unter „Sichern“ ---------- */
  function paintPresets() {
    const box = $("presetTabBox"); if (!box) return;
    const act = lget("presetActive", ""), kind = typeof deviceKind === "function" ? deviceKind() : "standard";
    box.querySelectorAll("[data-pn]").forEach((b) => { b.classList.toggle("is-active", b.dataset.pn === act); const s = b.querySelector(".pt-st"); if (s) s.textContent = b.dataset.pn === act ? "zuletzt angewendet" : (b.dataset.pn === kind ? "passt zu diesem Gerät" : ""); });
    const mine = $("presetTabMine"); if (mine) mine.disabled = !lget("userName", "") || !!SYS[lget("userName", "")];
  }
  function buildPresetTab() {
    const form = $("codeForm"); if (!form || $("presetTabBox")) return;
    const anchor = $("syncDelete") || form.lastElementChild; if (!anchor) return;
    const wrap = h("div", "pt-wrap tab-off"); wrap.id = "presetTabBox"; wrap.dataset.tab = "voreinst";
    wrap.append(h("b", "", "Voreinstellungen"), h("p", "", "Setzt die Einstellungen dieses Geräts auf passende Startwerte. Vorher siehst du, was sich ändert, und kannst es ablehnen."));
    const mk = (pn, ico, t, d) => { const b = h("button", "pt-btn", ""); b.type = "button"; b.dataset.pn = pn; b.append(h("span", "pt-ic", ico), (() => { const s = h("span", "pt-tx"); s.append(h("b", "", t), h("small", "", d), h("small", "pt-st", "")); return s; })()); b.onclick = () => previewPreset(pn); wrap.append(b); };
    mk("handy", "📱", "Handy", "Design „Handy AMOLED“, größere Schrift im Auswahlfenster");
    mk("standard", "🖥", "Standard", "Grundwerte für Computer und Tablet");
    mk("tesla", "🚗", "Tesla", "Autoplay, große Bedienelemente, Tesla-Tasten");
    const mine = h("button", "pt-btn", ""); mine.type = "button"; mine.id = "presetTabMine";
    mine.append(h("span", "pt-ic", "👤"), (() => { const s = h("span", "pt-tx"); s.append(h("b", "", "Meine gespeicherten Werte"), h("small", "", "Die Einstellungen deines angemeldeten Benutzers vom Server")); return s; })());
    mine.onclick = () => previewPreset("mine");
    wrap.append(mine);
    wrap.append(h("small", "set-hint", "Voreinstellungen ändern (nur für den Verwalter): Allgemein → Voreinstellungen, Benutzername „tesla“, „handy“ oder „standard“."));
    anchor.after(wrap);
    paintPresets();
    setInterval(paintPresets, 1500);
  }

  /* ---------- Einbau ---------- */
  function boot() {
    buildPresetTab();
    try { if (window.paintGrpTabs) window.paintGrpTabs(); } catch { /* egal */ }
  }
  new MutationObserver(buildPresetTab).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  window.V163 = { previewPreset, favOverview, who, accountDialog, paintBanner, favConnect, userConnect, applyPreset, fetchFav };
})();
