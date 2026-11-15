/* v184: „Zufall“ ist ein echter Ein/Aus-Schalter; die Wiedergabe-Reihenfolge wird über allen drei Listen deutlich angezeigt */
(function () {
  "use strict";
  const btn = document.getElementById("shuffleBtn"), list = document.getElementById("songList");
  if (!btn || !list) return;
  const info = document.createElement("div");
  info.id = "orderInfo"; info.className = "order-info"; info.setAttribute("aria-live", "polite");
  list.before(info);
  /* Zweiter Druck auf „Zufall“ schaltet aus (bisher blieb es für immer an) */
  btn.addEventListener("click", (e) => {
    if (state.shuffle && state.mode !== "ludwt") {
      e.stopImmediatePropagation(); e.preventDefault();
      state.shuffle = false; state.shufPlayed = new Set();
      paint();
    }
  }, true);
  function paint() {
    const ludwt = state.mode === "ludwt";
    const shuf = !!state.shuffle && !ludwt;
    btn.setAttribute("aria-pressed", String(shuf));
    const t = shuf ? "🔀 Zufall: an" : "Zufall: aus";
    if (btn.textContent !== t) btn.textContent = t;
    btn.title = shuf ? "Zufällige Reihenfolge – tippen: wieder der Reihe nach" : "Tippen: Lieder zufällig abspielen";
    const m = shuf ? "🔀 Zufällige Reihenfolge – die Lieder werden gemischt abgespielt" : "➡ Der Reihe nach – in der Reihenfolge der Liste";
    if (info.textContent !== m) info.textContent = m;
    info.classList.toggle("is-shuffle", shuf);
  }
  setInterval(paint, 400); paint();
})();
