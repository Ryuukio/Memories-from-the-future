// Cenários da história: a lanchonete do vilão (prólogo, cena 1), o quarto do apartamento (cena 2),
// o laboratório (cena 3) e a livraria-café de hoje (fase 5).
//
// V2 (etapa 5): tudo no desenho novo, com as ferramentas de art.js. Cada objeto guarda o tamanho, a
// colisão e a visão da V1 (coordenadas velhas; o Room.build amplia) e ganha um `art` com o desenho
// novo, mais abaixo (os que animam, `liveNew` ou `fxNew`); os pisos, paredes e bordas novos ficam em
// Art.floors/walls/edges. O desenho da V1 daqui saiu.
(() => {
  const { props } = Scenery;

  // ---------- tamanho, colisão e visão dos objetos (V1; o desenho é o `art`, mais abaixo) ----------
  // Prólogo, cena 1 · lanchonete: o letreiro de neon (texto do config), os painéis de cardápio
  // iluminados (p.item: 0 hambúrguer, 1 batata, 2 refrigerante), o balcão comprido (p.w), as mesas com
  // sofá (booth), as banquetas do balcão (só desenho) e o Big Jimmy Junk (aparece com [villainArrives])
  props.neon = { layer: 'back', size: p => [Gfx.textWidth(p.text || '') * 2 + 20, 26] };
  props.menuPanel = { layer: 'back', size: () => [40, 24] };
  props.dinerCounter = { size: p => [p.w || 200, 26], solid: p => [0, 6, p.w || 200, 18], sight: p => [0, 6, p.w || 200, 16], base: 24 };
  props.booth = { size: () => [48, 40], solid: () => [0, 8, 48, 26], sight: () => [0, 0, 6, 34], base: 34 };
  props.dinerStool = { size: () => [12, 20], base: 19 };
  props.jimmy = { size: () => [96, 80], base: 74 };

  // Prólogo, cena 2 · o quarto (Apêndice C): a janela da varanda com a cortina azul, o ar-condicionado,
  // o armário embutido, o colchão azul no chão, o tapete felpudo e a mesinha branca (os dois últimos
  // também estão no F2 C1)
  props.curtainWindow = { layer: 'back', size: () => [64, 38] };
  props.aircon = { layer: 'back', size: () => [40, 13] };
  props.closet = { layer: 'back', size: () => [56, 38] };
  props.mattress = { size: () => [56, 70], solid: () => [0, 4, 56, 64], base: 10 };
  props.fluffyRug = { layer: 'back', size: () => [80, 40] };
  props.lowTable = { size: () => [36, 22], solid: () => [0, 4, 36, 16], base: 18 };

  // Prólogo, cena 3 · o laboratório: o quadro do Tony, o relógio, a prateleira da Heymans, a mesa com
  // o caderno do Dr King, a máquina do tempo (p.on: 0 desligada, 1 faiscando, 2 pronta; o Flow ajusta)
  // e o painel de controle
  props.blackboard = { layer: 'back', size: () => [112, 40] };
  props.labClock = { layer: 'back', size: () => [14, 14] };
  props.plantShelf = { layer: 'back', size: () => [88, 46] };
  props.labDesk = { size: () => [64, 30], solid: () => [0, 6, 64, 20], sight: () => null, base: 26 };
  props.timeMachine = { size: () => [60, 70], solid: () => [6, 52, 48, 14], sight: () => [6, 30, 48, 36], base: 64 };
  props.console = { size: () => [26, 30], solid: () => [0, 14, 26, 14], sight: () => null, base: 28 };

  // Fase 5 · a livraria-café (fotos SHOP_*): a estante de nichos (p.w), a janela do fundo, o mural, a
  // parede do balcão, a escada do 2º andar, o balcão, a divisória de vidro (bloqueia a passagem, não a
  // visão), as mesas com duas cadeiras e as luminárias geométricas (por cima de tudo)
  props.cubeShelf = { layer: 'back', size: p => [p.w || 120, 62] };
  props.shopWindow = { layer: 'back', size: () => [30, 36] };
  props.noticeBoard = { layer: 'back', size: () => [22, 34] };
  props.counterWall = { layer: 'back', size: () => [120, 56] };
  props.stairs = { layer: 'back', size: () => [52, 92] };
  props.shopCounter = { size: () => [100, 30], solid: () => [0, 8, 100, 18], sight: () => [0, 8, 100, 16], base: 26 };
  props.glassPartition = { size: () => [44, 62], solid: () => [0, 50, 44, 8], sight: () => null, base: 56 };
  props.shopTable = { size: () => [40, 46], solid: () => [6, 14, 28, 18], sight: () => null, base: 34 };
  props.geoLamp = { hidden: true, size: () => [1, 1] };

  // ======================================================================
  //  V2 (art.js): tudo em coordenadas novas (480 × 240)
  // ======================================================================
  const A = Art, T = Art.tones, { pick, vnoise, sphere, bay, mix, clamp1 } = Art, h01 = Art.hash;
  const K = 1.25, kx = n => Math.round(n * K);
  const WHITE = T(['#9EA2B4', '#BCC0CC', '#D6D8DE', '#E8E8EA', '#F6F6F4', '#FFFFFF']);
  const CHROME = T(['#3A3E4A', '#5A606E', '#7E8492', '#A4AAB6', '#C8CCD6', '#E8EAF0', '#FFFFFF']);
  const BLACKW = T(['#0E0C12', '#16141A', '#1E1C24', '#28262E', '#34323C', '#44424C']);
  const OAK = T(['#7A5030', '#94663C', '#AE7E4C', '#C4945E', '#D6AA74', '#E4C08E', '#F0D6AC']);
  const DARKW = T(['#1E120A', '#2A1A10', '#3A2416', '#4C301E', '#5E3E28', '#704E34']);
  const GOLD = T(['#6A4A1A', '#8A6A2A', '#AE8A3A', '#C9A24A', '#E2C068', '#F6E09A']);
  // o que anima a cada quadro: canvas e medidas guardados em cache
  const cvCache = {};
  const cached = (key, make) => cvCache[key] || (cvCache[key] = make());

  // texto na fonte nova como canvas, em qualquer escala (o Room.build monta com a fonte da V1)
  function textCanvas(str, color, scale = 1) {
    const prev = Gfx.font('v2');
    try {
      const cv = Gfx.canvas(Gfx.textWidth(str) * scale + 2, 12 * scale);
      Gfx.text(str, 0, 0, color, { ctx: cv.cx, scale });
      return cv;
    } finally {
      Gfx.font(prev);
    }
  }
  // espelha uma superfície na horizontal
  function mirror(s) {
    const m = A.surface(s.w, s.h);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.get(x, y); if (c) m.put(s.w - 1 - x, y, c, s.alpha(x, y) / 255); }
    return m;
  }
  // sombra suave embaixo de uma faixa (o que está pendurado na parede)
  function wallShadow(s, x0, y0, w, h, a = 0.3) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) s.put(x, y, '#140F1E', a * (1 - (y - y0) / h));
  }

  // ---------- comida (cardápio, mesas, balcão) ----------
  const BUN = T(['#7A3E14', '#9A5420', '#BC6E30', '#D68C44', '#E8AA5E', '#F4C882']);
  const PATTY = T(['#24100A', '#36180C', '#4A2414', '#5E321C']);
  const CHEESE = T(['#C8840E', '#E8A61E', '#F8C83A', '#FFE07A']);
  const LETTUCE = T(['#2A6218', '#3A8222', '#56A436', '#7CC452']);
  const FRY = T(['#B07A0C', '#D09A1C', '#EABA36', '#F8D86A', '#FFF0A8']);
  const KREAD = T(['#6A0E16', '#8A1820', '#AC242C', '#CC3A3A', '#E2605A', '#F28A80']);
  // hambúrguer de w px de largura, com o meio em (cx, cy)
  function burgerArt(s, cx, cy, w = 18) {
    const r = w / 2, top = cy - Math.round(w * 0.2);
    s.ellipse(cx, top, r, r * 0.55, (x, y, nx, ny) => (ny > 0.35 ? null : pick(BUN, sphere(nx, ny) + 0.12, x, y)));
    for (let k = 0; k < Math.round(w / 3); k++) s.put(Math.round(cx - r * 0.6 + h01(k, w, 300) * r * 1.2), Math.round(top - r * 0.35 + h01(k, w, 301) * r * 0.35), '#FFF6D8');
    const y0 = Math.round(top + r * 0.22);
    for (let x = Math.round(cx - r - 1); x <= cx + r; x++) {
      s.put(x, y0 + ((x & 1) ? 0 : 1), pick(LETTUCE, 0.7 - (x - cx + r) / w * 0.4, x, y0));
      s.put(x, y0 + 1, CHEESE[2]);
      if (h01(x, w, 302) < 0.25) s.put(x, y0 + 2, CHEESE[1]);
      for (let j = 2; j < 4; j++) s.put(x, y0 + j, pick(PATTY, 0.6 - (x - cx + r) / w * 0.5 - j * 0.1, x, y0 + j));
      for (let j = 4; j < 6; j++) if (Math.abs(x - cx) < r - (j === 5 ? 1 : 0)) s.put(x, y0 + j, pick(BUN, 0.55 - (x - cx + r) / w * 0.3 - (j === 5 ? 0.25 : 0), x, y0 + j));
    }
  }
  // batata frita na caixinha vermelha (sem marca)
  function friesArt(s, cx, cy, w = 12) {
    const r = Math.round(w / 2);
    for (let k = 0; k < r + 2; k++) {
      const fx = cx - r + 1 + k * 2 * r / (r + 1), hgt = 4 + Math.round(h01(k, w, 303) * 4);
      for (let j = 0; j < hgt; j++) { s.put(Math.round(fx), cy - j, pick(FRY, 0.85 - j * 0.04 + (j === hgt - 1 ? 0.2 : 0), Math.round(fx), cy - j)); s.put(Math.round(fx) + 1, cy - j, FRY[1]); }
    }
    for (let y = cy; y < cy + Math.round(w * 0.75); y++) {
      const half = r - (y - cy) * 0.25;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) s.put(x, y, pick(KREAD, 0.75 - (x - cx + half) / (2 * half) * 0.5 - (y === cy ? -0.15 : 0), x, y));
    }
    s.put(cx - 1, cy + 3, '#FFF2C8'); s.put(cx, cy + 3, '#FFF2C8'); s.put(cx + 1, cy + 3, '#FFF2C8');
  }
  // copo de refrigerante com tampa e canudo
  function sodaArt(s, cx, y0, h = 10) {
    for (let y = y0 + 2; y < y0 + h; y++) {
      const half = 3 - (y - y0) * 0.08;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        const band = (y - y0) > h * 0.35 && (y - y0) < h * 0.65;
        s.put(x, y, band ? pick(WHITE, 0.9 - (x - cx + half) * 0.08, x, y) : pick(KREAD, 0.8 - (x - cx + half) / (2 * half) * 0.5, x, y));
      }
    }
    for (let x = cx - 3; x <= cx + 3; x++) { s.put(x, y0 + 1, WHITE[4]); s.put(x, y0 + 2, WHITE[2]); }
    s.line(cx + 1, y0 + 1, cx + 3, y0 - 4, '#F2F2F0'); s.put(cx + 3, y0 - 4, '#D8443A');
  }

  // ======================================================================
  //  Prólogo, cena 1 · JIMMY'S JUNK PALACE, uma lanchonete de fast-food numa noite comum em Nagoia:
  //  piso xadrez vermelho e creme encerado (com o neon refletido), a faixa de janelas com a cidade à
  //  noite lá fora, o letreiro de neon rosa e os painéis de cardápio pendurados na frente dela, o
  //  balcão de inox atrás do balcão vermelho, as mesas com sofá de vinil e as banquetas cromadas
  // ======================================================================
  const DRED = T(['#4E1016', '#6A161E', '#8A2028', '#A82A32', '#C23A40', '#D85450', '#EC7A6C']);
  const DCREAM = T(['#A8987E', '#C2B296', '#D8C8AC', '#E8DCC2', '#F4EAD8', '#FCF6EA', '#FFFFFF']);
  const MAROON = T(['#1C0810', '#280C16', '#36121E', '#441A28', '#542232', '#682C3E']);
  const NIGHT = T(['#070918', '#0C1024', '#121832', '#1A2242', '#242C54', '#30345E']);
  const NEON_X = 234;   // o meio do letreiro (px novos), para o reflexo rosa no chão e no vidro

  Art.floors.diner = (S, look) => {
    const top = look.wall.height, TL = 15;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const tx = Math.floor(x / TL), ty = Math.floor((y - top) / TL), fx = x % TL, fy = (y - top) % TL;
      const red = (tx + ty) % 2 === 0;
      let t = 0.4 + (vnoise(x, y, 9, 400) - 0.5) * 0.05 + (h01(tx, ty, 401) - 0.5) * 0.05 - (y - top) / (240 - top) * 0.08;
      if (fx === 0 || fy === 0) t += 0.09;
      if (fx === TL - 1 || fy === TL - 1) t -= 0.1;
      // as luzes do teto refletidas no piso encerado
      for (const lx of [110, 240, 370]) {
        const d = Math.hypot((x - lx) / 46, (y - 178) / 22);
        if (d < 1) t += (1 - d) * (1 - d) * 0.32;
      }
      // um arranhão aqui e ali
      if (h01(x, y, 402) < 0.003) t -= 0.15;
      let c = A.band(red ? DRED : DCREAM, t, x, y, 3);
      // o rosa do neon refletido no chão, perto da parede embaixo do letreiro
      const nd = Math.max(0, 1 - (y - top) / 40) * Math.max(0, 1 - Math.abs(x - NEON_X) / 170);
      if (nd > 0) c = mix(c, '#FF4AB4', Math.floor((nd * 0.42 + (bay(x, y) - 0.5) * 0.1) * 8) / 8);
      S.put(x, y, c);
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#8A7480', (1 - (y - top) / 5) * 0.7);
  };

  // a cidade à noite lá fora (y de 0 a H, dentro da faixa de janelas)
  function nightView(x, y, H) {
    let c = pick(NIGHT, 0.15 + y / H * 0.75 + (vnoise(x, y, 9, 410) - 0.5) * 0.12, x, y);
    if (h01(x, y, 411) < 0.006 && y < H * 0.45) c = '#B8B8E8';
    // prédios em silhueta com as janelas acesas
    const bi = Math.floor((x + 7) / 23), lx = (x + 7) % 23, bh = 9 + Math.floor(h01(bi, 0, 412) * 19), top = H - bh;
    if (y >= top) {
      c = pick(T(['#06060E', '#0C0E1C', '#14182C', '#1E2238']), 0.35 + (lx < 2 ? 0.35 : 0) + (y === top ? 0.5 : 0), x, y);
      if (lx % 4 === 2 && (y - top) % 4 === 2 && h01(bi * 31 + lx, y, 413) < 0.5) c = h01(bi, y, 414) < 0.75 ? '#F2C86A' : '#7AD8F0';
      // a luzinha vermelha no topo do prédio mais alto
      if (bh > 25 && y === top - 0 && lx === 11) c = '#FF5A4A';
    }
    // reflexo no vidro: faixas diagonais fracas
    const g = ((x - y * 1.3) % 48 + 48) % 48;
    if (g < 3) c = mix(c, '#7A8AC8', 0.22);
    // o rosa do letreiro aceso batendo no vidro em volta
    const nd = Math.max(0, 1 - Math.abs(x - NEON_X) / 175);
    if (nd > 0) c = mix(c, '#C8308C', Math.floor(nd * nd * 0.35 * 8 + bay(x, y)) / 8 * 0.9);
    return c;
  }

  // Parede: teto escuro, a faixa de janelas com a cidade à noite (caixilhos cromados), o peitoril, a
  // faixa de azulejinho xadrez, o friso cromado e o rodapé; atrás do balcão, o balcão de trabalho de
  // inox (a passagem da cozinha com a luz quente, a máquina de milk-shake, o refrigerante, os copos)
  Art.walls.diner = (S, look) => {
    const h = look.wall.height, w0 = 6, w1 = 42;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 4) c = pick(BLACKW, 0.2 + y * 0.12, x, y);
      else if (y < w0) c = y === 4 ? CHROME[5] : CHROME[2];
      else if (y < w1) {
        const mx = x % 48;
        c = mx < 2 ? pick(CHROME, mx === 0 ? 0.85 : 0.3, x, y) : nightView(x, y - w0, w1 - w0);
      } else if (y < w1 + 3) c = pick(CHROME, y === w1 ? 0.95 : y === w1 + 1 ? 0.6 : 0.2, x, y);
      else if (y < h - 7) {
        const tx = Math.floor(x / 6), ty = Math.floor((y - w1 - 3) / 6), fx = x % 6, fy = (y - w1 - 3) % 6;
        const red = (tx + ty) % 2 === 0;
        c = pick(red ? DRED : DCREAM, 0.5 + (fx === 0 || fy === 0 ? 0.15 : 0) - (fx === 5 || fy === 5 ? 0.15 : 0) - (y - w1) * 0.006, x, y);
      } else if (y < h - 3) c = pick(CHROME, y === h - 7 ? 0.95 : y === h - 6 ? 0.7 : 0.35, x, y);
      else c = pick(MAROON, 0.4 - (y - h + 3) * 0.12, x, y);
      S.put(x, y, c);
    }
    // a sombra do peitoril nos azulejos
    for (let x = 0; x < 480; x++) { S.mul(x, w1 + 3, '#8A7A80', 0.8); S.mul(x, w1 + 4, '#8A7A80', 0.4); }

    // o balcão de trabalho, atrás do balcão (x 92 a 383)
    const b0 = 92, b1 = 383, y0 = w1 + 3;
    for (let y = y0; y < h; y++) for (let x = b0; x < b1; x++) {
      const ex = Math.min(x - b0, b1 - 1 - x);
      let c = pick(CHROME, 0.62 - (y - y0) * 0.012 + ((x - b0) % 30 === 0 ? -0.2 : 0) + (ex === 0 ? -0.3 : 0) + (vnoise(x, y * 0.2, 5, 415) - 0.5) * 0.1, x, y);
      if (y === y0 + 9 || y === y0 + 10) c = y === y0 + 9 ? CHROME[6] : CHROME[1];   // a prateleira
      S.put(x, y, c);
    }
    // a passagem da cozinha no meio, com a luz quente das lâmpadas de esquentar
    const k0 = 206, k1 = 268;
    for (let y = y0; y < y0 + 9; y++) for (let x = k0; x < k1; x++) {
      let c = pick(T(['#2A1208', '#4A2210', '#7A3A16', '#B8601E', '#E89038', '#FFC870']), 0.25 + (y - y0) / 9 * 0.55 - Math.abs(x - (k0 + k1) / 2) / 40 * 0.2, x, y);
      if (x === k0 || x === k1 - 1) c = CHROME[1];
      S.put(x, y, c);
    }
    for (let x = k0 + 4; x < k1 - 4; x += 12) { S.rect(x, y0, 5, 2, '#3A3A44'); S.put(x + 2, y0 + 2, '#FFB040'); }
    // o trilho dos pedidos com os papeizinhos
    for (let x = k0 + 2; x < k1 - 2; x++) S.put(x, y0 - 1, CHROME[4]);
    for (let k = 0; k < 4; k++) S.rect(k0 + 8 + k * 14, y0, 5, 6, k % 2 ? '#F4F0E0' : '#FFF6D8');
    // em cima da prateleira: copos empilhados, a máquina de milk-shake verde-água, o pote de café
    for (let k = 0; k < 3; k++) for (let j = 0; j < 7; j++) S.put(108 + k * 5, y0 + 8 - j, pick(WHITE, 0.8 - j * 0.04 + (k === 0 ? 0.1 : 0), 108 + k * 5, y0 + 8 - j)), S.put(109 + k * 5, y0 + 8 - j, WHITE[2]);
    for (let y = y0; y < y0 + 9; y++) for (let x = 140; x < 152; x++) S.put(x, y, pick(T(['#2A8A80', '#3AA89A', '#5AC8B4', '#8AE4D0']), 0.75 - (x - 140) * 0.05 - (y - y0) * 0.02, x, y));
    S.rect(143, y0 + 5, 2, 4, CHROME[4]); S.rect(147, y0 + 5, 2, 4, CHROME[4]);
    for (let y = y0 + 2; y < y0 + 9; y++) for (let x = 168; x < 176; x++) S.put(x, y, y < y0 + 4 ? '#2A2028' : pick(T(['#3A1A0E', '#5A2A16', '#7A3E20']), 0.6 - (x - 168) * 0.06, x, y));
    // embaixo da prateleira: as torneiras de refrigerante e os botões
    for (let k = 0; k < 4; k++) {
      const tx = 290 + k * 9;
      S.rect(tx, y0 + 11, 6, 6, pick(CHROME, 0.8, tx, y0 + 11)); S.rect(tx, y0 + 11, 6, 1, CHROME[6]);
      S.rect(tx + 2, y0 + 17, 2, 3, CHROME[2]);
      S.rect(tx + 1, y0 + 12, 4, 2, ['#D8443A', '#F2C14E', '#5DAA62', '#E8E0D0'][k]);
    }
    for (let y = y0 + 11; y < y0 + 19; y++) for (let x = 330; x < 360; x++) S.put(x, y, pick(T(['#5A2A16', '#8A4A22', '#B86A30']), 0.4 + Math.sin(x * 0.8) * 0.2, x, y));   // torradeira e chapa
    for (let x = 330; x < 360; x++) S.put(x, y0 + 11, CHROME[5]);
    for (let x = 0; x < 480; x++) S.put(x, h - 1, '#14060C');
  };
  Art.edges.diner = (S, x, top, gap, side) => {
    for (let y = top - 10; y < 240; y++) for (let i = 0; i < 5; i++) {
      const inner = side === 'left' ? i : 4 - i;
      S.put(x + i, y, inner === 4 ? pick(CHROME, 0.6 + (vnoise(x, y, 6, 416) - 0.5) * 0.3, x + i, y) : pick(MAROON, 0.25 + inner * 0.1 + (vnoise(x + i, y * 0.3, 2, 417) - 0.5) * 0.15, x + i, y));
    }
  };

  // ---------- o letreiro de neon (texto do config) ----------
  // Medidas: a placa no lugar da da V1 (o mesmo meio), com o texto na fonte nova em 2×
  function neonLayout(p) {
    const text = p.text || '';
    return cached('neonL|' + text, () => {
      const prev = Gfx.font('v1'), w1 = Gfx.textWidth(text) * 2 + 20;
      Gfx.font('v2');
      const tw = Gfx.textWidth(text) * 2;
      Gfx.font(prev);
      const W = tw + 28, H = 36;
      return { W, H, tw, dx: Math.round(kx(w1) / 2 - W / 2), dy: -1 };
    });
  }
  // a placa: fundo ameixa escuro, moldura cromada, parafusos e os tubos apagados (o neon aceso é o liveNew)
  props.neon.art = p => {
    const L = neonLayout(p), s = A.surface(L.W, L.H + 3);
    for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
      const e = Math.min(x, y, L.W - 1 - x, L.H - 1 - y);
      const c = e < 2 ? pick(CHROME, e === 0 ? (x === 0 || y === 0 ? 0.8 : 0.2) : 0.55, x, y)
        : pick(T(['#0A050E', '#120818', '#1A0C22', '#24102C']), 0.5 - y / L.H * 0.35 + (vnoise(x, y, 5, 420) - 0.5) * 0.15, x, y);
      s.put(x, y, c);
    }
    s.draw(textCanvas(p.text || '', '#5A2A50', 2), 14, 9);
    for (let x = 14; x < 14 + L.tw; x++) { s.put(x, L.H - 7, '#5A4A2A'); s.put(x, L.H - 6, '#2E2416'); }
    for (const [x, y] of [[4, 4], [L.W - 5, 4], [4, L.H - 5], [L.W - 5, L.H - 5]]) { s.put(x, y, CHROME[6]); s.put(x + 1, y + 1, CHROME[1]); }
    wallShadow(s, 2, L.H, L.W - 2, 3, 0.35);
    return { spr: s, dx: L.dx, dy: L.dy, shadow: false };
  };
  // o neon aceso: os tubos (rosa, a linha de baixo dourada) e o brilho pontilhado em volta
  const neonLit = p => cached('neonLit|' + (p.text || ''), () => {
    const L = neonLayout(p), pad = 6, W = L.W + pad * 2, H = L.H + pad * 2;
    const tc = textCanvas(p.text || '', '#FFFFFF', 2), td = tc.cx.getImageData(0, 0, tc.width, tc.height).data;
    const on = new Uint8Array(W * H);
    for (let y = 0; y < tc.height; y++) for (let x = 0; x < tc.width; x++) if (td[(y * tc.width + x) * 4 + 3] > 128 && y + 9 + pad < H) on[(y + 9 + pad) * W + x + 14 + pad] = 1;
    for (let x = 14; x < 14 + L.tw; x++) on[(L.H - 7 + pad) * W + x + pad] = 2;
    const tube = A.surface(W, H), glow = A.surface(W, H), R = 5;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = on[y * W + x];
      if (v) {
        const edge = !on[y * W + x - 1] || !on[y * W + x + 1] || !on[(y - 1) * W + x] || !on[(y + 1) * W + x];
        tube.put(x, y, v === 2 ? (edge ? '#FFB838' : '#FFF2B8') : (edge ? '#FF6AC8' : '#FFEAF8'));
        continue;
      }
      let d = 99, kind = 1;
      for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
        const X = x + i, Y = y + j;
        if (X < 0 || Y < 0 || X >= W || Y >= H || !on[Y * W + X]) continue;
        const dd = Math.hypot(i, j);
        if (dd < d) { d = dd; kind = on[Y * W + X]; }
      }
      if (d > R) continue;
      const a = Math.floor((1 - d / (R + 1)) * 4 + bay(x, y) * 0.999) / 4;
      if (a > 0) glow.put(x, y, kind === 2 ? '#FFA020' : '#FF2AA8', a * 0.75);
    }
    return { tube: tube.canvas(), glow: glow.canvas(), dx: L.dx - pad, dy: L.dy - pad };
  });
  props.neon.liveNew = (ctx, p, world) => {
    const N = neonLit(p), x = Math.round(p.x * K) + N.dx, y = Math.round(p.y * K) + N.dy, t = world.t || 0;
    // de vez em quando o neon engasga e pisca
    const cyc = t % 7.3;
    if (cyc > 6.5 && Math.floor(cyc * 23) % 3 !== 0) return;
    ctx.globalAlpha = 0.82 + 0.12 * Math.sin(t * 7.7) * Math.sin(t * 2.3);
    ctx.drawImage(N.glow, x, y);
    ctx.globalAlpha = 1;
    ctx.drawImage(N.tube, x, y);
  };

  // painel de cardápio iluminado (caixa de luz): a moldura preta, o cabeçalho vermelho e a comida
  props.menuPanel.art = p => {
    const s = A.surface(50, 33), item = p.item || 0;
    for (let y = 0; y < 30; y++) for (let x = 0; x < 50; x++) {
      const e = Math.min(x, y, 49 - x, 29 - y);
      let c;
      if (e < 2) c = pick(BLACKW, e === 0 ? 0.3 : 0.7, x, y);
      else if (y < 8) c = pick(KREAD, 0.6 - (x - 2) / 46 * 0.25 + (y === 2 ? 0.2 : 0), x, y);
      else {
        // a luz de dentro: mais clara no meio
        const d = Math.hypot((x - 25) / 26, (y - 18) / 14);
        c = pick(T(['#D8C8A8', '#E8DCC0', '#F4ECD6', '#FCF8EC', '#FFFFFF']), 0.95 - d * 0.5, x, y);
      }
      s.put(x, y, c);
    }
    // o cabeçalho com uns tracinhos brancos (letras de mentira)
    for (let k = 0; k < 5; k++) s.rect(6 + k * 8, 4, 5, 1, '#FFE8D8');
    if (item === 0) burgerArt(s, 21, 19, 20);
    else if (item === 1) friesArt(s, 20, 18, 14);
    else sodaArt(s, 20, 11, 14);
    // a etiqueta de preço
    s.rect(36, 21, 10, 6, '#F2C14E'); s.rect(36, 21, 10, 1, '#FFE08A'); s.rect(38, 23, 6, 1, '#8A5A12'); s.rect(38, 25, 4, 1, '#8A5A12');
    wallShadow(s, 2, 30, 48, 3, 0.4);
    return { spr: s, shadow: false };
  };

  // balcão comprido: tampo branco com a borda cromada, a frente de vinil vermelho em gomos com o friso
  // cromado, o rodapé de inox; em cima, as duas caixas registradoras, o porta-guardanapo, ketchup e
  // mostarda, a torta na redoma, o milk-shake e o hambúrguer do Fabio no prato
  props.dinerCounter.art = p => {
    const W = kx(p.w || 200), s = A.surface(W, 33);
    for (let y = 8; y < 31; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 14) c = A.band(WHITE, 0.9 - x / W * 0.15 + (y === 8 ? 0.1 : 0) - (y === 13 ? 0.22 : 0) + (h01(x, y, 421) < 0.02 ? -0.15 : 0), x, y);
      else if (y < 16) c = pick(CHROME, y === 14 ? 0.95 : 0.45, x, y);
      else if (y < 28) {
        // gomos do vinil, com o friso cromado no meio
        if (y === 21) c = CHROME[5];
        else if (y === 22) c = CHROME[2];
        else {
          const g = x % 8, j = y < 21 ? y - 16 : y - 23;
          c = pick(KREAD, 0.62 - (g === 0 ? 0.35 : g === 1 ? -0.12 : 0) - j * 0.03 - x / W * 0.1, x, y);
        }
      } else c = pick(CHROME, y === 28 ? 0.9 : 0.4 - (y - 28) * 0.1, x, y);
      s.put(x, y, c);
    }
    // caixas registradoras
    for (const rx of [30, W - 62]) {
      for (let y = 0; y < 10; y++) for (let x = rx; x < rx + 22; x++) {
        let c = pick(T(['#22242C', '#30333E', '#40444F', '#555A66']), 0.65 - (x - rx) * 0.02 - y * 0.02 + (y === 0 ? 0.25 : 0), x, y);
        if (y >= 2 && y < 5 && x > rx + 2 && x < rx + 19) c = pick(T(['#1E6A50', '#3AA87A', '#7AE0B0']), 0.6 + (x === rx + 3 ? 0.3 : 0), x, y);
        if (y >= 6 && (x - rx) % 3 === 1 && x < rx + 20) c = '#C8CCD6';
        s.put(x, y, c);
      }
    }
    // porta-guardanapo, ketchup e mostarda
    for (let y = 2; y < 9; y++) for (let x = 64; x < 72; x++) s.put(x, y, y < 4 && x > 65 && x < 70 ? '#FFFFFF' : pick(CHROME, 0.8 - (x - 64) * 0.07, x, y));
    for (const [bx, col] of [[75, '#D8283A'], [79, '#F2C42E']]) for (let y = 1; y < 9; y++) { s.put(bx, y, mix(col, '#FFFFFF', y < 2 ? 0.6 : 0.3)); s.put(bx + 1, y, col); s.put(bx + 2, y, mix(col, '#000000', 0.3)); }
    // o prato com o hambúrguer do Fabio
    s.ellipse(127, 10, 10, 3, (x, y, nx, ny) => pick(WHITE, 0.85 - ny * 0.2 - nx * 0.1, x, y));
    burgerArt(s, 127, 7, 14);
    // a torta na redoma de vidro
    s.ellipse(160, 4, 9, 7, (x, y, nx, ny) => (ny > 0.75 ? null : mix('#D8ECF4', '#FFFFFF', Math.max(0, -nx - ny) * 0.6)));
    for (let x = 153; x < 168; x++) { s.put(x, 8, pick(BUN, 0.6 - (x - 153) * 0.03, x, 8)); s.put(x, 9, '#8A2A3A'); s.put(x, 10, WHITE[3]); }
    s.put(156, 1, '#FFFFFF'); s.put(155, 2, '#FFFFFF');
    // o milk-shake com o canudo e a cereja
    for (let y = 2; y < 11; y++) for (let x = 194; x < 200; x++) s.put(x, y, y < 4 ? '#FFF6F8' : pick(T(['#D88AA8', '#EAA8C0', '#F8C8DA']), 0.7 - (x - 194) * 0.1, x, y));
    s.line(198, 2, 200, -1, '#F2F2F0'); s.put(196, 1, '#D8283A');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 31, contact: [W / 2, 31, W / 2, 1.5] };
  };

  // mesa com sofá de vinil vermelho capitonê dos dois lados, tampo de fórmica branca com a borda cromada
  // e o lanche em cima (muda com o lugar da mesa)
  const VINYL = T(['#3E0A10', '#5A1018', '#7A1822', '#9C222C', '#BC3438', '#D6524E', '#EA7A70']);
  props.booth.art = p => {
    const s = A.surface(60, 50), v = h01(p.x | 0, p.y | 0, 430);
    const bench = (x0, back) => {
      for (let y = 2; y < 48; y++) for (let x = x0; x < x0 + 11; x++) {
        const i = x - x0, isBack = back === 'left' ? i < 4 : i > 6;
        let t;
        if (y > 43) t = 0.25 - (y - 44) * 0.05;   // a frente do banco
        else if (isBack) t = (back === 'left' ? 0.72 - i * 0.08 : 0.3 + (10 - i) * 0.06) + (y === 2 ? 0.2 : 0);
        else {
          // assento em gomos: capitonê
          const seg = ((y - 2) % 10) / 10, nx = back === 'left' ? (i - 4) / 3 - 1 : 1 - (i - 3) / 3;
          t = 0.35 + sphere(clamp1(nx * 0.6), clamp1(seg * 2 - 1)) * 0.4;
          if ((y - 2) % 10 === 0) t -= 0.25;
        }
        s.put(x, y, pick(VINYL, t, x, y));
      }
      for (let y = 7; y < 44; y += 10) s.put(back === 'left' ? x0 + 7 : x0 + 3, y, '#2A060A');
      for (let y = 2; y < 44; y++) s.put(back === 'left' ? x0 : x0 + 10, y, back === 'left' ? CHROME[5] : CHROME[2]);
    };
    bench(0, 'left');
    bench(49, 'right');
    // a mesa
    for (let y = 14; y < 38; y++) for (let x = 13; x < 47; x++) {
      let c;
      if (y < 34) {
        c = A.band(WHITE, 0.86 - (x - 13) / 34 * 0.18 - (y - 14) * 0.004 + (y === 14 ? 0.1 : 0), x, y);
        if (h01(x, y, 431) < 0.025) c = mix(c, h01(x, y, 432) < 0.5 ? '#E06A6A' : '#6AA8D8', 0.35);   // fórmica com pontinhos
      } else c = pick(CHROME, y === 34 ? 0.95 : 0.45 - (y - 35) * 0.1, x, y);
      s.put(x, y, c);
    }
    for (let y = 38; y < 44; y++) { s.put(29, y, CHROME[4]); s.put(30, y, CHROME[2]); }
    for (let x = 25; x < 35; x++) s.put(x, 44, CHROME[x < 30 ? 4 : 2]);
    // o lanche: a cestinha com papel xadrez e o hambúrguer, a batata e o refrigerante
    for (let y = 22; y < 32; y++) for (let x = 15; x < 30; x++) {
      const edge = y === 22 || y === 31 || x === 15 || x === 29;
      s.put(x, y, edge ? KREAD[y === 31 ? 1 : 3] : ((x >> 1) + (y >> 1)) % 2 ? '#F4EEE2' : '#E0605A');
    }
    burgerArt(s, 22, 26, 10);
    friesArt(s, 36, 27, 8);
    sodaArt(s, v < 0.5 ? 41 : 34, 15, 9);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 7, contact: [30, 47, 29, 1.5] };
  };

  // banqueta cromada com o assento vermelho
  props.dinerStool.art = () => {
    const s = A.surface(15, 25);
    for (let y = 6; y < 21; y++) { s.put(6, y, CHROME[5]); s.put(7, y, CHROME[3]); s.put(8, y, CHROME[1]); }
    s.ellipse(7.5, 22, 5.5, 2, (x, y, nx, ny) => pick(CHROME, sphere(nx, ny) + 0.1, x, y));
    for (let x = 1; x < 15; x++) { s.put(x, 6, CHROME[x < 7 ? 5 : 2]); s.put(x, 7, CHROME[1]); }
    s.ellipse(7.5, 4, 7, 3.6, (x, y, nx, ny) => pick(VINYL, sphere(nx, ny) + 0.15, x, y));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 24, contact: [7.5, 23, 6, 1.5] };
  };

  // o Big Jimmy Junk como objeto do cenário (aparece com [show:jimmy] ou [villainArrives]), com os pés
  // no mesmo ponto do cenário (× 1,25)
  props.jimmy.liveNew = (ctx, p, world) => {
    Jimmy.draw(ctx, (p.x + 48) * K, (p.y + 74) * K, { t: world.t, form: p.form || 'normal' });
  };

  // ======================================================================
  //  Prólogo, cena 2 · o quarto do apartamento (Apêndice C), no fim da tarde: piso de madeira clara,
  //  parede branca com o rodameio de madeira escura (e a foto dos dois, que ele não lembra), a janela
  //  da varanda com a cortina azul e o céu do entardecer, o ar-condicionado, o armário embutido, o
  //  colchão azul no chão com o cobertor azul-marinho dobrado; a luz da janela cai no chão
  // ======================================================================
  const PLASTER = T(['#B4ACA2', '#C8C0B6', '#D8D2C8', '#E6E0D6', '#F0ECE4', '#F8F6F0', '#FFFFFF']);
  const BROWNW = T(['#3A2214', '#4E2E1A', '#643C22', '#7A4C2C', '#8E5E38', '#A27046', '#B68456']);

  // a foto dos dois na parede: ela loira, ele de cabelo e barba escuros, com o céu e o mar atrás
  function couplePhoto(S, x0, y0) {
    const W = 24, H = 20;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const e = Math.min(x, y, W - 1 - x, H - 1 - y);
      let c;
      if (e < 2) c = pick(DARKW, e === 0 ? 0.3 : 0.75, x, y);
      else if (e < 3) c = '#F4F0E6';
      else {
        c = pick(T(['#4A88C8', '#6AA8E0', '#9ACAF0', '#CDE6F8']), 0.9 - (y - 3) / 10, x, y);
        if (y > 11) c = pick(T(['#2A6AA0', '#3A88B8', '#5AA8D0']), 0.5 + Math.sin(x * 1.3) * 0.2, x, y);
      }
      S.put(x0 + x, y0 + y, c);
    }
    // as duas cabecinhas: a Ellen (loira, à esquerda) e o Fabio (cabelo e barba escuros)
    const head = (cx, hair, beard) => {
      for (let y = 6; y < 17; y++) for (let x = cx - 3; x <= cx + 3; x++) {
        const dx = x - cx, dy = y - 10;
        if (dx * dx / 10 + dy * dy / 13 > 1.4) continue;
        let c = '#F2C8A8';
        if (dy < -1 || (hair !== '#2B201C' && Math.abs(dx) > 2 && dy < 4)) c = hair;
        if (beard && dy > 2 && Math.abs(dx) < 3) c = '#3A2A22';
        if (y > 14) c = beard ? '#D9A62E' : '#F4F6F8';
        S.put(x0 + x, y0 + y, c);
      }
      S.put(x0 + cx - 1, y0 + 10, '#2A1E1A'); S.put(x0 + cx + 1, y0 + 10, '#2A1E1A');
    };
    head(9, '#E8C870', false);
    head(15, '#2B201C', true);
    S.put(x0 + 12, y0 + 9, '#F06A8A');   // um coraçãozinho entre os dois
    for (let y = y0 + 2; y < y0 + H + 2; y++) S.put(x0 + W, y, '#140F1E', 0.25);
    for (let x = x0 + 2; x <= x0 + W; x++) S.put(x, y0 + H, '#140F1E', 0.25);
  }

  Art.walls.apt = (S, look) => {
    const h = look.wall.height, rail = h - 16;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 3) c = pick(PLASTER, 0.75 - y * 0.12, x, y);
      else if (y === 3) c = PLASTER[1];
      else if (y < rail) {
        // a luz da tarde, mais forte perto da janela
        const d = Math.max(0, 1 - Math.abs(x - 240) / 150);
        c = pick(PLASTER, 0.6 + d * 0.22 - (y - 4) * 0.003 + (vnoise(x, y, 5, 440) - 0.5) * 0.08 + (h01(x, y, 441) < 0.04 ? -0.08 : 0), x, y);
      } else if (y < rail + 3) c = pick(BROWNW, y === rail ? 0.85 : 0.4 - (y - rail) * 0.1, x, y);
      else if (y < h - 3) c = pick(PLASTER, 0.55 - (y - rail - 3) * 0.01 + (vnoise(x, y, 5, 442) - 0.5) * 0.06, x, y);
      else c = pick(BROWNW, y === h - 3 ? 0.7 : 0.3, x, y);
      S.put(x, y, c);
    }
    couplePhoto(S, 150, 15);
    // um ganchinho com a bolsa dela, perto da porta do armário
    S.rect(132, 18, 2, 2, BROWNW[1]);
    for (let y = 20; y < 36; y++) for (let x = 127; x < 139; x++) {
      const dx = (x - 133) / 6, dy = (y - 28) / 8;
      if (y < 26 && Math.abs(x - 133 + (y - 20) * 0.0) < (y - 20) * 0.8 && Math.abs(x - 133) > (y - 20) * 0.8 - 1) S.put(x, y, '#5A3A2A');
      if (y >= 26 && dx * dx + dy * dy < 1) S.put(x, y, pick(T(['#5A3A5A', '#7A4E78', '#9A6A98', '#B88AB4']), sphere(dx, dy), x, y));
    }
  };
  Art.edges.apt = (S, x, top, gap, side) => {
    for (let y = top - 10; y < 240; y++) for (let i = 0; i < 5; i++) {
      const inner = side === 'left' ? i : 4 - i;
      S.put(x + i, y, pick(PLASTER, 0.3 + inner * 0.1 + (inner === 4 ? 0.2 : 0), x + i, y));
    }
  };
  // a luz da janela no chão, por cima de tudo (fraca, quente, com pontilhado)
  Art.posts.apt = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) {
      const f = (y - top) / (240 - top), x0 = 196 + f * 70, x1 = 282 + f * 110;
      for (let x = Math.floor(x0); x < x1; x++) {
        const side = Math.min(x - x0, x1 - x) / 14;
        const a = (1 - f) * 0.2 * Math.min(1, side);
        if (a > 0.02) S.tput(x, y, '#FFD8A0', a + (bay(x, y) - 0.5) * 0.06);
      }
    }
  };

  // janela da varanda: o céu do entardecer, o parapeito da varanda, os prédios ao longe e a cortina azul
  const CURTAIN = T(['#1E3A82', '#2A4E9E', '#3A64B8', '#4A78C8', '#6A98E0', '#8AB4EE']);
  props.curtainWindow.art = () => {
    const s = A.surface(80, 50), SKY = T(['#5A5A9A', '#8A70A8', '#C88AA0', '#E8A890', '#F6C890', '#FCE2B0']);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 80; x++) {
      const fr = x < 3 || x > 76 || y < 3 || y > 44 || x === 39 || x === 40;
      let c;
      if (fr) c = pick(WHITE, x < 3 || y < 3 ? 0.9 : 0.55, x, y);
      else {
        c = pick(SKY, (y - 3) / 40 + (vnoise(x, y, 8, 443) - 0.5) * 0.1, x, y);
        // nuvens alaranjadas e os prédios ao longe
        if (vnoise(x * 0.5, y * 2, 6, 444) > 0.68 && y < 24) c = mix(c, '#FFE0C0', 0.5);
        const bh = 8 + Math.floor(h01(Math.floor(x / 7), 0, 445) * 9);
        if (y > 44 - bh) c = pick(T(['#3A3450', '#4A4260', '#5A5070']), 0.4 + (x % 7 === 0 ? 0.3 : 0), x, y);
        if (y > 44 - bh && (x % 7) === 3 && (y % 4) === 1 && h01(x, y, 446) < 0.4) c = '#F8D88A';
        // o parapeito da varanda
        if (y > 32 && (y === 33 || (x % 6 === 0))) c = pick(T(['#5A5E6A', '#7A808C', '#9AA0AA']), 0.5, x, y);
        // reflexo no vidro
        if (Math.abs(((x - y) % 30 + 30) % 30 - 6) < 2) c = mix(c, '#FFFFFF', 0.25);
      }
      s.put(x, y, c);
    }
    // a cortina azul lisa, franzida dos dois lados, e o varão
    for (const [cx, cw] of [[0, 22], [58, 22]]) for (let y = 1; y < 50; y++) for (let x = cx; x < cx + cw; x++) {
      const fold = Math.sin((x - cx) * 0.9 + (cx ? 1 : 0)) * 0.22;
      s.put(x, y, pick(CURTAIN, 0.55 + fold - y * 0.004 + (cx ? -0.08 : 0.05) + (y === 49 ? -0.2 : 0), x, y));
    }
    for (let x = 0; x < 80; x++) { s.put(x, 0, '#C8C0B0'); s.put(x, 1, '#8A8478'); }
    return { spr: s, shadow: false };
  };

  // ar-condicionado branco na parede, com a aleta e a luz verde
  props.aircon.art = () => {
    const s = A.surface(50, 19);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 50; x++) {
      const e = Math.min(x, 49 - x);
      if ((y === 0 || y === 15) && e < 2) continue;
      let t = 0.9 - y * 0.02 - x / 50 * 0.12 - (y > 11 ? 0.25 : 0);
      if (y === 10) t -= 0.35;
      s.put(x, y, pick(WHITE, t, x, y));
    }
    for (let x = 4; x < 46; x++) s.put(x, 13, WHITE[1]);
    s.put(41, 4, '#5DE07A'); s.put(42, 4, '#9AF0A8');
    s.outline(0.6);
    wallShadow(s, 2, 17, 48, 2, 0.3);
    return { spr: s, shadow: false };
  };

  // armário embutido: duas portas de correr de madeira marrom com os puxadores embutidos
  props.closet.art = () => {
    const s = A.surface(70, 48);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 70; x++) {
      const frame = x < 2 || x > 67 || y < 2 || x === 34 || x === 35;
      let c;
      if (frame) c = pick(DARKW, x < 2 || y < 2 ? 0.75 : 0.35, x, y);
      else {
        const lx = x < 34 ? x - 2 : x - 36, inset = lx > 3 && lx < 28 && y > 6 && y < 44;
        let t = 0.55 - lx / 32 * 0.2 + (vnoise(x * 0.3, y * 1.4, 3, 447) - 0.5) * 0.2;
        if (inset && (lx === 4 || y === 7)) t -= 0.2;
        else if (inset && (lx === 27 || y === 43)) t += 0.15;
        c = pick(BROWNW, t, x, y);
      }
      s.put(x, y, c);
    }
    for (const hx of [29, 39]) for (let y = 20; y < 28; y++) { s.put(hx, y, DARKW[0]); s.put(hx + 1, y, DARKW[2]); }
    return { spr: s, shadow: false };
  };

  // colchão azul no chão, em pé (de cima para baixo): os travesseiros azul-claros em cima e o cobertor
  // azul-marinho dobrado no pé
  props.mattress.art = () => {
    const s = A.surface(70, 88), BL = A.ramp('#2E4AA8'), PIL = A.ramp('#9AB4EC'), NAVY = A.ramp('#1E2A4A');
    for (let y = 3; y < 86; y++) for (let x = 0; x < 70; x++) {
      const cx = Math.min(x, 69 - x), cy = Math.min(y - 3, 85 - y);
      if (cx + cy < 2) continue;
      let t = 0.55 - x / 70 * 0.15 + (y === 3 ? 0.3 : 0) + (cx === 0 ? (x === 0 ? 0.2 : -0.25) : 0) + (vnoise(x, y, 6, 448) - 0.5) * 0.1;
      if (y > 82) t -= 0.25;
      if ((y - 3) % 20 === 0 && y > 4) t -= 0.12;
      s.put(x, y, pick(BL, t, x, y));
    }
    for (const px of [18, 51]) s.ellipse(px, 15, 14, 8, (x, y, nx, ny) => pick(PIL, sphere(nx, ny) + 0.12, x, y));
    // o cobertor dobrado
    for (let y = 56; y < 84; y++) for (let x = 0; x < 70; x++) {
      const cx = Math.min(x, 69 - x), j = y - 56;
      if (cx + Math.min(j, 27 - j) < 1) continue;
      let t = 0.55 - x / 70 * 0.15 + (j === 0 ? 0.35 : 0) + (j === 1 ? 0.15 : 0) + (y > 80 ? -0.25 : 0);
      if (j === 11) t -= 0.3; else if (j === 12) t += 0.2;   // a dobra
      if ((x + j) % 9 === 0 && j > 1 && j < 26) t -= 0.08;
      s.put(x, y, pick(NAVY, t, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 3 };
  };

  // tapete cinza felpudo
  props.fluffyRug.art = () => {
    const s = A.surface(100, 50), FUR = T(['#6E6E74', '#828288', '#96969C', '#AAAAB0', '#BEBEC4', '#D2D2D6']);
    s.ellipse(50, 25, 49.5, 24.5, (x, y, nx, ny) => {
      const edge = nx * nx + ny * ny > 0.86 && h01(x, y, 520) < 0.5;
      if (edge) return null;
      let t = sphere(nx * 0.5, ny * 0.5) * 0.4 + 0.3 + (vnoise(x, y, 2, 521) - 0.5) * 0.5;
      // pelos: tracinhos curtos mais claros e mais escuros
      if (h01(x, y, 522) < 0.12) t += 0.25; else if (h01(x, y, 523) < 0.1) t -= 0.25;
      return pick(FUR, t, x, y);
    });
    return { spr: s, shadow: false };
  };
  // mesinha branca baixa (de sentar no chão), com a caneca e a caixa de lenço
  props.lowTable.art = () => {
    const s = A.surface(45, 28), W = T(['#B8B0A0', '#CEC8BA', '#E2DED4', '#F0EEE8', '#FAF9F6', '#FFFFFF']);
    for (let y = 2; y < 21; y++) for (let x = 0; x < 45; x++) s.put(x, y, pick(W, (y < 18 ? 0.85 - x / 45 * 0.2 + (y === 2 ? 0.15 : 0) : 0.35) - (y === 17 ? 0.15 : 0), x, y));
    for (const lx of [2, 40]) for (let y = 21; y < 26; y++) { s.put(lx, y, W[2]); s.put(lx + 1, y, W[1]); s.put(lx + 2, y, W[0]); }
    s.ellipse(12, 9, 3.5, 3, (x, y, nx, ny) => (nx * nx + ny * ny < 0.35 ? '#7A4A2A' : pick(A.ramp('#E8A07A'), sphere(nx, ny) + 0.1, x, y)));
    for (let y = 5; y < 12; y++) for (let x = 26; x < 37; x++) s.put(x, y, pick(A.ramp('#8AB8D8'), 0.75 - (x - 26) * 0.04 - (y === 11 ? 0.3 : 0), x, y));
    s.rect(29, 6, 5, 1, '#FFFFFF'); s.put(31, 5, '#FFFFFF');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 25, contact: [22.5, 25, 21, 1.5] };
  };

  // ======================================================================
  //  Prólogo, cena 3 · o laboratório: piso vinílico claro com a faixa de segurança em volta da máquina
  //  e os cabos, parede verde-acinzentada com as luminárias do teto, o cano e a tabela periódica; o
  //  quadro do Tony cheio de contas, as plantas e amostras da Heymans, o caderno do Dr King na mesa, a
  //  máquina do tempo (um anel de metal com luzes e o portal) e o painel de controle
  // ======================================================================
  const VINYLF = T(['#7A8490', '#8C96A2', '#9EA8B4', '#B0BAC4', '#C0C8D2', '#CED6DE', '#DCE2EA']);
  const MINT = T(['#7E8E88', '#92A29C', '#A6B6AE', '#B8C8C0', '#C8D6CE', '#D6E2DA', '#E4EEE6']);
  const STEELG = T(['#3A424A', '#4A545C', '#5E6870', '#727C84', '#8A949C', '#A4ACB4', '#C0C8CE']);
  const MCX = 240, MCY = 141;   // o meio da base da máquina no chão (px novos), para a faixa de segurança

  Art.floors.labTile = (S, look) => {
    const top = look.wall.height, TL = 20;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const tx = Math.floor(x / TL), ty = Math.floor((y - top) / TL), fx = x % TL, fy = (y - top) % TL;
      let t = 0.55 + ((tx + ty) % 2 ? 0.05 : -0.04) + (h01(tx, ty, 450) - 0.5) * 0.06 + (vnoise(x, y, 5, 451) - 0.5) * 0.06;
      if (fx === 0 || fy === 0) t += 0.12;
      if (fx === TL - 1 || fy === TL - 1) t -= 0.14;
      // pintinhas do vinil e o brilho das luminárias no piso
      if (h01(x, y, 452) < 0.05) t += h01(x, y, 453) < 0.5 ? 0.12 : -0.12;
      for (const lx of [120, 360]) { const d = Math.hypot((x - lx) / 60, (y - top - 22) / 26); if (d < 1) t += (1 - d) * (1 - d) * 0.3; }
      S.put(x, y, pick(VINYLF, t, x, y));
    }
    // a faixa de segurança amarela e preta em volta da máquina
    for (let y = MCY - 24; y < MCY + 24; y++) for (let x = MCX - 64; x < MCX + 64; x++) {
      const nx = (x + 0.5 - MCX) / 58, ny = (y + 0.5 - MCY) / 19, r = Math.hypot(nx, ny);
      if (r < 0.92 || r > 1.06) continue;
      const a = Math.atan2(ny, nx), stripe = Math.floor((a / Math.PI + 1) * 14) % 2;
      const c = r < 0.94 || r > 1.04 ? '#3A3A30' : stripe ? '#F2C42E' : '#22222A';
      S.put(x, y, mix(S.get(x, y) || c, c, 0.85));
    }
    // os cabos grossos da máquina até o painel e para fora
    const cable = (pts) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let q = 0; q <= n; q++) {
          const x = Math.round(x0 + (x1 - x0) * q / n), y = Math.round(y0 + (y1 - y0) * q / n);
          S.put(x, y, '#3A3E48'); S.put(x, y + 1, '#1A1C22'); S.put(x, y + 2, '#14101C', 0.4);
        }
      }
    };
    cable([[272, 146], [284, 150], [300, 148], [306, 144]]);
    cable([[208, 148], [190, 156], [160, 160], [128, 182], [106, 200]]);
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#8A9298', (1 - (y - top) / 5) * 0.7);
  };

  Art.walls.lab = (S, look) => {
    const h = look.wall.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 6) {
        // o teto com as luminárias compridas acesas
        const lamp = (x > 70 && x < 170) || (x > 310 && x < 410);
        c = lamp && y > 1 && y < 5 ? (y === 2 ? '#FFFFFF' : '#E8F4FF') : pick(STEELG, 0.25 + y * 0.06, x, y);
      } else if (y < 8) c = STEELG[y === 6 ? 6 : 2];
      else if (y < h - 10) {
        const seam = (x + 20) % 80 === 0;
        let t = 0.55 + (vnoise(x, y, 6, 454) - 0.5) * 0.08 - (y - 8) * 0.002 + (seam ? -0.15 : 0) + ((x + 21) % 80 === 0 ? 0.08 : 0);
        // a luz das luminárias na parede, em leque
        for (const lx of [120, 360]) { const dy = y - 6, d = Math.abs(x - lx) / (50 + dy * 0.6); if (d < 1) t += (1 - d) * Math.max(0, 1 - dy / 60) * 0.3; }
        c = pick(MINT, t, x, y);
      } else c = pick(STEELG, y === h - 10 ? 0.95 : 0.55 - (y - h + 10) * 0.03, x, y);
      S.put(x, y, c);
    }
    // o cano com as braçadeiras, correndo pela parede
    for (let x = 0; x < 480; x++) { S.put(x, 10, STEELG[6]); S.put(x, 11, STEELG[4]); S.put(x, 12, STEELG[2]); if (x % 60 === 20) { S.rect(x, 9, 3, 5, STEELG[1]); S.put(x, 9, STEELG[5]); } }
    // a tabela periódica (só os quadradinhos coloridos)
    const px0 = 214, py0 = 18;
    for (let y = -1; y < 34; y++) for (let x = -1; x < 50; x++) S.put(px0 + x, py0 + y, y < 0 || x < 0 || y === 33 || x === 49 ? '#F8F8F4' : '#F2F0EA');
    const cols = [0, 1, 12, 13, 14, 15, 16, 17];
    for (let r = 0; r < 6; r++) for (let q = 0; q < 18; q++) {
      const ok = r === 0 ? q === 0 || q === 17 : r < 3 ? q < 2 || q > 11 : true;
      if (!ok) continue;
      const col = q < 2 ? '#F2A0A0' : q < 12 ? '#A8C8F0' : cols.indexOf(q) >= 0 && q < 17 ? '#B8E0A8' : '#F2D88A';
      S.rect(px0 + 2 + q * 2.6, py0 + 3 + r * 4, 2, 3, col);
    }
    for (let q = 0; q < 14; q++) S.rect(px0 + 9 + q * 2.6, py0 + 28, 2, 2, '#D8B8E8');
    wallShadow(S, px0 + 1, py0 + 34, 50, 2, 0.25);
    // a placa amarela de cuidado e a tomada
    for (let y = 0; y < 12; y++) for (let x = -y * 0.6; x <= y * 0.6; x++) S.put(Math.round(290 + x), 22 + y, y === 11 || Math.abs(Math.abs(x) - y * 0.6) < 0.7 ? '#2A2A30' : '#F2C42E');
    S.rect(290, 26, 1, 4, '#2A2A30'); S.put(290, 31, '#2A2A30');
    S.rect(330, h - 20, 6, 7, '#F2F2EE'); S.put(332, h - 18, '#5A5A60'); S.put(332, h - 16, '#5A5A60');
  };
  Art.edges.lab = (S, x, top, gap, side) => {
    for (let y = top - 10; y < 240; y++) for (let i = 0; i < 5; i++) {
      const inner = side === 'left' ? i : 4 - i;
      S.put(x + i, y, pick(inner === 4 ? STEELG : MINT, inner === 4 ? 0.7 : 0.25 + inner * 0.1, x + i, y));
    }
  };

  // escrita de giz: o texto na fonte nova, meio falhado; '=' (que não está na fonte) é feito na mão
  function chalk(s, str, x, y, color = '#E8ECE4') {
    const cv = textCanvas(str.replace(/=/g, ' '), '#FFFFFF'), d = cv.cx.getImageData(0, 0, cv.width, cv.height).data;
    for (let j = 0; j < cv.height; j++) for (let i = 0; i < cv.width; i++) {
      if (d[(j * cv.width + i) * 4 + 3] < 128) continue;
      s.put(x + i, y + j, color, h01(x + i, y + j, 455) < 0.25 ? 0.55 : 0.9);
    }
    const prev = Gfx.font('v2');
    for (let i = 0; i < str.length; i++) {
      if (str[i] !== '=') continue;
      const ex = x + Gfx.textWidth(str.slice(0, i)) + (i ? 1 : 0);
      for (let q = 0; q < 4; q++) { s.put(ex + q, y + 3, color, 0.9); s.put(ex + q, y + 5, color, 0.9); }
    }
    Gfx.font(prev);
  }

  // quadro-negro do Tony: moldura de madeira, o verde com o pó de giz, as contas, um gráfico, o desenho
  // de um túnel no tempo e a canaleta com o giz e o apagador
  props.blackboard.art = () => {
    const s = A.surface(140, 54), BOARD = T(['#16281E', '#1C3226', '#223C2E', '#2A4836', '#345640']);
    for (let y = 0; y < 50; y++) for (let x = 0; x < 140; x++) {
      const e = Math.min(x, y, 139 - x, 49 - y);
      let c;
      if (e < 3) c = pick(OAK, (e === 0 ? 0.3 : e === 1 ? 0.8 : 0.5) + (x < y ? 0.05 : -0.05), x, y);
      else {
        // o pó do giz apagado, em manchas
        const smudge = vnoise(x * 0.5, y, 10, 456);
        c = pick(BOARD, 0.45 + (smudge > 0.6 ? (smudge - 0.6) * 1.2 : 0) + (vnoise(x, y, 3, 457) - 0.5) * 0.1, x, y);
      }
      s.put(x, y, c);
    }
    chalk(s, "t' = t / (1 - v/c)", 8, 6);
    chalk(s, 'x(t) = x0 + vt', 8, 19);
    chalk(s, 'loop: t -> -t ?', 8, 32, '#F2E8A0');
    // gráfico: os eixos e uma onda
    for (let y = 8; y < 30; y++) s.put(104, y, '#E8ECE4', 0.85);
    for (let x = 102; x < 134; x++) s.put(x, 28, '#E8ECE4', 0.85);
    for (let x = 105; x < 133; x++) s.put(x, Math.round(18 - Math.sin((x - 105) * 0.35) * 7 * (1 - (x - 105) / 40)), '#F2B8C8', 0.9);
    // o "túnel": dois círculos ligados
    for (let a = 0; a < 40; a++) {
      const an = a / 40 * Math.PI * 2;
      s.put(Math.round(100 + Math.cos(an) * 5), Math.round(40 + Math.sin(an) * 3), '#E8ECE4', 0.8);
      s.put(Math.round(126 + Math.cos(an) * 5), Math.round(40 + Math.sin(an) * 3), '#E8ECE4', 0.8);
    }
    s.line(100, 37, 126, 37, '#E8ECE4', 0.8); s.line(100, 43, 126, 43, '#E8ECE4', 0.8);
    // a canaleta com o giz e o apagador
    for (let x = 0; x < 140; x++) { s.put(x, 50, OAK[5]); s.put(x, 51, OAK[2]); s.put(x, 52, DARKW[2]); }
    s.rect(14, 48, 6, 2, '#F4F4F0'); s.rect(24, 49, 4, 1, '#F2C8D8'); s.rect(31, 49, 4, 1, '#A8D8F0');
    for (let y = 46; y < 50; y++) for (let x = 112; x < 126; x++) s.put(x, y, y < 48 ? pick(OAK, 0.7, x, y) : '#D8D8D0');
    wallShadow(s, 2, 53, 138, 1, 0.3);
    return { spr: s, shadow: false };
  };

  // relógio de parede redondo
  props.labClock.art = () => {
    const s = A.surface(19, 19);
    s.ellipse(9, 9, 9, 9, (x, y, nx, ny) => (nx * nx + ny * ny > 0.66 ? pick(STEELG, sphere(nx, ny) - 0.1, x, y) : pick(WHITE, sphere(nx, ny) + 0.25, x, y)));
    for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; s.put(Math.round(9 + Math.cos(an) * 5.5 - 0.5), Math.round(9 + Math.sin(an) * 5.5 - 0.5), a % 3 ? '#9AA0A8' : '#2A2E36'); }
    s.line(9, 9, 9, 4, '#1E2228'); s.line(9, 9, 12, 11, '#1E2228'); s.line(9, 9, 5, 9, '#D8443A');
    s.put(10, 18, '#140F1E', 0.3); s.put(11, 18, '#140F1E', 0.3);
    return { spr: s, shadow: false };
  };

  // prateleira da Heymans: as três tábuas brancas com as mãos-francesas, os vasos de planta (samambaia,
  // suculenta, jiboia caindo), os frascos de amostra, o microscópio e as placas de petri
  props.plantShelf.art = () => {
    const s = A.surface(110, 60), POT = T(['#7A3420', '#9A4A30', '#B8603E', '#D0784E', '#E09466']), LEAF = T(['#1E4A2A', '#2A6236', '#3A7E44', '#52A05A', '#74C070', '#9ADA8E']);
    const pot = (cx, by, w) => {
      for (let y = by - 7; y < by; y++) {
        const half = w / 2 - (y - by + 7) * 0.15;
        for (let x = Math.round(cx - half); x < Math.round(cx + half); x++) s.put(x, y, pick(POT, 0.75 - (x - cx + half) / (2 * half) * 0.55 + (y === by - 7 ? 0.2 : 0), x, y));
      }
    };
    const jar = (x0, by, col) => {
      for (let y = by - 10; y < by; y++) for (let x = x0; x < x0 + 6; x++) {
        let c = y < by - 6 ? mix('#E8F2F4', '#FFFFFF', x === x0 + 1 ? 0.6 : 0) : pick(A.ramp(col), 0.75 - (x - x0) * 0.1, x, y);
        if (y === by - 10) c = '#6A707A';
        s.put(x, y, c, y < by - 6 && y > by - 10 ? 0.7 : 1);
      }
      s.put(x0 + 1, by - 5, '#FFFFFF');
    };
    for (const sy of [13, 33, 53]) {
      for (let x = 0; x < 110; x++) { s.put(x, sy, WHITE[5]); s.put(x, sy + 1, WHITE[3]); s.put(x, sy + 2, WHITE[1]); }
      for (const bx of [8, 100]) { s.put(bx, sy + 3, STEELG[3]); s.put(bx, sy + 4, STEELG[2]); s.put(bx + 1, sy + 3, STEELG[1]); }
      wallShadow(s, 2, sy + 3, 108, 3, 0.25);
    }
    // de cima: samambaia, frascos, suculenta; do meio: jiboia caindo, microscópio, frascos; de baixo:
    // placas de petri, frascos, mais um vaso
    pot(12, 13, 10);
    for (let k = 0; k < 9; k++) { const a = -Math.PI * (0.1 + k * 0.1); for (let r = 2; r < 9; r++) s.put(Math.round(12 + Math.cos(a) * r * 1.2), Math.round(6 + Math.sin(a) * r * 0.8), pick(LEAF, 0.4 + r * 0.06 + (k % 2) * 0.1, k, r)); }
    jar(28, 13, '#5DC8E0'); jar(36, 13, '#F28AB8'); jar(44, 13, '#9AD860');
    pot(70, 13, 9); s.ellipse(70, 4, 5, 3.5, (x, y, nx, ny) => pick(T(['#4A7A5A', '#6A9E72', '#8AC08E', '#B0DCB0']), sphere(nx, ny) + 0.1, x, y));
    jar(88, 13, '#F2C860');
    pot(16, 33, 10);
    for (let k = 0; k < 7; k++) for (let j = 0; j < 8 + k * 3; j++) {
      const x = 9 + k * 2 + Math.round(Math.sin(j * 0.6 + k) * 1.5), y = 25 + j;
      if (y < 33 || y > 34) s.put(x, y, pick(LEAF, 0.5 + ((j + k) % 3) * 0.15, x, y));
    }
    // microscópio
    for (let y = 22; y < 33; y++) s.put(48 + Math.round((33 - y) * 0.25), y, STEELG[5]);
    s.rect(44, 31, 10, 2, '#2A2E36'); s.rect(50, 20, 3, 6, '#2A2E36'); s.rect(47, 27, 7, 2, STEELG[4]); s.put(51, 19, '#5DC8E0');
    jar(66, 33, '#B88AF0'); jar(74, 33, '#5DC8E0');
    pot(96, 33, 11); s.ellipse(96, 22, 6, 5, (x, y, nx, ny) => pick(LEAF, sphere(nx, ny) + 0.05 + (h01(x, y, 458) < 0.3 ? 0.15 : 0), x, y));
    for (const px of [10, 22, 34]) s.ellipse(px, 51, 5, 1.6, (x, y, nx, ny) => (nx * nx + ny * ny > 0.6 ? '#D8ECF0' : ['#F2A8C8', '#F2E07A', '#A8E0A0'][(px / 12) | 0]));
    jar(50, 53, '#F28A8A'); jar(58, 53, '#8AB8F2'); jar(66, 53, '#F2C860');
    pot(92, 53, 10); for (let k = 0; k < 5; k++) for (let j = 0; j < 10; j++) s.put(86 + k * 3 + (j > 5 ? (k - 2) : 0), 46 - j + (k === 2 ? 0 : 2), pick(LEAF, 0.3 + j * 0.06, k, j));
    return { spr: s, shadow: false };
  };

  // mesa de trabalho de aço com o caderno de couro marrom gasto do Dr King (com o fecho dourado), os
  // papéis com contas, a caneca e a estante de tubos de ensaio
  props.labDesk.art = () => {
    const s = A.surface(80, 38);
    for (let y = 7; y < 36; y++) for (let x = 0; x < 80; x++) {
      let c;
      if (y < 27) c = pick(STEELG, 0.78 - x / 80 * 0.15 + (y === 7 ? 0.2 : 0) - (y === 26 ? 0.3 : 0) + (vnoise(x, y, 6, 459) - 0.5) * 0.06, x, y);
      else if (y < 31) c = pick(STEELG, 0.45 - (y - 27) * 0.06 + (x % 26 === 0 ? -0.2 : 0), x, y);
      else c = (x > 1 && x < 5) || (x > 74 && x < 78) ? pick(STEELG, x < 5 ? 0.5 : 0.25, x, y) : null;
      if (c) s.put(x, y, c);
    }
    // o caderno do Dr King
    const LEATHER = T(['#3A2014', '#4E2C1A', '#643A22', '#7A4A2C', '#905C38', '#A87046']);
    for (let y = 9; y < 24; y++) for (let x = 8; x < 31; x++) {
      let t = 0.6 - (x - 8) * 0.012 - (y - 9) * 0.01 + (vnoise(x, y, 3, 460) - 0.5) * 0.35;
      if (x === 8 || y === 9) t += 0.15;
      if (x === 30 || y === 23) t -= 0.3;
      if (x === 11) t -= 0.25;   // a lombada
      if (h01(x, y, 461) < 0.05) t += 0.25;   // o couro gasto
      s.put(x, y, pick(LEATHER, t, x, y));
    }
    s.rect(28, 14, 4, 3, GOLD[4]); s.put(28, 14, GOLD[5]); s.put(31, 16, GOLD[1]);
    for (let y = 10; y < 23; y++) s.put(31, y, '#E8E0C8');
    // papéis com contas
    for (let y = 10; y < 22; y++) for (let x = 38; x < 52; x++) s.put(x, y, pick(T(['#D8D0C0', '#ECE6D8', '#FAF6EE']), 0.8 - (y - 10) * 0.01, x, y));
    for (let r = 0; r < 5; r++) for (let x = 40; x < 40 + 4 + ((r * 7) % 8); x++) if (h01(x, r, 462) < 0.7) s.put(x, 12 + r * 2, '#5A6070');
    for (let y = 13; y < 24; y++) for (let x = 44; x < 56; x++) if (y > 15 || x > 46) s.put(x + (y > 15 ? 0 : 0), y, x === 44 || y === 23 ? '#C8C0B0' : '#F4F0E6');
    // caneca com café
    s.ellipse(62, 12, 4, 2.2, (x, y, nx, ny) => (nx * nx + ny * ny < 0.45 ? '#4A2A1A' : '#F4F2EC'));
    for (let y = 12; y < 18; y++) for (let x = 58; x < 67; x++) s.put(x, y, pick(T(['#9A5A3A', '#C8724A', '#E09466']), 0.8 - (x - 58) * 0.08, x, y));
    s.put(67, 14, '#C8724A'); s.put(68, 15, '#C8724A'); s.put(67, 16, '#C8724A');
    // estante de tubos de ensaio
    s.rect(70, 15, 9, 2, STEELG[2]);
    for (const [tx, col] of [[71, '#F28AB8'], [74, '#5DC8E0'], [77, '#9AD860']]) for (let y = 6; y < 17; y++) s.put(tx, y, y < 11 ? '#E8F2F4' : col);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 9, contact: [40, 35, 38, 1.5] };
  };

  // painel de controle: o monitor com a onda verde, os botões coloridos e os mostradores (a tela e as
  // luzes animam no liveNew)
  const consoleArt = () => cached('console', () => {
    const s = A.surface(33, 38);
    for (let y = 12; y < 36; y++) for (let x = 0; x < 33; x++) s.put(x, y, pick(STEELG, 0.62 - x / 33 * 0.25 + (y === 12 ? 0.3 : 0) - (y > 33 ? 0.3 : 0) + (x === 0 ? 0.15 : 0), x, y));
    for (let y = 0; y < 14; y++) for (let x = 3; x < 30; x++) {
      const e = Math.min(x - 3, y, 29 - x, 13 - y);
      s.put(x, y, e < 2 ? pick(T(['#1E2228', '#2A2E36', '#3A3F48']), e === 0 ? 0.3 : 0.7, x, y) : pick(T(['#0A2018', '#0E2A20', '#123428']), 0.5, x, y));
    }
    for (const [bx, by, col] of [[4, 17, '#D8443A'], [10, 17, '#F2C14E'], [16, 17, '#5DD07A'], [4, 23, '#5DA8F0'], [10, 23, '#F2F2EE'], [16, 23, '#D8443A']]) {
      s.ellipse(bx + 2, by + 1.5, 2.2, 1.8, (x, y, nx, ny) => pick(A.ramp(col), sphere(nx, ny) + 0.1, x, y));
    }
    // mostradores redondos
    for (const my of [18, 26]) {
      s.ellipse(26, my, 3.5, 3.5, (x, y, nx, ny) => (nx * nx + ny * ny > 0.6 ? STEELG[1] : '#F2F0E6'));
      s.line(26, my, 27, my - 2, '#D8443A');
    }
    s.outline(0.5);
    return s;
  });
  props.console.art = () => ({ spr: consoleArt(), dx: 0, dy: 0, base: 36, contact: [16.5, 36, 16, 1.5] });
  props.console.liveNew = (ctx, p, world) => {
    const x = Math.round(p.x * K), y = Math.round(p.y * K), t = world.t || 0;
    const img = cached('consoleCv', () => consoleArt().canvas());
    ctx.drawImage(img, x, y);
    // a onda andando na tela e as luzes piscando
    for (let i = 0; i < 23; i++) {
      const wy = Math.round(7 + Math.sin(i * 0.7 - t * 6) * 2.5 * Math.sin(t * 0.7 + i * 0.1));
      Gfx.rect(x + 5 + i, y + wy, 1, 1, i === Math.floor(t * 12) % 23 ? '#E8FFF4' : '#5DF0A8');
    }
    for (let k = 0; k < 3; k++) if (Math.sin(t * (3 + k * 1.7) + k * 2) > 0.2) Gfx.rect(x + 4 + k * 3, y + 31, 2, 1, ['#5DF0A8', '#F2C14E', '#FF6A5A'][k]);
  };

  // ---------- a máquina do tempo ----------
  // Um anel de metal em pé sobre uma base redonda: o anel com a luz de cima e da esquerda (como um
  // pneu), as emendas, as 8 luzes; dentro, o portal (on 2: girando), faíscas (on 1) ou nada (on 0)
  const MCR = { cx: 37.5, cy: 37.5, rx: 30, ry: 32.5, th: 4 };   // o anel (px novos, a partir do canto)
  const machineArt = () => cached('machine', () => {
    const s = A.surface(76, 90), RING = T(['#262C36', '#363E4A', '#4A5462', '#5E6A7A', '#788596', '#94A0B0', '#B4C0CC', '#DCE4EC']);
    // a base: um disco de metal com a lateral e as luzes (as luzes acendem no liveNew)
    for (let y = 60; y < 90; y++) for (let x = 0; x < 76; x++) {
      const nx = (x + 0.5 - 37.5) / 37, nyTop = (y + 0.5 - 70) / 9.5, nySide = (y + 0.5 - 76) / 9.5;
      if (nx * nx + nyTop * nyTop <= 1) {
        const r = Math.hypot(nx, nyTop);
        let t = 0.55 + (1 - r) * 0.25 - nx * 0.15 - nyTop * 0.1;
        if (Math.abs(r - 0.72) < 0.05) t -= 0.3;   // o friso
        s.put(x, y, pick(RING, t, x, y));
      } else if (nx * nx + nySide * nySide <= 1 && y > 70) {
        s.put(x, y, pick(RING, 0.32 - nx * 0.18 - (y - 76) * 0.02, x, y));
      }
    }
    // os dois braços que seguram o anel
    for (const sx of [-1, 1]) for (let q = 0; q < 16; q++) {
      const x = Math.round(37.5 + sx * (24 + q * 0.4)), y = 54 + q;
      for (let i = 0; i < 4; i++) s.put(x + i * sx, y, pick(RING, sx < 0 ? 0.7 - i * 0.12 : 0.4 - i * 0.08, x, y));
    }
    // o anel
    const R = (MCR.rx + MCR.ry) / 2;
    for (let y = 0; y < 76; y++) for (let x = 0; x < 76; x++) {
      const dx = (x + 0.5 - MCR.cx) / MCR.rx, dy = (y + 0.5 - MCR.cy) / MCR.ry, r = Math.hypot(dx, dy);
      const d = (r - 1) * R;
      if (Math.abs(d) > MCR.th) continue;
      const u = d / MCR.th, a = Math.atan2(dy, dx), nx = Math.cos(a) * u, ny = Math.sin(a) * u;
      let t = sphere(clamp1(nx), clamp1(ny)) * 0.9 + 0.05;
      const seg = ((a / (Math.PI * 2)) * 16 + 16) % 1;
      if (seg < 0.06) t -= 0.3;
      if (Math.abs(u) > 0.85) t -= 0.15;
      s.put(x, y, pick(RING, t, x, y));
    }
    s.outline(0.45);
    return s;
  });
  // o portal aceso: 12 quadros do redemoinho (azul-turquesa, violeta e branco no meio)
  const portalFrames = () => cached('portal', () => {
    const P = T(['#140C3A', '#2A1E78', '#4A3AB8', '#5A6AE0', '#4ABCE8', '#8AF0F0', '#E8FCFF']), out = [];
    const irx = MCR.rx - MCR.th, iry = MCR.ry - MCR.th;
    for (let f = 0; f < 12; f++) {
      const s = A.surface(76, 76), ph = f / 12 * Math.PI * 2;
      for (let y = 0; y < 76; y++) for (let x = 0; x < 76; x++) {
        const dx = (x + 0.5 - MCR.cx) / irx, dy = (y + 0.5 - MCR.cy) / iry, r = Math.hypot(dx, dy);
        if (r >= 1) continue;
        const a = Math.atan2(dy, dx), sw = Math.sin(a * 3 + r * 7 - ph) * 0.5 + 0.5;
        const t = (1 - r) * 0.55 + sw * 0.35 * (0.4 + r) + (vnoise(x, y, 5, 463 + f) - 0.5) * 0.1;
        s.put(x, y, pick(P, t, x, y), r > 0.9 ? 0.75 : 1);
      }
      out.push(s.canvas());
    }
    return out;
  });
  // o brilho do portal em volta do anel (em degraus pontilhados)
  const portalGlow = () => cached('portalGlow', () => {
    const s = A.surface(110, 110);
    for (let y = 0; y < 110; y++) for (let x = 0; x < 110; x++) {
      const d = Math.hypot((x + 0.5 - 55) / 54, (y + 0.5 - 55) / 54);
      if (d >= 1) continue;
      const q = Math.floor(Math.pow(1 - d, 1.2) * 4 + bay(x, y) * 0.999) / 4;
      if (q > 0) s.put(x, y, '#5AD8F0', q * 0.45);
    }
    return s.canvas();
  });
  props.timeMachine.art = () => ({ spr: machineArt(), dx: 0, dy: -1, base: 89, contact: [37.5, 82, 36, 4] });
  props.timeMachine.liveNew = (ctx, p, world) => {
    const X = Math.round(p.x * K), Y = Math.round(p.y * K) - 1, t = world.t || 0, on = p.on || 0;
    const img = cached('machineCv', () => machineArt().canvas());
    // o portal fica dentro do anel (desenhado antes do anel, para o anel ficar por cima da borda)
    if (on === 2) {
      const fr = portalFrames();
      ctx.drawImage(fr[Math.floor(t * 10) % fr.length], X, Y);
      // o brilho do portal em volta
      ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 3);
      ctx.drawImage(portalGlow(), Math.round(X + MCR.cx - 55), Math.round(Y + MCR.cy - 55));
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(img, X, Y);
    // as 8 luzes do anel (giram com a máquina pronta) e as da base
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2 + (on === 2 ? t * 1.5 : 0);
      const lit = on === 2 || (on === 1 && Math.sin(t * 9 + k * 2) > 0.6);
      const lx = Math.round(X + MCR.cx + Math.cos(a) * MCR.rx) - 1, ly = Math.round(Y + MCR.cy + Math.sin(a) * MCR.ry) - 1;
      if (lit) { ctx.globalAlpha = 0.45; Gfx.rect(lx - 1, ly - 1, 5, 5, '#7FF0D8'); ctx.globalAlpha = 1; }
      Gfx.rect(lx, ly, 3, 3, lit ? '#9AFFE8' : '#22303A');
      if (lit) Gfx.rect(lx, ly, 1, 1, '#FFFFFF');
    }
    for (let k = 0; k < 7; k++) {
      const lit = on && Math.floor(t * 4 + k) % 2;
      Gfx.rect(X + 11 + k * 8, Y + 81, 4, 2, lit ? '#5DF0B0' : '#1E2A2A');
    }
    // faíscas (anos depois: a máquina funciona, mas ainda não está pronta)
    if (on === 1 && Math.sin(t * 13) > 0.55) {
      let x = X + 20 + Math.round(Math.sin(t * 31) * 6), y = Y + 20;
      for (let q = 0; q < 9; q++) {
        const nx = x + 3 + Math.round(Math.sin(t * 47 + q * 3) * 2), ny = y + 4;
        ctx.globalAlpha = 0.9;
        for (let i = 0; i <= 4; i++) Gfx.rect(Math.round(x + (nx - x) * i / 4), Math.round(y + (ny - y) * i / 4), 1, 1, q % 3 ? '#F2F0A0' : '#FFFFFF');
        x = nx; y = ny;
      }
      ctx.globalAlpha = 1;
    }
  };

  // ======================================================================
  //  Fase 5 · a livraria-café, hoje (fotos SHOP_*): o carpete escuro, a parede creme com os
  //  coraçõezinhos e o teto preto, a estante branca de nichos cheia de livros (continua descendo pela
  //  parede da esquerda), a janela do fundo, o mural de avisos, a parede do balcão (a prateleira preta de
  //  livros, os quadros autografados, as xícaras e a luminária de casquinha de sorvete, sem marca), o
  //  balcão branco de tampo preto com a máquina de café, a escada de madeira para o 2º andar, a divisória
  //  de vidro com o revisteiro, as mesas pretas com as cadeiras de encosto curvo e as luminárias
  //  geométricas douradas com as plantas penduradas
  // ======================================================================
  const CARPET = T(['#2A2B33', '#31323B', '#383943', '#40414B', '#494A54', '#52535E']);
  const CREAMS = T(['#C8B488', '#D8C69C', '#E4D4AC', '#EEE0BC', '#F6EACC', '#FCF4DE']);
  const SHELFW = T(['#B4B2AC', '#CCCAC4', '#DEDCD6', '#ECEAE4', '#F6F4EE', '#FFFFFF']);
  const BOOKS = ['#D8443A', '#4A78C8', '#F2C14E', '#5DAA62', '#E8E0D0', '#8A5AB8', '#F08AA8', '#2E8A8A', '#F4F4F0', '#E8883A', '#3A3A48', '#7AB8E0'];

  Art.floors.carpet = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      // placas de carpete com a trama alternada e o pelo
      const tx = Math.floor(x / 40), ty = Math.floor((y - top) / 40), alt = (tx + ty) % 2;
      let t = 0.42 + (alt ? 0.04 : -0.03) + (h01(x, y, 470) - 0.5) * 0.16 + (vnoise(x, y, 8, 471) - 0.5) * 0.08;
      if (alt ? (x + y * 2) % 5 === 0 : (x * 2 + y) % 5 === 0) t += 0.07;
      // a luz das luminárias no chão
      for (const [lx, ly] of [[75, 112], [238, 116], [375, 108]]) { const d = Math.hypot((x - lx) / 70, (y - ly) / 34); if (d < 1) t += (1 - d) * 0.3; }
      S.put(x, y, pick(CARPET, t, x, y));
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#7A7480', (1 - (y - top) / 5) * 0.7);
  };

  Art.walls.shop = (S, look) => {
    const h = look.wall.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 12) c = pick(BLACKW, 0.35 + (vnoise(x, y, 8, 472) - 0.5) * 0.15 - (y === 11 ? 0.2 : 0), x, y);
      else if (y < 15) c = pick(SHELFW, y === 12 ? 0.95 : y === 13 ? 0.75 : 0.45, x, y);
      else if (y < h - 3) {
        let t = 0.62 + (vnoise(x, y, 6, 473) - 0.5) * 0.08 - (y - 15) * 0.002 + (h01(x, y, 474) < 0.04 ? -0.08 : 0);
        // a luz das luminárias espalhando na parede
        for (const lx of [75, 238, 375]) { const d = Math.hypot((x - lx) / 60, (y - 60) / 34); if (d < 1) t += (1 - d) * 0.18; }
        c = pick(CREAMS, t, x, y);
      } else c = pick(CREAMS, y === h - 3 ? 0.3 : 0.15, x, y);
      S.put(x, y, c);
    }
    // a sombra do teto na parede e os coraçõezinhos pintados (como na foto)
    for (let x = 0; x < 480; x++) { S.mul(x, 15, '#A89880', 0.6); S.mul(x, 16, '#A89880', 0.3); }
    for (let k = 0; k < 16; k++) {
      const hx = 180 + Math.floor(h01(k, 1, 475) * 95), hy = 22 + Math.floor(h01(k, 2, 475) * 46);
      for (const [dx, dy] of [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) S.put(hx + dx, hy + dy, '#7A6E5C');
    }
  };
  // as bordas: na esquerda, a estante de nichos continua descendo pela parede (vista de lado, com as
  // lombadas para dentro da sala); na direita, a parede creme
  Art.edges.shop = (S, x, top, gap, side) => {
    if (side !== 'left') {
      for (let y = top - 10; y < 240; y++) for (let i = 0; i < 5; i++) {
        const inner = 4 - i;
        S.put(x + i, y, pick(CREAMS, 0.2 + inner * 0.08 + (inner === 4 ? 0.2 : 0), x + i, y));
      }
      return;
    }
    const W = 18;
    for (let y = top - 4; y < 240; y++) {
      const cell = Math.floor((y - top + 4) / 24), cy = (y - top + 4) % 24;
      for (let i = 0; i < W; i++) {
        let c;
        if (cy < 3) c = pick(SHELFW, cy === 0 ? 0.95 : cy === 1 ? 0.7 : 0.4, x + i, y);
        else if (i > 14) c = pick(SHELFW, i === 15 ? 0.95 : 0.55, x + i, y);
        else {
          // as lombadas dos livros, de lado
          const b = Math.floor(h01(cell, Math.floor((cy - 3) / 3), 476) * BOOKS.length);
          const hasBook = h01(cell, 0, 477) > 0.15 && i > 2 && i < 15 - Math.floor(h01(cell, 1, 478) * 4);
          c = hasBook ? pick(A.ramp(BOOKS[b]), 0.6 - (i - 3) * 0.03 + ((cy - 3) % 3 === 0 ? 0.2 : 0) - ((cy - 3) % 3 === 2 ? 0.2 : 0), x + i, y) : pick(T(['#2A2824', '#36332C', '#423E36']), 0.3 + i * 0.03, x + i, y);
        }
        S.put(x + i, y, c);
      }
    }
  };

  // um nicho da estante (w × h, a partir de (x0, y0)): livros em pé (alguns inclinados), um enfeite ou
  // uma pilha deitada, conforme o sorteio
  function cubby(s, x0, y0, w, h, seed) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) s.put(x, y, pick(T(['#26241F', '#302D27', '#3A3730', '#46423A']), 0.25 + (y - y0) / h * 0.5 + (x - x0) / w * 0.1, x, y));
    const v = h01(seed, 0, 480);
    if (v < 0.14) {
      // enfeite: vasinho com planta ou um bonequinho, e uns livros deitados
      for (let j = 0; j < 3; j++) for (let x = x0 + 2; x < x0 + 14; x++) s.put(x, y0 + h - 1 - j, pick(A.ramp(BOOKS[(seed + j) % BOOKS.length]), 0.6 - (x - x0) * 0.02, x, y0 + h - 1 - j));
      if (v < 0.07) {
        for (let y = y0 + h - 9; y < y0 + h - 3; y++) for (let x = x0 + 15; x < x0 + 21; x++) s.put(x, y, pick(T(['#9A4A30', '#C8724A', '#E09466']), 0.8 - (x - x0 - 15) * 0.1, x, y));
        s.ellipse(x0 + 18, y0 + h - 12, 4, 4, (x, y, nx, ny) => pick(T(['#2A6236', '#3A7E44', '#52A05A', '#74C070']), sphere(nx, ny) + (h01(x, y, 481) < 0.3 ? 0.15 : 0), x, y));
      } else {
        s.ellipse(x0 + 18, y0 + h - 7, 3, 4, (x, y, nx, ny) => pick(A.ramp('#F2D0B0'), sphere(nx, ny), x, y));
        s.ellipse(x0 + 18, y0 + h - 12, 3, 3, (x, y, nx, ny) => pick(A.ramp('#F0A0B8'), sphere(nx, ny), x, y));
      }
      return;
    }
    let bx = x0 + 1;
    while (bx < x0 + w - 1) {
      const b = h01(bx, seed, 482), bw = 2 + Math.floor(b * 3), bh = Math.round(h * (0.62 + h01(bx, seed, 483) * 0.34));
      if (bx + bw > x0 + w - 1) break;
      const col = BOOKS[Math.floor(h01(bx, seed, 484) * BOOKS.length)], R = A.ramp(col);
      for (let y = y0 + h - bh; y < y0 + h; y++) for (let x = bx; x < bx + bw; x++) {
        let t = 0.62 - (x - bx) / bw * 0.35 + (y === y0 + h - bh ? 0.2 : 0);
        if ((y - (y0 + h - bh)) === 3 || (y - (y0 + h - bh)) === bh - 4) t -= 0.25;   // as faixinhas da lombada
        s.put(x, y, pick(R, t, x, y));
      }
      bx += bw;
      if (h01(bx, seed, 485) < 0.08) bx += 3;   // um vão com um livro inclinado
    }
  }

  // estante branca de nichos na parede, cheia de livros, com as etiquetas (A05, B23...)
  props.cubeShelf.art = p => {
    const W = kx(p.w || 120), H = 78, s = A.surface(W, H), cw = 25, rows = [[4, 22], [29, 22], [54, 20]];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) s.put(x, y, pick(SHELFW, 0.7 - (y < 3 ? -0.2 : 0), x, y));
    for (let r = 0; r < rows.length; r++) for (let q = 0; q * cw + 2 < W - 2; q++) {
      const x0 = q * cw + 2, [y0, hh] = rows[r];
      cubby(s, x0, y0, Math.min(cw - 3, W - 2 - x0), hh, r * 31 + q * 7 + 3);
      // a tábua de baixo com a etiqueta (azul ou amarela) e o divisor da direita
      for (let x = x0 - 2; x < x0 + cw; x++) { s.put(x, y0 + hh, SHELFW[5]); s.put(x, y0 + hh + 1, SHELFW[3]); s.put(x, y0 + hh + 2, SHELFW[2]); }
      s.rect(x0 + 8, y0 + hh + 1, 7, 2, (r + q) % 2 ? '#7AA8E0' : '#F2D060');
      s.put(x0 + 9, y0 + hh + 1, '#3A3A48'); s.put(x0 + 11, y0 + hh + 1, '#3A3A48'); s.put(x0 + 13, y0 + hh + 1, '#3A3A48');
      for (let y = y0; y < y0 + hh; y++) { s.put(x0 + cw - 3, y, SHELFW[5]); s.put(x0 + cw - 2, y, SHELFW[2]); }
    }
    for (let y = 0; y < H; y++) s.put(W - 1, y, SHELFW[1]);
    for (let x = 0; x < W; x++) { s.put(x, H - 2, SHELFW[1]); s.put(x, H - 1, SHELFW[0]); }
    return { spr: s, shadow: false };
  };

  // janela do fundo: caixilho branco, o prédio do outro lado da rua, o poste e os fios (dia)
  props.shopWindow.art = () => {
    const s = A.surface(38, 47);
    for (let y = 0; y < 45; y++) for (let x = 0; x < 38; x++) {
      const fr = x < 3 || x > 34 || y < 3 || y > 41 || x === 18 || x === 19 || y === 21;
      let c;
      if (fr) c = pick(SHELFW, x < 3 || y < 3 ? 0.95 : 0.6, x, y);
      else {
        c = pick(T(['#A8C8E4', '#BCD6EC', '#D0E4F4', '#E6F2FA']), 0.9 - y / 45 * 0.4, x, y);
        if (y > 14) c = pick(T(['#9AA0A8', '#B0B6BC', '#C4C8CC', '#D6D8DA']), 0.6 - (x % 9 === 0 ? 0.3 : 0), x, y);
        if (y > 16 && x % 9 > 3 && x % 9 < 7 && y % 7 > 1 && y % 7 < 5) c = '#7A8A9A';
        if (x === 28 && y > 4) c = '#5A5048';
        if (y === 8 + Math.round(Math.abs(x - 28) * 0.08)) c = '#3A3A40';
        if (Math.abs(((x - y) % 24 + 24) % 24 - 4) < 2) c = mix(c, '#FFFFFF', 0.35);
      }
      s.put(x, y, c);
    }
    wallShadow(s, 2, 45, 36, 2, 0.3);
    return { spr: s, shadow: false };
  };

  // mural de avisos: folhetos coloridos presos com alfinete
  props.noticeBoard.art = () => {
    const s = A.surface(28, 44);
    for (let y = 0; y < 42; y++) for (let x = 0; x < 28; x++) s.put(x, y, pick(SHELFW, x === 0 || y === 0 ? 0.95 : x === 27 || y === 41 ? 0.4 : 0.75, x, y));
    const papers = [[2, 2, 11, 12, '#F2E07A'], [15, 3, 10, 9, '#A8D8F0'], [3, 16, 10, 11, '#F2B0C8'], [15, 14, 10, 13, '#C8E8A8'], [2, 29, 11, 10, '#F4F4F0'], [16, 29, 9, 10, '#F2C88A']];
    papers.forEach(([x0, y0, w, h, col], i) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) s.put(x, y, pick(A.ramp(col), 0.7 - (x - x0) * 0.02 - (y - y0) * 0.01, x, y));
      for (let r = 0; r < 3; r++) for (let x = x0 + 1; x < x0 + w - 2 - (r % 2) * 2; x++) if (h01(x, r + i * 5, 486) < 0.75) s.put(x, y0 + 3 + r * 2, '#6A6A72');
      if (i % 2) s.ellipse(x0 + w / 2, y0 + h - 3, 2, 1.6, (x, y) => pick(A.ramp(BOOKS[i]), 0.6, x, y));
      s.put(x0 + Math.floor(w / 2), y0, '#D8443A'); s.put(x0 + Math.floor(w / 2), y0 + 1, '#8A2020');
      for (let y = y0 + 1; y <= y0 + h; y++) s.put(x0 + w, y, '#140F1E', 0.15);
    });
    wallShadow(s, 2, 42, 26, 2, 0.3);
    return { spr: s, shadow: false };
  };

  // a parede do balcão: a prateleira preta comprida de livros, os quadros autografados (shikishi), os
  // bonequinhos, as xícaras, as latas de café e a luminária de casquinha de sorvete acesa
  props.counterWall.art = () => {
    const s = A.surface(150, 70);
    for (let y = 0; y < 70; y++) for (let x = 0; x < 150; x++) {
      const e = Math.min(x, 149 - x);
      s.put(x, y, pick(T(['#C8C8C4', '#D8D8D4', '#E6E6E2', '#F0F0EC', '#F8F8F6']), 0.7 - (y < 4 ? 0.35 : 0) + (e < 2 ? -0.2 : 0) + (vnoise(x, y, 6, 487) - 0.5) * 0.06, x, y));
    }
    // a prateleira preta de livros
    for (let y = 5; y < 26; y++) for (let x = 0; x < 150; x++) s.put(x, y, pick(BLACKW, y > 22 ? 0.5 - (y - 23) * 0.15 : 0.25, x, y));
    let bx = 2;
    while (bx < 147) {
      const bw = 2 + Math.floor(h01(bx, 1, 488) * 2), bh = 11 + Math.floor(h01(bx, 2, 488) * 6);
      const R = A.ramp(BOOKS[Math.floor(h01(bx, 3, 488) * BOOKS.length)]);
      for (let y = 22 - bh; y < 22; y++) for (let x = bx; x < Math.min(bx + bw, 147); x++) s.put(x, y, pick(R, 0.65 - (x - bx) * 0.15 + (y === 22 - bh ? 0.2 : 0) - ((y - 22 + bh) === 3 ? 0.25 : 0), x, y));
      bx += bw;
    }
    for (let k = 0; k < 6; k++) s.put(12 + k * 24, 26, BLACKW[1]);
    wallShadow(s, 0, 26, 150, 3, 0.3);
    // os quadros autografados, numa tábua preta
    for (let k = 0; k < 6; k++) {
      const qx = 4 + k * 14;
      for (let y = 30; y < 43; y++) for (let x = qx; x < qx + 12; x++) s.put(x, y, x === qx + 11 || y === 42 ? '#C8C2B0' : '#FAF8F0');
      for (let r = 0; r < 4; r++) for (let x = qx + 2; x < qx + 9; x++) if (h01(x, r + k * 9, 489) < 0.45) s.put(x, 32 + r * 2 + ((x + k) % 2), '#3A3A48');
      if (k % 2) s.ellipse(qx + 7, 39, 2, 1.5, (x, y) => (k === 1 ? '#D8443A' : '#4A78C8'));
    }
    for (let x = 2; x < 90; x++) { s.put(x, 43, BLACKW[3]); s.put(x, 44, BLACKW[1]); }
    // os bonequinhos e as latas de café na outra tábua
    for (const [fx, col] of [[96, '#F2F2EE'], [102, '#D8443A'], [107, '#4A78C8']]) { s.ellipse(fx, 38, 2, 2, (x, y, nx, ny) => pick(A.ramp('#F2D0B0'), sphere(nx, ny), x, y)); for (let y = 40; y < 44; y++) for (let x = fx - 2; x <= fx + 2; x++) s.put(x, y, pick(A.ramp(col), 0.7 - (x - fx + 2) * 0.12, x, y)); }
    for (let x = 92; x < 112; x++) { s.put(x, 44, BLACKW[3]); s.put(x, 45, BLACKW[1]); }
    // as xícaras
    for (let x = 2; x < 86; x++) { s.put(x, 56, BLACKW[3]); s.put(x, 57, BLACKW[1]); }
    wallShadow(s, 2, 58, 84, 2, 0.25);
    for (let k = 0; k < 8; k++) {
      const col = ['#4AA8B8', '#F4F4F0', '#2E3A4A', '#F4F4F0', '#4AA8B8', '#9AA0A8', '#2E3A4A', '#F4F4F0'][k], cx = 6 + k * 10;
      for (let y = 51; y < 56; y++) for (let x = cx; x < cx + 6; x++) s.put(x, y, pick(A.ramp(col), 0.75 - (x - cx) * 0.1 + (y === 51 ? 0.15 : 0), x, y));
      s.put(cx + 6, 52, A.ramp(col)[2]); s.put(cx + 7, 53, A.ramp(col)[2]); s.put(cx + 6, 54, A.ramp(col)[2]);
    }
    for (let k = 0; k < 3; k++) for (let y = 48; y < 56; y++) for (let x = 94 + k * 7; x < 99 + k * 7; x++) s.put(x, y, pick(CHROME, 0.75 - (x - 94 - k * 7) * 0.12 + (y === 48 ? 0.2 : 0), x, y));
    for (let x = 92; x < 116; x++) { s.put(x, 56, BLACKW[3]); s.put(x, 57, BLACKW[1]); }
    // a luminária de casquinha de sorvete (o sorvete branco acende e clareia em volta)
    for (let y = 18; y < 66; y++) for (let x = 112; x < 150; x++) {
      const d = Math.hypot((x - 131) / 18, (y - 36) / 20);
      if (d < 1) s.tput(x, y, '#FFF6D8', (1 - d) * 0.55);
    }
    s.ellipse(131, 40, 9, 6, (x, y, nx, ny) => pick(T(['#E8E2D8', '#F4F0E8', '#FCFAF6', '#FFFFFF']), sphere(nx, ny) + 0.3, x, y));
    s.ellipse(131, 34, 7, 5, (x, y, nx, ny) => pick(T(['#E8E2D8', '#F4F0E8', '#FCFAF6', '#FFFFFF']), sphere(nx, ny) + 0.3, x, y));
    s.ellipse(131, 29, 4.5, 4, (x, y, nx, ny) => pick(T(['#E8E2D8', '#F4F0E8', '#FCFAF6', '#FFFFFF']), sphere(nx, ny) + 0.3, x, y));
    s.put(131, 24, '#FFFFFF'); s.put(132, 25, '#F4F0E8');
    for (let y = 45; y < 66; y++) {
      const half = 8.5 - (y - 45) * 0.38;
      for (let x = Math.round(131 - half); x <= Math.round(131 + half); x++) {
        const waffle = ((x + y) % 4 === 0) || ((x - y + 200) % 4 === 0);
        s.put(x, y, pick(T(['#A8501A', '#C86A22', '#E8862E', '#F6A44A', '#FFC678']), 0.75 - (x - 131 + half) / (2 * half + 1) * 0.45 - (waffle ? 0.2 : 0), x, y));
      }
    }
    return { spr: s, shadow: false };
  };

  // o balcão: tampo preto, armários brancos de portas com moldura e puxador; em cima, a máquina de café
  // espresso, o caixa (tablet), os copos, a bandeja
  props.shopCounter.art = () => {
    const s = A.surface(125, 36);
    for (let y = 9; y < 34; y++) for (let x = 0; x < 125; x++) {
      let c;
      if (y < 15) c = pick(BLACKW, 0.55 - x / 125 * 0.2 + (y === 9 ? 0.4 : 0) - (y === 14 ? 0.3 : 0), x, y);
      else {
        const dx = (x - 1) % 31, inset = dx > 2 && dx < 28 && y > 17 && y < 31;
        let t = 0.75 - x / 125 * 0.15 - (y - 15) * 0.006;
        if (dx === 0) t -= 0.35;
        if (inset && (dx === 3 || y === 18)) t -= 0.12; else if (inset && (dx === 27 || y === 30)) t += 0.1;
        if (y > 31) t -= 0.3;
        c = pick(SHELFW, t, x, y);
        if (dx > 12 && dx < 17 && y === 20) c = CHROME[2];
      }
      s.put(x, y, c);
    }
    // a máquina de café espresso
    for (let y = 0; y < 11; y++) for (let x = 78; x < 104; x++) {
      let c = pick(BLACKW, 0.55 - (x - 78) * 0.015 + (y === 0 ? 0.3 : 0), x, y);
      if (y > 1 && y < 4 && x > 79 && x < 102) c = pick(CHROME, 0.75 - (x - 80) * 0.02, x, y);
      if (y > 5 && (x === 84 || x === 85 || x === 96 || x === 97)) c = CHROME[4];
      s.put(x, y, c);
    }
    s.put(100, 7, '#F2C14E'); s.put(81, 7, '#5DD07A');
    // o caixa: o tablet no suporte e a gaveta
    for (let y = 0; y < 8; y++) for (let x = 14; x < 28; x++) s.put(x, y, y < 6 && x > 14 && x < 27 ? pick(T(['#2A4A6A', '#3A6A8A', '#6AA0C0']), 0.5 + (x === 15 ? 0.3 : 0), x, y) : '#22242A');
    s.rect(11, 8, 20, 2, '#3A3C44');
    // copos e a bandeja
    for (let k = 0; k < 5; k++) for (let y = 4; y < 9; y++) { s.put(42 + k * 4, y, '#E8F2F4', 0.8); s.put(43 + k * 4, y, '#C8DCE4', 0.8); }
    s.ellipse(115, 8, 8, 2, (x, y, nx) => pick(BLACKW, 0.6 - nx * 0.3, x, y));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 34, contact: [62.5, 34, 62, 1.5] };
  };

  // a escada para o 2º andar: degraus de madeira subindo para o fundo, a parede creme à esquerda, o
  // corrimão preto, a luz quente lá de cima e o tapetinho na base (y negativo: começa dentro do teto)
  props.stairs.art = () => {
    const s = A.surface(65, 115), N = 12;
    for (let y = 0; y < 115; y++) for (let x = 0; x < 6; x++) s.put(x, y, pick(CREAMS, 0.3 + x * 0.08, x, y));
    for (let k = 0; k < N; k++) {
      const yb = 112 - k * 9, x0 = 6 + Math.round(k * 0.4), x1 = 58 - Math.round(k * 0.4);
      for (let y = yb - 9; y < yb; y++) for (let x = x0; x < x1; x++) {
        const j = y - (yb - 9), tread = j < 3;
        let t = tread ? 0.72 - (x - x0) / (x1 - x0) * 0.2 + (j === 0 ? 0.2 : 0) : 0.4 - (j - 3) * 0.04 - (x - x0) / (x1 - x0) * 0.15;
        t += (vnoise(x * 0.3, y * 2, 3, 490 + k) - 0.5) * 0.12;
        // a luz do 2º andar nos degraus de cima
        t += Math.max(0, (k - 6) / 6) * 0.25;
        s.put(x, y, pick(OAK, t, x, y));
      }
    }
    // a luz quente lá de cima
    for (let y = 0; y < 50; y++) for (let x = 6; x < 60; x++) s.tput(x, y, '#FFE8B0', Math.max(0, 1 - y / 50) * 0.5);
    // o corrimão preto com as hastes
    for (let k = 0; k < N; k++) {
      const yb = 112 - k * 9, px = 59 - Math.round(k * 0.4);
      for (let y = yb - 18; y < yb - 2; y++) { s.put(px, y, BLACKW[3]); s.put(px + 1, y, BLACKW[0]); }
    }
    for (let k = 0; k < N * 9; k++) { const y = 94 - k, x = 59 - Math.round(k / 9 * 0.4); s.put(x, y, BLACKW[4]); s.put(x + 1, y, BLACKW[2]); s.put(x + 2, y, BLACKW[0]); }
    // o tapetinho vinho na base
    for (let y = 107; y < 115; y++) for (let x = 10; x < 54; x++) s.put(x, y, pick(T(['#4A1A24', '#62202E', '#7A2A3A', '#943A48']), 0.6 - (y - 107) * 0.04 + (y === 107 ? 0.2 : 0) + ((x + y) % 4 === 0 ? -0.1 : 0), x, y));
    return { spr: s, shadow: false };
  };

  // divisória de vidro deslizante: a moldura de madeira clara, o vidro (deixa ver através) e o revisteiro
  // com as revistas de capa para fora
  props.glassPartition.art = () => {
    const s = A.surface(55, 78);
    for (let y = 0; y < 73; y++) for (let x = 0; x < 55; x++) {
      const frame = x < 4 || x > 50 || y < 4 || y > 68;
      if (frame) { s.put(x, y, pick(OAK, (x < 4 ? 0.75 - x * 0.08 : x > 50 ? 0.35 : 0.6) + (y < 4 ? 0.15 : 0), x, y)); continue; }
      const glare = Math.abs(((x - y * 0.8) % 34 + 34) % 34 - 8) < 2;
      s.put(x, y, glare ? '#F2FAFF' : '#BFE0F0', glare ? 0.55 : 0.28);
    }
    // o revisteiro: duas fileiras de revistas apoiadas na barra preta
    for (const [ry, n] of [[18, 5], [42, 5]]) {
      for (let k = 0; k < n; k++) {
        const mx = 6 + k * 9, col = BOOKS[(ry + k * 3) % BOOKS.length], R = A.ramp(col);
        for (let y = ry; y < ry + 17; y++) for (let x = mx; x < mx + 8; x++) {
          let t = 0.7 - (x - mx) * 0.05;
          if (y < ry + 4) t += 0.15;   // o título
          if (y > ry + 6 && y < ry + 14 && x > mx + 1 && x < mx + 6) t = 0.35 + h01(x, y, 491) * 0.3;   // a foto da capa
          s.put(x, y, pick(R, t, x, y));
        }
        s.rect(mx + 1, ry + 1, 5, 1, '#FFFFFF');
      }
      for (let x = 4; x < 51; x++) { s.put(x, ry + 15, BLACKW[3]); s.put(x, ry + 16, BLACKW[1]); }
      for (let x = 4; x < 51; x++) { s.put(x, ry + 17, pick(OAK, 0.6, x, ry + 17)); s.put(x, ry + 18, OAK[1]); }
    }
    for (let y = 73; y < 78; y++) for (let x = 0; x < 55; x++) s.put(x, y, pick(OAK, 0.4 - (y - 73) * 0.05 - x / 55 * 0.1, x, y));
    s.outline(0.55);
    return { spr: s, dx: 0, dy: 0, base: 77, contact: [27.5, 77, 27, 1.5] };
  };

  // mesa preta quadrada com duas cadeiras de encosto curvo (madeira clara, hastes pretas em X); em
  // cima, a xícara preta no pires e o copo d'água
  const SEAT = T(['#1A1A20', '#24242C', '#2E2E38', '#3A3A46', '#4A4A58']);
  const chairBack = (s, x0, y0, front) => {
    // o encosto curvo de madeira clara (a curva para cima)
    const shell = () => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 22; x++) {
        const nx = (x + 0.5 - 11) / 11, curve = Math.round((1 - nx * nx) * 2);
        if (y < 2 - curve || y > 8 - curve) continue;
        s.put(x0 + x, y0 + y, pick(OAK, 0.74 - Math.abs(nx) * 0.25 + (y === 2 - curve ? 0.22 : 0) - (y === 8 - curve ? 0.3 : 0), x0 + x, y0 + y));
      }
    };
    if (front) {
      // de costas para a câmera: o assento escuro aparece embaixo do encosto, com o X preto por cima
      for (let y = y0 + 6; y < y0 + 13; y++) for (let x = x0 + 2; x < x0 + 20; x++) s.put(x, y, pick(SEAT, 0.7 - (y - y0 - 6) * 0.08 - (x - x0) * 0.01 + (y === y0 + 6 ? 0.2 : 0), x, y));
      for (const lx of [x0 + 3, x0 + 18]) for (let y = y0 + 12; y < y0 + 19; y++) s.put(lx, y, BLACKW[1]);
      for (const lx of [x0 + 6, x0 + 15]) for (let y = y0 + 12; y < y0 + 17; y++) s.put(lx, y, BLACKW[0]);
      shell();
      for (let q = 0; q < 10; q++) { s.put(x0 + 4 + Math.round(q * 1.4), y0 + 1 + q, BLACKW[3]); s.put(x0 + 17 - Math.round(q * 1.4), y0 + 1 + q, BLACKW[2]); }
    } else {
      shell();
      for (const lx of [x0 + 5, x0 + 16]) for (let y = y0 + 8; y < y0 + 12; y++) s.put(lx, y, BLACKW[1]);
    }
  };
  props.shopTable.art = p => {
    const s = A.surface(50, 58), TOP = T(['#16151C', '#201E26', '#2A2832', '#36343E', '#46434E', '#5A5664']);
    chairBack(s, 14, 0, false);
    for (let y = 12; y < 40; y++) for (let x = 5; x < 45; x++) {
      let c;
      if (y < 36) c = pick(TOP, 0.5 - (x - 5) / 40 * 0.2 - (y - 12) * 0.004 + (y === 12 ? 0.45 : 0) + (x === 5 ? 0.25 : 0) + (y === 35 ? -0.2 : 0) + (vnoise(x * 0.3, y, 4, 492) - 0.5) * 0.08, x, y);
      else c = (x < 8 || x > 41) ? (x < 8 ? TOP[2] : TOP[0]) : null;
      if (c) s.put(x, y, c);
    }
    // xícara preta no pires e o copo d'água (e às vezes um livro aberto)
    s.ellipse(15, 21, 5, 2.2, (x, y, nx, ny) => pick(TOP, 0.85 - ny * 0.2, x, y));
    for (let y = 16; y < 21; y++) for (let x = 12; x < 18; x++) s.put(x, y, pick(TOP, 0.9 - (x - 12) * 0.12, x, y));
    s.put(18, 17, TOP[3]); s.put(19, 18, TOP[3]); s.put(18, 19, TOP[3]);
    s.put(13, 16, '#4A2A1A'); s.put(14, 16, '#5A3420');
    for (let y = 15; y < 23; y++) for (let x = 32; x < 37; x++) s.put(x, y, y === 15 ? '#FFFFFF' : x === 32 ? '#F4FAFF' : '#C8E0EC', 0.85);
    if (h01(p.x | 0, p.y | 0, 493) < 0.5) {
      for (let y = 25; y < 32; y++) for (let x = 20; x < 32; x++) s.put(x, y, x === 26 ? '#C8C0B0' : pick(T(['#D8D0C0', '#F0EAE0', '#FAF8F2']), 0.8 - Math.abs(x - 26) * 0.03, x, y));
      for (let r = 0; r < 3; r++) { for (let x = 21; x < 25; x++) s.put(x, 27 + r * 2, '#8A8478'); for (let x = 27; x < 31; x++) s.put(x, 27 + r * 2, '#8A8478'); }
    }
    chairBack(s, 14, 37, true);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 9, contact: [25, 55, 22, 1.5] };
  };

  // luminária geométrica dourada (um losango de arame) com a lâmpada e a planta pendurada, presa no
  // teto pelo fio, balançando de leve, por cima de tudo
  const geoLampImg = () => cached('geoLamp', () => {
    const s = A.surface(23, 40), LEAF = T(['#2A6218', '#3A8222', '#56A436', '#7CC452', '#A0DC74']);
    const cx = 11, cy = 9;
    // o brilho da lâmpada
    for (let y = 0; y < 24; y++) for (let x = 0; x < 23; x++) { const r = Math.hypot(x - cx, (y - cy) * 1.1); if (r < 11) s.tput(x, y, '#FFE8B0', Math.pow(1 - r / 11, 1.5) * 0.5); }
    s.ellipse(cx, cy + 1, 3, 3.5, (x, y, nx, ny) => pick(T(['#F2C870', '#FFE6A0', '#FFF6D8', '#FFFFFF']), 0.95 - ny * 0.3 - Math.abs(nx) * 0.3, x, y));
    // o losango de arame dourado
    const pts = [[cx, 0], [cx + 8, cy], [cx, cy + 10], [cx - 8, cy]];
    for (let i = 0; i < 4; i++) s.line(pts[i][0], pts[i][1], pts[(i + 1) % 4][0], pts[(i + 1) % 4][1], i < 2 ? GOLD[4] : GOLD[2]);
    s.line(cx - 8, cy, cx + 8, cy, GOLD[3]);
    s.line(cx, 0, cx - 3, cy, GOLD[1]); s.line(cx, 0, cx + 3, cy, GOLD[3]);
    // a planta pendurada (jiboia)
    for (let k = 0; k < 7; k++) {
      const lx = cx - 6 + k * 2, len = 6 + ((k * 7) % 11) + (k === 3 ? 8 : 0);
      for (let j = 0; j < len; j++) {
        const x = lx + Math.round(Math.sin(j * 0.5 + k) * 1.2), y = cy + 6 + j;
        if (y >= 40) break;
        s.put(x, y, pick(LEAF, 0.55 + ((j + k) % 3 === 0 ? 0.3 : 0) - j * 0.015, x, y));
        if ((j + k) % 3 === 0) s.put(x + 1, y, LEAF[2]);
      }
    }
    return s.canvas();
  });
  props.geoLamp.fxNew = (ctx, p, world) => {
    const img = geoLampImg(), t = world.t || 0;
    const x = Math.round(p.x * K), y = Math.round(p.y * K) - 6, sw = Math.round(Math.sin(t * 0.8 + p.x * 0.05) * 0.8);
    for (let yy = 0; yy < y; yy++) Gfx.rect(x + Math.round(sw * yy / y), yy, 1, 1, '#14121A');
    ctx.drawImage(img, x - 11 + sw, y);
  };
})();
