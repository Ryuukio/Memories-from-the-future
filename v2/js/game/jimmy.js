// Big Jimmy Junk (Apêndice B): um cheeseburger gigante com queijo derretendo e gergelim no topo,
// bigode de ketchup e mostarda, corrente de ouro com pingente de donut e um copo de refrigerante
// gigante como cetro. Capangas: batatas fritas soldado e copos de refrigerante. Tudo desenhado em
// código, com o contorno colorido do Apêndice E (o contorno é calculado em volta das formas).
//
// Jimmy.sprite('normal' | 'super')  → canvas (normal ~64×64 + o cetro; super ~96×96, com batata
//                                     e refrigerante gigantes). Os pés ficam no meio da base.
// Jimmy.draw(ctx, x, y, { form, t, fall })   desenha com os pés em (x, y); fall de 0 a 1 = caindo
// Jimmy.minion(tipo, quadro)          'fry' | 'cup', quadro 0 ou 1 (andar parado)
const Jimmy = (() => {
  const OUT = '#1E1826';
  const cache = {};

  // contorno de 1 px em volta do que foi pintado: 70% de #1E1826 + 30% da cor vizinha (Apêndice E.1)
  function outline(cv) {
    const w = cv.width, h = cv.height, img = cv.cx.getImageData(0, 0, w, h), d = img.data;
    const src = new Uint8ClampedArray(d);
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : (y * w + x) * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = at(x, y);
        if (src[o + 3]) continue;
        let best = -1, lum = 9;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const n = at(x + dx, y + dy);
          if (n < 0 || !src[n + 3] || src[n + 3] === 254) return;
          const l = src[n] * 0.3 + src[n + 1] * 0.59 + src[n + 2] * 0.11;
          if (l < lum * 255 || best < 0) { lum = l / 255; best = n; }
        });
        if (best < 0) continue;
        d[o] = Math.round(0x1E * 0.7 + src[best] * 0.3);
        d[o + 1] = Math.round(0x18 * 0.7 + src[best + 1] * 0.3);
        d[o + 2] = Math.round(0x26 * 0.7 + src[best + 2] * 0.3);
        d[o + 3] = 255;
      }
    }
    cv.cx.putImageData(img, 0, 0);
    return cv;
  }

  // elipse cheia, linha a linha
  function ell(c, x, y, w, h, color) {
    c.fillStyle = color;
    for (let j = 0; j < h; j++) {
      const dy = (j + 0.5 - h / 2) / (h / 2);
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) c.fillRect(x0, y + j, x1 - x0, 1);
    }
  }

  // o hambúrguer em escala s (1 = ~64 px de altura), com o canto do corpo em (ox, oy)
  function burger(c, s, ox, oy, t) {
    const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(ox + x * s), Math.round(oy + y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
    const E = (x, y, w, h, col) => ell(c, Math.round(ox + x * s), Math.round(oy + y * s), Math.round(w * s), Math.round(h * s), col);

    // pernas e tênis vermelhos
    R(19, 54, 5, 7, '#C98A4A'); R(36, 54, 5, 7, '#C98A4A');
    R(16, 60, 10, 4, '#D8283C'); R(34, 60, 10, 4, '#D8283C');
    R(16, 63, 10, 1, '#F4F0E8'); R(34, 63, 10, 1, '#F4F0E8');
    R(17, 60, 4, 1, '#F2687A'); R(35, 60, 4, 1, '#F2687A');

    // pão de baixo
    E(4, 44, 52, 13, '#B8742C');
    E(4, 43, 52, 11, '#D8913E');
    R(10, 45, 18, 1, '#E8AC5E');

    // carne, com marcas da grelha
    E(2, 36, 56, 12, '#5A3020');
    E(3, 35, 54, 10, '#7A4228');
    for (let k = 0; k < 6; k++) R(9 + k * 8, 39 + (k % 2), 4, 1, '#4A2614');
    R(8, 36, 20, 1, '#9A5A36');

    // queijo derretendo, com pingos
    R(4, 32, 52, 5, '#F2C42E');
    R(4, 32, 52, 1, '#FFE07A');
    [[8, 3], [17, 5], [29, 2], [41, 6], [50, 3]].forEach(([x, h]) => { R(x, 37, 3, h, '#F2C42E'); R(x + 1, 37 + h, 1, 1, '#E8A82A'); });

    // alface ondulada
    for (let x = 1; x < 59; x++) {
      const y = 29 + Math.round(Math.sin(x * 0.9) * 1.2);
      R(x, y, 1, 4, x % 5 === 0 ? '#3E8A2A' : '#5DAA3A');
      if (x % 3 === 0) R(x, y, 1, 1, '#8AD060');
    }

    // pão de cima, com brilho e gergelim
    E(0, 2, 60, 30, '#B87830');
    E(1, 1, 58, 28, '#E0A048');
    E(6, 3, 30, 12, '#F2C070');
    R(12, 5, 8, 2, '#FCE0A0');
    [[14, 6], [26, 4], [38, 6], [47, 10], [20, 11], [33, 10], [8, 13], [42, 3], [51, 15]].forEach(([x, y]) => {
      R(x, y, 3, 2, '#FFF4DA'); R(x + 1, y + 2, 2, 1, '#C88A3A');
    });

    // olhos zangados (piscam de vez em quando)
    const blink = t !== undefined && (t % 4) > 3.85;
    [[17, 14], [35, 14]].forEach(([x, y], i) => {
      if (blink) { R(x, y + 4, 9, 2, '#3A2016'); return; }
      E(x, y, 9, 9, '#FFFFFF');
      R(x + (i ? 2 : 3), y + 4, 3, 4, '#1E1826');
      R(x + (i ? 2 : 3), y + 4, 1, 1, '#FFFFFF');
    });
    // sobrancelhas
    R(16, 11, 4, 2, '#4A2614'); R(19, 12, 4, 2, '#4A2614'); R(22, 13, 4, 2, '#4A2614');
    R(43, 11, 4, 2, '#4A2614'); R(40, 12, 4, 2, '#4A2614'); R(37, 13, 4, 2, '#4A2614');

    // bigode: ketchup de um lado, mostarda do outro, com as pontas enroladas
    R(19, 23, 11, 3, '#D8443A'); R(15, 22, 5, 2, '#D8443A'); R(13, 20, 3, 3, '#D8443A'); R(20, 23, 6, 1, '#F07A6A');
    R(30, 23, 11, 3, '#F2C42E'); R(40, 22, 5, 2, '#F2C42E'); R(44, 20, 3, 3, '#F2C42E'); R(31, 23, 6, 1, '#FFE07A');
    // sorriso maroto
    R(22, 27, 16, 2, '#3A1610');
    R(24, 27, 3, 1, '#FFFFFF'); R(29, 27, 3, 1, '#FFFFFF'); R(34, 27, 3, 1, '#FFFFFF');

    // corrente de ouro com o donut
    for (let x = 10; x < 50; x++) {
      const y = 38 + Math.round(Math.sin((x - 10) / 40 * Math.PI) * 7);
      R(x, y, 1, 1, x % 3 ? '#F2C14E' : '#B8862A');
    }
    E(26, 43, 9, 9, '#C88A3A');
    E(26, 43, 9, 7, '#F07AA8');
    R(29, 46, 3, 2, '#7A4228');
    R(27, 44, 1, 1, '#FFFFFF'); R(33, 45, 1, 1, '#5DD0F0'); R(28, 49, 1, 1, '#F2E040');

    // braços (luvas brancas)
    R(-4, 38, 6, 3, '#C98A4A'); R(-7, 39, 4, 4, '#F4F0E8');
    R(58, 36, 5, 3, '#C98A4A');
  }

  // copo de refrigerante (o cetro): vermelho e branco, tampa e canudo
  function cup(c, x, y, w, h) {
    const R = (a, b, ww, hh, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), Math.round(ww), Math.round(hh)); };
    R(w * 0.55, -h * 0.35, Math.max(2, w * 0.14), h * 0.4, '#F4F0E8');
    R(w * 0.55, -h * 0.35, Math.max(1, w * 0.06), h * 0.4, '#D8443A');
    R(-1, 0, w + 2, Math.max(2, h * 0.07), '#E8ECF2');
    for (let j = 0; j < h; j++) {
      const k = j / h, inset = Math.round(k * w * 0.18);
      R(inset, Math.max(2, h * 0.07) + j, w - inset * 2, 1, (Math.floor(j / (h / 6)) % 2) ? '#F4F0E8' : '#D8443A');
    }
    R(w * 0.2, h * 0.3, Math.max(1, w * 0.12), h * 0.5, '#F2E0E0');
  }

  // caixa de batatas fritas
  function fries(c, x, y, w, h) {
    const R = (a, b, ww, hh, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a), Math.round(y + b), Math.max(1, Math.round(ww)), Math.max(1, Math.round(hh))); };
    const n = Math.max(5, Math.round(w / 3));
    for (let i = 0; i < n; i++) {
      const fx = w * 0.08 + i * (w * 0.84 / n), fh = h * (0.45 + ((i * 7) % 5) * 0.06);
      R(fx, h * 0.45 - fh, Math.max(2, w / n - 1), fh, i % 2 ? '#F2C42E' : '#FFD84A');
      R(fx, h * 0.45 - fh, 1, Math.max(1, fh * 0.3), '#FFF0A0');
    }
    for (let j = 0; j < h * 0.6; j++) {
      const inset = Math.round((1 - j / (h * 0.6)) * w * 0.1);
      R(inset, h * 0.4 + j, w - inset * 2, 1, '#D8283C');
    }
    R(w * 0.3, h * 0.6, w * 0.4, Math.max(2, h * 0.12), '#F2C14E');
  }

  function build(form) {
    if (form === 'super') {
      const cv = Gfx.canvas(140, 116);
      burger(cv.cx, 1.5, 26, 16, 0);
      fries(cv.cx, 2, 44, 26, 40);        // batata gigante na mão esquerda
      cup(cv.cx, 118, 34, 20, 52);         // refrigerante gigante na direita
      return outline(cv);
    }
    const cv = Gfx.canvas(92, 76);
    burger(cv.cx, 1, 14, 10, 0);
    cup(cv.cx, 76, 28, 13, 34);            // o cetro
    return outline(cv);
  }

  // versão com os olhos piscando (quadro separado, para não redesenhar sempre)
  function buildBlink(form) {
    const cv = form === 'super' ? Gfx.canvas(140, 116) : Gfx.canvas(92, 76);
    if (form === 'super') { burger(cv.cx, 1.5, 26, 16, 3.9); fries(cv.cx, 2, 44, 26, 40); cup(cv.cx, 118, 34, 20, 52); }
    else { burger(cv.cx, 1, 14, 10, 3.9); cup(cv.cx, 76, 28, 13, 34); }
    return outline(cv);
  }

  const FEET = { normal: [44, 74], super: [71, 112] };

  function sprite(form = 'normal', blink = false) {
    const key = form + (blink ? '|b' : '');
    return cache[key] || (cache[key] = blink ? buildBlink(form) : build(form));
  }

  function draw(ctx, x, y, o = {}) {
    const form = o.form || 'normal', t = o.t || 0;
    const img = sprite(form, (t % 4) > 3.85);
    const [fx, fy] = FEET[form];
    const bob = Math.round(Math.sin(t * 2.2) * 1);
    Gfx.shadow(Math.round(x), Math.round(y), form === 'super' ? 70 : 48, form === 'super' ? 10 : 8);
    if (o.fall) {
      // caindo de um jeito ridículo: tomba para trás e afunda
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(-o.fall * 1.45);
      ctx.drawImage(img, -fx, -fy + Math.round(o.fall * 6));
      ctx.restore();
      return;
    }
    ctx.drawImage(img, Math.round(x) - fx, Math.round(y) - fy + bob);
  }

  // capangas: batata frita soldado e copo de refrigerante, 16×22, com olhos e pezinhos
  function minion(type, frame = 0) {
    const key = 'm|' + type + '|' + frame;
    if (cache[key]) return cache[key];
    const cv = Gfx.canvas(18, 24), c = cv.cx;
    const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    if (type === 'fry') {
      fries(c, 2, 1, 14, 20);
      // capacete de soldado (tampinha verde) e olhos
      R(4, 0, 10, 2, '#4E7A3A'); R(3, 2, 12, 1, '#3E6A2A');
    } else {
      cup(c, 3, 6, 12, 14);
    }
    R(6, 13, 2, 2, '#FFFFFF'); R(10, 13, 2, 2, '#FFFFFF');
    R(7, 14, 1, 1, '#1E1826'); R(11, 14, 1, 1, '#1E1826');
    R(5, 12, 3, 1, '#3A1610'); R(10, 12, 3, 1, '#3A1610');
    R(6 + frame, 21, 2, 2, '#3A2A30'); R(10 - frame, 21, 2, 2, '#3A2A30');
    return (cache[key] = outline(cv));
  }

  return { sprite, draw, minion, FEET };
})();
