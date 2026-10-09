// F3 B1 · Ski trip (SPEC, seção 6)
// Pista de esqui de cima a baixo, pinheiros com neve e o teleférico ao fundo. O Fabio desce a pista
// sem parar (some embaixo e reaparece no topo), com o cone na direção da descida. A Ellen, parada na
// lateral, filma com o celular: o cone dela segue o Fabio. Desafio: atravessar a pista da esquerda
// para a direita na hora certa. Neve funda nas bordas (mais lenta) e outros esquiadores descendo.
window.SCENES = window.SCENES || {};

SCENES.F3B1 = {
  look: {
    floor: 'ski',
    slope: [126, 262],
    wall: { style: 'skiMountains', height: 30, shadow: false },
    edge: 'snowTrees',
    // V2: tarde de céu limpo na montanha: sombras azuis, um pouco compridas para a direita
    light: { k: [0.45, 0.28], color: '#A6B6E2', contact: '#7686B8' },
    doors: { left: [96, 128], right: [96, 128] },
    slow: [[0, 30, 122, 162, 0.7], [266, 30, 118, 162, 0.7]]
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    { type: 'skiLift', x: 0, y: 0 },
    { type: 'pine', x: 18, y: 40 },
    { type: 'pine', x: 70, y: 150 },
    { type: 'pine', x: 30, y: 152 },
    { type: 'pine', x: 52, y: 48 },
    { type: 'pine', x: 288, y: 44 },
    { type: 'pine', x: 340, y: 40 },
    { type: 'pine', x: 300, y: 150 },
    { type: 'pine', x: 352, y: 146 }
  ],

  // outros esquiadores descendo (bloqueiam a passagem), cada um no seu ritmo
  movers: [
    { who: 'F3_SKIER_1', x: 150, y: 32, gear: 'ski', size: [12, 8],
      loop: [{ t: 0.9 }, { t: 1.4, to: [160, 110] }, { t: 1.2, to: [146, 190] }, { t: 0.001, jump: [150, 32] }, { t: 2.5 }] },
    { who: 'F3_SKIER_2', x: 238, y: 32, gear: 'ski', size: [12, 8],
      loop: [{ t: 3.4 }, { t: 1.5, to: [226, 112] }, { t: 1.3, to: [244, 190] }, { t: 0.001, jump: [238, 32] }] }
  ],

  // Loop de 5,2 s: o Fabio espera no topo olhando a pista (3 s) e desce em zigue-zague (2,2 s), some embaixo e
  // reaparece no topo. A Ellen filma do lado: o cone dela acompanha o Fabio o tempo todo.
  guards: [
    { who: 'FABIO_F3B1', id: 'fabio', x: 194, y: 34, gear: 'ski', look: 90, range: 120, half: 30,
      loop: [
        { t: 2.2, look: 90 },                         // olha a pista lá do topo
        { t: 0.6, to: [176, 76], range: 80 },
        { t: 0.6, to: [210, 118] },
        { t: 0.5, to: [180, 156] },
        { t: 0.5, to: [196, 192] },
        { t: 0.001, jump: [194, 34] },
        { t: 0.8, look: 90, range: 120 }
      ] },
    { who: 'ELLEN_F3B1', x: 96, y: 72, face: 'right', look: 0, range: 170, half: 22, track: 'fabio' }
  ]
};
