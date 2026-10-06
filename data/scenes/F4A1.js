// F4 A1 · Zoo (SPEC, seção 6)
// Zoológico com cercados na parte de cima (elefante, girafa, leão; os macacos no outro lado), os
// outros bichos numa placa com setas e barraquinhas de comida (sorvete, crepe, takoyaki). Vigias:
// andam entre dois cercados e param para olhar os bichos (cones para cima); depois viram para o
// caminho (para baixo). NPCs: visitantes andando.
window.SCENES = window.SCENES || {};

SCENES.F4A1 = {
  look: {
    floor: 'zoo',
    path: [92, 140],
    wall: { style: 'festivalSky', height: 26, shadow: false },
    edge: 'hedge',
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 14, y: 116, dir: 'right' },

  props: [
    { type: 'enclosure', x: 8, y: 22, w: 112, animal: 'elephant' },
    { type: 'enclosure', x: 128, y: 22, w: 76, animal: 'giraffe' },
    { type: 'enclosure', x: 252, y: 22, w: 124, animal: 'lion' },
    { type: 'zooSign', x: 206, y: 46, textKey: 'signs' },
    { type: 'foodStand', x: 24, y: 150, color: '#E888A8', textKey: 'stand1' },
    { type: 'foodStand', x: 166, y: 154, color: '#F2C14E', textKey: 'stand2' },
    { type: 'foodStand', x: 304, y: 150, color: '#E8823A', textKey: 'stand3' },
    { type: 'bush', x: 110, y: 170 },
    { type: 'bush', x: 250, y: 172 }
  ],

  npcs: [
    { who: 'F4_KID', pose: 'stand', dir: 'up', x: 54, y: 96 },
    { who: 'F4_VISITOR_2', pose: 'stand', dir: 'up', x: 70, y: 96 }
  ],

  movers: [
    { who: 'F4_VISITOR_1', x: 360, y: 134, face: 'left',
      loop: [{ t: 7, to: [30, 136] }, { t: 1.2, face: 'right' }, { t: 7, to: [360, 134] }, { t: 1.2, face: 'left' }] },
    { who: 'F4_VISITOR_3', x: 40, y: 100, face: 'right',
      loop: [{ t: 2 }, { t: 6, to: [330, 100] }, { t: 1.5, face: 'left' }, { t: 6, to: [40, 100] }, { t: 1.5, face: 'right' }] }
  ],

  // Loop de 16 s: andam até o leão, olham o bicho (2,5 s), viram para o caminho e varrem (2 s);
  // voltam até a girafa e fazem o mesmo.
  guards: [
    { who: 'FABIO_F4A1', x: 160, y: 112, range: 90, half: 28,
      loop: [
        { t: 3.5, to: [270, 112] },
        { t: 0.5, look: 270, range: 80 },
        { t: 2.0 },
        { t: 0.5, look: 150, range: 110, half: 30 },
        { t: 1.5, look: 60 },
        { t: 3.5, to: [160, 112], range: 90, half: 28 },
        { t: 0.5, look: 270, range: 80 },
        { t: 2.0 },
        { t: 0.5, look: 150, range: 110, half: 30 },
        { t: 1.5, look: 60, range: 90, half: 28 }
      ] },
    { who: 'ELLEN_F4A1', x: 146, y: 124, range: 90, half: 28,
      loop: [
        { t: 3.5, to: [256, 124] },
        { t: 0.5, look: 280, range: 80 },
        { t: 2.0 },
        { t: 0.5, look: 140, range: 110, half: 30 },
        { t: 1.5, look: 50 },
        { t: 3.5, to: [146, 124], range: 90, half: 28 },
        { t: 0.5, look: 280, range: 80 },
        { t: 2.0 },
        { t: 0.5, look: 140, range: 110, half: 30 },
        { t: 1.5, look: 50, range: 90, half: 28 }
      ] }
  ]
};
