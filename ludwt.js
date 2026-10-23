/* LuD+WT: Lieder der Zusammenkünfte pro Woche (Daten aus lieder.json / status.json).
 *
 * Standardmäßig liegen lieder.json und status.json neben dieser Datei (gleiche Webseite).
 * Liegen sie woanders, vor dem Laden dieser Datei setzen:
 *   <script>window.LUDWT_BASE = "https://andere-seite.pages.dev/";</script>
 *   (optional <script>window.LUDWT_API = "https://andere-seite.../api/refresh";</script>)
 */
(() => {
  const BASE = window.LUDWT_BASE ? String(window.LUDWT_BASE).replace(/\/*$/, "/") : "";
  const API = window.LUDWT_API || (/github\.io$/.test(location.hostname) ? "https://musik.carag.workers.dev/api/refresh" : "/api/refresh");
  const POLL_MS = 15000;
  const POLL_MAX_MS = 8 * 60 * 1000;

  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const KINDS = [
    { key: "leben_und_dienst", id: "lud", long: "Leben und Dienst", short: "LuD" },
    { key: "wachtturm", id: "wt", long: "Wachtturm-Studium", short: "WT" }
  ];
  const POS = { anfang: "Anfang", mitte: "Mitte", schluss: "Ende" };

  let data = { wochen: [] };
  let status = null;
  let loading = null;
  let pollTimer = 0;

  const h = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseDay = (s) => new Date(`${s}T00:00:00`);
  const fmtTime = (t) => new Date(t).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "medium" });
  const trigger = (t) => ({ schedule: "automatisch (wöchentlich)", workflow_dispatch: "manuell", lokal: "lokal" }[t] || t || "unbekannt");

  async function getJson(name) {
    const res = await fetch(`${BASE}${name}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    return res.json();
  }

  async function reload() {
    const [lieder, st] = await Promise.allSettled([getJson("lieder.json"), getJson("status.json")]);
    if (lieder.status === "fulfilled" && lieder.value && Array.isArray(lieder.value.wochen)) {
      data = { ...lieder.value, wochen: [...lieder.value.wochen].sort((a, b) => a.montag.localeCompare(b.montag)) };
    }
    status = st.status === "fulfilled" ? st.value : null;
    return data;
  }

  function ensureLoaded() {
    if (!loading) loading = reload().catch(() => data);
    return loading;
  }

  const weeks = () => data.wochen;
  const hasWeek = (monday) => data.wochen.some((w) => w.montag === monday);

  /* Index der aktuellen Woche; fehlt sie, die nächste spätere, sonst die letzte vorhandene */
  function currentIndex() {
    const today = iso(new Date());
    let i = data.wochen.findIndex((w) => w.montag <= today && today <= w.sonntag);
    if (i < 0) i = data.wochen.findIndex((w) => w.montag > today);
    if (i < 0) i = data.wochen.length - 1;
    return i;
  }
  const isCurrent = (w) => {
    const today = iso(new Date());
    return w.montag <= today && today <= w.sonntag;
  };
  const defaultWeek = () => (data.wochen[currentIndex()] || {}).montag || "";

  function rangeLabel(w) {
    const a = parseDay(w.montag), b = parseDay(w.sonntag);
    if (a.getMonth() === b.getMonth()) return `${a.getDate()}.–${b.getDate()}. ${MONTHS[b.getMonth()]}`;
    return `${a.getDate()}. ${MONTHS[a.getMonth()].slice(0, 3)}. – ${b.getDate()}. ${MONTHS[b.getMonth()].slice(0, 3)}.`;
  }

  /* Die fünf Lieder einer Woche in Reihenfolge (LuD Anfang/Mitte/Ende, WT Anfang/Ende) */
  function rows(monday, songs) {
    const w = data.wochen.find((x) => x.montag === monday);
    if (!w) return [];
    const out = [];
    for (const kind of KINDS) {
      for (const l of (w[kind.key] && w[kind.key].lieder) || []) {
        out.push({
          kind: kind.id,
          kindLong: kind.long,
          kindShort: kind.short,
          pos: POS[l.position] || l.position,
          number: l.nummer,
          song: (songs || []).find((s) => s.number === l.nummer) || null
        });
      }
    }
    return out;
  }

  /* kleine Beschriftung "Leben und Dienst · Anfang" (kurz: "LuD · Anfang", wenn der Platz fehlt) */
  function whenEl(row) {
    const small = h("small", `when ${row.kindShort === "WT" ? "k-wt" : "k-lud"}`);
    const long = h("i", "long", row.kindLong);
    const short = h("i", "short", row.kindShort);
    small.append(long, short, document.createTextNode(` · ${row.pos}`));
    return small;
  }

  function fitLabels(root) {
    (root || document).querySelectorAll(".when").forEach((el) => {
      el.classList.remove("short-mode");
      if (el.scrollWidth > el.clientWidth + 1) el.classList.add("short-mode");
    });
  }

  function fillWeekSelect(select, selected) {
    select.innerHTML = "";
    data.wochen.forEach((w) => {
      const o = document.createElement("option");
      o.value = w.montag;
      o.textContent = `${rangeLabel(w)}${isCurrent(w) ? " (aktuell)" : ""}`;
      select.append(o);
    });
    if (selected) select.value = selected;
  }

  /* ---------- Synchronisieren-Dialog ---------- */
  function weekCard(w) {
    const card = h("div", `ls-week${isCurrent(w) ? " is-now" : ""}`);
    const head = h("div", "ls-top");
    head.append(h("b", "", `${rangeLabel(w)} ${parseDay(w.montag).getFullYear()}`));
    if (isCurrent(w)) head.append(h("em", "", "aktuelle Woche"));
    card.append(head);
    for (const kind of KINDS) {
      const part = w[kind.key];
      if (!part) continue;
      const row = h("div", "ls-row");
      row.append(h("span", "ls-kind", kind.long));
      for (const l of part.lieder) row.append(h("span", "ls-nr", String(l.nummer)));
      card.append(row);
    }
    return card;
  }

  function centerCurrent(box) {
    const card = box.querySelector(".ls-week.is-now") || box.children[currentIndex()];
    if (!card) return;
    box.scrollTop = Math.max(0, card.offsetTop - box.clientHeight / 2 + card.offsetHeight / 2);
  }

  function say(root, text, cls) {
    const m = root.querySelector(".ls-msg");
    if (!m) return;
    m.textContent = text;
    m.className = `ls-msg${cls ? ` ${cls}` : ""}`;
    const dot = root.querySelector(".ls-dot");
    if (dot && (cls === "busy" || cls === "ok" || cls === "bad")) dot.className = `ls-dot ${cls}`;
  }

  async function startUpdate(pin) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pin || "" })
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && body.pin_erforderlich) {
      const p = await window.uiDialog({
        eyebrow: "Lieder LuD+WT", title: "PIN erforderlich",
        lines: ["Bitte die PIN für die Aktualisierung eingeben."],
        input: { type: "password", placeholder: "PIN", inputMode: "numeric" },
        buttons: [{ value: "ok", kind: "primary", label: "Aktualisieren" }, { value: null, kind: "cancel", label: "Abbrechen" }]
      });
      if (p === null || p === "") return { abgebrochen: true };
      const out = await startUpdate(p);
      try { sessionStorage.setItem("ludwtPin", p); } catch {}
      return out;
    }
    if (res.status === 404 || res.status === 405) {
      throw new Error("Die Server-Funktion /api/refresh wurde nicht gefunden. Bitte die Seite über https://musik.carag.workers.dev öffnen und src/index.js samt wrangler.jsonc aktualisieren.");
    }
    if (!res.ok || !body.ok) throw new Error(body.fehler || `Fehler ${res.status}`);
    return body;
  }

  function onRefresh(root, btn) {
    btn.disabled = true;
    say(root, "Starte Update …", "busy");
    const before = status && status.letzter_lauf;
    let savedPin = "";
    try { savedPin = sessionStorage.getItem("ludwtPin") || ""; } catch {}
    startUpdate(savedPin).then((r) => {
      if (r.abgebrochen) { say(root, "Abgebrochen."); btn.disabled = false; return; }
      say(root, "Update läuft bei GitHub. Danach veröffentlicht Cloudflare die Daten (zusammen meist 1–3 Minuten) …", "busy");
      const t0 = Date.now();
      clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        try {
          const st = await getJson("status.json");
          if (st.letzter_lauf !== before) {
            clearInterval(pollTimer);
            await reload();
            if (window.LUDWT && typeof window.LUDWT.onChange === "function") window.LUDWT.onChange();
            const stillOpen = document.getElementById("ludwtSync");
            if (stillOpen && !stillOpen.hidden) build(stillOpen);
            const ok = st.laeufe && st.laeufe[0] && st.laeufe[0].ok;
            const msgRoot = document.getElementById("ludwtSync");
            if (msgRoot) say(msgRoot, ok ? "Update fertig." : "Update ist fehlgeschlagen – Details im Fehlerprotokoll.", ok ? "ok" : "bad");
          } else if (Date.now() - t0 > POLL_MAX_MS) {
            clearInterval(pollTimer);
            say(root, "Noch keine Rückmeldung nach 8 Minuten. Bitte später erneut öffnen oder bei GitHub unter Actions nachsehen.", "bad");
            btn.disabled = false;
          }
        } catch { /* kurz nicht erreichbar -> weiter warten */ }
      }, POLL_MS);
    }).catch((err) => {
      const setup = /GITHUB_TOKEN/.test(err.message) ? " Einmalige Einrichtung nötig: In Cloudflare unter Worker → Einstellungen → Variablen und Geheimnisse das Secret GITHUB_TOKEN anlegen (siehe Anleitung)." : "";
      say(root, `Update konnte nicht gestartet werden: ${err.message}${setup}`, "bad");
      btn.disabled = false;
    });
  }

  function openPopup(root) {
    const pop = document.getElementById("ludwtPopup");
    const close = () => { pop.hidden = true; };
    document.getElementById("ludwtPopupClose").onclick = close;
    pop.onclick = (event) => { if (event.target === pop) close(); };
    document.getElementById("ludwtPopupGo").onclick = () => {
      close();
      const btn = { disabled: false };
      onRefresh(root, btn);
    };
    pop.hidden = false;
  }

  function build(root, keepOpen) {
    const wasOpen = keepOpen != null ? keepOpen : !!root.querySelector(".ls-all:not([hidden])");
    root.replaceChildren();
    const head = h("div", "ls-top");
    head.append(h("h3", "", "Lieder LuD+WT"));
    const info = h("button", "ghost ls-i", "i");
    info.type = "button";
    info.setAttribute("aria-label", "Info zur manuellen Aktualisierung");
    info.addEventListener("click", () => openPopup(root));
    head.append(info);
    root.append(head, h("p", "ls-note", "Nur zur Information – hier musst du nichts auswählen."));

    const runs = (status && status.laeufe) || [];
    const latest = runs[0];
    const statusLine = h("div", "ls-line");
    const dot = h("span", `ls-dot ${!latest ? "" : latest.ok ? (latest.fehler && latest.fehler.length ? "warn" : "ok") : "bad"}`);
    statusLine.append(dot, h("span", "", status && status.letzter_erfolg
      ? `Letztes erfolgreiches Update: ${fmtTime(status.letzter_erfolg)}`
      : "Noch kein erfolgreiches Update."));
    root.append(statusLine);
    if (latest) {
      root.append(h("p", "ls-small", `Letzter Lauf: ${fmtTime(latest.zeit)} – ${trigger(latest.ausloeser)} – ${latest.ok ? "erfolgreich" : "FEHLGESCHLAGEN"}`));
    }

    root.append(h("p", "ls-small", `Nächstes automatisches Update: ${nextAuto()} (GitHub kann es um einige Minuten verzögern)`));

    const list = weeks();
    if (list.length) {
      const a = list[0], b = list[list.length - 1];
      root.append(h("p", "ls-count", `Lieder für ${list.length} ${list.length === 1 ? "Woche" : "Wochen"} heruntergeladen`));
      root.append(h("p", "ls-small", `${rangeLabel(a)} ${parseDay(a.montag).getFullYear()} bis ${rangeLabel(b)} ${parseDay(b.montag).getFullYear()}`));
    } else {
      root.append(h("p", "ls-count", "Noch keine Wochen heruntergeladen."));
    }

    root.append(h("p", "ls-msg"));

    if (list.length) {
      root.append(h("p", "ls-small ls-title", "Aktuelle Woche"));
      root.append(weekCard(list[currentIndex()]));
      if (list.length > 1) {
        const toggle = h("button", "chip ls-toggle", "");
        toggle.type = "button";
        const all = h("div", "ls-all");
        list.forEach((w) => all.append(weekCard(w)));
        const apply = (open) => {
          all.hidden = !open;
          toggle.textContent = open ? "Wochen ausblenden" : `Alle Wochen anzeigen (${list.length})`;
          toggle.setAttribute("aria-expanded", String(open));
          if (open) requestAnimationFrame(() => centerCurrent(all));  // aktuelle Woche immer in der Mitte
        };
        toggle.addEventListener("click", () => apply(all.hidden));
        root.append(toggle, all);
        apply(wasOpen);
      }
    }

    const withErrors = runs.filter((r) => r.fehler && r.fehler.length);
    if (withErrors.length) {
      const total = withErrors.reduce((n, r) => n + r.fehler.length, 0);
      const box = h("details", "ls-log");
      box.append(h("summary", "", `Fehlerprotokoll (${total} fehlgeschlagene Tests in ${withErrors.length} Läufen)`));
      for (const r of withErrors) {
        const run = h("div", "ls-run");
        run.append(h("b", "", `${fmtTime(r.zeit)} – ${trigger(r.ausloeser)} – ${r.ok ? "am Ende erfolgreich (Ersatz-Option hat funktioniert)" : "fehlgeschlagen"}`));
        for (const e of r.fehler) {
          const d = h("div", `ls-err${r.ok ? " hint" : ""}`);
          d.append(h("b", "", `${fmtTime(e.zeit)} · ${e.schritt}`));
          d.append(h("code", "", `${e.ziel ? `${e.ziel}\n` : ""}${e.meldung}`));
          run.append(d);
        }
        box.append(run);
      }
      root.append(box);
    }
  }

  /* wöchentlich montags 04:17 UTC (siehe .github/workflows/update.yml) */
  function nextAuto() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 17));
    d.setUTCDate(d.getUTCDate() + ((1 - d.getUTCDay() + 7) % 7));
    if (d <= now) d.setUTCDate(d.getUTCDate() + 7);
    const day = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d);
    const days = Math.max(0, Math.ceil((d - now) / 86400000));
    return `${day} Uhr (in ${days} ${days === 1 ? "Tag" : "Tagen"})`;
  }

  async function mountSync() {
    const root = document.getElementById("ludwtSync");
    if (!root) return;
    root.hidden = false;
    root.replaceChildren(h("p", "ls-small", "Lade Lieder-Status …"));
    await reload();
    loading = Promise.resolve(data);
    if (typeof window.LUDWT.onChange === "function") window.LUDWT.onChange();
    build(root, false);
  }

  /* Beschriftungen neu anpassen, wenn sich die Breite ändert */
  const sidebar = document.getElementById("sidebar");
  if (sidebar && "ResizeObserver" in window) {
    new ResizeObserver(() => fitLabels(document.getElementById("songList"))).observe(sidebar);
  }
  window.addEventListener("resize", () => fitLabels(document.getElementById("songList")));

  window.LUDWT = {
    ensureLoaded, reload, weeks, hasWeek, defaultWeek, rows, whenEl, fitLabels, fillWeekSelect,
    weekCount: () => data.wochen.length,
    mountSync,
    onChange: null
  };
})();
