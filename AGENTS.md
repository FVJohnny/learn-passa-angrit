# AGENTS.md — กล้วยน้อย (Gluay Noi)

Everything an agent (or human) must know before changing this project.

## What this is

A web app that teaches **English to a Thai speaker who knows almost no English**
(the owner's girlfriend — she uses it daily on her phone/tablet). The owner reads
English; she reads Thai. It is deliberately simple: no login, no backend, no build
step, no framework. All progress lives in localStorage.

- **Live site**: https://fvjohnny.github.io/learn-passa-angrit/
- **Hosting**: GitHub Pages, legacy build from `main` branch root. Pushing to
  `main` deploys automatically (~1 minute).
- **Mascot**: a baby **banana** named กล้วยน้อย / Gluay Noi (it was briefly an
  elephant; the owner chose banana — do not change it back).

## ⚠️ Rule #1: bump the cache version on every deploy

GitHub Pages serves files with `max-age=600`, and tablets/home-screen apps cache
aggressively. All assets in `index.html` are loaded with a version query:

```html
<script src="js/app.js?v=4"></script>
```

**Any time you change a file in `js/`, `css/`, or `data/`, bump the `?v=N` number
on ALL asset URLs in `index.html` in the same commit.** If you forget, users keep
running the old code and bug fixes silently don't reach them. Docs-only changes
(README, this file) don't need a bump.

## File map

| Path | What it is |
|---|---|
| `index.html` | Single page; screens are rendered into `#app` by JS |
| `css/style.css` | Entire design system (pastel theme, CSS variables at top) |
| `js/app.js` | State, screens, lessons, streak/goal/stars logic |
| `js/mascot.js` | Banana SVG generator (`mascotSVG`) + `ACCESSORIES` list |
| `js/audio.js` | `Speech` (speechSynthesis, en-US) + `Sfx` (WebAudio tones) |
| `data/words.js` | `WORD_PACKS` — Level 1 vocabulary (32 packs, ~430 words) |
| `data/sentences.js` | `SENTENCE_PACKS` — Level 2 sentence building |

## Product rules (learned from the owner — do not regress)

1. **Bilingual everywhere**: Thai is primary, but English must be *comfortably
   readable* — never tiny. UI text pattern: Thai first, `<span class="en-line">`
   English under it.
2. **Never leak answers through pictures.** On English→Thai questions the choices
   are Thai text, so showing the word's emoji would let a Thai reader match
   icon→meaning without reading English (❤️→สีแดง, 1️⃣→หนึ่ง). Therefore:
   - en→th questions show **no emoji**;
   - parenthetical hints like "หนึ่ง (1)" are stripped from choice buttons
     (`noParen()` in app.js);
   - emojis are fine on th→en questions and listening choices (choices are
     English/audio, so the picture can't reveal them).
3. **Gentle failure**: wrong answers never shame — encouraging copy, soft womp
   sound, word goes to the review queue. No hearts/lives.
4. **Sounds must work on phone speakers**: use triangle waves, not low sines
   (low-frequency sine is inaudible on tiny speakers).
5. **Pronunciation hints** are Thai-script transliterations (`pron` field,
   e.g. cat → แคท). Toggleable in settings, on by default.

## Content format

Word packs (`data/words.js`):

```js
{ id: 'colors', icon: '🎨', th: 'สี', en: 'Colors',
  words: [ { en: 'red', th: 'สีแดง', pron: 'เรด', emoji: '❤️' }, ... ] }
```

- **Emojis must be unique within a pack** (they're used as listening-answer
  choices). Cross-pack duplicates are fine.
- `en` must be unique within a pack (word ids are `packId:en`).
- Packs need ≥8 words so multiple-choice pools work; aim for 10–16.
- Keep vocabulary relevant to Thai daily life (tuk-tuk, sticky rice, temple…).

Sentence packs (`data/sentences.js`): `{ en, th, extra: [distractor tiles] }` —
distractors must NOT appear in the sentence itself (would create ambiguity).

## Game mechanics (all in `js/app.js` constants)

- Word **mastered** after 1 correct answer (`MASTER_AT` — the owner explicitly
  wants it this way; don't raise it back to 3).
- Session = 10 questions; **≥80% earns the pack one star** (max 3 per pack).
- 1 star on a pack unlocks the next pack; **10 total stars unlock Level 2**
  (`LEVEL2_STARS`). Level 3 is a locked "กำลังพัฒนา 🚧" placeholder — planned
  content: articles, plurals, is/am/are (classic Thai-speaker pain points).
- Wrong answer → word enters review queue until answered correctly twice.
- Daily goal = 20 answers (`DAILY_GOAL`); streak = consecutive days with a
  completed session.
- Accessories unlock at total stars 3/6/10/15/21/30 (see `ACCESSORIES`).
- localStorage key: **`gluaynoi-v1`** — schema in `defaultState()`. Never wipe or
  rename it casually: it holds her streak and all progress. If you must migrate
  the schema, write a migration from the old key.

## Testing / verification

- Local dev: `./dev.sh` — serves at http://localhost:8000 with caching disabled
  (plain refresh shows edits; no ?v= bump needed locally) and prints a LAN URL
  for testing on a real phone. Test locally BEFORE pushing to main — every push
  deploys to the live site the owner's girlfriend uses daily.
- Syntax check: `node --check js/*.js data/*.js`.
- Data integrity (dup emojis/ids, distractor ambiguity) — there's no committed
  test script; validate manually or eval the data files in node.
- **Headless Chrome quirks**: the infinite background CSS animations stall
  `--virtual-time-budget` (hangs), and screenshots crop the right edge even
  though the layout is fine. Trust in-page measurements over screenshots.
- Speech synthesis and WebAudio need a user gesture — you can't hear them
  headlessly; test sound changes in a real browser.

## Deploying

```sh
git push   # that's it — GitHub Pages rebuilds main automatically
```

Check: `gh run list` (workflow "pages build and deployment") and
`curl -s https://fvjohnny.github.io/learn-passa-angrit/ | grep '?v='`.
Remember Rule #1.
