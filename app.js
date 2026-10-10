const STORAGE = {
  favorites: "teslaKaraokeFavorites",
  scale: "teslaKaraokeLyricsScale"
};

const SLUG_FIX = {
  81: "life-of-a-pioneer",
  89: "listen-obey-be-blessed",
  110: "joy-of-jehovah",
  144: "keep-eye-on-the-prize",
  160: "good-news"
};

const state = {
  songs: [],
  index: -1,
  query: "",
  category: "",
  favoritesOnly: false,
  playFavorites: false,
  shuffle: false,
  favorites: new Set(),
  lyrics: [],
  scale: 42,
  wakeLock: null,
  sidebarOpen: true,
  userScrolling: false,
  scrollTimer: 0,
  centering: false
};

const el = {
  app: document.querySelector(".app"),
  list: document.getElementById("songList"),
  count: document.getElementById("songCount"),
  search: document.getElementById("songSearch"),
  category: document.getElementById("categoryFilter"),
  title: document.getElementById("currentTitle"),
  songCategory: document.getElementById("currentCategory"),
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
  fwd15: document.getElementById("fwd15"),
  menu: document.getElementById("menuToggle")
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

function setSidebar(open) {
  state.sidebarOpen = open;
  el.app.classList.toggle("sidebar-hidden", !open);
  el.menu.setAttribute("aria-expanded", String(open));
  el.menu.textContent = open ? "✕ Menü" : "☰ Menü";
}

function visibleSongs() {
  const q = state.query.trim().toLowerCase();
  return state.songs.filter((song) => {
    if (state.favoritesOnly && !state.favorites.has(song.id)) return false;
    if (state.category && song.category !== state.category) return false;
    if (!q) return true;
    return song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
  });
}

function fillCategories() {
  const names = [...new Set(state.songs.map((song) => song.category).filter(Boolean))].sort();
  el.category.innerHTML = `<option value="">Alle Kategorien</option>`;
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    el.category.append(option);
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

function renderLyrics(lines) {
  el.lyrics.innerHTML = "";
  if (!lines || !lines.length) {
    el.lyrics.innerHTML = '<p class="empty">Keine Liedtexte gefunden</p>';
    return;
  }
  lines.forEach((line) => {
    const row = document.createElement("p");
    row.className = "lyric-line";
    row.dataset.time = line.time;
    row.textContent = line.text;
    el.lyrics.append(row);
  });
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”„«»"'’‘]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function officialUrl(song) {
  const slug = SLUG_FIX[song.number] || slugify(song.title);
  return `https://www.jw.org/en/library/music-songs/sing-out-joyfully/${song.number}-${slug}/`;
}

function showLyricLink(song) {
  if (el.lyricsLink) el.lyricsLink.href = officialUrl(song);
}

async function loadLyrics(song) {
  state.lyrics = [];
  const local = song.lyrics || `lyrics/sjj_E_${String(song.number).padStart(2, "0")}.lrc`;
  const remote = `https://github.com/Carag7/JW-Musik/releases/download/JW-Lyrics/sjj_E_${String(song.number).padStart(2, "0")}.lrc`;
  for (const url of [local, remote]) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const text = await response.text();
      if (!text.includes("[")) continue;
      state.lyrics = parseLrc(text);
      renderLyrics(state.lyrics);
      return;
    } catch {
      /* nächste Quelle */
    }
  }
  renderLyrics([]);
}

function audioCandidates(song) {
  const file = song.file || `sjjc_E_${String(song.number).padStart(3, "0")}.mp3`;
  const remote = song.remote || `https://github.com/Carag7/JW-Musik/releases/download/JW-Vocals/${file}`;
  const first = Number(song.number) >= 100
    ? [`songs1/${file}`, `songs2/${file}`, `songs/${file}`, file]
    : [`songs/${file}`, `songs1/${file}`, `songs2/${file}`, file];
  return [...first, remote];
}

async function resolveAudio(song) {
  const list = audioCandidates(song);
  for (const url of list) {
    if (/^https?:/i.test(url)) return url;
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      if (response.ok && type.includes("audio")) return url;
    } catch {
      /* nächste Quelle */
    }
  }
  return list[list.length - 1];
}

function setAudioSource(url) {
  el.audio.pause();
  el.audio.removeAttribute("crossorigin");
  el.audio.src = url;
  el.audio.load();
}

function setMediaSession(song) {
  if (!("mediaSession" in navigator) || !song) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: "Sing Out Joyfully",
    album: song.category || "Karaoke"
  });
  navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
  navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
  navigator.mediaSession.setActionHandler("play", togglePlay);
  navigator.mediaSession.setActionHandler("pause", togglePlay);
}

async function selectSong(index, autoplay) {
  if (index < 0 || index >= state.songs.length) return;
  state.index = index;
  state.audioTry = 0;
  const song = state.songs[index];
  el.number.textContent = `Lied ${song.id}`;
  el.title.textContent = song.title;
  el.songCategory.textContent = song.category || "";
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
  await loadLyrics(song);
  const url = await resolveAudio(song);
  state.currentAudio = url;
  setAudioSource(url);
  setMediaSession(song);
  if (!document.fullscreenElement && !document.body.classList.contains("pseudo-fullscreen")) {
    setSidebar(false);
  }
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
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      requestWakeLock();
    }).catch(() => {
      el.status.textContent = "Wiedergabe blockiert. Tippe noch einmal auf Play.";
    });
  } else {
    el.audio.pause();
    el.play.textContent = "▶";
    el.status.textContent = "Pause";
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
  }
}

function centerActive(force) {
  if (state.userScrolling && !force) return;
  const active = el.lyrics.querySelector(".lyric-line.active");
  if (!active) return;
  state.centering = true;
  const box = el.lyrics.getBoundingClientRect();
  const row = active.getBoundingClientRect();
  const delta = row.top - box.top - (box.height / 2) + (row.height / 2);
  el.lyrics.scrollBy({ top: delta, behavior: "smooth" });
  setTimeout(() => { state.centering = false; }, 350);
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
  if (active) centerActive(false);
}

function markUserScroll() {
  if (state.centering) return;
  state.userScrolling = true;
  clearTimeout(state.scrollTimer);
  state.scrollTimer = setTimeout(() => {
    state.userScrolling = false;
    centerActive(true);
  }, 4000);
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
  return state.playFavorites
    ? state.songs.filter((song) => state.favorites.has(song.id))
    : state.songs;
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
}

async function toggleFullscreen() {
  const apiOpen = Boolean(document.fullscreenElement);
  if (!apiOpen && document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen();
      el.fullscreen.textContent = "Beenden";
      return;
    } catch {
      /* Tesla ignoriert die API oft */
    }
  } else if (apiOpen && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
      el.fullscreen.textContent = "Vollbild";
      return;
    } catch {
      /* CSS-Vollbild nehmen */
    }
  }
  document.body.classList.toggle("pseudo-fullscreen");
  el.fullscreen.textContent = document.body.classList.contains("pseudo-fullscreen") ? "Beenden" : "Vollbild";
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
    fillCategories();
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
  el.category.addEventListener("change", () => {
    state.category = el.category.value;
    renderList();
  });
  el.menu.addEventListener("click", () => setSidebar(!state.sidebarOpen));
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
    state.scale = Math.max(12, state.scale - 8);
    localStorage.setItem(STORAGE.scale, String(state.scale));
    applyScale();
  });
  el.larger.addEventListener("click", () => {
    state.scale = Math.min(180, state.scale + 8);
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
    const list = song ? audioCandidates(song) : [];
    state.audioTry = (state.audioTry || 0) + 1;
    if (song && state.audioTry < list.length) {
      state.currentAudio = list[state.audioTry];
      el.status.textContent = `Quelle ${state.audioTry + 1} von ${list.length} …`;
      setAudioSource(state.currentAudio);
      return;
    }
    const code = el.audio.error ? el.audio.error.code : 0;
    el.status.textContent = `Audio-Fehler ${code}. Keine Quelle spielbar.`;
  });
  el.lyrics.addEventListener("wheel", markUserScroll, { passive: true });
  el.lyrics.addEventListener("touchmove", markUserScroll, { passive: true });
  el.lyrics.addEventListener("pointerdown", markUserScroll);
  document.addEventListener("fullscreenchange", () => {
    el.fullscreen.textContent = document.fullscreenElement ? "Beenden" : "Vollbild";
  });
  document.addEventListener("keydown", (event) => {
    if (event.target === el.search) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    } else if (["ArrowRight", "MediaTrackNext", "PageDown"].includes(event.code)) {
      step(1);
    } else if (["ArrowLeft", "MediaTrackPrevious", "PageUp"].includes(event.code)) {
      step(-1);
    }
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
