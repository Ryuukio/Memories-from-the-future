// Personagens montados a partir dos moldes do Apêndice E (data/sprites.js) e das roupas de
// data/characters.js, com cache. Cada sprite tem 16×32 px; o ponto de apoio é o meio da base
// (desenhe em x - 8, y - 31).
//
// Chars.sprite('ELLEN_NOW', { pose, dir, head, frame, eyes })
//   pose   'walk' (padrão), 'sit' (sentado; dir = para onde o corpo está virado) ou
//          'lie' (deitado de barriga para cima, na horizontal; dir = lado da cabeça, 'left' ou
//          'right'; head = 'sky' olhando para cima, ou 'up'/'down' virando para o lado de cima
//          ou de baixo da tela, no beijo). O deitado tem 32×16 px.
//          'floor' = sentado no chão (ou na cama) de pernas cruzadas, de frente.
//   dir    'right' | 'left' | 'down' | 'up'
//   head   para onde a cabeça olha (padrão: dir). Sentado de lado, a cabeça pode virar de frente.
//   frame  andando: -1 parado, 0 a 3 o ciclo de 4 quadros; sentado: 0 normal, 1 braço à frente
//   eyes   'closed' = olhos fechados (beijo)
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
    rips: (x, y) => (x * 3 + y * 7) % 11 === 0
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

  // monta as 32 linhas do sprite
  function compose(o, pose, dir, head, frame, eyes) {
    let rows = Array(32).fill(BLANK);
    let hdx = 0, hdy = 0;

    if (pose === 'lie') {
      rows = overlay(rows, SPRITES.BODY_LIE, 0, 15);
    } else if (pose === 'floor') {
      // o corpo é mais curto: tudo desce 3 px para os pés ficarem na base
      hdy = 3;
      rows = overlay(rows, SPRITES.BODY_FLOOR_SIT, 0, 15 + hdy);
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
      const b = BODIES[o.body], k = sideKey(dir);
      const step = frame < 0 ? 'IDLE' : CYCLE[k === 'side' ? 'side' : 'front'][frame % 4];
      const legs = SPRITES['LEGS_' + b.legs + '_' + (k === 'side' ? 'SIDE' : 'FRONT') + '_' + step];
      hdy = BOB[step];
      rows = overlay(rows, legs, 0, 15);
      rows = overlay(rows, SPRITES[b[k]], 0, 15 + hdy);
      if (b.hood && k === 'side') rows = overlay(rows, hoodRows(), 0, hdy);
      if (dir === 'left') rows = flipRows(rows);
    }
    return overlay(rows, headRows(o, head, eyes), hdx, hdy);
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

  function build(id, pose, dir, head, frame, eyes) {
    const o = outfit(id);
    const rows = compose(o, pose, dir, head, frame, eyes);
    const pats = o.patterns || [];
    const pattern = pats.length ? (ch, x, y) => {
      for (const p of pats) if (p.on.includes(ch) && PATTERNS[p.rule](x, y)) return p.color;
      return null;
    } : null;
    return Gfx.buildSprite(rows, o._palette, { pattern });
  }

  // Deitado: monta a pessoa em pé, de barriga para cima (cabeça de frente = olhando o céu), e
  // gira 90° para a cabeça ficar do lado `dir`. As estampas são aplicadas antes de girar.
  // Girando para a esquerda (anti-horário), o lado direito do molde fica em cima.
  const LIE_HEAD = { left: { up: 'right', down: 'left' }, right: { up: 'left', down: 'right' } };
  function lying(id, dir, look, eyes) {
    const img = build(id, 'lie', 'down', look === 'sky' ? 'down' : LIE_HEAD[dir][look], -1, eyes);
    const cv = Gfx.canvas(32, 16);
    cv.cx.translate(16, 8);
    cv.cx.rotate(dir === 'left' ? -Math.PI / 2 : Math.PI / 2);
    cv.cx.drawImage(img, -8, -16);
    return cv;
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
    // Deitado: o meio do corpo em x e a base em y, com uma sombra fraca na cama.
    draw(ctx, img, x, y, o = {}) {
      if (o.pose === 'lie') {
        if (o.shadow !== false) Gfx.shadow(Math.round(x) + 1, Math.round(y) - 6, 30, 12, 0.3);
        ctx.drawImage(img, Math.round(x) - 16, Math.round(y) - 15);
        return;
      }
      const sx = Math.round(x) - 8, sy = Math.round(y) - 31;
      const sitting = o.pose === 'sit', side = o.dir === 'left' || o.dir === 'right';
      if (o.shadow === 'long') {
        Gfx.shadow(Math.round(x) + 2, Math.round(y), 12, 4);
        Gfx.shadow(Math.round(x) + 7, Math.round(y) + 2, 12, 4, 0.2);
      } else if (o.shadow !== false) {
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
        const key = id + '|lie|' + dir + '|' + look + '|' + eyes;
        return cache[key] || (cache[key] = lying(id, dir, look, eyes));
      }
      const dir = opts.dir || 'down';
      const head = opts.head || dir, frame = opts.frame === undefined ? -1 : opts.frame;
      const eyes = opts.eyes || 'open';
      const key = id + '|' + pose + '|' + dir + '|' + head + '|' + frame + '|' + eyes;
      return cache[key] || (cache[key] = build(id, pose, dir, head, frame, eyes));
    },

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
