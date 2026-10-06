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
    if (d < 2) return true;
    const r = reachAt(cone, dx, dy);
    return r >= 0 && d <= r;
  }

  // ---------- desenho ----------
  // Os cones são rasterizados pixel a pixel numa camada do tamanho da área de jogo: preenchimento
  // #FF3A32 (~23%, mais forte na metade perto do vigia) e borda #FF5C50 (~70%) — Apêndice E.1.
  let layer = null, img = null, mask = null;
  const FILL = [255, 58, 50], EDGE = [255, 92, 80];

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
    const R = Math.ceil(cone.range) + 1;
    const cx = cone.x - ox, cy = cone.y - oy;
    const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W - 1, Math.ceil(cx + R));
    const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H - 1, Math.ceil(cy + R));
    if (x0 > x1 || y0 > y1) return;
    const bw = x1 - x0 + 3, bh = y1 - y0 + 3;
    if (!mask || mask.length < bw * bh) mask = new Uint8Array(bw * bh * 2);
    mask.fill(0, 0, bw * bh);
    // 1) quem está dentro (com 1 px de margem para achar a borda)
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
        if (d > cone.range) continue;
        const r = d < 2 ? d : reachAt(cone, dx, dy);
        if (r >= 0 && d <= r) mask[(y - y0 + 1) * bw + (x - x0 + 1)] = d < cone.range / 2 ? 2 : 1;
      }
    }
    // 2) cor: borda onde algum vizinho está fora
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

  return { angleDiff, rayHit, cast, inside, begin, paint, end };
})();
