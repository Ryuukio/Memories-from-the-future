// Prólogo, cena 1 (SPEC, seção 11.2): lanchonete de fast-food à noite, letreiro de neon
// "JIMMY'S JUNK PALACE" (o texto vem do config). O Fabio pede um hambúrguer; o Big Jimmy Junk
// aparece ([show:jimmy]), usa TEMPTATION e o Fabio desmaia ([pose:fabio:lie]).
window.SCENES = window.SCENES || {};

SCENES.PRO1 = {
  look: {
    floor: 'diner',
    wall: { style: 'diner', height: 56 },
    edge: 'diner',
    // V2: a luz branca do teto da lanchonete: sombras curtas
    light: { k: [0.03, 0.12], color: '#B4A2B8', contact: '#6E5670' },
    doors: {}
  },

  start: { x: 192, y: 150, dir: 'up' },

  props: [
    { type: 'neon', x: 74, y: 3, textPath: 'texts.prologue.neonSign' },
    { type: 'menuPanel', x: 16, y: 8, item: 0 },
    { type: 'menuPanel', x: 328, y: 8, item: 1 },
    { type: 'dinerCounter', x: 70, y: 52, w: 240 },
    // V2: as banquetas na frente do balcão (só desenho)
    { type: 'dinerStool', x: 90, y: 70 },
    { type: 'dinerStool', x: 118, y: 70 },
    { type: 'dinerStool', x: 146, y: 70 },
    { type: 'dinerStool', x: 222, y: 70 },
    { type: 'dinerStool', x: 250, y: 70 },
    { type: 'dinerStool', x: 278, y: 70 },
    { type: 'booth', x: 20, y: 128 },
    { type: 'booth', x: 20, y: 76 },
    { type: 'booth', x: 316, y: 128 },
    { type: 'booth', x: 316, y: 76 },
    { type: 'jimmy', id: 'jimmy', x: 214, y: 54, hidden: true }
  ],

  npcs: [
    { id: 'fabio', who: 'FABIO_PRE', pose: 'stand', dir: 'up', x: 170, y: 104, solid: false }
  ]
};
