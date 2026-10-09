// Arte da V2 (V2_32BITS.md, seção 4): as ferramentas para pintar os cenários pixel a pixel, no estilo
// da simulação (docs/v2/mockup/art.js), e a montagem do fundo de um cenário refeito.
//
// Um cenário é "da V2" quando o estilo da parede dele (look.wall.style) existe em Art.walls. Nesse
// caso o Room.build pinta o fundo direto em coordenadas novas (480 × 240), com os pintores daqui:
//   Art.floors[nome](s, look, k)   piso      s = a superfície do cenário (ver surface), look = o look
//   Art.walls[nome](s, look, k)    parede    já ampliado (coordenadas novas), k = ferramentas extras
//   Art.edges[nome](s, x, top, gap, side, look)   borda lateral (x = começo da coluna de 5 px)
// e os objetos que têm `art` são desenhados no tamanho novo (ver scenery.js). Os objetos parados
// projetam a sombra no chão pelo próprio desenho, conforme a luz do cenário:
//   look.light: { k: [kx, ky], color, contact }
//     k        para onde a sombra estica: cada px de altura anda kx para o lado e ky para baixo
//              (tarde: comprida; dentro de casa: curta; à noite: quase só a mancha de contato)
//     color    a cor que multiplica o chão na sombra (azulada de dia, quente dentro de casa)
//     contact  a cor da mancha de contato (mais escura, embaixo de cada coisa)
// e a luz do ambiente (noite, planetário) fica pronta numa camada por cenário (Art.ambient).
//
// Superfície: Art.surface(w, h) é uma imagem RGBA com put/get/rect/line e as formas sombreadas.
// Sprite de objeto: é uma superfície com fundo transparente; outline() faz o contorno seletivo (a
// cor de dentro escurecida, e não preto).
const Art = (() => {
  // ---------- cores ----------
  const cache = {};
  const rgb = c => {
    if (typeof c !== 'string') return c;
    return cache[c] || (cache[c] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
  };
  const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const mix = (a, b, t) => { a = rgb(a); b = rgb(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  const mul = (a, k) => { a = rgb(a); return typeof k === 'number' ? [a[0] * k, a[1] * k, a[2] * k] : (k = rgb(k), [a[0] * k[0] / 255, a[1] * k[1] / 255, a[2] * k[2] / 255]); };
  const lum = c => { c = rgb(c); return (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255; };
  const hex = c => { c = rgb(c); return '#' + ((1 << 24) | (Math.round(c[0]) << 16) | (Math.round(c[1]) << 8) | Math.round(c[2])).toString(16).slice(1).toUpperCase(); };

  // Rampa de n tons a partir da cor base (no meio): a sombra escurece e puxa para o roxo-azulado,
  // a luz clareia e puxa para o amarelo. o.dark/o.lift: quanto escurece e clareia nas pontas.
  const SHADE = '#262050', LIGHT = '#FFF6D6';
  function ramp(base, o = {}) {
    const n = o.n || 7, mid = (n - 1) / 2, out = [];
    const dark = o.dark === undefined ? 0.45 : o.dark, lift = o.lift === undefined ? 0.5 : o.lift;
    const cool = o.cool === undefined ? 0.22 : o.cool;
    for (let i = 0; i < n; i++) {
      const k = (i - mid) / mid;
      out.push(k < 0 ? mix(mul(base, 1 + k * dark), o.shade || SHADE, -k * cool) : mix(base, o.light || LIGHT, k * lift));
    }
    return out;
  }
  // rampa a partir de uma lista de cores (#hex)
  const tones = list => list.map(rgb);

  // ---------- pontilhado e ruído ----------
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bay = (x, y) => (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
  // escolhe o tom da rampa para t (0 a 1), pontilhando entre um tom e o próximo
  function pick(r, t, x, y) {
    t = c01(t);
    const f = t * (r.length - 1);
    let i = Math.floor(f);
    if (f - i > bay(x, y)) i++;
    return r[i < r.length ? i : r.length - 1];
  }
  // o mesmo, mas com faixas lisas e só a passagem pontilhada (sharp: maior = passagem mais estreita)
  function band(r, t, x, y, sharp = 2.5) {
    t = c01(t);
    const f = t * (r.length - 1);
    let i = Math.floor(f);
    if (c01((f - i - 0.5) * sharp + 0.5) > bay(x, y)) i++;
    return r[i < r.length ? i : r.length - 1];
  }
  const hash = (x, y, s = 0) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  // ruído suave (sc = tamanho das manchas, em px)
  function vnoise(x, y, sc, s = 0) {
    const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  // luz de cima e da esquerda; sphere(nx, ny) = quanto a normal da elipse recebe de luz (0 a 1)
  const L = (() => { const v = [-0.55, -0.72, 0.42], m = Math.hypot(...v); return v.map(a => a / m); })();
  const sphere = (nx, ny) => {
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    return c01(0.5 + 0.62 * (nx * L[0] + ny * L[1] + nz * L[2]));
  };
  const clamp1 = v => (v < -1 ? -1 : v > 1 ? 1 : v);

  // ---------- superfície ----------
  function surface(w, h) {
    const d = new Uint8ClampedArray(w * h * 4);
    const s = { w, h, d, cx0: 0, cy0: 0, cx1: w, cy1: h };

    // recorte: nada é pintado fora (x0, y0)–(x1, y1)
    s.clip = (x0 = 0, y0 = 0, x1 = w, y1 = h) => { s.cx0 = Math.max(0, x0); s.cy0 = Math.max(0, y0); s.cx1 = Math.min(w, x1); s.cy1 = Math.min(h, y1); return s; };

    s.put = (x, y, c, a = 1) => {
      x = Math.floor(x); y = Math.floor(y);
      if (x < s.cx0 || y < s.cy0 || x >= s.cx1 || y >= s.cy1 || a <= 0 || !c) return;
      const i = (y * w + x) * 4, v = rgb(c);
      if (a >= 1 || d[i + 3] === 0) {
        d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2];
        d[i + 3] = a >= 1 ? 255 : Math.max(d[i + 3], a * 255);
      } else {
        d[i] += (v[0] - d[i]) * a; d[i + 1] += (v[1] - d[i + 1]) * a; d[i + 2] += (v[2] - d[i + 2]) * a;
      }
    };
    // transparência em degraus de 1/8 (como a mistura de cores dos 32 bits)
    s.tput = (x, y, c, a) => s.put(x, y, c, Math.round(c01(a) * 8) / 8);
    s.get = (x, y) => {
      x = Math.floor(x); y = Math.floor(y);
      if (x < 0 || y < 0 || x >= w || y >= h) return null;
      const i = (y * w + x) * 4;
      return d[i + 3] ? [d[i], d[i + 1], d[i + 2]] : null;
    };
    s.alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[((y | 0) * w + (x | 0)) * 4 + 3]);
    s.erase = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) d[((y | 0) * w + (x | 0)) * 4 + 3] = 0; };
    // multiplica a cor que já está ali (sombra, luz do ambiente)
    s.mul = (x, y, k, a = 1) => {
      const c = s.get(x, y);
      if (c) s.put(x, y, mix(c, mul(c, k), a));
    };

    s.rect = (x, y, rw, rh, c, a = 1) => {
      for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) s.put(x + i, y + j, c, a);
    };
    // fn(x, y) → cor (ou null) para cada pixel do retângulo
    s.fill = (x, y, rw, rh, fn) => {
      for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) {
        const c = fn(x + i, y + j, i, j);
        if (c) s.put(x + i, y + j, c);
      }
    };
    s.line = (x0, y0, x1, y1, c, a = 1) => {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) {
        s.put(x0, y0, c, a);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    };
    // elipse: fn(x, y, nx, ny) → cor, com nx, ny de -1 a 1 dentro dela
    s.ellipse = (cx, cy, rx, ry, fn) => {
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny > 1) continue;
        const c = typeof fn === 'function' ? fn(x, y, nx, ny) : fn;
        if (c) s.put(x, y, c);
      }
    };
    // elipse sombreada como esfera (copas, cabeças, bolas de sorvete, nuvens)
    s.ball = (cx, cy, rx, ry, r, bias = 0, cond = null) => s.ellipse(cx, cy, rx, ry, (x, y, nx, ny) =>
      (cond && !cond(x, y, nx, ny)) ? null : pick(r, sphere(nx, ny) + bias, x, y));
    // membro grosso de (x0, y0) a (x1, y1), claro do lado esquerdo (pés de móvel, canos)
    s.limb = (x0, y0, x1, y1, lw, r, bias = 0) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
      for (let q = 0; q <= n; q++) {
        const t = q / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        for (let i = 0; i < lw; i++) {
          const px = Math.round(x - lw / 2 + i + 0.5), py = Math.round(y);
          s.put(px, py, pick(r, 0.85 - (i / Math.max(1, lw - 1)) * 0.7 + bias, px, py));
        }
      }
    };
    // caixa vista de cima e de frente: tampo (top px de altura) e frente; o lado esquerdo mais claro
    s.box = (x, y, bw, bh, top, rTop, rFront, o = {}) => {
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) {
        const px = x + i, py = y + j;
        let t;
        if (j < top) {
          t = 0.62 - (i / bw) * 0.18 + (j === 0 ? 0.25 : 0) - (j === top - 1 ? 0.18 : 0) + (o.noise ? (vnoise(px, py, o.noise[0], o.noise[1]) - 0.5) * o.noise[2] : 0);
          s.put(px, py, pick(rTop, t, px, py));
        } else {
          t = 0.55 - (i / bw) * 0.25 - ((j - top) / Math.max(1, bh - top)) * 0.2 + (i === 0 ? 0.2 : 0) - (i === bw - 1 ? 0.2 : 0);
          s.put(px, py, pick(rFront, t, px, py));
        }
      }
    };
    // copia outra superfície (sprite) para cá, em (ox, oy)
    s.blit = (src, ox, oy) => {
      const sd = src.d;
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4, a = sd[i + 3];
        if (a) s.put(ox + x, oy + y, [sd[i], sd[i + 1], sd[i + 2]], a / 255);
      }
    };
    // contorno seletivo: em volta do desenho, a cor de dentro escurecida (k = quanto da cor fica)
    s.outline = (k = 0.42, only) => {
      const add = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (s.alpha(x, y) > 0) continue;
        let n = null, lit = true;
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          if (s.alpha(x + dx, y + dy) < 200) continue;
          const v = s.get(x + dx, y + dy);
          if (dx < 0 || dy < 0) lit = false;
          if (!n || v[0] + v[1] + v[2] < n[0] + n[1] + n[2]) n = v;
        }
        if (n && (!only || only(x, y))) {
          const kk = lit ? k + 0.08 : k;
          add.push([x, y, [n[0] * kk + 26 * (1 - kk) * 0.6, n[1] * kk + 18 * (1 - kk) * 0.6, n[2] * kk + 34 * (1 - kk) * 0.6]]);
        }
      }
      add.forEach(([x, y, c]) => s.put(x, y, c));
      return s;
    };
    // vira canvas (para desenhar com o ctx)
    s.canvas = () => {
      const cv = Gfx.canvas(w, h);
      const img = cv.cx.createImageData(w, h);
      img.data.set(d);
      cv.cx.putImageData(img, 0, 0);
      return cv;
    };
    // pinta um canvas por cima (textos, por exemplo), com a mesma transparência
    s.draw = (cv, ox = 0, oy = 0) => {
      const id = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
        const i = (y * cv.width + x) * 4;
        if (id[i + 3]) s.put(ox + x, oy + y, [id[i], id[i + 1], id[i + 2]], id[i + 3] / 255);
      }
    };
    return s;
  }

  // texto da fonte do jogo como canvas (letreiros): o Room.build usa a fonte da V1 durante a montagem
  function text(str, color, o = {}) {
    const prev = Gfx.font('v2');
    try {
      const w = Gfx.textWidth(str) + 2, cv = Gfx.canvas(w, 12);
      Gfx.text(str, 0, 0, color, Object.assign({ ctx: cv.cx }, o));
      return cv;
    } finally {
      Gfx.font(prev);
    }
  }

  // ---------- sombras no chão ----------
  // máscara do tamanho do cenário: 1 = sombra projetada, 2 = contato (mais escura)
  function shadowMask(w, h) {
    return { w, h, m: new Uint8Array(w * h) };
  }
  // Projeta o desenho do sprite no chão. base = a linha do chão do objeto (y, na superfície).
  //   mode 'up' (padrão): o objeto fica em pé na base; cada pixel está (base - y) px acima do chão
  //   mode 'flat': o desenho é um tampo a H px do chão (mesa, cama): cada pixel desce H e estica H × k
  function cast(mask, spr, ox, oy, base, k, mode = 'up', H = 0) {
    const { w, m } = mask;
    for (let y = 0; y < spr.h; y++) for (let x = 0; x < spr.w; x++) {
      if (spr.alpha(x, y) < 128) continue;
      let tx, ty;
      if (mode === 'flat') {
        tx = Math.round(ox + x + H * k[0]);
        ty = Math.round(oy + y + H + H * k[1]);
      } else {
        const hh = Math.max(0, base - (oy + y));
        tx = Math.round(ox + x + hh * k[0]);
        ty = Math.round(base + hh * k[1]);
      }
      for (const dx of [0, 1]) {
        const X = tx + dx;
        if (X >= 0 && X < w && ty >= 0 && ty < mask.h && !m[ty * w + X]) m[ty * w + X] = 1;
      }
    }
  }
  function contact(mask, cx, cy, rx, ry) {
    for (let y = -Math.ceil(ry); y <= ry; y++) for (let x = -Math.ceil(rx); x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1) continue;
      const X = Math.round(cx + x), Y = Math.round(cy + y);
      if (X >= 0 && Y >= 0 && X < mask.w && Y < mask.h) mask.m[Y * mask.w + X] = 2;
    }
  }
  // aplica a máscara no chão (de y0 para baixo): multiplica pela cor da sombra; a borda fica
  // pontilhada pela metade (penumbra)
  function applyShadows(s, mask, light, y0 = 0) {
    const { w, h, m } = mask;
    const kc = rgb(light.color || '#A4B2D2'), kk = rgb(light.contact || mix(kc, '#3A3050', 0.35));
    for (let y = Math.max(0, y0); y < h; y++) for (let x = 0; x < w; x++) {
      const v = m[y * w + x];
      if (v) { s.mul(x, y, v === 2 ? kk : kc); continue; }
      const near = (x > 0 && m[y * w + x - 1] === 1) + (x < w - 1 && m[y * w + x + 1] === 1) + (y > 0 && m[(y - 1) * w + x] === 1) + (y < h - 1 && m[(y + 1) * w + x] === 1);
      if (near && bay(x, y) < 0.25 * near) s.mul(x, y, kc, 0.5);
    }
  }

  // Sombra de um personagem (sprite em canvas) pela luz do cenário: o desenho projetado no chão a
  // partir dos pés (base = última linha), numa cor só, para desenhar com 'multiply'. Em cache.
  const charShadows = new WeakMap();
  function spriteShadow(img, light) {
    const key = light.k.join(',') + (light.color || '');
    let per = charShadows.get(img);
    if (!per) charShadows.set(img, (per = {}));
    if (per[key]) return per[key];
    const w = img.width, h = img.height, k = light.k;
    const src = (img.cx || img.getContext('2d')).getImageData(0, 0, w, h).data;
    let maxH = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (src[(y * w + x) * 4 + 3]) maxH = Math.max(maxH, h - 1 - y);
    const pad = Math.ceil(maxH * Math.abs(k[0])) + 3, ph = Math.ceil(maxH * Math.max(0, k[1])) + 4;
    const out = surface(w + pad * 2, ph);
    const c = light.color || '#A4B2D2';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!src[(y * w + x) * 4 + 3]) continue;
      const hh = h - 1 - y;
      const tx = Math.round(pad + x + hh * k[0]), ty = Math.round(1 + hh * k[1]);
      out.put(tx, ty, c);
      out.put(tx + 1, ty, c);
    }
    // contato embaixo dos pés
    out.ellipse(pad + w / 2, 1.5, 6.5, 2, light.contact || mix(c, '#3A3050', 0.35));
    return (per[key] = { cv: out.canvas(), dx: -pad, dy: h - 2 });
  }

  // ---------- luz do ambiente ----------
  // Camada pronta de um cenário (480 × 240): o quanto cada pixel escurece (multiply) e o brilho das
  // luzes (somado). tint.color = a cor do ambiente; tint.lights = [[x, y, raio, cor], ...] (coordenadas
  // novas). Em volta de cada luz, o ambiente clareia em degraus pontilhados até a cor da luz.
  function ambient(w, h, tint) {
    const dark = surface(w, h), glow = surface(w, h);
    const base = rgb(tint.color), lights = tint.lights || [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let c = base, add = 0, addC = null;
      for (const [lx, ly, r, col, warm] of lights) {
        const dd = Math.hypot(x + 0.5 - lx, (y + 0.5 - ly) * 1.5) / r;
        if (dd >= 1) continue;
        const t = Math.pow(1 - dd, 0.8);
        // degraus de 1/5, com pontilhado entre eles
        const q = Math.min(1, Math.floor(t * 5 + bay(x, y)) / 5);
        c = mix(c, warm || '#FFF4E0', q * 0.92);
        if (t > add) { add = t; addC = col; }
      }
      dark.put(x, y, c);
      if (addC && add > 0.05) {
        const q = Math.floor(add * 4 + bay(x, y) * 0.999) / 4;
        if (q > 0) glow.put(x, y, mul(addC, q));
      }
    }
    return { dark: dark.canvas(), glow: glow.canvas() };
  }

  // vinheta leve nas bordas da área de jogo (como na simulação), em degraus pontilhados
  let vig = null;
  function vignette(w, h) {
    if (vig && vig.width === w && vig.height === h) return vig;
    const s = surface(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const vx = (x - w / 2) / (w / 2), vy = (y - h / 2) / (h / 2), v = Math.max(0, vx * vx + vy * vy - 0.55);
      const a = Math.round(c01(v * 0.2 + (bay(x, y) - 0.5) * 0.03) * 16) / 16;
      if (a > 0) s.put(x, y, '#141022', a);
    }
    return (vig = s.canvas());
  }

  return {
    rgb, mix, mul, lum, hex, c01, ramp, tones, bay, pick, band, hash, vnoise, L, sphere, clamp1,
    surface, text, shadowMask, cast, contact, applyShadows, spriteShadow, ambient, vignette,
    // pintores por estilo (ver o topo do arquivo). posts[estilo de parede](S, look): uma camada
    // transparente por cima de tudo (raios de sol); scenefx[estilo](ctx, ox, world, look): animação
    // do cenário inteiro (poeira na luz, borboletas, brilho no mar), em coordenadas novas da sala
    floors: {}, walls: {}, edges: {}, posts: {}, scenefx: {}
  };
})();
