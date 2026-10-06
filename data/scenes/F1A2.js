// F1 A2 · Ice cream at Mirai Tower (SPEC, seção 6)
// Parque em Sakae numa tarde de verão, com a Mirai Tower ao fundo. Caminho de pedra, canteiro de
// flores, árvores, poste, máquina de bebidas, carrinho de sorvete e pombos no caminho. A Ellen
// sai do restaurante (fachada à esquerda) direto para o parque.
// Vigias: sentados num banco, de costas para o caminho, tomando sorvete e olhando a torre (cones
// para cima). De tempos em tempos um dos dois vira para trás e o cone desce sobre o caminho;
// alterna quem vira. Janela: enquanto os dois olham a torre. Esconderijos: a máquina de bebidas
// e o carrinho de sorvete.
window.SCENES = window.SCENES || {};

SCENES.F1A2 = {
  look: {
    floor: 'park',
    path: [97, 127],                          // faixa do caminho de pedra
    wall: { style: 'parkSky', height: 46, shadow: false },
    edges: { left: 'building', right: 'hedge' },
    edgeWidth: { left: 12 },
    doors: { left: [96, 128], right: [96, 128] },
    shadow: 'long'                            // sol da tarde: sombras esticadas
  },

  start: { x: 26, y: 118, dir: 'right' },

  props: [
    { type: 'parkLamp', x: 88, y: 46 },
    { type: 'vending', x: 108, y: 50 },
    { type: 'parkBench', x: 164, y: 62, view: 'back' },
    { type: 'tree', x: 316, y: 34 },
    { type: 'bush', x: 270, y: 60 },
    { type: 'iceCart', x: 126, y: 136 },
    { type: 'parkLamp', x: 232, y: 130 },
    { type: 'flowerBed', x: 262, y: 144 },
    { type: 'bush', x: 40, y: 166 },
    { type: 'bush', x: 336, y: 168 },
    { type: 'pigeons', x: 0, y: 0, at: [[292, 112], [318, 105], [342, 120]] }
  ],

  guards: [
    // o Fabio do passado: olha a torre; vira primeiro, pelo lado esquerdo
    { who: 'FABIO_F1', x: 182, y: 86, pose: 'sit', face: 'up',
      look: 270, range: 56, half: 24,
      loop: [
        { t: 3.0 },                                   // os dois olham a torre
        { t: 0.6, look: 125, range: 104, half: 26 },  // vira para trás
        { t: 1.3, look: 70 },                         // olha o caminho
        { t: 0.6 },
        { t: 0.6, look: 270, range: 56, half: 24 },   // volta para a torre
        { t: 5.9 }
      ] },

    // a Ellen do passado: vira depois, pelo lado direito
    { who: 'ELLEN_F1', x: 206, y: 86, pose: 'sit', face: 'up',
      look: 270, range: 56, half: 24,
      loop: [
        { t: 6.4 },
        { t: 0.6, look: 55, range: 104, half: 26 },
        { t: 1.3, look: 110 },
        { t: 0.6 },
        { t: 0.6, look: 270, range: 56, half: 24 },
        { t: 2.5 }
      ] }
  ]
};
