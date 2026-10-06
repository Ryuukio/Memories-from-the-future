// F1 B2 · Planetarium (SPEC, seção 6)
// Sala escura de planetário, cúpula com estrelas e luzes rosa e roxas, camas redondas azuis.
// Vigias: deitados lado a lado numa cama redonda azul (o primeiro beijo). Loop: olham o "céu"
// (cones para cima, ~3 s) → viram um para o outro e se beijam, de olhos fechados (sem cone,
// ~3 s) → sentam e olham em volta (os cones varrem a sala, ~2 s) → voltam a deitar.
// Janela: o beijo; enquanto olham o céu, também dá para passar pela parte de baixo da sala.
// NPCs: outros casais deitados nas camas, que bloqueiam a passagem.
window.SCENES = window.SCENES || {};

SCENES.F1B2 = {
  look: {
    floor: 'planetarium',
    wall: { style: 'dome', height: 46, shadow: false },
    edge: 'dark',
    doors: { left: [96, 128], right: [96, 128] },
    tint: { color: '#D8B8F2' }               // luz rosa e roxa da cúpula em todo mundo
  },

  start: { x: 14, y: 118, dir: 'right' },

  props: [
    { type: 'domeStars', x: 0, y: 0 },
    { type: 'roundBed', x: 36, y: 48 },
    { type: 'roundBed', x: 160, y: 54 },      // a cama do casal
    { type: 'roundBed', x: 296, y: 50 },
    { type: 'roundBed', x: 56, y: 140 },
    { type: 'roundBed', x: 172, y: 146 },
    { type: 'roundBed', x: 280, y: 136 }
  ],

  // os outros casais, deitados olhando o céu (um deles também se beijando)
  npcs: [
    { who: 'CUSTOMER_GREEN', pose: 'lie', x: 60, y: 84 },
    { who: 'CUSTOMER_TEAL', pose: 'lie', x: 76, y: 84 },
    { who: 'CUSTOMER_RED', pose: 'lie', x: 320, y: 86, head: 'right', eyes: 'closed' },
    { who: 'CUSTOMER_LILAC', pose: 'lie', x: 336, y: 86, head: 'left', eyes: 'closed' },
    { who: 'CUSTOMER_BEIGE', pose: 'lie', x: 80, y: 176 },
    { who: 'CUSTOMER_PINK', pose: 'lie', x: 96, y: 176 },
    { who: 'CUSTOMER_ORANGE', pose: 'lie', x: 196, y: 182 },
    { who: 'CUSTOMER_MINT', pose: 'lie', x: 212, y: 182 },
    { who: 'CUSTOMER_GREY', pose: 'lie', x: 304, y: 172 },
    { who: 'CUSTOMER_NAVY', pose: 'lie', x: 320, y: 172 }
  ],

  guards: [
    // a Ellen do passado, à esquerda (como na selfie do planetário)
    { who: 'ELLEN_F1', x: 184, y: 89, pose: 'lie', head: 'down',
      look: 270, range: 40, half: 26, heartAt: [8, -36],
      loop: [
        { t: 3.0 },                                                        // olha o céu
        { t: 0.3, head: 'right', eyes: 'closed', cone: false, fx: 'heart' }, // o beijo
        { t: 2.7 },
        { t: 0.3, pose: 'sit', face: 'down', head: null, eyes: 'open', cone: true, fx: null,
          look: 150, range: 104, half: 30 },                               // senta e olha em volta
        { t: 1.7, look: 60 },
        { t: 0.3 },
        { t: 0.3, pose: 'lie', head: 'down', look: 270, range: 40, half: 26 } // volta a deitar
      ] },

    { who: 'FABIO_F1', x: 200, y: 89, pose: 'lie', head: 'down',
      look: 270, range: 40, half: 26,
      loop: [
        { t: 3.0 },
        { t: 0.3, head: 'left', eyes: 'closed', cone: false },
        { t: 2.7 },
        { t: 0.3, pose: 'sit', face: 'down', head: null, eyes: 'open', cone: true,
          look: 30, range: 104, half: 30 },
        { t: 1.7, look: 120 },
        { t: 0.3 },
        { t: 0.3, pose: 'lie', head: 'down', look: 270, range: 40, half: 26 }
      ] }
  ]
};
