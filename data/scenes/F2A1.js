// F2 A1 · Beach day (SPEC, seção 6)
// Praia de areia clara, morro verde ao fundo, posto de salva-vidas, barracas, guarda-sóis e boias.
// Vigias: no mar (em cima), numa área pequena, brincando e jogando água um no outro; os cones giram.
// De vez em quando se abraçam (sem cone). Janela: o abraço. Caminho pela areia, embaixo; barracas e
// guarda-sóis tapam a visão.
window.SCENES = window.SCENES || {};

SCENES.F2A1 = {
  look: {
    floor: 'beach',
    sea: [40, 92],                          // o mar (não dá para entrar)
    wall: { style: 'beachSky', height: 40, shadow: false },
    edge: 'beachRocks',
    doors: { left: [100, 188], right: [100, 188] }
  },

  start: { x: 18, y: 150, dir: 'right' },

  props: [
    { type: 'block', x: 0, y: 40, w: 384, h: 54 },          // o mar
    { type: 'splash', x: 192, y: 80 },
    { type: 'lifeguard', x: 330, y: 92 },
    { type: 'beachTowel', x: 60, y: 104, color: '#F07A9A' },
    { type: 'umbrella', x: 52, y: 96, color: '#F2C14E' },
    { type: 'beachTent', x: 120, y: 112 },
    { type: 'floatRing', x: 170, y: 104 },
    { type: 'umbrella', x: 236, y: 122, color: '#5DA8D8' },
    { type: 'beachTowel', x: 244, y: 132, color: '#5DAA62' },
    { type: 'beachTent', x: 276, y: 150, blue: true },
    { type: 'floatRing', x: 96, y: 168, color: '#F2C14E' },
    { type: 'umbrella', x: 168, y: 160, color: '#E8823A' }
  ],

  npcs: [
    { who: 'F2_BEACH_1', pose: 'lie', dir: 'left', x: 72, y: 128 },
    { who: 'F2_BEACH_2', pose: 'lie', dir: 'right', x: 256, y: 156 }
  ],

  // Loop de 12 s: jogam água um no outro (cones um para o outro, sobre o mar); o Fabio vira para
  // a praia e varre a areia (da esquerda para a direita), depois a Ellen; os dois se abraçam
  // (sem cone, ~2,8 s). Janela: o abraço e a brincadeira de frente um para o outro.
  guards: [
    { who: 'FABIO_F2A1', x: 182, y: 82, wade: 12, face: 'right',
      look: 0, range: 50, half: 26,
      loop: [
        { t: 1.5 },
        { t: 0.4, look: 125, range: 112, half: 30 },
        { t: 2.4, look: 60 },
        { t: 0.4, look: 0, range: 50, half: 26 },
        { t: 2.8, look: 10 },
        { t: 0.3, eyes: 'closed', cone: false, look: 0 },     // o abraço
        { t: 2.2 },
        { t: 0.3, eyes: 'open', cone: true },
        { t: 1.7 }
      ] },

    { who: 'ELLEN_F2A1', x: 200, y: 82, wade: 12, face: 'left', heartAt: [-9, -30],
      look: 180, range: 50, half: 26,
      loop: [
        { t: 4.5, look: 170 },
        { t: 0.4, look: 120, range: 112, half: 30 },
        { t: 2.4, look: 55 },
        { t: 0.2, look: 180, range: 50, half: 26 },
        { t: 0.3, eyes: 'closed', cone: false, fx: 'heart' },
        { t: 2.2 },
        { t: 0.3, eyes: 'open', cone: true, fx: null },
        { t: 1.7 }
      ] }
  ]
};
