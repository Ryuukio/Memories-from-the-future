// Personagens da V2 (sprites de 26×48, estilo chibi), montados a partir dos moldes de
// data/sprites*.js e das roupas de data/characters*.js, com cache. É o mesmo sistema da V1
// (cabeça + tronco + pernas + acessórios, pintados pela paleta da roupa, com estampas), mas o
// desenho muda (V2_32BITS.md, seção 4):
//   - cada letra da paleta vira uma rampa de 7 tons gerada da cor base: a sombra puxa para o
//     roxo-azulado e a luz para o amarelo; a passagem de um tom para o outro é pontilhada (Bayer 4×4);
//   - a luz vem de cima e da esquerda: cada parte do molde (pernas, tronco, braço, cabeça, cada
//     acessório) é "estufada" pela distância até a borda dela, e a normal dessa superfície escolhe o
//     tom da rampa (a cabeça vira uma esfera, os braços e as pernas, cilindros);
//   - a parte de cima faz sombra na de baixo (o queixo no pescoço, a barra da camisa nas pernas);
//   - contorno seletivo: o contorno de fora é calculado em volta do sprite, com a cor de dentro
//     escurecida (mais claro do lado da luz). Nos moldes, "o" é só o contorno de dentro.
// O ponto de apoio é o meio da base: desenhe em (x - 13, y - 47).
//
// Chars.sprite('ELLEN_NOW', { pose, dir, head, frame, eyes, cover })
//   pose   'walk' (padrão), 'sit' (sentado; dir = para onde o corpo está virado) ou
//          'lie' (deitado de barriga para cima, na horizontal; dir = lado da cabeça, 'left' ou
//          'right'; head = 'sky' olhando para cima, ou 'up'/'down' virando para o lado de cima
//          ou de baixo da tela, no beijo). O deitado fica na horizontal (≈ 43×26).
//          'floor' = sentado no chão (ou na cama) de pernas cruzadas (dir: as 4 direções).
//          'swim' = nadando de bruços, visto de cima, na direção dir (de lado fica na horizontal).
//          'photo' = de frente, com a mão levantada fazendo "V" (pose para a foto).
//   dir    'right' | 'left' | 'down' | 'up'
//   head   para onde a cabeça olha (padrão: dir). Sentado de lado, a cabeça pode virar de frente.
//   frame  andando: -1 parado, 0 a 3 o ciclo de 4 quadros; sentado: 0 normal, 1 braço à frente
//   eyes   'closed' = olhos fechados (beijo)
//   cover  deitado: cor da coberta por cima do corpo (ex.: '#1E2A4A')
//
// Letras dos moldes (Apêndice E.2, mais as da V2): "." vazio, "o" contorno de dentro, "_" apaga;
// s/S pele, h/H/j cabelo (base, brilho, sombra), r/R/q raiz do cabelo meio a meio, e olho,
// E íris (padrão: o olho clareado), "*" brilho do olho (branco), g armação, l reflexo da lente,
// L lente (padrão: pele; nos óculos escuros, a armação), d sobrancelha, m boca, b bochecha ou
// barba, c/C/Q roupa de cima, k camada de dentro, u ombro, a/A manga, v/V antebraço, p/P parte de
// baixo, n/N canela, f/F calçado, w/W curativo e cordões; x/X/y/z/t/T/i dos acessórios.
//
// Na roupa (data/characters*.js), extras: ['NOME', ...] põe acessórios e penteados por cima da
// cabeça: SPRITES.NOME = { down: [linhas], side: [linhas, virado para a direita], up: [linhas],
// dy: 0, under: false }. As linhas têm 26 colunas e começam na linha dy do sprite (0 = topo);
// under: true = só onde está vazio. Chars.HEADS, Chars.BODIES e Chars.PATTERNS aceitam novos.
const Chars = (() => {
  const W = 26, H = 48;                       // tamanho do sprite
  const TORSO_Y = 19, LEGS_Y = 33;            // onde começam o tronco e as pernas (em pé)
  const OUT = '#1E1826';
  const cache = {};

  const HEADS = {
    ellen: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' },
    fabio: { side: 'HEAD_FABIO_SIDE', down: 'HEAD_FABIO_FRONT', up: 'HEAD_FABIO_BACK' },
    man:   { side: 'HEAD_MAN_SIDE',   down: 'HEAD_MAN_FRONT',   up: 'HEAD_MAN_BACK' },
    woman: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' }
  };

  // troncos e pernas de cada corpo (slim e reg: camisa, blusa ou regata genérica)
  const BODIES = {
    coat:   { legs: 'SLIM', side: 'TORSO_COAT_SIDE',   down: 'TORSO_COAT_FRONT',   up: 'TORSO_COAT_BACK' },
    hoodie: { legs: 'REG',  side: 'TORSO_HOODIE_SIDE', down: 'TORSO_HOODIE_FRONT', up: 'TORSO_HOODIE_BACK' },
    slim:   { legs: 'SLIM', side: 'TORSO_SLIM_SIDE',   down: 'TORSO_SLIM_FRONT',   up: 'TORSO_SLIM_BACK' },
    reg:    { legs: 'REG',  side: 'TORSO_REG_SIDE',    down: 'TORSO_REG_FRONT',    up: 'TORSO_REG_BACK' }
  };

  // ciclo de andar, quanto o tronco desce em cada quadro e o braço de lado (balançando)
  const CYCLE = { side: ['A', 'PASS', 'B', 'PASS'], front: ['A', 'IDLE', 'B', 'IDLE'] };
  const BOB = { A: 1, B: 1, PASS: 0, IDLE: 0 };
  const SWING = { A: 'ARM_SIDE_BACK', B: 'ARM_SIDE_FWD', PASS: 'ARM_SIDE', IDLE: 'ARM_SIDE' };

  // cabelo meio a meio: até que linha da cabeça vai a raiz loiro-escura
  const HALF_HAIR = { h: 'r', H: 'R', j: 'q' };
  const HALF_ROWS = { side: 10, down: 10, up: 9 };

  // partes do sprite: a ordem (quem fica por cima) e o raio da "estufada" de cada uma
  const PART = { LEGS: 1, BODY: 2, ARM: 3, HEAD: 4, EXTRA: 5 };
  const RADIUS = { 1: 2.5, 2: 4, 3: 1.6, 4: 7.5 };

  // estampas, em coordenadas do sprite (o tamanho da V2: flores e bolinhas um pouco maiores)
  const PATTERNS = {
    floral: (x, y) => { const fx = (x + ((y / 5 | 0) % 2) * 3) % 6, fy = y % 5; return (fx === 2 && fy !== 2 && fy < 4 && fy > 0) || (fy === 2 && (fx === 1 || fx === 3)); },
    ribbed: x => x % 2 === 1,
    rips: (x, y) => (x * 3 + y * 7) % 13 === 0 || (x * 3 + y * 7) % 13 === 3 && y % 3 === 0,
    stripes: (x, y) => y % 3 === 0,                  // listras horizontais
    check: (x, y) => (x >> 1) % 2 !== (y >> 1) % 2,  // xadrez de 2 px
    dots: (x, y) => x % 4 === (y % 8 < 4 ? 1 : 3) && y % 4 === 1,   // bolinhas
    waves: (x, y) => { const cx = x % 6 - 2.5, cy = (y + ((x / 6 | 0) % 2) * 2) % 4; return cy === 0 ? Math.abs(cx) > 1 : cy === 1 && Math.abs(cx) > 2; }   // seigaiha
  };

  const sideKey = d => (d === 'left' || d === 'right' ? 'side' : d);

  // ---------- grade do sprite: letra e parte de cada pixel ----------
  function grid(w = W, h = H) {
    return { w, h, ch: Array.from({ length: h }, () => Array(w).fill('.')), pt: Array.from({ length: h }, () => Array(w).fill(0)) };
  }

  // põe um molde na grade, deslocado (dx, dy). under: só onde está vazio
  function put(g, rows, dx, dy, part, under) {
    rows.forEach((row, y) => {
      const yy = y + dy;
      if (yy < 0 || yy >= g.h) return;
      for (let x = 0; x < row.length; x++) {
        const c = row[x], xx = x + dx;
        if (c === '.' || xx < 0 || xx >= g.w) continue;
        if (c === '_') { g.ch[yy][xx] = '.'; g.pt[yy][xx] = 0; continue; }
        if (under && g.ch[yy][xx] !== '.') continue;
        g.ch[yy][xx] = c;
        g.pt[yy][xx] = part;
      }
    });
  }

  function mirror(g) {
    g.ch.forEach(r => r.reverse());
    g.pt.forEach(r => r.reverse());
    return g;
  }

  // gira a grade: 'left'/'right' = 90° (a cabeça vai para esse lado), 'down' = 180°
  function turn(g, dir) {
    if (dir === 'up') return g;
    if (dir === 'down') { g.ch.reverse(); g.pt.reverse(); return mirror(g); }
    const out = grid(g.h, g.w);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      // right: o topo vai para a direita; left: para a esquerda
      const nx = dir === 'right' ? g.h - 1 - y : y, ny = dir === 'right' ? x : g.w - 1 - x;
      out.ch[ny][nx] = g.ch[y][x];
      out.pt[ny][nx] = g.pt[y][x];
    }
    return out;
  }

  // corta as linhas vazias de baixo (o deitado é mais curto que o sprite em pé)
  function cropBottom(g, keep) {
    g.ch.length = keep; g.pt.length = keep; g.h = keep;
    return g;
  }

  // troca letras até a linha `to` (cabelo meio a meio); a divisa sobe e desce 1 px de coluna em
  // coluna, como raiz crescida
  const swap = (rows, to, map) => rows.map((r, y) => r.replace(/./g, (c, x) => (y <= to + ((x * 5) % 3) - 1 ? map[c] || c : c)));

  // olhos fechados: de cada coluna do olho sobra só o pixel de baixo, escuro
  function closeEyes(rows) {
    const eye = c => c === 'e' || c === 'E' || c === '*';
    return rows.map((row, y) => row.replace(/./g, (c, x) => {
      if (!eye(c)) return c;
      return rows[y + 1] && eye(rows[y + 1][x]) ? 's' : 'e';
    }));
  }

  // ---------- rampas de cor ----------
  const ramps = {};
  const SHADE = '#2E2660', LIGHT = '#FFF4D2';
  function ramp(hex) {
    if (ramps[hex]) return ramps[hex];
    const [r, g, b] = Gfx.rgb(hex);
    const dark = k => {
      const m = 1 - 0.15 * k;
      return Gfx.mix(Gfx.hex(Math.round(r * m), Math.round(g * m), Math.round(b * m)), SHADE, 0.09 * k);
    };
    const light = k => Gfx.mix(hex, LIGHT, 0.15 * k + (Gfx.lum(hex) < 0.2 ? 0.04 * k : 0));
    return (ramps[hex] = [dark(3), dark(2), dark(1), hex, light(1), light(2), light(3)].map(Gfx.rgb));
  }

  // pontilhado só na passagem de um tom para o outro (SHARP: quanto maior, mais estreita a faixa
  // pontilhada); no meio de cada faixa, o tom fica liso
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bay = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
  const SHARP = 2.4;
  function pick(rp, t, x, y) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const f = t * (rp.length - 1);
    let i = Math.floor(f);
    const fr = Math.max(0, Math.min(1, (f - i - 0.5) * SHARP + 0.5));
    if (fr > bay(x, y)) i++;
    return rp[Math.min(rp.length - 1, i)];
  }

  // luz de cima e da esquerda (um pouco de frente: o jogo é visto de cima)
  const L = (() => { const v = [-0.5, -0.62, 0.6], m = Math.hypot(...v); return v.map(a => a / m); })();
  const FLAT = { e: 1, E: 1, l: 1, '*': 1, m: 1, d: 1 };

  // Pinta a grade: rampa de cada letra + luz da "estufada" + sombra de quem está por cima +
  // contorno. pattern(letra, x, y) pode devolver a cor de uma estampa naquele pixel.
  function paint(g, palette, pattern) {
    const { w, h, ch, pt } = g, N = w * h;
    const member = (x, y, p) => x >= 0 && y >= 0 && x < w && y < h && pt[y][x] === p && ch[y][x] !== '.' && ch[y][x] !== 'o';
    // distância até a borda da parte (chanfro 1 / 1,4)
    const dist = new Float32Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) dist[y * w + x] = member(x, y, pt[y][x]) ? 1e9 : 0;
    const relax = (x, y, p, dx, dy, c) => {
      const xx = x + dx, yy = y + dy;
      const v = xx < 0 || yy < 0 || xx >= w || yy >= h || !member(xx, yy, p) ? 0 : dist[yy * w + xx];
      if (v + c < dist[y * w + x]) dist[y * w + x] = v + c;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!dist[y * w + x]) continue;
      const p = pt[y][x];
      relax(x, y, p, -1, 0, 1); relax(x, y, p, 0, -1, 1); relax(x, y, p, -1, -1, 1.4); relax(x, y, p, 1, -1, 1.4);
    }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
      if (!dist[y * w + x]) continue;
      const p = pt[y][x];
      relax(x, y, p, 1, 0, 1); relax(x, y, p, 0, 1, 1); relax(x, y, p, 1, 1, 1.4); relax(x, y, p, -1, 1, 1.4);
    }
    // altura: perfil de círculo até o raio da parte
    const hgt = new Float32Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = dist[y * w + x];
      if (!d) continue;
      const R = RADIUS[pt[y][x]] || 3, k = Math.min(1, (d - 0.5) / R);
      hgt[y * w + x] = R * Math.sqrt(1 - (1 - k) * (1 - k));
    }
    const H0 = (x, y, p) => (member(x, y, p) ? hgt[y * w + x] : 0);

    const col = Array(N).fill(null);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = ch[y][x];
      if (c === '.' || c === 'o') continue;
      if (c === '*') { col[y * w + x] = [255, 255, 255]; continue; }
      const base = (pattern && pattern(c, x, y)) || palette[c];
      if (!base) { warn(c); col[y * w + x] = [255, 0, 255]; continue; }
      if (FLAT[c]) { col[y * w + x] = Gfx.rgb(base); continue; }
      const p = pt[y][x];
      const gx = (H0(x + 1, y, p) - H0(x - 1, y, p)) / 2, gy = (H0(x, y + 1, p) - H0(x, y - 1, p)) / 2;
      const m = Math.hypot(gx, gy, 1), dot = (-gx * L[0] - gy * L[1] + L[2]) / m - L[2];
      let t = 0.5 + dot * (dot > 0 ? 0.42 : 0.3);
      t += 0.04 - 0.08 * (y / h);                           // de cima para baixo, um pouco mais escuro
      // sombra de quem está por cima (o queixo, a franja, a barra da roupa)
      if (y > 0 && pt[y - 1][x] > p && ch[y - 1][x] !== '.') t -= 0.2;
      else if (y > 1 && pt[y - 2][x] > p && ch[y - 2][x] !== '.') t -= 0.09;
      col[y * w + x] = pick(ramp(base), t, x, y);
    }

    const dk = (rgb, k) => Gfx.rgb(Gfx.mix(Gfx.hex(...rgb.map(Math.round)), OUT, k));
    const lumOf = c => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    // contorno de dentro ("o"): a cor vizinha mais escura, escurecida
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]], diag = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (ch[y][x] !== 'o') continue;
      let best = null;
      for (const ring of [near, diag]) {
        for (const [dx, dy] of ring) {
          const c = x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < h ? col[(y + dy) * w + x + dx] : null;
          if (c && (!best || lumOf(c) < lumOf(best))) best = c;
        }
        if (best) break;
      }
      col[y * w + x] = best ? dk(best, 0.45) : Gfx.rgb(OUT);
    }
    // contorno de fora: em volta de tudo, com a cor de dentro escurecida (mais claro do lado da luz)
    const outer = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (col[y * w + x]) continue;
      let best = null, lit = true;
      for (const [dx, dy] of near) {
        const c = x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < h ? col[(y + dy) * w + x + dx] : null;
        if (!c) continue;
        if (dx < 0 || dy < 0) lit = false;
        if (!best || lumOf(c) < lumOf(best)) best = c;
      }
      if (best) outer.push([x, y, dk(best, lit ? 0.5 : 0.66)]);
    }
    outer.forEach(([x, y, c]) => { col[y * w + x] = c; });

    const cv = Gfx.canvas(w, h), img = cv.cx.createImageData(w, h), d = img.data;
    for (let i = 0; i < N; i++) {
      const c = col[i];
      if (!c) continue;
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    cv.cx.putImageData(img, 0, 0);
    return cv;
  }

  const warned = {};
  function warn(c) {
    if (warned[c]) return;
    warned[c] = true;
    console.warn('Sprite: a letra "' + c + '" não tem cor na paleta');
  }

  // ---------- roupas ----------
  // cores-base de um NPC → paleta completa (a rampa faz a luz e a sombra de cada letra)
  function expand(c, woman) {
    const dark = (h, t = 0.28) => Gfx.mix(h, '#1E1826', t);
    const light = (h, t = 0.22) => Gfx.mix(h, '#FFFFFF', t);
    const S = dark(c.skin, 0.18);
    const bareArms = c.sleeves === 'none', bareLegs = c.legs === 'bare';
    return {
      s: c.skin, S, m: Gfx.mix(c.skin, '#7A2E2E', 0.45), e: '#2A2030',
      b: c.beard || (woman ? Gfx.mix(c.skin, '#F2ABA3', 0.5) : c.skin),
      d: Gfx.mix(c.hair, '#1E1512', 0.4), g: c.glasses || c.skin, l: c.glasses ? '#FFFFFF' : c.skin,
      h: c.hair, H: light(c.hair, 0.2), j: dark(c.hair, 0.3),
      c: c.top, C: dark(c.top), Q: light(c.top), k: c.inner || c.top,
      u: bareArms ? c.skin : c.top, a: bareArms ? c.skin : c.top, A: bareArms ? S : dark(c.top),
      v: c.sleeves === 'long' ? c.top : c.skin, V: c.sleeves === 'long' ? dark(c.top) : S,
      p: c.bottom, P: dark(c.bottom), n: bareLegs ? c.skin : c.bottom, N: bareLegs ? S : dark(c.bottom),
      f: c.shoes, F: dark(c.shoes, 0.25), w: '#F6F6F2', W: '#CFCFC5'
    };
  }

  function outfit(id) {
    const o = CHARACTERS[id];
    if (!o) throw new Error('Roupa desconhecida: ' + id);
    if (!o._palette) {
      const p = o.palette || expand(o.colors, o.head === 'woman' || o.head === 'ellen');
      // cordões do moletom (W) e curativo (w): quem não tem fica com a cor da roupa;
      // antebraço (v/V): quem não diz fica com o braço de fora
      // (no jaleco e no moletom, a manga é comprida: o antebraço é da cor da manga)
      const long = o.body === 'coat' || o.body === 'hoodie';
      const full = Object.assign({ w: p.c, W: p.c, v: long ? p.a || p.c : p.s, V: long ? p.A || p.C : p.S }, p, o.add || {});
      // íris (E): o olho clareado; lente (L): pele, ou escura nos óculos escuros (olho = armação)
      if (!full.E) full.E = full.e === full.g ? full.e : Gfx.mix(full.e, '#6A7AB0', 0.42);
      if (!full.L) full.L = full.e === full.g ? Gfx.mix(full.g, full.l, 0.25) : full.s;
      o._palette = full;
    }
    return o;
  }

  // ---------- montagem ----------
  function headRows(o, dir, eyes) {
    const k = sideKey(dir);
    let rows = SPRITES[HEADS[o.head][k]];
    if (o.hair === 'half') rows = swap(rows, HALF_ROWS[k], HALF_HAIR);
    if (o.bandage) rows = bandage(rows);
    if (eyes === 'closed') rows = closeEyes(rows);
    return rows;
  }

  // curativo do Fabio do presente: uma faixa branca na testa (linhas 5 a 7 da cabeça)
  function bandage(rows) {
    return rows.map((r, y) => (y >= 5 && y <= 7 ? r.replace(/[^.o]/g, y === 7 ? 'W' : 'w') : r));
  }

  // acessórios e penteados da roupa (extras), na direção da cabeça; cada um é uma parte
  function extras(g, o, dir, dx, dy) {
    (o.extras || []).forEach((name, i) => {
      const ex = SPRITES[name];
      if (!ex) throw new Error('Acessório sem molde em SPRITES: ' + name);
      let part = ex[sideKey(dir)];
      if (!part) return;
      if (dir === 'left') part = part.map(r => [...r].reverse().join(''));
      put(g, part, dx, (ex.dy || 0) + dy, PART.EXTRA + i, ex.under);
    });
  }

  // monta a grade do sprite (antes de virar para a esquerda ou girar)
  function compose(o, pose, dir, head, frame, eyes, cover) {
    const g = grid();
    const k = sideKey(dir), left = dir === 'left';
    let hdx = 0, hdy = 0, flip = left;

    if (pose === 'lie') {
      put(g, SPRITES.BODY_LIE, 0, TORSO_Y, PART.BODY);
      if (cover) put(g, SPRITES.BLANKET, 0, TORSO_Y + 2, PART.EXTRA + 8);
    } else if (pose === 'floor') {
      // o corpo é mais curto: tudo desce para os pés ficarem na base
      const body = k === 'side' ? SPRITES.BODY_FLOOR_SIT_SIDE : k === 'up' ? SPRITES.BODY_FLOOR_SIT_BACK : SPRITES.BODY_FLOOR_SIT;
      hdy = k === 'side' ? 11 : 10;
      put(g, body, 0, TORSO_Y + hdy, PART.BODY);
      if (k === 'side') {
        put(g, SPRITES.ARM_SIDE, 0, TORSO_Y + hdy, PART.ARM);
        if (head === 'down' || head === 'up') hdx = -3;
      }
    } else if (pose === 'sit') {
      if (k === 'down') put(g, SPRITES.BODY_FRONT_SIT, 0, TORSO_Y, PART.BODY);
      else if (k === 'up') put(g, SPRITES.BODY_BACK_SIT, 0, TORSO_Y, PART.BODY);
      else {
        put(g, SPRITES.BODY_SIT, 0, TORSO_Y, PART.BODY);
        put(g, frame === 1 ? SPRITES.ARM_SIDE_FWD : SPRITES.ARM_SIDE, 0, TORSO_Y, PART.ARM);
        // cabeça de frente ou de costas num corpo de lado: centraliza sobre o tronco
        if (head === 'down' || head === 'up') hdx = -2;
      }
    } else {
      // andando ou parado ('walk'), e a pose da foto (de frente, parada)
      const b = BODIES[o.body];
      const step = frame < 0 ? 'IDLE' : CYCLE[k === 'side' ? 'side' : 'front'][frame % 4];
      put(g, SPRITES['LEGS_' + b.legs + '_' + (k === 'side' ? 'SIDE' : 'FRONT') + '_' + step], 0, LEGS_Y, PART.LEGS);
      hdy = BOB[step];
      put(g, SPRITES[b[k]], 0, TORSO_Y + hdy, PART.BODY);
      if (k === 'side') put(g, SPRITES[SWING[step]], 0, TORSO_Y + hdy, PART.ARM);
    }
    // a cabeça segue a direção da cabeça; num corpo de lado virado para a esquerda, o deslocamento
    // é espelhado junto com o corpo
    const hrows = headRows(o, head, eyes);
    const hflip = head === 'left';
    if (flip) mirror(g);
    const hx = flip ? -hdx : hdx;
    put(g, hflip ? hrows.map(r => [...r].reverse().join('')) : hrows, hx, hdy, PART.HEAD);
    extras(g, o, head, hx, hdy);
    if (pose === 'photo') put(g, SPRITES.PHOTO_ARM, 0, 0, PART.EXTRA + 9);
    return g;
  }

  function paletteOf(o, cover) {
    let palette = o._palette;
    if (cover) palette = Object.assign({}, palette, { x: cover, X: Gfx.mix(cover, '#07060E', 0.35), y: Gfx.mix(cover, '#FFFFFF', 0.18) });
    return palette;
  }

  function patternOf(o) {
    const pats = o.patterns || [];
    return pats.length ? (ch, x, y) => {
      for (const p of pats) if (p.on.includes(ch) && PATTERNS[p.rule](x, y)) return p.color;
      return null;
    } : null;
  }

  function build(id, pose, dir, head, frame, eyes, cover) {
    const o = outfit(id);
    return paint(compose(o, pose, dir, head, frame, eyes, cover), paletteOf(o, cover), patternOf(o));
  }

  // Deitado: monta a pessoa de barriga para cima (cabeça de frente = olhando o céu), corta o que
  // sobra embaixo e gira 90° para a cabeça ficar do lado `dir` (antes de pintar: a luz continua
  // vindo de cima e da esquerda). Girando para a esquerda, o lado direito do molde fica em cima.
  const LIE_HEAD = { left: { up: 'right', down: 'left' }, right: { up: 'left', down: 'right' } };
  function lying(id, dir, look, eyes, cover) {
    const o = outfit(id);
    const g = compose(o, 'lie', 'down', look === 'sky' ? 'down' : LIE_HEAD[dir][look], -1, eyes, cover);
    return paint(turn(cropBottom(g, SPRITES.LIE_LENGTH), dir), paletteOf(o, cover), patternOf(o));
  }

  // Nadando de bruços: a pessoa de costas, andando (as pernas batem), girada para a direção do nado.
  function swimming(id, dir, frame, eyes) {
    const o = outfit(id);
    return paint(turn(compose(o, 'walk', 'up', 'up', frame, eyes), dir), paletteOf(o), patternOf(o));
  }

  // esquis e bastões, por baixo da pessoa: as pontas aparecem na frente dos pés
  function skis(ctx, x, y, dir) {
    const K = '#1C1D24', H1 = '#E8ECF2', L1 = '#C9CED6', D = '#5E6470';
    const R = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
    if (dir === 'left' || dir === 'right') {
      const s = dir === 'right' ? 1 : -1;
      [y - 3, y + 1].forEach(yy => {
        R(x - 18, yy, 36, 1, H1);
        R(x - 18, yy + 1, 36, 1, K);
        R(s > 0 ? x + 18 : x - 19, yy - 1, 1, 1, H1);
      });
      R(x - s * 10, y - 22, 1, 22, L1);
      R(x - s * 10 - 1, y - 1, 3, 1, D);
      return;
    }
    const tip = dir === 'down' ? 1 : -1;
    [x - 7, x + 4].forEach(xx => {
      R(xx, y - 13, 3, 27, K);
      R(xx, y - 13, 1, 27, H1);
      R(xx + 1, tip > 0 ? y + 14 : y - 14, 1, 1, H1);
    });
    [x - 11, x + 10].forEach(xx => {
      R(xx, y - 24, 1, 25, L1);
      R(xx - 1, y, 3, 1, D);
    });
  }

  // Cadeiras dos personagens sentados: a da V1 (Scenery.chairSide/chairBack) ampliada 1,25× e
  // alinhada ao assento do sprite novo. De lado vai por baixo da pessoa; de costas, o encosto vai
  // por cima. chair: true = a do okonomiyaki, ou o nome de outro estilo de Scenery.CHAIRS.
  const chairs = {};
  function chair(dir, style) {
    style = typeof style === 'string' ? style : 'okonomiyaki';
    const key = style + '|' + dir;
    if (!chairs[key]) {
      const cv = Gfx.canvas(16, 34);
      if (dir === 'up') Scenery.chairBack(cv.cx, style);
      else {
        if (dir === 'left') { cv.cx.translate(16, 0); cv.cx.scale(-1, 1); }
        Scenery.chairSide(cv.cx, style);
      }
      chairs[key] = Legacy.up(cv);
    }
    return chairs[key];
  }

  return {
    W, H,
    // Desenha com a sombra no chão e, se estiver sentado numa cadeira, a cadeira na ordem certa.
    // x, y = os pés, em coordenadas da tela da V2.
    // o.shadow: false = sem sombra; 'long' = esticada para baixo e para a direita (parque à tarde)
    // Deitado ou nadando de lado (na horizontal): o meio do corpo em x e a base em y.
    // o.wade: n = dentro da água até a cintura (n = linhas escondidas na V1; aqui × 1,5, com marolinhas).
    // o.gear: 'ski' = esquis e bastões; o.look = para onde está virado (direção do sprite).
    draw(ctx, img, x, y, o = {}) {
      x = Math.round(x);
      y = Math.round(y);
      const swim = o.pose === 'swim';
      if (img.width > W) {
        if (o.shadow !== false) Gfx.shadow(x + (swim ? 5 : 1), y - (swim ? 1 : 10), img.width - 4, swim ? 10 : 18, swim ? 0.2 : 0.3);
        ctx.drawImage(img, x - Math.round(img.width / 2), y - img.height + 1);
        return;
      }
      const sx = x - 13, sy = y - 47;
      if (o.wade) {
        const h = H - Math.round(o.wade * 1.5), t = o.t || 0;
        ctx.drawImage(img, 0, 0, W, h, sx, sy, W, h);
        for (let i = -1; i < W + 1; i += 2) {
          const k = Math.sin(t * 3 + i * 0.6);
          Gfx.rect(sx + i, sy + h - 1 + (k > 0.3 ? 1 : 0), 2, 1, k > 0 ? '#F2FAFF' : '#BEE4F2');
        }
        return;
      }
      if (o.gear === 'ski') skis(ctx, x, y, o.look || o.dir || 'down');
      if (swim) Gfx.shadow(x + 5, y + 4, 16, 6, 0.2);
      const sitting = o.pose === 'sit', side = o.dir === 'left' || o.dir === 'right';
      if (o.shadow === 'long') {
        Gfx.shadow(x + 2, y, 18, 6);
        Gfx.shadow(x + 10, y + 3, 18, 6, 0.2);
      } else if (o.shadow !== false && !swim) {
        const wide = sitting || o.pose === 'floor';
        Gfx.shadow(x, y - (wide ? 1 : 2), wide ? (sitting ? 22 : 26) : 18, 6);
      }
      if (sitting && o.chair && side) ctx.drawImage(chair(o.dir, o.chair), x - (o.dir === 'left' ? 10 : 10), y - 41);
      ctx.drawImage(img, sx, sy);
      if (sitting && o.chair && o.dir === 'up') ctx.drawImage(chair('up', o.chair), x - 10, y - 41);
    },

    sprite(id, opts = {}) {
      const pose = opts.pose || 'walk';
      if (pose === 'lie') {
        const dir = opts.dir === 'right' ? 'right' : 'left', look = opts.head || 'sky', eyes = opts.eyes || 'open';
        const key = id + '|lie|' + dir + '|' + look + '|' + eyes + '|' + (opts.cover || '');
        return cache[key] || (cache[key] = lying(id, dir, look, eyes, opts.cover));
      }
      if (pose === 'swim') {
        const dir = opts.dir || 'right', frame = opts.frame === undefined ? 0 : opts.frame, eyes = opts.eyes || 'open';
        const key = id + '|swim|' + dir + '|' + frame;
        return cache[key] || (cache[key] = swimming(id, dir, frame, eyes));
      }
      if (pose === 'photo') {
        const key = id + '|photo|' + (opts.eyes || 'open');
        return cache[key] || (cache[key] = build(id, 'photo', 'down', 'down', -1, opts.eyes || 'open'));
      }
      const dir = opts.dir || 'down';
      const head = opts.head || dir, frame = opts.frame === undefined ? -1 : opts.frame;
      const eyes = opts.eyes || 'open';
      const key = id + '|' + pose + '|' + dir + '|' + head + '|' + frame + '|' + eyes;
      return cache[key] || (cache[key] = build(id, pose, dir, head, frame, eyes));
    },

    // topo da cabeça (para o balão de suspeita), em relação aos pés
    headTop(pose, side) {
      if (side === 'left' || side === 'right') return [side === 'right' ? 12 : -12, -24];
      if (pose === 'floor') return [0, -36];
      return [0, -46];
    },

    HEADS, BODIES, PATTERNS, ramp,

    // direção (graus: 0 direita, 90 baixo, 180 esquerda, 270 cima) → 'right' | 'down' | 'left' | 'up'
    dirOf(deg) {
      const a = ((deg % 360) + 360) % 360;
      if (a >= 45 && a < 135) return 'down';
      if (a >= 135 && a < 225) return 'left';
      if (a >= 225 && a < 315) return 'up';
      return 'right';
    }
  };
})();
