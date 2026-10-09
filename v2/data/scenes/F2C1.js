// F2 C1 · Corona days (SPEC, seção 6 e Apêndice C)
// O apartamento visto de cima, numa tela, a partir da planta: banheiro e lavabo em cima à esquerda,
// a cozinha (DK) em cima no meio, o genkan em cima à direita (a saída), os dois quartos embaixo
// (o da esquerda é a entrada, pela varanda; o da direita é o da cama) e a varanda atravessando os
// dois. Vigias: o Fabio deitado no colchão azul, coberto com o cobertor azul-marinho, quase sempre
// de olhos fechados (às vezes abre e olha a porta do quarto); a Ellen, de pijama rosa, faz a ronda
// quarto → cozinha → banheiro → volta, com o cone na direção em que anda.
// Janelas: quando ela está no banheiro (~4 s) e, mais curta, quando pega água na cozinha de costas.
window.SCENES = window.SCENES || {};

SCENES.F2C1 = {
  look: {
    floor: 'aptOutside',
    wall: { style: 'aptTop', height: 28, shadow: false },
    edge: 'aptWall',
    // V2: a luz da tarde dentro de casa: sombras curtas e quentes
    light: { k: [0.05, 0.12], color: '#B8AAA4', contact: '#86766E' },
    doors: { left: [166, 190], right: [34, 70] }
  },

  start: { x: 18, y: 184, dir: 'right' },

  props: [
    // pisos
    { type: 'floorZone', x: 4, y: 166, w: 376, h: 24, style: 'veranda' },
    { type: 'floorZone', x: 4, y: 104, w: 182, h: 62 },
    { type: 'floorZone', x: 192, y: 104, w: 188, h: 62 },
    { type: 'floorZone', x: 126, y: 28, w: 186, h: 76 },
    { type: 'floorZone', x: 4, y: 28, w: 116, h: 76, style: 'tile' },
    { type: 'floorZone', x: 312, y: 28, w: 68, h: 52, style: 'genkan' },
    { type: 'floorZone', x: 312, y: 80, w: 68, h: 20 },

    // paredes: quartos | varanda (porta de correr aberta no quarto da esquerda)
    { type: 'wall', x: 4, y: 158, w: 46, h: 4 },
    { type: 'wall', x: 96, y: 158, w: 90, h: 4 },
    { type: 'wall', x: 192, y: 158, w: 188, h: 4 },
    { type: 'glassDoor', x: 250, y: 156, w: 52 },
    // quarto | quarto
    { type: 'wall', x: 186, y: 100, w: 6, h: 62 },
    // quartos | cozinha (porta de cada quarto)
    { type: 'wall', x: 4, y: 96, w: 146, h: 4 },
    { type: 'wall', x: 180, y: 96, w: 16, h: 4 },
    { type: 'wall', x: 226, y: 96, w: 154, h: 4 },
    // banheiro | cozinha (porta no meio)
    { type: 'wall', x: 120, y: 28, w: 6, h: 26 },
    { type: 'wall', x: 120, y: 82, w: 6, h: 14 },
    // embaixo do genkan
    { type: 'wall', x: 330, y: 78, w: 50, h: 4 },

    // banheiro e lavabo
    { type: 'bathtub', x: 10, y: 62 },
    { type: 'toilet', x: 92, y: 32 },
    { type: 'washbasin', x: 56, y: 32 },
    // cozinha: bancada, geladeira com micro-ondas, mesa com quatro cadeiras
    { type: 'kitchenCounter', x: 206, y: 30, w: 70 },
    { type: 'fridge', x: 280, y: 28 },
    { type: 'diningSet', x: 150, y: 30 },
    // quarto da cama: colchão azul no chão, tapete cinza felpudo, mesinha branca baixa
    { type: 'fluffyRug', x: 200, y: 112 },
    { type: 'futon', x: 300, y: 112 },
    { type: 'lowTable', x: 240, y: 124 },
    // quarto da entrada
    { type: 'lowTable', x: 40, y: 118 },
    { type: 'plant', x: 160, y: 120 }
  ],

  guards: [
    // o Fabio doente, deitado com a cabeça no travesseiro (à esquerda), coberto
    { who: 'FABIO_F2C1', x: 334, y: 136, pose: 'lie', face: 'left', cover: '#1E2A4A', eyes: 'closed', cone: false,
      look: 200, range: 80, half: 24,
      loop: [
        { t: 7.0 },
        { t: 0.3, eyes: 'open', cone: true },     // abre os olhos e olha a porta do quarto
        { t: 2.4 },
        { t: 0.3, eyes: 'closed', cone: false },
        { t: 11.6 }
      ] },

    // a Ellen de pijama rosa, com toalha e copo d'água: a ronda. Na porta do quarto ela para e
    // olha a cozinha de um lado a outro; na pia fica de costas; no banheiro some (a janela).
    { who: 'ELLEN_F2C1', x: 290, y: 140, look: 0, range: 92, half: 30,
      loop: [
        { t: 2.0, look: 0 },                      // cuida do Fabio
        { t: 1.4, to: [211, 130] },
        { t: 0.9, to: [211, 86] },
        { t: 0.4, look: 175, range: 120, half: 32 },   // para na porta e olha o corredor
        { t: 1.6, look: 150 },
        { t: 0.4, look: 20 },                     // e depois o lado do genkan
        { t: 1.0 },
        { t: 1.0, to: [240, 62], range: 92, half: 30 },
        { t: 1.6, look: 270 },                    // pega água na pia (de costas para a sala)
        { t: 2.4, to: [140, 84] },
        { t: 0.8, to: [96, 70] },
        { t: 3.4, look: 180 },                    // no banheiro (a janela)
        { t: 0.8, to: [140, 84] },
        { t: 1.6, to: [211, 88] },
        { t: 0.9, to: [211, 130] },
        { t: 1.4, to: [290, 140] }
      ] }
  ]
};
