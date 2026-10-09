// Fase 3 ("Through the Seasons"): a cozinha dos aniversários e Shirakawa-go (A), a pista de esqui e
// o churrasco (B), Himeji e Nara (C). Pisos, paredes, bordas e objetos.
(() => {
  const { R, hash, glow, alpha, props, FLOORS, WALLS, EDGES } = Scenery;

  function ell(c, x, y, w, h, color) {
    for (let j = 0; j < h; j++) {
      const dy = (j + 0.5 - h / 2) / (h / 2);
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) R(x0, y + j, x1 - x0, 1, color, c);
    }
  }
  const shadowRect = (c, x, y, w, h, a = 0.3) => alpha(c, a, () => R(x, y, w, h, '#140F1E', c));
  const heart = (x, y, col) => ['.#.#.', '#####', '.###.', '..#..'].forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '#') Gfx.rect(x + i, y + j, 1, 1, col); });

  // ======================================================================
  //  A1 · aniversários: a cozinha do apartamento, duplicada (cada cópia ocupa meia tela)
  // ======================================================================

  // parede creme com moldura de madeira escura em cima e o rodapé
  WALLS.kitchen = (c, x, w, h) => {
    R(x, 0, w, h, '#EFE6D2', c);
    for (let i = 0; i < w * h / 40; i++) { const v = hash(i, x + 51); R(x + v % w, (v >>> 9) % h, 1, 1, '#E4DAC2', c); }
    R(x, 0, w, 3, '#5E3A20', c);
    R(x, 3, w, 1, '#7A4E2E', c);
    R(x, h - 3, w, 2, '#5E3A20', c);
    R(x, h - 1, w, 1, '#3A2214', c);
    // a divisa entre as duas cozinhas (as duas datas)
    R(x + 190, 0, 4, h, '#5E3A20', c);
  };

  // portas de correr de madeira marrom, fechadas
  props.slidingDoors = {
    layer: 'back',
    size: () => [44, 44],
    draw(c) {
      R(0, 0, 44, 44, '#5E3A20', c);
      R(2, 2, 19, 42, '#8A5A32', c); R(23, 2, 19, 42, '#8A5A32', c);
      R(4, 6, 15, 14, '#9A6A3E', c); R(25, 6, 15, 14, '#9A6A3E', c);
      R(17, 24, 2, 6, '#3A2214', c); R(25, 24, 2, 6, '#3A2214', c);
    }
  };
  // estante preta de arame com cestos e a lava-louças branca
  props.wireShelf = {
    layer: 'back',
    size: () => [30, 44],
    draw(c) {
      [2, 14, 26, 40].forEach(y => R(0, y, 30, 1, '#2A2830', c));
      R(0, 0, 1, 44, '#2A2830', c); R(29, 0, 1, 44, '#2A2830', c);
      R(3, 4, 11, 9, '#C8A070', c); R(16, 6, 11, 7, '#2A3A5A', c);
      R(4, 27, 22, 12, '#F4F6F8', c); R(4, 27, 22, 1, '#FFFFFF', c); R(6, 30, 6, 1, '#8A929E', c);
      R(4, 16, 9, 8, '#F4F0E6', c);
    }
  };
  // armário baixo marrom com o vaso de folhas de outono
  props.leafCabinet = {
    layer: 'back',
    size: () => [34, 44],
    draw(c) {
      R(0, 24, 34, 20, '#6A4228', c); R(0, 24, 34, 2, '#8A5A32', c); R(16, 28, 2, 14, '#4A2A16', c);
      R(13, 14, 8, 10, '#3A3A48', c);
      for (let i = 0; i < 14; i++) { const v = hash(i, 71); R(6 + v % 22, 1 + (v >>> 6) % 14, 3, 2, ['#D8443A', '#E8823A', '#F2A040', '#B8323A'][v % 4], c); }
    }
  };
  // armário branco com porta de vidro preta, com a fritadeira elétrica e a chaleira de vidro em cima
  props.whiteCabinet = {
    size: () => [20, 44],
    solid: () => [0, 24, 20, 18],
    sight: () => [0, 6, 20, 36],
    base: 42,
    draw(c) {
      shadowRect(c, 2, 40, 20, 4, 0.3);
      R(0, 14, 20, 28, '#F4F6F8', c); R(0, 14, 20, 1, '#FFFFFF', c);
      R(2, 18, 9, 22, '#1E1C22', c); R(3, 19, 2, 20, '#3A3A48', c);
      R(13, 20, 5, 8, '#C8A070', c);
      R(1, 4, 9, 10, '#2A2830', c); R(2, 5, 7, 4, '#5E5A60', c);   // fritadeira
      R(12, 6, 7, 8, '#D8ECF4', c); R(13, 4, 5, 2, '#8A929E', c);  // chaleira
    }
  };
  // bancada da direita: armários marrom-escuros, azulejo creme, coifa e fogão, e a janela
  props.kitchenWall = {
    layer: 'back',
    size: () => [70, 44],
    draw(c) {
      for (let j = 0; j < 30; j += 6) for (let i = 0; i < 70; i += 6) R(i, 8 + j, 6, 6, (i + j) % 12 ? '#EFE0BC' : '#E6D6B0', c);
      R(0, 0, 32, 10, '#4A2A16', c); R(2, 2, 13, 6, '#5E3A20', c); R(17, 2, 13, 6, '#5E3A20', c);
      R(36, 0, 22, 14, '#C9CED6', c); R(38, 12, 18, 2, '#8A929E', c);       // coifa
      R(4, 14, 22, 14, '#BFE0F0', c); R(14, 14, 2, 14, '#F4F0E6', c);        // janela
      R(0, 36, 70, 8, '#3A2214', c); R(0, 36, 70, 1, '#5E3A20', c);
    }
  };

  // mesa de madeira escura com toalha (p.cloth) vista de cima, com cadeiras de assento creme
  props.partyTable = {
    size: () => [72, 46],
    solid: () => [4, 10, 64, 24],
    base: 36,
    draw(c, p) {
      shadowRect(c, 4, 34, 68, 6, 0.3);
      [[10, 0], [50, 0]].forEach(([x, y]) => { R(x, y, 12, 9, '#4A2E1E', c); R(x + 1, y + 1, 10, 6, '#EFE0BC', c); });
      R(4, 10, 64, 24, '#5A3622', c);
      if (p.cloth) { R(6, 11, 60, 22, p.cloth, c); for (let k = 8; k < 66; k += 6) R(k, 33, 3, 2, p.cloth, c); }
      R(4, 10, 64, 2, '#7A4E32', c);
      R(4, 32, 64, 2, '#3A2214', c);
      [[10, 36], [50, 36]].forEach(([x, y]) => { R(x, y, 12, 9, '#4A2E1E', c); R(x + 1, y, 10, 5, '#EFE0BC', c); });
    }
  };

  // torta de frutas vermelhas com as velas "33" (as chamas apagam quando o Fabio assopra e
  // voltam a acender sozinhas)
  props.berryTart = {
    size: () => [20, 18],
    base: 30,
    live(ctx, p, world) {
      const x = p.x, y = p.y;
      ell(ctx, x, y + 8, 20, 10, '#C8945A');
      ell(ctx, x + 2, y + 8, 16, 7, '#E8C88A');
      for (let i = 0; i < 9; i++) { const v = hash(i, 5); Gfx.rect(x + 4 + v % 12, y + 9 + (v >>> 4) % 4, 2, 2, ['#B8283C', '#5A2A6A', '#D8443A'][v % 3]); }
      // velas "3" e "3"
      [6, 11].forEach((vx, k) => {
        Gfx.rect(x + vx, y + 2, 3, 7, '#5DA8F0');
        Gfx.rect(x + vx + 1, y + 3, 1, 1, '#FFFFFF'); Gfx.rect(x + vx + 1, y + 5, 1, 1, '#FFFFFF');
        // a chama apaga um instante a cada 4,5 s (o sopro) e acende de novo
        const out = (world.t % 4.5) > 2.6 && (world.t % 4.5) < 3.3;
        if (!out) {
          const fl = Math.sin(world.t * 18 + k) > 0 ? 1 : 0;
          Gfx.rect(x + vx + 1, y - 1 - fl, 1, 3, '#F2C14E');
          Gfx.rect(x + vx + 1, y, 1, 1, '#FFF4C8');
        } else Gfx.rect(x + vx + 1, y - 3 - Math.round((world.t * 8) % 3), 1, 1, '#C8C8CC');
      });
    },
    draw() {}
  };
  // presente azul e sacola listrada
  props.giftBox = {
    size: () => [14, 14],
    solid: () => [0, 6, 14, 8],
    base: 13,
    draw(c) {
      R(0, 4, 14, 10, '#3A78C8', c); R(0, 4, 14, 2, '#5A98E8', c);
      R(6, 4, 2, 10, '#F2C14E', c); R(0, 8, 14, 2, '#F2C14E', c);
      R(4, 1, 3, 3, '#F2C14E', c); R(8, 1, 3, 3, '#F2C14E', c);
    }
  };
  props.stripedBag = {
    size: () => [12, 16],
    solid: () => [0, 8, 12, 7],
    base: 15,
    draw(c) {
      R(0, 4, 12, 12, '#F4F0E6', c);
      for (let k = 0; k < 12; k += 3) R(k, 4, 1, 12, '#D8443A', c);
      R(3, 0, 1, 5, '#8A6440', c); R(8, 0, 1, 5, '#8A6440', c); R(3, 0, 6, 1, '#8A6440', c);
    }
  };
  // balões coloridos presos por fitas, balançando
  props.balloons = {
    size: () => [24, 40],
    base: 40,
    live(ctx, p, world) {
      const cols = p.colors || ['#D8443A', '#3A78C8', '#F2C14E'];
      cols.forEach((col, i) => {
        const sway = Math.round(Math.sin(world.t * 1.4 + i * 2 + p.x) * 2);
        const bx = p.x + 2 + i * 7 + sway, by = p.y + 2 + (i % 2) * 5;
        for (let k = 0; k < 24 - (i % 2) * 5; k++) Gfx.rect(p.x + 8 + i * 3 + Math.round(sway * (1 - k / 24)), by + 9 + k, 1, 1, '#E8E0D0');
        ell(ctx, bx, by, 8, 10, col);
        Gfx.rect(bx + 2, by + 2, 2, 2, '#FFFFFF');
      });
    },
    draw() {}
  };
  // faixa "HAPPY BIRTHDAY" (texto do config) com bandeirinhas
  props.banner = {
    layer: 'back',
    size: p => [Gfx.textWidth(p.text || '') + 12, 16],
    draw(c, p) {
      const w = Gfx.textWidth(p.text || '') + 12;
      R(0, 2, w, 1, '#8A6440', c);
      for (let k = 0; k < w - 4; k += 7) R(k + 2, 3, 6, 11, ['#D8443A', '#F2C14E', '#5DAA62', '#3A78C8', '#E888A8'][(k / 7) % 5], c);
      Gfx.text(p.text || '', 6, 5, '#FFFFFF', { ctx: c, shadow: '#3A2A30' });
    }
  };
  // luzinhas coloridas na parede, piscando
  props.stringLights = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      const w = p.w || 160;
      for (let i = 0; i <= w; i += 2) Gfx.rect(p.x + i, p.y + Math.round(Math.sin(i / w * Math.PI * 3) * 3), 1, 1, '#3A3640');
      for (let i = 4, k = 0; i < w; i += 9, k++) {
        const on = Math.sin(world.t * 3 + k * 1.7) > -0.2;
        const y = p.y + Math.round(Math.sin(i / w * Math.PI * 3) * 3) + 1;
        Gfx.rect(p.x + i, y, 2, 2, on ? ['#F2C14E', '#E888A8', '#5DD0F0', '#8AD060'][k % 4] : '#5E5A60');
      }
    }
  };
  // pizza grande, bolinho decorado e cartões (na mesa da Ellen)
  props.pizza = {
    size: () => [18, 14],
    base: 30,
    draw(c) {
      ell(c, 0, 0, 18, 14, '#C8823A');
      ell(c, 2, 1, 14, 11, '#E8B860');
      for (let i = 0; i < 6; i++) { const v = hash(i, 13); ell(c, 4 + v % 9, 3 + (v >>> 4) % 6, 3, 3, '#C83A2A'); }
    }
  };
  props.smallCake = {
    size: () => [12, 14],
    base: 30,
    draw(c) {
      R(1, 6, 10, 7, '#F4F0E6', c); R(1, 6, 10, 2, '#F2A7BE', c);
      R(3, 2, 6, 4, '#F2A7BE', c); R(5, 0, 2, 2, '#D8443A', c);
      R(2, 9, 1, 1, '#5DD0F0', c); R(8, 10, 1, 1, '#F2C14E', c);
    }
  };
  props.cards = {
    size: () => [16, 10],
    base: 30,
    draw(c) {
      R(0, 2, 7, 6, '#F4F0E6', c); R(1, 3, 5, 1, '#E888A8', c);
      R(5, 0, 7, 6, '#BFE0F0', c); R(6, 1, 4, 1, '#3A78C8', c);
      R(9, 4, 7, 6, '#F2E07A', c); heart(10, 6, '#D8443A');
    }
  };
  // brilhos dos enfeites (aniversário da Ellen)
  props.sparkles = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let i = 0; i < 10; i++) {
        const v = hash(i, p.x | 0), x = p.x + v % (p.w || 150), y = p.y + (v >>> 8) % (p.h || 30);
        if (Math.sin(world.t * 4 + i * 2.3) > 0.6) { Gfx.rect(x, y, 1, 3, '#FFF4C8'); Gfx.rect(x - 1, y + 1, 3, 1, '#FFF4C8'); }
      }
    }
  };

  // ======================================================================
  //  A2 · Shirakawa-go: casas de telhado de palha com neve, torii, santuário, árvores sem folhas
  // ======================================================================

  // neve funda dos lados e o caminho de neve pisada (look.path = [y0, y1])
  FLOORS.snow = (c, x, y, w, h, look) => {
    R(x, y, w, h, '#F2F6FA', c);
    for (let i = 0; i < w * h / 8; i++) { const v = hash(i, x + 41); R(x + v % w, y + (v >>> 9) % h, 1, 1, (v >>> 4) % 3 ? '#E2EAF2' : '#FFFFFF', c); }
    const [p0, p1] = look.path || [0, 0];
    if (p1 > p0) {
      R(x, p0, w, p1 - p0, '#D8E0EA', c);
      for (let i = 0; i < w * (p1 - p0) / 5; i++) { const v = hash(i, x + 7); R(x + v % w, p0 + (v >>> 9) % (p1 - p0), 2, 1, (v >>> 4) % 2 ? '#C8D2DE' : '#E6ECF2', c); }
      for (let k = 0; k < w; k += 9) { R(x + k, p0 + 6 + (k % 4), 2, 1, '#B8C4D2', c); R(x + k + 4, p1 - 8 + (k % 3), 2, 1, '#B8C4D2', c); }
      R(x, p0, w, 1, '#C8D2DE', c); R(x, p1 - 1, w, 1, '#C8D2DE', c);
    }
  };
  // céu de inverno e montanhas com floresta nevada
  WALLS.snowHills = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h, ['#B8CCE0', '#D0DEEC', '#E6EEF6'], 3);
    for (let k = -20; k < w + 20; k += 30) {
      const v = hash(k, x + 2) % 10;
      for (let j = 0; j < 22 + v; j++) R(x + k - j * 0.7 + 15, h - 22 - v + j, Math.round(j * 1.4), 1, j < 6 ? '#F2F6FA' : '#4A6A5A', c);
    }
    R(x, h - 4, w, 4, '#E6ECF2', c);
  };
  // pinheiros nevados nas laterais
  EDGES.snowTrees = (c, x, top, gap, side) => {
    const segs = gap ? [[top - 6, gap[0]], [gap[1], 192]] : [[top - 6, 192]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b - 6; y += 10) {
        const cx = side === 'left' ? x + 2 : x + 2;
        for (let j = 0; j < 12; j++) R(cx - Math.round(j / 2), y + j, Math.round(j) + 1, 1, j % 4 === 0 ? '#F2F6FA' : '#3E6A52', c);
      }
    });
  };

  // casa de telhado de palha (gassho-zukuri) coberta de neve; tapa a visão
  props.gassho = {
    size: () => [64, 62],
    solid: () => [6, 40, 52, 20],
    sight: () => [4, 14, 56, 46],
    base: 60,
    draw(c, p) {
      shadowRect(c, 6, 56, 58, 6, 0.3);
      // paredes de madeira escura com janelas de papel
      R(6, 38, 52, 22, '#5E3A20', c);
      for (let k = 10; k < 56; k += 12) { R(k, 42, 8, 8, '#F2E8C8', c); R(k + 3, 42, 1, 8, '#5E3A20', c); }
      R(28, 48, 8, 12, '#3A2214', c);
      // telhado de palha em A, com a neve por cima
      for (let j = 0; j < 40; j++) {
        const half = Math.round(4 + j * 0.78);
        R(32 - half, j, half * 2, 1, j < 26 ? '#F4F8FC' : '#B8945A', c);
        if (j >= 26) { R(32 - half, j, 2, 1, '#8A6A3A', c); R(32 + half - 2, j, 2, 1, '#8A6A3A', c); }
        else if (j % 3 === 0) R(32 - half + 2, j, half * 2 - 4, 1, '#E2EAF2', c);
      }
      R(10, 38, 44, 2, '#E6ECF2', c);
      R(28, 2, 8, 3, '#C8D2DE', c);
      if (p.light) glow(c, 10, 40, 44, 10, '#F2C14E', (i, j) => (i % 12 < 8 && j < 8 ? 0.4 : 0));
    }
  };
  // torii de madeira (natural) com neve em cima
  props.torii = {
    size: () => [44, 44],
    solid: () => [4, 38, 6, 4],
    base: 42,
    draw(c) {
      shadowRect(c, 4, 40, 40, 4, 0.25);
      R(6, 10, 4, 32, '#7A5232', c); R(34, 10, 4, 32, '#7A5232', c);
      R(0, 4, 44, 5, '#8A5E38', c); R(0, 3, 44, 2, '#F4F8FC', c);
      R(4, 14, 36, 3, '#7A5232', c);
      R(20, 9, 4, 5, '#7A5232', c);
      R(6, 40, 4, 2, '#5E3A20', c); R(34, 40, 4, 2, '#5E3A20', c);
    }
  };
  // santuário pequeno; tapa a visão
  props.shrine = {
    size: () => [40, 40],
    solid: () => [4, 24, 32, 14],
    sight: () => [4, 8, 32, 30],
    base: 38,
    draw(c) {
      shadowRect(c, 4, 34, 36, 6, 0.3);
      R(6, 22, 28, 16, '#8A5E38', c); R(16, 26, 8, 12, '#3A2214', c);
      for (let j = 0; j < 16; j++) R(20 - Math.round(4 + j), 6 + j, Math.round(4 + j) * 2, 1, j < 4 ? '#F4F8FC' : '#5A4A40', c);
      R(18, 0, 4, 6, '#5A4A40', c); R(17, 0, 6, 2, '#F4F8FC', c);
      R(18, 28, 4, 3, '#F2C14E', c);
    }
  };
  // árvore sem folhas com neve nos galhos; o tronco tapa a visão
  props.bareTree = {
    size: () => [30, 44],
    solid: () => [12, 36, 6, 6],
    sight: () => [12, 24, 6, 18],
    base: 42,
    draw(c) {
      alpha(c, 0.25, () => ell(c, 6, 38, 22, 6, '#140F1E'));
      R(13, 14, 4, 28, '#5A4A40', c);
      [[4, 6, 10], [16, 2, 12], [2, 16, 12], [17, 12, 11]].forEach(([x, y, w]) => {
        R(x, y + 2, w, 2, '#5A4A40', c); R(x, y + 1, w, 1, '#F4F8FC', c);
      });
      R(9, 4, 2, 12, '#5A4A40', c); R(19, 4, 2, 10, '#5A4A40', c);
    }
  };
  // neve caindo (por cima de tudo)
  props.snowfall = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let i = 0; i < 46; i++) {
        const v = hash(i, 3), x = p.x + (v % 384 + Math.sin(world.t * 0.8 + i) * 6), y = ((v >>> 9) % 192 + world.t * (14 + i % 5)) % 192;
        Gfx.rect(Math.round(x), Math.round(y), i % 7 ? 1 : 2, i % 7 ? 1 : 2, '#FFFFFF');
      }
    }
  };

  // ======================================================================
  //  B1 · a pista de esqui: neve com as marcas da máquina, pinheiros e o teleférico ao fundo
  // ======================================================================

  // a pista (look.slope = [x0, x1]) com as linhas da máquina de neve; neve funda dos lados
  FLOORS.ski = (c, x, y, w, h, look) => {
    R(x, y, w, h, '#EEF4FA', c);
    for (let i = 0; i < w * h / 7; i++) { const v = hash(i, x + 9); R(x + v % w, y + (v >>> 9) % h, 1, 1, (v >>> 4) % 3 ? '#DCE6F0' : '#FFFFFF', c); }
    const [s0, s1] = look.slope || [0, 0];
    R(x + s0, y, s1 - s0, h, '#F6FAFE', c);
    for (let k = s0 + 3; k < s1; k += 5) R(x + k, y, 1, h, '#E2EAF4', c);
    for (let j = y; j < y + h; j += 16) { R(x + s0 - 2, j, 2, 8, '#E8823A', c); R(x + s1, j + 8, 2, 8, '#E8823A', c); }
  };
  // céu, montanhas e o teleférico (os cabos; as cadeirinhas passam no fx)
  WALLS.skiMountains = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h, ['#7AAEE0', '#A8CCEE', '#D0E4F6'], 3);
    for (let k = -40; k < w + 40; k += 70) {
      for (let j = 0; j < 40; j++) R(x + k + 35 - j, h - 40 + j, j * 2, 1, j < 12 ? '#FFFFFF' : '#6A8AA8', c);
    }
    R(x, 8, w, 1, '#3A3640', c);
    for (let k = 30; k < w; k += 120) { R(x + k, 8, 2, h - 8, '#5E5A60', c); R(x + k - 4, 8, 10, 2, '#5E5A60', c); }
    R(x, h - 3, w, 3, '#EEF4FA', c);
  };
  // cadeirinhas do teleférico andando no cabo
  props.skiLift = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let k = 0; k < 5; k++) {
        const x = Math.round(p.x + ((world.t * 18 + k * 80) % 400) - 8);
        Gfx.rect(x, 9, 1, 6, '#3A3640');
        Gfx.rect(x - 4, 15, 9, 2, '#D8443A');
        Gfx.rect(x - 4, 12, 1, 4, '#D8443A');
      }
    }
  };
  // pinheiro com neve; tapa a visão
  props.pine = {
    size: () => [26, 40],
    solid: () => [9, 32, 8, 6],
    sight: () => [5, 10, 16, 28],
    base: 38,
    draw(c) {
      alpha(c, 0.25, () => ell(c, 3, 34, 22, 6, '#140F1E'));
      R(11, 30, 4, 8, '#5A3A22', c);
      for (let j = 0; j < 32; j++) {
        const half = Math.round(2 + (j % 11) * 1.1 + j * 0.25);
        R(13 - half, j, half * 2, 1, (j % 11) < 3 ? '#F4F8FC' : (j % 11) < 7 ? '#3E6A52' : '#2E5A44', c);
      }
    }
  };

  // ======================================================================
  //  B2 · o churrasco no parque: a churrasqueira e a mesa comprida na vertical
  // ======================================================================

  // churrasqueira com carvão aceso e a carne (um pouco de fumaça, só no desenho)
  props.grill = {
    size: () => [36, 34],
    solid: () => [2, 16, 32, 14],
    base: 30,
    live(ctx, p, world) {
      const x = p.x, y = p.y;
      Gfx.shadow(x + 18, y + 30, 32, 6);
      Gfx.rect(x + 2, y + 14, 32, 10, '#2A2830');
      Gfx.rect(x + 4, y + 15, 28, 6, '#5A2A1E');
      for (let i = 0; i < 10; i++) Gfx.rect(x + 5 + i * 3, y + 16, 2, 2, Math.sin(world.t * 6 + i) > 0 ? '#F2A040' : '#D8443A');
      for (let i = 0; i < 4; i++) { Gfx.rect(x + 6 + i * 7, y + 13, 5, 3, '#8A4A2A'); Gfx.rect(x + 7 + i * 7, y + 13, 3, 1, '#B86A3A'); }
      Gfx.rect(x + 4, y + 24, 2, 8, '#2A2830'); Gfx.rect(x + 30, y + 24, 2, 8, '#2A2830');
      for (let k = 0; k < 4; k++) {
        const ph = (world.t * 0.6 + k / 4) % 1;
        ctx.globalAlpha = 0.45 * (1 - ph);
        Gfx.rect(x + 10 + k * 5 + Math.round(Math.sin(world.t * 2 + k) * 2), y + 10 - ph * 18, 4, 3, '#E8E8EC');
      }
      ctx.globalAlpha = 1;
    },
    draw() {}
  };
  // mesa comprida de madeira na vertical, com a comida (p.h = comprimento)
  props.longTableV = {
    size: p => [30, p.h || 100],
    solid: p => [0, 4, 30, (p.h || 100) - 6],
    base: p => (p.h || 100) - 2,
    draw(c, p) {
      const h = p.h || 100;
      shadowRect(c, 3, 6, 30, h - 4, 0.3);
      R(0, 2, 30, h - 4, '#B8925A', c);
      R(0, 2, 30, 2, '#D8B278', c);
      for (let k = 6; k < h - 4; k += 10) R(1, k, 28, 1, '#A07E48', c);
      const food = [['#E8E0D0', '#8A4A2A'], ['#F4F0E6', '#5DAA62'], ['#E8E0D0', '#D8443A'], ['#F4F0E6', '#F2C14E']];
      for (let k = 0; k < (h - 20) / 22; k++) {
        const [plate, fd] = food[k % 4];
        ell(c, 8, 10 + k * 22, 14, 10, plate); ell(c, 11, 12 + k * 22, 8, 6, fd);
        R(22, 14 + k * 22, 3, 6, '#C8E8F4', c);
      }
    }
  };
  // caixa térmica
  props.cooler = {
    size: () => [18, 14],
    solid: () => [0, 4, 18, 10],
    base: 13,
    draw(c) {
      shadowRect(c, 2, 11, 18, 3, 0.3);
      R(0, 4, 18, 9, '#3A78C8', c); R(0, 2, 18, 3, '#F4F6F8', c); R(7, 0, 4, 2, '#8A929E', c);
    }
  };

  // ======================================================================
  //  C1 · o castelo de Himeji: o castelo branco no fundo, a muralha de pedra, cerejeiras floridas,
  //  pétalas caindo e o chão de terra clara
  // ======================================================================

  FLOORS.lightDirt = (c, x, y, w, h) => {
    R(x, y, w, h, '#E2CCA4', c);
    for (let i = 0; i < w * h / 8; i++) { const v = hash(i, x + 61); R(x + v % w, y + (v >>> 9) % h, 1, 1, ['#D6BE94', '#EAD8B4', '#CDB488', '#F2C8D4'][(v >>> 4) % 4], c); }
  };

  // céu de primavera, o castelo branco de cinco andares sobre a muralha de pedra e os muros brancos
  WALLS.himeji = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h - 20, ['#8CC0EC', '#A8D2F2', '#C8E4F8'], 3);
    const cx = x + w / 2;
    // muros brancos dos lados, com telhadinho, e o barranco de terra embaixo
    R(x, h - 26, w, 16, '#F4F2EC', c); R(x, h - 30, w, 4, '#5E6A6E', c); R(x, h - 27, w, 1, '#8A9A9A', c);
    R(x, h - 10, w, 10, '#C8B08A', c); R(x, h - 10, w, 1, '#A89070', c);
    for (let k = 0; k < w; k += 5) R(x + k, h - 7 + (hash(k, 3) % 3), 2, 1, '#B89E78', c);
    // muralha de pedra (ishigaki), mais larga embaixo
    for (let j = 0; j < 26; j++) {
      const half = 46 + j * 0.9;
      R(cx - half, h - 26 + j - 10, half * 2, 1, '#9A968C', c);
    }
    for (let j = 0; j < 26; j += 4) for (let i = -60; i < 60; i += 7) R(cx + i + (j % 8 ? 3 : 0), h - 36 + j, 5, 3, (i + j) % 3 ? '#B0ACA2' : '#8A867C', c);
    // os cinco andares: parede branca e telhado verde-acinzentado com as pontas curvas
    const tiers = [[44, 14], [36, 12], [30, 11], [24, 10], [16, 10]];
    let top = h - 36;
    tiers.forEach(([half, th], k) => {
      R(cx - half, top - th, half * 2, th, '#F6F4EE', c);
      R(cx - half + 3, top - th + 3, 3, 3, '#3A3640', c); R(cx + half - 6, top - th + 3, 3, 3, '#3A3640', c);
      if (k % 2 === 0) { R(cx - 3, top - th + 3, 6, 4, '#3A3640', c); }
      R(cx - half - 6, top - th - 3, half * 2 + 12, 3, '#6A7A7E', c);
      R(cx - half - 8, top - th - 4, 3, 2, '#6A7A7E', c); R(cx + half + 5, top - th - 4, 3, 2, '#6A7A7E', c);
      R(cx - half - 6, top - th - 3, half * 2 + 12, 1, '#9AAAAA', c);
      if (k === 1 || k === 3) { for (let j = 0; j < 6; j++) R(cx - 6 + j, top - th - 3 - j, 12 - j * 2, 1, '#6A7A7E', c); }
      top -= th + 3;
    });
    R(cx - 7, top - 2, 2, 3, '#F2C14E', c); R(cx + 5, top - 2, 2, 3, '#F2C14E', c);
    // cerejeiras na frente dos muros
    for (let k = 8; k < w; k += 46) {
      if (Math.abs(x + k - cx) < 60) continue;
      ell(c, x + k, h - 34, 30, 20, '#F2C8D4'); ell(c, x + k + 4, h - 32, 18, 12, '#F8DCE4');
    }
  };

  // cerejeira florida: copa rosa por cima de quem passa, o tronco tapa a visão
  props.cherry = {
    size: () => [56, 64],
    solid: () => [24, 54, 8, 8],
    sight: () => [23, 40, 10, 22],
    base: 62,
    draw(c) {
      alpha(c, 0.25, () => ell(c, 6, 54, 48, 10, '#140F1E'));
      R(25, 30, 6, 32, '#5A3A2A', c); R(25, 30, 2, 32, '#7A5038', c);
      R(18, 30, 8, 2, '#5A3A2A', c); R(30, 26, 10, 2, '#5A3A2A', c);
      ell(c, 0, 2, 56, 38, '#E8A8BC');
      ell(c, 4, 0, 30, 24, '#F2C8D4');
      ell(c, 24, 6, 28, 22, '#F2C8D4');
      for (let i = 0; i < 40; i++) { const v = hash(i, 19); R(4 + v % 48, 2 + (v >>> 7) % 32, 2, 2, (v >>> 3) % 3 ? '#FCE4EC' : '#D888A0', c); }
    }
  };
  // lanterna de pedra (tōrō)
  props.stoneLantern = {
    size: () => [14, 26],
    solid: () => [2, 18, 10, 6],
    sight: () => [3, 6, 8, 18],
    base: 24,
    draw(c) {
      shadowRect(c, 2, 22, 12, 3, 0.3);
      R(5, 12, 4, 10, '#9A968C', c); R(2, 20, 10, 4, '#8A867C', c);
      R(3, 6, 8, 6, '#B0ACA2', c); R(5, 8, 4, 3, '#F2E8B0', c);
      R(1, 3, 12, 3, '#8A867C', c); R(6, 0, 2, 3, '#8A867C', c);
    }
  };
  // pétalas caindo (por cima de tudo)
  props.petals = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let i = 0; i < 34; i++) {
        const v = hash(i, 11), x = p.x + (v % 384 + world.t * (10 + i % 6) + Math.sin(world.t * 1.5 + i) * 8) % 384;
        const y = ((v >>> 9) % 192 + world.t * (12 + i % 4)) % 192;
        Gfx.rect(Math.round(x), Math.round(y), 2, 1, i % 3 ? '#F8D0DC' : '#F2A8C0');
      }
    }
  };

  // ======================================================================
  //  C2 · Nara: a lagoa em cima (com o barco a remo), cerejeiras no alto e o caminho dos cervos
  // ======================================================================

  // água da lagoa (look.pond = [y0, y1]) e a margem; embaixo, o caminho de terra
  FLOORS.nara = (c, x, y, w, h, look) => {
    FLOORS.lightDirt(c, x, y, w, h);
    const [p0, p1] = look.pond || [y, y];
    Gfx.dither(c, x, p0, w, p1 - p0, ['#3A6A7A', '#4A8090', '#5A94A0'], 3);
    for (let i = 0; i < w * (p1 - p0) / 30; i++) { const v = hash(i, x + 23); R(x + v % w, p0 + (v >>> 9) % (p1 - p0), 3, 1, '#7AB0BA', c); }
    for (let i = 0; i < 24; i++) { const v = hash(i, x + 4); R(x + v % w, p0 + 4 + (v >>> 9) % 20, 2, 2, '#F8DCE4', c); }
    // margem de grama
    R(x, p1, w, 8, '#6AA84A', c);
    for (let k = 0; k < w; k += 2) R(x + k, p1 - 1 + (hash(k, 9) % 2), 1, 2, '#5E9A42', c);
    R(x, p1 + 8, w, 2, '#B8A07A', c);
  };
  // céu e a margem de lá, com cerejeiras
  WALLS.naraBank = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, 14, ['#A8D2F2', '#C8E4F8', '#E0F0FA'], 3);
    R(x, 14, w, h - 14, '#6AA84A', c);
    for (let k = -10; k < w; k += 34) {
      R(x + k + 14, 10, 4, h - 12, '#5A3A2A', c);
      ell(c, x + k, 0, 34, 22, '#F2C8D4'); ell(c, x + k + 6, 2, 20, 12, '#FCE4EC');
    }
    R(x, h - 2, w, 2, '#4A7A3A', c);
  };

  // O barco a remo, desenhado girado pela direção (look) de quem anda: o casco é rasterizado em
  // 32 ângulos (pixels nítidos), com os remos batendo.
  const boatCache = {};
  function boatImage(step) {
    if (boatCache[step]) return boatCache[step];
    const a = step / 32 * Math.PI * 2, cv = Gfx.canvas(56, 56), c = cv.cx, cos = Math.cos(a), sin = Math.sin(a);
    for (let py = 0; py < 56; py++) {
      for (let px = 0; px < 56; px++) {
        const dx = px + 0.5 - 28, dy = py + 0.5 - 28;
        const u = dx * cos + dy * sin, v = -dx * sin + dy * cos;   // u: ao longo do barco (proa em +u)
        if (u < -21 || u > 23) continue;
        const half = u > 12 ? 8 * (23 - u) / 11 : u < -17 ? 8 - (-17 - u) * 0.8 : 8;
        if (Math.abs(v) > half) continue;
        const rim = Math.abs(v) > half - 2 || u > 21 || u < -19;
        let col = rim ? '#7A4A2A' : '#A8743E';
        if (!rim && Math.abs(u) < 2) col = '#8A5A32';                       // banco do remador
        if (!rim && (Math.abs(u + 12) < 1.5 || Math.abs(u - 12) < 1.5)) col = '#8A5A32';
        c.fillStyle = col;
        c.fillRect(px, py, 1, 1);
      }
    }
    return (boatCache[step] = cv);
  }
  props.rowboat = {
    hidden: true,
    size: () => [1, 1],
    live(ctx, g, world) {
      const step = Math.round(((g.look % 360) + 360) % 360 / 360 * 32) % 32;
      const x = Math.round(g.x), y = Math.round(g.y);
      // marolas atrás do barco
      for (let k = 1; k < 4; k++) {
        const a = g.look * Math.PI / 180, bx = x - Math.cos(a) * (20 + k * 6), by = y - Math.sin(a) * (20 + k * 6);
        Gfx.rect(Math.round(bx - Math.sin(a) * 6), Math.round(by + Math.cos(a) * 6), 2, 1, '#B8DCE4');
        Gfx.rect(Math.round(bx + Math.sin(a) * 6), Math.round(by - Math.cos(a) * 6), 2, 1, '#B8DCE4');
      }
      ctx.drawImage(boatImage(step), x - 28, y - 28);
      // remos: saem do meio para os dois lados e vão para a frente e para trás
      const a = g.look * Math.PI / 180, sw = Math.sin((world.t || 0) * 3) * 0.5;
      [-1, 1].forEach(side => {
        for (let k = 6; k < 20; k++) {
          const u = Math.sin(sw) * k * 0.6, v = side * k;
          const px = x + Math.cos(a) * u - Math.sin(a) * v, py = y + Math.sin(a) * u + Math.cos(a) * v;
          Gfx.rect(Math.round(px), Math.round(py), 1, 1, k > 15 ? '#C8945A' : '#8A5A32');
        }
      });
    },
    draw() {}
  };

  // cervo de Nara (inofensivo), andando de lado; vira para onde anda
  props.deer = {
    hidden: true,
    size: () => [1, 1],
    live(ctx, g) {
      const x = Math.round(g.x), y = Math.round(g.y), left = Chars.dirOf(g.look) === 'left';
      const f = g.moving ? Math.floor(g.dist / 4) % 2 : 0;
      Gfx.shadow(x, y, 20, 5);
      const R2 = (dx, dy, w, h, col) => Gfx.rect(left ? x - dx - w : x + dx, y + dy, w, h, col);
      // pernas
      [[-7, f], [-4, 1 - f], [4, f], [7, 1 - f]].forEach(([dx, k]) => R2(dx, -6 + k, 1, 6 - k, '#6A4428'));
      // corpo marrom com pintas claras e o rabinho branco
      R2(-9, -13, 18, 7, '#B8844E');
      R2(-9, -13, 18, 2, '#C89A62');
      R2(-3, -11, 1, 1, '#F2E0C0'); R2(2, -10, 1, 1, '#F2E0C0'); R2(-6, -10, 1, 1, '#F2E0C0');
      R2(-11, -13, 2, 3, '#F4F0E6');
      // pescoço e cabeça, com as orelhas e o focinho
      R2(7, -18, 4, 7, '#B8844E');
      R2(8, -21, 6, 4, '#B8844E');
      R2(13, -19, 2, 2, '#3A2A20');
      R2(9, -22, 2, 2, '#9A6A3A'); R2(11, -23, 1, 2, '#9A6A3A');
      R2(10, -20, 1, 1, '#1E1826');
    },
    draw() {}
  };
})();
