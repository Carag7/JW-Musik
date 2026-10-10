const STORAGE = {
  favorites: "teslaKaraokeFavorites",
  scale: "teslaKaraokeLyricsScale"
};

const PAGE = {
  1: "1-jehovahs-attributes", 2: "2-jehovah-is-your-name", 3: "3-our-strength-our-hope-our-confidence",
  4: "4-jehovah-is-my-shepherd", 5: "5-gods-wondrous-works", 6: "6-the-heavens-declare-gods-glory",
  7: "7-jehovah-our-strength", 8: "8-jehovah-is-our-refuge", 9: "9-jehovah-is-our-king",
  10: "10-praise-jehovah-our-god", 11: "11-creation-praises-god", 12: "12-great-god-jehovah",
  13: "13-christ-our-model", 14: "14-praising-earths-new-king", 15: "15-praise-jehovahs-firstborn",
  16: "16-praise-jah-for-his-son-the-anointed", 17: "17-i-want-to", 18: "18-grateful-for-the-ransom",
  19: "19-lords-evening-meal", 20: "20-you-gave-your-precious-son", 21: "21-keep-on-seeking-first-the-kingdom",
  22: "22-the-kingdom-is-in-place-let-it-come", 23: "23-jehovah-begins-his-rule", 24: "24-come-to-jehovahs-mountain",
  25: "25-a-special-possession", 26: "26-you-did-it-for-me", 27: "27-revealing-of-gods-sons",
  28: "28-gaining-jehovahs-friendship", 29: "29-living-up-to-our-name", 30: "30-my-father-god-and-friend",
  31: "31-walk-with-god", 32: "32-take-sides-with-jehovah", 33: "33-throw-your-burden-on-jehovah",
  34: "34-walking-in-integrity", 35: "35-make-sure-of-more-important-things", 36: "36-we-guard-our-hearts",
  37: "37-serving-jehovah-whole-souled", 38: "38-he-will-make-you-strong", 39: "39-make-a-good-name-with-god",
  40: "40-to-whom-do-we-belong", 41: "41-hear-my-prayer", 42: "42-the-prayer-of-gods-servant",
  43: "43-prayer-of-thanks", 44: "44-prayer-of-the-lowly-one", 45: "45-meditation-of-my-heart",
  46: "46-we-thank-you-jehovah", 47: "47-pray-to-jehovah-each-day", 48: "48-daily-walking-with-jehovah",
  49: "49-making-jehovahs-heart-glad", 50: "50-prayer-of-dedication", 51: "51-to-god-we-are-dedicated",
  52: "52-christian-dedication", 53: "53-preparing-to-preach", 54: "54-this-is-the-way",
  55: "55-fear-them-not", 56: "56-make-the-truth-your-own", 57: "57-preaching-to-all-sorts-of-people",
  58: "58-search-for-friends-of-peace", 59: "59-praise-jah-with-me", 60: "60-it-means-their-life",
  61: "61-forward-you-witnesses", 62: "62-the-new-song", 63: "63-we-are-jehovahs-witnesses",
  64: "64-sharing-joyfully-in-harvest", 65: "65-move-ahead", 66: "66-declare-the-good-news",
  67: "67-preach-the-word", 68: "68-sowing-kingdom-seed", 69: "69-forward-preaching-the-kingdom",
  70: "70-search-out-deserving-ones", 71: "71-jehovahs-army", 72: "72-making-known-kingdom-truth",
  73: "73-grant-us-boldness", 74: "74-join-in-kingdom-song", 75: "75-here-i-am-send-me",
  76: "76-how-does-it-make-you-feel", 77: "77-light-in-dark-world", 78: "78-teaching-word-of-god",
  79: "79-prayer-stand-firm", 80: "80-taste-see-jehovah-is-good", 81: "81-life-of-a-pioneer",
  82: "82-let-light-shine", 83: "83-from-house-to-house", 84: "84-reaching-out-christian-ministry",
  85: "85-welcome-one-another", 86: "86-we-must-be-taught", 87: "87-come-be-refreshed",
  88: "88-make-me-know-your-ways", 89: "89-listen-obey-be-blessed", 90: "90-encourage-one-another",
  91: "91-our-labor-of-love", 92: "92-a-place-bearing-your-name", 93: "93-bless-our-meeting-together",
  94: "94-grateful-for-gods-word", 95: "95-light-gets-brighter", 96: "96-gods-own-book-a-treasure",
  97: "97-life-depends-on-gods-word", 98: "98-the-scriptures-inspired-of-god", 99: "99-myriads-of-brothers",
  100: "100-receive-them-with-hospitality", 101: "101-working-together-in-unity", 102: "102-assist-those-who-are-weak",
  103: "103-shepherds-gifts-in-men", 104: "104-gods-gift-of-holy-spirit", 105: "105-god-is-love",
  106: "106-cultivating-the-quality-of-love", 107: "107-divine-pattern-of-love", 108: "108-gods-loyal-love",
  109: "109-love-intensely-from-the-heart", 110: "110-joy-of-jehovah", 111: "111-our-reasons-for-joy",
  112: "112-jehovah-god-of-peace", 113: "113-our-possession-of-peace", 114: "114-exercise-patience",
  115: "115-gratitude-for-divine-patience", 116: "116-power-of-kindness", 117: "117-quality-of-goodness",
  118: "118-give-us-more-faith", 119: "119-we-must-have-faith", 120: "120-imitate-christs-mildness",
  121: "121-we-need-self-control", 122: "122-be-steadfast-immovable", 123: "123-loyally-submitting-to-theocratic-order",
  124: "124-ever-loyal", 125: "125-happy-are-the-merciful", 126: "126-stay-awake-stand-firm-grow-mighty",
  127: "127-sort-of-person-i-should-be", 128: "128-endure-to-the-end", 129: "129-keep-enduring",
  130: "130-be-forgiving", 131: "131-what-god-yoked-together", 132: "132-now-we-are-one",
  133: "133-worship-jehovah-during-youth", 134: "134-children-are-a-trust-from-god", 135: "135-jehovahs-appeal-be-wise-my-son",
  136: "136-perfect-wage-from-jehovah", 137: "137-faithful-women-christian-sisters", 138: "138-beauty-in-gray-headedness",
  139: "139-when-all-is-new", 140: "140-life-without-end", 141: "141-miracle-of-life",
  142: "142-holding-to-our-hope", 143: "143-keep-working-watching-waiting", 144: "144-keep-eye-on-the-prize",
  145: "145-gods-promise-of-paradise", 146: "146-making-all-things-new", 147: "147-life-everlasting-promised",
  148: "148-jehovah-provides-escape", 149: "149-a-victory-song", 150: "150-seek-god-for-deliverance",
  151: "151-he-will-call", 152: "152-a-place-that-will-bring-you-praise", 153: "153-give-me-courage",
  154: "154-unfailing-love", 155: "155-our-joy-eternally", 156: "156-with-eyes-of-faith",
  157: "157-peace-at-last", 158: "158-it-will-not-be-late", 159: "159-give-jehovah-glory",
  160: "160-good-news", 161: "161-to-do-your-will-is-my-delight", 162: "162-my-spiritual-need",
  163: "163-happy-are-these-eyes", 164: "164-trust-in-you"
};

const state = {
  songs: [],
  index: -1,
  query: "",
  lyricQuery: "",
  lyricCache: new Map(),
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
  install: null,
  lyricSearch: document.getElementById("lyricSearch"),
  lyricSearchToggle: document.getElementById("lyricSearchToggle"),
  lyricSearchWrap: document.getElementById("lyricSearchWrap"),
  toTop: document.getElementById("toTopBtn"),
  playAll: document.getElementById("playAllBtn"),
  playFav: document.getElementById("playFavBtn"),
  startStatus: document.getElementById("startStatus"),
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
  el.menu.textContent = "Lieder";
}

function visibleSongs() {
  const q = state.query.trim().toLowerCase();
  return state.songs.filter((song) => {
    if (state.favoritesOnly && !state.favorites.has(song.id)) return false;
    if (state.category && song.category !== state.category) return false;
    if (state.lyricQuery) {
      const text = (state.lyricCache.get(song.id) || "").toLowerCase();
      if (!text.includes(state.lyricQuery)) return false;
    }
    return song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
  });
}

async function cacheLyric(song) {
  if (state.lyricCache.has(song.id)) return;
  const local = song.lyrics || `lyrics/sjj_E_${String(song.number).padStart(2, "0")}.lrc`;
  try {
    const response = await fetch(local, { cache: "force-cache" });
    state.lyricCache.set(song.id, response.ok ? await response.text() : "");
  } catch {
    state.lyricCache.set(song.id, "");
  }
}

async function searchLyrics(query) {
  state.lyricQuery = query.trim().toLowerCase();
  if (!state.lyricQuery) {
    renderList();
    return;
  }
  const pending = state.songs.filter((song) => !state.lyricCache.has(song.id));
  await Promise.all(pending.slice(0, 24).map(cacheLyric));
  renderList();
  if (pending.length > 24) searchLyrics(query);
}
function fillCategories() {
  const names = [...new Set(state.songs.map((song) => song.category).filter(Boolean))].sort();
  const current = state.category;
  el.category.innerHTML = `<option value="">Alle Kategorien</option>`;
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    el.category.append(option);
  });
  el.category.value = current;
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
  const panel = document.getElementById("startPanel");
  if (panel) panel.hidden = true;
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

function officialUrl(song) {
  const path = PAGE[song.number];
  if (!path) return "https://www.jw.org/en/library/music-songs/sing-out-joyfully/";
  return `https://www.jw.org/en/library/music-songs/sing-out-joyfully/${path}/`;
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
  const paths = [file, `songs/${file}`, `songs1/${file}`, `songs2/${file}`];
  const cdn = paths.map((path) => `https://cdn.jsdelivr.net/gh/Carag7/JW-Musik@main/${path}`);
  return [...paths, ...cdn, remote];
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
  el.favorite.hidden = false;
  el.favorite.setAttribute("aria-pressed", String(fav));
  el.favorite.textContent = fav ? "★" : "☆";
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
  const target = active.offsetTop - (el.lyrics.clientHeight / 2) + (active.offsetHeight / 2);
  el.lyrics.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  setTimeout(() => { state.centering = false; }, 450);
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
  if (el.favorite) {
    el.favorite.hidden = !song;
    el.favorite.setAttribute("aria-pressed", String(song && state.favorites.has(song.id)));
    el.favorite.textContent = song && state.favorites.has(song.id) ? "★" : "☆";
  }
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
    if (el.startStatus) el.startStatus.textContent = `${data.length} Lieder bereit`;
    renderList();
  } catch (error) {
    el.title.textContent = "Lieder nicht geladen";
    el.status.textContent = error.message;
  }
}

function playRandom(favorites) {
  const pool = favorites ? state.songs.filter((song) => state.favorites.has(song.id)) : state.songs;
  if (!pool.length) {
    el.status.textContent = favorites ? "Keine Favoriten markiert" : "Keine Lieder";
    return;
  }
  state.shuffle = true;
  state.playFavorites = favorites;
  el.shuffleBtn.setAttribute("aria-pressed", "true");
  el.favoritesPlay.setAttribute("aria-pressed", String(favorites));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  selectSong(state.songs.indexOf(pick), true);
}
function bind() {
  el.lyricSearchToggle.addEventListener("click", () => {
    el.lyricSearchWrap.hidden = !el.lyricSearchWrap.hidden;
    if (!el.lyricSearchWrap.hidden) el.lyricSearch.focus();
  });
  el.lyricSearch.addEventListener("input", () => searchLyrics(el.lyricSearch.value));
  el.toTop.addEventListener("click", () => el.list.scrollIntoView({ block: "start" }));
  el.playAll.addEventListener("click", () => playRandom(false));
  el.playFav.addEventListener("click", () => playRandom(true));
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
    el.favoritesToggle.textContent = state.favoritesOnly ? "Favoriten" : "alle Lieder";
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
    el.status.textContent = `Audio-Fehler ${code}. Datei fehlt im Repository, das iPhone spielt den Release nicht.`;
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
  window.addEventListener("beforeinstallprompt", () => {});
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
