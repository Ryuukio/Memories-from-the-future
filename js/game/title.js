// Tela de título: "MEMORIES FROM THE FUTURE", "a game by Fabio, for Ellen", "Press Space".
// Com jogo salvo, mostra o menu Continue / New game.
const TitleState = (() => {
  const W = Display.W, H = Display.H, HORIZON = 140;
  const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  let t = 0, save = null, menu = null, sel = 0;
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
        x: Math.floor(rnd() * W), y: Math.floor(rnd() * (HORIZON - 16)),
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
      save = Save.load();
      menu = save ? [GAME_CONFIG.title.continue, GAME_CONFIG.title.newGame] : null;
      sel = 0;
    },

    update(dt) {
      t += dt;
      if (!menu) {
        if (Input.pressed('confirm')) { Sound.sfx('confirm'); Flow.newGame(); }
        return;
      }
      if (Input.pressed('up') || Input.pressed('down')) { sel = 1 - sel; Sound.sfx('move'); }
      if (Input.pressed('confirm')) {
        Sound.sfx('confirm');
        if (sel === 0) Flow.continueGame(save);
        else Flow.newGame();
      }
    },

    render(ctx) {
      const cfg = GAME_CONFIG.title, cx = W / 2;
      ctx.drawImage(sky, 0, 0);
      stars.forEach(s => {
        if (Math.sin(t * s.sp + s.ph) > -0.4) Gfx.rect(s.x, s.y, 1, 1, s.c);
      });

      Gfx.text(cfg.name, cx, 42 + Math.round(Math.sin(t * 1.5)), '#F2C14E', { scale: 2, align: 'center', shadow: '#5A3A12' });
      Gfx.text(cfg.subtitle, cx, 68, '#CFC8E8', { align: 'center', shadow: '#07060E' });

      // a Ellen e o Fabio do presente, frente a frente
      const feet = 156;
      Gfx.shadow(cx - 11, feet - 1, 12, 4);
      Gfx.shadow(cx + 11, feet - 1, 12, 4);
      Gfx.draw(Chars.sprite('ELLEN_NOW', { dir: 'right' }), cx - 19, feet - 31);
      Gfx.draw(Chars.sprite('FABIO_NOW', { dir: 'left' }), cx + 3, feet - 31);
      heart(cx - 3, 112 + Math.round(Math.sin(t * 2) * 1.5));

      if (menu) {
        menu.forEach((label, i) => {
          const y = 172 + i * 13, on = i === sel;
          Gfx.text(label, cx, y, on ? '#FFF4DA' : '#7F74BC', { align: 'center', shadow: '#07060E' });
          if (on) Gfx.text('>', cx - Gfx.textWidth(label) / 2 - 10, y, '#F2C14E');
        });
      } else if (Math.floor(t * 1.6) % 2 === 0) {
        Gfx.text(cfg.press, cx, 180, '#FFF4DA', { align: 'center', shadow: '#07060E' });
      }
    },

    skip() { Flow.newGame(); }
  };
})();

Game.register('title', TitleState);
