/* v128: Einstellungen (Allgemein) neu geordnet: Themen links, alle Einstellungen vorhanden, eigenes Thema „Tesla“ mit großen Bedienelementen.
   Die vorhandenen Eingabefelder werden nur verschoben (IDs und Ereignisse bleiben), fehlende Einstellungen kommen als zusätzliche Felder dazu. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const h = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const tesla = () => { try { return isTesla(); } catch { return /Tesla/i.test(navigator.userAgent); } };

  /* ---------- Hilfen ---------- */
  const isHint = (n) => n && ((n.tagName === "SMALL" && n.classList.contains("set-hint") && !n.id) || n.id === "advStartPick" || (n.tagName === "PRE" && n.classList.contains("set-hint")));
  function unit(id, maxHints) {
    const e = $(id); if (!e) return [];
    const row = e.closest(".set-row") || (e.tagName === "LABEL" ? e : e.closest("label")) || e;
    const out = [row];
    let n = row.nextElementSibling;
    let k = 0; while (isHint(n) && k < (maxHints == null ? 9 : maxHints)) { out.push(n); n = n.nextElementSibling; k++; }
    return out;
  }
  const findText = (sel, start) => [...document.querySelectorAll(sel)].find((x) => x.textContent.trim().startsWith(start));
  function box(title, nodes) {
    const b = h("div", "autoplay-box v128-box");
    if (title) b.append(h("p", "ap-title", title));
    nodes.flat(Infinity).filter(Boolean).forEach((n) => b.append(n));
    return b;
  }

  /* zusätzliche Felder für Einstellungen, die bisher nur in Fenstern oder anderen Reitern standen */
  function applyKey(k, v) {
    try { lss(k, v); } catch { localStorage.setItem(k, v); }
    if (/^sv_/.test(k) || k === "svHints") { applySV(); return; }
    if (k === "teslaTab") { try { window.V130 && V130.applyTeslaMode(true); } catch { /* egal */ } return; }
    if (k === "mediaKeys" || k === "mediaHold") { try { setMediaSession(state.songs[state.index]); } catch { /* egal */ } return; }
    try { applyTarget([{ key: k, val: v }], true); } catch { /* egal */ }
  }
  function mCheck(key, label, def, hint, inverse) {
    const l = h("label", "set-row check"); const c = h("input"); c.type = "checkbox";
    const get = () => { const v = lsv(key, def); return inverse ? v !== "1" : v === "1"; };
    c.checked = get();
    c.onchange = () => applyKey(key, (inverse ? !c.checked : c.checked) ? "1" : "0");
    l.append(c, document.createTextNode(" " + label));
    l._sync = () => { c.checked = get(); };
    return [l, hint ? h("small", "set-hint", hint) : null];
  }
  function mSelect(key, label, opts, def, hint, getter) {
    const l = h("label", "set-row"); l.append(document.createTextNode(label + " "));
    const s = h("select"); opts.forEach(([v, n]) => { const o = h("option", "", n); o.value = v; s.append(o); });
    const get = () => (getter ? getter() : lsv(key, def));
    s.value = get(); s.onchange = () => applyKey(key, s.value);
    l.append(s); l._sync = () => { s.value = get(); };
    return [l, hint ? h("small", "set-hint", hint) : null];
  }
  function mText(key, label, placeholder, hint) {
    const l = h("label", "set-row"); l.append(document.createTextNode(label + " "));
    const i = h("input"); i.type = "text"; i.maxLength = 40; i.placeholder = placeholder || ""; i.value = lsv(key, "");
    i.onchange = () => { try { lss(key, i.value.trim()); } catch { /* egal */ } };
    l.append(i); l._sync = () => { i.value = lsv(key, ""); };
    return [l, hint ? h("small", "set-hint", hint) : null];
  }
  const LONGP = {
    lang: "Lang drücken: Spur (Deutsch/Englisch) und Karaoke-Text wählen.",
    ki: "Lang drücken: KI-Text als Standard speichern oder anderen Karaoke-Text wählen.",
    autolong: "Das Autoplay-Symbol öffnet bei langem Drücken die Autoplay-Einstellungen.",
    pl: "Antippen: Wiedergabeliste, Bewertung und KI-Scan."
  };
  /* Tempo (Wiedergabegeschwindigkeit) direkt in den Einstellungen */
  function mTempo() {
    const a = () => $("audio");
    const wrap = h("div", "set-row v130-tempo");
    wrap.append(document.createTextNode("Tempo (1 = normal) "));
    const r = { value: "", oninput: null };   /* nur noch ein Regler: das Zahlenfeld wird von der Oberfläche als Regler dargestellt */
    const n = h("input"); n.type = "number"; n.min = "0.1"; n.max = "4"; n.step = "0.05"; n.style.width = "5em";
    const rs = h("button", "chip", "Normal (1x)"); rs.type = "button";
    const set = (v) => { v = Math.round(Number(String(v).replace(",", ".")) * 100) / 100; if (!(v >= 0.1 && v <= 4)) return; const x = a(); if (x) { x.defaultPlaybackRate = v; x.playbackRate = v; } r.value = String(v); n.value = String(v); };
    r.oninput = () => set(r.value); n.onchange = () => set(n.value); rs.onclick = () => set(1);
    const sync = () => { const v = a() ? Math.round((a().playbackRate || 1) * 100) / 100 : 1; r.value = String(v); n.value = String(v); };
    wrap._sync = sync; sync();
    if (a()) a().addEventListener("ratechange", sync);
    wrap.append(n, rs);
    return [wrap, h("small", "set-hint", "Regler oder Zahl (0,1 bis 4). Gilt für alle Lieder, bis du auf „Normal“ stellst. Ist das Tempo nicht 1x, steht es im Player in Orange. Auch: Lupe an, linken Timecode lang drücken.")];
  }
  /* Position (Versatz in Pixel) je Ansicht – Startseite oder Galerie; „Anpassen-Fenster“ wie bei langem Drücken */
  function posBox(kind) {
    const isStart = kind === "start", key = isStart ? "startAdj" : "galAdj";
    const views = isStart ? [["image", "Bild"], ["chor", "Video"], ["carousel", "Karussell"], ["fade", "Überblenden"], ["float", "Schweben"]] : [["grid", "Raster"], ["list", "Liste"], ["flow", "Karussell"]];
    const get = () => { try { return JSON.parse(lsv(key, "{}")) || {}; } catch { return {}; } };
    const out = [];
    const refresh = () => { try { if (isStart) window.V116 && V116.fit(); else window.COVERS && COVERS.galApply(); } catch { /* egal */ } };
    views.forEach(([v, name]) => {
      const row = h("div", "set-row v130-pos"); row.append(document.createTextNode(name + ": "));
      const mk = (idx, lab) => { const i = h("input"); i.type = "text"; i.inputMode = "numeric"; i.style.width = "5.5em"; i.title = lab; i.setAttribute("aria-label", name + " " + lab);
        i.value = String((get()[v] || [0, 0])[idx] || 0);
        i.onchange = () => { const o = get(), c = o[v] || [0, 0]; c[idx] = Number(i.value) || 0; o[v] = c; lss(key, JSON.stringify(o)); refresh(); }; return i; };
      const lx = h("span", "", " rechts "), ly = h("span", "", " runter ");
      const x = mk(0, "nach rechts (px)"), y = mk(1, "nach unten (px)");
      row.append(lx, x, ly, y); row._sync = () => { const c = get()[v] || [0, 0]; x.value = String(c[0] || 0); y.value = String(c[1] || 0); };
      out.push(row);
    });
    const b = bigBtn("Anpassen-Fenster öffnen (Pfeile, Größe)", () => { const c = $("codeModal"); try { if (isStart) { window.V116 && V116.toStart && V116.toStart(); V116.adjust(); } else { window.COVERS && COVERS.openGallery(); setTimeout(() => COVERS.galAdjust(), 400); } } catch { /* egal */ } if (c) c.hidden = true; }, "tz-small");
    out.push(b, h("small", "set-hint", isStart ? "Versatz in Pixel (rechts / runter, auch negativ). Auf der Startseite erreichst du dasselbe, wenn du lange auf eine Ansicht drückst." : "Versatz in Pixel je Ansicht. In der Galerie: lange auf Raster, Liste oder Karussell drücken."));
    return out;
  }
  const OFFON = [["1", "ein"], ["0", "aus"]];
  const ACCU = [["low", "schwach (schnell)"], ["normal", "normal"], ["high", "sehr genau (langsam)"]];
  const syncers = [];
  const reg = (arr) => { arr.forEach((n) => { if (n && n._sync) syncers.push(n._sync); }); return arr; };

  /* ---------- große Bedienelemente für Tesla (steuern die vorhandenen Felder, damit alles gleich wirkt) ---------- */
  const fire = (e, type) => e.dispatchEvent(new Event(type, { bubbles: true }));
  function bigRow(label, ctl, hint, sync) { const r = h("div", "tz-row"); r.append(h("span", "tz-l", label), ctl); r._sync = sync; syncers.push(sync); return [r, hint ? h("small", "tz-hint", hint) : null]; }
  function bigCheck(id, label, hint) {
    const e = $(id); if (!e) return [];
    const b = h("button", "tz-sw"); b.type = "button";
    const paint = () => { b.textContent = e.checked ? "EIN" : "AUS"; b.setAttribute("aria-pressed", String(e.checked)); };
    b.onclick = () => { e.checked = !e.checked; fire(e, "change"); paint(); };
    paint(); return bigRow(label, b, hint, paint);
  }
  function bigSel(id, label, hint) {
    const e = $(id); if (!e) return [];
    const s = h("select", "tz-sel");
    [...e.options].forEach((o) => { const x = h("option", "", o.textContent); x.value = o.value; s.append(x); });
    const paint = () => { s.value = e.value; };
    s.onchange = () => { e.value = s.value; fire(e, "change"); };
    paint(); return bigRow(label, s, hint, paint);
  }
  function bigNum(id, label, step, unitTxt, hint) {
    const e = $(id); if (!e) return [];
    const w = h("span", "tz-step"), m = h("button", "tz-b", "−"), p = h("button", "tz-b", "+"), v = h("span", "tz-v");
    m.type = p.type = "button";
    const get = () => Number(e.value) || 0;
    const paint = () => { v.textContent = e.value === "" ? "–" : e.value + (unitTxt ? " " + unitTxt : ""); };
    const set = (n) => { n = Math.max(Number(e.min || 0), Math.min(Number(e.max || 9999), n)); e.value = String(n); fire(e, "input"); fire(e, "change"); paint(); };
    m.onclick = () => set(get() - step); p.onclick = () => set(get() + step);
    paint(); w.append(m, v, p); return bigRow(label, w, hint, paint);
  }
  function bigBtn(label, fn, cls) { const b = h("button", "tz-btn " + (cls || ""), label); b.type = "button"; b.onclick = fn; return b; }

  /* ---------- Aufbau ---------- */
  let done = false;
  function restructure() {
    if (done) return; done = true;
    const first = findText("h3.set-grp", "Wiedergabe"); if (!first) return;
    const anchor = h("div"); anchor.id = "v128Anchor"; first.before(anchor);
    /* Hinweis, der zur Überblendzeit gehört, zu den Startseiten-Zeilen holen */
    const fixHint = findText("small.set-hint", "Gilt für Karussell und Überblenden");
    const fadeUnit = unit("advStartFade");
    const u = (...ids) => ids.map(unit);
    const startHead1 = findText("p.set-grp-d", "Startseite (Anzeige"), startHead2 = findText("p.set-grp-d", "Größe der Startseiten-Ansichten");
    if (startHead1) startHead1.textContent = "Was die Startseite zeigt, solange kein Lied läuft";
    if (startHead2) startHead2.textContent = "Größe der Ansichten (30–100 % des freien Platzes)";

    const tzBox = teslaBox();   /* vor dem Verschieben bauen, solange alle Felder noch im Dokument stehen */
    const SPEC = [
      { id: "wieder", name: "Wiedergabe", desc: "Wie Lieder starten, weiterlaufen und gesteuert werden.", boxes: [
        $("autoPlayBox"),
        box("Start im Browser (stumm, Tipp, nach App-Wechsel)", [
          ...reg([mSelect("resumeMode", "Nach Rückkehr in den Browser", [["pause", "Pause bleibt Pause"], ["auto", "wie bisher"], ["always", "immer weiter"]], "", "Pause bleibt Pause: ein pausiertes Lied startet nach einem App-Wechsel nicht von selbst. Tesla-Standard: wie bisher.", () => resumeMode())]),
          ...reg(mCheck("autoTap", "Ein Tipp irgendwo startet das Lied, wenn der Browser den Start blockiert", "1")),
          ...reg(mCheck("autoMute", "Blockiert der Browser den Start: stumm beginnen, erster Tipp schaltet den Ton ein", "1", "Beides auch durch langes Drücken auf die Autoplay-Taste (⏵ oben rechts) einstellbar."))
        ]),
        box("Springen", [u("advBack", "advFwd")])
      ] },
      { id: "liste", name: "Liedliste", desc: "Was in der Liedliste steht und wie sie aussieht.", boxes: [
        $("extraBox"), $("tagsBox"), $("verBarBox"), $("favBox"), $("advList")
      ] },
      { id: "text", name: "Karaoke-Text", desc: "Wie der mitlaufende Text aussieht und in welcher Sprache die Musik läuft.", boxes: [
        box("Schrift und Lage", [u("advScale", "advAlign", "advLyricPos")]),
        box("Sprache der Musik", [u("advMusikLang", "advLangWarn")]),
        box("Schriftfarben", [(() => { const b = bigBtn("Karaoke-Schriftfarben im Reiter „Design“ ändern", () => { const t = document.querySelector('#setTabs [data-settab="design"]'); if (t) t.click(); }, "tz-small"); return b; })(), h("small", "set-hint", "Aktive Zeile und übrige Zeilen: Reiter „Design“ → Karaoke-Schriftfarbe.")])
      ] },
      { id: "cover", name: "Cover", desc: "Welche Cover gezeigt werden.", boxes: [
        box("Cover", [u("advCover", "advCoverSet", "advCoverFlip")])
      ] },
      { id: "gal", name: "Galerie", desc: "Cover-Galerie: Ansichten Raster, Liste und Karussell, Größe und Position.", boxes: [
        box("Galerie", [u("advGalNoKar", "advGalNoKarAmt", "advGalMini")]),
        box("Ansichten: Größe und Position", [h("small", "set-hint", "Lange auf Raster, Liste oder Karussell drücken (in der Galerie oben): Fenster zum Verschieben (Pfeile) und für die Größe der Cover. Hier kannst du die Werte auch eintippen."), ...posBox("gal")])
      ] },
      { id: "start", name: "Startseite", desc: "Was vor dem ersten Lied zu sehen ist.", boxes: [
        box("Anzeige und Wechsel", [startHead1, u("advStartShow", "advStartFolders"), u("advStartOrder", "advStartSec"), fixHint ? [fixHint] : [], fadeUnit, u("advStartTrans", "advStartAnim", "advCar3d", "advFloatSpd", "advCarSec", "advCarMs")]),
        box("Größe der Ansichten", [startHead2, u("advSz_image", "advSz_chor", "advSz_carousel", "advSz_fade", "advSz_float", "advSzReset"), u("flugResetBtn")]),
        box("Position der Ansichten", posBox("start")),
        box("Chor-GIF", [u("startGif")])
      ] },
      { id: "player", name: "Player und Fernsteuerung", desc: "Player-Anordnung, Übertragen auf andere Geräte, Mithören.", boxes: [
        box("Player", [unit("advNpLayout"), unit("advCastMode", 1), ...reg(mTempo())]),
        box("Tasten im Tesla-Player (unter den Fahrzeug-Infos)", [
          ...reg(mSelect("mediaKeys", "Die kleinen Tasten sollen sein", [["step", "Lied vor / Lied zurück (Standard)"], ["seek", "Vor- / Zurückspulen"]], "step", "Standard: die Tasten funktionieren so, wie sie angezeigt werden – Lied vor und Lied zurück. Auch nach dem Ändern am besten ein Lied neu wählen.")),
          ...reg(mCheck("mediaHold", "Lange gedrückt halten = vor- bzw. zurückspulen", "1", "Kurz drücken wechselt das Lied (mit kurzer Verzögerung von etwa 0,4 s), gehalten spult. Aus: Taste wirkt sofort, kein Spulen."))
        ]),
        box("Fernsteuerung", [u("advRcIdle")]),
        $("listenBox")
      ] },
      { id: "ki", name: "KI und Bewertungen", desc: "KI-Abstimmung, KI-Text beim Lied, Bewertungen und Verlauf.", boxes: [
        box("KI-Text beim Lied (Scan im ＋-Fenster)", [
          ...reg(mSelect("kiScanAcc", "Genauigkeit des KI-Scans", ACCU, "high", "Standard: sehr genau.")),
          ...reg(mCheck("kiHide", "Knopf „KI“ nur zeigen, wenn ein nicht gespeicherter KI-Text vorhanden ist", "1", "Ein: nach dem Speichern als Standard verschwindet der Knopf. Aus: der Knopf bleibt, sobald es mehrere Karaoke-Texte gibt (zum Auswählen). Ist ein anderer Text gewählt, leuchtet er farbig.")),
          ...reg(mCheck("kiFirst", "KI-Text zuerst verwenden, wenn vorhanden", "1", "Dann zeigt die Titelzeile den Knopf „KI“: kurz tippen wechselt zwischen KI-Text und gespeichertem Text, lange drücken speichert den KI-Text als Standard (mit Schlüssel)."))
        ]),
        box("KI-Sync im Bearbeiten-Modus", [
          ...reg(mSelect("aiAcc", "Genauigkeit der KI-Abstimmung", ACCU, "normal", "Wird auch im Fenster „Zeiten automatisch setzen“ gewählt.", () => (["low", "high"].includes(lsv("aiAcc", "normal")) ? lsv("aiAcc", "normal") : "normal"))),
          ...reg(mCheck("selBar", "Auswahl-Knöpfe dauerhaft in der Leiste anzeigen", "0"))
        ]),
        box("Bewertungen", [
          ...reg(mCheck("rateOn", "Bewertung im ＋-Fenster zeigen", "1")),
          ...reg(mCheck("ampelOn", "Korrektur-Status (rot/orange/grün) in der Liedliste zeigen", "1")),
          ...reg(mText("rateName", "Mein Name für Bewertungen", "leer = anonym")),
          ...reg(mCheck("kvSync", "KI-Verlauf: beide Spalten gemeinsam scrollen", "0")),
          ...reg(mCheck("kvWide", "KI-Verlauf: breit anzeigen (großer Bildschirm)", "0"))
        ])
      ] },
      { id: "einfach", name: "Einfache Ansicht", desc: "Was ohne Lupe zu sehen ist. Weniger Knöpfe = weniger Ablenkung beim Fahren. Mit aktiver Lupe ist immer alles sichtbar.", boxes: [
        box("Knöpfe ohne Lupe sichtbar machen", [
          h("small", "set-hint", "Hier legst du fest, welche Knöpfe ohne Lupe sichtbar sind: Ein = der Knopf bleibt auch ohne Lupe sichtbar, Aus = er erscheint nur mit Lupe. So bleibt die Oberfläche ruhig, und du blendest nur ein, was du wirklich brauchst."),
          ...reg(mCheck("svHints", "Hinweis auf die Zweitfunktion (langes Drücken) unter dem Knopf zeigen", "1", "Knöpfe mit einer zweiten Funktion bei langem Drücken bekommen eine eingerückte Zeile darunter.")),
          ...SV_ITEMS.flatMap((x) => [...reg(mCheck("sv_" + x[0], x[1], x[3])), LONGP[x[0]] ? h("small", "set-hint sv-lp", "↳ " + LONGP[x[0]]) : null])
        ]),
        box("Weitere Bedienung", [
          ...reg(mCheck("ampelLong", "Lang auf „Pause / Spielt“ drücken: Korrektur-Status (rot/orange/grün) setzen", "1", "Große Tasten für die Fahrt, untereinander wie eine Ampel; derselbe Status wie unter Anpassungen → Bewertungen.")),
          h("small", "set-hint sv-lp", "↳ Linker Timecode, lang gedrückt (mit Lupe): Wiedergabe-Tempo einstellen."),
          ...reg(mCheck("holdGuard", "Lupe und Player-Symbol nur nach langem Drücken", "0"))
        ])
      ] },
      { id: "anz", name: "Abstände und Schutz", desc: "Platz am Rand, Schutz vor versehentlichem Tippen, Anzeigegröße.", boxes: [$("advView")] },
      { id: "tesla", name: "Tesla (im Auto)", desc: "Große Tasten für die Fahrt. Nur nötig, wenn du im Auto sitzt.", only: true, boxes: [tzBox] },
      { id: "sonst", name: "Schnellaktionen", desc: "Seite neu laden, Anmeldefenster, Bearbeitungsmodus und erweiterte Optionen.", boxes: [$("toolsBox")] }
    ];

    /* advPlay: Rest (Titel „Springen und Fernsteuerung“) ausblenden, Zeilen wurden verteilt */
    SPEC.forEach((t) => {
      const head = h("h3", "set-grp", t.name); head.dataset.tab = "allgemein"; head.dataset.sub = "einst"; head.dataset.v128 = t.id;
      const d = h("p", "set-grp-d", t.desc); d.dataset.tab = "allgemein"; d.dataset.sub = "einst"; d.dataset.v128 = t.id;
      const c = h("div", "tp-sec"); c.id = "tp_" + t.id; c.dataset.tab = "allgemein"; c.dataset.sub = "einst"; if (t.only) c.dataset.only = "1";
      t.boxes.filter(Boolean).forEach((b) => c.append(b));
      anchor.before(head, d, c);
      if (t.only) { head.dataset.only = "1"; d.dataset.only = "1"; }
    });
    /* alte Überschriften und leere Reste entfernen */
    document.querySelectorAll('h3.set-grp[data-sub="einst"]:not([data-v128]), p.set-grp-d[data-sub="einst"]:not([data-v128])').forEach((n) => n.remove());
    ["advBox", "advPlay"].forEach((id) => { const b = $(id); if (b) b.classList.add("v128-gone"); });
    anchor.remove();
    /* Titel anpassen */
    const rn = (box, txt) => { const p = box && box.querySelector(".ap-title"); if (p) p.textContent = txt; };
    rn($("toolsBox"), "Schnellaktionen");
    rn($("listenBox"), "Mithören (anderes Gerät)");
    rn($("advView"), "Abstände, Schutz und Anzeigegröße");
    rn($("caragBox"), "Carag (Chor-Video und GIF)");
    /* Carag steht hinter der Startseite */
    const cb = $("caragBox"), ts = $("tp_start"); if (cb && ts) ts.after(cb);
    /* eigene Mirror-Felder beim Öffnen auffrischen */
    new MutationObserver(() => { syncers.forEach((f) => { try { f(); } catch { /* egal */ } }); }).observe($("codeModal"), { attributes: true, attributeFilter: ["hidden"] });
  }

  function teslaBox() {
    const b = h("div", "autoplay-box v128-box tz-box");
    b.append(h("p", "ap-title", "Tesla: schnell einstellen"));
    const add = (arr) => arr.forEach((n) => n && b.append(n));
    const sub = (t) => b.append(h("p", "tz-sub", t));
    b.append(bigBtn("Tesla-Voreinstellung anwenden", () => { const x = $("teslaApply"); if (x) x.click(); }, "tz-primary"));
    b.append(h("small", "tz-hint", "Setzt alle empfohlenen Werte für das Auto auf einmal. Danach kannst du hier einzelne Werte ändern."));
    sub("Wiedergabe");
    add(bigCheck("autoPlayOpt", "Beim Öffnen automatisch abspielen"));
    add(bigCheck("karaokeOnlyOpt", "Automatisch nur Karaoke-Lieder"));
    const rm = (() => { const s = h("select", "tz-sel"); [["pause", "Pause bleibt"], ["auto", "wie bisher"], ["always", "immer weiter"]].forEach(([v, n]) => { const o = h("option", "", n); o.value = v; s.append(o); }); const paint = () => { s.value = resumeMode(); }; s.onchange = () => applyKey("resumeMode", s.value); paint(); return bigRow("Nach Rückkehr in den Browser", s, "", paint); })();
    add(rm);
    add(bigNum("advBack", "Springen zurück", 5, "s"));
    add(bigNum("advFwd", "Springen vor", 5, "s"));
    sub("Lesbarkeit");
    add(bigNum("advScale", "Schrift Karaoke-Text", 2, "%"));
    add(bigNum("advListSize", "Schrift Liedliste", 2, "px"));
    add(bigNum("advSidebar", "Breite der Liedliste", 20, "px"));
    add(bigNum("advTopMain", "Abstand oben (Hauptfenster)", 10, "px"));
    add(bigNum("advTopSet", "Abstand oben (Einstellungen)", 10, "px"));
    sub("Liste und Bedienung");
    add(bigCheck("advHold", "Lupe und Player-Symbol nur nach langem Drücken"));
    add(bigCheck("extraSongsOpt", "Weitere Lieder in der Liste"));
    add(bigCheck("srcTagsOpt", "Kleine Kennzeichen (K, ♪, ▶, Z)"));
    add(bigSel("favSeekOpt", "Tesla-Player: Taste = Favorit"));
    sub("Tesla-Knopf in den Einstellungen");
    add((() => { const s = h("select", "tz-sel"); [["auto", "automatisch (im Tesla oben, sonst links in der Liste)"], ["top", "oben groß (neben Einstellungen)"], ["list", "links in der Liste (klein)"]].forEach(([v, n]) => { const o = h("option", "", n); o.value = v; s.append(o); });
      const paint = () => { s.value = lsv("teslaTab", "auto"); }; s.onchange = () => applyKey("teslaTab", s.value); return bigRow("Wo steht der Tesla-Knopf?", s, "Oben: großer blauer Knopf, gut im Auto zu treffen. Liste: kleiner Eintrag links wie die anderen Themen (Desktop).", paint); })());
    sub("Tasten im Tesla-Player (unter den Fahrzeug-Infos)");
    add((() => { const s = h("select", "tz-sel"); [["step", "Lied vor / zurück"], ["seek", "Vor- / Zurückspulen"]].forEach(([v, n]) => { const o = h("option", "", n); o.value = v; s.append(o); });
      const paint = () => { s.value = lsv("mediaKeys", "step"); }; s.onchange = () => applyKey("mediaKeys", s.value); return bigRow("Die Tasten sollen sein", s, "Standard: Lied vor und Lied zurück. Danach ein Lied neu wählen.", paint); })());
    add((() => { const b2 = h("button", "tz-sw"); b2.type = "button"; const paint = () => { const on = lsv("mediaHold", "1") === "1"; b2.textContent = on ? "EIN" : "AUS"; b2.setAttribute("aria-pressed", String(on)); }; b2.onclick = () => { applyKey("mediaHold", lsv("mediaHold", "1") === "1" ? "0" : "1"); paint(); }; paint(); return bigRow("Gehalten = vor- / zurückspulen", b2, "Kurz drücken wechselt das Lied (mit kurzer Verzögerung), gehalten spult.", paint); })());
    add(bigCheck("eggFall", "Video blockiert: GIF abspielen"));
    sub("Sonst");
    const row = h("div", "tz-btns");
    row.append(bigBtn("Seite neu laden", () => { const x = $("advReload"); if (x) x.click(); }), bigBtn("Design wählen", () => { const t = document.querySelector('#setTabs [data-settab="design"]'); if (t) t.click(); }), bigBtn("Schließen", () => { const x = $("codeX") || $("codeCancel"); if (x) x.click(); }));
    b.append(row);
    return b;
  }


  /* ---------- Einfache Ansicht: Knöpfe ohne Lupe ---------- */
  const SVI = () => (typeof SV_ITEMS !== "undefined" ? SV_ITEMS : []);
  function applySV() {
    SVI().forEach((x) => document.body.classList.toggle("sv-" + x[0], lsv("sv_" + x[0], x[3]) === "1"));
    document.body.classList.toggle("sv-hints-off", lsv("svHints", "1") !== "1");
  }
  (function svCss() {
    const st = h("style"); st.id = "v128SvCss";
    st.textContent = SVI().filter((x) => x[2]).map((x) => "body:not(.glass-open):not(.sv-" + x[0] + ") " + x[2].split(",").map((q) => q.trim()).join(", body:not(.glass-open):not(.sv-" + x[0] + ") ") + "{display:none!important}").join("\n");
    document.head.append(st); applySV();
    window.addEventListener("storage", applySV);
  })();

  /* ---------- Passwort wie beim Bearbeitungsmodus ---------- */
  window.askEditPass = async function (title) {
    try { if (state.writeKey) return state.writeKey; } catch { /* egal */ }
    for (let i = 0; i < 3; i++) {
      const p = await uiPrompt({ eyebrow: title || "Passwort", title: "Passwort eingeben", text: "Dasselbe Passwort wie beim Wechsel in den Bearbeitungsmodus.", type: "password", placeholder: "Passwort", ok: "Weiter" });
      if (p === null || p === "") return null;
      let ok = true;
      try { ok = await passwordOk(p, window.TIMECODE_PASSWORD, window.TIMECODE_PASSWORD_HASH); } catch { ok = true; }
      if (ok) { try { state.writeKey = p; } catch { /* egal */ } return p; }
      await uiAlert("Falsches Passwort", "Bitte noch einmal versuchen.");
    }
    return null;
  };

  /* ---------- Tempo: linken Timecode lang drücken (nur mit Lupe) ---------- */
  function installTempo() {
    const t = $("currentTime"); if (!t || t.dataset.v128) return; t.dataset.v128 = "1";
    let timer = 0, fired = false;
    const open = async () => {
      fired = true; setTimeout(() => { fired = false; }, 800);
      const a = $("audio") || (typeof el !== "undefined" && el.audio); if (!a) return;
      let v = Math.round((a.playbackRate || 1) * 100) / 100;
      const r = await uiDialog({ eyebrow: "Wiedergabe", title: "Wiedergabegeschwindigkeit", cancelValue: false, lines: [
        { num: { label: "Tempo (1 = normal)", value: v, min: 0.1, max: 4, step: 0.05, onChange: (x) => { const n = Number(String(x).replace(",", ".")); if (n >= 0.1 && n <= 4) { v = Math.round(n * 100) / 100; a.playbackRate = v; } } } },
        { text: "Regler oder Wert direkt eintippen (0,1 bis 4).", cls: "dlg-hint" }],
        buttons: [{ value: true, kind: "primary", label: "OK" }, { value: "reset", kind: "cancel", label: "Normal (1x)" }] });
      if (r === "reset") a.playbackRate = 1;
    };
    const ok = () => document.body.classList.contains("glass-open");
    t.addEventListener("pointerdown", () => { fired = false; clearTimeout(timer); if (ok()) timer = setTimeout(open, 700); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((n) => t.addEventListener(n, () => clearTimeout(timer)));
    t.addEventListener("contextmenu", (e) => { if (ok()) { e.preventDefault(); clearTimeout(timer); open(); } });
    t.addEventListener("click", (e) => { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  }

  /* ---------- Korrektur-Status per langem Drücken auf „Pause / Spielt“ + Hinweis in der Oberfläche ---------- */
  const song = () => { try { return state.songs[state.index]; } catch { return null; } };
  function badge() {
    const R = window.RATING, s = song(); let b = $("ampBadge");
    const c = R && s && lsv("ampelOn", "1") === "1" ? R.getStatus(s.id, R.curArt(), R.curLang()) : "";
    if (!c || c === "green") { if (b) b.hidden = true; document.body.dataset.amp = c || ""; return; }
    if (!b) { b = h("button", "amp-badge"); b.id = "ampBadge"; b.type = "button"; b.onclick = statusDialog; const row = $("titleRow"); if (row) row.append(b); else return; }
    b.hidden = false; b.dataset.c = c; b.textContent = c === "red" ? "● Text noch nicht fertig" : "● Text fast fertig";
    b.title = "Korrektur-Status: tippen zum Ändern"; document.body.dataset.amp = c;
  }
  async function statusDialog() {
    const R = window.RATING, s = song(); if (!R || !s) return;
    if (!R.getStatus) return;
    const art = R.curArt(), lang = R.curLang(); let cur = R.getStatus(s.id, art, lang);
    const wrap = h("div", "tz-amp");
    const close = () => { const b = [...document.querySelectorAll("#dialogButtons button")].find((x) => /schlie|abbr|ok/i.test(x.textContent)); if (b) b.click(); };
    const mk = (c, label) => { const b = h("button", "tz-ab", ""); b.type = "button"; b.dataset.c = c; b.setAttribute("aria-label", label); b.append(h("i", "amp-dot")); b.firstChild.dataset.c = c; b.append(h("span", "", label)); b.onclick = async () => { try { await R.setStatus(s.id, art, lang, c); showToast(c ? "Status: " + label : "Status entfernt"); } catch (e) { showToast("Status nicht gespeichert: " + (e.message || e)); } close(); setTimeout(badge, 150); }; return b; };
    wrap.append(mk("red", "Rot"), mk("orange", "Orange"), mk("green", "Grün"), mk("", "Keine"));
    await uiDialog({ eyebrow: `Lied ${s.id}`, title: "Korrektur-Status", cancelValue: null, lines: [s.title, { text: "Rot: muss überarbeitet werden. Orange: fast fertig. Grün: passt.", cls: "dlg-hint" }, { node: wrap }], buttons: [{ value: null, kind: "cancel", label: "Schließen" }] });
    void cur;
  }
  function installStatus() {
    const t = $("currentStatus"); if (!t || t.dataset.v128) return; t.dataset.v128 = "1";
    let timer = 0, fired = false;
    const start = () => { fired = false; clearTimeout(timer); if (lsv("ampelLong", "1") !== "1") return; timer = setTimeout(() => { fired = true; statusDialog(); }, 1000); };
    t.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach((n) => t.addEventListener(n, () => clearTimeout(timer)));
    t.addEventListener("contextmenu", (e) => e.preventDefault());
    t.addEventListener("click", (e) => { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
    const n = $("currentNumber"); if (n) new MutationObserver(() => setTimeout(badge, 200)).observe(n, { childList: true, characterData: true, subtree: true });
    const R = window.RATING; if (R && !R._v128 && R.paintAmpel) { R._v128 = true; const o = R.paintAmpel; R.paintAmpel = function () { const r = o.apply(this, arguments); try { badge(); } catch { /* egal */ } return r; }; }
    setTimeout(badge, 600);
  }

  /* ---------- Tesla: kein Apple-Music-Einsprung beim Liedwechsel (stilles Dauer-Signal, solange das nächste Lied lädt) ---------- */
  function installKeepAlive() {
    if (!tesla() || window.__v128ka) return; window.__v128ka = true;
    const a = (typeof el !== "undefined" && el.audio) || $("audio"); if (!a) return;
    const wav = (() => { const n = 8000, b = new ArrayBuffer(44 + n * 2), v = new DataView(b); const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
      let bin = ""; new Uint8Array(b).forEach((x) => { bin += String.fromCharCode(x); }); return "data:audio/wav;base64," + btoa(bin); })();
    const sil = new Audio(wav); sil.loop = true; sil.preload = "auto"; sil.setAttribute("playsinline", ""); sil.volume = 1;
    let cap = 0;
    const stop = () => { clearTimeout(cap); try { sil.pause(); } catch { /* egal */ } };
    const go = () => { try { if (state.userPaused) return; sil.play().catch(() => {}); clearTimeout(cap); cap = setTimeout(stop, 12000); } catch { /* egal */ } };
    a.addEventListener("ended", go);
    a.addEventListener("loadstart", () => { if (state.wantPlay || !a.paused || a.ended) go(); });
    a.addEventListener("playing", () => { clearTimeout(cap); cap = setTimeout(stop, 1200); });
    a.addEventListener("pause", () => { if (state.userPaused) stop(); });
  }

  /* ---------- Handy: Tastatur verdeckt die obere Leiste ---------- */
  function installKeyboard() {
    const vv = window.visualViewport; if (!vv) return;
    const upd = () => {
      const kb = window.innerHeight - vv.height > 120;
      document.body.classList.toggle("kb-open", kb);
      document.documentElement.style.setProperty("--kb-top", (kb ? vv.offsetTop : 0) + "px");
      document.documentElement.style.setProperty("--kb-h", vv.height + "px");
      if (kb && vv.offsetTop > 0) window.scrollTo(0, 0);
    };
    vv.addEventListener("resize", upd); vv.addEventListener("scroll", upd); upd();
  }

  function boot() { installTempo(); installStatus(); installKeepAlive(); installKeyboard(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 50)); else setTimeout(boot, 50);
  window.V128 = { applySV, restructure, sync: () => syncers.forEach((f) => { try { f(); } catch { /* egal */ } }) };
  function init() { try { restructure(); } catch (e) { console.error(e); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
