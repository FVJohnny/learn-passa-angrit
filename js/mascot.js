// น้องกล้วย — the baby banana mascot, drawn as inline SVG.
// mascotSVG({ mood, size })
// moods: normal | happy | cheer | oops | sleep | party

const BANANA = {
  body: '#FFE066',
  mid: '#FFD43B',
  dark: '#F5B933',
  ridge: '#F8C94B',
  stem: '#9C6B3C',
  leaf: '#58C795',
  blush: '#F9A8C4',
};

function mascotSVG(opts = {}) {
  const { mood = 'normal', size = 140 } = opts;
  const c = BANANA;

  // ── eyes per mood ──
  let eyes;
  if (mood === 'sleep') {
    eyes = `
      <path d="M72 90 q8 6 16 0" stroke="#6B4F3A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M112 90 q8 6 16 0" stroke="#6B4F3A" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'happy' || mood === 'cheer' || mood === 'party') {
    eyes = `
      <path d="M72 90 q8 -10 16 0" stroke="#6B4F3A" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M112 90 q8 -10 16 0" stroke="#6B4F3A" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'oops') {
    eyes = `
      <circle cx="80" cy="90" r="5.5" fill="#6B4F3A"/>
      <circle cx="120" cy="90" r="5.5" fill="#6B4F3A"/>
      <path d="M70 78 q10 -6 20 -2" stroke="#6B4F3A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M130 78 q-10 -6 -20 -2" stroke="#6B4F3A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else {
    eyes = `
      <circle cx="80" cy="89" r="6" fill="#6B4F3A"/>
      <circle cx="120" cy="89" r="6" fill="#6B4F3A"/>
      <circle cx="82.5" cy="86.5" r="2" fill="#fff"/>
      <circle cx="122.5" cy="86.5" r="2" fill="#fff"/>`;
  }

  // ── mouth per mood ──
  let mouth;
  if (mood === 'cheer' || mood === 'party') {
    mouth = `<path d="M89 104 q11 12 22 0 q-4 12 -11 12 q-7 0 -11 -12z" fill="#A9713F"/>`;
  } else if (mood === 'oops') {
    mouth = `<ellipse cx="100" cy="108" rx="6" ry="7" fill="#A9713F"/>`;
  } else if (mood === 'sleep') {
    mouth = `<path d="M93 107 q7 5 14 0" stroke="#A9713F" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  } else {
    mouth = `<path d="M89 104 q11 10 22 0" stroke="#A9713F" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }

  // ── stubby arms: up in the air when cheering ──
  const arms = (mood === 'cheer' || mood === 'party')
    ? `<ellipse cx="48" cy="106" rx="10" ry="16" fill="${c.mid}" transform="rotate(38 48 106)"/>
       <ellipse cx="152" cy="106" rx="10" ry="16" fill="${c.mid}" transform="rotate(-38 152 106)"/>`
    : `<ellipse cx="58" cy="138" rx="10" ry="15" fill="${c.mid}" transform="rotate(16 58 138)"/>
       <ellipse cx="142" cy="138" rx="10" ry="15" fill="${c.mid}" transform="rotate(-16 142 138)"/>`;

  const zzz = mood === 'sleep' ? `
    <g font-family="'Baloo 2', sans-serif" font-weight="800" fill="#F5B933">
      <text class="m-zzz" x="140" y="52" font-size="20">z</text>
      <text class="m-zzz z2" x="150" y="42" font-size="15">z</text>
      <text class="m-zzz z3" x="158" y="34" font-size="11">z</text>
    </g>` : '';

  const partyBits = mood === 'party' ? `
    <g>
      <text x="20" y="40" font-size="16">🎊</text>
      <text x="164" y="150" font-size="16">✨</text>
      <text x="14" y="140" font-size="14">🎉</text>
    </g>` : '';

  return `
  <svg class="mascot mood-${mood}" width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="น้องกล้วย mascot">
    <ellipse cx="100" cy="184" rx="48" ry="9" fill="rgba(196,152,80,0.22)"/>
    <!-- feet -->
    <ellipse cx="84" cy="176" rx="13" ry="9" fill="${c.dark}"/>
    <ellipse cx="116" cy="176" rx="13" ry="9" fill="${c.dark}"/>
    ${arms}
    <!-- banana body: plump, gently curved -->
    <g class="m-body">
      <ellipse cx="100" cy="104" rx="45" ry="76" fill="${c.body}" transform="rotate(-7 100 104)"/>
      <path d="M77 42 Q54 104 78 164" stroke="${c.ridge}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>
      <path d="M129 38 Q150 100 124 160" stroke="${c.ridge}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>
      <path d="M88 46 q-12 26 -8 56" stroke="#FFF3BF" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8"/>
      <ellipse cx="121" cy="168" rx="9" ry="6" fill="${c.stem}" transform="rotate(-14 121 168)"/>
    </g>
    <!-- stem + leaf -->
    <rect x="94" y="16" width="13" height="22" rx="5.5" fill="${c.stem}" transform="rotate(-9 100 27)"/>
    <g class="m-leaf">
      <path d="M106 20 q16 -14 28 -5 q-11 12 -28 9z" fill="${c.leaf}"/>
      <path d="M108 21 q12 -8 22 -5" stroke="#3FAE7D" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <!-- face -->
    <ellipse cx="70" cy="106" rx="9" ry="6" fill="${c.blush}" opacity="0.7"/>
    <ellipse cx="130" cy="106" rx="9" ry="6" fill="${c.blush}" opacity="0.7"/>
    ${eyes}
    ${mouth}
    ${zzz}
    ${partyBits}
  </svg>`;
}
