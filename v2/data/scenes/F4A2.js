// F4 A2 · Okinawa aquarium (SPEC, seção 6)
// Sala escura com um tanque gigante na parede de cima: azul brilhante, corais, cardumes, raias-manta
// e um tubarão-baleia que atravessa o tanque devagar, indo e voltando. Vigias: em pé diante do
// vidro; quando o tubarão passa, os dois viram a cabeça para acompanhar, e os cones varrem a sala na
// mesma direção (trackMirror). Janela: quando o tubarão está do outro lado. NPCs: visitantes, que
// tapam a visão e a passagem.
window.SCENES = window.SCENES || {};

SCENES.F4A2 = {
  look: {
    floor: 'aquarium',
    wall: { style: 'tank', height: 72, shadow: false },
    edge: 'cinema',
    doors: { left: [100, 132], right: [100, 132] }
  },

  start: { x: 14, y: 116, dir: 'right' },

  props: [
    { type: 'tankLife', x: 0, y: 0 },
    { type: 'tankRail', x: 4, y: 76, w: 376 }
  ],

  npcs: [
    { who: 'F4_VISITOR_1', pose: 'stand', dir: 'up', x: 70, y: 96 },
    { who: 'F4_KID', pose: 'stand', dir: 'up', x: 84, y: 98 },
    { who: 'F4_VISITOR_3', pose: 'stand', dir: 'up', x: 300, y: 96 },
    { who: 'F4_VISITOR_2', pose: 'stand', dir: 'right', x: 120, y: 168 }
  ],

  // o tubarão-baleia: atravessa o tanque em 9 s, vira devagar e volta
  movers: [
    { id: 'shark', who: 'F4_VISITOR_1', prop: 'whaleShark', block: false, sight: false, x: 40, y: 44,
      loop: [{ t: 9, to: [344, 46] }, { t: 1.5, look: 180 }, { t: 9, to: [40, 44] }, { t: 1.5, look: 0 }] }
  ],

  guards: [
    { who: 'FABIO_F4A2', x: 182, y: 100, track: 'shark', trackMirror: true, look: 90, range: 98, half: 22 },
    { who: 'ELLEN_F4A2', x: 206, y: 100, track: 'shark', trackMirror: true, look: 90, range: 98, half: 22 }
  ]
};
