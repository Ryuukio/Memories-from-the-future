// F2 A2 · Shaved ice by the sea (SPEC, seção 6)
// A mesma praia, perto das barracas (umi-no-ie). Vigias: em duas cadeiras de praia lado a lado, de
// frente para o mar (cones para cima), comendo raspadinha rosa. De vez em quando os dois viram para
// olhar as barracas (cones para baixo). Janela: quando olham o mar. Esconderijo: atrás das barracas.
window.SCENES = window.SCENES || {};

SCENES.F2A2 = {
  look: {
    floor: 'beach',
    sea: [40, 78],
    wall: { style: 'beachSky', height: 40, shadow: false },
    edge: 'beachRocks',
    doors: { left: [100, 188], right: [100, 188] }
  },

  start: { x: 14, y: 150, dir: 'right' },

  props: [
    { type: 'block', x: 0, y: 40, w: 384, h: 40 },
    { type: 'umbrella', x: 150, y: 76, color: '#F07A9A' },
    { type: 'beachChair', x: 170, y: 90, color: '#3A78C8' },
    { type: 'beachChair', x: 194, y: 90, color: '#F07A9A' },
    { type: 'floatRing', x: 236, y: 92, color: '#5DA8D8' },
    { type: 'beachHut', x: 40, y: 138, color: '#3A78C8' },
    { type: 'beachHut', x: 160, y: 138, color: '#D8443A' },
    { type: 'beachHut', x: 280, y: 138, color: '#5DAA62' },
    { type: 'beachTowel', x: 312, y: 90, color: '#F2C14E' }
  ],

  npcs: [
    { who: 'F2_STAFF', pose: 'stand', dir: 'down', x: 200, y: 156, solid: false },
    { who: 'F2_BEACH_2', pose: 'sit', dir: 'up', x: 324, y: 112 }
  ],

  // Loop de 11 s: olham o mar (5 s); os dois viram para as barracas e varrem a areia por ~3 s, o
  // Fabio a metade da esquerda e a Ellen a da direita (os cones andam da esquerda para a direita,
  // junto com quem passa); voltam a olhar o mar. As barracas tapam a visão: dá para passar por
  // trás delas, e os vãos entre uma e outra são o perigo.
  guards: [
    { who: 'FABIO_F2A2', x: 178, y: 110, pose: 'sit', face: 'up',
      look: 270, range: 60, half: 24,
      loop: [
        { t: 5.0 },
        { t: 0.4, look: 165, range: 130, half: 30 },
        { t: 3.0, look: 95 },
        { t: 0.4, look: 270, range: 60, half: 24 },
        { t: 2.2 }
      ] },

    { who: 'ELLEN_F2A2', x: 202, y: 110, pose: 'sit', face: 'up',
      look: 270, range: 60, half: 24,
      loop: [
        { t: 5.4 },
        { t: 0.4, look: 85, range: 130, half: 30 },
        { t: 3.0, look: 15 },
        { t: 0.4, look: 270, range: 60, half: 24 },
        { t: 1.8 }
      ] }
  ]
};
