// F3 A2 · Shirakawa-go (SPEC, seção 6)
// Vilarejo com casas de telhado de palha cobertas de neve, torii de madeira, um pequeno santuário,
// árvores sem folhas com neve e o caminho de neve pisada. Vigias: andando pela rua do vilarejo, para
// lá e para cá, parando para olhar as casas; os cones vão na direção do movimento. Esconderijos: as
// casas e o santuário. Fora do caminho, a neve funda deixa a Ellen mais lenta.
window.SCENES = window.SCENES || {};

SCENES.F3A2 = {
  look: {
    floor: 'snow',
    path: [100, 132],
    wall: { style: 'snowHills', height: 34, shadow: false },
    edge: 'snowTrees',
    // V2: manhã de sol no inverno: sombras azuis na neve, para a direita
    light: { k: [0.55, 0.3], color: '#A6B6E2', contact: '#7686B8' },
    doors: { left: [96, 128], right: [96, 128] },
    slow: [[0, 34, 384, 64, 0.65], [0, 134, 384, 58, 0.65]]
  },

  start: { x: 14, y: 114, dir: 'right' },

  props: [
    { type: 'gassho', x: 26, y: 34 },
    { type: 'gassho', x: 150, y: 32, light: true },
    { type: 'shrine', x: 300, y: 50 },
    { type: 'torii', x: 298, y: 86 },
    { type: 'gassho', x: 70, y: 132, light: true },
    { type: 'gassho', x: 220, y: 136 },
    { type: 'bareTree', x: 226, y: 62 },
    { type: 'bareTree', x: 8, y: 140 },
    { type: 'bareTree', x: 330, y: 146 },
    { type: 'snowfall', x: 0, y: 0 }
  ],

  // Loop de 15 s: andam juntos para a direita (5 s), param para olhar uma casa de cima (2,5 s),
  // voltam para a esquerda (5 s) e param para olhar uma casa de baixo (2,5 s).
  guards: [
    { who: 'FABIO_F3A2', x: 90, y: 110, range: 92, half: 28,
      loop: [
        { t: 5.0, to: [250, 110] },
        { t: 0.5, look: 270, range: 70 },
        { t: 2.0 },
        { t: 5.0, to: [90, 110], range: 92 },
        { t: 0.5, look: 90, range: 70 },
        { t: 2.0, range: 92 }
      ] },
    { who: 'ELLEN_F3A2', x: 76, y: 124, range: 92, half: 28,
      loop: [
        { t: 5.0, to: [236, 124] },
        { t: 0.5, look: 300, range: 70 },
        { t: 2.0 },
        { t: 5.0, to: [76, 124], range: 92 },
        { t: 0.5, look: 60, range: 70 },
        { t: 2.0, range: 92 }
      ] }
  ]
};
