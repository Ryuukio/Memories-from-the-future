// Fase 5 · "Here and now" (SPEC, seções 6 e 11.8): a livraria-café, hoje, a partir das fotos.
// Parede da esquerda: a estante branca de nichos (continua na borda esquerda); teto preto com
// luminárias geométricas douradas e plantas penduradas; parede creme com a janela no fundo;
// mesas pretas com cadeiras de encosto curvo; carpete escuro; divisória de vidro com revisteiro e
// mural de avisos; balcão com máquina de café e caixa, com a prateleira de livros, quadros
// autografados, xícaras e a luminária de casquinha em cima; a escada do 2º andar à direita do
// balcão. Sem vigias. O Big Jimmy Junk aparece no meio da conversa ([villainArrives]).
window.SCENES = window.SCENES || {};

SCENES.SHOP = {
  look: {
    floor: 'carpet',
    wall: { style: 'shop', height: 62, shadow: true },
    edges: { left: 'shop', right: 'shop' },
    edgeWidth: { left: 14 },
    // V2: a luz quente das luminárias: sombras curtas no carpete
    light: { k: [0.04, 0.12], color: '#A098AC', contact: '#5E5668' },
    doors: {}
  },

  start: { x: 92, y: 132, dir: 'right' },
  // a escada: a Ellen chega aqui no fim (Flow.afterBattle)
  stairs: { zone: [334, 62, 40, 14], marker: [354, 52] },

  props: [
    { type: 'cubeShelf', x: 0, y: 0, w: 140 },
    { type: 'shopWindow', x: 166, y: 14 },
    { type: 'noticeBoard', x: 204, y: 18 },
    { type: 'counterWall', x: 222, y: 6 },
    { type: 'stairs', x: 330, y: -30 },
    { type: 'shopCounter', x: 228, y: 56 },
    { type: 'glassPartition', x: 150, y: 96 },
    { type: 'shopTable', x: 40, y: 64 },
    { type: 'shopTable', x: 92, y: 150 },
    { type: 'shopTable', x: 214, y: 140 },
    { type: 'shopTable', x: 300, y: 128 },
    { type: 'geoLamp', x: 60, y: 46 },
    { type: 'geoLamp', x: 190, y: 50 },
    { type: 'geoLamp', x: 300, y: 44 },
    { type: 'jimmy', id: 'jimmy', x: 236, y: 64, hidden: true }
  ]
};
