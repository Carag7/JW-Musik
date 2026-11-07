/* Kleiner QR-Code-Generator (Byte-Modus, Fehlerkorrektur L, Version 1–40) – ohne Fremddienst.
   window.makeQrSvg(text) -> SVG-Text oder null, wenn der Text zu lang ist. */
(function () {
  "use strict";
  const ECC = [7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30];
  const BLK = [1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25];
  const rawModules = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const a = Math.floor(v / 7) + 2; r -= (25 * a - 10) * a - 55; if (v >= 7) r -= 36; } return r; };
  const dataCw = (v) => Math.floor(rawModules(v) / 8) - ECC[v - 1] * BLK[v - 1];
  /* Reed-Solomon */
  const EXP = new Array(512), LOG = new Array(256);
  (() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  function rsDiv(deg) { let r = [1]; for (let i = 0; i < deg; i++) { const n = new Array(r.length + 1).fill(0); r.forEach((c, j) => { n[j] ^= c; n[j + 1] ^= mul(c, EXP[i]); }); r = n; } return r; }
  function rsRem(data, gen) { const res = new Array(gen.length - 1).fill(0); data.forEach((b) => { const f = b ^ res.shift(); res.push(0); gen.slice(1).forEach((c, i) => { res[i] ^= mul(c, f); }); }); return res; }
  function make(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 0;
    for (let v = 1; v <= 40; v++) { const cc = v < 10 ? 8 : 16; if (4 + cc + bytes.length * 8 <= dataCw(v) * 8) { ver = v; break; } }
    if (!ver) return null;
    const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
    const cap = dataCw(ver) * 8; put(0, Math.min(4, cap - bits.length)); while (bits.length % 8) bits.push(0);
    for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) put(p, 8);
    const cw = []; for (let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(""), 2));
    /* Blöcke + ECC */
    const nb = BLK[ver - 1], el = ECC[ver - 1], raw = Math.floor(rawModules(ver) / 8), ns = nb - (raw % nb), sl = Math.floor(raw / nb);
    const gen = rsDiv(el), blocks = []; let k = 0;
    for (let i = 0; i < nb; i++) { const dl = sl - el + (i < ns ? 0 : 1); const d = cw.slice(k, k + dl); k += dl; blocks.push({ d, e: rsRem(d, gen) }); }
    const out = []; for (let i = 0; i < sl - el + 1; i++) blocks.forEach((b) => { if (i < b.d.length) out.push(b.d[i]); });
    for (let i = 0; i < el; i++) blocks.forEach((b) => out.push(b.e[i]));
    /* Matrix */
    const size = ver * 4 + 17, M = Array.from({ length: size }, () => new Array(size).fill(false)), F = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, v) => { M[y][x] = v; F[y][x] = true; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= size || y >= size) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); set(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (ver > 1) { const n = Math.floor(ver / 7) + 2, st = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2, pos = [6]; for (let p = size - 7; pos.length < n; p -= st) pos.splice(1, 0, p);
      pos.forEach((cy, i) => pos.forEach((cx, j) => { if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); })); }
    const fmt = (mask) => { let d = (1 << 3 | mask) << 10, r = d; for (let i = 0; i < 5; i++) if ((r >>> (14 - i)) & 1) r ^= 0x537 << (4 - i); const bitsF = (((1 << 3 | mask) << 10) | (r & 0x3ff)) ^ 0x5412;
      const b = (i) => ((bitsF >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, b(i)); set(8, 7, b(6)); set(8, 8, b(7)); set(7, 8, b(8)); for (let i = 9; i < 15; i++) set(14 - i, 8, b(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, b(i)); for (let i = 8; i < 15; i++) set(8, size - 15 + i, b(i)); set(8, size - 8, true); };
    fmt(0);
    if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const vb = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const bit = ((vb >>> i) & 1) === 1, a = size - 11 + (i % 3), b2 = Math.floor(i / 3); set(a, b2, bit); set(b2, a, bit); } }
    /* Daten platzieren */
    const dbits = []; out.forEach((c) => { for (let i = 7; i >= 0; i--) dbits.push((c >>> i) & 1); });
    let bi = 0; for (let right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v; if (!F[y][x] && bi < dbits.length) { M[y][x] = dbits[bi++] === 1; } } }
    const masks = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
    const applyMask = (m) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && masks[m](x, y)) M[y][x] = !M[y][x]; };
    const penalty = () => { let p = 0;
      for (let pass = 0; pass < 2; pass++) for (let a = 0; a < size; a++) { let run = 1; for (let b = 1; b < size; b++) { const c = pass ? M[b][a] : M[a][b], pr = pass ? M[b - 1][a] : M[a][b - 1]; if (c === pr) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) if (M[y][x] === M[y][x + 1] && M[y][x] === M[y + 1][x] && M[y][x] === M[y + 1][x + 1]) p += 3;
      const pat = (get) => { for (let a = 0; a < size; a++) for (let b = 0; b <= size - 11; b++) { const s = []; for (let i = 0; i < 11; i++) s.push(get(a, b + i) ? 1 : 0); const t = s.join(""); if (t === "10111010000" || t === "00001011101") p += 40; } };
      pat((a, b) => M[a][b]); pat((a, b) => M[b][a]);
      let dark = 0; M.forEach((r) => r.forEach((v) => { if (v) dark++; })); p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10; return p; };
    let best = 0, bp = Infinity;
    for (let m = 0; m < 8; m++) { applyMask(m); fmt(m); const pn = penalty(); if (pn < bp) { bp = pn; best = m; } applyMask(m); }
    applyMask(best); fmt(best);
    return M;
  }
  window.makeQrSvg = function (text) {
    let M; try { M = make(String(text)); } catch { return null; } if (!M) return null;
    const n = M.length, q = 4; let d = "";
    M.forEach((r, y) => r.forEach((v, x) => { if (v) d += `M${x + q} ${y + q}h1v1h-1z`; }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  };
})();
