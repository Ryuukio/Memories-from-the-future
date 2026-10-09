// F2 B1 · Cinema: Kimetsu no Yaiba (SPEC, seção 6)
// Saguão de cinema com fila organizada por cordas, bilheteria e pôsteres genéricos na parede (o
// nome do filme só aparece na legenda do HUD). Vigias: na fila do ingresso, andando aos pouquinhos
// para a frente com a fila; olham os pôsteres (cones para cima) e às vezes o saguão (para baixo).
// NPCs: as pessoas da fila, que andam junto e bloqueiam a passagem.
window.SCENES = window.SCENES || {};

// a fila anda 6 px aos 2,4 s e aos 8,4 s, e volta ao lugar no fim do loop de 12 s
const F2B1_QUEUE = [{ t: 2.4 }, { t: 0.6, to: 6 }, { t: 5.4 }, { t: 0.6, to: 12 }, { t: 3.0 }];
const f2b1Walker = (who, x, y, face) => ({
  who, x, y, face, size: [10, 6],
  loop: F2B1_QUEUE.map(s => (s.to !== undefined ? { t: s.t, to: [x + s.to, y] } : { t: s.t })).concat([{ t: 0.001, jump: [x, y] }])
});

SCENES.F2B1 = {
  look: {
    floor: 'cinema',
    wall: { style: 'cinema', height: 54 },
    edge: 'cinema',
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 18, y: 150, dir: 'right' },

  props: [
    { type: 'poster', x: 18, y: 8, art: 0 },
    { type: 'poster', x: 62, y: 8, art: 1 },
    { type: 'poster', x: 106, y: 8, art: 2 },
    { type: 'poster', x: 150, y: 8, art: 3 },
    { type: 'poster', x: 194, y: 8, art: 1 },
    { type: 'poster', x: 238, y: 8, art: 0 },
    { type: 'ticketBooth', x: 300, y: 18, textKey: 'boothText' },
    // as cordas da fila (a fila anda entre elas, para a direita, até a bilheteria)
    { type: 'ropeLine', x: 40, y: 58, w: 252 },
    { type: 'ropeLine', x: 40, y: 92, w: 252 },
    { type: 'ropeLine', x: 36, y: 60, v: true, h: 42 },
    // saguão: lixeiras e um banco
    { type: 'bin', x: 96, y: 150 },
    { type: 'bin', x: 300, y: 158 },
    { type: 'cafeTable', x: 196, y: 160 }
  ],

  movers: [
    f2b1Walker('CUSTOMER_GREY', 268, 86, 'right'),
    f2b1Walker('CUSTOMER_PINK', 248, 86, 'right'),
    f2b1Walker('CUSTOMER_TEAL', 228, 86, 'right'),
    f2b1Walker('CUSTOMER_BLACK', 152, 86, 'right'),
    f2b1Walker('CUSTOMER_LILAC', 132, 86, 'right'),
    f2b1Walker('CUSTOMER_GREEN', 112, 86, 'right'),
    f2b1Walker('CUSTOMER_ORANGE', 76, 86, 'right')
  ],

  // Loop de 12 s: os dois olham os pôsteres; o Fabio vira para o saguão aos 3,6 s e a Ellen aos
  // 8,8 s, cada um ~3 s varrendo o chão da esquerda para a direita. A fila anda junto.
  guards: [
    { who: 'FABIO_F2B', x: 174, y: 86, look: 270, range: 50, half: 26,
      loop: [
        { t: 2.4 },
        { t: 0.6, to: [180, 86] },
        { t: 0.6 },
        { t: 0.4, look: 150, range: 120, half: 30 },
        { t: 2.6, look: 80 },
        { t: 0.4, look: 270, range: 50, half: 26 },
        { t: 1.4 },
        { t: 0.6, to: [186, 86] },
        { t: 3.0 },
        { t: 0.001, jump: [174, 86] }
      ] },

    { who: 'ELLEN_F2B', x: 194, y: 86, look: 270, range: 50, half: 26,
      loop: [
        { t: 2.4 },
        { t: 0.6, to: [200, 86] },
        { t: 5.4 },
        { t: 0.6, to: [206, 86] },
        { t: 0.4, look: 120, range: 120, half: 30 },
        { t: 2.2, look: 45 },
        { t: 0.4, look: 270, range: 50, half: 26 },
        { t: 0.001, jump: [194, 86] }
      ] }
  ]
};
