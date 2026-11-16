/* v187: Symbol (Icon) für den Home-Bildschirm wählen oder eigenes hochladen */
(function () {
  const N = 10;
  const NAMES = ["Note Gold", "Abspielen", "Mikrofon", "Wellen", "Note Orange", "Herz", "Schallplatte", "Kopfhörer", "Stern", "Buch"];
  const g = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
  const s = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* egal */ } };
  const src = () => {
    const c = g("appIcon");
    if (c === "custom" && g("appIconData")) return g("appIconData");
    const n = parseInt(c, 10);
    return n >= 1 && n <= N ? "icons/icon-" + String(n).padStart(2, "0") + ".png" : "";
  };
  function apply() {
    const u = src(); if (!u) return;
    let a = document.querySelector('link[rel="apple-touch-icon"]');
    if (!a) { a = document.createElement("link"); a.rel = "apple-touch-icon"; document.head.append(a); }
    a.removeAttribute("sizes"); a.href = u;
    const i = document.querySelector('link[rel="icon"]'); if (i) { i.type = "image/png"; i.href = u; }
  }
  function resize(file) {
    return new Promise((ok, no) => {
      const r = new FileReader();
      r.onerror = () => no(new Error("Datei nicht lesbar"));
      r.onload = () => {
        const im = new Image();
        im.onerror = () => no(new Error("Kein Bild"));
        im.onload = () => {
          const c = document.createElement("canvas"); c.width = c.height = 180;
          const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, 180, 180);
          const m = Math.min(im.width, im.height), sx = (im.width - m) / 2, sy = (im.height - m) / 2;
          x.drawImage(im, sx, sy, m, m, 0, 0, 180, 180);
          ok(c.toDataURL("image/png"));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }
  function build() {
    const b = document.createElement("div"); b.className = "autoplay-box v128-box icon-box";
    const t = document.createElement("p"); t.className = "ap-title"; t.textContent = "Symbol für den Home-Bildschirm"; b.append(t);
    const d = document.createElement("p"); d.className = "set-hint";
    d.textContent = "Wähle ein Symbol oder lade ein eigenes Bild hoch (wird quadratisch zugeschnitten). Danach das alte Symbol vom Home-Bildschirm entfernen und die Seite im Teilen-Menü erneut „Zum Home-Bildschirm“ hinzufügen.";
    b.append(d);
    const grid = document.createElement("div"); grid.className = "icon-grid"; b.append(grid);
    const paint = () => grid.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.ic === (g("appIcon") || "0"))));
    const add = (key, url, name) => {
      const x = document.createElement("button"); x.type = "button"; x.className = "icon-pick"; x.dataset.ic = key; x.title = name;
      const im = document.createElement("img"); im.src = url; im.alt = name; x.append(im);
      x.onclick = () => { s("appIcon", key); apply(); paint(); };
      grid.append(x); return x;
    };
    const def = add("0", "tesla-icon.png", "Standard (Tesla)");
    def.onclick = () => { s("appIcon", ""); s("appIconData", ""); location.reload(); };
    for (let i = 1; i <= N; i++) add(String(i), "icons/icon-" + String(i).padStart(2, "0") + ".png", NAMES[i - 1]);
    if (g("appIconData")) add("custom", g("appIconData"), "Eigenes Symbol");
    const row = document.createElement("div"); row.className = "icon-row";
    const up = document.createElement("button"); up.type = "button"; up.className = "chip"; up.textContent = "Eigenes Bild hochladen";
    const f = document.createElement("input"); f.type = "file"; f.accept = "image/*"; f.hidden = true;
    up.onclick = () => f.click();
    f.onchange = async () => {
      if (!f.files[0]) return;
      try { const u = await resize(f.files[0]); s("appIconData", u); s("appIcon", "custom"); apply(); b.replaceWith(build()); }
      catch (e) { alert("Bild konnte nicht verwendet werden: " + e.message); }
    };
    row.append(up, f); b.append(row);
    paint(); return b;
  }
  function mount() {
    const host = document.getElementById("tp_sonst");
    if (!host) return false;
    if (!host.querySelector(".icon-box")) host.append(build());
    return true;
  }
  apply();
  window.addEventListener("load", () => { let n = 0; const iv = setInterval(() => { if (mount() || ++n > 40) clearInterval(iv); }, 250); });
  window.ICONS = { apply };
})();
