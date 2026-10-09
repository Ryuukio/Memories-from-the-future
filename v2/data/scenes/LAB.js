// Prólogo, cena 3 (SPEC, seção 11.2 e Apêndice B): o laboratório. O quadro do Tony cheio de
// contas, as plantas e amostras da Heymans, o caderno do Dr King na mesa e a máquina do tempo no
// centro (desligada no começo, faiscando anos depois e pronta no fim: `on`, ajustado pelo Flow).
// Atores com id: tony, heymans, ellen1 (cabelo platinado) e ellen2 (meio a meio); o Flow mostra
// quem está em cada parte. No fim a jogadora anda com a Ellen até a máquina e aperta Espaço.
window.SCENES = window.SCENES || {};

SCENES.LAB = {
  look: {
    floor: 'labTile',
    wall: { style: 'lab', height: 58 },
    edge: 'lab',
    // V2: a luz fria das luminárias do teto: sombras curtas
    light: { k: [0.02, 0.1], color: '#A8B2C4', contact: '#6A7486' },
    doors: {}
  },

  start: { x: 96, y: 150, dir: 'right' },

  props: [
    { type: 'blackboard', x: 24, y: 8 },
    { type: 'labClock', x: 150, y: 10 },
    { type: 'plantShelf', x: 286, y: 6 },
    { type: 'labDesk', x: 20, y: 150 },
    { type: 'timeMachine', id: 'machine', x: 162, y: 54, interact: 'machine' },
    { type: 'console', x: 238, y: 88 }
  ],

  npcs: [
    { id: 'tony', who: 'TONY', pose: 'stand', dir: 'right', x: 84, y: 98 },
    { id: 'heymans', who: 'HEYMANS', pose: 'stand', dir: 'left', x: 300, y: 104 },
    { id: 'ellen1', who: 'ELLEN_LAB1', pose: 'stand', dir: 'left', x: 128, y: 112 },
    { id: 'ellen2', who: 'ELLEN_LAB2', pose: 'stand', dir: 'left', x: 128, y: 112 }
  ]
};
