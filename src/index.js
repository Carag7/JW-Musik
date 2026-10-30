/* Cloudflare Worker "musik"
 *
 * Aufgaben:
 *  - /api/refresh        startet den GitHub-Workflow (Button "Jetzt aktualisieren")
 *  - /api/users          Liste aller Benutzer (Name, Passwort ja/nein) – nur mit WRITE_KEY
 *  - /api/covers         Verzeichnis der neuen Cover (R2-Ordner covers_edel/, Dateien 003.jpg usw.)
 *  - /api/covers-admin   Cover-Dateien zuordnen und umbenennen (nur mit WRITE_KEY)
 *  - /api/media-index    Verzeichnis aller Dateien in R2 (Karaoke-MP3, Meeting-MP3, Videos, LRC)
 *  - /api/r2-plan, /api/r2-run   einmaliges Aufräumen von R2 (nur mit WRITE_KEY)
 *  - /sync/<name>        Favoriten-Speicher und Liedtext-Zeiten (lrc-003, lrcm-003)
 *  - /media/<schlüssel>  Datei aus R2 (karaoke/..., meeting/...) mit Range-Unterstützung
 *  - /<datei>.mp3        Karaoke-MP3 (alte Adressen funktionieren weiter)
 *  - alles andere        statische Dateien (Seite)
 *
 * R2-Struktur (Ziel, siehe Aufräumen):
 *   karaoke/audio/sjjc_E_003.mp3     gesungene Karaoke-MP3
 *   karaoke/lrc/003.lrc              Liedtext-Zeiten dazu
 *   meeting/audio/....mp3            instrumentale MP3 (Zusammenkünfte)
 *   meeting/lrc/003.lrc              Liedtext-Zeiten dazu
 *   meeting/video/....mp4            Videos
 *   favoriten/<name>.json            Favoriten-Speicher
 *
 * Secrets in Cloudflare: GITHUB_TOKEN (Pflicht für den Aktualisieren-Button), REFRESH_PIN (optional),
 * WRITE_KEY (optional; schützt das Speichern von Liedtext-Zeiten und ist für das Aufräumen nötig).
 */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,PUT,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,x-write-key,x-user-hash,x-store-hash,x-store-set"
};

/* Protokoll (Cloudflare-Logs): standardmäßig aus. Über die Einstellungen (nur mit WRITE_KEY) für einige Stunden/Tage einschaltbar;
   danach schaltet es sich selbst wieder ab. Gespeichert in R2 unter _sys/logmode.json ({"until": ms}). Nur dann schreibt der Worker Zeilen ins Protokoll. */
let logCache = { at: 0, until: 0 };
async function logUntil(env) {
  const now = Date.now();
  if (now - logCache.at < 60000) return logCache.until;
  let until = 0;
  try { const o = await env.MUSIK.get("_sys/logmode.json"); if (o) until = Number((await o.json()).until) || 0; } catch { /* aus */ }
  logCache = { at: now, until };
  return until;
}
async function handleLogMode(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  const keyOk = !!env.WRITE_KEY && request.headers.get("x-write-key") === env.WRITE_KEY;
  if (request.method === "GET") {
    logCache.at = 0;
    const until = await logUntil(env);
    return json({ ok: true, until: until > Date.now() ? until : 0, now: Date.now() }, CORS);
  }
  if (request.method === "PUT" || request.method === "POST") {
    if (!env.WRITE_KEY) return json({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY." }, CORS, 403);
    if (!keyOk) return json({ ok: false, fehler: "Schlüssel falsch." }, CORS, 401);
    let body = {}; try { body = await request.json(); } catch { /* leer */ }
    const hours = Math.max(0, Math.min(24 * 14, Number(body.hours) || 0));
    const until = hours > 0 ? Date.now() + hours * 3600000 : 0;
    await env.MUSIK.put("_sys/logmode.json", JSON.stringify({ until }), { httpMetadata: { contentType: "application/json" } });
    logCache = { at: Date.now(), until };
    return json({ ok: true, until, now: Date.now() }, CORS);
  }
  return new Response("method not allowed", { status: 405, headers: CORS });
}

const app = {
  async fetch(request, env) {
    const path0 = new URL(request.url).pathname;
    if (path0 === "/api/logmode") return handleLogMode(request, env);
    const res = await app.handle(request, env);
    try {
      if (path0.startsWith("/api/") || path0.startsWith("/user/") || path0.startsWith("/sync/") || path0.startsWith("/remote/") || path0.startsWith("/media/")) {
        if ((await logUntil(env)) > Date.now()) console.log(JSON.stringify({ m: request.method, p: path0.replace(/^(\/(?:user|sync|remote)\/)[^/]+/, "$1…"), s: res.status }));
      }
    } catch { /* Protokoll darf nie stören */ }
    return res;
  },
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS" && (path.startsWith("/api/") || path.startsWith("/sync/") || path.startsWith("/remote/") || path.startsWith("/media/"))) {
      return new Response(null, { headers: CORS });
    }
    if (path === "/api/covers") return handleCovers(env);
    if (path === "/api/covers-admin") return handleCoversAdmin(request, env, url);
    if (path === "/api/refresh") return handleRefresh(request, env);
    if (path === "/api/users") return handleUsers(request, env);
    if (path === "/api/media-index") return handleIndex(request, env, url);
    if (path === "/api/r2-prune") return handlePrune(request, env, url);
    if (path === "/api/r2-fetch") return handleFetchToR2(request, env, url);
    if (path === "/api/r2-plan" || path === "/api/r2-run") return handleMigrate(request, env, url, path);
    if (path.startsWith("/sync/")) return handleSync(request, env, path);
    if (path.startsWith("/user/")) return handleUser(request, env, path);
    if (path.startsWith("/remote/")) return handleRemote(request, env, path);

    if (path.startsWith("/media/")) {
      const key = decodeURIComponent(path.slice(7));
      const isCover = /^covers_edel\/[^/]+\.(jpe?g|png|webp|gif)$/i.test(key);
      if (/^(favoriten|sync)\//.test(key) || key.includes("..") || key.split("/").some((p) => p.startsWith("_")) || (!isCover && !/\.(mp3|m4a|aac|wav|mp4|m4v|webm|mov|lrc)$/i.test(key))) return new Response("Not Found", { status: 404, headers: CORS });
      return serveR2(env, [key], request);
    }

    if (path.endsWith(".mp3")) {
      const filename = decodeURIComponent(path.split("/").pop());
      const res = await serveR2(env, [`karaoke/audio/${filename}`, `musik/${filename}`, filename], request);
      if (res.status !== 404) return res;
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
  }
};
export default { fetch: (request, env, ctx) => app.fetch(request, env, ctx) };

/* ---------- Dateien aus R2 ausliefern ---------- */

const HIGH_MIN = 500;

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", wav: "audio/wav", mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime", lrc: "text/plain; charset=utf-8" };

async function serveR2(env, keys, request) {
  let key = null, head = null;
  for (const k of keys) {
    head = await env.MUSIK.head(k);
    if (head) { key = k; break; }
  }
  if (!head) return new Response("Not Found", { status: 404, headers: CORS });

  const h = new Headers();
  head.writeHttpMetadata(h);
  const ext = key.split(".").pop().toLowerCase();
  if (!h.get("content-type") || h.get("content-type") === "application/octet-stream") h.set("content-type", MIME[ext] || "application/octet-stream");
  h.set("etag", head.httpEtag);
  h.set("accept-ranges", "bytes");
  h.set("cache-control", "public, max-age=86400");
  h.set("access-control-allow-origin", "*");

  const range = request.headers.get("range");
  if (range) {
    const parsed = parseRange(range);
    let start = 0, end = head.size - 1;
    if (parsed) {
      if (parsed.offset !== undefined) start = parsed.offset;
      if (parsed.length !== undefined) end = start + parsed.length - 1;
      if (parsed.suffix !== undefined) { start = head.size - parsed.suffix; end = head.size - 1; }
    }
    end = Math.min(end, head.size - 1);
    const obj = await env.MUSIK.get(key, { range: { offset: start, length: end - start + 1 } });
    if (!obj) return new Response("Not Found", { status: 404, headers: CORS });
    h.set("content-range", `bytes ${start}-${end}/${head.size}`);
    h.set("content-length", String(end - start + 1));
    return new Response(obj.body, { status: 206, headers: h });
  }
  if (request.method === "HEAD") {
    h.set("content-length", String(head.size));
    return new Response(null, { headers: h });
  }
  const obj = await env.MUSIK.get(key);
  h.set("content-length", String(head.size));
  return new Response(obj.body, { headers: h });
}

function parseRange(r) {
  const m = r.match(/bytes=(\d*)-(\d*)/);
  if (!m) return undefined;
  const s = m[1] ? +m[1] : null, e = m[2] ? +m[2] : null;
  if (s === null && e !== null) return { suffix: e };
  if (s !== null && e === null) return { offset: s };
  if (s !== null && e !== null) return { offset: s, length: e - s + 1 };
  return undefined;
}

/* ---------- Verzeichnis der Dateien (media-index) ---------- */

const AUDIO_EXT = ["mp3", "m4a", "aac", "wav"];
const VIDEO_EXT = ["mp4", "m4v", "webm", "mov"];
const MEETING_DIR = /^(meeting|meetings|instrumental|instrumentals|zusammenkunft|zusammenkuenfte)$/i;

/* Liednummer aus dem Dateinamen: erste 1-3-stellige Zahl (Auflösungen wie 720P werden ignoriert) */
export function numberFromName(name) {
  const base = name.replace(/\.[^.]+$/, "").replace(/\d{3,4}[pP](?![a-zA-Z0-9])/g, "");
  const m = base.match(/(?<!\d)(\d{1,3})(?!\d)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 ? n : null;
}

/* Art einer Datei: karaoke-audio, karaoke-lrc, meeting-audio, meeting-lrc, meeting-video oder null */
export function classify(key) {
  const parts = key.split("/");
  const name = parts[parts.length - 1];
  if (!name || name.startsWith("_") || key.endsWith("/")) return null;
  const ext = (name.split(".").pop() || "").toLowerCase();
  const top = parts[0] || "";
  if (top === "favoriten") return null;
  if (top === "sync") {
    if (ext === "lrc" && /^lrc-/.test(name)) return { type: "karaoke-lrc", n: numberFromName(name.slice(4)) };
    return null;
  }
  const meeting = MEETING_DIR.test(top) || top === "meeting";
  if (top === "meeting" && parts[1] === "sung" && ext === "lrc") return { type: "meeting-sunglrc", n: numberFromName(name) };
  if (top === "meeting" && parts[1] === "sung" && AUDIO_EXT.includes(ext)) return { type: "meeting-sung", n: numberFromName(name) };
  if (VIDEO_EXT.includes(ext)) return { type: "meeting-video", n: numberFromName(name) };
  if (AUDIO_EXT.includes(ext)) return { type: meeting ? "meeting-audio" : "karaoke-audio", n: numberFromName(name) };
  if (ext === "lrc") return { type: meeting ? "meeting-lrc" : "karaoke-lrc", n: numberFromName(name) };
  return null;
}

async function listAll(env) {
  const out = [];
  let cursor;
  do {
    const r = await env.MUSIK.list({ cursor, limit: 1000 });
    out.push(...r.objects);
    cursor = r.truncated ? r.cursor : undefined;
  } while (cursor);
  return out;
}

let indexCache = { t: 0, data: null };

async function buildIndex(env) {
  const objects = await listAll(env);
  const idx = {
    karaoke: { audio: {}, lrc: {} },
    meeting: { audio: {}, video: {}, lrc: {}, sung: {}, sungLrc: {} }
  };
  const score = {};
  const put = (bucket, name, n, key) => {
    const id = String(n);
    const s = /\/(audio|video|lrc)\//.test(key) ? 2 : 1;   // geordnete Ordner haben Vorrang
    const tag = `${name}:${id}`;
    if (score[tag] === undefined || s > score[tag]) { score[tag] = s; bucket[id] = key; }
  };
  const speicher = {};
  let gesamtBytes = 0;
  for (const o of objects) {
    const p = o.key.split("/");
    const ordner = p.length >= 3 ? `${p[0]}/${p[1]}` : (p.length === 2 ? p[0] : "(Hauptordner)");
    const e = (speicher[ordner] = speicher[ordner] || { bytes: 0, dateien: 0 });
    e.bytes += o.size || 0; e.dateien += 1; gesamtBytes += o.size || 0;
  }
  const hoch = { dateien: 0, bytes: 0 };   // Nummern ab 500 (Gebärdensprache/Blindenschrift): nicht anzeigen
  for (const o of objects) {
    const c = classify(o.key);
    if (!c || !c.n) continue;
    if (c.n >= HIGH_MIN && o.key.split("/")[0] !== "sync") { hoch.dateien++; hoch.bytes += o.size || 0; continue; }
    if (c.type === "karaoke-audio") put(idx.karaoke.audio, "ka", c.n, o.key);
    else if (c.type === "karaoke-lrc") put(idx.karaoke.lrc, "kl", c.n, o.key);
    else if (c.type === "meeting-audio") put(idx.meeting.audio, "ma", c.n, o.key);
    else if (c.type === "meeting-sung") put(idx.meeting.sung, "ms", c.n, o.key);
    else if (c.type === "meeting-video") put(idx.meeting.video, "mv", c.n, o.key);
    else if (c.type === "meeting-lrc") put(idx.meeting.lrc, "ml", c.n, o.key);
    else if (c.type === "meeting-sunglrc") put(idx.meeting.sungLrc, "sl", c.n, o.key);
  }
  return {
    ok: true,
    generiert: new Date().toISOString(),
    speicher: { gesamt: gesamtBytes, ordner: speicher },
    hoch,
    anzahl: {
      karaoke_audio: Object.keys(idx.karaoke.audio).length,
      meeting_audio: Object.keys(idx.meeting.audio).length,
      meeting_video: Object.keys(idx.meeting.video).length,
      meeting_sung: Object.keys(idx.meeting.sung).length,
      meeting_lrc: Object.keys(idx.meeting.lrc).length,
      meeting_sung_lrc: Object.keys(idx.meeting.sungLrc).length
    },
    ...idx
  };
}

async function handleIndex(request, env, url) {
  try {
    const fresh = url.searchParams.get("refresh") === "1";
    if (fresh || !indexCache.data || Date.now() - indexCache.t > 120000) {
      indexCache = { t: Date.now(), data: await buildIndex(env) };
    }
    return new Response(JSON.stringify(indexCache.data), {
      headers: { ...CORS, "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" }
    });
  } catch (err) {
    return json({ ok: false, fehler: String(err && err.message || err) }, CORS, 500);
  }
}

/* ---------- Veröffentlichte Dateien von jw.org nach R2 laden ---------- */

const FETCH_TARGETS = {
  karaoke: (n, name) => `karaoke/audio/${name || `sjjc_E_${String(n).padStart(3, "0")}.mp3`}`,
  instrumental: (n, name) => `meeting/audio/${name || `sjji_E_${String(n).padStart(3, "0")}.mp3`}`,
  video: (n, name) => `meeting/video/${name || `sjjm_E_${String(n).padStart(3, "0")}_r720P.mp4`}`,
  sung: (n, name) => `meeting/sung/${name || `sjjm_E_${String(n).padStart(3, "0")}.mp3`}`
};
const ALLOWED_HOST = /^https:\/\/([a-z0-9-]+\.)*(jw-cdn\.org|jw\.org)\//i;

async function handleFetchToR2(request, env, url) {
  const reply = (obj, status = 200) => json(obj, CORS, status);
  if (request.method !== "POST") return reply({ ok: false, fehler: "Nur POST." }, 405);
  if (!env.WRITE_KEY) return reply({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY (Timecode-Passwort im Klartext)." }, 403);
  if (request.headers.get("x-write-key") !== env.WRITE_KEY) return reply({ ok: false, fehler: "Schlüssel falsch." }, 401);
  const body = await request.json().catch(() => ({}));
  const typ = String(body.typ || "");
  const n = parseInt(body.nummer, 10);
  if (!FETCH_TARGETS[typ] || !(n > 0 && n < 1000)) return reply({ ok: false, fehler: "Ungültige Anfrage." }, 400);
  // Adresse kommt NUR aus der eigenen verfuegbar.json (nicht vom Browser)
  let info = null;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL("/verfuegbar.json", url)));
    const data = await res.json();
    info = data && data.lieder && data.lieder[String(n)] && data.lieder[String(n)][typ];
  } catch { /* unten */ }
  if (!info || !info.url) return reply({ ok: false, fehler: "Diese Datei ist (noch) nicht als veröffentlicht gelistet." }, 404);
  if (!ALLOWED_HOST.test(info.url)) return reply({ ok: false, fehler: "Adresse nicht erlaubt." }, 400);
  const name = String(info.url).split("?")[0].split("/").pop();
  const key = FETCH_TARGETS[typ](n, /^[\w.\-]+$/.test(name) ? name : null);
  const existing = await env.MUSIK.head(key);
  if (existing && !body.force) return reply({ ok: true, schon: true, key, groesse: existing.size });
  const res = await fetch(info.url, { headers: { "user-agent": "Mozilla/5.0 (compatible; JW-Musik)" }, redirect: "follow" });
  if (!res.ok || !res.body) return reply({ ok: false, fehler: `jw.org antwortet mit ${res.status}.` }, 502);
  const len = Number(res.headers.get("content-length")) || 0;
  const ext = key.split(".").pop().toLowerCase();
  const httpMetadata = { contentType: MIME[ext] || "application/octet-stream" };
  let size = len;
  if (len > 0 && typeof FixedLengthStream !== "undefined") {
    const fls = new FixedLengthStream(len);
    res.body.pipeTo(fls.writable);
    await env.MUSIK.put(key, fls.readable, { httpMetadata });
  } else {
    const buf = await res.arrayBuffer();
    size = buf.byteLength;
    await env.MUSIK.put(key, buf, { httpMetadata });
  }
  indexCache = { t: 0, data: null };
  return reply({ ok: true, key, groesse: size });
}

/* ---------- Nummern ab 500 aus R2 löschen ---------- */

async function handlePrune(request, env, url) {
  const reply = (obj, status = 200) => json(obj, CORS, status);
  if (!env.WRITE_KEY) return reply({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY (Timecode-Passwort im Klartext)." }, 403);
  if (request.headers.get("x-write-key") !== env.WRITE_KEY) return reply({ ok: false, fehler: "Schlüssel falsch." }, 401);
  const objects = await listAll(env);
  const victims = objects.filter((o) => {
    if (["favoriten", "sync"].includes(o.key.split("/")[0])) return false;
    const c = classify(o.key);
    return c && c.n >= HIGH_MIN;
  });
  const bytes = victims.reduce((s, o) => s + (o.size || 0), 0);
  if (request.method !== "POST") return reply({ ok: true, anzahl: victims.length, bytes, beispiele: victims.slice(0, 8).map((o) => o.key) });
  const batch = victims.slice(0, 50).map((o) => o.key);
  if (batch.length) await env.MUSIK.delete(batch);
  indexCache = { t: 0, data: null };
  return reply({ ok: true, geloescht: batch.length, rest: victims.length - batch.length });
}

/* ---------- R2 aufräumen ---------- */

export function planMoves(objects) {
  const moves = [];
  const skipped = [];
  for (const o of objects) {
    const key = o.key;
    const parts = key.split("/");
    const name = parts[parts.length - 1];
    const top = parts[0];
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (!name) continue;
    let to = null;
    if (key === "sync/_index.json") to = "favoriten/_index.json";
    else if (top === "sync" && /^lrc-.+\.lrc$/.test(name)) to = `karaoke/lrc/${name.replace(/^lrc-/, "")}`;
    else if (top === "sync" && ext === "json") to = `favoriten/${name}`;
    else if (["karaoke", "favoriten"].includes(top)) to = null;
    else if (top === "meeting" && ["audio", "video", "lrc", "sung"].includes(parts[1]) && parts.length > 2) to = null;
    else if (VIDEO_EXT.includes(ext)) to = `meeting/video/${name}`;
    else if (AUDIO_EXT.includes(ext) && (MEETING_DIR.test(top) && parts.length > 1)) to = `meeting/audio/${name}`;
    else if (ext === "lrc" && (MEETING_DIR.test(top) && parts.length > 1)) to = `meeting/lrc/${name}`;
    else if (AUDIO_EXT.includes(ext) && !MEETING_DIR.test(top)) to = `karaoke/audio/${name}`;
    else if (ext === "lrc" && !MEETING_DIR.test(top)) to = `karaoke/lrc/${name}`;
    if (to && to !== key) moves.push({ from: key, to, size: o.size });
    else if (!to && !["karaoke", "favoriten", "meeting"].includes(top)) skipped.push(key);
  }
  return { moves, skipped };
}

async function handleMigrate(request, env, url, path) {
  if (!env.WRITE_KEY) return json({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY (Timecode-Passwort im Klartext)." }, CORS, 403);
  if (request.headers.get("x-write-key") !== env.WRITE_KEY) return json({ ok: false, fehler: "Schlüssel falsch." }, CORS, 401);
  const objects = await listAll(env);
  const { moves, skipped } = planMoves(objects);
  if (path === "/api/r2-plan") return json({ ok: true, anzahl: moves.length, verschieben: moves, unveraendert_gelassen: skipped }, CORS);
  if (request.method !== "POST") return json({ ok: false, fehler: "Nur POST." }, CORS, 405);

  const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit")) || 6));
  const done = [];
  const problems = [];
  for (const m of moves.slice(0, limit)) {
    try {
      const existing = await env.MUSIK.head(m.to);
      if (existing && existing.size === m.size) {
        await env.MUSIK.delete(m.from);
        done.push({ ...m, hinweis: "Ziel existierte schon, Original gelöscht" });
        continue;
      }
      if (existing) { problems.push({ ...m, fehler: "Ziel existiert mit anderer Größe, übersprungen" }); continue; }
      const obj = await env.MUSIK.get(m.from);
      if (!obj) { problems.push({ ...m, fehler: "Quelle nicht gefunden" }); continue; }
      await env.MUSIK.put(m.to, obj.body, { httpMetadata: obj.httpMetadata });
      const check = await env.MUSIK.head(m.to);
      if (!check || check.size !== m.size) { problems.push({ ...m, fehler: "Kopie hat falsche Größe, Original bleibt" }); continue; }
      await env.MUSIK.delete(m.from);
      done.push(m);
    } catch (err) {
      problems.push({ ...m, fehler: String(err && err.message || err) });
    }
  }
  indexCache = { t: 0, data: null };
  return json({ ok: true, erledigt: done, probleme: problems, verbleibend: moves.length - done.length }, CORS);
}

/* ---------- Sync (Favoriten) und Liedtext-Zeiten ---------- */

/* lrc-003 -> karaoke/lrc/003.lrc, lrcm-003 -> meeting/lrc/003.lrc, lrcs-003 -> meeting/sung/lrc/003.lrc, sonst favoriten/<name>.json (alte Orte werden mitgelesen) */
export function storeKeys(code) {
  const m = code.match(/^lrc([ms]?)-([a-z0-9]+)$/);
  if (m) {
    const n = m[2];
    if (m[1] === "s") return { write: `meeting/sung/lrc/${n}.lrc`, read: [`meeting/sung/lrc/${n}.lrc`], lrc: true };
    return m[1]
      ? { write: `meeting/lrc/${n}.lrc`, read: [`meeting/lrc/${n}.lrc`], lrc: true }
      : { write: `karaoke/lrc/${n}.lrc`, read: [`karaoke/lrc/${n}.lrc`, `sync/lrc-${n}.lrc`], lrc: true };
  }
  return { write: `favoriten/${code}.json`, read: [`favoriten/${code}.json`, `sync/${code}.json`], lrc: false };
}

/* Benutzer mit Voreinstellungen: /user/<name>. Passwort wird nie im Klartext gespeichert (nur der vom Browser gebildete Hash).
   GET: Header x-user-hash (leer, wenn der Benutzer kein Passwort hat). 404 = Benutzer existiert nicht.
   PUT: {hash?, presets?, links?} legt an oder ändert (bei bestehendem Passwort nur mit passendem x-user-hash).
   DELETE: nur mit x-write-key (Secret WRITE_KEY). /user/_tesla = gemeinsame Tesla-Voreinstellung: lesen frei, ändern nur mit WRITE_KEY.
   Eine Benutzerliste wird nie ausgegeben. */
async function handleUser(request, env, path) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  const name = path.slice(6).toLowerCase().replace(/[^a-z0-9äöüß._-]/g, "").slice(0, 40);
  if (name.length < 2) return new Response("bad name", { status: 400, headers: CORS });
  const tesla = name === "_tesla" || name === "_standard" || name === "_handy";
  if (!tesla && name.startsWith("_")) return new Response("bad name", { status: 400, headers: CORS });
  const key = `benutzer/${name}.json`;
  const sent = request.headers.get("x-user-hash") || "";
  const keyOk = !!env.WRITE_KEY && request.headers.get("x-write-key") === env.WRITE_KEY;
  const obj = await env.MUSIK.get(key);
  let rec = null;
  if (obj) { try { rec = await obj.json(); } catch { rec = null; } }
  if (request.method === "GET") {
    if (!rec) return tesla ? json({ ok: true, none: true, presets: {}, links: [], updated: "", keyOk }, CORS) : new Response("not found", { status: 404, headers: CORS });
    if (!tesla && rec.hash && rec.hash !== sent) return json({ ok: false, locked: true }, CORS, 401);
    return json({ ok: true, locked: !!rec.hash, presets: rec.presets || {}, links: tesla ? [] : (rec.links || []), updated: rec.updated || "", keyOk: keyOk, factory: rec.factory || null }, CORS);
  }
  if (request.method === "DELETE") {
    if (!env.WRITE_KEY) return json({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY." }, CORS, 403);
    if (!keyOk) return json({ ok: false, fehler: "Schlüssel falsch." }, CORS, 401);
    if (rec) await env.MUSIK.delete(key);
    return json({ ok: true, deleted: !!rec }, CORS);
  }
  if (request.method === "PUT" || request.method === "POST") {
    if (tesla) { if (!keyOk) return json({ ok: false, fehler: "Schlüssel falsch." }, CORS, 401); }
    else if (rec && rec.hash && rec.hash !== sent) return json({ ok: false, locked: true }, CORS, 401);
    const text = await request.text();
    if (text.length > 20000) return new Response("too large", { status: 413, headers: CORS });
    let body = {};
    try { body = JSON.parse(text); } catch { return new Response("bad json", { status: 400, headers: CORS }); }
    const cleanName = (n) => String(n || "").toLowerCase().replace(/[^a-z0-9äöüß._-]/g, "").slice(0, 40);
    const next = {
      hash: tesla ? "" : (typeof body.hash === "string" ? body.hash.slice(0, 128) : (rec ? rec.hash || "" : "")),
      presets: body.presets && typeof body.presets === "object" ? body.presets : (rec ? rec.presets : {}),
      links: Array.isArray(body.links) ? [...new Set(body.links.map(cleanName).filter((n) => n.length >= 2 && n !== name && !n.startsWith("_")))].slice(0, 30) : (rec ? rec.links || [] : []),
      updated: new Date().toISOString()
    };
    /* eigene Werkseinstellung (nur _tesla/_standard): Objekt = speichern, null = entfernen, sonst unverändert */
    if (tesla && body.factory && typeof body.factory === "object") next.factory = body.factory;
    else if (tesla && body.factory === null) { /* entfernt */ }
    else if (rec && rec.factory) next.factory = rec.factory;
    await env.MUSIK.put(key, JSON.stringify(next), { httpMetadata: { contentType: "application/json" } });
    return json({ ok: true, created: !rec }, CORS);
  }
  return new Response("method", { status: 405, headers: CORS });
}

/* Fernsteuerung: /remote/<code>/state (Player schreibt), /remote/<code>/cmd (Fernbedienung schreibt), /remote/inbox/<speicher> (Code für das zweite Gerät) */
/* Liste aller Benutzer (nur Namen, ob ein Passwort gesetzt ist, letzte Änderung) – nie die Passwörter. Nur mit Schreib-Schlüssel. */
async function handleUsers(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (!env.WRITE_KEY) return json({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY." }, CORS, 403);
  if (request.headers.get("x-write-key") !== env.WRITE_KEY) return json({ ok: false, fehler: "Schlüssel falsch." }, CORS, 401);
  const users = [];
  let cursor;
  do {
    const list = await env.MUSIK.list({ prefix: "benutzer/", cursor });
    for (const o of list.objects) {
      const name = o.key.slice(9).replace(/\.json$/, "");
      let rec = null;
      try { const obj = await env.MUSIK.get(o.key); rec = obj ? await obj.json() : null; } catch { rec = null; }
      users.push({ name, passwort: !!(rec && rec.hash), geaendert: (rec && rec.updated) || "", system: name.startsWith("_"), verknuepft: rec && Array.isArray(rec.links) ? rec.links.length : 0 });
    }
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor && users.length < 2000);
  users.sort((a, b) => a.system - b.system || a.name.localeCompare(b.name));
  return json({ ok: true, anzahl: users.length, benutzer: users }, CORS);
}

async function handleRemote(request, env, path) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  const parts = path.split("/").filter(Boolean);   // ["remote", a, b?]
  let key = "";
  if (parts[1] === "inbox" && /^[a-z0-9-]{2,40}$/.test(parts[2] || "")) key = `remote/inbox-${parts[2]}.json`;
  else if (/^[a-z0-9]{4,12}$/.test(parts[1] || "") && (parts[2] === "state" || parts[2] === "cmd")) key = `remote/${parts[1]}-${parts[2]}.json`;
  else return new Response("Not Found", { status: 404, headers: CORS });
  const hdr = { ...CORS, "cache-control": "no-store" };
  if (request.method === "GET") {
    const obj = await env.MUSIK.get(key);
    if (!obj) return new Response("{}", { status: 404, headers: { ...hdr, "content-type": "application/json" } });
    return new Response(obj.body, { headers: { ...hdr, "content-type": "application/json" } });
  }
  if (request.method === "PUT" || request.method === "POST") {
    const text = await request.text();
    if (text.length > 120000) return new Response("too large", { status: 413, headers: hdr });
    try { JSON.parse(text); } catch { return new Response("bad json", { status: 400, headers: hdr }); }
    await env.MUSIK.put(key, text, { httpMetadata: { contentType: "application/json" } });
    return new Response('{"ok":true}', { headers: { ...hdr, "content-type": "application/json" } });
  }
  if (request.method === "DELETE") {
    await env.MUSIK.delete(key);
    return new Response('{"ok":true}', { headers: { ...hdr, "content-type": "application/json" } });
  }
  return new Response("method", { status: 405, headers: hdr });
}

async function handleSync(request, env, path) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (path === "/sync/" || path === "/sync") {
    const meta = await readMeta(env);
    // Namen der Speicher werden nicht veröffentlicht (sie sind das "Passwort" des Speichers)
    return json({ count: meta.codes.length, last: meta.last || null }, CORS);
  }

  const code = path.slice(6).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!code || code.length < 3) return new Response("bad code", { status: 400, headers: CORS });
  const keys = storeKeys(code);

  /* Freiwilliges Passwort für Favoriten-Speicher (nur der Hash wird gespeichert, nie das Passwort) */
  const lockKey = `favoriten/${code}.pw`;
  let lock = "";
  if (!keys.lrc) {
    const lo = await env.MUSIK.get(lockKey);
    if (lo) lock = (await lo.text()).trim();
    if (lock && (request.headers.get("x-store-hash") || "") !== lock) return json({ ok: false, locked: true }, CORS, 401);
    if ((request.method === "PUT" || request.method === "POST") && new URL(request.url).searchParams.get("pw")) {
      const next = (request.headers.get("x-store-set") || "").slice(0, 128);
      if (next === "-" || !next) await env.MUSIK.delete(lockKey);
      else await env.MUSIK.put(lockKey, next, { httpMetadata: { contentType: "text/plain" } });
      return json({ ok: true, locked: !!next && next !== "-" }, CORS);
    }
  }

  if (request.method === "PUT" || request.method === "POST") {
    // Liedtext-Zeiten nur mit Schreib-Schlüssel, wenn in Cloudflare das Secret WRITE_KEY gesetzt ist
    if (keys.lrc && env.WRITE_KEY && request.headers.get("x-write-key") !== env.WRITE_KEY) {
      return new Response("unauthorized", { status: 401, headers: CORS });
    }
    const body = await request.text();
    if (body.length > 512 * 1024) return new Response("too large", { status: 413, headers: CORS });
    await env.MUSIK.put(keys.write, body, { httpMetadata: { contentType: keys.lrc ? "text/plain; charset=utf-8" : "application/json" } });
    if (keys.lrc) {
      indexCache = { t: 0, data: null };
      return json({ ok: true, code }, CORS);
    }
    const meta = await readMeta(env);
    const now = new Date().toISOString();
    meta.codes = meta.codes.filter((item) => item.code !== code);
    meta.codes.push({ code, created: now });
    meta.last = now;
    await env.MUSIK.put("favoriten/_index.json", JSON.stringify(meta), { httpMetadata: { contentType: "application/json" } });
    return json({ ok: true, code, created: now }, CORS);
  }

  if (request.method === "GET") {
    for (const k of keys.read) {
      const obj = await env.MUSIK.get(k);
      if (obj) {
        return new Response(obj.body, { headers: { ...CORS, "content-type": obj.httpMetadata?.contentType || (keys.lrc ? "text/plain; charset=utf-8" : "application/json"), "cache-control": "no-store" } });
      }
    }
    return new Response("not found", { status: 404, headers: CORS });
  }

  return new Response("method", { status: 405, headers: CORS });
}

async function readMeta(env) {
  for (const key of ["favoriten/_index.json", "sync/_index.json"]) {
    try {
      const obj = await env.MUSIK.get(key);
      if (!obj) continue;
      const data = await obj.json();
      return { codes: Array.isArray(data.codes) ? data.codes : [], last: data.last || null };
    } catch { /* nächster Ort */ }
  }
  return { codes: [], last: null };
}

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

/* ---------- GitHub-Workflow starten ---------- */

async function handleRefresh(request, env) {
  const reply = (obj, status = 200) => json(obj, CORS, status);
  if (request.method !== "POST") return reply({ ok: false, fehler: "Nur POST erlaubt." }, 405);
  const tokenName = Object.keys(env).find((k) => k.trim().toUpperCase() === "GITHUB_TOKEN" && env[k]);
  if (!tokenName) {
    const namen = Object.keys(env).filter((k) => typeof env[k] !== "object").join(", ") || "keine";
    return reply({ ok: false, fehler: `Secret GITHUB_TOKEN fehlt in diesem Worker. Dieser Worker sieht nur diese Variablen: ${namen}.` }, 500);
  }
  const GH_TOKEN = env[tokenName];
  const reqBody = await request.json().catch(() => ({}));
  if (env.REFRESH_PIN) {
    const body = reqBody;
    if (String(body.pin || "") !== String(env.REFRESH_PIN)) {
      return reply({ ok: false, pin_erforderlich: true, fehler: "PIN falsch oder fehlt." }, 401);
    }
  }
  const repo = env.GITHUB_REPO || "Carag7/JW-Musik";
  const gh = (path, init = {}) => fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${GH_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "jw-musik-refresh"
    }
  });

  // 1. Hat der Token Zugriff auf das Repository?
  const repoRes = await gh("");
  if (!repoRes.ok) {
    const why = repoRes.status === 401 ? "Der Token ist ungültig oder abgelaufen."
      : `Der Token sieht das Repository „${repo}“ nicht (Fehler ${repoRes.status}). Beim Erstellen des Tokens „Only select repositories“ → dieses Repository wählen.`;
    return reply({ ok: false, fehler: why }, 502);
  }
  const info = await repoRes.json();
  const ref = env.GITHUB_BRANCH || info.default_branch || "main";

  // 2. Welcher Workflow? (Name oder Datei können abweichen)
  const wantFiles = reqBody.workflow === "verfuegbar";
  let target = wantFiles ? "verfuegbar.yml" : (env.GITHUB_WORKFLOW || "update.yml");
  const listRes = await gh("/actions/workflows");
  let names = [];
  if (listRes.ok) {
    const list = (await listRes.json()).workflows || [];
    names = list.map((w) => `${w.name} (${w.path.split("/").pop()})`);
    const active = list.filter((w) => w.state === "active");
    const wanted = wantFiles
      ? (active.find((w) => w.path.endsWith("/verfuegbar.yml")) || active.find((w) => /verf/i.test(w.name)))
      : env.GITHUB_WORKFLOW
      ? active.find((w) => w.path.endsWith(`/${env.GITHUB_WORKFLOW}`) || w.name === env.GITHUB_WORKFLOW)
      : active.find((w) => w.path.endsWith("/update.yml"))
        || active.find((w) => /lieder/i.test(w.name))
        || (active.length === 1 ? active[0] : null);
    if (!wanted) {
      return reply({ ok: false, fehler: `Im Repository gibt es keinen passenden Workflow. Gefunden: ${names.join(", ") || "keine"}. ${wantFiles ? "Datei .github/workflows/verfuegbar.yml ins Repository hochladen." : "Datei .github/workflows/update.yml anlegen oder in Cloudflare die Variable GITHUB_WORKFLOW setzen."}` }, 502);
    }
    target = wanted.id;
  }

  // 3. Starten
  const res = await gh(`/actions/workflows/${target}/dispatches`, { method: "POST", body: JSON.stringify({ ref }) });
  if (res.status === 204) return reply({ ok: true });
  const text = (await res.text()).slice(0, 300);
  const hint = res.status === 422 ? " (Der Workflow braucht den Trigger „workflow_dispatch“ und der Branch muss „" + ref + "“ heißen.)"
    : res.status === 403 || res.status === 404 ? " (Dem Token fehlt wohl die Berechtigung „Actions: Read and write“.)" : "";
  return reply({ ok: false, fehler: `GitHub antwortete ${res.status}: ${text}${hint}` }, 502);
}


/* ---------- Cover (R2-Ordner covers_edel/) ---------- */

const COVER_DIR = "covers_edel/";
const COVER_OK = /^covers_edel\/0*(\d{1,3})\.(jpe?g|png|webp)$/i;
let coverCache = { t: 0, data: null };

async function listCovers(env) {
  const out = []; let cursor;
  do {
    const r = await env.MUSIK.list({ prefix: COVER_DIR, cursor, limit: 1000 });
    out.push(...r.objects); cursor = r.truncated ? r.cursor : undefined;
  } while (cursor);
  return out;
}

/* öffentlich: Nummer → Schlüssel, nur ordentlich benannte Dateien (003.jpg) */
async function handleCovers(env) {
  try {
    if (!coverCache.data || Date.now() - coverCache.t > 60000) {
      const objs = await listCovers(env);
      const map = {}; let other = 0;
      for (const o of objs) {
        const m = COVER_OK.exec(o.key);
        if (m) map[String(parseInt(m[1], 10))] = o.key; else if (o.key !== COVER_DIR) other++;
      }
      coverCache = { t: Date.now(), data: { ok: true, anzahl: Object.keys(map).length, nichtBenannt: other, map } };
    }
    return new Response(JSON.stringify(coverCache.data), { headers: { ...CORS, "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
  } catch (err) {
    return json({ ok: false, fehler: String(err && err.message || err) }, CORS, 500);
  }
}

const normTxt = (x) => String(x || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’'`´]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/* Vorschlag je Datei: Nummer aus dem Dateinamen oder Titel im Dateinamen */
export function guessCover(name, songs) {
  const base = normTxt(name.replace(/\.[a-z0-9]+$/i, ""));
  const nums = (base.match(/\d+/g) || []).map((n) => parseInt(n, 10)).filter((n) => n > 0 && n < 1000);
  const byNum = new Map(songs.map((s) => [Number(s.number), s]));
  // 1) Titel im Dateinamen (eindeutig, mindestens zwei Wörter oder 8 Zeichen)
  const hits = songs.filter((s) => { const t = normTxt(s.title); return t.length >= 8 && (base.includes(t) || (base.length >= 8 && t.includes(base))); });
  if (hits.length === 1) return { nummer: Number(hits[0].number), sicher: true, grund: "Titel im Dateinamen" };
  // 2) genau eine Zahl im Namen
  const uniq = [...new Set(nums)];
  if (uniq.length === 1 && byNum.has(uniq[0])) return { nummer: uniq[0], sicher: true, grund: "Nummer im Dateinamen" };
  if (uniq.length > 1) { const c = uniq.filter((n) => byNum.has(n)); if (c.length === 1) return { nummer: c[0], sicher: false, grund: "eine von mehreren Zahlen" }; }
  return { nummer: null, sicher: false, grund: "" };
}

async function handleCoversAdmin(request, env, url) {
  const reply = (obj, status = 200) => json(obj, CORS, status);
  if (!env.WRITE_KEY) return reply({ ok: false, fehler: "In Cloudflare fehlt das Secret WRITE_KEY." }, 403);
  if (request.headers.get("x-write-key") !== env.WRITE_KEY) return reply({ ok: false, fehler: "Schlüssel falsch." }, 401);
  if (request.method === "GET") {
    let songs = [];
    try { songs = await (await env.ASSETS.fetch(new Request(new URL("/songs.json", url)))).json(); } catch { /* ohne Vorschläge */ }
    const objs = (await listCovers(env)).filter((o) => o.key !== COVER_DIR);
    const dateien = objs.map((o) => {
      const name = o.key.slice(COVER_DIR.length);
      const ok = COVER_OK.test(o.key);
      return { key: o.key, name, groesse: o.size, benannt: ok, vorschlag: ok ? null : guessCover(name, Array.isArray(songs) ? songs : []) };
    });
    return reply({ ok: true, anzahl: dateien.length, dateien, lieder: (Array.isArray(songs) ? songs : []).map((s) => ({ nummer: Number(s.number), titel: s.title })) });
  }
  if (request.method !== "POST") return reply({ ok: false, fehler: "Nur GET oder POST." }, 405);
  const body = await request.json().catch(() => ({}));
  const moves = Array.isArray(body.moves) ? body.moves.slice(0, 100) : [];
  const done = [], failed = [];
  const used = new Set((await listCovers(env)).map((o) => o.key));
  for (const m of moves) {
    const from = String(m && m.from || ""), to = String(m && m.to || "").replace(/\.jpeg$/i, ".jpg");
    if (!from.startsWith(COVER_DIR) || from.includes("..") || !/^covers_edel\/\d{3}\.(jpe?g|png|webp)$/i.test(to) || from === to) { failed.push({ from, grund: "ungültig" }); continue; }
    if (used.has(to) && !m.overwrite) { failed.push({ from, to, grund: "Ziel existiert schon" }); continue; }
    const obj = await env.MUSIK.get(from);
    if (!obj) { failed.push({ from, grund: "nicht gefunden" }); continue; }
    await env.MUSIK.put(to, obj.body, { httpMetadata: obj.httpMetadata });
    await env.MUSIK.delete(from);
    used.delete(from); used.add(to); done.push({ from, to });
  }
  coverCache = { t: 0, data: null };
  return reply({ ok: true, umbenannt: done.length, fehler: failed, done });
}
