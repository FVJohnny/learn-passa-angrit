// น้องกล้วย — the baby banana mascot, drawn as inline SVG.
// mascotSVG({ mood, accessories, size })
// moods: normal | happy | cheer | oops | sleep | party
// accessories: array of ids from ACCESSORIES (bow, hat, shades, scarf, balloon, crown)

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
  const { mood = 'normal', accessories = [], size = 140 } = opts;
  const has = (id) => accessories.includes(id);
  const c = BANANA;
  // crown wins the head slot over the party hat
  const headAcc = has('crown') ? 'crown' : has('hat') ? 'hat' : null;

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
  if (has('shades') && mood !== 'sleep') {
    eyes = `
      <g>
        <rect x="64" y="80" width="32" height="20" rx="9" fill="#6B4F3A"/>
        <rect x="104" y="80" width="32" height="20" rx="9" fill="#6B4F3A"/>
        <path d="M96 88 h8" stroke="#6B4F3A" stroke-width="4"/>
        <path d="M64 88 h-8 M136 88 h8" stroke="#6B4F3A" stroke-width="4" stroke-linecap="round"/>
        <path d="M70 85 q6 -3 10 0" stroke="#ffffff66" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>`;
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

  // ── accessories ──
  const accBow = has('bow') ? `
    <g class="m-acc-bow" transform="translate(66 40) rotate(-16)">
      <path d="M0 8 q-14 -12 -16 0 q-2 12 16 4z" fill="#F87DA0"/>
      <path d="M4 8 q14 -12 16 0 q2 12 -16 4z" fill="#F87DA0"/>
      <circle cx="2" cy="9" r="5" fill="#E4638A"/>
    </g>` : '';

  const accHat = headAcc === 'hat' ? `
    <g class="m-acc-hat">
      <path d="M100 2 L124 42 L76 42 Z" fill="#6FB5F0"/>
      <path d="M100 2 L124 42 L76 42 Z" fill="url(#hatdots)"/>
      <circle cx="100" cy="4" r="7" fill="#F87DA0"/>
      <path d="M76 42 q24 8 48 0" stroke="#F87DA0" stroke-width="7" fill="none" stroke-linecap="round"/>
    </g>` : '';

  const accCrown = headAcc === 'crown' ? `
    <g class="m-acc-crown">
      <path d="M76 40 L80 16 L92 30 L102 10 L112 30 L124 16 L128 40 Z" fill="#F5C64F" stroke="#E0A93A" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="80" cy="14" r="4" fill="#F87DA0"/>
      <circle cx="102" cy="8" r="4" fill="#6FB5F0"/>
      <circle cx="124" cy="14" r="4" fill="#58C795"/>
    </g>` : '';

  const accScarf = has('scarf') ? `
    <g class="m-acc-scarf">
      <path d="M66 130 q34 18 68 0 l-3 12 q-31 15 -62 0 z" fill="#F87DA0"/>
      <path d="M116 138 l6 22 q1 5 -5 5 l-8 0 q-5 0 -4 -5 l4 -20z" fill="#F87DA0"/>
      <path d="M110 156 h14 M109 162 h14" stroke="#E4638A" stroke-width="2.5" stroke-linecap="round"/>
    </g>` : '';

  const accBalloon = has('balloon') ? `
    <g class="m-balloon">
      <path d="M150 100 q16 -28 18 -50" stroke="#C9A227" stroke-width="2" fill="none"/>
      <ellipse cx="169" cy="42" rx="15" ry="18" fill="#FF8FAB"/>
      <path d="M169 60 l-4 6 h8 z" fill="#E4638A"/>
      <path d="M163 34 q4 -5 8 -2" stroke="#ffffff88" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>` : '';

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
    <defs>
      <pattern id="hatdots" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.2" fill="#ffffff77"/>
      </pattern>
    </defs>
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
    ${accScarf}
    ${accBow}
    ${accHat}
    ${accCrown}
    ${accBalloon}
    ${zzz}
    ${partyBits}
  </svg>`;
}

// Accessory wardrobe — unlocked by total stars
const ACCESSORIES = [
  { id: 'bow', stars: 3, emoji: '🎀', th: 'โบว์', en: 'Bow' },
  { id: 'hat', stars: 6, emoji: '🎉', th: 'หมวกปาร์ตี้', en: 'Party hat' },
  { id: 'shades', stars: 10, emoji: '🕶️', th: 'แว่นกันแดด', en: 'Sunglasses' },
  { id: 'scarf', stars: 15, emoji: '🧣', th: 'ผ้าพันคอ', en: 'Scarf' },
  { id: 'balloon', stars: 21, emoji: '🎈', th: 'ลูกโป่ง', en: 'Balloon' },
  { id: 'crown', stars: 30, emoji: '👑', th: 'มงกุฎ', en: 'Crown' },
];
