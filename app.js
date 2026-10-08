const STORAGE = {
  favorites: "teslaKaraokeFavorites",
  scale: "teslaKaraokeLyricsScale"
};

const state = {
  songs: [],
  index: -1,
  query: "",
  favoritesOnly: false,
  playFavorites: false,
  shuffle: false,
  favorites: new Set(),
  lyrics: [],
  scale: 42,
  wakeLock: null
};

const el = {
  list: document.getElementById("songList"),
  count: document.getElementById("songCount"),
  search: document.getElementById("songSearch"),
  title: document.getElementById("currentTitle"),
  category: document.getElementById("currentCategory"),
  number: document.getElementById("currentNumber"),
  status: document.getElementById("currentStatus"),
  lyrics: document.getElementById("lyrics"),
  audio: document.getElementById("audio"),
  play: document.getElementById("playBtn"),
  prev: document.getElementById("prevBtn"),
  next: document.getElementById("nextBtn"),
  progress: document.getElementById("progressBar"),
  currentTime: document.getElementById("currentTime"),
  duration: document.getElementById("duration"),
  favorite: document.getElementById("favoriteBtn"),
  favoritesToggle: document.getElementById("favoritesToggle"),
  fullscreen: document.getElementById("fullscreenBtn"),
  smaller: document.getElementById("smallerBtn"),
  larger: document.getElementById("largerBtn"),
  install: document.getElementById("installBtn"),
  lyricsLink: document.getElementById("lyricsLink"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  favoritesPlay: document.getElementById("favoritesPlay"),
  back15: document.getElementById("back15"),
  fwd15: document.getElementById("fwd15")
};

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.favorites) || "[]");
    if (Array.isArray(raw)) state.favorites = new Set(raw);
  } catch {
    state.favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE.favorites, JSON.stringify([...state.favorites]));
}

function applyScale() {
  document.documentElement.style.setProperty("--lyrics", `${state.scale}px`);
}

function visibleSongs() {
  const q = state.query.trim().toLowerCase();
  return state.songs.filter((song) => {
    if (state.favoritesOnly && !state.favorites.has(song.id)) return false;
    if (!q) return true;
    return song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
  });
}

function renderList() {
  const songs = visibleSongs();
  el.count.textContent = String(songs.length);
  el.list.innerHTML = "";
  songs.forEach((song) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "song-btn";
    if (state.songs[state.index] === song) button.classList.add("active");
    const number = document.createElement("strong");
    number.textContent = song.id;
    const title = document.createElement("span");
    title.textContent = `${state.favorites.has(song.id) ? "★ " : ""}${song.title}`;
    button.append(number, title);
    button.addEventListener("click", () => selectSong(state.songs.indexOf(song), true));
    item.append(button);
    el.list.append(item);
  });
}

function parseLrc(text) {
  return text.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
    if (!match) return [];
    const time = Number(match[1]) * 60 + Number(match[2]);
    const lyric = match[3].trim();
    return lyric ? [{ time, text: lyric }] : [];
  }).sort((a, b) => a.time - b.time);
}

function lyricUrl(song) {
  const slug = song.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://www.jw.org/en/library/music-songs/sing-out-joyfully/${song.number}-${slug}/`;
}

function lyricUrl(song) {
  const slug = song.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://www.jw.org/en/library/music-songs/sing-out-joyfully/${song.number}-${slug}/`;
}

function showLyricLink(song) {
  const url = lyricUrl(song);
  if (el.lyricsLink) el.lyricsLink.href = url;
  const note = document.getElementById("lyricsNote");
  if (note) note.textContent = `${song.id} · ${song.title}. Text ist verlinkt. Einbetten blockiert die Liedseite.`;
}

async function loadLyrics(song) {
  state.lyrics = [];
  if (!song.lyrics) {
    renderLyrics([]);
    return;
  }
  try {
    const response = await fetch(song.lyrics, { cache: "no-store" });
    if (!response.ok) throw new Error("missing");
    state.lyrics = parseLrc(await response.text());
    renderLyrics(state.lyrics);
  } catch {
    renderLyrics([]);
  }
}

async function resolveAudio(song) {
  const local = `songs/${song.file || `sjjc_E_${String(song.number).padStart(3, "0")}.mp3`}`;
  try {
    const response = await fetch(local, { method: "HEAD", cache: "no-store" });
    const type = response.headers.get("content-type") || "";
    if (response.ok && !type.includes("text/html")) return local;
  } catch {
    /* lokale Datei fehlt */
  }
  return song.remote || song.audio;
}

function setAudioSource(url) {
  el.audio.pause();
  el.audio.removeAttribute("crossorigin");
  el.audio.src = url;
  el.audio.load();
}

async function selectSong(index, autoplay) {
  if (index < 0 || index >= state.songs.length) return;
  state.index = index;
  state.triedFallback = false;
  const song = state.songs[index];
  el.number.textContent = `Lied ${song.id}`;
  el.title.textContent = song.title;
  el.category.textContent = song.category || "";
  el.status.textContent = "Audio wird geladen …";
  const fav = state.favorites.has(song.id);
  el.favorite.setAttribute("aria-pressed", String(fav));
  el.favorite.textContent = fav ? "★ Favorit" : "☆ Favorit";
  el.progress.value = "0";
  el.currentTime.textContent = "0:00";
  el.duration.textContent = "0:00";
  el.play.textContent = "▶";
  renderList();
  showLyricLink(song);
  const url = await resolveAudio(song);
  state.currentAudio = url;
  setAudioSource(url);
  if (autoplay) el.audio.addEventListener("canplay", () => togglePlay(), { once: true });
}

function togglePlay() {
  if (!state.currentAudio) {
    el.status.textContent = "Bitte zuerst ein Lied wählen";
    return;
  }
  if (!el.audio.src) el.audio.src = state.currentAudio;
  if (el.audio.paused) {
    el.audio.play().then(() => {
      el.play.textContent = "❚❚";
      el.status.textContent = "Spielt";
      requestWakeLock();
    }).catch(() => {
      el.status.textContent = "Wiedergabe blockiert. Tippe noch einmal auf Play.";
    });
  } else {
    el.audio.pause();
    el.play.textContent = "▶";
    el.status.textContent = "Pause";
  }
}

function updateLyrics() {
  const lines = el.lyrics.querySelectorAll(".lyric-line");
  if (!lines.length) return;
  const now = el.audio.currentTime || 0;
  let active = null;
  lines.forEach((line, index) => {
    const start = Number(line.dataset.time);
    const end = index < lines.length - 1 ? Number(lines[index + 1].dataset.time) : Infinity;
    const on = now >= start && now < end;
    line.classList.toggle("active", on);
    if (on) active = line;
  });
  if (active) {
    const box = el.lyrics.getBoundingClientRect();
    const row = active.getBoundingClientRect();
    if (row.top < box.top + 40 || row.bottom > box.bottom - 40) {
      active.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }
}

function updateProgress() {
  const duration = el.audio.duration || 0;
  const current = el.audio.currentTime || 0;
  if (duration > 0) el.progress.value = String((current / duration) * 1000);
  el.currentTime.textContent = formatTime(current);
  el.duration.textContent = formatTime(duration);
  updateLyrics();
}

function seek() {
  if (!el.audio.duration) return;
  el.audio.currentTime = el.audio.duration * (Number(el.progress.value) / 1000);
}

function playPool() {
  const pool = state.playFavorites
    ? state.songs.filter((song) => state.favorites.has(song.id))
    : state.songs;
  return pool;
}

function step(delta) {
  const pool = playPool();
  if (!pool.length) {
    el.status.textContent = state.playFavorites ? "Keine Favoriten markiert" : "Keine Lieder";
    return;
  }
  const playing = !el.audio.paused;
  if (state.shuffle) {
    const choices = pool.filter((song) => song !== state.songs[state.index]);
    const pick = (choices.length ? choices : pool)[Math.floor(Math.random() * (choices.length || pool.length))];
    selectSong(state.songs.indexOf(pick), true);
    return;
  }
  const current = state.songs[state.index];
  let at = pool.indexOf(current);
  if (at < 0) at = delta > 0 ? -1 : 0;
  const next = pool[(at + delta + pool.length) % pool.length];
  selectSong(state.songs.indexOf(next), playing || delta !== 0);
}

function skip(seconds) {
  if (!el.audio.src && !el.audio.currentSrc) return;
  const duration = el.audio.duration || Number.MAX_SAFE_INTEGER;
  el.audio.currentTime = Math.min(duration, Math.max(0, (el.audio.currentTime || 0) + seconds));
}

function toggleFavorite() {
  const song = state.songs[state.index];
  if (!song) return;
  if (state.favorites.has(song.id)) state.favorites.delete(song.id);
  else state.favorites.add(song.id);
  saveFavorites();
  renderList();
  el.favorite.setAttribute("aria-pressed", String(state.favorites.has(song.id)));
  el.favorite.textContent = state.favorites.has(song.id) ? "★ Favorit" : "☆ Favorit";
  el.favoritesToggle.textContent = state.favoritesOnly ? "★ Favoriten" : "☆ Favoriten";
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    state.wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    state.wakeLock = null;
  }
}

async function loadSongs() {
  el.status.textContent = "Lieder werden geladen …";
  try {
    const response = await fetch("songs.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`songs.json HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("songs.json ist keine Liste");
    state.songs = data;
    el.status.textContent = `${data.length} Lieder bereit`;
    renderList();
  } catch (error) {
    el.title.textContent = "Lieder nicht geladen";
    el.status.textContent = error.message;
  }
}

function bind() {
  el.search.addEventListener("input", () => {
    state.query = el.search.value;
    renderList();
  });
  el.play.addEventListener("click", togglePlay);
  el.prev.addEventListener("click", () => step(-1));
  el.next.addEventListener("click", () => step(1));
  el.back15.addEventListener("click", () => skip(-15));
  el.fwd15.addEventListener("click", () => skip(15));
  el.shuffleBtn.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    el.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
    el.status.textContent = state.shuffle ? "Zufällige Reihenfolge" : "Feste Reihenfolge";
  });
  el.favoritesPlay.addEventListener("click", () => {
    state.playFavorites = !state.playFavorites;
    el.favoritesPlay.setAttribute("aria-pressed", String(state.playFavorites));
    el.status.textContent = state.playFavorites ? "Nur Favoriten werden abgespielt" : "Alle Lieder werden abgespielt";
  });
  el.progress.addEventListener("input", seek);
  el.favorite.addEventListener("click", toggleFavorite);
  el.favoritesToggle.addEventListener("click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    el.favoritesToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
    el.favoritesToggle.textContent = state.favoritesOnly ? "★ Favoriten" : "☆ Favoriten";
    renderList();
  });
  el.fullscreen.addEventListener("click", toggleFullscreen);
  el.smaller.addEventListener("click", () => {
    state.scale = Math.max(24, state.scale - 4);
    localStorage.setItem(STORAGE.scale, String(state.scale));
    applyScale();
  });
  el.larger.addEventListener("click", () => {
    state.scale = Math.min(84, state.scale + 4);
    localStorage.setItem(STORAGE.scale, String(state.scale));
    applyScale();
  });
  el.audio.addEventListener("timeupdate", updateProgress);
  el.audio.addEventListener("loadedmetadata", updateProgress);
  el.audio.addEventListener("ended", () => {
    el.play.textContent = "▶";
    el.status.textContent = "Ende";
    step(1);
  });
  el.audio.addEventListener("error", () => {
    const song = state.songs[state.index];
    const code = el.audio.error ? el.audio.error.code : 0;
    if (song && song.remote && state.currentAudio !== song.remote && !state.triedFallback) {
      state.triedFallback = true;
      state.currentAudio = song.remote;
      el.status.textContent = "Lokale Datei fehlt, Release wird geladen …";
      setAudioSource(song.remote);
      return;
    }
    el.status.textContent = code === 4
      ? "Fehler 4 auf diesem Browser: GitHub liefert die MP3 als Download. Lege die Datei nach songs/ im Repository."
      : `Audio-Fehler ${code}.`;
  });
  document.addEventListener("fullscreenchange", () => {
    el.fullscreen.textContent = document.fullscreenElement ? "Beenden" : "Vollbild";
  });
  document.addEventListener("keydown", (event) => {
    if (event.target === el.search) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    } else if (event.code === "ArrowRight") step(1);
    else if (event.code === "ArrowLeft") step(-1);
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    el.install.hidden = false;
    el.install.addEventListener("click", async () => {
      event.prompt();
      el.install.hidden = true;
    }, { once: true });
  });
}

function init() {
  loadFavorites();
  state.scale = Number(localStorage.getItem(STORAGE.scale) || 42);
  applyScale();
  bind();
  loadSongs();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

init();
