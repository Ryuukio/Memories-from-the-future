// Fase 4 ("Islands, Rings & Lanterns"): o zoológico e o aquário de Okinawa (A), o mergulho e a
// oficina das alianças (B), o festival de lanternas de Yanai e as dunas de Tottori (C).
//
// V2 (etapa 4): tudo é desenhado no tamanho novo, com as ferramentas de art.js. Cada objeto guarda o
// tamanho, a colisão e a visão da V1 (coordenadas velhas; o Room.build amplia) e ganha um `art` com o
// desenho novo, mais abaixo (os que animam, `liveNew` ou `fxNew`); os pisos, paredes e bordas novos
// ficam em Art.floors/walls/edges. O desenho da V1 daqui saiu.
(() => {
  const { props } = Scenery;

  // ---------- tamanho, colisão e visão dos objetos (V1; o desenho é o `art`, mais abaixo) ----------
  // A1 · zoológico: cercado com o bicho (p.animal: elephant, lion, giraffe, monkey; tapa a visão; anima),
  // a placa com as setas (texto do config, uma linha por "|") e a barraquinha de comida (p.color, texto)
  props.enclosure = { size: p => [p.w || 110, 62], solid: p => [0, 6, p.w || 110, 54], sight: p => [0, 30, p.w || 110, 30], base: 60 };
  props.zooSign = { size: () => [52, 40], solid: () => [24, 34, 4, 4], base: 38 };
  props.foodStand = { size: () => [52, 40], solid: () => [0, 18, 52, 18], sight: () => [0, 4, 52, 34], base: 36 };

  // A2 · aquário: a vida do tanque (no chão, atrás de tudo), o tubarão-baleia (quem anda, prop) e o
  // corrimão baixo na frente do vidro (bloqueia a passagem, não a visão)
  props.tankLife = { hidden: true, size: () => [1, 1], fxLayer: 'ground' };
  props.whaleShark = { hidden: true, size: () => [1, 1] };
  props.tankRail = { size: p => [p.w || 384, 8], solid: p => [0, 2, p.w || 384, 4], base: 6 };

  // B1 · mergulho: o coral grande e a pedra com alga (tapam a visão), os raios de luz e as bolhas (por
  // cima de tudo) e o cardume (quem anda, prop: tapa a visão, não bloqueia a passagem)
  props.coral = { size: p => [p.w || 70, 54], solid: p => [6, 24, (p.w || 70) - 12, 26], sight: p => [4, 6, (p.w || 70) - 8, 44], base: 50 };
  props.seaRock = { size: () => [30, 24], solid: () => [2, 10, 26, 12], sight: () => [2, 4, 26, 18], base: 22 };
  props.underwater = { hidden: true, size: () => [1, 1] };
  props.fishSchool = { hidden: true, size: () => [1, 1] };

  // B2 · oficina: as lâmpadas penduradas (por cima de tudo), a bancada (p.w) e a vitrine dos anéis
  // (bloqueia a passagem, não tapa a visão)
  props.bulbs = { hidden: true, size: () => [1, 1] };
  props.workbench = { size: p => [p.w || 90, 26], solid: p => [0, 4, p.w || 90, 18], base: 20 };
  props.ringCase = { size: () => [44, 26], solid: () => [0, 6, 44, 18], base: 24 };

  // C · Yanai e Tottori: a lanterna de peixinho e o fio (por cima de tudo) e o pau com o celular
  // (p.timer: a tela pisca)
  props.goldfishLantern = { hidden: true, size: () => [1, 1] };
  props.lanternString = { hidden: true, size: () => [1, 1] };
  props.phoneStick = { size: () => [10, 30], solid: () => [3, 24, 4, 4], base: 28 };

  // ======================================================================
  //  V2 (art.js): tudo em coordenadas novas (480 × 240). Cada objeto guarda o tamanho, a colisão e a
  //  visão da V1 (acima) e ganha um `art` (ou `liveNew`/`fxNew`, se anima) com o desenho novo.
  // ======================================================================
  const A = Art, T = Art.tones, { pick, vnoise, sphere, bay, mix, clamp1 } = Art, h01 = Art.hash;
  const K = 1.25, kx = n => Math.round(n * K);
  const kit = Art.kit;
  const WHITE = T(['#9EA2B4', '#BCC0CC', '#D6D8DE', '#E8E8EA', '#F6F6F4', '#FFFFFF']);
  const WOOD = T(['#4A3020', '#5E3E28', '#765034', '#8E6442', '#A67A52', '#BC9064']);
  const IRONF = T(['#2A2E36', '#3A3F48', '#4E545E', '#666C76', '#80868F', '#9AA0A8']);
  // sprite pequeno a partir de uma superfície, em cache (para o que anima a cada quadro)
  const cvCache = {};
  const cached = (key, make) => cvCache[key] || (cvCache[key] = make());

  // ======================================================================
  //  A1 · o zoológico numa tarde de primavera: grama, o caminho de pedrisco com o meio-fio, a mata no
  //  fundo; cercados com os bichos animados (elefante, girafa, leão) atrás da grade, a placa com as
  //  setas e as barraquinhas de comida (o 'festivalSky' da V1 vira 'zooSky': o céu é só daqui)
  // ======================================================================
  const GRAVEL = T(['#A89C84', '#B8AC94', '#C6BAA2', '#D2C8B0', '#DED4BE', '#E8E0CC']);
  Art.floors.zoo = (S, look) => {
    const top = look.wall.height, [p0, p1] = look.path || [top, top];
    kit.grass(S, 0, top, 480, 240 - top, { seed: 740 });
    for (let y = p0; y < p1; y++) for (let x = 0; x < 480; x++) {
      const e = Math.min(y - p0, p1 - 1 - y);
      let c;
      if (e < 3) c = pick(T(['#8A8478', '#A8A296', '#C8C2B4', '#E2DCCE']), e === 0 ? (y === p0 ? 0.9 : 0.15) : e === 1 ? 0.6 : 0.4, x, y);
      else {
        c = pick(GRAVEL, 0.55 + (vnoise(x, y, 14, 741) - 0.5) * 0.25 + (h01(x, y, 742) - 0.5) * 0.45, x, y);
        if (e < 6) c = mix(c, '#8A8070', 0.25);
      }
      S.put(x, y, c);
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#90A0B4', (1 - (y - top) / 5) * 0.7);
  };
  Art.walls.zooSky = (S, look) => {
    const H = look.wall.height, SKYZ = T(['#4C88D4', '#5896DA', '#66A4E0', '#78B2E4', '#8CBEE8', '#A2CAEA', '#B8D6EC']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYZ, y / (H - 4) + (vnoise(x, y, 40, 743) - 0.5) * 0.06, x, y));
    kit.cumulus(S, 140, 10, [[-9, 0, 4], [-2, -2, 5], [6, 0, 4]], 2);
    kit.cumulus(S, 390, 7, [[-7, 0, 3], [0, -1, 4], [6, 1, 3]], 2);
    for (let y = H - 14; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(kit.LEAF, 0.22 + (vnoise(x, y, 3, 744) - 0.5) * 0.4, x, y));
    for (let x = -6, q = 0; x < 490; x += 10 + Math.floor(h01(q, 1, 745) * 6), q++) kit.lump(S, x, H - 14 + h01(q, 2, 745) * 5, 7 + h01(q, 3, 745) * 4, -0.05, 750 + q);
    for (let x = 0, q = 0; x < 490; x += 12 + Math.floor(h01(q, 1, 746) * 7), q++) kit.lump(S, x, H - 5 + h01(q, 2, 746) * 3, 6 + h01(q, 3, 746) * 3, 0.05, 800 + q);
  };

  // Cercado (p.animal: elephant, lion, giraffe, monkey; tapa a visão): o chão do bicho, o bicho
  // animado e, na frente, o muro baixo de pedra com a grade. O fundo e a grade ficam em cache; só o
  // bicho muda a cada quadro.
  const GREY = T(['#4A4C58', '#5E606C', '#727480', '#868894', '#9A9CA6', '#B0B2BA']);
  const TAWNY = T(['#7A4A1E', '#9A6228', '#B87C36', '#D09848', '#E2B060', '#F0CA80']);
  const MANE = T(['#4A2A14', '#6A3A1A', '#8A4E22', '#A8642C']);
  const GIRAFFE = T(['#A8742E', '#C08A3A', '#D6A24A', '#E6BA62', '#F2D088']);
  function encBack(p, W) {
    return cached('encB|' + p.animal + '|' + W, () => {
      const s = A.surface(W, 72), sandy = p.animal === 'lion';
      for (let y = 6; y < 70; y++) for (let x = 0; x < W; x++) {
        const R = sandy ? T(['#A8885A', '#BC9C6A', '#CCAE7C', '#DAC092', '#E6D0A6']) : kit.GRASS;
        let t = 0.5 + (vnoise(x, y, 8, 760) - 0.5) * 0.4 + (h01(x, y, 761) - 0.5) * 0.3 + (y < 12 ? -0.2 : 0);
        s.put(x, y, pick(R, t, x, y));
      }
      if (p.animal === 'lion') s.ellipse(W * 0.2, 30, 12, 7, (x, y, nx, ny) => pick(T(['#6A6058', '#827870', '#9A9088', '#B4AAA0']), sphere(nx, ny) + 0.1, x, y));
      if (p.animal === 'elephant') s.ellipse(W * 0.22, 40, 16, 5, (x, y, nx, ny) => pick(T(['#2A5A7A', '#3A7090', '#5088A8', '#78A8C4']), 0.4 - ny * 0.3, x, y));
      if (p.animal === 'giraffe') for (let y = 6; y < 44; y++) for (let i = 0; i < 3; i++) s.put(W - 12 + i, y, pick(WOOD, 0.7 - i * 0.2, W - 12 + i, y));
      for (let x = 0; x < W; x++) { s.put(x, 6, '#6A6A72'); s.put(x, 7, '#4A4A52'); }
      return s.canvas();
    });
  }
  function encFront(W) {
    return cached('encF|' + W, () => {
      const s = A.surface(W, 78), STONE = T(['#6A6660', '#7E7A72', '#948E84', '#AAA498', '#C0BAAE']);
      // a grade: barras verticais com o corrimão em cima e embaixo
      for (let x = 0; x < W; x += 5) for (let y = 42; y < 71; y++) { s.put(x, y, IRONF[3]); s.put(x + 1, y, IRONF[1]); }
      for (let x = 0; x < W; x++) { s.put(x, 41, IRONF[5]); s.put(x, 42, IRONF[3]); s.put(x, 43, IRONF[1]); s.put(x, 55, IRONF[2]); }
      // o muro baixo de pedra
      for (let y = 69; y < 77; y++) for (let x = 0; x < W; x++) {
        const bx = (x + (Math.floor((y - 69) / 4) % 2) * 6) % 12, by = (y - 69) % 4;
        s.put(x, y, pick(STONE, (y === 69 ? 0.9 : 0.55) - x / W * 0.15 + (bx === 0 || by === 0 ? -0.3 : 0) + (h01(x, y, 762) - 0.5) * 0.2, x, y));
      }
      return s.canvas();
    });
  }
  function animalImg(kind, f) {
    return cached('ani|' + kind + '|' + f, () => {
      let s;
      if (kind === 'elephant') {
        s = A.surface(54, 40);
        // pernas, corpo, cabeça com a orelha, a tromba balançando
        [[10, 0], [18, 1], [30, 0], [36, 1]].forEach(([lx, back]) => { for (let y = 26; y < 38; y++) for (let i = 0; i < 5; i++) s.put(lx + i, y, pick(GREY, 0.6 - i * 0.1 - back * 0.25, lx + i, y)); });
        s.ellipse(24, 20, 17, 11, (x, y, nx, ny) => pick(GREY, sphere(nx, ny) + 0.05 + (h01(x, y, 763) < 0.06 ? -0.15 : 0), x, y));
        s.ellipse(42, 15, 8, 8, (x, y, nx, ny) => pick(GREY, sphere(nx, ny) + 0.1, x, y));
        s.ellipse(36, 15, 6, 8, (x, y, nx, ny) => pick(GREY, sphere(nx, ny) - 0.05, x, y));
        const sw = [0, 1, 2, 1][f];
        for (let y = 18; y < 34; y++) { const tx = Math.round(47 + (y - 18) * 0.12 * (sw - 1)); s.put(tx, y, GREY[3]); s.put(tx + 1, y, GREY[2]); s.put(tx + 2, y, GREY[1]); }
        s.put(45, 13, '#1A1820'); s.put(47, 19, '#F2F0E6'); s.put(48, 20, '#F2F0E6');
        s.put(4, 18 + (f % 2), GREY[1]); s.put(5, 19 + (f % 2), GREY[1]);
      } else if (kind === 'lion') {
        s = A.surface(48, 28);
        s.ellipse(20, 19, 15, 6.5, (x, y, nx, ny) => pick(TAWNY, sphere(nx, ny) + 0.1, x, y));
        for (let x = 8; x < 30; x++) s.put(x, 25, TAWNY[1]);
        s.ellipse(36, 13, 10, 10, (x, y, nx, ny) => pick(MANE, sphere(nx, ny) + 0.15 + (vnoise(x, y, 2, 764) - 0.5) * 0.4, x, y));
        s.ellipse(38, 14, 6, 6, (x, y, nx, ny) => pick(TAWNY, sphere(nx, ny) + 0.2, x, y));
        s.put(36, 13, '#1A1210'); s.put(40, 13, '#1A1210'); s.put(38, 16, '#4A2A1A'); s.put(38, 17, '#E8D0B0');
        const tl = [0, -1, -2, -1][f];
        for (let x = 0; x < 7; x++) s.put(x, 20 + Math.round(Math.sin(x * 0.6) + tl * (1 - x / 7)), TAWNY[2]);
        s.put(0, 19 + tl, MANE[1]); s.put(1, 19 + tl, MANE[1]);
      } else if (kind === 'giraffe') {
        s = A.surface(40, 66);
        [[10, 0], [14, 1], [24, 0], [28, 1]].forEach(([lx, back]) => { for (let y = 46; y < 64; y++) for (let i = 0; i < 2; i++) s.put(lx + i, y, pick(GIRAFFE, 0.6 - i * 0.2 - back * 0.25, lx + i, y)); });
        s.ellipse(19, 42, 13, 7, (x, y, nx, ny) => pick(GIRAFFE, sphere(nx, ny) + 0.1, x, y));
        const bob = [0, 1, 1, 0][f];
        for (let y = 10 + bob; y < 40; y++) for (let i = 0; i < 5; i++) s.put(27 + i + Math.round((40 - y) * 0.12), y, pick(GIRAFFE, 0.75 - i * 0.12, 27 + i, y));
        s.ellipse(33, 9 + bob, 6, 4, (x, y, nx, ny) => pick(GIRAFFE, sphere(nx, ny) + 0.15, x, y));
        s.put(37, 10 + bob, '#5A3A1A'); s.put(33, 8 + bob, '#1A1210');
        s.put(30, 4 + bob, '#7A4A20'); s.put(30, 5 + bob, '#7A4A20'); s.put(33, 3 + bob, '#7A4A20'); s.put(33, 4 + bob, '#7A4A20');
        // as manchas
        for (let q = 0; q < 26; q++) {
          const mx = Math.round(8 + h01(q, 1, 765) * 24), my = Math.round(36 + h01(q, 2, 765) * 12);
          if (s.alpha(mx, my) && s.alpha(mx + 1, my)) { s.put(mx, my, '#8A4A1A'); s.put(mx + 1, my, '#8A4A1A'); s.put(mx, my + 1, '#9A5A24'); }
        }
        for (let y = 14; y < 40; y += 5) { const nx2 = 29 + Math.round((40 - y) * 0.12); s.put(nx2, y + bob, '#8A4A1A'); s.put(nx2 + 1, y + bob, '#8A4A1A'); }
      } else {
        s = A.surface(40, 24);
        for (let x = 0; x < 40; x++) { s.put(x, 18, WOOD[3]); s.put(x, 19, WOOD[1]); }
        [8, 26].forEach((mx, k) => {
          const by = 10 + ((f + k) % 2);
          s.ellipse(mx, by, 5, 5, (x, y, nx, ny) => pick(T(['#4A2E1E', '#6A4430', '#8A5A3A', '#A87650']), sphere(nx, ny) + 0.1, x, y));
          s.ellipse(mx + 1, by - 6, 3.5, 3.5, (x, y, nx, ny) => pick(T(['#4A2E1E', '#6A4430', '#8A5A3A']), sphere(nx, ny) + 0.1, x, y));
          s.put(mx + 1, by - 5, '#E8C8A8'); s.put(mx + 2, by - 5, '#E8C8A8');
        });
      }
      s.outline(0.5);
      return s.canvas();
    });
  }
  props.enclosure.liveNew = (ctx, p, world) => {
    const X = Math.round(p.x * K), Y = Math.round(p.y * K), W = Math.round((p.w || 110) * K), t = world.t;
    ctx.drawImage(encBack(p, W), X, Y);
    const kind = p.animal || 'monkey', f = Math.floor(t * (kind === 'monkey' ? 3 : 1.5) + p.x) % 4;
    const img = animalImg(kind, f), ax = X + Math.round(W / 2 - img.width / 2), ay = Y + 52 - img.height + (kind === 'giraffe' ? 4 : 0);
    Gfx.shadow(X + W / 2 + 2, Y + 52, img.width - 6, 6, 0.25);
    ctx.drawImage(img, ax, ay);
    ctx.drawImage(encFront(W), X, Y);
  };

  // placa de madeira com as setas para os outros bichos (texto do config, uma linha por "|"): cada
  // tábua tem a ponta virada para o lado da seta
  props.zooSign.art = p => {
    const lines = (p.text || '').split('|'), txts = lines.map(ln => Art.text(ln, '#3A2414'));
    const W = Math.max(60, ...txts.map(t => t.width + 14)), s = A.surface(W + 6, 52), cx = Math.round((W + 6) / 2);
    for (let y = 8; y < 50; y++) for (let i = 0; i < 4; i++) s.put(cx - 2 + i, y, pick(WOOD, 0.75 - i * 0.18, cx - 2 + i, y));
    lines.forEach((ln, i) => {
      const left = ln.indexOf('←') >= 0, y0 = 2 + i * 13;
      for (let y = 0; y < 11; y++) for (let x = 0; x < W; x++) {
        const tip = left ? x : W - 1 - x, cut = Math.abs(y - 5) - tip;
        if (tip < 6 && cut > 0) continue;
        const px = x + 3, py = y0 + y;
        s.put(px, py, pick(T(['#8A5A2E', '#A8723E', '#C28C52', '#D8A468', '#E8BC82']), (y === 0 ? 0.95 : 0.6) - (y === 10 ? 0.3 : 0) + (vnoise(px * 0.3, py, 2, 766) - 0.5) * 0.2, px, py));
      }
      s.draw(txts[i], Math.round(3 + (W - txts[i].width) / 2), y0 + 1);
    });
    s.outline(0.5);
    return { spr: s, dx: Math.round(32.5 - (W + 6) / 2), dy: -2, base: 49, contact: [cx, 49, 4, 1.2] };
  };

  // Barraquinha de comida: o toldo listrado (p.color), o balcão com a comida da placa (sorvete,
  // crepe ou takoyaki, pelo texto) e a placa com o texto do config
  props.foodStand.art = p => {
    const s = A.surface(66, 51), C = A.ramp(p.color || '#E8823A'), txt = p.text || '';
    for (let y = 22; y < 47; y++) for (let x = 2; x < 64; x++) s.put(x, y, pick(WHITE, 0.85 - (x - 2) / 62 * 0.25 + (y === 22 ? 0.15 : 0), x, y));
    for (let y = 26; y < 30; y++) for (let x = 2; x < 64; x++) s.put(x, y, pick(WOOD, 0.7 - (y - 26) * 0.12, x, y));
    for (const px of [2, 61]) for (let y = 2; y < 48; y++) for (let i = 0; i < 3; i++) s.put(px + i, y, pick(WOOD, 0.8 - i * 0.25, px + i, y));
    // a comida em cima do balcão
    const kind = /ice/i.test(txt) ? 'ice' : /cr/i.test(txt) ? 'crepe' : 'tako';
    for (let i = 0; i < 4; i++) {
      const fx = 10 + i * 13;
      if (kind === 'ice') {
        for (let y = 20; y < 26; y++) for (let x = fx + 1 + Math.floor((y - 20) / 2); x < fx + 6 - Math.floor((y - 20) / 2); x++) s.put(x, y, pick(T(['#A8743A', '#C8904A', '#E0AC64']), 0.7 - (x - fx) * 0.1, x, y));
        s.ellipse(fx + 3.5, 18, 3.2, 3, (x, y, nx, ny) => pick(A.ramp(['#F8E8C8', '#F2A7BE', '#8AD0A0', '#F6D870'][i]), sphere(nx, ny) + 0.15, x, y));
      } else if (kind === 'crepe') {
        for (let y = 16; y < 26; y++) for (let x = fx + Math.floor((y - 16) / 3); x < fx + 8 - Math.floor((y - 16) / 3); x++) s.put(x, y, y < 19 ? (x % 2 ? '#F2A7BE' : '#FFFFFF') : pick(T(['#C8904A', '#E0B070', '#F2D098']), 0.7 - (x - fx) * 0.07, x, y));
      } else {
        for (let y = 21; y < 26; y++) for (let x = fx; x < fx + 9; x++) s.put(x, y, pick(T(['#C8B890', '#E2D4B0']), 0.6, x, y));
        for (let k = 0; k < 3; k++) s.ellipse(fx + 2 + k * 2.5, 20, 1.6, 1.6, (x, y, nx, ny) => pick(T(['#6A3A1A', '#8A5428', '#B07440', '#D09A5A']), sphere(nx, ny) + 0.1, x, y));
        s.put(fx + 3, 19, '#5DAA62'); s.put(fx + 6, 19, '#F2F0EA');
      }
    }
    // a placa com o nome
    const t = Art.text(txt, '#F6D27A'), bw = Math.max(36, t.width + 8), bx = Math.round(33 - bw / 2);
    for (let y = 34; y < 45; y++) for (let x = bx; x < bx + bw; x++) s.put(x, y, x === bx || y === 34 || x === bx + bw - 1 || y === 44 ? '#0E0C12' : pick(T(['#1E1C24', '#26242E', '#302E3A']), 0.5, x, y));
    s.draw(t, Math.round(33 - t.width / 2) + 1, 35);
    // o toldo listrado com a borda recortada
    for (let y = 0; y < 18; y++) for (let x = 0; x < 66; x++) {
      const st = Math.floor(x / 8) % 2, sc = (x % 8) / 8;
      if (y >= 13 && y > 13 + Math.sin(sc * Math.PI) * 4) continue;
      s.put(x, y, pick(st ? C : WHITE, 0.85 - y / 18 * 0.3 - x / 66 * 0.15 + (y === 0 ? 0.15 : 0) - (y >= 13 ? 0.2 : 0), x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: -1, base: 47, contact: [33, 47, 31, 1.8] };
  };

  // ======================================================================
  //  A2 · o aquário de Okinawa: a sala escura (o look.tint deixa tudo azul-escuro e o tanque claro),
  //  o carpete azul com o reflexo da água, o tanque gigante (água turquesa, raios de luz, as pedras de
  //  coral, a areia e a borda azul), os cardumes, a raia-manta e o tubarão-baleia
  // ======================================================================
  const TANKW = T(['#0A3A5A', '#0E4A6E', '#145E82', '#1A7494', '#228AA4', '#30A0B4', '#46B6C2', '#66CCD0']);
  const REEF = T(['#2A4A48', '#365A56', '#446A64', '#547A72', '#668A80', '#7A9C90', '#92B0A2']);
  const CARPET = T(['#0A1428', '#0E1A34', '#122240', '#182A4C', '#20345A', '#2A4068']);

  Art.floors.aquarium = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const near = Math.max(0, 1 - (y - top) / 60);
      let t = 0.35 + near * 0.45 + (h01(x, y, 780) - 0.5) * 0.18 + (vnoise(x, y, 12, 781) - 0.5) * 0.1;
      // o reflexo ondulado da luz do tanque (cáusticas) perto do vidro
      const c1 = Math.sin(x * 0.11 + vnoise(x, y, 9, 782) * 5) * Math.sin(y * 0.3 + vnoise(x, y, 7, 783) * 4);
      if (near > 0.2 && c1 > 0.7) t += 0.18 * near;
      S.put(x, y, pick(CARPET, t, x, y));
    }
  };

  Art.walls.tank = (S, look) => {
    const H = look.wall.height, sandY = H - 18, ledge = H - 9;
    for (let y = 0; y < ledge; y++) for (let x = 0; x < 480; x++) {
      // água: clara em cima, mais funda no meio, turquesa-clara perto da areia
      const d = y / ledge;
      let t = 0.85 - d * 0.6 + Math.max(0, d - 0.65) * 1.2 + (vnoise(x, y, 30, 784) - 0.5) * 0.12;
      // raios de luz de cima, inclinados
      const ray = Math.sin((x + y * 0.35) * 0.07) * Math.sin((x + y * 0.35) * 0.023 + 1);
      if (ray > 0.55) t += (ray - 0.55) * 0.5 * (1 - d);
      S.put(x, y, pick(TANKW, t, x, y));
    }
    // a areia do fundo
    for (let y = sandY; y < ledge; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(T(['#6AA8A8', '#86BEB8', '#A2D2C6', '#BEE2D4']), 0.4 + (y - sandY) * 0.05 + (h01(x, y, 785) - 0.5) * 0.3, x, y));
    // as pedras de coral (dos lados, mais altas, e umas no meio), com os corais coloridos
    const rock = (cx, cy, rx, ry, seed) => {
      for (let y = Math.floor(cy - ry); y < ledge; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, rough = (vnoise(x, y, 3, seed) - 0.5) * 0.6;
        if (nx * nx + Math.min(0, ny) * ny > 1 + rough || (ny > 0 && Math.abs(nx) > 1 + rough)) continue;
        let c = pick(REEF, sphere(clamp1(nx), clamp1(Math.min(ny, 0.9))) + (vnoise(x, y, 2, seed + 1) - 0.5) * 0.4, x, y);
        if (h01(x, y, seed + 2) < 0.012) c = REEF[6];
        S.put(x, y, c);
      }
      // os corais por cima da pedra: galhos, bolas e leques
      for (let q = 0; q < Math.round(rx / 3); q++) {
        const a = -Math.PI * (0.1 + h01(q, 1, seed) * 0.8), px = Math.round(cx + Math.cos(a) * rx * 0.8), py = Math.round(cy + Math.sin(a) * ry * 0.8);
        const col = A.ramp(['#E87A8A', '#F2A040', '#B85ACA', '#5DC8A0', '#F2E07A'][Math.floor(h01(q, 2, seed) * 5)]), kind = Math.floor(h01(q, 3, seed) * 3);
        if (kind === 0) for (let b = -2; b <= 2; b++) for (let j = 0; j < 4 - Math.abs(b); j++) S.put(px + b, py - j, pick(col, 0.7 - j * 0.1 + b * 0.05, px + b, py - j));
        else if (kind === 1) S.ellipse(px, py - 1, 2.2, 2, (x, y, nx, ny) => pick(col, sphere(nx, ny) + 0.1, x, y));
        else for (let j = 0; j < 4; j++) for (let b = -j; b <= j; b += 2) S.put(px + b, py - 4 + j, pick(col, 0.6, px + b, py - 4 + j));
      }
    };
    rock(30, 30, 34, 26, 786); rock(450, 26, 40, 30, 787); rock(140, 62, 30, 14, 788); rock(330, 60, 36, 16, 789); rock(232, 70, 18, 8, 790);
    // a borda azul na frente e a moldura de baixo
    for (let y = ledge; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, y === ledge ? '#9AD8F0' : y < ledge + 6 ? pick(T(['#1A3E9A', '#2250B4', '#2E64CA', '#4A7ED8']), 0.75 - (y - ledge) * 0.1, x, y) : pick(T(['#0A1020', '#121A30']), 0.5, x, y));
    // o vidro: um reflexo diagonal comprido
    for (let y = 0; y < ledge; y++) for (let x = 0; x < 480; x++) if (Math.abs(((x - y * 0.8) % 160 + 160) % 160 - 40) < 3) S.tput(x, y, '#FFFFFF', 0.12);
  };
  Art.edges.aquarium = (S, x, top, gap, side) => {
    const segs = gap ? [[top - 12, gap[0]], [gap[1], 240]] : [[top - 12, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 5; i++) {
        const inner = side === 'left' ? i : 4 - i;
        S.put(x + i, y, pick(CARPET, 0.3 + inner * 0.1 + (inner === 4 ? 0.25 : 0), x + i, y));
      }
    });
    if (!gap) return;
    const [g0, g1] = gap;
    for (let y = g0 + 1; y < g1 - 1; y++) for (let d = 0; d < 18; d++) {
      const px = side === 'left' ? x + d : x + 4 - d;
      S.tput(px, y, '#5AA8E0', 0.35 * (1 - d / 18) + (bay(px, y) - 0.5) * 0.1);
    }
  };

  // os cardumes, os peixes coloridos soltos e a raia-manta, nadando dentro do tanque (atrás do vidro)
  const fishImgs = {};
  function fishImg(col, right, size) {
    const key = col + right + size;
    if (fishImgs[key]) return fishImgs[key];
    const s = A.surface(size + 3, Math.ceil(size / 2) + 2), R = A.ramp(col), cy = (Math.ceil(size / 2) + 2) / 2;
    s.ellipse(size / 2 + 0.5, cy, size / 2, size / 4 + 0.5, (x, y, nx, ny) => pick(R, sphere(nx, ny) + 0.1, x, y));
    for (let j = -1; j <= 1; j++) s.put(size + 1, Math.round(cy + j), R[2]);
    s.put(Math.round(size * 0.2), Math.round(cy - 0.5), '#0E1420');
    if (!right) return (fishImgs[key] = s.canvas());
    const m = A.surface(s.w, s.h);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.get(x, y); if (c) m.put(s.w - 1 - x, y, c); }
    return (fishImgs[key] = m.canvas());
  }
  props.tankLife.fxNew = (ctx, p, world) => {
    const t = world.t, X = p.x * K;
    for (let sch = 0; sch < 3; sch++) {
      const cx = X + ((t * (18 + sch * 7) + sch * 170) % 540) - 40, cy = 16 + sch * 17;
      for (let i = 0; i < 16; i++) {
        const fx = Math.round(cx + h01(i, sch, 791) * 34 + Math.sin(t * 2 + i) * 2), fy = Math.round(cy + h01(i, sch + 5, 791) * 12);
        ctx.drawImage(fishImg(sch === 1 ? '#F2D86A' : '#C8E4F0', true, 4), fx, fy);
      }
    }
    // peixes coloridos soltos, indo e voltando
    ['#F2A040', '#E86A8A', '#5DC8E0', '#F2E07A', '#9A7AE8'].forEach((col, i) => {
      const ph = t * (0.12 + i * 0.02) + i * 0.37, dir = Math.floor(ph) % 2 === 0, u = ph % 1;
      const fx = Math.round(X + 20 + (dir ? u : 1 - u) * 430), fy = Math.round(26 + i * 9 + Math.sin(t + i) * 3);
      ctx.drawImage(fishImg(col, dir, 7), fx, fy);
    });
    // a raia-manta deslizando devagar (asas batendo)
    const mx = Math.round(X + 500 - ((t * 14) % 600)), my = 8 + Math.round(Math.sin(t * 0.8) * 3);
    ctx.drawImage(mantaImg(Math.sin(t * 2.2) > 0 ? 1 : 0), mx, my);
  };
  function mantaImg(f) {
    return cached('manta|' + f, () => {
      const s = A.surface(40, 16), M = T(['#101C30', '#18283E', '#22344E', '#304462', '#425878']);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 34; x++) {
        const nx = (x - 14) / 14, ny = (y - 8) / (f ? 7 : 5);
        if (Math.abs(nx) * 0.9 + Math.abs(ny) * (nx < 0 ? 1.4 : 1) > 1) continue;
        s.put(x, y, pick(M, 0.6 - ny * 0.3 + (nx < -0.6 ? 0.15 : 0), x, y));
      }
      for (let x = 28; x < 39; x++) s.put(x, 8, M[1]);
      s.put(3, 7, '#E8F0F8'); s.put(3, 9, '#E8F0F8');
      return s.canvas();
    });
  }

  // o tubarão-baleia (quem anda, com id 'shark'): grande, azul-acinzentado com a grade de pintas
  // brancas, a barriga clara, as nadadeiras e o rabo batendo; vira para onde anda
  const sharkImgs = {};
  function sharkImg(right, f) {
    const key = (right ? 1 : 0) + f * 2;
    if (sharkImgs[key]) return sharkImgs[key];
    const s = A.surface(96, 36), BODY = T(['#1A2A44', '#24385A', '#304A6E', '#3E5C82', '#506E94', '#6884A8']);
    const tailY = [0, 2, 3, 2, 0, -2, -3, -2][f];
    // rabo (meia-lua) e nadadeiras
    for (let j = -12; j <= 12; j++) for (let i = 0; i < 6 - Math.abs(j) * 0.3; i++) s.put(2 + i + Math.round(Math.abs(j) * 0.5), 18 + j + tailY, pick(BODY, 0.45 - j * 0.02, 2 + i, 18 + j));
    for (let i = 0; i < 12; i++) for (let j = 0; j < 7 - i * 0.5; j++) s.put(46 + i, 9 - j, pick(BODY, 0.5, 46 + i, 9 - j));
    for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) s.put(58 + i - j, 25 + j + Math.floor(i / 3), pick(BODY, 0.35, 58 + i, 25 + j));
    // o corpo: fuso largo na cabeça (boca reta), afinando para o rabo
    for (let x = 8; x < 94; x++) {
      const u = (x - 8) / 86, hw = u < 0.75 ? 3 + u * 13.5 : 13 - (u - 0.75) * 12;
      for (let y = Math.round(18 - hw); y <= Math.round(18 + hw * 0.85); y++) {
        const ny = (y - 18) / hw;
        let c = pick(BODY, sphere(0, clamp1(ny)) + 0.1, x, y);
        if (ny > 0.45) c = pick(T(['#A8B4C4', '#C4CED8', '#DCE2EA']), 0.7 - ny * 0.3, x, y);
        // a grade de pintas brancas e as listras claras
        if (ny < 0.4 && ((x % 6 === 0 && Math.round(y + x * 0.1) % 4 === 0) || (x % 12 === 3 && h01(x, y, 792) < 0.4))) c = '#E8F0F8';
        s.put(x, y, c);
      }
    }
    s.put(86, 15, '#0E1420'); s.put(87, 15, '#0E1420');
    for (let y = 19; y < 22; y++) s.put(93, y, '#1A2236');
    s.outline(0.45);
    if (right) return (sharkImgs[key] = s.canvas());
    const m = A.surface(96, 36);
    for (let y = 0; y < 36; y++) for (let x = 0; x < 96; x++) { const c = s.get(x, y); if (c) m.put(95 - x, y, c); }
    return (sharkImgs[key] = m.canvas());
  }
  props.whaleShark.liveNew = (ctx, g, world) => {
    const right = Chars.dirOf(g.look) !== 'left', f = Math.floor((world.t || 0) * 5) % 8;
    ctx.drawImage(sharkImg(right, f), Math.round(g.x) - 48, Math.round(g.y) - 22);
  };

  // corrimão de inox baixo na frente do vidro (bloqueia a passagem, não a visão)
  props.tankRail.art = p => {
    const W = Math.round((p.w || 384) * K), s = A.surface(W, 11);
    for (let x = 0; x < W; x++) { s.put(x, 2, '#E8F4FA'); s.put(x, 3, '#A8B8C8'); s.put(x, 4, '#6A7A8C'); }
    for (let x = 5; x < W; x += 30) for (let y = 4; y < 10; y++) { s.put(x, y, '#A8B4C0'); s.put(x + 1, y, '#5A6676'); }
    return { spr: s, dx: 0, dy: 0, base: 9, shadow: false, contact: [W / 2, 9, W / 2, 1.2] };
  };

  // ======================================================================
  //  B1 · mergulho em Okinawa: o fundo de areia com as ondinhas e os tufos de alga, o recife no
  //  fundo, a superfície brilhando lá em cima; corais, pedras com alga balançando, os raios de luz,
  //  as bolhas e os cardumes. O verde-azulado da água em todo mundo vem do look.tint.
  // ======================================================================
  const SEASAND = T(['#6A9A94', '#7CACA2', '#90BCB0', '#A4CABC', '#B8D8C8', '#CCE4D4']);
  const SEAWEED = T(['#1E4A3A', '#285E46', '#327252', '#3E865E', '#4C9A6A']);
  Art.floors.seabed = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      let t = 0.5 + (vnoise(x, y, 24, 800) - 0.5) * 0.3 + (h01(x, y, 801) - 0.5) * 0.18;
      const r = Math.sin((y * 0.7 + vnoise(x, y, 20, 802) * 10 + x * 0.05));
      if (r > 0.85) t -= 0.12; else if (r > 0.55) t += 0.06;
      // a luz ondulada (cáusticas) no chão
      const c1 = Math.abs(Math.sin(x * 0.09 + vnoise(x, y, 11, 803) * 6) + Math.sin(y * 0.12 + vnoise(x, y, 9, 804) * 6));
      if (c1 < 0.22) t += 0.22;
      let c = pick(SEASAND, t + 0.1, x, y);
      if (h01(x, y, 808) < 0.002) c = '#F2ECE0';
      S.put(x, y, c);
    }
    // tufos de alga, umas conchas e estrelas-do-mar
    for (let q = 0; q < 70; q++) {
      const tx = Math.floor(h01(q, 1, 805) * 476), ty = Math.floor(top + 10 + h01(q, 2, 805) * (226 - top));
      if (q % 9 === 0) {
        const col = q % 2 ? '#F28A4A' : '#E86A7A';
        [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-2, -1], [2, -1], [-1, 2], [1, 2]].forEach(([dx, dy]) => S.put(tx + dx, ty + dy, col));
        continue;
      }
      for (let b = 0; b < 5; b++) {
        const bx = tx + b * 2 - 4, hgt = 4 + Math.floor(h01(q, b + 3, 805) * 5), lean = (h01(q, b + 9, 805) - 0.5) * 0.6;
        for (let j = 0; j < hgt; j++) S.put(Math.round(bx + lean * j), ty - j, pick(SEAWEED, 0.35 + j / hgt * 0.6, bx, ty - j));
      }
      for (let i = -5; i < 6; i++) S.mul(tx + i, ty + 1, '#7AA0A0', 0.4);
    }
  };
  Art.walls.reef = (S, look) => {
    const H = look.wall.height, WATER = T(['#1A5A78', '#206A88', '#287C98', '#3290A8', '#40A4B8', '#56B8C6', '#72CCD4']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) {
      let t = 0.75 - y / H * 0.45 + (vnoise(x, y, 20, 809) - 0.5) * 0.1;
      // a superfície lá em cima, tremendo de luz
      if (y < 5 && Math.sin(x * 0.2 + vnoise(x, y, 6, 810) * 5) > 0.3) t += 0.3 - y * 0.05;
      S.put(x, y, pick(WATER, t, x, y));
    }
    // o recife ao longe (silhueta azulada) e mais perto (com cor)
    for (let x = 0; x < 480; x++) {
      const far = Math.round(H - 14 - vnoise(x, 0, 18, 811) * 10), near = Math.round(H - 6 - vnoise(x, 1, 9, 812) * 9);
      for (let y = far; y < H; y++) S.put(x, y, pick(T(['#2A6A80', '#327890', '#3A86A0']), 0.5 + (vnoise(x, y, 3, 813) - 0.5) * 0.6, x, y));
      for (let y = near; y < H; y++) {
        let c = pick(REEF, 0.45 + (vnoise(x, y, 2, 814) - 0.5) * 0.6 - (y - near) * 0.02, x, y);
        if (y === near && h01(x, 0, 815) < 0.3) c = ['#E87A8A', '#F2A040', '#B85ACA', '#5DC8A0'][Math.floor(h01(x, 1, 815) * 4)];
        S.put(x, y, c);
      }
    }
  };
  // pedras com alga nas laterais (debaixo d'água), com a passagem
  Art.edges.reefRocks = (S, x, top, gap, side) => {
    const L = side === 'left', e = L ? x + 2 : x + 3, inward = L ? 1 : -1;
    const segs = gap ? [[top - 2, gap[0]], [gap[1], 246]] : [[top - 2, 246]];
    segs.forEach(([a, b], si) => {
      for (let y = a + 2, q = 0; y < b + 4; q++) {
        const sd = (L ? 820 : 840) + si * 7 + q, cx = e + (h01(q, 1, sd) - 0.4) * 4 * inward, rx = 6 + h01(q, 2, sd) * 4, ry = 4.5 + h01(q, 3, sd) * 2.5;
        S.ellipse(cx, y, rx * 1.15, ry, (px, py, nx, ny) => (py < a || py >= b ? null : pick(REEF, sphere(nx, ny) + (vnoise(px, py, 2, sd) - 0.5) * 0.4, px, py)));
        if (h01(q, 4, sd) < 0.6) for (let j = 0; j < 6; j++) { const px = Math.round(cx + inward * (rx * 0.5) + Math.sin(j * 0.8) * 1), py = Math.round(y - ry - j + 2); if (py >= a && py < b) S.put(px, py, pick(SEAWEED, 0.7 - j * 0.08, px, py)); }
        y += 6 + h01(q, 8, sd) * 4;
      }
    });
  };

  // coral grande (tapa a visão; os vigias nadam em volta): a base de pedra, um coral-cérebro, os
  // galhos coloridos, um leque roxo e a anêmona com o peixe-palhaço
  props.coral.art = p => {
    const W = Math.round((p.w || 70) * K), s = A.surface(W + 4, 70), seed = 850 + W;
    s.ellipse(W / 2 + 2, 52, W / 2, 14, (x, y, nx, ny) => pick(REEF, sphere(nx, ny) + (vnoise(x, y, 2, seed) - 0.5) * 0.4, x, y));
    // galhos (coral-chifre), em tufos de cores diferentes
    const cols = ['#E87A8A', '#F2A040', '#5DC8A0', '#B85ACA', '#F2E07A'];
    for (let q = 0; q < Math.max(3, Math.round(W / 14)); q++) {
      const bx = Math.round(6 + (q + 0.5) * (W - 8) / Math.max(3, Math.round(W / 14))), by = 46 - Math.round(h01(q, 1, seed) * 6), R = A.ramp(cols[q % 5]);
      const kind = q % 3;
      if (kind === 0) {
        const branch = (x0, y0, ang, len, d) => {
          const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
          s.limb(x0, y0, x1, y1, d > 0 ? 2 : 1, R, 0.05);
          if (d > 0) { branch(x1, y1, ang - 0.5, len * 0.7, d - 1); branch(x1, y1, ang + 0.45, len * 0.7, d - 1); }
          else s.put(Math.round(x1), Math.round(y1), R[5]);
        };
        branch(bx, by, -Math.PI / 2, 9, 2);
      } else if (kind === 1) {
        s.ellipse(bx, by - 6, 7, 6, (x, y, nx, ny) => {
          const groove = Math.sin((x + y * 0.5) * 1.3) > 0.4;
          return pick(R, sphere(nx, ny) + (groove ? -0.2 : 0.05), x, y);
        });
      } else {
        for (let j = 0; j < 14; j++) for (let b = -Math.round(j * 0.6); b <= Math.round(j * 0.6); b++) if ((b + j) % 2 === 0) s.put(bx + b, by - 18 + j, pick(A.ramp('#9A5ACA'), 0.7 - j * 0.02 + b * 0.03, bx + b, by - 18 + j));
      }
    }
    // anêmona com o peixe-palhaço
    const ax = Math.round(W * 0.7), ay = 44;
    for (let k = -5; k <= 5; k++) for (let j = 0; j < 6 - Math.abs(k) * 0.4; j++) s.put(ax + k, ay - j + (k % 2 ? 0 : 1), pick(A.ramp('#F2A7BE'), 0.6 + j * 0.06, ax + k, ay - j));
    for (let x = ax - 3; x <= ax + 2; x++) for (let y = ay - 9; y < ay - 6; y++) s.put(x, y, x === ax - 1 || x === ax + 1 ? '#FFFFFF' : '#F28A2A');
    s.put(ax - 3, ay - 8, '#1A1210');
    s.outline(0.5);
    return { spr: s, dx: -2, dy: 0, base: 66, contact: [W / 2 + 2, 66, W / 2 - 2, 2] };
  };

  // pedra com alga (tapa a visão): a pedra fica em cache; as algas balançam
  props.seaRock.liveNew = (ctx, p, world) => {
    const X = Math.round(p.x * K), Y = Math.round(p.y * K), t = world.t;
    const img = cached('seaRock', () => {
      const s = A.surface(38, 24);
      s.ellipse(19, 14, 18, 10, (x, y, nx, ny) => pick(REEF, sphere(nx, ny) + (vnoise(x, y, 2, 860) - 0.5) * 0.4 + (h01(x, y, 861) < 0.05 ? 0.2 : 0), x, y));
      s.outline(0.5);
      return s.canvas();
    });
    Gfx.shadow(X + 19, Y + 25, 34, 6, 0.25);
    for (let k = 0; k < 4; k++) for (let j = 0; j < 14; j++) {
      const sx = Math.round(X + 8 + k * 7 + Math.sin(t * 2 + j * 0.45 + k) * (j * 0.18)), sy = Y + 10 - j;
      Gfx.rect(sx, sy, 2, 1, j > 10 ? '#5AB07A' : k % 2 ? '#3E8A5A' : '#2E7A4A');
    }
    ctx.drawImage(img, X, Y + 4);
  };

  // raios de luz descendo, mexendo devagar, e as bolhas subindo (por cima de tudo)
  props.underwater.fxNew = (ctx, p, world) => {
    const t = world.t, X = p.x * K;
    ctx.globalAlpha = 0.09;
    for (let k = 0; k < 6; k++) {
      const x0 = X + 20 + k * 82 + Math.sin(t * 0.35 + k * 1.3) * 14;
      for (let y = 0; y < 240; y += 3) Gfx.rect(Math.round(x0 + y * 0.32), y, 12 - Math.round(y / 40), 3, '#E8FAFF');
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 20; i++) {
      const x = Math.round(X + h01(i, 1, 862) * 480 + Math.sin(t * 2 + i) * 3), y = Math.round(240 - ((t * (20 + (i % 5) * 4) + h01(i, 2, 862) * 240) % 240));
      const big = i % 4 === 0;
      Gfx.rect(x, y, big ? 3 : 2, big ? 3 : 2, '#C8F0FF');
      Gfx.rect(x, y, 1, 1, '#FFFFFF');
    }
  };

  // cardume (quem anda, sem bloquear a passagem): peixinhos amarelos e azuis nadando juntos
  props.fishSchool.liveNew = (ctx, g, world) => {
    const right = Chars.dirOf(g.look) !== 'left', t = world.t || 0, seed = (g.def && g.def.seed) || 1;
    // o cardume passa da borda do cenário (o loop vai até x 420 da V1): fica só no próprio cenário
    ctx.save();
    ctx.beginPath();
    ctx.rect((g.scene || 0) * 480, 0, 480, 240);
    ctx.clip();
    for (let i = 0; i < 28; i++) {
      const fx = Math.round(g.x - 24 + h01(i, seed, 863) * 48 + Math.sin(t * 3 + i) * 1.5), fy = Math.round(g.y - 19 + h01(i, seed, 864) * 18 + Math.cos(t * 2 + i) * 1);
      ctx.drawImage(fishImg(i % 3 ? '#F2D86A' : '#5DC8E8', right, 5), fx, fy);
    }
    ctx.restore();
  };

  // ======================================================================
  //  B2 · a oficina das alianças (como na foto, sem logo): o teto de ripas de madeira com o trilho
  //  preto dos spots, a janela grande de caixilho preto à esquerda, as vitrines e o painel de madeira à
  //  direita; o piso claro com o reflexo das lâmpadas; a bancada branca, as vitrines de vidro com os
  //  anéis e as lâmpadas de filamento penduradas
  // ======================================================================
  const OAK = T(['#7A4A22', '#94602E', '#AE763C', '#C48C4C', '#D6A262', '#E4B87A']);
  const TILE = T(['#9A948A', '#ACA69C', '#BEB8AE', '#CEC8BE', '#DCD6CC', '#E8E4DA']);
  Art.floors.workshop = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const tx = x % 40, ty = (y - top) % 30;
      let t = 0.6 + (h01(Math.floor(x / 40), Math.floor((y - top) / 30), 870) - 0.5) * 0.12 + (vnoise(x, y, 10, 871) - 0.5) * 0.08;
      if (tx === 0 || ty === 0) t -= 0.25;
      // o reflexo das lâmpadas no piso polido
      for (let k = 0; k < 6; k++) { const d = Math.hypot((x - (50 + k * 75)) / 22, (y - top - 26 - (k % 2) * 10) / 12); if (d < 1) t += (1 - d) * 0.25; }
      S.put(x, y, pick(TILE, t, x, y));
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#A89C94', (1 - (y - top) / 5) * 0.7);
  };
  Art.walls.workshop = (S, look) => {
    const h = look.wall.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 15) {
        // ripas de madeira do teto, com o vão escuro entre elas
        const sl = (x + y * 0.6) % 9;
        c = sl < 6 ? pick(OAK, 0.7 - sl * 0.06 - y * 0.015, x, y) : pick(T(['#140E0A', '#22180F']), 0.5, x, y);
      } else if (y < 18) c = y === 16 ? '#1A1A1E' : pick(T(['#D8D0C2', '#E8E2D6']), 0.5, x, y);
      else if (x < 150) {
        // a janela grande: a rua clara lá fora e o caixilho preto
        const fx = (x - 6) % 48, frame = x < 6 || fx === 0 || fx === 1 || y === 18 || y === h - 5 || (y - 18) % 24 === 0;
        c = frame ? pick(T(['#121216', '#22222A']), 0.5, x, y) : pick(T(['#9AB4C8', '#B4CADA', '#CEDEEA', '#E6F0F6']), 0.7 - (y - 18) * 0.008 + (Math.abs(((x - y) % 40 + 40) % 40 - 8) < 3 ? 0.35 : 0), x, y);
        if (!frame && y > 40 && y < 56 && (x % 23) < 9) c = mix(c, '#7A8494', 0.4);   // prédios do outro lado da rua
      } else if (x < 300) {
        c = pick(T(['#E6DED0', '#F0EADE', '#F8F4EC']), 0.7 - (y - 18) * 0.01, x, y);
        if ((x - 150) % 50 === 0) c = '#C8BEB0';
      } else {
        // o painel de madeira (ripas verticais)
        const px = (x - 300) % 6;
        c = pick(OAK, 0.6 - (px === 0 ? 0.3 : 0) + (vnoise(x * 0.3, y, 4, 872) - 0.5) * 0.2, x, y);
      }
      if (y >= h - 4) c = pick(T(['#3A2A1E', '#4E3A2A', '#6A503A']), y === h - 4 ? 0.9 : 0.3, x, y);
      S.put(x, y, c);
    }
    // o trilho preto com os spots
    for (let x = 0; x < 480; x++) S.put(x, 15, '#141418');
    for (let x = 20; x < 480; x += 42) { S.rect(x, 16, 3, 4, '#1E1E24'); S.put(x + 1, 20, '#FFF0C8'); }
  };

  // bancada branca de joalheiro: o tampo com as ferramentas (o pino de madeira, os tribuletes, as
  // bandejinhas com os anéis, a lupa de braço) e a frente de gavetas
  props.workbench.art = p => {
    const W = Math.round((p.w || 90) * K), s = A.surface(W, 33);
    for (let y = 4; y < 31; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 20) c = pick(WHITE, 0.92 - x / W * 0.2 + (y === 4 ? 0.08 : 0) - (y === 19 ? 0.3 : 0), x, y);
      else {
        const dx = (x - 2) % 24;
        c = pick(WHITE, 0.6 - x / W * 0.15 + (dx === 0 ? -0.35 : 0) + (y === 20 ? 0.15 : 0), x, y);
        if (dx > 9 && dx < 14 && y === 25) c = '#8A8E96';
      }
      s.put(x, y, c);
    }
    for (let k = 0; k * 32 + 10 < W; k++) {
      const bx = 8 + k * 32;
      // pino de madeira e a bandejinha com dois anéis
      s.rect(bx, 9, 6, 4, '#A87A4A'); s.rect(bx, 9, 6, 1, '#C89A62');
      for (let y = 7; y < 15; y++) for (let x = bx + 9; x < bx + 20; x++) s.put(x, y, pick(T(['#2A2A32', '#3A3A44', '#4E4E5A']), 0.5, x, y));
      s.ellipse(bx + 12, 11, 2, 1.6, (x, y, nx, ny) => (nx * nx + ny * ny < 0.3 ? null : pick(T(['#B8901E', '#E0B83A', '#F8E07A']), sphere(nx, ny) + 0.2, x, y)));
      s.ellipse(bx + 17, 11, 2, 1.6, (x, y, nx, ny) => (nx * nx + ny * ny < 0.3 ? null : pick(T(['#8A929E', '#C0C6D0', '#F0F2F6']), sphere(nx, ny) + 0.2, x, y)));
      // tribulete (o cone de medir anel)
      for (let i = 0; i < 8; i++) { s.put(bx + 22 + i, 10, pick(T(['#6A707A', '#9AA0AA', '#D0D6DE']), 0.8 - i * 0.05, bx + 22 + i, 10)); if (i < 5) s.put(bx + 22 + i, 11, '#6A707A'); }
    }
    // a lupa de braço
    s.line(W - 10, 4, W - 18, 0, '#3A3A44'); s.ellipse(W - 20, 1.5, 3, 1.5, (x, y, nx, ny) => (nx * nx + ny * ny < 0.4 ? '#C8E4F0' : '#2A2A32'));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 6 };
  };

  // vitrine de vidro com os anéis (bloqueia a passagem, não tapa a visão): a base de madeira clara
  // com a fita de luz, o vidro e as almofadinhas brancas com os anéis
  props.ringCase.art = () => {
    const s = A.surface(56, 33);
    for (let y = 16; y < 31; y++) for (let x = 0; x < 56; x++) s.put(x, y, y === 16 ? '#FFF2C8' : pick(OAK, 0.75 - x / 56 * 0.3 - (y > 28 ? 0.25 : 0), x, y));
    for (let y = 4; y < 16; y++) for (let x = 1; x < 55; x++) {
      let c = pick(T(['#D8E8EE', '#E8F2F6', '#F6FAFC']), 0.6 + (Math.abs(x - y * 1.2 - 6) < 2 ? 0.4 : 0), x, y);
      if (y > 7 && y < 14 && (x - 4) % 9 < 6) c = pick(WHITE, 0.85, x, y);
      s.put(x, y, c, 0.85);
    }
    for (let k = 0; k < 6; k++) {
      const rx = 6 + k * 9, gold = k % 2 === 0;
      s.ellipse(rx + 1, 10.5, 1.8, 1.4, (x, y, nx, ny) => (nx * nx + ny * ny < 0.3 ? null : pick(gold ? T(['#B8901E', '#E0B83A', '#F8E07A']) : T(['#8A929E', '#C0C6D0', '#F6F8FA']), sphere(nx, ny) + 0.2, x, y)));
    }
    for (let x = 0; x < 56; x++) { s.put(x, 3, '#FFFFFF'); s.put(x, 4, '#C8D8E0'); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 31, contact: [28, 31, 26, 1.5] };
  };

  // lâmpadas de filamento penduradas do teto (fio preto, o vidro âmbar com o filamento aceso e o
  // brilho quente em volta), balançando de leve, por cima de tudo
  const bulbImg = () => cached('bulb', () => {
    const s = A.surface(9, 12);
    s.rect(3, 0, 3, 3, '#2A2A30');
    s.ellipse(4.5, 7, 4, 4.5, (x, y, nx, ny) => pick(T(['#C87A1E', '#E8A040', '#F8CC70', '#FFF0C0']), sphere(nx, ny) + 0.25, x, y));
    s.put(4, 6, '#FFFFFF'); s.put(5, 7, '#FFF8D0'); s.put(4, 8, '#FFF8D0');
    return s.canvas();
  });
  props.bulbs.fxNew = (ctx, p, world) => {
    for (let k = 0; k < (p.n || 6); k++) {
      const x = Math.round((p.x + k * (p.gap || 56)) * K), y = Math.round((p.y + (k % 2) * 8) * K) - 30;
      const sw = Math.round(Math.sin(world.t * 0.9 + k) * 0.8);
      for (let yy = 0; yy < y; yy += 1) Gfx.rect(x + Math.round(sw * yy / y), yy, 1, 1, '#2A2830');
      ctx.globalAlpha = 0.14 + 0.03 * Math.sin(world.t * 2 + k);
      Gfx.rect(x - 9 + sw, y - 2, 19, 16, '#FFE0A0');
      Gfx.rect(x - 6 + sw, y - 5, 13, 22, '#FFE0A0');
      ctx.globalAlpha = 1;
      ctx.drawImage(bulbImg(), x - 4 + sw, y);
    }
  };

  // ======================================================================
  //  C1 · o festival das lanternas de peixinho dourado em Yanai, à noite: a rua de pedra, as casas
  //  de parede branca (shirakabe) com o telhado de telha e as treliças acesas, o arco de folhas de
  //  ginkgo com os peixinhos coloridos no meio; as lanternas penduradas nos fios (o escuro azulado e
  //  os círculos de luz vêm do look.tint, que também decide onde os vigias enxergam)
  // ======================================================================
  const GRANITE = T(['#3E4048', '#4C4E58', '#5A5C66', '#686A74', '#787A84', '#8A8C94']);
  const TILEROOF = T(['#1E2028', '#282A34', '#343642', '#424452', '#525464']);
  const DARKWOOD4 = T(['#140C08', '#20140C', '#2E1E14', '#3E2A1C', '#503826']);
  Art.floors.stoneStreet = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const row = Math.floor((y - top) / 9), off = (row % 2) * 9, bx = Math.floor((x + off) / 18);
      const lx = (x + off) % 18, ly = (y - top) % 9;
      let t = 0.55 + (h01(bx, row, 880) - 0.5) * 0.3 + (vnoise(x, y, 4, 881) - 0.5) * 0.15 + (h01(x, y, 882) - 0.5) * 0.12;
      if (lx === 0 || ly === 0) t = 0.1;
      else if (lx === 1 || ly === 1) t += 0.12;
      S.put(x, y, pick(GRANITE, t, x, y));
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#7078A0', (1 - (y - top) / 5) * 0.7);
  };
  Art.walls.yanai = (S, look) => {
    const h = look.wall.height, NIGHT = T(['#0C1028', '#121834', '#1A2242', '#242E52']);
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(NIGHT, y / 14 + (vnoise(x, y, 30, 883) - 0.5) * 0.1, x, y));
    for (let q = 0; q < 30; q++) S.put(Math.floor(h01(q, 1, 884) * 480), Math.floor(h01(q, 2, 884) * 9), h01(q, 3, 884) < 0.3 ? '#FFFFFF' : '#A8B0D8');
    // as casas: um telhado de telha com a cumeeira branca, a parede branca com o rodapé de madeira, a
    // janela de treliça acesa e a porta com o noren
    for (let k = 0; k < 480; k += 80) {
      if (k === 160 || k === 240) continue;      // o arco fica no meio
      for (let y = 8; y < h; y++) for (let x = k + 1; x < k + 79; x++) {
        let c;
        if (y < 16) {
          c = pick(TILEROOF, 0.55 - (y - 8) * 0.05 + ((x - k) % 4 === 0 ? -0.2 : 0), x, y);
          if (y === 8) c = '#C8C8CC';
          if (y === 15) c = '#E8E4DC';
        } else if (y < h - 10) c = pick(T(['#C8C2B4', '#DCD6C8', '#ECE8DC', '#F6F4EC']), 0.75 - (y - 16) * 0.004 + (vnoise(x, y, 5, 885) - 0.5) * 0.1 - ((x - k) < 3 ? 0.3 : 0), x, y);
        else c = pick(DARKWOOD4, 0.5 - (y - h + 10) * 0.03 + ((x - k) % 6 === 0 ? -0.3 : 0), x, y);
        S.put(x, y, c);
      }
      // janela de treliça (koshi) com a luz quente atrás
      for (let y = 22; y < 38; y++) for (let x = k + 8; x < k + 34; x++) S.put(x, y, (x - k - 8) % 3 === 0 ? pick(DARKWOOD4, 0.3, x, y) : pick(T(['#C87A30', '#E8A048', '#F6C46A', '#FFE098']), 0.85 - (y - 22) * 0.02, x, y));
      // a porta com o noren azul-marinho
      for (let y = h - 30; y < h - 4; y++) for (let x = k + 44; x < k + 70; x++) S.put(x, y, y < h - 18 ? pick(T(['#1E2C5E', '#283A78', '#33489A']), 0.6 - (x - k - 44) * 0.01, x, y) : pick(T(['#1A120C', '#2A1E14']), 0.5, x, y));
      for (let x = k + 44; x < k + 70; x++) if ((x - k) % 8 === 0) for (let y = h - 26; y < h - 18; y++) S.put(x, y, '#141A3A');
    }
    // o arco de folhas de ginkgo (amarelas) com os peixinhos coloridos pendurados
    const ax = 240, ay = h - 2;
    for (let y = 4; y < h; y++) for (let x = 162; x < 318; x++) {
      const d = Math.hypot((x - ax) / 72, (y - ay) / (h - 6));
      if (d > 1 || d < 0.72) continue;
      if (vnoise(x, y, 2.2, 886) < 0.28) continue;
      S.put(x, y, pick(T(['#9A7A10', '#C8A018', '#E8C028', '#F6DA4A', '#FFEE88']), 0.5 + (vnoise(x, y, 3, 887) - 0.5) * 0.8 + (1 - d) * 0.6, x, y));
    }
    for (let y = 10; y < h; y++) for (let x = 172; x < 308; x++) if (Math.hypot((x - ax) / 72, (y - ay) / (h - 6)) < 0.72) S.put(x, y, pick(T(['#1A1410', '#2A2018', '#3A2C20']), 0.3 + (y - 10) / h * 0.4, x, y));
    [[200, 26, '#F28AB8'], [222, 18, '#6AD0E8'], [246, 22, '#F2D84A'], [266, 30, '#9AE07A'], [284, 20, '#F2A0C0'], [232, 38, '#F28A4A']].forEach(([fx, fy, col]) => {
      S.ellipse(fx, fy, 4, 3, (x, y, nx, ny) => pick(A.ramp(col), sphere(nx, ny) + 0.15, x, y));
      S.put(fx - 2, fy - 1, '#FFFFFF'); S.put(fx - 2, fy, '#141414');
      S.put(fx + 4, fy, A.ramp(col)[2]); S.put(fx + 5, fy + 1, A.ramp(col)[2]);
    });
  };
  Art.edges.yanai = (S, x, top, gap, side) => {
    const segs = gap ? [[top - 12, gap[0]], [gap[1], 240]] : [[top - 12, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 5; i++) {
        const inner = side === 'left' ? i : 4 - i;
        S.put(x + i, y, pick(DARKWOOD4, 0.35 + inner * 0.1 + (vnoise(x + i, y * 0.3, 2, 888) - 0.5) * 0.2, x + i, y));
      }
    });
  };

  // a lanterna de peixinho dourado (branca com as costas vermelhas, os olhos grandes e o rabo
  // vermelho e branco), pendurada, balançando, com o brilho em volta
  const goldfishImg = () => cached('goldfish', () => {
    const s = A.surface(24, 18), RED = A.ramp('#D8343A');
    s.ellipse(9, 8, 8, 6, (x, y, nx, ny) => {
      const back = ny < -0.25 + nx * 0.2;
      return pick(back ? RED : T(['#C8C0B0', '#E4DED0', '#F6F2EA', '#FFFFFF']), sphere(nx, ny) + 0.3, x, y);
    });
    // olhos grandes
    [[4, 7], [10, 7]].forEach(([ex, ey]) => { s.ellipse(ex, ey, 2, 2, '#FFFFFF'); s.put(ex, ey, '#141418'); s.put(ex - 1, ey, '#141418'); s.put(ex, ey - 1, '#141418'); });
    // rabo
    for (let j = -4; j <= 4; j++) for (let i = 0; i < 6 - Math.abs(j) * 0.5; i++) s.put(17 + i, 8 + j + Math.round(i * 0.3), Math.abs(j) > 2 ? '#F2F0EA' : RED[3]);
    s.outline(0.5);
    return s.canvas();
  });
  // o brilho redondo em volta da lanterna, em degraus pontilhados
  const lanternGlow = () => cached('lanternGlow', () => {
    const s = A.surface(30, 30);
    for (let y = 0; y < 30; y++) for (let x = 0; x < 30; x++) {
      const d = Math.hypot(x + 0.5 - 15, (y + 0.5 - 15) * 1.15) / 15;
      if (d < 1) s.tput(x, y, '#FF9A58', Math.pow(1 - d, 1.5) * 0.55 + (bay(x, y) - 0.5) * 0.08);
    }
    return s.canvas();
  });
  props.goldfishLantern.fxNew = (ctx, p, world) => {
    const sw = Math.sin(world.t * 1.5 + p.x * 0.1) * 1.4, X = Math.round(p.x * K), Y = Math.round(p.y * K);
    for (let j = 0; j < 10; j++) Gfx.rect(X + Math.round(sw * j / 10), Y - 13 + j, 1, 1, '#2A2830');
    ctx.drawImage(lanternGlow(), X - 15 + Math.round(sw), Y - 12);
    ctx.drawImage(goldfishImg(), X - 9 + Math.round(sw), Y - 4);
  };
  // o fio das lanternas de um lado a outro da rua
  props.lanternString.fxNew = (ctx, p) => {
    const w = (p.w || 384) * K, X = p.x * K, Y = p.y * K - 15;
    for (let i = 0; i < w; i += 1) Gfx.rect(X + i, Math.round(Y + Math.sin(i / 50 * Math.PI) * 4), 1, 1, '#22202A');
  };

  // ======================================================================
  //  C2 · as dunas de Tottori num fim de tarde nublado (como na foto): o céu cinza-azulado de nuvens
  //  pesadas, a faixa clara rosada no horizonte, o mar cinza-azul, a crista da duna e a areia com as
  //  ondinhas do vento; o pau de madeira com o celular
  // ======================================================================
  const DUNE = T(['#8A7050', '#A08260', '#B49470', '#C6A682', '#D4B694', '#E0C6A6', '#EAD4B8']);
  Art.floors.dunes = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      // as ondulações grandes da duna e as ondinhas finas do vento por cima
      const big = vnoise(x, y, 60, 890), slope = vnoise(x, y - 3, 60, 890) - big;
      let t = 0.58 + (big - 0.5) * 0.18 - slope * 3 + (y - top) / 240 * 0.08;
      const r = Math.sin((y * 1.1 + x * 0.18 + vnoise(x, y, 30, 891) * 9));
      if (r > 0.75) t -= 0.12; else if (r > 0.35) t += 0.05;
      S.put(x, y, pick(DUNE, t, x, y));
    }
    // pegadas subindo a duna
    for (let k = 0; k < 18; k++) {
      const fx = Math.round(40 + k * 11 + Math.sin(k) * 3), fy = Math.round(225 - k * 7 + (k % 2) * 3);
      if (fy < top + 6) break;
      S.put(fx, fy, DUNE[2]); S.put(fx + 1, fy, DUNE[2]); S.put(fx, fy + 1, DUNE[5]); S.put(fx + 1, fy + 1, DUNE[5]);
    }
  };
  Art.walls.duneSea = (S, look) => {
    const H = look.wall.height, HZ = H - 16, SKYC = T(['#4E5874', '#5E6884', '#707A94', '#8690A8', '#A0A6B8', '#BCBCC8', '#D6CCCC', '#E8D8CC']);
    // nuvens pesadas em camadas (ruído em três escalas, esticado na horizontal), com a borda de cima
    // de cada uma mais clara
    const fbm = (x, y) => vnoise(x, y, 48, 892) * 0.55 + vnoise(x, y, 20, 893) * 0.3 + vnoise(x, y, 8, 899) * 0.15;
    for (let y = 0; y < HZ; y++) for (let x = 0; x < 480; x++) {
      const n = fbm(x, y * 2.4), up = fbm(x, y * 2.4 - 5);
      let t = y / HZ * 0.75 + 0.08 - (n - 0.5) * 0.7 + Math.max(0, up - n) * 1.4;
      if (y > HZ - 8) t += (y - HZ + 8) * 0.03;
      S.put(x, y, pick(SKYC, t, x, y));
    }
    // o mar cinza-azulado com as cristas e a espuma na beira
    for (let y = HZ; y < H - 5; y++) for (let x = 0; x < 480; x++) {
      let c = pick(T(['#3A4A60', '#465872', '#546884', '#647896']), 0.3 + (y - HZ) * 0.06 + (vnoise(x, y, 10, 894) - 0.5) * 0.2, x, y);
      if (y === HZ) c = '#9AA4B8';
      else if (Math.sin(x * 0.12 + y * 2) > 0.92 && vnoise(x, y, 5, 895) > 0.5) c = '#B8C2D0';
      S.put(x, y, c);
    }
    for (let x = 0; x < 480; x++) if (vnoise(x, 0, 6, 896) > 0.4) S.put(x, H - 6, '#E8ECF0');
    // a crista da duna (a areia subindo até a beira)
    for (let x = 0; x < 480; x++) {
      const cr = Math.round(H - 5 - vnoise(x, 0, 40, 897) * 3);
      for (let y = cr; y < H; y++) S.put(x, y, pick(DUNE, y === cr ? 0.95 : 0.7 - (y - cr) * 0.05, x, y));
    }
  };

  // o pau de madeira fincado na areia, com o celular preso (a tela pisca no timer)
  const stickImg = () => cached('phoneStick', () => {
    const s = A.surface(14, 38);
    for (let y = 10; y < 36; y++) for (let i = 0; i < 3; i++) s.put(5 + i, y, pick(WOOD, 0.75 - i * 0.25 + (vnoise(i, y, 2, 898) - 0.5) * 0.2, 5 + i, y));
    for (let y = 0; y < 14; y++) for (let x = 1; x < 12; x++) s.put(x, y, x === 1 || x === 11 || y === 0 || y === 13 ? '#1A1A20' : '#2A2A32');
    s.rect(2, 9, 9, 2, '#3A3A44');
    for (let x = 3; x < 11; x++) for (let y = 35; y < 38; y++) s.put(x, y, DUNE[1]);
    s.outline(0.5);
    return s.canvas();
  });
  props.phoneStick.liveNew = (ctx, p, world) => {
    const X = Math.round(p.x * K), Y = Math.round(p.y * K), on = p.timer ? Math.floor(world.t * 4) % 2 : 0;
    Gfx.shadow(X + 7, Y + 36, 12, 3, 0.3);
    ctx.drawImage(stickImg(), X - 1, Y - 1);
    Gfx.rect(X + 2, Y + 1, 8, 10, on ? '#F6E07A' : '#5DA8C8');
    Gfx.rect(X + 2, Y + 1, 8, 1, on ? '#FFF6C8' : '#8AD0E8');
    if (on) { ctx.globalAlpha = 0.3; Gfx.rect(X - 1, Y - 2, 14, 16, '#FFF0A0'); ctx.globalAlpha = 1; }
  };
})();
