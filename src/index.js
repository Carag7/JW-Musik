export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

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
      h.set("cache-control", "public, max-age=3600");

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

function parseRange(r) {
  const m = r.match(/bytes=(\d*)-(\d*)/);
  if (!m) return undefined;
  const s = m[1] ? +m[1] : null, e = m[2] ? +m[2] : null;
  if (s === null && e !== null) return { offset: 0, suffix: e };
  if (s !== null && e === null) return { offset: s };
  if (s !== null && e !== null) return { offset: s, length: e - s + 1 };
  return undefined;
}
