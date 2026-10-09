// F4 B2 · Making our rings (SPEC, seção 6)
// Oficina de alianças: teto de ripas de madeira com lâmpadas penduradas, vitrines de vidro com anéis
// e a bancada de trabalho perto de uma janela, à esquerda. Sem logo. Vigias: sentados lado a lado na
// bancada, de avental verde-oliva, trabalhando nos anéis (cones curtos, para a bancada); de vez em
// quando levantam a cabeça para mostrar o anel um para o outro e olham o salão (os cones varrem a
// oficina). Obstáculo móvel: o instrutor andando pela oficina.
window.SCENES = window.SCENES || {};

SCENES.F4B2 = {
  look: {
    floor: 'workshop',
    wall: { style: 'workshop', height: 52 },
    edge: 'wood',
    // V2: as lâmpadas quentes da loja: sombras curtas
    light: { k: [0.06, 0.14], color: '#B4A8A0', contact: '#7E6E66' },
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 14, y: 116, dir: 'right' },

  props: [
    { type: 'workbench', x: 60, y: 52, w: 100 },
    { type: 'ringCase', x: 214, y: 60 },
    { type: 'ringCase', x: 296, y: 60 },
    { type: 'ringCase', x: 250, y: 150 },
    { type: 'ringCase', x: 120, y: 160 },
    { type: 'plant', x: 352, y: 48 },
    { type: 'bulbs', x: 40, y: 46, n: 6, gap: 60 }
  ],

  // o instrutor dando a volta na oficina
  movers: [
    { who: 'F4_INSTRUCTOR', x: 200, y: 120, face: 'right',
      loop: [{ t: 3.5, to: [340, 120] }, { t: 1 }, { t: 2, to: [340, 176] }, { t: 3.5, to: [200, 176] }, { t: 1 }, { t: 2, to: [200, 120] }] }
  ],

  // Loop de 12 s: trabalham olhando a bancada; o Fabio mostra o anel para a Ellen e olha o salão aos
  // 2,5 s; a Ellen faz o mesmo aos 8 s (cada um ~3 s varrendo a oficina).
  guards: [
    { who: 'FABIO_F4B2', x: 92, y: 88, pose: 'sit', face: 'up', look: 270, range: 26, half: 28,
      loop: [
        { t: 2.5 },
        { t: 0.4, look: 0, range: 40 },                // mostra o anel para a Ellen
        { t: 0.8 },
        { t: 0.4, look: 150, range: 118, half: 30 },  // e olha o salão
        { t: 2.4, look: 40 },
        { t: 0.4, look: 270, range: 26, half: 28 },
        { t: 5.1 }
      ] },
    { who: 'ELLEN_F4B2', x: 118, y: 88, pose: 'sit', face: 'up', look: 270, range: 26, half: 28,
      loop: [
        { t: 7.6 },
        { t: 0.4, look: 180, range: 40 },
        { t: 0.6 },
        { t: 0.4, look: 140, range: 118, half: 30 },
        { t: 2.4, look: 30 },
        { t: 0.4, look: 270, range: 26, half: 28 },
        { t: 0.2 }
      ] }
  ]
};
