// Músicas (SPEC, seção 9): chiptune gerado por código, em loop. Quem toca é o Sound (sound.js).
//
// Cada música:
//   bpm      batidas por minuto; o passo é a semicolcheia (4 passos por batida)
//   bar      passos por compasso (16 = 4/4, 12 = 3/4)
//   chords   um acorde por compasso ('C:8 G:8' = meio compasso cada). Tipos: C, Cm, C7, Cm7, Cmaj7,
//            Cdim, Csus4. O baixo e o arpejo saem dos acordes.
//   lead     a melodia: notas 'E5:2' (nota, oitava e duração em `unit` passos; sem ':' = 1),
//            'r:2' = silêncio, '|' só separa os compassos para ler
//   bass     estilo: root, eighths, octave, fifth, drive, long, tresillo, bossa, waltz, tremolo
//   arp      estilo: up (semicolcheias), up8 (colcheias), stab (contratempos), waltz (2º e 3º tempos)
//   drums    um símbolo por passo: k bumbo, s caixa, h chimbal, o chimbal aberto, . nada ('ks' = juntos)
// Ondas: square, pulse25, pulse12 (pulso estreito, mais "8 bits"), triangle. vol = volume de cada voz,
// vib = vibrato nas notas longas, env 'pluck' = nota que morre logo (caixinha de música).
window.MUSIC = {
  // título: o tema do jogo (IV–V–iii–vi), nostálgico
  title: {
    bpm: 96, bar: 16, chords: 'F G Em Am Dm G C C',
    lead: { wave: 'pulse25', vol: 0.075, unit: 2, vib: true,
      notes: 'F5:3 E5 C5:2 A4:2 | B4:3 C5 D5:2 G4:2 | G5:3 F5 E5:2 B4:2 | C5:6 r:2 | F5:3 E5 D5:2 A4:2 | B4:2 D5:2 G5:2 F5:2 | E5:6 D5:2 | C5:6 r:2' },
    bass: { wave: 'triangle', vol: 0.2, style: 'fifth', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.022, style: 'up', oct: 4 },
    drums: { vol: 0.5, notes: 'k . . . h . . . s . . . h . . h' }
  },

  // prólogo: o vilão chegando (tensa)
  tense: {
    bpm: 132, bar: 16, chords: 'Em Em C B7',
    lead: { wave: 'pulse25', vol: 0.07, unit: 2,
      notes: 'B4:2 C5 B4 A#4:2 B4:2 | E5:3 D#5 E5:2 G5:2 | E5:2 C5:2 G4:2 C5:2 | B4:4 D#5:2 F#5:2' },
    bass: { wave: 'triangle', vol: 0.22, style: 'drive', oct: 2 },
    drums: { vol: 0.55, notes: 'k . h k s . h . k . h k s . h h' }
  },

  // prólogo: o apartamento (ele não lembra dela)
  sad: {
    bpm: 72, bar: 16, chords: 'Am F C E',
    lead: { wave: 'triangle', vol: 0.16, unit: 2, vib: true,
      notes: 'E5:4 D5:2 C5:2 | C5:4 A4:4 | G4:2 C5:2 E5:2 D5:2 | B4:4 G#4:4' },
    bass: { wave: 'triangle', vol: 0.16, style: 'long', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.02, style: 'up8', oct: 4 }
  },

  // laboratório e tela da máquina (curiosa)
  lab: {
    bpm: 108, bar: 16, chords: 'Dm7 G7 Dm7 Am7',
    lead: { wave: 'pulse25', vol: 0.07, unit: 2, env: 'pluck',
      notes: 'D5 F5 A5:2 G5 F5 E5:2 | D5 B4 G4:2 F5:2 D5:2 | C5 D5 F5:2 A5 C6 A5:2 | G5:3 E5 C5:2 E5:2' },
    bass: { wave: 'triangle', vol: 0.2, style: 'fifth', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.024, style: 'stab', oct: 4 },
    drums: { vol: 0.4, notes: 'k . . h . . h . s . . h . . h .' }
  },

  // fase 1: o primeiro encontro, tarde de verão
  f1: {
    bpm: 116, bar: 16, chords: 'G Em C D G Em Am7 D7',
    lead: { wave: 'pulse25', vol: 0.07, unit: 2, vib: true,
      notes: 'B4:2 D5:2 G5:3 F#5 | E5:2 G5:2 B4:4 | C5:2 E5:2 G5:2 E5:2 | F#5:4 D5:2 A4:2 | B4:2 D5:2 G5:3 A5 | B5:3 A5 G5:2 E5:2 | C5:2 E5:2 A5:2 G5:2 | F#5:3 E5 D5:2 C5:2' },
    bass: { wave: 'triangle', vol: 0.2, style: 'octave', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.02, style: 'up', oct: 4 },
    drums: { vol: 0.5, notes: 'k . h . s . h . k k h . s . h .' }
  },

  // fase 2: fim de verão (praia, festa), mais saltitante
  f2: {
    bpm: 128, bar: 16, chords: 'F Bb C F Dm Bb C C',
    lead: { wave: 'square', vol: 0.055, unit: 2,
      notes: 'A4 C5 F5:2 r F5 G5 A5 | Bb5:2 A5 G5 F5:2 D5:2 | E5:2 G5:2 C5:2 E5 G5 | F5:4 r:2 C5 D5 | F5:2 A5:2 D6:2 C6 A5 | Bb5:2 F5:2 D5:2 F5:2 | G5:2 E5 F5 G5:2 Bb5:2 | G5:3 F5 E5:2 r:2' },
    bass: { wave: 'triangle', vol: 0.22, style: 'tresillo', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.024, style: 'stab', oct: 4 },
    drums: { vol: 0.5, notes: 'k . h . s . h k . k h . s . h .' }
  },

  // fase 3: as estações (neve e primavera), valsa de caixinha de música
  f3: {
    bpm: 132, bar: 12, chords: 'D Bm G A D F#m G A',
    lead: { wave: 'pulse25', vol: 0.11, unit: 2, env: 'pluck',
      notes: 'A5:3 F#5 D5:2 | F#5:3 D5 B4:2 | D5:2 G5:2 B5:2 | A5:4 E5:2 | F#5:3 G5 A5:2 | C#6:3 B5 A5:2 | B5:2 A5 G5 D5:2 | E5:4 C#5:2' },
    bass: { wave: 'triangle', vol: 0.26, style: 'waltz', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.032, style: 'waltz', oct: 4 },
    drums: { vol: 0.4, notes: 'k . . . h . . . h . . .' }
  },

  // fase 4: ilhas, alianças e lanternas (noite, escala pentatônica)
  f4: {
    bpm: 100, bar: 16, chords: 'Am7 Dm7 Fmaj7 Em7 Am7 Dm7 Fmaj7 Em7',
    lead: { wave: 'pulse25', vol: 0.07, unit: 2, vib: true,
      notes: 'E5:2 G5:2 A5:3 G5 | E5:2 D5:2 C5:2 D5:2 | A4:2 C5:2 D5:2 E5:2 | D5:6 r:2 | A5:2 C6:2 D6:3 C6 | A5:2 G5:2 E5:4 | G5:2 E5:2 D5:2 C5:2 | B4:2 D5:2 E5:4' },
    bass: { wave: 'triangle', vol: 0.2, style: 'long', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.02, style: 'up8', oct: 4 },
    drums: { vol: 0.45, notes: 'k . . . . . k . s . . . . . . .' }
  },

  // fase 5: a livraria-café, hoje (bossa calma)
  shop: {
    bpm: 104, bar: 16, chords: 'Cmaj7 Am7 Dm7 G7',
    lead: { wave: 'pulse25', vol: 0.065, unit: 2, vib: true,
      notes: 'E5:3 G5 B5:2 A5:2 | G5:3 E5 C5:4 | F5:3 A5 C6:2 B5 A5 | G5:4 F5:2 D5:2' },
    bass: { wave: 'triangle', vol: 0.2, style: 'bossa', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.022, style: 'stab', oct: 4 },
    drums: { vol: 0.35, notes: 'k . h . . s h . k . h . . s h .' }
  },

  // batalha
  battle: {
    bpm: 152, bar: 16, chords: 'Em C D B7 Em C Am B7',
    lead: { wave: 'square', vol: 0.055, unit: 2,
      notes: 'E5 E5 G5 E5 B5:2 A5 G5 | G5:2 E5 C5 E5:2 G5:2 | F#5 F#5 A5 F#5 D6:2 C6 A5 | B5:2 A5:2 F#5:2 D#5:2 | E5 G5 B5 E6 D6:2 B5:2 | C6:2 B5 G5 E5:2 G5:2 | A5:2 C6:2 E6:2 D6 C6 | B5:3 A5 F#5:2 D#5:2' },
    bass: { wave: 'triangle', vol: 0.22, style: 'drive', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.02, style: 'up', oct: 4 },
    drums: { vol: 0.55, notes: 'k . h . s . h k k . h . s . s s' }
  },

  // o discurso de transformação do vilão: sobe meio tom a cada compasso
  transform: {
    bpm: 120, bar: 16, chords: 'Em Fm F#m Gm G#m Am A#m Bm',
    lead: { wave: 'square', vol: 0.05, unit: 1, vib: true,
      notes: 'E4:4 B4:4 E5:8 | F4:4 C5:4 F5:8 | F#4:4 C#5:4 F#5:8 | G4:4 D5:4 G5:8 | G#4:4 D#5:4 G#5:8 | A4:4 E5:4 A5:8 | A#4:4 F5:4 A#5:8 | B4:4 F#5:4 B5:8' },
    bass: { wave: 'triangle', vol: 0.22, style: 'tremolo', oct: 2 },
    drums: { vol: 0.5, notes: 'ks . s . s . s . s s s s s s s s' }
  },

  // final: o tema do título, devagar e calmo
  ending: {
    bpm: 76, bar: 16, chords: 'Fmaj7 G Em7 Am7 Dm7 G7 Cmaj7 C',
    lead: { wave: 'triangle', vol: 0.17, unit: 2, vib: true,
      notes: 'F5:3 E5 C5:2 A4:2 | B4:3 C5 D5:2 G4:2 | G5:3 F5 E5:2 B4:2 | C5:6 r:2 | F5:3 E5 D5:2 A4:2 | B4:2 D5:2 G5:2 F5:2 | E5:6 D5:2 | C5:6 r:2' },
    bass: { wave: 'triangle', vol: 0.15, style: 'long', oct: 2 },
    arp: { wave: 'pulse12', vol: 0.02, style: 'up8', oct: 4 }
  }
};
