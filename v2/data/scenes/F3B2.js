// F3 B2 · BBQ with friends (SPEC, seção 6)
// Área de churrasco num parque. Mesa comprida na vertical, para 6: a Ellen do passado e os cinco
// amigos (Apêndice A). A churrasqueira em cima, um pouco afastada; o Fabio fica entre a mesa e a
// churrasqueira. O Fabio alterna entre olhar a churrasqueira (cone para cima) e a mesa (para baixo);
// a Ellen alterna entre olhar o Fabio, a mesa e o caminho. Janela: quando a Ellen olha o Fabio ou a
// mesa e o Fabio olha a churrasqueira. Para passar, dá a volta na mesa por cima (perto do Fabio) ou
// por baixo (no caminho que a Ellen olha).
window.SCENES = window.SCENES || {};

SCENES.F3B2 = {
  look: {
    floor: 'bbqPark',                        // V2: piso e céu próprios (os da V1 eram 'festival' e
    wall: { style: 'bbqSky', height: 30, shadow: false },   // 'festivalSky', que o F4 A1 também usa)
    edge: 'hedge',
    doors: { left: [96, 128], right: [96, 128] },
    // V2: à noite, como na foto: tudo azulado; a churrasqueira em brasa e os dois postes clareiam
    tint: { color: '#7078B8', lights: [[214, 44, 64, '#5A3410'], [71, 30, 60, '#4A3C1C'], [331, 30, 60, '#4A3C1C']] },
    light: { k: [0.06, 0.12], color: '#9098BC', contact: '#5A6080' }
  },

  start: { x: 14, y: 112, dir: 'right' },

  props: [
    // V2: os bancos da mesa (só desenho, no chão, embaixo de quem senta)
    { type: 'picnicBench', x: 185, y: 84, w: 10, h: 80 },
    { type: 'picnicBench', x: 235, y: 84, w: 10, h: 80 },
    { type: 'grill', x: 196, y: 30 },
    { type: 'longTableV', x: 200, y: 70, h: 102 },
    { type: 'cooler', x: 254, y: 52 },
    { type: 'tree', x: 40, y: 34, night: true },
    { type: 'tree', x: 300, y: 130, night: true },
    { type: 'bush', x: 110, y: 160, night: true },
    { type: 'bush', x: 330, y: 40, night: true }
  ],

  // os cinco amigos sentados à mesa (três de cada lado; a Ellen fica no último lugar da esquerda)
  npcs: [
    { who: 'F3_FRIEND_1', pose: 'sit', dir: 'right', x: 190, y: 96 },
    { who: 'F3_FRIEND_2', pose: 'sit', dir: 'right', x: 190, y: 126 },
    { who: 'F3_FRIEND_3', pose: 'sit', dir: 'left', x: 240, y: 96 },
    { who: 'F3_FRIEND_4', pose: 'sit', dir: 'left', x: 240, y: 126 },
    { who: 'F3_FRIEND_5', pose: 'sit', dir: 'left', x: 240, y: 156 }
  ],

  // Loop de 10 s. A churrasqueira é baixa: olhando a carne, o Fabio vê quem passa por trás dela;
  // olhando a mesa, vê os lados da mesa. A Ellen, olhando o caminho, vê a passagem de baixo.
  guards: [
    // o Fabio entre a churrasqueira e a mesa: olha a carne (para cima) e depois a mesa (para baixo)
    { who: 'FABIO_F3B2', x: 215, y: 68, look: 230, range: 96, half: 30,
      loop: [
        { t: 3.0, look: 310 },                        // vira a carne, olhando a churrasqueira e o parque atrás
        { t: 0.4, look: 125, range: 100, half: 32 },  // olha a mesa
        { t: 2.6, look: 55 },
        { t: 0.4, look: 230, range: 96, half: 30 },
        { t: 3.6, look: 300 }
      ] },
    // a Ellen, no último lugar da esquerda: olha o Fabio, a mesa e o caminho de baixo
    { who: 'ELLEN_F3B2', x: 190, y: 156, pose: 'sit', face: 'right', look: 285, range: 90, half: 16,
      loop: [
        { t: 2.6 },                                    // olha o Fabio
        { t: 0.4, look: 0, range: 30, half: 26 },     // a mesa
        { t: 2.0 },
        { t: 0.4, look: 175, range: 112, half: 30 },  // o caminho
        { t: 2.6, look: 100 },
        { t: 0.4, look: 285, range: 90, half: 16 },
        { t: 1.6 }
      ] }
  ]
};
