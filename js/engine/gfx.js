// Desenho: retângulos, degradês, painéis, sombras e a montagem dos sprites a partir dos moldes
// do Apêndice E. Toda posição é arredondada para não borrar os pixels.
const Gfx = (() => {
  const ctx = Display.ctx;
  const OUTLINE = '#1E1826';
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const G = { ctx, W: Display.W, H: Display.H };

  // canvas fora da tela, com o contexto em `.cx`
  G.canvas = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.cx = c.getContext('2d');
    c.cx.imageSmoothingEnabled = false;
    return c;
  };

  G.rect = (x, y, w, h, color, c = ctx) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  // contorno de 1 px
  G.box = (x, y, w, h, color, c = ctx) => {
    G.rect(x, y, w, 1, color, c);
    G.rect(x, y + h - 1, w, 1, color, c);
    G.rect(x, y, 1, h, color, c);
    G.rect(x + w - 1, y, 1, h, color, c);
  };

  G.vgrad = (x, y, w, h, top, bottom, c = ctx) => {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
  };

  G.draw = (img, x, y, c = ctx) => c.drawImage(img, Math.round(x), Math.round(y));

  // ---------- cores ----------
  G.rgb = hex => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  G.hex = (r, g, b) => '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
  G.mix = (a, b, t) => {
    const A = G.rgb(a), B = G.rgb(b);
    return G.hex(...A.map((v, i) => Math.round(v + (B[i] - v) * t)));
  };
  G.lum = hex => {
    const [r, g, b] = G.rgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  // Faixas de cor com pontilhado Bayer 4×4 entre elas (céus e brilhos, Apêndice E.1).
  // `sharp` controla a largura da zona pontilhada (maior = faixas mais sólidas).
  G.dither = (c, x, y, w, h, colors, sharp = 4) => {
    const img = c.createImageData(w, h), d = img.data;
    const rgb = colors.map(G.rgb), n = colors.length;
    for (let j = 0; j < h; j++) {
      const p = h > 1 ? (j / (h - 1)) * (n - 1) : 0;
      const i = Math.min(n - 2, Math.floor(p));
      const f = Math.max(0, Math.min(1, (p - i - 0.5) * sharp + 0.5));
      for (let k = 0; k < w; k++) {
        const col = rgb[f > (BAYER[(y + j) & 3][(x + k) & 3] + 0.5) / 16 ? i + 1 : i];
        const o = (j * w + k) * 4;
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    c.putImageData(img, x, y);
  };

  // Painel padrão (caixa de diálogo, menus): degradê #28245A→#151233 a 93%,
  // borda externa #F2E8CC com cantos cortados e borda interna #7F74BC.
  G.panel = (x, y, w, h, alpha = 0.93) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    G.vgrad(x + 1, y + 1, w - 2, h - 2, '#28245A', '#151233');
    ctx.restore();
    G.box(x + 1, y + 1, w - 2, h - 2, '#7F74BC');
    G.rect(x + 1, y, w - 2, 1, '#F2E8CC');
    G.rect(x + 1, y + h - 1, w - 2, 1, '#F2E8CC');
    G.rect(x, y + 1, 1, h - 2, '#F2E8CC');
    G.rect(x + w - 1, y + 1, 1, h - 2, '#F2E8CC');
  };

  // Sombra no chão: elipse pixelada, escura, a cerca de 35% de opacidade.
  const shadows = {};
  G.shadow = (cx, cy, w, h, alpha = 0.35) => {
    const key = w + 'x' + h;
    let s = shadows[key];
    if (!s) {
      s = G.canvas(w, h);
      s.cx.fillStyle = '#140F1E';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = (x + 0.5 - w / 2) / (w / 2), dy = (y + 0.5 - h / 2) / (h / 2);
          if (dx * dx + dy * dy <= 1) s.cx.fillRect(x, y, 1, 1);
        }
      }
      shadows[key] = s;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(s, Math.round(cx - w / 2), Math.round(cy - h / 2));
    ctx.restore();
  };

  // ---------- sprites (Apêndice E.2) ----------

  // cabeça (15 linhas) + corpo (17 linhas) = molde de 16×32
  G.compose = (head, body) => head.concat(body);

  // troca letras numa faixa de linhas; ex.: cabelo meio a meio {h:'r', H:'R', j:'q'} nas linhas 0–6
  G.swapRows = (rows, from, to, map) =>
    rows.map((row, y) => (y < from || y > to) ? row : row.replace(/./g, ch => map[ch] || ch));

  // pinta uma linha inteira com uma letra, sem mexer no contorno (curativo do Fabio do presente)
  G.paintRow = (rows, y, ch) => rows.map((row, i) => (i === y ? row.replace(/[^.o]/g, ch) : row));

  // aplica [x, y, letra] só onde o molde é transparente (capuz do moletom)
  G.overlay = (rows, points) => {
    const out = rows.slice();
    points.forEach(([x, y, ch]) => {
      if (out[y] && out[y][x] === '.') out[y] = out[y].slice(0, x) + ch + out[y].slice(x + 1);
    });
    return out;
  };

  // Desenha um molde com a paleta. O contorno "o" recebe 70% de #1E1826 + 30% da cor vizinha
  // mais escura. opts.pattern(letra, x, y) pode devolver a cor de uma estampa naquele pixel.
  const warned = {};
  G.buildSprite = (rows, palette, opts = {}) => {
    const h = rows.length, w = rows[0].length;
    const px = rows.map((row, y) => Array.from(row, (ch, x) => {
      if (ch === '.') return null;
      if (ch === 'o') return 'o';
      const c = (opts.pattern && opts.pattern(ch, x, y)) || palette[ch];
      if (c) return c;
      if (!warned[ch]) { warned[ch] = true; console.warn('Sprite: a letra "' + ch + '" não tem cor na paleta'); }
      return '#FF00FF';
    }));
    const cv = G.canvas(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let c = px[y][x];
        if (!c) continue;
        if (c === 'o') c = outlineColor(px, x, y);
        cv.cx.fillStyle = c;
        cv.cx.fillRect(x, y, 1, 1);
      }
    }
    return cv;
  };

  function outlineColor(px, x, y) {
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]], diag = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (const ring of [near, diag]) {
      let darkest = null, dl = 2;
      for (const [dx, dy] of ring) {
        const c = px[y + dy] && px[y + dy][x + dx];
        if (c && c !== 'o') {
          const l = G.lum(c);
          if (l < dl) { dl = l; darkest = c; }
        }
      }
      if (darkest) return G.mix(OUTLINE, darkest, 0.3);
    }
    return OUTLINE;
  }

  // espelha na horizontal (virar para o outro lado)
  G.flip = img => {
    const cv = G.canvas(img.width, img.height);
    cv.cx.translate(img.width, 0);
    cv.cx.scale(-1, 1);
    cv.cx.drawImage(img, 0, 0);
    return cv;
  };

  return G;
})();
