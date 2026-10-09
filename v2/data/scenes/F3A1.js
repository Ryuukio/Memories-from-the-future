// F3 A1 · Birthdays (SPEC, seção 6 e Apêndice C)
// A cozinha do apartamento duplicada lado a lado (cada cópia ocupa meia tela). Parede creme com
// moldura de madeira escura, portas de correr marrons, estante preta de arame com cestos e a
// lava-louças, armário baixo com folhas de outono; armário branco com a fritadeira e a chaleira; a
// bancada com coifa e janela, a geladeira pequena prateada com micro-ondas; mesa de madeira escura
// com cadeiras de assento creme. A data do HUD e a fala mudam na metade (look.split).
//   Esquerda (04/11/2025, aniversário do Fabio): faixa "HAPPY BIRTHDAY", balões, torta de frutas
//   vermelhas com velas "33", presente azul e sacola listrada. Só o Fabio: assopra as velas (que
//   acendem de novo) e entre uma vez e outra olha em volta (o cone varre a cozinha).
//   Direita (27/11/2025, aniversário da Ellen): toalha roxa, luzinhas, cartões, balões, brilhos, duas
//   pizzas nas pontas da mesa e um bolinho no meio. Só a Ellen: abre os cartões (cone para baixo) e
//   de vez em quando olha em volta.
window.SCENES = window.SCENES || {};

SCENES.F3A1 = {
  look: {
    floor: 'aptWood',
    wall: { style: 'kitchen', height: 52 },
    edge: 'aptWall',
    // V2: de dia, dentro de casa: sombras curtas e quentes
    light: { k: [0.06, 0.14], color: '#B4A8A0', contact: '#7E6E66' },
    doors: { left: [96, 128], right: [96, 128] },
    split: 192
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    // cozinha da esquerda
    { type: 'slidingDoors', x: 48, y: 6 },
    { type: 'wireShelf', x: 100, y: 6 },
    { type: 'leafCabinet', x: 140, y: 6 },
    { type: 'banner', x: 30, y: 4, textKey: 'banner' },
    { type: 'whiteCabinet', x: 6, y: 52 },
    { type: 'partyTable', x: 58, y: 86 },
    { type: 'berryTart', x: 84, y: 98 },
    { type: 'giftBox', x: 140, y: 126 },
    { type: 'stripedBag', x: 30, y: 132 },
    { type: 'balloons', x: 150, y: 52 },
    { type: 'balloons', x: 12, y: 150, colors: ['#5DAA62', '#E888A8', '#F2C14E'] },

    // cozinha da direita
    { type: 'slidingDoors', x: 208, y: 6 },
    { type: 'leafCabinet', x: 256, y: 6 },
    { type: 'kitchenWall', x: 300, y: 6 },
    { type: 'stringLights', x: 200, y: 4, w: 180 },
    { type: 'sparkles', x: 200, y: 8, w: 180, h: 40 },
    { type: 'partyTable', x: 250, y: 86, cloth: '#7A4AA8' },
    { type: 'pizza', x: 254, y: 98 },
    { type: 'pizza', x: 300, y: 98 },
    { type: 'smallCake', x: 280, y: 96 },
    { type: 'cards', x: 274, y: 108 },
    { type: 'fridge', x: 356, y: 50 },
    { type: 'balloons', x: 212, y: 52, colors: ['#9A6AD8', '#F2C14E', '#E888A8'] },
    { type: 'balloons', x: 352, y: 146, colors: ['#5DD0F0', '#9A6AD8', '#F2C14E'] }
  ],

  // Loop de 9 s: entre uma coisa e outra, cada um olha em volta (~3 s, varrendo o chão da cozinha da
  // esquerda para a direita) e dá uma olhada para trás.
  guards: [
    // o Fabio, sentado atrás da torta: assopra as velas e olha em volta
    { who: 'FABIO_F3A1', x: 94, y: 102, pose: 'sit', face: 'down', look: 90, range: 26, half: 30,
      loop: [
        { t: 2.2 },                                    // assopra as velas
        { t: 0.4, look: 150, range: 120, half: 32 },  // olha em volta
        { t: 2.4, look: 35 },
        { t: 0.5, look: 300, range: 80 },             // e para trás
        { t: 0.8 },
        { t: 0.4, look: 90, range: 26, half: 30 },
        { t: 2.3 }
      ] },

    // a Ellen, sentada atrás do bolinho: abre os cartões e olha em volta
    { who: 'ELLEN_F3A1', x: 286, y: 102, pose: 'sit', face: 'down', look: 90, range: 26, half: 30,
      loop: [
        { t: 4.6 },                                    // abre os cartões
        { t: 0.4, look: 150, range: 120, half: 32 },
        { t: 2.4, look: 35 },
        { t: 0.5, look: 240, range: 80 },
        { t: 0.7 },
        { t: 0.4, look: 90, range: 26, half: 30 }
      ] }
  ]
};
