// F2 C2 · Brazilian Day (SPEC, seção 6)
// Parque com barracas de comida brasileira (bandeirinhas verdes e amarelas, toldos verdes),
// multidão e uma árvore grande com sombra. Vigias: cinco amigos sentados em roda na sombra: o
// Fabio e a Ellen do passado, mais duas amigas e um amigo (Apêndice B). Os cones do Fabio e da
// Ellen apontam para dentro da roda; de vez em quando olham para fora, para as barracas.
// Janela: quando conversam dentro da roda. Obstáculos móveis: pessoas andando entre as barracas.
// A entrada é a porta do genkan do apartamento (no alto, à esquerda).
window.SCENES = window.SCENES || {};

SCENES.F2C2 = {
  look: {
    floor: 'festival',
    wall: { style: 'festivalSky', height: 28, shadow: false },
    edge: 'hedge',
    doors: { left: [34, 70], right: [96, 128] }
  },

  start: { x: 14, y: 60, dir: 'right' },

  props: [
    { type: 'stall', x: 70, y: 22, food: 0, textKey: 'stall1' },
    { type: 'stall', x: 240, y: 22, food: 1, textKey: 'stall2' },
    { type: 'stall', x: 312, y: 22, food: 2, textKey: 'stall3' },
    { type: 'stall', x: 26, y: 146, food: 2, textKey: 'stall3' },
    { type: 'stall', x: 270, y: 146, food: 0, textKey: 'stall1' },
    { type: 'bigTree', x: 56, y: 40 },
    { type: 'bunting', x: 0, y: 30, w: 384 },
    { type: 'bunting', x: 20, y: 136, w: 340 }
  ],

  npcs: [
    // os outros três amigos da roda
    { who: 'F2_FRIEND_1', pose: 'floor', dir: 'right', x: 180, y: 122 },
    { who: 'F2_FRIEND_2', pose: 'floor', dir: 'up', x: 192, y: 138 },
    { who: 'F2_FRIEND_3', pose: 'floor', dir: 'up', x: 210, y: 138 },
    // fila das barracas
    { who: 'CUSTOMER_RED', pose: 'stand', dir: 'up', x: 100, y: 80 },
    { who: 'CUSTOMER_TEAL', pose: 'stand', dir: 'up', x: 270, y: 80 },
    { who: 'CUSTOMER_GREY', pose: 'stand', dir: 'down', x: 300, y: 196 }
  ],

  // gente andando entre as barracas (bloqueia a passagem e tapa a visão)
  movers: [
    { who: 'CUSTOMER_BEIGE', x: 30, y: 98, face: 'right',
      loop: [{ t: 6, to: [360, 98] }, { t: 1, face: 'left' }, { t: 6, to: [30, 98] }, { t: 1, face: 'right' }] },
    { who: 'CUSTOMER_NAVY', x: 350, y: 168, face: 'left',
      loop: [{ t: 5, to: [110, 168] }, { t: 1.2, face: 'right' }, { t: 5, to: [350, 168] }, { t: 1.2, face: 'left' }] }
  ],

  // Loop de 10 s: conversam olhando para dentro da roda; o Fabio olha para fora (as barracas de
  // cima) aos 1,5 s e a Ellen (a saída, à direita, e as barracas de baixo) aos 6 s, cada um ~3 s.
  guards: [
    { who: 'FABIO_F2C2', x: 198, y: 106, pose: 'floor', face: 'down', look: 90, range: 30, half: 26,
      loop: [
        { t: 1.5 },
        { t: 0.4, look: 205, range: 110, half: 32 },
        { t: 2.8, look: 335 },
        { t: 0.4, look: 90, range: 30, half: 26 },
        { t: 4.9 }
      ] },

    { who: 'ELLEN_F2C2', x: 218, y: 122, pose: 'floor', face: 'left', look: 180, range: 30, half: 26,
      loop: [
        { t: 5.8 },
        { t: 0.4, look: 305, range: 124, half: 32 },
        { t: 1.6, look: 15 },                     // varre para a direita e desce (passando pelo 0°)
        { t: 1.6, look: 125 },
        { t: 0.4, look: 180, range: 30, half: 26 },
        { t: 0.2 }
      ] }
  ]
};
