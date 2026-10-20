const STORAGE = {
  favorites: "teslaKaraokeFavorites",
  playlists: "teslaKaraokePlaylists",
  scale: "teslaKaraokeLyricsScale",
  listSize: "teslaKaraokeListSize",
  auth: "teslaKaraokeAuth"
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
  playlists: [],
  activePlaylist: "",
  selectMode: false,
  mode: "songs",
  listSize: 16,
  lyrics: [],
  scale: 42,
  wakeLock: null,
  sidebarOpen: true,
  userScrolling: false,
  scrollTimer: 0,
  centering: false,
  ludwtWeek: "",
  selectToken: 0,
  canplayHandler: null,
  wasPlaying: false,
  timeOffset: 0
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
  prevSong: document.getElementById("prevSong"),
  nextSong: document.getElementById("nextSong"),
  back15: document.getElementById("back15"),
  fwd15: document.getElementById("fwd15"),
  menu: document.getElementById("menuToggle")
};

/* ---------- Eigene Dialoge (statt confirm/prompt/alert) ---------- */
function uiDialog(opts) {
  return new Promise((resolve) => {
    const modal = document.getElementById("dialogModal");
    const form = document.getElementById("dialogForm");
    const body = document.getElementById("dialogBody");
    const box = document.getElementById("dialogButtons");
    const input = document.getElementById("dialogInput");
    const eyebrow = document.getElementById("dialogEyebrow");
    eyebrow.textContent = opts.eyebrow || "";
    eyebrow.hidden = !opts.eyebrow;
    document.getElementById("dialogTitle").textContent = opts.title || "";
    body.replaceChildren();
    (opts.lines || []).forEach((line) => {
      const item = typeof line === "string" ? { text: line } : line;
      const p = document.createElement("p");
      p.textContent = item.text;
      if (item.cls) p.className = item.cls;
      body.append(p);
    });
    if (opts.input) {
      input.hidden = false;
      input.type = opts.input.type || "text";
      input.placeholder = opts.input.placeholder || "";
      input.value = opts.input.value || "";
      input.inputMode = opts.input.inputMode || "";
    } else {
      input.hidden = true;
      input.value = "";
    }
    box.replaceChildren();
    let primary = null;
    let onKey = null;
    const finish = (value) => {
      modal.hidden = true;
      form.onsubmit = null;
      document.removeEventListener("keydown", onKey, true);
      resolve(value);
    };
    (opts.buttons || [{ value: true, label: "OK", kind: "primary" }]).forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `chip dlg-btn ${b.kind || ""}`.trim();
      if (b.dir) {
        const dir = document.createElement("small");
        dir.className = "dlg-dir";
        dir.textContent = b.dir;
        btn.append(dir);
      }
      const label = document.createElement("strong");
      label.textContent = b.label;
      btn.append(label);
      if (b.sub) {
        const sub = document.createElement("small");
        sub.className = "dlg-sub";
        sub.textContent = b.sub;
        btn.append(sub);
      }
      btn.addEventListener("click", () => finish(opts.input && b.kind !== "cancel" ? input.value : b.value));
      box.append(btn);
      if (!primary && b.kind !== "cancel") primary = btn;
    });
    form.onsubmit = (event) => {
      event.preventDefault();
      if (primary) primary.click();
    };
    onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        finish(opts.input ? null : (opts.cancelValue === undefined ? null : opts.cancelValue));
      }
    };
    document.addEventListener("keydown", onKey, true);
    modal.hidden = false;
    if (opts.input) input.focus();
    else if (primary) primary.focus();
  });
}

function uiConfirm(o) {
  return uiDialog({
    eyebrow: o.eyebrow,
    title: o.title,
    lines: o.lines || (o.text ? [o.text] : []),
    cancelValue: false,
    buttons: [
      { value: true, kind: o.danger ? "danger" : "primary", label: o.ok || "OK" },
      { value: false, kind: "cancel", label: o.cancel || "Abbrechen" }
    ]
  }).then((value) => value === true);
}

function uiAlert(title, text) {
  return uiDialog({ title, lines: text ? [text] : [], buttons: [{ value: true, kind: "primary", label: "OK" }] });
}

function uiPrompt(o) {
  return uiDialog({
    eyebrow: o.eyebrow,
    title: o.title,
    lines: o.text ? [o.text] : [],
    input: { type: o.type || "text", placeholder: o.placeholder || "", value: o.value || "", inputMode: o.inputMode },
    buttons: [
      { value: "ok", kind: "primary", label: o.ok || "OK" },
      { value: null, kind: "cancel", label: "Abbrechen" }
    ]
  });
}
window.uiDialog = uiDialog;

let toastTimer = 0;
function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast || !text) return;
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}

function setStatus(text, kind) {
  el.status.textContent = text;
  el.status.classList.remove("is-play", "is-pause", "is-info");
  if (kind) el.status.classList.add(kind);
}

function formatTime(seconds, ms) {
  if (!Number.isFinite(seconds) || seconds < 0) return ms ? "0:00.000" : "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const base = `${mins}:${String(secs).padStart(2, "0")}`;
  if (!ms) return base;
  const milli = Math.floor((seconds % 1) * 1000);
  return `${base}.${String(milli).padStart(3, "0")}`;
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

function goHome() {
  location.reload();
}

function setSidebar(open) {
  state.sidebarOpen = open;
  el.app.classList.toggle("sidebar-hidden", !open);
  el.menu.setAttribute("aria-expanded", String(open && state.mode === "songs"));
  el.menu.textContent = "Lieder";
}

function visibleSongs() {
  if (state.mode === "ludwt") return ludwtSongs();
  const q = state.query.trim().toLowerCase();
  const playlist = currentPlaylist();
  let songs = state.songs;
  if (state.mode === "playlists" && playlist && !state.selectMode) {
    const order = new Map(playlist.songs.map((id, index) => [id, index]));
    songs = state.songs.filter((song) => order.has(song.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
  }
  return songs.filter((song) => {
    if (state.mode === "songs" && state.favoritesOnly && !state.favorites.has(song.id)) return false;
    if (state.category && song.category !== state.category) return false;
    if (state.lyricQuery) {
      const text = (state.lyricCache.get(song.id) || "").toLowerCase();
      if (!text.includes(state.lyricQuery)) return false;
    }
    return song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
  });
}

function ludwtRows() {
  return window.LUDWT ? LUDWT.rows(state.ludwtWeek, state.songs) : [];
}

function ludwtSongs() {
  const seen = new Set();
  return ludwtRows()
    .filter((row) => row.song && !seen.has(row.song.id) && seen.add(row.song.id))
    .map((row) => row.song);
}

function fillLudwtWeeks() {
  const select = document.getElementById("ludwtWeek");
  const info = document.getElementById("ludwtInfo");
  if (!window.LUDWT || !select) return;
  if (!state.ludwtWeek || !LUDWT.hasWeek(state.ludwtWeek)) state.ludwtWeek = LUDWT.defaultWeek();
  LUDWT.fillWeekSelect(select, state.ludwtWeek);
  updateLudwtNav();
  const count = LUDWT.weekCount();
  info.textContent = count
    ? `${count} ${count === 1 ? "Woche" : "Wochen"} heruntergeladen`
    : "Noch keine Wochen geladen. Unter „Synchronisieren“ aktualisieren.";
}

function renderLudwtList() {
  const rows = ludwtRows();
  el.count.textContent = String(rows.length);
  el.list.innerHTML = "";
  if (!rows.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Keine Lieder für diese Woche";
    el.list.append(empty);
    return;
  }
  rows.forEach((row) => {
    const item = document.createElement("li");
    item.className = "song-row";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "song-btn";
    if (row.song) button.dataset.id = row.song.id;
    const number = document.createElement("strong");
    number.textContent = row.song ? row.song.id : String(row.number).padStart(3, "0");
    const text = document.createElement("div");
    text.className = "song-text";
    const title = document.createElement("span");
    title.textContent = row.song ? `${state.favorites.has(row.song.id) ? "★ " : ""}${row.song.title}` : "nicht in der Liederliste";
    text.append(title, LUDWT.whenEl(row));
    button.append(number, text);
    if (row.song) {
      if (state.songs[state.index] === row.song) button.classList.add("active");
      button.addEventListener("click", () => selectSong(state.songs.indexOf(row.song), true));
    } else {
      button.disabled = true;
      button.classList.add("missing");
    }
    item.append(button);
    el.list.append(item);
  });
  applyListSize();
  LUDWT.fitLabels(el.list);
}

function updateLudwtNav() {
  if (!window.LUDWT) return;
  const list = LUDWT.weeks();
  const at = list.findIndex((week) => week.montag === state.ludwtWeek);
  document.getElementById("ludwtPrev").disabled = at <= 0;
  document.getElementById("ludwtNext").disabled = at < 0 || at >= list.length - 1;
}

function shiftLudwtWeek(delta) {
  if (!window.LUDWT) return;
  const list = LUDWT.weeks();
  const at = list.findIndex((week) => week.montag === state.ludwtWeek);
  const next = list[at + delta];
  if (!next) return;
  state.ludwtWeek = next.montag;
  document.getElementById("ludwtWeek").value = next.montag;
  renderList();
  updateNeighbors();
  updateLudwtNav();
}

function leaveLudwt() {
  document.body.classList.remove("ludwt-mode");
  document.getElementById("ludwtBar").hidden = true;
  document.getElementById("ludwtToggle").setAttribute("aria-pressed", "false");
}

function currentPlaylist() {
  return state.playlists.find((list) => list.id === state.activePlaylist) || null;
}

function loadPlaylists() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.playlists) || "[]");
    state.playlists = Array.isArray(raw) ? raw : [];
  } catch {
    state.playlists = [];
  }
}

function savePlaylists() {
  localStorage.setItem(STORAGE.playlists, JSON.stringify(state.playlists));
}

function fillPlaylists() {
  const select = document.getElementById("playlistSelect");
  const box = document.getElementById("playlistButtons");
  const glass = !document.getElementById("lyricSearchWrap").hidden;
  if (select) {
    document.getElementById("playlistSelectWrap").hidden = !glass;
    select.hidden = !glass;
    const current = state.activePlaylist;
    select.innerHTML = `<option value="">Liste wählen</option>`;
    state.playlists.forEach((list) => {
      const option = document.createElement("option");
      option.value = list.id;
      option.textContent = list.name;
      select.append(option);
    });
    const create = document.createElement("option");
    create.value = "__new__";
    create.textContent = "neue Liste erstellen";
    select.append(create);
    select.value = current || "";
  }
  if (box) {
    box.hidden = false;
    box.innerHTML = "";
    state.playlists.forEach((list) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = list.name;
      if (list.id === state.activePlaylist) button.setAttribute("aria-pressed", "true");
      button.addEventListener("click", () => {
        state.activePlaylist = list.id;
        state.selectMode = false;
        fillPlaylists();
        renderList();
      });
      box.append(button);
    });
    if (glass) {
      const create = document.createElement("button");
      create.type = "button";
      create.className = "chip";
      create.textContent = "neue Liste erstellen";
      create.addEventListener("click", () => {
        document.getElementById("playlistCreateBox").hidden = false;
      });
      box.append(create);
    }
  }
}

function updateEditTools() {
  const glass = !document.getElementById("lyricSearchWrap").hidden;
  const edit = document.getElementById("playlistEdit");
  if (edit) edit.hidden = !(glass && state.mode === "playlists" && state.activePlaylist);
  document.getElementById("logoutBtn").hidden = !glass;
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
  const list = document.getElementById("categoryList");
  if (!list) return;
  list.innerHTML = "";
  ["", ...names].forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = name || "Alle Kategorien";
    if (name === state.category) button.setAttribute("aria-pressed", "true");
    button.addEventListener("click", () => {
      state.category = name;
      el.category.value = name;
      list.hidden = true;
      renderList();
    });
    list.append(button);
  });
}

function renderList() {
  if (state.mode === "ludwt") { renderLudwtList(); return; }
  const songs = visibleSongs();
  el.count.textContent = String(songs.length);
  el.list.innerHTML = "";
  const playlist = currentPlaylist();
  songs.forEach((song) => {
    const item = document.createElement("li");
    item.className = "song-row";
    if (state.mode === "songs" && !document.getElementById("lyricSearchWrap").hidden) {
      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "song-check";
      check.checked = state.favorites.has(song.id);
      check.addEventListener("click", (event) => event.stopPropagation());
      check.addEventListener("change", () => {
        if (check.checked) state.favorites.add(song.id);
        else state.favorites.delete(song.id);
        saveFavorites();
      });
      const up = document.createElement("button");
      up.type = "button";
      up.className = "sort-btn";
      up.textContent = "↑";
      const down = document.createElement("button");
      down.type = "button";
      down.className = "sort-btn";
      down.textContent = "↓";
      item.append(check, up, down);
    }
    if (state.mode === "playlists" && playlist) {
      const glass = !document.getElementById("lyricSearchWrap").hidden;
      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "song-check";
      check.checked = playlist.songs.includes(song.id);
      check.hidden = !state.selectMode || !glass;
      check.addEventListener("click", (event) => event.stopPropagation());
      check.addEventListener("change", () => togglePlaylistSong(song.id, check.checked));
      item.append(check);
      if (!state.selectMode && glass) {
        const up = document.createElement("button");
        up.type = "button";
        up.className = "sort-btn";
        up.textContent = "↑";
        up.addEventListener("click", (event) => { event.stopPropagation(); movePlaylistSong(song.id, -1); });
        const down = document.createElement("button");
        down.type = "button";
        down.className = "sort-btn";
        down.textContent = "↓";
        down.addEventListener("click", (event) => { event.stopPropagation(); movePlaylistSong(song.id, 1); });
        item.append(up, down);
      }
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "song-btn";
    button.dataset.id = song.id;
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
  applyListSize();
}

function togglePlaylistSong(id, on) {
  const playlist = currentPlaylist();
  if (!playlist) return;
  playlist.songs = on ? [...playlist.songs.filter((item) => item !== id), id] : playlist.songs.filter((item) => item !== id);
  savePlaylists();
}

function movePlaylistSong(id, delta) {
  const playlist = currentPlaylist();
  if (!playlist) return;
  const at = playlist.songs.indexOf(id);
  const next = at + delta;
  if (at < 0 || next < 0 || next >= playlist.songs.length) return;
  const [item] = playlist.songs.splice(at, 1);
  playlist.songs.splice(next, 0, item);
  savePlaylists();
  renderList();
}

/* Nur die Markierung des aktuellen Lieds ändern, statt die ganze Liste neu aufzubauen (schneller im Tesla) */
function markActive() {
  const current = state.songs[state.index];
  let target = null;
  document.querySelectorAll("#songList .song-btn").forEach((button) => {
    const on = Boolean(current) && button.dataset.id === current.id;
    button.classList.toggle("active", on);
    if (on && !target) target = button;
  });
  if (target && state.sidebarOpen) target.scrollIntoView({ block: "nearest" });
}

function applyListSize() {
  document.documentElement.style.setProperty("--list-size", `${state.listSize}px`);
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
  el.lyrics.scrollTop = 0;
  if (!lines || !lines.length) {
    el.lyrics.innerHTML = '<p class="empty">Keine Liedtexte gefunden</p>';
    return;
  }
  lines.forEach((line) => {
    const row = document.createElement("p");
    row.className = "lyric-line";
    row.dataset.time = line.time;
    row.textContent = line.text;
    row.addEventListener("click", () => seekToLine(line.time));
    el.lyrics.append(row);
  });
  if (document.body.classList.contains("edit-mode")) attachTimecodeUi();
}

function seekToLine(time) {
  if (!el.audio.src && !el.audio.currentSrc) return;
  el.audio.currentTime = Math.max(0, time);
  if (el.audio.paused) el.audio.play().catch(() => {});
  el.play.textContent = "❚❚";
  setStatus("Spielt", "is-play");
}

function showTitleIntro(song) {
  const intro = document.getElementById("titleIntro");
  document.getElementById("introNumber").textContent = `LIED ${song.id}`;
  document.getElementById("introTitle").textContent = song.title;
  intro.hidden = false;
  intro.classList.remove("is-out");
  state.introActive = true;
}

function hideTitleIntro() {
  const intro = document.getElementById("titleIntro");
  if (intro.hidden) return;
  intro.classList.add("is-out");
  state.introActive = false;
  state.holdTop = true;
  el.lyrics.scrollTop = 0;
  setTimeout(() => { intro.hidden = true; }, 500);
  setTimeout(() => { state.holdTop = false; }, 2500);
}

function officialUrl(song) {
  const path = PAGE[song.number];
  if (!path) return "https://www.jw.org/en/library/music-songs/sing-out-joyfully/";
  return `https://www.jw.org/en/library/music-songs/sing-out-joyfully/${path}/`;
}

function songLabel(index) {
  const song = state.songs[index];
  return song ? `${song.id} ${song.title}` : "—";
}

function updateNeighbors() {
  if (!el.prevSong || !el.nextSong || state.index < 0) return;
  const pool = state.mode === "ludwt"
    ? ludwtSongs()
    : (state.playFavorites ? state.songs.filter((song) => state.favorites.has(song.id)) : state.songs);
  const current = state.songs[state.index];
  const pos = pool.indexOf(current);
  el.prevSong.textContent = pos > 0 ? songLabel(state.songs.indexOf(pool[pos - 1])) : "—";
  el.nextSong.textContent = pos >= 0 && pos < pool.length - 1 ? songLabel(state.songs.indexOf(pool[pos + 1])) : "—";
}
function showLyricLink(song) {
  if (el.lyricsLink) el.lyricsLink.href = officialUrl(song);
}

async function loadLyrics(song) {
  const token = state.selectToken;
  const stale = () => token !== state.selectToken;
  state.lyrics = [];
  try {
    const res = await fetch(`${SYNC_BASE}/sync/lrc-${song.id}`);
    if (stale()) return;
    if (res.ok) {
      const text = await res.text();
      if (stale()) return;
      if (text.includes("[")) {
        state.lyrics = parseLrc(text);
        renderLyrics(state.lyrics);
        return;
      }
    }
  } catch {}
  const saved = localStorage.getItem(`lrc-${song.id}`);
  if (saved) {
    try {
      state.lyrics = JSON.parse(saved);
      renderLyrics(state.lyrics);
      return;
    } catch {}
  }
  const local = song.lyrics || `lyrics/sjj_E_${String(song.number).padStart(2, "0")}.lrc`;
  const remote = `https://github.com/Carag7/JW-Musik/releases/download/JW-Lyrics/sjj_E_${String(song.number).padStart(2, "0")}.lrc`;
  for (const url of [local, remote]) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (stale()) return;
      if (!response.ok) continue;
      const text = await response.text();
      if (stale()) return;
      if (!text.includes("[")) continue;
      state.lyrics = parseLrc(text);
      renderLyrics(state.lyrics);
      return;
    } catch {}
  }
  if (!stale()) renderLyrics([]);
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
  const optional = (action, handler) => {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* nicht überall unterstützt */ }
  };
  optional("seekbackward", () => skip(-15));
  optional("seekforward", () => skip(15));
  optional("seekto", (details) => {
    if (details && Number.isFinite(details.seekTime)) el.audio.currentTime = details.seekTime;
  });
}

async function selectSong(index, autoplay) {
  if (index < 0 || index >= state.songs.length) return;
  state.index = index;
  const token = (state.selectToken = (state.selectToken || 0) + 1);
  state.audioTry = 0;
  state.waveData = null;
  const song = state.songs[index];
  el.number.textContent = `Lied ${song.id}`;
  el.title.textContent = song.title;
  el.songCategory.textContent = song.category || "";
  el.status.textContent = "Audio wird geladen …";
  const fav = state.favorites.has(song.id);
  el.number.hidden = false;
  el.favorite.hidden = false;
  document.getElementById("titleRow").hidden = false;
  el.favorite.setAttribute("aria-pressed", String(fav));
  el.favorite.textContent = fav ? "★" : "☆";
  el.progress.value = "0";
  el.currentTime.textContent = "0:00";
  el.duration.textContent = "0:00";
  el.play.textContent = "▶";
  markActive();
  showLyricLink(song);
  updateNeighbors();
  // Liedtext und Audio-Quelle gleichzeitig suchen: Wiedergabe startet schneller
  const [, url] = await Promise.all([loadLyrics(song), resolveAudio(song)]);
  if (token !== state.selectToken) return;  // inzwischen anderes Lied gewählt
  state.currentAudio = url;
  setAudioSource(url);
  setMediaSession(song);
  el.app.classList.add("song-open");
  if (!document.fullscreenElement && !document.body.classList.contains("pseudo-fullscreen")) {
    setSidebar(false);
  }
  if (state.canplayHandler) el.audio.removeEventListener("canplay", state.canplayHandler);
  state.canplayHandler = null;
  if (autoplay) {
    showTitleIntro(song);
    state.canplayHandler = () => {
      state.canplayHandler = null;
      if (token === state.selectToken && el.audio.paused) togglePlay();
    };
    el.audio.addEventListener("canplay", state.canplayHandler, { once: true });
    setTimeout(() => { if (state.introActive) hideTitleIntro(); }, 4000);
  }
}

function togglePlay() {
  if (!state.currentAudio) {
    const pool = visibleSongs();
    const first = pool[0] || state.songs[0];
    if (first) {
      selectSong(state.songs.indexOf(first), true);
      return;
    }
    el.status.textContent = "Bitte zuerst ein Lied wählen";
    return;
  }
  if (!el.audio.src) el.audio.src = state.currentAudio;
  if (el.audio.paused) {
    el.audio.play().then(() => {
      el.play.textContent = "❚❚";
      setStatus("Spielt", "is-play");
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      requestWakeLock();
    }).catch(() => {
      el.status.textContent = "Wiedergabe blockiert. Tippe noch einmal auf Play.";
    });
  } else {
    el.audio.pause();
    el.play.textContent = "▶";
    setStatus("Pause", "is-pause");
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
  }
}

function centerActive(force) {
  if (state.introActive || state.holdTop || state.karaokeHold) return;
  if (state.userScrolling && !force) return;
  const active = el.lyrics.querySelector(".lyric-line.active");
  if (!active) return;
  state.centering = true;
  const target = active.offsetTop - (el.lyrics.clientHeight * 0.33) + (active.offsetHeight / 2);
  el.lyrics.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  setTimeout(() => { state.centering = false; }, 450);
}

function updateLyrics() {
  const lines = el.lyrics.querySelectorAll(".lyric-line");
  if (!lines.length) return;
  const now = el.audio.currentTime || 0;
  const first = Number(lines[0].dataset.time);
  if (state.introActive && now >= Math.max(0, first - 4)) hideTitleIntro();
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
  el.currentTime.textContent = formatTime(current, false);
  el.duration.textContent = formatTime(duration, false);
  updateLyrics();
  if (state.drawWave && !document.getElementById("spectrum").hidden) state.drawWave();
  if (document.body.classList.contains("edit-mode")) {
    el.lyrics.querySelectorAll(".now-btn").forEach((btn) => {
      btn.textContent = formatTime(current, true);
    });
  }
}

function seek() {
  const duration = el.audio.duration;
  if (!duration || !Number.isFinite(duration)) return;
  el.audio.currentTime = duration * (Number(el.progress.value) / 1000);
}

function playPool() {
  if (state.mode === "ludwt") return ludwtSongs();
  const playlist = currentPlaylist();
  if (state.mode === "playlists" && playlist) {
    const order = new Map(playlist.songs.map((id, index) => [id, index]));
    return state.songs.filter((song) => order.has(song.id)).sort((a, b) => order.get(a.id) - order.get(b.id));
  }
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
  if (state.shuffle && state.mode !== "ludwt") {
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
      el.fullscreen.textContent = "Vollbild beenden";
      document.body.classList.add("is-fullscreen");
      const bar = document.getElementById("splitHandle");
      bar.hidden = true;
      bar.style.display = "none";
      return;
    } catch {
      /* Tesla ignoriert die API oft */
    }
  } else if (apiOpen && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
      el.fullscreen.textContent = "Vollbild";
      document.body.classList.remove("is-fullscreen");
      return;
    } catch {
      /* CSS-Vollbild nehmen */
    }
  }
  document.body.classList.toggle("pseudo-fullscreen");
  document.body.classList.toggle("is-fullscreen", document.body.classList.contains("pseudo-fullscreen"));
  document.getElementById("splitHandle").hidden = document.body.classList.contains("pseudo-fullscreen");
  el.fullscreen.textContent = document.body.classList.contains("pseudo-fullscreen") ? "Vollbild beenden" : "Vollbild";
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
    if (favorites) {
      const modal = document.getElementById("warnModal");
      document.querySelector("#warnForm h2").textContent = "Favoriten";
      document.querySelector("#warnForm p").textContent = "Bitte wähle zuerst deine Favoriten aus damit ich sie abspielen kann";
      document.querySelector("#warnForm button[type=submit]").textContent = "OK";
      document.getElementById("warnCancel").hidden = true;
      modal.hidden = false;
      document.getElementById("warnForm").onsubmit = (event) => { event.preventDefault(); modal.hidden = true; document.getElementById("warnCancel").hidden = false; };
    }
    el.status.textContent = favorites ? "Keine Favoriten markiert" : "Keine Lieder";
    return;
  }
  state.shuffle = true;
  state.playFavorites = favorites;
  el.shuffleBtn.setAttribute("aria-pressed", "true");
  const pick = pool[Math.floor(Math.random() * pool.length)];
  selectSong(state.songs.indexOf(pick), true);
}
/* Neu laden: Wiedergabe stoppen, Zwischenspeicher + Service Worker leeren, Seite frisch laden.
   Favoriten, Listen und Sync-Daten (localStorage) bleiben erhalten. */
async function hardRefresh() {
  const btn = document.getElementById("refreshBtn");
  btn.disabled = true;
  btn.textContent = "Lädt …";
  try { el.audio.pause(); el.audio.removeAttribute("src"); el.audio.load(); } catch { /* egal */ }
  try { if (state.wakeLock) { await state.wakeLock.release(); state.wakeLock = null; } } catch { /* egal */ }
  try {
    if ("caches" in window) await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
  } catch { /* egal */ }
  try {
    if ("serviceWorker" in navigator) await Promise.all((await navigator.serviceWorker.getRegistrations()).map((reg) => reg.unregister()));
  } catch { /* egal */ }
  location.replace(`${location.pathname}?r=${Date.now()}`);
}

/* Nach Ein-/Aussteigen im Tesla: Display-Sperre neu anfordern, kaputte Audio-Verbindung selbst reparieren */
function recoverAfterResume() {
  if (document.visibilityState !== "visible") return;
  if (!el.audio.paused) requestWakeLock();
  const broken = state.currentAudio && (el.audio.error || el.audio.networkState === 3);
  if (!broken) return;
  const time = el.audio.currentTime || 0;
  const resume = state.wasPlaying;
  setAudioSource(state.currentAudio);
  el.audio.addEventListener("loadedmetadata", () => {
    try { el.audio.currentTime = time; } catch { /* egal */ }
    if (resume) el.audio.play().then(() => { el.play.textContent = "❚❚"; }).catch(() => {});
  }, { once: true });
}

function bind() {
  el.lyricSearchToggle.addEventListener("click", () => {
    const open = el.lyricSearchWrap.hidden;
    el.lyricSearchWrap.hidden = !open;
    document.body.classList.toggle("glass-open", open);
    el.lyricSearchToggle.setAttribute("aria-pressed", String(open));
    document.getElementById("listTools").hidden = !open;
    document.getElementById("favTools").hidden = !open;
    document.getElementById("waveToggle").hidden = !open;
    document.getElementById("refreshBtn").hidden = !open;
    document.getElementById("splitHandle").hidden = !open || document.fullscreenElement || document.body.classList.contains("pseudo-fullscreen");
    if (state.mode === "playlists") fillPlaylists();
    updateEditTools();
    renderList();
    if (open) el.lyricSearch.focus();
  });
  el.lyricSearch.addEventListener("input", () => searchLyrics(el.lyricSearch.value));
  el.toTop.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.scrollTop = 0;
    if (el.list) el.list.scrollTop = 0;
  });
  el.playAll.addEventListener("click", () => playRandom(false));
  el.playFav.addEventListener("click", () => playRandom(true));
  el.search.addEventListener("input", () => {
    state.query = el.search.value;
    renderList();
  });
  el.category.addEventListener("mousedown", (event) => {
    event.preventDefault();
    const list = document.getElementById("categoryList");
    list.hidden = !list.hidden;
  });
  el.menu.addEventListener("click", () => {
    if (state.mode === "songs" && state.sidebarOpen) {
      setSidebar(false);
      return;
    }
    state.mode = "songs";
    leaveLudwt();
    document.getElementById("playlistBar").hidden = true;
    document.getElementById("eigeneToggle").setAttribute("aria-pressed", "false");
    el.menu.setAttribute("aria-expanded", "true");
    el.favoritesToggle.textContent = state.favoritesOnly ? "Favoriten" : "alle Lieder";
    setSidebar(true);
    renderList();
  });
  document.getElementById("eigeneToggle").addEventListener("click", () => {
    if (state.mode === "playlists" && state.sidebarOpen) {
      setSidebar(false);
      return;
    }
    state.mode = "playlists";
    leaveLudwt();
    document.getElementById("playlistBar").hidden = false;
    document.getElementById("playlistSelectWrap").hidden = false;
    document.getElementById("eigeneToggle").setAttribute("aria-pressed", "true");
    el.menu.setAttribute("aria-expanded", "false");
    el.favoritesToggle.textContent = document.getElementById("lyricSearchWrap").hidden ? "Wiedergabe" : (state.selectMode ? "alle Lieder" : "Auswahl");
    setSidebar(true);
    fillPlaylists();
    requestAnimationFrame(() => fillPlaylists());
    updateEditTools();
    renderList();
  });
  document.getElementById("ludwtToggle").addEventListener("click", async () => {
    if (state.mode === "ludwt" && state.sidebarOpen) {
      setSidebar(false);
      return;
    }
    state.mode = "ludwt";
    document.body.classList.add("ludwt-mode");
    document.getElementById("playlistBar").hidden = true;
    document.getElementById("ludwtBar").hidden = false;
    document.getElementById("ludwtToggle").setAttribute("aria-pressed", "true");
    document.getElementById("eigeneToggle").setAttribute("aria-pressed", "false");
    el.menu.setAttribute("aria-expanded", "false");
    setSidebar(true);
    renderList();
    if (window.LUDWT) {
      await LUDWT.ensureLoaded();
      fillLudwtWeeks();
      renderList();
    }
  });
  document.getElementById("ludwtWeek").addEventListener("change", (event) => {
    state.ludwtWeek = event.target.value;
    renderList();
    updateNeighbors();
    updateLudwtNav();
  });
  document.getElementById("ludwtPlay").addEventListener("click", () => {
    const pool = ludwtSongs();
    if (!pool.length) {
      el.status.textContent = "Keine abspielbaren Lieder in dieser Woche";
      return;
    }
    state.shuffle = false;
    el.shuffleBtn.setAttribute("aria-pressed", "false");
    selectSong(state.songs.indexOf(pool[0]), true);
  });
  document.getElementById("playlistSelect").addEventListener("change", (event) => {
    if (event.target.value === "__new__") {
      document.getElementById("playlistCreateBox").hidden = false;
      state.activePlaylist = "";
      document.getElementById("playlistEdit").hidden = true;
      renderList();
      return;
    }
    document.getElementById("playlistCreateBox").hidden = true;
    state.activePlaylist = event.target.value;
    updateEditTools();
    renderList();
  });
  document.getElementById("playlistCreate").addEventListener("click", () => {
    const name = document.getElementById("playlistName").value.trim();
    if (!name) return;
    const list = { id: `${Date.now()}`, name, songs: [] };
    state.playlists.push(list);
    state.activePlaylist = list.id;
    state.selectMode = true;
    savePlaylists();
    fillPlaylists();
    document.getElementById("playlistName").value = "";
    document.getElementById("playlistCreateBox").hidden = true;
    updateEditTools();
    el.favoritesToggle.textContent = "alle Lieder";
    renderList();
  });
  document.getElementById("playlistRenameBtn").addEventListener("click", () => {
    const playlist = currentPlaylist();
    const name = document.getElementById("playlistRename").value.trim();
    if (!playlist || !name) return;
    playlist.name = name;
    savePlaylists();
    fillPlaylists();
    document.getElementById("playlistRename").value = "";
  });
  document.getElementById("playlistDelete").addEventListener("click", () => {
    document.getElementById("playlistDeleteConfirm").hidden = false;
  });
  document.getElementById("playlistDeleteConfirm").addEventListener("click", () => {
    state.playlists = state.playlists.filter((list) => list.id !== state.activePlaylist);
    state.activePlaylist = "";
    savePlaylists();
    fillPlaylists();
    updateEditTools();
    document.getElementById("playlistDeleteConfirm").hidden = true;
    renderList();
  });
  document.getElementById("homeBtn").addEventListener("click", goHome);
  let listSize = Number(localStorage.getItem(STORAGE.listSize) || 16);
  state.listSize = listSize;
  applyListSize();
  document.getElementById("listSmaller").addEventListener("click", () => {
    state.listSize = Math.max(12, state.listSize - 3);
    localStorage.setItem(STORAGE.listSize, String(state.listSize));
    applyListSize();
  });
  document.getElementById("listLarger").addEventListener("click", () => {
    state.listSize = Math.min(36, state.listSize + 3);
    localStorage.setItem(STORAGE.listSize, String(state.listSize));
    applyListSize();
  });
  const setSidebarWidth = (px) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--sidebar");
    const current = Number.parseInt(raw, 10) || 300;
    const next = Number.isFinite(px) ? px : current;
    const width = Math.max(180, Math.min(window.innerWidth - 160, next));
    document.documentElement.style.setProperty("--sidebar", `${width}px`);
    positionArrow();
  };
  const positionArrow = () => {
    const sidebar = document.getElementById("sidebar");
    const arrow = document.getElementById("toTopBtn");
    if (!sidebar || !arrow || sidebar.offsetParent === null) return;
    const right = sidebar.getBoundingClientRect().right;
    arrow.style.left = `${Math.max(8, right - 66)}px`;
    arrow.style.right = "auto";
  };
  window.addEventListener("resize", positionArrow);
  positionArrow();
  document.getElementById("splitLeft").addEventListener("click", () => setSidebarWidth(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar"), 10) - 40));
  document.getElementById("splitRight").addEventListener("click", () => setSidebarWidth(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar"), 10) + 40));
  const handle = document.getElementById("splitHandle");
  handle.addEventListener("pointerdown", (event) => {
    handle.setPointerCapture(event.pointerId);
    const move = (ev) => setSidebarWidth(ev.clientX);
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  });
  el.play.addEventListener("click", togglePlay);
  el.prev.addEventListener("click", () => step(-1));
  el.next.addEventListener("click", () => step(1));
  el.back15.addEventListener("click", () => skip(-15));
  el.fwd15.addEventListener("click", () => skip(15));
  el.progress.addEventListener("input", seek);
  el.progress.addEventListener("change", seek);
  el.shuffleBtn.addEventListener("click", () => {
    state.shuffle = true;
    el.shuffleBtn.setAttribute("aria-pressed", "true");
    const pool = playPool();
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    selectSong(state.songs.indexOf(pick), true);
  });
  el.currentTime.addEventListener("click", () => {
    if (!el.audio.src && !el.audio.currentSrc) return;
    el.audio.currentTime = 0;
    el.audio.play().then(() => {
      el.play.textContent = "❚❚";
      setStatus("Spielt", "is-play");
    }).catch(() => {});
  });
  document.getElementById("waveToggle").addEventListener("click", () => {
    const canvas = document.getElementById("spectrum");
    const show = canvas.hidden;
    canvas.hidden = !show;
    if (show) startSpectrum();
  });
  document.getElementById("panelShow").addEventListener("click", () => {
    const panel = document.getElementById("editPanel");
    if (panel) {
      panel.classList.remove("hidden-panel");
      document.getElementById("panelShow").hidden = true;
    }
  });
  document.getElementById("playerToggle").addEventListener("click", () => {
    const hidden = document.body.classList.toggle("player-hidden");
    const btn = document.getElementById("playerToggle");
    btn.setAttribute("aria-pressed", String(!hidden));
  });
  let holdTimer = 0;
  el.duration.addEventListener("pointerdown", () => {
    if (document.getElementById("lyricSearchWrap").hidden) return;
    holdTimer = setTimeout(openTimecode, 5000);
  });
  el.duration.addEventListener("pointerup", () => clearTimeout(holdTimer));
  el.duration.addEventListener("pointerleave", () => clearTimeout(holdTimer));
  const holdSize = (button, target) => {
    let timer = 0;
    button.addEventListener("pointerdown", () => {
      if (document.getElementById("lyricSearchWrap").hidden) return;
      timer = setTimeout(async () => {
        const current = target === "list" ? state.listSize : state.scale;
        const value = await uiPrompt({ eyebrow: "Anzeige", title: "Schriftgröße", value: String(current), type: "number", inputMode: "numeric", ok: "Übernehmen" });
        if (value === null) return;
        const next = Number(value);
        if (!Number.isFinite(next)) return;
        if (target === "list") {
          state.listSize = Math.max(10, Math.min(48, next));
          localStorage.setItem(STORAGE.listSize, String(state.listSize));
          applyListSize();
        } else {
          state.scale = Math.max(10, Math.min(200, next));
          localStorage.setItem(STORAGE.scale, String(state.scale));
          applyScale();
        }
      }, 5000);
    });
    const clear = () => clearTimeout(timer);
    button.addEventListener("pointerup", clear);
    button.addEventListener("pointerleave", clear);
  };
  holdSize(document.getElementById("smallerBtn"), "lyrics");
  holdSize(document.getElementById("largerBtn"), "lyrics");
  holdSize(document.getElementById("listSmaller"), "list");
  holdSize(document.getElementById("listLarger"), "list");
  const logout = document.getElementById("logoutBtn");
  if (logout) logout.addEventListener("click", () => {
    localStorage.removeItem(STORAGE.auth);
    sessionStorage.removeItem(STORAGE.auth);
    location.reload();
  });
  document.getElementById("exportFav").addEventListener("click", exportFavorites);
  document.getElementById("syncFav").addEventListener("click", syncFavorites);
  document.getElementById("importFav").addEventListener("click", importFavorites);
  autoSync();
  el.favorite.addEventListener("click", toggleFavorite);
  el.favoritesToggle.addEventListener("click", () => {
    if (state.mode === "playlists") {
      if (document.getElementById("lyricSearchWrap").hidden) {
        state.shuffle = false;
        const pool = playPool();
        if (pool.length) selectSong(state.songs.indexOf(pool[0]), true);
        return;
      }
      state.selectMode = !state.selectMode;
      el.favoritesToggle.setAttribute("aria-pressed", String(state.selectMode));
      el.favoritesToggle.textContent = state.selectMode ? "alle Lieder" : "Auswahl";
      renderList();
      return;
    }
    state.favoritesOnly = !state.favoritesOnly;
    el.favoritesToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
    el.favoritesToggle.textContent = state.favoritesOnly ? "Favoriten" : "alle Lieder";
    renderList();
  });
  el.fullscreen.addEventListener("click", toggleFullscreen);
  document.getElementById("refreshBtn").addEventListener("click", hardRefresh);
  document.getElementById("ludwtPrev").addEventListener("click", () => shiftLudwtWeek(-1));
  document.getElementById("ludwtNext").addEventListener("click", () => shiftLudwtWeek(1));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") state.wasPlaying = !el.audio.paused;
    else recoverAfterResume();
  });
  window.addEventListener("pageshow", (event) => { if (event.persisted) recoverAfterResume(); });
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
    if (!document.getElementById("lyricSearchWrap").hidden) {
      document.getElementById("titleIntro").hidden = true;
    }
  });
  el.lyrics.addEventListener("wheel", markUserScroll, { passive: true });
  el.lyrics.addEventListener("touchmove", markUserScroll, { passive: true });
  el.lyrics.addEventListener("pointerdown", markUserScroll);
  document.addEventListener("fullscreenchange", () => {
    el.fullscreen.textContent = document.fullscreenElement ? "Vollbild beenden" : "Vollbild";
    document.getElementById("splitHandle").hidden = Boolean(document.fullscreenElement) || document.body.classList.contains("pseudo-fullscreen") || document.getElementById("lyricSearchWrap").hidden;
  });
  document.addEventListener("keydown", (event) => {
    if (event.target === el.search || ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
    if (!document.getElementById("dialogModal").hidden || !document.getElementById("codeModal").hidden) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlay();
    } else if (["ArrowRight", "MediaTrackNext", "PageDown"].includes(event.code)) {
      step(1);
    } else if (["ArrowLeft", "MediaTrackPrevious", "PageUp"].includes(event.code)) {
      step(-1);
    }
  });
  const fitBar = () => {
    const w = window.innerWidth;
    document.body.classList.toggle("bar-half", w < 900 && w >= 680);
    document.body.classList.toggle("bar-tight", w < 680 && w >= 540);
    document.body.classList.toggle("bar-stack", w < 540);
  };
  window.addEventListener("resize", fitBar);
  fitBar();
}

const SYNC_BASE = window.SYNC_BASE || location.origin;

function encodeShare(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=+$/, "");
}

function decodeShare(code) {
  try {
    const padded = code.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((code.length + 3) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return null;
  }
}

function shareLink(payload) {
  const share = encodeShare(payload);
  return `${location.origin}${location.pathname}?sync=${encodeURIComponent(share)}`;
}

function showQr(link) {
  const qr = document.getElementById("syncQr");
  qr.hidden = false;
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`;
}

/* ---------- Abgleich von Favoriten und Wiedergabelisten ----------
   Drei-Wege-Abgleich: "Basis" = Stand beim letzten erfolgreichen Abgleich (pro Speicher-Name).
   - Nur Hinzugefügtes (auf einer oder beiden Seiten) -> automatisch zusammenführen, keine Warnung.
   - Gelöscht (gegenüber der Basis) -> Hinweis mit Anzahl, du entscheidest. */
const syncBaseKey = (store) => `sync-base-${store}`;

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeSync(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  return {
    favorites: [...new Set(Array.isArray(data.favorites) ? data.favorites : [])].sort(),
    playlists: (Array.isArray(data.playlists) ? data.playlists : []).map((list) => ({
      id: String(list.id),
      name: String(list.name || ""),
      songs: Array.isArray(list.songs) ? [...list.songs] : []
    }))
  };
}

function readSyncBase(store) {
  try {
    const raw = JSON.parse(localStorage.getItem(syncBaseKey(store)) || "null");
    return raw ? normalizeSync(raw) : null;
  } catch {
    return null;
  }
}

function writeSyncBase(store, data) {
  try { localStorage.setItem(syncBaseKey(store), JSON.stringify(normalizeSync(data))); } catch { /* voll/gesperrt */ }
}

function clearSyncBases() {
  try {
    Object.keys(localStorage).filter((key) => key.startsWith("sync-base-")).forEach((key) => localStorage.removeItem(key));
  } catch { /* egal */ }
}

function syncSnapshot() {
  return normalizeSync({ favorites: [...state.favorites], playlists: state.playlists });
}

function sameSync(a, b) {
  const key = (d) => {
    const n = normalizeSync(d);
    return JSON.stringify({ f: n.favorites, p: n.playlists.slice().sort((x, y) => x.id.localeCompare(y.id)) });
  };
  return key(a) === key(b);
}

/* Was steht in "to", aber nicht in "from"? (Favoriten, Listen, Lieder in bestehenden Listen) */
function gainCount(from, to) {
  const out = { favorites: 0, lists: 0, songs: 0, total: 0 };
  if (!from || !to) return out;
  const favs = new Set(from.favorites);
  to.favorites.forEach((id) => { if (!favs.has(id)) out.favorites += 1; });
  const lists = new Map(from.playlists.map((list) => [list.id, list]));
  to.playlists.forEach((list) => {
    const old = lists.get(list.id);
    if (!old) { out.lists += 1; return; }
    const had = new Set(old.songs);
    list.songs.forEach((id) => { if (!had.has(id)) out.songs += 1; });
  });
  out.total = out.favorites + out.lists + out.songs;
  return out;
}

function countText(c) {
  const parts = [];
  if (c.favorites) parts.push(`${c.favorites} ${c.favorites === 1 ? "Favorit" : "Favoriten"}`);
  if (c.lists) parts.push(`${c.lists} ${c.lists === 1 ? "Wiedergabeliste" : "Wiedergabelisten"}`);
  if (c.songs) parts.push(`${c.songs} ${c.songs === 1 ? "Lied" : "Lieder"} in Wiedergabelisten`);
  return parts.join(", ");
}

/* Nur Hinzugefügtes: Vereinigung beider Seiten */
function mergeSync(base, local, remote) {
  const baseLists = new Map((base ? base.playlists : []).map((list) => [list.id, list]));
  const localLists = new Map(local.playlists.map((list) => [list.id, list]));
  const remoteLists = new Map(remote.playlists.map((list) => [list.id, list]));
  const same = (a, b) => Boolean(a && b) && a.name === b.name && JSON.stringify(a.songs) === JSON.stringify(b.songs);
  const ids = [...local.playlists.map((list) => list.id), ...remote.playlists.map((list) => list.id).filter((id) => !localLists.has(id))];
  const playlists = ids.map((id) => {
    const l = localLists.get(id), r = remoteLists.get(id), b = baseLists.get(id);
    if (l && !r) return l;
    if (r && !l) return r;
    if (same(l, r)) return l;
    if (same(l, b)) return r;      // nur auf dem Server geändert
    if (same(r, b)) return l;      // nur hier geändert
    const songs = [...r.songs, ...l.songs.filter((song) => !r.songs.includes(song))];
    return { id, name: b && l.name === b.name ? r.name : l.name, songs };
  });
  return { favorites: [...new Set([...local.favorites, ...remote.favorites])].sort(), playlists };
}

function applySyncData(data) {
  state.favorites = new Set(data.favorites);
  state.playlists = cloneData(data.playlists);
  if (!state.playlists.some((list) => list.id === state.activePlaylist)) state.activePlaylist = "";
  saveFavorites();
  savePlaylists();
  fillPlaylists();
  updateEditTools();
  renderList();
}

async function putSync(store, data) {
  const res = await fetch(`${SYNC_BASE}/sync/${store}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ favorites: data.favorites, playlists: data.playlists, saved: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(`Server ${res.status}`);
}

function stampSync(direction) {
  try {
    localStorage.setItem("sync-last", new Date().toISOString());
    localStorage.setItem("sync-dir", direction);
  } catch { /* egal */ }
}

function refreshSyncInfo() {
  const info = document.getElementById("syncInfo");
  if (!info) return;
  const last = localStorage.getItem("sync-last");
  const dir = localStorage.getItem("sync-dir") || "";
  info.hidden = false;
  info.textContent = last
    ? `Zuletzt: ${new Date(last).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" })} (${dir})`
    : "Noch nie synchronisiert.";
}

function askSyncConflict(store, lostLocal, lostRemote, gainedLocal, gainedRemote) {
  const lines = [
    { text: `Speicher: „${store}“`, cls: "dlg-store" },
    { text: "Beim Abgleich wurde etwas gelöscht. Bitte entscheide, welcher Stand gelten soll." }
  ];
  if (lostLocal.total) lines.push({ text: `Auf diesem Gerät gelöscht: ${countText(lostLocal)}`, cls: "dlg-lost" });
  if (lostRemote.total) lines.push({ text: `Auf dem Server gelöscht: ${countText(lostRemote)}`, cls: "dlg-lost" });
  if (gainedRemote && gainedRemote.total) lines.push({ text: `Neu nur auf dem Server (geht bei „behalten“ verloren): ${countText(gainedRemote)}`, cls: "dlg-hint" });
  if (gainedLocal && gainedLocal.total) lines.push({ text: `Neu nur auf diesem Gerät (geht bei „überschreiben“ verloren): ${countText(gainedLocal)}`, cls: "dlg-hint" });
  return uiDialog({
    eyebrow: "Synchronisieren",
    title: "Es wurde etwas gelöscht",
    lines,
    cancelValue: null,
    buttons: [
      { value: "keep", kind: "up", dir: "↑ Zum Server hochladen", label: "Eigene Favoriten behalten", sub: `Dein Stand von diesem Gerät ersetzt den Speicher „${store}“ auf dem Server.` },
      { value: "overwrite", kind: "down", dir: "↓ Vom Server herunterladen", label: "Eigene Favoriten überschreiben", sub: `Der Speicher „${store}“ wird vom Server geladen und auf diesem Gerät wiederhergestellt.` },
      { value: null, kind: "cancel", label: "Abbrechen" }
    ]
  });
}

async function runSync(code, silent) {
  const store = code.toLowerCase().replace(/[^a-z0-9-]/g, "");
  let res;
  try {
    res = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store" });
  } catch {
    return silent ? "" : "Server nicht erreichbar.";
  }
  const local = syncSnapshot();
  if (!res.ok) {
    if (silent) return "";
    const answer = await uiDialog({
      eyebrow: "Synchronisieren",
      title: "Neuer Speicher",
      lines: [
        { text: `Den Speicher „${store}“ gibt es auf dem Server noch nicht.` },
        { text: `Deine ${local.favorites.length} Favoriten und ${local.playlists.length} Wiedergabelisten werden dort angelegt.` }
      ],
      buttons: [
        { value: "up", kind: "up", dir: "↑ Zum Server hochladen", label: "Speicher anlegen", sub: "Von diesem Gerät auf den Server" },
        { value: null, kind: "cancel", label: "Abbrechen" }
      ]
    });
    if (answer !== "up") return "Abgebrochen.";
    await putSync(store, local);
    writeSyncBase(store, local);
    stampSync("gesendet");
    return `Hochgeladen: Speicher „${store}“ ist angelegt.`;
  }

  const remote = normalizeSync(await res.json());
  const base = readSyncBase(store);
  const lostLocal = gainCount(local, base);
  const lostRemote = gainCount(remote, base);

  if (!lostLocal.total && !lostRemote.total) {
    const merged = mergeSync(base, local, remote);
    const toLocal = gainCount(local, merged);
    const toRemote = gainCount(remote, merged);
    const changeLocal = !sameSync(merged, local);
    const changeRemote = !sameSync(merged, remote);
    if (changeLocal) applySyncData(merged);
    if (changeRemote) await putSync(store, merged);
    writeSyncBase(store, merged);
    if (changeLocal || changeRemote) stampSync(changeLocal && changeRemote ? "abgeglichen" : changeRemote ? "gesendet" : "empfangen");
    const parts = [];
    if (toLocal.total) parts.push(`Vom Server geladen: ${countText(toLocal)}.`);
    if (toRemote.total) parts.push(`Zum Server hochgeladen: ${countText(toRemote)}.`);
    if (!parts.length) parts.push(changeLocal || changeRemote ? "Abgeglichen." : "Bereits gleich.");
    return parts.join(" ");
  }

  const choice = await askSyncConflict(store, lostLocal, lostRemote, base && gainCount(base, local), base && gainCount(base, remote));
  if (choice === "keep") {
    await putSync(store, local);
    writeSyncBase(store, local);
    stampSync("gesendet");
    return `Hochgeladen: Dein Stand ersetzt den Speicher „${store}“.`;
  }
  if (choice === "overwrite") {
    applySyncData(remote);
    writeSyncBase(store, remote);
    stampSync("empfangen");
    return `Heruntergeladen: Speicher „${store}“ ist auf diesem Gerät wiederhergestellt.`;
  }
  return "Abgebrochen.";
}

async function syncFavorites() {
  const saved = localStorage.getItem("sync-code") || "";
  openCode("Synchronisieren", async (code) => {
    localStorage.setItem("sync-code", code);
    try {
      const message = await runSync(code, false);
      refreshSyncInfo();
      return message;
    } catch {
      return "Synchronisieren fehlgeschlagen. Bitte später noch einmal versuchen.";
    }
  }, "sync");
  const input = document.getElementById("codeInput");
  input.value = saved;
  input.placeholder = "Name des Speichers, mind. 4 Zeichen";
  document.getElementById("codeOk").textContent = "Synchronisieren";
  document.querySelector(".sync-choice").hidden = true;
  document.getElementById("codeMessage").textContent = "Mit diesem Speicher-Namen kannst du alle deine Geräte abgleichen. Hinzugefügtes wird automatisch zusammengeführt.";
  refreshSyncInfo();
  if (window.LUDWT) LUDWT.mountSync();
  const del = document.getElementById("syncDelete");
  del.hidden = false;
  del.onclick = async () => {
    const store = (localStorage.getItem("sync-code") || input.value.trim()).toLowerCase();
    const buttons = [{ value: "local", kind: "danger", label: "Nur auf diesem Gerät löschen" }];
    if (store) buttons.push({ value: "both", kind: "danger", dir: "↑ Server leeren", label: "Auch auf dem Server löschen", sub: `Der Speicher „${store}“ wird geleert.` });
    buttons.push({ value: null, kind: "cancel", label: "Abbrechen" });
    const choice = await uiDialog({
      eyebrow: "Favoriten",
      title: "Alles löschen?",
      lines: [`${state.favorites.size} Favoriten und ${state.playlists.length} Wiedergabelisten werden auf diesem Gerät gelöscht.`],
      cancelValue: null,
      buttons
    });
    if (!choice) return;
    state.favorites = new Set();
    state.playlists = [];
    state.activePlaylist = "";
    saveFavorites();
    savePlaylists();
    fillPlaylists();
    updateEditTools();
    renderList();
    if (choice === "both" && store) {
      try {
        await putSync(store, { favorites: [], playlists: [] });
        writeSyncBase(store, { favorites: [], playlists: [] });
      } catch {
        showToast("Server nicht erreichbar – nur lokal gelöscht.");
      }
    }
    document.getElementById("codeModal").hidden = true;
  };
}

async function autoSync() {
  const code = localStorage.getItem("sync-code");
  if (!code) return;
  try {
    const message = await runSync(code, true);
    if (message && !message.startsWith("Bereits")) showToast(`Synchronisiert: ${message}`);
  } catch { /* still */ }
}

async function exportFavorites() {
  const payload = { favorites: [...state.favorites], playlists: state.playlists };
  openCode("Favoriten sichern", async (code, mode) => {
    if (mode === "local") {
      localStorage.setItem(`fav-${code}`, JSON.stringify(payload));
      document.getElementById("syncQr").hidden = true;
      document.getElementById("syncLink").hidden = true;
      return `Lokal unter „${code}“ gespeichert. Gilt nur in diesem Browser.`;
    }
    const short = (code || Math.random().toString(36).slice(2, 7)).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || "abcd";
    let stored = false;
    try {
      const res = await fetch(`${SYNC_BASE}/sync/${short}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      stored = res.ok;
    } catch {}
    const link = stored
      ? `${location.origin}${location.pathname}?sync=${short}`
      : shareLink(payload);
    showQr(link);
    const linkEl = document.getElementById("syncLink");
    linkEl.hidden = false;
    linkEl.textContent = link;
    document.getElementById("copyLink").hidden = false;
    document.getElementById("copyLink").onclick = () => {
      navigator.clipboard.writeText(link).then(() => {
        document.getElementById("codeMessage").textContent = "In die Zwischenablage kopiert.";
      }).catch(() => {
        document.getElementById("codeMessage").textContent = "Kopieren nicht möglich. Bitte markieren.";
      });
    };
    try { await navigator.clipboard.writeText(link); } catch {}
    document.getElementById("codeInput").value = short;
    return stored
      ? `Kurzer Code: ${short}\nLink zum Kopieren steht unter dem QR.`
      : `Server nicht erreichbar. Langer Link mit allen Daten steht unter dem QR.`;
  }, "export");
}

async function importFavorites() {
  openCode("Favoriten laden", async (code, mode) => {
    const raw = code.trim();
    let data = null;
    const short = raw.includes("sync=") ? decodeURIComponent(raw.split("sync=").pop().split("&")[0]) : raw;
    if (short.length <= 8 && !short.includes("http")) {
      try {
        const res = await fetch(`${SYNC_BASE}/sync/${short.toLowerCase()}`);
        if (res.ok) data = await res.json();
      } catch {}
    }
    if (!data) data = decodeShare(short);
    if (!data) {
      try { data = JSON.parse(localStorage.getItem(`fav-${raw}`) || "null"); } catch { data = null; }
    }
    if (!data || !Array.isArray(data.favorites)) return "Code oder Link nicht gefunden.";
    if (state.favorites.size || state.playlists.length) {
      document.getElementById("codeModal").hidden = true;
      const ok = await warnReplace();
      document.getElementById("codeModal").hidden = false;
      if (!ok) return "Abgebrochen.";
    }
    state.favorites = new Set(data.favorites);
    if (Array.isArray(data.playlists)) state.playlists = data.playlists;
    saveFavorites();
    savePlaylists();
    clearSyncBases();  // nächster Abgleich ohne Löschwarnung (es wird nur zusammengeführt)
    fillPlaylists();
    renderList();
    return `${data.favorites.length} Favoriten und ${state.playlists.length} Listen geladen.`;
  }, "import");
}

async function openTimecode() {
  if (!document.body.classList.contains("edit-mode")) {
    const pass = await uiPrompt({ eyebrow: "Bearbeiten", title: "Timecode-Passwort", type: "password", placeholder: "Passwort", ok: "Öffnen" });
    if (pass !== window.TIMECODE_PASSWORD) return;
    document.body.classList.add("edit-mode");
    state.editDirty = false;
    state.karaokeHold = true;
  }
  attachTimecodeUi();
  if (!document.getElementById("editPanel")) buildEditPanel();
  startSpectrum();
}

function attachTimecodeUi() {
  if (!document.getElementById("colHead")) {
    const head = document.createElement("div");
    head.id = "colHead";
    head.className = "col-head";
    head.innerHTML = "<span>Gespeichert</span><span>Aktuell</span><span></span><span>Text</span>";
    el.lyrics.prepend(head);
  }
  el.lyrics.querySelectorAll(".lyric-line").forEach((line) => {
    if (line.querySelector(".time-edit")) return;
    const text = line.textContent;
    const saved = line.dataset.time;
    line.textContent = "";
    const input = document.createElement("input");
    input.className = "time-edit";
    input.value = formatTime(Number(saved) || 0, true);
    input.title = "Gespeicherte Zeit";
    input.addEventListener("change", () => {
      line.dataset.time = String(parseTime(input.value));
      state.editDirty = true;
    });
    const now = document.createElement("button");
    now.type = "button";
    now.className = "chip now-btn";
    now.textContent = formatTime(el.audio.currentTime || 0, true);
    const take = document.createElement("button");
    take.type = "button";
    take.className = "chip";
    take.textContent = "Zeit";
    const applyStamp = () => {
      const t = Math.max(0, (el.audio.currentTime || 0) + state.timeOffset / 1000);
      const old = line.dataset.saved || line.dataset.time;
      if (!line.dataset.saved) line.dataset.saved = old;
      line.dataset.time = String(t);
      input.value = formatTime(t, true);
      let oldLabel = line.querySelector(".saved-old");
      if (!oldLabel) {
        oldLabel = document.createElement("span");
        oldLabel.className = "saved-old";
        input.after(oldLabel);
      }
      oldLabel.textContent = formatTime(Number(line.dataset.saved), true);
      state.editDirty = true;
    };
    // Zeit schon beim Antippen (pointerdown) übernehmen, nicht erst beim Loslassen (click): spart 50-150 ms
    let fromPointer = false;
    take.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      fromPointer = true;
      applyStamp();
    });
    take.addEventListener("click", (event) => {
      event.stopPropagation();
      if (fromPointer) { fromPointer = false; return; }
      applyStamp();  // Bedienung per Tastatur
    });
    const textInput = document.createElement("input");
    textInput.className = "lyric-text";
    textInput.value = text;
    textInput.addEventListener("change", () => { state.editDirty = true; });
    textInput.addEventListener("click", (event) => {
      event.stopPropagation();
      const t = Number(line.dataset.time) || 0;
      el.audio.currentTime = t;
      if (el.audio.paused) el.audio.play().catch(() => {});
    });
    line.append(input, now, take, textInput);
  });
}

function parseTime(value) {
  const parts = String(value).split(":");
  const mins = Number(parts[0] || 0);
  const rest = String(parts[1] || "0").split(".");
  return mins * 60 + Number(rest[0] || 0) + Number(`0.${rest[1] || 0}`);
}

/* Einmalig zur aktuell gespielten Zeile springen (ohne dem Lied dauerhaft zu folgen) */
function jumpToActiveLine() {
  const active = el.lyrics.querySelector(".lyric-line.active");
  if (!active) {
    setStatus("Noch keine aktive Zeile", "is-info");
    return;
  }
  state.centering = true;
  const target = active.offsetTop - (el.lyrics.clientHeight * 0.33) + (active.offsetHeight / 2);
  el.lyrics.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  setTimeout(() => { state.centering = false; }, 450);
}

function buildEditPanel() {
  const panel = document.createElement("div");
  panel.id = "editPanel";
  panel.className = "edit-panel";
  const hold = document.createElement("button");
  hold.className = "chip";
  hold.textContent = "Karaoke aus";
  hold.setAttribute("aria-pressed", "true");
  hold.addEventListener("click", () => {
    state.karaokeHold = !state.karaokeHold;
    hold.setAttribute("aria-pressed", String(state.karaokeHold));
    hold.textContent = state.karaokeHold ? "Karaoke aus" : "Karaoke an";
  });
  panel.append(hold);
  const jump = document.createElement("button");
  jump.className = "chip";
  jump.textContent = "Zur Zeile";
  jump.title = "Einmalig zur aktuell gespielten Zeile springen";
  jump.addEventListener("click", jumpToActiveLine);
  panel.append(jump);
  const toggle = document.createElement("button");
  toggle.className = "chip";
  toggle.textContent = "Panel";
  toggle.addEventListener("click", () => {
    panel.classList.add("hidden-panel");
    document.getElementById("panelShow").hidden = false;
  });
  panel.append(toggle);
  [0.3, 0.5, 0.8, 1, 1.5, 2].forEach((rate) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = `${rate}x`;
    btn.addEventListener("click", () => { el.audio.playbackRate = rate; });
    panel.append(btn);
  });
  const zoom = document.createElement("input");
  zoom.type = "range";
  zoom.min = "1";
  zoom.max = "20";
  zoom.value = "1";
  zoom.title = "Wellenform zoomen";
  zoom.addEventListener("input", () => {
    state.waveZoom = Number(zoom.value);
    if (state.drawWave) state.drawWave();
  });
  panel.append(zoom);
  const offsetWrap = document.createElement("label");
  offsetWrap.className = "offset-wrap";
  offsetWrap.title = "Versatz beim Zeit-Setzen in Millisekunden (negativ = früher)";
  offsetWrap.append(document.createTextNode("Versatz ms"));
  const offset = document.createElement("input");
  offset.type = "number";
  offset.step = "10";
  offset.min = "-1000";
  offset.max = "1000";
  offset.inputMode = "numeric";
  offset.value = String(state.timeOffset);
  offset.addEventListener("change", () => {
    const value = Math.max(-1000, Math.min(1000, Number(offset.value) || 0));
    state.timeOffset = value;
    offset.value = String(value);
    try { localStorage.setItem("teslaKaraokeTimeOffset", String(value)); } catch { /* egal */ }
  });
  offsetWrap.append(offset);
  panel.append(offsetWrap);
  const save = document.createElement("button");
  save.className = "chip";
  save.textContent = "Speichern";
  save.addEventListener("click", saveTimecode);
  const exit = document.createElement("button");
  exit.className = "chip danger";
  exit.textContent = "Beenden";
  exit.addEventListener("click", async () => {
    if (state.editDirty && !(await uiConfirm({ eyebrow: "Bearbeiten", title: "Ungespeicherte Änderungen", text: "Ohne Speichern verlassen?", ok: "Verlassen", danger: true }))) return;
    document.body.classList.remove("edit-mode");
    state.editDirty = false;
    state.karaokeHold = false;
    panel.remove();
    const head = document.getElementById("colHead");
    if (head) head.remove();
    document.getElementById("spectrum").hidden = true;
    if (state.songs[state.index]) loadLyrics(state.songs[state.index]);
  });
  panel.append(save, exit);
  const showBtn = document.createElement("button");
  showBtn.className = "chip";
  showBtn.textContent = "Panel";
  showBtn.addEventListener("click", () => {
    panel.classList.add("hidden-panel");
    document.getElementById("panelShow").hidden = false;
  });
  panel.append(showBtn);
  document.body.append(panel);
}

async function saveTimecode() {
  const song = state.songs[state.index];
  if (!song) return;
  if (!(await uiConfirm({ eyebrow: "Bearbeiten", title: "Timecodes speichern?", text: `Lied ${song.id} – ${song.title}`, ok: "Speichern" }))) return;
  const lines = [...el.lyrics.querySelectorAll(".lyric-line")].map((line) => ({
    time: Number(line.dataset.time),
    text: (line.querySelector(".lyric-text") || {}).value || line.textContent.trim()
  }));
  const lrc = lines.map((line) => {
    const t = formatTime(line.time, true);
    const [m, rest] = t.split(":");
    return `[${m.padStart(2, "0")}:${rest}]${line.text}`;
  }).join("\n");
  localStorage.setItem(`lrc-${song.id}`, JSON.stringify(lines));
  try {
    const res = await fetch(`${SYNC_BASE}/sync/lrc-${song.id}`, { method: "PUT", headers: { "content-type": "text/plain" }, body: lrc });
    await uiAlert(res.ok ? "Gespeichert" : "Nur lokal gespeichert", res.ok ? "Auf allen Geräten verfügbar." : "Der Server war nicht erreichbar.");
  } catch {
    await uiAlert("Nur lokal gespeichert", "Der Server war nicht erreichbar.");
  }
  state.editDirty = false;
}

function startSpectrum() {
  const canvas = document.getElementById("spectrum");
  canvas.hidden = false;
  state.waveZoom = 1;
  state.waveOffset = 0;
  const draw = () => {
    if (!state.waveData) return;
    const g = canvas.getContext("2d");
    const total = state.waveData.length;
    canvas.width = canvas.clientWidth || 300;
    canvas.height = 60;
    g.fillStyle = "#1a1a1a";
    g.fillRect(0, 0, canvas.width, canvas.height);
    const current = el.audio.currentTime || 0;
    const pos = current / (el.audio.duration || 1);
    const center = Math.floor(pos * total);
    const view = Math.max(1, Math.floor(total / (state.waveZoom || 1)));
    const start = Math.max(0, Math.min(center - Math.floor(view / 2), total - view));
    const step = view / canvas.width;
    g.strokeStyle = "#5b7cff";
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const i = Math.floor(start + x * step);
      const v = state.waveData[Math.min(i, total - 1)] || 0;
      const y = canvas.height / 2 - v * canvas.height / 2;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const i = Math.floor(start + x * step);
      const v = state.waveData[Math.min(i, total - 1)] || 0;
      const y = canvas.height / 2 + v * canvas.height / 2;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    const lineX = ((center - start) / view) * canvas.width;
    g.strokeStyle = "#fff";
    g.beginPath();
    g.moveTo(lineX, 0);
    g.lineTo(lineX, canvas.height);
    g.stroke();
  };
  canvas.onclick = (event) => {
    if (!state.waveData || !el.audio.duration) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const view = state.waveData.length / (state.waveZoom || 1);
    const pos = ((state.waveOffset || 0) + (x / canvas.width) * view) / state.waveData.length;
    el.audio.currentTime = pos * el.audio.duration;
  };
  canvas.onwheel = (event) => {
    event.preventDefault();
    state.waveZoom = Math.max(1, Math.min(20, (state.waveZoom || 1) * (event.deltaY > 0 ? 0.8 : 1.25)));
    draw();
  };
  state.drawWave = draw;
  if (state.currentAudio && !state.waveData) {
    fetch(state.currentAudio).then((r) => r.arrayBuffer()).then((buf) => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx.decodeAudioData(buf);
    }).then((audio) => {
      const raw = audio.getChannelData(0);
      const peaks = new Float32Array(1000);
      const size = Math.floor(raw.length / peaks.length);
      for (let i = 0; i < peaks.length; i++) {
        let max = 0;
        for (let j = 0; j < size; j++) max = Math.max(max, Math.abs(raw[i * size + j] || 0));
        peaks[i] = max;
      }
      state.waveData = peaks;
      draw();
    }).catch(() => {});
  } else draw();
}
function warnReplace() {
  return new Promise((resolve) => {
    const modal = document.getElementById("warnModal");
    modal.hidden = false;
    document.getElementById("warnForm").onsubmit = (event) => {
      event.preventDefault();
      modal.hidden = true;
      resolve(true);
    };
    document.getElementById("warnCancel").onclick = () => {
      modal.hidden = true;
      resolve(false);
    };
  });
}

function openCode(title, onSubmit, kind) {
  const modal = document.getElementById("codeModal");
  const ludwtBox = document.getElementById("ludwtSync");
  if (ludwtBox) ludwtBox.hidden = kind !== "sync";
  document.getElementById("codeForm").classList.toggle("has-ludwt", kind === "sync");
  const input = document.getElementById("codeInput");
  const message = document.getElementById("codeMessage");
  const qr = document.getElementById("syncQr");
  const ok = document.getElementById("codeOk");
  document.getElementById("codeTitle").textContent = title;
  input.value = "";
  message.textContent = kind === "import"
    ? "Anderes Gerät: Link vom Export hier einfügen. Vom Handy zum Tesla den Link kopieren."
    : "Lokal: eigenes Passwort. Anderes Gerät: QR erzeugen, das andere Gerät scannt.";
  qr.hidden = true;
  const linkEl = document.getElementById("syncLink");
  linkEl.hidden = true;
  linkEl.textContent = "";
  const meta = document.getElementById("syncMeta");
  const metaBtn = document.getElementById("metaToggle");
  meta.hidden = true;
  metaBtn.hidden = true;
  if (kind === "import") {
    metaBtn.hidden = false;
    metaBtn.onclick = () => { meta.hidden = !meta.hidden; };
    fetch(`${SYNC_BASE}/sync/`).then((res) => res.json()).then((info) => {
      meta.textContent = info && info.count != null
        ? `${info.count} Codes aktiv. Letzter: ${info.last ? info.last.slice(0, 16).replace("T", " ") : "—"}`
        : "Keine Info vom Server.";
    }).catch(() => { meta.textContent = "Server nicht erreichbar."; });
  }
  ok.hidden = false;
  ok.textContent = kind === "import" ? "Übernehmen" : "QR-Code erzeugen";
  modal.hidden = false;
  document.getElementById("codeForm").scrollTop = 0;
  if (kind !== "sync") input.focus();
  let mode = "local";
  const mark = () => {
    document.getElementById("syncLocal").setAttribute("aria-pressed", String(mode === "local"));
    document.getElementById("syncDevice").setAttribute("aria-pressed", String(mode === "device"));
    ok.textContent = mode === "device" && kind !== "import" ? "QR-Code erzeugen" : "Übernehmen";
  };
  mark();
  document.getElementById("syncLocal").onclick = () => { mode = "local"; input.placeholder = "eigenes Passwort"; qr.hidden = true; ok.hidden = false; mark(); };
  document.getElementById("syncDevice").onclick = () => {
    mode = "device";
    qr.hidden = kind === "import";
    input.placeholder = kind === "import" ? "Link oder kurzen Code einfügen" : "";
    ok.hidden = false;
    mark();
  };
  const form = document.getElementById("codeForm");
  form.onsubmit = async (event) => {
    event.preventDefault();
    const code = input.value.trim();
    if (mode === "local" && code.length < 4) { message.textContent = "Mindestens 4 Zeichen."; return; }
    if (mode === "device" && kind === "import" && !code) { message.textContent = "Link einfügen."; return; }
    message.textContent = "Bitte warten …";
    const result = await onSubmit(code, mode);
    if (result) message.textContent = result;
    if (mode === "device" && kind !== "import") ok.hidden = true;
  };
  document.getElementById("codeCancel").onclick = () => { modal.hidden = true; };
}

function applySyncFromUrl() {
  const value = new URLSearchParams(location.search).get("sync");
  if (!value) return;
  const payload = decodeShare(value);
  if (!payload || !Array.isArray(payload.favorites)) return;
  state.favorites = new Set(payload.favorites);
  if (Array.isArray(payload.playlists)) state.playlists = payload.playlists;
  saveFavorites();
  savePlaylists();
  history.replaceState(null, "", location.pathname);
}
function checkLogin() {
  const gate = document.getElementById("loginGate");
  if (localStorage.getItem(STORAGE.auth) === "ok" || sessionStorage.getItem(STORAGE.auth) === "ok") {
    gate.hidden = true;
    return;
  }
  gate.hidden = false;
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = document.getElementById("loginPassword").value;
    if (value === window.APP_PASSWORD) {
      if (document.getElementById("rememberLogin").checked) localStorage.setItem(STORAGE.auth, "ok");
      else sessionStorage.setItem(STORAGE.auth, "ok");
      gate.hidden = true;
    } else {
      document.getElementById("loginError").hidden = false;
    }
  });
}

function init() {
  if (location.search.includes("r=")) history.replaceState(null, "", location.pathname);
  state.timeOffset = Number(localStorage.getItem("teslaKaraokeTimeOffset") || 0) || 0;
  checkLogin();
  loadFavorites();
  loadPlaylists();
  applySyncFromUrl();
  fillPlaylists();
  state.scale = Number(localStorage.getItem(STORAGE.scale) || 42);
  applyScale();
  bind();
  if (window.LUDWT) {
    LUDWT.onChange = () => {
      if (state.mode === "ludwt") {
        fillLudwtWeeks();
        renderList();
      }
    };
    LUDWT.ensureLoaded();
  }
  loadSongs();
  window.addEventListener("beforeunload", (event) => {
    if (state.editDirty) {
      event.preventDefault();
      event.returnValue = "Ungespeicherte Änderungen. Ohne Speichern verlassen?";
    }
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

init();
