// ═══════════════════════════════════════════════════════════
// กล้วยน้อย — app logic: state, screens, lessons, celebrations
// ═══════════════════════════════════════════════════════════

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const appEl = $('#app');

const STORAGE_KEY = 'gluaynoi-v1';
const MASTER_AT = 1;        // correct answers to master a word
const LEVEL2_WORDS = 80;    // mastered words to unlock sentences
const SPACK_PASS = 0.8;     // session score that marks a sentence pack passed
                            // Level 3 unlocks by passing every Level 2 pack

// ── word index: id = 'packId:en' ────────────────────────────
const WORDS_BY_ID = {};
WORD_PACKS.forEach((pack) => {
  pack.words.forEach((word) => {
    WORDS_BY_ID[`${pack.id}:${word.en}`] = { word, pack };
  });
});

// ── state: a root object holds many profiles ────────────────
// root = { rev, current: profileId, profiles: { id: profileState } }
// `state` always points at the active profile inside root.profiles.
function defaultState() {
  return {
    name: '',
    avatar: '🍌',               // profile icon
    lang: 'en',                 // learning 'en' (Thai speaker) or 'th' (farang)
    words: {},                  // id -> {c, w}
    spacks: {},                 // sentence packId -> true once passed (≥80%)
    streak: { count: 0, last: '' },
    unlockAll: false,           // tester mode: every pack open
  };
}

const AVATARS = ['🍌', '🐱', '🐶', '🐘', '🦄', '🐼', '🐸', '🦊', '🐰', '🐯', '🌸', '⭐'];

function defaultRoot() {
  return { rev: 0, current: null, profiles: {} };
}

// accepts either the multi-profile root shape or the legacy
// single-profile shape (pre-profiles installs) and returns a root
function toRoot(parsed) {
  if (parsed && parsed.profiles) return Object.assign(defaultRoot(), parsed);
  const prof = Object.assign(defaultState(), parsed);
  return { rev: (parsed && parsed.rev) || 0, current: 'p1', profiles: { p1: prof } };
}

function loadRoot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return toRoot(JSON.parse(raw));
  } catch (e) { /* corrupted storage — start fresh */ }
  return defaultRoot();
}

let root = loadRoot();
let state = (root.current && root.profiles[root.current]) || defaultState();

// ── durable storage: double-write to IndexedDB ──────────────
// iOS standalone web apps can fail to flush localStorage to disk before a
// force-quit kills the process; IndexedDB commits transactionally and
// survives. Write both, recover from whichever has the highest rev.
function idbOpen() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    try {
      const req = indexedDB.open('gluaynoi-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}
const idbReady = idbOpen();

async function idbSet(json) {
  const db = await idbReady;
  if (!db) return;
  try { db.transaction('kv', 'readwrite').objectStore('kv').put(json, 'state'); } catch (e) {}
}

async function idbGet() {
  const db = await idbReady;
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction('kv', 'readonly').objectStore('kv').get('state');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}

const save = () => {
  root.rev = (root.rev || 0) + 1;
  const json = JSON.stringify(root);
  try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}
  idbSet(json);
};

function selectProfile(id) {
  root.current = id;
  state = root.profiles[id];
  save();
}

function createProfile(name, avatar, lang) {
  const id = 'p' + Date.now();
  root.profiles[id] = Object.assign(defaultState(), {
    name, avatar: avatar || '🍌', lang: lang === 'th' ? 'th' : 'en',
  });
  selectProfile(id);
}

// ── helpers ─────────────────────────────────────────────────
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sample = (arr, n) => shuffle(arr).slice(0, n);
// strip "(1)"-style hints so answer choices can't be matched to the question
const noParen = (s) => s.replace(/\s*\([^)]*\)/g, '');
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const dstr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => dstr(new Date());
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };

const wstat = (id) => state.words[id] || { c: 0, w: 0 };
const isMastered = (id) => wstat(id).c >= MASTER_AT;
const masteredIn = (pack) => pack.words.filter((w) => isMastered(`${pack.id}:${w.en}`)).length;
const masteredTotal = () =>
  Object.keys(state.words).filter((id) => WORDS_BY_ID[id] && isMastered(id)).length;
const masteredOf = (profile) =>
  Object.keys(profile.words || {}).filter((id) => WORDS_BY_ID[id] && (profile.words[id].c || 0) >= MASTER_AT).length;
const packDone = (pack) => masteredIn(pack) === pack.words.length;
// older profiles predate `spacks` — guard the access
const spackPassed = (id) => !!(state.spacks && state.spacks[id]);

// ── learning direction ──────────────────────────────────────
// 'en': a Thai speaker learning English (the original mode)
// 'th': an English speaker (farang) learning Thai — same content reversed,
//       Thai always accompanied by romanization since they don't read script
const learningThai = () => state.lang === 'th';
// bilingual UI text: learner's own language big, the other small underneath
const bi = (th, en) => learningThai()
  ? `${en}<span class="en-line">${th}</span>`
  : `${th}<span class="en-line">${en}</span>`;
// tone-marked romanization of an exact Thai string (data/romanize.js)
const rom = (th) => (typeof TH_ROM !== 'undefined' && TH_ROM[th]) || '';
const cleanTh = (th) => noParen(th).split('/')[0].trim();
// the language being learned, spoken aloud
const sayTarget = (en, th) => (learningThai() ? Speech.sayThai(cleanTh(th)) : Speech.say(en));

function streakCurrent() {
  const { count, last } = state.streak;
  if (!count) return 0;
  return (last === todayStr() || last === yesterdayStr()) ? count : 0;
}

function packUnlocked(list, index, isSentence) {
  if (state.unlockAll) return true; // tester mode
  if (isSentence) return true;      // sentence packs all open once Level 2 is
  if (index === 0) return true;
  return packDone(list[index - 1]); // master every word of the previous pack
}

// ── confetti & toast ────────────────────────────────────────
const CONFETTI_COLORS = ['#FFAFC5', '#A8E6C9', '#AED9FF', '#FFE29A', '#D9CBFF', '#F87DA0'];

function confetti(n = 90) {
  const layer = $('#confetti-layer');
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = pick(CONFETTI_COLORS);
    p.style.width = p.style.height = 7 + Math.random() * 8 + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
    p.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
    p.style.animationDelay = Math.random() * 0.6 + 's';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

function toast(emoji, thMsg, enMsg) {
  const layer = $('#toast-layer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="t-emoji">${emoji}</span><span>${bi(thMsg, enMsg)}</span>`;
  layer.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── mascot speech lines ─────────────────────────────────────
function greeting() {
  const name = esc(state.name);
  if (state.streak.last !== todayStr()) {
    return {
      mood: 'sleep',
      th: `Zzz… ${name} มาปลุกกล้วยน้อยด้วยการเรียนกันเถอะ!`,
      en: "Zzz… wake me up — let's learn!",
    };
  }
  return {
    mood: 'happy',
    ...pick([
      { th: `สู้ๆ นะ ${name}! วันนี้เรียนต่ออีกนิดนะ`, en: 'Keep going! A little more today!' },
      { th: `${name} เก่งมากเลย เรียนต่อกันเถอะ!`, en: "You're doing great — let's continue!" },
      { th: `กล้วยน้อยเชื่อใน ${name} นะ!`, en: 'Little Banana believes in you!' },
    ]),
  };
}

// ═════════════════════════════════════════════════════════════
// SCREEN: profile picker + welcome (create profile)
// ═════════════════════════════════════════════════════════════
function renderProfiles() {
  session = null;
  const ids = Object.keys(root.profiles);
  appEl.innerHTML = `
  <div class="screen welcome-wrap">
    <div>${mascotSVG({ mood: 'happy', size: 140 })}</div>
    <h1 class="app-title">ใครกำลังเรียนจ๊ะ?
      <span class="en-line">Who's learning?</span>
    </h1>
    <div class="profile-list">
      ${ids.map((id) => {
        const p = root.profiles[id];
        const farang = p.lang === 'th';
        return `
        <button class="profile-card" data-id="${id}">
          <span class="p-avatar">${esc(p.avatar || '🍌')}</span>
          <span class="p-name">${esc(p.name)} <span class="p-lang">${farang ? '🇹🇭' : '🇬🇧'}</span></span>
          <span class="pack-count">${farang ? `knows ${masteredOf(p)} words` : `จำได้ ${masteredOf(p)} คำ`}</span>
        </button>`;
      }).join('')}
      <button class="profile-card new-profile" id="new-profile-btn">
        <span class="p-avatar">➕</span>
        <span class="p-name">โปรไฟล์ใหม่</span>
        <span class="en-line">New profile</span>
      </button>
    </div>
  </div>`;

  $$('.profile-card[data-id]').forEach((card) => {
    card.addEventListener('click', () => {
      Sfx.pop();
      selectProfile(card.dataset.id);
      renderHome();
    });
  });
  $('#new-profile-btn').addEventListener('click', () => { Sfx.pop(); renderWelcome(); });
}

function renderWelcome() {
  session = null;
  const hasProfiles = Object.keys(root.profiles).length > 0;
  appEl.innerHTML = `
  <div class="screen welcome-wrap">
    <div>${mascotSVG({ mood: 'happy', size: 170 })}</div>
    <h1 class="app-title">กล้วยน้อย
      <span class="en-line">Little Banana · Learn English or Thai</span>
    </h1>
    <div class="welcome-card">
      <div class="hello-q">สวัสดีจ้า! เราชื่อ “กล้วยน้อย” 🍌<br>เธอชื่ออะไรจ๊ะ?
        <span class="en-line">Hi! I'm Little Banana. What's your name?</span>
      </div>
      <input class="name-input" id="name-input" maxlength="20"
        placeholder="ชื่อเล่น · nickname" autocomplete="off" />
      <div class="hello-q" style="font-size:1rem">อยากเรียนภาษาอะไร?
        <span class="en-line">What do you want to learn?</span>
      </div>
      <div class="lang-choice">
        <button class="lang-btn selected" data-lang="en">🇬🇧 ภาษาอังกฤษ<span class="en-line">English (I speak Thai)</span></button>
        <button class="lang-btn" data-lang="th">🇹🇭 Thai<span class="en-line">ภาษาไทย (I speak English)</span></button>
      </div>
      <div class="hello-q" style="font-size:1rem">เลือกไอคอนของเธอ
        <span class="en-line">Pick your icon</span>
      </div>
      <div class="avatar-grid">
        ${AVATARS.map((a) => `
        <button class="avatar-btn ${a === '🍌' ? 'selected' : ''}" data-avatar="${a}">${a}</button>`).join('')}
      </div>
      <button class="btn btn-big" id="start-btn">เริ่มเรียนกันเลย! 🌸
        <span class="en-line">Let's start learning!</span>
      </button>
      ${hasProfiles ? `
      <button class="btn btn-ghost" id="back-profiles">← กลับไปเลือกโปรไฟล์
        <span class="en-line">Back to profiles</span>
      </button>` : ''}
    </div>
  </div>`;

  const input = $('#name-input');
  let chosenAvatar = '🍌';
  let chosenLang = 'en';
  $$('.avatar-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sfx.pop();
      chosenAvatar = btn.dataset.avatar;
      $$('.avatar-btn').forEach((b) => b.classList.toggle('selected', b === btn));
    });
  });
  $$('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Sfx.pop();
      chosenLang = btn.dataset.lang;
      $$('.lang-btn').forEach((b) => b.classList.toggle('selected', b === btn));
    });
  });
  const start = () => {
    const name = input.value.trim();
    if (!name) { input.focus(); input.placeholder = 'บอกชื่อกล้วยน้อยหน่อยนะ 🥺'; return; }
    createProfile(name, chosenAvatar, chosenLang);
    Sfx.fanfare();
    confetti(60);
    renderHome();
  };
  $('#start-btn').addEventListener('click', start);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  $('#back-profiles')?.addEventListener('click', renderProfiles);
}

// ═════════════════════════════════════════════════════════════
// SCREEN: home
// ═════════════════════════════════════════════════════════════
function packCardHTML(pack, list, index, isSentence) {
  const unlocked = packUnlocked(list, index, isSentence);
  const done = isSentence ? spackPassed(pack.id) : packDone(pack);
  let countHTML = '';
  const farang = learningThai();
  const wordUnit = farang ? 'words' : 'คำ';
  if (!isSentence) {
    const m = masteredIn(pack);
    countHTML = `<span class="pack-count">${done ? `✓ ${pack.words.length}/${pack.words.length} ${wordUnit}` : `${m}/${pack.words.length} ${wordUnit}`}</span>`;
  } else {
    countHTML = `<span class="pack-count">${done ? '✓ ' : ''}${pack.sentences.length} ${farang ? 'sentences' : 'ประโยค'}</span>`;
  }
  return `
  <div class="pack-card ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}"
       data-pack="${pack.id}" data-kind="${isSentence ? 'sentence' : 'word'}" data-locked="${unlocked ? '' : '1'}">
    ${unlocked ? '' : '<span class="lock-corner">🔒</span>'}
    <span class="pack-ico">${pack.icon}</span>
    <span class="pack-th">${farang ? pack.en : pack.th}</span>
    <span class="pack-en">${farang ? pack.th : pack.en}</span>
    ${countHTML}
  </div>`;
}

function renderHome() {
  session = null;
  maybeApplyUpdate();
  const g = greeting();
  const mw = masteredTotal();
  const streak = streakCurrent();
  const l1done = WORD_PACKS.filter(packDone).length;
  const l2open = state.unlockAll || mw >= LEVEL2_WORDS;
  const l2passed = SENTENCE_PACKS.filter((p) => spackPassed(p.id)).length;
  const l3open = state.unlockAll || l2passed === SENTENCE_PACKS.length;

  appEl.innerHTML = `
  <div class="screen">
    <div class="topbar">
      <button class="icon-btn back-btn" id="profile-btn" aria-label="เปลี่ยนโปรไฟล์ switch profile">←</button>
      <div class="brand">${esc(state.avatar || '🍌')} ${esc(state.name)}</div>
      <div class="stat-chips">
        <div class="chip chip-fire ${streak > 0 ? 'lit' : ''}" title="เรียนติดต่อกัน streak">
          🔥 ${streak} <span class="chip-sub">${learningThai() ? 'days<br>วัน' : 'วัน<br>days'}</span>
        </div>
        <button class="icon-btn" id="unlock-btn" aria-label="ปลดล็อคทุกแพ็ค unlock all">${state.unlockAll ? '🔓' : '🔐'}</button>
        <button class="icon-btn" id="settings-btn" aria-label="ตั้งค่า settings">⚙️</button>
      </div>
    </div>

    <div class="mascot-card">
      <div class="mascot-holder">${mascotSVG({ mood: g.mood, size: 130 })}</div>
      <div class="speech-bubble">${bi(g.th, g.en)}</div>
    </div>

    <div class="level-head level-1">
      <div class="level-badge">1</div>
      <h2>${bi('คำศัพท์', 'Words')}</h2>
      <span class="lvl-progress">${l1done}/${WORD_PACKS.length} ${learningThai() ? 'packs' : 'แพ็ค'}</span>
    </div>
    <div class="pack-grid">
      ${WORD_PACKS.map((p, i) => packCardHTML(p, WORD_PACKS, i, false)).join('')}
    </div>

    <div class="level-head level-2">
      <div class="level-badge">2</div>
      <h2>${bi('ประโยคสั้นๆ', 'Tiny sentences')}</h2>
    </div>
    ${l2open ? `
    <div class="pack-grid">
      ${SENTENCE_PACKS.map((p, i) => packCardHTML(p, SENTENCE_PACKS, i, true)).join('')}
    </div>` : `
    <div class="level-locked-note">
      <span class="big-ico">🔒</span>
      <span>${bi(
        `เรียนรู้คำศัพท์อีก <b>${LEVEL2_WORDS - mw}</b> คำเพื่อปลดล็อคระดับ 2 (ตอนนี้จำได้ ${mw} คำ)`,
        `Learn <b>${LEVEL2_WORDS - mw}</b> more words to unlock Level 2 (you know ${mw})`)}
      </span>
    </div>`}

    <div class="level-head level-3">
      <div class="level-badge">3</div>
      <h2>${bi('ประโยคที่ยาวขึ้น', 'Longer sentences')}</h2>
    </div>
    ${l3open ? `
    <div class="pack-grid">
      ${SENTENCE_PACKS_L3.map((p, i) => packCardHTML(p, SENTENCE_PACKS_L3, i, true)).join('')}
    </div>` : `
    <div class="level-locked-note">
      <span class="big-ico">🔒</span>
      <span>${bi(
        `ทำแพ็คระดับ 2 ให้ผ่านอีก <b>${SENTENCE_PACKS.length - l2passed}</b> แพ็คเพื่อปลดล็อคระดับ 3 (ผ่านแล้ว ${l2passed}/${SENTENCE_PACKS.length})`,
        `Pass <b>${SENTENCE_PACKS.length - l2passed}</b> more Level 2 packs to unlock Level 3 (${l2passed}/${SENTENCE_PACKS.length} passed)`)}
      </span>
    </div>`}

    <div class="version-tag" id="version-tag">เวอร์ชัน · version ${currentVersion()}</div>
  </div>`;

  $('#settings-btn').addEventListener('click', openSettings);
  $('#profile-btn').addEventListener('click', () => { Sfx.pop(); renderProfiles(); });
  // poke the banana → it jumps, startled, then calms down again
  const holder = $('.mascot-holder');
  holder.addEventListener('click', () => {
    if (holder.classList.contains('poked')) return;
    Sfx.boing();
    holder.classList.add('poked');
    holder.innerHTML = mascotSVG({ mood: 'surprised', size: 130 });
    setTimeout(() => {
      holder.classList.remove('poked');
      holder.innerHTML = mascotSVG({ mood: g.mood, size: 130 });
    }, 1000);
  });
  refreshVersionTag();
  $('#unlock-btn').addEventListener('click', () => {
    if (state.unlockAll) {
      if (confirm('ล็อคแพ็คกลับเหมือนเดิม?\nLock packs again?')) {
        state.unlockAll = false;
        save();
        renderHome();
      }
      return;
    }
    const pw = prompt('รหัสผ่าน · Password:');
    if (pw === 'johnny1234') {
      state.unlockAll = true;
      save();
      Sfx.unlock();
      toast('🔓', 'ปลดล็อคทุกแพ็คแล้ว!', 'All packs unlocked!');
      renderHome();
    } else if (pw !== null) {
      toast('❌', 'รหัสผ่านไม่ถูกต้อง', 'Wrong password');
    }
  });
  $$('.pack-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.locked) {
        toast('🔒', 'เรียนแพ็คก่อนหน้าให้ครบทุกคำก่อนนะ', 'Learn all words in the previous pack first');
        return;
      }
      Sfx.pop();
      if (card.dataset.kind === 'sentence') {
        startSentenceLesson([...SENTENCE_PACKS, ...SENTENCE_PACKS_L3].find((p) => p.id === card.dataset.pack));
      } else {
        startWordLesson(WORD_PACKS.find((p) => p.id === card.dataset.pack));
      }
    });
  });
}

// ── speaking questions: generous transcript matching ────────
// a beginner with a Thai accent gets the benefit of the doubt: strip
// punctuation, allow a little fuzz, accept the target anywhere in the
// transcript (recognizers pad with extra words)
const normSpeech = (s) =>
  s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

function editDistance(a, b) {
  if (a === b) return 0;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function speechWordOk(cands, target) {
  const t = normSpeech(noParen(target));
  const tol = t.length >= 6 ? 2 : t.length >= 4 ? 1 : 0;
  return (cands || []).some((raw) => {
    const c = normSpeech(raw);
    if (!c) return false;
    if (c === t || c.includes(t) || editDistance(c, t) <= tol) return true;
    return c.split(' ').some((w) => editDistance(w, t) <= tol);
  });
}

function speechSentenceOk(cands, target) {
  const tw = normSpeech(target).split(' ');
  return (cands || []).some((raw) => {
    const cw = normSpeech(raw).split(' ');
    const hit = tw.filter((w) =>
      cw.some((c) => c === w || editDistance(c, w) <= (w.length >= 5 ? 1 : 0))
    ).length;
    return hit / tw.length >= 0.7;
  });
}

// ═════════════════════════════════════════════════════════════
// LESSONS — building question lists
// ═════════════════════════════════════════════════════════════
let session = null;

// every session gets at least one speaking question, however the dice fell
function ensureSpeak(questions) {
  const has = questions.some((q) => (q.kind === 'word' ? q.type : q.dir) === 'speak');
  if (!has && questions.length) {
    const q = pick(questions);
    if (q.kind === 'word') q.type = 'speak';
    else q.dir = 'speak';
  }
  return questions;
}

function questionForWord(word, pack) {
  const id = `${pack.id}:${word.en}`;
  // even mix from the first encounter. target2native = read the learning
  // language, pick your own; native2target = the reverse; listen = hear the
  // learning language only. Speaking joins the mix for English learners;
  // Thai learners skip it (owner decision: speaking tonal Thai is too hard).
  const r = Math.random();
  const type = learningThai()
    ? (r < 1 / 3 ? 'listen' : r < 2 / 3 ? 'target2native' : 'native2target')
    : (r < 0.25 ? 'speak' : r < 0.5 ? 'listen' : r < 0.75 ? 'target2native' : 'native2target');
  const others = sample(pack.words.filter((w) => w.en !== word.en), 3);
  return { kind: 'word', type, word, pack, id, choices: shuffle([word, ...others]) };
}

function startWordLesson(pack) {
  // the session covers every word not yet mastered; quitting keeps progress,
  // and a fully-mastered pack replays all of its words
  const unmastered = pack.words.filter((w) => !isMastered(`${pack.id}:${w.en}`));
  const words = unmastered.length ? unmastered : pack.words;
  const questions = shuffle(words).map((w) => questionForWord(w, pack));
  session = {
    mode: 'words', pack,
    questions: learningThai() ? questions : ensureSpeak(questions),
    index: 0, correct: 0, masteredBefore: masteredIn(pack),
  };
  renderQuestion();
}

function startSentenceLesson(pack) {
  // dir names are literal: en2th = build the Thai, th2en = build the English.
  // English learners also get speaking questions; Thai learners don't.
  const questions = shuffle(pack.sentences).map((s) => {
    const r = Math.random();
    const dir = learningThai()
      ? (s.thTiles && r < 0.5 ? 'en2th' : 'th2en')
      : (r < 0.25 ? 'speak' : (s.thTiles && r < 0.625) ? 'en2th' : 'th2en');
    return { kind: 'sentence', sentence: s, pack, dir };
  });
  session = {
    mode: 'sentences', pack,
    questions: learningThai() ? questions : ensureSpeak(questions),
    index: 0, correct: 0,
  };
  renderQuestion();
}

// ═════════════════════════════════════════════════════════════
// SCREEN: question
// ═════════════════════════════════════════════════════════════
function lessonChrome(innerHTML) {
  const pct = (session.index / session.questions.length) * 100;
  appEl.innerHTML = `
  <div class="screen">
    <div class="lesson-top">
      <button class="icon-btn" id="quit-btn" aria-label="ออก quit">✕</button>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="chip chip-score" title="ตอบถูก correct">✓ ${session.correct}</div>
      <div class="chip">${session.index + 1}/${session.questions.length}</div>
    </div>
    ${innerHTML}
  </div>
  <div class="feedback-bar" id="feedback-bar"></div>`;
  $('#quit-btn').addEventListener('click', () => { speechSynthesis.cancel?.(); Recog.stop(); renderHome(); });
  // animate progress to current position
  requestAnimationFrame(() => {
    $('.progress-fill').style.width = (session.index / session.questions.length) * 100 + '%';
  });
}

function renderQuestion() {
  const q = session.questions[session.index];
  if ((q.kind === 'word' ? q.type : q.dir) === 'speak') return renderSpeakQuestion(q);
  if (q.kind === 'sentence') return renderSentenceQuestion(q);

  const { type, word } = q;
  const farang = learningThai();

  // the word in the learning language, big, with its pronunciation help —
  // English + Thai-script pron for her; Thai + romanization for a farang
  const targetHTML = farang
    ? `<div class="q-word-th">${esc(noParen(word.th))}</div>
       <div><span class="q-pron">🗣️ ${esc(noParen(rom(word.th)) || '')}</span></div>`
    : `<div class="q-word-en">${esc(word.en)}</div>
       <div><span class="q-pron">🗣️ ${word.pron}</span></div>`;

  // answer buttons: never a picture next to choices in the learner's own
  // language (it would leak the meaning without reading the target language)
  const nativeChoice = (c) => (farang
    ? `<span class="c-en">${esc(c.en)}</span>`
    : esc(noParen(c.th)));
  const targetChoice = (c) => (farang
    ? `<span class="c-rom">${esc(noParen(rom(c.th) || c.th))}</span><span class="c-th">${esc(noParen(c.th))}</span>`
    : `<span class="c-en">${esc(c.en)}</span>`);

  if (type === 'listen') {
    // audio only — no text, no pron/rom hint, no emoji (all would leak the
    // answer). A helper button reveals the written word when stuck.
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">${bi('ฟังแล้วเลือกคำแปล', 'Listen and choose')}</div>
        <div><button class="speak-btn big" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button></div>
        <div id="listen-reveal">
          <button class="reveal-btn" id="reveal-btn">👀 ${bi('ขอดูคำศัพท์หน่อย', 'Show me the word')}</button>
        </div>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}">${nativeChoice(c)}</button>`).join('')}
      </div>`);
    sayTarget(word.en, word.th);
    $('#reveal-btn').addEventListener('click', () => {
      Sfx.pop();
      $('#listen-reveal').innerHTML = targetHTML;
    });
  } else if (type === 'target2native') {
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">${bi('คำนี้แปลว่าอะไร?', 'What does this mean?')}</div>
        ${targetHTML}
        <button class="speak-btn" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}">${nativeChoice(c)}</button>`).join('')}
      </div>`);
    sayTarget(word.en, word.th);
  } else {
    // native2target: your own language + the picture, produce the other one
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">${farang
          ? `How do you say it in Thai?<span class="en-line">พูดเป็นภาษาไทยว่าอย่างไร?</span>`
          : `ภาษาอังกฤษพูดว่าอย่างไร?<span class="en-line">How do you say it in English?</span>`}</div>
        <span class="q-emoji">${word.emoji}</span>
        ${farang
          ? `<div class="q-word-en" style="font-size:1.8rem">${esc(word.en)}</div>`
          : `<div class="q-word-th">${esc(word.th)}</div>`}
        <div><button class="speak-btn" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button></div>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}">${targetChoice(c)}</button>`).join('')}
      </div>`);
    if (farang) Speech.say(word.en); else Speech.sayThai(cleanTh(word.th));
  }

  // the replay button repeats whatever the question said first
  const speaksNative = type === 'native2target';
  const speakQuestion = () => {
    if (speaksNative) { if (farang) Speech.say(word.en); else Speech.sayThai(cleanTh(word.th)); }
    else sayTarget(word.en, word.th);
  };
  $('#speak-btn')?.addEventListener('click', speakQuestion);
  $$('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = q.choices[Number(btn.dataset.i)];
      const correct = chosen.en === word.en;
      $$('.choice-btn').forEach((b) => {
        b.disabled = true;
        const cw = q.choices[Number(b.dataset.i)];
        if (cw.en === word.en) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
        else b.classList.add('faded');
      });
      answerWord(q, correct);
    });
  });
}

function renderSentenceQuestion(q) {
  const s = q.sentence;
  const en2th = q.dir === 'en2th';
  const farang = learningThai();
  const tiles = en2th
    ? shuffle([...s.thTiles, ...s.thExtra])
    : shuffle([...s.en.split(' '), ...s.extra]);
  q.answer = [];
  q.tiles = tiles;
  const speakPrompt = en2th
    ? () => Speech.say(s.en)
    : () => Speech.sayThai(s.th);

  // farang learners can't read Thai script: Thai tiles carry their
  // romanization on top, and a Thai prompt gets a romanized line under it
  const tileHTML = (t) => (en2th && farang
    ? `<span class="t-rom">${esc(rom(t) || t)}</span><span class="t-th">${esc(t)}</span>`
    : esc(t));
  const promptRomHTML = (!en2th && farang && s.thTiles)
    ? `<div class="q-rom">${esc(s.thTiles.map((t) => rom(t) || t).join(' '))}</div>`
    : '';

  lessonChrome(`
    <div class="q-card">
      <div class="q-prompt">${en2th
        ? bi('เรียงคำเป็นภาษาไทย', 'Build it in Thai')
        : bi('เรียงคำเป็นประโยคภาษาอังกฤษ', 'Build it in English')}</div>
      ${en2th
        ? `<div class="q-word-en" style="font-size:1.6rem">${esc(s.en)}</div>`
        : `<div class="q-word-th" style="font-size:1.4rem">${esc(s.th)}</div>${promptRomHTML}`}
      <div><button class="speak-btn" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button></div>
    </div>
    <div class="tile-answer" id="tile-answer"></div>
    <div class="tile-bank" id="tile-bank">
      ${tiles.map((t, i) => `<button class="tile ${en2th ? 'th-tile' : ''} ${en2th && farang ? 'rom-tile' : ''}" data-i="${i}">${tileHTML(t)}</button>`).join('')}
    </div>
    <div style="margin-top:22px">
      <button class="btn btn-mint btn-big" id="check-btn" disabled>${bi('ตรวจคำตอบ ✓', 'Check ✓')}</button>
    </div>`);

  speakPrompt();
  $('#speak-btn').addEventListener('click', speakPrompt);

  const answerEl = $('#tile-answer');
  const checkBtn = $('#check-btn');

  const sync = () => { checkBtn.disabled = q.answer.length === 0; };

  $$('#tile-bank .tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('ghost-slot')) return;
      Sfx.pop();
      const i = Number(tile.dataset.i);
      q.answer.push(i);
      tile.classList.add('ghost-slot');
      const t = document.createElement('button');
      t.className = `tile in-answer ${en2th ? 'th-tile' : ''} ${en2th && farang ? 'rom-tile' : ''}`;
      t.innerHTML = tileHTML(q.tiles[i]);
      t.dataset.i = i;
      t.addEventListener('click', () => {
        Sfx.pop();
        q.answer = q.answer.filter((x) => x !== i);
        t.remove();
        $(`#tile-bank .tile[data-i="${i}"]`).classList.remove('ghost-slot');
        sync();
      });
      answerEl.appendChild(t);
      sync();
    });
  });

  checkBtn.addEventListener('click', () => {
    // Thai tiles join without spaces; English tiles join with them
    const built = q.answer.map((i) => q.tiles[i]).join(en2th ? '' : ' ');
    const target = en2th ? s.th.replace(/\s+/g, '') : s.en;
    const correct = built.toLowerCase() === target.toLowerCase();
    checkBtn.disabled = true;
    $$('.tile').forEach((b) => { b.disabled = true; });
    sayTarget(s.en, s.th);
    answerSentence(q, correct);
  });
}

// ═════════════════════════════════════════════════════════════
// SCREEN: speaking question (words and sentences share it)
// ═════════════════════════════════════════════════════════════
function renderSpeakQuestion(q) {
  const isWord = q.kind === 'word';
  const target = isWord ? q.word.en : q.sentence.en;
  const th = isWord ? q.word.th : q.sentence.th;
  let tries = 0;
  let answered = false;

  lessonChrome(`
    <div class="q-card">
      <div class="q-prompt">พูดเป็นภาษาอังกฤษ 🎤 · Say it in English</div>
      ${isWord ? `<span class="q-emoji">${q.word.emoji}</span>` : ''}
      <div class="q-word-th" ${isWord ? '' : 'style="font-size:1.4rem"'}>${esc(th)}</div>
      <div><button class="speak-btn" id="speak-btn" aria-label="ฟังโจทย์ hear the prompt">🔊</button></div>
      <div id="speak-reveal">
        <button class="reveal-btn" id="reveal-btn">👀 ขอคำใบ้ · Help me say it</button>
      </div>
    </div>
    <div class="mic-zone" id="mic-zone"></div>`);

  Speech.sayThai(noParen(th).split('/')[0].trim());
  $('#speak-btn').addEventListener('click', () =>
    Speech.sayThai(noParen(th).split('/')[0].trim()));

  // the hint shows AND says the English — turning the question into
  // "repeat after me", which is still real speaking practice
  $('#reveal-btn').addEventListener('click', () => {
    Sfx.pop();
    $('#speak-reveal').innerHTML =
      `<div class="q-word-en" style="font-size:1.5rem">${esc(target)}</div>` +
      (isWord ? `<div><span class="q-pron">🗣️ ${q.word.pron}</span></div>` : '');
    Speech.say(target);
  });

  const answer = (ok) => {
    if (answered) return;
    answered = true;
    Recog.stop();
    if (isWord) answerWord(q, ok);
    else { Speech.say(q.sentence.en); answerSentence(q, ok); }
  };

  // no recognition (e.g. iOS home-screen app): say it out loud, self-grade
  const renderSelfJudge = () => {
    $('#mic-zone').innerHTML = `
      <div class="mic-hint">พูดออกเสียงดังๆ แล้วตอบตามตรงนะ
        <span class="en-line">Say it out loud — answer honestly!</span></div>
      <div class="self-judge">
        <button class="btn btn-mint" id="said-ok">พูดได้แล้ว ✓<span class="en-line">I said it!</span></button>
        <button class="btn" id="said-no">ยังไม่ได้ 💪<span class="en-line">Not yet</span></button>
      </div>`;
    $('#said-ok').addEventListener('click', () => answer(true));
    $('#said-no').addEventListener('click', () => answer(false));
  };

  if (!Recog.available) return renderSelfJudge();

  $('#mic-zone').innerHTML = `
    <button class="mic-btn" id="mic-btn" aria-label="พูด speak">🎤</button>
    <div class="mic-hint" id="mic-hint">แตะไมค์แล้วพูดเลย
      <span class="en-line">Tap the mic and speak</span></div>
    <div class="mic-out" id="mic-out"></div>`;

  $('#mic-btn').addEventListener('click', async () => {
    if (answered || Recog.active) return;
    const btn = $('#mic-btn');
    const hint = $('#mic-hint');
    const out = $('#mic-out');
    btn.classList.add('listening');
    hint.innerHTML = 'กำลังฟัง...<span class="en-line">Listening…</span>';
    const cands = await Recog.listen({ onInterim: (t) => { out.textContent = t; } });
    btn.classList.remove('listening');
    if (answered) return;
    if (cands === null) {
      // mic denied or recognition broken — degrade to self-grading
      toast('🎤', 'ใช้ไมค์ไม่ได้ ไม่เป็นไรนะ', "Mic not available — that's okay");
      return renderSelfJudge();
    }
    if (!cands.length) {
      hint.innerHTML = 'ไม่ได้ยินเลย ลองพูดอีกครั้งนะ<span class="en-line">I didn’t hear you — try again</span>';
      return;
    }
    out.textContent = `“${cands[0]}”`;
    const ok = isWord ? speechWordOk(cands, target) : speechSentenceOk(cands, target);
    if (ok) return answer(true);
    tries += 1;
    if (tries >= 2) return answer(false);
    hint.innerHTML = 'เกือบแล้ว! ลองพูดอีกครั้ง 💪<span class="en-line">Almost — try once more</span>';
  });
}

// ── answering ───────────────────────────────────────────────
function answerWord(q, correct) {
  const stat = state.words[q.id] || (state.words[q.id] = { c: 0, w: 0 });
  if (correct) {
    session.correct += 1;
    stat.c += 1;
    Sfx.correct();
  } else {
    stat.w += 1;
    Sfx.wrong();
  }
  save();
  // repeat the word in the learning language, unless it was just the prompt
  if (q.type !== 'target2native') sayTarget(q.word.en, q.word.th);
  showFeedback(correct, q.word);
}

function answerSentence(q, correct) {
  if (correct) { session.correct += 1; Sfx.correct(); }
  else Sfx.wrong();
  save();
  showFeedback(correct, {
    en: q.sentence.en, th: q.sentence.th, pron: '',
    rom: (q.sentence.thTiles || []).map((t) => rom(t) || t).join(' '),
  });
}

const PRAISE = [
  ['ถูกต้อง! เก่งมาก', 'Correct! Great job'],
  ['ใช่เลย! สุดยอด', 'Yes! Awesome'],
  ['เยี่ยมมาก!', 'Excellent!'],
  ['เก่งจังเลย!', 'So smart!'],
];
const CHEER_UP = [
  ['ไม่เป็นไรนะ ลองจำไว้', "It's okay — let's remember it"],
  ['เกือบแล้ว! สู้ๆ', 'Almost! Keep going'],
  ['ไม่เป็นไร เดี๋ยวมาทบทวนกัน', "No worries — we'll review it"],
];

function showFeedback(correct, item) {
  const bar = $('#feedback-bar');
  const [thMsg, enMsg] = correct ? pick(PRAISE) : pick(CHEER_UP);
  // pronunciation help matches the learner: Thai-script pron of the English
  // for her, romanization of the Thai for a farang
  const hint = learningThai() ? (item.rom || rom(item.th)) : item.pron;
  const answerLine = `<div class="fb-answer"><span class="fb-en">${esc(item.en)}</span> = ${esc(item.th)}${hint ? ` · 🗣️ ${esc(noParen(hint))}` : ''}</div>`;
  if (!correct) $('.q-card')?.classList.add('q-wrong');
  bar.className = `feedback-bar ${correct ? 'good' : 'bad'}`;
  bar.innerHTML = `
    <div class="feedback-inner">
      <div class="feedback-mascot">${mascotSVG({ mood: correct ? 'cheer' : 'oops', size: 62 })}</div>
      <div class="feedback-msg">${correct ? '💚' : '💪'} ${bi(thMsg, enMsg)}${answerLine}</div>
      <button class="icon-btn" id="fb-speak" aria-label="ฟังอีกครั้ง listen again">🔊</button>
      <button class="btn ${correct ? 'btn-mint' : ''}" id="next-btn">${bi('ต่อไป', 'Next')}</button>
    </div>`;
  requestAnimationFrame(() => bar.classList.add('show'));
  $('#fb-speak').addEventListener('click', () => sayTarget(item.en, item.th));
  $('.progress-fill').style.width = ((session.index + 1) / session.questions.length) * 100 + '%';
  const scoreChip = $('.chip-score');
  if (scoreChip) scoreChip.textContent = `✓ ${session.correct}`;
  $('#next-btn').addEventListener('click', () => {
    bar.classList.remove('show');
    session.index += 1;
    if (session.index >= session.questions.length) renderResults();
    else renderQuestion();
  });
}

// ═════════════════════════════════════════════════════════════
// SCREEN: results
// ═════════════════════════════════════════════════════════════
function markStreak() {
  const t = todayStr();
  if (state.streak.last === t) return;
  state.streak.count = state.streak.last === yesterdayStr() ? state.streak.count + 1 : 1;
  state.streak.last = t;
}

function renderResults() {
  const total = session.questions.length;
  const pct = session.correct / total;
  const passed = pct >= SPACK_PASS;
  const newMastered = session.mode === 'words'
    ? masteredIn(session.pack) - session.masteredBefore : 0;

  if (session.mode === 'sentences' && passed) {
    (state.spacks = state.spacks || {})[session.pack.id] = true;
  }
  markStreak();
  save();

  const mood = passed ? 'party' : 'happy';
  const titleTh = pct === 1 ? 'เพอร์เฟค! 💯' : passed ? 'เยี่ยมมาก!' : 'เกือบแล้ว! ลองอีกครั้งนะ';
  const titleEn = pct === 1 ? 'Perfect score!' : passed ? 'Great job!' : 'Almost! Try once more';
  const lbl = (th, en) => (learningThai() ? `${en}<br>${th}` : `${th}<br>${en}`);

  appEl.innerHTML = `
  <div class="screen results-wrap">
    ${mascotSVG({ mood, size: 160 })}
    <div class="results-title">${bi(titleTh, titleEn)}</div>
    <div class="results-stats">
      <div class="stat-box"><div class="stat-num">${session.correct}/${total}</div><div class="stat-lbl">${lbl('ตอบถูก', 'correct')}</div></div>
      ${newMastered > 0 ? `<div class="stat-box"><div class="stat-num">+${newMastered}</div><div class="stat-lbl">${lbl('คำที่จำได้แล้ว', 'words mastered')}</div></div>` : ''}
      <div class="stat-box"><div class="stat-num">🔥 ${streakCurrent()}</div><div class="stat-lbl">${lbl('วันติดต่อกัน', 'day streak')}</div></div>
    </div>
    <div class="results-actions">
      ${!passed ? `
      <button class="btn btn-big" id="again-btn">${bi('ลองอีกครั้ง 💪', 'Try again 💪')}</button>` : ''}
      <button class="btn ${passed ? 'btn-big' : 'btn-ghost btn-big'}" id="home-btn">${bi('กลับหน้าหลัก 🏠', 'Home 🏠')}</button>
    </div>
  </div>`;

  if (passed) { confetti(100); Sfx.fanfare(); }

  $('#home-btn').addEventListener('click', renderHome);
  $('#again-btn')?.addEventListener('click', () => {
    if (session.mode === 'sentences') startSentenceLesson(session.pack);
    else startWordLesson(session.pack);
  });
}

// ═════════════════════════════════════════════════════════════
// settings sheet (+ profile export/import)
// ═════════════════════════════════════════════════════════════
// progress codes move a profile between devices/browsers — crucial on iOS,
// where the home-screen app and Safari have SEPARATE localStorage
const encodeProfile = () =>
  btoa(unescape(encodeURIComponent(JSON.stringify({ gluaynoi: 1, profile: state }))));

function decodeProfile(code) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!data || data.gluaynoi !== 1 || !data.profile || typeof data.profile.words !== 'object') return null;
    return Object.assign(defaultState(), data.profile);
  } catch (e) { return null; }
}

function openSettings() {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

  const close = () => {
    const name = $('#set-name', backdrop)?.value.trim();
    if (name) state.name = name;
    save();
    backdrop.remove();
    renderHome();
  };

  const renderMain = () => {
    backdrop.innerHTML = `
    <div class="sheet">
      <h3>${bi('ตั้งค่า ⚙️', 'Settings ⚙️')}</h3>
      <div class="sheet-row">
        <span>${bi('ชื่อ', 'Name')}</span>
        <input class="name-input grow" id="set-name" value="${esc(state.name)}" maxlength="20" style="padding:8px 12px;font-size:1rem" />
      </div>
      <div class="sheet-row">
        <span class="grow">${bi('กำลังเรียน', 'Learning')}</span>
        <button class="btn" id="set-lang">${learningThai() ? '🇹🇭 Thai' : '🇬🇧 English'}</button>
      </div>
      <div class="sheet-row">
        <button class="btn grow" id="set-export">📤 ${bi('ส่งออก', 'Export')}</button>
        <button class="btn grow" id="set-import">📥 ${bi('นำเข้า', 'Import')}</button>
      </div>
      <button class="btn btn-big" id="set-done">${bi('เสร็จแล้ว ✓', 'Done ✓')}</button>
      <button class="danger-link" id="set-reset">🗑️ ${learningThai()
        ? `Delete this profile · ลบโปรไฟล์นี้`
        : `ลบโปรไฟล์นี้ · Delete this profile`}</button>
    </div>`;
    $('#set-lang', backdrop).addEventListener('click', (e) => {
      state.lang = learningThai() ? 'en' : 'th';
      save();
      e.target.textContent = learningThai() ? '🇹🇭 Thai' : '🇬🇧 English';
    });
    $('#set-export', backdrop).addEventListener('click', () => { Sfx.pop(); renderExport(); });
    $('#set-import', backdrop).addEventListener('click', () => { Sfx.pop(); renderImport(); });
    $('#set-done', backdrop).addEventListener('click', close);
    $('#set-reset', backdrop).addEventListener('click', () => {
      if (confirm(`ลบโปรไฟล์ “${state.name}” จริงๆ หรอ? ความคืบหน้าทั้งหมดจะหายไปนะ\nReally delete “${state.name}”? All progress will be gone forever.`)) {
        delete root.profiles[root.current];
        root.current = null;
        state = defaultState();
        save();
        backdrop.remove();
        renderBoot();
      }
    });
  };

  const renderExport = () => {
    const code = encodeProfile();
    backdrop.innerHTML = `
    <div class="sheet">
      <h3>📤 ${bi('ส่งออกความคืบหน้า', 'Export progress')}</h3>
      <p class="sheet-note">${bi(
        'คัดลอกโค้ดนี้ แล้วไป “นำเข้า” ในแอปหรือเบราว์เซอร์อีกที่หนึ่ง',
        'Copy this code, then use Import in the other app or browser')}</p>
      <textarea class="code-box" id="export-code" readonly>${code}</textarea>
      <button class="btn btn-mint btn-big" id="copy-code">${bi('คัดลอก 📋', 'Copy 📋')}</button>
      ${navigator.share ? `<button class="btn btn-big" id="share-code">${bi('แชร์ 💬', 'Share 💬')}</button>` : ''}
      <button class="btn btn-ghost" id="sheet-back">${bi('← กลับ', '← Back')}</button>
    </div>`;
    $('#copy-code', backdrop).addEventListener('click', async () => {
      const ta = $('#export-code', backdrop);
      try {
        await navigator.clipboard.writeText(code);
        toast('📋', 'คัดลอกแล้ว!', 'Copied!');
      } catch (e) {
        ta.select();
        document.execCommand('copy');
        toast('📋', 'คัดลอกแล้ว!', 'Copied!');
      }
    });
    $('#share-code', backdrop)?.addEventListener('click', () => {
      navigator.share({ text: code }).catch(() => {});
    });
    $('#sheet-back', backdrop).addEventListener('click', renderMain);
  };

  const renderImport = () => {
    backdrop.innerHTML = `
    <div class="sheet">
      <h3>📥 ${bi('นำเข้าความคืบหน้า', 'Import progress')}</h3>
      <p class="sheet-note">${bi(
        'วางโค้ดจากเครื่องอื่นที่นี่ — โปรไฟล์นี้จะถูกแทนที่',
        'Paste the code from your other device — it will REPLACE this profile')}</p>
      <textarea class="code-box" id="import-code" placeholder="วางโค้ดที่นี่ · paste code here"></textarea>
      <button class="btn btn-mint btn-big" id="do-import">${bi('นำเข้า ✓', 'Import ✓')}</button>
      <button class="btn btn-ghost" id="sheet-back">${bi('← กลับ', '← Back')}</button>
    </div>`;
    $('#do-import', backdrop).addEventListener('click', () => {
      const imported = decodeProfile($('#import-code', backdrop).value);
      if (!imported) {
        toast('❌', 'โค้ดไม่ถูกต้อง ลองคัดลอกใหม่นะ', "That code doesn't look right — copy it again");
        return;
      }
      if (!confirm('แทนที่โปรไฟล์นี้ด้วยข้อมูลที่นำเข้า?\nReplace this profile with the imported progress?')) return;
      root.profiles[root.current] = imported;
      state = root.profiles[root.current];
      save();
      backdrop.remove();
      Sfx.fanfare();
      toast('📥', `ยินดีต้อนรับกลับมา ${esc(state.name)}!`, `Welcome back, ${esc(state.name)}!`);
      renderHome();
    });
    $('#sheet-back', backdrop).addEventListener('click', renderMain);
  };

  renderMain();
}

// ═════════════════════════════════════════════════════════════
// auto-update: home-screen apps have no refresh button, so poll
// the server's index.html and reload automatically when a newer
// version is deployed — but never in the middle of a lesson
// ═════════════════════════════════════════════════════════════
let updateVersion = 0;

function currentVersion() {
  const s = document.querySelector('script[src*="js/app.js"]');
  const m = s && s.src.match(/[?&]v=(\d+)/);
  return m ? Number(m[1]) : 0;
}

function refreshVersionTag() {
  const el = $('#version-tag');
  if (!el || updateVersion <= currentVersion()) return;
  el.classList.add('has-update');
  el.innerHTML = `🎁 อัปเดตเป็นเวอร์ชัน ${updateVersion} — แตะเลย<span class="en-line">Update to version ${updateVersion} — tap here</span>`;
  el.onclick = () => location.replace(location.pathname + '?u=' + updateVersion);
}

function maybeApplyUpdate() {
  if (!updateVersion || session) return;
  // one attempt per version per session — prevents a reload loop while
  // the CDN still serves the old index.html
  if (sessionStorage.getItem('updated-to') === String(updateVersion)) return;
  try { sessionStorage.setItem('updated-to', String(updateVersion)); } catch (e) {}
  // unique query string forces a fresh index.html past every cache
  location.replace(location.pathname + '?u=' + updateVersion);
}

async function checkForUpdate() {
  try {
    // the unique query busts the GitHub Pages CDN cache (max-age=600), not
    // just the browser cache — so updates reach devices ~1 min after deploy
    const res = await fetch('index.html?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const html = await res.text();
    const m = html.match(/js\/app\.js\?v=(\d+)/);
    if (m && Number(m[1]) > currentVersion()) {
      updateVersion = Number(m[1]);
      refreshVersionTag();
      maybeApplyUpdate();
    }
  } catch (e) { /* offline — try again next time */ }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
setInterval(() => { if (!document.hidden) checkForUpdate(); }, 10000);

// ═════════════════════════════════════════════════════════════
// boot
// ═════════════════════════════════════════════════════════════
function renderBoot() {
  if (Object.keys(root.profiles).length) renderProfiles();
  else renderWelcome();
}

Speech.init();
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
renderBoot();

// the reload-guard flag survives the update reload — if it matches the
// version now running, the update just landed: tell the user
try {
  if (Number(sessionStorage.getItem('updated-to')) === currentVersion()) {
    sessionStorage.removeItem('updated-to');
    toast('🎁', `อัปเดตแล้ว! เวอร์ชัน ${currentVersion()}`, `Updated to version ${currentVersion()}`);
  }
} catch (e) {}

checkForUpdate();

// if IndexedDB has newer progress than localStorage (e.g. localStorage was
// lost to a force-quit), recover it — only before any lesson has started
idbGet().then((raw) => {
  if (!raw || session) return;
  try {
    const data = toRoot(JSON.parse(raw));
    if ((data.rev || 0) > (root.rev || 0)) {
      root = data;
      state = (root.current && root.profiles[root.current]) || defaultState();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(root)); } catch (e) {}
      renderBoot();
    }
  } catch (e) { /* corrupted backup — keep current state */ }
});
