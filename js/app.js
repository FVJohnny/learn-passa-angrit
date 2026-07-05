// ═══════════════════════════════════════════════════════════
// กล้วยน้อย — app logic: state, screens, lessons, celebrations
// ═══════════════════════════════════════════════════════════

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const appEl = $('#app');

const STORAGE_KEY = 'gluaynoi-v1';
const DAILY_GOAL = 20;      // answers per day
const MASTER_AT = 1;        // correct answers to master a word
const LEVEL2_STARS = 10;    // total stars to unlock sentences

// ── word index: id = 'packId:en' ────────────────────────────
const WORDS_BY_ID = {};
WORD_PACKS.forEach((pack) => {
  pack.words.forEach((word) => {
    WORDS_BY_ID[`${pack.id}:${word.en}`] = { word, pack };
  });
});

// ── state ───────────────────────────────────────────────────
function defaultState() {
  return {
    name: '',
    pron: true,                 // show pronunciation hints
    words: {},                  // id -> {c, w}
    review: {},                 // id -> corrects still needed
    packs: {},                  // packId -> stars (0-3)
    daily: { date: '', count: 0 },
    streak: { count: 0, last: '' },
    acc: [],                    // unlocked accessory ids
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* corrupted storage — start fresh */ }
  return defaultState();
}

let state = loadState();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

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
const packStars = (id) => state.packs[id] || 0;
const totalStars = () =>
  [...WORD_PACKS, ...SENTENCE_PACKS].reduce((sum, p) => sum + packStars(p.id), 0);
const masteredIn = (pack) => pack.words.filter((w) => isMastered(`${pack.id}:${w.en}`)).length;
const reviewIds = () => Object.keys(state.review).filter((id) => WORDS_BY_ID[id]);

function dailyToday() {
  if (state.daily.date !== todayStr()) {
    state.daily = { date: todayStr(), count: 0 };
  }
  return state.daily;
}

function streakCurrent() {
  const { count, last } = state.streak;
  if (!count) return 0;
  return (last === todayStr() || last === yesterdayStr()) ? count : 0;
}

function packUnlocked(list, index) {
  if (index === 0) return true;
  return packStars(list[index - 1].id) >= 1;
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
  t.innerHTML = `<span class="t-emoji">${emoji}</span><span>${thMsg}<span class="en-line">${enMsg}</span></span>`;
  layer.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ── mascot speech lines ─────────────────────────────────────
function greeting() {
  const name = esc(state.name);
  const d = dailyToday();
  if (d.count === 0) {
    return {
      mood: 'sleep',
      th: `Zzz… ${name} มาปลุกกล้วยน้อยด้วยการเรียนกันเถอะ!`,
      en: "Zzz… wake me up — let's learn!",
    };
  }
  if (d.count >= DAILY_GOAL) {
    return {
      mood: 'party',
      th: `${name} เก่งที่สุดเลย! วันนี้ครบเป้าแล้ว!`,
      en: "You're amazing! Daily goal complete!",
    };
  }
  return {
    mood: 'happy',
    ...pick([
      { th: `สู้ๆ นะ ${name}! วันนี้เรียนต่ออีกนิดนะ`, en: 'Keep going! A little more today!' },
      { th: `${name} เก่งมากเลย เรียนต่อกันเถอะ!`, en: "You're doing great — let's continue!" },
      { th: `กล้วยน้อยเชื่อใน ${name} นะ!`, en: 'Gluay Noi believes in you!' },
    ]),
  };
}

// ═════════════════════════════════════════════════════════════
// SCREEN: welcome (first launch)
// ═════════════════════════════════════════════════════════════
function renderWelcome() {
  appEl.innerHTML = `
  <div class="screen welcome-wrap">
    <div>${mascotSVG({ mood: 'happy', size: 170 })}</div>
    <h1 class="app-title">กล้วยน้อย
      <span class="en-line">Gluay Noi · Learn English</span>
    </h1>
    <div class="welcome-card">
      <div class="hello-q">สวัสดีจ้า! เราชื่อ “กล้วยน้อย” 🍌<br>เธอชื่ออะไรจ๊ะ?
        <span class="en-line">Hi! I'm Gluay Noi. What's your name?</span>
      </div>
      <input class="name-input" id="name-input" maxlength="20"
        placeholder="ชื่อเล่น · nickname" autocomplete="off" />
      <button class="btn btn-big" id="start-btn">เริ่มเรียนกันเลย! 🌸
        <span class="en-line">Let's start learning!</span>
      </button>
    </div>
  </div>`;

  const input = $('#name-input');
  const start = () => {
    const name = input.value.trim();
    if (!name) { input.focus(); input.placeholder = 'บอกชื่อกล้วยน้อยหน่อยนะ 🥺'; return; }
    state.name = name;
    save();
    Sfx.fanfare();
    confetti(60);
    renderHome();
  };
  $('#start-btn').addEventListener('click', start);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
}

// ═════════════════════════════════════════════════════════════
// SCREEN: home
// ═════════════════════════════════════════════════════════════
function goalRingHTML() {
  const d = dailyToday();
  const frac = Math.min(1, d.count / DAILY_GOAL);
  const R = 19, C = 2 * Math.PI * R;
  return `
  <div class="goal-ring ${frac >= 1 ? 'done' : ''}" title="เป้าหมายวันนี้ ${d.count}/${DAILY_GOAL}">
    <svg width="46" height="46">
      <circle class="ring-bg" cx="23" cy="23" r="${R}" stroke-width="5" fill="none"/>
      <circle class="ring-fill" cx="23" cy="23" r="${R}" stroke-width="5" fill="none"
        stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/>
    </svg>
    <div class="ring-label">${frac >= 1 ? '🏆' : '🎯'}</div>
  </div>`;
}

function packCardHTML(pack, list, index, isSentence) {
  const unlocked = packUnlocked(list, index);
  const stars = packStars(pack.id);
  const starsHTML = [1, 2, 3].map((i) => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('');
  let countHTML = '';
  if (!isSentence) {
    const m = masteredIn(pack);
    countHTML = `<span class="pack-count">${m}/${pack.words.length} คำ</span>`;
  } else {
    countHTML = `<span class="pack-count">${pack.sentences.length} ประโยค</span>`;
  }
  return `
  <div class="pack-card ${unlocked ? '' : 'locked'} ${stars >= 3 ? 'done' : ''}"
       data-pack="${pack.id}" data-kind="${isSentence ? 'sentence' : 'word'}" data-locked="${unlocked ? '' : '1'}">
    ${unlocked ? '' : '<span class="lock-corner">🔒</span>'}
    <span class="pack-ico">${pack.icon}</span>
    <span class="pack-th">${pack.th}</span>
    <span class="pack-en">${pack.en}</span>
    <div class="pack-stars">${starsHTML}</div>
    ${countHTML}
  </div>`;
}

function wardrobeHTML() {
  const stars = totalStars();
  const nextIdx = ACCESSORIES.findIndex((a) => stars < a.stars);
  return `
  <div class="wardrobe">
    ${ACCESSORIES.map((a, i) => {
      const got = stars >= a.stars;
      const cls = got ? 'got' : (i === nextIdx ? 'next-up' : 'locked-w');
      return `<div class="ward-item ${cls}" title="${a.th}">
        <span class="w-emoji">${a.emoji}</span>
        <span class="w-req">${got ? '✓ ได้แล้ว' : `⭐ ${a.stars}`}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function renderHome() {
  dailyToday();
  save();
  const g = greeting();
  const stars = totalStars();
  const streak = streakCurrent();
  const l1done = WORD_PACKS.filter((p) => packStars(p.id) >= 1).length;
  const l2open = stars >= LEVEL2_STARS;
  const rvCount = reviewIds().length;

  appEl.innerHTML = `
  <div class="screen">
    <div class="topbar">
      <div class="brand"><span class="logo-emoji">🍌</span> กล้วยน้อย</div>
      <div class="stat-chips">
        <div class="chip chip-fire ${streak > 0 ? 'lit' : ''}" title="เรียนติดต่อกัน">
          🔥 ${streak} <span class="chip-sub">วัน<br>days</span>
        </div>
        ${goalRingHTML()}
        <button class="icon-btn" id="settings-btn" aria-label="ตั้งค่า settings">⚙️</button>
      </div>
    </div>

    <div class="mascot-card">
      <div class="mascot-holder">${mascotSVG({ mood: g.mood, accessories: state.acc, size: 130 })}</div>
      <div class="speech-bubble">${g.th}<span class="en-line">${g.en}</span></div>
    </div>

    ${rvCount > 0 ? `
    <button class="review-card" id="review-btn">
      <span class="rv-ico">🔁</span>
      <span><strong>ทบทวนคำที่พลาด</strong><span class="en-line">Review missed words</span></span>
      <span class="rv-count">${rvCount}</span>
    </button>` : ''}

    <div class="level-head level-1">
      <div class="level-badge">1</div>
      <h2>คำศัพท์<span class="en-line">Words</span></h2>
      <span class="lvl-progress">${l1done}/${WORD_PACKS.length} แพ็ค</span>
    </div>
    <div class="pack-grid">
      ${WORD_PACKS.map((p, i) => packCardHTML(p, WORD_PACKS, i, false)).join('')}
    </div>

    <div class="level-head level-2">
      <div class="level-badge">2</div>
      <h2>ประโยคสั้นๆ<span class="en-line">Tiny sentences</span></h2>
      ${l2open ? `<span class="lvl-progress">${SENTENCE_PACKS.filter((p) => packStars(p.id) >= 1).length}/${SENTENCE_PACKS.length} แพ็ค</span>` : ''}
    </div>
    ${l2open ? `
    <div class="pack-grid">
      ${SENTENCE_PACKS.map((p, i) => packCardHTML(p, SENTENCE_PACKS, i, true)).join('')}
    </div>` : `
    <div class="level-locked-note">
      <span class="big-ico">🔒</span>
      <span>สะสมดาวอีก <b>${LEVEL2_STARS - stars}</b> ดวงเพื่อปลดล็อคระดับ 2 (ตอนนี้มี ⭐ ${stars})
        <span class="en-line">Collect ${LEVEL2_STARS - stars} more stars to unlock Level 2</span>
      </span>
    </div>`}

    <div class="level-head level-3">
      <div class="level-badge">3</div>
      <h2>ประโยคที่ยาวขึ้น<span class="en-line">Longer sentences</span></h2>
    </div>
    <div class="level-locked-note">
      <span class="big-ico">🚧</span>
      <span>กำลังพัฒนา… เร็วๆ นี้!<span class="en-line">In progress… coming soon!</span></span>
    </div>

    <div class="level-head">
      <h2>ตู้เสื้อผ้ากล้วยน้อย 🎀<span class="en-line">Gluay Noi's wardrobe — earn stars to dress up!</span></h2>
    </div>
    ${wardrobeHTML()}
  </div>`;

  $('#settings-btn').addEventListener('click', openSettings);
  if (rvCount > 0) $('#review-btn').addEventListener('click', () => startReview());
  $$('.pack-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.dataset.locked) {
        toast('🔒', 'ทำแพ็คก่อนหน้าให้ได้ 1 ดาวก่อนนะ', 'Earn 1 star on the previous pack first');
        return;
      }
      Sfx.pop();
      if (card.dataset.kind === 'sentence') {
        startSentenceLesson(SENTENCE_PACKS.find((p) => p.id === card.dataset.pack));
      } else {
        startWordLesson(WORD_PACKS.find((p) => p.id === card.dataset.pack));
      }
    });
  });
}

// ═════════════════════════════════════════════════════════════
// LESSONS — building question lists
// ═════════════════════════════════════════════════════════════
let session = null;

function questionForWord(word, pack) {
  const id = `${pack.id}:${word.en}`;
  const stat = wstat(id);
  // brand-new words teach with the picture; known words get quizzed
  const type = stat.c === 0 ? 'en2th' : pick(['en2th', 'th2en', 'listen']);
  const others = sample(pack.words.filter((w) => w.en !== word.en), 3);
  return { kind: 'word', type, word, pack, id, choices: shuffle([word, ...others]), isNew: stat.c === 0 };
}

function startWordLesson(pack) {
  // the session covers every word not yet mastered; quitting keeps progress,
  // and a fully-mastered pack replays all of its words
  const unmastered = pack.words.filter((w) => !isMastered(`${pack.id}:${w.en}`));
  const words = unmastered.length ? unmastered : pack.words;
  session = {
    mode: 'words', pack,
    questions: shuffle(words).map((w) => questionForWord(w, pack)),
    index: 0, correct: 0, masteredBefore: masteredIn(pack),
  };
  renderQuestion();
}

function startReview() {
  session = {
    mode: 'review', pack: null,
    questions: shuffle(reviewIds()).map((id) => {
      const { word, pack } = WORDS_BY_ID[id];
      return questionForWord(word, pack);
    }),
    index: 0, correct: 0,
  };
  renderQuestion();
}

function startSentenceLesson(pack) {
  session = {
    mode: 'sentences', pack,
    questions: shuffle(pack.sentences).map((s) => ({ kind: 'sentence', sentence: s, pack })),
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
  $('#quit-btn').addEventListener('click', () => { speechSynthesis.cancel?.(); renderHome(); });
  // animate progress to current position
  requestAnimationFrame(() => {
    $('.progress-fill').style.width = (session.index / session.questions.length) * 100 + '%';
  });
}

function renderQuestion() {
  const q = session.questions[session.index];
  if (q.kind === 'sentence') return renderSentenceQuestion(q);

  const { type, word, pack } = q;
  const pron = state.pron ? `<div><span class="q-pron">🗣️ ${word.pron}</span></div>` : '';

  if (type === 'en2th') {
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">${q.isNew
          ? '✨ คำใหม่! แปลว่าอะไรนะ? · New word — take a guess!'
          : 'คำนี้แปลว่าอะไร? · What does this mean?'}</div>
        <div class="q-word-en">${esc(word.en)}</div>
        ${pron}
        <button class="speak-btn" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}">${esc(noParen(c.th))}</button>`).join('')}
      </div>`);
    Speech.say(word.en);
  } else if (type === 'th2en') {
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">ภาษาอังกฤษพูดว่าอย่างไร? · How do you say it in English?</div>
        <span class="q-emoji">${word.emoji}</span>
        <div class="q-word-th">${esc(word.th)}</div>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}"><span class="c-en">${esc(c.en)}</span></button>`).join('')}
      </div>`);
  } else {
    lessonChrome(`
      <div class="q-card">
        <div class="q-prompt">ฟังแล้วเลือกคำที่ได้ยิน · Listen and choose</div>
        <button class="speak-btn big speaking" id="speak-btn" aria-label="ฟังเสียง listen">🔊</button>
      </div>
      <div class="choices grid-2">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" data-i="${i}">
            <span class="c-emoji">${c.emoji}</span>${esc(c.th)}
          </button>`).join('')}
      </div>`);
    Speech.say(word.en);
  }

  $('#speak-btn')?.addEventListener('click', () => Speech.say(word.en));
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
  const tiles = shuffle([...s.en.split(' '), ...s.extra]);
  q.answer = [];
  q.tiles = tiles;

  lessonChrome(`
    <div class="q-card">
      <div class="q-prompt">เรียงคำให้เป็นประโยค · Build the sentence</div>
      <div class="q-word-th" style="font-size:1.4rem">${esc(s.th)}</div>
    </div>
    <div class="tile-answer" id="tile-answer"></div>
    <div class="tile-bank" id="tile-bank">
      ${tiles.map((t, i) => `<button class="tile" data-i="${i}">${esc(t)}</button>`).join('')}
    </div>
    <div style="margin-top:22px">
      <button class="btn btn-mint btn-big" id="check-btn" disabled>ตรวจคำตอบ ✓<span class="en-line">Check</span></button>
    </div>`);

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
      t.className = 'tile in-answer';
      t.textContent = q.tiles[i];
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
    const built = q.answer.map((i) => q.tiles[i]).join(' ');
    const correct = built.toLowerCase() === s.en.toLowerCase();
    checkBtn.disabled = true;
    $$('.tile').forEach((b) => { b.disabled = true; });
    Speech.say(s.en);
    answerSentence(q, correct);
  });
}

// ── answering ───────────────────────────────────────────────
function bumpDaily() {
  const d = dailyToday();
  d.count += 1;
  if (d.count === DAILY_GOAL) {
    confetti(70);
    Sfx.fanfare();
    toast('🏆', 'ครบเป้าหมายวันนี้แล้ว! เก่งมาก!', 'Daily goal reached!');
  }
}

function answerWord(q, correct) {
  const stat = state.words[q.id] || (state.words[q.id] = { c: 0, w: 0 });
  if (correct) {
    session.correct += 1;
    stat.c += 1;
    if (state.review[q.id] && --state.review[q.id] <= 0) delete state.review[q.id];
    Sfx.correct();
  } else {
    stat.w += 1;
    state.review[q.id] = 2;
    Sfx.wrong();
  }
  bumpDaily();
  save();
  if (q.type === 'th2en' || q.type === 'listen') Speech.say(q.word.en);
  showFeedback(correct, q.word);
}

function answerSentence(q, correct) {
  if (correct) { session.correct += 1; Sfx.correct(); }
  else Sfx.wrong();
  bumpDaily();
  save();
  showFeedback(correct, { en: q.sentence.en, th: q.sentence.th, pron: '' });
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
  const [th, en] = correct ? pick(PRAISE) : pick(CHEER_UP);
  const answerLine = `<div class="fb-answer"><span class="fb-en">${esc(item.en)}</span> = ${esc(item.th)}${state.pron && item.pron ? ` · 🗣️ ${item.pron}` : ''}</div>`;
  if (!correct) $('.q-card')?.classList.add('q-wrong');
  bar.className = `feedback-bar ${correct ? 'good' : 'bad'}`;
  bar.innerHTML = `
    <div class="feedback-inner">
      <div class="feedback-mascot">${mascotSVG({ mood: correct ? 'cheer' : 'oops', accessories: state.acc, size: 62 })}</div>
      <div class="feedback-msg">${correct ? '💚' : '💪'} ${th}<span class="en-line">${en}</span>${answerLine}</div>
      <button class="icon-btn" id="fb-speak" aria-label="ฟังอีกครั้ง listen again">🔊</button>
      <button class="btn ${correct ? 'btn-mint' : ''}" id="next-btn">ต่อไป<span class="en-line">Next</span></button>
    </div>`;
  requestAnimationFrame(() => bar.classList.add('show'));
  $('#fb-speak').addEventListener('click', () => Speech.say(item.en));
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

function checkAccessories() {
  const stars = totalStars();
  const fresh = ACCESSORIES.filter((a) => stars >= a.stars && !state.acc.includes(a.id));
  fresh.forEach((a) => {
    state.acc.push(a.id);
    Sfx.unlock();
    toast(a.emoji, `ปลดล็อคแล้ว: ${a.th} ให้กล้วยน้อย!`, `Unlocked: ${a.en} for Gluay Noi!`);
  });
  return fresh.length > 0;
}

function renderResults() {
  const total = session.questions.length;
  const pct = session.correct / total;
  const passed = pct >= 0.8;
  let starsNow = 0, newMastered = 0;

  if (session.mode !== 'review' && passed) {
    state.packs[session.pack.id] = Math.min(3, packStars(session.pack.id) + 1);
  }
  if (session.mode !== 'review') starsNow = packStars(session.pack.id);
  if (session.mode === 'words') newMastered = masteredIn(session.pack) - session.masteredBefore;

  markStreak();
  const gotNewAcc = checkAccessories();
  save();

  const mood = passed ? 'party' : 'happy';
  const titleTh = session.mode === 'review'
    ? 'ทบทวนเสร็จแล้ว!'
    : passed ? (pct === 1 ? 'เพอร์เฟค! 💯' : 'ผ่านแล้ว! ได้ดาวเพิ่ม!') : 'เกือบแล้ว! ลองอีกครั้งนะ';
  const titleEn = session.mode === 'review'
    ? 'Review complete!'
    : passed ? (pct === 1 ? 'Perfect score!' : 'Passed — you earned a star!') : 'Almost! Try once more';

  const starsHTML = session.mode === 'review' ? '' : `
    <div class="results-stars">
      ${[1, 2, 3].map((i) => `<span class="star ${i <= starsNow ? '' : 'off'}">⭐</span>`).join('')}
    </div>`;

  appEl.innerHTML = `
  <div class="screen results-wrap">
    ${mascotSVG({ mood, accessories: state.acc, size: 160 })}
    ${starsHTML}
    <div class="results-title">${titleTh}<span class="en-line">${titleEn}</span></div>
    <div class="results-stats">
      <div class="stat-box"><div class="stat-num">${session.correct}/${total}</div><div class="stat-lbl">ตอบถูก<br>correct</div></div>
      ${newMastered > 0 ? `<div class="stat-box"><div class="stat-num">+${newMastered}</div><div class="stat-lbl">คำที่จำได้แล้ว<br>words mastered</div></div>` : ''}
      <div class="stat-box"><div class="stat-num">🔥 ${streakCurrent()}</div><div class="stat-lbl">วันติดต่อกัน<br>day streak</div></div>
    </div>
    <div class="results-actions">
      ${!passed && session.mode !== 'review' ? `
      <button class="btn btn-big" id="again-btn">ลองอีกครั้ง 💪<span class="en-line">Try again</span></button>` : ''}
      <button class="btn ${passed ? 'btn-big' : 'btn-ghost btn-big'}" id="home-btn">กลับหน้าหลัก 🏠<span class="en-line">Home</span></button>
    </div>
  </div>`;

  if (passed) { confetti(gotNewAcc ? 140 : 100); Sfx.fanfare(); }

  $('#home-btn').addEventListener('click', renderHome);
  $('#again-btn')?.addEventListener('click', () => {
    if (session.mode === 'sentences') startSentenceLesson(session.pack);
    else startWordLesson(session.pack);
  });
}

// ═════════════════════════════════════════════════════════════
// settings sheet
// ═════════════════════════════════════════════════════════════
function openSettings() {
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `
  <div class="sheet">
    <h3>ตั้งค่า ⚙️<span class="en-line">Settings</span></h3>
    <div class="sheet-row">
      <span>ชื่อ<span class="en-line">Name</span></span>
      <input class="name-input grow" id="set-name" value="${esc(state.name)}" maxlength="20" style="padding:8px 12px;font-size:1rem" />
    </div>
    <div class="sheet-row">
      <span class="grow">คำอ่านภาษาไทย 🗣️<span class="en-line">Thai pronunciation hints</span></span>
      <button class="toggle ${state.pron ? 'on' : ''}" id="set-pron" aria-label="toggle pronunciation"></button>
    </div>
    <button class="btn btn-big" id="set-done">เสร็จแล้ว ✓<span class="en-line">Done</span></button>
    <button class="danger-link" id="set-reset">ลบข้อมูลทั้งหมด เริ่มใหม่ · Reset all progress</button>
  </div>`;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  const close = () => {
    const name = $('#set-name', backdrop).value.trim();
    if (name) state.name = name;
    save();
    backdrop.remove();
    renderHome();
  };
  $('#set-pron', backdrop).addEventListener('click', (e) => {
    state.pron = !state.pron;
    e.target.classList.toggle('on', state.pron);
    save();
  });
  $('#set-done', backdrop).addEventListener('click', close);
  $('#set-reset', backdrop).addEventListener('click', () => {
    if (confirm('แน่ใจไหม? ดาวและความคืบหน้าทั้งหมดจะหายไปนะ\nAre you sure? All progress will be lost.')) {
      localStorage.removeItem(STORAGE_KEY);
      state = loadState();
      backdrop.remove();
      renderWelcome();
    }
  });
}

// ═════════════════════════════════════════════════════════════
// boot
// ═════════════════════════════════════════════════════════════
Speech.init();
if (state.name) renderHome();
else renderWelcome();
