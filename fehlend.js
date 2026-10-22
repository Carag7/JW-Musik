/* Reiter „Fehlende Lieder“: was fehlt in R2, ist es auf jw.org schon veröffentlicht, Herunterladen nach R2, LRC-Status */
(function () {
  "use strict";
  const TYPES = [
    { id: "karaoke", name: "Karaoke", pub: "sjjc" },
    { id: "instrumental", name: "Instrumental", pub: "sjji" },
    { id: "video", name: "Video", pub: "sjjm" },
    { id: "sung", name: "Meeting-Audio", pub: "sjjm", optional: true }
  ];
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const opt = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === "1"; } catch { return d; } };
  const setOpt = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* egal */ } };
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
    const total = Math.max(data.gesamt || 0, ...base.keys(), ...Object.keys(data.lieder).map(Number));
    const has = {
      karaoke: (n) => base.has(n) || Boolean(media.karaoke.audio[n]),
      instrumental: (n) => Boolean(media.meeting.audio[n]),
      video: (n) => Boolean(media.meeting.video[n]),
      sung: (n) => Boolean(media.meeting.sung && media.meeting.sung[n])
    };
    const published = (n, t) => Boolean(data.lieder[n] && data.lieder[n][t] && data.lieder[n][t].url);
    const lrc = {
      karaoke: (n) => Boolean(media.karaoke.lrc[n] || (base.get(n) && base.get(n).lyrics)),
      meeting: (n) => Boolean(media.meeting.lrc[n])
    };
    const rows = [];
    for (let n = 1; n <= total; n++) {
      const s = base.get(n);
      rows.push({
        n, title: (s && s.title) || (data.lieder[n] && data.lieder[n].titel) || `Lied ${n}`,
        category: (s && s.category) || "Weitere Lieder (nicht in der Liste)"
      });
    }
    return { rows, has, published, lrc, total, media };
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

  async function mount(root) {
    root.replaceChildren(h("p", "set-hint", "Lade Übersicht …"));
    await loadData();
    if (!state.media) await loadMedia(true);
    render(root);
  }

  function render(root) {
    const m = model();
    const withSung = opt("fehlSung", false);
    const withLrc = opt("fehlLrc", false);
    const showAll = opt("fehlAll", false);
    const types = TYPES.filter((t) => !t.optional || withSung);
    root.replaceChildren();

    root.append(h("p", "ap-title", "Fehlende Lieder"));
    root.append(h("p", "set-hint", data.stand
      ? `Stand der Prüfung auf jw.org: ${new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.stand))} · nächste automatische Prüfung: ${nextCheck()}`
      : `Noch keine Prüfung gelaufen. Die automatische Prüfung läuft einmal pro Woche (nächste: ${nextCheck()}). Du kannst sie auch auf GitHub unter Actions → „Verfügbarkeit prüfen“ → Run workflow starten.`));

    const opts = h("div", "fl-opts");
    const check = (label, key, def) => {
      const lab = h("label", "set-row check");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = opt(key, def);
      cb.addEventListener("change", () => { setOpt(key, cb.checked); render(root); });
      lab.append(cb, document.createTextNode(" " + label));
      return lab;
    };
    opts.append(check("LRC-Dateien (Texte) anzeigen", "fehlLrc", false), check("Meeting-Audio (MP3 der Meetings) mit einbeziehen", "fehlSung", false), check("auch vollständige Lieder zeigen", "fehlAll", false));
    root.append(opts);

    // Zusammenfassung
    const sum = h("div", "fl-sum");
    let downloadable = [];
    types.forEach((t) => {
      let have = 0, miss = 0, pub = 0;
      m.rows.forEach((r) => { if (m.has[t.id](r.n)) have++; else { miss++; if (m.published(r.n, t.id)) { pub++; downloadable.push([r.n, t.id]); } } });
      const b = h("span", "fl-pill");
      b.append(h("b", "", t.name), document.createTextNode(` ${have}/${m.total}`));
      if (miss) b.append(h("em", "", ` · ${pub} laden möglich`));
      sum.append(b);
    });
    root.append(sum);

    if (downloadable.length) {
      const all = h("button", "chip fl-all", `Alle veröffentlichten laden (${downloadable.length} Dateien)`);
      all.type = "button";
      all.addEventListener("click", async () => {
        all.disabled = true;
        let ok = 0, fail = 0, last = "";
        for (let i = 0; i < downloadable.length; i++) {
          all.textContent = `Lade ${i + 1} von ${downloadable.length} …`;
          const r = await download(downloadable[i][0], downloadable[i][1]);
          if (r.abbruch) break;
          if (r.ok) ok++; else { fail++; last = r.fehler; if (/Schlüssel|WRITE_KEY/.test(last)) break; }
        }
        await loadMedia(true);
        await uiAlert("Fertig", `${ok} Dateien gespeichert${fail ? `, ${fail} fehlgeschlagen (${last})` : ""}.`);
        render(root);
      });
      root.append(all);
    }

    // Gruppen nach Kategorie
    const cats = new Map();
    m.rows.forEach((r) => {
      const missing = types.filter((t) => !m.has[t.id](r.n));
      if (!missing.length && !showAll) return;
      if (!cats.has(r.category)) cats.set(r.category, []);
      cats.get(r.category).push({ ...r, missing });
    });
    if (!cats.size) root.append(h("p", "set-hint", "Es fehlt nichts. 🎉"));
    const ordered = [...cats.entries()].sort((a, b) => (a[0].startsWith("Weitere") ? 1 : 0) - (b[0].startsWith("Weitere") ? 1 : 0));
    ordered.forEach(([cat, list]) => {
      const det = h("details", "fl-cat");
      const count = list.filter((x) => x.missing.length).length;
      det.append(h("summary", "", `${cat} – ${count ? `${count} mit Lücken` : "vollständig"} (${list.length})`));
      if (count && count <= 12) det.open = true;
      list.forEach((r) => {
        const row = h("div", "fl-row");
        row.append(h("b", "fl-n", pad(r.n)), h("span", "fl-t", r.title));
        const chips = h("span", "fl-chips");
        types.forEach((t) => {
          if (m.has[t.id](r.n)) { chips.append(h("span", "fl-ok", `✓ ${t.name}`)); return; }
          if (m.published(r.n, t.id)) {
            const b = h("button", "chip fl-dl", `⬇ ${t.name}`); b.type = "button";
            b.addEventListener("click", async () => {
              b.disabled = true; b.textContent = "lädt …";
              const res = await download(r.n, t.id);
              if (res.abbruch) { b.disabled = false; b.textContent = `⬇ ${t.name}`; return; }
              if (!res.ok) { b.disabled = false; b.textContent = `⬇ ${t.name}`; await uiAlert("Herunterladen fehlgeschlagen", res.fehler); return; }
              await loadMedia(true);
              render(root);
            });
            chips.append(b);
          } else chips.append(h("span", "fl-no", `${t.name}: noch nicht veröffentlicht`));
        });
        if (withLrc) {
          chips.append(h("span", m.lrc.karaoke(r.n) ? "fl-ok lrc" : "fl-no lrc", `LRC Karaoke ${m.lrc.karaoke(r.n) ? "✓" : "✗"}`));
          chips.append(h("span", m.lrc.meeting(r.n) ? "fl-ok lrc" : "fl-no lrc", `LRC Meeting ${m.lrc.meeting(r.n) ? "✓" : "✗"}`));
        }
        row.append(chips);
        det.append(row);
      });
      root.append(det);
    });
    root.append(h("small", "set-hint", "„Laden“ holt die Datei direkt von jw.org auf den Server (R2). Dafür ist das Schreib-Passwort (WRITE_KEY) nötig. Kinderlieder sind nicht enthalten."));
  }

  window.FEHLEND = { mount };
})();
