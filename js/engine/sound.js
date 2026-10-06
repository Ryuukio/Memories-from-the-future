// Som: Web Audio, gerado por código. Liga na primeira tecla (regra do navegador); M liga e desliga.
// Por enquanto, bipes da interface, da detecção, das portas, do baú e da máquina. A etapa 6 traz
// as músicas, o eco e os demais efeitos.
const Sound = (() => {
  let ac = null, master = null, muted = false;

  const volume = () => {
    const v = GAME_CONFIG.audio && GAME_CONFIG.audio.volume;
    return typeof v === 'number' ? v : 0.6;
  };

  function unlock() {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        master = ac.createGain();
        master.gain.value = muted ? 0 : volume();
        master.connect(ac.destination);
      }
      if (ac.state === 'suspended') {
        const p = ac.resume();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) { ac = null; }
  }

  // um bipe: frequência (Hz), duração (s), forma de onda, volume, atraso (s)
  function tone(freq, dur, type, vol, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const SFX = {
    blip: () => tone(700, 0.025, 'square', 0.04),
    move: () => tone(520, 0.04, 'square', 0.06),
    confirm: () => { tone(660, 0.06, 'square', 0.08); tone(990, 0.09, 'square', 0.08, 0.06); },
    pause: () => tone(440, 0.12, 'triangle', 0.15),
    // balões "??", "??!!" e "!!!!": cada um mais agudo
    alert1: () => { tone(880, 0.05, 'square', 0.06); tone(880, 0.05, 'square', 0.06, 0.08); },
    alert2: () => { tone(1175, 0.05, 'square', 0.07); tone(1175, 0.05, 'square', 0.07, 0.07); },
    alert3: () => { tone(1568, 0.06, 'square', 0.08); tone(1568, 0.06, 'square', 0.08, 0.06); },
    caught: () => { tone(523, 0.09, 'square', 0.1); tone(392, 0.09, 'square', 0.1, 0.09); tone(262, 0.25, 'triangle', 0.14, 0.18); },
    door: () => { tone(196, 0.08, 'triangle', 0.16); tone(147, 0.12, 'triangle', 0.14, 0.07); },
    chest: () => { tone(330, 0.06, 'square', 0.07); tone(392, 0.06, 'square', 0.07, 0.07); tone(523, 0.12, 'square', 0.08, 0.14); },
    // jingle do item: arpejo subindo
    item: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.35 : 0.1, 'square', 0.07, i * 0.1)),
    // memória +20%: brilho subindo
    memory: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.18, 'triangle', 0.1, i * 0.07)),
    // terminal da máquina
    type: () => tone(1200 + Math.random() * 300, 0.015, 'square', 0.025),
    key: () => tone(900, 0.02, 'square', 0.04),
    wrong: () => { tone(150, 0.18, 'square', 0.1); tone(110, 0.3, 'square', 0.1, 0.16); },
    right: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? 0.5 : 0.09, 'square', 0.07, i * 0.08))
  };

  return {
    unlock,
    sfx(name) {
      try { if (SFX[name]) SFX[name](); } catch (e) { /* som é opcional */ }
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : volume();
      return muted;
    },
    get muted() { return muted; }
  };
})();
