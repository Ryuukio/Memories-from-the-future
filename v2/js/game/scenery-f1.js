// Fase 1 (16/08/2025), do F1 A2 ao F1 C2: pisos, paredes e objetos. A luz vai da tarde
// ensolarada (parque da Mirai Tower, café) até a noite (planetário, Saizeriya, parque do beijo).
// O F1 A1 (restaurante de okonomiyaki) está em scenery.js.
//
// V2 (etapa 3): tudo é desenhado no tamanho novo, com as ferramentas de art.js. Cada objeto guarda o
// tamanho, a colisão e a visão da V1 (coordenadas velhas; o Room.build amplia) e ganha um `art` com o
// desenho novo; os pisos, paredes e bordas novos ficam em Art.floors/walls/edges. A árvore, o
// arbusto e a sebe também aparecem em cenários das fases 3 e 4 que ainda são da V1: para eles, o
// desenho velho (draw, EDGES.hedge) continua aqui.
(() => {
  const { R, hash, alpha, props, EDGES } = Scenery;

  // elipse cheia, linha a linha (desenho da V1: copas)
  function ell(c, x, y, w, h, color) {
    for (let j = 0; j < h; j++) {
      const dy = (j + 0.5 - h / 2) / (h / 2);
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) R(x0, y + j, x1 - x0, 1, color, c);
    }
  }

  // objeto invisível que só ocupa lugar (e, se quiser, tapa a visão)
  props.block = {
    hidden: true,
    size: p => [p.w, p.h],
    solid: p => [0, 0, p.w, p.h],
    sight: p => (p.sight ? [0, 0, p.w, p.h] : null),
    draw() {}
  };

  // ---------- tamanho, colisão e visão dos objetos (V1; o desenho é o `art`, mais abaixo) ----------
  // F1 A2: poste, máquina de bebidas, banco de praça (p.view 'back': visto de trás, o encosto fica na
  // frente das pessoas; 'front': de frente, atrás delas), carrinho de sorvete, canteiro e os pombos
  props.parkLamp = { size: () => [10, 46], solid: () => [3, 41, 4, 4], base: 45 };
  props.vending = { size: () => [26, 42], solid: () => [1, 32, 24, 9], sight: () => [1, 6, 24, 35], base: 41 };
  props.parkBench = {
    size: () => [60, 30],
    solid: p => (p.view === 'front' ? [2, 2, 56, 14] : [2, 6, 56, 18]),
    // de trás, o banco vem depois de quem está sentado; de frente, antes
    base: p => (p.view === 'front' ? 4 : 28)
  };
  props.iceCart = { size: () => [40, 36], solid: () => [2, 20, 36, 12], sight: () => [2, 10, 36, 22], base: 34 };
  props.flowerBed = { size: () => [56, 20], solid: () => [4, 4, 48, 12], base: 14 };
  props.pigeons = { hidden: true, size: () => [1, 1], fxLayer: 'ground' };   // p.at = [[x, y], ...]

  // F1 B1: letreiro no vidro, luminária, mesa comprida (p.tea, p.cups, p.plates: x dos copos e pratos),
  // balcão com a vitrine, cavalete do cardápio e a mesinha redonda
  props.windowText = { layer: 'back', size: p => [Gfx.textWidth(p.text || '') + 4, 10] };
  props.pendant = { layer: 'back', size: () => [14, 18] };
  props.longTable = { size: p => [p.w, 22], solid: p => [0, 0, p.w, 16], base: 16 };
  props.cafeCounter = { size: () => [112, 42], solid: () => [0, 6, 112, 32], sight: () => [0, 2, 112, 36], base: 38 };
  props.menuBoard = { size: () => [16, 24], solid: () => [2, 18, 12, 5], base: 23 };
  props.smallTable = { size: () => [22, 22], solid: () => [2, 4, 18, 14], base: 16 };

  // F1 B2: as estrelas da cúpula e a cama redonda (quem deita nela fica com o meio do corpo em x + 34 e
  // a base em y + 21, em cima, e y + 34, embaixo)
  props.domeStars = { hidden: true, size: () => [1, 1] };
  props.roundBed = { size: () => [68, 44], solid: () => [4, 8, 60, 30], base: 8 };

  // F1 C1: quadros, janela, sofá (p.dir 'right' = encosto à esquerda, assento virado para a direita;
  // 'left' = o contrário; 'down' = encosto em cima), mesa com a comida (p.food: [tipo, x, y]) e o drink bar
  props.painting = { layer: 'back', size: () => [30, 22] };
  props.duskWindow = { layer: 'back', size: () => [36, 26] };
  props.sofa = {
    size: p => (p.dir === 'down' ? [p.w || 48, 20] : [16, p.h || 40]),
    solid: p => (p.dir === 'down' ? [0, 0, p.w || 48, 16] : [0, 0, 16, p.h || 40]),
    sight: p => (p.dir === 'down' ? null : [p.dir === 'right' ? 0 : 8, 0, 8, p.h || 40]),
    base: 2
  };
  props.diningTable = { size: p => [p.w, p.h], solid: p => [0, 1, p.w, p.h - 3], base: p => p.h - 2 };
  props.drinkBar = { size: () => [56, 36], solid: () => [0, 18, 56, 16], sight: () => [0, 2, 56, 32], base: 34 };

  // F1 C2: brinquedo de mola do parquinho
  props.springRider = { size: () => [18, 26], solid: () => [4, 18, 10, 6], base: 24 };

  // ---------- árvore, arbusto e sebe (também nas fases 3 e 4: aqui o desenho da V1) ----------
  // árvore com copa redonda e arbusto (p.night: cores da noite)
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

  // ======================================================================
  //  F1 A2 · Ice cream at Mirai Tower — parque em Sakae, tarde de verão
  //  (V2: a simulação de docs/v2/mockup; tudo em coordenadas novas, 480 × 240)
  // ======================================================================
  const A = Art, { pick, hash: h01, vnoise, sphere, bay, c01, mix, clamp1 } = Art;
  const K = 1.25, kk = n => Math.round(n * K);

  const GRASS = A.tones(['#3B7F36', '#46903D', '#529E44', '#5FAB4C', '#6DB755', '#7CC260', '#8ECD6E', '#A2D87E']);
  const LEAF = A.tones(['#22492B', '#2C5C35', '#38703E', '#468447', '#569851', '#6AAC5A', '#83C066', '#A3D47C']);
  // as mesmas folhas à noite, ao luar (o ambiente azulado do cenário escurece o resto)
  const LEAF_N = A.tones(['#16302E', '#1C3C36', '#22483E', '#2A5646', '#34644E', '#407258', '#4E8262', '#62946E']);
  const leafOf = p => (p.night ? LEAF_N : LEAF);

  // Grama: manchas grandes e pequenas, mais clara ao longe, manchas de sol, tufos e florzinhas.
  // o.ramp: outra grama (a da noite); o.flowers: false = sem flores
  function grass(S, x0, y0, w, h, o = {}) {
    const R = o.ramp || GRASS, seed = o.seed || 5;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      let t = 0.5 + (vnoise(x, y, 26, seed) - 0.5) * 0.55 + (vnoise(x, y, 7, seed + 2) - 0.5) * 0.3 + (vnoise(x, y, 2, seed + 3) - 0.5) * 0.18;
      t += (y0 + 30 - y) / 300 + (o.lift || 0);
      if (vnoise(x, y, 34, seed + 4) > 0.66) t += o.sun === undefined ? 0.16 : o.sun;
      S.put(x, y, pick(R, t, x, y));
    }
    const dk = R[0], md = R[3], lt = R[R.length - 1];
    for (let y = y0 + 4; y < y0 + h; y++) for (let x = x0 + 1; x < x0 + w - 1; x++) {
      const r = h01(x, y, seed + 7);
      if (r < 0.035) {
        S.put(x, y, dk); S.put(x, y - 1, md);
        if (h01(x, y, seed + 8) < 0.5) S.put(x + 1, y - 1, R[2]);
        S.put(x - 1, y, R[2]);
        if (h01(x, y, seed + 9) < 0.4) S.put(x, y - 2, lt);
      } else if (o.flowers !== false && r < 0.0385) {
        const fc = ['#F8F6EC', '#F6DA5C', '#F4A8C4', '#C8A8F0'][Math.floor(h01(x, y, seed + 10) * 4)];
        S.put(x, y, fc); S.put(x, y + 1, dk);
        if (h01(x, y, seed + 11) < 0.5) { S.put(x - 1, y, mix(fc, md, 0.5)); S.put(x + 1, y, mix(fc, md, 0.5)); }
      }
    }
  }

  // caminho de pedra de p0 a p1 (meio-fio em cima e embaixo, três fileiras de pedras)
  const STONE = ['#DCD3C0', '#D2C8B4', '#E3DBCA', '#CCC2AD', '#D8CFBB', '#E0D6C2'];
  function stonePath(S, p0, p1, seed = 50) {
    S.rect(0, p0, 480, p1 - p0, '#8C8270');
    const inner = p1 - p0 - 6, rh = Math.floor(inner / 3), extra = inner - rh * 3;
    let ry = p0 + 3;
    for (let ri = 0; ri < 3; ri++) {
      const hh = rh + (ri < extra ? 1 : 0);
      let x = -Math.floor(h01(ri, 1, seed) * 14), k = 0;
      while (x < 480) {
        const w = 15 + Math.floor(h01(ri, k, seed + 1) * 10), base = STONE[Math.floor(h01(ri, k, seed + 2) * STONE.length)];
        for (let j = 0; j < hh - 1; j++) for (let i = 0; i < w - 1; i++) {
          const px = x + i, py = ry + j;
          let c = A.rgb(base);
          const n = h01(px, py, seed + 3);
          if (n < 0.1) c = A.mul(c, [237, 235, 230]); else if (n > 0.93) c = mix(c, '#F4EFE4', 0.5);
          c = mix(c, '#BDB29C', vnoise(px, py, 5, seed + 4 + ri) * 0.35);
          if (j === 0 || i === 0) c = mix(c, '#F2ECE0', 0.55);
          if (j === hh - 2 || i === w - 2) c = mix(c, '#A89C86', 0.55);
          S.put(px, py, c);
        }
        // rachadura de vez em quando e musgo nas juntas
        if (h01(ri, k, seed + 5) < 0.22) {
          const cx0 = x + 4 + Math.floor(h01(ri, k, seed + 6) * (w - 8));
          for (let q = 0; q < Math.min(5, hh - 3); q++) S.put(cx0 + (q % 2), ry + 2 + q, '#9E9380');
        }
        if (h01(ri, k, seed + 7) < 0.45) {
          const my = ry + 3 + Math.floor(h01(ri, k, seed + 8) * (hh - 5));
          S.put(x + w - 1, my, '#6E9A4A'); S.put(x + w - 1, my + 1, '#5A8A40');
        }
        x += w; k++;
      }
      ry += hh;
    }
    for (let x = 0; x < 480; x++) {
      S.put(x, p0, '#E2DACB'); S.put(x, p0 + 1, '#B9AF9B'); S.put(x, p0 + 2, '#9C927E');
      S.put(x, p1 - 3, '#D9D0BE'); S.put(x, p1 - 2, '#B3A992'); S.put(x, p1 - 1, '#857B68');
      if (x % 23 === 0) { S.put(x, p0 + 1, '#8E8470'); S.put(x, p1 - 2, '#7E7462'); }
      // a grama passa por cima do meio-fio
      if (h01(x, 1, seed + 9) < 0.32) { S.put(x, p0, '#4E9A43'); if (h01(x, 2, seed + 9) < 0.5) S.put(x, p0 + 1, '#3E8638'); }
      if (h01(x, 3, seed + 9) < 0.28) { S.put(x, p1 - 1, '#5FAB4C'); if (h01(x, 4, seed + 9) < 0.4) S.put(x, p1 - 2, '#7CC260'); }
    }
  }

  Art.floors.park = (S, look) => {
    const top = look.wall.height;
    grass(S, 0, top, 480, 240 - top);
    stonePath(S, look.path[0], look.path[1]);
  };

  // nuvem (cúmulo): bolas sombreadas com a base reta, a borda do lado do sol mais quente
  const CLOUD = A.tones(['#AFB9DA', '#C2CCE6', '#D6DEF0', '#E9EEF7', '#FAFBFD', '#FFFFFF']);
  function cloud(S, cx, cy, parts, flat) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9;
    parts.forEach(([dx, dy, r]) => { x0 = Math.min(x0, cx + dx - r); x1 = Math.max(x1, cx + dx + r); y0 = Math.min(y0, cy + dy - r); });
    for (let y = Math.floor(y0); y <= cy + flat; y++) for (let x = Math.floor(x0); x <= x1; x++) {
      let best = null;
      parts.forEach(([dx, dy, r]) => {
        const d = Math.hypot(x + 0.5 - cx - dx, y + 0.5 - cy - dy) / r;
        if (d <= 1 && (!best || dy - r < best.top)) best = { nx: (x + 0.5 - cx - dx) / r, ny: (y + 0.5 - cy - dy) / r, top: dy - r, d };
      });
      if (!best) continue;
      const t = sphere(best.nx, best.ny) * 0.75 + 0.35 - ((y - y0) / (cy + flat - y0)) * 0.35;
      let c = pick(CLOUD, t, x, y);
      if (best.nx < -0.55 && t > 0.6) c = mix(c, '#FFEBD0', 0.45);
      if (best.d > 0.88 && bay(x, y) < 0.5) c = mix(S.get(x, y) || c, c, 0.6);
      S.put(x, y, c);
    }
  }

  // prédios ao longe (a camada de trás mais apagada); warm = uma janela acesa de vez em quando
  function skyline(S, base, seed, hmin, hmax, R, win, warm, skip) {
    let x = -4;
    while (x < 480) {
      const w = 7 + Math.floor(h01(x, 1, seed) * 14), hh = hmin + Math.floor(h01(x, 2, seed) * (hmax - hmin)), top = base - hh;
      if (!skip || !skip(x, w)) {
        for (let y = top; y < base; y++) for (let i = 0; i < w; i++) {
          const px = x + i;
          let c = i < 2 ? R[2] : i > w - 3 ? R[0] : R[1];
          if (y === top) c = R[3];
          if (i > 1 && i < w - 2 && y > top + 1 && (y - top) % 3 === 1 && i % 3 === 1) c = warm && h01(px, y, seed + 9) < 0.1 ? warm : win;
          S.put(px, y, c);
        }
        if (h01(x, 3, seed) < 0.4) { const ax = x + 2 + Math.floor(h01(x, 4, seed) * (w - 4)); S.line(ax, top - 1, ax, top - 3 - Math.floor(h01(x, 5, seed) * 3), R[0]); }
        if (h01(x, 6, seed) < 0.35) S.rect(x + 2, top - 2, 3, 2, R[0]);
      }
      x += w + (h01(x, 7, seed) < 0.3 ? 2 : 0);
    }
  }

  // A Mirai Tower (torre de treliça de aço): antena listrada, mirante aberto, seção fina, mirante
  // fechado de vidro e a treliça abrindo para baixo (o pé some atrás das árvores)
  function miraiTower(S, TX, y0) {
    const LIT = '#F6F0E6', MID = '#BCC5D0', DARK = '#7C8898';
    const ant = y0, open = y0 + 9, upper = y0 + 12, deck = y0 + 20, lat = y0 + 27, foot = y0 + 58;
    for (let y = ant; y < open; y++) {
      const red = Math.floor((y - ant) / 2) % 2 === 0;
      S.put(TX, y, red ? '#D8443A' : '#F6F2EA'); S.put(TX + 1, y, red ? '#A8302A' : '#C9C4BA');
    }
    S.put(TX, ant, '#FF6A5A');
    S.rect(TX - 6, open, 13, 1, '#E8EDF2'); S.rect(TX - 6, open + 1, 13, 2, '#AEB8C4'); S.rect(TX - 6, open + 2, 13, 1, '#7E8A98');
    for (let x = TX - 5; x <= TX + 5; x += 2) S.put(x, open + 1, '#E8EDF2');
    // seção de cima, mais fina, com a treliça em X
    const hw = y => 3 + (y - upper) / 8 * 2;
    for (let y = upper; y < deck; y++) { S.put(TX - hw(y), y, LIT); S.put(TX + hw(y) + 1, y, DARK); }
    for (let y = upper; y < deck - 1; y += 3) {
      S.line(TX - hw(y), y, TX + hw(y) + 1, y, MID);
      S.line(TX - hw(y), y, TX + hw(y + 3) + 1, y + 3, LIT);
      S.line(TX + hw(y) + 1, y, TX - hw(y + 3), y + 3, DARK);
    }
    // mirante fechado (vidro com reflexo)
    for (let y = deck; y <= deck + 7; y++) for (let x = TX - 11; x <= TX + 12; x++) {
      let c;
      if (y === deck) c = '#F2F5F8';
      else if (y === deck + 1) c = '#C9D0D8';
      else if (y >= deck + 6) c = y === deck + 7 ? '#6E7886' : '#8A94A2';
      else {
        const u = (x - (TX - 11)) / 23;
        c = pick(A.tones(['#6FA9CF', '#8CC4E4', '#B4DDF2', '#DDF2FC']), 0.9 - u * 0.75 + ((x + y) % 7 === 0 ? 0.35 : 0), x, y);
        if ((x - TX) % 3 === 0) c = '#5D748C';
      }
      if (x === TX - 11 || x === TX + 12) c = x < TX ? '#DDE3EA' : '#7E8A98';
      S.put(x, y, c);
    }
    // treliça de baixo, abrindo
    const half = y => 6 + 16 * Math.pow((y - lat) / (foot - lat), 1.6);
    const levels = [lat, lat + 4, lat + 9, lat + 15, lat + 22, lat + 31];
    for (let y = lat; y <= foot; y++) {
      const hh = half(y);
      S.put(TX - hh, y, LIT); S.put(TX - hh + 1, y, MID);
      S.put(TX + 1 + hh, y, DARK); S.put(TX + hh, y, MID);
    }
    for (let q = 0; q < levels.length - 1; q++) {
      const ya = levels[q], yb = levels[q + 1], ha = half(ya), hb = half(yb);
      S.line(TX - ha, ya, TX + 1 + ha, ya, MID);
      S.line(TX - ha + 1, ya + 1, TX + hb, yb, LIT);
      S.line(TX + ha, ya + 1, TX - hb + 1, yb, DARK);
    }
  }

  // uma moita de copa: bola com a borda irregular, luz da esfera e ruído de folhas
  function lump(S, cx, cy, r, bias, seed, R = LEAF) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / (r * 0.85);
      const rough = (vnoise(x, y, 2.5, seed) - 0.5) * 0.5;
      if (nx * nx + ny * ny > 1 + rough * 0.6) continue;
      let t = sphere(clamp1(nx), clamp1(ny)) + bias + (vnoise(x, y, 3, seed + 1) - 0.5) * 0.45;
      if (h01(x, y, seed) < 0.05) t += 0.25;
      S.put(x, y, pick(R, t, x, y));
    }
  }

  // céu da tarde com sol e nuvens, prédios ao longe, a Mirai Tower, o Oasis 21 e a fileira de árvores
  const SKY = A.tones(['#3A72C6', '#4580D0', '#528ED8', '#619CDF', '#72AAE4', '#86B8E8', '#9BC5EB', '#B1D1EC', '#C7DCEA', '#DBE2E0', '#ECE2CC']);
  Art.walls.parkSky = (S, look) => {
    const H = look.wall.height, SUN = [44, 13];
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKY, y / (H - 12) + (vnoise(x, y, 40, 3) - 0.5) * 0.05, x, y));
    // sol e o brilho em volta
    for (let y = 0; y < H; y++) for (let x = 0; x < 140; x++) {
      const r = Math.hypot(x - SUN[0], y - SUN[1]);
      if (r < 46) S.put(x, y, '#FFF2CC', c01(Math.pow(1 - r / 46, 2) * 0.75 + (bay(x, y) - 0.5) * 0.06));
      if (r < 7.5) S.put(x, y, r < 4.8 ? '#FFFEF4' : pick(A.tones(['#FFE7A0', '#FFF4CC', '#FFFEF4']), 1 - (r - 4.8) / 2.7, x, y));
    }
    cloud(S, 132, 16, [[-15, 1, 6], [-7, -2, 8], [4, -4, 9], [14, -1, 7], [21, 2, 5], [-21, 3, 4]], 4);
    cloud(S, 338, 12, [[-9, 0, 6], [0, -3, 7], [9, -1, 6], [16, 2, 4]], 4);
    cloud(S, 446, 24, [[-6, 0, 4], [1, -2, 5], [8, 1, 4]], 3);
    cloud(S, 70, 32, [[-4, 0, 3], [2, -1, 4], [7, 1, 3]], 2);
    // prédios ao longe (duas camadas), com um vão no meio para a torre
    skyline(S, H - 10, 11, 4, 12, A.tones(['#9EB7CE', '#AFC6DA', '#BED2E3', '#CADBE8']), '#BCD0E2', null);
    skyline(S, H - 6, 23, 5, 15, A.tones(['#7F9AB7', '#8EA8C3', '#A0B8D0', '#B0C6DA']), '#A3BCD3', '#F4E4B8', (x, w) => Math.abs(x + w / 2 - 240) < 22);
    miraiTower(S, 240, 1);
    // o Oasis 21 (a "nave" de vidro com água em cima) aparecendo atrás das árvores
    const OX = 380, OY = H - 19;
    for (let y = OY - 4; y <= OY + 4; y++) for (let x = OX - 36; x <= OX + 36; x++) {
      const nx = (x + 0.5 - OX) / 36, ny = (y + 0.5 - OY) / 3.4;
      if (nx * nx + ny * ny > 1) continue;
      let c;
      if (ny < -0.55) c = '#F4F8FA';
      else if (ny > 0.45) c = pick(A.tones(['#5E7E96', '#7896AC']), 0.6 - nx * 0.4, x, y);
      else c = pick(A.tones(['#7EC0E0', '#9ED4EC', '#C4E8F6', '#E6F6FC']), 0.55 - nx * 0.35 + ((x * 2 - y * 5) % 11 === 0 ? 0.4 : 0), x, y);
      if ((x - OX + 36) % 8 === 0 && ny > -0.5) c = '#D8ECF4';
      S.put(x, y, c);
    }
    for (const x of [OX - 22, OX, OX + 22]) for (let y = OY + 4; y < OY + 10; y++) S.put(x, y, '#C8D4DC');
    // pássaros ao longe
    [[300, 14], [307, 11], [314, 16], [196, 6]].forEach(([x, y]) => {
      S.put(x - 1, y - 1, '#46506A'); S.put(x, y, '#46506A'); S.put(x + 1, y - 1, '#46506A');
      S.put(x - 2, y - 1, '#6A7490', 0.6); S.put(x + 2, y - 1, '#6A7490', 0.6);
    });
    // a fileira de árvores no fundo (duas camadas, sobre uma base de folhas na sombra)
    for (let y = H - 10; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(LEAF, 0.22 + (vnoise(x, y, 3, 42) - 0.5) * 0.4, x, y));
    for (let x = -6, q = 0; x < 490; x += 10 + Math.floor(h01(q, 1, 40) * 6), q++) lump(S, x, H - 13 + h01(q, 2, 40) * 4, 8 + h01(q, 3, 40) * 4, -0.12, q);
    for (let x = 0, q = 0; x < 490; x += 12 + Math.floor(h01(q, 1, 41) * 7), q++) lump(S, x, H - 5 + h01(q, 2, 41) * 3, 7 + h01(q, 3, 41) * 3, 0.02, 100 + q);
    // a sombra das árvores na grama
    S.clip(0, 0, 480, 240);
    for (let y = H - 2; y < H + 8; y++) for (let x = 0; x < 480; x++) {
      if (y >= H) S.tput(x, y, '#1E3A22', (1 - (y - H + 2) / 10) * 0.55 + (bay(x, y) - 0.5) * 0.1);
    }
  };

  // raios do sol da tarde, bem fracos, descendo do sol para a direita (por cima de tudo)
  Art.posts.parkSky = S => {
    const SUN = [44, 13];
    for (let y = 0; y < 240; y++) for (let x = 0; x < 480; x++) {
      const u = (x - SUN[0]) * 0.55 - (y - SUN[1]) * 0.84, v = (x - SUN[0]) * 0.84 + (y - SUN[1]) * 0.55;
      if (v <= 0) continue;
      const b = Math.sin(u / 9 + 1.3) * Math.sin(u / 23);
      if (b > 0.55) S.tput(x, y, '#FFF0C8', (b - 0.55) * 0.3 * Math.max(0, 1 - v / 380) + (bay(x, y) - 0.5) * 0.04);
    }
  };
  // poeira brilhando na luz e duas borboletas perto do canteiro
  Art.scenefx.parkSky = (ctx, ox, world) => {
    const t = world.t;
    for (let i = 0; i < 18; i++) {
      const ph = (t * (0.03 + h01(i, 1, 300) * 0.04) + h01(i, 2, 300)) % 1;
      const x = Math.round(ox + h01(i, 3, 300) * 480 + Math.sin(t * 0.7 + i) * 6), y = Math.round(20 + h01(i, 4, 300) * 200 - ph * 30);
      const tw = Math.sin(t * 3 + i * 1.7);
      if (tw < -0.3) continue;
      ctx.globalAlpha = tw > 0.5 ? 0.9 : 0.5;
      Gfx.rect(x, y, 1, 1, '#FFF8E0');
    }
    ctx.globalAlpha = 1;
    [[350, 180, '#FFFFFF', '#F4D658'], [410, 196, '#F6D25A', '#E89A3A']].forEach(([bx, by, a, b], i) => {
      const x = Math.round(ox + bx + Math.sin(t * 0.9 + i * 2) * 18), y = Math.round(by + Math.sin(t * 1.7 + i) * 8);
      const up = Math.floor(t * 8 + i * 3) % 2 === 0;
      Gfx.rect(x, y, 1, 2, '#2A2420');
      if (up) { Gfx.rect(x - 2, y - 2, 2, 2, a); Gfx.rect(x + 1, y - 2, 2, 2, a); Gfx.rect(x - 1, y - 1, 1, 1, b); Gfx.rect(x + 1, y - 1, 1, 1, b); }
      else { Gfx.rect(x - 2, y, 2, 1, a); Gfx.rect(x + 1, y, 2, 1, a); Gfx.rect(x - 1, y + 1, 1, 1, b); Gfx.rect(x + 1, y + 1, 1, 1, b); }
    });
  };

  // Fachada do restaurante de okonomiyaki (lado esquerdo do parque): parede creme entre postes de
  // madeira, beiral escuro em cima, a porta com o noren e a lanterna vermelha (chochin) acesa
  // A fachada fica de frente para a câmera, como na simulação: o telhado na linha do horizonte e a
  // parede descendo até embaixo, com uma janela de treliça acesa por dentro.
  Art.edges.building = (S, x, top, gap, side, look) => {
    const W = (look.edgeWidth && look.edgeWidth[side]) || 5, x0 = side === 'left' ? x : x + 5 - W;
    const WOOD = A.tones(['#4A2E1A', '#6B4529', '#86593A']), PLASTER = A.tones(['#D8C9A8', '#E8DCC0', '#F2E8D2', '#FAF3E4']);
    const y0 = top - 2;
    for (let y = y0; y < 240; y++) for (let i = 0; i < W; i++) {
      const px = x0 + i;
      let c;
      if (i >= W - 3) c = i === W - 1 ? '#5A4636' : '#7E6450';                 // espessura da parede
      else if (i < 2 || i === W - 5 || i === W - 4) c = pick(WOOD, i < 2 ? 0.7 - i * 0.3 : 0.5 - (i - W + 5) * 0.25, px, y);
      else c = pick(PLASTER, 0.75 - i * 0.03 + (vnoise(px, y, 3, 150) - 0.5) * 0.3, px, y);
      // vigas: embaixo do telhado, no meio e a base de pedra
      if ((y === top + 24 || y === top + 25) && i < W - 3) c = y === top + 24 ? '#86593A' : '#4A2E1A';
      if (y >= 232 && i < W - 3) c = pick(A.tones(['#6A6458', '#8A8476', '#A8A294']), 0.6 - (y - 232) * 0.05 + (h01(px, y, 151) - 0.5) * 0.4, px, y);
      S.put(px, y, c);
    }
    // janela de treliça acesa (a luz quente do restaurante)
    for (let y = top + 6; y < top + 20; y++) for (let i = 3; i < W - 6; i++) {
      const lattice = (y - top - 6) % 4 === 0 || (i - 3) % 3 === 0;
      S.put(x0 + i, y, lattice ? '#5A3A22' : pick(A.tones(['#F2C878', '#FFE0A0', '#FFF0CC']), 0.8 - (y - top - 6) * 0.03, x0 + i, y));
    }
    // telhado de telhas escuras, com o beiral saindo para a direita
    for (let y = top - 8; y < top; y++) for (let i = 0; i < W + 5; i++) {
      const px = x0 + i;
      if (i >= W + 2 && y < top - 8 + (i - W - 2) * 2) continue;
      let c = pick(A.tones(['#1E1D24', '#2C2B33', '#3C3B45', '#504F5B']), 0.55 - (y - top + 8) * 0.06 + ((px + y * 2) % 5 === 0 ? 0.3 : 0), px, y);
      if (y === top - 8) c = '#6A6874';
      if (y === top - 1) c = '#141318';
      S.put(px, y, c);
    }
    if (!gap) return;
    // a porta (escura lá dentro), o lintel e o noren azul-marinho com a faixa branca
    const [g0, g1] = gap;
    for (let y = g0 - 2; y < g1; y++) for (let i = 0; i < W - 3; i++) {
      const px = x0 + i;
      if (y < g0) { S.put(px, y, y === g0 - 2 ? '#86593A' : '#4A2E1A'); continue; }
      S.put(px, y, pick(A.tones(['#1A120E', '#2A1E18', '#3E2C22']), 0.35 + (y - g0) / 60, px, y));
    }
    const NOREN = A.tones(['#1E2C5E', '#283A78', '#33489A', '#4A60B4']);
    for (let y = g0; y < g0 + 17; y++) for (let i = 1; i < W - 4; i++) {
      if ((i === 4 || i === 8) && y > g0 + 3) continue;
      let c = pick(NOREN, 0.75 - (i % 4) * 0.08 - (y - g0) * 0.012, x0 + i, y);
      if (y === g0 + 11 || y === g0 + 12) c = '#E8ECF4';
      S.put(x0 + i, y, c);
    }
    // lanterna vermelha com o brilho em volta
    const LX = x0 + W + 4, LY = g0 - 13;
    for (let y = LY - 20; y < LY + 22; y++) for (let xx = LX - 20; xx < LX + 20; xx++) {
      const r = Math.hypot(xx - LX, (y - LY) * 1.1);
      if (r < 19) S.tput(xx, y, '#FF9A50', Math.pow(1 - r / 19, 2) * 0.45);
    }
    const RED = A.tones(['#8E1A16', '#B82822', '#DA3A2E', '#F2624A', '#FF9A7A']);
    S.ellipse(LX, LY, 5.5, 7, (xx, y, nx, ny) => {
      if (Math.abs(ny) > 0.78) return '#2A1A16';
      let c = pick(RED, sphere(nx, ny) + 0.15, xx, y);
      if ((y - LY) % 3 === 0) c = mix(c, '#7A1612', 0.4);
      return c;
    });
    S.line(LX, LY - 10, LX, LY - 8, '#2A1A16');
    S.line(x0 + W - 3, LY - 10, LX, LY - 10, '#2A1A16');
  };

  // sebe aparada com a passagem
  function hedgeArt(S, x, top, gap, side) {
    const x0 = side === 'left' ? x : x - 5;
    const segs = gap ? [[top - 8, gap[0]], [gap[1], 240]] : [[top - 8, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 10; i++) {
        const px = x0 + i, edge = side === 'left' ? i === 9 : i === 0;
        let t = 0.55 + (vnoise(px, y, 2.2, 160) - 0.5) * 0.7 - (side === 'left' ? 0 : 0.1) + (i < 3 ? 0.12 : 0) - (y - a < 3 ? -0.15 : 0);
        if (edge && h01(px, y, 161) < 0.5) continue;
        if (h01(px, y, 162) < 0.05) t += 0.3;
        S.put(px, y, pick(LEAF, t, px, y));
      }
      // sombra embaixo da sebe
      for (let i = -1; i < 11; i++) for (let j = 0; j < 3; j++) if (b + j < 240 && b < 240) S.mul(x0 + i, b + j, '#8A98B8', 0.6 - j * 0.2);
    });
  }
  Art.edges.hedge = hedgeArt;

  // ---------- objetos ----------
  // poste de luz do parque (p.night: aceso, com o vidro amarelo)
  props.parkLamp.art = p => {
    const s = A.surface(13, 58), POST = A.tones(['#2E3A35', '#43544D', '#6A7E74', '#8EA298']);
    for (let y = 12; y < 53; y++) { s.put(5, y, POST[2]); s.put(6, y, POST[1]); s.put(7, y, POST[0]); }
    for (let y = 26; y < 28; y++) for (let x = 4; x < 9; x++) s.put(x, y, x < 6 ? POST[2] : POST[0]);
    for (let y = 51; y < 57; y++) for (let x = 2 + (56 - y > 2 ? 1 : 0); x < 11 - (56 - y > 2 ? 1 : 0); x++) s.put(x, y, x < 5 ? '#5E7068' : x < 8 ? '#3E4E48' : '#2A3530');
    for (let x = 1; x < 12; x++) { s.put(x, 0, '#3E4E48'); s.put(x, 1, x < 6 ? '#5E7068' : '#2E3A35'); }
    const GLASS = p.night ? A.tones(['#F2C870', '#FFE08A', '#FFF0B8', '#FFFCE8']) : A.tones(['#D8D6C8', '#ECEADC', '#FBFAF0', '#FFFFFF']);
    for (let y = 2; y < 11; y++) for (let x = 2; x < 11; x++) s.put(x, y, x === 2 || x === 10 ? '#3A4A44' : pick(GLASS, (p.night ? 1.1 : 0.95) - (x - 3) * 0.1 - (y - 2) * 0.03, x, y));
    for (let x = 2; x < 11; x++) s.put(x, 11, '#2E3A35');
    s.put(6, 1, '#8EA298');
    s.put(3, 3, '#FFFFFF'); s.put(3, 4, '#FFFFFF');
    s.outline();
    return { spr: s, dx: 0, dy: 0, base: 56, contact: [6.5, 56, 4.5, 1.5] };
  };
  // mosquitos em volta da lâmpada (F1 C2), em coordenadas novas
  props.parkLamp.fxNew = (ctx, p, world) => {
    if (!p.bugs) return;
    const cx = p.x * K + 6.5, cy = p.y * K + 6;
    for (let i = 0; i < 6; i++) {
      const a = world.t * (2 + i * 0.7) + i * 1.9;
      const x = Math.round(cx + Math.cos(a) * (7 + (i % 3) * 3)), y = Math.round(cy + Math.sin(a * 1.3) * 6);
      Gfx.rect(x, y, 1, 1, Math.sin(world.t * 9 + i) > 0.6 ? '#FFF4C0' : '#2A2030');
    }
  };

  // máquina de bebidas vermelha (sem marca): latas na vitrine, botões acesos, painel e a saída
  props.vending.art = () => {
    const s = A.surface(33, 53), RED = A.tones(['#6E1216', '#8E181C', '#AE2024', '#C82A2E', '#DE4446', '#F06A6A']);
    for (let y = 0; y < 51; y++) for (let x = 0; x < 32; x++) {
      let c;
      if (y < 3) c = pick(RED, 0.95 - x * 0.01, x, y);
      else if (x >= 27) c = pick(RED, 0.18 - (x - 27) * 0.04, x, y);
      else c = pick(RED, 0.78 - x * 0.02 + (x < 2 ? 0.25 : 0), x, y);
      s.put(x, y, c);
    }
    for (let y = 6; y < 27; y++) for (let x = 4; x < 24; x++) s.put(x, y, pick(A.tones(['#14161E', '#1E2230', '#2A3042']), 0.7 - (y - 6) / 26, x, y));
    const CANS = ['#E8E4D8', '#4A8CD8', '#E05A4A', '#F2C84E', '#58B86A', '#8A5AC8', '#F08A3A'];
    [8, 15].forEach((ry, r) => {
      for (let q = 0; q < 6; q++) {
        const cx = 5 + q * 3, col = CANS[(q * 3 + r * 2) % CANS.length];
        for (let j = 0; j < 5; j++) { s.put(cx, ry + j, col); s.put(cx + 1, ry + j, mix(col, '#000000', 0.25)); }
        s.put(cx, ry, mix(col, '#FFFFFF', 0.5));
        s.put(cx, ry + 6, '#7AE6FF');
      }
    });
    for (let x = 4; x < 24; x++) s.put(x, 23, '#3A4256');
    for (let q = 0; q < 18; q++) { const x = 7 + q, y = 7 + q; if (x < 24 && y < 27 && s.get(x, y)) s.put(x, y, mix(s.get(x, y), '#FFFFFF', 0.28)); }
    for (let y = 29; y < 37; y++) for (let x = 4; x < 24; x++) s.put(x, y, x === 4 || y === 29 ? '#F6F6F8' : '#D8DAE0');
    s.put(18, 31, '#2A2A30'); s.put(18, 32, '#2A2A30'); s.put(19, 31, '#4A4A54');
    for (let x = 7; x < 13; x++) s.put(x, 32, '#2A2A30');
    s.put(20, 34, '#5AE07A');
    for (let y = 40; y < 46; y++) for (let x = 5; x < 22; x++) s.put(x, y, y === 40 ? '#2A0A0C' : '#121218');
    for (let x = 5; x < 22; x++) s.put(x, 46, '#E4484A');
    for (let y = 49; y < 51; y++) for (let x = 0; x < 32; x++) s.put(x, y, '#4A0C10');
    s.outline();
    return { spr: s, dx: 0, dy: 0, base: 51, contact: [16, 51, 17, 2] };
  };

  // Banco de praça. p.view: 'back' (visto de trás: o encosto fica na frente das pessoas) ou
  // 'front' (de frente: o encosto fica atrás delas). p.night: madeira ao luar.
  props.parkBench.art = p => {
    const s = A.surface(76, 38);
    const WOOD = p.night ? A.tones(['#3A2A22', '#4E3A2C', '#634A36', '#7A5C42', '#8E6C4E', '#A2805E']) : A.tones(['#5E3A1E', '#7A4E2A', '#985F34', '#B57442', '#CD8C54', '#E0A86E']);
    const IRON = ['#56685F', '#34423D', '#1E2724'];
    const slat = (y0, h, x0 = 3, x1 = 73) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x1; x++) {
        let t = 0.62 - (y - y0) / h * 0.4 - x * 0.002 + (vnoise(x, y, 4, 70 + y0) - 0.5) * 0.2;
        if (y === y0) t += 0.3;
        if (h01(x, y0, 71) < 0.06 && y > y0) t -= 0.25;
        s.put(x, y, pick(WOOD, t, x, y));
      }
    };
    const legs = (y0, y1) => {
      for (const [x0, x1] of [[1, 5], [71, 75]]) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) s.put(x, y, x === x0 ? IRON[0] : x === x1 - 1 ? IRON[2] : IRON[1]);
    };
    if (p.view === 'front') {
      // de frente: encosto em cima (atrás de quem senta), assento, pés
      legs(0, 30);
      slat(1, 4); slat(6, 4); slat(11, 4);
      slat(17, 6);
      for (let x = 3; x < 73; x++) s.put(x, 23, WOOD[0]);
      for (let y = 24; y < 30; y++) { s.put(37, y, IRON[1]); s.put(38, y, IRON[2]); }
      s.outline();
      return { spr: s, dx: -6, dy: -4, base: 33, contact: [38, 31, 34, 2.5] };
    }
    // de trás: o encosto (duas ripas) na frente de quem senta, o assento aparecendo embaixo
    legs(10, 36);
    slat(10, 6); slat(17, 6); slat(25, 4);
    for (let y = 29; y < 36; y++) { s.put(37, y, IRON[1]); s.put(38, y, IRON[2]); }
    s.outline();
    return { spr: s, dx: -6, dy: 3, base: 36, contact: [38, 36, 34, 2] };
  };

  // árvore grande de copa redonda (p.night: ao luar)
  props.tree.art = p => {
    const s = A.surface(76, 88), R = leafOf(p), cx = 38;
    const BARK = p.night ? A.tones(['#1A1418', '#261C1E', '#342624', '#44342E', '#54443A']) : A.tones(['#35231A', '#4E3424', '#6A4A32', '#8A6646', '#A8835E']);
    for (let y = 50; y < 86; y++) {
      const half = 4 + (y > 79 ? (y - 79) * 0.9 : 0);
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        let t = 0.85 - (x - (cx - half)) / (2 * half) * 0.75 + (vnoise(x, y, 2, 80) - 0.5) * 0.35;
        if ((x + Math.floor(y / 3)) % 5 === 0) t -= 0.2;
        s.put(x, y, pick(BARK, t, x, y));
      }
    }
    const seed = (p.x | 0) * 7 + (p.y | 0);
    const parts = [[38, 36, 24], [22, 43, 15], [55, 43, 16], [30, 24, 16], [50, 22, 17], [38, 13, 14], [16, 32, 11], [61, 31, 11], [38, 49, 15]];
    parts.forEach(([px, py, r], q) => {
      for (let y = py - r; y <= py + r; y++) for (let x = px - r; x <= px + r; x++) {
        const nx = (x + 0.5 - px) / r, ny = (y + 0.5 - py) / r, rough = (vnoise(x, y, 3, seed + 90 + q) - 0.5) * 0.45;
        if (nx * nx + ny * ny > 1 + rough) continue;
        let t = sphere(clamp1(nx), clamp1(ny)) + (vnoise(x, y, 2.2, seed + 91 + q) - 0.5) * 0.55 - (q === 0 || q === 8 ? 0.1 : 0);
        if (h01(x, y, seed + 92) < 0.05) t += 0.3;
        s.put(x, y, pick(R, t + 0.08, x, y));
      }
    });
    s.outline(0.5);
    // o tronco nasce no meio do desenho velho (x 24, base 56): aqui em (38, 81)
    return { spr: s, dx: -8, dy: -11, base: 81, contact: [38, 81, 9, 2] };
  };

  // arbusto (p.night: ao luar)
  props.bush.art = p => {
    const s = A.surface(36, 24), R = leafOf(p), seed = 200 + (p.x | 0) + (p.y | 0) * 3;
    [[11, 13, 8], [21, 11, 9], [28, 14, 6], [7, 15, 5]].forEach(([cx, cy, r], q) => {
      for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r;
        if (nx * nx + ny * ny > 1 + (vnoise(x, y, 2, seed + q) - 0.5) * 0.5 || y > 20) continue;
        s.put(x, y, pick(R, sphere(clamp1(nx), clamp1(ny)) + (vnoise(x, y, 2, seed + 9 + q) - 0.5) * 0.5 + 0.12, x, y));
      }
    });
    s.outline(0.5);
    return { spr: s, dx: -2, dy: -1, base: 21, contact: [18, 21, 14, 2] };
  };

  // carrinho de sorvete: toldo listrado, vitrine com os potes e um sorvete desenhado na lateral
  props.iceCart.art = () => {
    const s = A.surface(50, 46), BLUE = A.tones(['#4E8EBA', '#6AA8D2', '#88C0E2', '#ABD6EE', '#D2EAF8']);
    for (let y = 8; y < 22; y++) { s.put(6, y, '#C8CCD4'); s.put(43, y, '#8E949E'); }
    for (let y = 0; y < 9; y++) for (let x = 2; x < 48; x++) {
      if (y === 8 && x % 4 === 2) continue;
      const stripe = Math.floor((x - 2) / 4) % 2 === 0;
      let c = stripe ? (y < 2 ? '#F79AB8' : '#EC6E96') : (y < 2 ? '#FFFFFF' : '#F6EAF0');
      if (y > 5) c = mix(c, '#000000', 0.12);
      s.put(x, y, c);
    }
    for (let y = 20; y < 37; y++) for (let x = 3; x < 47; x++) {
      let c = pick(BLUE, 0.82 - x * 0.012, x, y);
      if (y === 20) c = '#FFFFFF';
      if (y === 21) c = '#E8F4FC';
      if (y > 34) c = '#3E6E92';
      s.put(x, y, c);
    }
    [['#F7B6CC', 10], ['#B8EED8', 18], ['#FFF0C8', 26], ['#C89A70', 34]].forEach(([c, x]) => {
      for (let i = 0; i < 6; i++) { s.put(x + i, 17, mix(c, '#FFFFFF', 0.5)); s.put(x + i, 18, mix(c, '#FFFFFF', 0.3)); s.put(x + i, 19, c); }
    });
    for (let j = 0; j < 9; j++) for (let i = -Math.floor((8 - j) / 2); i <= Math.floor((8 - j) / 2); i++) s.put(25 + i, 26 + j, (i + j) % 3 === 0 ? '#B07A3A' : '#E0A860');
    for (const [cx, cy, c] of [[22, 24, '#F7A6C2'], [28, 24, '#A8E6CF'], [25, 21, '#FFF2D0']]) {
      for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (i * i + j * j <= 5) s.put(cx + i, cy + j, i + j < -1 ? mix(c, '#FFFFFF', 0.5) : c);
    }
    s.put(25, 18, '#E8404A');
    for (const wx of [11, 38]) for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
      const d = i * i + j * j;
      if (d <= 10) s.put(wx + i, 41 + j, d <= 2 ? '#C8CCD4' : d <= 5 ? '#2A2A30' : '#18181C');
    }
    s.outline();
    return { spr: s, dx: 0, dy: -1, base: 44, contact: [25, 44, 20, 2] };
  };

  // canteiro de flores redondo
  props.flowerBed.art = () => {
    const s = A.surface(70, 26), FL = ['#E8504A', '#F4CF4A', '#F49AC2', '#F8F6F0', '#9A6AD0', '#F49A3A'];
    for (let y = 0; y < 26; y++) for (let x = 0; x < 70; x++) {
      const nx = (x + 0.5 - 35) / 35, ny = (y + 0.5 - 13) / 12.5, d = nx * nx + ny * ny;
      if (d > 1) continue;
      if (d > 0.64) s.put(x, y, ny < -0.2 ? '#DCD5C6' : ny > 0.3 ? '#8E8676' : '#B9B1A2');
      else s.put(x, y, pick(A.tones(['#3E2A1E', '#5A3E2C', '#6E4E38']), 0.5 + (vnoise(x, y, 2, 120) - 0.5), x, y));
    }
    for (let q = 0; q < 52; q++) {
      const a = h01(q, 1, 121) * Math.PI * 2, r = Math.sqrt(h01(q, 2, 121)) * 0.72;
      const fx = Math.round(35 + Math.cos(a) * r * 28), fy = Math.round(13 + Math.sin(a) * r * 8.5), col = FL[q % FL.length];
      s.put(fx - 1, fy + 1, '#3E8A3A'); s.put(fx + 1, fy + 1, '#5AAA48'); s.put(fx, fy + 2, '#2E6A2C');
      s.put(fx, fy - 1, col); s.put(fx - 1, fy, col); s.put(fx + 1, fy, mix(col, '#000000', 0.15)); s.put(fx, fy + 1, mix(col, '#000000', 0.2));
      s.put(fx, fy, col === '#F4CF4A' ? '#C8742A' : '#FFE27A');
    }
    return { spr: s, dx: 0, dy: 0, shadow: false, contact: [35, 21, 30, 4] };
  };

  // pombos ciscando no caminho (p.at = [[x, y], ...], relativo ao objeto, coordenadas velhas)
  const PIGEON_COL = { h: '#8A909A', n: '#5AA88A', e: '#F09A4A', k: '#E88A6A', o: '#E8C070', b: '#9AA0AA', w: '#6E747E', W: '#4E525A' };
  const pigeonImgs = {};
  function pigeon(peck, flip) {
    const key = (peck ? 1 : 0) + (flip ? 2 : 0);
    if (pigeonImgs[key]) return pigeonImgs[key];
    const s = A.surface(11, 9);
    const P = [
      peck ? '.....hh....' : '...........',
      peck ? '....hhnn...' : '......hh...',
      peck ? '...bbnn.e..' : '.....hhne..',
      '..bbbbn.ko.',
      '.wbbbbbb...',
      'wwwbbbbb...',
      '.wwwWWbb...',
      '...k.k.....',
      '...........'
    ];
    P.forEach((row, y) => [...row].forEach((ch, x) => { if (PIGEON_COL[ch]) s.put(flip ? 10 - x : x, y, PIGEON_COL[ch]); }));
    s.put(flip ? 4 : 6, peck ? 2 : 1, '#2A2A30');
    s.outline(0.45);
    return (pigeonImgs[key] = s.canvas());
  }
  props.pigeons.fxNew = (ctx, p, world) => {
    (p.at || []).forEach(([dx, dy], i) => {
      const x = Math.round((p.x + dx) * K + Math.sin(world.t * 0.5 + i * 2) * 4), y = Math.round((p.y + dy) * K);
      const peck = Math.floor(world.t * 3 + i * 1.7) % 4 === 0;
      const flip = Math.sin(world.t * 0.5 + i * 2 + 1.57) < 0;
      ctx.save();
      ctx.globalAlpha = 0.25;
      Gfx.rect(x - 3, y + 1, 9, 1, '#1A2030');
      Gfx.rect(x - 2, y + 2, 7, 1, '#1A2030');
      ctx.restore();
      ctx.drawImage(pigeon(peck, flip), x - 5, y - 7);
    });
  };

  // ======================================================================
  //  F1 B1 · Iced tea at the café — fim de tarde: o sol baixo entra pelos janelões
  // ======================================================================
  const CAFE_WALL = A.tones(['#C8B496', '#D8C6A6', '#E6D6B8', '#EFE4CC', '#F6EEDC', '#FCF8EE']);
  const WIN_FRAME = A.tones(['#2E1C12', '#3E2618', '#4E3020', '#64402A', '#7A5236']);
  const TABLE_RED = A.tones(['#4A1E10', '#5E2818', '#743420', '#8A422A', '#9E5234', '#B26442', '#C67A54']);
  const CAFE_WIN = [[20, 135], [167, 146], [325, 135]];   // janelas: [x, largura]

  // piso de losangos grandes cinza e bege, encerado (o reflexo das janelas perto da parede)
  Art.floors.cafeDiamond = (S, look) => {
    const top = look.wall.height, D = 27;
    const GREY = A.tones(['#5E5C58', '#6E6C68', '#7E7C78', '#8E8C88', '#9E9C98']);
    const BEIGE = A.tones(['#B4A886', '#C4B898', '#D2C6A8', '#DED4BA', '#E8E0CA']);
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const u = (x + y) / D, v = (x - y + 1000) / D, fu = u - Math.floor(u), fv = v - Math.floor(v);
      const dark = (Math.floor(u) + Math.floor(v)) % 2 === 0, R = dark ? GREY : BEIGE;
      let t = 0.5 + (vnoise(x, y, 9, dark ? 81 : 82) - 0.5) * 0.25 - (y - top) / 600;
      if (fu < 0.04 || fv < 0.04) t -= 0.3;
      else if (fu > 0.95 || fv > 0.95) t += 0.25;
      S.put(x, y, pick(R, t, x, y));
    }
    // reflexo das janelas no piso encerado
    CAFE_WIN.forEach(([wx, ww]) => {
      for (let y = top; y < top + 46; y++) for (let x = wx + 4; x < wx + ww - 4; x++) {
        const a = (1 - (y - top) / 46) * 0.22 * (0.6 + 0.4 * Math.sin((x - wx) / ww * Math.PI));
        S.tput(x, y, '#FFF0D0', a + (bay(x, y) - 0.5) * 0.06);
      }
    });
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#9C8C84', (1 - (y - top) / 5) * 0.7);
  };

  // Parede creme com três janelões: lá fora, a rua no fim da tarde (fachadas do outro lado com a luz
  // dourada, um toldo listrado, as portas de enrolar, a calçada) e o reflexo no vidro
  Art.walls.cafe = (S, look) => {
    const h = look.wall.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c = pick(CAFE_WALL, 0.65 - y / h * 0.2 + (vnoise(x, y, 5, 83) - 0.5) * 0.12, x, y);
      if (y < 4) c = pick(WIN_FRAME, 0.5 + (y === 3 ? 0.3 : 0), x, y);
      S.put(x, y, c);
    }
    const SKY = A.tones(['#F2C890', '#F6D6A6', '#F8E2BE', '#FAEED6']);
    CAFE_WIN.forEach(([wx, ww], wi) => {
      const top = 6, bot = h - 7;
      for (let y = top - 2; y < bot + 2; y++) for (let x = wx - 2; x < wx + ww + 2; x++) S.put(x, y, pick(WIN_FRAME, 0.4 + (y === top - 2 || x === wx - 2 ? 0.3 : 0), x, y));
      // céu do fim de tarde
      for (let y = top; y < bot; y++) for (let x = wx; x < wx + ww; x++) S.put(x, y, pick(SKY, 0.8 - (y - top) / 12, x, y));
      // as fachadas do outro lado da rua (o sol baixo bate nelas)
      for (let bx = wx - Math.floor(h01(wi, 1, 84) * 10), q = 0; bx < wx + ww; q++) {
        const bw = 22 + Math.floor(h01(wi, q, 85) * 14), btop = top + 2 + Math.floor(h01(wi, q, 86) * 6);
        const F = A.tones([['#B8A890', '#C8B8A0', '#D8CCB4', '#E8DEC8'], ['#A8A0A0', '#BAB2B0', '#CCC4C0', '#DED8D2'], ['#C0A888', '#D2BC9C', '#E2D0B2', '#F0E2C8']][q % 3]);
        for (let y = btop; y < bot - 6; y++) for (let x = Math.max(bx, wx); x < Math.min(bx + bw, wx + ww); x++) {
          let t = 0.6 - (x - bx) / bw * 0.25 + (x - bx < 2 ? 0.2 : 0);
          // janelas das fachadas
          const lx = (x - bx - 3) % 7, ly = (y - btop - 3) % 8;
          if (x - bx > 2 && x - bx < bw - 3 && lx >= 0 && lx < 4 && ly >= 0 && ly < 4 && y < bot - 14) { S.put(x, y, ly === 0 ? '#6A7488' : pick(A.tones(['#8A98AC', '#A8B6C6', '#F6E2B4']), 0.4 + (h01(x - lx, y - ly, 87) < 0.15 ? 0.6 : 0), x, y)); continue; }
          S.put(x, y, pick(F, t, x, y));
        }
        // porta de enrolar (fechada) embaixo
        for (let y = bot - 14; y < bot - 6; y++) for (let x = Math.max(bx + 3, wx); x < Math.min(bx + bw - 3, wx + ww); x++) S.put(x, y, (y - bot) % 2 === 0 ? '#9A9C9E' : '#B8BABC');
        bx += bw + 1;
      }
      // um toldo listrado azul (o da simulação da rua)
      const ax = wx + 8 + wi * 9;
      for (let y = bot - 18; y < bot - 14; y++) for (let x = ax; x < ax + 34 && x < wx + ww; x++) S.put(x, y, Math.floor((x - ax) / 4) % 2 ? '#F2F2EE' : '#5A86B8');
      // calçada e o meio-fio
      for (let y = bot - 6; y < bot; y++) for (let x = wx; x < wx + ww; x++) S.put(x, y, y === bot - 6 ? '#C8C6C0' : pick(A.tones(['#8E8C88', '#A09E98', '#B2B0AA']), 0.6 - (y - bot + 6) * 0.08, x, y));
      // um poste e alguém passando lá fora
      const px = wx + 20 + wi * 31;
      for (let y = top + 6; y < bot - 3; y++) S.put(px, y, '#5E6470');
      const qx = wx + ww - 28 - wi * 11;
      S.rect(qx, bot - 13, 3, 3, '#3A3040'); S.rect(qx, bot - 10, 3, 6, ['#8A4A5A', '#4A6A8A', '#6A6A4A'][wi]); S.rect(qx, bot - 4, 1, 2, '#2A2030'); S.rect(qx + 2, bot - 4, 1, 2, '#2A2030');
      // o vidro: reflexo em faixas diagonais e o brilho dourado do sol
      for (let y = top; y < bot; y++) for (let x = wx; x < wx + ww; x++) {
        const d = (x - wx) + (y - top) * 1.4;
        if ((d > 10 && d < 22) || (d > 27 && d < 32)) S.tput(x, y, '#FFFFFF', 0.35);
        S.tput(x, y, '#FFD8A0', 0.12);
      }
      // caixilhos: um no meio e a travessa de cima
      const mx = wx + Math.floor(ww / 2);
      for (let y = top; y < bot; y++) { S.put(mx, y, WIN_FRAME[2]); S.put(mx + 1, y, WIN_FRAME[0]); }
      for (let x = wx; x < wx + ww; x++) { S.put(x, top + 17, WIN_FRAME[3]); S.put(x, top + 18, WIN_FRAME[1]); }
    });
    // peitoril claro embaixo das janelas
    for (let y = h - 5; y < h; y++) for (let x = 0; x < 480; x++) S.put(x, y, y === h - 5 ? '#FFF8E8' : pick(A.tones(['#B8A684', '#C8B898', '#DACCAE']), 0.7 - (y - h + 5) * 0.15, x, y));
  };

  // a luz dourada do fim de tarde entrando pelas janelas (por cima de tudo, bem fraca)
  Art.posts.cafe = (S, look) => {
    const h = look.wall.height;
    CAFE_WIN.forEach(([wx, ww]) => {
      for (let y = h - 6; y < 200; y++) {
        const f = (y - h + 6) / (200 - h + 6), sx = wx + 6 + (y - h) * 0.35, sw = ww - 12;
        for (let x = Math.floor(sx); x < sx + sw; x++) {
          const e = Math.min(x - sx, sx + sw - x) / 10;
          S.tput(x, y, '#FFD898', (1 - f) * 0.2 * Math.min(1, e) + (bay(x, y) - 0.5) * 0.05);
        }
      }
    });
  };
  // poeirinha brilhando na luz das janelas
  Art.scenefx.cafe = (ctx, ox, world) => {
    const t = world.t;
    for (let i = 0; i < 14; i++) {
      const [wx, ww] = CAFE_WIN[i % 3];
      const ph = (t * (0.02 + h01(i, 1, 310) * 0.03) + h01(i, 2, 310)) % 1;
      const y = Math.round(70 + h01(i, 4, 310) * 90 - ph * 20), x = Math.round(ox + wx + 10 + (y - 63) * 0.35 + h01(i, 3, 310) * (ww - 20) + Math.sin(t * 0.6 + i) * 4);
      const tw = Math.sin(t * 2.6 + i * 1.3);
      if (tw < -0.2) continue;
      ctx.globalAlpha = tw > 0.5 ? 0.85 : 0.45;
      Gfx.rect(x, y, 1, 1, '#FFF4D8');
    }
    ctx.globalAlpha = 1;
  };

  Art.edges.cafe = Scenery.woodEdgeArt(['#7A5636', '#9A7048', '#C8A070', '#E0BC8A', '#F2D8A8'], '#FFE4B8');

  // letreiro dourado no vidro (texto genérico do config.js), em itálico
  props.windowText.art = p => {
    const txt = Art.text(p.text || '', '#E8B84A', { italic: true, shadow: '#8A6A2A' }), s = A.surface(txt.width + 2, 12);
    s.draw(txt, 1, 1);
    return { spr: s, shadow: false };
  };

  // luminária pendente (globo branco) com a luz em volta
  props.pendant.art = () => {
    const s = A.surface(24, 26), cx = 12;
    for (let y = 0; y < 26; y++) for (let x = 0; x < 24; x++) {
      const r = Math.hypot(x - cx, (y - 15) * 1.1);
      if (r < 12) s.tput(x, y, '#FFF4D8', Math.pow(1 - r / 12, 1.5) * 0.5);
    }
    for (let y = 0; y < 9; y++) s.put(cx, y, '#3A2A22');
    s.rect(cx - 1, 8, 3, 2, '#5A4636');
    s.ball(cx + 0.5, 15, 5, 5, A.tones(['#D8D0C0', '#ECE6D8', '#F8F4EA', '#FFFFFF', '#FFFFFF']), 0.25);
    s.put(cx - 2, 12, '#FFFFFF'); s.put(cx - 1, 12, '#FFFFFF');
    return { spr: s, dx: -5, dy: 0, shadow: false };
  };

  // copo de chá gelado (alto, chá cor de âmbar, gelo e canudo), xícara e pratinho com doce
  function icedTea(s, x, y) {
    for (let j = 0; j < 10; j++) for (let i = 0; i < 5; i++) {
      let c = j < 3 ? '#E2ECEE' : pick(A.tones(['#7A3A16', '#A0582A', '#C27838', '#DC9A54']), 0.75 - i * 0.15 + (j === 3 ? 0.3 : 0), x + i, y + j);
      if (i === 0) c = mix(c, '#FFFFFF', 0.45);
      s.put(x + i, y + j, c);
    }
    s.put(x + 2, y + 4, '#F4F8F8'); s.put(x + 3, y + 5, '#E8F0F0');
    for (let j = -3; j < 6; j++) s.put(x + 3 + (j < 0 ? 1 : 0), y + j, '#F07A6A');
  }
  function coffeeCup(s, x, y) {
    s.ellipse(x + 3.5, y + 5, 4.5, 2, '#F4F2EC');
    s.rect(x + 1, y + 1, 5, 4, '#FFFFFF');
    s.rect(x + 2, y + 1, 3, 1, '#5A3420');
    s.put(x + 6, y + 2, '#E8E6E0'); s.put(x + 6, y + 3, '#E8E6E0');
  }
  function cakePlate(s, x, y) {
    s.ellipse(x + 6, y + 4, 6.5, 3, (px, py, nx, ny) => (nx * nx + ny * ny > 0.6 ? '#E4E2DA' : '#F8F6F0'));
    s.rect(x + 3, y + 1, 6, 4, '#F2D8A0');
    s.rect(x + 3, y + 1, 6, 1, '#FFF4DA');
    s.rect(x + 3, y + 3, 6, 1, '#C8723A');
    s.put(x + 6, y, '#E04A5A');
  }

  // mesa comprida de madeira avermelhada encostada nas janelas (p.tea, p.cups, p.plates: x velhos)
  props.longTable.art = p => {
    const w = kk(p.w), s = A.surface(w, 28);
    for (let y = 0; y < 23; y++) for (let x = 0; x < w; x++) {
      let t;
      if (y < 19) t = 0.6 + (vnoise(x * 0.15, y * 1.4, 3, 88) - 0.5) * 0.25 + (y === 0 ? 0.3 : 0) + (x === 0 ? 0.15 : 0) - (y === 18 ? 0.2 : 0) + Math.max(0, 1 - y / 6) * 0.12;
      else t = 0.28 - (y - 19) * 0.06;
      s.put(x, y, pick(TABLE_RED, t, x, y));
    }
    for (const lx of [3, w - 6]) for (let y = 23; y < 28; y++) for (let i = 0; i < 3; i++) s.put(lx + i, y, pick(TABLE_RED, 0.3 - i * 0.1, lx + i, y));
    (p.tea || []).forEach(tx => icedTea(s, kk(tx), 5));
    (p.cups || []).forEach(tx => coffeeCup(s, kk(tx) - 1, 6));
    (p.plates || []).forEach(tx => cakePlate(s, kk(tx), 5));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 9, contact: [w / 2, 27, w / 2 - 2, 1.5] };
  };

  // Balcão branco com a vitrine de doces e sanduíches, a caixa registradora e a máquina de café;
  // a frente de madeira
  props.cafeCounter.art = () => {
    const s = A.surface(140, 53), WOODF = A.tones(['#8A5A30', '#A87040', '#C08850', '#D49E62', '#E4B47A']);
    // tampo branco
    for (let y = 5; y < 15; y++) for (let x = 0; x < 140; x++) s.put(x, y, pick(A.tones(['#D8D4CA', '#E8E6DE', '#F4F2EC', '#FFFFFF']), 0.8 - (y - 5) * 0.05 + (y === 5 ? 0.3 : 0) - (y === 14 ? 0.4 : 0), x, y));
    // caixa registradora e máquina de café
    for (let y = 0; y < 10; y++) for (let x = 88; x < 105; x++) s.put(x, y, pick(A.tones(['#3A3E48', '#4A4E58', '#5E6472', '#7A808E']), 0.6 - (x - 88) * 0.03 + (y === 0 ? 0.3 : 0), x, y));
    s.rect(90, 2, 7, 2, '#7CE0A8');
    for (let y = 0; y < 12; y++) for (let x = 112; x < 127; x++) s.put(x, y, pick(STEEL_C, 0.7 - (x - 112) * 0.03 + (y === 0 ? 0.25 : 0), x, y));
    s.rect(115, 3, 9, 5, '#2A2E36'); s.rect(116, 9, 3, 3, '#FFFFFF'); s.rect(121, 9, 3, 3, '#FFFFFF');
    s.put(117, 8, '#5A3420'); s.put(122, 8, '#5A3420');
    // vitrine de vidro (dois andares: doces em cima, sanduíches embaixo)
    for (let y = 15; y < 40; y++) for (let x = 0; x < 80; x++) {
      const frame = x < 2 || x > 77 || y === 15 || y === 39 || y === 27;
      if (frame) { s.put(x, y, pick(STEEL_C, x < 2 || y === 15 ? 0.85 : 0.3, x, y)); continue; }
      s.put(x, y, pick(A.tones(['#9AC0CC', '#B8D8E2', '#D2ECF2', '#E8F8FC']), 0.6 - (y % 12) * 0.03, x, y));
    }
    const SWEETS = ['#D89A4A', '#F2D8A0', '#F09ABC', '#C8723A', '#FFF4DA', '#E8B86A'];
    for (let q = 0; q < 9; q++) {
      const x = 4 + q * 8, c = SWEETS[q % SWEETS.length];
      s.ellipse(x + 3, 23, 3.5, 2.5, (px, py, nx, ny) => pick(A.tones([mix(c, '#000000', 0.25), c, mix(c, '#FFFFFF', 0.4)].map(A.hex)), sphere(nx, ny), px, py));
      for (let i = 0; i < 6; i++) s.put(x + i, 26, '#E8E4DC');
      // sanduíches: pão branco com o recheio
      for (let i = 0; i < 6; i++) { s.put(x + i, 31, '#F8F4E8'); s.put(x + i, 32, q % 2 ? '#5DAA62' : '#F2C84E'); s.put(x + i, 33, '#F8F4E8'); s.put(x + i, 34, '#E8E0CC'); }
      s.put(x + 1, 35, '#4A8A50'); s.put(x + 4, 35, '#4A8A50');
    }
    // reflexo no vidro da vitrine
    for (let q = 0; q < 22; q++) { const x = 8 + q, y = 16 + q; if (y < 39) s.put(x, y, '#FFFFFF', 0.45); }
    // frente de madeira com as ripas
    for (let y = 15; y < 48; y++) for (let x = 80; x < 140; x++) {
      let t = 0.6 - (x - 80) / 60 * 0.2 - (y - 15) / 33 * 0.15 + ((x - 80) % 10 === 0 ? -0.3 : (x - 80) % 10 === 1 ? 0.15 : 0);
      s.put(x, y, pick(WOODF, t, x, y));
    }
    for (let y = 40; y < 48; y++) for (let x = 0; x < 80; x++) s.put(x, y, pick(WOODF, 0.45 - (y - 40) * 0.04, x, y));
    for (let x = 0; x < 140; x++) { s.put(x, 48, WOODF[0]); s.put(x, 49, '#3A2414'); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 49, contact: [70, 49, 70, 2] };
  };
  const STEEL_C = A.tones(['#5E6472', '#7A808E', '#969CAA', '#B4BAC6', '#D6DAE2']);

  // cavalete com o cardápio escrito a giz
  props.menuBoard.art = () => {
    const s = A.surface(20, 30), WOODB = A.tones(['#4A2E18', '#6A4228', '#8A5A30', '#A87040']);
    for (let y = 1; y < 24; y++) for (let x = 2; x < 18; x++) {
      const frame = x < 4 || x > 15 || y < 3 || y > 21;
      s.put(x, y, frame ? pick(WOODB, x < 4 || y < 3 ? 0.8 : 0.4, x, y) : pick(A.tones(['#1E2220', '#262A28', '#303432']), 0.5 + (vnoise(x, y, 3, 89) - 0.5) * 0.5, x, y));
    }
    for (let q = 0; q < 6; q++) for (let i = 0; i < 7 - (q % 3); i++) s.put(5 + (q % 2) + i, 5 + q * 3, q === 0 ? '#F2C84E' : i % 4 === 3 ? '#262A28' : '#E8E8E0');
    s.put(13, 17, '#F09ABC'); s.put(12, 18, '#F09ABC');
    for (let y = 22; y < 30; y++) { s.put(3, y, WOODB[1]); s.put(4, y, WOODB[0]); s.put(15, y, WOODB[1]); s.put(16, y, WOODB[0]); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 29, contact: [10, 29, 7, 1.5] };
  };

  // mesinha redonda de dois lugares
  props.smallTable.art = p => {
    const s = A.surface(28, 28);
    for (let y = 14; y < 26; y++) { s.put(13, y, '#3A2A22'); s.put(14, y, '#2A1C16'); }
    for (let x = 8; x < 20; x++) s.put(x, 25, x < 14 ? '#4A3A32' : '#2A1C16');
    s.ellipse(14, 8, 14, 8, (x, y, nx, ny) => (ny > 0.55 ? pick(TABLE_RED, 0.2, x, y) : pick(TABLE_RED, 0.45 + sphere(nx * 0.6, ny) * 0.4, x, y)));
    if (p.cups) { coffeeCup(s, 5, 2); icedTea(s, 16, 0); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: -1, base: 26, contact: [14, 26, 7, 1.5] };
  };

  // ======================================================================
  //  F1 B2 · Planetarium — a cúpula rosa com bolhas de luz, o aro azul, o carpete escuro e as camas
  //  redondas de veludo azul (a luz rosa e roxa do ambiente vem do look.tint)
  // ======================================================================
  const DOME = A.tones(['#4A1A78', '#6A2294', '#8E2CAE', '#B034C2', '#D040CC', '#E85AD8', '#F47EE2', '#FCA8EE']);
  const VELVET = A.tones(['#101A4A', '#16245E', '#1E3076', '#283E92', '#3450AC', '#4464C4', '#5A7CD8', '#7896E8']);

  Art.floors.planetarium = (S, look) => {
    const top = look.wall.height;
    const CARPET = A.tones(['#0C0A1E', '#120F28', '#181434', '#1E1A40', '#26214E']);
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      let t = 0.45 + (vnoise(x, y, 6, 90) - 0.5) * 0.3 + (h01(x, y, 91) - 0.5) * 0.25;
      S.put(x, y, pick(CARPET, t, x, y));
    }
    // o reflexo rosa da cúpula no chão, perto da parede, em pontilhado
    for (let y = top; y < top + 40; y++) for (let x = 0; x < 480; x++) {
      const a = Math.pow(1 - (y - top) / 40, 1.6) * (0.45 + 0.2 * Math.sin(x / 37 + 1));
      S.tput(x, y, '#7A3AA8', a + (bay(x, y) - 0.5) * 0.1);
    }
    // luzinhas de chão marcando os caminhos
    for (let x = 18; x < 480; x += 35) for (const ly of [top + 67, top + 107]) {
      S.put(x, ly, '#B89AF8'); S.put(x + 1, ly, '#8A6AD8');
      S.tput(x - 1, ly, '#6A4AA8', 0.5); S.tput(x + 2, ly, '#6A4AA8', 0.5); S.tput(x, ly - 1, '#6A4AA8', 0.4); S.tput(x, ly + 1, '#6A4AA8', 0.4);
    }
  };

  // a cúpula: projeção rosa e roxa com bolhas de luz (bokeh) e o aro azulado embaixo, com os alto-falantes
  Art.walls.dome = (S, look) => {
    const h = look.wall.height, rim = h - 10;
    for (let y = 0; y < rim; y++) for (let x = 0; x < 480; x++) {
      const t = 0.2 + y / rim * 0.55 + (vnoise(x, y, 18, 92) - 0.5) * 0.3 + (vnoise(x, y, 6, 93) - 0.5) * 0.1;
      S.put(x, y, pick(DOME, t, x, y));
    }
    for (let q = 0; q < 26; q++) {
      const bx = h01(q, 1, 94) * 480, by = 3 + h01(q, 2, 94) * (rim - 8), r = 3 + h01(q, 3, 94) * 6;
      for (let y = Math.floor(by - r); y <= by + r; y++) for (let x = Math.floor(bx - r); x <= bx + r; x++) {
        if (y < 0 || y >= rim) continue;
        const d = Math.hypot(x + 0.5 - bx, y + 0.5 - by) / r;
        if (d > 1) continue;
        S.tput(x, y, '#FFD8F6', (d > 0.8 ? 0.55 : 0.4) * (0.6 + h01(q, 4, 94) * 0.4) + (bay(x, y) - 0.5) * 0.08);
      }
    }
    // o aro: borda clara em cima, a faixa azul e a sombra embaixo
    for (let y = rim; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y === rim) c = '#9AA0E0';
      else if (y === rim + 1) c = '#7078C0';
      else if (y >= h - 2) c = '#161838';
      else c = pick(A.tones(['#2A2E66', '#363C7E', '#444C96', '#5058A8']), 0.7 - (y - rim) / 10 * 0.5, x, y);
      S.put(x, y, c);
    }
    for (let x = 50; x < 480; x += 120) {
      S.ellipse(x, rim + 5, 5, 2, (px, py, nx, ny) => (ny < -0.2 ? '#08081A' : '#141632'));
      S.put(x - 2, rim + 4, '#5A60A8');
    }
  };

  Art.edges.dark = Scenery.woodEdgeArt(['#0E0E22', '#16162E', '#22264E', '#2E3466', '#3E4486'], '#9A5AD8');

  // estrelas piscando na cúpula
  props.domeStars.fxNew = (ctx, p, world) => {
    for (let i = 0; i < 40; i++) {
      const v = h01(i, 1, 99), sx = Math.round(p.x * K + v * 476), sy = Math.round(2 + h01(i, 2, 99) * 40);
      const on = Math.sin(world.t * (1 + (i % 3)) + i * 1.7);
      if (on < 0.1) continue;
      Gfx.rect(sx, sy, 1, 1, i % 4 ? '#FFFFFF' : '#FFE0F8');
      if (on > 0.85 && i % 5 === 0) {
        ctx.globalAlpha = 0.7;
        Gfx.rect(sx - 2, sy, 2, 1, '#F8D8F4'); Gfx.rect(sx + 1, sy, 2, 1, '#F8D8F4');
        Gfx.rect(sx, sy - 2, 1, 2, '#F8D8F4'); Gfx.rect(sx, sy + 1, 1, 2, '#F8D8F4');
        ctx.globalAlpha = 1;
      }
    }
  };

  // Cama redonda do planetário (como no Manten de Nagoia): a concha em forma de tigela, azul-ardósia,
  // o colchão estampado de galáxia (azul, roxo e verde-água, com estrelinhas) e as almofadas
  // redondas, uma grafite e uma verde-água, atrás das cabeças (p.pillows: 'left', padrão, ou
  // 'right'). Quem deita nela fica com o meio do corpo em x + 34 (velho) e a base em y + 21 / y + 34.
  const SHELL = A.tones(['#1A2034', '#242C46', '#2E3A5A', '#3C4A70', '#4E5E88', '#64769E', '#8092B6']);
  const GALAXY = A.tones(['#141844', '#1E2260', '#2C2C7A', '#3E3A92', '#4A58A8', '#3E86B4', '#4AB0C0', '#8ADCD8']);
  const PIL_DARK = A.tones(['#1C1E26', '#262934', '#323644', '#424756', '#565C6E']);
  const PIL_TEAL = A.tones(['#1E6A6E', '#2A8888', '#3CA8A4', '#5EC6BE', '#92E2D6']);
  props.roundBed.art = p => {
    const s = A.surface(86, 56), seed = 95 + (p.x | 0);
    // a concha: o lado de fora (embaixo, na sombra), a borda de cima clara e o colchão dentro
    s.ellipse(43, 30, 42.5, 25, (x, y, nx, ny) => pick(SHELL, 0.32 - ny * 0.12 - nx * 0.1 + (vnoise(x, y, 4, seed) - 0.5) * 0.08, x, y));
    s.ellipse(43, 26, 41.5, 22, (x, y, nx, ny) => pick(SHELL, 0.62 - ny * 0.2 - nx * 0.12 + (ny < -0.6 ? 0.15 : 0), x, y));
    s.ellipse(43, 27, 36, 18, (x, y, nx, ny) => {
      // galáxia: ruído torcido em faixas, mais claro no meio da "via láctea"
      const wx = x + (vnoise(x, y, 9, seed + 1) - 0.5) * 16, wy = y + (vnoise(x, y, 9, seed + 2) - 0.5) * 10;
      const band = Math.exp(-Math.pow((wy - 27 - (wx - 43) * 0.35) / 7, 2));
      let t = 0.25 + band * 0.55 + (vnoise(wx, wy, 4, seed + 3) - 0.5) * 0.3 - (nx * nx + ny * ny > 0.8 ? 0.15 : 0);
      if (h01(x, y, seed + 4) < 0.025) return '#FFFFFF';
      if (h01(x, y, seed + 5) < 0.02) return '#C8D8FF';
      return pick(GALAXY, t, x, y);
    });
    // as almofadas redondas (uma por cabeça) e um rolo grafite entre elas
    const px = p.pillows === 'right' ? 48 : 17;
    [[6, PIL_DARK], [24, PIL_TEAL]].forEach(([py, R], i) => {
      s.ball(px + 10, py + 8.5, 7.5, 6.5, R, 0.1);
      s.put(px + 7, py + 5, i ? '#C8F4EC' : '#7A8094');
    });
    for (let y = 20; y < 26; y++) for (let x = px + 1; x < px + 19; x++) {
      const ny = (y + 0.5 - 23) / 3;
      if (Math.abs(ny) <= 1) s.put(x, y, pick(PIL_DARK, sphere(0, ny) + 0.05, x, y));
    }
    s.outline(0.45);
    return { spr: s, dx: 0, dy: 2, shadow: 'flat', H: 4, contact: [43, 50, 40, 4] };
  };

  // ======================================================================
  //  F1 C1 · Dinner at Saizeriya — restaurante italiano familiar (sem logo), à noitinha: luz quente
  //  do teto e o céu do anoitecer na janela
  // ======================================================================
  const TERRA = A.tones(['#7A3E24', '#8E4C2E', '#A45C38', '#B86C44', '#C87C52', '#D68E62', '#E2A276']);
  const SOFA_G = A.tones(['#16301E', '#1E3E28', '#284E32', '#33603E', '#3E7A4A', '#4E8E5A', '#62A26C', '#7AB682']);
  const BEIGE_WOOD = A.tones(['#8A5E34', '#A27444', '#B88852', '#C89A62', '#D6AC76', '#E2BE8C', '#ECD0A6']);
  const GOLD_F = A.tones(['#6A4A1A', '#8A6626', '#B08A3A', '#CCA650', '#E4C470', '#F6E09A']);

  // piso de lajotas de terracota, uma a uma com o tom um pouco diferente e o rejunte claro
  Art.floors.terracotta = (S, look) => {
    const top = look.wall.height, T = 18;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const tx = Math.floor(x / T), ty = Math.floor((y - top) / T), fx = x % T, fy = (y - top) % T;
      if (fx === 0 || fy === 0) { S.put(x, y, pick(A.tones(['#7A5A44', '#9A7A62', '#B49680']), 0.5 + (h01(x, y, 101) - 0.5) * 0.4, x, y)); continue; }
      let t = 0.5 + (h01(tx, ty, 102) - 0.5) * 0.3 + (vnoise(x, y, 4, 103) - 0.5) * 0.2;
      if (fx === 1 || fy === 1) t += 0.22;
      if (fx === T - 1 || fy === T - 1) t -= 0.18;
      // brilho da luz do teto nas lajotas perto da parede
      t += Math.max(0, 1 - (y - top) / 50) * 0.1;
      S.put(x, y, pick(TERRA, t, x, y));
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#9C8478', (1 - (y - top) / 5) * 0.7);
  };

  // parede amarelo-creme com a sanca de madeira, a luz quente das arandelas e o lambri de painéis
  Art.walls.saizeriya = (S, look) => {
    const h = look.wall.height, rail = h - 19;
    const PL = A.tones(['#C8A86E', '#D8BC84', '#E6CE9C', '#EED9A8', '#F6E6C0', '#FCF2D8']);
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 5) c = pick(DARKWOOD_C, 0.5 + (y === 4 ? 0.3 : 0) - (y === 0 ? 0.2 : 0), x, y);
      else if (y < rail) c = pick(PL, 0.62 - (y - 5) / (rail - 5) * 0.25 + (vnoise(x, y, 3, 104) - 0.5) * 0.18 + (h01(x, y, 105) < 0.05 ? -0.15 : 0), x, y);
      else if (y < rail + 2) c = y === rail ? '#A87444' : '#6A4026';
      else {
        const px = (x - 4) % 20, py = y - rail - 4;
        const panel = px >= 0 && px < 16 && py >= 0 && py < 11;
        let t = 0.4 + (vnoise(x * 0.3, y, 3, 106) - 0.5) * 0.15 - (y - rail) / 19 * 0.15;
        if (panel) t += (px === 0 || py === 0) ? -0.2 : (px === 15 || py === 10) ? 0.15 : 0.08;
        c = pick(DARKWOOD_C, t, x, y);
      }
      S.put(x, y, c);
    }
    // as arandelas: luz quente em leque na parede
    for (const lx of [90, 250, 370]) {
      for (let y = 5; y < rail; y++) for (let x = lx - 26; x < lx + 26; x++) {
        const dy = y - 5, spread = 6 + dy * 0.9, d = Math.abs(x - lx) / spread;
        if (d < 1) S.tput(x, y, '#FFF4D0', (1 - d) * (1 - dy / (rail - 5)) * 0.5);
      }
      S.rect(lx - 3, 5, 7, 3, '#C8A050'); S.rect(lx - 2, 8, 5, 2, '#FFF6D8'); S.put(lx - 3, 5, '#F2D27A');
    }
    for (let x = 0; x < 480; x++) S.put(x, h - 1, '#2E190F');
  };
  const DARKWOOD_C = A.tones(['#3A2214', '#4E2E1C', '#623A24', '#76482E', '#8A5A38', '#A06C46']);

  // quadro clássico genérico na moldura dourada (p.art: 0 paisagem, 1 figura)
  props.painting.art = p => {
    const s = A.surface(40, 30);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 38; x++) {
      const fr = Math.min(x, y, 37 - x, 27 - y);
      if (fr < 3) { s.put(x, y, pick(GOLD_F, (fr === 0 ? 0.3 : fr === 1 ? 0.85 : 0.55) + (x < y ? 0.1 : -0.1) + (h01(x, y, 107) - 0.5) * 0.2, x, y)); continue; }
      // a tela: céu, campo e o que estiver pintado
      const u = (x - 3) / 31, v = (y - 3) / 21;
      let c = pick(A.tones(['#6A8AB0', '#8AAAC8', '#C8C8B4', '#E2D6B0']), 0.9 - v * 1.4 + (vnoise(x, y, 4, 108) - 0.5) * 0.3, x, y);
      if (p.art === 1) {
        // retrato: fundo escuro e quente, a moça de cabelo escuro com o vestido vermelho
        c = pick(A.tones(['#2A2418', '#3E3424', '#544632', '#6A5A40']), 0.75 - v * 0.6 - Math.abs(u - 0.5) * 0.4 + (vnoise(x, y, 5, 109) - 0.5) * 0.3, x, y);
        const fx = (x + 0.5 - 19) / 3.6, fy = (y + 0.5 - 11) / 4.2;
        const hair = Math.hypot((x + 0.5 - 19) / 5, (y + 0.5 - 10.5) / 5.6) < 1 && !(fx * fx + fy * fy < 1 && y > 8);
        if (hair || (y > 10 && y < 18 && Math.abs(x + 0.5 - 19) < 5 && Math.abs(x + 0.5 - 19) > 3.4)) c = pick(A.tones(['#1E140E', '#2E2016', '#46301E']), 0.6 - (x - 15) * 0.05, x, y);
        if (fx * fx + fy * fy < 1 && y > 8) c = pick(A.tones(['#B8805A', '#D8A07A', '#F0C29C']), sphere(clamp1(fx), clamp1(fy)) + 0.1, x, y);
        if (y >= 15 && y < 17 && Math.abs(x + 0.5 - 19) < 1.5) c = '#C88A62';
        if (y >= 17 && Math.abs(x + 0.5 - 19) < 4 + (y - 17) * 0.7) c = pick(A.tones(['#7A2420', '#9A3028', '#B83A2E', '#D85A46']), 0.75 - (x - 15) * 0.06, x, y);
      } else {
        // paisagem: colinas verdes, uma árvore e o rio
        if (v > 0.45 + Math.sin(u * 5) * 0.08) c = pick(A.tones(['#3E5A2E', '#4E6E3A', '#6A8A4A', '#8AA65E']), 0.7 - (v - 0.45) * 1.2 + (vnoise(x, y, 3, 110) - 0.5) * 0.3, x, y);
        if (v > 0.75 && Math.abs(u - 0.5 - (v - 0.75)) < 0.12) c = '#9ABCD8';
        if (Math.hypot(x - 27, (y - 10) * 1.2) < 5) c = pick(A.tones(['#2E4A26', '#3E6232', '#56803E']), sphere((x - 27) / 5, (y - 10) / 5), x, y);
        if (x === 27 && y > 13 && y < 19) c = '#4A3420';
      }
      s.put(x, y, c);
    }
    for (let y = 2; y < 30; y++) s.put(38, y, '#140F1E', 0.3);
    for (let x = 2; x < 39; x++) s.put(x, 28, '#140F1E', 0.3);
    return { spr: s, shadow: false };
  };

  // janela com o céu do anoitecer (roxo em cima, laranja embaixo) e os prédios com as luzes acesas
  props.duskWindow.art = () => {
    const s = A.surface(46, 34), SKYD = A.tones(['#3A3070', '#5A4084', '#8A5288', '#B8667E', '#E08868', '#F2A860', '#F8C878']);
    for (let y = 0; y < 33; y++) for (let x = 0; x < 45; x++) {
      const fr = x < 3 || x > 41 || y < 3 || y > 29;
      if (fr) { s.put(x, y, pick(DARKWOOD_C, (x < 3 || y < 3 ? 0.65 : 0.35), x, y)); continue; }
      s.put(x, y, pick(SKYD, (y - 3) / 24, x, y));
    }
    // prédios em silhueta com janelas acesas
    for (let bx = 3, q = 0; bx < 42; q++) {
      const bw = 5 + Math.floor(h01(q, 1, 111) * 5), bt = 16 + Math.floor(h01(q, 2, 111) * 8);
      for (let y = bt; y < 30; y++) for (let x = bx; x < Math.min(bx + bw, 42); x++) {
        const win = (x - bx) % 3 === 1 && (y - bt) % 3 === 2 && h01(x, y, 112) < 0.45;
        s.put(x, y, win ? '#F8D88A' : y === bt ? '#4A3E5A' : '#2E2640');
      }
      bx += bw;
    }
    s.put(10, 7, '#FFFFFF'); s.put(31, 10, '#F8E8F8');
    for (let y = 3; y < 30; y++) { s.put(22, y, DARKWOOD_C[3]); s.put(23, y, DARKWOOD_C[1]); }
    for (let x = 3; x < 42; x++) s.put(x, 30, '#E8D8B8');
    return { spr: s, shadow: false };
  };

  // Sofá verde. p.dir: 'right' = encosto à esquerda, assento virado para a direita; 'left' = o
  // contrário; 'down' = encosto em cima, de frente para baixo
  props.sofa.art = p => {
    if (p.dir === 'down') {
      const w = kk(p.w || 48), s = A.surface(w, 25);
      for (let y = 0; y < 24; y++) for (let x = 0; x < w; x++) {
        let t;
        if (y < 11) {
          const seg = ((x - 1) % 20) / 20;
          t = 0.35 + sphere(clamp1(seg * 2 - 1), clamp1((y - 4) / 7)) * 0.3 + (y === 0 ? 0.2 : 0);
          if ((x - 1) % 20 === 0) t = 0.12;
        } else if (y < 20) t = 0.55 - (y - 11) / 9 * 0.15 + (y === 11 ? 0.25 : 0) - (y === 19 ? 0.15 : 0);
        else t = 0.15 - (y - 20) * 0.03;
        s.put(x, y, pick(SOFA_G, t + (vnoise(x, y, 3, 113) - 0.5) * 0.08, x, y));
      }
      s.outline(0.5);
      return { spr: s, shadow: 'flat', H: 3 };
    }
    const hh = kk(p.h || 40), s = A.surface(20, hh), back = p.dir === 'right' ? 0 : 11;
    for (let y = 0; y < hh; y++) for (let x = 0; x < 20; x++) {
      const inBack = x >= back && x < back + 9;
      let t;
      if (inBack) t = 0.3 + sphere(clamp1((x - back - 4.5) / 4.5), 0) * 0.35 + (y === 0 ? 0.2 : 0) - (y === hh - 1 ? 0.2 : 0);
      else {
        const seg = (y - 2) % 23;
        t = 0.5 + (p.dir === 'right' ? -(x - 9) * 0.02 : (x - 0) * -0.02) + (seg === 0 ? -0.3 : seg === 1 ? 0.18 : 0) - (y === hh - 1 ? 0.25 : 0);
      }
      s.put(x, y, pick(SOFA_G, t + (vnoise(x, y, 3, 114) - 0.5) * 0.08, x, y));
    }
    s.outline(0.5);
    return { spr: s, shadow: 'flat', H: 4, contact: [10, hh - 1, 10, 1.5] };
  };

  // pratos (no tamanho novo): macarrão, pizza, copo de refrigerante e salada
  function plateBase(s, x, y, w, hh) {
    s.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, (px, py, nx, ny) => (nx * nx + ny * ny > 0.6 ? (ny > 0 ? '#D8D6CE' : '#FFFFFF') : '#F6F4EE'));
  }
  const FOOD = {
    pasta(s, x, y) {
      plateBase(s, x, y, 13, 9);
      s.ellipse(x + 6.5, y + 4.5, 4.2, 2.8, (px, py, nx, ny) => pick(A.tones(['#D8A840', '#F2CC60', '#FFE48A']), sphere(nx, ny) + ((px + py) % 3 === 0 ? -0.2 : 0), px, py));
      s.rect(x + 5, y + 3, 3, 2, '#D8443A'); s.put(x + 5, y + 3, '#F06A5A');
      s.put(x + 8, y + 5, '#5DAA62');
    },
    pizza(s, x, y) {
      plateBase(s, x, y, 15, 11);
      s.ellipse(x + 7.5, y + 5.5, 6.2, 4.2, (px, py, nx, ny) => (nx * nx + ny * ny > 0.65 ? '#E0A858' : pick(A.tones(['#D85A2E', '#E8743A', '#F4925A']), sphere(nx, ny), px, py)));
      [[4, 4], [9, 5], [6, 7], [10, 3]].forEach(([i, j]) => s.put(x + i, y + j, '#FFF4DA'));
      s.put(x + 7, y + 3, '#5DAA62'); s.put(x + 5, y + 6, '#5DAA62');
      s.line(x + 7, y + 2, x + 7, y + 9, '#C8843E');
    },
    glass(s, x, y, drink) {
      for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) s.put(x + i, y + j, j === 0 ? '#FFFFFF' : j < 2 ? '#DDE6F0' : i === 0 ? mix(drink, '#FFFFFF', 0.4) : drink);
    },
    salad(s, x, y) {
      plateBase(s, x, y, 10, 8);
      s.ellipse(x + 5, y + 4, 3.5, 2.5, (px, py, nx, ny) => pick(A.tones(['#3E8A3A', '#5AAA4A', '#86CA6A']), sphere(nx, ny) + (h01(px, py, 115) - 0.5) * 0.5, px, py));
      s.put(x + 4, y + 3, '#E85A4A'); s.put(x + 6, y + 4, '#F2D04A');
    }
  };

  // mesa de madeira clara com a comida (p.food: lista de [tipo, x, y], velhos)
  props.diningTable.art = p => {
    const w = kk(p.w), hh = kk(p.h), s = A.surface(w, hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
      let t;
      if (y < hh - 4) t = 0.58 + (vnoise(x * 0.2, y * 1.3, 3, 116) - 0.5) * 0.2 + (y === 0 ? 0.3 : 0) + (x === 0 ? 0.12 : 0) - (y === hh - 5 ? 0.18 : 0);
      else t = 0.28 - (y - hh + 4) * 0.06;
      s.put(x, y, pick(BEIGE_WOOD, t, x, y));
    }
    (p.food || []).forEach(([kind, fx, fy]) => FOOD[kind] && FOOD[kind](s, kk(fx), kk(fy), A.rgb(p.drink || '#E8A040')));
    s.outline(0.5);
    return { spr: s, shadow: 'flat', H: 9, contact: [w / 2, hh - 1, w / 2 - 1, 1.5] };
  };

  // drink bar: bancada de inox com as máquinas de bebida, os copos e a pia
  props.drinkBar.art = () => {
    const s = A.surface(70, 45);
    [[2, '#4A505C'], [30, '#5A4A5C']].forEach(([mx, col]) => {
      const M = A.ramp(col, { n: 6 });
      for (let y = 0; y < 26; y++) for (let x = mx; x < mx + 25; x++) s.put(x, y, pick(M, 0.65 - (x - mx) * 0.02 + (y < 2 ? 0.3 : 0) + (x === mx ? 0.15 : 0), x, y));
      for (let y = 4; y < 12; y++) for (let x = mx + 3; x < mx + 22; x++) s.put(x, y, pick(A.tones(['#14161C', '#1E222A', '#2A2E38']), 0.6 - (y - 4) * 0.06, x, y));
      ['#E85A4A', '#F2C84E', '#5DAA62', '#4A8AD8'].forEach((b, i) => { s.rect(mx + 4 + i * 5, 7, 3, 3, b); s.put(mx + 4 + i * 5, 7, mix(b, '#FFFFFF', 0.5)); });
      for (const nx of [mx + 6, mx + 16]) { s.rect(nx, 15, 3, 5, '#B8C0CC'); s.put(nx, 15, '#E2E8F0'); s.put(nx + 1, 20, '#8E96A4'); }
    });
    // os copos empilhados
    for (let y = 4; y < 22; y++) for (let x = 57; x < 68; x++) s.put(x, y, ((y - 4) % 4 === 0) ? '#B8C4D2' : x === 57 ? '#F4F8FC' : '#DDE6F0', 0.9);
    // a bancada de inox
    for (let y = 22; y < 43; y++) for (let x = 0; x < 70; x++) {
      let t = y < 25 ? 0.9 - (y - 22) * 0.1 : 0.55 - (y - 25) / 18 * 0.25 - x * 0.002;
      if (y === 33) t -= 0.3;
      s.put(x, y, pick(STEEL_C, t, x, y));
    }
    for (const gx of [5, 37]) { s.rect(gx, 27, 8, 4, '#DDE6F0'); s.rect(gx, 27, 8, 1, '#FFFFFF'); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 43, contact: [35, 43, 35, 2] };
  };

  // ======================================================================
  //  F1 C2 · A kiss in the park — parque de bairro à noite (o ambiente azulado e a luz dos postes
  //  vêm do look.tint; aqui as cores são as do luar, um pouco mais claras que o resultado)
  // ======================================================================
  const DIRT = A.tones(['#6A5A44', '#7E6C52', '#927E62', '#A69072', '#B8A282', '#C8B494']);
  const GRASS_N = A.tones(['#2A4A30', '#335838', '#3C6640', '#467448', '#528252', '#60905E', '#70A06A']);

  Art.floors.dirtNight = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      let t = 0.5 + (vnoise(x, y, 16, 120) - 0.5) * 0.35 + (vnoise(x, y, 4, 121) - 0.5) * 0.25 + (h01(x, y, 122) - 0.5) * 0.18;
      S.put(x, y, pick(DIRT, t, x, y));
      // pedrinhas
      if (h01(x, y, 123) < 0.012) { S.put(x, y, DIRT[5]); S.put(x + 1, y, DIRT[1]); S.put(x, y + 1, DIRT[1]); }
    }
    // grama nas bordas: uma faixa em cima (embaixo das árvores) e outra embaixo
    for (let x = 0; x < 480; x++) {
      const gTop = top + 4 + Math.floor(vnoise(x, 0, 9, 124) * 9), gBot = 240 - 12 - Math.floor(vnoise(x, 1, 9, 125) * 10);
      for (let y = top; y < 240; y++) {
        if (y > gTop && y < gBot) continue;
        let t = 0.45 + (vnoise(x, y, 5, 126) - 0.5) * 0.4 + (h01(x, y, 127) - 0.5) * 0.3;
        if (y === gTop || y === gBot) t -= 0.25;
        S.put(x, y, pick(GRASS_N, t, x, y));
      }
      // tufos passando para a terra
      if (h01(x, 2, 128) < 0.3) S.put(x, gBot - 1, GRASS_N[3]);
      if (h01(x, 3, 128) < 0.3) S.put(x, gTop + 1, GRASS_N[2]);
    }
    for (let y = top; y < top + 6; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#6E7890', (1 - (y - top) / 6) * 0.7);
  };

  // céu noturno com estrelas e a lua, e a mata densa no fundo (o luar marca as copas de cima)
  Art.walls.nightTrees = (S, look) => {
    const h = look.wall.height, SKYN = A.tones(['#0C1030', '#121840', '#1A2250', '#242E62', '#303C74']);
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYN, y / 34 + (vnoise(x, y, 30, 130) - 0.5) * 0.1, x, y));
    for (let q = 0; q < 70; q++) {
      const sx = Math.floor(h01(q, 1, 131) * 480), sy = Math.floor(h01(q, 2, 131) * 30), b = h01(q, 3, 131);
      S.put(sx, sy, b < 0.2 ? '#FFFFFF' : b < 0.6 ? '#C8CCE8' : '#7A80B0');
    }
    // a lua crescente com o halo
    const MX = 66, MY = 13;
    for (let y = 0; y < 34; y++) for (let x = MX - 24; x < MX + 24; x++) {
      const r = Math.hypot(x - MX, y - MY);
      if (r < 22) S.tput(x, y, '#8A94D0', Math.pow(1 - r / 22, 2) * 0.5);
    }
    S.ellipse(MX, MY, 7, 7, (x, y, nx, ny) => {
      if (Math.hypot(x + 0.5 - MX - 3.5, y + 0.5 - MY + 1.5) < 6.2) return null;
      return pick(A.tones(['#C8C4A8', '#E2DEC0', '#F4F0D8', '#FFFCEC']), 0.8 - nx * 0.3 + (h01(x, y, 132) < 0.1 ? -0.3 : 0), x, y);
    });
    // a mata: duas camadas de copas escuras, com o luar em cima à esquerda (embaixo delas, folhas na
    // sombra, para o céu não aparecer entre uma camada e a outra)
    for (let y = 34; y < h; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(LEAF_N, 0.08 + (vnoise(x, y, 3, 139) - 0.5) * 0.25, x, y));
    for (let x = -8, q = 0; x < 490; x += 11 + Math.floor(h01(q, 1, 133) * 7), q++) lump(S, x, 30 + h01(q, 2, 133) * 8, 12 + h01(q, 3, 133) * 5, -0.18, 140 + q, LEAF_N);
    for (let y = h - 14; y < h; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(LEAF_N, 0.15 + (vnoise(x, y, 3, 134) - 0.5) * 0.3, x, y));
    for (let x = -4, q = 0; x < 490; x += 12 + Math.floor(h01(q, 1, 135) * 6), q++) lump(S, x, h - 10 + h01(q, 2, 135) * 4, 9 + h01(q, 3, 135) * 4, -0.05, 180 + q, LEAF_N);
    for (let x = 0; x < 480; x++) { S.put(x, h - 1, '#0E1C18'); S.put(x, h - 2, mix(S.get(x, h - 2), '#0E1C18', 0.5)); }
  };

  // vagalumes piscando perto das árvores
  Art.scenefx.nightTrees = (ctx, ox, world) => {
    const t = world.t;
    for (let i = 0; i < 12; i++) {
      const on = Math.sin(t * (0.8 + h01(i, 1, 320) * 0.9) + i * 2.1);
      if (on < 0.55) continue;
      const x = Math.round(ox + h01(i, 2, 320) * 470 + Math.sin(t * 0.4 + i) * 10), y = Math.round(72 + h01(i, 3, 320) * 160 + Math.cos(t * 0.5 + i * 1.3) * 6);
      ctx.globalAlpha = (on - 0.55) / 0.45;
      Gfx.rect(x, y, 1, 1, '#E8FF9A');
      ctx.globalAlpha *= 0.4;
      Gfx.rect(x - 1, y, 3, 1, '#B8F070'); Gfx.rect(x, y - 1, 1, 3, '#B8F070');
    }
    ctx.globalAlpha = 1;
  };

  // mata fechada nas laterais (com a passagem)
  Art.edges.trees = (S, x, top, gap, side) => {
    const x0 = side === 'left' ? x : x - 7;
    const segs = gap ? [[top - 10, gap[0]], [gap[1], 240]] : [[top - 10, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 12; i++) {
        const px = x0 + i, inner = side === 'left' ? i : 11 - i;
        if (inner > 8 && h01(px, y, 136) < (inner - 8) / 4) continue;
        let t = 0.3 + (vnoise(px, y, 2.5, 137) - 0.5) * 0.6 - inner * 0.02;
        if (h01(px, y, 138) < 0.05) t += 0.3;
        S.put(px, y, pick(LEAF_N, t, px, y));
      }
    });
  };

  // brinquedo de mola do parquinho (um pintinho amarelo com o assento vermelho)
  props.springRider.art = () => {
    const s = A.surface(23, 33), Y = A.tones(['#B07818', '#D09A26', '#E8B83A', '#F2D060', '#FCE690']);
    for (let k = 0; k < 6; k++) for (let i = 0; i < 6; i++) s.put(8 + i, 17 + k * 2, i < 2 ? '#B8C0CC' : i < 4 ? '#8E96A4' : '#5E6470');
    for (let y = 28; y < 32; y++) for (let x = 3; x < 19; x++) s.put(x, y, y === 28 ? '#8E94A0' : '#4E5462');
    s.ellipse(10, 10, 9, 7, (x, y, nx, ny) => pick(Y, sphere(nx, ny) + 0.1, x, y));
    s.ellipse(17, 5, 4.5, 4.5, (x, y, nx, ny) => pick(Y, sphere(nx, ny) + 0.15, x, y));
    s.put(18, 4, '#2A2030'); s.put(19, 3, '#FFFFFF');
    s.rect(21, 5, 2, 2, '#E8803A'); s.put(21, 5, '#F8A060');
    for (let y = 4; y < 8; y++) for (let x = 5; x < 12; x++) s.put(x, y, pick(A.tones(['#9A2420', '#C8342E', '#E85A4A']), 0.7 - (y - 4) * 0.15, x, y));
    s.put(3, 10, Y[1]); s.put(2, 9, Y[2]); s.put(2, 11, Y[1]);
    s.outline(0.5);
    return { spr: s, dx: -2, dy: 0, base: 31, contact: [11, 31, 8, 1.5] };
  };

  // as ferramentas daqui que as outras fases reaproveitam (grama, nuvem, prédios ao longe, moita de
  // copa, as folhas de dia e à noite)
  Art.kit = Object.assign(Art.kit || {}, { grass, cloud, skyline, lump, stonePath, LEAF, LEAF_N, GRASS, GRASS_N });
})();
