// Fase 2 ("Late Summer"): acessórios das roupas (entram com `extras`; ver chars.js), no tamanho da
// V2 (26 colunas; a cabeça vai da linha 1 à 20). Letras: x/X/y = material do acessório (base,
// sombra, detalhe), z = faixa, i = lente azul, t/T = toalha. "o" é contorno de dentro.
Object.assign(window.SPRITES, {
  // boné cáqui com os óculos azuis em cima (Fabio, F2 A2)
  F2_CAP: {
    down: symRows([
      "",
      ".........xxxx",
      "......xxxxxxx",
      ".....xxxxxxxx",
      "....xxoiiioxx",
      "....xxoiiioxx",
      "...xxxxxxxxxx",
      "...XXXXXXXXXX",
      "..yyyyyyyyyyy",
      "...XXXXXXXXXX",
    ]),
    side: padRows([
      "",
      "..........xxxxx",
      "........xxxxxxxxx",
      ".......xxxxxxxxxxx",
      "......xxxxxxxoiiiio",
      ".....xxxxxxxxxxxxxxx",
      ".....xxxxxxxxxxxxxxxx",
      "....XXXXXXXXXXXXXXXXX",
      "....XXXXXXXXXXXXXXyyyyyyy",
      "..................yyyyyy",
    ]),
    up: symRows([
      "",
      ".........xxxx",
      "......xxxxxxx",
      ".....xxxxxxxx",
      "....xxxxxxxxx",
      "....xxxxxxxxx",
      "...xxxxxxxxxx",
      "...XXXXXXyyyy",
      "...XXXXXXXXXX",
    ]),
  },
  // boné claro, sem os óculos (amiga 2 do Brazilian Day, amigo de Nara, Fabio em Tottori)
  F2_CAP_PLAIN: {
    down: symRows([
      "",
      ".........xxxx",
      "......xxxxxxx",
      ".....xxxxxxxx",
      "....xxxxxxxxx",
      "....xxxxxxxxx",
      "...xxxxxxxxxx",
      "...XXXXXXXXXX",
      "..yyyyyyyyyyy",
      "...XXXXXXXXXX",
    ]),
    side: padRows([
      "",
      "..........xxxxx",
      "........xxxxxxxxx",
      ".......xxxxxxxxxxx",
      "......xxxxxxxxxxxxx",
      ".....xxxxxxxxxxxxxxx",
      ".....xxxxxxxxxxxxxxxx",
      "....XXXXXXXXXXXXXXXXX",
      "....XXXXXXXXXXXXXXyyyyyyy",
      "..................yyyyyy",
    ]),
    up: symRows([
      "",
      ".........xxxx",
      "......xxxxxxx",
      ".....xxxxxxxx",
      "....xxxxxxxxx",
      "....xxxxxxxxx",
      "...xxxxxxxxxx",
      "...XXXXXXyyyy",
      "...XXXXXXXXXX",
    ]),
  },
  // chapéu de palha com faixa preta (Ellen, F2 A2)
  F2_STRAW_HAT: {
    down: symRows([
      "",
      ".........xxxx",
      "......xxxyxxx",
      ".....xxyxxxxx",
      ".....xxxxxxxx",
      ".....zzzzzzzz",
      "..xxxyxxxxxxx",
      ".xxxxxxxxxyxx",
      ".XXXXXXXXXXXX",
    ]),
    side: padRows([
      "",
      "..........xxxxx",
      "........xxxyxxxxx",
      ".......xxyxxxxxxxx",
      ".......xxxxxxxxxxx",
      ".......zzzzzzzzzzz",
      "...xxxxyxxxxxxxxxxxxx",
      "..xxxxxxxxxxyxxxxxxxxxx",
      "..XXXXXXXXXXXXXXXXXXXXX",
    ]),
    up: symRows([
      "",
      ".........xxxx",
      "......xxxyxxx",
      ".....xxyxxxxx",
      ".....xxxxxxxx",
      ".....zzzzzzzz",
      "..xxxyxxxxxxx",
      ".xxxxxxxxxyxx",
      ".XXXXXXXXXXXX",
    ]),
  },
  // toalha rosa-clara no pescoço (Ellen, F2 A2)
  F2_TOWEL: {
    dy: 19,
    down: symRows([".......tttttt", "......ttTTTTT", "......tt", "......tt", "......tT", "......tT", "......TT"]),
    side: padRows(["..........ttttttt", ".........tttTTTTt", ".........tt", ".........tT", "..........T"]),
    up: symRows([".......tttttt", "......tTTTTTT", "......tt"]),
  },
  // máscara branca (Fabio, F2 C2): cobre o queixo e a boca
  F2_MASK: {
    dy: 15,
    down: symRows([".....yyyyyyyy", "....yyyyyyyyy", "....yyyyyyyyy", ".....yyyyyyyy", ".......yyyyyy"]),
    side: padRows(["...............yyyyyyyy", "..............yyyyyyyyyy", "..............yyyyyyyyyy", "...............yyyyyyyy", ".................yyyyy"]),
  },
  // óculos azuis em cima da cabeça (Fabio, F2 C2)
  F2_HEAD_GLASSES: {
    down: symRows(["", "", "", ".....oooooo", ".....oiiiio", "......oooo"]),
    side: padRows(["", "", "", "", "..............oiiiiio", "...............ooooo"]),
    up: symRows(["", "", "", "", "....oooooooo"]),
  },
  // coque (Ellen de cabelo preso, F2 C2): aparece de lado e de costas
  F2_BUN: {
    side: padRows(["", "", "", "", "..hhhh", ".hHHhhh", ".hhhhhj", ".hhhhjj", "..jjjj"]),
    up: symRows(["", "", "..........hhh", ".........hHHh", ".........hhhh", ".........hhhj", "..........jjj"]),
  },
  // compressa de gel na testa (Fabio doente, F2 C1)
  F2_GEL: {
    dy: 8,
    down: symRows(["........yyyyy", ".......yyyyyy", "........yyyyy"]),
    side: padRows(["..................yyyyy", "..................yyyyyy", "..................yyyyy"]),
  },
});
