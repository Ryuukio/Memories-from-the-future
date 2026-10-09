// Tela de título: "MEMORIES FROM THE FUTURE", "a game by Fabio, for Ellen" e uma opção só,
// "Start", que começa o jogo do início (o Fabio pediu para tirar o Continue).
// V2: o céu e os textos no tamanho novo; a Ellen, o Fabio e o coração ainda são o desenho da V1,
// ampliado (Legacy.screen).
const TitleState = (() => {
  const W = Display.W, H = Display.H, HORIZON = 175;
  const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  let t = 0;
  let sky = null, stars = null;

  function build() {
    sky = Gfx.canvas(W, H);
    Gfx.dither(sky.cx, 0, 0, W, HORIZON, ['#07060E', '#0E0B1F', '#18142F', '#251E45', '#3B2B5E']);
    Gfx.rect(0, HORIZON, W, H - HORIZON, '#120F24', sky.cx);
    Gfx.rect(0, HORIZON, W, 1, '#2E2752', sky.cx);

    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    stars = [];
    for (let i = 0; i < 70; i++) {
      const r = rnd();
      stars.push({
        x: Math.floor(rnd() * W), y: Math.floor(rnd() * (HORIZON - 20)),
        ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.8,
        c: r < 0.15 ? '#F2C14E' : r < 0.5 ? '#CFC8E8' : '#FFF4DA'
      });
    }
  }

  function heart(x, y) {
    HEART.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') Gfx.rect(x + i, y + j, 1, 1, '#E85C7A');
    });
    Gfx.rect(x + 1, y + 1, 1, 1, '#F7A1B5');
  }

  return {
    enter() {
      if (!sky) build();
      t = 0;
      Sound.music('title');
    },

    update(dt) {
      t += dt;
      if (Input.pressed('confirm')) { Sound.sfx('confirm'); Flow.newGame(); }
    },

    render(ctx) {
      const cfg = GAME_CONFIG.title, cx = W / 2;
      ctx.drawImage(sky, 0, 0);
      stars.forEach(s => {
        if (Math.sin(t * s.sp + s.ph) > -0.4) Gfx.rect(s.x, s.y, 1, 1, s.c);
      });

      Gfx.text(cfg.name, cx, 52 + Math.round(Math.sin(t * 1.5)), '#F2C14E', { scale: 2, align: 'center', shadow: '#5A3A12' });
      Gfx.text(cfg.subtitle, cx, 85, '#CFC8E8', { align: 'center', shadow: '#07060E' });

      // a Ellen e o Fabio do presente, frente a frente (desenho da V1, em coordenadas velhas)
      Legacy.screen(ctx, () => {
        const c0 = 192, feet = 156;
        Gfx.shadow(c0 - 11, feet - 1, 12, 4);
        Gfx.shadow(c0 + 11, feet - 1, 12, 4);
        Gfx.draw(Chars.sprite('ELLEN_NOW', { dir: 'right' }), c0 - 19, feet - 31);
        Gfx.draw(Chars.sprite('FABIO_NOW', { dir: 'left' }), c0 + 3, feet - 31);
        heart(c0 - 3, 112 + Math.round(Math.sin(t * 2) * 1.5));
      });

      Gfx.text(cfg.start, cx, 222, '#FFF4DA', { align: 'center', shadow: '#07060E' });
      if (Math.floor(t * 1.6) % 2 === 0) Gfx.text('>', cx - Gfx.textWidth(cfg.start) / 2 - 12, 222, '#F2C14E');
    },

    skip() { Flow.newGame(); }
  };
})();

Game.register('title', TitleState);
