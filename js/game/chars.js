// Personagens montados a partir dos moldes do Apêndice E (data/sprites.js) e das roupas de
// data/characters.js, com cache. Cada sprite tem 16×32 px; o ponto de apoio é o meio da base
// (desenhe em x - 8, y - 31).
//
// Chars.sprite('ELLEN_NOW', { pose, dir, head, frame, eyes })
//   pose   'walk' (padrão), 'sit' (sentado; dir = para onde o corpo está virado) ou
//          'lie' (deitado de barriga para cima, na horizontal; dir = lado da cabeça, 'left' ou
//          'right'; head = 'sky' olhando para cima, ou 'up'/'down' virando para o lado de cima
//          ou de baixo da tela, no beijo). O deitado tem 32×16 px.
//          'floor' = sentado no chão (ou na cama) de pernas cruzadas (dir: as 4 direções).
//          'swim' = nadando de bruços, visto de cima, na direção dir (de lado fica com 32×16).
//          'photo' = de frente, com a mão levantada fazendo "V" (pose para a foto).
//   dir    'right' | 'left' | 'down' | 'up'
//   head   para onde a cabeça olha (padrão: dir). Sentado de lado, a cabeça pode virar de frente.
//   frame  andando: -1 parado, 0 a 3 o ciclo de 4 quadros; sentado: 0 normal, 1 braço à frente
//   eyes   'closed' = olhos fechados (beijo)
//   cover  deitado: cor da coberta por cima do corpo (ex.: '#1E2A4A')
//
// Na roupa (data/characters*.js), extras: ['NOME', ...] põe acessórios e penteados por cima da
// cabeça: SPRITES.NOME = { down: [linhas], side: [linhas, virado para a direita], up: [linhas],
// dy: 0, under: false }. As linhas têm 16 colunas e começam na linha dy do sprite (0 = topo da
// cabeça); under: true = só onde está vazio (rabo de cavalo atrás da cabeça). As letras novas
// (x, y, z, X, Y, Z, t, T, i, I...) ganham cor na paleta da roupa.
// Chars.HEADS, Chars.BODIES e Chars.PATTERNS aceitam cabeças, corpos e estampas novas.
const Chars = (() => {
  const cache = {};
  const BLANK = '................';

  const HEADS = {
    ellen: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' },
    fabio: { side: 'HEAD_FABIO_SIDE', down: 'HEAD_FABIO_FRONT', up: 'HEAD_FABIO_BACK' },
    man:   { side: 'HEAD_FABIO_SIDE', down: 'HEAD_MAN_FRONT', up: 'HEAD_FABIO_BACK' },
    woman: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' }
  };

  // troncos e pernas de cada corpo (slim e reg: camisa, blusa ou regata genérica)
  const BODIES = {
    coat:   { legs: 'SLIM', side: 'TORSO_COAT_SIDE',   down: 'TORSO_COAT_FRONT',   up: 'TORSO_COAT_BACK' },
    hoodie: { legs: 'REG',  side: 'TORSO_HOODIE_SIDE', down: 'TORSO_HOODIE_FRONT', up: 'TORSO_HOODIE_BACK', hood: true },
    slim:   { legs: 'SLIM', side: 'TORSO_SLIM_SIDE',   down: 'TORSO_SLIM_FRONT',   up: 'TORSO_SLIM_BACK' },
    reg:    { legs: 'REG',  side: 'TORSO_REG_SIDE',    down: 'TORSO_REG_FRONT',    up: 'TORSO_REG_BACK' }
  };

  // ciclo de andar e quanto o tronco desce em cada quadro
  const CYCLE = { side: ['A', 'PASS', 'B', 'PASS'], front: ['A', 'IDLE', 'B', 'IDLE'] };
  const BOB = { A: 1, B: 1, PASS: 0, IDLE: 0 };

  const HALF_HAIR = { h: 'r', H: 'R', j: 'q' };

  const PATTERNS = {
    floral: (x, y) => (x * 5 + y * 3) % 7 === 0,
    ribbed: x => x % 2 === 1,
    rips: (x, y) => (x * 3 + y * 7) % 11 === 0,
    stripes: (x, y) => y % 2 === 0,                 // listras horizontais
    check: (x, y) => (x >> 1) % 2 !== (y >> 1) % 2,  // xadrez de 2 px
    dots: (x, y) => x % 3 === 0 && y % 3 === 1,      // bolinhas
    waves: (x, y) => (x + (y >> 1)) % 4 === 0         // ondas (seigaiha simplificado)
  };

  const sideKey = d => (d === 'left' || d === 'right' ? 'side' : d);
  const flipRows = rows => rows.map(r => r.split('').reverse().join(''));

  // copia os pixels não transparentes de `top` sobre `base`, deslocados (dx, dy)
  function overlay(base, top, dx, dy) {
    const out = base.map(r => r.split(''));
    top.forEach((row, y) => {
      const yy = y + dy;
      if (yy < 0 || yy >= out.length) return;
      for (let x = 0; x < row.length; x++) {
        const xx = x + dx;
        if (row[x] !== '.' && xx >= 0 && xx < 16) out[yy][xx] = row[x];
      }
    });
    return out.map(r => r.join(''));
  }

  // cores-base de um NPC → paleta completa, com sombra e brilho
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
      o._palette = Object.assign({ w: p.c, W: p.c, v: p.s, V: p.S }, p);
    }
    return o;
  }

  // olhos fechados: de cada olho (2 px na vertical) sobra só o pixel de baixo
  function closeEyes(rows) {
    return rows.map((row, y) => row.replace(/e/g, (ch, x) => (rows[y + 1] && rows[y + 1][x] === 'e' ? 's' : ch)));
  }

  function headRows(o, dir, eyes) {
    const k = sideKey(dir);
    let rows = SPRITES[HEADS[o.head][k]];
    if (o.hair === 'half') rows = Gfx.swapRows(rows, 0, k === 'up' ? 5 : 6, HALF_HAIR);
    if (o.bandage) rows = Gfx.paintRow(Gfx.paintRow(rows, 3, 'w'), 4, 'W');
    if (eyes === 'closed') rows = closeEyes(rows);
    return dir === 'left' ? flipRows(rows) : rows;
  }

  // acessórios e penteados da roupa (extras), na direção da cabeça
  function extras(rows, o, dir, dx, dy) {
    (o.extras || []).forEach(name => {
      const ex = SPRITES[name];
      if (!ex) throw new Error('Acessório sem molde em SPRITES: ' + name);
      let part = ex[sideKey(dir)];
      if (!part) return;
      if (dir === 'left') part = flipRows(part);
      const at = (ex.dy || 0) + dy;
      if (!ex.under) { rows = overlay(rows, part, dx, at); return; }
      const out = rows.map(r => r.split(''));
      part.forEach((row, y) => {
        const yy = y + at;
        if (yy < 0 || yy >= out.length) return;
        for (let x = 0; x < 16; x++) {
          const xx = x + dx;
          if (row[x] !== '.' && xx >= 0 && xx < 16 && out[yy][xx] === '.') out[yy][xx] = row[x];
        }
      });
      rows = out.map(r => r.join(''));
    });
    return rows;
  }

  // braço levantado da pose para a foto (por cima da cabeça e do tronco de frente)
  function photoArm(rows, legs) {
    const out = rows.map(r => r.split(''));
    const ax = legs === 'REG' ? 12 : 11;
    for (let y = 18; y <= 23; y++) { out[y][ax] = 'o'; out[y][ax + 1] = '.'; out[y][ax + 2] = '.'; }
    SPRITES.PHOTO_ARM.forEach((row, y) => {
      for (let x = 0; x < 16; x++) if (row[x] !== '.') out[y][x] = row[x];
    });
    return out.map(r => r.join(''));
  }

  // monta as 32 linhas do sprite
  function compose(o, pose, dir, head, frame, eyes, cover) {
    let rows = Array(32).fill(BLANK);
    let hdx = 0, hdy = 0;

    if (pose === 'lie') {
      rows = overlay(rows, SPRITES.BODY_LIE, 0, 15);
    } else if (pose === 'floor') {
      // o corpo é mais curto: tudo desce para os pés ficarem na base
      const k = sideKey(dir);
      const body = k === 'side' ? SPRITES.BODY_FLOOR_SIT_SIDE : k === 'up' ? SPRITES.BODY_FLOOR_SIT_BACK : SPRITES.BODY_FLOOR_SIT;
      hdy = k === 'side' ? 4 : 3;
      rows = overlay(rows, body, 0, 15 + hdy);
      if (k === 'side') {
        if (dir === 'left') rows = flipRows(rows);
        if (head === 'down' || head === 'up') hdx = dir === 'right' ? -2 : 2;
      }
    } else if (pose === 'sit') {
      if (dir === 'down') rows = overlay(rows, SPRITES.BODY_FRONT_SIT, 0, 15);
      else if (dir === 'up') rows = overlay(rows, SPRITES.BODY_BACK_SIT, 0, 15);
      else {
        rows = overlay(rows, frame === 1 ? SPRITES.BODY_SIT_REACH : SPRITES.BODY_SIT, 0, 15);
        if (dir === 'left') rows = flipRows(rows);
        // cabeça de frente ou de costas num corpo de lado: centraliza sobre o tronco
        if (head === 'down' || head === 'up') hdx = dir === 'right' ? -2 : 2;
      }
    } else {
      // andando ou parado ('walk'), e a pose da foto (de frente, parada)
      const b = BODIES[o.body], k = sideKey(dir);
      const step = frame < 0 ? 'IDLE' : CYCLE[k === 'side' ? 'side' : 'front'][frame % 4];
      const legs = SPRITES['LEGS_' + b.legs + '_' + (k === 'side' ? 'SIDE' : 'FRONT') + '_' + step];
      hdy = BOB[step];
      rows = overlay(rows, legs, 0, 15);
      rows = overlay(rows, SPRITES[b[k]], 0, 15 + hdy);
      if (b.hood && k === 'side') rows = overlay(rows, hoodRows(), 0, hdy);
      if (dir === 'left') rows = flipRows(rows);
    }
    rows = overlay(rows, headRows(o, head, eyes), hdx, hdy);
    rows = extras(rows, o, head, hdx, hdy);
    if (pose === 'photo') rows = photoArm(rows, BODIES[o.body].legs);
    if (pose === 'lie' && cover) rows = overlay(rows, SPRITES.BLANKET, 0, 16);
    return rows;
  }

  // capuz do moletom (Apêndice E): só onde a cabeça de lado é transparente
  function hoodRows() {
    const rows = Array(15).fill(BLANK);
    const head = SPRITES.HEAD_FABIO_SIDE;
    return rows.map((r, y) => r.split('').map((ch, x) => {
      const p = SPRITES.HOOD_OVERLAY.find(([px, py]) => px === x && py === y);
      return p && head[y][x] === '.' ? p[2] : ch;
    }).join(''));
  }

  function build(id, pose, dir, head, frame, eyes, cover) {
    const o = outfit(id);
    const rows = compose(o, pose, dir, head, frame, eyes, cover);
    const pats = o.patterns || [];
    const pattern = pats.length ? (ch, x, y) => {
      for (const p of pats) if (p.on.includes(ch) && PATTERNS[p.rule](x, y)) return p.color;
      return null;
    } : null;
    let palette = o._palette;
    if (cover) {
      palette = Object.assign({}, palette, { x: cover, X: Gfx.mix(cover, '#07060E', 0.35), y: Gfx.mix(cover, '#FFFFFF', 0.18) });
    }
    return Gfx.buildSprite(rows, palette, { pattern });
  }

  // gira um sprite de 16×32: 'left'/'right' = 90° (a cabeça vai para esse lado), 'down' = 180°
  function rotate(img, dir) {
    if (dir === 'up') return img;
    if (dir === 'down') {
      const cv = Gfx.canvas(16, 32);
      cv.cx.translate(16, 32);
      cv.cx.rotate(Math.PI);
      cv.cx.drawImage(img, 0, 0);
      return cv;
    }
    const cv = Gfx.canvas(32, 16);
    cv.cx.translate(16, 8);
    cv.cx.rotate(dir === 'left' ? -Math.PI / 2 : Math.PI / 2);
    cv.cx.drawImage(img, -8, -16);
    return cv;
  }

  // Deitado: monta a pessoa em pé, de barriga para cima (cabeça de frente = olhando o céu), e
  // gira 90° para a cabeça ficar do lado `dir`. As estampas são aplicadas antes de girar.
  // Girando para a esquerda (anti-horário), o lado direito do molde fica em cima.
  const LIE_HEAD = { left: { up: 'right', down: 'left' }, right: { up: 'left', down: 'right' } };
  function lying(id, dir, look, eyes, cover) {
    return rotate(build(id, 'lie', 'down', look === 'sky' ? 'down' : LIE_HEAD[dir][look], -1, eyes, cover), dir);
  }

  // Nadando de bruços: a pessoa de costas, andando (as pernas batem), girada para a direção do nado.
  function swimming(id, dir, frame, eyes) {
    return rotate(build(id, 'walk', 'up', 'up', frame, eyes), dir);
  }

  // esquis e bastões, por baixo da pessoa: as pontas aparecem na frente dos pés
  function skis(x, y, dir) {
    const K = '#1C1D24', H = '#E8ECF2', L = '#C9CED6', D = '#5E6470';
    if (dir === 'left' || dir === 'right') {
      const s = dir === 'right' ? 1 : -1;
      [y - 2, y + 1].forEach(yy => {
        Gfx.rect(x - 12, yy, 24, 1, H);
        Gfx.rect(x - 12, yy + 1, 24, 1, K);
        Gfx.rect(x + s * 12, yy - 1, 1, 1, H);
      });
      Gfx.rect(x - s * 7, y - 15, 1, 15, L);
      Gfx.rect(x - s * 7 - 1, y - 1, 3, 1, D);
      return;
    }
    const tip = dir === 'down' ? 1 : -1;
    [x - 5, x + 3].forEach(xx => {
      Gfx.rect(xx, y - 9, 2, 19, K);
      Gfx.rect(xx, y - 9, 1, 19, H);
      Gfx.rect(xx + (xx < x ? 1 : 0), tip > 0 ? y + 10 : y - 10, 1, 1, H);
    });
    [x - 8, x + 7].forEach(xx => {
      Gfx.rect(xx, y - 16, 1, 17, L);
      Gfx.rect(xx - 1, y, 3, 1, D);
    });
  }

  // Cadeiras dos personagens sentados, do mesmo tamanho do sprite: de lado vai por baixo da
  // pessoa; de costas, o encosto vai por cima. chair: true = a do okonomiyaki (madeira clara,
  // assento e encosto pretos), ou o nome de outro estilo de Scenery.CHAIRS (ex.: 'cafe').
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
      chairs[key] = cv;
    }
    return chairs[key];
  }

  return {
    // Desenha com a sombra no chão e, se estiver sentado numa cadeira, a cadeira na ordem certa.
    // o.shadow: false = sem sombra; 'long' = esticada para baixo e para a direita (parque à tarde)
    // Deitado ou nadando de lado (32×16): o meio do corpo em x e a base em y, com uma sombra fraca.
    // o.wade: n = dentro da água até a cintura (esconde as n linhas de baixo, com marolinhas).
    // o.gear: 'ski' = esquis e bastões; o.look = para onde está virado (direção do sprite).
    draw(ctx, img, x, y, o = {}) {
      const swim = o.pose === 'swim';
      if (img.width > 16) {
        if (o.shadow !== false) Gfx.shadow(Math.round(x) + (swim ? 4 : 1), Math.round(y) - (swim ? 0 : 6), 30, swim ? 8 : 12, swim ? 0.2 : 0.3);
        ctx.drawImage(img, Math.round(x) - 16, Math.round(y) - 15);
        return;
      }
      const sx = Math.round(x) - 8, sy = Math.round(y) - 31;
      if (o.wade) {
        const h = 32 - o.wade, t = o.t || 0;
        ctx.drawImage(img, 0, 0, 16, h, sx, sy, 16, h);
        for (let i = -1; i < 17; i += 2) {
          const k = Math.sin(t * 3 + i * 0.7);
          Gfx.rect(sx + i, sy + h - 1 + (k > 0.3 ? 1 : 0), 2, 1, k > 0 ? '#F2FAFF' : '#BEE4F2');
        }
        return;
      }
      if (o.gear === 'ski') skis(Math.round(x), Math.round(y), o.look || o.dir || 'down');
      if (swim) Gfx.shadow(Math.round(x) + 4, Math.round(y) + 4, 12, 4, 0.2);
      const sitting = o.pose === 'sit', side = o.dir === 'left' || o.dir === 'right';
      if (o.shadow === 'long') {
        Gfx.shadow(Math.round(x) + 2, Math.round(y), 12, 4);
        Gfx.shadow(Math.round(x) + 7, Math.round(y) + 2, 12, 4, 0.2);
      } else if (o.shadow !== false && !swim) {
        const wide = sitting || o.pose === 'floor';
        Gfx.shadow(Math.round(x), Math.round(y) - (wide ? 0 : 1), wide ? (sitting ? 14 : 16) : 12, 4);
      }
      if (sitting && o.chair && side) ctx.drawImage(chair(o.dir, o.chair), sx, sy);
      ctx.drawImage(img, sx, sy);
      if (sitting && o.chair && o.dir === 'up') ctx.drawImage(chair('up', o.chair), sx, sy);
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

    HEADS, BODIES, PATTERNS,

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
