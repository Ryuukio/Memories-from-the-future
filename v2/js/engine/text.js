// Fonte bitmap 6×9 da V2 (FONT, em data/sprites.js). Maiúsculas e números têm 9 linhas; minúsculas,
// até 12 (por causa das descendentes). Cada cor vira um atlas tingido, guardado em cache.
// Uso: Gfx.text(str, x, y, cor, { shadow, italic, align: 'left'|'center'|'right', scale, ctx })
// A fonte 5×7 da V1 (FONT_V1) fica para a arte velha que ainda não foi refeita (letreiros dos
// cenários): Gfx.font('v1') troca a fonte e devolve a anterior (o Room.build e o legacy.js usam).
(() => {
  const GAP = 1;
  const ALIASES = { '…': '...', '“': '"', '”': '"', '‘': "'", '’': "'", '–': '-' };
  const warned = {};

  // rows = linhas do atlas, space = largura do espaço, slant = linhas de cima que andam 1 px no itálico
  const FONTS = {
    v2: { glyphs: window.FONT, rows: 12, space: 4, slant: 5 },
    v1: { glyphs: window.FONT_V1, rows: 9, space: 3, slant: 4 }
  };
  let font = FONTS.v2, fontName = 'v2';

  function buildAtlas(f, italic) {
    const pos = {}, G = f.glyphs;
    let x = 0;
    for (const ch in G) {
      const w = G[ch][0].length;
      pos[ch] = { x, w, cell: w + (italic ? 1 : 0) };
      x += pos[ch].cell + 1;
    }
    const cv = Gfx.canvas(x, f.rows);
    cv.cx.fillStyle = '#FFFFFF';
    for (const ch in G) {
      G[ch].forEach((row, y) => {
        const shift = italic && y < f.slant ? 1 : 0;   // itálico: as linhas de cima andam 1 px para a direita
        for (let i = 0; i < row.length; i++) {
          if (row[i] === '#') cv.cx.fillRect(pos[ch].x + i + shift, y, 1, 1);
        }
      });
    }
    return { cv, pos };
  }

  Object.values(FONTS).forEach(f => {
    f.atlas = { normal: buildAtlas(f, false), italic: buildAtlas(f, true) };
    f.tints = {};
  });

  function tinted(color, italic) {
    const key = color + (italic ? '/i' : '');
    if (!font.tints[key]) {
      const src = (italic ? font.atlas.italic : font.atlas.normal).cv;
      const t = Gfx.canvas(src.width, src.height);
      t.cx.drawImage(src, 0, 0);
      t.cx.globalCompositeOperation = 'source-in';
      t.cx.fillStyle = color;
      t.cx.fillRect(0, 0, src.width, src.height);
      font.tints[key] = t;
    }
    return font.tints[key];
  }

  const normalize = str => String(str).replace(/[…“”‘’–]/g, ch => ALIASES[ch]);

  function advance(ch) {
    if (ch === ' ') return font.space + GAP;
    const g = font.atlas.normal.pos[ch];
    if (g) return g.w + GAP;
    if (!warned[ch]) { warned[ch] = true; console.warn('Fonte: falta o caractere "' + ch + '"'); }
    return font.space + GAP;
  }

  function run(c, str, x, y, color, italic, s) {
    const img = tinted(color, italic), pos = (italic ? font.atlas.italic : font.atlas.normal).pos, rows = font.rows;
    let end = x;
    for (const ch of str) {
      const g = pos[ch];
      if (g) {
        c.drawImage(img, g.x, 0, g.cell, rows, x, y, g.cell * s, rows * s);
        end = x + g.w * s;
      }
      x += advance(ch) * s;
    }
    return end;
  }

  Gfx.LINE = 14;   // altura de linha nos diálogos e menus

  Gfx.font = name => {
    const prev = fontName;
    font = FONTS[name];
    fontName = name;
    return prev;
  };

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
