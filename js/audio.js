// เสียง — speech synthesis for English words + soft WebAudio sound effects

const Speech = {
  voice: null,
  thVoice: null,

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
      this.thVoice = voices.find((v) => v.lang.toLowerCase().startsWith('th')) || null;
    };
    pick();
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = pick;
    }
  },

  // cancel + speak in the same tick randomly drops the new utterance on
  // iOS/Safari (the old one can keep playing over the new question) —
  // always cancel first, then speak a beat later
  _speak(u) {
    speechSynthesis.cancel();
    clearTimeout(this._t);
    this._t = setTimeout(() => speechSynthesis.speak(u), 80);
  },

  say(text, { rate = 0.82 } = {}) {
    if (typeof speechSynthesis === 'undefined') return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (this.voice) u.voice = this.voice;
    u.rate = rate;
    u.pitch = 1.06;
    this._speak(u);
    return u;
  },

  sayThai(text, { rate = 0.9 } = {}) {
    if (typeof speechSynthesis === 'undefined') return;
    // voices can load late; re-check for a Thai voice at speak time
    if (!this.thVoice) {
      this.thVoice = speechSynthesis.getVoices()
        .find((v) => v.lang.toLowerCase().startsWith('th')) || null;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    if (this.thVoice) u.voice = this.thVoice;
    u.rate = rate;
    this._speak(u);
    return u;
  },
};

// การจดจำเสียง — speech recognition for speaking questions.
// NOT available inside iOS home-screen apps (only in a real Safari tab) —
// callers check .available and fall back to self-judged speaking practice.
const Recog = {
  SR: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  active: null,
  // iOS home-screen apps EXPOSE the API but its service always refuses —
  // navigator.standalone catches that upfront so no mic UI is shown there.
  // `broken` remembers a hard runtime failure; the service-not-allowed case
  // persists across launches ('gluaynoi-no-mic') since it never recovers.
  broken: (() => {
    try { return localStorage.getItem('gluaynoi-no-mic') === '1'; } catch (e) { return false; }
  })(),

  get available() { return !!this.SR && !navigator.standalone && !this.broken; },

  // listen once; resolves with an array of candidate transcripts
  // (lowercased), [] when nothing was heard, or null when the mic is
  // unusable (permission denied, no service) so the UI can fall back
  listen({ onInterim } = {}) {
    return new Promise((resolve) => {
      if (!this.SR) return resolve(null);
      this.stop();
      const r = new this.SR();
      this.active = r;
      r.lang = 'en-US';
      r.interimResults = true;
      r.maxAlternatives = 5;
      let finals = [];
      r.onresult = (e) => {
        const res = e.results[e.results.length - 1];
        if (res.isFinal) {
          finals = [...res].map((alt) => alt.transcript.toLowerCase().trim());
        } else if (onInterim) {
          onInterim(res[0].transcript);
        }
      };
      r.onerror = (e) => {
        this.active = null;
        if (e.error === 'no-speech' || e.error === 'aborted') return resolve([]);
        // hard failure: stop offering the mic (this device/session)
        this.broken = true;
        if (e.error === 'service-not-allowed') {
          try { localStorage.setItem('gluaynoi-no-mic', '1'); } catch (err) {}
        }
        resolve(null);
      };
      r.onend = () => { this.active = null; resolve(finals); };
      try { r.start(); } catch (err) { this.active = null; resolve(null); }
    });
  },

  stop() {
    if (this.active) {
      try { this.active.abort(); } catch (e) {}
      this.active = null;
    }
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
    // harsh double buzzer — unmistakably "wrong", still audible on tiny speakers
    this.tone(160, 0, 0.22, { type: 'sawtooth', gain: 0.3 });
    this.tone(210, 0, 0.22, { type: 'square', gain: 0.1 });
    this.tone(110, 0.24, 0.4, { type: 'sawtooth', gain: 0.3 });
    if (navigator.vibrate) navigator.vibrate([90, 60, 140]);
  },

  pop() {
    this.tone(520, 0, 0.08, { type: 'triangle', gain: 0.1 });
  },

  // springy pitch-slide for poking the mascot
  boing() {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.26);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
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
