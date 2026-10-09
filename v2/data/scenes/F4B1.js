// F4 B1 · Diving in Okinawa (SPEC, seção 6)
// Fundo do mar com corais, luz entrando de cima e bolhas. Debaixo d'água a Ellen anda mais devagar e
// com uma leve deriva (look.water). Vigias: nadam devagar em círculos ao redor de um coral, com o
// cone na direção do nado. Esconderijos móveis: cardumes que passam e tapam a visão.
window.SCENES = window.SCENES || {};

SCENES.F4B1 = {
  look: {
    floor: 'seabed',
    wall: { style: 'reef', height: 30, shadow: false },
    edge: 'reefRocks',                       // V2: pedras com alga, debaixo d'água (a da V1 era 'beachRocks')
    doors: { left: [96, 128], right: [96, 128] },
    water: { speed: 0.65, drift: 10 },
    // V2: debaixo d'água: tudo fica verde-azulado; mais claro perto da superfície
    tint: { color: '#BCD8E0', lights: [[96, -20, 150, '#000000', '#E8FAFF'], [288, -20, 150, '#000000', '#E8FAFF']] },
    light: { k: [0.05, 0.12], color: '#7A9AB0', contact: '#4A6A80' },
    coneLum: 0.35                             // o cone vermelho mais fundo, para aparecer na areia clara
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    { type: 'coral', x: 150, y: 82, w: 84 },
    { type: 'seaRock', x: 50, y: 150 },
    { type: 'seaRock', x: 300, y: 48 },
    { type: 'seaRock', x: 320, y: 160 },
    { type: 'coral', x: 40, y: 40, w: 40 },
    { type: 'underwater', x: 0, y: 0 }
  ],

  // cardumes passando (não bloqueiam a passagem, mas tapam a visão)
  movers: [
    { who: 'F4_VISITOR_1', prop: 'fishSchool', seed: 1, block: false, sight: true, size: [40, 16], x: -30, y: 70,
      loop: [{ t: 12, to: [420, 84] }, { t: 0.001, jump: [-30, 70] }] },
    { who: 'F4_VISITOR_1', prop: 'fishSchool', seed: 2, block: false, sight: true, size: [40, 16], x: 420, y: 150,
      loop: [{ t: 2 }, { t: 11, to: [-30, 140] }, { t: 0.001, jump: [420, 150] }] }
  ],

  // Loop de 10 s: os dois nadam em volta do coral, um do lado oposto do outro
  guards: [
    { who: 'FABIO_F4B1', x: 126, y: 116, pose: 'swim', range: 84, half: 28,
      loop: [
        { t: 2.5, to: [192, 70] },
        { t: 2.5, to: [258, 116] },
        { t: 2.5, to: [192, 160] },
        { t: 2.5, to: [126, 116] }
      ] },
    { who: 'ELLEN_F4B1', x: 258, y: 116, pose: 'swim', range: 84, half: 28,
      loop: [
        { t: 2.5, to: [192, 160] },
        { t: 2.5, to: [126, 116] },
        { t: 2.5, to: [192, 70] },
        { t: 2.5, to: [258, 116] }
      ] }
  ]
};
