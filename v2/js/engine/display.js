// Tela: canvas interno de 480×270 (16:9; na V1 era 384×216), ampliado em escala inteira com pixels
// nítidos (4× em 1920×1080).
// A escala é calculada em pixels físicos, para ficar nítida também com o zoom do Windows (125%, 150%).
const Display = (() => {
  const W = 480, H = 270;
  const canvas = document.getElementById('game');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  let scale = 1;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    scale = Math.max(1, Math.floor(Math.min(window.innerWidth * dpr / W, window.innerHeight * dpr / H)));
    canvas.style.width = (W * scale / dpr) + 'px';
    canvas.style.height = (H * scale / dpr) + 'px';
  }

  // Tecla F. Em tela cheia, Esc pausa o jogo em vez de sair dela (segurar Esc ainda sai).
  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      const p = document.documentElement.requestFullscreen();
      if (p && p.then) {
        p.then(() => {
          if (navigator.keyboard && navigator.keyboard.lock) return navigator.keyboard.lock(['Escape']);
        }).catch(() => { /* segue em janela */ });
      }
    } catch (e) { /* sem tela cheia: segue em janela */ }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
    resize();
  });
  resize();

  return { W, H, canvas, ctx, resize, toggleFullscreen, get scale() { return scale; } };
})();
