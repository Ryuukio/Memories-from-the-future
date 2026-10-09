// Big Jimmy Junk (Apêndice B): um cheeseburger gigante com queijo derretendo e gergelim no topo,
// bigode de ketchup e mostarda, corrente de ouro com pingente de donut e um copo de refrigerante
// gigante como cetro. Capangas: batatas fritas soldado e copos de refrigerante. Tudo desenhado em
// código, no estilo da V2: volumes com a luz de cima e da esquerda, rampas de cor com pontilhado
// (as mesmas dos personagens, Chars.ramp) e contorno com a cor de dentro escurecida.
//
// Tamanho da V2 (a V1 × 1,25): o normal tem ~80 px de altura (+ o cetro), o SUPERSIZE ~120 px, com
// batata e refrigerante gigantes; os capangas, ~22×30.
// Jimmy.sprite('normal' | 'super')  → canvas. Os pés ficam no meio da base (FEET).
// Jimmy.draw(ctx, x, y, { form, t, fall })   desenha com os pés em (x, y); fall de 0 a 1 = caindo
// Jimmy.minion(tipo, quadro)          'fry' | 'cup', quadro 0 ou 1 (andar parado)
const Jimmy = (() => {
  const K = 1.25;
  const OUT = [30, 24, 38];
  const cache = {};

  // ---------- luz e rampas (como em chars.js) ----------
  const L = (() => { const v = [-0.5, -0.62, 0.6], m = Math.hypot(...v); return v.map(a => a / m); })();
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bay = (x, y) => (BAYER[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
  function tone(hex, t, x, y) {
    const rp = Chars.ramp(hex);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const f = t * (rp.length - 1);
    let i = Math.floor(f);
    const fr = Math.max(0, Math.min(1, (f - i - 0.5) * 2.4 + 0.5));
    if (fr > bay(x, y)) i++;
    const c = rp[Math.min(rp.length - 1, i)];
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  }
  const shade = (nx, ny) => {
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const d = nx * L[0] + ny * L[1] + nz * L[2] - L[2];
    return 0.5 + d * (d > 0 ? 0.45 : 0.32);
  };

  // contorno de 1 px em volta do que foi pintado: a cor vizinha mais escura, escurecida
  function outline(cv) {
    const w = cv.width, h = cv.height, img = cv.cx.getImageData(0, 0, w, h), d = img.data;
    const src = new Uint8ClampedArray(d);
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : (y * w + x) * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = at(x, y);
        if (src[o + 3]) continue;
        let best = -1, lum = 1e9, lit = true;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const n = at(x + dx, y + dy);
          if (n < 0 || !src[n + 3]) return;
          if (dx < 0 || dy < 0) lit = false;
          const l = src[n] * 0.3 + src[n + 1] * 0.59 + src[n + 2] * 0.11;
          if (l < lum) { lum = l; best = n; }
        });
        if (best < 0) continue;
        const k = lit ? 0.5 : 0.64;
        for (let i = 0; i < 3; i++) d[o + i] = Math.round(src[best + i] + (OUT[i] - src[best + i]) * k);
        d[o + 3] = 255;
      }
    }
    cv.cx.putImageData(img, 0, 0);
    return cv;
  }

  // ---------- formas sombreadas ----------
  // elipse como esfera (cond(nx, ny) limita a parte desenhada; bias clareia ou escurece)
  function ball(c, x, y, w, h, hex, bias = 0, cond = null) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const nx = (i + 0.5 - w / 2) / (w / 2), ny = (j + 0.5 - h / 2) / (h / 2);
      if (nx * nx + ny * ny > 1 || (cond && !cond(nx, ny))) continue;
      c.fillStyle = tone(hex, shade(nx * 0.95, ny * 0.95) + bias, x + i, y + j);
      c.fillRect(x + i, y + j, 1, 1);
    }
  }
  // retângulo como cilindro em pé (luz da esquerda)
  function cyl(c, x, y, w, h, hex, bias = 0) {
    x = Math.round(x); y = Math.round(y); w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    for (let i = 0; i < w; i++) {
      const nx = w > 1 ? (i + 0.5) / w * 2 - 1 : 0;
      for (let j = 0; j < h; j++) {
        c.fillStyle = tone(hex, shade(nx * 0.9, -0.15) + bias - (j / h) * 0.08, x + i, y + j);
        c.fillRect(x + i, y + j, 1, 1);
      }
    }
  }
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };

  // o hambúrguer em escala s (1 = ~64 px de altura, o tamanho da V1), com o canto do corpo em (ox, oy)
  function burger(c, s, ox, oy, t) {
    const X = v => ox + v * s, Y = v => oy + v * s;
    const R = (x, y, w, h, col) => rect(c, X(x), Y(y), w * s, h * s, col);
    const E = (x, y, w, h, hex, bias, cond) => ball(c, X(x), Y(y), w * s, h * s, hex, bias, cond);
    const C = (x, y, w, h, hex, bias) => cyl(c, X(x), Y(y), w * s, h * s, hex, bias);

    // pernas e tênis vermelhos
    C(19, 53, 5, 8, '#C98A4A'); C(36, 53, 5, 8, '#C98A4A', -0.05);
    E(15, 59, 12, 6, '#D8283C'); E(33, 59, 12, 6, '#D8283C', -0.05);
    R(15.5, 63, 11, 1, '#F4F0E8'); R(33.5, 63, 11, 1, '#E4DED4');

    // pão de baixo
    E(3, 42, 54, 15, '#D8913E', -0.05);
    // carne, com marcas da grelha
    E(1, 34, 58, 14, '#7A4228');
    for (let k = 0; k < 6; k++) R(9 + k * 8, 39 + (k % 2), 4, 1, '#3E1E10');
    // queijo derretendo, com pingos
    C(3, 31, 54, 5, '#F2C42E', 0.05);
    R(3, 31, 54, 1, '#FFE89A');
    [[8, 3], [17, 5], [29, 2], [41, 6], [50, 3]].forEach(([x, h]) => {
      C(x, 36, 3, h, '#F2C42E');
      E(x - 0.3, 35 + h, 3.6, 3, '#F2C42E');
    });
    // alface ondulada
    for (let x = 0; x < 60; x++) {
      const y = 28 + Math.round(Math.sin(x * 0.9) * 1.2);
      C(x, y, 1, 4, x % 5 === 0 ? '#4A962E' : '#5DAA3A', 0.08 - Math.abs(x - 30) / 120);
    }
    // pão de cima, com brilho e gergelim
    E(0, 1, 60, 31, '#E0A048', 0.02, (nx, ny) => ny < 0.62);
    E(8, 3, 22, 9, '#F4C878', 0.12);
    [[14, 6], [26, 4], [38, 6], [47, 10], [20, 11], [33, 10], [8, 13], [42, 3], [51, 15]].forEach(([x, y]) => {
      E(x, y, 3.6, 2.6, '#FFF4DA', 0.1);
      R(x + 1, y + 2.3, 2, 0.8, '#B87A34');
    });

    // olhos zangados (piscam de vez em quando)
    const blink = t !== undefined && (t % 4) > 3.85;
    [[17, 14], [35, 14]].forEach(([x, y], i) => {
      if (blink) { R(x, y + 4, 9, 2, '#3A2016'); return; }
      E(x, y, 9, 9, '#FFFFFF', 0.15);
      R(x + (i ? 2 : 3), y + 3.5, 3, 4.5, '#1E1826');
      R(x + (i ? 2 : 3), y + 4, 1.2, 1.2, '#FFFFFF');
    });
    // sobrancelhas
    R(16, 11, 4, 2, '#4A2614'); R(19, 12, 4, 2, '#4A2614'); R(22, 13, 4, 2, '#4A2614');
    R(43, 11, 4, 2, '#4A2614'); R(40, 12, 4, 2, '#4A2614'); R(37, 13, 4, 2, '#4A2614');

    // bigode: ketchup de um lado, mostarda do outro, com as pontas enroladas
    E(18, 22, 13, 5, '#D8443A'); E(13, 19.5, 6, 5, '#D8443A', -0.05);
    E(29, 22, 13, 5, '#F2C42E'); E(41, 19.5, 6, 5, '#F2C42E', -0.05);
    // sorriso maroto
    R(22, 27, 16, 2, '#3A1610');
    R(24, 27, 3, 1, '#FFFFFF'); R(29, 27, 3, 1, '#FFFFFF'); R(34, 27, 3, 1, '#FFFFFF');

    // corrente de ouro com o donut
    for (let x = 10; x < 50; x++) {
      const y = 38 + Math.round(Math.sin((x - 10) / 40 * Math.PI) * 7);
      R(x, y, 1, 1, x % 3 ? '#F2C14E' : '#B8862A');
      if (x % 3 === 1) R(x, y, 1, 0.6, '#FFF0B0');
    }
    E(25.5, 42.5, 10, 10, '#C88A3A');
    E(25.5, 42.5, 10, 8, '#F07AA8', 0.05);
    E(28.5, 45.5, 4, 3, '#5A3020', -0.2);
    R(27, 44, 1, 1, '#FFFFFF'); R(33, 45, 1, 1, '#5DD0F0'); R(28, 49, 1, 1, '#F2E040'); R(31, 43, 1, 1, '#F2E040');

    // braços (luvas brancas)
    C(-4, 37, 6, 3, '#C98A4A'); E(-8, 37.5, 5.5, 5.5, '#F4F0E8');
    C(58, 35, 5, 3, '#C98A4A', -0.05);
  }

  // copo de refrigerante (o cetro): vermelho e branco, tampa e canudo (x, y, w, h em pixels)
  function cup(c, x, y, w, h) {
    cyl(c, x + w * 0.55, y - h * 0.35, Math.max(2, w * 0.14), h * 0.4, '#F4F0E8');
    rect(c, x + w * 0.55, y - h * 0.35, Math.max(1, w * 0.06), h * 0.4, '#D8443A');
    ball(c, x - 1, y - Math.max(2, h * 0.05), w + 2, Math.max(3, h * 0.12), '#E8ECF2', 0.05);
    const top = y + Math.max(2, h * 0.05);
    for (let j = 0; j < h; j++) {
      const inset = Math.round((j / h) * w * 0.18), ww = w - inset * 2;
      const band = (Math.floor(j / (h / 6)) % 2) ? '#F4F0E8' : '#D8443A';
      for (let i = 0; i < ww; i++) {
        const nx = (i + 0.5) / ww * 2 - 1;
        c.fillStyle = tone(band, shade(nx * 0.9, -0.1) - (j / h) * 0.06, Math.round(x + inset + i), Math.round(top + j));
        c.fillRect(Math.round(x + inset + i), Math.round(top + j), 1, 1);
      }
    }
  }

  // caixa de batatas fritas (x, y, w, h em pixels)
  function fries(c, x, y, w, h) {
    const n = Math.max(5, Math.round(w / 3.5));
    for (let i = 0; i < n; i++) {
      const fx = x + w * 0.08 + i * (w * 0.84 / n), fh = h * (0.45 + ((i * 7) % 5) * 0.06);
      cyl(c, fx, y + h * 0.45 - fh, Math.max(2, w / n - 1), fh, i % 2 ? '#F2C42E' : '#FFD84A', 0.05);
    }
    for (let j = 0; j < h * 0.6; j++) {
      const inset = Math.round((1 - j / (h * 0.6)) * w * 0.1), ww = Math.round(w - inset * 2);
      for (let i = 0; i < ww; i++) {
        const nx = (i + 0.5) / ww * 2 - 1;
        c.fillStyle = tone('#D8283C', shade(nx * 0.9, -0.1) - j / h * 0.1, Math.round(x + inset + i), Math.round(y + h * 0.4 + j));
        c.fillRect(Math.round(x + inset + i), Math.round(y + h * 0.4 + j), 1, 1);
      }
    }
    ball(c, x + w * 0.3, y + h * 0.58, w * 0.4, Math.max(3, h * 0.16), '#F2C14E', 0.05);
  }

  function art(form, t) {
    if (form === 'super') {
      const cv = Gfx.canvas(176, 146);
      burger(cv.cx, 1.5 * K, 26 * K, 16 * K, t);
      fries(cv.cx, 2 * K, 44 * K, 26 * K, 40 * K);        // batata gigante na mão esquerda
      cup(cv.cx, 118 * K, 34 * K, 20 * K, 52 * K);         // refrigerante gigante na direita
      return outline(cv);
    }
    const cv = Gfx.canvas(116, 96);
    burger(cv.cx, K, 14 * K, 10 * K, t);
    cup(cv.cx, 76 * K, 28 * K, 13 * K, 34 * K);            // o cetro
    return outline(cv);
  }

  const FEET = { normal: [55, 93], super: [89, 140] };

  // a versão com os olhos piscando é um quadro separado, para não redesenhar sempre
  function sprite(form = 'normal', blink = false) {
    const key = form + (blink ? '|b' : '');
    return cache[key] || (cache[key] = art(form, blink ? 3.9 : 0));
  }

  function draw(ctx, x, y, o = {}) {
    const form = o.form || 'normal', t = o.t || 0;
    const img = sprite(form, (t % 4) > 3.85);
    const [fx, fy] = FEET[form];
    const bob = Math.round(Math.sin(t * 2.2) * 1.25);
    Gfx.shadow(Math.round(x), Math.round(y), form === 'super' ? 88 : 60, form === 'super' ? 12 : 10);
    if (o.fall) {
      // caindo de um jeito ridículo: tomba para trás e afunda
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(-o.fall * 1.45);
      ctx.drawImage(img, -fx, -fy + Math.round(o.fall * 7.5));
      ctx.restore();
      return;
    }
    ctx.drawImage(img, Math.round(x) - fx, Math.round(y) - fy + bob);
  }

  // capangas: batata frita soldado e copo de refrigerante, ~22×30, com olhos e pezinhos
  function minion(type, frame = 0) {
    const key = 'm|' + type + '|' + frame;
    if (cache[key]) return cache[key];
    const cv = Gfx.canvas(24, 32), c = cv.cx;
    if (type === 'fry') {
      fries(c, 2.5, 3, 18, 25);
      // capacete de soldado (tampinha verde)
      ball(c, 4, 0, 15, 6, '#4E7A3A', 0.05, (nx, ny) => ny < 0.3);
      rect(c, 3, 3, 17, 1, '#2E5A22');
    } else {
      cup(c, 4, 8, 15, 18);
    }
    // olhos e pezinhos
    ball(c, 7, 16, 4, 4, '#FFFFFF', 0.2); ball(c, 12.5, 16, 4, 4, '#FFFFFF', 0.2);
    rect(c, 8.5, 17, 1.5, 2, '#1E1826'); rect(c, 14, 17, 1.5, 2, '#1E1826');
    rect(c, 6.5, 14.5, 4, 1, '#3A1610'); rect(c, 12.5, 14.5, 4, 1, '#3A1610');
    ball(c, 7 + frame * 1.5, 27, 4, 3, '#3A2A30'); ball(c, 13 - frame * 1.5, 27, 4, 3, '#3A2A30');
    return (cache[key] = outline(cv));
  }

  return { sprite, draw, minion, FEET };
})();
