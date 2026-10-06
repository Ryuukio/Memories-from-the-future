// Fonte bitmap 5×7 do Apêndice E (FONT, em data/sprites.js). Maiúsculas e números têm 7 linhas;
// minúsculas, 9 (por causa das descendentes). Cada cor vira um atlas tingido, guardado em cache.
// Uso: Gfx.text(str, x, y, cor, { shadow, italic, align: 'left'|'center'|'right', scale, ctx })
(() => {
  const ROWS = 9, SPACE = 3, GAP = 1;
  const ALIASES = { '…': '...', '“': '"', '”': '"', '‘': "'", '’': "'", '–': '-' };
  const tints = {};
  const warned = {};

  function buildAtlas(italic) {
    const pos = {};
    let x = 0;
    for (const ch in FONT) {
      const w = FONT[ch][0].length;
      pos[ch] = { x, w, cell: w + (italic ? 1 : 0) };
      x += pos[ch].cell + 1;
    }
    const cv = Gfx.canvas(x, ROWS);
    cv.cx.fillStyle = '#FFFFFF';
    for (const ch in FONT) {
      FONT[ch].forEach((row, y) => {
        const shift = italic && y < 4 ? 1 : 0;   // itálico: as 4 linhas de cima andam 1 px para a direita
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '#') cv.cx.fillRect(pos[ch].x + i + shift, y, 1, 1);
        }
      });
    }
    return { cv, pos };
  }

  const atlas = { normal: buildAtlas(false), italic: buildAtlas(true) };

  function tinted(color, italic) {
    const key = color + (italic ? '/i' : '');
    if (!tints[key]) {
      const src = (italic ? atlas.italic : atlas.normal).cv;
      const t = Gfx.canvas(src.width, src.height);
      t.cx.drawImage(src, 0, 0);
      t.cx.globalCompositeOperation = 'source-in';
      t.cx.fillStyle = color;
      t.cx.fillRect(0, 0, src.width, src.height);
      tints[key] = t;
    }
    return tints[key];
  }

  const normalize = str => String(str).replace(/[…“”‘’–]/g, ch => ALIASES[ch]);

  function advance(ch) {
    if (ch === ' ') return SPACE + GAP;
    const g = atlas.normal.pos[ch];
    if (g) return g.w + GAP;
    if (!warned[ch]) { warned[ch] = true; console.warn('Fonte: falta o caractere "' + ch + '"'); }
    return SPACE + GAP;
  }

  function run(c, str, x, y, color, italic, s) {
    const img = tinted(color, italic), pos = (italic ? atlas.italic : atlas.normal).pos;
    let end = x;
    for (const ch of str) {
      const g = pos[ch];
      if (g) {
        c.drawImage(img, g.x, 0, g.cell, ROWS, x, y, g.cell * s, ROWS * s);
        end = x + g.w * s;
      }
      x += advance(ch) * s;
    }
    return end;
  }

  Gfx.LINE = 11;   // altura de linha nos diálogos e menus

  Gfx.textWidth = str => {
    let w = 0;
    for (const ch of normalize(str)) w += advance(ch);
    return Math.max(0, w - GAP);
  };

  // desenha e devolve o x logo depois da última letra
  Gfx.text = (str, x, y, color, o = {}) => {
    str = normalize(str);
    const s = o.scale || 1, c = o.ctx || Gfx.ctx, italic = !!o.italic;
    if (o.align === 'center' || o.align === 'right') {
      const w = Gfx.textWidth(str) * s;
      x -= o.align === 'center' ? Math.floor(w / 2) : w;
    }
    x = Math.round(x);
    y = Math.round(y);
    if (o.shadow) run(c, str, x + s, y + s, o.shadow, italic, s);
    return run(c, str, x, y, color, italic, s);
  };

  // quebra por palavras para caber em maxW pixels (respeita "\n")
  Gfx.wrap = (str, maxW) => {
    const out = [];
    normalize(str).split('\n').forEach(par => {
      let line = '';
      par.split(' ').forEach(word => {
        const test = line ? line + ' ' + word : word;
        if (!line || Gfx.textWidth(test) <= maxW) line = test;
        else { out.push(line); line = word; }
      });
      out.push(line);
    });
    return out;
  };
})();
