// Ajuda para conferir a arte no painel do navegador (só para desenvolver; o jogo não carrega este
// arquivo): carrega o devtools e define __fit(x, y, w, h), que mostra um pedaço da tela do jogo
// ampliado 4× e encaixado na janela (o print do painel não corta, qualquer que seja o zoom).
//   await new Promise(r => { const s = document.createElement('script'); s.src = 'tools/fit.js?' + Date.now(); s.onload = r; document.body.appendChild(s); });
//   await __tools;   (espera o devtools carregar)
window.__tools = new Promise(r => { const s = document.createElement('script'); s.src = 'tools/devtools.js?' + Date.now(); s.onload = r; document.body.appendChild(s); });
window.__fit = (sx = 0, sy = 0, sw = 480, sh = 270) => {
  let o = document.getElementById('__fit');
  if (!o) { o = document.createElement('canvas'); o.id = '__fit'; document.body.appendChild(o); }
  o.style.cssText = 'position:fixed;left:0;top:0;z-index:10000;image-rendering:pixelated;background:#000;width:100vw;height:100vh;object-fit:contain';
  o.width = sw * 4; o.height = sh * 4;
  const c = o.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(Display.canvas, sx, sy, sw, sh, 0, 0, sw * 4, sh * 4);
  return 'ok';
};
