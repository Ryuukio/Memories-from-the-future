// Som (SPEC, seção 9): Web Audio, tudo gerado por código (ondas quadrada, de pulso, triangular e
// ruído). Liga na primeira tecla (regra do navegador); M liga e desliga.
//   Sound.sfx(nome)     efeito (lista em SFX)
//   Sound.music(nome)   música em loop (data/music.js); null = silêncio. Pedir a música que já está
//                       tocando não faz nada. Antes da primeira tecla, guarda o pedido e toca depois.
// A música passa por um eco leve (delay curto, pouco retorno), para soar mais cheia, como nos
// jogos de 16 bits. Os efeitos saem secos.
const Sound = (() => {
  const MUSIC_VOL = 1.1, SFX_VOL = 3;   // ganho da música e dos efeitos (os alertas ficam acima da música)
  let ac = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  const waves = {};
  let muted = false, want = null, song = null;
  let shift = 0;   // atraso extra dos efeitos (só no render de teste)

  const volume = () => {
    const v = GAME_CONFIG.audio && GAME_CONFIG.audio.volume;
    return typeof v === 'number' ? v : 0.6;
  };

  // onda de pulso com a largura `duty` (12,5% e 25%, o som clássico de 8 e 16 bits), pela série de Fourier
  function pulse(duty) {
    const n = 48, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      re[k] = Math.sin(2 * Math.PI * k * duty) / (k * Math.PI);
      im[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (k * Math.PI);
    }
    return ac.createPeriodicWave(re, im);
  }

  // mixer, eco, ruído e ondas de pulso no contexto `ac`
  function graph() {
    master = ac.createGain();
    master.gain.value = muted ? 0 : volume();
    // limitador no fim, para nada estourar quando um efeito forte cai em cima da música
    const limit = ac.createDynamicsCompressor();
    limit.threshold.value = -6;
    limit.knee.value = 0;
    limit.ratio.value = 12;
    limit.attack.value = 0.003;
    limit.release.value = 0.15;
    master.connect(limit);
    limit.connect(ac.destination);
    sfxBus = ac.createGain();
    sfxBus.gain.value = SFX_VOL;
    sfxBus.connect(master);
    musicBus = ac.createGain();
    musicBus.gain.value = MUSIC_VOL;
    musicBus.connect(master);
    // eco: delay curto, pouco retorno e um filtro, para as repetições saírem mais abafadas
    const delay = ac.createDelay(1), fb = ac.createGain(), wet = ac.createGain(), lp = ac.createBiquadFilter();
    delay.delayTime.value = 0.19;
    fb.gain.value = 0.22;
    wet.gain.value = 0.28;
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    musicBus.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(wet);
    wet.connect(master);
    // 1 s de ruído branco, para a bateria e os efeitos
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    waves.pulse12 = pulse(0.125);
    waves.pulse25 = pulse(0.25);
  }

  function setup() {
    graph();
    setInterval(pump, 40);
  }

  function unlock() {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        setup();
      }
      if (ac.state === 'suspended') {
        const p = ac.resume();
        if (p && p.catch) p.catch(() => {});
      }
      if (want && !song) startSong(want);
    } catch (e) { ac = null; }
  }

  function osc(type) {
    const o = ac.createOscillator();
    if (waves[type]) o.setPeriodicWave(waves[type]);
    else o.type = type;
    return o;
  }

  // ---------- efeitos ----------
  // um bipe: frequência (Hz), duração (s), forma de onda, volume, atraso (s)
  function tone(freq, dur, type, vol, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay + shift;
    const o = osc(type), g = ac.createGain();
    g.gain.value = 0;   // em todo nó de nota: o padrão é 1, e a primeira amostra passava inteira (clique)
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // nota que escorrega de f0 até f1
  function slide(f0, f1, dur, type, vol, delay = 0) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay + shift;
    const o = osc(type), g = ac.createGain();
    g.gain.value = 0;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  // ruído filtrado (lowpass, highpass ou bandpass em `freq`, que pode ir até `to`)
  function noise(dur, vol, type, freq, delay = 0, to = 0, q = 0.8) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay + shift;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    g.gain.value = 0;
    src.buffer = noiseBuf;
    src.loop = true;
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    f.Q.value = q;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  const SFX = {
    blip: () => tone(700, 0.025, 'square', 0.04),
    move: () => tone(520, 0.04, 'square', 0.06),
    confirm: () => { tone(660, 0.06, 'square', 0.08); tone(990, 0.09, 'square', 0.08, 0.06); },
    pause: () => tone(440, 0.12, 'triangle', 0.15),
    // passos da Ellen: batidinha abafada, cada uma um pouco diferente
    step: () => noise(0.04, 0.12, 'lowpass', 600 + Math.random() * 500),
    // balões "??", "??!!" e "!!!!": cada um mais agudo
    alert1: () => { tone(880, 0.05, 'square', 0.08); tone(880, 0.05, 'square', 0.08, 0.08); },
    alert2: () => { tone(1175, 0.05, 'square', 0.09); tone(1175, 0.05, 'square', 0.09, 0.07); },
    alert3: () => { tone(1568, 0.06, 'square', 0.1); tone(1568, 0.06, 'square', 0.1, 0.06); },
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
    right: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? 0.5 : 0.09, 'square', 0.07, i * 0.08)),
    // história e batalha
    pop: () => slide(300, 900, 0.09, 'square', 0.05),
    // fritura chiando e o cheiro subindo em ondas
    smell: () => {
      noise(1.3, 0.035, 'highpass', 3500);
      for (let i = 0; i < 14; i++) noise(0.015, 0.05 + Math.random() * 0.05, 'bandpass', 2500 + Math.random() * 3000, Math.random() * 1.2, 0, 2);
      [0, 0.35, 0.7].forEach(dl => slide(260, 420, 0.3, 'triangle', 0.08, dl));
    },
    // lâmpada falhando
    flicker: () => [0, 0.09, 0.3, 0.38, 0.62].forEach(dl => { tone(120, 0.06, 'square', 0.05, dl); noise(0.04, 0.05, 'highpass', 5000, dl); }),
    rumble: () => { noise(0.9, 0.2, 'lowpass', 180); slide(60, 38, 0.9, 'triangle', 0.18); },
    // tiro errado: o disparo e a bala assobiando para longe
    miss: () => { noise(0.12, 0.15, 'highpass', 1200); slide(1600, 420, 0.4, 'triangle', 0.12, 0.08); },
    // o tiro final, no silêncio
    bang: () => { noise(0.8, 0.4, 'lowpass', 5000, 0, 150); slide(140, 35, 0.4, 'triangle', 0.35); },
    // o vilão caindo: escorregão para baixo e o baque
    fall: () => { slide(900, 110, 0.9, 'square', 0.05); noise(0.3, 0.22, 'lowpass', 300, 0.9); slide(90, 40, 0.3, 'triangle', 0.18, 0.9); }
  };

  // ---------- música ----------
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const ACC = { '#': 1, b: -1, '': 0 };
  const QUAL = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6], sus4: [0, 5, 7] };
  const freqOf = m => 440 * Math.pow(2, (m - 69) / 12);
  const tokens = s => (s || '').split(/\s+/).filter(t => t && t !== '|');

  function midi(name) {   // 'C#5', 'Bb4' → número MIDI
    const m = /^([A-G])([#b]?)(\d)$/.exec(name);
    return m ? (parseInt(m[3], 10) + 1) * 12 + NOTE[m[1]] + ACC[m[2]] : null;
  }

  function chord(sym) {
    const m = /^([A-G])([#b]?)(.*)$/.exec(sym) || [0, 'C', '', ''];
    return { root: NOTE[m[1]] + ACC[m[2]], tones: QUAL[m[3]] || QUAL[''] };
  }

  // padrões do baixo: [posição, duração, intervalo], em frações do compasso de 16 passos
  const BASS = {
    root: [[0, 3, 0], [4, 3, 0], [8, 3, 0], [12, 3, 0]],
    eighths: [0, 2, 4, 6, 8, 10, 12, 14].map(p => [p, 2, 0]),
    octave: [0, 2, 4, 6, 8, 10, 12, 14].map((p, i) => [p, 2, i % 2 ? 12 : 0]),
    fifth: [[0, 4, 0], [4, 4, 7], [8, 4, 0], [12, 4, 7]],
    drive: Array.from({ length: 16 }, (_, i) => [i, 1, i % 4 === 2 ? 12 : 0]),
    long: [[0, 8, 0], [8, 8, 7]],
    tresillo: [[0, 6, 0], [6, 6, 0], [12, 4, 7]],
    bossa: [[0, 6, 0], [6, 2, 7], [8, 6, 7], [14, 2, 0]],
    waltz: [[0, 4, 0]],
    tremolo: Array.from({ length: 16 }, (_, i) => [i, 1, 0])
  };

  // cada voz vira uma lista de eventos { at, len, ms: [notas] } que se repete a cada `length` passos
  function build(def) {
    const bar = def.bar || 16, voices = [];
    const chords = [];
    let total = 0;
    tokens(def.chords).forEach(tok => {
      const [sym, l] = tok.split(':');
      const len = l ? parseFloat(l) : bar;
      chords.push({ at: total, len, c: chord(sym) });
      total += len;
    });

    if (def.lead) {
      const v = def.lead, unit = v.unit || 2, ev = [];
      let at = 0;
      tokens(v.notes).forEach(tok => {
        const [n, l] = tok.split(':');
        const len = (l ? parseFloat(l) : 1) * unit;
        const m = midi(n);
        if (m !== null) ev.push({ at, len, ms: [m] });
        at += len;
      });
      voices.push({ v, ev, length: at, gap: 0.92 });
    }

    if (def.bass && chords.length) {
      const v = def.bass, pat = BASS[v.style] || BASS.root, ev = [];
      const base = ((v.oct || 2) + 1) * 12;
      chords.forEach(ch => {
        const k = ch.len / 16;
        pat.forEach(([p, len, iv]) => {
          if (p * k < ch.len) ev.push({ at: ch.at + p * k, len: len * k, ms: [base + ch.c.root + iv] });
        });
      });
      voices.push({ v, ev, length: total, gap: 0.85 });
    }

    if (def.arp && chords.length) {
      const v = def.arp, ev = [];
      const base = ((v.oct || 4) + 1) * 12;
      chords.forEach(ch => {
        const t = ch.c.tones.length > 3 ? ch.c.tones : ch.c.tones.concat(12);
        const notes = t.map(iv => base + ch.c.root + iv);
        if (v.style === 'up' || v.style === 'up8') {
          const stepLen = v.style === 'up' ? 1 : 2;
          for (let p = 0, i = 0; p < ch.len; p += stepLen, i++) ev.push({ at: ch.at + p, len: stepLen, ms: [notes[i % notes.length]] });
        } else if (v.style === 'waltz') {
          [4, 8].forEach(p => { if (p < ch.len) ev.push({ at: ch.at + p, len: 2, ms: notes.slice(1, 4) }); });
        } else {   // stab: acordes nos contratempos
          for (let p = 2; p < ch.len; p += 4) ev.push({ at: ch.at + p, len: 1, ms: notes.slice(0, 3) });
        }
      });
      voices.push({ v, ev, length: total, gap: 0.8 });
    }

    if (def.drums) {
      const v = def.drums, ev = [];
      const steps = tokens(v.notes);
      steps.forEach((tok, i) => { if (tok !== '.') ev.push({ at: i, len: 1, drum: tok }); });
      voices.push({ v, ev, length: steps.length, drums: true });
    }
    return voices.filter(x => x.ev.length && x.length > 0);
  }

  function playNote(dest, v, m, t, dur, vol) {
    const f = freqOf(m), end = t + dur;
    const o = osc(v.wave || 'square'), g = ac.createGain();
    g.gain.value = 0;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    if (v.env === 'pluck') {
      g.gain.exponentialRampToValueAtTime(0.0001, Math.max(t + 0.05, Math.min(end, t + 0.4)));
    } else {
      g.gain.exponentialRampToValueAtTime(vol * 0.6, Math.max(t + 0.02, end - 0.03));
      g.gain.linearRampToValueAtTime(0.0001, end);
    }
    if (v.vib && dur > 0.35) {
      const l = ac.createOscillator(), lg = ac.createGain();
      l.frequency.value = 5.5;
      lg.gain.value = 0;
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.3, dur * 0.5));
      l.connect(lg);
      lg.connect(o.frequency);
      l.start(t);
      l.stop(end + 0.05);
    }
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(end + 0.05);
  }

  function playDrum(dest, kind, t, vol) {
    if (kind === 'k') {
      const o = ac.createOscillator(), g = ac.createGain();
      g.gain.value = 0;
      o.type = 'triangle';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.1);
      g.gain.setValueAtTime(vol * 0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g);
      g.connect(dest);
      o.start(t);
      o.stop(t + 0.16);
      return;
    }
    const snare = kind === 's', dur = snare ? 0.13 : kind === 'o' ? 0.18 : 0.035;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    g.gain.value = 0;
    src.buffer = noiseBuf;
    f.type = snare ? 'bandpass' : 'highpass';
    f.frequency.value = snare ? 1800 : 7000;
    f.Q.value = snare ? 0.7 : 0.5;
    g.gain.setValueAtTime(vol * (snare ? 0.3 : 0.1), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(t, Math.random() * 0.8);
    src.stop(t + dur + 0.02);
  }

  function startSong(name) {
    const def = window.MUSIC && MUSIC[name];
    if (!def) return;
    const out = ac.createGain();
    out.connect(musicBus);
    const voices = build(def);
    voices.forEach(x => { x.i = 0; x.loop = 0; });
    song = { name, out, voices, step: 60 / def.bpm / 4, start: ac.currentTime + 0.06 };
    pump();
  }

  function stopSong() {
    if (!song) return;
    const out = song.out, t = ac.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(0, t + 0.3);
    setTimeout(() => { try { out.disconnect(); } catch (e) { /* já desligado */ } }, 700);
    song = null;
  }

  // agenda as notas dos próximos `ahead` segundos (roda a cada 40 ms)
  function pump(ahead = 0.25) {
    if (!song || !ac) return;
    try {
      const now = ac.currentTime, until = now + ahead, s = song;
      s.voices.forEach(x => {
        const span = x.length * s.step;
        // a aba ficou escondida e o tempo passou: pula direto para a volta atual
        if (s.start + x.loop * span + x.ev[x.i].at * s.step < now - 1) {
          x.loop = Math.max(x.loop, Math.floor((now - s.start) / span));
          x.i = 0;
        }
        for (let n = 0; n < 100000; n++) {
          const e = x.ev[x.i];
          const t = s.start + x.loop * span + e.at * s.step;
          if (t > until) break;
          if (t >= now - 0.02) {
            if (x.drums) {
              for (const ch of e.drum) playDrum(s.out, ch, t, x.v.vol || 0.5);
            } else {
              const vol = (x.v.vol || 0.06) / Math.sqrt(e.ms.length);
              e.ms.forEach(m => playNote(s.out, x.v, m, t, e.len * s.step * x.gap, vol));
            }
          }
          if (++x.i >= x.ev.length) { x.i = 0; x.loop++; }
        }
      });
    } catch (e) { /* som é opcional */ }
  }

  // Para os testes (tools/devtools.js): toca `seconds` de uma música ou de um efeito num contexto
  // offline e devolve o pico e o volume médio (RMS) da saída, com o volume do config.js. Serve para
  // conferir o equilíbrio sem ouvir.
  function render(name, seconds = 8) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const keep = { ac, master, sfxBus, musicBus, noiseBuf, song, muted, p12: waves.pulse12, p25: waves.pulse25 };
    let job;
    try {
      ac = new OAC(1, Math.ceil(44100 * seconds), 44100);
      muted = false;
      graph();
      shift = 0.25;   // no instante 0 o limitador ainda abafa os sons curtos
      if (window.MUSIC && MUSIC[name]) { startSong(name); pump(seconds); }
      else if (SFX[name]) SFX[name]();
      job = ac.startRendering();
    } finally {
      shift = 0;
      ({ ac, master, sfxBus, musicBus, noiseBuf, song, muted } = keep);
      waves.pulse12 = keep.p12;
      waves.pulse25 = keep.p25;
    }
    return job.then(buf => {
      const d = buf.getChannelData(0);
      let peak = 0, at = 0, sum = 0;
      for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) { peak = v; at = i; } sum += v * v; }
      return { peak: +peak.toFixed(3), at: +(at / 44100).toFixed(3), rms: +Math.sqrt(sum / d.length).toFixed(4) };
    });
  }

  return {
    unlock,
    render,
    sfx(name) {
      try { if (SFX[name]) SFX[name](); } catch (e) { /* som é opcional */ }
    },
    music(name) {
      want = name || null;
      if (!ac) return;
      if (song && song.name === want) return;
      try {
        stopSong();
        if (want) startSong(want);
      } catch (e) { /* som é opcional */ }
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : volume();
      return muted;
    },
    get muted() { return muted; },
    get playing() { return song ? song.name : null; }
  };
})();
