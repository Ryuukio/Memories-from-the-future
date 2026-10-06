// F1 B1 · Iced tea at the café (SPEC, seção 6)
// Café com janelas grandes na parede de cima, com letreiro dourado em francês (genérico). Mesa
// comprida de madeira de frente para as janelas, cadeiras de madeira clara com encosto de ripas e
// assento creme, balcão branco com vitrine de doces e sanduíches, piso de losangos cinza e bege.
// Vigias: sentados lado a lado na mesa comprida, de frente para a janela, com chá gelado. Loop:
// olham a janela (cones para cima) → viram um para o outro (cones de lado, ao longo da mesa) →
// de vez em quando um vira para trás, para o balcão (cone desce). Janela: quando olham pela
// janela. Esconderijo: a vitrine do balcão.
window.SCENES = window.SCENES || {};

SCENES.F1B1 = {
  look: {
    floor: 'cafeDiamond',
    wall: { style: 'cafe', height: 50 },
    edge: 'cafe',
    doors: { left: [96, 128], right: [96, 128] }
  },

  start: { x: 20, y: 118, dir: 'right' },

  props: [
    // janelas: luminárias pendentes e o letreiro (texto no config.js)
    { type: 'pendant', x: 56, y: 0 },
    { type: 'pendant', x: 120, y: 0 },
    { type: 'pendant', x: 186, y: 0 },
    { type: 'pendant', x: 252, y: 0 },
    { type: 'pendant', x: 318, y: 0 },
    { type: 'windowText', x: 142, y: 22, textKey: 'windowText' },

    // a mesa comprida, com o chá gelado do casal no meio
    { type: 'longTable', x: 40, y: 50, w: 304, tea: [147, 193], cups: [52, 120, 300], plates: [232] },

    // cadeiras vazias (encosto de ripas: bloqueia a visão)
    { type: 'chair', style: 'cafe', dir: 'up', x: 56, y: 53 },
    { type: 'chair', style: 'cafe', dir: 'up', x: 128, y: 53 },
    { type: 'chair', style: 'cafe', dir: 'up', x: 224, y: 53 },
    { type: 'chair', style: 'cafe', dir: 'up', x: 296, y: 53 },
    { type: 'chair', style: 'cafe', dir: 'up', x: 320, y: 53 },

    // balcão com a vitrine (esconderijo) e o cardápio na entrada
    { type: 'cafeCounter', x: 200, y: 140 },
    { type: 'menuBoard', x: 30, y: 152 },
    { type: 'smallTable', x: 82, y: 150, cups: true },
    { type: 'plant', x: 352, y: 150 },
    { type: 'plant', x: 6, y: 52 }
  ],

  npcs: [
    { who: 'CUSTOMER_TEAL', pose: 'sit', dir: 'up', x: 88, y: 84, chair: 'cafe' },
    { who: 'CUSTOMER_BEIGE', pose: 'sit', dir: 'up', x: 112, y: 84, chair: 'cafe' },
    { who: 'CUSTOMER_PINK', pose: 'sit', dir: 'up', x: 256, y: 84, chair: 'cafe' },
    { who: 'CUSTOMER_BLACK', pose: 'sit', dir: 'up', x: 280, y: 84, chair: 'cafe' },
    { who: 'CUSTOMER_MINT', pose: 'sit', dir: 'right', x: 74, y: 170, chair: 'cafe', anim: 'eat' },
    { who: 'CUSTOMER_ORANGE', pose: 'sit', dir: 'left', x: 112, y: 170, chair: 'cafe' },
    // atendente atrás do balcão
    { who: 'CAFE_STAFF', pose: 'stand', dir: 'down', x: 280, y: 142 }
  ],

  guards: [
    // o Fabio do passado: janela → olha a Ellen → janela → (na primeira metade) vira para o balcão
    { who: 'FABIO_F1', x: 160, y: 84, pose: 'sit', face: 'up', chair: 'cafe',
      look: 270, range: 34, half: 24,
      loop: [
        { t: 3.5 },                                   // olha a janela
        { t: 0.5, look: 0, range: 60, half: 20 },     // olha a Ellen
        { t: 2.0 },
        { t: 0.5, look: 270, range: 34, half: 24 },
        { t: 1.5 },
        { t: 0.6, look: 55, range: 100, half: 26 },   // vira para o balcão
        { t: 1.4, look: 105 },
        { t: 0.4 },
        { t: 0.6, look: 270, range: 34, half: 24 },
        { t: 3.5 },
        { t: 0.5, look: 0, range: 60, half: 20 },
        { t: 2.0 },
        { t: 0.5, look: 270, range: 34, half: 24 },
        { t: 4.5 }
      ] },

    // a Ellen do passado: o mesmo, mas vira para o balcão na segunda metade
    { who: 'ELLEN_F1', x: 184, y: 84, pose: 'sit', face: 'up', chair: 'cafe',
      look: 270, range: 34, half: 24,
      loop: [
        { t: 3.5 },
        { t: 0.5, look: 180, range: 60, half: 20 },
        { t: 2.0 },
        { t: 0.5, look: 270, range: 34, half: 24 },
        { t: 4.5 },
        { t: 3.5 },
        { t: 0.5, look: 180, range: 60, half: 20 },
        { t: 2.0 },
        { t: 0.5, look: 270, range: 34, half: 24 },
        { t: 1.5 },
        { t: 0.6, look: 125, range: 100, half: 26 },
        { t: 1.4, look: 75 },
        { t: 0.4 },
        { t: 0.6, look: 270, range: 34, half: 24 }
      ] }
  ]
};
