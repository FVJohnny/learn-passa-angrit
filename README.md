# กล้วยน้อย 🍌 Gluay Noi — Learn English

A cute, pastel web app that helps a Thai speaker learn English little by little,
guided by a baby banana mascot. No login, no backend — all progress lives in
the browser's localStorage.

## Features

- **Level 1 — Words**: 620+ words across 32 themed packs (greetings, food, animals,
  family, verbs, feelings…). Each word has English, Thai, a Thai-script
  pronunciation hint (แคท-style), an emoji picture, and tap-to-hear audio.
- **Level 2 — Tiny sentences**: word-tile sentence building, unlocked at 80
  mastered words.
- **Level 3** — locked, กำลังพัฒนา 🚧
- **Mastery**: a word is mastered once answered correctly. A lesson asks every
  not-yet-mastered word in the pack; quitting keeps progress, and missed words
  come back next time. Fully mastering a pack unlocks the next one.
- **Streak**: consecutive days with a completed session, held up by the banana.
- **Bilingual UI**: Thai first, readable English underneath, everywhere.
- Audio via the browser's built-in speech synthesis — free and offline.

## Running

It's a plain static site — no build step:

```sh
./dev.sh          # local server on :8000, no caching, LAN URL for phone testing
./dev.sh 3000     # custom port
```

## Adding content

Word packs live in `data/words.js`, sentence packs in `data/sentences.js`.
Each entry is plain JSON-ish JS — add a pack or word and reload. Emojis must be
unique within a pack (they're used as answer choices).

## Deployment

Hosted on GitHub Pages from the `main` branch root. Push to `main` to deploy —
and remember to bump the `?v=` asset version in `index.html` (see AGENTS.md).

---

Made with 💛 for learning English one banana at a time.
