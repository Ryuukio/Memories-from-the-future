// F4 C2 · Tottori Sand Dunes (SPEC, seção 6)
// Dunas de areia com o mar no topo, céu nublado de fim de tarde e um pau de madeira fincado na
// areia, com o celular preso nele. Vigias: o loop da foto com timer: vão até o celular e ligam o
// timer (cones para o celular) → correm até o lugar da foto → fazem pose olhando para o celular
// (cones para o celular) → voltam para conferir a foto. Zona da foto: a área entre eles e o
// celular; pega ali durante a pose, a fala é "Photobomb detected!". Areia fofa: terreno lento.
window.SCENES = window.SCENES || {};

SCENES.F4C2 = {
  look: {
    floor: 'dunes',
    wall: { style: 'duneSea', height: 50, shadow: false },
    edge: 'none',
    doors: { left: [96, 128], right: [96, 128] },
    slow: [[0, 50, 384, 142, 0.8]]
  },

  // entre o lugar da foto (em cima) e o celular (embaixo)
  photoZone: [158, 74, 70, 78],

  start: { x: 14, y: 116, dir: 'right' },

  props: [
    { type: 'phoneStick', x: 188, y: 150, timer: true }
  ],

  // Loop de 16 s.
  guards: [
    { who: 'FABIO_F4C2', x: 182, y: 76, range: 104, half: 32,
      loop: [
        { t: 2.0, to: [184, 144] },                   // vai até o celular
        { t: 1.5, look: 90, range: 40 },              // liga o timer
        { t: 1.0, to: [182, 76] },                    // corre para o lugar da foto
        { t: 0.2, pose: 'photo', photo: true, look: 90, range: 110, half: 40 },
        { t: 3.6 },                                   // a pose
        { t: 0.2, pose: 'stand', photo: false, range: 104, half: 32 },
        { t: 2.0, to: [184, 144] },                   // vai conferir a foto
        { t: 2.0, look: 90, range: 40 },
        { t: 2.0, to: [182, 76], range: 96 },
        { t: 1.5, look: 270, range: 60 }              // olha o mar
      ] },
    { who: 'ELLEN_F4C2', x: 200, y: 78, range: 104, half: 32,
      loop: [
        { t: 2.0, to: [198, 144] },
        { t: 1.5, look: 90, range: 40 },
        { t: 1.0, to: [200, 78] },
        { t: 0.2, pose: 'photo', photo: true, look: 90, range: 110, half: 40 },
        { t: 3.6 },
        { t: 0.2, pose: 'stand', photo: false, range: 104, half: 32 },
        { t: 2.0, to: [198, 144] },
        { t: 2.0, look: 90, range: 40 },
        { t: 2.0, to: [200, 78], range: 96 },
        { t: 1.5, look: 270, range: 60 }
      ] }
  ]
};
