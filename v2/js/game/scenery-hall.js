// Corredor entre as salas (zona segura) e a salinha do baú: um salão "entre as memórias", com
// papel de parede índigo, frisos dourados, polaroides, passadeira vermelha e o vazio estrelado em
// volta. O corredor termina numa porta que se abre quando a Ellen chega perto.
// V2 (etapa 3): tudo no desenho novo (art.js). Aqui ficam o tamanho e a colisão da V1 (coordenadas
// velhas; o Room.build amplia) e, mais abaixo, o desenho novo.
(() => {
  const { props } = Scenery;

  // polaroide pendurada na parede (p.photo: qual memória), arandela, tapete do baú (p.w, p.h)
  props.polaroid = { layer: 'back', size: () => [14, 18] };
  props.sconce = { layer: 'back', size: () => [16, 22] };
  props.rug = { layer: 'back', size: p => [p.w || 72, p.h || 36] };

  // porta no fim do corredor (locked: true = a porta por onde a Ellen entrou) e o baú (interact)
  props.hallDoor = { size: () => [8, 40], base: 0 };
  props.chest = { size: () => [28, 30], solid: () => [3, 14, 22, 13], base: 27 };

  // ======================================================================
  //  V2 (art.js): o corredor e a salinha do baú em coordenadas novas. O salão "entre as memórias":
  //  papel de parede índigo com losangos, frisos dourados, tábuas arroxeadas, a passadeira vermelha
  //  e o vazio estrelado em volta (com uma nebulosa bem fraca)
  // ======================================================================
  const A = Art, { pick, vnoise, sphere, bay, mix } = Art, h01 = Art.hash, K = 1.25;
  const GOLDR = A.tones(['#6A4A1A', '#8A6A2A', '#AE8A3A', '#C9A24A', '#E2C068', '#F6E09A']);
  const INDIGO = A.tones(['#16112C', '#1E1838', '#261F48', '#2E2656', '#382F66', '#463C7A']);
  const VIOLET_FLOOR = A.tones(['#2E2442', '#3A2E52', '#46385E', '#524268', '#5E4C72', '#6C587E', '#7A6690']);
  const RUNNER = A.tones(['#4A1420', '#621C2C', '#7A2638', '#943444', '#AC4652', '#C45E66']);

  // o vazio: azul quase preto, nebulosa roxa fraquinha e estrelas paradas
  function voidArt(S, x0, y0, w, h, seed) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const n = vnoise(x, y, 40, seed) * 0.6 + vnoise(x, y, 12, seed + 1) * 0.4;
      let c = pick(A.tones(['#08060F', '#0B0918', '#100C22', '#16102E']), 0.3 + n * 0.5, x, y);
      if (n > 0.62) c = mix(c, '#3A2468', (n - 0.62) * 0.9);
      const st = h01(x, y, seed + 2);
      if (st < 0.004) c = '#E8E4FF'; else if (st < 0.012) c = '#8E86C8'; else if (st < 0.02) c = '#3C3466';
      S.put(x, y, c);
    }
  }
  const band2 = look => look.bounds || [0, 480];

  Art.floors.hall = (S, look) => {
    const [b0, b1] = band2(look), top = look.wall.height, bottom = look.bottom || 240;
    voidArt(S, 0, top, 480, 240 - top, 140);
    Scenery.planksArt(S, b0, top, b1 - b0, bottom - top, { R: VIOLET_FLOOR, rh: 8, seed: 141, gloss: 0.1 });
    // a passadeira vermelha com a borda dourada, na altura das portas
    const gap = (look.doors && (look.doors.left || look.doors.right)) || [120, 160];
    const ry = gap[0] + 5, rh = gap[1] - gap[0] - 10;
    for (let y = ry - 1; y < ry + rh + 1; y++) for (let x = b0; x < b1; x++) {
      const j = y - ry;
      let c;
      if (j < 0 || j >= rh) c = GOLDR[1];
      else if (j === 1 || j === rh - 2) c = pick(GOLDR, 0.75 - (x - b0) * 0.0005, x, y);
      else if (j === 0 || j === rh - 1) c = RUNNER[1];
      else {
        let t = 0.55 - (j - 2) / (rh - 4) * 0.25 + (vnoise(x, y, 3, 142) - 0.5) * 0.12;
        // losangos dourados bordados no meio
        const m = Math.abs(((x - b0) % 16) - 8) + Math.abs(j - rh / 2);
        if (m === 4) t += 0.3;
        c = pick(RUNNER, t, x, y);
        if (m < 1.5) c = GOLDR[3];
      }
      S.put(x, y, c);
    }
    // a mureta da frente (o chão termina aqui)
    if (bottom < 240) {
      for (let y = bottom; y < bottom + 8; y++) for (let x = b0; x < b1; x++) {
        S.put(x, y, y === bottom ? GOLDR[2] : y === bottom + 1 ? GOLDR[0] : pick(INDIGO, 0.5 - (y - bottom) * 0.06, x, y));
      }
      for (let x = b0; x < b1; x++) S.put(x, bottom + 8, '#07060E');
    }
    for (let y = top; y < top + 5; y++) for (let x = b0; x < b1; x++) S.mul(x, y, '#7A7090', (1 - (y - top) / 5) * 0.7);
  };

  // parede do fundo: papel de parede índigo com losangos, a sanca e o friso dourados e o lambri
  Art.walls.hall = (S, look) => {
    const [b0, b1] = band2(look), h = look.wall.height, rail = h - 18;
    voidArt(S, 0, 0, 480, h, 140);
    for (let y = 0; y < h; y++) for (let x = b0; x < b1; x++) {
      let c;
      if (y < 6) c = pick(INDIGO, 0.2 + (y === 5 ? 0.2 : 0), x, y);
      else if (y < 8) c = y === 6 ? GOLDR[2] : GOLDR[4];
      else if (y < rail) {
        // losangos (damasco) com um pontinho dourado no meio de cada um
        const u = (x - b0) % 12, v = (y - 8) % 14, d = Math.abs(u - 6) / 6 + Math.abs(v - 7) / 7;
        let t = 0.5 - (y - 8) / (rail - 8) * 0.15 + (vnoise(x, y, 6, 144) - 0.5) * 0.1;
        if (Math.abs(d - 0.75) < 0.09) t += 0.25;
        c = pick(INDIGO, t, x, y);
        if (u === 6 && v === 7) c = GOLDR[3];
      } else if (y < rail + 2) c = y === rail ? GOLDR[5] : GOLDR[1];
      else {
        const px = (x - b0 - 5) % 26, py = y - rail - 4;
        let t = 0.3 - (y - rail) / 18 * 0.1;
        if (px >= 0 && px < 18 && py >= 0 && py < 10) t += (px === 0 || py === 0) ? -0.15 : (px === 17 || py === 9) ? 0.15 : 0.08;
        c = pick(INDIGO, t, x, y);
      }
      S.put(x, y, c);
    }
    for (let x = b0; x < b1; x++) S.put(x, h - 1, '#120E24');
  };

  // paredes laterais grossas, com a passagem e o batente dourado
  Art.edges.hall = (S, x, top, gap, side, look) => {
    const bottom = (look.bottom || 240) + 8, wx = side === 'left' ? x - 5 : x;
    const segs = gap ? [[0, gap[0]], [gap[1], bottom]] : [[0, bottom]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < Math.min(b, 240); y++) for (let i = 0; i < 10; i++) {
        const inner = side === 'left' ? i : 9 - i;
        let c = pick(INDIGO, 0.3 + (inner === 9 ? 0.45 : inner === 8 ? 0.2 : 0) - (inner === 0 ? 0.2 : 0) + (vnoise(wx + i, y, 4, 145) - 0.5) * 0.1, wx + i, y);
        S.put(wx + i, y, c);
      }
    });
    if (gap) for (let i = 0; i < 10; i++) {
      for (const [y, c] of [[gap[0] - 3, GOLDR[4]], [gap[0] - 2, GOLDR[2]], [gap[0] - 1, GOLDR[0]], [gap[1], GOLDR[4]], [gap[1] + 1, GOLDR[2]], [gap[1] + 2, GOLDR[0]]]) S.put(wx + i, y, c);
    }
  };

  // estrelas do vazio piscando
  Art.scenefx.hall = (ctx, ox, world) => {
    for (let i = 0; i < 24; i++) {
      const on = Math.sin(world.t * (0.6 + h01(i, 1, 330) * 1.4) + i * 2.3);
      if (on < 0.6) continue;
      const x = Math.round(ox + h01(i, 2, 330) * 480), y = Math.round(h01(i, 3, 330) * 238);
      ctx.globalAlpha = (on - 0.6) / 0.4;
      Gfx.rect(x, y, 1, 1, '#FFFFFF');
      if (on > 0.93) { Gfx.rect(x - 1, y, 3, 1, '#B8B0F0'); Gfx.rect(x, y - 1, 1, 3, '#B8B0F0'); }
    }
    ctx.globalAlpha = 1;
  };

  // polaroide pendurada na parede (memórias genéricas: céu, mar, noite, flores, praia)
  const PHOTOS2 = [
    { sky: ['#5E9AD8', '#9AC8F0'], ground: '#5DAA62', sun: '#FFF4DA' },
    { sky: ['#E88A5A', '#F8C890'], ground: '#5A3A4A', sun: '#FFE8A0' },
    { sky: ['#1E2850', '#3A4A80'], ground: '#1A2030', sun: '#F2D78E' },
    { sky: ['#F0A8C0', '#FCD8E0'], ground: '#5DAA62', sun: '#FFFFFF' },
    { sky: ['#58B8C8', '#A8E0E8'], ground: '#F2E8CC', sun: '#FFFFFF' }
  ];
  props.polaroid.art = p => {
    const P = PHOTOS2[(p.photo || 0) % PHOTOS2.length], s = A.surface(19, 23);
    for (let y = 2; y < 23; y++) for (let x = 2; x < 19; x++) s.put(x, y, '#07060E', 0.35);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 16; x++) s.put(x, y, pick(A.tones(['#D8D2C0', '#ECE8DC', '#FAF8F0']), 0.8 - y * 0.02 - (x === 15 || y === 19 ? 0.4 : 0), x, y));
    for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) {
      let c = pick(A.tones(P.sky), 1 - (y - 2) / 8, x, y);
      if (y > 9 + Math.sin(x * 0.7) * 0.8) c = pick(A.tones([mix(P.ground, '#000000', 0.25), P.ground].map(A.hex)), 0.6, x, y);
      s.put(x, y, c);
    }
    s.put(4, 4, P.sun); s.put(5, 4, P.sun); s.put(4, 5, P.sun); s.put(5, 5, mix(P.sun, P.sky[1], 0.5));
    s.rect(7, 0, 2, 1, '#E04A4A'); s.put(7, 0, '#F48A8A'); s.put(8, 1, '#8A1E22');
    return { spr: s, shadow: false };
  };

  // arandela dourada com a chama e a luz no papel de parede
  props.sconce.art = () => {
    const s = A.surface(30, 30), cx = 15, cy = 9;
    for (let y = 0; y < 30; y++) for (let x = 0; x < 30; x++) {
      const r = Math.hypot(x - cx, (y - cy) * 1.05);
      if (r < 15) s.tput(x, y, '#8A74D0', Math.pow(1 - r / 15, 1.6) * 0.5);
    }
    s.ellipse(cx, cy, 3, 4.5, (x, y, nx, ny) => pick(A.tones(['#F2C870', '#FFE6A0', '#FFF6D8', '#FFFFFF']), 0.9 - ny * 0.3 - Math.abs(nx) * 0.3, x, y));
    for (let x = cx - 4; x <= cx + 4; x++) { s.put(x, cy + 5, GOLDR[4]); s.put(x, cy + 6, GOLDR[2]); }
    for (let y = cy + 7; y < cy + 12; y++) { s.put(cx, y, GOLDR[3]); s.put(cx + 1, y, GOLDR[1]); }
    for (let x = cx - 2; x <= cx + 3; x++) s.put(x, cy + 12, x < cx + 1 ? GOLDR[4] : GOLDR[1]);
    return { spr: s, dx: -7, dy: -3, shadow: false };
  };

  // tapete oval do baú, com a borda dourada e o desenho no meio
  props.rug.art = p => {
    const w = Math.round((p.w || 72) * K), hh = Math.round((p.h || 36) * K), s = A.surface(w, hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2), dy = (y + 0.5 - hh / 2) / (hh / 2), d = dx * dx + dy * dy;
      if (d > 1) continue;
      let c;
      if (d > 0.84) c = pick(GOLDR, 0.25 + (dy < 0 ? 0.2 : 0), x, y);
      else if (d > 0.72) c = pick(GOLDR, 0.7 + (dy < 0 ? 0.15 : -0.1), x, y);
      else if (d > 0.62) c = RUNNER[1];
      else {
        let t = 0.55 + (vnoise(x, y, 3, 146) - 0.5) * 0.12 - dy * 0.1;
        const m = Math.abs(Math.abs(dx) * 3 - Math.abs(dy) * 3);
        if (m < 0.18) t += 0.25;
        c = pick(RUNNER, t, x, y);
        if (d < 0.03) c = GOLDR[4];
      }
      s.put(x, y, c);
    }
    return { spr: s, shadow: false };
  };

  // Porta no fim do corredor (V2: em coordenadas novas). Abre quando a Ellen chega perto (a mesma
  // conta da V1, ampliada) e deixa a luz da próxima memória entrar; locked: a porta por onde ela entrou.
  props.hallDoor.liveNew = (ctx, p, world) => {
    const e = world.ellen, px = p.x * K, py = p.y * K;
    const near = !p.locked && e && Math.abs(e.x - (p.x + 4) * K) < 46 * K && Math.abs(e.y - (p.y + 24) * K) < 36 * K;
    const dt = p.lastT === undefined ? 0 : Math.max(0, Math.min(0.1, world.t - p.lastT));
    p.lastT = world.t;
    p.open = Math.max(0, Math.min(1, (p.open || 0) + (near ? dt : -dt) / 0.2));
    if (p.open > 0 && !p.wasOpen) Sound.sfx('door');
    p.wasOpen = p.open > 0.5 ? true : p.open <= 0 ? false : p.wasOpen;
    const x = Math.round(px), y = Math.round(py), k = p.open;
    // a luz do outro lado (mais forte com a porta aberta), em degraus
    ctx.save();
    ctx.globalAlpha = p.locked ? 0.14 : 0.3 + 0.6 * k;
    Gfx.rect(x, y + 5, 10, 40, '#FFF4DA');
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = (0.2 - i * 0.045) * k;
      const w = 6 + i * 6;
      Gfx.rect(p.locked ? x + 10 : x - w, y + 7 + i, w, 36 - i * 2, '#FFF4DA');
    }
    ctx.restore();
    // a folha da porta (madeira com almofadas e a maçaneta dourada) gira para fora
    const leaf = Math.round(40 * (1 - k));
    if (leaf > 0) {
      for (let j = 0; j < leaf; j++) for (let i = 1; i < 9; i++) {
        let c = i === 1 ? '#8A5A3A' : i === 8 ? '#3A2214' : (j % 13 === 0 || i === 2 || i === 7) ? '#5A3824' : '#6A4129';
        Gfx.rect(x + i, y + 5 + j, 1, 1, c);
      }
      if (leaf > 22) { Gfx.rect(x + 3, y + 25, 2, 3, GOLDR[3]); Gfx.rect(x + 3, y + 25, 1, 1, GOLDR[5]); }
    }
  };

  // baú: madeira com ferragens douradas; a tampa abre (p.open de 0 a 1) e brilha por dentro
  function chestArt(open) {
    const s = A.surface(36, 38), WOODC = A.tones(['#3A1E0E', '#5E3418', '#7A4A22', '#9A6232', '#B47A42', '#CC9458']);
    // corpo
    for (let y = 16; y < 34; y++) for (let x = 2; x < 34; x++) {
      let t = 0.55 - (x - 2) / 32 * 0.25 + ((y - 16) % 5 === 0 ? -0.25 : (y - 16) % 5 === 1 ? 0.12 : 0) + (vnoise(x * 0.3, y, 2, 150) - 0.5) * 0.15;
      if (y === 33) t = 0.05;
      s.put(x, y, pick(WOODC, t, x, y));
    }
    // cantoneiras douradas
    for (let y = 16; y < 34; y++) for (const [x0, x1] of [[2, 5], [31, 34]]) for (let x = x0; x < x1; x++) s.put(x, y, pick(GOLDR, x === x0 ? 0.9 : x === x1 - 1 ? 0.25 : 0.55, x, y));
    if (open < 0.5) {
      // tampa fechada (abaulada) e a fechadura
      for (let y = 5; y < 16; y++) for (let x = 3; x < 33; x++) {
        const ny = (y + 0.5 - 12) / 7;
        if (y < 7 && (x < 4 + (7 - y) || x > 31 - (7 - y))) continue;
        let t = 0.5 + sphere(0, Math.max(-1, Math.min(1, ny))) * 0.4 - (x - 3) / 30 * 0.2;
        if (y === 14 || y === 15) t = 0.1;
        s.put(x, y, pick(WOODC, t, x, y));
      }
      for (let y = 6; y < 16; y++) for (const [x0, x1] of [[3, 5], [31, 33]]) for (let x = x0; x < x1; x++) s.put(x, y, pick(GOLDR, x === x0 ? 0.85 : 0.4, x, y));
      for (let y = 12; y < 20; y++) for (let x = 15; x < 21; x++) s.put(x, y, pick(GOLDR, 0.8 - (x - 15) * 0.1 + (y === 12 ? 0.2 : 0), x, y));
      s.put(17, 15, '#3A1E0E'); s.put(18, 15, '#3A1E0E'); s.put(17, 16, '#3A1E0E'); s.put(18, 17, '#2A1408');
    } else {
      // tampa aberta para trás e o brilho de dentro
      for (let y = 0; y < 8; y++) for (let x = 3; x < 33; x++) s.put(x, y, pick(WOODC, 0.3 + (y === 0 ? 0.3 : 0) - (x - 3) / 30 * 0.15, x, y));
      for (let y = 0; y < 8; y++) for (const [x0, x1] of [[3, 5], [31, 33]]) for (let x = x0; x < x1; x++) s.put(x, y, pick(GOLDR, x === x0 ? 0.8 : 0.35, x, y));
      for (let y = 8; y < 16; y++) for (let x = 4; x < 32; x++) {
        const edge = y === 8 || x === 4 || x === 31;
        s.put(x, y, edge ? '#2A1408' : pick(A.tones(['#C8A040', '#F2D27A', '#FFF0B8', '#FFFCEC']), 1 - (y - 9) / 6 - Math.abs(x - 18) / 30, x, y));
      }
    }
    s.outline(0.5);
    return s.canvas();
  }
  const chestArts = {};
  props.chest.liveNew = (ctx, p, world) => {
    const k = p.open || 0, key = k >= 0.5 ? 'open' : 'shut';
    const img = chestArts[key] || (chestArts[key] = chestArt(k));
    const x = Math.round(p.x * K), y = Math.round(p.y * K) + (k > 0 && k < 1 ? -1 : 0);
    // sombra no tapete
    ctx.save();
    ctx.globalAlpha = 0.35;
    Gfx.rect(x + 3, y + 34, 32, 2, '#07060E');
    Gfx.rect(x + 5, y + 36, 28, 1, '#07060E');
    ctx.restore();
    ctx.drawImage(img, x - 1, y - 1);
    if (!p.used) {
      // brilhinho na fechadura enquanto está fechado
      const ph = (world.t * 0.8) % 1;
      if (ph < 0.3) {
        ctx.globalAlpha = 1 - Math.abs(ph - 0.15) / 0.15;
        Gfx.rect(x + 22, y + 9, 1, 7, '#FFFFFF');
        Gfx.rect(x + 19, y + 12, 7, 1, '#FFFFFF');
        ctx.globalAlpha = 1;
      }
    } else if (k >= 1) {
      // luz subindo do baú aberto
      for (let i = 0; i < 5; i++) {
        const ph = (world.t * 0.9 + i / 5) % 1;
        ctx.globalAlpha = 0.8 * (1 - ph);
        Gfx.rect(x + 8 + i * 5, Math.round(y + 7 - ph * 24), 1, 3, '#FFF4DA');
      }
      ctx.globalAlpha = 1;
    }
  };
})();
