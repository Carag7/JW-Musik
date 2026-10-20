export default {



  return new Response("TEST 7");



  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/refresh") {
      return handleRefresh(request, env);
    }

    if (path.startsWith("/sync/")) {
      return handleSync(request, env, path);
    }

    if (path.endsWith(".mp3")) {
      const filename = path.split("/").pop();
      const range = request.headers.get("range");

      let key = "musik/" + filename;
      let head = await env.MUSIK.head(key);
      if (!head) {
        key = filename;
        head = await env.MUSIK.head(key);
      }

      if (!head) {
        return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
      }

      const h = new Headers();
      head.writeHttpMetadata(h);
      h.set("etag", head.httpEtag);
      h.set("accept-ranges", "bytes");
      h.set("cache-control", "public, max-age=86400");

      if (range) {
        const parsed = parseRange(range);
        let start = 0, end = head.size - 1;
        if (parsed) {
          if (parsed.offset !== undefined) start = parsed.offset;
          if (parsed.length !== undefined) end = start + parsed.length - 1;
          if (parsed.suffix !== undefined) {
            start = head.size - parsed.suffix;
            end = head.size - 1;
          }
        }
        const obj = await env.MUSIK.get(key, { range: { offset: start, length: end - start + 1 } });
        if (!obj) return new Response("Not Found", { status: 404 });
        h.set("content-range", `bytes ${start}-${end}/${head.size}`);
        h.set("content-length", String(end - start + 1));
        return new Response(obj.body, { status: 206, headers: h });
      }

      const obj = await env.MUSIK.get(key);
      h.set("content-length", String(head.size));
      return new Response(obj.body, { headers: h });
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
  }
};

async function handleSync(request, env, path) {
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,PUT,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-write-key"
  };
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });

  if (path === "/sync/" || path === "/sync") {
    const meta = await readMeta(env);
    // Namen der Speicher werden nicht mehr veröffentlicht (sie sind das "Passwort" des Speichers)
    return json({ count: meta.codes.length, last: meta.last || null }, cors);
  }

  const code = path.slice(6).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!code || code.length < 3) return new Response("bad code", { status: 400, headers: cors });
  const key = "sync/" + code + (code.startsWith("lrc-") ? ".lrc" : ".json");

  if (request.method === "PUT" || request.method === "POST") {
    // Liedtext-Zeiten (lrc-...) nur mit Schreib-Schlüssel, wenn in Cloudflare das Secret WRITE_KEY gesetzt ist
    if (code.startsWith("lrc-") && env.WRITE_KEY && request.headers.get("x-write-key") !== env.WRITE_KEY) {
      return new Response("unauthorized", { status: 401, headers: cors });
    }
    const body = await request.text();
    if (body.length > 512 * 1024) return new Response("too large", { status: 413, headers: cors });
    await env.MUSIK.put(key, body, { httpMetadata: { contentType: code.startsWith("lrc-") ? "text/plain" : "application/json" } });
    const meta = await readMeta(env);
    const now = new Date().toISOString();
    meta.codes = meta.codes.filter((item) => item.code !== code);
    meta.codes.push({ code, created: now });
    meta.last = now;
    await env.MUSIK.put("sync/_index.json", JSON.stringify(meta), { httpMetadata: { contentType: "application/json" } });
    return json({ ok: true, code, created: now }, cors);
  }

  if (request.method === "GET") {
    const obj = await env.MUSIK.get(key);
    if (!obj) return new Response("not found", { status: 404, headers: cors });
    return new Response(obj.body, { headers: { ...cors, "content-type": obj.httpMetadata?.contentType || "application/json" } });
  }

  return new Response("method", { status: 405, headers: cors });
}

async function readMeta(env) {
  try {
    const obj = await env.MUSIK.get("sync/_index.json");
    if (!obj) return { codes: [], last: null };
    const data = await obj.json();
    return { codes: Array.isArray(data.codes) ? data.codes : [], last: data.last || null };
  } catch {
    return { codes: [], last: null };
  }
}

function json(data, headers) {
  return new Response(JSON.stringify(data), { headers: { ...headers, "content-type": "application/json" } });
}

function parseRange(r) {
  const m = r.match(/bytes=(\d*)-(\d*)/);
  if (!m) return undefined;
  const s = m[1] ? +m[1] : null, e = m[2] ? +m[2] : null;
  if (s === null && e !== null) return { offset: 0, suffix: e };
  if (s !== null && e === null) return { offset: s };
  if (s !== null && e !== null) return { offset: s, length: e - s + 1 };
  return undefined;
}

// Startet den GitHub-Workflow "update.yml" (Button "Jetzt aktualisieren" im Synchronisieren-Dialog).
// Cloudflare: Secret GITHUB_TOKEN (Fine-grained Token, Repo-Berechtigung "Actions: Read and write"),
// optional Secret REFRESH_PIN. GITHUB_REPO und GITHUB_BRANCH stehen in wrangler.jsonc.
async function handleRefresh(request, env) {
  const reply = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
  if (request.method !== "POST") return reply({ ok: false, fehler: "Nur POST erlaubt." }, 405);
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return reply({ ok: false, fehler: "Server nicht eingerichtet: Secret GITHUB_TOKEN fehlt in Cloudflare." }, 500);
  }
  if (env.REFRESH_PIN) {
    const body = await request.json().catch(() => ({}));
    if (String(body.pin || "") !== String(env.REFRESH_PIN)) {
      return reply({ ok: false, pin_erforderlich: true, fehler: "PIN falsch oder fehlt." }, 401);
    }
  }
  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/update.yml/dispatches`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "jw-musik-refresh"
    },
    body: JSON.stringify({ ref: env.GITHUB_BRANCH || "main" })
  });
  if (res.status === 204) return reply({ ok: true });
  const text = (await res.text()).slice(0, 300);
  return reply({ ok: false, fehler: `GitHub antwortete ${res.status}: ${text}` }, 502);
}
