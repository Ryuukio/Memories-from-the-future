// Fase 3 ("Through the Seasons"): a cozinha dos aniversários e Shirakawa-go (A), a pista de esqui e
// o churrasco (B), Himeji e Nara (C). Pisos, paredes, bordas e objetos.
//
// V2 (etapa 4): tudo é desenhado no tamanho novo, com as ferramentas de art.js. Cada objeto guarda o
// tamanho, a colisão e a visão da V1 (coordenadas velhas; o Room.build amplia) e ganha um `art` com o
// desenho novo, mais abaixo (os que animam, `liveNew` ou `fxNew`); os pisos, paredes e bordas novos
// ficam em Art.floors/walls/edges. Nenhum cenário de outra fase usa o desenho da V1 daqui, que saiu.
(() => {
  const { props } = Scenery;

  // ---------- tamanho, colisão e visão dos objetos (V1; o desenho é o `art`, mais abaixo) ----------
  // A1 · a cozinha dos aniversários: na parede, as portas de correr, a estante de arame, o armário das
  // folhas de outono, a bancada e a faixa (texto do config); o armário branco, a mesa (p.cloth), a
  // torta com as velas (anima), o presente, a sacola, os balões (p.colors; animam), as luzinhas e os
  // brilhos (por cima de tudo), a pizza, o bolinho e os cartões
  props.slidingDoors = { layer: 'back', size: () => [44, 44] };
  props.wireShelf = { layer: 'back', size: () => [30, 44] };
  props.leafCabinet = { layer: 'back', size: () => [34, 44] };
  props.kitchenWall = { layer: 'back', size: () => [70, 44] };
  props.banner = { layer: 'back', size: p => [Gfx.textWidth(p.text || '') + 12, 16] };
  props.whiteCabinet = { size: () => [20, 44], solid: () => [0, 24, 20, 18], sight: () => [0, 6, 20, 36], base: 42 };
  props.partyTable = { size: () => [72, 46], solid: () => [4, 10, 64, 24], base: 36 };
  props.berryTart = { size: () => [20, 18], base: 30 };
  props.giftBox = { size: () => [14, 14], solid: () => [0, 6, 14, 8], base: 13 };
  props.stripedBag = { size: () => [12, 16], solid: () => [0, 8, 12, 7], base: 15 };
  props.balloons = { size: () => [24, 40], base: 40 };
  props.stringLights = { hidden: true, size: () => [1, 1] };
  props.sparkles = { hidden: true, size: () => [1, 1] };
  props.pizza = { size: () => [18, 14], base: 30 };
  props.smallCake = { size: () => [12, 14], base: 30 };
  props.cards = { size: () => [16, 10], base: 30 };

  // A2 · Shirakawa-go: casa gassho e santuário (tapam a visão), torii, árvore sem folhas (o tronco
  // tapa a visão) e a neve caindo
  props.gassho = { size: () => [64, 62], solid: () => [6, 40, 52, 20], sight: () => [4, 14, 56, 46], base: 60 };
  props.torii = { size: () => [44, 44], solid: () => [4, 38, 6, 4], base: 42 };
  props.shrine = { size: () => [40, 40], solid: () => [4, 24, 32, 14], sight: () => [4, 8, 32, 30], base: 38 };
  props.bareTree = { size: () => [30, 44], solid: () => [12, 36, 6, 6], sight: () => [12, 24, 6, 18], base: 42 };
  props.snowfall = { hidden: true, size: () => [1, 1] };

  // B1 · a pista de esqui: as cadeirinhas do teleférico (animam) e o pinheiro (tapa a visão)
  props.skiLift = { hidden: true, size: () => [1, 1] };
  props.pine = { size: () => [26, 40], solid: () => [9, 32, 8, 6], sight: () => [5, 10, 16, 28], base: 38 };

  // B2 · o churrasco: a churrasqueira (anima), a mesa comprida na vertical (p.h) e a caixa térmica
  props.grill = { size: () => [36, 34], solid: () => [2, 16, 32, 14], base: 30 };
  props.longTableV = { size: p => [30, p.h || 100], solid: p => [0, 4, 30, (p.h || 100) - 6], base: p => (p.h || 100) - 2 };
  props.cooler = { size: () => [18, 14], solid: () => [0, 4, 18, 10], base: 13 };

  // C · Himeji e Nara: a cerejeira (copa por cima de quem passa; o tronco tapa a visão), a lanterna de
  // pedra, as pétalas caindo, e quem anda desenhado por objeto (o barco a remo e os cervos)
  props.cherry = { size: () => [56, 64], solid: () => [24, 54, 8, 8], sight: () => [23, 40, 10, 22], base: 62 };
  props.stoneLantern = { size: () => [14, 26], solid: () => [2, 18, 10, 6], sight: () => [3, 6, 8, 18], base: 24 };
  props.petals = { hidden: true, size: () => [1, 1] };
  props.rowboat = { hidden: true, size: () => [1, 1] };
  props.deer = { hidden: true, size: () => [1, 1] };

  // ======================================================================
  //  V2 (art.js): tudo em coordenadas novas (480 × 240). Cada objeto guarda o tamanho, a colisão e a
  //  visão da V1 (acima) e ganha um `art` (ou `liveNew`/`fxNew`, se anima) com o desenho novo.
  // ======================================================================
  const A = Art, T = Art.tones, { pick, vnoise, sphere, bay, mix, clamp1 } = Art, h01 = Art.hash;
  const K = 1.25, kx = n => Math.round(n * K);
  const kit = Art.kit;
  const WHITE = T(['#9EA2B4', '#BCC0CC', '#D6D8DE', '#E8E8EA', '#F6F6F4', '#FFFFFF']);
  const BROWN = T(['#3A2214', '#4E2E1A', '#643C22', '#7A4C2C', '#8E5E38', '#A27046', '#B68456']);
  const DARKW = T(['#1E120A', '#2A1A10', '#3A2416', '#4C301E', '#5E3E28', '#704E34']);
  const CREAMK = T(['#C8B894', '#D6C8A6', '#E2D6B8', '#ECE2C8', '#F4ECD8', '#FAF4E6']);

  // ======================================================================
  //  A1 · aniversários: a cozinha do apartamento, duplicada (cada cópia ocupa meia tela), de dia;
  //  piso de madeira clara, parede creme com a moldura de madeira escura e a luminária redonda
  // ======================================================================
  const FLOORL = T(['#94693E', '#A6794A', '#B68A58', '#C49A66', '#D0A874', '#DAB684', '#E2C294', '#EACEA6']);
  Art.floors.aptWood = (S, look) => {
    const top = look.wall.height;
    Scenery.planksArt(S, 0, top, 480, 240 - top, { R: FLOORL, rh: 8, seed: 31, gloss: 0.1 });
    for (let y = top; y < top + 6; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#A89890', (1 - (y - top) / 6) * 0.75);
  };
  Art.walls.kitchen = (S, look) => {
    const h = look.wall.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < 480; x++) {
      let c;
      if (y < 4) c = pick(DARKW, y === 3 ? 0.2 : 0.55 - y * 0.08, x, y);
      else if (y === 4) c = BROWN[4];
      else if (y < h - 4) {
        let t = 0.62 + (vnoise(x, y, 5, 600) - 0.5) * 0.1 + (h01(x, y, 601) < 0.05 ? -0.08 : 0);
        // a luz das luminárias do teto, mais forte perto delas
        for (const lx of [120, 360]) t += Math.max(0, 1 - Math.hypot((x - lx) / 90, (y - 4) / 40)) * 0.35;
        c = pick(CREAMK, t, x, y);
      } else c = pick(DARKW, y === h - 4 ? 0.7 : 0.35 - (y - h + 3) * 0.08, x, y);
      // a divisa entre as duas cozinhas (as duas datas)
      if (x >= 238 && x < 243) c = pick(DARKW, 0.6 - (x - 238) * 0.1 + (x === 238 ? 0.2 : 0), x, y);
      S.put(x, y, c);
    }
  };

  // ---------- objetos da cozinha ----------
  // portas de correr de madeira marrom, fechadas (com a janelinha em cima)
  props.slidingDoors.art = () => {
    const s = A.surface(55, 55);
    for (let y = 0; y < 55; y++) for (let x = 0; x < 55; x++) {
      const frame = x < 2 || x > 52 || y < 2 || x === 27;
      let c;
      if (frame) c = pick(DARKW, x < 2 || y < 2 ? 0.7 : 0.35, x, y);
      else {
        const lx = x < 27 ? x - 2 : x - 28, inset = lx > 2 && lx < 22 && ((y > 9 && y < 26) || (y > 30 && y < 52));
        let t = 0.55 - lx / 25 * 0.2 + (vnoise(x * 0.3, y * 1.2, 3, 602) - 0.5) * 0.2;
        if (inset) t += (lx === 3 || y === 10 || y === 31) ? -0.2 : 0.08;
        if (y > 3 && y < 8 && lx > 4 && lx < 20) c = pick(T(['#C8CCC4', '#DCE0D8', '#F0F2EC']), 0.7, x, y);
        else c = pick(BROWN, t, x, y);
      }
      s.put(x, y, c);
    }
    s.rect(23, 30, 2, 7, DARKW[0]); s.rect(30, 30, 2, 7, DARKW[0]);
    return { spr: s, shadow: false };
  };

  // estante preta de arame com os cestos e a lava-louças branca
  props.wireShelf.art = () => {
    const s = A.surface(38, 55), WIRE = T(['#14141A', '#22222A', '#34343E', '#4A4A56']);
    for (const y of [2, 17, 32, 53]) for (let x = 0; x < 38; x++) { s.put(x, y, WIRE[2]); if (x % 3 === 0) s.put(x, y + 1, WIRE[1]); }
    for (let y = 0; y < 55; y++) { s.put(0, y, WIRE[3]); s.put(1, y, WIRE[1]); s.put(37, y, WIRE[1]); }
    // cestos (vime e preto), a lava-louças branca e umas caixinhas
    for (let y = 6; y < 16; y++) for (let x = 3; x < 17; x++) s.put(x, y, (x + y) % 3 === 0 ? '#8A6A3E' : pick(T(['#A8844E', '#C49E62', '#DAB478']), 0.7 - (y - 6) * 0.04, x, y));
    for (let y = 8; y < 16; y++) for (let x = 20; x < 35; x++) s.put(x, y, (x % 2 && y % 2) ? '#4A4A56' : '#1E1E26');
    for (let y = 20; y < 31; y++) for (let x = 4; x < 34; x++) s.put(x, y, pick(WHITE, 0.9 - (x - 4) / 30 * 0.3 - (y === 30 ? 0.2 : 0), x, y));
    s.rect(7, 23, 10, 1, '#8A929E'); s.rect(26, 22, 4, 2, '#5AA0E0');
    for (let y = 36; y < 52; y++) for (let x = 4; x < 34; x++) s.put(x, y, pick(T(['#A8B0BC', '#C4CAD4', '#DCE0E6']), 0.75 - (x - 4) / 30 * 0.3, x, y));
    s.rect(6, 40, 26, 1, '#7A808A');
    s.outline(0.5);
    return { spr: s, shadow: false };
  };

  // armário baixo marrom com o vaso escuro de folhas de outono
  props.leafCabinet.art = () => {
    const s = A.surface(43, 55);
    for (let y = 30; y < 55; y++) for (let x = 0; x < 43; x++) {
      let t = 0.55 - x / 43 * 0.2 + (y === 30 ? 0.35 : 0) + (x === 21 ? -0.35 : 0) + (vnoise(x * 0.3, y, 3, 603) - 0.5) * 0.15;
      if (y > 33 && y < 52 && (x === 3 || x === 39)) t -= 0.2;
      s.put(x, y, pick(BROWN, t, x, y));
    }
    s.rect(18, 40, 2, 4, '#C8A060'); s.rect(23, 40, 2, 4, '#C8A060');
    s.ellipse(21.5, 24, 5, 6.5, (x, y, nx, ny) => pick(T(['#1A1A22', '#2A2A36', '#3E3E4E', '#5A5A6E']), sphere(nx, ny) + 0.1, x, y));
    for (let q = 0; q < 26; q++) {
      const a = -Math.PI * (0.15 + h01(q, 1, 604) * 0.7), r = 5 + h01(q, 2, 604) * 13, lx = Math.round(21.5 + Math.cos(a) * r * 1.1), ly = Math.round(18 + Math.sin(a) * r);
      s.line(21, 18, lx, ly, '#4A2A1A');
      const col = ['#C8302A', '#E8602A', '#F2963A', '#B82A2A'][q % 4];
      s.ellipse(lx, ly, 2, 1.6, (x, y, nx, ny) => pick(A.ramp(col), sphere(nx, ny) + 0.1, x, y));
    }
    s.outline(0.5);
    return { spr: s, shadow: false };
  };

  // faixa "HAPPY BIRTHDAY" (texto do config): um varal com uma bandeirinha para cada letra (o espaço
  // vira um vão), a letra branca no meio de cada uma
  props.banner.art = p => {
    const chars = [...(p.text || '')], PW = 8, GAP = 4;
    const w = chars.reduce((n, ch) => n + (ch === ' ' ? GAP : PW), 4), s = A.surface(w + 2, 22);
    const cols = ['#D8443A', '#F2C14E', '#5DAA62', '#3A78C8', '#E888A8'];
    const sag = x => Math.round(2 + Math.sin(x / w * Math.PI) * 3);
    for (let x = 0; x < w + 2; x++) s.put(x, sag(x), '#8A6440');
    let x = 2, k = 0;
    for (const ch of chars) {
      if (ch === ' ') { x += GAP; continue; }
      const y0 = sag(x + 3) + 1, R = A.ramp(cols[k % 5]);
      for (let j = 0; j < 14; j++) for (let i = 0; i < 7; i++) if (j < 10 || Math.abs(i - 3) <= 13 - j) s.put(x + i, y0 + j, pick(R, 0.75 - i * 0.07 - j * 0.02 + (j === 0 ? 0.15 : 0), x + i, y0 + j));
      const letter = Art.text(ch, '#FFFFFF', { shadow: '#3A2A30' }), gw = letter.width - 2;
      s.draw(letter, x + Math.floor((7 - gw) / 2), y0 + 1);
      x += PW;
      k++;
    }
    return { spr: s, dx: -2, dy: 0, shadow: false };
  };

  // armário branco com a porta de vidro preta (os temperos lá dentro), a fritadeira elétrica e a
  // chaleira de vidro em cima
  props.whiteCabinet.art = () => {
    const s = A.surface(25, 55);
    for (let y = 18; y < 53; y++) for (let x = 0; x < 25; x++) s.put(x, y, pick(WHITE, 0.92 - x / 25 * 0.3 + (y === 18 ? 0.08 : 0), x, y));
    for (let y = 22; y < 50; y++) for (let x = 2; x < 13; x++) {
      let c = pick(T(['#0E0E14', '#18181E', '#24242C', '#34343E']), 0.3 + (Math.abs(x - (y - 22) * 0.3 - 3) < 1 ? 0.7 : 0), x, y);
      if ((y === 30 || y === 39) && x > 2 && x < 12) c = '#3A3A46';
      if (y > 26 && y < 30 && (x === 5 || x === 9)) c = ['#D8443A', '#E8A03A'][x % 2];
      s.put(x, y, c);
    }
    s.rect(15, 24, 7, 10, '#C8A070'); s.rect(15, 24, 7, 1, '#E0BC8A');
    // fritadeira (preta e prata) e a chaleira de vidro
    for (let y = 5; y < 18; y++) for (let x = 1; x < 12; x++) s.put(x, y, y < 9 ? pick(T(['#8A909A', '#B8BEC8', '#DCE0E6']), 0.8 - x * 0.04, x, y) : pick(T(['#18181E', '#2A2A32', '#3E3E48']), 0.6 - x * 0.04, x, y));
    s.rect(3, 12, 6, 1, '#5A5A66');
    for (let y = 7; y < 18; y++) for (let x = 14; x < 23; x++) s.put(x, y, pick(T(['#9ABCC8', '#C0DAE4', '#E2F0F6']), 0.7 - (x - 14) * 0.06 + (x === 15 ? 0.3 : 0), x, y), 0.85);
    s.rect(16, 5, 5, 2, '#5A5A66'); s.rect(23, 9, 1, 5, '#5A5A66');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 52, contact: [12.5, 52, 11, 1.5] };
  };

  // a bancada da direita (na parede): armários altos marrom-escuros, o azulejo creme, a coifa, a
  // janela clara e o fogão
  props.kitchenWall.art = () => {
    const s = A.surface(88, 55);
    for (let y = 9; y < 46; y++) for (let x = 0; x < 88; x++) {
      const tx = x % 7, ty = (y - 9) % 6;
      s.put(x, y, tx === 0 || ty === 0 ? '#CDBE9C' : pick(T(['#E2D4B4', '#ECE0C4', '#F6EED8']), 0.7 - (y - 9) * 0.006, x, y));
    }
    for (let y = 0; y < 13; y++) for (let x = 0; x < 42; x++) s.put(x, y, pick(DARKW, 0.6 - x / 42 * 0.2 + ((x === 20 || x === 21) ? -0.4 : 0) + (y === 12 ? -0.3 : 0), x, y));
    s.rect(17, 9, 2, 2, '#C8A060'); s.rect(23, 9, 2, 2, '#C8A060');
    // coifa de inox
    for (let y = 0; y < 17; y++) for (let x = 48; x < 76; x++) {
      if (y > 10 && (x < 48 + (y - 10) || x > 75 - (y - 10))) continue;
      s.put(x, y, pick(T(['#7A808A', '#9AA0AA', '#BCC2CC', '#DCE0E6']), 0.75 - (x - 48) / 28 * 0.4 + (y === 16 ? -0.3 : 0), x, y));
    }
    // a janela (claro lá fora) com a cortina
    for (let y = 17; y < 34; y++) for (let x = 5; x < 32; x++) {
      const frame = x === 5 || x === 31 || y === 17 || y === 33 || x === 18;
      s.put(x, y, frame ? '#F2F0EA' : pick(T(['#C4DCE8', '#DCECF4', '#F4FAFC', '#FFFFFF']), 0.6 + (y - 17) * 0.02 + (Math.abs(x - y - 2) < 2 ? 0.3 : 0), x, y));
    }
    // a bancada e o fogão
    for (let y = 44; y < 55; y++) for (let x = 0; x < 88; x++) s.put(x, y, y < 46 ? pick(T(['#9AA0AA', '#C4CAD4', '#E6EAF0']), y === 44 ? 0.9 : 0.4, x, y) : pick(DARKW, 0.45 - (x === 0 ? 0 : 0) + ((x - 1) % 22 === 0 ? -0.35 : 0), x, y));
    for (let x = 50; x < 74; x++) s.put(x, 43, '#1E1E24');
    [55, 67].forEach(cx => { s.put(cx, 42, '#3A3A44'); s.put(cx + 1, 42, '#3A3A44'); });
    s.outline(0.5);
    return { spr: s, shadow: false };
  };

  // Mesa de madeira escura vista de cima com as quatro cadeiras de assento creme (duas atrás, duas na
  // frente); p.cloth: a toalha (roxa, no aniversário da Ellen) caindo em babados na frente
  props.partyTable.art = p => {
    const s = A.surface(90, 58), CR = A.ramp('#EFE0BC');
    const chair = (x0, y0, backTop) => {
      for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) {
        const back = backTop ? y < 4 : y > 8;
        s.put(x0 + x, y0 + y, back ? pick(DARKW, 0.6 - x / 16 * 0.3 + (y === 0 ? 0.2 : 0), x0 + x, y0 + y) : pick(CR, 0.65 - x / 16 * 0.25 + (x === 0 || x === 15 ? -0.25 : 0), x0 + x, y0 + y));
      }
    };
    chair(12, 0, true); chair(62, 0, true);
    const cloth = p.cloth ? A.ramp(p.cloth) : null;
    for (let y = 12; y < 44; y++) for (let x = 5; x < 85; x++) {
      if (cloth) {
        const edge = y >= 41 && Math.sin((x - 5) * 0.8) < (y - 41) * 0.6 - 0.6;
        if (edge) continue;
        s.put(x, y, pick(cloth, 0.6 - x / 90 * 0.2 + (y === 12 ? 0.25 : 0) + (y > 39 ? -0.25 : 0) + (vnoise(x, y, 6, 605) - 0.5) * 0.1, x, y));
        continue;
      }
      const t = 0.5 + (vnoise(x * 0.2, y * 1.5, 3, 606) - 0.5) * 0.3 - x / 90 * 0.15 + (y === 12 ? 0.35 : 0) + (y >= 41 ? -0.35 : 0) + (y > 14 && y < 24 ? 0.08 : 0);
      s.put(x, y, pick(DARKW, t + 0.15, x, y));
    }
    chair(12, 45, false); chair(62, 45, false);
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 45, shadow: 'flat', H: 5 };
  };

  // Torta de frutas vermelhas com as velas "33": as chamas apagam quando o Fabio assopra e voltam a
  // acender sozinhas (a fumacinha sobe quando apagam)
  let tartImg = null;
  function tartArt() {
    if (tartImg) return tartImg;
    const s = A.surface(26, 16), CRUST = T(['#8A5A2A', '#A8763A', '#C8945A', '#DEB078', '#ECCA98']);
    s.ellipse(13, 9, 12.5, 6.5, (x, y, nx, ny) => {
      if (nx * nx + ny * ny > 0.62) return pick(CRUST, sphere(nx, ny) + 0.1, x, y);
      const r = h01(x, y, 607);
      if (r < 0.3) return ['#9A1A30', '#4A1A5A', '#C8283A'][Math.floor(r * 10)];
      return pick(T(['#6A0E20', '#8A1A2E', '#B02A3A', '#D04A50']), sphere(nx, ny) + 0.15, x, y);
    });
    // as velas "3" e "3" (azuis, com listras brancas)
    [8, 15].forEach(vx => { for (let y = 1; y < 9; y++) { s.put(vx, y, '#7AC0F8'); s.put(vx + 1, y, y % 3 === 0 ? '#FFFFFF' : '#4A90D8'); s.put(vx + 2, y, '#2A68B0'); } });
    s.outline(0.5);
    return (tartImg = s.canvas());
  }
  props.berryTart.liveNew = (ctx, p, world) => {
    const x = Math.round(p.x * K) - 1, y = Math.round(p.y * K) + 6;
    Gfx.shadow(x + 13, y + 15, 26, 5, 0.25);
    ctx.drawImage(tartArt(), x, y);
    const ph = world.t % 4.5, out = ph > 2.6 && ph < 3.3;
    [9, 16].forEach((vx, k) => {
      if (!out) {
        const fl = Math.sin(world.t * 18 + k) > 0 ? 1 : 0;
        ctx.globalAlpha = 0.35;
        Gfx.rect(x + vx - 1, y - 4 - fl, 3, 4, '#FFD880');
        ctx.globalAlpha = 1;
        Gfx.rect(x + vx, y - 3 - fl, 1, 3, '#F2A030');
        Gfx.rect(x + vx, y - 1, 1, 1, '#FFF4C8');
        Gfx.rect(x + vx, y - 2 - fl, 1, 1, '#FFE070');
      } else {
        ctx.globalAlpha = 0.7;
        Gfx.rect(x + vx + Math.round(Math.sin(world.t * 9) * 0.6), y - 3 - Math.round(((world.t * 8) % 4)), 1, 1, '#C8C8CC');
        ctx.globalAlpha = 1;
      }
    });
  };

  // presente azul com a fita amarela e a sacola listrada
  props.giftBox.art = () => {
    const s = A.surface(18, 18), B = A.ramp('#3A78C8'), Y = A.ramp('#F2C14E');
    for (let y = 5; y < 18; y++) for (let x = 0; x < 18; x++) {
      const top = y < 8, rib = x === 8 || x === 9 || y === 10 || y === 11;
      s.put(x, y, pick(rib ? Y : B, (top ? 0.85 : 0.55) - x / 18 * 0.3, x, y));
    }
    s.ellipse(6, 3, 3, 2.2, (x, y, nx, ny) => pick(Y, sphere(nx, ny) + 0.1, x, y));
    s.ellipse(12, 3, 3, 2.2, (x, y, nx, ny) => pick(Y, sphere(nx, ny) + 0.1, x, y));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 17, contact: [9, 17, 8, 1.2] };
  };
  props.stripedBag.art = () => {
    const s = A.surface(15, 20), RED = A.ramp('#D8443A');
    for (let y = 6; y < 20; y++) for (let x = 0; x < 15; x++) s.put(x, y, pick(x % 4 < 2 ? WHITE : RED, 0.85 - x / 15 * 0.3 - (y === 19 ? 0.2 : 0), x, y));
    for (let x = 3; x < 12; x++) s.put(x, 1 + Math.round(Math.abs(x - 7.5) * 0.6), '#8A6440');
    for (let y = 2; y < 7; y++) { s.put(3, y, '#8A6440'); s.put(11, y, '#8A6440'); }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 19, contact: [7.5, 19, 7, 1.2] };
  };

  // balões coloridos (sombreados como esfera, com o brilho) presos por fitas, balançando
  const balloonImgs = {};
  function balloonImg(col) {
    if (balloonImgs[col]) return balloonImgs[col];
    const s = A.surface(11, 14), R = A.ramp(col);
    s.ellipse(5.5, 6, 5, 6, (x, y, nx, ny) => pick(R, sphere(nx, ny) + 0.12, x, y));
    s.put(3, 3, '#FFFFFF'); s.put(4, 3, '#FFFFFF'); s.put(3, 4, '#FFFFFF');
    s.put(5, 12, R[2]); s.put(4, 13, R[1]); s.put(6, 13, R[1]);
    s.outline(0.5);
    return (balloonImgs[col] = s.canvas());
  }
  props.balloons.liveNew = (ctx, p, world) => {
    const cols = p.colors || ['#D8443A', '#3A78C8', '#F2C14E'], X = p.x * K, Y = p.y * K;
    const ax = Math.round(X + 12), ay = Math.round(Y + 49);
    Gfx.shadow(ax, ay, 8, 3, 0.25);
    cols.forEach((col, i) => {
      const sway = Math.sin(world.t * 1.4 + i * 2 + p.x) * 2.5;
      const bx = Math.round(X + 2 + i * 9 + sway), by = Math.round(Y + 2 + (i % 2) * 6);
      for (let k = 0; k <= 22; k++) {
        const u = k / 22, sx = Math.round(bx + 5 + (ax - bx - 5) * u), sy = Math.round(by + 14 + (ay - by - 14) * u);
        Gfx.rect(sx, sy, 1, 1, '#E8E0D0');
      }
      ctx.drawImage(balloonImg(col), bx, by);
    });
    Gfx.rect(ax - 1, ay - 2, 3, 2, '#8A8478');
  };

  // luzinhas coloridas na parede, piscando (por cima de tudo)
  props.stringLights.fxNew = (ctx, p, world) => {
    const w = (p.w || 160) * K, X = p.x * K, Y = p.y * K;
    const wire = i => Math.round(Math.sin(i / w * Math.PI * 3) * 4);
    for (let i = 0; i <= w; i++) Gfx.rect(X + i, Y + wire(i), 1, 1, '#2A2830');
    for (let i = 5, k = 0; i < w; i += 11, k++) {
      const on = Math.sin(world.t * 3 + k * 1.7) > -0.2, col = ['#F2C14E', '#F07AA8', '#5DD0F0', '#8AD060'][k % 4];
      const y = Y + wire(i) + 1;
      if (on) { ctx.globalAlpha = 0.3; Gfx.rect(X + i - 2, y - 1, 6, 5, col); ctx.globalAlpha = 1; }
      Gfx.rect(X + i, y, 2, 3, on ? col : '#5E5A60');
      if (on) Gfx.rect(X + i, y, 1, 1, '#FFFFFF');
    }
  };
  // brilhos dos enfeites (aniversário da Ellen)
  props.sparkles.fxNew = (ctx, p, world) => {
    for (let i = 0; i < 12; i++) {
      const x = Math.round((p.x + h01(i, 1, 608) * (p.w || 150)) * K), y = Math.round((p.y + h01(i, 2, 608) * (p.h || 30)) * K);
      const tw = Math.sin(world.t * 4 + i * 2.3);
      if (tw < 0.5) continue;
      Gfx.rect(x, y - 1, 1, 3, '#FFF4C8'); Gfx.rect(x - 1, y, 3, 1, '#FFF4C8');
      if (tw > 0.85) { Gfx.rect(x, y - 2, 1, 5, '#FFFBE8'); Gfx.rect(x - 2, y, 5, 1, '#FFFBE8'); }
    }
  };

  // pizza grande, bolinho decorado e cartões (na mesa da Ellen)
  props.pizza.art = () => {
    const s = A.surface(23, 18);
    s.ellipse(11.5, 9, 11, 8.5, (x, y, nx, ny) => {
      const d = nx * nx + ny * ny;
      if (d > 0.7) return pick(T(['#8A4A1A', '#B06A2A', '#C8823A', '#E0A458']), sphere(nx, ny) + 0.1, x, y);
      return pick(T(['#D8A040', '#E8B858', '#F2CC78', '#FADCA0']), sphere(nx * 0.5, ny * 0.5) + (h01(x, y, 609) - 0.5) * 0.4, x, y);
    });
    [[7, 6], [14, 5], [10, 11], [16, 11], [6, 12], [12, 8]].forEach(([cx, cy]) => s.ellipse(cx, cy, 1.8, 1.5, (x, y, nx, ny) => pick(T(['#8A1A14', '#B82A1E', '#D8443A']), sphere(nx, ny), x, y)));
    [[9, 4], [17, 8], [5, 9]].forEach(([x, y]) => s.put(x, y, '#3A8A3A'));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: false };
  };
  props.smallCake.art = () => {
    const s = A.surface(15, 18), PINK = A.ramp('#F2A7BE');
    for (let y = 8; y < 17; y++) for (let x = 1; x < 14; x++) s.put(x, y, y < 11 ? pick(PINK, 0.8 - x * 0.03, x, y) : pick(WHITE, 0.9 - x / 14 * 0.3, x, y));
    for (let x = 1; x < 14; x += 2) s.put(x, 11, PINK[3]);
    s.ellipse(7.5, 7, 4, 2.5, (x, y, nx, ny) => pick(PINK, sphere(nx, ny) + 0.2, x, y));
    s.ellipse(7.5, 4, 2, 2, (x, y, nx, ny) => pick(T(['#8A1A14', '#C8302A', '#F06A5A']), sphere(nx, ny) + 0.1, x, y));
    s.put(7, 1, '#3A8A3A');
    [[3, 13, '#5DD0F0'], [10, 14, '#F2C14E'], [6, 15, '#9A6AD8']].forEach(([x, y, c]) => s.put(x, y, c));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: false };
  };
  props.cards.art = () => {
    const s = A.surface(20, 13);
    [[0, 3, '#F4F0E6', '#E888A8'], [6, 0, '#CFE6F4', '#3A78C8'], [11, 5, '#F6E68A', '#D8443A']].forEach(([x0, y0, c, a]) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 9; x++) s.put(x0 + x, y0 + y, pick(A.ramp(c), 0.8 - x * 0.04 - (y === 6 ? 0.2 : 0), x0 + x, y0 + y));
      for (let x = 2; x < 7; x++) s.put(x0 + x, y0 + 2, a);
    });
    [[13, 7], [15, 7], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [13, 9], [14, 9], [15, 9], [14, 10]].forEach(([x, y]) => s.put(x, y, '#D8443A'));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: false };
  };

  // ======================================================================
  //  A2 · Shirakawa-go numa manhã de sol: neve com as sombras azuis, o caminho de neve pisada com as
  //  folhas secas, as montanhas nevadas e a mata de cedros; casas gassho, torii e santuário de madeira
  //  sem pintura, árvores sem folhas com neve nos galhos
  // ======================================================================
  const SNOW = T(['#7E8EBC', '#94A4CC', '#AAB8DA', '#C0CCE6', '#D4DEF0', '#E6EEF8', '#F4F8FE', '#FFFFFF']);
  const TRAMPLED = T(['#8892AE', '#9CA6C0', '#B0BAD0', '#C4CCDE', '#D6DCE8', '#E4E8F0']);
  const CEDAR = T(['#14261E', '#1C3428', '#244232', '#2E523E', '#3A644C', '#4A785C']);
  const RAWWOOD = T(['#3E3026', '#54423A', '#6A5648', '#806A58', '#968070', '#AC9886']);

  // neve fofa com ondulações (o lado de cima de cada monte mais claro) e brilhinhos; o caminho
  // (look.path) de neve pisada, mais acinzentado, com pegadas, as bordas de neve e folhas secas
  function snowField(S, x0, y0, w, h, seed, path) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const n = vnoise(x, y, 22, seed), up = vnoise(x, y - 2, 22, seed);
      let t = 0.72 + (n - 0.5) * 0.25 + (up - n) * 2.2 + (vnoise(x, y, 5, seed + 1) - 0.5) * 0.1;
      if (path && y >= path[0] && y < path[1]) {
        const e = Math.min(y - path[0], path[1] - 1 - y);
        let u = 0.5 + (vnoise(x, y, 7, seed + 2) - 0.5) * 0.4 + (h01(x, y, seed + 3) - 0.5) * 0.2;
        if (e < 3) u += e === 0 ? -0.35 : -0.15;
        S.put(x, y, pick(TRAMPLED, u, x, y));
        continue;
      }
      if (path && (y === path[0] - 1 || y === path[1])) t += y === path[1] ? 0.25 : -0.3;
      let c = pick(SNOW, t, x, y);
      if (h01(x, y, seed + 4) < 0.004) c = '#FFFFFF';
      S.put(x, y, c);
    }
  }
  Art.floors.snow = (S, look) => {
    const top = look.wall.height, path = look.path;
    snowField(S, 0, top, 480, 240 - top, 610, path);
    if (path) {
      // pegadas no caminho e as folhas secas espalhadas
      for (let q = 0; q < 70; q++) {
        const fx = Math.floor(h01(q, 1, 611) * 476), fy = Math.floor(path[0] + 4 + h01(q, 2, 611) * (path[1] - path[0] - 8));
        S.put(fx, fy, TRAMPLED[1]); S.put(fx + 1, fy, TRAMPLED[1]); S.put(fx, fy + 1, TRAMPLED[2]); S.put(fx + 1, fy + 1, TRAMPLED[2]);
      }
    }
    for (let q = 0; q < 90; q++) {
      const lx = Math.floor(h01(q, 3, 612) * 478), ly = Math.floor(top + 4 + h01(q, 4, 612) * (236 - top));
      const c = ['#A8642A', '#C88040', '#8A4A22', '#D89A50'][q % 4];
      S.put(lx, ly, c); if (q % 3) S.put(lx + 1, ly, mix(c, '#5A3018', 0.3));
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#A8B4D4', (1 - (y - top) / 5) * 0.7);
  };

  // céu de inverno limpo, as montanhas nevadas (sombras azuis do lado direito) e a mata de cedros
  // com neve no pé do morro
  function snowMountains(S, H, seed, ridge, far) {
    for (let x = 0; x < 480; x++) {
      const top = Math.round(ridge(x));
      for (let y = top; y < H; y++) {
        const slope = ridge(x + 2) - ridge(x - 2);   // > 0: descendo para a direita (lado da sombra)
        let t = 0.72 - (y - top) * 0.01 - Math.max(-0.3, Math.min(0.3, slope * 0.2)) + (vnoise(x, y, 4, seed) - 0.5) * 0.12;
        let c = pick(SNOW, t + (far ? 0.05 : 0), x, y);
        // a mata aparecendo na neve, mais embaixo
        if (y - top > 6 && vnoise(x, y, 3, seed + 1) > 0.55 - (y - top) * 0.012) c = pick(far ? T(['#5A6A8A', '#6A7A98', '#7C8CA8']) : CEDAR, 0.4 + (vnoise(x, y, 2, seed + 2) - 0.5) * 0.6, x, y);
        S.put(x, y, c);
      }
    }
  }
  function cedarRow(S, base, seed, hmin, hmax, R, snowy) {
    for (let x = -6, q = 0; x < 490; x += 5 + Math.floor(h01(q, 1, seed) * 5), q++) {
      const hh = hmin + Math.floor(h01(q, 2, seed) * (hmax - hmin)), top = base - hh;
      for (let y = top; y < base; y++) {
        const half = Math.max(0.5, (y - top) * 0.32 + ((y - top) % 4 === 3 ? 1 : 0));
        for (let i = Math.round(x - half); i <= Math.round(x + half); i++) {
          const left = i < x;
          let c = pick(R, 0.45 + (left ? 0.2 : -0.1) + (vnoise(i, y, 2, seed + 3) - 0.5) * 0.4, i, y);
          if (snowy && (y - top) % 4 < 2 && left === (h01(i, y, seed + 4) < 0.75)) c = pick(SNOW, left ? 0.95 : 0.55, i, y);
          S.put(i, y, c);
        }
      }
    }
  }
  Art.walls.snowHills = (S, look) => {
    const H = look.wall.height, SKYW = T(['#3E7AC8', '#4A88D0', '#5A96D8', '#6CA4DE', '#80B2E4', '#96C0E8', '#AECEEC', '#C6DCEE']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYW, y / (H - 6) + (vnoise(x, y, 40, 613) - 0.5) * 0.05, x, y));
    snowMountains(S, H, 614, x => 8 + vnoise(x, 0, 60, 615) * 12 + Math.abs(Math.sin(x * 0.012 + 1)) * 6, true);
    snowMountains(S, H, 616, x => 18 + vnoise(x, 0, 44, 617) * 10 + (vnoise(x, 0, 9, 618) - 0.5) * 3, false);
    cedarRow(S, H - 1, 619, 8, 15, CEDAR, true);
    for (let x = 0; x < 480; x++) { S.put(x, H - 1, SNOW[4]); S.put(x, H - 2, mix(S.get(x, H - 2), '#FFFFFF', 0.5)); }
  };

  // cedros nevados nas laterais (com a passagem)
  Art.edges.snowTrees = (S, x, top, gap, side) => {
    const segs = gap ? [[top - 8, gap[0]], [gap[1], 244]] : [[top - 8, 244]];
    const cx = side === 'left' ? x + 2 : x + 3;
    segs.forEach(([a, b]) => {
      for (let y0 = a - 4, q = 0; y0 < b - 6; y0 += 9, q++) {
        for (let j = 0; j < 14; j++) {
          const y = y0 + j;
          if (y < a || y >= b) continue;
          const half = 1 + j * 0.45 + (j % 5 === 4 ? 1 : 0);
          for (let i = Math.round(cx - half); i <= Math.round(cx + half); i++) {
            const left = i < cx;
            let c = pick(CEDAR, 0.4 + (left ? 0.25 : -0.1) + (vnoise(i, y, 2, 620) - 0.5) * 0.4, i, y);
            if (j % 5 < 2 && left) c = pick(SNOW, 0.9, i, y);
            S.put(i, y, c);
          }
        }
      }
      if (b < 240) for (let i = -4; i < 9; i++) for (let j = 0; j < 3; j++) S.mul(cx + i, b + j, '#A8B4D4', 0.6 - j * 0.2);
    });
  };

  // ---------- objetos de Shirakawa-go ----------
  // Casa gassho (de frente para a empena): o telhado de palha íngreme em A, grosso, com a neve por
  // cima; dentro do A, a empena de tábuas com as janelinhas; embaixo, o térreo de madeira escura com
  // as janelas de papel (p.light: acesas por dentro) e a neve amontoada no pé
  const THATCH = T(['#4A3420', '#644628', '#7E5A32', '#98703E', '#B0884E', '#C4A064']);
  props.gassho.art = p => {
    const s = A.surface(82, 80), cx = 41, eave = 54;
    // o térreo
    for (let y = eave - 4; y < 76; y++) for (let x = 7; x < 75; x++) {
      const post = (x - 7) % 17 < 2;
      let c = post ? pick(DARKW, 0.6 - ((x - 7) % 17) * 0.3, x, y) : pick(RAWWOOD, 0.4 - (x - 7) / 68 * 0.15 + (vnoise(x * 0.3, y, 2, 621) - 0.5) * 0.2, x, y);
      const lx = (x - 7) % 17;
      if (!post && y > eave + 2 && y < eave + 12 && lx > 3 && lx < 15) {
        const pane = (lx - 4) % 4 === 3 || (y - eave - 3) % 4 === 3;
        c = pane ? '#3A2A20' : p.light ? pick(T(['#E8B060', '#F6CC80', '#FFE6AC']), 0.7 - (y - eave) * 0.04, x, y) : pick(T(['#C8C0AC', '#DCD6C4', '#EEEADA']), 0.7, x, y);
      }
      if (x >= 36 && x < 46 && y > eave + 4) c = pick(T(['#140E0A', '#1E1610', '#2A2016']), 0.4, x, y);
      s.put(x, y, c);
    }
    // a empena (dentro do A): tábuas e as janelinhas dos sótãos
    for (let y = 8; y < eave; y++) {
      const half = (y - 4) * 0.72 - 6;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        let c = pick(RAWWOOD, 0.5 - (x - cx + half) / (2 * half + 1) * 0.25 + ((x - cx) % 5 === 0 ? -0.2 : 0), x, y);
        const win = (y > 22 && y < 28 && Math.abs(x - cx) < 6) || (y > 36 && y < 43 && Math.abs(x - cx) < 14 && Math.abs(x - cx) > 2);
        if (win) c = (x + y) % 3 === 0 ? '#3A2A20' : p.light ? '#F6CC80' : '#DCD6C4';
        s.put(x, y, c);
      }
    }
    // o telhado de palha (a faixa grossa nas duas águas) com a neve por cima
    for (let y = 0; y < eave + 3; y++) {
      const half = y * 0.76;
      for (let x = Math.round(cx - half - 1); x <= Math.round(cx + half + 1); x++) {
        const d = half - Math.abs(x - cx);     // distância da borda de fora
        if (d < -1) continue;
        const inner = y > 8 ? (y - 4) * 0.72 - 6 : -1;
        if (Math.abs(x - cx) < inner && y < eave) continue;
        let c;
        if (d < 3.5 && y < eave - 1) c = pick(SNOW, (x < cx ? 0.95 : 0.6) - (d < 0.5 ? 0.1 : 0), x, y);   // a neve por cima
        else c = pick(THATCH, 0.55 + (x < cx ? 0.15 : -0.15) + (h01(x, y, 622) - 0.5) * 0.5 + (y >= eave ? -0.25 : 0), x, y);
        s.put(x, y, c);
      }
    }
    // a beira do telhado (beiral) com a neve e os pingentes de gelo
    for (let x = 0; x < 82; x++) {
      s.put(x, eave - 1, pick(SNOW, 0.9 - x / 82 * 0.3, x, eave - 1));
      s.put(x, eave, pick(SNOW, 0.75 - x / 82 * 0.3, x, eave));
      if (x % 5 === 2) { s.put(x, eave + 3, '#DCEAF8'); s.put(x, eave + 4, '#C4DAF0'); }
    }
    for (let x = 0; x < 82; x++) for (let y = eave + 1; y < eave + 3; y++) s.put(x, y, pick(THATCH, 0.3, x, y));
    // neve amontoada no pé da casa
    for (let x = 4; x < 78; x++) {
      const hgt = 3 + Math.round(Math.sin(x * 0.3) + vnoise(x, 0, 6, 623) * 2);
      for (let y = 77 - hgt; y < 78; y++) s.put(x, y, pick(SNOW, 0.85 - (y - (77 - hgt)) * 0.08 - x / 82 * 0.2, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: -1, dy: -2, base: 77, contact: [41, 77, 37, 2] };
  };

  // torii de madeira natural (tronco sem pintura), com a neve nas duas vigas
  props.torii.art = () => {
    const s = A.surface(56, 56);
    for (const px of [7, 43]) for (let y = 12; y < 54; y++) for (let i = 0; i < 6; i++) s.put(px + i, y, pick(RAWWOOD, 0.85 - i * 0.14 + (vnoise(px + i, y * 0.3, 2, 624) - 0.5) * 0.2, px + i, y));
    for (let y = 18; y < 22; y++) for (let x = 3; x < 53; x++) s.put(x, y, pick(RAWWOOD, 0.7 - (y - 18) * 0.15, x, y));
    for (let y = 5; y < 11; y++) for (let x = 0; x < 56; x++) s.put(x, y, pick(RAWWOOD, 0.8 - (y - 5) * 0.1 - x / 56 * 0.15, x, y));
    for (let y = 11; y < 18; y++) for (let x = 25; x < 31; x++) s.put(x, y, pick(RAWWOOD, 0.75 - (x - 25) * 0.1, x, y));
    // a neve: um travesseiro grosso em cima da viga de cima e um fino na de baixo
    for (let x = 0; x < 56; x++) {
      const hgt = 4 + Math.round(Math.sin(x * 0.2) * 0.8);
      for (let y = 5 - hgt; y < 6; y++) s.put(x, y, pick(SNOW, 0.95 - (y - 5 + hgt) * 0.05 - x / 56 * 0.25, x, y));
      if (x > 3 && x < 53) { s.put(x, 17, pick(SNOW, 0.9 - x / 56 * 0.2, x, 17)); s.put(x, 16, pick(SNOW, 0.95, x, 16), x % 3 ? 1 : 0); }
    }
    for (const px of [7, 43]) for (let x = px - 2; x < px + 8; x++) { s.put(x, 53, SNOW[5]); s.put(x, 54, SNOW[4]); }
    s.outline(0.5);
    return { spr: s, dx: -1, dy: -2, base: 54, contact: [28, 54, 26, 1.5] };
  };

  // santuário pequeno de madeira com a porta de treliça, o telhado coberto de neve grossa e a base de
  // pedra (como o da foto)
  props.shrine.art = () => {
    const s = A.surface(50, 50), STONE = T(['#5A5A5E', '#6E6E72', '#848488', '#9A9A9E', '#B0B0B2']);
    for (let y = 42; y < 49; y++) for (let x = 2; x < 48; x++) s.put(x, y, pick(STONE, 0.65 - (y - 42) * 0.06 + ((x - 2) % 11 === 0 ? -0.3 : 0) + (h01(x, y, 625) - 0.5) * 0.2, x, y));
    for (let y = 22; y < 42; y++) for (let x = 8; x < 42; x++) {
      let c = pick(RAWWOOD, 0.55 - (x - 8) / 34 * 0.25 + ((x - 8) % 6 === 0 ? -0.2 : 0), x, y);
      if (x > 17 && x < 33 && y > 25 && y < 40) c = ((x - 18) % 3 === 0 || (y - 26) % 3 === 0) ? pick(DARKW, 0.4, x, y) : pick(T(['#1A120C', '#2A1E14']), 0.5, x, y);
      if (x > 10 && x < 16 && y > 26 && y < 33) c = '#E8E2D0';
      s.put(x, y, c);
    }
    // o telhado: a beira de madeira e a neve grossa e arredondada em cima
    for (let y = 16; y < 23; y++) for (let x = 3; x < 47; x++) s.put(x, y, pick(DARKW, 0.55 - (y - 16) * 0.05, x, y));
    s.ellipse(25, 12, 24, 10, (x, y, nx, ny) => (y > 18 ? null : pick(SNOW, sphere(nx, ny) + 0.15, x, y)));
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 48, contact: [25, 48, 22, 1.5] };
  };

  // árvore sem folhas: tronco cinza-amarronzado, galhos finos que se dividem e a neve por cima deles
  props.bareTree.art = p => {
    const s = A.surface(40, 56), BARK = T(['#3A2E28', '#4E4038', '#625448', '#786858', '#8C7C6A']), seed = 626 + (p.x | 0);
    for (let y = 22; y < 54; y++) for (let i = 0; i < 4; i++) s.put(18 + i, y, pick(BARK, 0.75 - i * 0.18 + (vnoise(i, y, 2, seed) - 0.5) * 0.2, 18 + i, y));
    const branch = (x0, y0, ang, len, w, depth) => {
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
      if (w > 1) s.limb(x0, y0, x1, y1, w, BARK, 0); else s.line(x0, y0, x1, y1, BARK[2]);
      // a neve em cima do galho
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let q = 0; q <= n; q++) { const u = q / n, bx = Math.round(x0 + (x1 - x0) * u), by = Math.round(y0 + (y1 - y0) * u) - Math.ceil(w / 2); if (Math.abs(Math.cos(ang)) > 0.35) s.put(bx, by, pick(SNOW, 0.9, bx, by)); }
      if (depth > 0) {
        branch(x1, y1, ang - 0.45 - h01(depth, x0 | 0, seed) * 0.3, len * 0.68, Math.max(1, w - 1), depth - 1);
        branch(x1, y1, ang + 0.4 + h01(depth, y0 | 0, seed + 1) * 0.3, len * 0.62, Math.max(1, w - 1), depth - 1);
      }
    };
    branch(20, 26, -Math.PI / 2 - 0.5, 11, 3, 2);
    branch(20, 24, -Math.PI / 2 + 0.55, 11, 3, 2);
    branch(20, 22, -Math.PI / 2, 9, 2, 2);
    for (let x = 12; x < 29; x++) { s.put(x, 54, SNOW[5]); s.put(x, 55, SNOW[4]); }
    s.outline(0.5);
    return { spr: s, dx: -1, dy: -1, base: 54, contact: [20, 54, 7, 1.5] };
  };

  // neve caindo de leve, brilhando no sol (por cima de tudo)
  props.snowfall.fxNew = (ctx, p, world) => {
    const X = p.x * K, t = world.t;
    for (let i = 0; i < 52; i++) {
      const x = Math.round(X + (h01(i, 1, 627) * 480 + Math.sin(t * 0.8 + i) * 7) % 480);
      const y = Math.round((h01(i, 2, 627) * 240 + t * (16 + (i % 5) * 3)) % 240);
      const big = i % 6 === 0;
      ctx.globalAlpha = big ? 0.95 : 0.75;
      Gfx.rect(x, y, big ? 2 : 1, big ? 2 : 1, '#FFFFFF');
      if (big && Math.sin(t * 5 + i) > 0.8) { Gfx.rect(x - 1, y, 4, 1, '#F4FAFF'); Gfx.rect(x, y - 1, 1, 4, '#F4FAFF'); }
    }
    ctx.globalAlpha = 1;
  };

  // ======================================================================
  //  B1 · a pista de esqui numa tarde de céu limpo: a pista batida com as listras da máquina e os
  //  rastros dos esquis, as varetas laranja nas bordas, a neve fofa dos lados, os picos nevados com
  //  as pedras e o teleférico de cadeirinhas lá no alto
  // ======================================================================
  Art.floors.ski = (S, look) => {
    const top = look.wall.height, [s0, s1] = look.slope || [0, 0];
    snowField(S, 0, top, 480, 240 - top, 630, null);
    for (let y = top; y < 240; y++) for (let x = s0; x < s1; x++) {
      // listras da máquina (veludo) e um leve degradê para baixo
      let t = 0.62 + ((x - s0) % 3 === 0 ? -0.12 : (x - s0) % 3 === 1 ? 0.06 : 0) + (vnoise(x, y, 18, 631) - 0.5) * 0.12 + (y - top) / 240 * 0.1;
      // rastros dos esquis em S
      for (let k = 0; k < 4; k++) {
        const cx = s0 + (s1 - s0) * (0.2 + k * 0.2) + Math.sin(y * 0.05 + k * 1.7) * 18;
        if (Math.abs(x - cx) < 0.7 || Math.abs(x - cx - 3) < 0.7) t -= 0.18;
      }
      S.put(x, y, pick(SNOW, t, x, y));
    }
    // as bordas da pista (a neve fofa amontoada) e as varetas laranja
    for (let y = top; y < 240; y++) for (const [ex, d] of [[s0, -1], [s1 - 1, 1]]) {
      S.put(ex, y, pick(SNOW, 0.45, ex, y));
      S.put(ex + d, y, pick(SNOW, d < 0 ? 0.95 : 0.6, ex + d, y));
    }
    for (let y = top + 6; y < 240; y += 18) for (const [ex, off] of [[s0 - 3, 0], [s1 + 2, 9]]) {
      const py = y + off;
      for (let j = 0; j < 10; j++) { S.put(ex, py - j, j % 4 < 2 ? '#F06A2A' : '#FFFFFF'); S.put(ex + 1, py - j, j % 4 < 2 ? '#B84A1A' : '#C8D0E0'); }
      S.put(ex + 1, py + 1, SNOW[1]); S.put(ex + 2, py + 1, SNOW[2]);
    }
  };

  // céu de inverno, os picos nevados com as pedras aparecendo, a mata de pinheiros no pé e o cabo do
  // teleférico com as torres (as cadeirinhas passam no fxNew do skiLift)
  const LIFT_Y = 10;
  Art.walls.skiMountains = (S, look) => {
    const H = look.wall.height, SKYW = T(['#2E66C0', '#3A74C8', '#4682D0', '#5490D8', '#64A0DE', '#78AEE4', '#8EBCE8', '#A8CCEC']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYW, y / (H - 4) + (vnoise(x, y, 40, 632) - 0.5) * 0.05, x, y));
    // picos (triângulos com a crista torta), pedra escura aparecendo do lado da sombra
    const peaks = [[40, 4, 70], [150, 1, 80], [270, 6, 64], [380, 2, 84], [470, 8, 60]];
    for (let x = 0; x < 480; x++) {
      let top = H, side = 0;
      peaks.forEach(([px, py, hw]) => { const yy = py + Math.abs(x - px) / hw * (H - py) * 1.1 + (vnoise(x, 0, 6, 633) - 0.5) * 3; if (yy < top) { top = yy; side = x > px ? 1 : -1; } });
      for (let y = Math.max(0, Math.round(top)); y < H; y++) {
        let t = (side > 0 ? 0.42 : 0.88) - (y - top) * 0.008 + (vnoise(x, y, 4, 634) - 0.5) * 0.15;
        let c = pick(SNOW, t, x, y);
        if (side > 0 && vnoise(x, y, 3, 635) > 0.66 && y - top < 14) c = pick(T(['#3A3E4E', '#4E5262', '#646878']), 0.5 + (h01(x, y, 636) - 0.5) * 0.5, x, y);
        S.put(x, y, c);
      }
    }
    cedarRow(S, H, 637, 6, 11, CEDAR, true);
    // o cabo e as torres do teleférico
    for (let x = 0; x < 480; x++) { S.put(x, LIFT_Y, '#2A2C36'); if (x % 2) S.put(x, LIFT_Y + 1, '#4A4E5C', 0.5); }
    [40, 200, 360].forEach(tx => {
      for (let y = LIFT_Y - 2; y < H; y++) { S.put(tx, y, '#6A707C'); S.put(tx + 1, y, '#4A4E5A'); S.put(tx + 2, y, '#34363E'); }
      for (let x = tx - 6; x < tx + 9; x++) { S.put(x, LIFT_Y - 2, '#5A606C'); S.put(x, LIFT_Y - 1, '#34363E'); }
    });
  };

  // cadeirinhas do teleférico andando no cabo (algumas com gente de casaco colorido)
  props.skiLift.fxNew = (ctx, p, world) => {
    const X = p.x * K;
    for (let k = 0; k < 6; k++) {
      const x = Math.round(X + ((world.t * 22 + k * 84) % 504) - 12), y = LIFT_Y;
      Gfx.rect(x, y + 1, 1, 7, '#34363E');
      Gfx.rect(x - 5, y + 8, 11, 2, '#C8323A');
      Gfx.rect(x - 5, y + 10, 11, 1, '#7A1A20');
      Gfx.rect(x - 6, y + 4, 1, 6, '#C8323A');
      if (k % 2 === 0) {
        const col = ['#2E6AC8', '#F2A030', '#3AA05A'][k % 3];
        Gfx.rect(x - 3, y + 4, 3, 4, col); Gfx.rect(x - 3, y + 2, 3, 2, '#F0C8A8');
        Gfx.rect(x + 1, y + 4, 3, 4, '#D8443A'); Gfx.rect(x + 1, y + 2, 3, 2, '#2A2A30');
      }
    }
  };

  // pinheiro nevado: camadas de galhos verde-escuros com a neve em cima de cada uma; tapa a visão
  props.pine.art = p => {
    const s = A.surface(34, 52), seed = 640 + (p.x | 0) + (p.y | 0);
    for (let y = 40; y < 50; y++) for (let i = 0; i < 4; i++) s.put(15 + i, y, pick(RAWWOOD, 0.6 - i * 0.15, 15 + i, y));
    const tiers = [[2, 10, 5], [9, 18, 8], [17, 28, 11], [26, 40, 15]];
    tiers.forEach(([y0, y1, hw]) => {
      for (let y = y0; y < y1; y++) {
        const half = (y - y0 + 2) / (y1 - y0 + 2) * hw;
        for (let x = Math.round(17 - half); x <= Math.round(17 + half); x++) {
          const u = (x - 17) / Math.max(1, half), fromTop = (y - y0) / (y1 - y0);
          let c = pick(CEDAR, 0.5 - u * 0.35 + (vnoise(x, y, 2, seed) - 0.5) * 0.4 - fromTop * 0.15, x, y);
          // a neve: no alto de cada camada e nas pontas dos galhos, mais do lado do sol
          if (fromTop < 0.38 + (u < 0 ? 0.12 : -0.08) + (vnoise(x, y, 2, seed + 1) - 0.5) * 0.3) c = pick(SNOW, 0.85 - u * 0.25, x, y);
          if (y === y1 - 1 && h01(x, y, seed + 2) < 0.5) continue;
          s.put(x, y, c);
        }
      }
    });
    for (let x = 9; x < 26; x++) { s.put(x, 50, SNOW[5]); s.put(x, 51, SNOW[4]); }
    s.outline(0.5);
    return { spr: s, dx: -1, dy: -2, base: 50, contact: [17, 50, 8, 1.5] };
  };

  // ======================================================================
  //  B2 · o churrasco no parque à noite (como na foto): o pátio de tijolos com os canteiros de grama,
  //  os postes acesos lá no fundo e a churrasqueira em brasa. O escuro azulado e as luzes vêm do
  //  look.tint; aqui as cores são as da luz dos postes, um pouco mais claras que o resultado.
  //  (Piso e céu próprios: o 'festival' da V1 também aparece no F4 A1.)
  // ======================================================================
  const BRICK = T(['#5A2E22', '#6E3A2A', '#824634', '#96543E', '#A8644A', '#B87658', '#C68A6A']);
  const GRASSN = T(['#1E3A26', '#26462E', '#2E5436', '#38623E', '#447048', '#527E54', '#628C60']);

  Art.floors.bbqPark = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      // canteiros de grama em volta das árvores e na beira de cima; o resto, tijolinho em espinha
      const bed = Math.min(Math.hypot((x - 80) / 52, (y - 110) / 34), Math.hypot((x - 404) / 50, (y - 226) / 30), (y - top) / 12 + 0.2);
      if (bed + (vnoise(x, y, 9, 650) - 0.5) * 0.5 + (vnoise(x, y, 3, 666) - 0.5) * 0.15 < 0.85) {
        S.put(x, y, pick(GRASSN, 0.5 + (vnoise(x, y, 4, 651) - 0.5) * 0.5 + (h01(x, y, 652) - 0.5) * 0.3, x, y));
        continue;
      }
      // espinha de peixe: tijolos de 8 × 4 alternando a direção
      const bx = Math.floor((x + y) / 8), by = Math.floor((x - y + 480) / 8), even = (bx + by) % 2 === 0;
      const u = even ? (x + y) % 8 : (x - y + 480) % 8, v = even ? (x - y + 480) % 4 : (x + y) % 4;
      let t = 0.55 + (h01(bx, by, 653) - 0.5) * 0.35 + (vnoise(x, y, 12, 654) - 0.5) * 0.2;
      if (u === 0 || v === 0) t = 0.12;
      else if (u === 1 || v === 1) t += 0.1;
      S.put(x, y, pick(BRICK, t, x, y));
    }
    // o meio-fio entre a grama e o tijolo
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      const c = S.get(x, y);
      if (!c) continue;
      const isG = c[1] > c[0];
      if (isG && y + 1 < 240) { const d = S.get(x, y + 1); if (d && d[0] > d[1]) S.put(x, y + 1, '#A8A098'); }
    }
    for (let y = top; y < top + 5; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#7078A0', (1 - (y - top) / 5) * 0.7);
  };

  // céu do começo da noite (o último azul no horizonte), prédios ao longe com as janelas acesas, a
  // fileira de árvores escuras e os dois postes do parque
  Art.walls.bbqSky = (S, look) => {
    const H = look.wall.height, SKYN = T(['#141838', '#1A2046', '#222A56', '#2C3666', '#384478', '#4A5488', '#606A98']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYN, y / H * 0.9 + (vnoise(x, y, 40, 655) - 0.5) * 0.08, x, y));
    for (let q = 0; q < 40; q++) { const sx = Math.floor(h01(q, 1, 656) * 480), sy = Math.floor(h01(q, 2, 656) * 18); S.put(sx, sy, h01(q, 3, 656) < 0.3 ? '#FFFFFF' : '#A8B0D8'); }
    kit.skyline(S, H - 8, 657, 6, 16, T(['#1E2240', '#262C4E', '#30385C', '#3A4468']), '#2A3050', '#F2D890');
    for (let y = H - 12; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(kit.LEAF_N, 0.1 + (vnoise(x, y, 3, 658) - 0.5) * 0.3, x, y));
    for (let x = -4, q = 0; x < 490; x += 10 + Math.floor(h01(q, 1, 659) * 7), q++) kit.lump(S, x, H - 11 + h01(q, 2, 659) * 4, 6 + h01(q, 3, 659) * 4, -0.12, 660 + q, kit.LEAF_N);
    // os postes (as luzes do look.tint ficam neles)
    [88, 412].forEach(lx => {
      for (let y = 10; y < H; y++) { S.put(lx, y, '#3A4448'); S.put(lx + 1, y, '#262E32'); }
      for (let y = 4; y < 11; y++) for (let x = lx - 3; x < lx + 5; x++) S.put(x, y, x === lx - 3 || x === lx + 4 ? '#2A3434' : pick(T(['#F2C870', '#FFE08A', '#FFF4C8']), 0.95 - (y - 4) * 0.05, x, y));
      for (let x = lx - 4; x < lx + 6; x++) S.put(x, 3, '#2A3434');
    });
  };

  // brasas piscando e a fumaça subindo da churrasqueira; churrasqueira de tijolo com a grelha, a
  // carne e os espetinhos
  let grillImg = null;
  function grillBase() {
    if (grillImg) return grillImg;
    const s = A.surface(46, 43), IRON = T(['#121216', '#1C1C22', '#28282E', '#36363E', '#46464E']);
    // a caixa de tijolo com o tampo de pedra
    for (let y = 18; y < 41; y++) for (let x = 2; x < 44; x++) {
      const row = Math.floor((y - 18) / 4), bx = (x + (row % 2) * 4) % 8, by = (y - 18) % 4;
      let t = 0.5 - (x - 2) / 42 * 0.25 + (h01(Math.floor((x + (row % 2) * 4) / 8), row, 661) - 0.5) * 0.3;
      if (bx === 0 || by === 0) t = 0.15;
      s.put(x, y, pick(BRICK, t, x, y));
    }
    for (let y = 14; y < 19; y++) for (let x = 1; x < 45; x++) s.put(x, y, pick(T(['#5A5A60', '#727278', '#8A8A90', '#A4A4A8']), (y === 14 ? 0.9 : 0.5) - x / 46 * 0.25, x, y));
    // a grelha com as brasas embaixo (as brasas acesas são animadas)
    for (let y = 8; y < 15; y++) for (let x = 5; x < 41; x++) s.put(x, y, (x - 5) % 3 === 0 ? IRON[3] : pick(T(['#3A1A10', '#5A2A14', '#7A3A18']), 0.5 + (h01(x, y, 662) - 0.5) * 0.6, x, y));
    // carnes e espetinhos
    [[8, 9, 6], [16, 8, 5], [24, 10, 6], [33, 9, 5]].forEach(([x0, y0, w]) => { for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + w; x++) s.put(x, y, pick(T(['#5A2414', '#7A3A1E', '#9A5428', '#B86E3A']), 0.8 - (y - y0) * 0.25 + (x === x0 ? -0.2 : 0), x, y)); });
    for (let x = 6; x < 40; x++) if ((x * 7) % 11 < 2) s.put(x, 12, '#C8C2B4');
    s.outline(0.5);
    return (grillImg = s.canvas());
  }
  props.grill.liveNew = (ctx, p, world) => {
    const x = Math.round(p.x * K) - 1, y = Math.round(p.y * K), t = world.t;
    Gfx.shadow(x + 23, y + 41, 42, 6, 0.3);
    ctx.drawImage(grillBase(), x, y);
    for (let i = 0; i < 12; i++) {
      const on = Math.sin(t * 5 + i * 1.9) + Math.sin(t * 3.1 + i);
      if (on < 0.2) continue;
      Gfx.rect(x + 7 + i * 3, y + 13, 1, 1, on > 1.2 ? '#FFD870' : '#F28030');
    }
    // fumaça subindo e se espalhando
    for (let k = 0; k < 6; k++) {
      const ph = (t * 0.45 + k / 6) % 1;
      ctx.globalAlpha = 0.32 * (1 - ph);
      const sx = Math.round(x + 12 + k * 4 + Math.sin(t * 1.5 + k) * 3 + ph * 8), sy = Math.round(y + 6 - ph * 30);
      Gfx.rect(sx, sy, 4 + Math.round(ph * 4), 3, '#D8D8E0');
    }
    ctx.globalAlpha = 1;
  };

  // mesa comprida de madeira na vertical, com os pratos, a carne, a salada, as latinhas e os copos
  props.longTableV.art = p => {
    const H = Math.round((p.h || 100) * K), s = A.surface(38, H), PLANK = T(['#6A4A2A', '#7E5A34', '#946C40', '#A87E4E', '#BC925E', '#CCA472']);
    for (let y = 2; y < H - 3; y++) for (let x = 0; x < 38; x++) {
      const px = x % 9;
      let t = 0.6 - x / 38 * 0.25 + (vnoise(x * 1.5, y * 0.25, 3, 663) - 0.5) * 0.3 + (y === 2 ? 0.25 : 0) + (y >= H - 5 ? -0.3 : 0);
      if (px === 0) t -= 0.3;
      s.put(x, y, pick(PLANK, t, x, y));
    }
    const food = [['#E8E0D0', ['#5A2414', '#8A4A2A']], ['#F4F0E6', ['#2E7A3A', '#5DAA62']], ['#E8E0D0', ['#B82A2A', '#E05A3A']], ['#F4F0E6', ['#D8A030', '#F2C14E']]];
    for (let k = 0; k * 27 + 30 < H; k++) {
      const [plate, [f0, f1]] = food[k % 4], cy = 14 + k * 27;
      s.ellipse(12, cy, 8.5, 6, (x, y, nx, ny) => (nx * nx + ny * ny < 0.45 ? (h01(x, y, 664) < 0.5 ? f0 : f1) : pick(A.ramp(plate), sphere(nx, ny) + 0.15, x, y)));
      const can = A.ramp(['#2A6AC8', '#D8443A', '#2EA35A', '#F2C14E'][k % 4]);
      for (let y = cy - 4; y < cy + 4; y++) for (let x = 27; x < 31; x++) s.put(x, y, y === cy - 4 ? '#C8CCD4' : pick(can, 0.8 - (x - 27) * 0.18, x, y));
    }
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, shadow: 'flat', H: 6 };
  };

  // banco comprido de madeira da mesa (no chão, embaixo de quem senta)
  props.picnicBench = { layer: 'back', size: p => [p.w, p.h] };
  props.picnicBench.art = p => {
    const W = Math.round(p.w * K), H = Math.round(p.h * K), s = A.surface(W + 2, H + 3), PLANK = T(['#5A3E22', '#6E4C2A', '#846034', '#9A7442', '#AE8852']);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) s.put(x, y, pick(PLANK, 0.6 - x / W * 0.3 + (y === 0 ? 0.25 : 0) + (vnoise(x, y * 0.3, 3, 665) - 0.5) * 0.3, x, y));
    for (let y = 2; y < H + 3; y++) { s.put(W, y, '#140F1E', 0.35); s.put(W + 1, y, '#140F1E', 0.2); }
    for (let x = 1; x < W + 1; x++) for (let j = 0; j < 3; j++) s.put(x, H + j, '#140F1E', 0.35 - j * 0.1);
    return { spr: s, shadow: false };
  };

  // caixa térmica azul com a tampa branca
  props.cooler.art = () => {
    const s = A.surface(23, 18), B = A.ramp('#3A78C8');
    for (let y = 5; y < 17; y++) for (let x = 0; x < 23; x++) s.put(x, y, y < 8 ? pick(WHITE, 0.9 - x / 23 * 0.3, x, y) : pick(B, 0.65 - x / 23 * 0.3 - (y === 16 ? 0.2 : 0), x, y));
    s.rect(8, 3, 7, 2, '#8A929E'); s.rect(8, 3, 7, 1, '#C8CED6');
    s.outline(0.5);
    return { spr: s, dx: 0, dy: 0, base: 16, contact: [11.5, 16, 10, 1.2] };
  };

  // ======================================================================
  //  C1 · o castelo de Himeji numa manhã de primavera (como na foto): o pátio de areia clara com as
  //  pétalas no chão, o castelo branco de cinco andares sobre a muralha de pedra, os muros brancos de
  //  telhado cinza dos lados, as cerejeiras floridas e as pétalas caindo
  // ======================================================================
  const SANDL = T(['#A88E6A', '#B89E78', '#C8AE88', '#D6BE98', '#E2CCA8', '#ECD8B8', '#F4E4C8']);
  const BLOSSOM = T(['#B86A86', '#CC809A', '#DE98AE', '#EAB0C2', '#F4C8D4', '#FADCE4', '#FFF0F4']);
  const ROOFG = T(['#2E3236', '#3E4448', '#50565A', '#646A6E', '#7A8084', '#9AA0A2']);
  const PLASTER = T(['#A8A49C', '#C0BCB4', '#D6D2CA', '#E6E4DE', '#F2F1EC', '#FAFAF6']);
  const ISHI = T(['#5E5446', '#746856', '#8A7C66', '#9E9078', '#B0A288', '#C2B498']);

  Art.floors.lightDirt = (S, look) => {
    const top = look.wall.height;
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      let t = 0.58 + (vnoise(x, y, 26, 670) - 0.5) * 0.22 + (vnoise(x, y, 5, 671) - 0.5) * 0.14 + (h01(x, y, 672) - 0.5) * 0.22;
      let c = pick(SANDL, t, x, y);
      const r = h01(x, y, 673);
      if (r < 0.012) c = SANDL[1]; else if (r < 0.02) c = SANDL[6];
      // pétalas caídas, juntando em manchas
      if (vnoise(x, y, 18, 674) > 0.6 && h01(x, y, 675) < 0.05) c = BLOSSOM[4 + Math.floor(h01(x, y, 676) * 2)];
      S.put(x, y, c);
    }
    for (let y = top; y < top + 6; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#A8A0B0', (1 - (y - top) / 6) * 0.7);
  };

  // copa de cerejeira: bolas de flor com a luz da esfera e o pontilhado das flores
  function blossomLump(S, cx, cy, r, bias, seed) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / (r * 0.85), rough = (vnoise(x, y, 2.5, seed) - 0.5) * 0.5;
      if (nx * nx + ny * ny > 1 + rough * 0.6) continue;
      let t = sphere(clamp1(nx), clamp1(ny)) + bias + (vnoise(x, y, 2, seed + 1) - 0.5) * 0.45;
      if (h01(x, y, seed) < 0.06) t += 0.3;
      S.put(x, y, pick(BLOSSOM, t, x, y));
    }
  }

  Art.walls.himeji = (S, look) => {
    const H = look.wall.height, cx = 240, SKYS = T(['#5E9AD8', '#6CA6DE', '#7CB2E2', '#8EBEE6', '#A2CAEA', '#B6D6EC', '#CAE0EC']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(SKYS, y / (H - 20) + (vnoise(x, y, 40, 677) - 0.5) * 0.06, x, y));
    kit.cumulus(S, 70, 22, [[-12, 1, 5], [-4, -3, 7], [6, -2, 6], [13, 1, 4]], 2);
    kit.cumulus(S, 410, 14, [[-8, 0, 5], [1, -3, 6], [9, 0, 4]], 2);
    // os muros brancos de telhado cinza dos dois lados, com o barranco de pedra embaixo
    for (let y = H - 30; y < H; y++) for (let x = 0; x < 480; x++) {
      if (Math.abs(x - cx) < 96) continue;
      let c;
      if (y < H - 27) c = pick(ROOFG, 0.75 - (y - H + 30) * 0.2, x, y);
      else if (y === H - 27) c = '#E8E8E4';
      else if (y < H - 15) c = pick(PLASTER, 0.75 - (x < cx ? 0 : 0.1) + (vnoise(x, y, 6, 678) - 0.5) * 0.1 + ((x % 40) < 2 ? -0.3 : 0), x, y);
      else c = pick(ISHI, 0.5 + (h01(Math.floor(x / 6), Math.floor((y + (Math.floor(x / 6) % 2) * 2) / 4), 679) - 0.5) * 0.5 + (((x % 6) === 0 || (y % 4) === 0) ? -0.35 : 0), x, y);
      S.put(x, y, c);
    }
    // cerejeiras na frente dos muros
    [[24, H - 30, 15], [70, H - 26, 13], [118, H - 32, 14], [362, H - 30, 14], [410, H - 26, 15], [458, H - 31, 13]].forEach(([x, y, r], q) => {
      for (let yy = y; yy < H - 14; yy++) { S.put(x, yy, '#4A3028'); S.put(x + 1, yy, '#3A2620'); }
      blossomLump(S, x - r * 0.5, y - 2, r * 0.75, 0.05, 680 + q * 3);
      blossomLump(S, x + r * 0.5, y, r * 0.7, 0, 681 + q * 3);
      blossomLump(S, x, y - r * 0.4, r * 0.8, 0.1, 682 + q * 3);
    });
    // A muralha de pedra (ishigaki): pedras irregulares (cada pixel é da pedra cujo ponto sorteado
    // fica mais perto; a junta é onde duas pedras quase empatam), os lados abrindo em curva para baixo
    const mTop = H - 42, mBot = H - 6;
    const halfAt = y => 64 + Math.pow((y - mTop) / (mBot - mTop), 1.6) * 30;
    const seedPt = (gx, gy) => [gx * 8 + 1 + h01(gx, gy, 683) * 6, gy * 6 + 1 + h01(gx, gy, 684) * 4];
    for (let y = mTop; y < mBot; y++) {
      const hw = halfAt(y);
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        const gx0 = Math.floor(x / 8), gy0 = Math.floor(y / 6);
        let d1 = 1e9, d2 = 1e9, id = null, dx1 = 0, dy1 = 0;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
          const [px, py] = seedPt(gx0 + i, gy0 + j), d = Math.hypot((x - px) * 0.75, y - py);
          if (d < d1) { d2 = d1; d1 = d; id = [gx0 + i, gy0 + j]; dx1 = x - px; dy1 = y - py; } else if (d < d2) d2 = d;
        }
        let t = 0.5 + (h01(id[0], id[1], 685) - 0.5) * 0.5 - (dx1 + dy1) * 0.03 + (vnoise(x, y, 2, 686) - 0.5) * 0.15 - (x - cx) / hw * 0.1;
        if (d2 - d1 < 0.8) t = 0.05;
        const edge = Math.abs(x - cx) > hw - 1.5;
        S.put(x, y, pick(ISHI, edge ? (x < cx ? 0.85 : 0.2) : t, x, y));
      }
    }
    // O castelo: cinco andares de parede branca com as grades pretas das janelas e os telhados de
    // telha cinza (as fileiras de telha, a beira branca, as pontas viradas para cima); depois, por cima,
    // as empenas triangulares (chidori-hafu) e a curva (kara-hafu) do primeiro andar
    let yy = mTop;
    const tiers = [[11, 60], [8, 50], [7, 42], [6, 34], [6, 26]].map(([th, hw]) => { yy -= th; const t = [yy, th, hw]; yy -= 4; return t; });
    tiers.forEach(([y0, th, hw]) => {
      for (let y = y0; y < y0 + th; y++) for (let x = cx - hw; x <= cx + hw; x++) {
        let c = pick(PLASTER, 0.82 - (x - cx + hw) / (2 * hw) * 0.35 + (y === y0 ? -0.25 : 0), x, y);
        const wx = (x - cx + hw) % 12;
        if (y > y0 + 2 && y < y0 + th - 2 && wx > 3 && wx < 9 && Math.abs(x - cx) < hw - 3) c = (x % 2) ? '#1A1A20' : PLASTER[2];
        S.put(x, y, c);
      }
      const ry = y0 - 4, rw = hw + 7;
      for (let y = ry; y <= y0; y++) for (let x = cx - rw - 3; x <= cx + rw + 3; x++) {
        const over = Math.abs(x - cx) - (rw - 4), lift = over > 0 ? over * 0.7 : 0;
        if (Math.abs(x - cx) > rw + (y - ry) * 0.6 + 1) continue;
        let c = pick(ROOFG, 0.7 - (y - ry) * 0.1 + ((x % 2) ? -0.12 : 0.04), x, y);
        if (y === y0) c = '#ECECE8';
        else if (y === ry) c = ROOFG[5];
        S.put(x, Math.round(y - lift), c);
      }
    });
    const gable = (gy, half) => {
      for (let j = 0; j <= half; j++) for (let x = cx - half + j; x <= cx + half - j; x++) {
        const y = gy - j, rim = Math.abs(x - cx) >= half - j - 1;
        S.put(x, y, rim ? (Math.abs(x - cx) >= half - j ? ROOFG[2] : '#ECECE8') : pick(PLASTER, 0.75 - j * 0.02, x, y));
      }
      S.put(cx, gy - half - 1, ROOFG[1]);
    };
    gable(tiers[1][0] - 2, 11);
    gable(tiers[2][0] - 2, 8);
    gable(tiers[3][0] - 2, 9);
    // kara-hafu: a curva em cima da entrada do primeiro andar
    for (let x = cx - 14; x <= cx + 14; x++) {
      const u = (x - cx) / 14, y = Math.round(tiers[0][0] - 6 + u * u * 4 - (1 - u * u) * 2);
      S.put(x, y, ROOFG[1]); S.put(x, y + 1, '#ECECE8'); S.put(x, y + 2, ROOFG[3]);
    }
    // a cumeeira do telhado de cima com os peixes (shachihoko) nas pontas
    const ty = tiers[4][0] - 4;
    for (let x = cx - 24; x <= cx + 24; x++) { S.put(x, ty - 1, ROOFG[1]); S.put(x, ty - 2, '#ECECE8'); }
    [cx - 24, cx + 21].forEach(fx => { S.rect(fx, ty - 5, 3, 3, '#3A3A40'); S.put(fx + (fx < cx ? 0 : 2), ty - 6, '#F2C14E'); });
    // o pé da muralha: a cerca baixa de madeira
    for (let x = 0; x < 480; x++) {
      if (x % 14 < 2) for (let y = H - 9; y < H - 2; y++) S.put(x, y, '#6A4A30');
      S.put(x, H - 7, '#8A6440'); S.put(x, H - 4, '#7A5434');
    }
  };

  // ---------- objetos de Himeji e Nara ----------
  // cerejeira florida: o tronco escuro com os galhos e a copa rosa (por cima de quem passa)
  props.cherry.art = p => {
    const s = A.surface(76, 84), BARK = T(['#2A1A16', '#3A2620', '#4E342A', '#644436', '#7A5644']), seed = 690 + (p.x | 0);
    for (let y = 40; y < 79; y++) {
      const half = 3.5 + (y > 72 ? (y - 72) * 0.8 : 0);
      for (let x = Math.round(38 - half); x <= Math.round(38 + half); x++) s.put(x, y, pick(BARK, 0.8 - (x - 38 + half) / (2 * half) * 0.7 + (vnoise(x, y, 2, seed) - 0.5) * 0.3, x, y));
    }
    [[38, 46, 18, 30, 3], [38, 44, 58, 28, 3], [38, 42, 30, 18, 2], [38, 42, 50, 16, 2]].forEach(([x0, y0, x1, y1, w]) => s.limb(x0, y0, x1, y1, w, BARK, 0));
    [[38, 26, 22], [20, 32, 15], [56, 32, 16], [28, 14, 14], [50, 14, 15], [38, 8, 11], [10, 42, 9], [66, 42, 9]].forEach(([cx, cy, r], q) => {
      for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / (r * 0.85), rough = (vnoise(x, y, 2.6, seed + 1 + q) - 0.5) * 0.5;
        if (nx * nx + ny * ny > 1 + rough) continue;
        if (q < 2 && ny > 0.35 && vnoise(x, y, 3, seed + 20) < 0.3) continue;
        let t = sphere(clamp1(nx), clamp1(ny)) + (vnoise(x, y, 2, seed + 10 + q) - 0.5) * 0.5 + 0.08;
        if (h01(x, y, seed + 30) < 0.07) t += 0.35;
        s.put(x, y, pick(BLOSSOM, t, x, y));
      }
    });
    s.outline(0.5);
    return { spr: s, dx: -3, dy: -2, base: 79, contact: [38, 79, 8, 2] };
  };

  // lanterna de pedra (tōrō): base, coluna, a caixa do fogo com a janelinha, o chapéu largo e a
  // ponta; pedra cinza com musgo
  props.stoneLantern.art = () => {
    const s = A.surface(19, 33), GRAN = T(['#4A4A4E', '#5E5E62', '#747478', '#8A8A8C', '#A2A2A2', '#B8B8B6']);
    const box = (x0, y0, w, h, light) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) s.put(x, y, pick(GRAN, (light || 0.6) - (x - x0) / w * 0.4 + (y === y0 ? 0.2 : 0) + (h01(x, y, 691) < 0.12 ? -0.15 : 0), x, y)); };
    box(3, 28, 13, 4); box(6, 17, 7, 11); box(4, 14, 11, 3);
    box(4, 8, 11, 7, 0.7);
    s.rect(7, 10, 5, 3, '#3A2E20'); s.put(8, 11, '#8A6A3A'); s.put(9, 11, '#C89A4A');
    for (let y = 4; y < 8; y++) for (let x = 1 + (7 - y); x < 18 - (7 - y); x++) s.put(x, y, pick(GRAN, 0.8 - (x - 1) / 17 * 0.45 + (y === 4 ? 0.1 : 0), x, y));
    s.ellipse(9.5, 2.5, 2.2, 2.5, (x, y, nx, ny) => pick(GRAN, sphere(nx, ny) + 0.1, x, y));
    [[4, 29], [5, 15], [14, 9], [12, 30], [3, 6]].forEach(([x, y]) => { s.put(x, y, '#5A7A3A'); s.put(x + 1, y, '#4A6A32'); });
    s.outline(0.5);
    return { spr: s, dx: -2, dy: -1, base: 31, contact: [9.5, 31, 7, 1.5] };
  };

  // pétalas caindo, girando e indo com o vento para a direita (por cima de tudo)
  props.petals.fxNew = (ctx, p, world) => {
    const X = p.x * K, t = world.t;
    for (let i = 0; i < 40; i++) {
      const x = Math.round(X + (h01(i, 1, 692) * 480 + t * (12 + (i % 6) * 2) + Math.sin(t * 1.5 + i) * 10) % 480);
      const y = Math.round((h01(i, 2, 692) * 240 + t * (14 + (i % 4) * 3)) % 240);
      const spin = Math.floor(t * 4 + i) % 3, col = i % 3 ? '#F8D0DC' : '#F2A8C0';
      if (spin === 0) Gfx.rect(x, y, 2, 1, col);
      else if (spin === 1) Gfx.rect(x, y, 1, 2, col);
      else { Gfx.rect(x, y, 1, 1, col); Gfx.rect(x + 1, y + 1, 1, 1, '#FCE6EE'); }
    }
  };

  // ======================================================================
  //  C2 · Nara (o dia seguinte, céu de primavera meio enevoado): a lagoa verde com as pétalas
  //  boiando e o reflexo das cerejeiras, a margem de pedra, o caminho de areia dos cervos; lá do
  //  outro lado, as cerejeiras e o pagode de cinco andares
  // ======================================================================
  const POND = T(['#1A3A44', '#20464E', '#285458', '#326264', '#3E706E', '#4C7E7A', '#5E8C88']);
  Art.floors.nara = (S, look) => {
    const top = look.wall.height, [p0, p1] = look.pond || [top, top];
    for (let y = top; y < 240; y++) for (let x = 0; x < 480; x++) {
      if (y < p1) {
        const d = (y - p0) / (p1 - p0);
        let t = 0.42 + d * 0.22 + (vnoise(x, y, 30, 700) - 0.5) * 0.12;
        const w = Math.sin(y * 1.1 + vnoise(x, y * 2, 16, 701) * 5);
        if (w > 0.95 && vnoise(x, y, 7, 702) > 0.6) t += 0.14;
        let c = pick(POND, t, x, y);
        // o reflexo das cerejeiras da outra margem: faixas verticais rosadas, sumindo para perto
        const refl = Math.max(0, 1 - (y - p0) / 26) * vnoise(x, 0, 7, 703);
        if (refl > 0.2) c = mix(c, '#E8B4C6', Math.min(0.5, (refl - 0.2) * 1.2) * (Math.sin(y * 1.7 + x * 0.1) > -0.6 ? 1 : 0.4));
        // pétalas boiando: umas soltas e umas jangadinhas
        if ((vnoise(x, y, 9, 704) > 0.82 && h01(x, y, 705) < 0.22) || h01(x, y, 717) < 0.002) c = h01(x, y, 706) < 0.5 ? '#F8D8E2' : '#F0B8CA';
        S.put(x, y, c);
        continue;
      }
      // a margem: pedras arredondadas e a faixa de grama; embaixo, o caminho de areia
      const m = y - p1;
      if (m < 5) {
        const sx = (x + (m < 3 ? 0 : 4)) % 8;
        S.put(x, y, pick(T(['#4A4A4C', '#626264', '#7C7C7C', '#969694', '#AEAEAA']), 0.75 - m * 0.12 - (sx === 0 ? 0.4 : sx === 1 ? -0.1 : 0) + (h01(x, y, 707) - 0.5) * 0.2, x, y));
      } else if (m < 13 + Math.round(vnoise(x, 0, 7, 708) * 4)) {
        S.put(x, y, pick(kit.GRASS, 0.5 + (vnoise(x, y, 4, 709) - 0.5) * 0.5 + (h01(x, y, 710) - 0.5) * 0.3, x, y));
      } else {
        let t = 0.6 + (vnoise(x, y, 24, 711) - 0.5) * 0.2 + (h01(x, y, 712) - 0.5) * 0.22;
        let c = pick(SANDL, t, x, y);
        if (vnoise(x, y, 16, 713) > 0.6 && h01(x, y, 714) < 0.06) c = BLOSSOM[4 + Math.floor(h01(x, y, 715) * 2)];
        if (h01(x, y, 716) < 0.0015) c = '#4A3A2A';   // as bolinhas dos cervos
        S.put(x, y, c);
      }
    }
    for (let y = p0; y < p0 + 4; y++) for (let x = 0; x < 480; x++) S.mul(x, y, '#90A0B0', (1 - (y - p0) / 4) * 0.6);
  };

  // céu enevoado de primavera, o pagode de cinco andares lá longe, as cerejeiras da outra margem com
  // os troncos e a beira de grama
  Art.walls.naraBank = (S, look) => {
    const H = look.wall.height, HAZE = T(['#8EB0D0', '#9CBAD6', '#AAC4DA', '#B8CCDE', '#C6D4E0', '#D2DCE2']);
    for (let y = 0; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(HAZE, y / (H - 6) + (vnoise(x, y, 40, 717) - 0.5) * 0.06, x, y));
    // o pagode (silhueta azulada, longe)
    const px = 330, FAR = T(['#4A5670', '#5A6680', '#6A7690', '#7E8AA2']);
    for (let k = 0; k < 5; k++) {
      const y0 = 5 + k * 5, hw = 6 + k * 1.2;
      for (let y = y0; y < y0 + 2; y++) for (let x = Math.round(px - hw - 2); x <= Math.round(px + hw + 2); x++) S.put(x, y, pick(FAR, 0.3, x, y));
      for (let y = y0 + 2; y < y0 + 5; y++) for (let x = Math.round(px - hw + 2); x <= Math.round(px + hw - 2); x++) S.put(x, y, pick(FAR, 0.6 - (x - px + hw) / (2 * hw) * 0.4, x, y));
    }
    for (let y = 0; y < 5; y++) S.put(px, y, FAR[0]);
    // as cerejeiras da margem de lá
    for (let y = H - 10; y < H - 3; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(BLOSSOM, 0.35 + (vnoise(x, y, 3, 718) - 0.5) * 0.4, x, y));
    for (let x = -6, q = 0; x < 490; x += 14 + Math.floor(h01(q, 1, 719) * 10), q++) {
      const ty = H - 14 - h01(q, 2, 719) * 6;
      for (let y = Math.round(ty); y < H - 3; y++) { S.put(x, y, '#3A2620'); S.put(x + 1, y, '#2A1A16'); }
      blossomLump(S, x, ty, 8 + h01(q, 3, 719) * 5, 0.05, 720 + q);
    }
    for (let y = H - 3; y < H; y++) for (let x = 0; x < 480; x++) S.put(x, y, pick(kit.GRASS, 0.45 - (y - H + 3) * 0.12, x, y));
  };

  // O barco a remo, girado pela direção (look) de quem anda: o casco rasterizado em 32 ângulos (os
  // pixels continuam nítidos), as tábuas, os três bancos, a borda clara do lado da luz; a sombra na
  // água, as marolas atrás e os remos batendo
  const boatArts = {}, BOATW = T(['#5A3A20', '#6E4A2A', '#845C34', '#9A6E40', '#B0844E', '#C49A62']);
  function boatArt(step) {
    if (boatArts[step]) return boatArts[step];
    const a = step / 32 * Math.PI * 2, cos = Math.cos(a), sin = Math.sin(a), s = A.surface(72, 72);
    for (let py = 0; py < 72; py++) for (let px = 0; px < 72; px++) {
      const dx = px + 0.5 - 36, dy = py + 0.5 - 36;
      const u = dx * cos + dy * sin, v = -dx * sin + dy * cos;    // u: ao longo do barco (proa em +u)
      if (u < -26 || u > 29) continue;
      const half = u > 15 ? 10 * Math.sqrt(Math.max(0, (29 - u) / 14)) : u < -21 ? 10 - (-21 - u) * 1.2 : 10;
      if (Math.abs(v) > half) continue;
      const rim = Math.abs(v) > half - 2.2 || u > 27 || u < -24;
      let c;
      if (rim) {
        // a borda: clara onde a normal (na tela) aponta para cima e para a esquerda
        const nx = -sin * Math.sign(v), ny = cos * Math.sign(v), lit = -(nx * 0.6 + ny * 0.8);
        c = pick(BOATW, 0.55 + lit * 0.4, px, py);
      } else {
        const plank = Math.floor((v + 10) / 4);
        c = pick(BOATW, 0.45 + (plank % 2 ? 0.08 : -0.04) + (Math.abs(((v + 10) % 4) - 0) < 0.5 ? -0.25 : 0), px, py);
        if (Math.abs(u) < 2.2 || Math.abs(u + 15) < 2 || Math.abs(u - 15) < 2) c = pick(BOATW, 0.8, px, py);
      }
      s.put(px, py, c);
    }
    s.outline(0.45);
    // e a silhueta escura (a sombra na água)
    const sil = A.surface(72, 72);
    for (let py = 0; py < 72; py++) for (let px = 0; px < 72; px++) if (s.alpha(px, py)) sil.put(px, py, '#142424');
    return (boatArts[step] = { img: s.canvas(), sil: sil.canvas() });
  }
  props.rowboat.liveNew = (ctx, g, world) => {
    const step = Math.round(((g.look % 360) + 360) % 360 / 360 * 32) % 32, x = Math.round(g.x), y = Math.round(g.y);
    const a = g.look * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), t = world.t || 0;
    // marolas atrás e a sombra embaixo
    for (let k = 1; k < 5; k++) {
      const bx = x - ca * (26 + k * 7), by = y - sa * (26 + k * 7), w = 7 + k * 2;
      ctx.globalAlpha = 0.7 - k * 0.12;
      Gfx.rect(Math.round(bx - sa * w), Math.round(by + ca * w), 2, 1, '#C8E4E8');
      Gfx.rect(Math.round(bx + sa * w), Math.round(by - ca * w), 2, 1, '#C8E4E8');
    }
    const b = boatArt(step);
    ctx.globalAlpha = 0.35;
    ctx.drawImage(b.sil, x - 36 + 2, y - 36 + 3);
    ctx.globalAlpha = 1;
    ctx.drawImage(b.img, x - 36, y - 36);
    // remos: saem do meio para os dois lados, vão para a frente e para trás; a pá na ponta
    const sw = Math.sin(t * 3) * 0.5;
    [-1, 1].forEach(side => {
      for (let k = 9; k < 26; k++) {
        const u = Math.sin(sw) * (k - 6) * 0.7, v = side * k;
        const px = Math.round(x + ca * u - sa * v), py = Math.round(y + sa * u + ca * v);
        Gfx.rect(px, py, k > 20 ? 2 : 1, k > 20 ? 2 : 1, k > 20 ? '#C8945A' : '#7A5030');
      }
      if (Math.cos(t * 3) > 0.6) { const u = Math.sin(sw) * 14, v = side * 25; Gfx.rect(Math.round(x + ca * u - sa * v), Math.round(y + sa * u + ca * v) + 2, 3, 1, '#E8F6F8'); }
    });
  };

  // Cervo de Nara (inofensivo): marrom com as pintinhas claras, o rabo branco, as patas finas
  // andando em 2 quadros; vira para onde anda
  const deerImgs = {};
  function deerImg(left, f) {
    const key = (left ? 1 : 0) + f * 2;
    if (deerImgs[key]) return deerImgs[key];
    const s = A.surface(30, 28), FUR = T(['#5A3A20', '#7A5230', '#986A3E', '#B4844E', '#C89A62', '#D8B07A']);
    const put = (x, y, c) => s.put(left ? 29 - x : x, y, c);
    // patas
    [[7, f], [10, 1 - f], [18, f], [21, 1 - f]].forEach(([lx, k], i) => { for (let y = 17; y < 26 - k; y++) put(lx + (y > 22 ? k : 0), y, i % 2 ? FUR[1] : FUR[2]); put(lx + k, 26 - k, '#2A1A10'); });
    // corpo (sombreado de cima), as pintas e o rabo branco
    for (let y = 9; y < 19; y++) for (let x = 4; x < 24; x++) {
      const nx = (x - 14) / 10, ny = (y - 13.5) / 5;
      if (nx * nx + ny * ny > 1) continue;
      let c = pick(FUR, sphere(nx, ny) + 0.05, x, y);
      if (ny < 0.2 && h01(x, y, 730) < 0.12) c = '#F2E2C2';
      if (ny > 0.55) c = pick(T(['#C8A880', '#DCC09A', '#ECD6B4']), 0.6, x, y);
      put(x, y, c);
    }
    for (let y = 10; y < 14; y++) for (let x = 2; x < 5; x++) put(x, y, y < 11 ? FUR[3] : '#F8F4EC');
    // pescoço e cabeça, orelhas, olho e focinho
    for (let y = 4; y < 13; y++) for (let x = 20; x < 25; x++) put(x, y, pick(FUR, 0.7 - (x - 20) * 0.08, x, y));
    for (let y = 2; y < 8; y++) for (let x = 22; x < 29; x++) if (!(y === 2 && x > 26) && !(y > 5 && x < 23)) put(x, y, pick(FUR, 0.75 - (y - 2) * 0.05, x, y));
    put(28, 5, '#2A1A14'); put(28, 6, '#2A1A14');
    put(25, 4, '#1A120C');
    [[21, 1], [22, 0], [21, 2], [20, 2]].forEach(([x, y]) => put(x, y, FUR[2]));
    put(21, 1, '#E8B8A0');
    s.outline(0.45);
    return (deerImgs[key] = s.canvas());
  }
  props.deer.liveNew = (ctx, g) => {
    const x = Math.round(g.x), y = Math.round(g.y), left = Chars.dirOf(g.look) === 'left';
    const f = g.moving ? Math.floor(g.dist / 5) % 2 : 0;
    Gfx.shadow(x, y, 24, 5, 0.3);
    ctx.drawImage(deerImg(left, f), x - 15, y - 26);
  };
})();
