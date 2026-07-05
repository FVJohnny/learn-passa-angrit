// เสียง — speech synthesis for English words + soft WebAudio sound effects

const Speech = {
  voice: null,

  init() {
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return;
      const en = voices.filter((v) => v.lang.startsWith('en'));
      this.voice =
        en.find((v) => /samantha|google us english|aria|zira/i.test(v.name)) ||
        en.find((v) => v.lang === 'en-US') ||
        en[0] ||
        null;
    };
    pick();
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = pick;
    }
  },

  say(text, { rate = 0.82 } = {}) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (this.voice) u.voice = this.voice;
    u.rate = rate;
    u.pitch = 1.06;
    speechSynthesis.speak(u);
    return u;
  },
};

const Sfx = {
  ctx: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, start, dur, { type = 'sine', gain = 0.18 } = {}) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  },

  correct() {
    this.tone(660, 0, 0.15, { type: 'triangle' });
    this.tone(880, 0.09, 0.22, { type: 'triangle' });
  },

  wrong() {
    this.tone(330, 0, 0.2, { type: 'sine', gain: 0.12 });
    this.tone(262, 0.12, 0.3, { type: 'sine', gain: 0.1 });
  },

  pop() {
    this.tone(520, 0, 0.08, { type: 'triangle', gain: 0.1 });
  },

  fanfare() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => this.tone(f, i * 0.12, 0.3, { type: 'triangle' }));
    this.tone(1319, 0.5, 0.5, { type: 'triangle', gain: 0.14 });
  },

  unlock() {
    [784, 988, 1175, 1568].forEach((f, i) =>
      this.tone(f, i * 0.09, 0.25, { type: 'sine', gain: 0.14 })
    );
  },
};
