/* Reiter „Fehlende Lieder“: was fehlt in R2, ist es auf jw.org schon veröffentlicht, Herunterladen nach R2, LRC-Status */
(function () {
  "use strict";
  /* lrc: welche Text-Datei gehört dazu (Karaoke hat eigene, die anderen teilen sich meeting/lrc) */
  const TYPES = [
    { id: "karaoke", name: "Karaoke", pub: "sjjc", lrc: "karaoke" },
    { id: "instrumental", name: "Instrumental", pub: "sjji", lrc: "meeting" },
    { id: "sung", name: "Zusammenkünfte", short: "Zusammenk.", pub: "sjjm", lrc: "sung" },
    { id: "video", name: "Video", pub: "sjjm", lrc: "meeting" }
  ];
  const LIMIT = 10 * 1024 ** 3;   // kostenloser R2-Speicher
  const fmtSize = (b) => b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : b >= 1024 ** 2 ? `${Math.round(b / 1024 ** 2)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
  const sizeOf = (n, t) => (data.lieder[n] && data.lieder[n][t] && data.lieder[n][t].groesse) || 0;
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const opt = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === "1"; } catch { return d; } };
  const setOpt = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* egal */ } };
  const optS = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
  const setOptS = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const openCats = new Map();   // Kategorie -> offen? (bleibt beim Umschalten erhalten)
  const pad = (n) => String(n).padStart(3, "0");

  /* wöchentliche Prüfung: montags 05:40 UTC (siehe .github/workflows/verfuegbar.yml) */
  function nextCheck() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 40));
    d.setUTCDate(d.getUTCDate() + ((1 - d.getUTCDay() + 7) % 7));
    if (d <= now) d.setUTCDate(d.getUTCDate() + 7);
    return new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d) + " Uhr";
  }

  let data = null;
  async function loadData() {
    try {
      const res = await fetch(`verfuegbar.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch { /* unten */ }
    if (!data) data = { stand: null, lieder: {}, gesamt: 164 };
  }

  function model() {
    const media = state.media || { karaoke: { audio: {}, lrc: {} }, meeting: { audio: {}, video: {}, lrc: {}, sung: {} } };
    const base = new Map(state.songs.filter((s) => !s.extra).map((s) => [s.number, s]));
    const buch = Array.isArray(data.buch) && data.buch.length ? new Set(data.buch) : null;   // nur das aktuelle Liederbuch
    const total = buch ? Math.max(...buch) : Math.max(data.gesamt || 0, ...base.keys(), ...Object.keys(data.lieder).map(Number));
    const has = {
      karaoke: (n) => base.has(n) || Boolean(media.karaoke.audio[n]),
      instrumental: (n) => Boolean(media.meeting.audio[n]),
      sung: (n) => Boolean(media.meeting.sung && media.meeting.sung[n]),
      video: (n) => Boolean(media.meeting.video[n])
    };
    const published = (n, t) => Boolean(data.lieder[n] && data.lieder[n][t] && data.lieder[n][t].url);
    const lrc = {
      karaoke: (n) => Boolean(media.karaoke.lrc[n] || (base.get(n) && base.get(n).lyrics)),
      meeting: (n) => Boolean(media.meeting.lrc[n]),
      sung: (n) => Boolean(media.meeting.sungLrc && media.meeting.sungLrc[n])
    };
    const rows = [];
    for (let n = 1; n <= total; n++) {
      if (buch && !buch.has(n)) continue;
      const s = base.get(n);
      rows.push({
        n, title: (s && s.title) || (data.lieder[n] && data.lieder[n].titel) || `Lied ${n}`,
        category: (s && s.category) || "Weitere Lieder (nicht in der Liste)"
      });
    }
    return { rows, has, published, lrc, total: rows.length, media };
  }

  async function ensureKey() {
    if (state.writeKey) return state.writeKey;
    const pass = await uiPrompt({ eyebrow: "R2", title: "Schreib-Passwort", type: "password", placeholder: "Passwort (WRITE_KEY)", ok: "Weiter" });
    if (!pass) return null;
    state.writeKey = pass;
    return pass;
  }

  async function download(n, typ) {
    const key = await ensureKey();
    if (!key) return { ok: false, abbruch: true };
    try {
      const res = await fetch(`${SYNC_BASE}/api/r2-fetch`, { method: "POST", headers: { "content-type": "application/json", "x-write-key": key }, body: JSON.stringify({ typ, nummer: n }) });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) state.writeKey = "";
      return { ok: res.ok && body.ok, fehler: body.fehler || `Fehler ${res.status}`, schon: body.schon };
    } catch (e) {
      return { ok: false, fehler: "Server nicht erreichbar." };
    }
  }

  /* cls: busy (orange, läuft), ok (grün, fertig/aktuell), bad (rot, Fehler) – Punkt und Text */
  const say = (root, text, cls) => {
    const m = root.querySelector(".fl-msg");
    if (m) { m.textContent = text; m.className = `fl-msg set-hint ls-msg${cls ? " " + cls : ""}`; }
    const dot = root.querySelector(".fl-status .ls-dot");
    if (dot && (cls === "busy" || cls === "ok" || cls === "bad")) dot.className = `ls-dot ${cls}`;
  };
  let poll = null;

  async function startCheck(pin) {
    const res = await fetch(`${SYNC_BASE}/api/refresh`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ workflow: "verfuegbar", pin: pin || "" }) });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && body.pin_erforderlich) {
      const p = await uiPrompt({ eyebrow: "Fehlende Lieder", title: "PIN erforderlich", type: "password", placeholder: "PIN", ok: "Prüfen" });
      if (!p) return { abgebrochen: true };
      try { sessionStorage.setItem("ludwtPin", p); } catch { /* egal */ }
      return startCheck(p);
    }
    if (res.status === 404 || res.status === 405) throw new Error("Die Server-Funktion /api/refresh wurde nicht gefunden (Seite über workers.dev öffnen, src/index.js aktualisieren).");
    if (!res.ok || !body.ok) throw new Error(body.fehler || `Fehler ${res.status}`);
    return body;
  }

  async function manual(root) {
    const sp = state.media && state.media.speicher;
    const info = [];
    if (sp) {
      const rows = [["Ordner", "Dateien", "Größe"]];
      Object.entries(sp.ordner).sort((x, y) => y[1].bytes - x[1].bytes).forEach(([name, v]) => rows.push([name, v.dateien, fmtSize(v.bytes)]));
      rows.push(["Gesamt", Object.values(sp.ordner).reduce((t, v) => t + v.dateien, 0), fmtSize(sp.gesamt)]);
      info.push({ table: rows, right: true });
      info.push({ text: `${fmtSize(sp.gesamt)} von ${fmtSize(LIMIT)} belegt (${Math.round(sp.gesamt / LIMIT * 100)} %), frei: ${fmtSize(Math.max(0, LIMIT - sp.gesamt))}` });
    } else info.push({ text: "Speicher-Übersicht nicht verfügbar (Server nicht erreichbar).", cls: "dlg-lost" });
    const go = await uiDialog({
      eyebrow: "Fehlende Lieder", title: "Speicher und Prüfung",
      lines: [
        { group: info, title: "Information: Speicher in R2" },
        { group: [
          "Fragt jetzt bei jw.org nach, welche Lieder (Karaoke, Instrumental, Zusammenkünfte, Video) schon veröffentlicht sind.",
          "Die Prüfung läuft sonst automatisch einmal pro Woche (montags). Das Ergebnis erscheint nach ca. 1–3 Minuten hier."
        ], title: "Aktion: Prüfung starten", cls: "dlg-action" }
      ],
      check: { label: "Hinweis zeigen, wenn die wöchentliche Prüfung etwas Neues findet", value: opt("fehlNotify", false), onChange: (v) => setOpt("fehlNotify", v) },
      buttons: [{ value: "ok", kind: "primary", label: "Jetzt prüfen" }, { value: null, kind: "cancel", label: "Abbrechen" }]
    });
    if (go !== "ok") return;
    say(root, "Starte Prüfung …", "busy");
    const before = data && data.stand;
    let pin = "";
    try { pin = sessionStorage.getItem("ludwtPin") || ""; } catch { /* egal */ }
    try {
      const r = await startCheck(pin);
      if (r.abgebrochen) { say(root, "Abgebrochen."); return; }
    } catch (err) {
      const setup = /GITHUB_TOKEN/.test(err.message) ? " Einmalige Einrichtung nötig: Secret GITHUB_TOKEN in Cloudflare (siehe Anleitung)." : "";
      say(root, `Prüfung konnte nicht gestartet werden: ${err.message}${setup}`, "bad");
      return;
    }
    say(root, "Prüfung läuft bei GitHub, danach wird die Datei veröffentlicht (meist 1–3 Minuten) …", "busy");
    const t0 = Date.now();
    clearInterval(poll);
    poll = setInterval(async () => {
      try {
        const res = await fetch(`verfuegbar.json?t=${Date.now()}`, { cache: "no-store" });
        const d = res.ok ? await res.json() : null;
        if (d && d.stand && d.stand !== before) {
          clearInterval(poll); data = d;
          const live = document.getElementById("fehlendBox");
          if (live) { render(live); say(live, "Prüfung fertig, die Liste ist aktuell.", "ok"); }
        } else if (Date.now() - t0 > 8 * 60000) {
          clearInterval(poll);
          const live = document.getElementById("fehlendBox");
          if (live) say(live, "Noch keine Rückmeldung nach 8 Minuten. Bitte später erneut öffnen oder bei GitHub unter Actions nachsehen.", "bad");
        }
      } catch { /* weiter warten */ }
    }, 15000);
  }

  async function prune(root, btn) {
    const key = await ensureKey();
    if (!key) return;
    const head = { "x-write-key": key };
    let plan;
    try {
      const res = await fetch(`${SYNC_BASE}/api/r2-prune`, { headers: head });
      plan = await res.json().catch(() => ({}));
      if (res.status === 401) state.writeKey = "";
      if (!res.ok || !plan.ok) { await uiAlert("Löschen nicht möglich", plan.fehler || `Fehler ${res.status}`); return; }
    } catch { await uiAlert("Löschen nicht möglich", "Server nicht erreichbar."); return; }
    if (!plan.anzahl) { await uiAlert("Nichts zu löschen", "Es gibt keine Dateien ab Nummer 500."); await loadMedia(true); render(root); return; }
    const ok = await uiConfirm({
      eyebrow: "R2 aufräumen", title: `${plan.anzahl} Dateien endgültig löschen?`, danger: true, ok: "Endgültig löschen",
      lines: [`Alle Dateien mit Liednummer ab 500 (${fmtSize(plan.bytes)}) werden aus R2 gelöscht. Das lässt sich nicht rückgängig machen.`, `Beispiele: ${plan.beispiele.join(", ")}`, "Favoriten und Texte im Ordner „sync“ bleiben unberührt."]
    });
    if (!ok) return;
    btn.disabled = true;
    let total = 0;
    try {
      for (let i = 0; i < 200; i++) {
        btn.textContent = `Lösche … (${total} gelöscht)`;
        const res = await fetch(`${SYNC_BASE}/api/r2-prune`, { method: "POST", headers: head });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.fehler || `Fehler ${res.status}`);
        total += out.geloescht;
        if (!out.rest) break;
      }
    } catch (err) { await uiAlert("Löschen abgebrochen", err.message); }
    await loadMedia(true);
    await uiAlert("Fertig", `${total} Dateien gelöscht.`);
    render(root);
  }

  async function mount(root) {
    root.replaceChildren(h("p", "set-hint", "Lade Übersicht …"));
    await loadData();
    if (!state.media) await loadMedia(true);
    render(root);
  }

  function scroller(root) { return root.closest("#codeForm") || root.closest(".login-card") || null; }

  function render(root) {
    const m = model();
    if (!state.media) {
      root.replaceChildren(h("p", "ap-title", "Fehlende Lieder"), h("p", "set-hint bad", "Die Dateiliste aus R2 konnte nicht geladen werden (Server nicht erreichbar). Deshalb wird nichts als „fehlend“ angezeigt. Bitte die Seite über https://musik.carag.workers.dev öffnen und erneut versuchen."));
      return;
    }
    const hoch = state.media.hoch;
    root.replaceChildren();

    const head = h("div", "ls-top");
    head.append(h("p", "ap-title", "Fehlende Lieder"));
    const info = h("button", "ghost ls-i", "i"); info.type = "button";
    info.setAttribute("aria-label", "Speicher und manuelle Prüfung"); info.title = "Speicher und manuelle Prüfung";
    info.addEventListener("click", () => manual(root));
    head.append(info);
    root.append(head);

    // Status: Punkt (grau/orange/grün/rot) + Meldung
    const st = h("div", "ls-line fl-status");
    st.append(h("span", `ls-dot ${data.stand ? "ok" : ""}`));
    st.append(h("span", "", data.stand
      ? `Zuletzt geprüft: ${new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.stand))}`
      : "Noch keine Prüfung gelaufen."));
    root.append(st);
    root.append(h("p", "fl-msg set-hint ls-msg", ""));
    root.append(h("p", "set-hint", `Nächste automatische Prüfung auf jw.org: ${nextCheck()}.${data.stand ? "" : " Du kannst sie auch über das „i“ oder auf GitHub unter Actions → „Verfügbarkeit prüfen“ starten."}`));

    // Kurze Hilfe (beim ersten Mal offen)
    const help = h("details", "fl-help");
    help.open = !opt("fehlHelpSeen", false);
    help.append(h("summary", "", "So liest du diese Seite"));
    ["Die Tabelle zeigt pro Art, wie viele Lieder als Datei auf dem Server (R2) liegen, wie viele auf jw.org schon veröffentlicht sind und wie viele Text-Dateien (LRC) es gibt.",
      "Mit „Zeigen“ schaltest du eine Art in der Liste darunter ein oder aus, mit „LRC“ blendest du dort zusätzlich den Text-Status ein (nach dem Trennstrich │ in anderer Farbe).",
      "Die Liste zeigt je Kategorie, was fehlt. ⬇ lädt die Datei direkt von jw.org auf den Server. „noch nicht veröffentlicht“ heißt: jw.org hat sie noch nicht.",
      "Karaoke, Instrumental und Zusammenkünfte haben je eine eigene Text-Datei, Video nutzt die von Instrumental."
    ].forEach((t) => help.append(h("p", "set-hint", t)));
    help.addEventListener("toggle", () => { if (!help.open) setOpt("fehlHelpSeen", true); });
    root.append(help);

    if (hoch && hoch.dateien > 0) {
      const box = h("div", "fl-high");
      box.append(h("p", "", `In R2 liegen ${hoch.dateien} Dateien mit Nummern ab 500 (${fmtSize(hoch.bytes)}) – Gebärden-/Blindenschrift-Lieder. Sie werden nicht angezeigt.`));
      const del = h("button", "chip danger", `Diese ${hoch.dateien} Dateien aus R2 löschen`); del.type = "button";
      del.addEventListener("click", () => prune(root, del));
      box.append(del);
      root.append(box);
    }

    // Übersichtstabelle mit den Schaltern (direkt über der Liste)
    const dyn = h("div", "fl-dyn");
    const grid = h("div", "fl-grid");
    ["Zeigen", "Art", "Server", "jw.org", "LRC", "Text"].forEach((t, i) => grid.append(h("span", `fl-gh${i === 1 ? " l" : ""}`, t)));
    const checkbox = (key, def, label) => {
      const lab = h("label", "fl-cb");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = opt(key, def);
      cb.setAttribute("aria-label", label);
      cb.addEventListener("change", () => { setOpt(key, cb.checked); refresh(root, m, dyn); });
      lab.append(cb);
      return lab;
    };
    TYPES.forEach((t) => {
      let have = 0, pub = 0, lrcN = 0;
      m.rows.forEach((r) => { if (m.has[t.id](r.n)) have++; if (m.published(r.n, t.id)) pub++; if (m.lrc[t.lrc](r.n)) lrcN++; });
      grid.append(checkbox(`fehlT_${t.id}`, true, `${t.name} anzeigen`), h("span", `fl-gn fl-t-${t.id}`, t.name),
        h("span", "fl-gv", `${have}/${m.total}`), h("span", "fl-gv", `${pub}`),
        checkbox(`fehlL_${t.id}`, false, `LRC bei ${t.name} anzeigen`), h("span", "fl-gv fl-gl", `${lrcN}/${m.total}`));
    });
    root.append(grid);

    // Anzeige-Modus
    const modes = h("div", "fl-modes");
    [["missing", "Fehlende"], ["have", "Vorhandene"], ["both", "Beide"], ["lrc", "LRC fehlt"]].forEach(([v, label]) => {
      const lab = h("label", "fl-mode");
      const rb = document.createElement("input"); rb.type = "radio"; rb.name = "fehlMode"; rb.value = v;
      rb.checked = optS("fehlMode", opt("fehlAll", false) ? "both" : "missing") === v;
      rb.addEventListener("change", () => { if (rb.checked) { setOptS("fehlMode", v); refresh(root, m, dyn); } });
      lab.append(rb, document.createTextNode(" " + label));
      modes.append(lab);
    });
    root.append(h("small", "set-hint", "In der Liste zeigen:"), modes);

    root.append(dyn);
    refresh(root, m, dyn);
    root.append(h("small", "set-hint", "„⬇“ holt die Datei direkt von jw.org auf den Server (R2). Dafür ist das Schreib-Passwort (WRITE_KEY) nötig. Kinderlieder sind nicht enthalten."));
  }

  /* Nur den Listenteil neu aufbauen: Kategorien bleiben offen/zu, Scrollposition bleibt */
  function refresh(root, m, dyn) {
    const sc = scroller(root);
    const top = sc ? sc.scrollTop : 0;
    const mode = optS("fehlMode", opt("fehlAll", false) ? "both" : "missing");
    const types = TYPES.filter((t) => opt(`fehlT_${t.id}`, true));
    const lrcOn = (t) => mode === "lrc" || opt(`fehlL_${t.id}`, false);
    dyn.replaceChildren();
    if (!types.length) { dyn.append(h("p", "set-hint", "Bitte oben mindestens eine Art auswählen.")); if (sc) sc.scrollTop = top; return; }

    const downloadable = [];
    const sum = h("div", "fl-sum");
    types.forEach((t) => {
      let have = 0, miss = 0, pub = 0, bytes = 0;
      m.rows.forEach((r) => { if (m.has[t.id](r.n)) have++; else { miss++; if (m.published(r.n, t.id)) { pub++; bytes += sizeOf(r.n, t.id); downloadable.push([r.n, t.id]); } } });
      const b = h("span", "fl-pill");
      b.append(h("b", "", t.name), document.createTextNode(` ${have}/${m.total}`));
      if (miss) b.append(h("em", "", ` · ${pub} ladbar${bytes ? ` (${fmtSize(bytes)})` : ""}`));
      sum.append(b);
    });
    dyn.append(sum);

    if (downloadable.length) {
      const totalBytes = downloadable.reduce((s, [n, t]) => s + sizeOf(n, t), 0);
      const all = h("button", "chip fl-all", `Alle veröffentlichten laden (${downloadable.length} Dateien${totalBytes ? `, ${fmtSize(totalBytes)}` : ""})`);
      all.type = "button";
      all.addEventListener("click", async () => {
        const used = (state.media.speicher && state.media.speicher.gesamt) || 0;
        const after = used + totalBytes;
        const okGo = await uiConfirm({
          eyebrow: "R2-Speicher", title: `${downloadable.length} Dateien laden?`,
          lines: [`Dazu kommen ca. ${fmtSize(totalBytes)}. Belegt wären danach ${fmtSize(after)} von ${fmtSize(LIMIT)}.`, after > LIMIT ? "ACHTUNG: Das überschreitet die kostenlose Grenze von 10 GB!" : "Das bleibt innerhalb der kostenlosen Grenze."],
          ok: after > LIMIT ? "Trotzdem laden" : "Laden"
        });
        if (!okGo) return;
        all.disabled = true;
        say(root, "Lade Dateien …", "busy");
        let ok = 0, fail = 0, last = "";
        for (let i = 0; i < downloadable.length; i++) {
          all.textContent = `Lade ${i + 1} von ${downloadable.length} …`;
          const r = await download(downloadable[i][0], downloadable[i][1]);
          if (r.abbruch) break;
          if (r.ok) ok++; else { fail++; last = r.fehler; if (/Schlüssel|WRITE_KEY/.test(last)) break; }
        }
        await loadMedia(true);
        render(root);
        say(root, `${ok} Dateien gespeichert${fail ? `, ${fail} fehlgeschlagen (${last})` : ""}.`, fail ? "bad" : "ok");
      });
      dyn.append(all);
    }

    // Gruppen nach Kategorie
    const cats = new Map();
    m.rows.forEach((r) => {
      const missing = types.filter((t) => !m.has[t.id](r.n));
      const present = types.filter((t) => m.has[t.id](r.n));
      const lrcMissing = types.filter((t) => !m.lrc[t.lrc](r.n));
      const show = mode === "lrc" ? lrcMissing.length > 0 : mode === "both" || (mode === "missing" && missing.length) || (mode === "have" && present.length);
      if (!cats.has(r.category)) cats.set(r.category, { all: [], rows: [] });
      const c = cats.get(r.category);
      c.all.push(r);
      if (show) c.rows.push({ ...r, missing });
    });
    const ordered = [...cats.entries()].filter(([, c]) => c.rows.length).sort((a, b) => (a[0].startsWith("Weitere") ? 1 : 0) - (b[0].startsWith("Weitere") ? 1 : 0));
    if (!ordered.length) dyn.append(h("p", "set-hint", mode === "missing" ? "Es fehlt nichts. 🎉" : "Nichts zu zeigen."));
    ordered.forEach(([cat, c]) => {
      const det = h("details", "fl-cat");
      const sm = h("summary", "");
      sm.append(h("span", "fl-cat-name", `${cat} (${c.all.length})`));
      const counts = h("span", "fl-cat-counts");
      types.forEach((t) => {
        const have = c.all.filter((r) => m.has[t.id](r.n)).length;
        const part = h("span", `fl-cc ${have === c.all.length ? "full" : have ? "part" : "none"}`, `${t.short || t.name} ${have}/${c.all.length}`);
        if (lrcOn(t)) {
          const l = c.all.filter((r) => m.lrc[t.lrc](r.n)).length;
          part.append(h("span", "fl-sep", " │ "), h("span", `fl-lrc ${l === c.all.length ? "ok" : "no"}`, `LRC ${l}`));
        }
        counts.append(part);
      });
      sm.append(counts);
      det.append(sm);
      const dflt = c.rows.filter((x) => x.missing.length).length > 0 && c.rows.length <= 12;
      det.open = openCats.has(cat) ? openCats.get(cat) : dflt;
      det.addEventListener("toggle", () => openCats.set(cat, det.open));
      c.rows.forEach((r) => {
        const row = h("div", "fl-row");
        row.append(h("b", "fl-n", pad(r.n)), h("span", "fl-t", r.title));
        const chips = h("span", "fl-chips");
        types.forEach((t) => {
          const pair = h("span", `fl-pair ${m.has[t.id](r.n) ? "has" : m.published(r.n, t.id) ? "dl" : "no"}`);
          if (m.has[t.id](r.n)) pair.append(h("span", "fl-ok", `✓ ${t.name}`));
          else if (m.published(r.n, t.id)) {
            const sz = sizeOf(r.n, t.id);
            const label = `⬇ ${t.name}${sz ? ` (${fmtSize(sz)})` : ""}`;
            const b = h("button", "chip fl-dl", label); b.type = "button";
            b.addEventListener("click", async () => {
              b.disabled = true; b.textContent = "lädt …";
              const res = await download(r.n, t.id);
              if (res.abbruch) { b.disabled = false; b.textContent = label; return; }
              if (!res.ok) { b.disabled = false; b.textContent = label; await uiAlert("Herunterladen fehlgeschlagen", res.fehler); return; }
              await loadMedia(true);
              const live = model();
              refresh(root, live, dyn);
            });
            pair.append(b);
          } else pair.append(h("span", "fl-no", `${t.name}: noch nicht veröffentlicht`));
          if (lrcOn(t)) {
            const has = m.lrc[t.lrc](r.n);
            pair.append(h("span", "fl-sep", "│"), h("span", `fl-lrc ${has ? "ok" : "no"}`, `LRC ${has ? "✓" : "✗"}`));
          }
          chips.append(pair);
        });
        row.append(chips);
        det.append(row);
      });
      dyn.append(det);
    });
    if (sc) sc.scrollTop = top;
  }

  /* Pop-up beim Öffnen der Seite: neue, auf jw.org veröffentlichte Dateien, die in R2 noch fehlen (nur wenn eingeschaltet) */
  async function checkNew() {
    try {
      await loadData();
      if (!data || !data.stand || !state.media) return;
      const m = model();
      const nowKeys = [];
      m.rows.forEach((r) => TYPES.forEach((t) => { if (!m.has[t.id](r.n) && m.published(r.n, t.id)) nowKeys.push(`${r.n}:${t.id}`); }));
      let seenStand = null, seen = null;
      try { seenStand = localStorage.getItem("fehlStand"); seen = JSON.parse(localStorage.getItem("fehlSeen") || "null"); } catch { /* egal */ }
      if (seenStand === data.stand) return;
      const fresh = seen ? nowKeys.filter((k) => !seen.includes(k)) : [];
      try { localStorage.setItem("fehlStand", data.stand); localStorage.setItem("fehlSeen", JSON.stringify(nowKeys)); } catch { /* egal */ }
      if (!opt("fehlNotify", false) || !fresh.length) return;
      const byType = {};
      fresh.forEach((k) => { const t = k.split(":")[1]; byType[t] = (byType[t] || 0) + 1; });
      const lines = [`Die wöchentliche Prüfung hat ${fresh.length} neue Datei${fresh.length === 1 ? "" : "en"} auf jw.org gefunden, die bei dir noch fehlen${fresh.length === 1 ? "" : "."}`];
      TYPES.forEach((t) => { if (byType[t.id]) lines.push(`${t.name}: ${byType[t.id]}`); });
      lines.push("Beispiele: " + fresh.slice(0, 5).map((k) => { const [n, t] = k.split(":"); return `${pad(+n)} ${TYPES.find((x) => x.id === t).name}`; }).join(", "));
      const go = await uiDialog({ eyebrow: "Fehlende Lieder", title: "Neues gefunden", lines, buttons: [{ value: "go", kind: "primary", label: "Zu „Fehlend“" }, { value: null, kind: "cancel", label: "Später" }] });
      if (go === "go" && window.syncFavorites) window.syncFavorites("fehlend");
    } catch { /* still */ }
  }

  window.FEHLEND = { mount, checkNew };
})();
