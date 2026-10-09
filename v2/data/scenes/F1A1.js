// F1 A1 · Okonomiyaki (SPEC, seção 6)
// Restaurante de okonomiyaki: mesas de madeira escura com chapa embutida, cadeiras de madeira com
// assento e encosto pretos, banco comprido preto na parede do fundo, paredes creme, luz quente
// no teto, piso de madeira avermelhada.
// Vigias: o Fabio mexe na chapa sem a comida nunca ficar pronta (cone curto, para a chapa). A Ellen
// olha para o Fabio (~4 s) e depois olha o salão, varrendo o corredor (~2 s).
// Janela: quando a Ellen olha para o Fabio. Esconderijos: os vãos entre as mesas de baixo.
//
// Coordenadas em px dentro do cenário (384 × 192, abaixo do HUD). Ângulos: 0 direita, 90 baixo,
// 180 esquerda, 270 cima. Os textos (como a placa) vêm do config.js.
window.SCENES = window.SCENES || {};

SCENES.F1A1 = {
  look: {
    floor: 'redWood',
    wall: { style: 'restaurant', height: 44 },
    doors: { left: [96, 128], right: [96, 128] },
    // V2: luz do teto, de cima: sombras curtas e quentes, logo abaixo de cada coisa
    light: { k: [0.1, 0.16], color: '#B8A09A', contact: '#7A6060' }
  },

  start: { x: 28, y: 116, dir: 'right' },

  props: [
    // parede do fundo
    { type: 'bench', x: 16, y: 22, w: 284 },
    { type: 'clock', x: 30, y: 8 },
    { type: 'menuStrips', x: 98, y: 3, n: 6 },
    { type: 'sign', x: 176, y: 8, textKey: 'sign' },
    { type: 'lantern', x: 298, y: 4 },
    { type: 'noren', x: 316, y: 0 },
    { type: 'plant', x: 360, y: 30 },

    // mesas com chapa
    { type: 'grillTable', x: 28, y: 50, food: true, items: 'left' },
    { type: 'grillTable', x: 152, y: 66, food: true, items: 'both' },   // a do casal: nunca fica pronta
    { type: 'grillTable', x: 244, y: 50, items: 'left', glass: true },
    { type: 'grillTable', x: 36, y: 166, food: true, items: 'right' },
    { type: 'grillTable', x: 156, y: 166, items: 'right', spatulas: false },
    { type: 'grillTable', x: 276, y: 166, food: true, items: 'left', glass: true },

    // cadeiras vazias (encosto alto: bloqueia a visão)
    { type: 'chair', x: 168, y: 140, dir: 'up' },
    { type: 'chair', x: 196, y: 140, dir: 'up' }
  ],

  // clientes: inofensivos, ocupam lugar e bloqueiam a visão
  npcs: [
    { who: 'CUSTOMER_GREEN', pose: 'sit', dir: 'down', x: 46, y: 56 },
    { who: 'CUSTOMER_TEAL', pose: 'sit', dir: 'down', x: 72, y: 56 },
    { who: 'CUSTOMER_GREY', pose: 'sit', dir: 'up', x: 262, y: 86, chair: true },
    { who: 'CUSTOMER_RED', pose: 'sit', dir: 'up', x: 290, y: 86, chair: true },
    { who: 'CUSTOMER_NAVY', pose: 'sit', dir: 'right', x: 30, y: 188, chair: true, anim: 'eat' },
    { who: 'CUSTOMER_LILAC', pose: 'sit', dir: 'left', x: 346, y: 188, chair: true, anim: 'eat' }
  ],

  guards: [
    // o Fabio do passado, mexendo na chapa (cone para a chapa; de vez em quando olha um pouco para baixo)
    { who: 'FABIO_F1', x: 146, y: 88, pose: 'sit', face: 'right', chair: true, anim: 'cook',
      look: 0, range: 60, half: 30,
      loop: [
        { t: 1.4 },
        { t: 0.5, look: 25 },
        { t: 1.1 },
        { t: 0.5, look: -10 },
        { t: 0.8 },
        { t: 0.4, look: 0 }
      ] },

    // a Ellen do passado: olha para o Fabio, depois repara no salão e varre o corredor
    { who: 'ELLEN_F1', x: 222, y: 88, pose: 'sit', face: 'left', chair: true,
      look: 180, range: 46, half: 14, eye: [0, -10],
      loop: [
        { t: 4 },                                     // olha para o Fabio (janela para passar)
        { t: 0.5, look: 140, range: 76, half: 30 },   // vira para o salão
        { t: 0.8 },                                   // repara no corredor
        { t: 2.2, look: 40 },                         // varre o corredor
        { t: 0.8 },
        { t: 0.6, look: 180, range: 46, half: 14 }    // volta a olhar o Fabio
      ] }
  ]
};
