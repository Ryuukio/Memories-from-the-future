// Fase 2 ("Late Summer"): a praia (A), o cinema (B), o apartamento nos dias de corona e o
// Brazilian Day (C). Pisos, paredes, bordas e objetos.
//
// V2 (etapa 4): tudo é desenhado no tamanho novo, com as ferramentas de art.js. Cada objeto guarda o
// tamanho, a colisão e a visão da V1 (coordenadas velhas; o Room.build amplia) e ganha um `art` com o
// desenho novo (mais abaixo); os pisos, paredes e bordas novos ficam em Art.floors/walls/edges. O
// desenho da V1 daqui saiu.
(() => {
  const { props } = Scenery;

  // ---------- tamanho, colisão e visão dos objetos (V1; o desenho é o `art`, mais abaixo) ----------
  // A · praia: posto de salva-vidas, barraca (p.blue), guarda-sol (p.color), boia, canga (no fundo),
  // cadeira de praia de costas, barraca de praia (umi-no-ie) e os respingos de quem brinca no mar
  props.lifeguard = { size: () => [30, 52], solid: () => [4, 40, 22, 10], sight: () => [4, 14, 22, 36], base: 50 };
  props.beachTent = { size: () => [40, 30], solid: () => [2, 14, 36, 14], sight: () => [2, 4, 36, 24], base: 28 };
  props.umbrella = { size: () => [34, 36], solid: () => [15, 30, 4, 4], sight: () => [3, 2, 28, 14], base: 34 };
  props.floatRing = { size: () => [16, 12], solid: () => [1, 3, 14, 8], base: 10 };
  props.beachTowel = { layer: 'back', size: () => [22, 30] };
  props.beachChair = { size: () => [18, 26], solid: () => [1, 14, 16, 10], base: 22 };
  props.beachHut = { size: () => [80, 44], solid: () => [0, 18, 80, 18], sight: () => [0, 0, 80, 36], base: 42 };
  props.splash = { hidden: true, size: () => [1, 1], fxLayer: 'top' };

  // B · cinema: pôster (p.art, no fundo), corda da fila (p.w; p.v = vertical, p.h), bilheteria (texto
  // do config), balcão de pipoca (p.w), painel de cardápio (no fundo), mesinha alta e lixeira
  props.poster = { layer: 'back', size: () => [28, 40] };
  props.ropeLine = {
    size: p => (p.v ? [6, p.h || 40] : [p.w || 60, 12]),
    solid: p => (p.v ? [1, 4, 4, (p.h || 40) - 2] : [0, 6, p.w || 60, 4]),
    base: p => (p.v ? (p.h || 40) : 10)
  };
  props.ticketBooth = { size: () => [70, 50], solid: () => [0, 22, 70, 26], sight: () => [0, 6, 70, 42], base: 48 };
  props.popcornCounter = { size: p => [p.w || 150, 46], solid: p => [0, 20, p.w || 150, 24], sight: p => [0, 14, p.w || 150, 28], base: 44 };
  props.cinemaMenu = { layer: 'back', size: () => [60, 22] };
  props.cafeTable = { size: () => [30, 26], solid: () => [4, 10, 22, 12], base: 22 };
  props.bin = { size: () => [10, 16], solid: () => [0, 8, 10, 7], base: 15 };

  // C1 · o apartamento visto de cima (Apêndice C e a planta): piso de cada cômodo (floorZone, no
  // fundo; p.style), paredes internas (wall: tapam a visão; as horizontais mostram a face da frente),
  // a porta de vidro da varanda, o colchão, banheira, vaso, pia, bancada e a mesa com as cadeiras
  props.floorZone = { layer: 'back', size: p => [p.w, p.h] };
  props.wall = {
    size: p => [p.w, p.h + (p.w > p.h ? 6 : 0)],
    solid: p => [0, 0, p.w, p.h + (p.w > p.h ? 4 : 0)],
    sight: p => [0, 0, p.w, p.h + (p.w > p.h ? 4 : 0)],
    base: p => p.h + (p.w > p.h ? 6 : 0)
  };
  props.glassDoor = { size: p => [p.w || 40, 10], solid: p => [0, 0, p.w || 40, 8], sight: p => [0, 0, p.w || 40, 8], base: 10 };
  props.futon = { size: () => [64, 34], solid: () => [0, 4, 64, 28], base: 6 };
  props.bathtub = { size: () => [40, 26], solid: () => [0, 0, 40, 24], base: 24 };
  props.toilet = { size: () => [16, 20], solid: () => [1, 2, 14, 16], base: 18 };
  props.washbasin = { size: () => [18, 14], solid: () => [0, 0, 18, 12], base: 12 };
  props.kitchenCounter = { size: p => [p.w || 70, 18], solid: p => [0, 0, p.w || 70, 16], base: 16 };
  props.diningSet = { size: () => [52, 44], solid: () => [6, 10, 40, 26], base: 36 };

  // C2 · Brazilian Day: barraca de comida (p.food, texto do config), árvore grande e as bandeirinhas
  // (por cima de tudo, p.w)
  props.stall = { size: () => [64, 46], solid: () => [0, 22, 64, 20], sight: () => [0, 6, 64, 36], base: 42 };
  props.bigTree = { size: () => [96, 84], solid: () => [40, 62, 16, 14], sight: () => [40, 52, 16, 26], base: 76 };
  props.bunting = { hidden: true, size: () => [1, 1] };

  // geladeira pequena prateada com o micro-ondas em cima (também na F3 A1)
  props.fridge = { size: () => [18, 30], solid: () => [0, 10, 18, 18], sight: () => [0, 0, 18, 28], base: 28 };

  // ======================================================================
  //  V2 (art.js): tudo em coordenadas novas (480 × 240). Cada objeto guarda o tamanho, a colisão e a
  //  visão da V1 (acima) e ganha um `art` com o desenho novo.
  // ======================================================================
  const A = Art, T = Art.tones, { pick, vnoise, sphere, bay, mix, clamp1 } = Art, h01 = Art.hash;
  const K = 1.25;
  const kit = Art.kit;
  const WHITE = T(['#9EA2B4', '#BCC0CC', '#D6D8DE', '#E8E8EA', '#F6F6F4', '#FFFFFF']);

  // ======================================================================
  //  A · a praia ao meio-dia (F2 A1 no mar, F2 A2 perto das barracas): céu azul forte, a nuvem
  //  grande, o morro de mata à direita com os postes de luz, o mar do fundo até a espuma da beira
  // ======================================================================
  const SAND = T(['#B08A5C', '#C29C6A', '#D0AC7A', '#DCBA88', '#E6C898', '#EED4A8', '#F4E0BA', '#FAECCE']);
  const WETSAND = T(['#86684A', '#987856', '#AA8A64', '#BC9C74', '#CCAC84']);
  const SEA = T(['#134C8A', '#195A9A', '#1F6AAA', '#287CBA', '#3390C6', '#42A4D0', '#56B6D6', '#6EC6DA', '#8AD6DE']);

  Art.floors.beach = (S, look) => {
    const top = look.wall.height, [s0, s1] = look.sea || [top, top];
    // areia: manchas, grão, as ondinhas do vento e a areia molhada perto da água
    for (let y = s1; y < 240; y++) for (let x = 0; x < 480; x++) {
      let t = 0.56 + (vnoise(x, y, 30, 400) - 0.5) * 0.3 + (vnoise(x, y, 6, 401) - 0.5) * 0.16 + (h01(x, y, 402) - 0.5) * 0.16;
      const r = Math.sin((y + vnoise(x, y, 26, 403) * 16 + x * 0.06) * 0.85);
      if (r > 0.88) t -= 0.13; else if (r > 0.62) t += 0.06;
      const wet = y - s1;
      if (wet < 16 && (wet < 9 || bay(x, y) < (16 - wet) / 7)) {
        let c = pick(WETSAND, 0.5 + (vnoise(x, y, 8, 404) - 0.5) * 0.4 + wet * 0.03, x, y);
        // o céu refletido na areia molhada
        if (wet < 7 && vnoise(x * 0.3, y * 2, 4, 405) > 0.72) c = mix(c, '#B8D4E6', 0.45);
        S.put(x, y, c);
        continue;
      }
      S.put(x, y, pick(SAND, t, x, y));
    }
    // pegadas (três trilhas) e conchinhas
    for (let j = 0; j < 3; j++) {
      let x = 20 + h01(j, 1, 406) * 300, y = s1 + 30 + h01(j, 2, 406) * (200 - s1 - 40);
      const dx = 7 + h01(j, 3, 406) * 3, dy = (h01(j, 4, 406) - 0.5) * 3;
      for (let k = 0; k < 14 + j * 4 && x < 470; k++, x += dx, y += dy + Math.sin(k * 0.7 + j) * 0.8) {
        const fx = Math.round(x), fy = Math.round(y + (k % 2 ? 3 : -1));
        if (fy < s1 + 18 || fy > 236) continue;
        S.put(fx, fy, SAND[2]); S.put(fx + 1, fy, SAND[2]); S.put(fx, fy + 1, SAND[3]); S.put(fx + 1, fy + 1, SAND[3]);
        S.put(fx, fy + 2, SAND[6]); S.put(fx + 1, fy + 2, SAND[6]);
      }
    }
    for (let y = s1 + 12; y < 238; y++) for (let x = 2; x < 478; x++) {
      if (h01(x, y, 407) > 0.0016) continue;
      const c = ['#FFF6EC', '#F4C8C0', '#E8E0D0', '#D8A898'][Math.floor(h01(x, y, 408) * 4)];
      S.put(x, y, c); S.put(x + 1, y, mix(c, '#C8A070', 0.4)); S.put(x, y + 1, SAND[1]); S.put(x + 1, y + 1, SAND[1]);
    }
    if (s1 <= s0) return;
    // o mar: fundo azul-escuro, raso turquesa com a areia aparecendo; as cristas das ondas
    for (let y = s0; y < s1; y++) for (let x = 0; x < 480; x++) {
      const d = (y - s0) / (s1 - s0);
      let t = 0.08 + d * 0.78 + (vnoise(x, y, 18, 410) - 0.5) * 0.12;
      const w = Math.sin(y * (1.5 - d * 0.7) + vnoise(x, y * 2, 20, 411) * 6);
      if (w > 0.9 && vnoise(x, y, 9, 412) > 0.45) t += 0.1 + d * 0.16;
      else if (w < -0.86) t -= 0.07;
      let c = pick(SEA, t, x, y);
      if (d > 0.7) c = mix(c, '#D8C49A', (d - 0.7) / 0.3 * 0.32);
      if (d > 0.25 && w > 0.97 && vnoise(x, y, 5, 415) > 0.62) c = '#E6F6FA';
      S.put(x, y, c);
    }
    // a espuma da beira (renda branca) e uma segunda linha de espuma mais para dentro
    for (let x = 0; x < 480; x++) {
      const f = s1 - 4 + Math.round(Math.sin(x * 0.07) * 1.5 + vnoise(x, 0, 11, 413) * 2);
      for (let y = f; y < s1 + 3; y++) {
        const k = (y - f) / (s1 + 3 - f);
        if (h01(x, y, 414) < 0.95 - k * 0.8) S.put(x, y, k < 0.3 ? '#FFFFFF' : k < 0.65 ? '#E2F4F8' : '#C4E4EC');
      }
      const g = s1 - 12 + Math.round(Math.sin(x * 0.045 + 1) * 2 + vnoise(x, 1, 9, 416) * 2);
      if (vnoise(x, 2, 7, 417) > 0.42) { S.put(x, g, '#DAF0F6'); if (h01(x, 3, 418) < 0.5) S.put(x, g + 1, '#9ED8E4'); }
    }
  };

  // Cúmulo pelo campo de altura das bolas (parts = [dx, dy, r]): a normal vem da superfície unida, e
  // o sombreado não marca a borda de cada bola; a base é reta (flat px abaixo de cy) e mais escura
  const CLOUDB = T(['#8E9CC6', '#A6B2D6', '#BCC6E2', '#D2DAEE', '#E6ECF6', '#F6F8FC', '#FFFFFF']);
  function cumulus(S, cx, cy, parts, flat) {
    const hgt = (x, y) => {
      let m = 0;
      for (const [dx, dy, r] of parts) { const ux = x - cx - dx, uy = y - cy - dy, v = r * r - ux * ux - uy * uy; if (v > m) m = v; }
      return m > 0 ? Math.sqrt(m) : 0;
    };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9;
    parts.forEach(([dx, dy, r]) => { x0 = Math.min(x0, cx + dx - r); x1 = Math.max(x1, cx + dx + r); y0 = Math.min(y0, cy + dy - r); });
    const y1 = cy + flat, L = Art.L;
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
      const h = hgt(x + 0.5, y + 0.5);
      if (h <= 0) continue;
      const nx = -(hgt(x + 1.5, y + 0.5) - hgt(x - 0.5, y + 0.5)) / 2, ny = -(hgt(x + 0.5, y + 1.5) - hgt(x + 0.5, y - 0.5)) / 2;
      const m = Math.hypot(nx, ny, 1);
      let t = 0.52 + 0.6 * (nx * L[0] + ny * L[1] + L[2]) / m - (y - y0) / (y1 - y0) * 0.3 + (vnoise(x, y, 3, 419) - 0.5) * 0.08;
      if (y >= y1 - 1) t -= 0.12;
      if (h < 1.3 && bay(x, y) < 0.5) continue;
      S.put(x, y, pick(CLOUDB, t, x, y));
    }
  }
  kit.cumulus = cumulus;

  // céu de verão, a nuvem grande, morros ao longe, o morro de mata com os postes e o mar no horizonte
  const SKYB = T(['#2154BC', '#285EC4', '#3068CC', '#3A76D4', '#4684DA', '#5492DE', '#64A0E2', '#78AEE6', '#90BEE8', '#AACCEA']);
  Art.walls.beachSky = (S, look) => {
    const H = look.wall.height, HZ = H - 12;
    for (let y = 0; y < HZ; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYB, y / HZ + (vnoise(x, y, 40, 420) - 0.5) * 0.06, x, y));
    cumulus(S, 92, 22, [[-34, 4, 6], [-24, 0, 9], [-12, -6, 11], [-2, -11, 10], [8, -7, 12], [19, -2, 10], [29, 2, 8], [38, 5, 5], [-6, 2, 9], [12, 3, 8]], 6);
    cumulus(S, 214, 22, [[-8, 1, 4], [-2, -2, 5], [5, 1, 4]], 2);
    cumulus(S, 302, 10, [[-10, 0, 5], [-2, -3, 6], [7, -1, 5], [13, 2, 3]], 3);
    // morros ao longe, azulados, à esquerda
    const FAR = T(['#6A86B4', '#7A94BE', '#8CA4C8', '#A0B6D2']);
    for (let x = 0; x < 300; x++) {
      const ridge = HZ - Math.round(3 + vnoise(x, 0, 46, 421) * 9 + vnoise(x, 0, 12, 422) * 2 - Math.max(0, x - 200) * 0.08);
      for (let y = ridge; y < HZ; y++) S.put(x, y, pick(FAR, 0.75 - (y - ridge) * 0.04 + (vnoise(x, y, 6, 423) - 0.5) * 0.3, x, y));
    }
    // o morro de mata (à direita), com a clareira de pedra perto do topo
    const L = kit.LEAF, hill = x => HZ - (x < 236 ? 0 : 42 * Math.pow(Math.sin(Math.min(1, (x - 236) / 200) * Math.PI / 2), 0.75)) - (vnoise(x, 0, 9, 424) - 0.5) * 4;
    for (let x = 236; x < 480; x++) {
      const top = Math.round(hill(x));
      for (let y = top; y < HZ; y++) {
        let t = 0.42 + (vnoise(x, y, 4, 425) - 0.5) * 0.5 - (y - top) * 0.004 + (x < 300 ? 0.08 : 0);
        if (h01(x, y, 426) < 0.05) t += 0.25;
        S.put(x, y, pick(L, t, x, y));
      }
    }
    for (let q = 0; q < 46; q++) {
      const x = 240 + h01(q, 1, 427) * 240, top = hill(x);
      kit.lump(S, x, top + 3 + h01(q, 2, 427) * 14, 4 + h01(q, 3, 427) * 3, 0.06, 430 + q, L);
    }
    S.ellipse(404, 10, 9, 4, (x, y, nx, ny) => (vnoise(x, y, 3, 428) > 0.35 ? pick(T(['#9A8A6A', '#B4A27E', '#CCBA94', '#DED0AE']), sphere(nx, ny) + 0.1, x, y) : null));
    // casinhas na beira do morro, os postes de luz e os fios
    [[246, 6, 4, '#E8E4DA'], [256, 5, 3, '#D8C8B0'], [266, 7, 5, '#F2EEE6'], [279, 4, 3, '#C8B8A0']].forEach(([x, w, h, c]) => {
      S.rect(x, HZ - h, w, h, c); S.rect(x, HZ - h - 1, w, 1, '#8A5A44'); S.put(x + 1, HZ - h + 1, '#5A7090');
    });
    const poles = [[230, HZ - 22], [292, HZ - 24], [352, HZ - 21]];
    poles.forEach(([x, y]) => {
      for (let yy = y; yy < HZ; yy++) { S.put(x, yy, '#6A645E'); S.put(x + 1, yy, '#4A4440'); }
      S.rect(x - 3, y + 2, 8, 1, '#4A4440');
    });
    for (let i = 0; i < poles.length - 1; i++) {
      const [x0, y0] = poles[i], [x1, y1] = poles[i + 1];
      for (let x = x0; x <= x1; x++) {
        const u = (x - x0) / (x1 - x0), y = Math.round(y0 + 2 + (y1 - y0) * u + Math.sin(u * Math.PI) * 4);
        S.put(x, y, '#3A3A44', 0.7); S.put(x, y + 2, '#3A3A44', 0.5);
      }
    }
    // o mar no horizonte (a linha clara e o azul escurecendo para perto)
    for (let y = HZ; y < H; y++) for (let x = 0; x < 480; x++) {
      let c = pick(SEA, 0.05 + (y - HZ) / 12 * 0.1 + (vnoise(x, y, 14, 429) - 0.5) * 0.1, x, y);
      if (y === HZ) c = x > 236 && hill(x) < HZ - 1 ? mix(SEA[1], '#2A4A40', 0.4) : '#CFE4F0';
      else if (h01(x, y, 431) < 0.05 && vnoise(x, y, 6, 430) > 0.55) c = '#7AB4DA';
      S.put(x, y, c);
    }
    // look.mirrorSky: o céu espelhado (o F2 A2 é a mesma praia, à direita do F2 A1: o morro continua
    // de onde parou, na borda da esquerda, e desce para a direita)
    if (look.mirrorSky) for (let y = 0; y < H; y++) for (let x = 0; x < 240; x++) {
      const a = S.get(x, y), b = S.get(479 - x, y);
      if (a && b) { S.put(x, y, b); S.put(479 - x, y, a); }
    }
  };

  // brilhos do sol no mar e a água indo e voltando na areia molhada
  Art.scenefx.beachSky = (ctx, ox, world, look) => {
    const t = world.t, [s0, s1] = look.sea || [look.wall.height, look.wall.height];
    if (s1 <= s0) return;
    for (let i = 0; i < 22; i++) {
      const tw = Math.sin(t * (1.6 + h01(i, 1, 440)) + i * 2.3);
      if (tw < 0.55) continue;
      const x = Math.round(ox + h01(i, 2, 440) * 476), y = Math.round(s0 + 3 + h01(i, 3, 440) * (s1 - s0 - 14));
      ctx.globalAlpha = (tw - 0.55) / 0.45;
      Gfx.rect(x, y, 1, 1, '#FFFFFF');
      if (tw > 0.85) { Gfx.rect(x - 1, y, 3, 1, '#E8F8FF'); Gfx.rect(x, y - 1, 1, 3, '#E8F8FF'); }
    }
    const sw = (Math.sin(t * 0.9) + 1) / 2;
    for (let x = 0; x < 480; x += 2) {
      const y = Math.round(s1 + 1 + sw * 4 + Math.sin(x * 0.05 + t * 0.6) * 1.2);
      if (vnoise(x, Math.floor(t * 2), 9, 441) < 0.32) continue;
      ctx.globalAlpha = 0.55 - sw * 0.25;
      Gfx.rect(ox + x, y, 2, 1, '#F2FAFF');
    }
    ctx.globalAlpha = 1;
  };

  // pedras nas pontas da praia: blocos irregulares com facetas (molhados e com espuma dentro do mar),
  // uns na beira e outros menores mais para dentro, com a passagem na areia
  const ROCK = T(['#3A3430', '#4E4640', '#625A52', '#787066', '#90867A', '#A89E90', '#C0B6A6']);
  function boulder(S, cx, cy, rx, ry, seed, a, b, wet) {
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      if (y < a || y >= b) continue;
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, ang = Math.atan2(ny, nx);
      const rough = 1 + (vnoise(Math.cos(ang) * 4 + 10, Math.sin(ang) * 4 + 10, 1.3, seed) - 0.5) * 0.4;
      if (Math.hypot(nx, ny) > rough) continue;
      const fx = Math.round(nx / rough * 3) / 3, fy = Math.round(ny / rough * 3) / 3;
      let t = sphere(clamp1(nx / rough), clamp1(ny / rough)) * 0.55 + sphere(clamp1(fx * 0.9), clamp1(fy * 0.9)) * 0.45 + (vnoise(x, y, 2.5, seed + 1) - 0.5) * 0.25;
      if (wet) t -= 0.12;
      let c = pick(ROCK, t, x, y);
      if (wet && ny > 0.25) c = mix(c, '#1E3A4A', 0.35);
      if (!wet && ny > 0.5 && h01(x, y, seed + 2) < 0.3) c = mix(c, '#6A7A3A', 0.45);
      if (h01(x, y, seed + 3) < 0.03) c = '#D6CEC0';
      S.put(x, y, c);
    }
  }
  Art.edges.beachRocks = (S, x, top, gap, side, look) => {
    const sea1 = look.sea ? look.sea[1] : top, L = side === 'left', e = L ? x + 2 : x + 3, inward = L ? 1 : -1;
    const segs = gap ? [[top - 2, gap[0]], [gap[1], 246]] : [[top - 2, 246]];
    segs.forEach(([a, b], si) => {
      const list = [];
      for (let y = a + 2, q = 0; y < b + 4; q++) {
        const sd = (L ? 450 : 470) + si * 7 + q;
        list.push({ cx: e + (h01(q, 1, sd) - 0.4) * 4 * inward, cy: y, rx: 6 + h01(q, 2, sd) * 4, ry: 4.5 + h01(q, 3, sd) * 2.5, seed: sd });
        if (h01(q, 4, sd) < 0.55) list.push({ cx: e + (9 + h01(q, 5, sd) * 5) * inward, cy: y + 3, rx: 3 + h01(q, 6, sd) * 2.5, ry: 2.5 + h01(q, 7, sd) * 1.5, seed: sd + 100 });
        y += 6 + h01(q, 8, sd) * 4;
      }
      list.sort((p, q) => p.cy - q.cy).forEach(r => {
        const wet = r.cy < sea1 + 2;
        boulder(S, r.cx, r.cy, r.rx, r.ry, r.seed, a, b, wet);
        if (wet) for (let k = -3; k <= 3; k++) {
          const fx = Math.round(r.cx + k * r.rx / 3), fy = Math.round(r.cy + r.ry * (1 - Math.abs(k) * 0.12) + 1);
          if (fy >= a && fy < b && h01(k, r.seed, 457) < 0.75) S.put(fx, fy, k % 2 ? '#FFFFFF' : '#CDEBF2');
        }
      });
      // sombra embaixo das pedras na areia
      if (b < 240) for (let i = -2; i < 16; i++) for (let j = 0; j < 3; j++) S.mul(L ? x + i : x - 10 + i, b + j, '#B0A8B8', 0.6 - j * 0.2);
    });
  };

  // ---------- objetos da praia ----------
  const WOOD = T(['#5A3E24', '#76522E', '#946A3C', '#B0844C', '#C89C62', '#DCB47A']);

  // posto de salva-vidas: cadeira alta de madeira, o assento branco com a faixa vermelha, a boia
  // pendurada e o guarda-sol vermelho e branco em cima
  props.lifeguard.art = () => {
    const s = A.surface(40, 68), RED = A.ramp('#D8443A');
    // pés de trás e as travessas em X
    s.limb(12, 28, 11, 61, 3, WOOD, -0.3); s.limb(28, 28, 29, 61, 3, WOOD, -0.3);
    s.line(12, 34, 28, 58, WOOD[1]); s.line(28, 34, 12, 58, WOOD[1]);
    // pés da frente e a escada
    s.limb(9, 28, 6, 65, 3, WOOD, 0); s.limb(31, 28, 34, 65, 3, WOOD, -0.1);
    for (let y = 36; y < 64; y += 6) for (let x = 9; x < 32; x++) { s.put(x, y, pick(WOOD, 0.75 - (x - 9) / 23 * 0.4, x, y)); s.put(x, y + 1, WOOD[1]); }
    // o assento (caixa branca com a faixa vermelha) e o encosto
    for (let y = 16; y < 31; y++) for (let x = 7; x < 34; x++) {
      const front = y >= 24;
      if (!front && (x < 10 || x > 30) && y < 22) continue;
      let c = pick(WHITE, (front ? 0.6 : 0.85) - (x - 7) / 27 * 0.25 + (y === 16 || y === 24 ? 0.15 : 0), x, y);
      if (front && y >= 26 && y < 29) c = pick(RED, 0.6 - (x - 7) / 27 * 0.3, x, y);
      s.put(x, y, c);
    }
    // a boia laranja pendurada do lado
    s.ellipse(35.5, 38, 4, 4, (x, y, nx, ny) => {
      if (Math.hypot(nx, ny) < 0.45) return null;
      const seg = Math.floor((Math.atan2(ny, nx) + Math.PI) / (Math.PI / 2)) % 2;
      return pick(seg ? WHITE : A.ramp('#F07A2A'), sphere(nx * 0.8, ny * 0.8) + 0.05, x, y);
    });
    // o guarda-sol: gomos vermelhos e brancos, o pau no meio
    for (let y = 9; y < 17; y++) { s.put(19, y, '#F2F0EA'); s.put(20, y, '#B8B4AC'); }
    for (let y = 0; y < 13; y++) for (let x = 1; x < 39; x++) {
      const nx = (x + 0.5 - 20) / 19, ny = (y + 0.5 - 10) / 10;
      if (nx * nx + ny * ny > 1) continue;
      const f = (nx + 1) * 3.5, g = Math.floor(f) % 2, sc = f % 1;
      if (y > 9 && y > 9 + Math.sin(sc * Math.PI) * 2.5) continue;
      s.put(x, y, pick(g ? WHITE : RED, sphere(nx * 0.9, ny * 0.7 - 0.15) + 0.05, x, y));
    }
    s.put(20, 0, '#F2F0EA');
    s.outline(0.5);
    return { spr: s, dx: -1, dy: -2, base: 64, contact: [20, 64, 15, 2] };
  };

  // barraca de praia (a tenda de abrir sozinha): concha em gomos, a entrada escura e as cordinhas.
  // p.blue: turquesa com o topo azul-marinho de bolinhas (como a da foto); senão laranja e creme
  props.beachTent.art = p => {
    const s = A.surface(54, 40), blue = !!p.blue;
    const MAIN = blue ? T(['#0C5670', '#126C88', '#1A84A0', '#2A9CB8', '#40B4CC', '#5ECADC']) : T(['#983C18', '#B65024', '#D0662E', '#E6803A', '#F09A58', '#F6B67A']);
    const ALT = blue ? T(['#12193A', '#18224C', '#202D5E', '#2A3870', '#344484']) : T(['#B4A288', '#CAB89A', '#DCCCB0', '#EADEC6', '#F6EEDE']);
    const cx = 27, by = 36, rx = 24, ry = 31;
    for (let y = 4; y < 37; y++) for (let x = 2; x < 52; x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - by) / ry;
      if (nx * nx + ny * ny > 1) continue;
      const w = Math.sqrt(Math.max(0.0001, 1 - ny * ny)), u = nx / w;           // posição no gomo (-1 a 1)
      const f = (u + 1) * 2.5, g = Math.floor(f), seam = Math.abs(f - Math.round(f)) < 0.06;
      const cap = ny < -0.72;
      const R = blue ? (cap ? ALT : MAIN) : (g % 2 ? ALT : MAIN);
      let t = sphere(nx * 0.95, ny * 0.95) + 0.05;
      if (seam) t -= 0.25;
      let c = pick(R, t, x, y);
      if (blue && cap && (x + y * 3) % 7 === 0 && y % 3 === 0) c = '#F2F4F8';
      s.put(x, y, c);
    }
    // a entrada (escura lá dentro) com a aba enrolada em cima
    s.ellipse(cx, by, 10, 19, (x, y, nx, ny) => {
      if (y >= by) return null;
      if (ny < -0.86) return pick(blue ? MAIN : ALT, 0.85 - nx * 0.3, x, y);
      return pick(T(['#140E10', '#1E1618', '#2C2224', '#3C3032']), 0.25 + (y - (by - 16)) / 30 + (nx < 0 ? 0.1 : 0), x, y);
    });
    for (let x = 3; x < 52; x++) if (s.alpha(x, 36) || s.alpha(x, 35)) s.put(x, 36, MAIN[0]);
    s.outline(0.5);
    // cordinhas até os espeques
    s.line(4, 26, 0, 38, '#8A847A'); s.line(50, 26, 53, 38, '#6A645A');
    s.put(0, 38, '#4A4440'); s.put(53, 38, '#4A4440');
    return { spr: s, dx: -2, dy: -1, base: 37, contact: [27, 37, 22, 2] };
  };

  // guarda-sol aberto: gomos da cor e brancos, a borda recortada e o pau
  props.umbrella.art = p => {
    const s = A.surface(44, 46), C = A.ramp(p.color || '#F2C14E');
    for (let y = 9; y < 45; y++) { s.put(21, y, '#F4F2EC'); s.put(22, y, '#BEB8AE'); }
    s.put(21, 44, '#8A7A60'); s.put(22, 44, '#6A5A44');
    for (let y = 0; y < 16; y++) for (let x = 0; x < 44; x++) {
      const nx = (x + 0.5 - 22) / 21.5, ny = (y + 0.5 - 12) / 12;
      if (nx * nx + ny * ny > 1) continue;
      const f = (nx + 1) * 4, g = Math.floor(f) % 2, sc = f % 1;
      if (y >= 11 && y > 11 + Math.sin(sc * Math.PI) * 3.5) continue;
      let t = sphere(nx * 0.9, ny * 0.75 - 0.18) + 0.08;
      if (y >= 11) t -= 0.3;                       // a parte de baixo da borda, na sombra
      if (Math.abs(sc - 0.5) > 0.47) t -= 0.15;    // a vareta entre os gomos
      s.put(x, y, pick(g ? WHITE : C, t, x, y));
    }
    s.put(22, 0, '#F4F2EC'); s.put(21, 0, '#FFFFFF');
    s.outline(0.5);
    return { spr: s, dx: -1, dy: 0, base: 44, contact: [22, 44, 3, 1] };
  };

  // boia redonda na areia (gomos da cor e brancos, sombreada como um tubo)
  props.floatRing.art = p => {
    const s = A.surface(21, 15), C = A.ramp(p.color || '#F07A9A'), cx = 10.5, cy = 7, R0 = 10, r0 = 3.4, ky = 0.62;
    for (let y = 0; y < 15; y++) for (let x = 0; x < 21; x++) {
      const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / ky, d = Math.hypot(dx, dy);
      if (d > R0 || d < r0) continue;
      const nr = (d - (R0 + r0) / 2) / ((R0 - r0) / 2), ux = dx / d, uy = dy / d;
      const seg = Math.floor((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 4)) % 2;
      s.put(x, y, pick(seg ? WHITE : C, sphere(clamp1(ux * nr), clamp1(uy * nr * 0.75)) + 0.05, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 13, shadow: 'flat', H: 3 };
  };

  // canga estendida na areia (listras, as dobrinhas e a franja nas pontas)
  props.beachTowel.art = p => {
    const s = A.surface(28, 38), C = A.ramp(p.color || '#5DA8D8'), seed = 460 + (p.x | 0);
    for (let y = 0; y < 38; y++) for (let x = 0; x < 28; x++) {
      if (y < 2 || y > 35) { if (x % 2 === 0 && x > 0 && x < 27) s.put(x, y, C[4]); continue; }
      const white = Math.floor((y - 2) / 5) % 3 === 1;
      const t = 0.58 + (vnoise(x, y, 6, seed) - 0.5) * 0.4 + (x === 0 ? 0.15 : 0) - (x === 27 ? 0.2 : 0) - (y === 35 ? 0.15 : 0);
      s.put(x, y, pick(white ? WHITE : C, t, x, y));
    }
    return { spr: s, dx: 0, dy: 0, shadow: false };
  };

  // cadeira de praia de lona, vista de trás (quem senta olha o mar): a lona listrada cedendo no meio,
  // os braços e os pés em X
  props.beachChair.art = p => {
    const s = A.surface(23, 33), C = A.ramp(p.color || '#3A78C8'), FR = T(['#2A2C32', '#3E424A', '#5A5E68', '#7E838E', '#A0A6B0']);
    s.line(3, 23, 19, 31, FR[2]); s.line(19, 23, 3, 31, FR[1]);
    for (let y = 21; y < 32; y++) { s.put(2, y, FR[3]); s.put(20, y, FR[1]); }
    for (let y = 4; y < 22; y++) for (let x = 2; x < 21; x++) {
      if (x === 2 || x === 20 || y === 4) { s.put(x, y, pick(FR, x === 2 || y === 4 ? 0.8 : 0.3, x, y)); continue; }
      const sag = ((x - 11) / 9) ** 2;
      const t = 0.45 + sag * 0.3 - (y - 5) / 17 * 0.15 + (x < 6 ? 0.08 : 0);
      s.put(x, y, pick((x - 3) % 6 < 2 ? WHITE : C, t, x, y));
    }
    for (let x = 0; x < 23; x++) { s.put(x, 14, pick(FR, 0.75 - x / 23 * 0.5, x, 14)); s.put(x, 15, FR[0]); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 31, contact: [11.5, 31, 10, 1.5] };
  };

  // barraca de praia (umi-no-ie): o toldo listrado com a borda recortada, a bandeirinha da
  // raspadinha, o cardápio, o balcão com as raspadinhas (rosa, azul, amarela) e a frente de bambu
  props.beachHut.art = p => {
    const s = A.surface(100, 56), C = A.ramp(p.color || '#3A78C8');
    const BAMBOO = T(['#7A6A3A', '#94824A', '#AE9A5C', '#C6B270', '#D8C688', '#E8D8A2']);
    const BACK = T(['#2A1E16', '#3A2A1E', '#4C3826', '#5E4630']);
    // fundo escuro na sombra do toldo e os postes
    for (let y = 12; y < 34; y++) for (let x = 3; x < 97; x++) s.put(x, y, pick(BACK, 0.25 + (y - 12) / 22 * 0.5 + (vnoise(x * 0.3, y, 3, 470) - 0.5) * 0.2, x, y));
    for (const px of [2, 95]) for (let y = 10; y < 54; y++) for (let i = 0; i < 3; i++) s.put(px + i, y, pick(WOOD, 0.8 - i * 0.25, px + i, y));
    // cardápio na parede (traços, sem texto de verdade)
    for (let y = 16; y < 28; y++) for (let x = 62; x < 88; x++) s.put(x, y, y === 16 || x === 62 || x === 87 || y === 27 ? '#6A4A2A' : pick(T(['#D8CCB0', '#E8DEC6', '#F4ECDC']), 0.8 - (y - 16) * 0.03, x, y));
    [[19, '#D8443A', 18], [21, '#3A5A9A', 14], [23, '#3A5A9A', 16], [25, '#3A5A9A', 12]].forEach(([y, c, n], i) => { for (let x = 65; x < 65 + n; x++) if ((x + i) % 5) s.put(x, y, c); });
    // a bandeirinha da raspadinha: pano branco, o desenho vermelho e as ondas azuis embaixo
    for (let y = 14; y < 33; y++) s.put(8, y, '#C8B890');
    for (let y = 14; y < 31; y++) for (let x = 9; x < 21; x++) {
      let c = pick(WHITE, 0.85 - (x - 9) * 0.02 + Math.sin(y * 0.5) * 0.04, x, y);
      if (y > 25) c = (x + (y % 2) * 2) % 4 < 2 ? '#2A64B8' : '#5A9AD8';
      if (y >= 17 && y < 24 && x >= 12 && x < 18 && !((x === 12 || x === 17) && (y === 17 || y === 23))) c = x === 14 || y === 20 ? '#F2F0EA' : '#D8323A';
      s.put(x, y, c);
    }
    // o balcão de madeira com as raspadinhas
    for (let y = 30; y < 34; y++) for (let x = 3; x < 97; x++) s.put(x, y, pick(WOOD, (y === 30 ? 0.95 : 0.6) - (x - 3) / 94 * 0.2, x, y));
    ['#F27A9E', '#5AC0E8', '#F2D850', '#F27A9E'].forEach((col, i) => {
      const x0 = 26 + i * 9, R = A.ramp(col);
      for (let y = 26; y < 31; y++) for (let x = x0; x < x0 + 6; x++) s.put(x, y, pick(WHITE, 0.85 - (x - x0) * 0.08, x, y));
      s.put(x0 + 1, 28, '#3A6AC0'); s.put(x0 + 3, 28, '#D8443A');
      s.ellipse(x0 + 3, 26, 3.6, 3.2, (x, y, nx, ny) => (y > 26 ? null : pick(R, sphere(nx, ny) + 0.15, x, y)));
    });
    // a máquina de raspar gelo
    s.rect(64, 27, 8, 4, '#C8D0D8'); s.rect(64, 27, 8, 1, '#E8ECF2'); s.put(70, 25, '#8A929E'); s.put(70, 26, '#8A929E');
    // a frente de bambu, com a faixa da cor da barraca
    for (let y = 34; y < 54; y++) for (let x = 3; x < 97; x++) {
      if (y < 37) { s.put(x, y, pick(C, 0.6 - (x - 3) / 94 * 0.25 + (y === 34 ? 0.25 : 0), x, y)); continue; }
      const i = (x - 3) % 5;
      s.put(x, y, pick(BAMBOO, 0.75 - i * 0.12 + ((y + Math.floor((x - 3) / 5) * 5) % 13 === 0 ? -0.35 : 0), x, y));
    }
    // o toldo listrado com a borda recortada
    for (let y = 0; y < 17; y++) for (let x = 0; x < 100; x++) {
      const st = Math.floor(x / 10) % 2, sc = (x % 10) / 10;
      if (y >= 12 && y > 12 + Math.sin(sc * Math.PI) * 4) continue;
      let t = 0.85 - y / 17 * 0.35 - (x / 100) * 0.15 + (y === 0 ? 0.15 : 0);
      if (y >= 12) t -= 0.2;
      s.put(x, y, pick(st ? WHITE : C, t, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: -1, base: 53, contact: [50, 53, 48, 2] };
  };

  // respingos de água em volta de quem brinca no mar
  props.splash.fxNew = (ctx, p, world) => {
    const X = p.x * K, Y = p.y * K;
    for (let k = 0; k < 8; k++) {
      const f = world.t * 1.6 + k / 8, ph = f % 1, ang = k * 0.8 + Math.floor(f) * 2.1;
      const x = Math.round(X + Math.cos(ang) * (8 + ph * 12)), y = Math.round(Y - ph * 14 + ph * ph * 18);
      ctx.globalAlpha = (1 - ph) * 0.9;
      Gfx.rect(x, y, 2, 2, k % 2 ? '#FFFFFF' : '#BEE8F8');
      if (k % 3 === 0) Gfx.rect(x + 1, y - 1, 1, 1, '#FFFFFF');
    }
    ctx.globalAlpha = 1;
  };

  // ======================================================================
  //  B · o cinema (F2 B1 saguão com a fila, F2 B2 balcão de pipoca): carpete vinho com losangos e a
  //  flor dourada, as poças de luz das lâmpadas do teto, a parede de painéis de tecido escuro lavada
  //  pela luz das lâmpadas, o friso dourado e o lambri vinho
  // ======================================================================
  const WINE = T(['#2A0A14', '#380F1C', '#461524', '#541B2C', '#642236', '#762A40', '#8A344C', '#9E4058']);
  const GOLD = T(['#5A3E14', '#7A5A1E', '#9C762A', '#BE9438', '#D8B04E', '#ECCC72', '#FAE6A4']);
  const PANEL = T(['#100C20', '#16112A', '#1C1634', '#231C40', '#2C244E', '#372E5E', '#443A70']);
  const SPOTS = [40, 95, 150, 205, 260, 315, 370, 425];       // lâmpadas do teto (x), em cima dos pôsteres

  Art.floors.cinema = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      let light = 0;
      SPOTS.forEach(sx => { const d = Math.hypot((x - sx) / 46, (y - top - 40) / 26); if (d < 1) light = Math.max(light, (1 - d) * (1 - d)); });
      let t = 0.4 + light * 0.32 + (h01(x, y, 480) - 0.5) * 0.22 + (vnoise(x, y, 18, 481) - 0.5) * 0.12 - Math.max(0, 1 - (y - top) / 10) * 0.2;
      let c = pick(WINE, t, x, y);
      const u = ((x + y) % 24 + 24) % 24, v = ((x - y) % 24 + 24) % 24, du = Math.abs(u - 12), dv = Math.abs(v - 12);
      if (u === 0 || v === 0) c = Art.mix(c, '#1A0610', 0.4);
      else if (du + dv <= 1) c = pick(GOLD, 0.6 + light * 0.4, x, y);
      else if (du + dv <= 3 && (du === 0 || dv === 0)) c = pick(GOLD, 0.25 + light * 0.4, x, y);
      S.put(x, y, c);
    }
  };

  Art.walls.cinema = (S, look) => {
    const h = look.wall.height, trim = h - 13;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 6) c = pick(T(['#06040C', '#0C0814', '#14101E']), 0.4 + (vnoise(x, y, 8, 482) - 0.5) * 0.3 - (y === 5 ? 0.4 : 0), x, y);
      else if (y < trim) {
        // tecido em painéis, com a costura entre um e outro, lavado pela luz de cada lâmpada
        let wash = 0;
        SPOTS.forEach(sx => { const spread = 3 + (y - 6) * 0.6, a = Math.max(0, 1 - Math.abs(x + 0.5 - sx) / spread) * Math.max(0, 1 - (y - 6) / (trim - 6) * 0.85); wash = Math.max(wash, a); });
        let t = 0.36 + (vnoise(x * 0.4, y * 2, 3, 483) - 0.5) * 0.12 + (x % 2 ? 0.03 : 0) + wash * 0.45;
        const seam = ((x - 12) % 55 + 55) % 55;
        if (seam === 0) t -= 0.3; else if (seam === 1) t += 0.15;
        c = pick(PANEL, t, x, y);
        if (wash > 0.2) c = mix(c, '#E8B878', (wash - 0.2) * 0.35);
      } else if (y < trim + 3) c = pick(GOLD, y === trim ? 0.95 : y === trim + 1 ? 0.6 : 0.25, x, y);
      else if (y < h - 1) {
        const px = x % 27;
        c = pick(WINE, 0.45 - (y - trim - 3) / 10 * 0.2 + (px === 0 ? -0.3 : px === 1 ? 0.2 : 0) + (y === trim + 3 ? 0.2 : 0), x, y);
      } else c = '#0A0610';
      S.put(x, y, c);
    }
    // as lâmpadas embutidas no teto
    SPOTS.forEach(sx => {
      for (let x = sx - 3; x < sx + 3; x++) { S.put(x, 4, '#FFF2D0'); S.put(x, 5, '#FFE2A0'); }
      S.put(sx - 4, 5, '#8A6A40'); S.put(sx + 3, 5, '#8A6A40');
    });
  };

  // pilar escuro com o friso dourado; pela passagem, a luz do outro saguão entra no carpete
  Art.edges.cinema = (S, x, top, gap, side) => {
    const segs = gap ? [[top - 12, gap[0]], [gap[1], 240]] : [[top - 12, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 5; i++) {
        const inner = side === 'left' ? i : 4 - i;
        S.put(x + i, y, inner === 4 ? pick(GOLD, 0.7, x + i, y) : pick(PANEL, 0.25 + inner * 0.1 + (vnoise(x + i, y * 0.3, 2, 484) - 0.5) * 0.1, x + i, y));
      }
    });
    if (!gap) return;
    const [g0, g1] = gap;
    for (let y = g0 + 1; y < g1 - 1; y++) for (let d = 0; d < 22; d++) {
      const px = side === 'left' ? x + d : x + 4 - d;
      S.tput(px, y, '#FFD890', 0.45 * (1 - d / 22) * (1 - Math.abs((y - (g0 + g1) / 2) / ((g1 - g0) / 2)) * 0.5) + (bay(px, y) - 0.5) * 0.1);
    }
    for (let i = 0; i < 5; i++) { S.put(x + i, g0 - 1, GOLD[1]); S.put(x + i, g0, GOLD[4]); S.put(x + i, g1 - 1, GOLD[1]); S.put(x + i, g1, GOLD[4]); }
  };

  // ---------- objetos do cinema ----------
  // Pôster genérico na caixa de luz com a moldura dourada (p.art: 0 céu do pôr do sol com a espada,
  // 1 mar e lua, 2 floresta com alguém de costas, 3 explosão de cores); nenhuma arte de filme real
  props.poster.art = p => {
    const s = A.surface(35, 50), a = p.art || 0, X = 3, Y = 3, W = 29, H = 35;
    for (let y = 0; y < 50; y++) for (let x = 0; x < 35; x++) {
      const e = Math.min(x, y, 34 - x, 49 - y);
      if (e > 2) continue;
      let t = e === 0 ? 0.3 : e === 1 ? 0.75 : 0.5;
      if (x < 3 || y < 3) t += 0.15; else t -= 0.15;
      s.put(x, y, pick(GOLD, t, x, y));
    }
    const R = [
      T(['#1E1A4A', '#3A2A6A', '#6A3A8A', '#A84A7A', '#E07A5A', '#F8B86A']),
      T(['#08102A', '#0E1C3E', '#162C56', '#1E4270', '#2A5E8A', '#3E7EA4']),
      T(['#0E2418', '#163422', '#22482E', '#30603A', '#467A48', '#62965A']),
      T(['#6A1A4A', '#A82A4A', '#E05A3A', '#F28A2A', '#F8C04A', '#FFF0A0'])
    ][a];
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = X + i, y = Y + j;
      let t;
      if (a === 3) t = 1 - Math.hypot(i - 14, j - 15) / 22 + (Math.sin(Math.atan2(j - 15, i - 14) * 9) > 0.6 ? 0.15 : 0);
      else t = a === 0 ? 1 - j / H : a === 1 ? 0.15 + j / H * 0.6 : 0.3 + (vnoise(i, j, 4, 485) - 0.5) * 0.5;
      s.put(x, y, pick(R, t + (i === 0 || j === 0 ? 0.12 : 0), x, y));
    }
    if (a === 0) {
      // o sol baixo, as montanhas e a espada fincada no meio
      s.ellipse(X + 14.5, Y + 22, 5, 5, (x, y) => (y < Y + 22 ? '#FFD890' : null));
      for (let i = 0; i < W; i++) { const r = Y + 24 + Math.round(Math.abs(Math.sin(i * 0.4)) * 4); for (let y = r; y < Y + H; y++) s.put(X + i, y, '#1A1230'); }
      for (let y = Y + 4; y < Y + 26; y++) { s.put(X + 14, y, '#F2F4FA'); s.put(X + 15, y, '#A8B0C8'); }
      s.rect(X + 11, Y + 21, 8, 2, '#C89A3A'); s.rect(X + 14, Y + 23, 2, 4, '#5A3020');
    } else if (a === 1) {
      s.ellipse(X + 19, Y + 8, 4, 4, (x, y, nx, ny) => pick(T(['#C8C0A0', '#E8E2C8', '#FFFCEC']), sphere(nx, ny) + 0.2, x, y));
      for (let j = 20; j < H; j += 3) for (let i = (j % 2) * 2; i < W; i += 5) { s.put(X + i, Y + j, '#8AC8E0'); s.put(X + i + 1, Y + j, '#5A9AC0'); }
    } else if (a === 2) {
      for (const tx of [3, 9, 22, 26]) for (let j = 0; j < H; j++) s.put(X + tx, Y + j, '#0A1A10');
      // alguém de costas, com o manto vermelho e o cabelo escuro
      s.ellipse(X + 14.5, Y + 13, 3, 3, '#1E1A22');
      for (let j = 16; j < 30; j++) for (let i = 10 - Math.floor((j - 16) / 4); i < 19 + Math.floor((j - 16) / 4); i++) s.put(X + i, Y + j, pick(T(['#5A1018', '#8A1A22', '#B82A30']), 0.7 - (i - 10) / 14, X + i, Y + j));
    } else for (let k = 0; k < 9; k++) s.put(X + 14 + k, Y + 15, '#FFFFFF');
    // a faixa do título embaixo (traços, sem texto de verdade)
    for (let y = Y + H - 9; y < Y + H; y++) for (let i = 0; i < W; i++) s.put(X + i, y, '#14101E');
    for (let i = 4; i < 25; i++) s.put(X + i, Y + H - 6, i % 6 === 5 ? '#14101E' : '#F2E8D0');
    for (let i = 8; i < 21; i++) if (i % 3) s.put(X + i, Y + H - 3, '#8A8098');
    // o vidro da caixa de luz: reflexo diagonal
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (Math.abs(i - j * 0.6 - 4) < 1.5) s.tput(X + i, Y + j, '#FFFFFF', 0.25);
    return { spr: s, shadow: false };
  };

  // corda de fila: os postes dourados (base redonda, bola em cima) e a corda de veludo vermelho
  // caindo entre eles. Na horizontal (p.w), com postes a cada ~60 px; p.v: na vertical (p.h)
  const VELVET = T(['#4A0A14', '#6A1220', '#8E1A2C', '#B42A3A', '#D8464E', '#F07A78']);
  function stanchion(s, x, y0, y1) {
    s.ellipse(x + 1.5, y1 - 1, 3.5, 1.5, (px, py, nx, ny) => pick(GOLD, sphere(nx, ny) + 0.1, px, py));
    for (let y = y0 + 2; y < y1 - 1; y++) { s.put(x, y, GOLD[5]); s.put(x + 1, y, GOLD[3]); s.put(x + 2, y, GOLD[1]); }
    s.ellipse(x + 1.5, y0 + 1.5, 2, 2, (px, py, nx, ny) => pick(GOLD, sphere(nx, ny) + 0.15, px, py));
  }
  function rope(s, x0, y0, x1, y1, sag) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let q = 0; q <= n; q++) {
      const u = q / n, x = Math.round(x0 + (x1 - x0) * u + (x1 === x0 ? Math.sin(u * Math.PI) * sag : 0)), y = Math.round(y0 + (y1 - y0) * u + (x1 !== x0 ? Math.sin(u * Math.PI) * sag : 0));
      s.put(x, y, pick(VELVET, 0.75, x, y)); s.put(x, y + 1, pick(VELVET, 0.35, x, y + 1));
      if (x1 === x0) s.put(x + 1, y, pick(VELVET, 0.3, x + 1, y));
    }
  }
  props.ropeLine.art = p => {
    if (p.v) {
      const H = Math.round((p.h || 40) * K), s = A.surface(10, H + 1);
      stanchion(s, 3, 0, 14);
      stanchion(s, 3, H - 14, H);
      rope(s, 4, 3, 4, H - 11, 2.5);
      s.outline(0.5);
      return { spr: s, dx: -1, dy: 0, base: H };
    }
    const W = Math.round((p.w || 60) * K), s = A.surface(W + 2, 16), n = Math.max(1, Math.round((W - 4) / 60));
    const xs = [];
    for (let i = 0; i <= n; i++) xs.push(Math.round(i * (W - 4) / n));
    for (let i = 0; i < n; i++) rope(s, xs[i] + 2, 3, xs[i + 1] + 1, 3, 3.5);
    xs.forEach(x => stanchion(s, x, 0, 15));
    s.outline(0.5);
    return { spr: s, dx: -1, dy: 0, base: 14 };
  };

  // bilheteria: a placa com o texto do config, o guichê de laca ameixa com as duas janelas acesas (a
  // pessoa do caixa, o furinho para falar e o reflexo no vidro), o balcão e a frente com frisos
  const PLUM = T(['#1E0C24', '#2A1430', '#3A1C42', '#4A2654', '#5C3066', '#703C7A']);
  props.ticketBooth.art = p => {
    const s = A.surface(88, 63);
    for (let y = 10; y < 62; y++) for (let x = 0; x < 88; x++) {
      let c;
      if (y < 14) c = pick(GOLD, (y === 10 ? 0.95 : 0.55) - x / 88 * 0.25 - (y === 13 ? 0.3 : 0), x, y);
      else if (y >= 42 && y < 46) c = y === 42 ? pick(GOLD, 0.85 - x / 88 * 0.3, x, y) : pick(WINE, 0.55 - (y - 43) * 0.15 - x / 88 * 0.15, x, y);
      else {
        let t = 0.55 - x / 88 * 0.3 + (x === 0 ? 0.2 : 0) - (x === 87 ? 0.2 : 0);
        if (y >= 46 && (x - 2) % 14 === 0) t = 0.95;
        c = pick(y >= 46 && (x - 2) % 14 === 0 ? GOLD : PLUM, t, x, y);
      }
      s.put(x, y, c);
    }
    [7, 47].forEach((wx, wi) => {
      // a janela: moldura dourada, o vidro aceso e a pessoa do caixa
      for (let y = 17; y < 41; y++) for (let x = wx; x < wx + 34; x++) {
        const edge = x === wx || x === wx + 33 || y === 17 || y === 40;
        s.put(x, y, edge ? pick(GOLD, x === wx || y === 17 ? 0.85 : 0.3, x, y) : pick(T(['#C8A070', '#E2C090', '#F2DCB0', '#FFF2D8']), 0.95 - (y - 18) / 24 * 0.5, x, y));
      }
      const cx = wx + 17;
      for (let y = 30; y < 40; y++) for (let x = cx - 8; x <= cx + 8; x++) {
        const shirt = Math.abs(x - cx) < 2 && y < 36;
        s.put(x, y, shirt ? '#F2F0EA' : pick(T(['#6A1018', '#8A1A22', '#B02A30', '#C84A48']), 0.7 - (x - cx + 8) / 16 * 0.4, x, y));
      }
      const HAIR = wi ? T(['#2A1A12', '#3E2818', '#5A3A22']) : T(['#141016', '#221C22', '#342C30']);
      s.ellipse(cx, 26, 4.5, 5.5, (x, y, nx, ny) => (ny < -0.3 || (Math.abs(nx) > 0.72 && ny < 0.35) ? pick(HAIR, sphere(nx, ny) + 0.1, x, y) : pick(T(['#C88A6A', '#E0A888', '#F0C4A4']), sphere(nx, ny) + 0.15, x, y)));
      s.put(cx - 2, 27, '#2A1E1C'); s.put(cx + 1, 27, '#2A1E1C'); s.put(cx - 1, 29, '#B86A5A'); s.put(cx, 29, '#B86A5A');
      s.ellipse(cx, 37, 2.5, 1.5, (x, y, nx, ny) => pick(WHITE, sphere(nx, ny), x, y));
      for (let j = 0; j < 9; j++) for (let i = 0; i < 12; i++) if (Math.abs(i + j - 9) < 1 || Math.abs(i + j - 13) < 0.5) s.tput(wx + 1 + i, 18 + j, '#FFFFFF', 0.4);
    });
    // a fenda dos ingressos
    s.rect(40, 50, 8, 2, '#0E0612'); s.rect(40, 52, 8, 1, GOLD[2]);
    // a placa com o texto do config, acesa
    const txt = Art.text(p.text || '', '#FFE08A', { shadow: '#5A3A10' }), bw = Math.max(50, txt.width + 12), bx = Math.round(44 - bw / 2);
    for (let y = 0; y < 12; y++) for (let x = bx; x < bx + bw; x++) s.put(x, y, x === bx || x === bx + bw - 1 || y === 0 || y === 11 ? pick(GOLD, y === 0 || x === bx ? 0.9 : 0.35, x, y) : pick(T(['#0E0816', '#160E22', '#20162E']), 0.5 - y * 0.03, x, y));
    s.draw(txt, Math.round(44 - txt.width / 2) + 1, 2);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 61, contact: [44, 61, 42, 2] };
  };

  // Balcão de pipoca e bebidas (F2 B2): a máquina de pipoca (vitrine vermelha com a pipoca), copos de
  // refrigerante, baldes listrados, a máquina de bebida, a vitrine de nachos e as pilhas de copos; o
  // tampo branco e a frente vermelha com os painéis. Em volta da atendente (x 98 a 128 do desenho),
  // só coisas baixas, para ela aparecer.
  const REDL = T(['#5A0E16', '#7A1620', '#9E202A', '#C02E34', '#DA4A48', '#EE7A70']);
  const POP = T(['#C8963A', '#E2B85A', '#F2D486', '#FAE8B4', '#FFF8E4']);
  props.popcornCounter.art = p => {
    const W = Math.round((p.w || 150) * K), s = A.surface(W, 58);
    // frente e tampo
    for (let y = 22; y < 56; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 27) c = pick(WHITE, (y === 22 ? 1 : 0.75) - x / W * 0.2 - (y === 26 ? 0.3 : 0), x, y);
      else if (y >= 52) c = pick(GOLD, (y === 52 ? 0.85 : 0.35) - x / W * 0.15, x, y);
      else {
        const px = (x - 6) % 22, inset = px > 2 && px < 19 && y > 30 && y < 49;
        let t = 0.5 - x / W * 0.15 + (inset ? 0.12 : 0) + (inset && (px === 3 || y === 31) ? -0.25 : 0) + (inset && (px === 18 || y === 48) ? 0.15 : 0);
        c = pick(REDL, t, x, y);
      }
      s.put(x, y, c);
    }
    // máquina de pipoca
    for (let y = 0; y < 23; y++) for (let x = 12; x < 48; x++) {
      const frame = x < 14 || x > 45 || y < 3 || y > 19;
      if (frame) { s.put(x, y, pick(REDL, (x < 14 || y < 3 ? 0.8 : 0.35) + (y === 0 ? 0.2 : 0), x, y)); continue; }
      let c = pick(T(['#D8D2C0', '#ECE6D8', '#FAF8F0']), 0.8 - (x - 14) / 32 * 0.4, x, y);
      const mound = 19 - Math.round(7 - Math.abs(x - 30) * 0.18 + Math.sin(x * 1.3) * 1.2);
      if (y >= mound) c = pick(POP, 0.55 + (h01(x, y, 486) - 0.5) * 0.7 + (y === mound ? 0.3 : 0), x, y);
      if (y >= 5 && y < 9 && x >= 25 && x < 35) c = pick(T(['#5A606A', '#8A909A', '#B8BEC8']), 0.7 - (x - 25) / 10 * 0.5, x, y);
      if (y > 4 && y < 9 && h01(x, y, 487) < 0.08) c = POP[3];
      s.put(x, y, c);
    }
    for (let x = 12; x < 48; x++) s.put(x, 2, x % 3 ? '#F2C14E' : '#FFF4C8');
    for (let j = 0; j < 14; j++) s.tput(16 + j, 5 + j, '#FFFFFF', 0.3);
    // copos de refrigerante com tampa e canudo
    [[56, '#3A6AC8'], [65, '#D8443A'], [74, '#2EA35A'], [83, '#F2B83A']].forEach(([x0, col]) => {
      const R = A.ramp(col);
      for (let y = 12; y < 23; y++) for (let x = x0; x < x0 + 7; x++) s.put(x, y, pick(y < 15 ? WHITE : R, 0.8 - (x - x0) * 0.1 - (y > 20 ? 0.15 : 0), x, y));
      for (let x = x0; x < x0 + 7; x++) s.put(x, 11, WHITE[3]);
      for (let y = 6; y < 11; y++) s.put(x0 + 4, y, '#F2F0EA');
    });
    // bandeja baixa na frente da atendente
    for (let x = 104; x < 122; x++) { s.put(x, 20, '#3A3640'); s.put(x, 21, '#2A2630'); }
    // baldes de pipoca listrados
    [134, 152].forEach(x0 => {
      for (let y = 9; y < 23; y++) for (let x = x0; x < x0 + 13; x++) {
        const shrink = Math.floor((y - 9) / 7);
        if (x < x0 + shrink || x >= x0 + 13 - shrink) continue;
        s.put(x, y, pick((x - x0) % 4 < 2 ? REDL : WHITE, 0.75 - (x - x0) / 13 * 0.35, x, y));
      }
      s.ellipse(x0 + 6.5, 9, 7, 3.5, (x, y, nx, ny) => (y > 9 ? null : pick(POP, sphere(nx, ny) + (h01(x, y, 488) - 0.5) * 0.5 + 0.1, x, y)));
    });
    // máquina de bebida (inox, os bicos e as plaquinhas coloridas)
    if (W > 180) for (let y = 0; y < 23; y++) for (let x = 176; x < 212; x++) {
      let c = pick(T(['#5A606C', '#7A808C', '#9AA0AC', '#BCC2CC', '#DCE0E6']), 0.75 - (x - 176) / 36 * 0.4 + (y === 0 ? 0.2 : 0), x, y);
      if (y >= 4 && y < 9 && (x - 178) % 8 < 6) c = ['#3A6AC8', '#D8443A', '#2EA35A', '#F2B83A'][Math.floor((x - 178) / 8) % 4];
      if (y >= 11 && y < 13 && (x - 178) % 8 === 2) c = '#2A2E36';
      if (y >= 17 && y < 22 && x > 178 && x < 210) c = pick(T(['#2A2E36', '#3A3E48']), 0.5, x, y);
      s.put(x, y, c);
    }
    // vitrine de nachos e as pilhas de copos
    if (W > 250) {
      for (let y = 8; y < 23; y++) for (let x = 222; x < 252; x++) {
        const edge = x === 222 || x === 251 || y === 8;
        let c = edge ? '#C8CCD4' : pick(T(['#C8D8E0', '#DCE8EE', '#F0F6F8']), 0.8 - (x - 222) / 30 * 0.5, x, y);
        if (!edge && y > 15) c = pick(T(['#C88A2A', '#E8B04A', '#F6D070']), 0.6 + (h01(x, y, 489) - 0.5) * 0.8, x, y);
        s.put(x, y, c);
      }
      [262, 272, 282].forEach((x0, i) => { for (let y = 8 + i * 2; y < 23; y++) for (let x = x0; x < x0 + 7; x++) s.put(x, y, pick(WHITE, 0.8 - (x - x0) * 0.08 - ((y - 8) % 3 === 0 ? 0.2 : 0), x, y)); });
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 55, contact: [W / 2, 55, W / 2 - 2, 2] };
  };

  // painel de cardápio aceso na parede (os desenhos da pipoca, do refrigerante e do combo)
  props.cinemaMenu.art = () => {
    const s = A.surface(75, 28), SCR = T(['#1E1830', '#2A2242', '#3A3058', '#4C4070']);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 75; x++) s.put(x, y, x < 1 || y < 1 || x > 73 || y > 26 ? '#08060C' : pick(SCR, 0.7 - y / 28 * 0.4, x, y));
    [[4, '#D8443A'], [28, '#3A6AC8'], [52, '#F2B83A']].forEach(([x0, col], i) => {
      for (let y = 3; y < 17; y++) for (let x = x0; x < x0 + 19; x++) s.put(x, y, pick(A.ramp(col), 0.85 - (y - 3) / 14 * 0.4, x, y));
      if (i === 0) { for (let y = 8; y < 16; y++) for (let x = x0 + 6; x < x0 + 13; x++) s.put(x, y, (x - x0) % 3 ? '#FFFFFF' : '#D8443A'); s.ellipse(x0 + 9.5, 8, 4, 2.5, (x, y, nx, ny) => pick(POP, sphere(nx, ny) + 0.2, x, y)); }
      if (i === 1) { for (let y = 7; y < 16; y++) for (let x = x0 + 7; x < x0 + 12; x++) s.put(x, y, y < 9 ? '#F2F0EA' : '#1E3A8A'); for (let y = 4; y < 7; y++) s.put(x0 + 10, y, '#F2F0EA'); }
      if (i === 2) { s.ellipse(x0 + 7, 11, 4, 3, (x, y, nx, ny) => pick(POP, sphere(nx, ny) + 0.1, x, y)); for (let y = 9; y < 16; y++) for (let x = x0 + 12; x < x0 + 16; x++) s.put(x, y, '#D8443A'); }
      for (let x = x0 + 2; x < x0 + 17; x++) s.put(x, 20, '#E8E0D0');
      for (let x = x0 + 4; x < x0 + 12; x++) s.put(x, 23, '#F2C14E');
    });
    return { spr: s, shadow: false };
  };

  // mesinha alta redonda com dois banquinhos (o tampo escuro com a borda de luz e um copo)
  props.cafeTable.art = () => {
    const s = A.surface(38, 33), DARK = T(['#14121A', '#1E1C26', '#2A2834', '#383644', '#4A4858', '#62606E']);
    [5, 33].forEach(x => {
      for (let y = 20; y < 30; y++) s.put(x, y, DARK[2]);
      s.ellipse(x, 29.5, 3.5, 1.5, (px, py, nx, ny) => pick(DARK, sphere(nx, ny), px, py));
      s.ellipse(x, 19, 5, 3, (px, py, nx, ny) => pick(T(['#3A1018', '#5A1A24', '#7A2632', '#9A3644']), sphere(nx, ny) + 0.1, px, py));
    });
    for (let y = 14; y < 30; y++) { s.put(18, y, DARK[3]); s.put(19, y, DARK[1]); }
    s.ellipse(19, 30, 6, 2, (px, py, nx, ny) => pick(DARK, sphere(nx, ny), px, py));
    s.ellipse(19, 11, 12, 6, (px, py, nx, ny) => (nx * nx + ny * ny > 0.78 ? pick(GOLD, sphere(nx, ny) * 0.8, px, py) : pick(DARK, sphere(nx * 0.6, ny * 0.6) + 0.15, px, py)));
    for (let y = 6; y < 11; y++) for (let x = 15; x < 19; x++) s.put(x, y, pick(WHITE, 0.85 - (x - 15) * 0.15, x, y));
    s.put(16, 4, '#D8443A'); s.put(16, 5, '#D8443A');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 31, contact: [19, 31, 14, 2] };
  };

  // lixeira de inox com a tampa de vaivém
  props.bin.art = () => {
    const s = A.surface(13, 20), ST = T(['#3A3E48', '#545A66', '#727884', '#949AA6', '#B8BEC8', '#DCE0E6']);
    for (let y = 5; y < 19; y++) for (let x = 0; x < 13; x++) s.put(x, y, pick(ST, 0.85 - x / 12 * 0.7 + (y === 5 ? 0.15 : 0), x, y));
    s.ellipse(6.5, 4, 6.5, 3.5, (x, y, nx, ny) => (y > 5 ? null : pick(ST, sphere(nx, ny) + 0.1, x, y)));
    for (let x = 3; x < 10; x++) { s.put(x, 4, '#1E2028'); s.put(x, 5, '#2A2E36'); }
    s.rect(4, 10, 5, 3, '#3AA05A'); s.put(4, 10, '#6AC48A');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 18, contact: [6.5, 18.5, 5.5, 1.2] };
  };

  // ======================================================================
  //  C1 · o apartamento visto de cima, numa tarde de corona (Apêndice C): piso de madeira média,
  //  paredes brancas com rodameio escuro, o banheiro de azulejo, o genkan de pedra e a varanda de
  //  concreto com o guarda-corpo; o sol da tarde entra pela porta de vidro e pela porta aberta
  // ======================================================================
  const kx = n => Math.round(n * K);
  const FLOORW = T(['#7A4C2A', '#8C5A34', '#9E6A3E', '#AE7A4A', '#BE8A58', '#CC9A66', '#D8AA76', '#E2BA88']);
  const WALLTOP = T(['#B8AE9E', '#CCC2B2', '#DCD4C6', '#E8E2D6', '#F2EEE6', '#FAF8F2']);
  const SKIRT = T(['#2A1A10', '#3E2818', '#563822', '#6E4A2E']);
  const CONCRETE = T(['#7E7C7A', '#8E8C8A', '#9E9C9A', '#AEACA8', '#BEBCB8', '#CECCC8']);

  // o chão de fora (o corredor do prédio, de concreto) e a faixa de cima: o lado de fora escuro,
  // a borda da parede e a face da parede de cima de cada cômodo (azulejo no banheiro, a cozinha com
  // o azulejo creme e os armários, a parede branca do genkan)
  Art.floors.aptOutside = (S, look) => {
    // por baixo dos cômodos (aparece nas soleiras das portas), o mesmo piso de madeira; embaixo da
    // varanda, o concreto
    Scenery.planksArt(S, 0, look.wall.height, 480, 208 - look.wall.height, { R: FLOORW, rh: 7, seed: 19 });
    for (let y = 208; y < 240; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(CONCRETE, 0.5 + (vnoise(x, y, 6, 500) - 0.5) * 0.3 + (h01(x, y, 501) - 0.5) * 0.2, x, y));
  };
  Art.walls.aptTop = (S, look) => {
    const h = look.wall.height, face = h - 8;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < face - 3) c = pick(T(['#1A1820', '#221F2A', '#2A2734', '#34303E']), 0.45 + (vnoise(x, y, 10, 502) - 0.5) * 0.3 + ((x + y) % 6 === 0 ? 0.12 : 0), x, y);
      else if (y < face) c = pick(WALLTOP, y === face - 3 ? 0.95 : 0.7 - (y - face + 3) * 0.12, x, y);
      else if (x < 152) {
        // banheiro: azulejo branco-azulado
        const tx = x % 6, ty = (y - face) % 6;
        c = tx === 0 || ty === 0 ? '#B8C6CE' : pick(T(['#D4E0E6', '#E2ECF0', '#F0F6F8']), 0.8 - (y - face) * 0.05, x, y);
      } else if (x < 390) {
        // cozinha: o azulejo creme da bancada embaixo dos armários de madeira escura
        if (y < face + 3) c = pick(T(['#3A2214', '#4E2E1C', '#663E26']), y === face + 2 ? 0.2 : 0.6, x, y);
        else { const tx = (x - 152) % 7, ty = (y - face - 3) % 5; c = tx === 0 || ty === 0 ? '#CDBE9C' : pick(T(['#E6DABE', '#F0E6CE', '#F8F0DE']), 0.75, x, y); }
      } else c = pick(T(['#D8D2C6', '#E6E2D8', '#F2EFE8']), 0.75 - (y - face) * 0.06, x, y);
      if (y === h - 1) c = SKIRT[1];
      S.put(x, y, c);
    }
  };

  // parede lateral (branca, vista de cima) com a passagem: a luz de fora entra pelo vão
  Art.edges.aptWall = (S, x, top, gap, side) => {
    const segs = gap ? [[top - 8, gap[0]], [gap[1], 240]] : [[top - 8, 240]];
    segs.forEach(([a, b]) => {
      for (let y = a; y < b; y++) for (let i = 0; i < 5; i++) {
        const inner = side === 'left' ? i : 4 - i;
        S.put(x + i, y, pick(WALLTOP, 0.85 - inner * 0.08 - (inner === 4 ? 0.25 : 0) + (y === a ? 0.15 : 0), x + i, y));
      }
      for (let i = 0; i < 5; i++) if (b < 240) { S.put(x + i, b, SKIRT[1]); S.put(x + i, b + 1, SKIRT[2]); }
    });
    if (!gap) return;
    const [g0, g1] = gap;
    for (let y = g0 + 1; y < g1 - 1; y++) for (let d = 0; d < 20; d++) {
      const px = side === 'left' ? x + d : x + 4 - d;
      S.tput(px, y, '#FFF0D0', 0.4 * (1 - d / 20) * (1 - Math.abs((y - (g0 + g1) / 2) / ((g1 - g0) / 2)) * 0.6) + (bay(px, y) - 0.5) * 0.1);
    }
  };

  // o sol da tarde entrando pela porta de vidro e pela porta aberta da varanda, esticado para cima
  // no chão dos quartos (por cima de tudo, bem fraco)
  Art.posts.aptTop = S => {
    [[312, 378], [66, 118]].forEach(([x0, x1]) => {
      for (let y = 150; y < 196; y++) {
        const u = (196 - y) / 46, sx = (196 - y) * 0.45;
        for (let x = Math.round(x0 - sx); x < Math.round(x1 - sx); x++) {
          const edge = Math.min(x - (x0 - sx), x1 - sx - x) / 6;
          S.tput(x, y, '#FFE2A8', Math.min(1, edge) * (0.5 - u * 0.36) + (bay(x, y) - 0.5) * 0.08);
        }
      }
    });
  };

  // ---------- objetos do apartamento ----------
  // piso de um cômodo (p.style: madeira, azulejo do banheiro, pedra do genkan, concreto da varanda
  // com o guarda-corpo embaixo), do tamanho exato da faixa nova
  props.floorZone.art = p => {
    const x0 = kx(p.x), y0 = kx(p.y), W = kx(p.x + p.w) - x0, H = kx(p.y + p.h) - y0, s = A.surface(W, H), st = p.style || 'wood';
    if (st === 'wood') Scenery.planksArt(s, 0, 0, W, H, { R: FLOORW, rh: 7, seed: 20 + (p.x | 0) });
    else if (st === 'tile') {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const tx = x % 10, ty = y % 10;
        if (tx === 0 || ty === 0) { s.put(x, y, '#AEBCC4'); continue; }
        let t = 0.6 + (h01(Math.floor(x / 10), Math.floor(y / 10), 503) - 0.5) * 0.15 - (tx + ty) * 0.012;
        if (tx + ty < 4) t += 0.25;
        s.put(x, y, pick(T(['#C4D2DA', '#D4E0E6', '#E2ECF0', '#EEF4F6', '#FAFCFC']), t, x, y));
      }
    } else if (st === 'genkan') {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const tx = x % 12, ty = y % 12;
        let t = 0.45 + (h01(Math.floor(x / 12), Math.floor(y / 12), 504) - 0.5) * 0.2 + (h01(x, y, 505) - 0.5) * 0.3;
        if (tx === 0 || ty === 0) t = 0.08;
        else if (tx === 1 || ty === 1) t += 0.15;
        s.put(x, y, pick(T(['#3E3C3C', '#4E4C4A', '#5E5C58', '#6E6C68', '#807E78']), t, x, y));
      }
      // dois pares de sapatos (os tênis dela e os chinelos dele)
      [[14, 10, '#F2F0EA', '#C8C4BC'], [30, 14, '#2A2E3A', '#4A5060']].forEach(([sx, sy, c1, c2]) => {
        for (const dx of [0, 6]) s.ellipse(sx + dx + 2, sy + 4, 2.4, 4, (x, y, nx, ny) => (ny < -0.2 && Math.abs(nx) < 0.5 && c1 === '#F2F0EA' ? '#8A8478' : nx < 0 ? c1 : c2));
      });
      // o degrau de madeira para subir para o corredor
      for (let x = 0; x < W; x++) for (let y = H - 3; y < H; y++) s.put(x, y, pick(T(['#5A3A20', '#7A522E', '#9A6A3E']), y === H - 3 ? 0.9 : 0.3, x, y));
    } else if (st === 'veranda') {
      const rail = H - 9;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let c;
        if (y < rail) {
          const sx = x % 30, sy = y % 15;
          let t = 0.55 + (vnoise(x, y, 5, 506) - 0.5) * 0.25 + (h01(x, y, 507) - 0.5) * 0.15;
          if (sx === 0 || sy === 0) t -= 0.2;
          if (y < 3) t -= 0.25 - y * 0.08;
          c = pick(CONCRETE, t, x, y);
        } else if (y < rail + 2) c = pick(T(['#6A707A', '#9AA0AA', '#C8CED6', '#E6EAF0']), y === rail ? 0.9 : 0.4, x, y);
        else c = x % 4 === 0 ? pick(T(['#5A606A', '#7A808A', '#9AA0AA']), 0.6 - (y - rail) * 0.05, x, y) : pick(T(['#1E2A22', '#283A2C', '#34483A']), 0.5 + (vnoise(x, y, 4, 508) - 0.5) * 0.6, x, y);
        s.put(x, y, c);
      }
    }
    return { spr: s, dx: x0 - kx(p.x), dy: 0, shadow: false };
  };

  // Parede interna vista de cima: o topo cortado (creme) e, nas horizontais, a face da frente branca
  // com o rodameio de madeira escura. Do tamanho exato da faixa nova.
  props.wall.art = p => {
    const horiz = p.w > p.h, x0 = kx(p.x), y0 = kx(p.y), W = kx(p.x + p.w) - x0, Ht = kx(p.y + p.h) - y0;
    const Hf = horiz ? kx(p.y + p.h + 6) - y0 : Ht, s = A.surface(W, Hf);
    for (let y = 0; y < Hf; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < Ht) {
        let t = 0.72 + (y === 0 ? 0.25 : 0) - (y === Ht - 1 ? 0.2 : 0) + (vnoise(x, y, 4, 509) - 0.5) * 0.08;
        if (!horiz) t += x === 0 ? 0.2 : x === W - 1 ? -0.25 : 0;
        c = pick(WALLTOP, t, x, y);
      } else if (y < Hf - 3) c = pick(T(['#DCD6CA', '#E8E4DA', '#F4F2EC', '#FCFBF8']), 0.85 - (y - Ht) / (Hf - Ht) * 0.4, x, y);
      else c = pick(SKIRT, y === Hf - 3 ? 0.9 : 0.35, x, y);
      s.put(x, y, c);
    }
    return horiz ? { spr: s, shadow: false, contact: [W / 2, Hf, W / 2, 1.5] } : { spr: s, shadow: false };
  };

  // porta de correr de vidro da varanda, fechada, e a cortina azul lisa juntada nas pontas
  // (desenhada por cima da parede em que fica: o vão da parede com o vidro claro da tarde lá fora)
  props.glassDoor.base = 13;
  props.glassDoor.art = p => {
    const W = Math.round((p.w || 40) * K), s = A.surface(W, 16), CUR = A.ramp('#3A64B0');
    for (let y = 0; y < 16; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 3) c = pick(WALLTOP, y === 0 ? 0.95 : 0.6, x, y);
      else if (y >= 14) c = pick(T(['#5A606A', '#8A909A', '#B8BEC8']), y === 14 ? 0.8 : 0.3, x, y);
      else {
        const mullion = x < 2 || x > W - 3 || Math.abs(x - W / 2) < 1;
        c = mullion ? pick(T(['#7A808A', '#A8AEB8', '#D0D6DE']), x < 2 ? 0.9 : 0.4, x, y) : pick(T(['#A8D0E0', '#C4E0EC', '#E0F0F6', '#FFF6E0']), 0.45 + (13 - y) * 0.05 + (Math.abs(x - y * 2 - 10) < 2 || Math.abs(x - y * 2 - W / 2 - 8) < 1.5 ? 0.4 : 0), x, y);
      }
      s.put(x, y, c);
    }
    for (const cx of [0, W - 9]) for (let y = 0; y < 15; y++) for (let x = cx; x < cx + 9; x++) s.put(x, y, pick(CUR, 0.65 + Math.sin((x - cx) * 1.6) * 0.25 - y * 0.015 + (y === 0 ? 0.2 : 0), x, y));
    return { spr: s, dx: 0, dy: 1, shadow: false, contact: [W / 2, 15, W / 2, 1.5] };
  };

  // colchão azul no chão com os travesseiros azul-claros (o Fabio deita por cima)
  props.futon.art = () => {
    const s = A.surface(80, 43), BL = A.ramp('#2E4AA8'), PIL = A.ramp('#9AB4EC');
    for (let y = 3; y < 41; y++) for (let x = 0; x < 80; x++) {
      const cx = Math.min(x, 79 - x), cy = Math.min(y - 3, 40 - y);
      if (cx + cy < 2) continue;
      let t = 0.55 - x / 80 * 0.15 + (y === 3 ? 0.3 : 0) + (cy === 0 && y > 20 ? -0.3 : 0) + (cx === 0 ? (x === 0 ? 0.2 : -0.25) : 0) + (vnoise(x, y, 6, 510) - 0.5) * 0.12;
      if (y > 36) t -= 0.2;
      if ((x - 2) % 20 === 0 && y > 4 && y < 38) t -= 0.1;
      s.put(x, y, pick(BL, t, x, y));
    }
    for (const py of [7, 21]) s.ellipse(12, py + 6, 8, 6.5, (x, y, nx, ny) => pick(PIL, sphere(nx, ny) + 0.12, x, y));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 3 };
  };

  // banheira branca com a água, a torneira cromada
  props.bathtub.art = () => {
    const s = A.surface(50, 33);
    for (let y = 0; y < 31; y++) for (let x = 0; x < 50; x++) {
      const ix = x - 4, iy = y - 4, inside = ix >= 0 && iy >= 0 && ix < 42 && iy < 23 && !((ix < 2 || ix > 39) && (iy < 2 || iy > 20));
      if (inside) {
        let t = 0.55 + iy / 23 * 0.25 - (ix < 3 || iy < 3 ? 0.25 : 0) + (Math.sin(ix * 0.5 + iy * 0.3) > 0.85 ? 0.25 : 0);
        s.put(x, y, pick(T(['#5AA8C0', '#7AC4D6', '#9ADCE8', '#C0EEF4', '#E8FAFC']), t, x, y));
      } else s.put(x, y, pick(WHITE, 0.92 - x / 50 * 0.25 - y / 31 * 0.2 + (y === 0 || x === 0 ? 0.08 : 0), x, y));
    }
    s.rect(38, 1, 8, 2, '#A8B0BC'); s.rect(38, 1, 8, 1, '#E8ECF2'); s.put(41, 3, '#8A929E');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 3 };
  };
  // vaso sanitário: a caixa, o assento e a água
  props.toilet.art = () => {
    const s = A.surface(20, 25);
    for (let y = 0; y < 8; y++) for (let x = 2; x < 18; x++) s.put(x, y, pick(WHITE, 0.9 - x / 20 * 0.3 + (y === 0 ? 0.1 : 0) - (y === 7 ? 0.25 : 0), x, y));
    s.rect(8, 2, 4, 1, '#B8C0CC');
    s.ellipse(10, 15.5, 8.5, 8.5, (x, y, nx, ny) => {
      const d = nx * nx + ny * ny;
      if (d < 0.36) return pick(T(['#8AC0D4', '#A8D4E4', '#C8E8F0']), 0.5 - ny * 0.4, x, y);
      return pick(WHITE, sphere(nx, ny) + 0.1, x, y);
    });
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 2 };
  };
  // pia do lavabo: o tampo, a cuba oval e a torneira
  props.washbasin.art = () => {
    const s = A.surface(23, 18);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 23; x++) s.put(x, y, pick(WHITE, 0.88 - x / 23 * 0.25 - (y === 15 ? 0.3 : 0), x, y));
    s.ellipse(11.5, 8.5, 7, 5, (x, y, nx, ny) => pick(T(['#9AB8C8', '#B8D2DE', '#D6E8EE', '#F0F8FA']), 0.3 + ny * 0.5, x, y));
    s.rect(10, 1, 3, 3, '#A8B0BC'); s.put(10, 1, '#E8ECF2');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 2 };
  };

  // bancada da cozinha vista de cima: a cuba de inox, o fogão de indução e a chaleira; a frente de
  // armários de madeira escura
  props.kitchenCounter.art = p => {
    const W = Math.round((p.w || 70) * K), s = A.surface(W, 23);
    for (let y = 0; y < 22; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 14) c = pick(T(['#B8B4AC', '#CCC8C0', '#DEDAD2', '#ECE8E2', '#F8F6F2']), 0.75 - x / W * 0.2 + (y === 0 ? 0.2 : 0) - (y === 13 ? 0.3 : 0), x, y);
      else c = pick(T(['#2E1A10', '#40261A', '#563424', '#6E4432']), 0.6 - (y - 14) * 0.05 + ((x - 2) % 22 === 0 ? -0.4 : 0), x, y);
      s.put(x, y, c);
    }
    for (let y = 2; y < 12; y++) for (let x = 6; x < 26; x++) s.put(x, y, pick(T(['#6E747E', '#8A909A', '#A8AEB8', '#C8CED6']), 0.25 + (y - 2) / 10 * 0.6 + (x === 6 ? -0.2 : 0), x, y));
    s.rect(15, 1, 2, 3, '#7A808A');
    for (let y = 2; y < 12; y++) for (let x = 36; x < 60; x++) s.put(x, y, pick(T(['#0E0E12', '#18181E', '#24242C']), 0.4 + (Math.abs(x - y - 36) < 2 ? 0.5 : 0), x, y));
    for (const cx of [42, 54]) s.ellipse(cx, 7, 4.5, 3.5, (x, y, nx, ny) => (nx * nx + ny * ny > 0.6 ? '#4A4A54' : null));
    s.ellipse(70, 7, 4, 3.5, (x, y, nx, ny) => pick(T(['#A86A3A', '#C88A5A', '#E0AA7A']), sphere(nx, ny) + 0.1, x, y));
    s.rect(73, 5, 2, 1, '#6A4A2A');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 3 };
  };

  // geladeira pequena prateada com o micro-ondas em cima (de frente)
  props.fridge.art = () => {
    const s = A.surface(23, 38), SIL = T(['#6E747E', '#8A909A', '#A6ACB6', '#C2C8D0', '#DCE0E6', '#F0F2F6']);
    for (let y = 0; y < 12; y++) for (let x = 0; x < 23; x++) {
      let c = pick(T(['#1A1A20', '#26262E', '#34343E', '#46465A']), 0.55 - x / 23 * 0.3 + (y === 0 ? 0.3 : 0), x, y);
      if (y > 2 && y < 10 && x > 2 && x < 15) c = pick(T(['#0A0A0E', '#141418', '#24242C', '#3A3A48']), 0.3 + (Math.abs(x - y - 2) < 1.5 ? 0.6 : 0), x, y);
      if (x >= 17 && x < 20 && y > 2 && y < 10) c = (y % 2) ? '#5A5A6A' : '#8AE0A0';
      s.put(x, y, c);
    }
    for (let y = 12; y < 36; y++) for (let x = 0; x < 23; x++) {
      let t = 0.75 - x / 23 * 0.45 + (x === 0 ? 0.15 : 0) + (y === 12 ? 0.2 : 0);
      if (y === 21) t = 0.1;
      if (x === 18 && ((y > 14 && y < 20) || (y > 23 && y < 30))) t = 0.15;
      s.put(x, y, pick(SIL, t, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 35, contact: [11.5, 35, 10, 1.5] };
  };

  // mesa de jantar de madeira escura com as quatro cadeiras de assento e encosto creme (vista de cima)
  props.diningSet.art = () => {
    const s = A.surface(65, 55), DW = T(['#22140C', '#30200F', '#422C18', '#563A22', '#6A4A2E', '#80603E']), CR = A.ramp('#EFE0BC');
    const chair = (x0, y0, backTop) => {
      for (let y = 0; y < 11; y++) for (let x = 0; x < 15; x++) {
        const back = backTop ? y < 3 : y > 7;
        s.put(x0 + x, y0 + y, back ? pick(DW, 0.55 - x / 15 * 0.3 + (y === 0 ? 0.2 : 0), x0 + x, y0 + y) : pick(CR, 0.65 - x / 15 * 0.25 + (x === 0 || x === 14 ? -0.25 : 0), x0 + x, y0 + y));
      }
    };
    chair(12, 0, true); chair(37, 0, true);
    for (let y = 12; y < 43; y++) for (let x = 7; x < 58; x++) {
      let t = 0.55 + (vnoise(x * 0.2, y * 1.5, 3, 511) - 0.5) * 0.35 - x / 65 * 0.15 + (y === 12 ? 0.3 : 0) - (y >= 41 ? 0.3 : 0);
      s.put(x, y, pick(DW, t, x, y));
    }
    // jogo americano, um prato e uma xícara
    for (let y = 16; y < 24; y++) for (let x = 15; x < 27; x++) s.put(x, y, pick(T(['#C8B890', '#DCCCA8', '#EEE2C4']), 0.7 - (y - 16) * 0.04, x, y));
    s.ellipse(21, 20, 4, 3, (x, y, nx, ny) => pick(WHITE, sphere(nx, ny) + 0.15, x, y));
    s.ellipse(40, 22, 3, 2.5, (x, y, nx, ny) => (nx * nx + ny * ny < 0.4 ? '#7A4A2A' : pick(WHITE, sphere(nx, ny) + 0.1, x, y)));
    chair(12, 43, false); chair(37, 43, false);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 54, shadow: 'flat', H: 4 };
  };

  // ======================================================================
  //  C2 · Brazilian Day: parque numa tarde de sol, grama seca com a terra pisada onde o povo anda,
  //  barracas de toldo verde e amarelo, a árvore grande com a sombra, a ponte em arco branca ao longe
  //  e as bandeirinhas verdes e amarelas (os nomes de estilo são próprios: o 'festival' da V1 também
  //  aparece em outras fases)
  // ======================================================================
  const GRASSD = T(['#4A662C', '#587632', '#68863A', '#7A9644', '#8CA650', '#9EB45E', '#B0C06E', '#C2CC82']);
  const DIRT = T(['#7A6044', '#8C7050', '#9E805C', '#B0906A', '#C0A07A', '#CEB08C', '#DCC2A2']);

  Art.floors.brazilPark = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      // terra pisada onde o povo anda (as duas trilhas e a fila na frente das barracas de cima)
      let dirt = Math.max(0, 1 - Math.abs(y - 121) / 17) + Math.max(0, 1 - Math.abs(y - 211) / 15) * (x > 100 ? 1 : 0.5) + Math.max(0, 1 - Math.abs(y - 98) / 10) * 0.7;
      dirt += (vnoise(x, y, 14, 530) - 0.5) * 0.9 + (vnoise(x, y, 4, 531) - 0.5) * 0.3;
      if (dirt > 0.55 + (bay(x, y) - 0.5) * 0.12) {
        let t = 0.55 + (vnoise(x, y, 9, 532) - 0.5) * 0.3 + (h01(x, y, 533) - 0.5) * 0.25;
        if (h01(x, y, 534) < 0.01) t += 0.35;
        S.put(x, y, pick(DIRT, t, x, y));
        continue;
      }
      let t = 0.5 + (vnoise(x, y, 20, 535) - 0.5) * 0.4 + (vnoise(x, y, 5, 536) - 0.5) * 0.3 + (h01(x, y, 537) - 0.5) * 0.2 - (dirt > 0.4 ? 0.12 : 0);
      S.put(x, y, pick(GRASSD, t, x, y));
      // tufos e uma florzinha amarela de vez em quando
      const r = h01(x, y, 538);
      if (r < 0.03 && y > top + 2) { S.put(x, y - 1, GRASSD[1]); S.put(x + 1, y - 2, GRASSD[6]); }
      else if (r < 0.032) S.put(x, y, '#F2D84A');
    }
    for (let y = top; y < top + 6; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#8A98B0', (1 - (y - top) / 6) * 0.7);
  };

  // céu de verão, a ponte em arco branca ao longe, os toldos verdes e as bandeiras do Brasil
  // aparecendo atrás das árvores
  Art.walls.brazilSky = (S, look) => {
    const H = look.wall.height, SKYP = T(['#3A74D0', '#4682D8', '#5490DE', '#64A0E4', '#78AEE8', '#8EBCEA', '#A6CCEC', '#BED8EC']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYP, y / (H - 6) + (vnoise(x, y, 40, 540) - 0.5) * 0.06, x, y));
    cumulus(S, 70, 12, [[-14, 1, 5], [-6, -3, 7], [4, -4, 7], [12, 0, 5], [18, 2, 3]], 3);
    cumulus(S, 220, 8, [[-8, 0, 4], [0, -2, 5], [7, 1, 4]], 2);
    // a ponte em arco (aço branco), com os tirantes e o tabuleiro
    const AX0 = 300, AX1 = 470, base = H - 9, AH = 26;
    const arch = x => base - AH * (1 - Math.pow((x - (AX0 + AX1) / 2) / ((AX1 - AX0) / 2), 2));
    for (let x = AX0; x <= AX1; x++) {
      const y = Math.round(arch(x));
      S.put(x, y, '#FFFFFF'); S.put(x, y + 1, '#C8D0DA');
      if ((x - AX0) % 8 === 4 && y + 2 < base) for (let yy = y + 2; yy < base; yy++) S.put(x, yy, '#D8E0EA', 0.7);
    }
    for (let x = AX0 - 20; x < AX1 + 10; x++) { S.put(x, base, '#E8ECF0'); S.put(x, base + 1, '#9AA4B0'); }
    // a fileira de árvores, com os toldos verdes e as bandeiras no meio
    const L = kit.LEAF;
    for (let y = H - 10; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(L, 0.25 + (vnoise(x, y, 3, 541) - 0.5) * 0.4, x, y));
    for (let x = -4, q = 0; x < 490; x += 11 + Math.floor(h01(q, 1, 542) * 7), q++) kit.lump(S, x, H - 9 + h01(q, 2, 542) * 4, 6 + h01(q, 3, 542) * 4, 0.05, 550 + q, L);
    [[118, 8], [168, 7], [262, 9], [330, 7]].forEach(([tx, tw]) => {
      for (let y = H - 13; y < H - 4; y++) {
        const half = Math.min(tw, (y - (H - 13)) * 1.2);
        for (let x = Math.round(tx - half); x <= Math.round(tx + half); x++) S.put(x, y, y > H - 7 ? '#F2F0EA' : pick(T(['#1E7A3E', '#2EA35A', '#5CC47E']), 0.8 - (x - tx + half) / (2 * half + 1) * 0.6, x, y));
      }
    });
    [[96, H - 22], [214, H - 24], [392, H - 20]].forEach(([fx, fy]) => {
      for (let y = fy; y < H - 4; y++) S.put(fx, y, '#8A8478');
      for (let y = 0; y < 7; y++) for (let x = 1; x < 11; x++) {
        const dx = Math.abs(x - 5.5) / 5, dy = Math.abs(y - 3) / 3.5;
        let c = '#1E9A48';
        if (dx + dy < 1) c = '#F6D02A';
        if (Math.hypot((x - 5.5) / 2.2, (y - 3) / 2) < 1) c = '#1E3A8A';
        S.put(fx + x, fy + y + (x > 6 ? 1 : 0), c);
      }
    });
    for (let x = 0; x < 480; x++) S.put(x, H - 1, mix(S.get(x, H - 1), '#142A18', 0.5));
  };

  // ---------- objetos do Brazilian Day ----------
  // Barraca de comida: o toldo verde com a borda recortada verde e amarela, os postes, o fundo na
  // sombra com o varal de bandeirinhas, o balcão com a comida da placa (p.food: 0 pastéis, 1 coxinhas,
  // 2 latinhas de guaraná) e a placa com o texto do config
  const GREEN = T(['#0E4A26', '#145E30', '#1C763C', '#26904A', '#34A85A', '#4CC070', '#74D490']);
  const YELLOW = T(['#B08A10', '#D0A618', '#E8C024', '#F6D43A', '#FCE468', '#FFF29A']);
  props.stall.art = p => {
    const s = A.surface(80, 58), k = p.food || 0;
    // fundo na sombra do toldo
    for (let y = 14; y < 32; y++) for (let x = 3; x < 77; x++) s.put(x, y, pick(T(['#18241A', '#223222', '#2E402C', '#3C5038']), 0.3 + (y - 14) / 18 * 0.5, x, y));
    for (let x = 6; x < 74; x++) {
      const y = Math.round(19 + Math.sin((x - 6) / 68 * Math.PI) * 3);
      s.put(x, y, '#6A6A6A');
      if ((x - 6) % 6 < 4) for (let j = 1; j < 4; j++) if (Math.abs((x - 6) % 6 - 1.5) < 2 - j * 0.5) s.put(x, y + j, Math.floor((x - 6) / 6) % 2 ? '#F2D02A' : '#2EA35A');
    }
    // postes
    for (const px of [2, 75]) for (let y = 8; y < 55; y++) for (let i = 0; i < 3; i++) s.put(px + i, y, pick(WHITE, 0.85 - i * 0.3, px + i, y));
    // o balcão e a comida
    for (let y = 30; y < 34; y++) for (let x = 2; x < 78; x++) s.put(x, y, pick(WOOD, (y === 30 ? 0.95 : 0.55) - (x - 2) / 76 * 0.2, x, y));
    if (k === 0) {
      // pastéis dourados numa bandeja
      for (let x = 10; x < 70; x++) { s.put(x, 29, '#C8CCD4'); s.put(x, 30, '#9AA0AA'); }
      for (let i = 0; i < 6; i++) s.ellipse(15 + i * 10, 28, 4.5, 3, (x, y, nx, ny) => (y > 28 ? null : pick(T(['#A8641E', '#C8842E', '#E0A448', '#F2C46A']), sphere(nx, ny) + 0.15 + (h01(x, y, 560) < 0.15 ? -0.2 : 0), x, y)));
    } else if (k === 1) {
      // coxinhas (gota dourada) em pé
      for (let i = 0; i < 7; i++) {
        const cx = 13 + i * 9;
        for (let y = 22; y < 30; y++) {
          const half = (y - 22) < 4 ? (y - 22) * 0.75 + 0.5 : 3.5 - (y - 26) * 0.4;
          for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) s.put(x, y, pick(T(['#8A4A16', '#AA6420', '#C8842E', '#E0A448', '#F0C06A']), 0.75 - (x - cx + half) / (2 * half + 1) * 0.5 - (y - 22) * 0.03 + (h01(x, y, 561) < 0.2 ? -0.15 : 0), x, y));
        }
      }
    } else {
      // latinhas verdes (sem marca) e um isopor com gelo
      for (let i = 0; i < 6; i++) {
        const x0 = 10 + i * 9;
        for (let y = 22; y < 30; y++) for (let x = x0; x < x0 + 5; x++) s.put(x, y, y < 23 ? '#C8CCD4' : pick(GREEN, 0.75 - (x - x0) * 0.15, x, y));
        s.put(x0 + 2, 25, '#F2D02A'); s.put(x0 + 2, 26, '#D8443A');
      }
      for (let y = 22; y < 30; y++) for (let x = 62; x < 74; x++) s.put(x, y, pick(WHITE, 0.85 - (x - 62) * 0.03, x, y));
    }
    // a frente branca com a faixa verde e a placa
    for (let y = 34; y < 55; y++) for (let x = 2; x < 78; x++) {
      let c = pick(WHITE, 0.8 - (x - 2) / 76 * 0.2 - (y - 34) * 0.005, x, y);
      if (y >= 50) c = pick(GREEN, 0.55 - (x - 2) / 76 * 0.2, x, y);
      if (y === 49) c = YELLOW[3];
      s.put(x, y, c);
    }
    const txt = Art.text(p.text || '', '#1C763C'), bw = Math.max(40, txt.width + 10), bx = Math.round(40 - bw / 2);
    for (let y = 37; y < 48; y++) for (let x = bx; x < bx + bw; x++) s.put(x, y, x === bx || x === bx + bw - 1 || y === 37 || y === 47 ? YELLOW[1] : pick(T(['#F2E8C8', '#FAF2DC', '#FFFAEC']), 0.7, x, y));
    s.draw(txt, Math.round(40 - txt.width / 2) + 1, 38);
    // o toldo: tampo verde em gomos e a borda recortada, alternando verde e amarelo
    for (let y = 0; y < 18; y++) for (let x = 0; x < 80; x++) {
      const sc = (x % 8) / 8, alt = Math.floor(x / 8) % 2;
      if (y >= 12 && y > 12 + Math.sin(sc * Math.PI) * 4) continue;
      let c;
      if (y < 12) c = pick(GREEN, 0.75 - y / 12 * 0.3 - x / 80 * 0.15 + ((x % 16) === 0 ? -0.25 : 0) + (y === 0 ? 0.2 : 0), x, y);
      else c = pick(alt ? YELLOW : GREEN, 0.6 - (y - 12) * 0.06, x, y);
      if (y === 11) c = YELLOW[2];
      s.put(x, y, c);
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: -1, base: 54, contact: [40, 54, 38, 2] };
  };

  // Árvore grande de copa larga (zelkova): o tronco que se abre em galhos e a copa em moitas, com
  // buracos por onde aparecem os galhos. A sombra comprida da tarde cai no chão pela luz do cenário.
  props.bigTree.art = () => {
    const s = A.surface(124, 108), L = kit.LEAF, BARK = T(['#35231A', '#4E3424', '#6A4A32', '#8A6646', '#A8835E']);
    for (let y = 56; y < 99; y++) {
      const half = 5 + (y > 92 ? (y - 92) * 1.1 : 0) - (y < 64 ? (64 - y) * 0.2 : 0);
      for (let x = Math.round(62 - half); x <= Math.round(62 + half); x++) {
        let t = 0.85 - (x - (62 - half)) / (2 * half) * 0.75 + (vnoise(x, y, 2, 570) - 0.5) * 0.35;
        if ((x + Math.floor(y / 3)) % 6 === 0) t -= 0.2;
        s.put(x, y, pick(BARK, t, x, y));
      }
    }
    [[60, 62, 34, 36, 4], [64, 60, 92, 34, 4], [62, 58, 58, 22, 3], [58, 66, 18, 50, 3], [66, 64, 106, 52, 3]].forEach(([x0, y0, x1, y1, w]) => s.limb(x0, y0, x1, y1, w, BARK, 0));
    const parts = [[62, 30, 30], [32, 40, 22], [92, 38, 23], [18, 56, 13], [106, 56, 13], [46, 18, 18], [80, 16, 19], [62, 8, 13], [44, 50, 17], [80, 50, 17]];
    parts.forEach(([px, py, r], q) => {
      for (let y = py - r; y <= py + r; y++) for (let x = px - r; x <= px + r; x++) {
        const nx = (x + 0.5 - px) / r, ny = (y + 0.5 - py) / (r * 0.85), rough = (vnoise(x, y, 3.5, 571 + q) - 0.5) * 0.5;
        if (nx * nx + ny * ny > 1 + rough) continue;
        // buracos na copa (os galhos aparecem)
        if (q > 7 && ny > 0.3 && vnoise(x, y, 4, 572) < 0.3) continue;
        let t = sphere(clamp1(nx), clamp1(ny)) + (vnoise(x, y, 2.4, 573 + q) - 0.5) * 0.55 - (q > 7 ? 0.12 : 0);
        if (h01(x, y, 574) < 0.05) t += 0.3;
        s.put(x, y, pick(L, t + 0.05, x, y));
      }
    });
    s.outline(0.5);
    return { spr: s, dx: -2, dy: -2, base: 98, contact: [62, 98, 12, 2.5] };
  };

  // bandeirinhas verdes e amarelas no varal, balançando, por cima de tudo (p.w de comprimento)
  const flagImgs = {};
  function flagImg(green, flap) {
    const key = (green ? 1 : 0) + (flap ? 2 : 0);
    if (flagImgs[key]) return flagImgs[key];
    const s = A.surface(9, 9), R = green ? GREEN : YELLOW;
    for (let j = 0; j < 8; j++) {
      const half = 3.5 - j * 0.45, sh = flap && j > 3 ? 1 : 0;
      for (let x = Math.round(4 - half); x <= Math.round(4 + half); x++) s.put(x + sh, j, pick(R, 0.75 - (x - 4 + half) / (2 * half + 1) * 0.55 - j * 0.03, x, j));
    }
    s.outline(0.55);
    return (flagImgs[key] = s.canvas());
  }
  const cords = {};
  props.bunting.fxNew = (ctx, p, world) => {
    const X = Math.round(p.x * K), Y = Math.round(p.y * K), w = Math.round((p.w || 200) * K), t = world.t;
    const sag = i => Math.round(Math.sin(i / w * Math.PI) * 8);
    const key = w;
    if (!cords[key]) {
      const s = A.surface(w + 1, 10);
      for (let i = 0; i <= w; i++) { s.put(i, sag(i), '#4A4650'); s.put(i, sag(i) + 1, '#2A2830', 0.4); }
      cords[key] = s.canvas();
    }
    ctx.drawImage(cords[key], X, Y);
    for (let i = 6, n = 0; i < w - 4; i += 12, n++) ctx.drawImage(flagImg(n % 2 === 0, Math.sin(t * 3 + n * 0.9) > 0.5), X + i - 4, Y + sag(i) + 1);
  };
})();
