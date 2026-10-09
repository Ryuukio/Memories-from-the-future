// Coordenadas da V1 na tela da V2. A V2 tem a tela de 480×270 e o mundo 1,25× maior (o Room.build
// amplia as coordenadas dos cenários, que continuam nas medidas da V1).
//   Legacy.K                      1,25: quanto o mundo cresceu
// Todo o jogo já é desenhado no tamanho novo. A camada velha sobrou só para a sala de teste do menu
// de teste (testroom.js), que ainda é desenhada como na V1:
//   Legacy.layer(ctx, x, y, w, h, fn)   fn(c) desenha na camada, em coordenadas velhas, o retângulo
//                                 (x, y, w, h) velho; depois ele vai para a tela em (x, y) × 1,25
//                                 (a cada 4 pixels velhos, 5 novos, pelo pixel mais próximo)
//   Legacy.world(ctx, cam, fn)    a área de jogo vista pela câmera (cam em coordenadas novas); o ctx já
//                                 está deslocado para o mundo (translate(-cam, topo))
// Durante fn, as chamadas do Gfx sem canvas (Gfx.rect(x, y, w, h, cor)) desenham na camada, e os
// textos usam a fonte da V1 (Gfx.font('v1')), como a arte velha espera.
const Legacy = (() => {
  const K = 1.25;
  let buf = null;

  function layer(ctx, x, y, w, h, fn) {
    if (!buf || buf.width < w || buf.height < h) buf = Gfx.canvas(Math.max(w, buf ? buf.width : 0), Math.max(h, buf ? buf.height : 0));
    const c = buf.cx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    c.globalAlpha = 1;
    c.setTransform(1, 0, 0, 1, -x, -y);
    const prev = Gfx.target(c), prevFont = Gfx.font('v1');
    try {
      fn(c);
    } finally {
      Gfx.target(prev);
      Gfx.font(prevFont);
      c.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.drawImage(buf, 0, 0, w, h, x * K, y * K, w * K, h * K);
  }

  // a área de jogo: 384 × 192 velhos (mais uma margem de 8 px, porque a câmera anda de 1 em 1 px novo)
  function world(ctx, cam, fn) {
    const x = Math.floor(cam / K / 4) * 4;
    layer(ctx, x, 0, Math.ceil(Display.W / K) + 8, Math.ceil((Display.H - Hud.H) / K), fn);
  }

  return { K, layer, world };
})();
