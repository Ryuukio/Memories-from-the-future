// Cenários: pintores de piso e parede e a biblioteca de objetos (mesas, cadeiras, decoração).
// Os arquivos de data/scenes/ só dizem qual pintor usar e onde fica cada objeto; o desenho
// fica aqui, reaproveitado por todos os cenários.
//
// Objeto: Scenery.props[tipo] = {
//   size(p)          → [w, h] do desenho (p = a instância, com as opções do cenário)
//   solid(p)         → [x, y, w, h] colisão no chão, relativo ao canto do desenho (null = nenhuma)
//   sight(p)         → [x, y, w, h] bloqueia a visão dos vigias (null = não bloqueia)
//   base             altura da base para ordenar com os personagens (número ou função de p; padrão: h)
//   hidden           true = não desenha nada parado (só colisão, ou só a animação fx)
//   layer            'back' = pintado no fundo (parede, banco); 'sorted' (padrão) = ordenado pela base
//   draw(c, p)       pinta no canvas c, a partir de (0, 0) (desenho da V1)
//   live(ctx, p, world, img)   opcional: desenha a cada quadro, no lugar da imagem pronta (baú, porta)
//   liveNew(ctx, p, world)     V2: como o live, mas já no desenho novo, em coordenadas novas (fora da
//                              camada velha; p continua em coordenadas velhas). Ex.: o Big Jimmy Junk,
//                              a porta do corredor e o baú
//   fx(ctx, p, world)          opcional: animação por cima (fxLayer 'top') ou no chão ('ground')
//   art(p)           V2: o desenho novo, usado nos cenários da V2 (ver art.js e room.js): devolve
//                    { spr, dx, dy, shadow, H, base, contact }: spr = Art.surface com o desenho no
//                    tamanho novo, em (x, y) × 1,25 + (dx, dy); shadow 'up' (em pé, padrão), 'flat'
//                    (tampo a H px do chão) ou false; base = a linha do chão no desenho (para a
//                    sombra); contact = [cx, cy, rx, ry] mancha de contato
//   fxNew(ctx, p, world)       V2: o fx num cenário da V2, em coordenadas novas
// }
// world = { t: tempo em segundos, ellen: { x, y } }. Coordenadas do mundo (a sala inteira).
// Os outros arquivos scenery-*.js acrescentam pisos, paredes e objetos de cada fase.
const Scenery = (() => {
  const R = Gfx.rect;

  // ruído determinístico: o mesmo cenário sai sempre igual
  const hash = (a, b) => {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };

  function alpha(c, a, fn) {
    c.save();
    c.globalAlpha = a;
    fn();
    c.restore();
  }

  // pontilhado Bayer 4×4 com uma cor sobre uma área, mais denso de um lado (luz, brilho)
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function glow(c, x, y, w, h, color, density) {
    c.fillStyle = color;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (density(i, j) * 16 > BAYER[(y + j) & 3][(x + i) & 3] + 0.5) c.fillRect(x + i, y + j, 1, 1);
      }
    }
  }

  // ================= pisos =================
  // FLOORS[nome]: uma tábua ({ tones, seam, grain }, pintada por planks) ou uma função (ver paintBase).
  // Os pisos da V1 que continuam (fases 2 a 4) estão nos arquivos scenery-*.js de cada fase.
  const FLOORS = {};

  function planks(c, x0, y0, w, h, f, seed) {
    c.save();
    c.beginPath();
    c.rect(x0, y0, w, h);
    c.clip();
    for (let row = 0, y = y0; y < y0 + h; row++, y += 6) {
      let x = x0 - (hash(row, seed) % 40), i = 0;
      while (x < x0 + w) {
        const len = 22 + hash(row * 31 + i, seed) % 30;
        const t = f.tones[hash(row * 7 + i * 13, seed + 1) % f.tones.length];
        R(x, y, len, 1, t[0], c);
        R(x, y + 1, len, 3, t[1], c);
        R(x, y + 4, len, 1, t[2], c);
        R(x, y + 5, len, 1, f.seam, c);
        R(x + len - 1, y, 1, 5, f.seam, c);
        // veios: um ou dois tracinhos mais escuros
        const g = hash(row * 5 + i, seed + 2);
        if (g % 3) R(x + 4 + g % (len - 12), y + 2 + (g >> 4) % 2, 3 + (g >> 6) % 4, 1, f.grain, c);
        x += len;
        i++;
      }
    }
    c.restore();
  }

  // ================= paredes =================
  // WALLS[nome](c, x, w, h, look): a parede do fundo da V1 (as das fases 2 a 4 estão em scenery-*.js)
  const WALLS = {};

  // ================= objetos =================
  // Tamanho, colisão e visão da V1 (coordenadas velhas; o Room.build amplia). O desenho é o `art`
  // (V2, mais abaixo); só a planta, que também aparece nas fases 2 e 4, ainda tem o draw da V1.
  const props = {};

  // mesa de madeira escura com a chapa embutida (F1 A1). p.food, p.items ('left' | 'right' | 'both'),
  // p.glass, p.spatulas
  props.grillTable = { size: () => [64, 26], solid: () => [0, 2, 64, 18], sight: () => null, base: 20 };

  // cadeira vazia, de costas ou de lado (encosto alto: bloqueia a visão). p.style: 'okonomiyaki' ou 'cafe'
  props.chair = { size: () => [16, 34], solid: () => [3, 24, 10, 9], sight: () => [3, 19, 10, 14], base: 33 };

  // banco comprido preto encostado na parede do fundo
  props.bench = { layer: 'back', size: p => [p.w, 26], solid: p => [0, 0, p.w, 24], sight: p => [0, 0, p.w, 24] };

  // decoração da parede (fundo, sem colisão): relógio, tiras de cardápio, placa com o texto do
  // config.js (p.text), lanterna de papel e a porta da cozinha com o noren
  props.clock = { layer: 'back', size: () => [14, 14] };
  props.menuStrips = { layer: 'back', size: p => [(p.n || 6) * 9, 24] };
  props.sign = { layer: 'back', size: p => [Gfx.textWidth(p.text || '') + 16, 15] };
  props.lantern = { layer: 'back', size: () => [10, 18] };
  props.noren = { layer: 'back', size: () => [48, 44] };

  // planta num vaso de barro
  props.plant = {
    size: () => [18, 30],
    solid: () => [3, 22, 12, 8],
    sight: () => [3, 20, 12, 10],
    base: 30,
    draw(c) {
      alpha(c, 0.35, () => R(2, 27, 15, 3, '#140F1E', c));
      const leaves = [[8, 0, 9], [5, 3, 7], [11, 2, 8], [3, 7, 5], [13, 6, 6], [7, 4, 8], [10, 5, 8], [1, 11, 4], [15, 10, 4]];
      leaves.forEach(([x, y, h], i) => {
        R(x, y, 2, h + 6, i % 2 ? '#2E6A3E' : '#3F8A4E', c);
        R(x, y, 1, h + 4, '#5DAA62', c);
      });
      R(3, 19, 12, 2, '#C8724A', c);
      R(4, 21, 10, 8, '#A85A3A', c);
      R(4, 21, 2, 8, '#C8724A', c);
      R(12, 21, 2, 8, '#8A4A30', c);
    }
  };

  // ================= bordas laterais (com as passagens) =================
  // EDGES[estilo](c, x, top, gap, side): x = coluna de 4 px da parede lateral, top = altura da
  // parede do fundo, gap = [y0, y1] da passagem ou null, side = 'left' | 'right'.

  // postes de madeira, com a luz quente entrando pela passagem
  function woodEdge(colors) {
    return (c, x, top, gap, side) => {
      const segs = gap ? [[top - 8, gap[0]], [gap[1], 192]] : [[top - 8, 192]];
      segs.forEach(([a, b]) => {
        R(x, a, 4, b - a, colors[0], c);
        R(side === 'left' ? x + 3 : x, a, 1, b - a, colors[1], c);
        R(side === 'left' ? x + 1 : x + 2, a, 1, b - a, colors[2], c);
      });
      if (gap) {
        glow(c, side === 'left' ? x : x - 8, gap[0] + 2, 12, gap[1] - gap[0] - 4, colors[3],
          i => 0.55 * (side === 'left' ? 1 - i / 12 : i / 12));
        R(x, gap[0] - 1, 4, 2, colors[1], c);
        R(x, gap[1] - 1, 4, 2, colors[1], c);
      }
    };
  }

  const EDGES = {
    wood: woodEdge(['#4A2B1C', '#2E190F', '#6A4129', '#C88A62']),
    none: () => {}
  };

  // ======================================================================
  //  V2 (art.js): F1 A1 · Okonomiyaki, as cadeiras, a planta e a borda de madeira, em coordenadas
  //  novas (480 × 240). Teto escuro com a faixa de luz quente, parede creme, banco comprido preto,
  //  mesas escuras com a chapa, cadeiras de madeira clara com encosto preto, piso avermelhado.
  // ======================================================================
  const A = Art, { pick, vnoise, sphere, bay, mix, clamp1 } = Art, h01 = Art.hash;

  const DARKWOOD = A.tones(['#26150E', '#341E15', '#45291D', '#553425', '#66402E', '#7A4F3A', '#8E624A']);
  const REDFLOOR = A.tones(['#4E2416', '#62301E', '#763C26', '#8A4A30', '#9C583A', '#AE6846', '#C07A56', '#D08E6A']);
  const LIGHTWOOD = A.tones(['#6E4422', '#8A5730', '#A6703E', '#BC8448', '#D09A5C', '#E2B276']);
  const LEATHER = A.tones(['#121016', '#18161D', '#211E27', '#2A2731', '#36323F', '#46404F', '#5C5568']);
  const STEEL = A.tones(['#464C5A', '#5E6472', '#7A808E', '#969CAA', '#B4BAC6', '#D6DAE2']);
  const IRON = A.tones(['#15161A', '#1C1D22', '#25272D', '#2F3139', '#3A3D46', '#474B55']);
  const CREAM = A.tones(['#B8A27C', '#C8B48C', '#D6C29C', '#E2D0AC', '#ECDDBA', '#F4E8CA', '#FBF2DC', '#FFF8EA']);

  // tábuas de madeira com veios (o piso do restaurante e o do corredor): o.R rampa, o.rh altura da
  // fileira, o.seed, o.gloss (brilho da luz do teto perto da parede), o.top (onde o piso começa)
  function planksArt(S, x0, y0, w, h, o) {
    const R = o.R, rh = o.rh || 8, seed = o.seed || 1;
    for (let y = y0; y < y0 + h; y++) {
      const row = Math.floor((y - y0) / rh), j = (y - y0) % rh;
      let x = x0 - Math.floor(h01(row, 0, seed) * 80), i = 0;
      while (x < x0 + w) {
        const len = 48 + Math.floor(h01(row, i, seed + 1) * 60), tone = (h01(row, i, seed + 2) - 0.5) * 0.16;
        for (let xx = Math.max(x, x0); xx < Math.min(x + len, x0 + w); xx++) {
          // veios compridos (ruído esticado na horizontal) e listras finas mais escuras
          let t = 0.55 + tone + (vnoise(xx * 0.18, y * 1.6, 3, seed + 3 + row) - 0.5) * 0.4;
          if (vnoise(xx * 0.08, y * 3, 2, seed + 9 + row) > 0.72) t -= 0.16;
          if (j === 0) t += 0.08;
          if (o.gloss) t += o.gloss * Math.max(0, 1 - (y - y0) / 40);
          let c = pick(R, t, xx, y);
          if (j === rh - 1) c = R[1];
          else if (xx === x + len - 1) c = mix(R[1], R[2], 0.5);
          S.put(xx, y, c);
        }
        // nó da madeira de vez em quando
        if (h01(row, i, seed + 4) < 0.18) {
          const kx = x + 6 + Math.floor(h01(row, i, seed + 5) * (len - 12)), ky = y0 + row * rh + 2 + Math.floor(h01(row, i, seed + 6) * (rh - 4));
          S.put(kx, ky, R[1]); S.put(kx + 1, ky, R[1]); S.put(kx + 2, ky, R[2]);
        }
        x += len;
        i++;
      }
    }
  }

  Art.floors.redWood = (S, look) => {
    const top = look.wall.height;
    planksArt(S, 0, top, 480, 240 - top, { R: REDFLOOR, rh: 8, seed: 11, gloss: 0.12 });
    // sombra da parede e do banco no chão
    for (let y = top; y < top + 6; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#9C8A90', (1 - (y - top) / 6) * 0.8);
  };

  // Parede do restaurante: teto escuro, a faixa de luz embutida, parede creme clareada pela luz de
  // cima, rodameio e lambri de madeira (aparece onde o banco não cobre)
  Art.walls.restaurant = (S, look) => {
    const h = look.wall.height, rail = h - 20;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 5) c = pick(A.tones(['#1C1614', '#241C19', '#2E2420']), 0.3 + y * 0.1 + (vnoise(x, y, 6, 30) - 0.5) * 0.2, x, y);
      else if (y < 7) c = y === 5 ? '#FFF6DA' : '#FFE8B0';
      else if (y < rail) c = pick(CREAM, 0.95 - (y - 7) / (rail - 7) * 0.55 + (vnoise(x, y, 4, 31) - 0.5) * 0.12 + (h01(x, y, 32) < 0.06 ? -0.12 : 0), x, y);
      else if (y < rail + 2) c = y === rail ? '#8A5A38' : '#5A3824';
      else {
        const px = (x + 6) % 30;
        c = pick(DARKWOOD, 0.45 - (y - rail) / 20 * 0.2 + (px === 0 ? -0.3 : px === 1 ? 0.2 : 0) + (vnoise(x * 0.3, y, 3, 33) - 0.5) * 0.2, x, y);
      }
      S.put(x, y, c);
    }
    // a luz da faixa espalhando na parede, em pontilhado
    for (let y = 7; y < 16; y++) for (let x = 0; x < 480; x++) S.tput(x, y, '#FFF4D8', (1 - (y - 7) / 9) * 0.5 + (bay(x, y) - 0.5) * 0.1);
    for (let x = 0; x < 480; x++) S.put(x, h - 1, '#2E190F');
  };

  // Borda de madeira (postes) com a passagem: a luz do outro lado entra pelo chão.
  // colors: [rampa do poste (3 a 5 tons), cor da luz da passagem]
  function woodEdgeArt(ramp, light) {
    const P = A.tones(ramp);
    return (S, x, top, gap, side) => {
      const segs = gap ? [[top - 10, gap[0]], [gap[1], 240]] : [[top - 10, 240]];
      segs.forEach(([a, b]) => {
        for (let y = a; y < b; y++) for (let i = 0; i < 5; i++) {
          const inner = side === 'left' ? i : 4 - i;
          S.put(x + i, y, pick(P, 0.35 + inner * 0.12 + (inner === 4 ? 0.2 : 0) + (vnoise(x + i, y * 0.3, 2, 40) - 0.5) * 0.2, x + i, y));
        }
      });
      if (!gap) return;
      // a luz entrando pela passagem, espalhando no chão para dentro
      const [g0, g1] = gap, dir = side === 'left' ? 1 : -1;
      for (let y = g0 + 1; y < g1 - 1; y++) for (let d = 0; d < 18; d++) {
        const px = side === 'left' ? x + d : x + 4 - d;
        const a = 0.55 * (1 - d / 18) * (1 - Math.abs((y - (g0 + g1) / 2) / ((g1 - g0) / 2)) * 0.5);
        S.tput(px, y, light, a + (bay(px, y) - 0.5) * 0.1);
      }
      for (let i = 0; i < 5; i++) { S.put(x + i, g0 - 1, P[0]); S.put(x + i, g0, P[1]); S.put(x + i, g1 - 1, P[0]); S.put(x + i, g1, P[1]); }
      void dir;
    };
  }
  Art.edges.wood = woodEdgeArt(['#2E190F', '#4A2B1C', '#6A4129', '#8A5A38', '#A87048'], '#FFD8A8');
  Art.edges.none = () => {};

  // ---------- objetos do F1 A1 ----------
  // garrafinha de molho (corpo, tampa, brilho), copo de cerveja e copo d'água, no tamanho novo
  function bottleArt(s, x, y, body, cap) {
    s.rect(x, y, 3, 2, cap);
    s.put(x, y, mix(cap, '#FFFFFF', 0.4));
    for (let j = 2; j < 8; j++) { s.put(x, y + j, mix(body, '#FFFFFF', 0.25)); s.put(x + 1, y + j, body); s.put(x + 2, y + j, mix(body, '#000000', 0.3)); }
    s.put(x, y + 3, '#FFFFFF');
  }
  function beerArt(s, x, y) {
    for (let j = 0; j < 9; j++) for (let i = 0; i < 5; i++) {
      let c = j < 2 ? (i < 3 ? '#FFFFFF' : '#ECE8E0') : pick(A.tones(['#C88A1E', '#E8B23A', '#F6CE62']), 0.8 - i * 0.18, x + i, y + j);
      if (i === 0 && j > 1) c = '#FFE8A0';
      s.put(x + i, y + j, c);
    }
    s.put(x + 5, y + 3, '#C8D0D8'); s.put(x + 6, y + 4, '#C8D0D8'); s.put(x + 6, y + 5, '#C8D0D8'); s.put(x + 5, y + 6, '#C8D0D8');
  }
  function waterArt(s, x, y) {
    for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) s.put(x + i, y + j, j === 0 ? '#FFFFFF' : i === 0 ? '#F4FAFF' : j > 3 ? '#B8CCDC' : '#D6E4F0', j === 0 ? 1 : 0.85);
  }
  // okonomiyaki na chapa: massa dourada, molho escuro, maionese em zigue-zague, aonori e katsuobushi
  function okonomiArt(s, x, y) {
    s.ellipse(x + 11, y + 5, 11, 5, (px, py, nx, ny) => {
      const d = nx * nx + ny * ny;
      if (d > 0.62) return pick(A.tones(['#9A5A22', '#C8823A', '#E0A458']), 0.7 - ny * 0.4, px, py);
      return pick(A.tones(['#3A1A0E', '#4E2414', '#6A341C']), 0.5 - ny * 0.3 + (vnoise(px, py, 2, 60) - 0.5) * 0.4, px, py);
    });
    for (let i = 0; i < 14; i++) s.put(x + 4 + i, y + 3 + (i % 4 < 2 ? 0 : 1) + (i % 8 < 4 ? 0 : 1), '#F6F2E8');
    [[7, 2, '#5DAA62'], [13, 6, '#5DAA62'], [16, 3, '#4E9A52'], [9, 5, '#E8A08A'], [15, 5, '#F0B4A0'], [11, 2, '#E8A08A']].forEach(([i, j, c]) => s.put(x + i, y + j, c));
  }
  function spatulaArt(s, x, y, flip) {
    s.rect(x, y, 6, 2, STEEL[4]);
    s.rect(x, y + 1, 6, 1, STEEL[2]);
    const hx = flip ? x + 6 : x - 4;
    s.rect(hx, y, 4, 1, '#A86A34');
    s.put(hx + (flip ? 0 : 3), y + 1, '#6A3E1E');
  }

  // mesa de madeira escura com a chapa embutida (tampo, moldura de inox, chapa de ferro)
  props.grillTable.art = p => {
    const s = A.surface(80, 28);
    for (let y = 0; y < 27; y++) for (let x = 0; x < 80; x++) {
      if (y < 22) {
        let t = 0.62 - x * 0.002 + (vnoise(x * 0.2, y * 1.5, 3, 61) - 0.5) * 0.25 + (y === 0 ? 0.3 : 0) + (x === 0 ? 0.15 : 0);
        if (y === 21) t -= 0.25;
        s.put(x, y, pick(DARKWOOD, t, x, y));
      } else {
        s.put(x, y, pick(DARKWOOD, 0.3 - (y - 22) * 0.06 - x * 0.001, x, y));
      }
    }
    // a chapa: moldura de inox (clara em cima e à esquerda) e o ferro escuro com marcas de uso
    for (let y = 2; y < 20; y++) for (let x = 12; x < 68; x++) {
      const edge = x < 14 || x > 65 || y < 4 || y > 17;
      if (edge) { s.put(x, y, pick(STEEL, (x < 14 || y < 4 ? 0.85 : 0.25) + (y === 2 || x === 12 ? 0.15 : 0), x, y)); continue; }
      let t = 0.45 + (vnoise(x, y, 4, 62) - 0.5) * 0.4 - (y - 4) * 0.012;
      if (h01(x, y, 63) < 0.04) t += 0.3;
      s.put(x, y, pick(IRON, t, x, y));
    }
    for (let x = 14; x < 66; x++) s.put(x, 4, IRON[4]);
    [[17, 7], [58, 7], [56, 14]].forEach(([x, y]) => { s.put(x, y, IRON[5]); s.put(x + 1, y, IRON[5]); s.put(x + 2, y, IRON[4]); });
    if (p.food) okonomiArt(s, 29, 6);
    if (p.spatulas !== false) { spatulaArt(s, 16, 16, false); spatulaArt(s, 57, 5, true); }
    const items = p.items || 'left';
    if (items === 'left' || items === 'both') {
      bottleArt(s, 3, 4, '#5A2C1A', '#D8443A');
      bottleArt(s, 7, 5, '#F0EFEA', '#D8443A');
      s.rect(3, 14, 3, 4, '#C8C2B4'); s.rect(3, 14, 3, 1, '#6E6A60'); s.put(3, 15, '#E8E2D4');
    }
    if (items === 'right' || items === 'both') beerArt(s, 70, 5);
    if (p.glass) waterArt(s, 70, 15);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 9, contact: [40, 27, 38, 1.5] };
  };

  // Cadeiras no tamanho novo (20 × 43), no mesmo lugar da da V1 ampliada (o Chars desenha a de quem
  // está sentado; a vazia é o objeto `chair`). De lado: encosto à esquerda, assento para a direita.
  // De costas ('up'): o encosto na frente da pessoa.
  const CHAIR_ART = {
    okonomiyaki: { wood: LIGHTWOOD, cush: LEATHER },
    cafe: { wood: A.tones(['#8A5E2E', '#A87840', '#C49456', '#DCAE6E', '#ECC488', '#F6D8A6']), cush: A.tones(['#B8A47C', '#CDBB92', '#E2D0A8', '#EFE0BC', '#F8ECCE', '#FFF6DE']), slats: true }
  };
  const chairArts = {};
  function chairArt(dir, style) {
    style = typeof style === 'string' && CHAIR_ART[style] ? style : 'okonomiyaki';
    const key = style + '|' + dir;
    if (chairArts[key]) return chairArts[key];
    const k = CHAIR_ART[style], W = k.wood, C = k.cush, s = A.surface(20, 43);
    const wood = (x, y, t) => s.put(x, y, pick(W, t, x, y));
    if (dir === 'up') {
      // de costas: moldura, o estofado (ou as ripas) e os pés
      for (let y = 24; y < 38; y++) for (let x = 2; x < 18; x++) {
        const frame = x < 4 || x > 15 || y < 26 || y > 35;
        if (frame) { wood(x, y, (x < 4 ? 0.8 : x > 15 ? 0.3 : 0.6) + (y === 24 ? 0.25 : 0)); continue; }
        if (k.slats) { if ((x - 5) % 3 === 0) wood(x, y, 0.65); continue; }
        s.put(x, y, pick(C, 0.6 - (x - 4) / 12 * 0.35 - (y - 26) / 10 * 0.15 + (y === 26 ? 0.3 : 0), x, y));
      }
      if (k.slats) for (let x = 3; x < 17; x++) s.put(x, 37, pick(C, 0.7, x, 37));
      for (const lx of [4, 15]) for (let y = 38; y < 43; y++) wood(lx, y, lx === 4 ? 0.45 : 0.2);
    } else {
      // de lado (virada para a direita; para a esquerda, espelha)
      for (let y = 14; y < 36; y++) for (let x = 0; x < 3; x++) wood(x, y, 0.75 - x * 0.2 + (y === 14 ? 0.2 : 0));
      if (k.slats) { for (let y = 17; y < 30; y += 3) for (let x = 0; x < 4; x++) wood(x, y, 0.8); }
      else for (let y = 17; y < 29; y++) for (let x = 0; x < 4; x++) s.put(x, y, pick(C, 0.6 - x * 0.08 + (y === 17 ? 0.3 : 0), x, y));
      for (let y = 31; y < 34; y++) for (let x = 1; x < 17; x++) s.put(x, y, pick(C, 0.62 - x * 0.012 + (y === 31 ? 0.3 : 0) - (y === 33 ? 0.2 : 0), x, y));
      for (let x = 1; x < 17; x++) { wood(x, 34, 0.6); wood(x, 35, 0.35); }
      for (let y = 36; y < 42; y++) { wood(2, y, 0.6); wood(3, y, 0.35); wood(14, y, 0.45); wood(15, y, 0.25); }
    }
    s.outline(0.5);
    if (dir === 'left') {
      const m = A.surface(20, 43);
      for (let y = 0; y < 43; y++) for (let x = 0; x < 20; x++) { const c = s.get(x, y); if (c) m.put(19 - x, y, c); }
      return (chairArts[key] = m);
    }
    return (chairArts[key] = s);
  }

  // cadeira vazia (encosto alto: bloqueia a visão)
  props.chair.art = p => ({ spr: chairArt(p.dir === 'right' || p.dir === 'left' ? p.dir : 'up', p.style), dx: 0, dy: -1, base: 42, contact: [10, 42, 8, 1.5] });

  // banco comprido preto encostado na parede do fundo (estofado com gomos)
  props.bench.art = p => {
    const w = Math.round(p.w * 1.25), s = A.surface(w, 34);
    for (let y = 0; y < 30; y++) for (let x = 0; x < w; x++) {
      let t;
      if (y < 17) {
        const seg = (x % 37) / 37, nx = seg * 2 - 1;
        t = 0.5 + sphere(clamp1(nx * 0.9), clamp1((y - 7) / 10)) * 0.35 - 0.2;
        if (x % 37 === 0) t = 0.05;
      } else if (y < 26) t = 0.5 - (y - 17) / 9 * 0.25 + (y === 17 ? 0.35 : 0) + (y === 18 ? 0.15 : 0);
      else t = 0.08;
      s.put(x, y, pick(LEATHER, t + (vnoise(x, y, 5, 70) - 0.5) * 0.08, x, y));
    }
    for (let y = 30; y < 34; y++) for (let x = 0; x < w; x++) s.put(x, y, '#140F1E', (1 - (y - 30) / 4) * 0.45);
    return { spr: s, shadow: false };
  };

  // relógio de parede redondo
  props.clock.art = () => {
    const s = A.surface(18, 18);
    s.ellipse(9, 9, 9, 9, (x, y, nx, ny) => (nx * nx + ny * ny > 0.62 ? pick(A.tones(['#2A160E', '#3A2216', '#5A3824', '#7A5034']), sphere(nx, ny), x, y) : pick(A.tones(['#D8CFC0', '#ECE6DA', '#F8F4EC', '#FFFFFF']), sphere(nx, ny) + 0.2, x, y)));
    for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2; s.put(Math.round(9 + Math.cos(ang) * 5.2 - 0.5), Math.round(9 + Math.sin(ang) * 5.2 - 0.5), a % 3 ? '#B8B0A0' : '#4A4040'); }
    s.line(9, 9, 9, 5, '#2A2030'); s.line(9, 9, 12, 10, '#2A2030'); s.line(9, 9, 7, 13, '#C8323A');
    s.put(9, 9, '#2A2030');
    return { spr: s, shadow: false };
  };

  // tiras de cardápio penduradas (traços abstratos, sem texto de verdade)
  props.menuStrips.art = p => {
    const n = p.n || 6, s = A.surface(n * 11 + 2, 31);
    for (let i = 0; i < n; i++) {
      const x = i * 11;
      s.put(x + 4, 0, '#3A2216'); s.put(x + 4, 1, '#3A2216'); s.put(x + 5, 1, '#5A3824');
      for (let y = 2; y < 29; y++) for (let j = 0; j < 9; j++) s.put(x + j, y, pick(A.tones(['#D6C8A8', '#E8DCC0', '#F2EAD6', '#FAF4E6']), 0.75 - j * 0.05 - (y - 2) * 0.006 + (j === 0 ? 0.15 : 0), x + j, y));
      for (let j = 0; j < 9; j++) s.put(x + j, 28, '#C8B890');
      for (let q = 0; q < 7; q++) {
        const v = h01(i, q, 3);
        if (v < 0.75) { const len = 2 + Math.floor(h01(i, q, 4) * 3); for (let l = 0; l < len; l++) s.put(x + 3 + (q % 2) + l, 5 + q * 3, '#3A2A22'); }
      }
      if (i % 3 === 1) { s.rect(x + 3, 22, 3, 3, '#C8323A'); s.put(x + 3, 22, '#E85A5A'); }
    }
    return { spr: s, shadow: false };
  };

  // placa de madeira com o texto do config.js (p.text), na fonte nova
  props.sign.art = p => {
    const txt = Art.text(p.text || '', '#F6ECD2', { shadow: '#2A160C' }), w = txt.width + 14, s = A.surface(w + 2, 20);
    for (let y = 0; y < 18; y++) for (let x = 0; x < w; x++) {
      const edge = x === 0 || y === 0 || x === w - 1 || y === 17;
      s.put(x, y, edge ? '#2A160C' : pick(DARKWOOD, 0.62 - y * 0.02 + (vnoise(x * 0.2, y, 2, 71) - 0.5) * 0.3 + (y === 1 ? 0.3 : 0), x, y));
    }
    for (let y = 2; y < 20; y++) s.put(w, y, '#140F1E', 0.3);
    for (let x = 2; x <= w; x++) s.put(x, 18, '#140F1E', 0.3);
    s.draw(txt, 7, 4);
    return { spr: s, shadow: false };
  };

  // lanterna de papel vermelha (chochin), com o brilho na parede
  props.lantern.art = () => {
    const s = A.surface(30, 34), cx = 15, cy = 18, RED = A.tones(['#8E1A16', '#B82822', '#DA3A2E', '#F2624A', '#FF9A7A']);
    for (let y = 0; y < 34; y++) for (let x = 0; x < 30; x++) {
      const r = Math.hypot(x - cx, (y - cy) * 1.1);
      if (r < 15) s.tput(x, y, '#FFB070', Math.pow(1 - r / 15, 2) * 0.35);
    }
    s.line(cx, 3, cx, 8, '#2E190F');
    s.ellipse(cx, cy, 6, 9, (x, y, nx, ny) => {
      if (Math.abs(ny) > 0.8) return '#24140E';
      let c = pick(RED, sphere(nx, ny) + 0.15, x, y);
      if ((y - cy) % 3 === 0) c = mix(c, '#7A1612', 0.4);
      return c;
    });
    return { spr: s, dx: -10, dy: -4, shadow: false };
  };

  // porta da cozinha com noren azul-marinho (ondas brancas) e a cozinha escura lá dentro
  props.noren.art = () => {
    const s = A.surface(60, 55), NAVY = A.tones(['#16204A', '#1E2C5E', '#283A78', '#33489A', '#4A60B4']);
    for (let y = 0; y < 55; y++) for (let x = 0; x < 60; x++) {
      const frame = x < 4 || x > 55 || y < 3;
      if (frame) { s.put(x, y, pick(DARKWOOD, (x < 4 ? 0.7 - x * 0.1 : 0.4) + (y < 3 ? 0.1 : 0), x, y)); continue; }
      s.put(x, y, pick(A.tones(['#120A07', '#1C120C', '#2A1C14', '#3E2A1E']), 0.2 + (y - 3) / 52 * 0.5, x, y));
    }
    // a luz da cozinha lá no fundo
    for (let y = 34; y < 55; y++) for (let x = 6; x < 54; x++) s.tput(x, y, '#E8B070', (y - 34) / 21 * 0.25 + (bay(x, y) - 0.5) * 0.1);
    for (let p = 0; p < 3; p++) {
      const x0 = 6 + p * 16;
      for (let y = 4; y < 30; y++) for (let i = 0; i < 15; i++) {
        let c = pick(NAVY, 0.7 - i * 0.03 - (y - 4) * 0.01 + (i === 0 ? 0.2 : 0) - (i === 14 ? 0.25 : 0), x0 + i, y);
        // ondas brancas (seigaiha) numa faixa
        const wy = y - 15, wx = (i + (Math.floor(wy / 3) % 2) * 3) % 6;
        if (wy >= 0 && wy < 6 && (wy % 3 === 0 ? wx > 0 && wx < 5 : wx === 0 || wx === 5)) c = '#E8ECF6';
        s.put(x0 + i, y, c);
      }
    }
    return { spr: s, shadow: false };
  };

  // planta num vaso de barro (espada-de-são-jorge: folhas compridas com a borda amarela)
  props.plant.art = () => {
    const s = A.surface(23, 38), POT = A.tones(['#6E3420', '#8A4A30', '#A85A3A', '#C8724A', '#DA8C62', '#EAA67E']);
    const LEAVES = A.tones(['#1E4A2A', '#285A34', '#2E6A3E', '#3F8A4E', '#5DAA62', '#7CC47A']);
    [[11, 0, 0.2], [7, 4, -0.25], [15, 3, 0.35], [4, 9, -0.5], [18, 8, 0.55], [9, 2, -0.1], [13, 5, 0.12], [2, 14, -0.7], [20, 13, 0.7]].forEach(([tx, ty, lean], i) => {
      for (let y = ty; y < 26; y++) {
        const f = (y - ty) / (26 - ty), x = Math.round(tx + lean * (26 - y) * 0.15 + (11 - tx) * f * 0.9);
        const w = 1 + (f > 0.2 ? 1 : 0) + (f > 0.55 ? 1 : 0);
        for (let q = 0; q < w; q++) {
          const edge = q === 0 && f > 0.15;
          s.put(x + q, y, edge && i % 2 === 0 ? '#C8C860' : pick(LEAVES, 0.75 - q * 0.25 - f * 0.25 + (i % 2 ? -0.1 : 0.05), x + q, y));
        }
      }
    });
    for (let y = 24; y < 37; y++) {
      const half = y < 26 ? 8 : 7 - (y - 26) * 0.15;
      for (let x = Math.round(11.5 - half); x <= Math.round(11.5 + half); x++) {
        let t = 0.8 - (x - (11.5 - half)) / (2 * half) * 0.6;
        if (y < 26) t += 0.2;
        if (y === 26) t -= 0.25;
        s.put(x, y, pick(POT, t, x, y));
      }
    }
    for (let x = 6; x < 18; x++) s.put(x, 24, '#3A2014');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 37, contact: [11.5, 37, 7, 1.5] };
  };

  // ================= montagem =================

  // tamanho, colisão e bloqueio de visão de uma instância, já com a posição dela
  function geometry(p) {
    const def = props[p.type];
    if (!def) throw new Error('Objeto desconhecido: ' + p.type);
    const [w, h] = def.size(p);
    const abs = r => (r ? { x: p.x + r[0], y: p.y + r[1], w: r[2], h: r[3] } : null);
    return {
      def, w, h,
      solid: abs(def.solid ? def.solid(p) : null),
      sight: abs(def.sight ? def.sight(p) : null),
      z: p.y + (typeof def.base === 'function' ? def.base(p) : def.base !== undefined ? def.base : h)
    };
  }

  function render(p) {
    const g = geometry(p), cv = Gfx.canvas(g.w, g.h);
    if (g.def.draw) g.def.draw(cv.cx, p);
    return cv;
  }

  return {
    R, hash, glow, alpha, BAYER, props, geometry, render, planks, FLOORS, WALLS, EDGES,
    woodEdge, chairArt, planksArt, woodEdgeArt,
    // Fundo de um cenário: piso + parede do fundo + paredes laterais com as portas.
    // FLOORS[nome] é uma tábua ({ tones, seam, grain }) ou uma função (c, x, y, w, h, look).
    // WALLS[nome](c, x, w, h, look). A borda lateral é look.edge (ou look.edges.left/right).
    // Tudo fica recortado no próprio cenário, para nada vazar no cenário do lado.
    paintBase(c, ox, look) {
      c.save();
      c.beginPath();
      c.rect(ox, 0, 384, 192);
      c.clip();
      const wallH = look.wall.height, floor = FLOORS[look.floor];
      if (typeof floor === 'function') floor(c, ox, wallH, 384, 192 - wallH, look);
      else planks(c, ox, wallH, 384, 192 - wallH, floor, ox + 1);
      // sombra da parede no chão
      if (look.wall.shadow !== false) alpha(c, 0.25, () => R(ox, wallH, 384, 2, '#140F1E', c));
      WALLS[look.wall.style](c, ox, 384, wallH, look);
      const doors = look.doors || {}, [b0, b1] = look.bounds || [0, 384];
      ['left', 'right'].forEach(side => {
        const style = (look.edges && look.edges[side]) || look.edge || 'wood';
        EDGES[style](c, side === 'left' ? ox + b0 : ox + b1 - 4, wallH, doors[side] || null, side, look);
      });
      c.restore();
    }
  };
})();
