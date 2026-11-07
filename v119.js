/* v119: Einstellungen (Allgemein) mit Themen links, ein Eintrag kann in mehreren Themen stehen; "Alle" zeigt wie bisher alles */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lss = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  const TOPICS = [
    ["alle", "Alle anzeigen"],
    ["start", "Startseite"],
    ["wieder", "Wiedergabe"],
    ["liste", "Liedliste"],
    ["text", "Karaoke-Text"],
    ["cover", "Cover"],
    ["gal", "Galerie"],
    ["player", "Player und Fernsteuerung"],
    ["ki", "KI und Bewertungen"],
    ["einfach", "Einfache Ansicht"],
    ["anz", "Abstände und Schutz"],
    ["tesla", "Tesla (im Auto)"],
    ["sonst", "Schnellaktionen"]
  ];
  const BY_ID = {};
  const BOX = { caragBox: "start" };
  const MAP = {};
  Object.entries(BY_ID).forEach(([t, ids]) => ids.split(" ").forEach((i) => { (MAP[i] = MAP[i] || []).push(t); }));
  const norm = (t) => (t || "").toLowerCase().replace(/\s+/g, " ").trim();
  let tagged = false, current = lsv("setTopic", "alle"); if (current === "tesla") current = "alle";

  function units(box) {
    const out = [];
    [...box.children].forEach((c) => {
      if (c.tagName === "DIV" && !/set-row|adv-btns|ap-title/.test(c.className) && c.querySelector(":scope > .set-row") && c.querySelectorAll(":scope > .set-row").length > 1) out.push(...units(c));
      else out.push(c);
    });
    return out;
  }
  function tag() {
    if (tagged) return; tagged = true;
    try { if (window.V128) window.V128.restructure(); } catch (e) { console.error(e); }
    document.querySelectorAll(".tp-sec").forEach((sec) => {
      const id = sec.id.replace(/^tp_/, "");
      [...sec.children].forEach((box) => { if (box.classList.contains("v128-gone")) return; units(box).forEach((u) => { u.dataset.topics = id; }); box.dataset.topicBox = "1"; });
    });
    document.querySelectorAll('#codeForm [data-tab="allgemein"][data-sub~="einst"]').forEach((box) => {
      if (!BOX[box.id] || box.dataset.topicBox) return;
      let prev = BOX[box.id].split(" ");
      const us = units(box);
      us.forEach((u) => {
        const ids = [u.id, ...[...u.querySelectorAll("[id]")].map((x) => x.id)].filter(Boolean);
        let tp = [];
        ids.forEach((i) => (MAP[i] || []).forEach((t) => { if (!tp.includes(t)) tp.push(t); }));
        if (!tp.length) tp = prev; else prev = tp;
        u.dataset.topics = tp.join(" ");
      });
      us.forEach((u, k) => { /* Überschriften: Vereinigung der folgenden Einträge */
        if (!u.classList.contains("ap-title")) return;
        const set = new Set();
        for (let j = k + 1; j < us.length && !us[j].classList.contains("ap-title"); j++) (us[j].dataset.topics || "").split(" ").forEach((t) => t && set.add(t));
        if (set.size) u.dataset.topics = [...set].join(" ");
      });
      box.dataset.topicBox = "1";
    });
  }
  function apply(t, nosave) {
    tag(); if (!nosave) current = t; if (!nosave) lss("setTopic", t);
    const form = $("codeForm"); if (!form) return;
    form.dataset.topic = t;
    const all = t === "alle";
    form.querySelectorAll('[data-tab="allgemein"][data-sub~="einst"].set-grp, [data-tab="allgemein"][data-sub~="einst"].set-grp-d').forEach((n) => n.classList.toggle("tp-off", !all));
    form.querySelectorAll("[data-topic-box]").forEach((box) => {
      let any = false;
      units(box).forEach((u) => { const on = all || (u.dataset.topics || "").split(" ").includes(t); u.classList.toggle("tp-off", !on); if (on) any = true; });
      box.classList.toggle("tp-off", !any);
    });
    form.querySelectorAll('[data-only="1"]').forEach((n) => n.classList.toggle("tp-off", n.classList.contains("tp-sec") ? t !== "tesla" : true));
    document.querySelectorAll("#setTopics [data-topic]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.topic === t)));
    const head = $("setTopicHead"); if (head) { const name = (TOPICS.find((x) => x[0] === t) || [])[1]; head.textContent = all ? "" : name; head.hidden = all; }
    const f = $("codeForm"); if (f) f.scrollTop = 0;
  }
  function sync() {
    const form = $("codeForm"); if (!form) return;
    const st = typeof state !== "undefined" ? state : {};
    const on = form.classList.contains("settings-mode") && st.setTab === "allgemein" && ["einst", "tesla"].includes(st.sub || "einst");
    form.classList.toggle("topics-on", on);
    if (on) { if (st.sub === "tesla") apply("tesla", true); else apply(current); }
    else form.querySelectorAll(".tp-off").forEach((n) => n.classList.remove("tp-off"));
  }
  function buildNav() {
    const sub = $("subTabs"); if (!sub || $("setTopics")) return;
    const nav = document.createElement("nav"); nav.id = "setTopics"; nav.className = "set-topics"; nav.dataset.tab = "allgemein"; nav.dataset.sub = "einst"; nav.setAttribute("aria-label", "Themen");
    TOPICS.forEach(([id, name]) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "seg-btn topic-btn" + (id === "tesla" ? " topic-tesla" : ""); b.dataset.topic = id; b.textContent = name;
      b.addEventListener("click", () => apply(id));
      nav.append(b);
    });
    const head = document.createElement("h3"); head.id = "setTopicHead"; head.className = "set-topic-head"; head.hidden = true; head.dataset.tab = "allgemein"; head.dataset.sub = "einst";
    sub.after(nav); nav.after(head);
  }
  /* Suche: Einträge von „Allgemein“ nach Einträgen (nicht nach Satzfetzen), mit Themenangabe */
  function labelOf(u) {
    const row = u.matches(".set-row, .ap-title") ? u : u.querySelector(".set-row, .ap-title, button");
    const src = row || u;
    const c = src.cloneNode(true); c.querySelectorAll(".stp, small, select, input, option").forEach((x) => x.remove());
    return (c.textContent || "").replace(/\s+/g, " ").trim() || (u.textContent || "").replace(/\s+/g, " ").trim();
  }
  function installSearch() {
    const inp = $("setSearch"), res = document.querySelector(".set-search-res"); if (!inp || !res || inp.dataset.v119) return; inp.dataset.v119 = "1";
    const tabName = (k) => { const b = document.querySelector(`#setTabs [data-settab="${k}"]`); return b ? b.textContent : k; };
    const topicName = (id) => (TOPICS.find((x) => x[0] === id) || [])[1] || "";
    function run() {
      tag();
      const q = norm(inp.value); res.replaceChildren();
      if (q.length < 2) { res.hidden = true; return; }
      const words = q.split(" "), hits = [], seen = new Set();
      const add = (node, tab, where, label, hay, topic) => {
        if (!words.every((w) => hay.includes(w))) return;
        const key = tab + "|" + label; if (seen.has(key)) return; seen.add(key);
        hits.push({ node, tab, where, label, topic, score: norm(label).includes(q) ? 0 : 1 });
      };
      document.querySelectorAll('#codeForm [data-topic-box]').forEach((box) => units(box).forEach((u) => {
        if (u.classList.contains("set-hint") && !u.previousElementSibling) return;
        const lab = labelOf(u); if (!lab || lab.length < 3 || /^[▲▼\s]+$/.test(lab)) return;
        const tp = (u.dataset.topics || "").split(" ").filter(Boolean);
        const hay = norm(lab + " " + (u.classList.contains("set-hint") ? u.textContent : ""));
        add(u, "allgemein", tp.map(topicName).join(", "), u.classList.contains("set-hint") ? labelOf(u.previousElementSibling || u) : lab, hay, tp[0]);
      }));
      document.querySelectorAll("#codeForm [data-tab]").forEach((c) => {
        const t = c.dataset.tab; if (t === "allgemein" || c.id === "subTabs" || c.id === "setTabs" || c.id === "setTopics") return;
        const items = c.matches(".set-row, .ap-title, .set-grp, .set-h") ? [c] : [...c.querySelectorAll(".set-row, .ap-title, .set-grp, .set-h")];
        items.forEach((n) => { const lab = labelOf(n); if (lab.length > 2) add(n, t, "", lab.length > 80 ? lab.slice(0, 80) + " …" : lab, norm(lab), ""); });
      });
      /* Design: Karaoke-Farben liegen in eigener Box */
      hits.sort((a, b) => a.score - b.score);
      if (!hits.length) { const p = document.createElement("p"); p.className = "set-hint"; p.textContent = "Nichts gefunden."; res.append(p); res.hidden = false; return; }
      hits.slice(0, 40).forEach((o) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "set-hit";
        const l = document.createElement("b"); l.textContent = o.label.length > 90 ? o.label.slice(0, 90) + " …" : o.label;
        const s = document.createElement("small"); s.textContent = [tabName(o.tab), o.where].filter(Boolean).join(" › ");
        b.append(l, s);
        b.addEventListener("click", () => {
          const tb = document.querySelector(`#setTabs [data-settab="${o.tab}"]`); if (tb) tb.click();
          setTimeout(() => {
            if (o.tab === "allgemein") { const sb = document.querySelector('#subTabs [data-sub="einst"]'); if (sb) sb.click(); }
            setTimeout(() => {
              if (o.tab === "allgemein") { const cur = (o.node.dataset.topics || "").split(" "); apply(current === "alle" || cur.includes(current) ? current : o.topic); }
              let p = o.node; while (p && p !== document.body) { if (p.hidden && p.id !== "codeModal") p.hidden = false; p = p.parentElement; }
              try { o.node.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { /* egal */ }
              o.node.classList.add("set-flash"); setTimeout(() => o.node.classList.remove("set-flash"), 2200);
            }, 150);
          }, 80);
          res.hidden = true; inp.value = "";
        });
        res.append(b);
      });
      res.hidden = false;
    }
    inp.addEventListener("input", run);
  }
  /* Zahlen auf der Startseite wirken schon beim Tippen (nach kurzer Pause), ohne erst das Feld zu verlassen */
  function liveNumbers() {
    ["advStartFade", "advStartSec", "advCarSec", "advCarMs", "advFloatSpd"].forEach((id) => {
      const i = $(id); if (!i || i.dataset.live) return; i.dataset.live = "1";
      let t = 0;
      i.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => { const v = Number(i.value); if (i.value !== "" && v >= Number(i.min || 0) && v <= Number(i.max || Infinity)) i.dispatchEvent(new Event("change", { bubbles: true })); }, 700);
      });
    });
  }
  function syncRng() { document.querySelectorAll("#codeModal .num-rng").forEach((r) => { if (r._sync) r._sync(); }); }
  function init() {
    buildNav(); liveNumbers();
    const o = window.showSetTab;
    if (typeof o === "function" && !o._v119) { const w = function (t) { o(t); sync(); setTimeout(syncRng, 0); }; w._v119 = true; window.showSetTab = w; }
    new MutationObserver(() => { installSearch(); sync(); setTimeout(syncRng, 120); setTimeout(syncRng, 600); }).observe($("codeModal") || document.body, { attributes: true, attributeFilter: ["hidden"] });
    installSearch();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();

/* v123: Höhe der unteren Leiste messen (z. B. mit eingeblendeter Welle), damit der Liedtext/Editor nicht darunter abgeschnitten wird */
(function () {
  "use strict";
  function measure() {
    const f = document.querySelector("footer"); if (!f) return;
    const h = Math.ceil(f.getBoundingClientRect().height);
    if (h > 40 && h < 400) document.documentElement.style.setProperty("--flyer-h", h + "px");
  }
  function init() {
    measure();
    const f = document.querySelector("footer"); if (!f) return;
    if (window.ResizeObserver) new ResizeObserver(measure).observe(f);
    window.addEventListener("resize", measure);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
