/* Fernsteuerung: ein Gerät spielt ab („wird gesteuert“), ein anderes steuert es („Fernbedienung“).
 * Verbindung über den Worker (/remote/…), Abfrage alle ~1 Sekunde. Es gibt immer genau ein Paar. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const BASE = () => (typeof SYNC_BASE !== "undefined" ? SYNC_BASE : location.origin);
  const R = { role: "", code: "", cid: "", ctrl: "", lastCmd: 0, cmdSeq: 0, cmds: [], fails: 0, inflight: 0, t: {}, peerTs: 0, last: null, pos: { at: 0, v: 0 }, listTab: "songs", plSel: "", q: "" };
  /* vierstelliger Zahlencode; nur Codes, die gerade nicht benutzt werden */
  const rnd4 = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  async function freeCode() {
    for (let i = 0; i < 12; i++) {
      const c = rnd4();
      const r = await api(`${c}/state`);
      if (r.status === 404 || (r.ok && r.json && (r.json.phase === "closed" || Date.now() - (r.json.ts || 0) > 60000))) return c;
    }
    return rnd4();
  }
  /* Code, den ein anderes Gerät gerade erzeugt hat (läuft noch, wartet auf Fernbedienung) */
  async function pendingCode() {
    const i = await api("inbox/latest");
    if (!i.ok || !i.json || !i.json.code || Date.now() - (i.json.ts || 0) > 30 * 60000) return "";
    const s = await api(`${i.json.code}/state`);
    if (s.ok && s.json && s.json.phase === "wait" && Date.now() - (s.json.ts || 0) < 30000) return i.json.code;
    return "";
  }
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const fmt = (s) => { s = Math.max(0, Math.round(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  /* ---------- Netzwerk ---------- */
  async function api(path, method, body) {
    R.inflight++; paintBadge();
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 6000);
      const res = await fetch(`${BASE()}/remote/${path}`, { method: method || "GET", cache: "no-store", signal: ctl.signal, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
      clearTimeout(timer);
      R.fails = 0;
      let json = null;
      try { json = await res.json(); } catch { /* leer */ }
      return { ok: res.ok, status: res.status, json };
    } catch {
      R.fails++;
      return { ok: false, status: 0, json: null };
    } finally { R.inflight--; paintBadge(); }
  }

  /* ---------- Anzeige: grün / rot / orange pulsierend ---------- */
  function badgeState() { return R.fails === 0 ? "ok" : (R.inflight > 0 ? "retry" : "off"); }
  function paintBadge() {
    const b = $("remoteBadge");
    if (!b) return;
    b.hidden = !R.role;
    document.body.classList.toggle("rc-on", R.role === "controller");
    if (!R.role) return;
    const st = badgeState();
    b.dataset.st = st;
    const label = R.role === "player" ? (R.ctrl ? "Wird gesteuert" : "Wartet auf Gerät") : "Steuert";
    b.querySelector(".rb-txt").textContent = `${label} · beenden`;
    b.title = st === "ok" ? "Verbindung zum Server steht – antippen zum Beenden" : st === "retry" ? "Verbindung wird neu aufgebaut …" : "Keine Verbindung zum Server";
  }

  /* ---------- Beenden ---------- */
  async function end(notify, msg) {
    const role = R.role;
    if (!role) return;
    Object.values(R.t).forEach((t) => { clearInterval(t); clearTimeout(t); });
    R.t = {};
    const code = R.code;
    R.role = ""; R.ctrl = ""; R.last = null;
    paintBadge(); closePanel(); closeModal();
    if (notify) {
      if (role === "controller") await api(`${code}/cmd`, "PUT", { cid: R.cid, bye: true, ping: Date.now(), cmds: [] });
      else { await api(`${code}/state`, "PUT", { phase: "closed", ts: Date.now() }); await api("inbox/latest", "DELETE"); }
    }
    try { if (typeof showToast === "function") showToast(msg || "Fernsteuerung beendet."); } catch { /* egal */ }
  }

  /* ---------- Player (wird gesteuert) ---------- */
  function buildState() {
    const song = state.songs[state.index];
    const a = el.audio;
    return {
      code: R.code, phase: R.ctrl ? "paired" : "wait", ctrl: R.ctrl, ts: Date.now(), lastCmd: R.lastCmd,
      song: song ? { id: song.id, number: song.number, title: song.title, cat: song.category || "" } : null,
      playing: !a.paused && !a.ended, pos: a.currentTime || 0, dur: isFinite(a.duration) ? a.duration : 0,
      shuffle: !!state.shuffle, mode: state.mode, pl: state.activePlaylist || "", ver: state.version || "karaoke", cur: state.curVersion || "",
      lw: lwState(), buf: bufEnd(), wait: !!(state.wantPlay && el.audio.readyState < 3 && !el.audio.paused), blocked: !!R.blocked,
      favs: [...state.favorites], pls: state.playlists.map((p) => ({ id: p.id, name: p.name, songs: p.songs }))
    };
  }
  /* Wiedergabe freischalten: Browser (v. a. Safari/Tesla) erlauben Ton erst nach einem Tipp auf diesem Gerät */
  const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
  function unlockAudio() {
    const a = el.audio;
    try {
      if (!a.getAttribute("src")) {
        a.src = SILENT; a.muted = true;
        const p = a.play();
        const done = () => { try { a.pause(); a.muted = false; a.removeAttribute("src"); a.load(); } catch { /* egal */ } };
        if (p && p.then) p.then(done).catch(() => { a.muted = false; }); else done();
      } else if (a.paused) {
        const p = a.play(); if (p && p.then) p.then(() => { if (!state.wantPlay) a.pause(); }).catch(() => {});
      }
    } catch { /* egal */ }
  }
  let unlockBtn = null;
  function showUnlock(on) {
    R.blocked = on;
    if (!unlockBtn) {
      unlockBtn = h("button", "rm-unlock", "▶ Hier tippen, um die Wiedergabe freizugeben"); unlockBtn.type = "button";
      unlockBtn.onclick = () => { unlockAudio(); try { if (el.audio.paused) togglePlay(); } catch { /* egal */ } showUnlock(false); setTimeout(postState, 400); };
      document.body.append(unlockBtn);
    }
    unlockBtn.hidden = !on;
  }
  function checkBlocked() {
    setTimeout(() => {
      if (R.role !== "player") return;
      const wants = state.wantPlay || R.wantedPlay;
      showUnlock(!!(wants && el.audio.paused && !state.netErr && el.readyState !== 0));
      postState();
    }, 1800);
  }
  function bufEnd() {
    try { const a = el.audio, t = a.currentTime || 0; for (let i = 0; i < a.buffered.length; i++) if (a.buffered.start(i) <= t + 0.5 && a.buffered.end(i) >= t) return a.buffered.end(i); } catch { /* egal */ }
    return 0;
  }
  /* LuD+WT: Lieder der aktuellen Woche */
  function lwState() {
    try {
      if (!window.LUDWT || !LUDWT.weekCount()) return null;
      const wk = LUDWT.defaultWeek(); if (!wk) return null;
      const w = LUDWT.weeks().find((x) => x.montag === wk);
      const rows = LUDWT.rows(wk, state.songs).filter((r) => r.song).map((r) => ({ k: r.kindShort, p: r.pos, id: r.song.id }));
      return { week: wk, to: w ? w.sonntag : "", rows };
    } catch { return null; }
  }
  let postBusy = false, postAgain = false;
  async function postState() {
    if (R.role !== "player") return;
    if (postBusy) { postAgain = true; return; }
    postBusy = true;
    await api(`${R.code}/state`, "PUT", buildState());
    postBusy = false;
    if (postAgain) { postAgain = false; setTimeout(postState, 300); }
  }
  function exec(c) {
    const a = c.a;
    switch (c.t) {
      case "play": R.wantedPlay = true; if (el.audio.paused) togglePlay(); checkBlocked(); break;
      case "pause": R.wantedPlay = false; showUnlock(false); if (!el.audio.paused) togglePlay(); break;
      case "next": step(1); break;
      case "prev": step(-1); break;
      case "skip": el.audio.currentTime = Math.max(0, (el.audio.currentTime || 0) + Number(a || 0)); break;
      case "seek": el.audio.currentTime = Math.max(0, Number(a || 0)); break;
      case "song": { const i = state.songs.findIndex((s) => s.id === a); R.wantedPlay = true; if (i >= 0) selectSong(i, true); checkBlocked(); break; }
      case "shuffle": state.shuffle = !!a; el.shuffleBtn.setAttribute("aria-pressed", String(!!a)); break;
      case "version": chooseVersion(a); break;
      case "fav": toggleFavorite(); break;
      case "playlist": {
        const pl = state.playlists.find((p) => p.id === a.id);
        if (!pl) break;
        state.mode = "playlists"; state.activePlaylist = pl.id; state.shuffle = !!a.shuffle;
        el.shuffleBtn.setAttribute("aria-pressed", String(!!a.shuffle));
        $("eigeneToggle").setAttribute("aria-pressed", "true"); $("menuToggle").setAttribute("aria-expanded", "false"); $("ludwtToggle").setAttribute("aria-pressed", "false");
        document.body.classList.remove("ludwt-mode"); $("ludwtBar").hidden = true;
        renderList();
        const ids = a.start ? [a.start] : [];
        const pool = playPool();
        const pick = ids.length ? pool.find((s) => s.id === ids[0]) : (a.shuffle ? pool[Math.floor(Math.random() * pool.length)] : pool[0]);
        if (pick) selectSong(state.songs.indexOf(pick), true);
        break;
      }
      case "ludwt": {
        state.ludwtWeek = a.week;
        if (state.mode !== "ludwt") $("ludwtToggle").click();
        Promise.resolve(window.LUDWT && LUDWT.ensureLoaded()).then(() => {
          state.ludwtWeek = a.week; state.shuffle = false; el.shuffleBtn.setAttribute("aria-pressed", "false");
          try { fillLudwtWeeks(); } catch { /* egal */ }
          renderList();
          const i = state.songs.findIndex((x) => x.id === a.start);
          if (i >= 0) selectSong(i, true);
          setTimeout(postState, 300);
        });
        break;
      }
      case "all": document.body.classList.remove("ludwt-mode"); $("ludwtBar").hidden = true; state.mode = "songs"; state.playFavorites = false; state.shuffle = !!(a && a.shuffle); el.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle)); $("menuToggle").setAttribute("aria-expanded", "true"); $("eigeneToggle").setAttribute("aria-pressed", "false"); { const pool = playPool(); const pick = state.shuffle ? pool[Math.floor(Math.random() * pool.length)] : pool[0]; if (pick) selectSong(state.songs.indexOf(pick), true); } break;
      default: break;
    }
  }
  async function pollCmd() {
    if (R.role !== "player") return;
    const r = await api(`${R.code}/cmd`);
    if (!r.ok || !r.json) return;
    const c = r.json;
    if (c.bye) { end(false, "Das andere Gerät hat die Verbindung beendet."); return; }
    if (c.hello && !R.ctrl) {
      R.ctrl = c.cid; paintBadge();
      api("inbox/latest", "DELETE");
      try { showToast("Fernbedienung verbunden."); } catch { /* egal */ }
      closeModal(); postState();
    }
    if (c.cid !== R.ctrl) return;
    if (c.ping) R.peerTs = c.ping;
    let did = false;
    (c.cmds || []).forEach((cmd) => { if (cmd.id > R.lastCmd) { R.lastCmd = cmd.id; try { exec(cmd); } catch { /* egal */ } did = true; } });
    if (did) { setTimeout(postState, 250); if (["playlist", "all", "ludwt", "next", "prev"].some((t) => (c.cmds || []).some((x) => x.t === t && x.id === R.lastCmd))) { R.wantedPlay = true; checkBlocked(); } }
  }
  async function startPlayer() {
    if (R.role) return;
    unlockAudio();
    R.role = "player"; R.ctrl = ""; R.lastCmd = 0; R.code = await freeCode();
    try { if (window.LUDWT) LUDWT.ensureLoaded().then(() => postState()); } catch { /* egal */ }
    await api(`${R.code}/cmd`, "DELETE");
    await api(`${R.code}/state`, "PUT", buildState());
    await api("inbox/latest", "PUT", { code: R.code, ts: Date.now() });
    R.t.poll = setInterval(pollCmd, 1000);
    R.t.beat = setInterval(postState, 3000);
    ["play", "pause", "ended", "loadedmetadata", "seeked", "emptied", "waiting", "canplay"].forEach((n) => el.audio.addEventListener(n, onAudio));
    paintBadge();
    showModal("player");
  }
  let audioT = 0;
  function onAudio() { if (R.role !== "player" || audioT) return; audioT = setTimeout(() => { audioT = 0; postState(); }, 400); }

  /* ---------- Fernbedienung (steuert) ---------- */
  let flushBusy = false, flushAgain = false;
  async function putCmd() {
    if (R.role !== "controller") return;
    if (flushBusy) { flushAgain = true; return; }
    flushBusy = true;
    await api(`${R.code}/cmd`, "PUT", { cid: R.cid, hello: true, ping: Date.now(), cmds: R.cmds.slice(-30) });
    flushBusy = false;
    if (flushAgain) { flushAgain = false; putCmd(); }
  }
  function send(t, a) { R.cmds.push({ id: ++R.cmdSeq, t, a }); putCmd(); }
  async function pollState() {
    if (R.role !== "controller") return;
    const r = await api(`${R.code}/state`);
    if (r.status === 404) { end(false, "Das andere Gerät ist nicht mehr verbunden."); return; }
    if (!r.ok || !r.json) return;
    const s = r.json;
    if (s.phase === "closed") { end(false, "Das andere Gerät hat die Verbindung beendet."); return; }
    R.last = s; R.pos = { at: Date.now(), v: s.pos || 0 };
    paintPanel();
  }
  async function connect(codeRaw) {
    const code = String(codeRaw || "").replace(/[^0-9]/g, "");
    const msg = $("rmMsg");
    if (code.length !== 4) { msg.textContent = "Bitte den Code vom anderen Gerät eingeben."; return; }
    msg.textContent = "Verbinde …";
    const r = await api(`${code}/state`);
    if (r.status === 404) { msg.textContent = "Dieser Code ist unbekannt. Auf dem anderen Gerät „Wird gesteuert“ wählen und den angezeigten Code eingeben."; return; }
    if (!r.ok || !r.json) { msg.textContent = "Server nicht erreichbar."; return; }
    const s = r.json;
    if (s.phase === "closed") { msg.textContent = "Diese Verbindung wurde schon beendet."; return; }
    if (s.phase === "paired" && Date.now() - (s.ts || 0) < 20000) { msg.textContent = "Dieses Gerät wird bereits von einem anderen Gerät gesteuert."; return; }
    R.role = "controller"; R.code = code; R.cid = Math.random().toString(36).slice(2, 10); R.cmds = []; R.cmdSeq = 0; R.ctrl = R.cid;
    await api(`${code}/cmd`, "PUT", { cid: R.cid, hello: true, ping: Date.now(), cmds: [] });
    let ok = false;
    for (let i = 0; i < 12 && !ok; i++) {
      await new Promise((res) => setTimeout(res, 700));
      const q = await api(`${code}/state`);
      if (q.ok && q.json && q.json.phase === "paired" && q.json.ctrl === R.cid) { ok = true; R.last = q.json; }
    }
    if (!ok) { R.role = ""; R.ctrl = ""; paintBadge(); msg.textContent = "Das andere Gerät hat nicht geantwortet. Ist dort „Wird gesteuert“ noch offen?"; return; }
    try { el.audio.pause(); } catch { /* lokal nicht abspielen */ }
    R.t.poll = setInterval(pollState, 1200);
    R.t.ping = setInterval(putCmd, 5000);
    R.t.tick = setInterval(tickPos, 500);
    closeModal(); openPanel(); paintBadge(); paintPanel();
  }

  /* ---------- Fenster „Sync“ ---------- */
  function stopModalPoll() { clearInterval(R.modalT); R.modalT = 0; }
  function closeModal() { stopModalPoll(); const m = $("remoteModal"); if (m) m.hidden = true; }
  function showModal(mode) {
    const m = $("remoteModal"), box = $("rmBody");
    stopModalPoll();
    m.hidden = false; box.replaceChildren();
    const x = h("button", "rm-x", "✕"); x.type = "button"; x.setAttribute("aria-label", "Schließen"); x.onclick = closeModal; box.append(x);
    box.append(h("p", "rm-eyebrow", "Sync mit anderem Gerät"));
    if (R.role && mode === "choose") {
      box.append(h("h2", "", R.role === "player" ? "Dieses Gerät wird gesteuert" : "Dieses Gerät steuert"));
      box.append(h("p", "rm-hint", R.role === "player" ? (R.ctrl ? "Eine Fernbedienung ist verbunden." : `Code: ${R.code}`) : "Verbunden mit einem anderen Gerät."));
      const b = h("button", "chip danger", "Verbindung beenden"); b.type = "button"; b.onclick = () => end(true); box.append(b);
      return;
    }
    if (mode === "choose") {
      box.append(h("h2", "", "Was soll dieses Gerät tun?"));
      const a = h("button", "rm-choice"); a.type = "button";
      a.append(h("b", "", "Gesteuert werden"), h("small", "", "Dieses Gerät spielt ab (z. B. großer Bildschirm, Tesla). Du bekommst einen Code."));
      a.onclick = startPlayer;
      const c = h("button", "rm-choice"); c.type = "button";
      c.append(h("b", "", "Steuern"), h("small", "", "Dieses Gerät ist die Fernbedienung (z. B. Handy). Du gibst den Code ein."));
      c.onclick = () => showModal("controller");
      const look = () => pendingCode().then((code) => { if (c.isConnected) c.querySelector("small").textContent = code ? `Code ${code} ist bereit – nur noch bestätigen.` : "Dieses Gerät ist die Fernbedienung (z. B. Handy). Du gibst den Code ein."; });
      look(); R.modalT = setInterval(look, 2500);
      box.append(a, c, h("p", "rm-hint", "Es gibt immer genau ein Gerät, das abspielt, und eines, das steuert."));
    } else if (mode === "player") {
      box.append(h("h2", "", "Gesteuert werden"));
      box.append(h("p", "rm-hint", "Auf dem anderen Gerät Sync → Steuern öffnen. Der Code steht dort schon bereit, du musst ihn nur bestätigen."));
      box.append(h("div", "rm-code", R.code));
      box.append(h("p", "rm-hint", "Warte auf das andere Gerät …"));
      const b = h("button", "chip", "Abbrechen"); b.type = "button"; b.onclick = () => end(true, "Fernsteuerung abgebrochen."); box.append(b);
    } else if (mode === "controller") {
      box.append(h("h2", "", "Steuern"));
      box.append(h("p", "rm-hint", "Code vom anderen Gerät:"));
      const inp = document.createElement("input"); inp.id = "rmCode"; inp.type = "text"; inp.autocomplete = "off"; inp.inputMode = "numeric"; inp.maxLength = 4; inp.pattern = "[0-9]*"; inp.placeholder = "0000"; inp.className = "rm-input";
      box.append(inp);
      const msg = h("p", "rm-hint", ""); msg.id = "rmMsg";
      const refresh = h("button", "rm-sync", "⟳"); refresh.type = "button"; refresh.title = "Code jetzt abfragen"; refresh.setAttribute("aria-label", "Code abfragen");
      const look = () => pendingCode().then((c) => { if (c && inp.isConnected && inp.dataset.typed !== "1") { inp.value = c; msg.textContent = "Code vom anderen Gerät gefunden – nur noch bestätigen."; } else if (!c && inp.isConnected && inp.dataset.typed !== "1") msg.textContent = "Warte auf den Code vom anderen Gerät … (wird alle paar Sekunden abgefragt)"; });
      inp.addEventListener("input", () => { inp.dataset.typed = "1"; });
      refresh.onclick = () => { inp.dataset.typed = ""; msg.textContent = "Frage ab …"; look(); };
      box.append(refresh);
      const ok = h("button", "chip primary-chip", "Bestätigen"); ok.type = "button"; ok.onclick = () => connect(inp.value);
      box.append(ok, msg);
      look(); R.modalT = setInterval(look, 2500);
    }
  }

  /* ---------- Fernbedienungs-Oberfläche ---------- */
  function closePanel() { const p = $("remotePanel"); if (p) p.hidden = true; }
  function openPanel() {
    const p = $("remotePanel");
    p.hidden = false; p.replaceChildren();
    const top = h("div", "rc-top"); top.append(h("b", "", "Fernbedienung"), h("small", "", ""));
    top.lastChild.id = "rcPeer";
    const now = h("div", "rc-now");
    const num = h("div", "rc-num", "—"); num.id = "rcNum";
    const ttl = h("h2", "rc-title", "Noch kein Lied"); ttl.id = "rcTitle";
    const st = h("div", "rc-sub", ""); st.id = "rcSub";
    now.append(num, ttl, st);
    const bar = h("div", "rc-bar");
    const t1 = h("span", "", "0:00"); t1.id = "rcT1";
    const rng = document.createElement("input"); rng.type = "range"; rng.min = "0"; rng.max = "1000"; rng.value = "0"; rng.id = "rcRange"; rng.setAttribute("aria-label", "Position");
    const t2 = h("span", "", "0:00"); t2.id = "rcT2";
    rng.addEventListener("input", () => { R.seeking = true; });
    rng.addEventListener("change", () => { R.seeking = false; const d = (R.last && R.last.dur) || 0; if (d) { send("seek", (Number(rng.value) / 1000) * d); R.pos = { at: Date.now(), v: (Number(rng.value) / 1000) * d }; } });
    bar.append(t1, rng, t2);
    const bufw = h("div", "rc-buf"); const bf = h("i", "rc-buf-fill"); bf.id = "rcBufFill"; const bt = h("span", "rc-buf-txt", ""); bt.id = "rcBufTxt"; bufw.append(bf, bt);
    bar.append(bufw);
    const tr = h("div", "rc-tr");
    const mk = (id, txt, fn, cls) => { const b = h("button", "rc-btn " + (cls || ""), txt); b.type = "button"; b.id = id; b.onclick = fn; return b; };
    const sk = (d) => (typeof skipSec === "function" ? skipSec(d) : 15);
    tr.append(
      mk("rcPrev", "⏮", () => send("prev")), mk("rcBack", `−${sk(-1)}`, () => send("skip", -sk(-1))),
      mk("rcPlay", "▶", () => send(R.last && R.last.playing ? "pause" : "play"), "rc-play"),
      mk("rcFwd", `+${sk(1)}`, () => send("skip", sk(1))), mk("rcNext", "⏭", () => send("next")));
    const tr2 = h("div", "rc-tr rc-tr2");
    tr2.append(mk("rcFav", "☆", () => send("fav")), mk("rcShuf", "Zufall", () => send("shuffle", !(R.last && R.last.shuffle))));
    const vers = h("div", "rc-vers");
    [["karaoke", "Karaoke"], ["meeting", "Instrumental"], ["video", "Video"], ["sung", "Zusammenkünfte"]].forEach(([v, t]) => { const b = h("button", "rc-chip", t); b.type = "button"; b.dataset.v = v; b.onclick = () => send("version", v); vers.append(b); });
    const tabs = h("div", "rc-tabs");
    [["songs", "Lieder"], ["lists", "Listen"], ["ludwt", "LuD+WT"]].forEach(([k, t]) => { const b = h("button", "rc-tab", t); b.type = "button"; b.dataset.k = k; b.onclick = () => { R.listTab = k; R.plSel = ""; paintList(); }; tabs.append(b); });
    const q = document.createElement("input"); q.type = "search"; q.id = "rcQ"; q.placeholder = "Lied suchen (Nummer oder Titel)"; q.autocomplete = "off"; q.className = "rc-q";
    q.addEventListener("input", () => { R.q = q.value; paintList(); });
    const list = h("div", "rc-list"); list.id = "rcList";
    p.append(top, now, bar, tr, tr2, vers, tabs, q, list);
    paintList();
  }
  function tickPos() {
    const s = R.last; if (!s || R.role !== "controller") return;
    const cur = s.playing ? R.pos.v + (Date.now() - R.pos.at) / 1000 : R.pos.v;
    const pos = s.dur ? Math.min(cur, s.dur) : cur;
    const t1 = $("rcT1"); if (t1) t1.textContent = fmt(pos);
    const bf = $("rcBufFill"), bt = $("rcBufTxt");
    if (bt && !s.dur) bt.textContent = s.blocked ? "Auf dem anderen Gerät einmal tippen (Wiedergabe freigeben)" : s.wait ? "Puffer: lädt …" : "Puffer: –";
    if (bf && s.dur) {
      const end = Math.max(s.buf || 0, 0), ahead = end - pos, full = end >= s.dur - 1;
      bf.style.width = `${Math.min(100, (end / s.dur) * 100)}%`;
      const low = s.playing && !full && (ahead < 8 || s.wait);
      bf.dataset.st = full ? "full" : low ? "low" : "ok";
      bt.textContent = s.blocked ? "Auf dem anderen Gerät einmal tippen (Wiedergabe freigeben)" : full ? "Puffer: komplett geladen" : s.wait ? "Puffer: lädt … (wartet auf Daten)" : `Puffer: bis ${fmt(end)} (${ahead > 0 ? "+" + Math.round(ahead) + " s voraus" : "nichts voraus"})`;
    }
    const rng = $("rcRange"); if (rng && !R.seeking && s.dur) rng.value = String(Math.round((pos / s.dur) * 1000));
  }
  function paintPanel() {
    const s = R.last; if (!s || $("remotePanel").hidden) return;
    $("rcNum").textContent = s.song ? `LIED ${s.song.id}` : "—";
    $("rcTitle").textContent = s.song ? s.song.title : "Noch kein Lied";
    $("rcSub").textContent = s.song ? (s.song.cat || "") : "";
    $("rcT2").textContent = fmt(s.dur);
    const pb = $("rcPlay"); pb.textContent = s.playing ? "❚❚" : "▶";
    const fav = s.song && (s.favs || []).includes(s.song.id);
    $("rcFav").textContent = fav ? "★" : "☆"; $("rcFav").classList.toggle("on", !!fav);
    $("rcShuf").classList.toggle("on", !!s.shuffle);
    document.querySelectorAll("#remotePanel .rc-vers .rc-chip").forEach((b) => b.classList.toggle("on", b.dataset.v === (s.cur || s.ver)));
    const stale = Date.now() - (s.ts || 0) > 20000;
    $("rcPeer").textContent = stale ? "Gerät antwortet nicht …" : "verbunden";
    $("rcPeer").classList.toggle("warn", stale);
    tickPos(); paintList(true);
  }
  function songRow(song, onTap, active) {
    const b = h("button", "rc-song" + (active ? " on" + ((R.last && R.last.playing) ? " playing" : "") : "")); b.type = "button";
    b.append(h("strong", "", song.id), h("span", "", song.title));
    b.onclick = onTap; return b;
  }
  function paintList(soft) {
    const box = $("rcList"); if (!box) return;
    const s = R.last || {};
    document.querySelectorAll("#remotePanel .rc-tab").forEach((b) => b.classList.toggle("on", b.dataset.k === R.listTab));
    const key = [R.listTab, R.plSel, R.q, s.song && s.song.id, !!s.playing, (s.pls || []).length, s.lw ? s.lw.week + s.lw.rows.length : ""].join("|");
    if (soft && box.dataset.k === key) return;
    box.dataset.k = key; box.replaceChildren();
    const cur = s.song && s.song.id;
    const q = R.q.trim().toLowerCase();
    const match = (song) => !q || song.title.toLowerCase().includes(q) || String(song.number).includes(q) || song.id.includes(q);
    if (R.listTab === "songs") {
      const row = h("div", "rc-actions");
      const a = h("button", "rc-chip", "▶ alle Lieder"); a.type = "button"; a.onclick = () => send("all", { shuffle: false });
      const z = h("button", "rc-chip", "🔀 alle zufällig"); z.type = "button"; z.onclick = () => send("all", { shuffle: true });
      row.append(a, z); box.append(row);
      state.songs.filter((x) => !x.extra && match(x)).forEach((song) => box.append(songRow(song, () => send("song", song.id), song.id === cur)));
    } else if (R.listTab === "ludwt") {
      const lw = s.lw;
      if (!lw || !lw.rows.length) { box.append(h("p", "rm-hint", "Für die aktuelle Woche gibt es auf dem anderen Gerät noch keine Lieder.")); return; }
      const fd = (d) => { const x = new Date(`${d}T00:00:00`); return `${x.getDate()}.${x.getMonth() + 1}.`; };
      box.append(h("p", "rm-hint", `Aktuelle Woche ${fd(lw.week)} – ${lw.to ? fd(lw.to) : ""}`));
      const row = h("div", "rc-actions");
      const a = h("button", "rc-chip", "▶ Woche starten"); a.type = "button"; a.onclick = () => send("ludwt", { week: lw.week, start: lw.rows[0].id });
      row.append(a); box.append(row);
      lw.rows.forEach((r) => {
        const song = state.songs.find((x) => x.id === r.id); if (!song) return;
        const b = songRow(song, () => send("ludwt", { week: lw.week, start: r.id }), r.id === cur);
        b.prepend(h("em", "rc-kind", `${r.k} ${r.p}`)); box.append(b);
      });
    } else if (!R.plSel) {
      const pls = s.pls || [];
      if (!pls.length) box.append(h("p", "rm-hint", "Auf dem anderen Gerät gibt es noch keine Wiedergabelisten."));
      pls.forEach((p) => { const b = h("button", "rc-song"); b.type = "button"; b.append(h("strong", "", "☰"), h("span", "", `${p.name} (${p.songs.length})`)); b.onclick = () => { R.plSel = p.id; paintList(); }; box.append(b); });
    } else {
      const p = (s.pls || []).find((x) => x.id === R.plSel);
      if (!p) { R.plSel = ""; return paintList(); }
      const row = h("div", "rc-actions");
      const back = h("button", "rc-chip", "‹ Listen"); back.type = "button"; back.onclick = () => { R.plSel = ""; paintList(); };
      const a = h("button", "rc-chip", "▶ Liste starten"); a.type = "button"; a.onclick = () => send("playlist", { id: p.id, shuffle: false });
      const z = h("button", "rc-chip", "🔀 zufällig"); z.type = "button"; z.onclick = () => send("playlist", { id: p.id, shuffle: true });
      row.append(back, a, z); box.append(row);
      p.songs.map((id) => state.songs.find((x) => x.id === id)).filter((x) => x && match(x)).forEach((song) => box.append(songRow(song, () => send("playlist", { id: p.id, shuffle: false, start: song.id }), song.id === cur)));
    }
  }

  /* ---------- Start ---------- */
  function init() {
    const btn = $("remoteBtn"), badge = $("remoteBadge");
    /* Sync-Button nur bei aktiver Lupe (oder solange eine Verbindung besteht) */
    const wrap = $("lyricSearchWrap");
    const vis = () => { if (btn && wrap) btn.hidden = wrap.hidden; };
    if (wrap) { new MutationObserver(vis).observe(wrap, { attributes: true, attributeFilter: ["hidden"] }); vis(); }
    if (btn) btn.addEventListener("click", () => showModal(R.role ? "choose" : "choose"));
    if (badge) badge.addEventListener("click", async () => {
      const ok = await uiConfirm({ eyebrow: "Sync", title: "Verbindung beenden?", lines: ["Bist du sicher, dass du die Verbindung beenden möchtest?"], ok: "Beenden" });
      if (ok) end(true);
    });
    setInterval(paintBadge, 1000);
    window.addEventListener("pagehide", () => { if (R.role === "player") { try { navigator.sendBeacon(`${BASE()}/remote/${R.code}/state`, new Blob([JSON.stringify({ phase: "closed", ts: Date.now() })], { type: "application/json" })); } catch { /* egal */ } } });
  }
  window.REMOTE = { R, send, end, post: postState };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
