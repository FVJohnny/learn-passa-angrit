// Data integrity checker — run `node check.js` before pushing.
// Verifies every content rule from AGENTS.md across words, sentences,
// and the romanization dictionary.
const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

eval(read('data/words.js') + '\n' + read('data/sentences.js') + '\n' + read('data/romanize.js') + `
const errs = [];
let totalWords = 0;

for (const p of WORD_PACKS) {
  totalWords += p.words.length;
  if (p.words.length < 8) errs.push(p.id + ': only ' + p.words.length + ' words (need >=8 for choice pools)');
  const ens = new Set(), emo = new Set();
  for (const w of p.words) {
    if (ens.has(w.en)) errs.push(p.id + ': duplicate en "' + w.en + '"');
    ens.add(w.en);
    if (emo.has(w.emoji)) errs.push(p.id + ': duplicate emoji ' + w.emoji + ' (' + w.en + ')');
    emo.add(w.emoji);
    if (!w.th || !w.pron || !w.emoji) errs.push(p.id + ':' + w.en + ' missing field');
    if (!TH_ROM[w.th]) errs.push('TH_ROM missing word: "' + w.th + '" (' + p.id + ':' + w.en + ')');
  }
}
const ids = WORD_PACKS.map((p) => p.id);
if (new Set(ids).size !== ids.length) errs.push('duplicate word pack id');

let totalSent = 0;
const allS = [...SENTENCE_PACKS, ...SENTENCE_PACKS_L3];
const sids = allS.map((p) => p.id);
if (new Set(sids).size !== sids.length) errs.push('duplicate sentence pack id');
for (const p of allS) {
  totalSent += p.sentences.length;
  for (const s of p.sentences) {
    const enTiles = s.en.split(' ').map((t) => t.toLowerCase());
    for (const x of s.extra) {
      if (enTiles.includes(x.toLowerCase())) errs.push(p.id + ': extra "' + x + '" appears in tiles of "' + s.en + '"');
    }
    if (s.thTiles) {
      if (s.thTiles.join('') !== s.th.replace(/\\s+/g, '')) errs.push(p.id + ': thTiles mismatch for "' + s.th + '"');
      for (const x of s.thExtra || []) {
        if (s.thTiles.includes(x)) errs.push(p.id + ': thExtra "' + x + '" in thTiles of "' + s.th + '"');
      }
      for (const t of [...s.thTiles, ...(s.thExtra || [])]) {
        if (!TH_ROM[t]) errs.push('TH_ROM missing tile: "' + t + '" (' + p.id + ')');
      }
    }
  }
}

for (const [k, v] of Object.entries(TH_ROM)) {
  if (!v || !v.trim()) errs.push('TH_ROM empty value for "' + k + '"');
}

console.log('word packs:', WORD_PACKS.length, '| words:', totalWords);
console.log('sentence packs:', allS.length, '| sentences:', totalSent);
console.log('romanizations:', Object.keys(TH_ROM).length);
if (errs.length) {
  console.error('ERRORS (' + errs.length + '):');
  errs.forEach((e) => console.error(' -', e));
  process.exit(1);
}
console.log('ALL CHECKS PASS');
`);
