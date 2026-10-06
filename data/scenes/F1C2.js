// F1 C2 · A kiss in the park (SPEC, seção 6)
// Parque de bairro à noite: área aberta de terra cercada de árvores densas, um banco embaixo das
// árvores no fundo, um poste de luz (com mosquitos) e um brinquedo pequeno de parquinho.
// Vigias: sentados no banco. Abrem os olhos e olham o parque (cones para baixo, ~3 s) e depois
// se beijam de olhos fechados (sem cone, ~3 s). Janela: durante o beijo. Esconderijo: as árvores.
window.SCENES = window.SCENES || {};

SCENES.F1C2 = {
  look: {
    floor: 'dirtNight',
    wall: { style: 'nightTrees', height: 54, shadow: false },
    edge: 'trees',
    doors: { left: [96, 128], right: [96, 128] },
    // noite: tudo fica azulado, e os postes acendem um círculo de luz
    tint: { color: '#6C74B4', lights: [[241, 50, 56, '#4A3C1C'], [43, 140, 40, '#3A2E16']] }
  },

  start: { x: 18, y: 118, dir: 'right' },

  props: [
    { type: 'parkBench', x: 162, y: 48, view: 'front', night: true },
    { type: 'parkLamp', x: 236, y: 40, night: true, bugs: true },
    { type: 'parkLamp', x: 38, y: 126, night: true },
    { type: 'tree', x: 70, y: 100, night: true },
    { type: 'tree', x: 168, y: 120, night: true },
    { type: 'tree', x: 282, y: 92, night: true },
    { type: 'springRider', x: 318, y: 156 },
    { type: 'bush', x: 110, y: 172, night: true },
    { type: 'bush', x: 236, y: 170, night: true },
    { type: 'bush', x: 112, y: 52, night: true },
    { type: 'bush', x: 262, y: 54, night: true }
  ],

  guards: [
    // o Fabio do passado, à esquerda no banco
    { who: 'FABIO_F1', x: 186, y: 70, pose: 'sit', face: 'down',
      look: 90, range: 120, half: 26,
      loop: [
        { t: 1.5, look: 65 },                                            // olha o parque
        { t: 1.5, look: 115 },
        { t: 0.3, head: 'right', eyes: 'closed', cone: false },         // o beijo
        { t: 2.7 },
        { t: 0.3, head: null, eyes: 'open', cone: true, look: 90 }
      ] },

    { who: 'ELLEN_F1', x: 198, y: 70, pose: 'sit', face: 'down',
      look: 90, range: 120, half: 26, heartAt: [-6, -36],
      loop: [
        { t: 1.5, look: 115 },
        { t: 1.5, look: 65 },
        { t: 0.3, head: 'left', eyes: 'closed', cone: false, fx: 'heart' },
        { t: 2.7 },
        { t: 0.3, head: null, eyes: 'open', cone: true, fx: null, look: 90 }
      ] }
  ]
};
