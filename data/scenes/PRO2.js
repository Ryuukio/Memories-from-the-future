// Prólogo, cena 2 (SPEC, seção 11.2): o quarto do apartamento (Apêndice C). O Fabio, de curativo
// na cabeça, sentado no colchão azul; a Ellen (cabelo platinado dourado) olhando para ele.
window.SCENES = window.SCENES || {};

SCENES.PRO2 = {
  look: {
    floor: 'aptWood',
    wall: { style: 'apt', height: 50 },
    edge: 'apt',
    doors: {}
  },

  start: { x: 192, y: 150, dir: 'up' },

  props: [
    { type: 'closet', x: 40, y: 10 },
    { type: 'curtainWindow', x: 160, y: 6 },
    { type: 'aircon', x: 290, y: 8 },
    { type: 'fluffyRug', x: 150, y: 118 },
    { type: 'mattress', x: 168, y: 52 },
    { type: 'lowTable', x: 236, y: 120 }
  ],

  npcs: [
    { id: 'fabio', who: 'FABIO_NOW', pose: 'floor', dir: 'down', x: 196, y: 104, solid: false },
    { id: 'ellen', who: 'ELLEN_HOME', pose: 'stand', dir: 'left', x: 236, y: 112 }
  ]
};
