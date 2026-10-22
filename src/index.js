/* Cloudflare Worker "musik"
 *
 * Aufgaben:
 *  - /api/refresh        startet den GitHub-Workflow (Button "Jetzt aktualisieren")
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
  "access-control-allow-methods": "GET,PUT,POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-write-key"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS" && (path.startsWith("/api/") || path.startsWith("/sync/") || path.startsWith("/media/"))) {
      return new Response(null, { headers: CORS });
    }
    if (path === "/api/refresh") return handleRefresh(request, env);
    if (path === "/api/media-index") return handleIndex(request, env, url);
    if (path === "/api/r2-fetch") return handleFetchToR2(request, env, url);
    if (path === "/api/r2-plan" || path === "/api/r2-run") return handleMigrate(request, env, url, path);
    if (path.startsWith("/sync/")) return handleSync(request, env, path);

    if (path.startsWith("/media/")) {
      const key = decodeURIComponent(path.slice(7));
      if (/^(favoriten|sync)\//.test(key) || key.includes("..") || key.split("/").some((p) => p.startsWith("_")) || !/\.(mp3|m4a|aac|wav|mp4|m4v|webm|mov|lrc)$/i.test(key)) return new Response("Not Found", { status: 404, headers: CORS });
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

/* ---------- Dateien aus R2 ausliefern ---------- */

const MIME = { mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", wav: "audio/wav", mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime", lrc: "text/plain; charset=utf-8" };

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
    meeting: { audio: {}, video: {}, lrc: {}, sung: {} }
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
  for (const o of objects) {
    const c = classify(o.key);
    if (!c || !c.n) continue;
    if (c.type === "karaoke-audio") put(idx.karaoke.audio, "ka", c.n, o.key);
    else if (c.type === "karaoke-lrc") put(idx.karaoke.lrc, "kl", c.n, o.key);
    else if (c.type === "meeting-audio") put(idx.meeting.audio, "ma", c.n, o.key);
    else if (c.type === "meeting-sung") put(idx.meeting.sung, "ms", c.n, o.key);
    else if (c.type === "meeting-video") put(idx.meeting.video, "mv", c.n, o.key);
    else if (c.type === "meeting-lrc") put(idx.meeting.lrc, "ml", c.n, o.key);
  }
  return {
    ok: true,
    generiert: new Date().toISOString(),
    speicher: { gesamt: gesamtBytes, ordner: speicher },
    anzahl: {
      karaoke_audio: Object.keys(idx.karaoke.audio).length,
      meeting_audio: Object.keys(idx.meeting.audio).length,
      meeting_video: Object.keys(idx.meeting.video).length,
      meeting_sung: Object.keys(idx.meeting.sung).length,
      meeting_lrc: Object.keys(idx.meeting.lrc).length
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

/* lrc-003 -> karaoke/lrc/003.lrc, lrcm-003 -> meeting/lrc/003.lrc, sonst favoriten/<name>.json (alte Orte werden mitgelesen) */
export function storeKeys(code) {
  const m = code.match(/^lrc(m?)-([a-z0-9]+)$/);
  if (m) {
    const n = m[2];
    return m[1]
      ? { write: `meeting/lrc/${n}.lrc`, read: [`meeting/lrc/${n}.lrc`], lrc: true }
      : { write: `karaoke/lrc/${n}.lrc`, read: [`karaoke/lrc/${n}.lrc`, `sync/lrc-${n}.lrc`], lrc: true };
  }
  return { write: `favoriten/${code}.json`, read: [`favoriten/${code}.json`, `sync/${code}.json`], lrc: false };
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
