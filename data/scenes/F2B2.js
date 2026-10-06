// F2 B2 · Cinema: popcorn (SPEC, seção 6)
// Balcão de pipoca e bebidas, máquina de pipoca, mesinhas. Vigias: esperando no balcão (cones para
// cima); de vez em quando viram para trás (cones para baixo). NPC: a atendente atrás do balcão.
window.SCENES = window.SCENES || {};

SCENES.F2B2 = {
  look: {
    floor: 'cinema',
    wall: { style: 'cinema', height: 54 },
    edge: 'cinema',
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    { type: 'cinemaMenu', x: 70, y: 14 },
    { type: 'cinemaMenu', x: 150, y: 14 },
    { type: 'cinemaMenu', x: 230, y: 14 },
    { type: 'popcornCounter', x: 60, y: 46, w: 240 },
    { type: 'cafeTable', x: 40, y: 150 },
    { type: 'cafeTable', x: 120, y: 160 },
    { type: 'cafeTable', x: 260, y: 154 },
    { type: 'bin', x: 336, y: 150 },
    { type: 'plant', x: 350, y: 60 }
  ],

  npcs: [
    { who: 'F2_STAFF', pose: 'stand', dir: 'down', x: 150, y: 66, solid: false },
    { who: 'CUSTOMER_MINT', pose: 'stand', dir: 'up', x: 252, y: 104 }
  ],

  // Loop de 11 s: esperam a pipoca olhando o balcão; o Fabio vira para trás aos 3 s e a Ellen aos
  // 6,6 s, cada um ~3 s olhando o saguão (o cone anda da esquerda para a direita).
  guards: [
    { who: 'FABIO_F2B', x: 168, y: 104, look: 270, range: 40, half: 26,
      loop: [
        { t: 3.0 },
        { t: 0.4, look: 160, range: 124, half: 30 },
        { t: 2.8, look: 85 },
        { t: 0.4, look: 270, range: 40, half: 26 },
        { t: 4.4 }
      ] },

    { who: 'ELLEN_F2B', x: 190, y: 104, look: 270, range: 40, half: 26,
      loop: [
        { t: 6.6 },
        { t: 0.4, look: 95, range: 124, half: 30 },
        { t: 2.8, look: 20 },
        { t: 0.4, look: 270, range: 40, half: 26 },
        { t: 0.8 }
      ] }
  ]
};
