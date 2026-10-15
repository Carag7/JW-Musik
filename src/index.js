export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith(".mp3")) {
      const filename = path.split("/").pop();
      const range = request.headers.get("range");
      const opts = range ? { range: parseRange(range) } : {};

      let obj = await env.MUSIK.get("musik/" + filename, opts);
      if (!obj) obj = await env.MUSIK.get(filename, opts);

      if (obj) {
        const h = new Headers();
        obj.writeHttpMetadata(h);
        h.set("etag", obj.httpEtag);
        h.set("accept-ranges", "bytes");
        h.set("cache-control", "public, max-age=3600");
        if (obj.rangeHeader) {
          h.set("content-range", obj.rangeHeader);
          h.set("content-length", String(obj.size));
          return new Response(obj.body, { status: 206, headers: h });
        }
        h.set("content-length", String(obj.size));
        return new Response(obj.body, { headers: h });
      }
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
  }
};

function parseRange(r) {
  const m = r.match(/bytes=(\d*)-(\d*)/);
  if (!m) return undefined;
  const s = m[1] ? +m[1] : null, e = m[2] ? +m[2] : null;
  if (s === null && e !== null) return { offset: 0, suffix: e };
  if (s !== null && e === null) return { offset: s };
  if (s !== null && e !== null) return { offset: s, length: e - s + 1 };
  return undefined;
}
