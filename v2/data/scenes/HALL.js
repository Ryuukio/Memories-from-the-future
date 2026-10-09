// Corredor entre uma sala e outra (SPEC, seção 4): zona segura, sem vigias. A Ellen entra pela
// porta da esquerda e sai pela da direita, que se abre quando ela chega perto.
window.SCENES = window.SCENES || {};

SCENES.HALL = {
  look: {
    floor: 'hall',
    wall: { style: 'hall', height: 72 },
    edge: 'hall',
    bounds: [88, 296],
    bottom: 140,
    doors: { left: [96, 128], right: [96, 128] },
    // V2: a luz das arandelas, de cima: só uma sombra curta embaixo de cada um
    light: { k: [0.05, 0.12], color: '#8A80A8', contact: '#4A4068' }
  },

  start: { x: 106, y: 118, dir: 'right' },

  props: [
    { type: 'sconce', x: 104, y: 22 },
    { type: 'polaroid', x: 136, y: 26, photo: 0 },
    { type: 'polaroid', x: 156, y: 30, photo: 1 },
    { type: 'sconce', x: 184, y: 22 },
    { type: 'polaroid', x: 214, y: 28, photo: 2 },
    { type: 'polaroid', x: 234, y: 25, photo: 3 },
    { type: 'sconce', x: 264, y: 22 },
    { type: 'hallDoor', x: 86, y: 92, locked: true },
    { type: 'hallDoor', x: 292, y: 92 }
  ]
};
