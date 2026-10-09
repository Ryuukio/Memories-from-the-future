// Página inicial (index.html da raiz): a tela dividida ao meio, 8-bit (a V1, v1.html) à esquerda e
// 32-bit (a V2, v2/index.html) à direita. Mouse em cima escolhe, clique abre; setas ← → (ou A/D)
// escolhem, Espaço ou Enter abre; Tab passa pelos botões; F alterna a tela cheia (o navegador sai
// dela ao trocar de página: no jogo, aperte F de novo). Todo texto e destino fica no HOME_CONFIG.
// O texto é desenhado com a fonte de pixel da V2 (FONT, em v2/data/sprites.js), em canvas pequenos
// ampliados em escala inteira (--u = 1 pixel do jogo).
//
// Como refazer as imagens (o mesmo momento do F1 A2 nas duas versões: a Ellen e o Fabio escondidos
// atrás do carrinho de sorvete, os dois do passado no banco):
//   C="/c/Program Files/Google/Chrome/Application/chrome.exe"
//   R="file:///C:/Users/minia/Desktop/App%20dev/Memories%20from%20the%20Future"
//   "$C" --headless=new --disable-gpu --user-data-dir=<pasta temporária> --force-device-scale-factor=1
//        --window-size=1920,1080 --virtual-time-budget=30000 --hide-scrollbars --screenshot=v1.png "$R/home/shot-v1.html"
//   (o mesmo com --screenshot=v2.png "$R/v2/tools/headless.html#shot=HOME,0.01")
// e reduza pelo pixel mais próximo: v1.png ÷ 5 → home/8bit.png (384×216), v2.png ÷ 4 →
// home/32bit.png (480×270). Cada bloco de 5×5 (ou 4×4) tem uma cor só: pegue o canto de cada bloco.
window.HOME_CONFIG = {
  title: 'MEMORIES FROM THE FUTURE',
  play: 'PLAY',
  sides: [
    { name: '8-BIT', line: 'The original', href: 'v1.html', image: 'home/8bit.png' },
    { name: '32-BIT', line: 'Remastered', href: 'v2/index.html', image: 'home/32bit.png' }
  ],
  hint: '← → choose  ·  Space play  ·  Press F in the game for full screen'
};

(() => {
  const C = window.HOME_CONFIG, G = window.FONT;
  const GAP = 1, SPACE = 4;
  const COL = {
    ink: '#07060E', cream: '#F2E8CC', lilac: '#CFC8E8', gold: '#F2C14E', goldLight: '#F6E09A',
    goldMid: '#E2C068', goldDark: '#8A6A2A', goldDeep: '#3A2A0A', frame: '#7F74BC'
  };

  // ---------- fonte de pixel ----------
  const advance = ch => (ch === ' ' ? SPACE : G[ch] ? G[ch][0].length : SPACE) + GAP;
  const textWidth = str => { let w = 0; for (const ch of str) w += advance(ch); return Math.max(0, w - GAP); };
  function text(cx, str, x, y, color, s = 1, shadow) {
    if (shadow) text(cx, str, x + s, y + s, shadow, s);
    cx.fillStyle = color;
    for (const ch of str) {
      const g = G[ch];
      if (g) g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') cx.fillRect(x + i * s, y + j * s, s, s); });
      x += advance(ch) * s;
    }
  }

  // ---------- canvas em pixels do jogo, ampliado em escala inteira ----------
  let unit = 4;   // pixels da tela por pixel do jogo
  function size(cv, w, h) {
    cv.width = w; cv.height = h;
    cv.style.width = (w * unit / devicePixelRatio) + 'px';
    cv.style.height = (h * unit / devicePixelRatio) + 'px';
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.clearRect(0, 0, w, h);
    return cx;
  }
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => 'rgb(' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',') + ')';

  // o botão PLAY: o painel do jogo (Gfx.panel: degradê índigo, borda clara com cantos cortados e
  // borda de dentro lilás), com um triângulo e o texto em 2×; escolhido, fica dourado
  function drawButton(cv, active) {
    const tw = textWidth(C.play) * 2, w = tw + 46, h = 30, cx = size(cv, w, h);
    for (let y = 1; y < h - 1; y++) { cx.fillStyle = mix('#28245A', '#151233', y / (h - 2)); cx.fillRect(1, y, w - 2, 1); }
    const inner = active ? COL.goldDark : COL.frame, outer = active ? COL.goldLight : COL.cream;
    cx.fillStyle = inner;
    cx.fillRect(1, 1, w - 2, 1); cx.fillRect(1, h - 2, w - 2, 1); cx.fillRect(1, 1, 1, h - 2); cx.fillRect(w - 2, 1, 1, h - 2);
    cx.fillStyle = outer;
    cx.fillRect(1, 0, w - 2, 1); cx.fillRect(1, h - 1, w - 2, 1); cx.fillRect(0, 1, 1, h - 2); cx.fillRect(w - 1, 1, 1, h - 2);
    const color = active ? COL.gold : COL.cream, shade = active ? COL.goldDeep : COL.ink;
    const x0 = Math.round((w - (9 + 6 + tw)) / 2), y0 = 6;
    // triângulo ▶ (9 de largura, 17 de altura), com sombra
    [[1, shade], [0, color]].forEach(([d, c]) => {
      cx.fillStyle = c;
      for (let j = 0; j < 17; j++) cx.fillRect(x0 + d, y0 + j + d, Math.round((8 - Math.abs(j - 8)) * 9 / 8), 1);
    });
    text(cx, C.play, x0 + 15, y0, color, 2, shade);
  }

  // rows: 9 para só maiúsculas, 12 com as descendentes das minúsculas
  function drawLabel(cv, str, color, s, shadow, rows = 12) {
    const cx = size(cv, textWidth(str) * s + s, rows * s + s);
    text(cx, str, 0, 0, color, s, shadow);
  }

  // o losango no meio da divisória
  function drawDiamond(cv) {
    const r = 6, cx = size(cv, r * 2 + 1, r * 2 + 1);
    for (let j = -r; j <= r; j++) {
      const w = r - Math.abs(j);
      for (let i = -w; i <= w; i++) {
        const edge = Math.abs(i) + Math.abs(j) >= r - 1;
        cx.fillStyle = edge ? COL.goldDark : (i + j < 0 ? COL.goldLight : COL.goldMid);
        cx.fillRect(r + i, r + j, 1, 1);
      }
    }
  }

  // ---------- página ----------
  const split = document.getElementById('split');
  const halves = [...document.querySelectorAll('.half')];
  let sel = -1;

  halves.forEach((h, i) => {
    const side = C.sides[i], a = h.querySelector('.play');
    h.style.backgroundImage = 'url("' + side.image + '")';
    a.href = side.href;
    a.querySelector('.sr').textContent = C.play + ' ' + side.name;
    h.addEventListener('mouseenter', () => choose(i));
    h.addEventListener('click', e => { if (!e.target.closest('a')) go(i); });
    a.addEventListener('focus', () => choose(i));
  });

  function render() {
    unit = Math.max(1, Math.floor(innerHeight * devicePixelRatio / 270));
    document.documentElement.style.setProperty('--u', (unit / devicePixelRatio) + 'px');
    halves.forEach((h, i) => {
      const on = i === sel, side = C.sides[i];
      drawButton(h.querySelector('.play canvas'), on);
      drawLabel(h.querySelector('.name'), side.name, on ? COL.gold : COL.cream, 2, COL.ink, 9);
      drawLabel(h.querySelector('.line'), side.line, COL.lilac, 1, COL.ink);
    });
    drawLabel(document.querySelector('.title'), C.title, COL.gold, 2, COL.ink, 9);
    drawLabel(document.querySelector('.hint'), C.hint, COL.lilac, 1, COL.ink);
    drawDiamond(document.querySelector('.diamond'));
  }

  function choose(i) {
    if (i === sel) return;
    sel = i;
    halves.forEach((h, k) => h.classList.toggle('active', k === i));
    split.classList.toggle('chosen', i >= 0);
    render();
  }

  function go(i) { location.href = C.sides[i].href; }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { choose(0); halves[0].querySelector('.play').focus(); e.preventDefault(); }
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') { choose(1); halves[1].querySelector('.play').focus(); e.preventDefault(); }
    else if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') && sel >= 0) { e.preventDefault(); go(sel); }
    else if (e.code === 'KeyF') fullscreen();
  });

  // voltando pelo "voltar" do navegador, a página pode vir da memória: tudo continua como estava
  window.addEventListener('resize', render);
  render();
})();
