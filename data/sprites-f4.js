// Fase 4 ("Islands, Rings & Lanterns"): acessórios das roupas (entram com `extras`; ver chars.js).
// Letras: x/X/y = material (base, sombra, detalhe), i = lente/vidro, t = tira.
Object.assign(window.SPRITES, {
  // boné preto virado para trás (Fabio, aquário): a aba aparece atrás
  F4_CAP_BACK: {
    down: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxxxxxxxxxxxxo.",
      "oxxXXXXXXXXXXxxo",
    ],
    side: [
      ".....ooooooo....",
      "...ooxxxxxxxoo..",
      "..oxxxxxxxxxxxo.",
      "ooxxxxxxxxxxxxxo",
      "oyyyyyXXXXXXXXXo",
      "ooooo...........",
    ],
    up: [
      "....oooooooo....",
      "..ooxxxxxxxxoo..",
      ".oxxxxxxxxxxxxo.",
      ".oxxxxXXXXxxxxo.",
      "oxxxxyyyyyyxxxxo",
      "...oyyyyyyyyo...",
      "....oooooooo....",
    ],
  },
  // máscara de mergulho com snorkel (lente i, armação x, tira t)
  F4_DIVE_MASK: {
    down: [
      "................", "................", "................", "................", "................",
      "................",
      "otttttttttttttto",
      "oxxxxxxxxxxxxxxo",
      "oxiiiiixxiiiiixo",
      "oxiiyiixxiiyiixo",
      "oxxxxxxxxxxxxxxo",
      "..............zo",
      "..............zo",
    ],
    side: [
      "................", "................", "................", "........z.......", "........z.......",
      "........z.......",
      "otttttttzttxxxxo",
      ".........xxiiiio",
      ".........xiiyiio",
      ".........xxxxxxo",
    ],
    up: [
      "................", "................", "................", "...........z....", "...........z....",
      "...........z....",
      "otttttttttttzttto",
      "................",
    ],
  },
  // rabo de cavalo (Ellen, Tottori): de lado e de costas, caindo atrás da cabeça
  F4_PONYTAIL: {
    side: ["................", "................", "................", "................", "................",
      "................", "ohho............", "ohHo............", "ojho............", ".ojho...........", ".ojjo...........", "..oo............"],
    up: ["................", "................", "................", "................", "................",
      "................", "......ozzo......", ".....ohHhho.....", ".....ohhhjo.....", "......ohjo......", "......ohjo......", ".......oo......."],
    under: false,
  },
  // óculos escuros em cima da cabeça (Ellen, Yanai)
  F4_HEAD_SUNGLASSES: {
    down: ["................", "................", "...oiiio.oiiio..", "...oooo...oooo.."],
    side: ["................", "................", ".........oiiiio.", "..........oooo.."],
    up: ["................", "................", "...oooooooooo...", "................"],
  },
});
