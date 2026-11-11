const CACHE = "tesla-karaoke-v161";
const SHELL = ["./", "./index.html", "./style.css", "./skins.css", "./skins2.css", "./skins3.css", "./skins4.css", "./skins5.css", "./covers.css", "./v116.css", "./v118.css", "./v119.css", "./v124.css", "./v124.js", "./v125.css", "./v125.js", "./v126.css", "./v128.css", "./v126.js", "./v128.js", "./v130.css", "./v130.js", "./v131.css", "./v148.css", "./vorschau.html", "./v131.js", "./v132.js", "./v152.js", "./chor.mp4", "./aehnlich.json", "./liedtitel.js", "./qr.js", "./v119.js", "./covers.js", "./skinprof.js", "./flug.js", "./v116.js", "./v118.js",
  "./remote.js", "./app.js", "./ludwt.js", "./fehlend.js", "./password.js", "./theme.js", "./manifest.json", "./icon.svg", "./songs.json"];
const MAX_ENTRIES = 120;  // Obergrenze für zusätzlich gemerkte Dateien (Liedtexte, Bilder)

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.filter((req) => !SHELL.some((path) => new URL(req.url).pathname === new URL(path, self.location).pathname));
  for (const req of extra.slice(0, Math.max(0, extra.length - MAX_ENTRIES))) await cache.delete(req);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Musik, Sync-Speicher, Server-Funktionen und Abfragen mit Zeitstempel (?t=...) nie zwischenspeichern
  if (url.pathname.endsWith(".mp3") || url.pathname.startsWith("/sync/") || url.pathname.startsWith("/user/") || url.pathname.startsWith("/api/") || url.search) return;
  if (request.headers.has("range")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy).then(() => trim(cache)));
        }
        return response;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("./index.html")))
  );
});
