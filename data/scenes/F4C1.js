// F4 C1 · Yanai Goldfish Lantern Festival (SPEC, seção 6)
// Rua à noite com casas de paredes brancas e fileiras de lanternas de peixinho dourado penduradas
// (vermelhas e brancas, com olhos grandes), que fazem círculos de luz no chão. Vigias: andam devagar
// pela rua, olhando as lanternas. Zonas de luz: eles só veem a Ellen quando ela está num círculo de
// luz (look.lightOnly); a sombra é segura.
window.SCENES = window.SCENES || {};

SCENES.F4C1 = {
  look: {
    floor: 'stoneStreet',
    wall: { style: 'yanai', height: 56, shadow: false },
    edge: 'cinema',
    doors: { left: [96, 128], right: [96, 128] },
    lightOnly: true,
    // noite azulada; cada lanterna acende um círculo no chão (x, y, raio, cor)
    tint: {
      color: '#4A5290',
      lights: [
        [40, 102, 32, '#5A3A14'], [104, 102, 32, '#5A3A14'], [168, 102, 32, '#5A3A14'], [232, 102, 32, '#5A3A14'], [296, 102, 32, '#5A3A14'], [358, 102, 32, '#5A3A14'],
        [72, 160, 32, '#5A3A14'], [136, 160, 32, '#5A3A14'], [200, 160, 32, '#5A3A14'], [264, 160, 32, '#5A3A14'], [328, 160, 32, '#5A3A14'],
        // o brilho das próprias lanternas
        [40, 66, 9, '#8A2A1A'], [104, 68, 9, '#8A2A1A'], [168, 66, 9, '#8A2A1A'], [232, 68, 9, '#8A2A1A'], [296, 66, 9, '#8A2A1A'], [358, 68, 9, '#8A2A1A'],
        [72, 128, 9, '#8A2A1A'], [136, 130, 9, '#8A2A1A'], [200, 128, 9, '#8A2A1A'], [264, 130, 9, '#8A2A1A'], [328, 128, 9, '#8A2A1A']
      ]
    }
  },

  start: { x: 14, y: 116, dir: 'right' },

  props: [
    { type: 'lanternString', x: 0, y: 70, w: 384 },
    { type: 'lanternString', x: 0, y: 132, w: 384 },
    { type: 'goldfishLantern', x: 40, y: 68 }, { type: 'goldfishLantern', x: 104, y: 70 }, { type: 'goldfishLantern', x: 168, y: 68 },
    { type: 'goldfishLantern', x: 232, y: 70 }, { type: 'goldfishLantern', x: 296, y: 68 }, { type: 'goldfishLantern', x: 358, y: 70 },
    { type: 'goldfishLantern', x: 72, y: 132 }, { type: 'goldfishLantern', x: 136, y: 134 }, { type: 'goldfishLantern', x: 200, y: 132 },
    { type: 'goldfishLantern', x: 264, y: 134 }, { type: 'goldfishLantern', x: 328, y: 132 }
  ],

  npcs: [
    { who: 'F4_VISITOR_2', pose: 'stand', dir: 'up', x: 60, y: 176 },
    { who: 'F4_VISITOR_1', pose: 'stand', dir: 'up', x: 300, y: 72 }
  ],

  // Loop de 16 s: andam devagar pela rua olhando as lanternas e, a cada parada, olham em volta
  // (varrendo a rua da esquerda para a direita). Só veem a Ellen dentro dos círculos de luz.
  guards: [
    { who: 'FABIO_F4C1', x: 110, y: 132, range: 104, half: 30,
      loop: [
        { t: 5.0, to: [250, 132], look: 300 },
        { t: 0.5, look: 160, range: 112 },
        { t: 2.5, look: 40 },
        { t: 5.0, to: [110, 132], look: 240, range: 104 },
        { t: 0.5, look: 160, range: 112 },
        { t: 2.5, look: 40, range: 104 }
      ] },
    { who: 'ELLEN_F4C1', x: 96, y: 136, range: 104, half: 30,
      loop: [
        { t: 5.0, to: [236, 136], look: 280 },
        { t: 0.5, look: 200, range: 112 },
        { t: 2.5, look: 340 },
        { t: 5.0, to: [96, 136], look: 260, range: 104 },
        { t: 0.5, look: 200, range: 112 },
        { t: 2.5, look: 340, range: 104 }
      ] }
  ]
};
