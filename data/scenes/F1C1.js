// F1 C1 · Dinner at Saizeriya (SPEC, seção 6)
// Restaurante familiar italiano genérico, sem logo: mesas com sofá verde, quadros clássicos na
// parede, drink bar (máquinas de bebida) e o garçom.
// Vigias: sentados frente a frente comendo massa, olhando um para o outro (cones na horizontal,
// sobre a mesa). De vez em quando um olha para a máquina de bebidas, e o cone vai para o
// corredor. Janela: quando conversam olhando um para o outro.
// Obstáculo móvel: o garçom andando entre as mesas (bloqueia a passagem e a visão, mas não vê).
//
// Cada mesa de sofá na parte de baixo: sofá (encosto à esquerda) em bx, pessoa em bx+12, mesa
// em bx+20, pessoa em bx+54, sofá (encosto à direita) em bx+50.
window.SCENES = window.SCENES || {};

SCENES.F1C1 = {
  look: {
    floor: 'terracotta',
    wall: { style: 'saizeriya', height: 44 },
    edge: 'wood',
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 20, y: 118, dir: 'right' },

  props: [
    // parede: quadros, janela do fim de tarde e o drink bar
    { type: 'painting', x: 26, y: 8, art: 1 },
    { type: 'duskWindow', x: 96, y: 6 },
    { type: 'painting', x: 246, y: 8, art: 0 },
    { type: 'painting', x: 330, y: 8, art: 1 },
    { type: 'drinkBar', x: 164, y: 26 },

    // mesas de cima, encostadas na parede
    { type: 'sofa', dir: 'down', x: 28, y: 44, w: 60 },
    { type: 'diningTable', x: 30, y: 64, w: 56, h: 18, food: [['pizza', 6, 3], ['glass', 24, 4], ['salad', 38, 4]] },
    { type: 'sofa', dir: 'down', x: 274, y: 44, w: 60 },
    { type: 'diningTable', x: 276, y: 64, w: 56, h: 18, food: [['pasta', 6, 4], ['glass', 22, 3], ['pasta', 36, 4]] },

    // mesas de baixo (a do meio é a do casal)
    { type: 'sofa', dir: 'right', x: 40, y: 140, h: 40 },
    { type: 'diningTable', x: 60, y: 146, w: 26, h: 24, food: [['pasta', 2, 3], ['glass', 18, 12]] },
    { type: 'sofa', dir: 'left', x: 90, y: 140, h: 40 },

    { type: 'sofa', dir: 'right', x: 160, y: 140, h: 40 },
    { type: 'diningTable', x: 180, y: 146, w: 26, h: 24, food: [['pasta', 1, 2], ['pasta', 14, 12], ['glass', 19, 2]] },
    { type: 'sofa', dir: 'left', x: 210, y: 140, h: 40 },

    { type: 'sofa', dir: 'right', x: 286, y: 140, h: 40 },
    { type: 'diningTable', x: 306, y: 146, w: 26, h: 24, food: [['pizza', 7, 6]] },
    { type: 'sofa', dir: 'left', x: 336, y: 140, h: 40 }
  ],

  npcs: [
    { who: 'CUSTOMER_GREY', pose: 'sit', dir: 'down', x: 44, y: 72 },
    { who: 'CUSTOMER_TEAL', pose: 'sit', dir: 'down', x: 70, y: 72, anim: 'eat' },
    { who: 'CUSTOMER_BLACK', pose: 'sit', dir: 'down', x: 292, y: 72, anim: 'eat' },
    { who: 'CUSTOMER_PINK', pose: 'sit', dir: 'down', x: 316, y: 72 },
    { who: 'CUSTOMER_GREEN', pose: 'sit', dir: 'right', x: 52, y: 174, anim: 'eat' },
    { who: 'CUSTOMER_LILAC', pose: 'sit', dir: 'left', x: 94, y: 174 },
    { who: 'CUSTOMER_ORANGE', pose: 'sit', dir: 'right', x: 298, y: 174 },
    { who: 'CUSTOMER_MINT', pose: 'sit', dir: 'left', x: 340, y: 174, anim: 'eat' }
  ],

  // o garçom anda pelo corredor e para nas mesas
  movers: [
    { who: 'WAITER', x: 330, y: 114, face: 'left',
      loop: [
        { t: 1.0, face: 'left' },
        { t: 3.2, to: [146, 108] },
        { t: 1.4, face: 'down' },
        { t: 1.6, to: [60, 100] },
        { t: 1.4, face: 'up' },
        { t: 4.6, to: [330, 114] },
        { t: 1.4, face: 'up' }
      ] }
  ],

  guards: [
    // o Fabio do passado: conversa com a Ellen; de vez em quando olha o drink bar
    { who: 'FABIO_F1', x: 172, y: 174, pose: 'sit', face: 'right', anim: 'eat',
      look: 0, range: 36, half: 18,
      loop: [
        { t: 3.6 },                                   // olha a Ellen (janela)
        { t: 0.5, look: 300, range: 124, half: 22 },  // olha o drink bar
        { t: 1.2, look: 262 },
        { t: 0.3 },
        { t: 0.5, look: 0, range: 36, half: 18 },
        { t: 5.9 }
      ] },

    // a Ellen do passado: o mesmo, na outra metade do loop
    { who: 'ELLEN_F1', x: 214, y: 174, pose: 'sit', face: 'left', anim: 'eat',
      look: 180, range: 36, half: 18,
      loop: [
        { t: 9.1 },
        { t: 0.5, look: 240, range: 124, half: 22 },
        { t: 1.2, look: 280 },
        { t: 0.3 },
        { t: 0.5, look: 180, range: 36, half: 18 },
        { t: 0.4 }
      ] }
  ]
};
