// Corredor entre as salas (zona segura) e a salinha do baú: um salão "entre as memórias", com
// papel de parede índigo, molduras douradas, polaroides, tapete vermelho e o vazio estrelado em
// volta. O corredor termina numa porta que se abre quando a Ellen chega perto.
(() => {
  const { R, hash, glow, alpha, props, FLOORS, WALLS, EDGES } = Scenery;

  const VOID = '#0B0918';
  const GOLD = '#C9A24A', GOLD_D = '#8A6A2A', GOLD_H = '#F2D27A';

  // vazio com estrelas fixas
  function voidFill(c, x, y, w, h, seed) {
    R(x, y, w, h, VOID, c);
    for (let i = 0; i < w * h / 90; i++) {
      const v = hash(i, seed);
      const sx = x + v % w, sy = y + (v >>> 10) % h;
      R(sx, sy, 1, 1, (v >>> 4) % 5 ? '#2C2652' : '#8E86C8', c);
    }
  }

  const bandOf = look => look.bounds || [0, 384];

  // piso: tábuas arroxeadas, tapete vermelho com borda dourada na altura das portas
  FLOORS.hall = (c, x, y, w, h, look) => {
    const [b0, b1] = bandOf(look), bottom = look.bottom || 192;
    voidFill(c, x, y, w, h, x + 3);
    Scenery.planks(c, x + b0, y, b1 - b0, bottom - y, {
      tones: [['#5E4C70', '#524264', '#45385A'], ['#66547A', '#5A496E', '#4C3E60'], ['#584868', '#4C3E5E', '#403452']],
      seam: '#2A2240', grain: '#3E3252'
    }, x + 5);
    const gap = (look.doors && (look.doors.left || look.doors.right)) || [96, 128];
    const ry = gap[0] + 4, rh = gap[1] - gap[0] - 8;
    R(x + b0, ry, b1 - b0, rh, '#7A2E3A', c);
    R(x + b0, ry + 1, b1 - b0, 1, '#94404C', c);
    R(x + b0, ry - 1, b1 - b0, 1, GOLD_D, c);
    R(x + b0, ry + rh, b1 - b0, 1, GOLD_D, c);
    R(x + b0, ry + 2, b1 - b0, 1, GOLD, c);
    R(x + b0, ry + rh - 3, b1 - b0, 1, GOLD, c);
    for (let k = x + b0 + 6; k < x + b1 - 6; k += 12) R(k, ry + Math.floor(rh / 2), 2, 1, '#B85A5E', c);
    // mureta da frente (o chão termina aqui)
    if (bottom < 192) {
      R(x + b0, bottom, b1 - b0, 6, '#1E1838', c);
      R(x + b0, bottom, b1 - b0, 1, '#3A3166', c);
      R(x + b0, bottom + 6, b1 - b0, 1, '#07060E', c);
    }
  };

  // parede do fundo: papel de parede índigo com losangos, friso dourado e lambri
  WALLS.hall = (c, x, w, h, look) => {
    const [b0, b1] = bandOf(look);
    voidFill(c, x, 0, w, h, x + 11);
    const wx = x + b0, ww = b1 - b0;
    R(wx, 0, ww, h, '#2A2350', c);
    for (let yy = 8; yy < h - 14; yy += 6) {
      for (let xx = wx + ((yy / 6) % 2) * 4; xx < wx + ww; xx += 8) R(xx, yy, 1, 1, '#3A3170', c);
    }
    R(wx, 0, ww, 5, '#17122E', c);
    R(wx, 5, ww, 1, GOLD_D, c);
    R(wx, 6, ww, 1, GOLD, c);
    const rail = h - 14;
    R(wx, rail, ww, 1, GOLD_H, c);
    R(wx, rail + 1, ww, 1, GOLD_D, c);
    R(wx, rail + 2, ww, 12, '#1E1838', c);
    for (let k = wx + 8; k < wx + ww; k += 20) R(k, rail + 4, 12, 8, '#251E44', c);
    R(wx, h - 1, ww, 1, '#120E24', c);
  };

  // paredes laterais grossas, com a passagem
  EDGES.hall = (c, x, top, gap, side, look) => {
    const bottom = (look.bottom || 192) + 6;
    const segs = gap ? [[0, gap[0]], [gap[1], bottom]] : [[0, bottom]];
    const wx = side === 'left' ? x - 4 : x;
    segs.forEach(([a, b]) => {
      R(wx, a, 8, b - a, '#1E1838', c);
      R(side === 'left' ? wx + 7 : wx, a, 1, b - a, '#3A3166', c);
      R(side === 'left' ? wx : wx + 7, a, 1, b - a, '#120E24', c);
    });
    if (gap) {
      R(wx, gap[0] - 2, 8, 2, GOLD_D, c);
      R(wx, gap[1], 8, 2, GOLD_D, c);
    }
  };

  // ---------- objetos ----------

  // polaroide pendurada na parede (memórias genéricas: céu, mar, noite, flores)
  const PHOTOS = [['#7FB8E8', '#5DAA62'], ['#F2B880', '#C8724A'], ['#2E3A6E', '#F2D78E'], ['#F0A8C0', '#5DAA62'], ['#58B8C8', '#F2E8CC']];
  props.polaroid = {
    layer: 'back',
    size: () => [14, 18],
    draw(c, p) {
      const [sky, ground] = PHOTOS[(p.photo || 0) % PHOTOS.length];
      alpha(c, 0.35, () => R(2, 2, 12, 16, '#07060E', c));
      R(0, 0, 12, 15, '#F6F2E8', c);
      R(0, 14, 12, 1, '#C9C2B0', c);
      R(1, 1, 10, 9, sky, c);
      R(1, 7, 10, 3, ground, c);
      R(3, 3, 2, 2, '#FFF4DA', c);
      R(5, 0, 2, 1, '#C8323A', c);
    }
  };

  // arandela dourada com luz
  props.sconce = {
    layer: 'back',
    size: () => [16, 22],
    draw(c) {
      glow(c, 0, 0, 16, 16, '#4A3E80', (i, j) => Math.max(0, 1 - Math.hypot(i - 7.5, j - 7) / 8));
      R(6, 4, 4, 5, '#FFF0C0', c);
      R(7, 3, 2, 1, '#FFF0C0', c);
      R(5, 9, 6, 2, GOLD, c);
      R(7, 11, 2, 4, GOLD_D, c);
      R(6, 15, 4, 1, GOLD, c);
    }
  };

  // tapete redondo do baú
  props.rug = {
    layer: 'back',
    size: p => [p.w || 72, p.h || 36],
    draw(c, p) {
      const w = p.w || 72, h = p.h || 36;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = (x + 0.5 - w / 2) / (w / 2), dy = (y + 0.5 - h / 2) / (h / 2), d = dx * dx + dy * dy;
          if (d > 1) continue;
          R(x, y, 1, 1, d > 0.82 ? GOLD_D : d > 0.7 ? GOLD : d > 0.45 ? '#7A2E3A' : '#94404C', c);
        }
      }
    }
  };

  // Porta no fim do corredor: abre quando a Ellen chega perto e deixa a luz da próxima memória
  // entrar. locked: true = a porta por onde ela entrou (fica fechada). A abertura anda pelo
  // relógio do jogo (world.t), não pelos quadros desenhados: leva 0,2 s em qualquer tela.
  props.hallDoor = {
    size: () => [8, 40],
    base: 0,
    live(ctx, p, world) {
      const e = world.ellen, near = !p.locked && e && Math.abs(e.x - (p.x + 4)) < 46 && Math.abs(e.y - (p.y + 24)) < 36;
      const dt = p.lastT === undefined ? 0 : Math.max(0, Math.min(0.1, world.t - p.lastT));
      p.lastT = world.t;
      p.open = Math.max(0, Math.min(1, (p.open || 0) + (near ? dt : -dt) / 0.2));
      if (p.open > 0 && !p.wasOpen) Sound.sfx('door');
      p.wasOpen = p.open > 0.5 ? true : p.open <= 0 ? false : p.wasOpen;
      const x = p.x, y = p.y, k = p.open;
      // luz do outro lado
      ctx.save();
      ctx.globalAlpha = p.locked ? 0.12 : 0.25 + 0.6 * k;
      Gfx.rect(x, y + 4, 8, 32, '#FFF4DA');
      ctx.globalAlpha = 0.18 * k;
      Gfx.rect(x - 16, y + 6, 16, 28, '#FFF4DA');
      ctx.restore();
      // a folha da porta gira para fora
      const leaf = Math.round(32 * (1 - k));
      if (leaf > 0) {
        Gfx.rect(x + 1, y + 4, 6, leaf, '#6A4129');
        Gfx.rect(x + 1, y + 4, 1, leaf, '#8A5A3A');
        Gfx.rect(x + 6, y + 4, 1, leaf, '#4A2B1C');
        if (leaf > 18) Gfx.rect(x + 2, y + 20, 1, 2, GOLD);
      }
    },
    draw() {}
  };

  // baú: madeira com ferragens douradas; a tampa abre (p.open de 0 a 1) e brilha por dentro
  function chestImg(open) {
    const cv = Gfx.canvas(28, 30), c = cv.cx;
    alpha(c, 0.35, () => {
      for (let y = 0; y < 5; y++) R(2 + Math.abs(2 - y), 25 + y, 24 - Math.abs(2 - y) * 2, 1, '#07060E', c);
    });
    // corpo
    R(2, 13, 24, 14, '#7A4A22', c);
    R(2, 13, 24, 1, '#9A6232', c);
    for (let k = 0; k < 3; k++) R(3, 17 + k * 4, 22, 1, '#5E3418', c);
    R(2, 13, 2, 14, GOLD_D, c);
    R(24, 13, 2, 14, GOLD_D, c);
    R(2, 13, 1, 14, GOLD, c);
    R(24, 13, 1, 14, GOLD, c);
    R(2, 26, 24, 1, '#3A1E0E', c);
    if (open < 0.5) {
      // tampa fechada (arredondada) e fechadura
      R(3, 5, 22, 8, '#8A5426', c);
      R(4, 4, 20, 1, '#8A5426', c);
      R(4, 5, 20, 1, '#A86A34', c);
      R(3, 11, 22, 2, '#5E3418', c);
      R(2, 6, 2, 7, GOLD_D, c);
      R(24, 6, 2, 7, GOLD_D, c);
      R(12, 10, 4, 6, GOLD, c);
      R(12, 10, 4, 1, GOLD_H, c);
      R(13, 13, 2, 2, '#3A1E0E', c);
    } else {
      // tampa aberta para trás e o brilho de dentro
      R(3, 0, 22, 6, '#5E3418', c);
      R(3, 0, 22, 1, '#7A4A22', c);
      R(2, 0, 2, 6, GOLD_D, c);
      R(24, 0, 2, 6, GOLD_D, c);
      R(4, 7, 20, 6, '#2A1408', c);
      R(5, 8, 18, 4, '#F2D27A', c);
      R(7, 8, 14, 2, '#FFF4DA', c);
    }
    return cv;
  }
  const chestImgs = {};

  props.chest = {
    size: () => [28, 30],
    solid: () => [3, 14, 22, 13],
    base: 27,
    live(ctx, p, world) {
      const k = p.open || 0, key = k >= 0.5 ? 'open' : 'shut';
      const img = chestImgs[key] || (chestImgs[key] = chestImg(k));
      ctx.drawImage(img, p.x, p.y + (k > 0 && k < 1 ? -1 : 0));
      // brilhinho na fechadura enquanto está fechado
      if (!p.used) {
        const ph = (world.t * 0.8) % 1;
        if (ph < 0.3) {
          const a = 1 - Math.abs(ph - 0.15) / 0.15;
          ctx.globalAlpha = a;
          Gfx.rect(p.x + 18, p.y + 7, 1, 5, '#FFFFFF');
          Gfx.rect(p.x + 16, p.y + 9, 5, 1, '#FFFFFF');
          ctx.globalAlpha = 1;
        }
      } else if (k >= 1) {
        // luz subindo do baú aberto
        for (let i = 0; i < 4; i++) {
          const ph = (world.t * 0.9 + i / 4) % 1;
          ctx.globalAlpha = 0.8 * (1 - ph);
          Gfx.rect(p.x + 7 + i * 4, p.y + 6 - ph * 18, 1, 2, '#FFF4DA');
        }
        ctx.globalAlpha = 1;
      }
    },
    draw() {}
  };
})();
