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
    { type: 'roundBed', x: 32, y: 48 },
    { type: 'roundBed', x: 160, y: 54 },                      // a cama do casal
    { type: 'roundBed', x: 294, y: 50, pillows: 'right' },
    { type: 'roundBed', x: 52, y: 140, pillows: 'right' },
    { type: 'roundBed', x: 172, y: 146 },
    { type: 'roundBed', x: 286, y: 136 }
  ],

  // os outros casais, deitados olhando o céu (um deles também se beijando). Em cada cama, quem
  // deita em cima fica em (x + 34, y + 21) e quem deita embaixo em (x + 34, y + 34).
  npcs: [
    { who: 'CUSTOMER_GREEN', pose: 'lie', x: 66, y: 69 },
    { who: 'CUSTOMER_TEAL', pose: 'lie', x: 66, y: 82 },
    { who: 'CUSTOMER_LILAC', pose: 'lie', dir: 'right', x: 328, y: 71, head: 'down', eyes: 'closed' },
    { who: 'CUSTOMER_RED', pose: 'lie', dir: 'right', x: 328, y: 84, head: 'up', eyes: 'closed' },
    { who: 'CUSTOMER_PINK', pose: 'lie', dir: 'right', x: 86, y: 161 },
    { who: 'CUSTOMER_BEIGE', pose: 'lie', dir: 'right', x: 86, y: 174 },
    { who: 'CUSTOMER_MINT', pose: 'lie', x: 206, y: 167 },
    { who: 'CUSTOMER_ORANGE', pose: 'lie', x: 206, y: 180, head: 'up' },
    { who: 'CUSTOMER_NAVY', pose: 'lie', x: 320, y: 157 },
    { who: 'CUSTOMER_GREY', pose: 'lie', x: 320, y: 170 }
  ],

  guards: [
    // a Ellen do passado em cima e o Fabio embaixo, deitados com a cabeça na almofada da esquerda
    // Loop de 9,4 s: céu (3 s) → beijo (3 s) → sentam e olham a sala (3,1 s; os cones andam da
    // esquerda para a direita, junto com quem passa) → deitam. Janela: o céu e o beijo (6 s).
    // Sentados (de pernas cruzadas), ficam lado a lado no meio da cama, de frente para a sala.
    { who: 'ELLEN_F1', x: 194, y: 75, pose: 'lie', face: 'left',
      look: 270, range: 40, half: 26, heartAt: [-8, -2],
      loop: [
        { t: 3.0 },                                                       // olha o céu
        { t: 0.3, head: 'down', eyes: 'closed', cone: false, fx: 'heart' }, // o beijo
        { t: 2.7 },
        { t: 0.3, pose: 'floor', face: 'down', head: null, eyes: 'open', cone: true, fx: null,
          to: [186, 84], look: 150, range: 104, half: 30 },               // senta e olha em volta
        { t: 0.8 },
        { t: 1.6, look: 75 },
        { t: 0.4 },
        { t: 0.3, pose: 'lie', face: 'left', head: 'sky', to: [194, 75],
          look: 270, range: 40, half: 26 }                                // volta a deitar
      ] },

    { who: 'FABIO_F1', x: 194, y: 88, pose: 'lie', face: 'left',
      look: 270, range: 40, half: 26,
      loop: [
        { t: 3.0 },
        { t: 0.3, head: 'up', eyes: 'closed', cone: false },
        { t: 2.7 },
        { t: 0.3, pose: 'floor', face: 'down', head: null, eyes: 'open', cone: true,
          to: [202, 84], look: 105, range: 104, half: 30 },
        { t: 0.8 },
        { t: 1.6, look: 30 },
        { t: 0.4 },
        { t: 0.3, pose: 'lie', face: 'left', head: 'sky', to: [194, 88],
          look: 270, range: 40, half: 26 }
      ] }
  ]
};
