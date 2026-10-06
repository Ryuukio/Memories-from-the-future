// Salinha do baú, depois da sala C de cada fase (SPEC, seção 7). A Ellen abre o baú com Espaço.
window.SCENES = window.SCENES || {};

SCENES.CHEST = {
  look: {
    floor: 'hall',
    wall: { style: 'hall', height: 64 },
    edge: 'hall',
    bounds: [104, 280],
    bottom: 164,
    doors: { left: [96, 128] }
  },

  start: { x: 122, y: 118, dir: 'right' },

  props: [
    { type: 'sconce', x: 132, y: 18 },
    { type: 'polaroid', x: 170, y: 22, photo: 4 },
    { type: 'polaroid', x: 196, y: 26, photo: 0 },
    { type: 'sconce', x: 236, y: 18 },
    { type: 'hallDoor', x: 102, y: 92, locked: true },
    { type: 'rug', x: 172, y: 94, w: 80, h: 40 },
    { type: 'chest', x: 198, y: 88, interact: 'chest' }
  ]
};
