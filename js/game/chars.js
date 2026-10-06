// Personagens montados a partir dos moldes do Apêndice E (data/sprites.js) e das roupas de
// data/characters.js, com cache. Cada sprite tem 16×32 px; o ponto de apoio é o meio da base
// (desenhe em x - 8, y - 31).
//
// Chars.sprite('ELLEN_NOW', { pose, dir, head, frame })
//   pose   'walk' (padrão) ou 'sit' (sentado; dir = para onde o corpo está virado)
//   dir    'right' | 'left' | 'down' | 'up'
//   head   para onde a cabeça olha (padrão: dir). Sentado de lado, a cabeça pode virar de frente.
//   frame  andando: -1 parado, 0 a 3 o ciclo de 4 quadros; sentado: 0 normal, 1 braço à frente
const Chars = (() => {
  const cache = {};
  const BLANK = '................';

  const HEADS = {
    ellen: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' },
    fabio: { side: 'HEAD_FABIO_SIDE', down: 'HEAD_FABIO_FRONT', up: 'HEAD_FABIO_BACK' },
    man:   { side: 'HEAD_FABIO_SIDE', down: 'HEAD_MAN_FRONT', up: 'HEAD_FABIO_BACK' },
    woman: { side: 'HEAD_ELLEN_SIDE', down: 'HEAD_ELLEN_FRONT', up: 'HEAD_ELLEN_BACK' }
  };

  // Troncos e pernas de cada corpo. slim e reg ainda não têm tronco próprio para andar
  // (nenhum vigia anda na etapa 2): usam o do jaleco e o do moletom, com as cores da roupa.
  const BODIES = {
    coat:   { legs: 'SLIM', side: 'TORSO_COAT_SIDE',   down: 'TORSO_COAT_FRONT',   up: 'TORSO_COAT_BACK' },
    hoodie: { legs: 'REG',  side: 'TORSO_HOODIE_SIDE', down: 'TORSO_HOODIE_FRONT', up: 'TORSO_HOODIE_BACK', hood: true },
    slim:   { legs: 'SLIM', side: 'TORSO_COAT_SIDE',   down: 'TORSO_COAT_FRONT',   up: 'TORSO_COAT_BACK' },
    reg:    { legs: 'REG',  side: 'TORSO_HOODIE_SIDE', down: 'TORSO_HOODIE_FRONT', up: 'TORSO_HOODIE_BACK' }
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
      p: c.bottom, P: dark(c.bottom), n: bareLegs ? c.skin : c.bottom, N: bareLegs ? S : dark(c.bottom),
      f: c.shoes, F: dark(c.shoes, 0.25), w: '#F6F6F2', W: '#CFCFC5'
    };
  }

  function outfit(id) {
    const o = CHARACTERS[id];
    if (!o) throw new Error('Roupa desconhecida: ' + id);
    if (!o._palette) {
      const p = o.palette || expand(o.colors, o.head === 'woman' || o.head === 'ellen');
      // cordões do moletom (W) e curativo (w): quem não tem fica com a cor da roupa
      o._palette = Object.assign({ w: p.c, W: p.c }, p);
    }
    return o;
  }

  function headRows(o, dir) {
    const k = sideKey(dir);
    let rows = SPRITES[HEADS[o.head][k]];
    if (o.hair === 'half') rows = Gfx.swapRows(rows, 0, k === 'up' ? 5 : 6, HALF_HAIR);
    if (o.bandage) rows = Gfx.paintRow(Gfx.paintRow(rows, 3, 'w'), 4, 'W');
    return dir === 'left' ? flipRows(rows) : rows;
  }

  // monta as 32 linhas do sprite
  function compose(o, pose, dir, head, frame) {
    let rows = Array(32).fill(BLANK);
    let hdx = 0, hdy = 0;

    if (pose === 'sit') {
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
    return overlay(rows, headRows(o, head), hdx, hdy);
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

  function build(id, pose, dir, head, frame) {
    const o = outfit(id);
    const rows = compose(o, pose, dir, head, frame);
    const pats = o.patterns || [];
    const pattern = pats.length ? (ch, x, y) => {
      for (const p of pats) if (p.on.includes(ch) && PATTERNS[p.rule](x, y)) return p.color;
      return null;
    } : null;
    return Gfx.buildSprite(rows, o._palette, { pattern });
  }

  // cadeiras dos personagens sentados (madeira clara, assento e encosto pretos), do mesmo
  // tamanho do sprite: de lado vai por baixo da pessoa; de costas, o encosto vai por cima
  const chairs = {};
  function chair(dir) {
    if (!chairs[dir]) {
      const cv = Gfx.canvas(16, 34);
      if (dir === 'up') Scenery.chairBack(cv.cx);
      else {
        if (dir === 'left') { cv.cx.translate(16, 0); cv.cx.scale(-1, 1); }
        Scenery.chairSide(cv.cx);
      }
      chairs[dir] = cv;
    }
    return chairs[dir];
  }

  return {
    // desenha com a sombra no chão e, se estiver sentado numa cadeira, a cadeira na ordem certa
    draw(ctx, img, x, y, o = {}) {
      const sx = Math.round(x) - 8, sy = Math.round(y) - 31;
      const sitting = o.pose === 'sit', side = o.dir === 'left' || o.dir === 'right';
      if (o.shadow !== false) Gfx.shadow(Math.round(x), Math.round(y) - (sitting ? 0 : 1), sitting ? 14 : 12, 4);
      if (sitting && o.chair && side) ctx.drawImage(chair(o.dir), sx, sy);
      ctx.drawImage(img, sx, sy);
      if (sitting && o.chair && o.dir === 'up') ctx.drawImage(chair('up'), sx, sy);
    },

    sprite(id, opts = {}) {
      const pose = opts.pose || 'walk', dir = opts.dir || 'down';
      const head = opts.head || dir, frame = opts.frame === undefined ? -1 : opts.frame;
      const key = id + '|' + pose + '|' + dir + '|' + head + '|' + frame;
      return cache[key] || (cache[key] = build(id, pose, dir, head, frame));
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
