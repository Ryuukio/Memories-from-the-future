// Fase 1 (16/08/2025), do F1 A2 ao F1 C2: pisos, paredes e objetos. A luz vai da tarde
// ensolarada (parque da Mirai Tower, café) até a noite (planetário, Saizeriya, parque do beijo).
// O F1 A1 (restaurante de okonomiyaki) está em scenery.js.
(() => {
  const { R, hash, glow, alpha, props, FLOORS, WALLS, EDGES, woodEdge } = Scenery;

  // elipse cheia, linha a linha (camas, nuvens, copas)
  function ell(c, x, y, w, h, color) {
    for (let j = 0; j < h; j++) {
      const dy = (j + 0.5 - h / 2) / (h / 2);
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) R(x0, y + j, x1 - x0, 1, color, c);
    }
  }

  // pinta pixel a pixel com ImageData (pisos com padrão): fn(x, y) → '#RRGGBB'
  function pixels(c, x, y, w, h, fn) {
    const img = c.createImageData(w, h), d = img.data, memo = {};
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const hex = fn(x + i, y + j);
        const rgb = memo[hex] || (memo[hex] = Gfx.rgb(hex));
        const o = (j * w + i) * 4;
        d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = 255;
      }
    }
    c.putImageData(img, x, y);
  }

  const shadowRect = (c, x, y, w, h, a = 0.3) => alpha(c, a, () => R(x, y, w, h, '#140F1E', c));

  // objeto invisível que só ocupa lugar (e, se quiser, tapa a visão)
  props.block = {
    hidden: true,
    size: p => [p.w, p.h],
    solid: p => [0, 0, p.w, p.h],
    sight: p => (p.sight ? [0, 0, p.w, p.h] : null),
    draw() {}
  };

  // ======================================================================
  //  F1 A2 · Ice cream at Mirai Tower — parque em Sakae, tarde de verão
  // ======================================================================

  // grama com tufos e o caminho de pedra (look.path = [y0, y1])
  FLOORS.park = (c, x, y, w, h, look) => {
    R(x, y, w, h, '#6CB84E', c);
    for (let i = 0; i < w * h / 12; i++) {
      const v = hash(i, x + 21), px = x + v % w, py = y + (v >>> 9) % h, k = (v >>> 4) % 9;
      R(px, py, 1, k < 3 ? 2 : 1, k < 3 ? '#5AA642' : k < 6 ? '#7CC45C' : k < 8 ? '#4E9A3C' : '#9AD872', c);
    }
    const [p0, p1] = look.path;
    R(x, p0, w, p1 - p0, '#AE9F84', c);
    const tones = ['#DCD2BA', '#D2C7AC', '#E2D9C4', '#D8CDB2'];
    for (let row = 0, yy = p0 + 1; yy < p1 - 1; row++, yy += 7) {
      let xx = x - (row % 2) * 7, i = 0;
      const hh = Math.min(6, p1 - 1 - yy);
      while (xx < x + w) {
        const sw = 11 + hash(row * 13 + i, 5) % 5;
        R(xx + 1, yy, sw - 1, hh, tones[hash(row + 3, i) % tones.length], c);
        R(xx + 1, yy, sw - 1, 1, '#EEE7D6', c);
        R(xx + 1, yy + hh - 1, sw - 1, 1, '#BFB296', c);
        if (hash(row, i + 77) % 5 === 0) R(xx + 3 + i % 5, yy + 2, 2, 1, '#C8BCA2', c);
        xx += sw;
        i++;
      }
    }
    for (let xx = x; xx < x + w; xx += 2) {
      if (hash(xx, 9) % 3 === 0) R(xx, p0 - 1, 1, 2, '#4E9A3C', c);
      if (hash(xx, 10) % 3 === 0) R(xx, p1 - 1, 1, 2, '#5AA642', c);
    }
  };

  function cloud(c, x, y, w) {
    ell(c, x, y + 5, w, 8, '#D6E4F4');
    ell(c, x + 2, y + 3, w - 4, 8, '#FFFFFF');
    ell(c, x + Math.round(w * 0.18), y, Math.round(w * 0.4), 9, '#FFFFFF');
    ell(c, x + Math.round(w * 0.45), y - 2, Math.round(w * 0.38), 10, '#FFFFFF');
    R(x + 3, y + 10, w - 6, 1, '#C4D6EC', c);
  }

  // Mirai Tower: torre de treliça metálica com mirante, ao fundo
  function miraiTower(c, cx) {
    R(cx, 0, 1, 7, '#E6EAF0', c);
    R(cx, 1, 1, 1, '#E04A3A', c);
    R(cx, 4, 1, 1, '#E04A3A', c);
    R(cx - 2, 7, 5, 5, '#9AA6BA', c);
    R(cx - 1, 7, 3, 5, '#C9D0DC', c);
    R(cx - 9, 12, 19, 5, '#DCE2EA', c);
    R(cx - 9, 12, 19, 1, '#F2F4F8', c);
    R(cx - 8, 14, 17, 1, '#5E6A80', c);
    R(cx - 9, 16, 19, 1, '#9AA6BA', c);
    for (let y = 17; y < 40; y++) {
      const half = 3 + Math.floor((y - 17) * 0.45);
      R(cx - half, y, 1, 1, '#8894A8', c);
      R(cx + half, y, 1, 1, '#8894A8', c);
      const t = ((y - 17) % 7) / 7;
      R(Math.round(cx - half + t * 2 * half), y, 1, 1, '#B8C2D2', c);
      R(Math.round(cx + half - t * 2 * half), y, 1, 1, '#B8C2D2', c);
      if ((y - 17) % 7 === 0) R(cx - half, y, half * 2 + 1, 1, '#A4AEC0', c);
    }
  }

  // céu com sol e nuvens, prédios ao longe, a torre e a fileira de árvores
  WALLS.parkSky = (c, x, w, h) => {
    R(x, 30, w, h - 30, '#2C6A32', c);
    Gfx.dither(c, x, 0, w, 36, ['#4C8EDC', '#6AA8E8', '#94C4F2', '#C4E0FA'], 3);
    glow(c, x + 20, 0, 44, 30, '#FFF6CC', (i, j) => {
      const d = Math.hypot(i - 22, (j - 12) * 1.2) / 22;
      return d < 0.35 ? 1 : d < 1 ? (1 - d) * 0.85 : 0;
    });
    ell(c, x + 35, 5, 14, 14, '#FFF8DC');
    cloud(c, x + 84, 6, 36);
    cloud(c, x + 276, 3, 42);
    cloud(c, x + 334, 14, 26);
    // prédios ao longe
    for (let bx = x - 4, i = 0; bx < x + w; i++) {
      const v = hash(i, x + 41), bw = 10 + v % 14, bh = 6 + (v >>> 5) % 10;
      if (Math.abs(bx + bw / 2 - (x + 192)) > 18) {
        R(bx, 36 - bh, bw, bh, i % 2 ? '#A9BDD9' : '#9EB2D0', c);
        R(bx, 36 - bh, bw, 1, '#C4D4EA', c);
        for (let wy = 38 - bh; wy < 34; wy += 3) for (let wx = bx + 2; wx < bx + bw - 1; wx += 3) R(wx, wy, 1, 1, '#C8D6EA', c);
      }
      bx += bw + 2 + (v >>> 9) % 6;
    }
    miraiTower(c, x + 192);
    // fileira de árvores
    for (let k = -8; k < w + 8; k += 10) {
      const v = hash(k, x + 3), r = 8 + v % 4, ty = 27 + (v >>> 3) % 4;
      ell(c, x + k - r, ty - r + 4, r * 2 + 2, r * 2, '#2F7436');
    }
    for (let k = -8; k < w + 8; k += 10) {
      const v = hash(k, x + 3), r = 8 + v % 4, ty = 27 + (v >>> 3) % 4;
      ell(c, x + k - r + 2, ty - r + 4, r * 2 - 4, r * 2 - 6, '#3E8A3E');
      ell(c, x + k - r + 4, ty - r + 5, r - 1, r - 3, '#56A44C');
    }
    R(x, 40, w, 6, '#2C6A32', c);
    R(x, 45, w, 1, '#24582A', c);
  };

  // fachada do restaurante de okonomiyaki (lado esquerdo do parque), com noren na porta
  EDGES.building = (c, x, top, gap, side) => {
    const wx = side === 'left' ? x : x - 8, W = 12;
    R(wx, 0, W, 192, '#E8D8B2', c);
    for (let i = 0; i < 60; i++) { const v = hash(i, 51); R(wx + v % W, (v >>> 5) % 192, 1, 1, '#D6C296', c); }
    R(wx, 0, W, 4, '#3A2216', c);
    R(side === 'left' ? wx + W - 1 : wx, 0, 1, 192, '#BCA27A', c);
    R(side === 'left' ? wx + W - 2 : wx + 1, 0, 1, 192, '#F6ECD4', c);
    R(wx, 186, W, 6, '#8A7A5E', c);
    if (gap) {
      R(wx, gap[0] - 2, W, gap[1] - gap[0] + 4, '#4A2B1C', c);
      R(wx + 1, gap[0], W - 2, gap[1] - gap[0], '#22140F', c);
      for (let i = 0; i < 3; i++) {
        R(wx + 1 + i * 4, gap[0], 3, 13, '#2D3C70', c);
        R(wx + 1 + i * 4, gap[0] + 6, 3, 1, '#E8ECF6', c);
      }
      // lanterna vermelha acima da porta
      R(wx + 3, gap[0] - 16, 6, 9, '#D8443A', c);
      R(wx + 4, gap[0] - 17, 4, 1, '#1E1826', c);
      R(wx + 4, gap[0] - 7, 4, 1, '#1E1826', c);
      R(wx + 4, gap[0] - 14, 1, 1, '#F07A6A', c);
    }
  };

  // sebe com a passagem
  EDGES.hedge = (c, x, top, gap, side) => {
    const wx = side === 'left' ? x : x - 4;
    const segs = gap ? [[top - 6, gap[0]], [gap[1], 192]] : [[top - 6, 192]];
    segs.forEach(([a, b]) => {
      R(wx, a, 8, b - a, '#2F7436', c);
      for (let y = a; y < b; y += 5) ell(c, wx - 1, y, 10, 7, '#3E8A3E');
      for (let y = a + 2; y < b; y += 5) R(wx + 2, y, 3, 1, '#56A44C', c);
    });
  };

  props.parkLamp = {
    size: () => [10, 46],
    solid: () => [3, 41, 4, 4],
    base: 45,
    draw(c, p) {
      shadowRect(c, 3, 43, 8, 2, 0.3);
      R(4, 9, 2, 33, '#3A3E48', c);
      R(4, 9, 1, 33, '#5A606E', c);
      R(2, 41, 6, 3, '#2A2E36', c);
      R(1, 0, 8, 2, '#3A3E48', c);
      R(2, 2, 6, 6, p.night ? '#FFE8A0' : '#F2F2EA', c);
      R(2, 2, 2, 6, p.night ? '#FFF6D0' : '#FFFFFF', c);
      R(1, 8, 8, 1, '#3A3E48', c);
    },
    // mosquitos em volta da lâmpada (F1 C2)
    fx(ctx, p, world) {
      if (!p.bugs) return;
      for (let i = 0; i < 5; i++) {
        const a = world.t * (2 + i * 0.7) + i * 1.9;
        Gfx.rect(Math.round(p.x + 5 + Math.cos(a) * (6 + i % 3 * 2)), Math.round(p.y + 4 + Math.sin(a * 1.3) * 5), 1, 1, '#2A2030');
      }
    }
  };

  props.vending = {
    size: () => [26, 42],
    solid: () => [1, 32, 24, 9],
    sight: () => [1, 6, 24, 35],
    base: 41,
    draw(c) {
      shadowRect(c, 2, 39, 26, 3, 0.35);
      R(0, 0, 26, 40, '#A82830', c);
      R(1, 0, 24, 4, '#E85A5A', c);
      R(1, 4, 24, 35, '#D8343A', c);
      R(1, 4, 1, 35, '#F06A64', c);
      R(23, 4, 2, 35, '#B02A32', c);
      // vitrine das bebidas
      R(3, 7, 18, 14, '#F4F4EE', c);
      const cans = ['#3A6ED8', '#E8B23A', '#5DAA62', '#D8443A', '#F2F2F2', '#8A5A3A'];
      for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) {
        R(4 + k * 3, 8 + r * 4, 2, 3, cans[(k + r * 2) % cans.length], c);
        R(4 + k * 3, 8 + r * 4, 1, 1, '#FFFFFF', c);
      }
      R(3, 23, 18, 1, '#A82830', c);
      for (let k = 0; k < 6; k++) R(4 + k * 3, 24, 2, 1, '#F2E07A', c);
      R(19, 27, 3, 4, '#2A2030', c);
      R(4, 33, 16, 4, '#2A2030', c);
      R(4, 33, 16, 1, '#4A4458', c);
    }
  };

  // banco de praça. p.view: 'back' (visto de trás: o encosto fica na frente das pessoas)
  // ou 'front' (de frente: o encosto fica atrás delas)
  props.parkBench = {
    size: () => [60, 30],
    solid: p => (p.view === 'front' ? [2, 2, 56, 14] : [2, 6, 56, 18]),
    // de trás, o banco vem depois de quem está sentado; de frente, antes
    base: p => (p.view === 'front' ? 4 : 28),
    draw(c, p) {
      const wood = p.night ? ['#8A6440', '#6E4E32', '#A47C52'] : ['#B07A44', '#8A5A30', '#CC965A'];
      const iron = '#2E3038';
      if (p.view === 'front') {
        shadowRect(c, 3, 20, 56, 4, 0.3);
        for (let k = 0; k < 3; k++) {
          R(2, 2 + k * 4, 56, 3, wood[0], c);
          R(2, 2 + k * 4, 56, 1, wood[2], c);
        }
        R(2, 14, 56, 4, wood[1], c);
        R(2, 14, 56, 1, wood[2], c);
        R(4, 1, 2, 22, iron, c);
        R(54, 1, 2, 22, iron, c);
      } else {
        shadowRect(c, 4, 26, 58, 4, 0.35);
        R(2, 8, 56, 5, wood[1], c);
        R(2, 8, 56, 1, wood[2], c);
        for (let k = 0; k < 2; k++) {
          R(2, 14 + k * 4, 56, 3, wood[0], c);
          R(2, 14 + k * 4, 56, 1, wood[2], c);
          R(2, 16 + k * 4, 56, 1, wood[1], c);
        }
        R(4, 13, 2, 15, iron, c);
        R(54, 13, 2, 15, iron, c);
        R(4, 13, 2, 1, '#5A5E6A', c);
        R(54, 13, 2, 1, '#5A5E6A', c);
      }
    }
  };

  // árvore com copa redonda (p.night: cores da noite; p.blossom: florida)
  function treeColors(p) {
    if (p.night) return { dark: '#16302A', mid: '#1E3E34', light: '#2C5644', hi: '#3C6E58', trunk: '#3A2A22', trunkD: '#261A14' };
    return { dark: '#2F7436', mid: '#3E8A3E', light: '#56A44C', hi: '#7CC45C', trunk: '#7A5232', trunkD: '#5A3A22' };
  }
  props.tree = {
    size: () => [48, 60],
    solid: () => [19, 50, 10, 8],
    sight: () => [14, 30, 20, 28],
    base: 58,
    draw(c, p) {
      const k = treeColors(p);
      alpha(c, 0.35, () => ell(c, 8, 50, 36, 10, '#140F1E'));
      R(20, 34, 8, 22, k.trunk, c);
      R(20, 34, 2, 22, k.trunkD, c);
      R(18, 54, 12, 3, k.trunk, c);
      ell(c, 2, 2, 44, 40, k.dark);
      ell(c, 4, 2, 40, 34, k.mid);
      ell(c, 8, 4, 22, 18, k.light);
      ell(c, 26, 10, 14, 12, k.light);
      for (let i = 0; i < 26; i++) {
        const v = hash(i, p.x + 7);
        R(6 + v % 34, 4 + (v >>> 6) % 30, 2, 1, (v >>> 3) % 2 ? k.hi : k.dark, c);
      }
    }
  };

  props.iceCart = {
    size: () => [40, 36],
    solid: () => [2, 20, 36, 12],
    sight: () => [2, 10, 36, 22],
    base: 34,
    draw(c) {
      shadowRect(c, 4, 31, 38, 4, 0.35);
      R(4, 8, 1, 12, '#B4BAC6', c);
      R(35, 8, 1, 12, '#B4BAC6', c);
      for (let k = 0; k < 10; k++) R(1 + k * 4, 0, 4, 8, k % 2 ? '#FFFFFF' : '#F07A9A', c);
      R(1, 7, 38, 1, '#C85A7A', c);
      for (let k = 0; k < 10; k++) R(2 + k * 4, 8, 2, 1, k % 2 ? '#FFFFFF' : '#F07A9A', c);
      R(2, 18, 36, 13, '#8ED0E8', c);
      R(2, 18, 36, 2, '#C4ECF8', c);
      R(2, 30, 36, 1, '#5EA8C4', c);
      // as bolas de sorvete na tampa
      [['#F7C6D4', 8], ['#FFF4DA', 14], ['#8A5A3A', 26], ['#B8E6C4', 32]].forEach(([col, x]) => { R(x, 15, 4, 3, col, c); R(x + 1, 14, 2, 1, col, c); });
      // a casquinha desenhada na frente
      R(17, 21, 6, 4, '#F7C6D4', c);
      R(18, 20, 4, 1, '#F7C6D4', c);
      R(18, 25, 4, 2, '#D8A050', c);
      R(19, 27, 2, 2, '#D8A050', c);
      R(6, 31, 4, 4, '#3A3E48', c);
      R(30, 31, 4, 4, '#3A3E48', c);
      R(7, 32, 2, 2, '#8A8E98', c);
      R(31, 32, 2, 2, '#8A8E98', c);
    }
  };

  props.flowerBed = {
    size: () => [56, 20],
    solid: () => [4, 4, 48, 12],
    base: 14,
    draw(c) {
      ell(c, 0, 0, 56, 20, '#C8BEA8');
      ell(c, 1, 1, 54, 17, '#E2D9C4');
      ell(c, 4, 3, 48, 14, '#6E4A32');
      const cols = ['#E85A6A', '#F2D04A', '#FFFFFF', '#F09ACC', '#E88A3A'];
      for (let i = 0; i < 26; i++) {
        const v = hash(i, 17), fx = 8 + v % 40, fy = 5 + (v >>> 7) % 10;
        R(fx, fy + 1, 1, 1, '#4E9A3C', c);
        R(fx, fy, 1, 1, cols[i % cols.length], c);
        if (i % 3 === 0) R(fx + 1, fy, 1, 1, cols[i % cols.length], c);
      }
    }
  };

  // pombos ciscando no caminho (p.at = [[x, y], ...], relativo ao objeto)
  props.pigeons = {
    hidden: true,
    size: () => [1, 1],
    fxLayer: 'ground',
    fx(ctx, p, world) {
      (p.at || []).forEach(([dx, dy], i) => {
        const x = Math.round(p.x + dx + Math.sin(world.t * 0.5 + i * 2) * 3), y = p.y + dy;
        const peck = Math.floor(world.t * 3 + i * 1.7) % 4 === 0 ? 1 : 0;
        const flip = Math.sin(world.t * 0.5 + i * 2 + 1.57) < 0;
        alpha(ctx, 0.3, () => Gfx.rect(x - 2, y + 1, 6, 1, '#140F1E'));
        Gfx.rect(x - 2, y - 3, 5, 3, '#8E94A0');
        Gfx.rect(x - 2, y - 3, 5, 1, '#AEB4C0');
        Gfx.rect(x - 1, y - 2, 2, 1, '#F2F2F2');
        const hx = flip ? x - 3 : x + 3;
        Gfx.rect(hx - (flip ? 0 : 1), y - 4 + peck, 2, 2, '#5E6474');
        Gfx.rect(flip ? hx - 1 : hx + 1, y - 3 + peck, 1, 1, '#E8A040');
        Gfx.rect(x, y, 1, 1, '#E8705A');
      });
    }
  };

  // ======================================================================
  //  F1 B1 · Iced tea at the café — janelas grandes, mesa comprida, balcão
  // ======================================================================

  // piso de losangos cinza e bege
  FLOORS.cafeDiamond = (c, x, y, w, h) => {
    pixels(c, x, y, w, h, (px, py) => {
      const u = (px + py) / 22, v = (px - py + 1000) / 22;
      const fu = u - Math.floor(u), fv = v - Math.floor(v);
      const dark = (Math.floor(u) + Math.floor(v)) % 2 === 0;
      if (fu < 0.05 || fv < 0.05) return dark ? '#6E6C68' : '#B8AC90';
      if (fu > 0.93 || fv > 0.93) return dark ? '#9A9894' : '#E8DCC2';
      return dark ? '#8A8884' : '#D6CAAE';
    });
  };

  // parede creme com três janelões para a rua
  WALLS.cafe = (c, x, w, h) => {
    R(x, 0, w, h, '#EFE4CC', c);
    R(x, 0, w, 3, '#5A3A24', c);
    [[16, 108], [134, 116], [260, 108]].forEach(([wx, ww]) => {
      const X = x + wx, top = 5, bot = h - 6;
      R(X - 2, top - 2, ww + 4, bot - top + 4, '#4A2E1E', c);
      // a rua lá fora: céu claro, fachadas, toldo e a calçada
      Gfx.dither(c, X, top, ww, 10, ['#DCEAF2', '#EEF4F6'], 3);
      for (let bx = 0; bx < ww; bx += 22) {
        const v = hash(bx, wx);
        R(X + bx, top + 4 + v % 4, 20, bot - top - 10, ['#D8D2C6', '#CFC8BA', '#E2DCD0'][v % 3], c);
        for (let k = 0; k < 3; k++) R(X + bx + 3 + k * 6, top + 9 + v % 4, 3, 4, '#A8B4C0', c);
      }
      R(X + 6, bot - 14, 30, 3, '#5A86B8', c);
      R(X, bot - 6, ww, 6, '#9A9894', c);
      R(X, bot - 6, ww, 1, '#B4B2AC', c);
      // reflexo no vidro
      for (let k = 0; k < 8; k++) R(X + 8 + k, top + 12 - k, 1, 1, '#FFFFFF', c);
      for (let k = 0; k < 5; k++) R(X + 14 + k, top + 12 - k, 1, 1, '#F6FAFC', c);
      // caixilhos
      R(X + Math.floor(ww / 2), top, 2, bot - top, '#4A2E1E', c);
      R(X, top + 14, ww, 1, '#6A4A32', c);
    });
    R(x, h - 4, w, 4, '#C8B898', c);
    R(x, h - 4, w, 1, '#F6EEDA', c);
  };

  EDGES.cafe = woodEdge(['#C8A070', '#8A6440', '#E8C898', '#F2D8A8']);

  // letreiro dourado no vidro (texto genérico do config.js)
  props.windowText = {
    layer: 'back',
    size: p => [Gfx.textWidth(p.text || '') + 4, 10],
    draw(c, p) {
      Gfx.text(p.text || '', 1, 1, '#E8B84A', { ctx: c, italic: true, shadow: '#8A6A2A' });
    }
  };

  // luminária pendente (globo branco)
  props.pendant = {
    layer: 'back',
    size: () => [14, 18],
    draw(c) {
      glow(c, 0, 4, 14, 14, '#FFF8E0', (i, j) => Math.max(0, 0.8 - Math.hypot(i - 6.5, j - 7) / 7));
      R(6, 0, 1, 6, '#3A2A22', c);
      ell(c, 3, 6, 8, 8, '#FAF6EA');
      R(4, 7, 2, 2, '#FFFFFF', c);
    }
  };

  // mesa comprida de madeira escura encostada nas janelas (p.items: x dos copos de chá gelado)
  props.longTable = {
    size: p => [p.w, 22],
    solid: p => [0, 0, p.w, 16],
    base: 16,
    draw(c, p) {
      const w = p.w;
      shadowRect(c, 2, 18, w - 2, 4, 0.3);
      R(0, 0, w, 15, '#7A3A22', c);
      R(0, 0, w, 1, '#9A5432', c);
      for (let k = 6; k < w; k += 34) R(k, 4 + (k % 3), 18, 1, '#6A3020', c);
      R(0, 15, w, 3, '#4E2414', c);
      R(0, 18, w, 1, '#341608', c);
      R(2, 19, 2, 3, '#341608', c);
      R(w - 4, 19, 2, 3, '#341608', c);
      (p.tea || []).forEach(tx => {
        R(tx, 3, 4, 7, '#C8D8DC', c);
        R(tx, 5, 4, 5, '#A0582A', c);
        R(tx, 5, 4, 1, '#E8F0F2', c);
        R(tx + 1, 6, 1, 1, '#E8F0F2', c);
        R(tx + 3, 0, 1, 5, '#F07A6A', c);
      });
      (p.cups || []).forEach(tx => {
        R(tx - 1, 7, 7, 3, '#F4F2EC', c);
        R(tx, 5, 5, 3, '#FFFFFF', c);
        R(tx + 1, 5, 3, 1, '#6A3A22', c);
      });
      (p.plates || []).forEach(tx => {
        ell(c, tx, 5, 10, 6, '#F4F2EC');
        R(tx + 3, 6, 4, 3, '#E8B86A', c);
        R(tx + 3, 6, 4, 1, '#F2D8A0', c);
      });
    }
  };

  // balcão branco com a vitrine de doces e sanduíches, de frente para o salão
  props.cafeCounter = {
    size: () => [112, 42],
    solid: () => [0, 6, 112, 32],
    sight: () => [0, 2, 112, 36],
    base: 38,
    draw(c) {
      shadowRect(c, 2, 38, 112, 4, 0.35);
      // tampo, com a caixa registradora e a máquina de café
      R(0, 4, 112, 8, '#F4F2EC', c);
      R(0, 4, 112, 1, '#FFFFFF', c);
      R(0, 11, 112, 1, '#D8D4CA', c);
      R(70, 0, 14, 8, '#4A4E58', c);
      R(71, 1, 12, 3, '#6A7080', c);
      R(72, 2, 5, 1, '#7CE0A8', c);
      R(90, 0, 12, 9, '#B8C0CC', c);
      R(92, 2, 8, 4, '#3A3E48', c);
      R(93, 7, 2, 2, '#FFFFFF', c);
      R(97, 7, 2, 2, '#FFFFFF', c);
      // vitrine
      R(0, 12, 64, 20, '#2E3440', c);
      R(1, 13, 62, 18, '#BFE0E8', c);
      R(1, 13, 62, 1, '#E8F8FC', c);
      R(1, 21, 62, 1, '#8AB4C4', c);
      const sweets = ['#D89A4A', '#F2D8A0', '#F09ABC', '#C8723A', '#FFF4DA'];
      for (let k = 0; k < 8; k++) {
        R(3 + k * 7, 17, 5, 3, sweets[k % sweets.length], c);
        R(3 + k * 7, 17, 5, 1, '#FFFFFF', c);
        // sanduíches embaixo: pão branco com recheio
        R(3 + k * 7, 25, 5, 4, '#F4F0E4', c);
        R(3 + k * 7, 26, 5, 1, k % 2 ? '#5DAA62' : '#F2C84E', c);
      }
      // frente de madeira
      R(64, 12, 48, 20, '#B07A44', c);
      R(64, 12, 48, 1, '#CC965A', c);
      for (let k = 68; k < 112; k += 8) R(k, 14, 1, 17, '#9A6436', c);
      R(0, 32, 112, 6, '#8A5A30', c);
      R(0, 32, 112, 1, '#A87040', c);
    }
  };

  // cavalete com o cardápio escrito a giz
  props.menuBoard = {
    size: () => [16, 24],
    solid: () => [2, 18, 12, 5],
    base: 23,
    draw(c) {
      shadowRect(c, 2, 21, 14, 3, 0.3);
      R(2, 1, 12, 18, '#8A5A30', c);
      R(3, 2, 10, 15, '#2A2E2C', c);
      for (let k = 0; k < 5; k++) R(4 + k % 2, 4 + k * 3, 6 - k % 3, 1, k === 0 ? '#F2C84E' : '#E8E8E0', c);
      R(2, 19, 2, 4, '#6A4228', c);
      R(12, 19, 2, 4, '#6A4228', c);
    }
  };

  // mesinha redonda de dois lugares
  props.smallTable = {
    size: () => [22, 22],
    solid: () => [2, 4, 18, 14],
    base: 16,
    draw(c, p) {
      shadowRect(c, 4, 17, 18, 4, 0.3);
      R(10, 12, 2, 8, '#3A2A22', c);
      ell(c, 0, 0, 22, 14, '#7A3A22');
      ell(c, 1, 0, 20, 12, '#9A5432');
      if (p.cups) {
        R(5, 3, 4, 3, '#FFFFFF', c);
        R(6, 3, 2, 1, '#6A3A22', c);
        R(13, 4, 4, 5, '#C8D8DC', c);
        R(13, 6, 4, 3, '#A0582A', c);
      }
    }
  };

  // ======================================================================
  //  F1 B2 · Planetarium — sala escura, cúpula rosa e roxa, camas redondas azuis
  // ======================================================================

  FLOORS.planetarium = (c, x, y, w, h) => {
    R(x, y, w, h, '#16142C', c);
    for (let i = 0; i < w * h / 10; i++) {
      const v = hash(i, x + 13);
      R(x + v % w, y + (v >>> 9) % h, 1, 1, (v >>> 4) % 3 ? '#1C1A36' : '#121026', c);
    }
    // reflexo rosa da cúpula no chão, perto da parede
    glow(c, x, y, w, 26, '#3A2058', (i, j) => 0.7 * (1 - j / 26));
    // luzinhas de chão marcando o caminho
    for (let k = x + 14; k < x + w; k += 28) {
      R(k, y + 54, 2, 1, '#6A4AA8', c);
      R(k, y + 86, 2, 1, '#6A4AA8', c);
    }
  };

  // a cúpula: projeção rosa e roxa com bolhas de luz, e a borda azulada embaixo
  WALLS.dome = (c, x, w, h) => {
    Gfx.dither(c, x, 0, w, h - 8, ['#2A1658', '#5A2490', '#9A34B8', '#D050C8', '#F070D8'], 3);
    for (let i = 0; i < 18; i++) {
      const v = hash(i, x + 5), bx = x + v % w, by = 4 + (v >>> 8) % (h - 16), r = 3 + (v >>> 4) % 5;
      glow(c, bx - r, by - r, r * 2, r * 2, '#F8C0F0', (a, b) => (Math.hypot(a - r, b - r) < r ? 0.55 : 0));
    }
    const rim = h - 8;
    R(x, rim, w, 8, '#3E4486', c);
    R(x, rim, w, 1, '#7A80C8', c);
    R(x, rim + 1, w, 1, '#5A62A8', c);
    R(x, rim + 7, w, 1, '#22264E', c);
    for (let k = x + 40; k < x + w; k += 96) {
      R(k, rim + 3, 8, 3, '#1A1C3A', c);
      R(k + 1, rim + 3, 6, 1, '#4A50A0', c);
    }
  };

  EDGES.dark = woodEdge(['#22264E', '#14162E', '#3E4486', '#6A3A98']);

  // estrelas piscando na cúpula
  props.domeStars = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      for (let i = 0; i < 30; i++) {
        const v = hash(i, 99), sx = p.x + v % 380, sy = 2 + (v >>> 9) % 34;
        const on = Math.sin(world.t * (1 + (v >>> 3) % 3) + i) > 0.2;
        if (on) Gfx.rect(sx, sy, 1, 1, i % 4 ? '#FFFFFF' : '#FFE0F8');
        if (on && i % 7 === 0) { Gfx.rect(sx - 1, sy, 3, 1, '#F8D8F4'); Gfx.rect(sx, sy - 1, 1, 3, '#F8D8F4'); }
      }
    }
  };

  // Cama redonda azul de pelúcia (como na selfie do planetário), com uma almofada grande do lado
  // das cabeças (p.pillows: 'left', padrão, ou 'right'). Quem deita nela fica na horizontal, com o
  // meio do corpo em x + 34 e a base em y + 21 (de cima) e y + 34 (de baixo).
  props.roundBed = {
    size: () => [68, 44],
    solid: () => [4, 8, 60, 30],
    base: 8,
    draw(c, p) {
      alpha(c, 0.4, () => ell(c, 3, 9, 65, 35, '#07060E'));
      ell(c, 0, 2, 68, 40, '#1A2868');
      ell(c, 1, 2, 66, 38, '#3A58BC');
      ell(c, 2, 4, 64, 35, '#2E4AA8');
      ell(c, 9, 9, 50, 25, '#2842A0');
      for (let i = 0; i < 16; i++) {
        const v = hash(i, 31);
        R(9 + v % 50, 8 + (v >>> 6) % 27, 1, 1, (v >>> 3) % 2 ? '#25409A' : '#3450B4', c);
      }
      // a almofada: duas partes, uma atrás de cada cabeça
      const px = p.pillows === 'right' ? 38 : 14;
      [5, 19].forEach(py => {
        R(px + 1, py, 14, 14, '#6A88D4', c);
        R(px, py + 1, 16, 12, '#6A88D4', c);
        R(px + 1, py + 1, 13, 3, '#9AB4EC', c);
        R(px + 2, py + 1, 8, 1, '#C0D2F6', c);
        R(px + 1, py + 13, 14, 1, '#4A64B4', c);
        R(px + 15, py + 2, 1, 11, '#4A64B4', c);
      });
    }
  };

  // ======================================================================
  //  F1 C1 · Dinner at Saizeriya — restaurante italiano familiar, sem logo
  // ======================================================================

  FLOORS.terracotta = (c, x, y, w, h) => {
    pixels(c, x, y, w, h, (px, py) => {
      const tx = Math.floor(px / 14), ty = Math.floor(py / 14), fx = px % 14, fy = py % 14;
      if (fx === 0 || fy === 0) return '#8E5638';
      if (fx === 1 || fy === 1) return '#D89A6A';
      const v = hash(tx, ty) % 3;
      return ['#C8865A', '#BE7C52', '#C48258'][v];
    });
  };

  WALLS.saizeriya = (c, x, w, h) => {
    R(x, 0, w, h, '#EED9A8', c);
    for (let i = 0; i < w * h / 24; i++) {
      const v = hash(i, x + 19);
      R(x + v % w, 5 + (v >>> 9) % (h - 20), 1, 1, (v >>> 4) % 3 ? '#E2CA92' : '#F6E6C0', c);
    }
    R(x, 0, w, 4, '#5E3A20', c);
    R(x, 4, w, 1, '#8A5A32', c);
    const rail = h - 15;
    R(x, rail, w, 2, '#8A5A32', c);
    R(x, rail + 2, w, 13, '#6A3E22', c);
    for (let k = x + 4; k < x + w; k += 16) R(k, rail + 4, 12, 9, '#7A4A2A', c);
    R(x, h - 1, w, 1, '#3A2214', c);
  };

  // quadro clássico genérico na moldura dourada (p.art: 0 paisagem, 1 figura)
  props.painting = {
    layer: 'back',
    size: () => [30, 22],
    draw(c, p) {
      shadowRect(c, 2, 2, 30, 22, 0.25);
      R(0, 0, 30, 22, '#B88A3A', c);
      R(0, 0, 30, 1, '#E8C070', c);
      R(2, 2, 26, 18, '#6A4A22', c);
      Gfx.dither(c, 3, 3, 24, 16, ['#8AB0D0', '#D8D0B0', '#7A8A5A'], 2);
      if (p.art === 1) {
        R(12, 7, 5, 4, '#E8B898', c);
        R(10, 11, 9, 8, '#C84A3A', c);
        R(11, 11, 2, 8, '#E86A5A', c);
        R(12, 6, 5, 2, '#6A4A2A', c);
      } else {
        ell(c, 4, 12, 14, 8, '#5A7A4A');
        ell(c, 14, 13, 14, 7, '#4A6A3E');
        R(20, 8, 2, 6, '#5A6A3A', c);
        ell(c, 18, 5, 6, 5, '#4A6A3E');
      }
    }
  };

  // janela com o céu do fim de tarde
  props.duskWindow = {
    layer: 'back',
    size: () => [36, 26],
    draw(c) {
      R(0, 0, 36, 26, '#4A2E1E', c);
      Gfx.dither(c, 2, 2, 32, 22, ['#4A3E7A', '#A8628A', '#F2A060', '#F8C878'], 3);
      R(2, 18, 32, 6, '#3A3048', c);
      for (let k = 4; k < 34; k += 7) R(k, 16 + k % 3, 4, 8 - k % 3, '#2E263C', c);
      R(17, 2, 2, 22, '#4A2E1E', c);
    }
  };

  // sofá verde do restaurante (p.dir: 'right' = encosto à esquerda, assento virado para a
  // direita; 'left' = o contrário; 'down' = encosto em cima, de frente para baixo)
  props.sofa = {
    size: p => (p.dir === 'down' ? [p.w || 48, 20] : [16, p.h || 40]),
    solid: p => (p.dir === 'down' ? [0, 0, p.w || 48, 16] : [0, 0, 16, p.h || 40]),
    sight: p => (p.dir === 'down' ? null : [p.dir === 'right' ? 0 : 8, 0, 8, p.h || 40]),
    base: 2,
    draw(c, p) {
      const G = '#3E7A4A', GD = '#2A5634', GH = '#5A9A62';
      if (p.dir === 'down') {
        const w = p.w || 48;
        R(0, 0, w, 9, GD, c);
        R(0, 0, w, 1, GH, c);
        for (let k = 0; k < w; k += 16) R(k + 1, 2, 14, 6, G, c);
        R(0, 9, w, 7, G, c);
        R(0, 9, w, 1, GH, c);
        R(0, 16, w, 2, '#1E3E26', c);
        return;
      }
      const h = p.h || 40, back = p.dir === 'right' ? 0 : 9;
      shadowRect(c, 0, h - 2, 16, 2, 0.3);
      R(0, 0, 16, h, GD, c);
      R(back, 0, 7, h, GD, c);
      R(back + 1, 1, 5, h - 2, G, c);
      R(back + 1, 1, 5, 1, GH, c);
      const seat = p.dir === 'right' ? 7 : 0;
      R(seat, 2, 9, h - 4, G, c);
      R(seat, 2, 9, 1, GH, c);
      for (let k = 2 + 18; k < h - 4; k += 18) R(seat, k, 9, 1, GD, c);
    }
  };

  // mesa de madeira clara com a comida (p.food: lista de [tipo, x, y])
  props.diningTable = {
    size: p => [p.w, p.h],
    solid: p => [0, 1, p.w, p.h - 3],
    base: p => p.h - 2,
    draw(c, p) {
      const w = p.w, h = p.h;
      shadowRect(c, 2, h - 3, w - 1, 3, 0.3);
      R(0, 0, w, h - 3, '#C89A62', c);
      R(0, 0, w, 1, '#E2B87E', c);
      R(0, h - 4, w, 1, '#A87A48', c);
      R(0, h - 3, w, 2, '#7A5230', c);
      (p.food || []).forEach(([kind, fx, fy]) => {
        if (kind === 'pasta') {
          ell(c, fx, fy, 10, 7, '#F6F2E8');
          ell(c, fx + 2, fy + 1, 6, 4, '#F2D070');
          R(fx + 4, fy + 2, 2, 2, '#D8443A', c);
        } else if (kind === 'pizza') {
          ell(c, fx, fy, 12, 9, '#E8C070');
          ell(c, fx + 1, fy + 1, 10, 7, '#E8743A');
          R(fx + 3, fy + 3, 1, 1, '#F6F2E8', c);
          R(fx + 7, fy + 4, 1, 1, '#F6F2E8', c);
          R(fx + 5, fy + 2, 1, 1, '#5DAA62', c);
        } else if (kind === 'glass') {
          R(fx, fy, 3, 4, '#DDE6F0', c);
          R(fx, fy, 3, 1, '#FFFFFF', c);
          R(fx, fy + 2, 3, 2, p.drink || '#E8A040', c);
        } else if (kind === 'salad') {
          ell(c, fx, fy, 8, 6, '#F6F2E8');
          R(fx + 2, fy + 1, 4, 3, '#6AB85A', c);
          R(fx + 3, fy + 2, 1, 1, '#E85A4A', c);
        }
      });
    }
  };

  // drink bar: bancada de inox com as máquinas de bebida
  props.drinkBar = {
    size: () => [56, 36],
    solid: () => [0, 18, 56, 16],
    sight: () => [0, 2, 56, 32],
    base: 34,
    draw(c) {
      shadowRect(c, 2, 33, 56, 3, 0.35);
      [[2, '#4A505C'], [24, '#5A4A5C']].forEach(([mx, col]) => {
        R(mx, 0, 20, 20, col, c);
        R(mx, 0, 20, 2, '#7A8090', c);
        R(mx + 2, 4, 16, 6, '#22262E', c);
        ['#E85A4A', '#F2C84E', '#5DAA62', '#4A8AD8'].forEach((b, i) => R(mx + 3 + i * 4, 6, 2, 2, b, c));
        R(mx + 5, 12, 2, 4, '#B8C0CC', c);
        R(mx + 13, 12, 2, 4, '#B8C0CC', c);
      });
      R(46, 4, 8, 14, '#DDE6F0', c);
      for (let k = 0; k < 4; k++) R(47, 5 + k * 3, 6, 1, '#B8C4D2', c);
      R(0, 18, 56, 16, '#B8C0CC', c);
      R(0, 18, 56, 2, '#E2E8F0', c);
      R(0, 26, 56, 1, '#8E96A4', c);
      R(4, 22, 6, 3, '#DDE6F0', c);
      R(30, 22, 6, 3, '#DDE6F0', c);
    }
  };

  // ======================================================================
  //  F1 C2 · A kiss in the park — parque de bairro à noite
  // ======================================================================

  FLOORS.dirtNight = (c, x, y, w, h) => {
    R(x, y, w, h, '#A08A6A', c);
    for (let i = 0; i < w * h / 9; i++) {
      const v = hash(i, x + 33), k = (v >>> 4) % 6;
      R(x + v % w, y + (v >>> 9) % h, k < 2 ? 2 : 1, 1, k < 2 ? '#8E785A' : k < 4 ? '#B49C7A' : '#94805E', c);
    }
    // grama nas bordas e embaixo
    for (let xx = x; xx < x + w; xx++) {
      const v = hash(xx, 5), gy = y + h - 12 - v % 5;
      R(xx, gy, 1, y + h - gy, xx % 3 ? '#4E7A42' : '#44703A', c);
      if (v % 4 === 0) R(xx, gy - 2, 1, 2, '#5A8A4C', c);
      const ty = y + 2 + v % 6;
      R(xx, y, 1, ty - y, '#44703A', c);
    }
  };

  // céu noturno, lua e a mata densa no fundo
  WALLS.nightTrees = (c, x, w, h) => {
    R(x, 0, w, h, '#16302A', c);
    Gfx.dither(c, x, 0, w, 20, ['#0E1230', '#1A1E48', '#262C5E'], 3);
    for (let i = 0; i < 30; i++) {
      const v = hash(i, x + 61);
      R(x + v % w, (v >>> 9) % 16, 1, 1, (v >>> 3) % 3 ? '#C8CCE8' : '#FFFFFF', c);
    }
    ell(c, x + 52, 3, 10, 10, '#F2EED0');
    ell(c, x + 55, 2, 9, 9, '#1A1E48');
    for (let k = -10; k < w + 10; k += 13) {
      const v = hash(k, x + 8), r = 11 + v % 6;
      ell(c, x + k - r, 10 + (v >>> 4) % 8, r * 2 + 4, r * 2 + 10, '#16302A');
    }
    for (let k = -4; k < w + 10; k += 13) {
      const v = hash(k, x + 9), r = 9 + v % 5;
      ell(c, x + k - r, 16 + (v >>> 4) % 8, r * 2, r * 2, '#1E3E34');
      ell(c, x + k - r + 3, 18 + (v >>> 4) % 8, r, r - 2, '#2C5644');
    }
    R(x, h - 6, w, 6, '#122620', c);
    R(x, h - 1, w, 1, '#0C1A16', c);
  };

  // mata fechada nas laterais
  EDGES.trees = (c, x, top, gap, side) => {
    const wx = side === 'left' ? x : x - 6;
    const segs = gap ? [[top - 6, gap[0]], [gap[1], 192]] : [[top - 6, 192]];
    segs.forEach(([a, b]) => {
      R(wx, a, 10, b - a, '#16302A', c);
      for (let y = a; y < b - 4; y += 7) ell(c, wx - 2, y, 14, 10, '#1E3E34');
      for (let y = a + 3; y < b - 4; y += 7) R(wx + 3, y, 4, 1, '#2C5644', c);
    });
  };

  // brinquedo de mola do parquinho
  props.springRider = {
    size: () => [18, 26],
    solid: () => [4, 18, 10, 6],
    base: 24,
    draw(c) {
      shadowRect(c, 3, 22, 14, 3, 0.35);
      for (let k = 0; k < 5; k++) R(6 + (k % 2) * 2, 14 + k * 2, 4, 1, '#8E96A4', c);
      R(4, 23, 10, 2, '#5E6470', c);
      ell(c, 1, 2, 16, 12, '#E8B83A');
      ell(c, 2, 2, 12, 8, '#F2D060');
      R(12, 0, 5, 5, '#E8B83A', c);
      R(14, 1, 1, 1, '#2A2030', c);
      R(17, 2, 1, 2, '#E8803A', c);
      R(4, 4, 6, 2, '#D8443A', c);
    }
  };

  props.bush = {
    size: () => [26, 18],
    solid: () => [2, 8, 22, 8],
    sight: () => [2, 4, 22, 12],
    base: 16,
    draw(c, p) {
      const k = treeColors(p);
      alpha(c, 0.35, () => ell(c, 2, 12, 24, 6, '#140F1E'));
      ell(c, 0, 2, 26, 15, k.dark);
      ell(c, 2, 1, 14, 10, k.mid);
      ell(c, 11, 3, 13, 10, k.mid);
      R(5, 3, 3, 1, k.hi, c);
      R(15, 5, 3, 1, k.hi, c);
    }
  };
})();
