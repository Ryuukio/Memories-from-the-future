// Fase 2 ("Late Summer"): acessórios das roupas (entram com `extras`; ver chars.js).
// Letras: x/X/y = material do acessório (base, sombra, detalhe), z = faixa, i = lente azul.
Object.assign(window.SPRITES, {
  // boné cáqui com os óculos azuis em cima (Fabio, F2 A2)
  F2_CAP: {
    down: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxiiiixxiiiixo.",
      "oxxiiiixxiiiixxo",
      "oxxxxxxxxxxxxxxo",
      "oyyyyyyyyyyyyyyo",
    ],
    side: [
      ".....ooooooo....",
      "...ooxxxxxxxoo..",
      "..oxxxxxxxxxxxo.",
      ".oxxxxxxxiiiixxo",
      ".oxxxxxxxxxxxxxo",
      ".oXXXXXXXyyyyyyo",
      "..........ooooo.",
    ],
    up: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxxxxxxxxxxxxo.",
      "oxxxxxxxxxxxxxxo",
      "oXXXXXyyyyXXXXXo",
    ],
  },
  // boné claro, sem os óculos (amiga 2 do Brazilian Day)
  F2_CAP_PLAIN: {
    down: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxxxxxxxxxxxxo.",
      "oxxxxxxxxxxxxxxo",
      "oxxxxxxxxxxxxxxo",
      "oyyyyyyyyyyyyyyo",
    ],
    side: [
      ".....ooooooo....",
      "...ooxxxxxxxoo..",
      "..oxxxxxxxxxxxo.",
      ".oxxxxxxxxxxxxxo",
      ".oxxxxxxxxxxxxxo",
      ".oXXXXXXXyyyyyyo",
      "..........ooooo.",
    ],
    up: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxxxxxxxxxxxxo.",
      "oxxxxxxxxxxxxxxo",
      "oXXXXXyyyyXXXXXo",
    ],
  },
  // chapéu de palha com faixa preta (Ellen, F2 A2)
  F2_STRAW_HAT: {
    down: [
      "....oooooooo....",
      "...oxxxxyxxxo...",
      "..oxxyxxxxxyxo..",
      "..oxxxxxxxxxxo..",
      ".ozzzzzzzzzzzzo.",
      "oxxxyxxxxxxyxxxo",
      "oXXXXXXXXXXXXXXo",
      ".oooooooooooooo.",
    ],
    side: [
      ".....oooooo.....",
      "....oxxxyxxo....",
      "...oxxyxxxxxo...",
      "...oxxxxxxxxo...",
      "..ozzzzzzzzzzo..",
      "oxxxyxxxxxxyxxxo",
      "oXXXXXXXXXXXXXXo",
      ".oooooooooooooo.",
    ],
    up: [
      "....oooooooo....",
      "...oxxxxyxxxo...",
      "..oxxyxxxxxyxo..",
      "..oxxxxxxxxxxo..",
      ".ozzzzzzzzzzzzo.",
      "oxxxyxxxxxxyxxxo",
      "oXXXXXXXXXXXXXXo",
      ".oooooooooooooo.",
    ],
  },
  // toalha rosa-clara no pescoço (Ellen, F2 A2)
  F2_TOWEL: {
    dy: 15,
    down: ["..otttttttttto..", "...ottTooTtto...", "....oto..oto...."],
    side: ["...otttttto.....", "....oTtto......."],
    up: ["..otttttttttto..", "...oTTTTTTTTo..."],
  },
  // máscara branca (Fabio, F2 C2): cobre o queixo e a boca
  F2_MASK: {
    dy: 10,
    down: [
      "................",
      "..oyyyyyyyyyyo..",
      ".oyyyyyyyyyyyyo.",
      "..oyyyyyyyyyyo..",
      "...ooyyyyyyoo...",
    ],
    side: [
      "................",
      "........oyyyyyo.",
      "........oyyyyyyo",
      "........oyyyyyo.",
      ".........oooyo..",
    ],
  },
  // óculos azuis em cima da cabeça (Fabio, F2 C2)
  F2_HEAD_GLASSES: {
    down: ["................", "................", "...oiiio.oiiio..", "...oooo...oooo.."],
    side: ["................", "................", ".........oiiiio.", "..........oooo.."],
    up: ["................", "................", "...oooooooooo...", "................"],
  },
  // coque (Ellen de cabelo preso, F2 C2): aparece de lado e de costas
  F2_BUN: {
    side: ["................", ".oooo...........", "ojHHjo..........", "ojhhjo..........", ".oooo..........."],
    up: ["................", ".....oooooo.....", "....ojHHhhjo....", "....ojhhhhjo....", ".....oooooo....."],
  },
  // compressa de gel na testa (Fabio doente, F2 C1)
  F2_GEL: {
    down: ["................", "................", "................", "................", "................", "....oyyyyyyo....", "....oyyyyyyo...."],
    side: ["................", "................", "................", "................", "................", "...........oyyo.", "...........oyyo."],
  },
});
