// Tela final (SPEC, seções 4 e 11.10): a escada da livraria subindo para a luz do segundo andar,
// a Ellen e o Fabio do presente de mãos dadas no pé da escada, corações subindo e a mensagem:
// "YOU WON." · "Now... go to the second floor." (textos do config). Fica parada até o fim.
// V2: os textos e os dois (sprites da V2 em 2×) no tamanho novo; a escada e os corações ainda são o
// desenho da V1, em coordenadas velhas (384×216), ampliado (Legacy.screen).
const EndingState = (() => {
  const W = 384, H = 216;   // o desenho da V1
  let t = 0, bg = null;

  function background() {
    const cv = Gfx.canvas(W, H), c = cv.cx, R = (x, y, w, h, col) => Gfx.rect(x, y, w, h, col, c);
    Gfx.dither(c, 0, 0, W, H, ['#16132B', '#24203F', '#3B2B5E', '#5A3A6A'], 3);
    // a luz do segundo andar, lá em cima
    Scenery.glow(c, 120, 0, 144, 110, '#FFE8B0', (i, j) => Math.max(0, 0.9 - Math.hypot(i - 72, j * 1.4) / 110));
    // degraus subindo para o fundo (do largo, embaixo, ao estreito, em cima)
    for (let k = 0; k < 12; k++) {
      const w = 150 - k * 9, x = Math.round(W / 2 - w / 2), y = 196 - k * 13;
      R(x, y, w, 13, k % 2 ? '#8A6A48' : '#9A7A56');
      R(x, y, w, 2, '#C8A47A');
      R(x, y + 12, w, 1, '#5E4630');
    }
    // corrimão
    for (let k = 0; k < 12; k++) R(Math.round(W / 2 + 75 - k * 4.5), 160 - k * 13, 2, 14, '#2A2830');
    R(0, 200, W, 16, '#33343C');
    return cv;
  }

  return {
    enter() {
      t = 0;
      if (!bg) bg = background();
      Save.write({ stage: 5, scene: 'ENDING', memory: 5, won: true });
      if (Sound.music) Sound.music('ending');
    },

    update(dt) { t += dt; },

    render(ctx) {
      Legacy.screen(ctx, art);
      couple(ctx);
      // a mensagem
      const e2 = GAME_CONFIG.texts.ending, cx = Display.W / 2;
      const fade = Math.min(1, t / 1.5);
      ctx.globalAlpha = fade;
      Gfx.text(e2.won, cx, 35, '#F2C14E', { align: 'center', scale: 3, shadow: '#5A3A12' });
      ctx.globalAlpha = Math.min(1, Math.max(0, (t - 1.2) / 1.5));
      Gfx.text(e2.next, cx, 78, '#FFF4DA', { align: 'center', italic: true, shadow: '#07060E' });
      ctx.globalAlpha = 1;
    }
  };

  // a escada, os corações subindo e os dois de mãos dadas (desenho da V1)
  function art(ctx) {
    ctx.drawImage(bg, 0, 0);
    // corações subindo pela escada
    for (let k = 0; k < 7; k++) {
      const ph = (t * 0.18 + k / 7) % 1;
      const x = Math.round(W / 2 + Math.sin(t * 1.3 + k * 2) * (40 - ph * 30)), y = Math.round(200 - ph * 170);
      ctx.globalAlpha = ph < 0.85 ? 0.9 : (1 - ph) * 6;
      ['.#.#.', '#####', '#####', '.###.', '..#..'].forEach((row, j) => {
        for (let i = 0; i < 5; i++) if (row[i] === '#') Gfx.rect(x + i, y + j, 1, 1, j === 1 && i === 1 ? '#FFC2D2' : '#F0587E');
      });
    }
    ctx.globalAlpha = 1;
  }

  // os dois de costas, no pé da escada, de mãos dadas (sprites da V2 em 2×, em coordenadas novas)
  function couple(ctx) {
    const e = Chars.sprite('ELLEN_NOW', { dir: 'up' }), f = Chars.sprite('FABIO_NOW', { dir: 'up' });
    const SW = Chars.W, SH = Chars.H, cx = Display.W / 2, feet = 262, top = feet - SH * 2 + 1;
    Gfx.shadow(cx - 20, feet - 1, 36, 8);
    Gfx.shadow(cx + 20, feet - 1, 36, 8);
    ctx.drawImage(e, 0, 0, SW, SH, cx - 20 - SW, top, SW * 2, SH * 2);
    ctx.drawImage(f, 0, 0, SW, SH, cx + 20 - SW, top, SW * 2, SH * 2);
    // as mãos dadas, entre os dois
    Gfx.rect(cx - 4, top + 62, 8, 4, '#F6D7C6');
    Gfx.rect(cx - 4, top + 65, 8, 1, '#E2B19F');
    Gfx.rect(cx + 1, top + 62, 4, 4, '#D19A72');
  }
})();

Game.register('ending', EndingState);
