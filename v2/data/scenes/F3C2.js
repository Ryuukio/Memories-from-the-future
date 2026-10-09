// F3 C2 · Nara (SPEC, seção 6)
// Lagoa na parte de cima, cerejeiras no alto e o caminho com cervos embaixo. Vigias num barco a
// remo: o amigo rema no meio, o Fabio fica atrás olhando para a frente e a Ellen fica na frente
// olhando para trás. Os cones seguem o eixo do barco, um para cada lado. O barco anda e gira devagar
// pela lagoa. Janela: barco paralelo ao caminho (os cones apontam para os lados da lagoa);
// perpendicular, um dos cones desce até o caminho e fecha a passagem. Os cervos andam pelo caminho
// e bloqueiam a passagem (inofensivos).
window.SCENES = window.SCENES || {};

SCENES.F3C2 = {
  look: {
    floor: 'nara',
    pond: [30, 118],
    wall: { style: 'naraBank', height: 30, shadow: false },
    edge: 'hedge',
    doors: { left: [136, 186], right: [136, 186] }
  },

  start: { x: 14, y: 160, dir: 'right' },

  props: [
    { type: 'block', x: 0, y: 30, w: 384, h: 98 },     // a lagoa
    { type: 'stoneLantern', x: 120, y: 172 },
    { type: 'stoneLantern', x: 260, y: 172 },
    { type: 'petals', x: 0, y: 0 }
  ],

  movers: [
    // o barco: anda paralelo ao caminho, gira de proa para o caminho, segura, gira de volta...
    { id: 'boat', who: 'F3_ROWER', prop: 'rowboat', block: false, sight: false, x: 120, y: 74, look: 0,
      loop: [
        { t: 3.5, to: [230, 74], look: 0 },
        { t: 1.6, to: [250, 80], look: 120 },       // vira a proa para o caminho
        { t: 3.0, look: 60 },                        // e vai girando (o cone do Fabio varre o caminho)
        { t: 1.6, to: [230, 74], look: 180 },
        { t: 3.5, to: [120, 74], look: 180 },
        { t: 1.6, to: [104, 70], look: 300 },       // agora a popa: o cone da Ellen desce
        { t: 3.0, look: 240 },
        { t: 1.6, to: [120, 74], look: 360 }
      ] },
    // o amigo remando no meio
    { who: 'F3_ROWER', ride: 'boat', at: [0, 0], pose: 'sit', x: 0, y: 0, block: false, sight: false },
    // cervos no caminho
    { who: 'F3_ROWER', prop: 'deer', x: 60, y: 160, size: [18, 6],
      loop: [{ t: 5, to: [170, 164] }, { t: 2 }, { t: 5, to: [60, 160] }, { t: 2 }] },
    { who: 'F3_ROWER', prop: 'deer', x: 330, y: 178, size: [18, 6],
      loop: [{ t: 2 }, { t: 6, to: [220, 174] }, { t: 1.5 }, { t: 6, to: [330, 178] }] },
    { who: 'F3_ROWER', prop: 'deer', x: 200, y: 146, size: [18, 6],
      loop: [{ t: 3 }, { t: 4, to: [282, 150] }, { t: 3 }, { t: 4, to: [200, 146] }] }
  ],

  // no barco: o Fabio atrás olhando para a frente, a Ellen na frente olhando para trás
  guards: [
    { who: 'FABIO_F3C2', ride: 'boat', at: [-13, 0], x: 0, y: 0, pose: 'sit', look: 0, range: 132, half: 26 },
    { who: 'ELLEN_F3C2', ride: 'boat', at: [13, 0], x: 0, y: 0, pose: 'sit', look: 180, range: 132, half: 26 }
  ]
};
