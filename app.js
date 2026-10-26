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
  version: "karaoke",
  curVersion: "karaoke",
  media: null,
  unsynced: false,
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
    const addLine = (parent, line) => {
      const item = typeof line === "string" ? { text: line } : line;
      if (item.group) {
        const g = document.createElement("div");
        g.className = `dlg-group${item.cls ? ` ${item.cls}` : ""}`;
        if (item.title) {
          const t = document.createElement("p");
          t.className = "dlg-group-title";
          t.textContent = item.title;
          g.append(t);
        }
        item.group.forEach((sub) => addLine(g, sub));
        parent.append(g);
        return;
      }
      if (item.details) {
        const d = document.createElement("details");
        d.className = "dlg-details";
        const sm = document.createElement("summary");
        sm.textContent = item.details.title;
        d.append(sm);
        item.details.lines.forEach((sub) => addLine(d, sub));
        parent.append(d);
        return;
      }
      if (item.table) {
        const wrap = document.createElement("div");
        wrap.className = "dlg-table-wrap";
        const table = document.createElement("table");
        table.className = "dlg-table";
        item.table.forEach((row, r) => {
          const tr = document.createElement("tr");
          row.forEach((cell, c) => {
            const td = document.createElement(r === 0 ? "th" : "td");
            td.textContent = String(cell);
            if (c > 0 && item.right) td.className = "num";
            tr.append(td);
          });
          table.append(tr);
        });
        wrap.append(table);
        parent.append(wrap);
        return;
      }
      const p = document.createElement("p");
      p.textContent = item.text;
      if (item.cls) p.className = item.cls;
      parent.append(p);
    };
    (opts.lines || []).forEach((line) => addLine(body, line));
    if (opts.input) {
      input.hidden = false;
      input.type = opts.input.type || "text";
      input.autocomplete = input.type === "password" ? "new-password" : "off";
      input.readOnly = false;
      input.placeholder = opts.input.placeholder || "";
      input.value = opts.input.value || "";
      input.inputMode = opts.input.inputMode || "";
    } else {
      input.hidden = true;
      input.value = "";
    }
    const chRow = document.getElementById("dialogCheck");
    const chBox = document.getElementById("dialogCheckBox");
    chRow.hidden = !opts.check;
    if (opts.check) {
      document.getElementById("dialogCheckText").textContent = opts.check.label;
      chBox.checked = Boolean(opts.check.value);
      chBox.onchange = () => opts.check.onChange && opts.check.onChange(chBox.checked);
    }
    const pwRow = document.getElementById("dialogShowPw");
    const pwBox = document.getElementById("dialogShowPwBox");
    const isPw = !!(opts.input && opts.input.type === "password");
    pwRow.hidden = !isPw;
    pwBox.checked = false;
    pwBox.onchange = () => { input.type = pwBox.checked ? "text" : "password"; };
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
    if (opts.input) { input.focus(); setTimeout(() => input.focus(), 60); }
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
  scheduleSync();
}
/* Änderungen an Favoriten/Listen werden ca. 8 Sekunden nach der letzten Änderung abgeglichen (wenn ein Speicher eingetragen ist) */
let syncTimer = 0;
function scheduleSync() {
  if (!localStorage.getItem("sync-code")) return;
  clearTimeout(syncTimer);
  state.favPending = true;
  syncTimer = setTimeout(async () => { state.favPending = false; if (typeof autoSync === "function") await autoSync(); }, 8000);
}

function applyTopOffsets() {
  const v = (k) => { const n = Math.round(Number(lsv(k, 0))); return n > 0 ? Math.min(300, n) : 0; };
  document.documentElement.style.setProperty("--top-off", `${v("topOffMain")}px`);
  document.documentElement.style.setProperty("--set-off", `${v("topOffSet")}px`);
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
  document.body.classList.toggle("sidebar-open", open);
  updateChrome();
  if (open) setTimeout(centerActiveInList, 80);
}

function centerActiveInList() {
  markActive();
  const target = document.querySelector("#songList .song-btn.active");
  if (target) scrollInList(target, "center");
}

/* Nur die Liste scrollen – scrollIntoView würde die ganze Seite nach oben schieben (obere Leiste/Titel abgeschnitten) */
function scrollInList(target, mode) {
  const box = document.getElementById("sidebar");
  if (!box || !target) return;
  const b = box.getBoundingClientRect(), t = target.getBoundingClientRect();
  if (mode === "center") box.scrollTop += (t.top + t.height / 2) - (b.top + b.height / 2);
  else if (t.top < b.top) box.scrollTop += t.top - b.top;
  else if (t.bottom > b.bottom) box.scrollTop += t.bottom - b.bottom;
  [document.body, document.documentElement].forEach((n) => { if (n.scrollTop) n.scrollTop = 0; });
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
  const extraOn = showExtraSongs();
  const srcs = extraOn ? srcSet() : null;
  const out = songs.filter((song) => {
    if (state.mode !== "ludwt" && !extraOn && song.extra) {
      const inList = playlist && state.mode === "playlists" && playlist.songs.includes(song.id);
      if (!inList) return false;
    }
    if (srcs && ![...srcs].some((t) => songHasSource(song, t))) {
      const inList = playlist && state.mode === "playlists" && !state.selectMode;
      if (!inList) return false;
    }
    if (state.mode === "songs" && state.favoritesOnly && !state.favorites.has(song.id)) return false;
    if (state.category && song.category !== state.category) return false;
    if (state.lyricQuery) {
      const text = (state.lyricCache.get(song.id) || "").toLowerCase();
      if (!text.includes(state.lyricQuery)) return false;
    }
    return song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
  });
  if (state.mode === "songs" && state.sortBy) return sortedSongs(out, state.sortBy);
  return out;
}
function sortedSongs(list, how) {
  return [...list].sort((a, b) => {
    if (how === "name") return String(a.title).localeCompare(String(b.title), "de") || a.number - b.number;
    if (how === "cat") return String(a.category || "~").localeCompare(String(b.category || "~"), "de") || a.number - b.number;
    return a.number - b.number;
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
  el.list.classList.toggle("single", ludwtSingleOn());
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
    if (row.song && row.song.extra) {
      item.classList.add("no-karaoke");
      const n = row.song.number, w = state.version;
      const used = (w === "sung" && mediaKey("sung", n)) ? "sung" : (w === "video" && mediaKey("video", n)) ? "video" : mediaKey("meeting", n) ? "meeting" : mediaKey("sung", n) ? "sung" : mediaKey("video", n) ? "video" : "";
      const def = { meeting: ["t-i", "♪", "Instrumental"], sung: ["t-z", "Z", "Zusammenkünfte"], video: ["t-v", "▶", "Video"] }[used];
      if (def) {
        const tags = document.createElement("span");
        tags.className = "src-tags";
        tags.append(Object.assign(document.createElement("i"), { className: def[0], textContent: def[1], title: "Nicht bei Karaoke – genommen aus: " + def[2] }));
        button.append(tags);
      }
    }
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
  const prev = list[at - 1], next = list[at + 1];
  const short = (w) => {
    if (!w) return "";
    const f = (iso) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;
    return `${f(w.montag)}–${f(w.sonntag)}`;
  };
  document.getElementById("ludwtPrev").disabled = at <= 0;
  document.getElementById("ludwtNext").disabled = at < 0 || at >= list.length - 1;
  document.querySelector("#ludwtPrev .nv-d").textContent = short(prev);
  document.querySelector("#ludwtNext .nv-d").textContent = short(next);
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
  scheduleSync();
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
        state.selectMode = list.songs.length === 0;   // leere Liste: alle Lieder zum Hinzufügen zeigen
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

/* Umschalter „Auswahl / alle Lieder“ bei Wiedergabelisten: beide Stellungen farbig gefüllt */
function syncSelectBtn() {
  const b = el.favoritesToggle;
  if (!b) return;
  const pl = state.mode === "playlists";
  b.classList.toggle("filled", pl);
  if (!pl) return;
  const glass = !document.getElementById("lyricSearchWrap").hidden;
  b.textContent = !glass ? "Wiedergabe" : (state.selectMode ? "alle Lieder" : "Auswahl");
  b.setAttribute("aria-pressed", "true");
}

/* Sortier-Auswahl ganz unten: nur bei aktiver Lupe und in einer geöffneten Liste (Listen) */
function updateSortBox() {
  const w = document.getElementById("sortWrap");
  if (!w) return;
  w.hidden = !((state.mode === "playlists" && currentPlaylist()) || state.mode === "songs");
  const sel = document.getElementById("sortSel");
  if (sel && state.mode === "songs") sel.value = state.sortBy || "";
}
function sortPlaylist(how) {
  const playlist = currentPlaylist();
  if (!playlist || !how) return;
  const info = (id) => state.songs.find((s) => s.id === id) || { number: 9999, title: id, category: "" };
  playlist.songs.sort((x, y) => {
    const a = info(x), b = info(y);
    if (how === "name") return String(a.title).localeCompare(String(b.title), "de") || a.number - b.number;
    if (how === "cat") return String(a.category || "~").localeCompare(String(b.category || "~"), "de") || a.number - b.number;
    return a.number - b.number;
  });
  savePlaylists();
  renderList();
}
function renderList() {
  document.body.dataset.mode = state.mode;
  if (state.mode !== "ludwt") el.list.classList.remove("single");
  try { updateVersionBar(); } catch { /* egal */ }
  updateSortBox();
  syncSelectBtn();
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
    if (song.extra) { item.classList.add("extra-song"); button.classList.add("is-extra"); }
    if (state.songs[state.index] === song) button.classList.add("active");
    const number = document.createElement("strong");
    number.textContent = song.id;
    const title = document.createElement("span");
    title.textContent = `${state.favorites.has(song.id) ? "★ " : ""}${song.title}`;
    button.append(number, title);
    if (showExtraSongs() && srcTagsOn() && state.media) {
      const tags = document.createElement("span");
      tags.className = "src-tags";
      if (!song.extra) tags.append(Object.assign(document.createElement("i"), { className: "t-k", textContent: "K", title: "Karaoke" }));
      if (mediaKey("meeting", song.number)) tags.append(Object.assign(document.createElement("i"), { className: "t-i", textContent: "♪", title: "Instrumental" }));
      if (mediaKey("video", song.number)) tags.append(Object.assign(document.createElement("i"), { className: "t-v", textContent: "▶", title: "Video" }));
      if (mediaKey("sung", song.number)) tags.append(Object.assign(document.createElement("i"), { className: "t-z", textContent: "Z", title: "Zusammenkünfte" }));
      button.append(tags);
    }
    button.addEventListener("click", () => selectSong(state.songs.indexOf(song), true));
    item.append(button);
    el.list.append(item);
  });
  applyListSize();
  paintFav2();
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
  if (target && state.sidebarOpen) scrollInList(target, "nearest");
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
  state.endIntro = false;
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

/* Liedtext der gesungenen Karaoke-Fassung (Server -> Browser -> lyrics/ -> GitHub) */
async function fetchKaraokeLines(song, stale) {
  try {
    const res = await fetch(`${SYNC_BASE}/sync/lrc-${song.id}`);
    if (stale()) return [];
    if (res.ok) {
      const text = await res.text();
      if (stale()) return [];
      if (text.includes("[")) return parseLrc(text);
    }
  } catch {}
  const saved = localStorage.getItem(`lrc-${song.id}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  const num = String(song.number).padStart(2, "0");
  const local = song.lyrics || `lyrics/sjj_E_${num}.lrc`;
  const remote = `https://github.com/Carag7/JW-Musik/releases/download/JW-Lyrics/sjj_E_${num}.lrc`;
  for (const url of [local, remote]) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (stale()) return [];
      if (!response.ok) continue;
      const text = await response.text();
      if (stale()) return [];
      if (!text.includes("[")) continue;
      return parseLrc(text);
    } catch {}
  }
  return [];
}

/* Liedtext der Instrumental-Fassung (eigene Datei lrcm-<nr>) */
async function fetchMeetingLines(song, stale, prefix = "lrcm") {
  try {
    const res = await fetch(`${SYNC_BASE}/sync/${prefix}-${song.id}`);
    if (stale()) return [];
    if (res.ok) {
      const text = await res.text();
      if (stale()) return [];
      if (text.includes("[")) return parseLrc(text);
    }
  } catch {}
  const saved = localStorage.getItem(`${prefix}-${song.id}`);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return [];
}

/* Nur Titel und Bild im großen Fenster (Instrumental ohne eigenen Text) */
function renderPlain(song, kind) {
  const panel = document.getElementById("startPanel");
  if (panel) panel.hidden = true;
  el.lyrics.innerHTML = "";
  el.lyrics.scrollTop = 0;
  const box = document.createElement("div");
  box.className = "plain-panel";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `Lied ${song.id}`;
  const img = document.createElement("img");
  img.className = "start-image";
  img.src = "start-bg.png";
  img.alt = "";
  const title = document.createElement("h2");
  title.textContent = song.title;
  const hint = document.createElement("p");
  hint.className = "plain-hint";
  hint.textContent = kind === "video" ? "Video" : kind === "sung" ? "Zusammenkünfte" : "Instrumental";
  box.append(eyebrow, img, title, hint);
  el.lyrics.append(box);
}

async function loadLyrics(song, kind) {
  const token = state.selectToken;
  const stale = () => token !== state.selectToken;
  state.lyrics = [];
  state.unsynced = false;
  state.videoLines = [];
  if (!kind || kind === "karaoke") {
    const lines = await fetchKaraokeLines(song, stale);
    if (stale()) return;
    state.lyrics = lines;
    renderLyrics(lines);
    return;
  }
  const lines = (kind === "meeting" || kind === "video" || kind === "sung") ? await fetchMeetingLines(song, stale, kind === "sung" ? "lrcs" : "lrcm") : [];
  if (stale()) return;
  state.videoLines = kind === "video" ? lines : [];
  if (kind === "video") updateVersionBar();
  if (lines.length) {
    state.lyrics = lines;
    renderLyrics(lines);
    return;
  }
  renderPlain(song, kind);
}

/* Option „Karaoketext anzeigen“ bei Instrumental/Video ohne eigenen Text (mit Warnung) */
async function toggleUnsynced() {
  const song = state.songs[state.index];
  if (!song) return;
  if (state.unsynced) {
    state.unsynced = false;
    state.lyrics = [];
    renderPlain(song, state.curVersion);
    updateVersionBar();
    return;
  }
  const ok = await uiConfirm({
    eyebrow: "Karaoketext",
    title: "Text noch nicht synchronisiert",
    lines: [
      "Der Karaoketext ist auf die gesungene Fassung abgestimmt und passt zeitlich nicht zur Instrumental-Fassung.",
      "Solange für diese Fassung keine eigene Text-Datei in R2 liegt (meeting/lrc), wird der vorhandene Text aus dem Lyrics-Verzeichnis gezeigt. Im Bearbeitungsmodus kannst du ihn für diese Fassung neu abstimmen."
    ],
    ok: "Trotzdem anzeigen"
  });
  if (!ok) return;
  const lines = await fetchKaraokeLines(song, () => false);
  if (!lines.length) {
    await uiAlert("Kein Text vorhanden", "Für dieses Lied gibt es keinen Karaoketext.");
    return;
  }
  state.unsynced = true;
  state.lyrics = lines;
  renderLyrics(lines);
  setStatus("Text nicht synchron", "is-info");
  updateVersionBar();
}

/* ---------- Fassungen: Karaoke / Instrumental / Video (Dateiverzeichnis aus dem Worker) ---------- */
const mediaUrl = (key) => `${SYNC_BASE}/media/${key.split("/").map(encodeURIComponent).join("/")}`;
function mediaKey(type, number) {
  const m = state.media;
  if (!m) return null;
  const table = type === "karaoke" ? m.karaoke.audio : type === "meeting" ? m.meeting.audio : type === "video" ? m.meeting.video : type === "sung" ? (m.meeting.sung || {}) : type === "lrcs" ? (m.meeting.sungLrc || {}) : m.meeting.lrc;
  return table[String(number)] || null;
}

async function loadMedia(fresh) {
  try {
    const res = await fetch(`${SYNC_BASE}/api/media-index${fresh ? "?refresh=1" : ""}`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.ok) return;
    state.media = data;
    if (window.LUDWT) await LUDWT.ensureLoaded();
    addMissingSongs();
    updateVersionBar();
    renderList();
    if (!state.fehlChecked && window.FEHLEND && window.FEHLEND.checkNew) { state.fehlChecked = true; setTimeout(() => window.FEHLEND.checkNew(), 1500); }
  } catch { /* Worker nicht erreichbar: alles bleibt wie bisher */ }
}

/* Lieder, die nur als Instrumental/Video vorliegen (nicht in songs.json), spielbar machen – z. B. für LuD+WT */
const showExtraSongs = () => { try { return localStorage.getItem("showExtra") === "1"; } catch { return false; } };

function addMissingSongs() {
  if (!state.media) return;
  const have = new Set(state.songs.map((song) => song.number));
  const current = state.songs[state.index];
  const titles = new Map();
  if (window.LUDWT) {
    for (const week of LUDWT.weeks()) {
      for (const key of ["leben_und_dienst", "wachtturm"]) {
        for (const lied of (week[key] && week[key].lieder) || []) if (lied.titel) titles.set(lied.nummer, lied.titel);
      }
    }
  }
  const wanted = new Set();
  const weekly = new Set();
  if (window.LUDWT) {
    for (const week of LUDWT.weeks()) {
      for (const key of ["leben_und_dienst", "wachtturm"]) {
        for (const lied of (week[key] && week[key].lieder) || []) weekly.add(lied.nummer);
      }
    }
  }
  const m = state.media.meeting || {};
  const numbers = [...Object.keys(m.audio || {}), ...Object.keys(m.video || {}), ...Object.keys(m.sung || {})].map(Number);
  for (const n of numbers) if (n > 0 && (showExtraSongs() || weekly.has(n))) wanted.add(n);
  let added = false;
  for (const n of wanted) {
    if (have.has(n) || !(mediaKey("meeting", n) || mediaKey("video", n) || mediaKey("sung", n))) continue;
    state.songs.push({ id: String(n).padStart(3, "0"), number: n, title: titles.get(n) || `Lied ${n}`, category: "", extra: true });
    have.add(n);
    added = true;
  }
  if (!added) return;
  state.songs.sort((a, b) => a.number - b.number);
  if (current) state.index = state.songs.indexOf(current);
}

/* Schalter „Weitere Lieder“ geändert: Zusatzlieder neu aufbauen */
function rebuildExtras() {
  const current = state.songs[state.index];
  state.songs = state.songs.filter((s) => !s.extra || (current && s === current));
  if (current && current.extra) state.songs = state.songs.filter((s) => !(s.extra && s !== current));
  state.index = current ? state.songs.indexOf(current) : -1;
  addMissingSongs();
  if (current) state.index = state.songs.indexOf(current);
  updateSourceFilterUi();
  renderList();
}

/* Quellen-Auswahl (Karaoke / Instrumental / Video) in der Liste, nur bei aktivem Schalter + Lupe */
const SRC_TYPES = [["karaoke", "Karaoke"], ["meeting", "Instrumental"], ["video", "Video"], ["sung", "Zusammenkünfte"]];
function srcSet() {
  try { const a = JSON.parse(localStorage.getItem("srcFilter") || "null"); if (Array.isArray(a) && a.length) return new Set(a); } catch { /* egal */ }
  return new Set(SRC_TYPES.map((t) => t[0]));
}
function songHasSource(song, type) {
  if (type === "karaoke") return !song.extra;
  if (!state.media) return false;
  return Boolean(mediaKey(type, song.number));
}
function updateSourceFilterUi() {
  const box = document.getElementById("sourceFilter");
  if (!box) return;
  const glass = !document.getElementById("lyricSearchWrap").hidden;
  const on = showExtraSongs();
  box.hidden = !(on && glass);
  document.body.classList.toggle("show-extra", on);
  if (box.hidden) return;
  const set = srcSet();
  box.replaceChildren();
  const lab = document.createElement("span"); lab.className = "src-label"; lab.textContent = "Anzeigen";
  const chipRow = document.createElement("div"); chipRow.className = "src-chips";
  box.append(lab, chipRow);
  SRC_TYPES.forEach(([id, name]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = `chip src-chip src-${id}`; b.textContent = name;
    b.setAttribute("aria-pressed", String(set.has(id)));
    b.addEventListener("click", () => {
      const cur = srcSet();
      if (cur.has(id)) cur.delete(id); else cur.add(id);
      if (!cur.size) cur.add(id);
      try { localStorage.setItem("srcFilter", JSON.stringify([...cur])); } catch { /* egal */ }
      updateSourceFilterUi(); renderList();
    });
    chipRow.append(b);
  });
}

/* Video-Fenster beginnt direkt unter Titel + Fassungs-Buttons */
function layoutVideo() {
  const root = document.documentElement;
  const now = document.querySelector(".stage > .now");
  const tb = document.querySelector(".topbar");
  let top = tb ? tb.getBoundingClientRect().bottom : 58;
  if (now && getComputedStyle(now).display !== "none") top = Math.max(top, now.getBoundingClientRect().bottom);
  root.style.setProperty("--vtop", `${Math.round(top)}px`);
}

function updateVersionBar() {
  const bar = document.getElementById("versionBar");
  if (!bar) return;
  const m = state.media;
  const song = state.songs[state.index];
  let on = false;
  try { on = localStorage.getItem("verBarAlways") === "1"; } catch { /* egal */ }
  if (document.body.classList.contains("glass-open") || document.body.classList.contains("edit-mode")) on = true;
  document.body.classList.toggle("no-verbar", !on);
  const needIco = document.body.classList.contains("glass-open") && (state.mode === "ludwt" || state.mode === "playlists");
  bar.hidden = !song && !needIco;
  bar.classList.toggle("only-ico", !song);
  if (!song) return;
  const n = song.number;
  const avail = { karaoke: !song.extra, meeting: Boolean(mediaKey("meeting", n)), video: Boolean(mediaKey("video", n)), sung: Boolean(mediaKey("sung", n)) };
  bar.querySelectorAll(".seg-btn[data-ver]").forEach((btn) => {
    const v = btn.dataset.ver;
    btn.disabled = !avail[v];
    btn.setAttribute("aria-pressed", String(state.curVersion === v));
  });
  const view = document.getElementById("verView");
  if (view) {
    view.hidden = !(state.curVersion === "video" && state.videoLines && state.videoLines.length);
    view.textContent = state.videoText ? "Video zeigen" : "Text statt Video";
    view.setAttribute("aria-pressed", String(Boolean(state.videoText)));
  }
  document.body.classList.toggle("video-text", (Boolean(state.videoText) || state.unsynced) && state.curVersion === "video");
  layoutVideo();
  const text = document.getElementById("verText");
  const own = Boolean(mediaKey(state.curVersion === "sung" ? "lrcs" : "lrc", n));
  text.hidden = state.curVersion === "karaoke" || own || Boolean(state.videoLines && state.videoLines.length);
  text.setAttribute("aria-pressed", String(state.unsynced));
  text.textContent = state.unsynced ? "Karaoketext ausblenden" : "Karaoketext anzeigen";
}

async function pickSource(song, want) {
  const n = song.number;
  const video = mediaKey("video", n), meet = mediaKey("meeting", n), sung = mediaKey("sung", n);
  if (want === "sung" && sung) return { version: "sung", url: mediaUrl(sung) };
  if (want === "video" && video) return { version: "video", url: mediaUrl(video) };
  if ((want === "video" || want === "meeting") && meet) return { version: "meeting", url: mediaUrl(meet) };
  const kKey = mediaKey("karaoke", n);
  if (kKey) return { version: "karaoke", url: mediaUrl(kKey) };
  if (!song.extra) {
    const url = await resolveAudio(song);
    const sameOrigin = !/^https?:/i.test(url) || url.startsWith(`${SYNC_BASE}/`);
    if (sameOrigin || (!meet && !video && !sung)) return { version: "karaoke", url };
    // Fremde Quelle: kurz prüfen, ob die Datei dort wirklich liegt, sonst Instrumental nehmen
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 4000);
      const head = await fetch(url, { method: "HEAD", signal: ctl.signal });
      clearTimeout(timer);
      if (head.ok) return { version: "karaoke", url };
    } catch { /* nicht erreichbar -> Ersatz */ }
  }
  if (meet) return { version: "meeting", url: mediaUrl(meet), fallback: true };
  if (sung) return { version: "sung", url: mediaUrl(sung), fallback: true };
  if (video) return { version: "video", url: mediaUrl(video), fallback: true };
  return { version: "karaoke", url: song.extra ? "" : await resolveAudio(song) };
}

function chooseVersion(version) {
  if (state.version === version && state.curVersion === version) return;
  state.version = version;
  const wasPlaying = !el.audio.paused;
  state.resumeAt = el.audio.currentTime > 1 ? el.audio.currentTime : null;
  if (state.index >= 0) selectSong(state.index, wasPlaying);
}

function audioCandidates(song) {
  const file = song.file || `sjjc_E_${String(song.number).padStart(3, "0")}.mp3`;
  const remote = song.remote || `https://github.com/Carag7/JW-Musik/releases/download/JW-Vocals/${file}`;
  const paths = [file, `songs/${file}`, `songs1/${file}`, `songs2/${file}`];
  const cdn = paths.map((path) => `https://cdn.jsdelivr.net/gh/Carag7/JW-Musik@main/${path}`);
  const viaWorker = SYNC_BASE !== location.origin ? [`${SYNC_BASE}/${file}`] : [];
  return [...viaWorker, ...paths, ...cdn, remote];
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

function setAudioSource(url, keepPlaying) {
  if (!keepPlaying) el.audio.pause();
  el.audio.removeAttribute("crossorigin");
  el.audio.src = url;
  el.audio.load();
}

function setMediaSession(song) {
  if (!("mediaSession" in navigator) || !song) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: `${state.favorites.has(song.id) ? "★ " : ""}${song.title}`,
    artist: "Sing Out Joyfully",
    album: song.category || "Karaoke"
  });
  navigator.mediaSession.setActionHandler("previoustrack", () => { if (stepAllowed()) step(-1); });
  navigator.mediaSession.setActionHandler("nexttrack", () => { if (stepAllowed()) step(1); });
  navigator.mediaSession.setActionHandler("play", togglePlay);
  navigator.mediaSession.setActionHandler("pause", togglePlay);
  const optional = (action, handler) => {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* nicht überall unterstützt */ }
  };
  optional("seekbackward", favSeek() === "back" ? toggleFavorite : () => skip(-skipSec(-1)));
  optional("seekforward", favSeek() === "fwd" ? toggleFavorite : () => skip(skipSec(1)));
  optional("seekto", (details) => {
    if (details && Number.isFinite(details.seekTime)) el.audio.currentTime = details.seekTime;
  });
}

async function selectSong(index, autoplay) {
  if (index < 0 || index >= state.songs.length) return;
  state.index = index;
  const token = (state.selectToken || 0) + 1;
  state.selectToken = token;
  if (state.endIntro) { state.endIntro = false; document.getElementById("titleIntro").hidden = true; state.introActive = false; }
  state.audioTry = 0;
  state.waveData = null;
  const song = state.songs[index];
  const resume = state.resumeAt; state.resumeAt = null;
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
  paintFav2();
  el.progress.value = "0";
  el.currentTime.textContent = "0:00";
  el.duration.textContent = "0:00";
  el.play.textContent = "▶";
  markActive();
  try { localStorage.setItem("lastSongId", song.id); } catch { /* egal */ }
  showLyricLink(song);
  updateNeighbors();
  // Fassung wählen (Standard: Karaoke; fehlt sie, wird Instrumental/Video genommen)
  const src = await pickSource(song, state.version);
  if (token !== state.selectToken) return;  // inzwischen anderes Lied gewählt
  state.curVersion = src.version;
  document.body.classList.toggle("video-mode", src.version === "video");
  updateVersionBar();
  const url = src.url;
  if (!url) {
    el.status.textContent = "Für dieses Lied gibt es keine Datei.";
    return;
  }
  if (src.fallback) el.status.textContent = src.version === "meeting" ? "Karaoke-MP3 fehlt – Instrumental wird gespielt" : src.version === "sung" ? "Karaoke-MP3 fehlt – Zusammenkünfte-Fassung wird gespielt" : "Karaoke-MP3 fehlt – Video wird gespielt";
  state.currentAudio = url;
  // Beim Weiterschalten nicht pausieren und sofort weiterspielen: sonst springt im Tesla kurz Apple Music ein
  const keep = Boolean(autoplay) && !el.audio.paused;
  setAudioSource(url, keep);
  if (autoplay) {
    try { if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; } catch { /* egal */ }
    const pr = el.audio.play();
    if (pr && pr.then) pr.then(() => {
      if (token !== state.selectToken) return;
      el.play.textContent = "❚❚";
      setStatus("Spielt", "is-play");
      requestWakeLock();
    }).catch(() => { if (token === state.selectToken) el.status.textContent = "Wiedergabe blockiert. Tippe noch einmal auf Play."; });
  }
  if (resume) el.audio.addEventListener("loadedmetadata", () => { try { el.audio.currentTime = Math.max(0, Math.min(resume, (el.audio.duration || resume + 1) - 0.5)); } catch { /* egal */ } }, { once: true });
  loadLyrics(song, src.version);  // läuft parallel zum Audio-Laden
  setMediaSession(song);
  el.app.classList.add("song-open");
  if (!document.fullscreenElement && !document.body.classList.contains("pseudo-fullscreen")) {
    setSidebar(false);
  }
  if (state.canplayHandler) el.audio.removeEventListener("canplay", state.canplayHandler);
  state.canplayHandler = null;
  if (autoplay) {
    if (!resume) showTitleIntro(song);
    state.canplayHandler = () => {
      state.canplayHandler = null;
      if (token === state.selectToken && el.audio.paused) togglePlay();
    };
    el.audio.addEventListener("canplay", state.canplayHandler, { once: true });
    setTimeout(() => { if (state.introActive && !state.endIntro) hideTitleIntro(); }, 4000);
  }
}

/* ---------- Verbindung: Neuaufbau nach Netzverlust ---------- */
let reconnBusy = false, reconnTimer = 0;
function netUi() {
  el.play.classList.toggle("net-off", !navigator.onLine || Boolean(state.netErr));
  el.play.classList.toggle("reconnecting", reconnBusy);
}
function reconnect(manual) {
  const song = state.songs[state.index];
  if (!song || (reconnBusy && !manual)) return;
  reconnBusy = true;
  netUi();
  state.wantPlay = true;
  state.resumeAt = Math.max(el.audio.currentTime || 0, state.lastTime || 0);
  el.status.textContent = navigator.onLine ? "Verbindung wird neu aufgebaut …" : "Keine Internetverbindung – es wird weiter versucht …";
  clearTimeout(reconnTimer);
  reconnTimer = setTimeout(() => { reconnBusy = false; netUi(); }, 9000);
  selectSong(state.index, true);
}
function setupNet() {
  window.addEventListener("offline", () => { state.netErr = true; netUi(); });
  window.addEventListener("online", () => { netUi(); if (state.wantPlay && (el.audio.paused || state.netErr)) reconnect(); });
  el.audio.addEventListener("playing", () => { state.netErr = false; reconnBusy = false; state.waitSince = 0; clearTimeout(reconnTimer); netUi(); });
  el.audio.addEventListener("play", () => { state.wantPlay = true; });
  const playingCls = () => document.body.classList.toggle("is-playing", !el.audio.paused && !el.audio.ended);
  ["play", "playing", "pause", "ended", "emptied"].forEach((n) => el.audio.addEventListener(n, playingCls));
  el.audio.addEventListener("waiting", () => { if (!state.waitSince) state.waitSince = Date.now(); });
  el.audio.addEventListener("timeupdate", () => { state.waitSince = 0; if (el.audio.currentTime > 0) state.lastTime = el.audio.currentTime; });
  el.audio.addEventListener("error", () => { const c = el.audio.error ? el.audio.error.code : 0; if (!navigator.onLine || c === 2) { state.netErr = true; netUi(); } });
  setInterval(() => {
    netUi();
    if (!state.wantPlay || reconnBusy || !navigator.onLine) return;
    const stuck = state.waitSince && Date.now() - state.waitSince > 12000;
    if (state.netErr || stuck) reconnect();
  }, 4000);
  /* Play-Taste ca. 1 Sekunde gedrückt halten = Verbindung neu aufbauen */
  let t = 0;
  const start = () => { clearTimeout(t); t = setTimeout(() => { state.playHeld = true; reconnect(true); }, 1000); };
  const stop = () => clearTimeout(t);
  el.play.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((n) => el.play.addEventListener(n, stop));
  netUi();
}

function togglePlay() {
  if (state.netErr && navigator.onLine) { reconnect(true); return; }
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
    state.wantPlay = false;
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
  if (state.introActive && !state.endIntro && now >= Math.max(0, first - 4)) hideTitleIntro();
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

const lupeOpt = (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : v === "1"; } catch { return def; } };
const ludwtSingleOn = () => lupeOpt("ludwtSingle", false);
const listRepeatOn = () => lupeOpt("listRepeat", true);
function updateWho() {
  const box = document.getElementById("whoBadge");
  if (!box) return;
  let u = "", c = "";
  try { u = localStorage.getItem("userName") || ""; c = localStorage.getItem("sync-code") || ""; } catch { /* egal */ }
  const uPend = Boolean(u) && (!userSyncOk || state.setPending);
  const cPend = Boolean(c) && (Boolean(state.favPending) || (state.syncRun || 0) > 0);
  const key = [u, c, uPend, cPend].join("\u0001");
  if (box.dataset.k === key) return;
  box.dataset.k = key;
  box.replaceChildren();
  const wrap = document.createElement("div"); wrap.className = "wbox"; box.append(wrap);
  const t = document.createElement("div"); t.className = "wt"; t.textContent = "Sync"; wrap.append(t);
  const line = (label, v, pend, stampKey) => {
    const sp = document.createElement("button");
    sp.type = "button";
    sp.className = "w " + (v ? (pend ? "pend" : "ok") : "");
    sp.append(label + ": ");
    const b = document.createElement("b"); b.textContent = v || "–"; sp.append(b);
    sp.title = v ? (pend ? "wird noch abgeglichen …" : "abgeglichen") : "nicht eingestellt";
    sp.addEventListener("click", () => {
      const ts = Number(localStorage.getItem(stampKey)) || 0;
      const when = ts ? new Date(ts).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "medium" }) : "noch nicht in diesem Browser";
      uiDialog({ eyebrow: "Sync", title: label + (v ? `: ${v}` : ""), lines: [v ? `Letzte Synchronisierung: ${when}` : "Nicht eingestellt.", pend ? "Aktuell wird noch abgeglichen …" : ""].filter(Boolean), buttons: [{ value: true, kind: "primary", label: "OK" }] });
    });
    wrap.append(sp);
  };
  line("Benutzer", u, uPend, "lastSyncUser");
  line("Favoriten", c, cPend, "lastSyncFav");
}
setInterval(updateWho, 600);
document.addEventListener("DOMContentLoaded", updateWho);

function bindLupeOpts() {
  [["ludwtSingle", ludwtSingleOn], ["listRepeat", listRepeatOn]].forEach(([id, get]) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.setAttribute("aria-pressed", String(get()));
    b.addEventListener("click", () => {
      const on = !get();
      try { localStorage.setItem(id, on ? "1" : "0"); } catch { /* egal */ }
      b.setAttribute("aria-pressed", String(on));
      state.shufPlayed = new Set();
      if (state.mode === "ludwt") renderList();
    });
  });
}
/* Ende eines Liedes: true = stoppen, false = weiter */
function stopAfterSong() {
  const cur = state.songs[state.index];
  if (state.mode === "ludwt") return ludwtSingleOn();
  if (state.mode === "playlists" && !listRepeatOn() && cur) {
    const pool = playPool();
    if (state.shuffle) {
      state.shufPlayed = state.shufPlayed || new Set();
      state.shufPlayed.add(cur.id);
      if (pool.every((s) => state.shufPlayed.has(s.id))) { state.shufPlayed = new Set(); return true; }
    } else if (pool.indexOf(cur) === pool.length - 1) return true;
  }
  return false;
}

/* Schutz gegen „Stroboskop“: automatische Wechsel (Liedende, Medientasten) höchstens 3 in 4 Sekunden */
const stepLog = [];
function stepAllowed() {
  const now = Date.now();
  while (stepLog.length && now - stepLog[0] > 4000) stepLog.shift();
  if (stepLog.length >= 3) {
    try { el.audio.pause(); } catch { /* egal */ }
    el.status.textContent = "Automatischer Wechsel gestoppt (Lieder wechselten zu schnell).";
    return false;
  }
  stepLog.push(now);
  return true;
}

function step(delta) {
  const pool = playPool();
  if (!pool.length) {
    el.status.textContent = state.playFavorites ? "Keine Favoriten markiert" : "Keine Lieder";
    return;
  }
  const playing = !el.audio.paused;
  if (state.shuffle && state.mode !== "ludwt") {
    let choices = pool.filter((song) => song !== state.songs[state.index]);
    if (state.mode === "playlists" && !listRepeatOn()) {
      const done = state.shufPlayed || (state.shufPlayed = new Set());
      const fresh = choices.filter((song) => !done.has(song.id));
      if (fresh.length) choices = fresh; else state.shufPlayed = new Set();
    }
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

function skipSec(dir) {
  const get = (k) => { const n = Number(localStorage.getItem(k)); return n >= 1 && n <= 300 ? Math.round(n) : 0; };
  return get(dir < 0 ? "skipBack" : "skipFwd") || get("skipSec") || 15;
}
function updateSkipLabels() {
  const b = skipSec(-1), f = skipSec(1);
  el.back15.textContent = `−${b}`;
  el.fwd15.textContent = `+${f}`;
  el.back15.setAttribute("aria-label", `${b} Sekunden zurück`);
  el.fwd15.setAttribute("aria-label", `${f} Sekunden vor`);
}
/* Kurz tippen = springen, lang drücken = Sprungweite (getrennt für zurück und vor) einstellen */
function bindSkipButton(btn, dir) {
  let timer = 0;
  let longDone = false;
  const clear = () => clearTimeout(timer);
  btn.addEventListener("pointerdown", () => {
    longDone = false;
    clear();
    timer = setTimeout(async () => {
      if (el.lyricSearchWrap.hidden) return;   // Einstellen nur bei aktiver Lupe
      longDone = true;
      const v = await uiPrompt({ eyebrow: "Wiedergabe", title: dir < 0 ? "Sprungweite zurück" : "Sprungweite vor", text: `Sekunden pro Tipp auf ${dir < 0 ? "−" : "+"} (1 bis 300).`, value: String(skipSec(dir)), type: "number", inputMode: "numeric", ok: "Speichern" });
      if (v === null) return;
      const n = Math.round(Number(v));
      if (!(n >= 1 && n <= 300)) { showToast("Bitte eine Zahl von 1 bis 300 eingeben."); return; }
      localStorage.setItem(dir < 0 ? "skipBack" : "skipFwd", String(n));
      updateSkipLabels();
    }, 700);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) => btn.addEventListener(t, clear));
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  btn.addEventListener("click", (e) => {
    if (longDone) { longDone = false; e.preventDefault(); return; }
    skip(dir * skipSec(dir));
  });
}
function skip(seconds) {
  if (!el.audio.src && !el.audio.currentSrc) return;
  const duration = el.audio.duration || Number.MAX_SAFE_INTEGER;
  el.audio.currentTime = Math.min(duration, Math.max(0, (el.audio.currentTime || 0) + seconds));
}

const favPlace = () => { try { const v = localStorage.getItem("favPlace"); return ["top", "bottom", "both"].includes(v) ? v : "both"; } catch { return "both"; } };
const favSeek = () => { try { const v = localStorage.getItem("favSeek"); return ["back", "fwd"].includes(v) ? v : "off"; } catch { return "off"; } };
function applyFavPlace() {
  const p = favPlace();
  document.body.classList.toggle("fav-top-off", p === "bottom");
  document.body.classList.toggle("fav-bottom-off", p === "top");
}
function paintFav2() {
  applyFavPlace();
  const b = document.getElementById("favoriteBtn2");
  if (!b) return;
  const song = state.songs[state.index];
  document.body.classList.toggle("no-song", !song);
  const fav = Boolean(song && state.favorites.has(song.id));
  b.setAttribute("aria-pressed", String(fav));
  b.textContent = fav ? "★" : "☆";
  b.disabled = !song;
}
const srcTagsOn = () => { try { return localStorage.getItem("srcTags") !== "0"; } catch { return true; } };

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
  paintFav2();
  setMediaSession(song);
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

/* Handy quer: Menüleiste beim Abspielen / Bearbeiten ausblenden, bei Wischen oder Antippen oben wieder einblenden */
const phoneLand = window.matchMedia("(orientation: landscape) and (max-height: 480px) and (max-width: 1000px) and (pointer: coarse)");
let chromeTimer = 0;
function updateChrome() {
  clearTimeout(chromeTimer);
  const body = document.body;
  const hide = phoneLand.matches && !state.sidebarOpen && (!el.audio.paused || body.classList.contains("edit-mode"));
  body.classList.toggle("chrome-hidden", hide);
  body.classList.remove("chrome-peek");
}
function peekChrome() {
  const body = document.body;
  if (!body.classList.contains("chrome-hidden")) return;
  if (body.classList.contains("edit-mode")) return;  // im Bearbeiten bleibt die Leiste weg
  body.classList.add("chrome-peek");
  clearTimeout(chromeTimer);
  chromeTimer = setTimeout(() => body.classList.remove("chrome-peek"), 5000);
}
function updateAutoIcon() {
  const on = localStorage.getItem("autoStart") === "1";
  const btn = document.getElementById("autoStartBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", String(on));
    btn.title = on ? "Autoplay beim Öffnen: ein (antippen zum Ausschalten)" : "Autoplay beim Öffnen: aus (antippen zum Einschalten)";
  }
  const box = document.getElementById("autoPlayOpt");
  if (box) box.checked = on;
}

function bindChrome() {
  ["play", "pause", "ended"].forEach((name) => el.audio.addEventListener(name, updateChrome));
  phoneLand.addEventListener("change", updateChrome);
  let startY = null;
  document.addEventListener("touchstart", (event) => { startY = event.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (startY !== null && Math.abs(event.touches[0].clientY - startY) > 28) { peekChrome(); startY = null; }
  }, { passive: true });
  document.addEventListener("wheel", peekChrome, { passive: true });
  document.addEventListener("pointermove", (event) => { if (event.pointerType === "mouse" && event.clientY < 24) peekChrome(); });
  document.querySelector(".topbar").addEventListener("pointerdown", () => {
    if (document.body.classList.contains("chrome-peek")) peekChrome();
  });
}

/* Beim Öffnen automatisch abspielen (letztes Lied, sonst Zufall). Blockiert der Browser das, startet es beim ersten Antippen. */
function tryAutoStart() {
  Promise.race([state.userReady || Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(tryAutoStartNow);
}
function tryAutoStartNow() {
  if (localStorage.getItem("autoStart") !== "1") return;
  if (!document.getElementById("loginGate").hidden || !state.songs.length) return;
  const last = localStorage.getItem("lastSongId");
  const at = state.songs.findIndex((song) => song.id === last);
  if (at >= 0) selectSong(at, true);
  else playRandom(state.favorites.size > 0);
  setTimeout(() => {
    if (!el.audio.paused) return;
    const arm = () => {
      ["pointerdown", "keydown", "touchstart"].forEach((type) => document.removeEventListener(type, arm, true));
      if (el.audio.paused) togglePlay();
    };
    ["pointerdown", "keydown", "touchstart"].forEach((type) => document.addEventListener(type, arm, true));
  }, 2500);
}

/* iPhone/iPad-Web-App: Leiste unter Statuszeile/Fenster-Knöpfen; Tastatur: sichtbare Höhe merken */
/* Zahlenfelder bekommen kleine Pfeile ▲ ▼ (+1 / −1), weil die Handy-Tastatur keine hat */
function enhanceNumbers(root) {
  (root || document).querySelectorAll('#codeModal input[type="number"]:not([data-stp])').forEach((inp) => {
    inp.dataset.stp = "1";
    const box = document.createElement("span");
    box.className = "stp";
    const mk = (txt, dir, label) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = txt; b.setAttribute("aria-label", label); b.tabIndex = -1;
      b.addEventListener("pointerdown", (e) => e.preventDefault());   // Tastatur bleibt offen
      b.addEventListener("click", () => {
        const min = inp.min !== "" ? Number(inp.min) : -Infinity, max = inp.max !== "" ? Number(inp.max) : Infinity;
        const v = Math.max(min, Math.min(max, (Number(inp.value) || 0) + dir));
        inp.value = String(v);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
      });
      return b;
    };
    box.append(mk("▲", 1, "um 1 erhöhen"), mk("▼", -1, "um 1 verringern"));
    inp.insertAdjacentElement("afterend", box);
  });
}
function setupNumberSteppers() {
  enhanceNumbers(document);
  new MutationObserver(() => enhanceNumbers(document)).observe(document.body, { childList: true, subtree: true });
}

/* Eingabeleiste: Tippst du auf ein Eingabefeld, erscheint es als Leiste direkt über der Tastatur (Handy, iPad; nicht im Tesla) */
function setupKbBar() {
  if (!window.matchMedia || !matchMedia("(pointer: coarse)").matches) return;
  try { if (isTesla()) return; } catch { /* egal */ }
  const bar = document.getElementById("kbBar"), inp = document.getElementById("kbInput"), lab = document.getElementById("kbLabel");
  const up = document.getElementById("kbUp"), down = document.getElementById("kbDown"), ok = document.getElementById("kbOk");
  if (!bar) return;
  let target = null;
  const vv = window.visualViewport;
  const place = () => {
    if (bar.hidden) return;
    const hgt = bar.offsetHeight;
    const top = vv ? vv.offsetTop + vv.height - hgt : window.innerHeight - hgt;
    bar.style.top = `${Math.max(0, Math.round(top))}px`;
  };
  if (vv) { vv.addEventListener("resize", place); vv.addEventListener("scroll", place); }
  window.addEventListener("resize", place);
  const labelOf = (t) => {
    const l = t.closest("label");
    let txt = "";
    if (l) { const c = l.cloneNode(true); c.querySelectorAll("input,select,textarea,button,.stp").forEach((n) => n.remove()); txt = c.textContent; }
    return (txt || t.getAttribute("aria-label") || t.placeholder || "").replace(/\s+/g, " ").trim();
  };
  const close = (commit, submit) => {
    if (!target) return;
    const t = target; target = null;
    bar.hidden = true;
    if (commit) t.dispatchEvent(new Event("change", { bubbles: true }));
    if (submit && t.form) { try { t.form.requestSubmit(); } catch { /* egal */ } }
  };
  const push = () => { if (target) { target.value = inp.value; target.dispatchEvent(new Event("input", { bubbles: true })); } };
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t || !t.matches || t === inp || !t.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]):not([type=file]):not([type=color]), textarea')) return;
    if (t.readOnly || t.disabled || t.closest("#kbBar")) return;
    if (target && target !== t) { const old = target; target = null; old.dispatchEvent(new Event("change", { bubbles: true })); }
    target = t;
    const isNum = t.type === "number";
    inp.type = ["text", "search", "password", "number", "email", "tel", "url"].includes(t.type) ? t.type : "text";
    ["inputmode", "min", "max", "step", "placeholder", "maxlength"].forEach((a) => { if (t.hasAttribute(a)) inp.setAttribute(a, t.getAttribute(a)); else inp.removeAttribute(a); });
    inp.value = t.value;
    lab.textContent = labelOf(t);
    up.hidden = down.hidden = !isNum;
    bar.hidden = false;
    place();
    inp.focus();
    try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch { /* number-Felder */ }
    [120, 300, 600, 1000].forEach((ms) => setTimeout(place, ms));
  });
  inp.addEventListener("input", push);
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); close(true, true); inp.blur(); } });
  inp.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== inp) close(true); }, 60));
  [up, down, ok].forEach((b) => b.addEventListener("pointerdown", (e) => e.preventDefault()));
  const bump = (d) => {
    const min = inp.min !== "" ? Number(inp.min) : -Infinity, max = inp.max !== "" ? Number(inp.max) : Infinity;
    inp.value = String(Math.max(min, Math.min(max, (Number(inp.value) || 0) + d)));
    push();
  };
  up.addEventListener("click", () => bump(1));
  down.addEventListener("click", () => bump(-1));
  ok.addEventListener("click", () => { inp.blur(); close(true); });
}

function setupViewport() {
  const root = document.documentElement;
  const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  const ipad = /iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (standalone && ipad) {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none";
    document.body.append(probe);
    const safe = probe.getBoundingClientRect().height;
    probe.remove();
    if (safe < 28) root.style.setProperty("--safe-top", "28px");
  }
  const vv = window.visualViewport;
  const sync = () => {
    if (!vv) return;
    if (vv.scale <= 1.01 && window.innerHeight - vv.height > 100) { root.style.setProperty("--vvh", `${Math.round(vv.height)}px`); root.style.setProperty("--vvtop", `${Math.round(vv.offsetTop)}px`); }
    else { root.style.removeProperty("--vvh"); root.style.removeProperty("--vvtop"); }
    const ae = document.activeElement;
    if (ae && ae.matches && ae.matches("input, textarea, select")) {
      setTimeout(() => ae.scrollIntoView({ block: "center", behavior: "smooth" }), 80);
    }
  };
  if (vv) { vv.addEventListener("resize", sync); vv.addEventListener("scroll", () => { if (root.style.getPropertyValue("--vvh")) root.style.setProperty("--vvtop", `${Math.round(vv.offsetTop)}px`); }); sync(); }
  /* Eingabefeld bleibt sichtbar, wenn die Tastatur aufgeht (auch nach dem Aufklappen der Tastatur) */
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (!t || !t.matches || !t.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select")) return;
    [250, 600].forEach((ms) => setTimeout(() => { if (document.activeElement === t) t.scrollIntoView({ block: "center", behavior: "smooth" }); }, ms));
  });
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    if (t && t.matches && t.matches("input, textarea") && t.closest(".login-gate")) {
      setTimeout(() => t.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
    }
  });
}

/* „Welle“-Button rechtsbündig genau über der Endzeit des Liedes */
function alignWave() {
  const row = document.querySelector(".nav-row");
  const dur = document.getElementById("duration");
  if (!row || !dur) return;
  const gap = Math.round(row.getBoundingClientRect().right - dur.getBoundingClientRect().right);
  row.style.setProperty("--wave-gap", `${Math.max(0, gap)}px`);
}

/* Lange-Drücken-Schutz (Lupe, Player-Symbol): löst schon WÄHREND des Haltens aus, nicht erst beim Loslassen
   (nach langem Drücken schicken Touch-Browser oft kein Klick-Ereignis mehr). Einstellbar, Standard: aus. */
const holdHintOn = () => { try { return localStorage.getItem("holdHint") === "1"; } catch { return false; } };
const holdOn = () => { try { return localStorage.getItem("holdGuard") === "1"; } catch { return false; } };
function guardHold(btn, ms = 700) {
  let timer = 0, fired = false, bypass = false;
  btn.classList.add("hold-guard");
  btn._fire = () => { bypass = true; btn.click(); bypass = false; };
  const stop = () => { clearTimeout(timer); btn.classList.remove("holding"); };
  btn.addEventListener("pointerdown", () => {
    if (!holdOn()) return;
    fired = false; stop();
    void btn.offsetWidth;
    btn.classList.add("holding");
    timer = setTimeout(() => {
      fired = true;
      btn.classList.remove("holding");
      btn._fire();
    }, ms);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) => btn.addEventListener(t, stop));
  btn.addEventListener("contextmenu", (e) => { if (holdOn()) e.preventDefault(); });
  btn.addEventListener("click", (e) => {
    if (!holdOn() || bypass || e.detail === 0) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    if (fired) { fired = false; return; }
    if (holdHintOn()) showToast("Länger drücken");
  }, true);
}
/* Erweiterte Optionen = Funktion der Lupe (ohne Schutz) */
function toggleAdvanced() {
  const b = el.lyricSearchToggle;
  if (b._fire) b._fire(); else b.click();
}

/* Voreinstellungen für den Tesla-Browser (nur Werte, die noch nicht gesetzt sind; force = überschreiben) */
const isTesla = () => /Tesla/i.test(navigator.userAgent);

function bind() {
  setupViewport();
  setupNet();
  setupKbBar();
  setupNumberSteppers();
  applyTopOffsets();
  try {
    const w = Number(localStorage.getItem("sidebarW"));
    if (w >= 180) document.documentElement.style.setProperty("--sidebar", `${w}px`);
  } catch { /* egal */ }
  document.body.classList.toggle("hold-hint", holdHintOn());
  applyStartGif();
  /* Überraschungen: Vollbild-Fenster mit Video (MP4) oder GIF, Endlosschleife, × zum Beenden */
  const eggM = document.getElementById("eggModal"), eggV = document.getElementById("eggVideo"), eggI = document.getElementById("eggImg");
  let eggResume = false, eggNum = 1, eggOpen = false, eggGifShown = false;
  const lsGet = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
  const eggMode = () => lsGet("eggMode", "auto");
  const eggFallback = () => lsGet("eggFall", "0") === "1";
  const eggGifSrc = () => { const p = lsGet("eggGif", "chor"); return p === "chor" ? "chor.gif" : `egg${p === "1" || p === "2" ? p : eggNum}.gif`; };
  const showGif = () => {
    eggGifShown = true;
    try { eggV.pause(); eggV.removeAttribute("src"); eggV.load(); } catch { /* egal */ }
    eggV.hidden = true;
    eggI.hidden = false;
    eggI.src = `${eggGifSrc()}?t=${Date.now()}`;
  };
  const showVideo = () => {
    eggGifShown = false;
    eggI.hidden = true; eggI.removeAttribute("src");
    eggV.hidden = false;
    eggV.src = `egg${eggNum}.mp4`; eggV.loop = true; eggV.muted = false;
    const auto = eggMode() === "auto" && eggFallback();
    let started = false;
    const toGif = () => { if (eggOpen && !eggGifShown && auto) showGif(); };
    eggV.onplaying = () => { started = true; };
    eggV.onerror = toGif;
    eggV.onpause = () => { if (started) toGif(); };    // Tesla stoppt Videos in Fahrt
    const tryPlay = (muted) => {
      eggV.muted = muted;
      const p = eggV.play();
      if (p && p.catch) p.catch(() => { if (!muted) tryPlay(true); else toGif(); });
    };
    tryPlay(false);
    if (auto) setTimeout(() => { if (eggOpen && !started) toGif(); }, 2500);
  };
  const eggClose = () => {
    eggOpen = false;
    eggV.onpause = null; eggV.onerror = null;
    try { eggV.pause(); eggV.removeAttribute("src"); eggV.load(); } catch { /* egal */ }
    eggI.removeAttribute("src");
    eggM.hidden = true;
    try { if (document.fullscreenElement === eggM) document.exitFullscreen(); } catch { /* egal */ }
    if (eggResume) { eggResume = false; el.audio.play().catch(() => {}); }
  };
  document.querySelectorAll(".egg").forEach((b) => b.addEventListener("click", () => {
    eggNum = b.dataset.src.includes("2") ? 2 : 1;
    eggResume = !el.audio.paused;
    if (eggResume) el.audio.pause();
    eggOpen = true;
    eggM.hidden = false;
    try { if (eggM.requestFullscreen) eggM.requestFullscreen().catch(() => {}); } catch { /* egal */ }
    if (eggMode() === "gif") showGif(); else showVideo();
  }));
  document.getElementById("eggClose").addEventListener("click", eggClose);
  eggM.addEventListener("click", (e) => { if (e.target === eggM || e.target === eggV || e.target === eggI) eggClose(); });
  new MutationObserver(() => updateVersionBar()).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.getElementById("footToggle").addEventListener("click", () => {
    const box = document.getElementById("footBtns"), t = document.getElementById("footToggle");
    box.hidden = !box.hidden;
    t.setAttribute("aria-expanded", String(!box.hidden));
    t.textContent = box.hidden ? "›" : "×";
  });
  document.getElementById("footSettings").addEventListener("click", () => syncFavorites("allgemein"));
  document.getElementById("footAdvanced").addEventListener("click", toggleAdvanced);
  guardHold(document.getElementById("lyricSearchToggle"));
  guardHold(document.getElementById("playerToggle"));
  window.addEventListener("resize", alignWave);
  const tl = document.querySelector(".timeline");
  if (tl && window.ResizeObserver) new ResizeObserver(alignWave).observe(tl);
  setTimeout(alignWave, 300);
  bindChrome();
  window.addEventListener("resize", layoutVideo);
  const nowEl = document.querySelector(".stage > .now");
  if (nowEl && window.ResizeObserver) new ResizeObserver(layoutVideo).observe(nowEl);
  el.lyricSearchToggle.addEventListener("click", () => {
    const open = el.lyricSearchWrap.hidden;
    el.lyricSearchWrap.hidden = !open;
    document.body.classList.toggle("glass-open", open);
    el.lyricSearchToggle.setAttribute("aria-pressed", String(open));
    document.getElementById("listTools").hidden = !open;
    document.getElementById("favTools").hidden = !open;
    updateSourceFilterUi();
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
    /* Ist das laufende Lied nicht in dieser Liste, soll das ganze Fenster von oben zu sehen sein (nicht nach oben weggeschoben) */
    setTimeout(() => {
      if (state.mode !== "ludwt") return;
      if (!document.querySelector("#songList .song-btn.active")) {
        const sb = document.getElementById("sidebar");
        if (sb) sb.scrollTop = 0;
        if (el.list) el.list.scrollTop = 0;
        [document.body, document.documentElement].forEach((n) => { if (n.scrollTop) n.scrollTop = 0; });
      }
    }, 120);
  });
  document.getElementById("ludwtWeek").addEventListener("change", (event) => {
    state.ludwtWeek = event.target.value;
    renderList();
    updateNeighbors();
    updateLudwtNav();
  });
  bindLupeOpts();
  updateWho();
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
    const chosen = state.playlists.find((l) => l.id === state.activePlaylist);
    state.selectMode = !chosen || chosen.songs.length === 0;
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
  /* tatsächliche Breite in px (die Variable kann „100vw“ sein, dann liefert parseInt fälschlich 100) */
  const sidebarPx = () => { const sb = document.getElementById("sidebar"); const w = sb ? Math.round(sb.getBoundingClientRect().width) : 0; return w >= 100 ? w : (Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar"), 10) || 300); };
  window.sidebarPx = sidebarPx;
  const setSidebarWidth = (px) => {
    const next = Number.isFinite(px) ? px : sidebarPx();
    const maxW = window.innerWidth <= 700 ? window.innerWidth : window.innerWidth - 160;
    const width = Math.max(180, Math.min(maxW, next));
    document.documentElement.style.setProperty("--sidebar", `${width}px`);
    if (Number.isFinite(px)) { try { localStorage.setItem("sidebarW", String(Math.round(width))); } catch { /* egal */ } }
    positionArrow();
  };
  window.setSidebarWidth = setSidebarWidth;
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
  document.getElementById("splitLeft").addEventListener("click", () => setSidebarWidth(sidebarPx() - 40));
  document.getElementById("splitRight").addEventListener("click", () => setSidebarWidth(sidebarPx() + 40));
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
  el.play.addEventListener("click", () => { if (state.playHeld) { state.playHeld = false; return; } togglePlay(); });
  el.prev.addEventListener("click", () => step(-1));
  el.next.addEventListener("click", () => step(1));
  bindSkipButton(el.back15, -1);
  bindSkipButton(el.fwd15, 1);
  updateSkipLabels();
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
  if (logout) logout.addEventListener("click", async () => {
    const sure = await uiConfirm({ eyebrow: "Konto", title: "Wirklich abmelden?", text: "Danach musst du das Passwort wieder eingeben.", ok: "Abmelden", danger: true });
    if (!sure) return;
    localStorage.removeItem(STORAGE.auth);
    sessionStorage.removeItem(STORAGE.auth);
    location.reload();
  });
  document.getElementById("sortSel").addEventListener("change", (event) => {
    if (state.mode === "playlists") { sortPlaylist(event.target.value); event.target.value = ""; }
    else { state.sortBy = event.target.value; renderList(); }
  });
  document.getElementById("exportFav").addEventListener("click", () => { state.fromSettings = true; exportFavorites(); });
  document.getElementById("syncFav").addEventListener("click", () => syncFavorites());
  document.getElementById("importFav").addEventListener("click", () => { state.fromSettings = true; importFavorites(); });
  autoSync();
  el.favorite.addEventListener("click", toggleFavorite);
  document.getElementById("favoriteBtn2").addEventListener("click", toggleFavorite);
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
  const vv = document.getElementById("verView");
  if (vv) vv.addEventListener("click", () => { state.videoText = !state.videoText; updateVersionBar(); });
  document.querySelectorAll("#versionBar .seg-btn[data-ver]").forEach((btn) => btn.addEventListener("click", () => chooseVersion(btn.dataset.ver)));
  document.getElementById("verText").addEventListener("click", toggleUnsynced);
  document.getElementById("closeSidebar").addEventListener("click", () => setSidebar(false));
  document.getElementById("autoStartBtn").addEventListener("click", () => {
    const on = localStorage.getItem("autoStart") !== "1";
    try { localStorage.setItem("autoStart", on ? "1" : "0"); } catch { /* egal */ }
    updateAutoIcon();
    showToast(on ? "Autoplay beim Öffnen: ein" : "Autoplay beim Öffnen: aus");
  });
  updateAutoIcon();
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
  el.audio.addEventListener("play", () => { if (state.endIntro) hideTitleIntro(); });
  const setBuf = (on) => el.play.classList.toggle("buffering", on);
  ["play", "waiting", "loadstart"].forEach((n) => el.audio.addEventListener(n, () => { if (!el.audio.paused || n === "play") setBuf(true); }));
  ["playing", "pause", "ended", "error", "emptied"].forEach((n) => el.audio.addEventListener(n, () => setBuf(false)));
  let bufEnd = -1, bufGrow = 0, bufT1 = 0, bufT2 = 0, bufArmed = true, bufHidEnd = -1;
  const paintBuf = () => {
    const bar = document.getElementById("bufBar"), i = bar && bar.querySelector("i");
    if (!i) return;
    const d = el.audio.duration, b = el.audio.buffered, now = Date.now();
    let end = 0;
    try { for (let k = 0; k < b.length; k++) if (b.start(k) <= el.audio.currentTime + 0.5) end = Math.max(end, b.end(k)); } catch { /* egal */ }
    if (end !== bufEnd) { if (end > bufEnd) bufGrow = now; bufEnd = end; }
    const known = d && isFinite(d);
    const full = known && end >= d - 0.5;
    const growing = now - bufGrow < 2500 || (el.audio.readyState < 3 && !el.audio.paused);
    /* Hysterese: nach dem Ausblenden nur wieder zeigen bei Stocken oder bei großem Sprung (≥ 15 %) */
    const waiting = el.audio.readyState < 3 && !el.audio.paused;
    const jump = known && bufHidEnd >= 0 && end - bufHidEnd >= 0.15 * d;
    const shownNow = bar.classList.contains("on") && !state.bufLinger;
    const filling = Boolean(el.audio.currentSrc) && !full && growing && (shownNow || bufArmed || waiting || jump);
    if (filling) {
      clearTimeout(bufT1); clearTimeout(bufT2); state.bufLinger = false;
      bar.classList.add("on"); bar.classList.remove("fade");
      i.style.width = `${known ? Math.min(100, (end / d) * 100) : 0}%`;
    } else if (bar.classList.contains("on") && !state.bufLinger) {
      state.bufLinger = true;
      bufArmed = false; bufHidEnd = end;
      if (full) i.style.width = "100%";
      bufT1 = setTimeout(() => {
        bar.classList.add("fade");
        bufT2 = setTimeout(() => { bar.classList.remove("on", "fade"); state.bufLinger = false; }, 1500);
      }, full ? 1500 : 200);
    }
    if (bar.classList.contains("on")) {
      const tr = bar.parentElement.getBoundingClientRect(), a = el.back15.getBoundingClientRect(), z = el.fwd15.getBoundingClientRect();
      bar.style.left = `${a.left - tr.left}px`;
      bar.style.width = `${z.right - a.left}px`;
    }
  };
  ["emptied", "loadstart"].forEach((n) => el.audio.addEventListener(n, () => { bufEnd = -1; bufGrow = Date.now(); bufArmed = true; bufHidEnd = -1; }));
  setInterval(paintBuf, 700);
  ["progress", "timeupdate", "loadedmetadata", "durationchange", "emptied", "loadstart", "canplay"].forEach((n) => el.audio.addEventListener(n, paintBuf));
  el.audio.addEventListener("timeupdate", updateProgress);
  el.audio.addEventListener("loadedmetadata", updateProgress);
  el.audio.addEventListener("ended", () => {
    el.play.textContent = "▶";
    el.status.textContent = "Ende";
    state.wantPlay = false;
    if (stopAfterSong()) {
      el.status.textContent = state.mode === "ludwt" ? "Ende (einzeln)" : "Liste beendet";
      const cur = state.songs[state.index];
      /* Karaoke: am Schluss Liednummer und Titel zeigen; Video: erstes Bild (Titelbild) zeigen */
      if (cur && state.curVersion === "karaoke") { state.endIntro = true; showTitleIntro(cur); }
      else if (state.curVersion === "video" && cur) { state.endIntro = true; showTitleIntro(cur); }
      return;
    }
    if ((el.audio.duration || 0) < 2 || !stepAllowed()) return;   // leere/defekte Datei oder Wechsel-Schleife
    step(1);
  });
  el.audio.addEventListener("error", () => {
    const song = state.songs[state.index];
    if (state.curVersion && state.curVersion !== "karaoke") {
      const c = el.audio.error ? el.audio.error.code : 0;
      el.status.textContent = state.curVersion === "video"
        ? `Video lässt sich nicht abspielen (Fehler ${c}${c === 4 ? ": Datei nicht gefunden oder Format/Codec nicht unterstützt – bitte als MP4 mit H.264 + AAC ablegen" : ""}).`
        : `${state.curVersion === "sung" ? "Zusammenkünfte-Datei" : "Instrumental-Datei"} lässt sich nicht abspielen (Fehler ${c}).`;
      return;
    }
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

const SYNC_BASE = window.SYNC_BASE || (/github\.io$/.test(location.hostname) ? "https://musik.carag.workers.dev" : location.origin);

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
   - Nur Hinzugefügtes -> automatisch zusammenführen.
   - Gelöschtes -> Nachfrage, außer die Anzahl liegt unter der eigenen Schwelle ("Automatisch abgleichen bis X gelöschte Lieder"). */
const syncBaseKey = (store) => `sync-base-${store}`;
const nPl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const sgn = (n, plus) => (n ? `${plus ? "+" : "−"}${n}` : "·");

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

function totals(d) {
  return { fav: d.favorites.length, lists: d.playlists.length, songs: d.playlists.reduce((sum, list) => sum + list.songs.length, 0) };
}

function totalsText(d) {
  const t = totals(d);
  return `${nPl(t.fav, "Favorit", "Favoriten")} · ${nPl(t.lists, "Wiedergabeliste", "Wiedergabelisten")} · ${nPl(t.songs, "Lied", "Lieder")} in Listen`;
}

function listLines(d) {
  return d.playlists.map((list) => ({ text: `• ${list.name || "Liste"}: ${nPl(list.songs.length, "Lied", "Lieder")}`, cls: "dlg-list" }));
}

/* Was steht in "to", aber nicht in "from"? Songs neuer/entfernter Listen zählen als Lieder mit. */
function gainCount(from, to) {
  const out = { favorites: 0, lists: 0, songs: 0, total: 0 };
  if (!from || !to) return out;
  const favs = new Set(from.favorites);
  to.favorites.forEach((id) => { if (!favs.has(id)) out.favorites += 1; });
  const lists = new Map(from.playlists.map((list) => [list.id, list]));
  to.playlists.forEach((list) => {
    const old = lists.get(list.id);
    if (!old) { out.lists += 1; out.songs += list.songs.length; return; }
    const had = new Set(old.songs);
    list.songs.forEach((id) => { if (!had.has(id)) out.songs += 1; });
  });
  out.total = out.favorites + out.lists + out.songs;
  return out;
}

function countText(c) {
  const parts = [];
  if (c.favorites) parts.push(nPl(c.favorites, "Favorit", "Favoriten"));
  if (c.lists) parts.push(nPl(c.lists, "Wiedergabeliste", "Wiedergabelisten"));
  if (c.songs) parts.push(nPl(c.songs, "Lied", "Lieder") + " in Listen");
  return parts.join(", ");
}

function diffData(a, b) {
  const A = new Set(a.favorites), B = new Set(b.favorites);
  const out = { favAdd: b.favorites.filter((x) => !A.has(x)).length, favDel: a.favorites.filter((x) => !B.has(x)).length, listsAdd: [], listsDel: [], changed: [] };
  const am = new Map(a.playlists.map((l) => [l.id, l])), bm = new Map(b.playlists.map((l) => [l.id, l]));
  b.playlists.forEach((l) => {
    const o = am.get(l.id);
    if (!o) { out.listsAdd.push({ name: l.name, n: l.songs.length }); return; }
    const os = new Set(o.songs), ns = new Set(l.songs);
    const add = l.songs.filter((x) => !os.has(x)).length, del = o.songs.filter((x) => !ns.has(x)).length;
    if (add || del || o.name !== l.name) out.changed.push({ name: l.name, old: o.name, add, del });
  });
  a.playlists.forEach((l) => { if (!bm.has(l.id)) out.listsDel.push({ name: l.name, n: l.songs.length }); });
  out.total = out.favAdd + out.favDel + out.listsAdd.length + out.listsDel.length + out.changed.length;
  return out;
}

function diffLines(d) {
  const L = [];
  if (d.favAdd) L.push({ text: `+ ${nPl(d.favAdd, "Favorit", "Favoriten")} hinzugefügt`, cls: "dlg-add" });
  if (d.favDel) L.push({ text: `− ${nPl(d.favDel, "Favorit", "Favoriten")} gelöscht`, cls: "dlg-lost" });
  d.listsAdd.forEach((l) => L.push({ text: `+ Wiedergabeliste „${l.name}“ hinzugefügt (${nPl(l.n, "Lied", "Lieder")})`, cls: "dlg-add" }));
  d.listsDel.forEach((l) => L.push({ text: `− Wiedergabeliste „${l.name}“ gelöscht (${nPl(l.n, "Lied", "Lieder")})`, cls: "dlg-lost" }));
  d.changed.forEach((c) => {
    const p = [];
    if (c.add) p.push(`${nPl(c.add, "Lied", "Lieder")} hinzugefügt`);
    if (c.del) p.push(`${nPl(c.del, "Lied", "Lieder")} gelöscht`);
    if (c.old !== c.name) p.push(`umbenannt (vorher „${c.old}“)`);
    L.push({ text: `Liste „${c.name}“: ${p.join(", ")}`, cls: c.del ? "dlg-lost" : "dlg-add" });
  });
  if (!L.length) L.push({ text: "Keine Änderung", cls: "dlg-hint" });
  return L;
}

function shortDiff(d) {
  const p = [];
  if (d.favAdd) p.push(`+${nPl(d.favAdd, "Favorit", "Favoriten")}`);
  if (d.favDel) p.push(`−${nPl(d.favDel, "Favorit", "Favoriten")}`);
  if (d.listsAdd.length) p.push(`+${nPl(d.listsAdd.length, "Liste", "Listen")}`);
  if (d.listsDel.length) p.push(`−${nPl(d.listsDel.length, "Liste", "Listen")}`);
  const sa = d.changed.reduce((n, c) => n + c.add, 0), sd = d.changed.reduce((n, c) => n + c.del, 0);
  if (sa) p.push(`+${nPl(sa, "Lied", "Lieder")} in Listen`);
  if (sd) p.push(`−${nPl(sd, "Lied", "Lieder")} in Listen`);
  return p.join(", ");
}

/* Tabelle: Favoriten + jede Wiedergabeliste, vorher/nachher, hinzugefügt/gelöscht */
function changeTable(a, b) {
  const rows = [["", "Vorher", "Nachher", "Neu", "Weg"]];
  const A = new Set(a.favorites), B = new Set(b.favorites);
  rows.push(["Favoriten", a.favorites.length, b.favorites.length, sgn(b.favorites.filter((x) => !A.has(x)).length, true), sgn(a.favorites.filter((x) => !B.has(x)).length, false)]);
  const am = new Map(a.playlists.map((l) => [l.id, l])), bm = new Map(b.playlists.map((l) => [l.id, l]));
  [...new Set([...a.playlists.map((l) => l.id), ...b.playlists.map((l) => l.id)])].forEach((id) => {
    const o = am.get(id), n = bm.get(id);
    const os = new Set(o ? o.songs : []), ns = new Set(n ? n.songs : []);
    rows.push([`${(n || o).name || "Liste"}${!o ? " (neu)" : !n ? " (gelöscht)" : ""}`, o ? o.songs.length : "–", n ? n.songs.length : "–",
      sgn([...ns].filter((x) => !os.has(x)).length, true), sgn([...os].filter((x) => !ns.has(x)).length, false)]);
  });
  return rows;
}

/* Tabelle: zwei Stände nebeneinander mit Unterschied */
function compareTable(a, b, heads) {
  const diff = (x, y) => (typeof x === "number" && typeof y === "number" ? (y === x ? "gleich" : `${y > x ? "+" : "−"}${Math.abs(y - x)}`) : "–");
  const ta = totals(a), tb = totals(b);
  const rows = [["", ...(heads || ["Dieses Gerät", "Server", "Unterschied"])]];
  rows.push(["Favoriten", ta.fav, tb.fav, diff(ta.fav, tb.fav)]);
  rows.push(["Wiedergabelisten", ta.lists, tb.lists, diff(ta.lists, tb.lists)]);
  rows.push(["Lieder in Listen", ta.songs, tb.songs, diff(ta.songs, tb.songs)]);
  const am = new Map(a.playlists.map((l) => [l.id, l])), bm = new Map(b.playlists.map((l) => [l.id, l]));
  [...new Set([...a.playlists.map((l) => l.id), ...b.playlists.map((l) => l.id)])].forEach((id) => {
    const o = am.get(id), n = bm.get(id);
    rows.push([`› ${(o || n).name || "Liste"}`, o ? o.songs.length : "fehlt", n ? n.songs.length : "fehlt", diff(o ? o.songs.length : NaN, n ? n.songs.length : NaN)]);
  });
  return rows;
}

function setMergeOrdered(base, l, r) {
  const B = new Set(base || []), L = new Set(l), R = new Set(r);
  const keep = (x) => (L.has(x) && R.has(x)) || (L.has(x) && !B.has(x)) || (R.has(x) && !B.has(x));
  return [...l, ...r.filter((x) => !L.has(x))].filter(keep);
}

/* Drei-Wege-Zusammenführung: Hinzufügungen UND Löschungen beider Seiten werden übernommen */
function threeWayMerge(base, local, remote) {
  const bm = new Map((base ? base.playlists : []).map((list) => [list.id, list]));
  const lm = new Map(local.playlists.map((list) => [list.id, list]));
  const rm = new Map(remote.playlists.map((list) => [list.id, list]));
  const same = (a, b) => Boolean(a && b) && a.name === b.name && JSON.stringify(a.songs) === JSON.stringify(b.songs);
  const ids = [...local.playlists.map((l) => l.id), ...remote.playlists.map((l) => l.id).filter((id) => !lm.has(id))];
  const playlists = [];
  ids.forEach((id) => {
    const l = lm.get(id), r = rm.get(id), b = bm.get(id);
    if (l && r) {
      if (same(l, r)) { playlists.push(l); return; }
      playlists.push({ id, name: b && l.name === b.name ? r.name : l.name, songs: setMergeOrdered(b ? b.songs : null, l.songs, r.songs) });
    } else if (l) {
      if (b && same(l, b)) return;      // auf dem Server gelöscht, hier unverändert -> löschen
      playlists.push(l);
    } else if (r) {
      if (b && same(r, b)) return;      // hier gelöscht, auf dem Server unverändert -> löschen
      playlists.push(r);
    }
  });
  return { favorites: setMergeOrdered(base ? base.favorites : null, local.favorites, remote.favorites).sort(), playlists };
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

/* Freiwilliges Passwort des Favoriten-Abgleichs: nur der Hash (gebunden an den Namen) wird gespeichert */
const storeHeaders = (store) => ({ "x-store-hash": lsv("sync-pass-for", "") === store ? lsv("sync-pass-hash", "") : "" });
async function storeHashOf(store, pass) { return pass ? sha256Hex(`store:${store}:${pass}`) : ""; }
function storeRemember(store, hash) { lss("sync-pass-for", store); lss("sync-pass-hash", hash); }
async function setStoreLock(store, hash) {
  try {
    const res = await fetch(`${SYNC_BASE}/sync/${store}?pw=1`, { method: "PUT", headers: { ...storeHeaders(store), "x-store-set": hash || "-" }, body: "{}" });
    return res.ok;
  } catch { return false; }
}
/* Namen + freiwilliges Passwort setzen und abgleichen (Anmeldefenster, Voreinstellungen) */
async function syncWithPass(code, pass) {
  const store = code.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (store.length < 3) return "";
  lss("sync-code", store);
  let hash = "";
  if (pass) { hash = await storeHashOf(store, pass); storeRemember(store, hash); }
  const msg = await runSync(store, true, !!pass);
  if (pass && !/^(Abgebrochen|Server nicht|Passwort)/.test(msg || "")) await setStoreLock(store, hash);
  return msg;
}
let outSettings = null;     // Einstellungen, die beim nächsten Hochladen mitgeschickt werden (oder die vom Server erhaltenen)
let putHappened = false;
async function putSync(store, data) {
  const body = { favorites: data.favorites, playlists: data.playlists, saved: new Date().toISOString() };
  if (outSettings) body.settings = outSettings;
  const res = await fetch(`${SYNC_BASE}/sync/${store}`, {
    method: "PUT",
    headers: { "content-type": "application/json", ...storeHeaders(store) },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Server ${res.status}`);
  putHappened = true;
}

/* ---- Einstellungen mit abgleichen (optional, pro Schlüssel Drei-Wege-Abgleich) ---- */
const SETTING_KEYS = ["theme", "themeMode", "themeDay", "themeNight", "themeShift", "autoStart", "verBarAlways", "holdGuard", "holdHint", "eggMode", "eggFall", "eggGif", "startGif", "themeShown", "sidebarW", "topOffMain", "topOffSet", "startGif", "ludwtSingle", "listRepeat", "srcTags", "favPlace", "favSeek", "showExtra", "srcFilter", "sync-auto-max", "skipSec", "skipBack", "skipFwd", "fehlMode", "fehlNotify", "fehlAll", "fehlHelpSeen", STORAGE.scale, STORAGE.listSize];
const isSettingKey = (k) => SETTING_KEYS.includes(k) || /^fehl[TL]_/.test(k);
const syncSettingsOn = () => false;   // Einstellungen werden jetzt über den Benutzer gespeichert
function collectSettings() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (isSettingKey(k)) out[k] = localStorage.getItem(k);
    }
  } catch { /* egal */ }
  return out;
}
function readSettingsBase(store) {
  try { return JSON.parse(localStorage.getItem(`sync-settings-base:${store}`) || "{}") || {}; } catch { return {}; }
}
function writeSettingsBase(store, obj) {
  try { localStorage.setItem(`sync-settings-base:${store}`, JSON.stringify(obj)); } catch { /* egal */ }
}
function mergeSettings(base, local, remote) {
  const out = {};
  for (const k of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
    const b = base[k], l = local[k], r = remote[k];
    let v;
    if (l === r) v = l;
    else if (l === b) v = r;           // nur der Server hat geändert
    else v = l;                         // dieses Gerät hat geändert (oder beide: dieses Gerät gewinnt)
    if (v !== undefined && v !== null) out[k] = String(v);
  }
  return out;
}
function applySettings(obj) {
  const cur = collectSettings();
  let changed = false;
  for (const [k, v] of Object.entries(obj)) {
    if (!isSettingKey(k) || cur[k] === v) continue;
    try { localStorage.setItem(k, v); changed = true; } catch { /* egal */ }
  }
  if (!changed) return;
  try { if (window.THEME) window.THEME.apply(true); } catch { /* egal */ }
  try { state.scale = Number(localStorage.getItem(STORAGE.scale) || 42); applyScale(); state.listSize = Number(localStorage.getItem(STORAGE.listSize) || 16); applyListSize(); const sw = Number(localStorage.getItem("sidebarW")); if (sw >= 180) document.documentElement.style.setProperty("--sidebar", `${sw}px`); } catch { /* egal */ }
  try { applyTopOffsets(); } catch { /* egal */ }
  try { updateSkipLabels(); updateAutoIcon(); updateVersionBar(); rebuildExtras(); applyStartGif(); } catch { /* egal */ }
}
async function runSync(code, silent, typedPass) {
  const store = code.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const on = syncSettingsOn();
  let raw = null;
  try {
    let r0 = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: storeHeaders(store) });
    if (r0.status === 401) {
      if (silent || typedPass) return silent ? "Passwort für den Favoriten-Abgleich fehlt (Einstellungen → Abgleich)." : "Passwort stimmt nicht.";
      const pw = await uiPrompt({ eyebrow: "Favoriten-Abgleich", title: `Passwort für „${store}“`, type: "password", ok: "Weiter" });
      if (!pw) return "Abgebrochen.";
      storeRemember(store, await storeHashOf(store, pw));
      r0 = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: storeHeaders(store) });
      if (r0.status === 401) { lss("sync-pass-hash", ""); return "Passwort stimmt nicht."; }
    }
    if (r0.ok) raw = await r0.json();
  } catch { /* runSyncData meldet es */ }
  const remoteSet = raw && raw.settings && typeof raw.settings === "object" ? raw.settings : null;
  const merged = on ? mergeSettings(readSettingsBase(store), collectSettings(), remoteSet || {}) : null;
  outSettings = on ? merged : remoteSet;   // ohne Haken bleiben die Einstellungen auf dem Server unverändert
  putHappened = false;
  let message;
  try {
    message = await runSyncData(code, silent);
  } finally {
    // outSettings bleibt bis unten stehen
  }
  if (on && raw !== null && !/^(Abgebrochen|Server nicht)/.test(message || "")) {
    const sd = Object.entries(merged).filter(([k, v]) => lsv(k, null) !== String(v) && isSettingKey(k)).map(([k, v]) => [k, niceVal(lsv(k, null)), niceVal(String(v))]);
    if (sd.length) {
      const extraLines = [{ text: "Einstellungen", cls: "dlg-h" }, { table: [["Einstellung", "Jetzt", "Neu"], ...sd] }];
      state.lastSync = { t: Date.now(), lines: [...(state.lastSync && Date.now() - state.lastSync.t < 60000 ? state.lastSync.lines : []), ...extraLines] };
    }
    applySettings(merged);
    if (!putHappened && JSON.stringify(merged) !== JSON.stringify(remoteSet || {})) {
      try {
        const fresh = await (await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: storeHeaders(store) })).json();
        await putSync(store, normalizeSync(fresh));
      } catch { /* nächstes Mal */ }
    }
    writeSettingsBase(store, merged);
    if (!silent && message) message += " Einstellungen abgeglichen.";
    if (silent && sd.length) message = `${message ? message + "; " : ""}${sd.length} Einstellungen`;
  } else if (on && raw === null && putHappened) {
    writeSettingsBase(store, merged);
  }
  outSettings = null;
  return message;
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
  info.textContent = `Auf diesem Gerät: ${totalsText(syncSnapshot())}\n` + (last
    ? `Letzter Abgleich: ${new Date(last).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" })} (${dir})`
    : "Noch nie synchronisiert.");

  const lb = document.getElementById("syncLast");
  if (lb) { lb.hidden = !state.lastSync; lb.onclick = () => uiDialog({ eyebrow: "Synchronisieren", title: "Letzte Änderungen", lines: state.lastSync ? state.lastSync.lines : [], buttons: [{ value: true, kind: "primary", label: "Schließen" }] }); }
  const clr = document.getElementById("syncPassClear");
  if (clr) {
    const locked = !!lsv("sync-pass-hash", "") && lsv("sync-pass-for", "") === lsv("sync-code", "");
    clr.hidden = !locked;
    clr.onclick = async () => {
      const store = lsv("sync-code", "");
      if (!(await uiConfirm({ eyebrow: "Favoriten-Abgleich", title: "Passwort entfernen?", lines: [`Der Abgleich „${store}“ ist danach wieder ohne Passwort zugänglich.`], ok: "Entfernen" }))) return;
      if (await setStoreLock(store, "")) { storeRemember(store, ""); showToast("Passwort entfernt"); } else showToast("Nicht möglich (Server nicht erreichbar).");
      refreshSyncInfo();
    };
  }
  bindSameName();
}
/* alle „gleicher Name“-Haken (Anmeldefenster, Voreinstellungen, Abgleich) hängen zusammen */
function applySameNameUi() {
  const on = sameNameOn();
  document.querySelectorAll(".same-name-chk").forEach((o) => { o.checked = on; });
  const sr = document.getElementById("loginSyncRow"), sm = document.getElementById("loginSameRow");
  if (sr && sm) sr.hidden = on || sm.hidden;
  const sb = document.getElementById("syncUserBox");
  if (sb) { sb.hidden = on; const si = document.getElementById("syncUser"); if (!on && si && !si.value && userName() && !SYS[userName()]) si.value = userName(); }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".pw-toggle");
  if (!b) return;
  const map = { loginPwToggle: "loginPwRow", adminToggle: "adminBox" };
  const row = document.getElementById(b.dataset.pw || map[b.id]);
  if (!row) return;
  row.hidden = !row.hidden;
  b.setAttribute("aria-expanded", String(!row.hidden));
  b.textContent = (row.hidden ? "▸" : "▾") + b.textContent.slice(1);
});
function bindSameName() {
  document.querySelectorAll(".same-name-chk").forEach((c) => { c.onchange = () => { lss("sameName", c.checked ? "1" : "0"); applySameNameUi(); }; });
  applySameNameUi();
}

const autoMax = () => Math.max(0, Number(localStorage.getItem("sync-auto-max") || 0) || 0);

/* Ergebnis eines Abgleichs: für jede geänderte Seite eine Tabelle, am Ende der gespeicherte Gesamtstand */
function syncReportLines(store, device, server, final) {
  const lines = [];
  if (device) {
    lines.push({ text: "Dieses Gerät", cls: "dlg-h" });
    lines.push({ table: changeTable(device[0], device[1]) });
  }
  if (server) {
    lines.push({ text: "Server", cls: "dlg-h" });
    lines.push({ table: changeTable(server[0], server[1]) });
  }
  lines.push({ text: "Jetzt gespeichert", cls: "dlg-h" });
  lines.push({ text: totalsText(final), cls: "dlg-total" });
  return lines;
}
function syncReport(store, device, server, final) {
  const lines = [{ text: `Speicher: „${store}“`, cls: "dlg-store" }, { text: `Jetzt gespeichert: ${totalsText(final)}`, cls: "dlg-total" },
    { details: { title: "Änderungen anzeigen", lines: syncReportLines(store, device, server, final) } }];
  return uiDialog({ eyebrow: "Synchronisieren", title: "Abgleich abgeschlossen", lines, buttons: [{ value: true, kind: "primary", label: "OK" }] });
}

function askSyncConflict(store, local, remote, lostLocal, lostRemote) {
  const lines = [{ text: `Speicher: „${store}“`, cls: "dlg-store" }];
  lines.push({ text: "Seit dem letzten Abgleich wurde etwas gelöscht. Entscheide, welcher Stand gelten soll:" });
  if (lostLocal.total) lines.push({ text: `Auf diesem Gerät gelöscht: ${countText(lostLocal)}`, cls: "dlg-lost" });
  if (lostRemote.total) lines.push({ text: `Auf dem Server gelöscht: ${countText(lostRemote)}`, cls: "dlg-lost" });
  lines.push({ text: "Wenn du „behalten“ wählst, ändert sich der Server so:", cls: "dlg-h" });
  lines.push(...diffLines(diffData(remote, local)));
  lines.push({ text: "Wenn du „überschreiben“ wählst, ändert sich dieses Gerät so:", cls: "dlg-h" });
  lines.push(...diffLines(diffData(local, remote)));
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

async function runSyncData(code, silent) {
  const store = code.toLowerCase().replace(/[^a-z0-9-]/g, "");
  let res;
  try {
    res = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: storeHeaders(store) });
  } catch {
    return silent ? "" : "Server nicht erreichbar.";
  }
  const local = syncSnapshot();
  if (res.status === 401) return "Passwort stimmt nicht.";
  if (!res.ok) {
    if (silent) return "";
    const answer = await uiDialog({
      eyebrow: "Synchronisieren",
      title: "Neuer Speicher",
      lines: [
        { text: `Den Speicher „${store}“ gibt es auf dem Server noch nicht.`, cls: "dlg-store" },
        { text: "Dieser Stand wird dort angelegt:" },
        { text: totalsText(local), cls: "dlg-total" },
        ...listLines(local)
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
    return `Hochgeladen: Speicher „${store}“ angelegt (${totalsText(local)}).`;
  }

  const remote = normalizeSync(await res.json());
  const base = readSyncBase(store);
  const lostLocal = gainCount(local, base);
  const lostRemote = gainCount(remote, base);
  const deletions = lostLocal.favorites + lostLocal.songs + lostRemote.favorites + lostRemote.songs;
  const lost = lostLocal.total + lostRemote.total;

  if (!lost || deletions <= autoMax()) {
    const merged = threeWayMerge(base, local, remote);
    const changeLocal = !sameSync(merged, local);
    const changeRemote = !sameSync(merged, remote);
    if (changeLocal) applySyncData(merged);
    if (changeRemote) await putSync(store, merged);
    writeSyncBase(store, merged);
    if (!changeLocal && !changeRemote) return `Bereits gleich. ${totalsText(merged)}`;
    stampSync(changeLocal && changeRemote ? "abgeglichen" : changeRemote ? "gesendet" : "empfangen");
    state.lastSync = { t: Date.now(), lines: [{ text: `Speicher: „${store}“`, cls: "dlg-store" }, ...syncReportLines(store, changeLocal ? [local, merged] : null, changeRemote ? [remote, merged] : null, merged)] };
    const dDev = diffData(local, merged), dSrv = diffData(remote, merged);
    if (silent) {
      const parts = [];
      if (changeLocal) parts.push(`hier ${shortDiff(dDev)}`);
      if (changeRemote) parts.push(`Server ${shortDiff(dSrv)}`);
      return parts.join("; ");
    }
    if (lost) {
      // unter der eingestellten Löschschwelle: ohne Pop-up, Zahlen stehen im Fenster
      const parts = [];
      if (changeLocal) parts.push(`hier: ${shortDiff(dDev)}`);
      if (changeRemote) parts.push(`Server: ${shortDiff(dSrv)}`);
      return `Automatisch abgeglichen (${parts.join("; ")}). Gespeichert: ${totalsText(merged)}`;
    }
    await syncReport(store, changeLocal ? [local, merged] : null, changeRemote ? [remote, merged] : null, merged);
    return `Abgeglichen. Gespeichert: ${totalsText(merged)}`;
  }

  const choice = await askSyncConflict(store, local, remote, lostLocal, lostRemote);
  if (choice === "keep") {
    await putSync(store, local);
    writeSyncBase(store, local);
    stampSync("gesendet");
    await syncReport(store, null, [remote, local], local);
    return `Hochgeladen: Dein Stand ersetzt den Speicher „${store}“.`;
  }
  if (choice === "overwrite") {
    applySyncData(remote);
    writeSyncBase(store, remote);
    stampSync("empfangen");
    await syncReport(store, [local, remote], null, remote);
    return `Heruntergeladen: Speicher „${store}“ ist auf diesem Gerät wiederhergestellt.`;
  }
  return "Abgebrochen.";
}

/* Kleines „i“ im Synchronisieren-Fenster: Gerät und Server nebeneinander */
async function showSyncCompare() {
  const input = document.getElementById("codeInput");
  const store = (input.value.trim() || localStorage.getItem("sync-code") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const local = syncSnapshot();
  if (!store) {
    await uiAlert("Vergleich", "Bitte zuerst den Namen des Speichers eingeben.");
    return;
  }
  let remote = null;
  let problem = "";
  try {
    const res = await fetch(`${SYNC_BASE}/sync/${store}`, { cache: "no-store", headers: storeHeaders(store) });
    if (res.status === 401) problem = "Passwort nötig (Einstellungen → Abgleich → Passwort).";
    else if (res.ok) remote = normalizeSync(await res.json());
    else problem = `Den Speicher „${store}“ gibt es auf dem Server noch nicht.`;
  } catch {
    problem = "Server nicht erreichbar.";
  }
  const lines = [{ text: `Speicher: „${store}“`, cls: "dlg-store" }];
  if (remote) {
    lines.push({ table: compareTable(local, remote) });
    const same = sameSync(local, remote);
    lines.push({ text: same ? "Gerät und Server sind gleich." : "Gerät und Server sind unterschiedlich. Beim Synchronisieren wird abgeglichen.", cls: same ? "dlg-add" : "dlg-hint" });
  } else {
    lines.push({ text: problem, cls: "dlg-lost" });
    lines.push({ text: `Auf diesem Gerät: ${totalsText(local)}` });
  }
  await uiDialog({ eyebrow: "Synchronisieren", title: "Vergleich Gerät ↔ Server", lines, buttons: [{ value: true, kind: "primary", label: "Schließen" }] });
}

async function syncFavorites(tab) {
  await syncFavoritesCore();
  showSetTab(tab || state.setTab || "allgemein");
}

/* Alle Felder des Einstellungsfensters mit den aktuellen Werten füllen (auch nach dem Anwenden von Voreinstellungen) */
function fillSettingsFields() {
  const max = document.getElementById("syncAutoMax");
  max.value = String(autoMax());
  max.onchange = () => {
    const value = Math.max(0, Math.min(999, Math.floor(Number(max.value) || 0)));
    max.value = String(value);
    try { localStorage.setItem("sync-auto-max", String(value)); } catch { /* egal */ }
  };
  document.getElementById("verBarBox").hidden = false;
  document.getElementById("tagsBox").hidden = false;
  setupAdvBox();
  setupPresetBox();
  document.getElementById("favBox").hidden = false;
  document.querySelectorAll('input[name="favPlace"]').forEach((r) => {
    r.checked = r.value === favPlace();
    r.onchange = () => { try { localStorage.setItem("favPlace", r.value); } catch { /* egal */ } applyFavPlace(); };
  });
  const fs = document.getElementById("favSeekOpt");
  fs.value = favSeek();
  fs.onchange = () => { try { localStorage.setItem("favSeek", fs.value); } catch { /* egal */ } setMediaSession(state.songs[state.index]); };
  const st = document.getElementById("srcTagsOpt");
  st.checked = srcTagsOn();
  st.onchange = () => { try { localStorage.setItem("srcTags", st.checked ? "1" : "0"); } catch { /* egal */ } renderList(); };
  document.getElementById("extraBox").hidden = false;
  const ex = document.getElementById("extraSongsOpt");
  ex.checked = showExtraSongs();
  ex.onchange = () => { try { localStorage.setItem("showExtra", ex.checked ? "1" : "0"); } catch { /* egal */ } rebuildExtras(); };
  document.getElementById("themeBox").hidden = false;
  const vb = document.getElementById("verBarOpt");
  vb.checked = localStorage.getItem("verBarAlways") === "1";
  vb.onchange = () => { try { localStorage.setItem("verBarAlways", vb.checked ? "1" : "0"); } catch { /* egal */ } updateVersionBar(); };
  const auto = document.getElementById("autoPlayOpt");
  auto.checked = localStorage.getItem("autoStart") === "1";
  auto.onchange = () => { try { localStorage.setItem("autoStart", auto.checked ? "1" : "0"); } catch { /* egal */ } updateAutoIcon(); };
  if (window.THEME && state.setTab === "design") window.THEME.mountUi(document.getElementById("themeBox"));
}

async function syncFavoritesCore() {
  const saved = localStorage.getItem("sync-code") || "";
  openCode("Einstellungen", async (code) => {
    localStorage.setItem("sync-code", code);
    try {
      const store = code.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const typed = document.getElementById("syncPass").value;
      state.syncTypedPass = typed;
      const pHash = await storeHashOf(store, typed);
      if (typed) storeRemember(store, pHash);
      const message = await runSync(code, false, !!typed);
      if (typed && !/^(Abgebrochen|Server nicht|Passwort)/.test(message || "")) { await setStoreLock(store, pHash); document.getElementById("syncPass").value = ""; }
      let extra = "";
      if (!/^(Abgebrochen|Server nicht)/.test(message || "")) {
        const un = sameNameOn() ? code.toLowerCase() : document.getElementById("syncUser").value.trim();
        const pw = sameNameOn() ? (state.syncTypedPass || "") : document.getElementById("syncUserPass").value;
        if (un && userCleanName(un) !== userName() && !(sameNameOn() && SYS[un])) {
          const r = await userLogin(un, pw);
          if (r.sys) { await syncFavorites("allgemein"); state.sub = "vor"; showSetTab("allgemein"); await openSysEditor(r.sys); }
          else extra = ` ${r.msg}`;
          renderPresetBox();
        }
      }
      refreshSyncInfo();
      return (message || "") + extra;
    } catch {
      return "Synchronisieren fehlgeschlagen. Bitte später noch einmal versuchen.";
    }
  }, "sync");
  const input = document.getElementById("codeInput");
  input.value = saved;
  input.placeholder = "Name für den Favoriten-Abgleich";
  document.getElementById("codeOk").textContent = "Synchronisieren";
  document.querySelector(".sync-choice").hidden = true;
  document.getElementById("codeMessage").textContent = "Mit diesem Namen gleichst du Favoriten und Wiedergabelisten auf allen deinen Geräten ab. Hinzugefügtes wird automatisch zusammengeführt.";
  refreshSyncInfo();
  const metaBtn = document.getElementById("metaToggle");
  metaBtn.hidden = false;
  metaBtn.title = "Gerät und Server vergleichen";
  metaBtn.onclick = showSyncCompare;
  const settings = document.getElementById("syncSettings");
  settings.hidden = false;
  document.getElementById("autoPlayBox").hidden = false;
  fillSettingsFields();
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
      lines: [`Auf diesem Gerät werden gelöscht: ${totalsText(syncSnapshot())}.`],
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
        outSettings = null;
        await putSync(store, { favorites: [], playlists: [] });
        writeSyncBase(store, { favorites: [], playlists: [] });
      } catch {
        showToast("Server nicht erreichbar – nur lokal gelöscht.");
      }
    }
    document.getElementById("codeModal").hidden = true;
  };
}

const _runSync0 = runSync;
runSync = async function (...a) {
  state.syncRun = (state.syncRun || 0) + 1;
  try {
    const r = await _runSync0.apply(this, a);
    if (typeof r === "string" && !/Passwort|Abgebrochen|nicht erreichbar|Fehler|fehlgeschlagen/i.test(r)) stampSync("lastSyncFav");
    return r;
  } finally { state.syncRun--; }
};

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
    const incoming = normalizeSync(data);
    const current = syncSnapshot();
    const ok = await uiDialog({
      eyebrow: "Favoriten laden",
      title: "Das wird übernommen",
      lines: [
        { text: "Dein Stand auf diesem Gerät wird durch den geladenen Stand ersetzt:" },
        { table: compareTable(current, incoming, ["Vorhanden", "Wird geladen", "Unterschied"]) },
        { text: `Danach gespeichert: ${totalsText(incoming)}`, cls: "dlg-total" }
      ],
      cancelValue: null,
      buttons: [
        { value: true, kind: "down", dir: "↓ Auf dieses Gerät laden", label: "Übernehmen", sub: "Ersetzt Favoriten und Wiedergabelisten hier" },
        { value: null, kind: "cancel", label: "Abbrechen" }
      ]
    });
    if (!ok) return "Abgebrochen.";
    state.favorites = new Set(incoming.favorites);
    state.playlists = cloneData(incoming.playlists);
    saveFavorites();
    savePlaylists();
    clearSyncBases();  // nächster Abgleich ohne Löschwarnung (es wird nur zusammengeführt)
    fillPlaylists();
    updateEditTools();
    renderList();
    return `Geladen: ${totalsText(incoming)}`;
  }, "import");
}

async function openTimecode() {
  if (!document.body.classList.contains("edit-mode")) {
    const pass = await uiPrompt({ eyebrow: "Bearbeiten", title: "Timecode-Passwort", type: "password", placeholder: "Passwort", ok: "Öffnen" });
    if (pass === null || !(await passwordOk(pass, window.TIMECODE_PASSWORD, window.TIMECODE_PASSWORD_HASH))) {
      if (pass !== null) await uiAlert("Falsches Passwort", "Der Bearbeitungsmodus bleibt gesperrt.");
      return;
    }
    if (state.curVersion === "video") {
      await uiAlert("Video", "Im Video-Modus kann nichts bearbeitet werden. Wähle „Instrumental“ oder „Zusammenkünfte“, um dafür einen Text abzustimmen.");
      return;
    }
    state.writeKey = pass;
    document.body.classList.add("edit-mode");
    updateChrome();
    state.editDirty = false;
    state.karaokeHold = true;
    // Instrumental ohne eigenen Text: Karaoke-Text als Vorlage (Kopie) nehmen
    const song = state.songs[state.index];
    if (song && (state.curVersion === "meeting" || state.curVersion === "sung") && !el.lyrics.querySelector(".lyric-line")) {
      const template = await fetchKaraokeLines(song, () => false);
      if (template.length) {
        state.lyrics = template;
        renderLyrics(template);
        state.editDirty = true;
        setStatus("Vorlage: Karaoke-Text (wird als eigene Kopie gespeichert)", "is-info");
      }
    }
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
    head.innerHTML = "<span>Timecode</span><span>Player</span><span>Setzen</span><span>Liedtext</span>";
    el.lyrics.prepend(head);
  }
  el.lyrics.querySelectorAll(".lyric-line").forEach((line) => {
    if (line.querySelector(".time-edit")) return;
    const text = line.textContent;
    const saved = line.dataset.time;
    line.textContent = "";
    const cell = document.createElement("div");
    cell.className = "time-cell";
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
    take.textContent = "Setzen";
    const applyStamp = () => {
      const t = Math.max(0, (el.audio.currentTime || 0) + state.timeOffset / 1000);
      const old = line.dataset.saved || line.dataset.time;
      if (!line.dataset.saved) line.dataset.saved = old;
      line.dataset.time = String(t);
      input.value = formatTime(t, true);
      let oldLabel = cell.querySelector(".saved-old");
      if (!oldLabel) {
        oldLabel = document.createElement("span");
        oldLabel.className = "saved-old";
        cell.append(oldLabel);
      }
      oldLabel.textContent = `vorher ${formatTime(Number(line.dataset.saved), true)}`;
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
    cell.append(input);
    line.append(cell, now, take, textInput);
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
    if (state.editDirty) {
      const song = state.songs[state.index];
      const choice = await uiDialog({
        eyebrow: "Bearbeiten",
        title: "Nicht gespeicherte Timecodes",
        lines: [`Es gibt Änderungen${song ? ` an Lied ${song.id}` : ""}, die noch nicht gespeichert sind.`, "Was soll damit passieren?"],
        cancelValue: null,
        buttons: [
          { value: "save", kind: "up", dir: "↑ Auf dem Server speichern", label: "Speichern und beenden" },
          { value: "discard", kind: "danger", label: "Änderungen verwerfen und beenden" },
          { value: null, kind: "cancel", label: "Weiter bearbeiten" }
        ]
      });
      if (!choice) return;
      if (choice === "save" && !(await saveTimecode(true))) return;
    }
    document.body.classList.remove("edit-mode");
    updateChrome();
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

async function saveTimecode(skipConfirm) {
  const song = state.songs[state.index];
  if (!song) return false;
  if (skipConfirm !== true && !(await uiConfirm({ eyebrow: "Bearbeiten", title: "Timecodes speichern?", text: `Lied ${song.id} – ${song.title}`, ok: "Speichern" }))) return false;
  const lines = [...el.lyrics.querySelectorAll(".lyric-line")].map((line) => ({
    time: Number(line.dataset.time),
    text: (line.querySelector(".lyric-text") || {}).value || line.textContent.trim()
  }));
  const lrc = lines.map((line) => {
    const t = formatTime(line.time, true);
    const [m, rest] = t.split(":");
    return `[${m.padStart(2, "0")}:${rest}]${line.text}`;
  }).join("\n");
  const kind = state.curVersion === "meeting" ? "lrcm" : state.curVersion === "sung" ? "lrcs" : "lrc";
  localStorage.setItem(`${kind}-${song.id}`, JSON.stringify(lines));
  try {
    const res = await fetch(`${SYNC_BASE}/sync/${kind}-${song.id}`, { method: "PUT", headers: { "content-type": "text/plain", "x-write-key": state.writeKey || "" }, body: lrc });
    if (res.ok) {
      if (kind === "lrcm" && state.media) state.media.meeting.lrc[String(song.number)] = `meeting/lrc/${song.id}.lrc`;
      if (kind === "lrcs" && state.media) (state.media.meeting.sungLrc = state.media.meeting.sungLrc || {})[String(song.number)] = `meeting/sung/lrc/${song.id}.lrc`;
      await uiAlert("Gespeichert", kind === "lrcm" ? "Text für die Instrumental-Fassung gespeichert, auf allen Geräten verfügbar." : kind === "lrcs" ? "Text für die Zusammenkünfte-Fassung gespeichert, auf allen Geräten verfügbar." : "Auf allen Geräten verfügbar.");
    }
    else await uiAlert("Nur lokal gespeichert", res.status === 401 ? "Der Server hat das Timecode-Passwort abgelehnt (WRITE_KEY in Cloudflare prüfen)." : "Der Server war nicht erreichbar.");
  } catch {
    await uiAlert("Nur lokal gespeichert", "Der Server war nicht erreichbar.");
  }
  state.editDirty = false;
  return true;
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

/* Einstellungen: Anzeige und Werkzeuge (Allgemein) */
/* Startseite: Bild oder GIF „Chor“ */
function applyStartGif() {
  const img = document.querySelector(".start-image");
  if (!img) return;
  let on = false;
  try { on = localStorage.getItem("startGif") === "1"; } catch { /* egal */ }
  const want = on ? "chor.gif" : "start-bg.png";
  if (!img.getAttribute("src").startsWith(want)) img.src = want;
}

function setupAdvBox() {
  document.getElementById("advBox").hidden = false;
  const caragToggle = () => {
    const box = document.getElementById("caragBox");
    box.hidden = !box.hidden;
    if (!box.hidden) box.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  /* Puma-Symbol: ca. 1 Sekunde gedrückt halten (kein Klick nötig, funktioniert auch ohne Klick-Ereignis) */
  const holdBind = (btn, fn, ms) => {
    let t = 0;
    const clear = () => { clearTimeout(t); t = 0; btn.classList.remove("holding"); };
    btn.onpointerdown = () => { clear(); btn.classList.add("holding"); t = setTimeout(() => { t = 0; btn.classList.remove("holding"); fn(); }, ms); };
    ["onpointerup", "onpointerleave", "onpointercancel"].forEach((ev) => { btn[ev] = clear; });
    btn.oncontextmenu = (e) => e.preventDefault();
    btn.onclick = (e) => e.preventDefault();
  };
  holdBind(document.getElementById("caragOpen"), caragToggle, 1000);
  holdBind(document.getElementById("caragOpen2"), caragToggle, 1000);
  [["eggMode", "auto"], ["eggGif", "chor"]].forEach(([k, d]) => {
    const s = document.getElementById(k);
    try { s.value = localStorage.getItem(k) || d; } catch { s.value = d; }
    s.onchange = () => { try { localStorage.setItem(k, s.value); } catch { /* egal */ } };
  });
  const sg = document.getElementById("startGif");
  try { sg.checked = localStorage.getItem("startGif") === "1"; } catch { sg.checked = false; }
  sg.onchange = () => { try { localStorage.setItem("startGif", sg.checked ? "1" : "0"); } catch { /* egal */ } applyStartGif(); };
  const ef = document.getElementById("eggFall");
  try { ef.checked = localStorage.getItem("eggFall") === "1"; } catch { ef.checked = false; }
  ef.onchange = () => { try { localStorage.setItem("eggFall", ef.checked ? "1" : "0"); } catch { /* egal */ } };
  const closeSettings = () => { sysKeyMem = ""; document.getElementById("codeModal").hidden = true; };
  document.getElementById("advAdvanced").onclick = () => { closeSettings(); toggleAdvanced(); };
  document.getElementById("advEdit").onclick = () => { closeSettings(); openTimecode(); };
  document.getElementById("advReload").onclick = () => hardRefresh();
  document.getElementById("advStart").onclick = () => { closeSettings(); showLogin(); };
  const num = (id, get, set, min, max) => {
    const inp = document.getElementById(id);
    inp.value = String(get());
    inp.onchange = () => {
      const v = Math.max(min, Math.min(max, Math.round(Number(inp.value) || get())));
      inp.value = String(v);
      set(v);
    };
  };
  num("advListSize", () => state.listSize, (v) => { state.listSize = v; localStorage.setItem(STORAGE.listSize, String(v)); applyListSize(); }, 10, 48);
  num("advScale", () => state.scale, (v) => { state.scale = v; localStorage.setItem(STORAGE.scale, String(v)); applyScale(); }, 10, 200);
  num("advSidebar", () => (window.sidebarPx ? window.sidebarPx() : 300), (v) => window.setSidebarWidth && window.setSidebarWidth(v), 180, 1200);
  const topNum = (id, key) => {
    const inp = document.getElementById(id);
    inp.value = String(Number(localStorage.getItem(key)) || 0);
    const put = (fix) => {
      const v = Math.max(0, Math.min(300, Math.round(Number(inp.value) || 0)));
      if (fix) inp.value = String(v);
      localStorage.setItem(key, String(v));
      applyTopOffsets();
    };
    inp.oninput = () => put(false);
    inp.onchange = () => put(true);
  };
  topNum("advTopMain", "topOffMain");
  topNum("advTopSet", "topOffSet");
  num("advBack", () => skipSec(-1), (v) => { localStorage.setItem("skipBack", String(v)); updateSkipLabels(); }, 1, 300);
  num("advFwd", () => skipSec(1), (v) => { localStorage.setItem("skipFwd", String(v)); updateSkipLabels(); }, 1, 300);
  const hold = document.getElementById("advHold");
  hold.checked = holdOn();
  hold.onchange = () => { try { localStorage.setItem("holdGuard", hold.checked ? "1" : "0"); } catch { /* egal */ } };
  const hint = document.getElementById("advHint");
  hint.checked = holdHintOn();
  hint.onchange = () => { try { localStorage.setItem("holdHint", hint.checked ? "1" : "0"); } catch { /* egal */ } document.body.classList.toggle("hold-hint", hint.checked); };
  document.getElementById("advInfo").textContent = `Fensterbereich dieser Seite: ${window.innerWidth} × ${window.innerHeight} px · Bildschirm: ${screen.width} × ${screen.height} · Pixeldichte: ${window.devicePixelRatio}${isTesla() ? " · Tesla-Browser erkannt" : ""}`;
}

/* ---------- Benutzer und Voreinstellungen ---------- */
/* Jede Zeile = eine Einstellung (oder Gruppe). def = Tesla-Standardwerte, keys = alle zugehörigen Speicherwerte */
const BOOL = [["1", "ein"], ["0", "aus"]];
const PRESETS = [
  { id: "auto", label: "Beim Öffnen automatisch abspielen", keys: ["autoStart"], def: { autoStart: "1" }, fields: [{ key: "autoStart", o: BOOL, dv: "0" }] },
  { id: "extra", label: "Weitere Lieder aus anderen Verzeichnissen in der Liste", keys: ["showExtra"], def: { showExtra: "0" }, fields: [{ key: "showExtra", o: BOOL, dv: "0" }] },
  { id: "tags", label: "Kleine Art-Kennzeichen (K, ♪, ▶, Z) unter den Liedern", keys: ["srcTags"], def: { srcTags: "0" }, fields: [{ key: "srcTags", o: BOOL, dv: "1" }] },
  { id: "fav", label: "Favoriten-Stern (Ort) und Tesla-Player-Taste", keys: ["favPlace", "favSeek"], def: { favPlace: "both", favSeek: "off" },
    fields: [{ key: "favPlace", t: "Ort", o: [["top", "oben"], ["bottom", "unten"], ["both", "beide"]], dv: "both" }, { key: "favSeek", t: "Taste", o: [["off", "keine"], ["back", "zurück"], ["fwd", "vor"]], dv: "off" }] },
  { id: "verbar", label: "Art-Buttons immer anzeigen", keys: ["verBarAlways"], def: { verBarAlways: "0" }, fields: [{ key: "verBarAlways", o: BOOL, dv: "0" }] },
  { id: "srcfilter", label: "Gewählte Art (Karaoke / Instrumental / Video / Zusammenkünfte)", keys: ["srcFilter"] },
  { id: "hold", label: "Lupe und Player-Symbol nur nach langem Drücken", keys: ["holdGuard", "holdHint"], def: { holdGuard: "1" },
    fields: [{ key: "holdGuard", t: "Schutz", o: BOOL, dv: "0" }, { key: "holdHint", t: "Hinweis", o: BOOL, dv: "0" }] },
  { id: "theme", label: "Design (fest, wie Gerät / Tesla oder Sonnenaufgang, Zeiten)", keys: ["themeMode", "theme", "themeDay", "themeNight", "themeShift"], def: { themeMode: "device" },
    fields: [{ key: "themeMode", o: [["manual", "fest"], ["device", "wie Gerät / Tesla"], ["sun", "Sonnenaufgang"]], dv: "manual" }] },
  { id: "fontkar", label: "Schriftgröße Karaoke-Text", keys: [STORAGE.scale], fields: [{ key: STORAGE.scale, n: [10, 200], dv: "42" }] },
  { id: "fontlist", label: "Schriftgröße Auswahlfenster", keys: [STORAGE.listSize], fields: [{ key: STORAGE.listSize, n: [10, 48], dv: "16" }] },
  { id: "sidebar", label: "Breite des Auswahlfensters (px)", keys: ["sidebarW"], fields: [{ key: "sidebarW", n: [180, 1200], dv: "300" }] },
  { id: "topoff", offByDefault: true, label: "Abstand oben (px): Hauptfenster / Einstellungen", keys: ["topOffMain", "topOffSet"], fields: [{ key: "topOffMain", t: "Haupt", n: [0, 300], dv: "0" }, { key: "topOffSet", t: "Einstellungen", n: [0, 300], dv: "0" }] },
  { id: "startgif", label: "Startseite: GIF „Chor“ statt des Bildes", keys: ["startGif"], def: { startGif: "0" }, fields: [{ key: "startGif", o: BOOL, dv: "0" }] },
  { id: "lupeopt", label: "Lupe-Optionen: LuD+WT einzeln (■) / Liste wiederholen (↻)", keys: ["ludwtSingle", "listRepeat"], fields: [{ key: "ludwtSingle", t: "einzeln", o: BOOL, dv: "0" }, { key: "listRepeat", t: "wiederholen", o: BOOL, dv: "1" }] },
  { id: "themeshown", label: "Designs im Hauptfenster (Auswahl)", keys: ["themeShown"] },
  { id: "skip", label: "Springen zurück / vor (Sekunden)", keys: ["skipSec", "skipBack", "skipFwd"],
    fields: [{ key: "skipBack", t: "zurück", n: [1, 300], dv: "15" }, { key: "skipFwd", t: "vor", n: [1, 300], dv: "15" }] },
  { id: "fehl", label: "Fehlend: Prüfung, Hinweis und Anzeige", keys: ["fehlMode", "fehlNotify", "fehlAll"], rx: /^fehl[TL]_/, fields: [{ key: "fehlNotify", t: "Hinweis", o: BOOL, dv: "0" }] },
  { id: "syncmax", label: "Automatisch abgleichen, auch wenn bis zu … Lieder gelöscht wurden", keys: ["sync-auto-max"], def: { "sync-auto-max": "2" }, fields: [{ key: "sync-auto-max", n: [0, 999], dv: "0" }] }
];
/* Standard für neue Benutzer (beste Werte am Desktop); über den Namen „standard“ mit dem Schreib-Passwort änderbar */
const STD_VALS = { autoStart: "0", showExtra: "1", srcTags: "1", favPlace: "both", favSeek: "off", verBarAlways: "1", holdGuard: "0", holdHint: "0", themeMode: "device", [STORAGE.scale]: "42", [STORAGE.listSize]: "16", sidebarW: "300", skipBack: "15", skipFwd: "15", "sync-auto-max": "2" };
const SYS = { tesla: "_tesla", standard: "_standard" };
const TESLA_EXTRA = { eggMode: "auto", eggFall: "0", eggGif: "chor", startGif: "0" };
const lsv = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } };
const lss = (k, v) => { try { localStorage.setItem(k, v); } catch { /* egal */ } };
const defaultOn = () => Object.fromEntries(PRESETS.map((p) => [p.id, !p.offByDefault]));
const normPresets = (p) => { p = p || {}; return p.on && typeof p.on === "object" ? { on: { ...defaultOn(), ...p.on }, vals: p.vals && typeof p.vals === "object" ? p.vals : {} } : { on: { ...defaultOn(), ...p }, vals: {} }; };
const sysDefault = (n) => {
  const vals = {};
  if (n === "tesla") PRESETS.forEach((p) => Object.assign(vals, p.def || {}));
  else Object.assign(vals, STD_VALS);
  return { on: n === "tesla" ? Object.fromEntries(PRESETS.map((p) => [p.id, !!p.def])) : defaultOn(), vals };
};
const sameNameOn = () => lsv("sameName", "1") === "1";
const userName = () => lsv("userName", "");
const srvName = (n) => SYS[n] || n;
let sysKeyMem = "";   // Schreib-Passwort nur im Speicher: gilt, solange das Einstellungsfenster offen ist
const sysKey = () => sysKeyMem;
try { sessionStorage.removeItem("sysKey"); } catch { /* egal */ }
const userCleanName = (n) => String(n || "").trim().toLowerCase().replace(/[^a-z0-9äöüß._-]/g, "").slice(0, 40);
const userData = () => { try { return normPresets(JSON.parse(lsv("userPresets", "{}"))); } catch { return normPresets({}); } };
const userSaveLocal = (d) => lss("userPresets", JSON.stringify(d));
const userKnown = () => { try { const a = JSON.parse(lsv("userList", "[]")); return Array.isArray(a) ? a : []; } catch { return []; } };
const userKnownAdd = (names) => { const set = new Set([...userKnown(), ...names.filter((n) => n && !n.startsWith("_"))]); lss("userList", JSON.stringify([...set].sort())); };
async function userHashOf(name, pass) { return pass ? sha256Hex(`user:${name}:${pass}`) : ""; }

/* alle Speicherschlüssel einer Zeile (feste + nach Muster) */
function presetKeys(p) {
  const out = new Set(p.keys);
  if (p.rx) { try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (p.rx.test(k)) out.add(k); } } catch { /* egal */ } }
  return [...out];
}
/* Ziel-Werte: mode "tesla" = Standardwerte; "user" = gespeicherte Werte des Benutzers (sonst Standardwerte) */
function presetTarget(data, mode) {
  const t = [];
  PRESETS.forEach((p) => {
    if (data.on[p.id] === false) return;
    const src = mode === "tesla" ? { ...(p.def || {}), ...data.vals } : data.vals;
    presetKeys(p).forEach((k) => { if (src[k] !== undefined) t.push({ key: k, label: p.label, val: String(src[k]) }); });
  });
  if (mode === "tesla") Object.entries(TESLA_EXTRA).forEach(([k, v]) => t.push({ key: k, label: "Carag", val: v }));
  return t;
}
function presetCapture(data, only) {
  PRESETS.forEach((p) => {
    if (only && !only.includes(p.id)) return;
    if (data.on[p.id] === false) return;
    presetKeys(p).forEach((k) => { const v = lsv(k, null); if (v !== null) data.vals[k] = v; });
  });
  return data;
}
const niceVal = (v) => (v === null || v === undefined ? "–" : v === "1" ? "ein" : v === "0" ? "aus" : v);
const presetDiff = (target) => target.filter((t) => lsv(t.key, null) !== t.val).map((t) => ({ ...t, old: lsv(t.key, null) }));
function applyTarget(target, noFill) {
  state.applyingPreset = true;
  try { target.forEach((t) => lss(t.key, t.val)); } finally { state.applyingPreset = false; }
  try { if (window.THEME) window.THEME.apply(true); } catch { /* egal */ }
  try {
    state.scale = Number(lsv(STORAGE.scale, 42)); applyScale(); state.listSize = Number(lsv(STORAGE.listSize, 16)); applyListSize();
    const sw = Number(lsv("sidebarW", 0)); if (sw >= 180) document.documentElement.style.setProperty("--sidebar", `${sw}px`);
  } catch { /* egal */ }
  try { applyTopOffsets(); } catch { /* egal */ }
  try { updateSkipLabels(); updateAutoIcon(); updateVersionBar(); rebuildExtras(); applyStartGif(); applyFavPlace(); renderList(); } catch { /* egal */ }
  try { if (!noFill && !document.getElementById("codeModal").hidden) fillSettingsFields(); } catch { /* egal */ }
}
/* Änderungen zuerst anzeigen (aufklappbar), dann übernehmen. silent = ohne Rückfrage. Rückgabe: true = angewendet */
async function applyWithPreview(target, title, silent) {
  const diff = presetDiff(target);
  if (!diff.length) return true;
  /* nur Werte zeigen, die auf diesem Gerät schon gesetzt sind (neu Hinzukommendes ändert nichts Bestehendes) */
  const real = diff.filter((d) => d.old !== null);
  if (!silent && real.length) {
    const yes = await uiDialog({
      eyebrow: "Einstellungen", title, cancelValue: false,
      lines: [`${real.length} Einstellung${real.length === 1 ? "" : "en"} auf diesem Gerät ${real.length === 1 ? "wird" : "werden"} geändert.`,
        { details: { title: "Änderungen anzeigen", lines: [{ table: [["Einstellung", "Jetzt", "Neu"], ...real.map((d) => [d.key === d.label ? d.key : `${d.label} (${d.key})`, niceVal(d.old), niceVal(d.val)])] }] } }],
      buttons: [{ value: true, kind: "primary", label: "Übernehmen" }, { value: false, kind: "cancel", label: "Nicht ändern" }]
    });
    if (!yes) return false;
  }
  applyTarget(target);
  return true;
}

/* Benutzer vom Server holen: {state: "ok"|"none"|"locked"|"error", presets, links} */
async function fetchUser(name, hash, extra) {
  try {
    const res = await fetch(`${SYNC_BASE}/user/${encodeURIComponent(name)}`, { cache: "no-store", headers: { "x-user-hash": hash || "", ...(extra || {}) } });
    if (res.status === 404) return { state: "none" };
    if (res.status === 401) return { state: "locked" };
    if (!res.ok) return { state: "error" };
    const d = await res.json();
    if (!extra) stampSync("lastSyncUser");
    return { state: "ok", presets: d.presets || {}, links: Array.isArray(d.links) ? d.links : [], updated: d.updated || "", keyOk: !!d.keyOk, none: !!d.none, factory: d.factory || null };
  } catch { return { state: "error" }; }
}
/* fields: {presets?, links?, hash?}; authHash = bisheriges Passwort-Hash des Benutzers; extra = zusätzliche Header (z. B. x-write-key) */
async function putUser(name, authHash, fields, extra) {
  try {
    const res = await fetch(`${SYNC_BASE}/user/${encodeURIComponent(name)}`, { method: "PUT", headers: { "content-type": "application/json", "x-user-hash": authHash || "", ...(extra || {}) }, body: JSON.stringify(fields) });
    if (res.ok) stampSync("lastSyncUser");
    return res.ok;
  } catch { return false; }
}
function stampSync(k) { try { localStorage.setItem(k, String(Date.now())); } catch { /* egal */ } }

/* Tesla-Voreinstellung und Standard (gemeinsam für alle, Server; sonst eingebaute Werte) */
async function sysData(n) {
  const r = await fetchUser(SYS[n], "");
  return r.state === "ok" && !r.none && Object.keys(r.presets).length ? normPresets(r.presets) : sysDefault(n);
}
const teslaData = () => sysData("tesla");
/* Tesla-Voreinstellung anwenden (mit Vorschau der Änderungen, sofern nicht silent) */
async function applyTeslaPreset(silent) {
  const ok = await applyWithPreview(presetTarget(await teslaData(), "tesla"), "Tesla-Voreinstellung anwenden?", silent);
  if (ok) lss("teslaPreset", "1");
  return ok;
}
/* Speichern auf dem Server: normale Benutzer mit ihrem Passwort-Hash, „tesla“/„standard“ mit dem Schreib-Passwort */
async function putProfile(n, fields) {
  if (SYS[n]) return putUser(SYS[n], "", fields, { "x-write-key": sysKey() });
  return putUser(n, lsv("userHash", ""), fields);
}
let userSyncOk = false;   // erst nach erfolgreichem Laden vom Server wird zurückgeschrieben

/* Anmelden: zuerst wird geprüft, ob der Benutzer existiert. Neue Namen werden erst nach Rückfrage angelegt (Tippfehler!). */
async function userLogin(rawName, pass) {
  const name = userCleanName(rawName);
  if (name.length < 2 || name.startsWith("_")) return { ok: false, msg: "Benutzername: mindestens 2 Zeichen, nicht mit _ beginnen." };
  if (SYS[name]) return { ok: false, sys: name, msg: "" };
  const hash = await userHashOf(name, pass);
  const r = await fetchUser(name, hash);
  if (r.state === "error") return { ok: false, msg: "Server nicht erreichbar." };
  if (r.state === "locked") {
    if (!pass) {
      const pw = await uiPrompt({ eyebrow: "Benutzer", title: `Passwort für „${name}“`, type: "password", ok: "Anmelden" });
      if (!pw) return { ok: false, msg: "Abgebrochen." };
      return userLogin(name, pw);
    }
    return { ok: false, msg: "Passwort stimmt nicht.", locked: true };
  }
  let data, created = false, links = [];
  if (r.state === "none") {
    const yes = await uiConfirm({ eyebrow: "Benutzer", title: `„${name}“ gibt es noch nicht`, lines: ["Neuen Benutzer mit diesem Namen anlegen? Prüfe vorher auf Tippfehler."], ok: "Neu anlegen", cancel: "Zurück" });
    if (!yes) return { ok: false, msg: "Nicht angelegt." };
    data = await sysData("standard");
    if (!(await putUser(name, hash, { presets: data, hash, links: [] }))) return { ok: false, msg: "Anlegen fehlgeschlagen." };
    created = true;
  } else { data = normPresets(r.presets); links = r.links; }
  lss("userName", name); lss("userHash", hash); userSaveLocal(data);
  userKnownAdd([name, ...links]);
  if (sameNameOn() || !lsv("sync-code", "")) lss("sync-code", name);
  userSyncOk = true;
  const applied = await applyWithPreview(presetTarget(data, "user"), `Einstellungen von „${name}“ übernehmen?`, created);
  return { ok: true, created, applied, msg: created ? `Neuer Benutzer „${name}“ angelegt.` : `Angemeldet als „${name}“.` };
}
function userLogout() { ["userName", "userHash", "userPresets"].forEach((k) => { try { localStorage.removeItem(k); } catch { /* egal */ } }); }

/* beim Start: gespeicherten Benutzer still laden und anwenden */
async function userAutoLogin() {
  const name = userName();
  if (!name) return;
  /* zuerst sofort mit dem gespeicherten Stand (auch offline), dann mit dem Server abgleichen */
  await applyWithPreview(presetTarget(userData(), SYS[name] === "_tesla" ? "tesla" : "user"), "", true);
  const r = SYS[name] ? await fetchUser(SYS[name], "") : await fetchUser(name, lsv("userHash", ""));
  if (r.state !== "ok") return;
  userSyncOk = true;
  const data = normPresets(r.presets);
  userSaveLocal(data);
  userKnownAdd([name, ...r.links]);
  await applyWithPreview(presetTarget(data, SYS[name] === "_tesla" ? "tesla" : "user"), "", true);
}

async function askKey(title) {
  const k = await uiPrompt({ eyebrow: "Schlüssel", title, text: "Dafür ist das Schreib-Passwort (WRITE_KEY) nötig.", type: "password", ok: "OK" });
  return k || "";
}

function renderPresetBox() {
  const name = userName();
  const code = lsv("sync-code", "");
  document.getElementById("userLine").textContent = name ? `Angemeldet: ${name}` : (code ? `Favoriten-Abgleich: ${code} (kein Benutzer angemeldet)` : "Kein Benutzer angemeldet");
  document.getElementById("userOut").hidden = !name;
  try { refreshSyncInfo(); const ci = document.getElementById("codeInput"); if (ci && name && !SYS[name] && sameNameOn()) ci.value = lsv("sync-code", ""); } catch { /* egal */ }
  document.getElementById("userLink").hidden = !name;
  const sel = document.getElementById("userSel");
  sel.replaceChildren();
  const add = (v, t) => { const o = document.createElement("option"); o.value = v; o.textContent = t; sel.append(o); };
  add("", "– kein Benutzer –");
  userKnown().forEach((n) => add(n, n));
  add("__new", "＋ Neuer Benutzer …");
  sel.value = name && userKnown().includes(name) ? name : "";
  buildPresetRows(document.getElementById("presetRows"), {
    live: true,
    get: userData,
    save: async (d) => { userSaveLocal(d); const n = userName(); if (n && userSyncOk) await putProfile(n, { presets: d }); }
  });
}

/* Zeilen mit Haken und Werte-Feldern. o.live: Werte des Geräts (Benutzer); sonst Werte aus o.get() (Standard/Tesla-Editor) */
function buildPresetRows(rows, o) {
  rows.replaceChildren();
  const data = o.get();
  PRESETS.forEach((p) => {
    const wrap = document.createElement("div");
    wrap.className = "preset-row";
    const l = document.createElement("label");
    l.className = "set-row check";
    const c = document.createElement("input");
    c.type = "checkbox"; c.checked = data.on[p.id] !== false;
    const sp = document.createElement("span");
    sp.textContent = p.label;
    l.append(c, sp);
    wrap.append(l);
    const fb = document.createElement("div");
    fb.className = "preset-fields";
    fb.hidden = !c.checked;
    const inputs = [];
    (p.fields || []).forEach((f) => {
      const lab = document.createElement("label");
      lab.className = "preset-field";
      if (f.t) lab.append(document.createTextNode(f.t + " "));
      const shown = o.live ? lsv(f.key, f.dv) : (data.vals[f.key] ?? (o.name === "tesla" ? (p.def || {})[f.key] : STD_VALS[f.key]) ?? f.dv);
      let inp;
      if (f.o) {
        inp = document.createElement("select");
        f.o.forEach(([v, t]) => { const op = document.createElement("option"); op.value = v; op.textContent = t; inp.append(op); });
      } else {
        inp = document.createElement("input");
        inp.type = "number"; inp.min = f.n[0]; inp.max = f.n[1]; inp.inputMode = "numeric";
      }
      inp.value = String(shown);
      inputs.push([f, inp]);
      inp.onchange = async () => {
        let v = inp.value;
        if (f.n) { v = String(Math.max(f.n[0], Math.min(f.n[1], Math.round(Number(v) || Number(f.dv))))); inp.value = v; }
        if (o.live) applyTarget([{ key: f.key, val: v }], true);
        const d = o.get(); d.vals[f.key] = v; await o.save(d);
      };
      lab.append(inp);
      fb.append(lab);
    });
    c.onchange = async () => {
      const d = o.get(); d.on[p.id] = c.checked;
      if (c.checked) {
        if (o.live) presetCapture(d, [p.id]);
        else inputs.forEach(([f, inp]) => { if (d.vals[f.key] === undefined) d.vals[f.key] = inp.value; });
      }
      fb.hidden = !c.checked;
      await o.save(d);
    };
    if ((p.fields || []).length) wrap.append(fb);
    rows.append(wrap);
  });
}

/* Alles auf Standard bzw. Tesla zurücksetzen (aktueller Benutzer und dieses Gerät), mit Sicherheitsabfrage */
async function resetToProfile(name) {
  const data = await sysData(name);
  const all = { on: defaultOn(), vals: data.vals };
  const target = presetTarget(all, name === "tesla" ? "tesla" : "user");
  const diff = presetDiff(target);
  const label = name === "tesla" ? "Tesla" : "Standard";
  const yes = await uiDialog({
    eyebrow: "Zurücksetzen", title: `Wirklich alles auf „${label}“ zurücksetzen?`, cancelValue: false,
    lines: [`Alle Einstellungen${userName() ? ` von „${userName()}“` : ""} und dieses Geräts werden auf die Werte von „${label}“ gesetzt.${diff.length ? ` ${diff.length} Werte ändern sich.` : " Es ändert sich nichts."}`,
      ...(diff.length ? [{ details: { title: "Änderungen anzeigen", lines: [{ table: [["Einstellung", "Jetzt", "Neu"], ...diff.map((d) => [d.key === d.label ? d.key : `${d.label} (${d.key})`, niceVal(d.old), niceVal(d.val)])] }] } }] : [])],
    buttons: [{ value: true, kind: "danger", label: "Ja, zurücksetzen" }, { value: false, kind: "cancel", label: "Abbrechen" }]
  });
  if (!yes) return;
  applyTarget(target);
  const d = userData(); d.on = defaultOn(); target.forEach((x) => { d.vals[x.key] = x.val; }); userSaveLocal(d);
  const n = userName();
  if (n && userSyncOk) await putProfile(n, { presets: d });
  renderPresetBox();
  document.getElementById("userMsg").textContent = `Auf „${label}“ zurückgesetzt.`;
}

/* Editor für „Standard“ und „Tesla“: zeigt die gespeicherten Werte, mit Speichern / Abbrechen */
async function verifyKey(name, key) {
  const r = await fetchUser(SYS[name], "", { "x-write-key": key });
  return r.state === "ok" && r.keyOk;
}
async function openSysEditor(name) {
  const msg = document.getElementById("userMsg");
  let key = sysKey();
  if (!key || !(await verifyKey(name, key))) {
    key = await askKey(name === "tesla" ? "Tesla Voreinstellungen ändern" : "Standard Voreinstellungen ändern");
    if (!key) return;
    if (!(await verifyKey(name, key))) { msg.textContent = "Schreib-Passwort falsch oder Server nicht erreichbar."; return; }
    sysKeyMem = key;
  }
  const r = await fetchUser(SYS[name], "");
  let draft = r.state === "ok" && !r.none && Object.keys(r.presets).length ? normPresets(r.presets) : sysDefault(name);
  const ed = document.getElementById("sysEditor"), area = document.getElementById("userArea");
  const when = document.getElementById("sysWhen"), em = document.getElementById("sysMsg");
  document.getElementById("sysTitle").textContent = name === "tesla" ? "Tesla Voreinstellungen (gelten für alle)" : "Standard Voreinstellungen (für alle neuen Benutzer)";
  const stamp = (u) => (u ? `Zuletzt geändert: ${new Date(u).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" })}` : "Noch nie geändert (eingebaute Werte).");
  when.textContent = stamp(r.updated);
  em.textContent = "";
  const close = () => { ed.hidden = true; area.hidden = false; };
  buildPresetRows(document.getElementById("sysRows"), { live: false, name, get: () => draft, save: (d) => { draft = d; } });
  ed.hidden = false; area.hidden = true;
  document.getElementById("sysCancel").onclick = () => { close(); msg.textContent = "Nicht gespeichert."; };
  let factory = r.factory ? normPresets(r.factory) : null;
  const more = document.getElementById("sysMore"), tog = document.getElementById("sysMoreToggle"), setF = document.getElementById("sysSetFactory"), clr = document.getElementById("sysFactoryClear");
  more.hidden = true;
  setF.onclick = async () => {
    if (!(await uiConfirm({ eyebrow: "Notfall", title: "Neue Werkseinstellung festlegen?", lines: ["Die Werte, die gerade in den Feldern stehen, werden die neue Werkseinstellung (für „Werkseinstellung wiederherstellen“).", "Die normale Voreinstellung ändert sich dadurch nicht."], ok: "Weiter" }))) return;
    const pw = await uiPrompt({ eyebrow: "Notfall", title: "Schreib-Passwort noch einmal eingeben", type: "password", ok: "Festlegen" });
    if (!pw) return;
    if (!(await verifyKey(name, pw))) { em.textContent = "Schreib-Passwort falsch."; return; }
    const ok = await putUser(SYS[name], "", { factory: draft }, { "x-write-key": pw });
    if (ok) { factory = normPresets(JSON.parse(JSON.stringify(draft))); clr.hidden = false; em.textContent = "Neue Werkseinstellung gespeichert."; }
    else em.textContent = "Nicht gespeichert: Server nicht erreichbar.";
  };
  tog.textContent = "▸"; tog.setAttribute("aria-expanded", "false");
  tog.onclick = () => { more.hidden = !more.hidden; tog.textContent = more.hidden ? "▸" : "▾"; tog.setAttribute("aria-expanded", String(!more.hidden)); };
  const more2 = document.getElementById("sysMore2"), tog2 = document.getElementById("sysMore2Toggle");
  more2.hidden = true; tog2.textContent = "▸";
  tog2.onclick = () => { more2.hidden = !more2.hidden; tog2.textContent = more2.hidden ? "▸" : "▾"; };
  clr.hidden = false;
  clr.onclick = async () => {
    if (!(await uiConfirm({ eyebrow: "Notfall", title: "Auf ursprüngliche Werkseinstellung zurücksetzen?", lines: ["Die selbst festgelegte Werkseinstellung wird gelöscht. Danach gelten wieder die fest im Programm eingebauten Werte."], ok: "Weiter" }))) return;
    const pw = await uiPrompt({ eyebrow: "Notfall", title: "Schreib-Passwort noch einmal eingeben", type: "password", ok: "Zurücksetzen" });
    if (!pw) return;
    if (!(await verifyKey(name, pw))) { em.textContent = "Schreib-Passwort falsch."; return; }
    const ok = await putUser(SYS[name], "", { factory: null }, { "x-write-key": pw });
    if (ok) { factory = null; clr.hidden = true; em.textContent = "Eigene Werkseinstellung entfernt."; } else em.textContent = "Nicht möglich: Schreib-Passwort falsch oder Server nicht erreichbar.";
  };
  document.getElementById("sysFactory").onclick = async () => {
    if (!(await uiConfirm({ eyebrow: "Werkseinstellung", title: "Werkseinstellung wiederherstellen?", lines: [factory ? "Die Felder werden auf deine gespeicherte Werkseinstellung zurückgesetzt." : "Die Felder werden auf die fest eingebauten Werte zurückgesetzt.", "Gespeichert wird erst mit „Speichern“."], ok: "Wiederherstellen" }))) return;
    draft = factory ? normPresets(JSON.parse(JSON.stringify(factory))) : sysDefault(name);
    buildPresetRows(document.getElementById("sysRows"), { live: false, name, get: () => draft, save: (d) => { draft = d; } });
  };
  document.getElementById("sysSave").onclick = async () => {
    em.textContent = "Bitte warten …";
    const ok = await putUser(SYS[name], "", { presets: draft }, { "x-write-key": key });
    if (!ok) { em.textContent = "Nicht gespeichert: Schreib-Passwort falsch oder Server nicht erreichbar."; return; }
    const r2 = await fetchUser(SYS[name], "");
    when.textContent = stamp(r2.updated);
    close();
    msg.textContent = `${name === "tesla" ? "Tesla" : "Standard"} Voreinstellungen gespeichert. ${stamp(r2.updated)}`;
  };
  ed.scrollIntoView({ block: "start" });
}

/* beim Schließen der Einstellungen: aktuelle Werte der angehakten Zeilen im Benutzer speichern */
async function userSaveSettings() {
  const n = userName();
  if (!n || !userSyncOk) return;
  const d = userData();
  if (state.touched) { state.touched.forEach((id) => { d.on[id] = true; }); state.touched.clear(); }
  presetCapture(d);
  const before = lsv("userPresets", "");
  userSaveLocal(d);
  if (lsv("userPresets", "") !== before) await putProfile(n, { presets: d });
}
/* Änderungen an Einstellungen (auch außerhalb des Einstellungsfensters, z. B. A+/A−) werden nach kurzer Pause im Benutzer gespeichert */
(() => {
  const orig = Storage.prototype.setItem;
  let t = 0;
  const flush = async () => { try { await userSaveSettings(); } finally { state.setPending = false; } };
  state.touched = new Set();
  Storage.prototype.setItem = function (k, v) {
    orig.call(this, k, v);
    if (this !== localStorage) return;
    try {
      const row = userName() && PRESETS.find((p) => p.keys.includes(k) || (p.rx && p.rx.test(k)));
      if (row) {
        if (!state.applyingPreset && !row.offByDefault) state.touched.add(row.id);   // händische Änderung: Zeile wird (wieder) angehakt
        clearTimeout(t); state.setPending = true; t = setTimeout(flush, 2500);
      }
    } catch { /* egal */ }
  };
  window.addEventListener("pagehide", () => { try { userSaveSettings(); } catch { /* egal */ } });
})();
/* Abgleich-Reiter: Benutzer für die Einstellungen (wie in Allgemein), wenn nicht der gleiche Name genutzt wird */
function setupSyncUser() {
  const nameIn = document.getElementById("syncUser"), passIn = document.getElementById("syncUserPass");
  nameIn.value = userName() && !SYS[userName()] ? userName() : ""; passIn.value = "";
  refreshSyncInfo();
}
function setupThemeShown() {
  const tog = document.getElementById("themeShownToggle"), box = document.getElementById("themeShownBox");
  if (!tog || !box || tog.dataset.on) return;
  tog.dataset.on = "1";
  tog.addEventListener("click", () => {
    const open = box.hidden;
    box.hidden = !open;
    tog.setAttribute("aria-expanded", String(open));
    tog.textContent = (open ? "▾" : "▸") + " Designs im Hauptfenster auswählen";
    if (open && window.THEME) window.THEME.mountShown(box);
  });
}
function setupPresetBox() {
  setupThemeShown();
  document.getElementById("presetBox").hidden = false;
  document.getElementById("subTabs").hidden = false;
  const msg = document.getElementById("userMsg");
  const nameIn = document.getElementById("userName"), passIn = document.getElementById("userPass");
  const box = document.getElementById("userNew"), sel = document.getElementById("userSel");
  nameIn.value = ""; passIn.value = ""; box.hidden = true;
  document.getElementById("sysEditor").hidden = true; document.getElementById("userArea").hidden = false;
  setupSyncUser();
  const run = async (n, p) => {
    msg.textContent = "Bitte warten …";
    const r = await userLogin(n, p);
    msg.textContent = r.msg;
    if (r.sys) { msg.textContent = ""; box.hidden = true; nameIn.value = ""; await openSysEditor(r.sys); renderPresetBox(); return; }
    if (r.ok) {
      if (sameNameOn() && !SYS[userCleanName(n)]) { try { await syncWithPass(userCleanName(n), p); } catch { /* egal */ } }
      passIn.value = ""; nameIn.value = ""; box.hidden = true;
    }
    renderPresetBox();
  };
  sel.onchange = () => {
    if (sel.value === "__new") { box.hidden = false; nameIn.focus(); return; }
    box.hidden = true;
    if (sel.value === "") { userLogout(); msg.textContent = "Abgemeldet. Die Werte auf diesem Gerät bleiben bestehen."; renderPresetBox(); return; }
    run(sel.value, "");
  };
  document.getElementById("userGo").onclick = () => run(nameIn.value, passIn.value);
  document.getElementById("userOut").onclick = () => { userLogout(); msg.textContent = "Abgemeldet. Die Werte auf diesem Gerät bleiben bestehen."; renderPresetBox(); };
  document.getElementById("presetApply").onclick = async () => { if (await applyWithPreview(presetTarget(userData(), "user"), "Gespeicherte Werte anwenden?")) showToast("Voreinstellungen angewendet"); };
  document.getElementById("teslaApply").onclick = async () => { if (await applyTeslaPreset()) showToast("Tesla-Voreinstellung angewendet"); };
  document.getElementById("stdReset").onclick = () => resetToProfile("standard");
  document.getElementById("teslaReset").onclick = () => resetToProfile("tesla");
  document.getElementById("userLink").onclick = async () => {
    const me = userName();
    if (!me) return;
    const other = userCleanName(await uiPrompt({ eyebrow: "Benutzer", title: "Verknüpfen mit …", text: "Name des anderen Benutzers (zum Beispiel vom Tesla oder vom Heimcomputer).", ok: "Weiter" }));
    if (other.length < 2 || other === me) return;
    let oh = "", o = await fetchUser(other, "");
    if (o.state === "locked") {
      const pw = await uiPrompt({ eyebrow: "Benutzer", title: `Passwort für „${other}“`, type: "password", ok: "Weiter" });
      if (!pw) return;
      oh = await userHashOf(other, pw); o = await fetchUser(other, oh);
    }
    if (o.state !== "ok") { msg.textContent = o.state === "none" ? `„${other}“ gibt es nicht.` : o.state === "locked" ? "Passwort stimmt nicht." : "Server nicht erreichbar."; return; }
    const mine = await fetchUser(me, lsv("userHash", ""));
    if (mine.state !== "ok") { msg.textContent = "Server nicht erreichbar."; return; }
    const all = [...new Set([me, other, ...mine.links, ...o.links])];
    const a = await putUser(me, lsv("userHash", ""), { links: all.filter((n) => n !== me) });
    const b = await putUser(other, oh, { links: all.filter((n) => n !== other) });
    userKnownAdd(all);
    msg.textContent = a && b ? `„${me}“ und „${other}“ sind verknüpft.` : "Verknüpfen fehlgeschlagen.";
    renderPresetBox();
  };
  document.getElementById("userDel").onclick = async () => {
    const target = userCleanName(sel.value && sel.value !== "__new" ? sel.value : nameIn.value) || userName();
    if (!target) { msg.textContent = "Benutzer zuerst auswählen."; return; }
    if (!(await uiConfirm({ eyebrow: "Benutzer", title: `„${target}“ löschen?`, lines: ["Der Benutzer und seine Voreinstellungen werden auf dem Server gelöscht."], ok: "Löschen", danger: true }))) return;
    const key = await askKey("Benutzer löschen");
    if (!key) return;
    try {
      const res = await fetch(`${SYNC_BASE}/user/${encodeURIComponent(target)}`, { method: "DELETE", headers: { "x-write-key": key } });
      if (!res.ok) { msg.textContent = res.status === 401 ? "Schlüssel falsch." : "Löschen fehlgeschlagen."; return; }
    } catch { msg.textContent = "Server nicht erreichbar."; return; }
    lss("userList", JSON.stringify(userKnown().filter((n) => n !== target)));
    if (userName() === target) userLogout();
    msg.textContent = `„${target}“ gelöscht.`;
    renderPresetBox();
  };
  renderPresetBox();
}

function openCode(title, onSubmit, kind) {
  sysKeyMem = "";
  const modal = document.getElementById("codeModal");
  const ludwtBox = document.getElementById("ludwtSync");
  if (ludwtBox) ludwtBox.hidden = kind !== "sync";
  document.getElementById("codeForm").classList.toggle("has-ludwt", kind === "sync");
  const input = document.getElementById("codeInput");
  const message = document.getElementById("codeMessage");
  const qr = document.getElementById("syncQr");
  const ok = document.getElementById("codeOk");
  document.getElementById("codeTitle").textContent = title;
  const settingsMode = kind === "sync";
  document.getElementById("codeForm").classList.toggle("settings-mode", settingsMode);
  document.getElementById("codeEyebrow").textContent = settingsMode ? "Menü" : "Favoriten";
  document.getElementById("codeCancel").textContent = settingsMode ? "Schließen" : (state.fromSettings ? "Zurück" : "Abbrechen");
  if (!settingsMode) document.getElementById("codeForm").querySelectorAll("[data-tab]").forEach((n) => n.classList.toggle("tab-off", n.dataset.tab !== "abgleich"));
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
  document.getElementById("syncSettings").hidden = true;
  document.getElementById("autoPlayBox").hidden = true;
  document.getElementById("verBarBox").hidden = true;
  document.getElementById("tagsBox").hidden = true;
  document.getElementById("advBox").hidden = true;
  document.getElementById("caragBox").hidden = true;
  document.getElementById("presetBox").hidden = true;
  document.getElementById("subTabs").hidden = true;
  document.getElementById("favBox").hidden = true;
  document.getElementById("extraBox").hidden = true;
  document.getElementById("themeBox").hidden = true;
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
  document.getElementById("codeCancel").onclick = () => {
    sysKeyMem = "";
    if (kind === "sync") userSaveSettings();
    if (kind !== "sync" && state.fromSettings) { state.fromSettings = false; syncFavorites("sichern"); return; }
    state.fromSettings = false;
    modal.hidden = true;
  };
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
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`jw-musik:${text}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* Passwort prüfen: bevorzugt gegen den Hash (password.js: APP_PASSWORD_HASH / TIMECODE_PASSWORD_HASH), sonst Klartext (alt) */
async function passwordOk(input, plain, hash) {
  if (typeof input !== "string") return false;
  if (hash) {
    try { return (await sha256Hex(input)) === hash; } catch { return false; }
  }
  return plain !== undefined && input === plain;
}

function showLogin() {
  const gate = document.getElementById("loginGate");
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginBack").hidden = false;
  document.getElementById("loginApply").hidden = false;
  document.getElementById("loginBack").onclick = () => { gate.hidden = true; document.getElementById("loginSameRow").hidden = true; document.getElementById("loginSyncRow").hidden = true; document.getElementById("loginApply").hidden = true; document.getElementById("loginBack").hidden = true; };
  document.getElementById("loginApply").onclick = async () => {
    await loginExtras();
    document.getElementById("loginBack").onclick();
  };
  if (document.getElementById("loginExtra").hidden) document.getElementById("loginMore").click();
  document.getElementById("loginSameRow").hidden = false;
  document.getElementById("loginSyncRow").hidden = sameNameOn();
  document.getElementById("loginSyncName").value = lsv("sync-code", "");
  try { refreshSyncInfo(); } catch { /* egal */ }
  gate.hidden = false;
}
/* Tesla-Haken und Benutzer aus dem Anmeldefenster anwenden (wie beim Einloggen, nur ohne Login-Passwort) */
async function loginExtras() {
  const tesla = document.getElementById("loginTesla").checked;
  const un = document.getElementById("loginUser").value.trim();
  const up = document.getElementById("loginUserPass").value;
  const reopened = !document.getElementById("loginBack").hidden;
  let created = false;
  if (reopened && !sameNameOn()) {
    const sn = document.getElementById("loginSyncName").value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (sn.length >= 3) { try { const m = await syncWithPass(sn, document.getElementById("loginSyncPass").value); if (m) showToast(`Favoriten-Abgleich: ${m}`); } catch { /* egal */ } document.getElementById("loginSyncPass").value = ""; }
  }
  if (un) {
    const r = await userLogin(un, up);
    if (r.sys) { await syncFavorites("allgemein"); state.sub = "vor"; showSetTab("allgemein"); await openSysEditor(r.sys); }
    else {
      showToast(r.msg);
      if (r.ok && sameNameOn()) { try { const m = await syncWithPass(userCleanName(un), up); if (m) showToast(`Favoriten-Abgleich: ${m}`); } catch { /* egal */ } }
    }
    created = !!r.created;
  }
  /* neue Benutzer bekommen die Werte ohne Rückfrage, sonst werden Änderungen vorher gezeigt */
  if (tesla) { if (await applyTeslaPreset(created)) showToast("Tesla-Voreinstellung angewendet"); }
  document.getElementById("loginUserPass").value = "";
}
function checkLogin() {
  const gate = document.getElementById("loginGate");
  const authed = localStorage.getItem(STORAGE.auth) === "ok" || sessionStorage.getItem(STORAGE.auth) === "ok";
  const pwBox = document.getElementById("showPw");
  if (pwBox) pwBox.addEventListener("change", () => { document.getElementById("loginPassword").type = pwBox.checked ? "text" : "password"; });
  const more = document.getElementById("loginMore"), extra = document.getElementById("loginExtra");
  const toggleMore = (open) => { extra.hidden = !open; more.setAttribute("aria-expanded", String(open)); more.textContent = (open ? "▾" : "▸") + " Weitere Optionen"; };
  more.addEventListener("click", () => toggleMore(extra.hidden));
  const ti = document.getElementById("loginTeslaInfo"), tt = document.getElementById("loginTeslaText");
  ti.addEventListener("click", () => { tt.hidden = !tt.hidden; ti.textContent = tt.hidden ? "▾" : "▴"; ti.setAttribute("aria-expanded", String(!tt.hidden)); });
  /* im Tesla beim allerersten Öffnen gleich aufgeklappt */
  if (isTesla() && lsv("teslaPreset", "") === "") toggleMore(true);
  document.getElementById("loginTesla").checked = false;
  bindSameName();
  gate.hidden = authed;
  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = document.getElementById("loginPassword").value;
    if (!(await passwordOk(value, window.APP_PASSWORD, window.APP_PASSWORD_HASH))) {
      document.getElementById("loginError").hidden = false;
      return;
    }
    document.getElementById("loginError").hidden = true;
    if (document.getElementById("rememberLogin").checked) localStorage.setItem(STORAGE.auth, "ok");
    else sessionStorage.setItem(STORAGE.auth, "ok");
    gate.hidden = true;
    document.getElementById("loginBack").hidden = true;
    document.getElementById("loginApply").hidden = true;
    await loginExtras();
    if (typeof tryAutoStart === "function" && !authed) tryAutoStart();
  });
}

function init() {
  if (location.search.includes("r=")) history.replaceState(null, "", location.pathname);
  state.timeOffset = Number(localStorage.getItem("teslaKaraokeTimeOffset") || 0) || 0;
  checkLogin();
  if (SYS[userName()]) userLogout();
  state.userReady = userAutoLogin().catch(() => {});
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
  loadSongs().then(() => { tryAutoStart(); loadMedia(); }).catch(() => {});
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


/* ---------- Designs (Themes): Logik in theme.js ---------- */
(function bindTheme() {
  const btn = document.getElementById("themeBtn");
  /* bei aktiver Lupe: ca. 1 Sekunde gedrückt halten öffnet die Auswahl aller Designs */
  if (btn) {
    let timer = 0, fired = false;
    const clear = () => { clearTimeout(timer); timer = 0; };
    btn.addEventListener("pointerdown", () => {
      fired = false; clear();
      if (!document.body.classList.contains("glass-open")) return;
      timer = setTimeout(() => { timer = 0; fired = true; if (window.THEME && THEME.openPicker) THEME.openPicker(); }, 1000);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, clear));
    btn.addEventListener("contextmenu", (e) => { if (document.body.classList.contains("glass-open")) e.preventDefault(); });
    btn.addEventListener("click", (e) => { if (fired) { fired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  }
  if (btn) btn.addEventListener("click", () => {
    const r = window.THEME.cycle();
    showToast(`Design: ${r.name}${r.wasAuto ? " (Automatik aus)" : ""}`);
  });
})();

/* ---------- Einstellungsfenster mit Reitern ---------- */
function showSetTab(tab) {
  const form = document.getElementById("codeForm");
  state.setTab = tab;
  const sub = state.sub || "einst";
  form.querySelectorAll("[data-tab]").forEach((n) => n.classList.toggle("tab-off", !n.dataset.tab.split(" ").includes(tab) || (tab === "allgemein" && !!n.dataset.sub && n.id !== "subTabs" && !n.dataset.sub.split(" ").includes(sub))));
  document.querySelectorAll("#subTabs [data-sub]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sub === sub)));
  document.querySelectorAll("#setTabs [data-settab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.settab === tab)));
  if (tab === "design" && window.THEME) window.THEME.mountUi(document.getElementById("themeBox"));
  if (tab === "fehlend" && window.FEHLEND) window.FEHLEND.mount(document.getElementById("fehlendBox"));
  form.scrollTop = 0;
}
document.querySelectorAll("#setTabs [data-settab]").forEach((b) => b.addEventListener("click", () => showSetTab(b.dataset.settab)));
document.querySelectorAll("#subTabs [data-sub]").forEach((b) => b.addEventListener("click", () => { state.sub = b.dataset.sub; showSetTab("allgemein"); }));
