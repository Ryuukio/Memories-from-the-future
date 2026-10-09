// Caixa de diálogo (seção 11 e Apêndice E.1).
// Falas no formato "NOME: fala" ou { who: 'Ellen', text: '...' }. O nome aparece numa aba acima
// da caixa, na cor do personagem; NARRATOR vem sem aba e em itálico. Linhas "[algo]" não aparecem:
// viram opts.onAction('algo', resume). Se onAction devolver true, o diálogo espera até resume().
// O texto surge letra por letra; Espaço completa a linha e, se ela já estiver completa, avança.
// Modos: 'talk' (pausa o jogo até o fim) e 'toast' (fala de entrada do cenário: não pausa,
// some sozinha depois de alguns segundos ou com Espaço).
const Dialog = (() => {
  const X = 11, W = 458, MARGIN = 8, PAD_X = 12, PAD_TOP = 10, PAD_BOTTOM = 9;   // medidas da V2 (480×270)
  const GLYPH_H = 12, MAX_LINES = 2;
  const TEXT = '#FFF4DA';

  let queue = [], opts = {}, mode = 'talk';
  let cur = null;          // { sp, pages, page }
  let shown = 0, timer = 0, blink = 0, waiting = false;

  const cfg = () => GAME_CONFIG.text || {};
  const speakers = () => GAME_CONFIG.speakers || {};

  function parse(line) {
    if (line && typeof line === 'object') {
      return { who: String(line.who || '').toUpperCase(), text: String(line.text || '') };
    }
    const m = /^([A-Z][A-Z &]*?):\s+(.*)$/.exec(line);
    if (m && speakers()[m[1]]) return { who: m[1], text: m[2] };
    return { who: '', text: String(line) };
  }

  function prepare(entry) {
    const lines = Gfx.wrap(entry.text, W - PAD_X * 2 - 10);
    const pages = [];
    for (let i = 0; i < lines.length; i += MAX_LINES) pages.push(lines.slice(i, i + MAX_LINES));
    return { sp: speakers()[entry.who] || {}, pages, page: 0 };
  }

  const pageLen = () => cur.pages[cur.page].reduce((n, l) => n + l.length, 0);

  function next() {
    while (queue.length) {
      const raw = queue.shift();
      const action = typeof raw === 'string' && /^\[(.*)\]$/.exec(raw.trim());
      if (action) {
        if (opts.onAction && opts.onAction(action[1], resume) === true) {
          cur = null;
          waiting = true;
          return;
        }
        continue;
      }
      cur = prepare(parse(raw));
      shown = 0;
      timer = 0;
      blink = 0;
      return;
    }
    finish();
  }

  function resume() {
    if (!waiting) return;
    waiting = false;
    next();
  }

  function finish() {
    const done = opts.onDone;
    cur = null;
    waiting = false;
    queue = [];
    opts = {};
    if (done) done();
  }

  function advance() {
    if (cur.page < cur.pages.length - 1) {
      cur.page++;
      shown = 0;
      timer = 0;
    } else {
      next();
    }
  }

  function update(dt) {
    if (!cur) return;
    blink += dt;
    const total = pageLen();
    if (shown < total) {
      const before = Math.floor(shown);
      shown = Math.min(total, shown + (cfg().charsPerSecond || 45) * dt);
      if (mode === 'talk' && Math.floor(shown) > before && before % 2 === 0) Sound.sfx('blip');
    } else if (mode === 'toast') {
      timer += dt;
      if (timer >= (opts.seconds || cfg().toastSeconds || 3)) { next(); return; }
    }
    if (Input.pressed('confirm')) {
      Input.consume('confirm');
      if (mode === 'toast') next();
      else if (shown < total) shown = total;
      else advance();
    }
  }

  function tab(sp, x, boxY) {
    const w = Gfx.textWidth(sp.name) + 12, h = 15, y = boxY - h + 1;
    const light = Gfx.lum(sp.color) > 0.55;
    const border = light ? '#7F74BC' : '#F2E8CC';
    Gfx.rect(x + 1, y, w - 2, 1, border);
    Gfx.rect(x, y + 1, 1, h - 1, border);
    Gfx.rect(x + w - 1, y + 1, 1, h - 1, border);
    Gfx.rect(x + 1, y + 1, w - 2, h - 1, sp.color);
    Gfx.text(sp.name, x + 6, y + 3, light ? '#1E1826' : '#FFF4DA');
  }

  // ▼ piscando em #F2C14E
  function arrow(x, y) {
    Gfx.rect(x, y, 7, 1, '#F2C14E');
    Gfx.rect(x + 1, y + 1, 5, 1, '#F2C14E');
    Gfx.rect(x + 2, y + 2, 3, 1, '#F2C14E');
    Gfx.rect(x + 3, y + 3, 1, 1, '#F2C14E');
  }

  function render() {
    if (!cur) return;
    const page = cur.pages[cur.page];
    const lines = mode === 'toast' ? page.length : MAX_LINES;
    const h = PAD_TOP + (lines - 1) * Gfx.LINE + GLYPH_H + PAD_BOTTOM;
    const y = Display.H - MARGIN - h;
    Gfx.panel(X, y, W, h);
    if (cur.sp.name && cur.sp.tab !== false) tab(cur.sp, X + 8, y);
    let left = Math.floor(shown);
    page.forEach((line, i) => {
      if (left <= 0) return;
      Gfx.text(line.slice(0, left), X + PAD_X, y + PAD_TOP + i * Gfx.LINE, cur.sp.textColor || TEXT, { italic: !!cur.sp.italic });
      left -= line.length;
    });
    if (shown >= pageLen() && Math.floor(blink * 2.5) % 2 === 0) arrow(X + W - 17, y + h - 11);
  }

  return {
    say(lines, o = {}) {
      queue = (Array.isArray(lines) ? lines : [lines]).slice();
      opts = o;
      mode = o.mode || 'talk';
      waiting = false;
      next();
    },
    toast(line, o = {}) { this.say([line], Object.assign({}, o, { mode: 'toast' })); },
    close() { cur = null; queue = []; opts = {}; waiting = false; },
    isOpen: () => !!cur || waiting,
    isBlocking: () => !!cur && mode === 'talk',
    update,
    render
  };
})();
