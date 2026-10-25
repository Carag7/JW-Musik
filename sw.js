const CACHE = "tesla-karaoke-v87";
const SHELL = ["./", "./index.html", "./style.css", "./app.js", "./ludwt.js", "./fehlend.js", "./password.js", "./theme.js", "./manifest.json", "./icon.svg", "./songs.json"];
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
