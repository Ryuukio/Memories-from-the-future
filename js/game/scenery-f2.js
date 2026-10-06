// Fase 2 ("Late Summer"): a praia (A), o cinema (B), o apartamento nos dias de corona e o
// Brazilian Day (C). Pisos, paredes, bordas e objetos.
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
  //  A · a praia (F2 A1 no mar, F2 A2 perto das barracas)
  // ======================================================================

  // areia clara com conchinhas; o mar ocupa o alto do piso (look.sea = [y0, y1], a linha da praia)
  FLOORS.beach = (c, x, y, w, h, look) => {
    R(x, y, w, h, '#EAD7A8', c);
    for (let i = 0; i < w * h / 9; i++) {
      const v = hash(i, x + 17), px = x + v % w, py = y + (v >>> 9) % h;
      R(px, py, 1, 1, ['#DCC892', '#F2E4BC', '#E2CE9C', '#D4BE86'][(v >>> 4) % 4], c);
    }
    for (let i = 0; i < 26; i++) {
      const v = hash(i, x + 5);
      R(x + v % w, y + 60 + (v >>> 9) % (h - 60), 2, 1, (v >>> 3) % 2 ? '#F6EEE0' : '#E8B8A8', c);
    }
    const [s0, s1] = look.sea || [y, y];
    if (s1 > s0) {
      // mar: faixas de azul do fundo para a beira, com a espuma ondulada
      Gfx.dither(c, x, s0, w, s1 - s0, ['#2E7FB8', '#3A9CCB', '#58B8D8', '#7CCFE0'], 3);
      for (let k = 0; k < w; k += 3) {
        const v = hash(k + x, 77) % 4;
        R(x + k, s0 + 6 + (k * 7) % (s1 - s0 - 10), 2, 1, '#9ADCEA', c);
        R(x + k, s1 - 3 + (v > 1 ? 1 : 0), 3, 1, '#F2FAFF', c);
      }
      // areia molhada
      R(x, s1, w, 4, '#C8B07A', c);
      R(x, s1 + 4, w, 2, '#D8C08C', c);
    }
  };

  // céu de verão em faixas pontilhadas, o morro verde e o mar lá longe
  WALLS.beachSky = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h - 10, ['#8CC8F0', '#A8D8F6', '#C8E8FA'], 3);
    ell(c, x + w - 210, 6, 240, 60, '#4E9A4A');
    ell(c, x + w - 190, 8, 200, 50, '#5DAA52');
    for (let i = 0; i < 40; i++) {
      const v = hash(i, x + 3);
      ell(c, x + w - 200 + v % 190, 10 + (v >>> 8) % 18, 10, 7, (v >>> 3) % 2 ? '#3E8A3E' : '#6CB85E');
    }
    ell(c, x + 20, 8, 46, 10, '#FFFFFF');
    ell(c, x + 50, 4, 30, 10, '#FFFFFF');
    R(x, h - 10, w, 10, '#2E7FB8', c);
    R(x, h - 10, w, 1, '#B8E4F4', c);
  };

  // pedras nas pontas da praia, com a passagem na areia
  EDGES.beachRocks = (c, x, top, gap, side) => {
    const segs = gap ? [[top, gap[0]], [gap[1], 192]] : [[top, 192]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y += 9) {
        const v = hash(y, x);
        ell(c, x - 4 + v % 3, y, 12, 11, '#8A8478');
        ell(c, x - 3 + v % 3, y, 9, 8, '#A8A296');
        R(x + v % 3, y + 2, 3, 1, '#C8C2B6', c);
      }
    });
  };

  // posto de salva-vidas: cadeira alta de madeira com guarda-sol vermelho (tapa a visão)
  props.lifeguard = {
    size: () => [30, 52],
    solid: () => [4, 40, 22, 10],
    sight: () => [4, 14, 22, 36],
    base: 50,
    draw(c) {
      shadowRect(c, 4, 46, 26, 5, 0.3);
      R(6, 18, 3, 32, '#B08458', c); R(21, 18, 3, 32, '#B08458', c);
      for (let k = 22; k < 48; k += 7) R(6, k, 18, 2, '#8A6440', c);
      R(4, 16, 22, 6, '#F4F0E6', c);
      R(4, 16, 22, 2, '#D8443A', c);
      ell(c, 0, 0, 30, 14, '#D8443A');
      ell(c, 3, 1, 12, 8, '#F07060');
      R(14, 6, 2, 12, '#F4F0E6', c);
    }
  };

  // barraca de praia (tenda listrada) — tapa a visão
  props.beachTent = {
    size: () => [40, 30],
    solid: () => [2, 14, 36, 14],
    sight: () => [2, 4, 36, 24],
    base: 28,
    draw(c, p) {
      const cols = p.blue ? ['#3A78C8', '#F4F0E6'] : ['#E8823A', '#F4F0E6'];
      shadowRect(c, 4, 24, 38, 6, 0.3);
      for (let j = 0; j < 24; j++) {
        const half = Math.round(4 + j * 0.7);
        for (let i = -half; i < half; i++) R(20 + i, 4 + j, 1, 1, cols[Math.floor((i + 40) / 5) % 2], c);
      }
      R(16, 18, 8, 10, '#3A2A2A', c);
      R(19, 1, 2, 4, '#8A6440', c);
    }
  };

  // guarda-sol aberto (a lona tapa a visão de quem passa embaixo)
  props.umbrella = {
    size: () => [34, 36],
    solid: () => [15, 30, 4, 4],
    sight: () => [3, 2, 28, 14],
    base: 34,
    draw(c, p) {
      const col = p.color || '#F2C14E';
      alpha(c, 0.3, () => ell(c, 4, 26, 30, 9, '#140F1E'));
      R(16, 10, 2, 24, '#E8E0D0', c);
      ell(c, 0, 0, 34, 16, col);
      for (let k = 0; k < 4; k++) R(4 + k * 8, 4, 3, 9, '#FFFFFF', c);
      ell(c, 2, 1, 30, 6, '#FFFFFF40');
    }
  };

  // boia redonda na areia
  props.floatRing = {
    size: () => [16, 12],
    solid: () => [1, 3, 14, 8],
    base: 10,
    draw(c, p) {
      alpha(c, 0.3, () => ell(c, 1, 4, 16, 8, '#140F1E'));
      ell(c, 0, 0, 16, 10, p.color || '#F07A9A');
      ell(c, 5, 3, 6, 4, '#EAD7A8');
      R(3, 2, 2, 2, '#FFFFFF', c); R(11, 6, 2, 2, '#FFFFFF', c);
    }
  };

  // canga estendida na areia
  props.beachTowel = {
    layer: 'back',
    size: () => [22, 30],
    draw(c, p) {
      const a = p.color || '#5DA8D8';
      R(0, 0, 22, 30, a, c);
      for (let k = 2; k < 30; k += 6) R(0, k, 22, 2, '#FFFFFF', c);
    }
  };

  // cadeira de praia de lona, de costas (a pessoa senta virada para o mar)
  props.beachChair = {
    size: () => [18, 26],
    solid: () => [1, 14, 16, 10],
    base: 22,
    draw(c, p) {
      const col = p.color || '#3A78C8';
      shadowRect(c, 2, 22, 16, 4, 0.3);
      R(1, 6, 16, 16, '#C8A070', c);
      R(2, 7, 14, 14, col, c);
      for (let k = 3; k < 16; k += 4) R(k, 7, 2, 14, '#FFFFFF', c);
      R(1, 21, 2, 4, '#8A6440', c); R(15, 21, 2, 4, '#8A6440', c);
    }
  };

  // barraca de praia (umi-no-ie): balcão com toldo listrado, cardápio e as raspadinhas
  props.beachHut = {
    size: () => [80, 44],
    solid: () => [0, 18, 80, 18],
    sight: () => [0, 0, 80, 36],
    base: 42,
    draw(c, p) {
      shadowRect(c, 3, 38, 80, 6, 0.35);
      R(0, 16, 80, 24, '#C8945A', c);
      for (let k = 0; k < 80; k += 8) R(k, 16, 1, 24, '#A8743E', c);
      R(4, 22, 72, 12, '#5A3A22', c);
      // raspadinhas e garrafas no balcão
      [[10, '#F07A9A'], [20, '#7FD0E0'], [30, '#F2E040'], [40, '#F07A9A']].forEach(([x, col]) => { R(x, 18, 6, 4, '#FFFFFF', c); R(x + 1, 15, 4, 4, col, c); });
      R(54, 14, 18, 8, '#F4F0E6', c);
      R(56, 16, 14, 1, '#D8443A', c); R(56, 18, 10, 1, '#5A6A8A', c);
      // toldo listrado
      for (let k = 0; k < 80; k += 8) {
        R(k, 0, 8, 12, (k / 8) % 2 ? (p.color || '#3A78C8') : '#F4F0E6', c);
        ell(c, k, 9, 8, 5, (k / 8) % 2 ? (p.color || '#3A78C8') : '#F4F0E6');
      }
      R(0, 0, 80, 1, '#FFFFFF', c);
    }
  };

  // respingos de água em volta de quem brinca no mar (fica no chão, animado)
  props.splash = {
    hidden: true,
    size: () => [1, 1],
    fxLayer: 'top',
    fx(ctx, p, world) {
      for (let k = 0; k < 6; k++) {
        const ph = (world.t * 1.6 + k / 6) % 1;
        const ang = k * 1.05 + Math.floor(world.t * 1.6 + k / 6) * 2.1;
        const x = Math.round(p.x + Math.cos(ang) * (6 + ph * 10)), y = Math.round(p.y - ph * 10 + ph * ph * 14);
        ctx.globalAlpha = 1 - ph;
        Gfx.rect(x, y, 2, 2, k % 2 ? '#FFFFFF' : '#BEE8F8');
      }
      ctx.globalAlpha = 1;
    }
  };

  // ======================================================================
  //  B · o cinema (F2 B1 saguão com a fila, F2 B2 balcão de pipoca)
  // ======================================================================

  // carpete vinho com losangos dourados
  FLOORS.cinema = (c, x, y, w, h) => {
    R(x, y, w, h, '#5A1E2E', c);
    for (let j = 0; j < h; j += 12) {
      for (let i = (j / 12) % 2 ? 6 : 0; i < w; i += 12) {
        R(x + i + 5, y + j + 3, 2, 1, '#B8862A', c);
        R(x + i + 4, y + j + 4, 4, 1, '#8A5A2A', c);
        R(x + i + 5, y + j + 5, 2, 1, '#B8862A', c);
      }
    }
    for (let i = 0; i < w * h / 14; i++) {
      const v = hash(i, x + 23);
      R(x + v % w, y + (v >>> 9) % h, 1, 1, '#4A1626', c);
    }
  };

  // parede escura do saguão, com friso dourado e luzinhas
  WALLS.cinema = (c, x, w, h) => {
    R(x, 0, w, h, '#1E1A2E', c);
    for (let k = x; k < x + w; k += 6) R(k, 0, 3, h - 10, '#241F36', c);
    R(x, 0, w, 3, '#0E0C18', c);
    for (let k = x + 8; k < x + w; k += 16) { R(k, 4, 2, 2, '#FFE8A0', c); glow(c, k - 3, 2, 8, 6, '#FFF4C8', (i, j) => Math.max(0, 0.6 - Math.hypot(i - 4, j - 3) / 4)); }
    R(x, h - 10, w, 2, '#B8862A', c);
    R(x, h - 8, w, 7, '#3A2030', c);
    R(x, h - 1, w, 1, '#0E0C18', c);
  };
  EDGES.cinema = (c, x, top, gap, side) => {
    const segs = gap ? [[top - 8, gap[0]], [gap[1], 192]] : [[top - 8, 192]];
    segs.forEach(([a, b]) => { R(x, a, 4, b - a, '#2A2440', c); R(side === 'left' ? x + 3 : x, a, 1, b - a, '#0E0C18', c); });
    if (gap) glow(c, side === 'left' ? x : x - 8, gap[0] + 2, 12, gap[1] - gap[0] - 4, '#F2C14E', i => 0.4 * (side === 'left' ? 1 - i / 12 : i / 12));
  };

  // pôster de cinema genérico na parede (p.art: 0 céu com espada, 1 mar e lua, 2 floresta com
  // personagem genérico de costas, 3 explosão de cores) — nenhuma arte de filme real
  props.poster = {
    layer: 'back',
    size: () => [28, 40],
    draw(c, p) {
      R(0, 0, 28, 40, '#B8862A', c);
      R(1, 1, 26, 38, '#E8C46A', c);
      const a = p.art || 0, X = 3, Y = 3, W = 22, H = 30;
      if (a === 0) { Gfx.dither(c, X, Y, W, H, ['#2A2858', '#6A3A8A', '#E87A5A'], 3); R(X + 10, Y + 4, 2, 20, '#E8ECF2', c); R(X + 7, Y + 22, 8, 2, '#8A5A2A', c); }
      if (a === 1) { Gfx.dither(c, X, Y, W, H, ['#0E1A3A', '#1E3A6A', '#2E6A8A'], 3); ell(c, X + 12, Y + 4, 7, 7, '#F2E8C8'); for (let k = 0; k < W; k += 3) R(X + k, Y + 22 + (k % 2), 2, 1, '#8AC8E0', c); }
      if (a === 2) { Gfx.dither(c, X, Y, W, H, ['#1E3A2A', '#2E5A3A', '#5A8A4A'], 3); R(X + 9, Y + 12, 4, 6, '#2A2830', c); R(X + 9, Y + 18, 4, 10, '#C8323A', c); R(X + 7, Y + 9, 8, 4, '#1E1C22', c); }
      if (a === 3) { Gfx.dither(c, X, Y, W, H, ['#F2C14E', '#E86A3A', '#8A2A5A'], 3); for (let k = 0; k < 6; k++) R(X + 11, Y + 15, 1 + k, 1, '#FFFFFF', c); }
      R(X, Y + H - 2, W, 4, '#1E1A2E', c);
      R(X + 2, Y + H - 1, W - 6, 1, '#E8E0D0', c);
    }
  };

  // corda de fila entre dois postes dourados (p.w comprimento na horizontal; p.v = vertical)
  props.ropeLine = {
    size: p => (p.v ? [6, p.h || 40] : [p.w || 60, 12]),
    solid: p => (p.v ? [1, 4, 4, (p.h || 40) - 2] : [0, 6, p.w || 60, 4]),
    base: p => (p.v ? (p.h || 40) : 10),
    draw(c, p) {
      if (p.v) {
        const h = p.h || 40;
        for (let k = 0; k <= h - 10; k += h - 10) { R(1, k, 4, 10, '#C9A24A', c); R(1, k, 4, 1, '#F2D27A', c); }
        for (let y = 8; y < h - 4; y++) R(2 + Math.round(Math.sin(y / (h - 12) * Math.PI) * 1), y, 2, 1, '#B8323A', c);
        return;
      }
      const w = p.w || 60;
      [0, w - 4].forEach(x => { R(x, 0, 4, 11, '#C9A24A', c); R(x, 0, 4, 1, '#F2D27A', c); R(x - 1, 10, 6, 2, '#8A6A2A', c); });
      for (let x = 4; x < w - 4; x++) R(x, 3 + Math.round(Math.sin((x - 4) / (w - 8) * Math.PI) * 2), 1, 2, '#B8323A', c);
    }
  };

  // bilheteria: guichê com duas janelinhas iluminadas e a placa (texto do config)
  props.ticketBooth = {
    size: () => [70, 50],
    solid: () => [0, 22, 70, 26],
    sight: () => [0, 6, 70, 42],
    base: 48,
    draw(c, p) {
      shadowRect(c, 2, 44, 70, 6, 0.35);
      R(0, 6, 70, 42, '#3A2440', c);
      R(0, 6, 70, 2, '#5A3A60', c);
      [6, 38].forEach(x => {
        R(x, 14, 26, 18, '#1E1A2E', c);
        R(x + 1, 15, 24, 16, '#F2E8C8', c);
        glow(c, x + 1, 15, 24, 16, '#FFFFFF', (i, j) => 0.4 - j / 40);
        R(x + 8, 22, 10, 9, '#5A6A8A', c);
        R(x + 10, 18, 6, 5, '#F0CDB0', c);
      });
      R(0, 34, 70, 4, '#B8862A', c);
      R(10, 0, 50, 8, '#B8862A', c);
      R(11, 1, 48, 6, '#1E1A2E', c);
      Gfx.text(p.text || '', 35, 0, '#F2C14E', { ctx: c, align: 'center' });
    }
  };

  // balcão de pipoca e bebidas, com a máquina de pipoca em cima (F2 B2)
  props.popcornCounter = {
    size: p => [p.w || 150, 46],
    solid: p => [0, 20, p.w || 150, 24],
    sight: p => [0, 14, p.w || 150, 28],
    base: 44,
    draw(c, p) {
      const w = p.w || 150;
      shadowRect(c, 2, 40, w, 6, 0.35);
      R(0, 20, w, 22, '#B8323A', c);
      R(0, 20, w, 3, '#F4F0E6', c);
      for (let k = 6; k < w; k += 18) R(k, 26, 10, 12, '#C84A4A', c);
      R(0, 40, w, 2, '#6A1A22', c);
      // máquina de pipoca: vitrine vermelha com a pipoca estourando
      R(10, 0, 30, 22, '#D8443A', c);
      R(12, 3, 26, 15, '#F8F0D8', c);
      for (let i = 0; i < 40; i++) { const v = hash(i, 4); R(13 + v % 24, 8 + (v >>> 5) % 10, 2, 2, (v >>> 3) % 3 ? '#FFF4C8' : '#F2D27A', c); }
      R(10, 0, 30, 3, '#F2C14E', c);
      // copos de bebida e baldes de pipoca
      [[56, '#4A78C8'], [66, '#D8443A'], [76, '#5DAA62']].forEach(([x, col]) => { R(x, 12, 7, 9, col, c); R(x, 12, 7, 2, '#F4F0E6', c); R(x + 4, 8, 1, 4, '#F4F0E6', c); });
      [[96], [110]].forEach(([x]) => { R(x, 10, 10, 11, '#F4F0E6', c); for (let k = 0; k < 10; k += 3) R(x + k, 10, 1, 11, '#D8443A', c); R(x, 7, 10, 4, '#FFF4C8', c); });
      if (w > 130) { R(124, 6, 20, 15, '#2A2E36', c); R(126, 8, 16, 8, '#5DA8C8', c); }
    }
  };

  // painel de cardápio da lanchonete do cinema (na parede)
  props.cinemaMenu = {
    layer: 'back',
    size: () => [60, 22],
    draw(c) {
      R(0, 0, 60, 22, '#0E0C18', c);
      R(1, 1, 58, 20, '#1E1A2E', c);
      [[4, '#F2D27A'], [22, '#D8443A'], [40, '#4A78C8']].forEach(([x, col]) => { R(x, 4, 14, 10, col, c); R(x + 2, 16, 10, 1, '#E8E0D0', c); R(x + 2, 18, 7, 1, '#8A8478', c); });
    }
  };

  // mesinha redonda com dois banquinhos
  props.cafeTable = {
    size: () => [30, 26],
    solid: () => [4, 10, 22, 12],
    base: 22,
    draw(c) {
      shadowRect(c, 4, 20, 26, 5, 0.3);
      ell(c, 0, 12, 8, 6, '#3A3650'); ell(c, 22, 12, 8, 6, '#3A3650');
      ell(c, 6, 6, 18, 12, '#2A2E36');
      ell(c, 7, 6, 16, 9, '#5A6070');
      R(12, 8, 4, 3, '#F4F0E6', c);
    }
  };

  // lixeira
  props.bin = {
    size: () => [10, 16],
    solid: () => [0, 8, 10, 7],
    base: 15,
    draw(c) {
      shadowRect(c, 1, 13, 10, 3, 0.3);
      R(0, 2, 10, 13, '#5A6070', c);
      R(0, 2, 10, 2, '#8A929E', c);
      R(3, 6, 4, 6, '#3A3F4A', c);
    }
  };

  // ======================================================================
  //  C1 · o apartamento visto de cima (Apêndice C e a planta): banheiro e lavabo em cima à
  //  esquerda, a cozinha (DK) no meio, o genkan em cima à direita, os dois quartos embaixo e a
  //  varanda. Pisos por cômodo (floorZone) e paredes internas (wall), que tapam a visão.
  // ======================================================================

  // o "chão" de fora do apartamento: a parede externa vista de cima
  FLOORS.aptOutside = (c, x, y, w, h) => R(x, y, w, h, '#C8C0B0', c);
  WALLS.aptTop = (c, x, w, h) => {
    R(x, 0, w, h, '#3A3440', c);
    R(x, h - 6, w, 6, '#F2EEE6', c);
    R(x, h - 6, w, 1, '#FFFFFF', c);
    R(x, h - 1, w, 1, '#8A8478', c);
  };
  EDGES.aptWall = (c, x, top, gap, side) => {
    const segs = gap ? [[top - 6, gap[0]], [gap[1], 192]] : [[top - 6, 192]];
    segs.forEach(([a, b]) => { R(x, a, 4, b - a, '#F2EEE6', c); R(side === 'left' ? x + 3 : x, a, 1, b - a, '#8A8478', c); });
  };

  // piso de um cômodo: madeira clara (quartos e cozinha), azulejo (banheiro), genkan, varanda
  props.floorZone = {
    layer: 'back',
    size: p => [p.w, p.h],
    draw(c, p) {
      const { w, h } = p, st = p.style || 'wood';
      if (st === 'wood') {
        Scenery.planks(c, 0, 0, w, h, { tones: [['#E2C28E', '#D6B27E', '#C8A06C'], ['#E8CA98', '#DCBA86', '#CCA872'], ['#DEBC88', '#D0AC78', '#C29C66']], seam: '#A07E52', grain: '#B8945E' }, (p.x | 0) + 3);
      } else if (st === 'tile') {
        for (let j = 0; j < h; j += 8) for (let i = 0; i < w; i += 8) { R(i, j, 8, 8, '#DCE6EA', c); R(i, j, 8, 1, '#C0CCD2', c); R(i, j, 1, 8, '#C0CCD2', c); }
      } else if (st === 'genkan') {
        for (let j = 0; j < h; j += 10) for (let i = 0; i < w; i += 10) { R(i, j, 10, 10, (i + j) % 20 ? '#8A8478' : '#9A948A', c); R(i, j, 10, 1, '#6A645A', c); }
      } else if (st === 'veranda') {
        R(0, 0, w, h, '#A8A4A0', c);
        for (let i = 0; i < w; i += 14) R(i, 0, 1, h, '#8E8A86', c);
        R(0, h - 4, w, 4, '#5E5A60', c);
        for (let i = 2; i < w; i += 6) R(i, h - 10, 1, 6, '#5E5A60', c);
        R(0, h - 10, w, 1, '#5E5A60', c);
      }
    }
  };

  // parede interna vista de cima (p.w × p.h); as horizontais mostram a face da frente com o
  // rodameio de madeira escura
  props.wall = {
    size: p => [p.w, p.h + (p.w > p.h ? 6 : 0)],
    solid: p => [0, 0, p.w, p.h + (p.w > p.h ? 4 : 0)],
    sight: p => [0, 0, p.w, p.h + (p.w > p.h ? 4 : 0)],
    base: p => p.h + (p.w > p.h ? 6 : 0),
    draw(c, p) {
      const { w, h } = p;
      R(0, 0, w, h, '#F6F2EA', c);
      R(0, 0, w, 1, '#FFFFFF', c);
      R(0, h - 1, w, 1, '#C8C0B0', c);
      R(0, 0, 1, h, '#D8D0C0', c);
      R(w - 1, 0, 1, h, '#C8C0B0', c);
      if (w > h) {
        R(0, h, w, 4, '#E8E2D6', c);
        R(0, h + 4, w, 2, '#5E3A20', c);
      }
    }
  };

  // porta de correr de vidro da varanda (fechada) e cortina azul, numa parede horizontal
  props.glassDoor = {
    size: p => [p.w || 40, 10],
    solid: p => [0, 0, p.w || 40, 8],
    sight: p => [0, 0, p.w || 40, 8],
    base: 10,
    draw(c, p) {
      const w = p.w || 40;
      R(0, 0, w, 8, '#B8D8E8', c);
      R(0, 0, w, 1, '#E8F4FA', c);
      R(w / 2, 0, 1, 8, '#8A929E', c);
      R(0, 0, 6, 10, '#3A64B0', c);
      R(w - 6, 0, 6, 10, '#3A64B0', c);
      R(0, 8, w, 2, '#8A929E', c);
    }
  };

  // colchão azul no chão com travesseiros azul-claros (o Fabio deita por cima)
  props.futon = {
    size: () => [64, 34],
    solid: () => [0, 4, 64, 28],
    base: 6,
    draw(c) {
      shadowRect(c, 2, 4, 64, 30, 0.25);
      R(0, 2, 64, 30, '#2E4AA8', c);
      R(0, 2, 64, 2, '#4A68C8', c);
      R(0, 30, 64, 2, '#1E3478', c);
      R(4, 6, 12, 22, '#9AB4EC', c);
      R(5, 7, 10, 4, '#C0D2F6', c);
    }
  };

  // banheira, vaso e pia (banheiro e lavabo)
  props.bathtub = {
    size: () => [40, 26],
    solid: () => [0, 0, 40, 24],
    base: 24,
    draw(c) {
      R(0, 0, 40, 24, '#F4F6F8', c);
      R(3, 3, 34, 18, '#9ADCEA', c);
      R(3, 3, 34, 3, '#C8EEF6', c);
      R(30, 1, 6, 2, '#C9CED6', c);
    }
  };
  props.toilet = {
    size: () => [16, 20],
    solid: () => [1, 2, 14, 16],
    base: 18,
    draw(c) {
      R(2, 0, 12, 6, '#F4F6F8', c);
      ell(c, 1, 5, 14, 14, '#F4F6F8');
      ell(c, 4, 8, 8, 8, '#C8E0EA');
      R(2, 0, 12, 1, '#FFFFFF', c);
    }
  };
  props.washbasin = {
    size: () => [18, 14],
    solid: () => [0, 0, 18, 12],
    base: 12,
    draw(c) {
      R(0, 0, 18, 12, '#F4F6F8', c);
      ell(c, 3, 2, 12, 8, '#C8E0EA');
      R(8, 0, 2, 3, '#C9CED6', c);
    }
  };

  // bancada da cozinha (pia e fogão), geladeira pequena prateada com micro-ondas em cima
  props.kitchenCounter = {
    size: p => [p.w || 70, 18],
    solid: p => [0, 0, p.w || 70, 16],
    base: 16,
    draw(c, p) {
      const w = p.w || 70;
      R(0, 0, w, 16, '#5E3A20', c);
      R(0, 0, w, 10, '#E8E2D6', c);
      R(0, 0, w, 1, '#FFFFFF', c);
      R(6, 2, 16, 7, '#C9CED6', c); R(8, 3, 12, 5, '#9AA4B0', c);
      R(30, 2, 18, 7, '#2A2830', c); ell(c, 32, 3, 6, 5, '#5E5A60'); ell(c, 40, 3, 6, 5, '#5E5A60');
      R(54, 3, 6, 5, '#F2F0EA', c); R(55, 1, 4, 2, '#C88A5A', c);
    }
  };
  props.fridge = {
    size: () => [18, 30],
    solid: () => [0, 10, 18, 18],
    sight: () => [0, 0, 18, 28],
    base: 28,
    draw(c) {
      shadowRect(c, 2, 26, 18, 4, 0.3);
      R(0, 0, 18, 9, '#3A3640', c); R(2, 2, 10, 5, '#1E1C22', c); R(14, 3, 2, 3, '#8A929E', c);
      R(0, 9, 18, 19, '#C9CED6', c); R(0, 9, 18, 1, '#E8ECF2', c); R(0, 17, 18, 1, '#8A929E', c);
      R(14, 12, 1, 4, '#5E6470', c); R(14, 20, 1, 5, '#5E6470', c);
    }
  };

  // mesa de jantar de madeira escura com quatro cadeiras (assento e encosto creme), vista de cima
  props.diningSet = {
    size: () => [52, 44],
    solid: () => [6, 10, 40, 26],
    base: 36,
    draw(c) {
      shadowRect(c, 6, 34, 42, 5, 0.3);
      [[10, 0], [30, 0]].forEach(([x, y]) => { R(x, y, 12, 9, '#4A2E1E', c); R(x + 1, y + 1, 10, 6, '#EFE0BC', c); });
      R(6, 10, 40, 24, '#5A3622', c);
      R(6, 10, 40, 2, '#7A4E32', c);
      R(6, 32, 40, 2, '#3A2214', c);
      R(14, 16, 8, 6, '#F4F0E6', c); R(30, 18, 6, 5, '#F2F0EA', c);
      [[10, 34], [30, 34]].forEach(([x, y]) => { R(x, y, 12, 9, '#4A2E1E', c); R(x + 1, y, 10, 5, '#EFE0BC', c); });
    }
  };

  // armário de sapatos do genkan
  props.shoeRack = {
    size: () => [14, 30],
    solid: () => [0, 0, 14, 28],
    base: 28,
    draw(c) {
      R(0, 0, 14, 28, '#6A4228', c);
      R(0, 0, 14, 2, '#8A5A32', c);
      R(6, 3, 1, 22, '#4A2A16', c);
    }
  };

  // ======================================================================
  //  C2 · Brazilian Day: parque com barracas de comida brasileira, bandeirinhas verdes e amarelas
  // ======================================================================

  // grama pisada com trechos de terra
  FLOORS.festival = (c, x, y, w, h) => {
    R(x, y, w, h, '#7CB85A', c);
    for (let i = 0; i < w * h / 10; i++) {
      const v = hash(i, x + 31), px = x + v % w, py = y + (v >>> 9) % h;
      R(px, py, 1, (v >>> 4) % 3 ? 1 : 2, ['#6AA84A', '#8CC86A', '#5E9A42', '#A0D07A'][(v >>> 6) % 4], c);
    }
    for (let i = 0; i < 9; i++) {
      const v = hash(i, x + 8);
      ell(c, x + v % (w - 60), y + 20 + (v >>> 9) % (h - 50), 40 + v % 30, 14 + (v >>> 5) % 10, '#B89A6A');
    }
  };
  // céu e copas de árvores atrás das barracas
  WALLS.festivalSky = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h, ['#9AD0F2', '#B8E0F8', '#D8EEFA'], 3);
    for (let k = -10; k < w + 10; k += 22) {
      const v = hash(k, x + 4) % 8;
      ell(c, x + k, h - 18 - v, 36, 26, '#3E8A3E');
      ell(c, x + k + 4, h - 20 - v, 22, 14, '#5DAA52');
    }
  };

  // barraca de comida brasileira com toldo verde (e listra amarela); tapa a visão
  props.stall = {
    size: () => [64, 46],
    solid: () => [0, 22, 64, 20],
    sight: () => [0, 6, 64, 36],
    base: 42,
    draw(c, p) {
      shadowRect(c, 3, 38, 64, 6, 0.35);
      R(0, 22, 64, 20, '#E8E2D6', c);
      R(0, 22, 64, 2, '#FFFFFF', c);
      R(4, 26, 56, 8, '#B88A5A', c);
      const k = p.food || 0;
      if (k === 0) for (let i = 0; i < 4; i++) { R(8 + i * 13, 25, 2, 9, '#8A929E', c); R(6 + i * 13, 26, 6, 4, '#8A4A2A', c); }   // espetinhos
      if (k === 1) for (let i = 0; i < 5; i++) ell(c, 7 + i * 11, 26, 8, 6, '#F2D27A');                                                 // pão de queijo
      if (k === 2) for (let i = 0; i < 5; i++) { R(8 + i * 11, 24, 6, 9, '#2E8A4A', c); R(9 + i * 11, 22, 4, 2, '#F2D02A', c); }    // latinhas
      R(0, 6, 64, 14, '#2E8A4A', c);
      for (let i = 0; i < 64; i += 8) { R(i, 6, 4, 14, '#3AA05A', c); ell(c, i, 16, 8, 6, (i / 8) % 2 ? '#2E8A4A' : '#3AA05A'); }
      R(0, 6, 64, 2, '#F2D02A', c);
      R(2, 0, 3, 24, '#8A6440', c); R(59, 0, 3, 24, '#8A6440', c);
      R(10, 34, 44, 6, '#F4F0E6', c);
      Gfx.text(p.text || '', 32, 34, '#2E8A4A', { ctx: c, align: 'center' });
    }
  };

  // árvore grande com sombra (a copa fica por cima de quem passa embaixo do tronco)
  props.bigTree = {
    size: () => [96, 84],
    solid: () => [40, 62, 16, 14],
    sight: () => [40, 52, 16, 26],
    base: 76,
    draw(c) {
      alpha(c, 0.28, () => ell(c, 4, 52, 96, 32, '#140F1E'));
      R(42, 44, 12, 34, '#6A4428', c); R(42, 44, 4, 34, '#8A5A36', c);
      ell(c, 0, 0, 96, 58, '#2E6A34');
      ell(c, 6, 2, 60, 38, '#3E8A3E');
      ell(c, 40, 6, 50, 34, '#4A9A46');
      for (let i = 0; i < 40; i++) { const v = hash(i, 9); R(8 + v % 80, 4 + (v >>> 7) % 44, 3, 2, (v >>> 3) % 2 ? '#5DAA52' : '#2A5E30', c); }
    }
  };

  // bandeirinhas verdes e amarelas em varais, por cima de tudo (p.w de comprimento)
  props.bunting = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p) {
      const w = p.w || 200;
      for (let i = 0; i <= w; i += 2) Gfx.rect(p.x + i, Math.round(p.y + Math.sin(i / w * Math.PI) * 6), 2, 1, '#5E5A60');
      for (let i = 4; i < w; i += 10) {
        const y = Math.round(p.y + Math.sin(i / w * Math.PI) * 6) + 1;
        const col = (i / 10) % 2 < 1 ? '#2EA35A' : '#F2D02A';
        for (let j = 0; j < 5; j++) Gfx.rect(p.x + i - 2 + Math.ceil(j / 2), y + j, 5 - Math.ceil(j / 2) * 2 + (j === 0 ? 0 : 0), 1, col);
      }
    }
  };
})();
