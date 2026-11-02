/* v118: Einstellungen für Galerie, Player-Anordnung (die Werte liest covers.js) */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
  const lss = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
  function bind() {
    const nk = $("advGalNoKar"); if (nk) { nk.value = lsv("galNoKar", "1"); nk.onchange = () => { lss("galNoKar", nk.value); const g = $("coverGallery"); if (g) g.style.setProperty("--nk", String(Number(lsv("galNoKarAmt", "55")) / 100)); }; }
    const am = $("advGalNoKarAmt"); if (am) { am.value = lsv("galNoKarAmt", "55"); am.oninput = () => { lss("galNoKarAmt", am.value); const g = $("coverGallery"); if (g) g.style.setProperty("--nk", String(Number(am.value) / 100)); }; }
    const mi = $("advGalMini"); if (mi) { mi.value = lsv("galMini", "player"); mi.onchange = () => lss("galMini", mi.value); }
    const nl = $("advNpLayout"); if (nl) { nl.value = lsv("npLayout", "auto"); nl.onchange = () => lss("npLayout", nl.value); }
  }
  /* Suche in den Einstellungen: findet Zeilen über alle Reiter, ein Tipp springt hin */
  const norm = (t) => (t || "").toLowerCase().replace(/\s+/g, " ").trim();
  function buildSearch() {
    const tabs = $("setTabs"); if (!tabs || $("setSearch")) return;
    const box = document.createElement("div"); box.className = "set-search";
    const inp = document.createElement("input"); inp.type = "search"; inp.id = "setSearch"; inp.placeholder = "Einstellung suchen …"; inp.setAttribute("aria-label", "Einstellungen durchsuchen");
    const res = document.createElement("div"); res.className = "set-search-res"; res.hidden = true;
    box.append(inp, res); tabs.after(box);
    const tabName = (k) => { const b = document.querySelector(`#setTabs [data-settab="${k}"]`); return b ? b.textContent : k; };
    const subName = (k) => { const b = document.querySelector(`#subTabs [data-sub="${k}"]`); return b ? b.textContent : ""; };
    function run() {
      const q = norm(inp.value); res.replaceChildren();
      if (q.length < 2) { res.hidden = true; return; }
      const words = q.split(" ");
      const out = [];
      document.querySelectorAll("#codeModal [data-tab]").forEach((c) => {
        if (c.id === "subTabs" || c.id === "setTabs") return;
        const t = c.getAttribute("data-tab"), s = c.getAttribute("data-sub") || "";
        const items = c.matches(".set-row, .ap-title, .set-grp, .set-grp-d, .set-h, .set-hint") ? [c] : [...c.querySelectorAll(".set-row, .ap-title, .set-hint, .set-h, label, h3, h4")];
        items.forEach((n) => {
          const tx = norm(n.textContent); if (!tx || tx.length > 400) return;
          if (!words.every((w) => tx.includes(w))) return;
          out.push({ n, t, s, tx });
        });
      });
      if (!out.length) { res.append(Object.assign(document.createElement("p"), { className: "set-hint", textContent: "Nichts gefunden." })); res.hidden = false; return; }
      const seen = new Set();
      out.slice(0, 60).forEach((o) => {
        const key = o.tx.slice(0, 60); if (seen.has(key)) return; seen.add(key);
        const b = document.createElement("button"); b.type = "button"; b.className = "set-hit";
        const path = [tabName(o.t), o.s ? subName(o.s) : ""].filter(Boolean).join(" › ");
        const label = document.createElement("b"); label.textContent = o.tx.length > 90 ? o.tx.slice(0, 90) + " …" : o.tx;
        const small = document.createElement("small"); small.textContent = path;
        b.append(label, small);
        b.addEventListener("click", () => {
          const tb = document.querySelector(`#setTabs [data-settab="${o.t}"]`); if (tb) tb.click();
          setTimeout(() => {
            if (o.s) { const sb = document.querySelector(`#subTabs [data-sub="${o.s}"]`); if (sb) sb.click(); }
            setTimeout(() => {
              let p = o.n; while (p && p !== document.body) { if (p.hidden) p.hidden = false; p = p.parentElement; }
              const sc = o.n.closest("#codeForm") || o.n.closest(".login-card");
              try { o.n.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { if (sc) sc.scrollTop = o.n.offsetTop - 80; }
              o.n.classList.add("set-flash"); setTimeout(() => o.n.classList.remove("set-flash"), 2200);
            }, 120);
          }, 80);
          res.hidden = true;
        });
        res.append(b);
      });
      res.hidden = false;
    }
    inp.addEventListener("input", run);
  }
  function init() {
    buildSearch();
    bind();
    const cm = $("codeModal"); if (cm) new MutationObserver(() => { if (!cm.hidden) setTimeout(bind, 40); }).observe(cm, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
