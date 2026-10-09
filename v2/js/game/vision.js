// Cones de visão (SPEC, seção 5): raycasting simples contra retângulos que bloqueiam a visão.
// Um cone é { x, y, look (rad), half (rad), range (px), lens }. Vision.cast() preenche `lens`
// (o alcance de cada raio). Vision.inside() usa a mesma conta do desenho, então o que aparece
// vermelho no chão é exatamente o que o vigia vê.
const Vision = (() => {
  const TAU = Math.PI * 2;
  const angleDiff = (a, b) => ((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI;

  // distância até o primeiro retângulo no caminho do raio (método das placas).
  // Retângulos que contêm a origem são ignorados (a cadeira do próprio vigia, por exemplo).
  function rayHit(ox, oy, dx, dy, max, rects) {
    let best = max;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      let t0 = -Infinity, t1 = Infinity;
      if (dx === 0) {
        if (ox < r.x || ox >= r.x + r.w) continue;
      } else {
        let a = (r.x - ox) / dx, b = (r.x + r.w - ox) / dx;
        if (a > b) { const t = a; a = b; b = t; }
        t0 = a; t1 = b;
      }
      if (dy === 0) {
        if (oy < r.y || oy >= r.y + r.h) continue;
      } else {
        let a = (r.y - oy) / dy, b = (r.y + r.h - oy) / dy;
        if (a > b) { const t = a; a = b; b = t; }
        if (a > t0) t0 = a;
        if (b < t1) t1 = b;
      }
      if (t1 < t0 || t0 <= 0) continue;
      if (t0 < best) best = t0;
    }
    return best;
  }

  function cast(cone, rects, rays) {
    if (!cone.lens || cone.lens.length !== rays) cone.lens = new Float32Array(rays);
    for (let i = 0; i < rays; i++) {
      const a = cone.look + (i / (rays - 1) * 2 - 1) * cone.half;
      cone.lens[i] = rayHit(cone.x, cone.y, Math.cos(a), Math.sin(a), cone.range, rects);
    }
  }

  // alcance do cone na direção do ponto (interpolado entre os raios vizinhos), ou -1 se fora
  function reachAt(cone, dx, dy) {
    const da = angleDiff(Math.atan2(dy, dx), cone.look);
    if (da < -cone.half || da > cone.half) return -1;
    const n = cone.lens.length, f = (da / cone.half + 1) / 2 * (n - 1);
    const i = Math.min(n - 2, Math.floor(f)), t = f - i;
    return cone.lens[i] * (1 - t) + cone.lens[i + 1] * t;
  }

  function inside(cone, px, py) {
    if (!cone.lens) return false;
    const dx = px - cone.x, dy = py - cone.y, d = Math.hypot(dx, dy);
    if (d > cone.range) return false;
    if (d < 2.5) return true;
    const r = reachAt(cone, dx, dy);
    return r >= 0 && d <= r;
  }

  // ---------- desenho ----------
  // Os cones são rasterizados pixel a pixel numa camada do tamanho da área de jogo: preenchimento
  // vermelho (~23 a 40%, mais forte na metade perto do vigia) e borda clara (~80%). V2: o tom muda
  // conforme o brilho do chão embaixo (Vision.ground; o Room.build calcula): vermelho fundo no chão
  // escuro e salmão no claro, para não ficar marrom na grama (coneFx da simulação).
  let layer = null, img = null, mask = null, lum = null, lumW = 0;
  const FILL = [255, 58, 50], EDGE = [255, 92, 80];
  const FILL_DK = [200, 36, 28], FILL_LT = [255, 144, 128], EDGE_DK = [255, 140, 124], EDGE_LT = [255, 208, 196];
  const tone = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // tons já prontos para cada brilho do chão (0 a 255)
  const FILLS = [], EDGES = [];
  for (let i = 0; i < 256; i++) { FILLS.push(tone(FILL_DK, FILL_LT, i / 255).map(Math.round)); EDGES.push(tone(EDGE_DK, EDGE_LT, i / 255 * 0.4).map(Math.round)); }

  // brilho do chão da sala (Uint8Array, w por linha), ou null para o vermelho de sempre
  function ground(l, w) {
    lum = l;
    lumW = w;
  }

  function begin(w, h) {
    if (!layer || layer.width !== w || layer.height !== h) {
      layer = Gfx.canvas(w, h);
      img = layer.cx.createImageData(w, h);
    }
    img.data.fill(0);
  }

  function put(i, rgb, a) {
    const d = img.data, o = i * 4, A = Math.round(a * 255);
    if (A <= d[o + 3]) return;
    d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = A;
  }

  // ox, oy: deslocamento do mundo para a camada (câmera). boost: 0..1, o cone "acende" quando vê a Ellen
  function paint(cone, ox, oy, boost) {
    const W = layer.width, H = layer.height;
    const cx = cone.x - ox, cy = cone.y - oy;
    // V2: só o retângulo que o cone ocupa de verdade (as pontas de cada raio, e entre um raio e o
    // outro, o maior dos dois), e não o quadrado inteiro do alcance: o desenho fica igual e bem
    // mais rápido (o cone da V2 é 1,25× maior)
    let bx0 = cx - 3, bx1 = cx + 3, by0 = cy - 3, by1 = cy + 3;
    const n = cone.lens ? cone.lens.length : 0;
    for (let i = 0; i < n * 2 - 1; i++) {
      const f = i / 2, a = cone.look + (f / (n - 1) * 2 - 1) * cone.half;
      const r = (i % 2 ? Math.max(cone.lens[(i - 1) / 2], cone.lens[(i + 1) / 2]) : cone.lens[f]) + 2;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      if (px < bx0) bx0 = px; if (px > bx1) bx1 = px;
      if (py < by0) by0 = py; if (py > by1) by1 = py;
    }
    if (!n) { const R = Math.ceil(cone.range) + 1; bx0 = cx - R; bx1 = cx + R; by0 = cy - R; by1 = cy + R; }
    const x0 = Math.max(0, Math.floor(bx0)), x1 = Math.min(W - 1, Math.ceil(bx1));
    const y0 = Math.max(0, Math.floor(by0)), y1 = Math.min(H - 1, Math.ceil(by1));
    if (x0 > x1 || y0 > y1) return;
    const bw = x1 - x0 + 3, bh = y1 - y0 + 3;
    if (!mask || mask.length < bw * bh) mask = new Uint8Array(bw * bh * 2);
    mask.fill(0, 0, bw * bh);
    // 1) quem está dentro (com 1 px de margem para achar a borda). Antes da conta exata, descarta
    // depressa o que está claramente fora: longe demais, ou fora do ângulo (com uma folga de 0,02 rad,
    // pelo produto vetorial com as duas bordas do cone)
    const R2 = cone.range * cone.range, wide = cone.half + 0.02 >= Math.PI / 2;
    const e1x = Math.cos(cone.look - cone.half - 0.02), e1y = Math.sin(cone.look - cone.half - 0.02);
    const e2x = Math.cos(cone.look + cone.half + 0.02), e2y = Math.sin(cone.look + cone.half + 0.02);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        if (!wide && d2 >= 6.25 && (e1x * dy - e1y * dx < 0 || dx * e2y - dy * e2x < 0)) continue;
        const d = Math.hypot(dx, dy);
        if (d > cone.range) continue;
        const r = d < 2.5 ? d : reachAt(cone, dx, dy);
        if (r >= 0 && d <= r) mask[(y - y0 + 1) * bw + (x - x0 + 1)] = d < cone.range / 2 ? 2 : 1;
      }
    }
    // 2) cor: borda onde algum vizinho está fora
    if (lum) {
      const fillNear = 0.38 + 0.14 * boost, fillFar = 0.28 + 0.12 * boost, edgeA = 0.78 + 0.2 * boost;
      for (let y = y0; y <= y1; y++) {
        const row = (y + oy) * lumW + ox;
        for (let x = x0; x <= x1; x++) {
          const m = (y - y0 + 1) * bw + (x - x0 + 1), v = mask[m];
          if (!v) continue;
          const l = lum[row + x] || 0;
          const edge = !mask[m - 1] || !mask[m + 1] || !mask[m - bw] || !mask[m + bw];
          if (edge) put(y * W + x, EDGES[l], edgeA);
          else put(y * W + x, FILLS[l], v === 2 ? fillNear : fillFar);
        }
      }
      return;
    }
    const fillNear = 0.27 + 0.12 * boost, fillFar = 0.19 + 0.1 * boost, edgeA = 0.7 + 0.25 * boost;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const m = (y - y0 + 1) * bw + (x - x0 + 1), v = mask[m];
        if (!v) continue;
        const edge = !mask[m - 1] || !mask[m + 1] || !mask[m - bw] || !mask[m + bw];
        if (edge) put(y * W + x, EDGE, edgeA);
        else put(y * W + x, FILL, v === 2 ? fillNear : fillFar);
      }
    }
  }

  function end(ctx, x, y) {
    layer.cx.putImageData(img, 0, 0);
    ctx.drawImage(layer, x, y);
  }

  return { angleDiff, rayHit, cast, inside, begin, paint, end, ground };
})();
