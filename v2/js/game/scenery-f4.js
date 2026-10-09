// Fase 4 ("Islands, Rings & Lanterns"): o zoológico e o aquário de Okinawa (A), o mergulho e a
// oficina das alianças (B), o festival de lanternas de Yanai e as dunas de Tottori (C).
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

  // ======================================================================
  //  A1 · zoológico: cercados em cima, placas com setas e barraquinhas de comida
  // ======================================================================

  // caminho de pedrinhas claras com grama nas bordas (look.path = [y0, y1])
  FLOORS.zoo = (c, x, y, w, h, look) => {
    FLOORS.festival(c, x, y, w, h, look);
    const [p0, p1] = look.path || [y, y];
    R(x, p0, w, p1 - p0, '#D8CCB0', c);
    for (let i = 0; i < w * (p1 - p0) / 6; i++) { const v = hash(i, x + 12); R(x + v % w, p0 + (v >>> 9) % (p1 - p0), 1, 1, (v >>> 4) % 2 ? '#C8BC9E' : '#E6DCC4', c); }
    R(x, p0, w, 1, '#B8AC90', c); R(x, p1 - 1, w, 1, '#B8AC90', c);
  };

  // cercado com grade e o bicho dentro (p.animal: elephant, lion, giraffe, monkey); tapa a visão
  props.enclosure = {
    size: p => [p.w || 110, 62],
    solid: p => [0, 6, p.w || 110, 54],
    sight: p => [0, 30, p.w || 110, 30],
    base: 60,
    live(ctx, p, world) {
      const x = p.x, y = p.y, w = p.w || 110, t = world.t;
      Gfx.rect(x, y + 6, w, 50, p.animal === 'lion' ? '#C8A86A' : '#8AB86A');
      for (let i = 0; i < 20; i++) { const v = hash(i, x | 0); Gfx.rect(x + v % w, y + 8 + (v >>> 8) % 46, 2, 1, p.animal === 'lion' ? '#B8945A' : '#6AA84A'); }
      // o bicho
      const a = p.animal, ax = x + w / 2, ay = y + 40;
      if (a === 'elephant') {
        ell(ctx, ax - 16, ay - 18, 30, 20, '#8A8C96'); ell(ctx, ax + 6, ay - 22, 16, 16, '#9A9CA6');
        Gfx.rect(ax - 12, ay - 4, 5, 8, '#7A7C86'); Gfx.rect(ax + 2, ay - 4, 5, 8, '#7A7C86');
        const sw = Math.round(Math.sin(t * 1.5) * 2);
        Gfx.rect(ax + 18 + sw, ay - 16, 3, 12, '#8A8C96'); Gfx.rect(ax + 12, ay - 18, 2, 2, '#1E1826');
        ell(ctx, ax + 2, ay - 24, 8, 10, '#7A7C86');
      } else if (a === 'lion') {
        ell(ctx, ax - 14, ay - 12, 28, 12, '#D8A050');
        ell(ctx, ax + 8, ay - 20, 16, 16, '#A8682A'); ell(ctx, ax + 11, ay - 17, 10, 10, '#E8B060');
        Gfx.rect(ax + 13, ay - 14, 1, 1, '#1E1826'); Gfx.rect(ax + 17, ay - 14, 1, 1, '#1E1826');
        Gfx.rect(ax - 18 + Math.round(Math.sin(t * 2) * 1), ay - 8, 5, 1, '#A8682A');
      } else if (a === 'giraffe') {
        ell(ctx, ax - 10, ay - 14, 22, 12, '#E8B860');
        Gfx.rect(ax + 6, ay - 44, 4, 32, '#E8B860'); ell(ctx, ax + 4, ay - 50, 10, 7, '#E8B860');
        for (let k = 0; k < 6; k++) Gfx.rect(ax - 6 + k * 3, ay - 12 + (k % 2) * 3, 2, 2, '#A8682A');
        Gfx.rect(ax + 7, ay - 38, 2, 2, '#A8682A'); Gfx.rect(ax + 7, ay - 28, 2, 2, '#A8682A');
        Gfx.rect(ax - 8, ay - 3, 2, 8, '#C8984A'); Gfx.rect(ax + 6, ay - 3, 2, 8, '#C8984A');
        Gfx.rect(ax + 10, ay - 48, 1, 1, '#1E1826');
      } else {
        // macacos: dois em cima de um tronco
        Gfx.rect(x + 10, ay - 10, w - 20, 4, '#7A5038');
        [ax - 20, ax + 10].forEach((mx, k) => {
          const by = ay - 18 + Math.round(Math.sin(t * 3 + k * 2) * 2);
          ell(ctx, mx, by, 10, 10, '#8A5A3A'); ell(ctx, mx + 2, by - 6, 7, 7, '#8A5A3A'); Gfx.rect(mx + 4, by - 4, 3, 2, '#E8C8A8');
        });
      }
      // a grade da frente
      Gfx.rect(x, y + 6, w, 2, '#5E6470');
      for (let k = 0; k < w; k += 5) Gfx.rect(x + k, y + 34, 1, 24, '#5E6470');
      Gfx.rect(x, y + 34, w, 2, '#8A929E');
      Gfx.rect(x, y + 56, w, 3, '#6A6A72');
    },
    draw() {}
  };
  // placa de madeira com setas para os outros bichos (texto do config, linhas separadas por "|")
  props.zooSign = {
    size: () => [52, 40],
    solid: () => [24, 34, 4, 4],
    base: 38,
    draw(c, p) {
      shadowRect(c, 22, 36, 8, 3, 0.3);
      R(24, 8, 4, 30, '#7A5032', c);
      (p.text || '').split('|').forEach((ln, i) => {
        R(0, 2 + i * 11, 52, 9, '#C8945A', c); R(0, 2 + i * 11, 52, 1, '#E0B070', c);
        Gfx.text(ln, 26, 3 + i * 11, '#3A2414', { ctx: c, align: 'center' });
      });
    }
  };
  // barraquinha de comida com toldo listrado (texto do config)
  props.foodStand = {
    size: () => [52, 40],
    solid: () => [0, 18, 52, 18],
    sight: () => [0, 4, 52, 34],
    base: 36,
    draw(c, p) {
      const col = p.color || '#E8823A';
      shadowRect(c, 3, 34, 52, 6, 0.35);
      R(0, 18, 52, 18, '#F4F0E6', c); R(0, 18, 52, 2, '#FFFFFF', c);
      R(4, 22, 44, 6, '#C8945A', c);
      for (let k = 0; k < 52; k += 8) { R(k, 4, 8, 10, (k / 8) % 2 ? col : '#FFFFFF', c); ell(c, k, 11, 8, 5, (k / 8) % 2 ? col : '#FFFFFF'); }
      R(2, 0, 2, 20, '#8A6440', c); R(48, 0, 2, 20, '#8A6440', c);
      const tw = Gfx.textWidth(p.text || '') + 6;
      R(26 - tw / 2, 28, tw, 8, '#1E1C22', c);
      Gfx.text(p.text || '', 26, 28, '#F2C14E', { ctx: c, align: 'center' });
    }
  };

  // ======================================================================
  //  A2 · aquário de Okinawa: sala escura e o tanque gigante na parede de cima
  // ======================================================================

  FLOORS.aquarium = (c, x, y, w, h) => {
    R(x, y, w, h, '#14182A', c);
    for (let i = 0; i < w * h / 12; i++) { const v = hash(i, x + 33); R(x + v % w, y + (v >>> 9) % h, 1, 1, '#1A2034', c); }
    // o reflexo azul do tanque no chão
    glow(c, x, y, w, 36, '#2A5A8A', (i, j) => 0.75 * (1 - j / 36));
  };
  // o tanque: azul brilhante, corais embaixo, raios de luz de cima; o vidro com a moldura
  WALLS.tank = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h - 6, ['#2A9AD8', '#1E78C0', '#1858A0', '#103A78'], 3);
    for (let k = 10; k < w; k += 46) glow(c, x + k, 0, 22, h - 12, '#BFE8FA', (i, j) => (Math.abs(i - 11 + j * 0.2) < 4 ? 0.35 * (1 - j / h) : 0));
    // corais e pedras no fundo do tanque
    for (let k = 0; k < w; k += 14) {
      const v = hash(k, x + 2);
      ell(c, x + k, h - 22 + v % 6, 16 + v % 8, 14, ['#E87A8A', '#F2A040', '#B85ACA', '#5DC8A0'][v % 4]);
    }
    R(x, h - 10, w, 4, '#C8B88A', c);
    R(x, h - 6, w, 6, '#2A2E3A', c); R(x, h - 6, w, 1, '#5E6A80', c);
    for (let k = x; k < x + w; k += 96) R(k, 0, 3, h - 6, '#2A2E3A', c);
  };
  // cardumes e raias-manta nadando dentro do tanque (por cima do fundo, atrás do vidro)
  props.tankLife = {
    hidden: true,
    size: () => [1, 1],
    fxLayer: 'ground',
    fx(ctx, p, world) {
      const t = world.t;
      for (let s = 0; s < 3; s++) {
        const cx = p.x + ((t * (16 + s * 6) + s * 140) % 440) - 30, cy = 14 + s * 14;
        for (let i = 0; i < 14; i++) {
          const v = hash(i, s), fx = Math.round(cx + (v % 30) + Math.sin(t * 2 + i) * 2), fy = Math.round(cy + ((v >>> 6) % 10));
          Gfx.rect(fx, fy, 2, 1, s === 1 ? '#F2E07A' : '#D8F0FA');
        }
      }
      // raia-manta
      const mx = Math.round(p.x + 380 - ((t * 12) % 460)), my = 8 + Math.round(Math.sin(t * 0.8) * 3);
      ell(ctx, mx, my + 2, 22, 6, '#1E2E4A'); ell(ctx, mx + 6, my, 10, 10, '#1E2E4A');
      Gfx.rect(mx + 20, my + 4, 6, 1, '#1E2E4A');
    }
  };
  // o tubarão-baleia (quem anda, com id 'shark'): desenhado grande, com pintas brancas
  props.whaleShark = {
    hidden: true,
    size: () => [1, 1],
    live(ctx, g, world) {
      const right = Chars.dirOf(g.look) !== 'left', x = Math.round(g.x), y = Math.round(g.y), t = world.t;
      const R2 = (dx, dy, w, h, col) => Gfx.rect(right ? x + dx : x - dx - w, y + dy, w, h, col);
      const tail = Math.round(Math.sin(t * 3) * 3);
      ell(ctx, x - 30, y - 10, 60, 18, '#2E4A6A');
      ell(ctx, x - 28, y - 4, 56, 9, '#5A7A9A');
      R2(-38, -8 + tail, 10, 4, '#2E4A6A'); R2(-42, -12 + tail, 6, 12, '#2E4A6A');
      R2(-4, -16, 8, 6, '#2E4A6A');
      for (let i = 0; i < 18; i++) { const v = hash(i, 5); R2(-24 + v % 46, -8 + (v >>> 5) % 9, 1, 1, '#E8F2FA'); }
      R2(24, -4, 6, 2, '#1E2E4A');
      R2(20, -7, 1, 1, '#F4F4F2');
    },
    draw() {}
  };
  // corrimão baixo na frente do vidro (bloqueia a passagem, não a visão)
  props.tankRail = {
    size: p => [p.w || 384, 8],
    solid: p => [0, 2, p.w || 384, 4],
    base: 6,
    draw(c, p) {
      const w = p.w || 384;
      R(0, 2, w, 2, '#8A929E', c); R(0, 2, w, 1, '#C9CED6', c);
      for (let k = 4; k < w; k += 24) R(k, 2, 2, 6, '#5E6470', c);
    }
  };

  // ======================================================================
  //  B1 · mergulho em Okinawa: fundo do mar com corais, luz de cima e bolhas
  // ======================================================================

  FLOORS.seabed = (c, x, y, w, h) => {
    Gfx.dither(c, x, y, w, h, ['#1E78A8', '#1A6A98', '#165C88', '#2A7898'], 2);
    for (let i = 0; i < w * h / 10; i++) { const v = hash(i, x + 17); R(x + v % w, y + (v >>> 9) % h, 1, 1, (v >>> 4) % 3 ? '#2A84B0' : '#C8B88A', c); }
    for (let i = 0; i < 12; i++) { const v = hash(i, x + 3); ell(c, x + v % (w - 40), y + 20 + (v >>> 9) % (h - 30), 30 + v % 24, 10, '#C8B88A'); }
  };
  WALLS.reef = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h, ['#5ABCE0', '#3A9CCB', '#2A84B8'], 3);
    for (let k = 0; k < w; k += 10) { const v = hash(k, x + 9); ell(c, x + k, h - 14 + v % 6, 14, 14, ['#E87A8A', '#B85ACA', '#5DC8A0', '#F2A040'][v % 4]); }
  };
  // coral grande (tapa a visão; os vigias nadam em volta)
  props.coral = {
    size: p => [p.w || 70, 54],
    solid: p => [6, 24, (p.w || 70) - 12, 26],
    sight: p => [4, 6, (p.w || 70) - 8, 44],
    base: 50,
    draw(c, p) {
      const w = p.w || 70;
      alpha(c, 0.3, () => ell(c, 2, 40, w - 4, 14, '#0A2A40'));
      ell(c, 4, 18, w - 8, 34, '#B8507A');
      for (let i = 0; i < 9; i++) {
        const v = hash(i, w), cx = 6 + v % (w - 18);
        R(cx, 6 + (v >>> 5) % 14, 4, 28, ['#E87A8A', '#F2A040', '#5DC8A0', '#B85ACA'][v % 4], c);
        ell(c, cx - 3, 2 + (v >>> 5) % 14, 10, 8, ['#F29AAA', '#F8C060', '#8AE0C0', '#D88AE8'][v % 4]);
      }
      for (let i = 0; i < 20; i++) { const v = hash(i, 77); R(6 + v % (w - 12), 22 + (v >>> 7) % 26, 2, 2, '#F8D0DC', c); }
    }
  };
  // pedra com alga (tapa a visão)
  props.seaRock = {
    size: () => [30, 24],
    solid: () => [2, 10, 26, 12],
    sight: () => [2, 4, 26, 18],
    base: 22,
    live(ctx, p, world) {
      ell(ctx, p.x, p.y + 6, 30, 18, '#4A5A6A'); ell(ctx, p.x + 4, p.y + 6, 18, 10, '#6A7A8A');
      for (let k = 0; k < 3; k++) for (let j = 0; j < 10; j++) Gfx.rect(p.x + 6 + k * 8 + Math.round(Math.sin(world.t * 2 + j * 0.5 + k) * 1.5), p.y + 6 - j, 2, 1, '#3E9A5A');
    },
    draw() {}
  };
  // raios de luz e bolhas subindo (por cima de tudo)
  props.underwater = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      const t = world.t;
      ctx.globalAlpha = 0.12;
      for (let k = 0; k < 5; k++) { const x = p.x + 30 + k * 80 + Math.sin(t * 0.4 + k) * 10; for (let j = 0; j < 192; j += 2) Gfx.rect(Math.round(x + j * 0.3), j, 10, 2, '#E8F8FF'); }
      ctx.globalAlpha = 1;
      for (let i = 0; i < 16; i++) {
        const v = hash(i, 8), x = p.x + v % 384 + Math.sin(t * 2 + i) * 3, y = 192 - ((t * (18 + i % 5) + (v >>> 9) % 192) % 192);
        Gfx.rect(Math.round(x), Math.round(y), 2, 2, '#D8F4FF'); Gfx.rect(Math.round(x), Math.round(y), 1, 1, '#FFFFFF');
      }
    }
  };
  // cardume (quem anda, sem bloquear a passagem): tapa a visão por onde passa
  props.fishSchool = {
    hidden: true,
    size: () => [1, 1],
    live(ctx, g, world) {
      const right = Chars.dirOf(g.look) !== 'left', t = world.t;
      for (let i = 0; i < 26; i++) {
        const v = hash(i, g.def.seed || 1);
        const fx = Math.round(g.x - 20 + v % 40 + Math.sin(t * 3 + i) * 1.5), fy = Math.round(g.y - 16 + (v >>> 6) % 16 + Math.cos(t * 2 + i) * 1);
        Gfx.rect(fx, fy, 3, 2, i % 3 ? '#F2E07A' : '#5DD0F0');
        Gfx.rect(right ? fx - 1 : fx + 3, fy, 1, 2, '#E8A040');
      }
    },
    draw() {}
  };

  // ======================================================================
  //  B2 · a oficina das alianças: teto de ripas com lâmpadas penduradas, vitrines e a bancada
  // ======================================================================

  FLOORS.workshop = {
    tones: [['#B89A72', '#AA8C66', '#9C7E5A'], ['#C0A27A', '#B2946E', '#A48662'], ['#B49670', '#A68862', '#987A56']],
    seam: '#7A5E3E', grain: '#8E7050'
  };
  WALLS.workshop = (c, x, w, h) => {
    R(x, 0, w, h, '#F2ECE0', c);
    for (let k = x; k < x + w; k += 8) { R(k, 0, 6, 14, '#B8945A', c); R(k, 0, 6, 1, '#D8B478', c); R(k + 6, 0, 2, 14, '#8A6A3A', c); }
    R(x, 14, w, 2, '#8A6A3A', c);
    // janela à esquerda, com a luz do dia
    R(x + 10, 20, 52, h - 26, '#8A6A3A', c); Gfx.dither(c, x + 12, 22, 48, h - 30, ['#CFE6F6', '#E8F2FA'], 3); R(x + 35, 22, 2, h - 30, '#8A6A3A', c);
    R(x, h - 4, w, 4, '#C8B898', c);
  };
  // lâmpadas penduradas do teto, com um brilho quente (por cima de tudo)
  props.bulbs = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let k = 0; k < (p.n || 6); k++) {
        const x = p.x + k * (p.gap || 56), y = p.y + (k % 2) * 8;
        Gfx.rect(x, 0, 1, y - 24, '#3A3640');
        ctx.globalAlpha = 0.18 + 0.04 * Math.sin(world.t * 2 + k);
        ell(ctx, x - 10, y - 30, 21, 14, '#FFF0C8');
        ctx.globalAlpha = 1;
        Gfx.rect(x - 1, y - 26, 3, 4, '#FFE8A0'); Gfx.rect(x, y - 27, 1, 1, '#FFFFFF');
      }
    }
  };
  // bancada de trabalho comprida com ferramentas e os anéis (os dois sentam virados para ela)
  props.workbench = {
    size: p => [p.w || 90, 26],
    solid: p => [0, 4, p.w || 90, 18],
    base: 20,
    draw(c, p) {
      const w = p.w || 90;
      shadowRect(c, 2, 20, w, 5, 0.3);
      R(0, 4, w, 14, '#7A5032', c); R(0, 4, w, 2, '#9A6A42', c); R(0, 18, w, 3, '#5A3A22', c);
      for (let k = 6; k < w - 6; k += 22) {
        R(k, 7, 8, 6, '#C9CED6', c); R(k + 2, 9, 4, 2, '#F2C14E', c);   // a peça e o anel
        R(k + 10, 8, 6, 1, '#5E6470', c); R(k + 12, 10, 1, 4, '#8A929E', c);
      }
    }
  };
  // vitrine de vidro com os anéis (bloqueia a passagem, não tapa a visão)
  props.ringCase = {
    size: () => [44, 26],
    solid: () => [0, 6, 44, 18],
    base: 24,
    draw(c) {
      shadowRect(c, 2, 22, 44, 4, 0.3);
      R(0, 14, 44, 10, '#5A3A22', c); R(0, 14, 44, 1, '#7A5032', c);
      alpha(c, 0.5, () => R(1, 4, 42, 11, '#D8ECF4', c));
      R(0, 4, 44, 1, '#FFFFFF', c);
      for (let k = 0; k < 6; k++) { R(4 + k * 7, 9, 3, 3, k % 2 ? '#F2C14E' : '#E8ECF2', c); R(5 + k * 7, 10, 1, 1, '#5A3A22', c); }
    }
  };

  // ======================================================================
  //  C1 · festival de lanternas de peixinho dourado em Yanai (noite)
  // ======================================================================

  FLOORS.stoneStreet = (c, x, y, w, h) => {
    R(x, y, w, h, '#5A5650', c);
    for (let j = 0; j < h; j += 7) for (let i = (j / 7) % 2 ? 5 : 0; i < w; i += 10) { R(x + i, y + j, 9, 6, hash(i + x, j) % 3 ? '#6A665E' : '#625E56', c); R(x + i, y + j, 9, 1, '#7A766C', c); }
  };
  // casas de paredes brancas com madeira escura e telhado de telhas, à noite
  WALLS.yanai = (c, x, w, h) => {
    R(x, 0, w, h, '#1A1E34', c);
    for (let k = 0; k < w; k += 64) {
      R(x + k + 2, 12, 60, h - 12, '#E8E4DA', c);
      R(x + k + 2, 6, 60, 8, '#3A3A48', c); for (let i = 0; i < 60; i += 4) R(x + k + 2 + i, 6, 2, 8, '#4A4A5A', c);
      R(x + k + 2, 12, 60, 2, '#2A2A36', c);
      R(x + k + 10, 22, 16, 18, '#5A3A22', c); R(x + k + 12, 24, 12, 14, '#F2D890', c);
      for (let i = 0; i < 4; i++) R(x + k + 12 + i * 3, 24, 1, 14, '#5A3A22', c);
      R(x + k + 36, h - 26, 20, 26, '#4A2E1E', c);
      R(x + k + 2, h - 6, 60, 6, '#3A3A48', c);
    }
  };
  // lanterna de peixinho dourado (vermelha e branca, olhos grandes), pendurada, balançando
  props.goldfishLantern = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      const sw = Math.round(Math.sin(world.t * 1.5 + p.x * 0.1) * 1);
      const x = p.x + sw, y = p.y;
      Gfx.rect(p.x, y - 10, 1, 8, '#2A2830');
      ell(ctx, x - 7, y - 3, 14, 10, '#D8343A');
      ell(ctx, x - 6, y - 3, 8, 5, '#F2F0EA');
      Gfx.rect(x + 5, y - 1, 4, 5, '#D8343A'); Gfx.rect(x + 8, y - 3, 2, 9, '#F2F0EA');
      Gfx.rect(x - 5, y, 3, 3, '#F4F4F2'); Gfx.rect(x - 4, y + 1, 1, 1, '#1E1826');
      Gfx.rect(x - 3, y - 2, 1, 1, '#FFE8A0');
    }
  };
  // o fio com as lanternas de um lado a outro da rua
  props.lanternString = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p) {
      const w = p.w || 384;
      for (let i = 0; i < w; i += 2) Gfx.rect(p.x + i, p.y + Math.round(Math.sin(i / 40 * Math.PI) * 3) - 12, 1, 1, '#2A2830');
    }
  };

  // ======================================================================
  //  C2 · dunas de Tottori: areia, o mar no alto, céu nublado de fim de tarde e o celular no pau
  // ======================================================================

  FLOORS.dunes = (c, x, y, w, h) => {
    R(x, y, w, h, '#E2C08A', c);
    for (let j = 0; j < h; j += 5) {
      for (let i = 0; i < w; i += 2) {
        const yy = y + j + Math.round(Math.sin((i + x) * 0.05 + j * 0.3) * 2);
        if ((i + j) % 6 === 0) R(x + i, yy, 3, 1, '#D2AE76', c);
      }
    }
    for (let i = 0; i < 6; i++) { const v = hash(i, x + 2); ell(c, x + v % (w - 80), y + 30 + (v >>> 9) % (h - 60), 80 + v % 40, 18, '#EACCA0'); }
  };
  WALLS.duneSea = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h - 18, ['#8A8EA8', '#B8A8B8', '#E8C0A8', '#F2D0A0'], 3);
    for (let k = 0; k < w; k += 40) { ell(c, x + k - 10, 4 + hash(k, 4) % 10, 60, 12, '#A8A4B8'); ell(c, x + k, 6 + hash(k, 4) % 10, 40, 8, '#C8BCC8'); }
    Gfx.dither(c, x, h - 18, w, 10, ['#5A7A98', '#6A8AA8'], 3);
    for (let k = 0; k < w; k += 4) R(x + k, h - 9 + (k % 3 ? 0 : 1), 3, 1, '#F2F4F8', c);
    R(x, h - 8, w, 8, '#E2C08A', c);
  };
  // o pau de madeira fincado na areia, com o celular preso (a tela acende no timer)
  props.phoneStick = {
    size: () => [10, 30],
    solid: () => [3, 24, 4, 4],
    base: 28,
    live(ctx, p, world) {
      const x = p.x, y = p.y;
      Gfx.shadow(x + 5, y + 28, 10, 3);
      Gfx.rect(x + 4, y + 8, 2, 20, '#8A6440');
      Gfx.rect(x + 1, y, 8, 11, '#2A2830');
      const on = p.timer ? Math.floor(world.t * 4) % 2 : 0;
      Gfx.rect(x + 2, y + 1, 6, 8, on ? '#F2E07A' : '#5DA8C8');
      Gfx.rect(x + 2, y + 1, 6, 1, '#8AD0E8');
    },
    draw() {}
  };
})();
