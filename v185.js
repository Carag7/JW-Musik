/* v185: Listen/Tabellen in den Einstellungen und Dialogen lassen sich auf den ganzen Bildschirm vergrößern */
(function () {
  "use strict";
  const seen = new WeakSet();
  const SEL = ".dlg-table-wrap, .zt-list";
  function enter(node, btn) {
    node.classList.add("fs-full");
    const x = document.createElement("button");
    x.type = "button"; x.className = "fs-close"; x.textContent = "✕ Verkleinern";
    x.onclick = () => leave(node);
    node.append(x); node.__fsx = x; btn.textContent = "⛶ Ganzer Bildschirm";
    document.documentElement.classList.add("fs-open");
  }
  function leave(node) {
    node.classList.remove("fs-full");
    if (node.__fsx) { node.__fsx.remove(); node.__fsx = null; }
    if (!document.querySelector(".fs-full")) document.documentElement.classList.remove("fs-open");
  }
  function enhance(node) {
    if (seen.has(node) || !node.parentNode) return;
    seen.add(node);
    const bar = document.createElement("div"); bar.className = "fs-bar";
    const b = document.createElement("button"); b.type = "button"; b.className = "chip fs-btn"; b.textContent = "⛶ Ganzer Bildschirm";
    b.title = "Liste auf den ganzen Bildschirm vergrößern";
    b.onclick = () => (node.classList.contains("fs-full") ? leave(node) : enter(node, b));
    bar.append(b); node.before(bar);
  }
  function scan() {
    document.querySelectorAll(SEL).forEach(enhance);
    document.querySelectorAll("#codeModal div, #codeModal ul, #codeModal table, .dlg-card div").forEach((n) => {
      if (seen.has(n) || n.classList.contains("fs-bar") || n.closest(".fs-full")) return;
      if (n.scrollWidth > n.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(n).overflowX) && n.clientWidth > 120) enhance(n);
    });
  }
  setInterval(scan, 900);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const f = document.querySelector(".fs-full"); if (f) { leave(f); e.stopPropagation(); } } }, true);
})();
