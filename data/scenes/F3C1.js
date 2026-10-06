// F3 C1 · Himeji Castle (SPEC, seção 6)
// O castelo branco de Himeji no fundo (topo da tela), a muralha de pedra, cerejeiras floridas,
// pétalas caindo e o chão de terra clara. Vigias: passeando devagar debaixo das cerejeiras; param
// para olhar o castelo (cones para cima) e depois viram para o caminho (para baixo).
// Esconderijos: os troncos das cerejeiras. NPCs: turistas.
window.SCENES = window.SCENES || {};

SCENES.F3C1 = {
  look: {
    floor: 'lightDirt',
    wall: { style: 'himeji', height: 80, shadow: false },
    edge: 'hedge',
    // a passagem da direita fica embaixo, alinhada com o caminho de Nara (a lagoa ocupa o alto do F3 C2)
    doors: { left: [96, 128], right: [136, 186] }
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    { type: 'cherry', x: 30, y: 86 },
    { type: 'cherry', x: 132, y: 126 },
    { type: 'cherry', x: 246, y: 84 },
    { type: 'cherry', x: 318, y: 128 },
    { type: 'stoneLantern', x: 112, y: 84 },
    { type: 'stoneLantern', x: 214, y: 166 },
    { type: 'petals', x: 0, y: 0 }
  ],

  npcs: [
    { who: 'F3_TOURIST_1', pose: 'stand', dir: 'up', x: 186, y: 96 },
    { who: 'F3_TOURIST_2', pose: 'stand', dir: 'left', x: 92, y: 172 }
  ],

  // Loop de 16 s: andam para a direita, param para olhar o castelo (2,5 s), viram para o caminho e
  // varrem o chão (~2 s), voltam para a esquerda e fazem o mesmo do outro lado.
  guards: [
    { who: 'FABIO_F3C1', x: 120, y: 132, range: 92, half: 28,
      loop: [
        { t: 3.5, to: [210, 132] },
        { t: 0.5, look: 270, range: 92 },
        { t: 2.0 },
        { t: 0.5, look: 140, range: 104, half: 30 },
        { t: 1.6, look: 60 },
        { t: 3.5, to: [120, 132], range: 92, half: 28 },
        { t: 0.5, look: 270 },
        { t: 2.0 },
        { t: 0.5, look: 140, range: 104, half: 30 },
        { t: 1.4, look: 70, range: 92, half: 28 }
      ] },
    { who: 'ELLEN_F3C1', x: 104, y: 146, range: 92, half: 28,
      loop: [
        { t: 3.5, to: [194, 146] },
        { t: 0.5, look: 280, range: 92 },
        { t: 2.0 },
        { t: 0.5, look: 150, range: 104, half: 30 },
        { t: 1.6, look: 70 },
        { t: 3.5, to: [104, 146], range: 92, half: 28 },
        { t: 0.5, look: 280 },
        { t: 2.0 },
        { t: 0.5, look: 150, range: 104, half: 30 },
        { t: 1.4, look: 80, range: 92, half: 28 }
      ] }
  ]
};
