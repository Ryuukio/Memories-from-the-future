// Tela de título: "MEMORIES FROM THE FUTURE", "a game by Fabio, for Ellen" e uma opção só,
// "Start", que começa o jogo do início (o Fabio pediu para tirar o Continue).
// V2: tudo no tamanho novo. O céu da noite em faixas pontilhadas com uma nebulosa fraca e a lua
// crescente; no horizonte, a silhueta da cidade com as janelas acesas e a torre do primeiro encontro
// (a Mirai Tower, com a luz vermelha piscando); a Ellen e o Fabio frente a frente numa poça de luz, o
// coração e as estrelas piscando (de vez em quando, uma estrela cadente).
const TitleState = (() => {
  const W = Display.W, H = Display.H, HORIZON = 175;
  const TOWER = { x: 92, top: 96 };   // a torre (o meio e o alto da antena)
  const MOON = { x: 444, y: 28 };     // a lua (longe do título)
  const HEART = ['.###.###.', '#########', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];
  let t = 0;
  let sky = null, stars = null;

  function build() {
    const A = Art, T = Art.tones, { pick, vnoise, bay } = Art, h01 = Art.hash;
    const S = A.surface(W, H);
    const NIGHT = T(['#07060E', '#0B0919', '#100D22', '#16122C', '#1E1838', '#282046', '#332854', '#3E2F5E']);
    // o céu: mais claro perto do horizonte, com uma nebulosa bem fraca atravessando
    for (let y = 0; y < HORIZON; y++) for (let x = 0; x < W; x++) {
      const n = vnoise(x, y, 46, 950) * 0.6 + vnoise(x, y, 14, 951) * 0.4;
      const band = Math.max(0, 1 - Math.abs((y - 30) - (x - 240) * 0.18) / 46);
      S.put(x, y, pick(NIGHT, y / HORIZON * 0.95 + (n - 0.5) * 0.12 + band * n * 0.18, x, y));
    }
    // a lua crescente com o halo em degraus
    const mx = MOON.x, my = MOON.y;
    for (let y = my - 26; y < my + 26; y++) for (let x = mx - 26; x < mx + 26; x++) {
      const d = Math.hypot(x - mx, y - my);
      if (d > 11 && d < 26) { const q = Math.floor((1 - (d - 11) / 15) * 3 + bay(x, y) * 0.999) / 3; if (q > 0) S.put(x, y, '#8A7AC8', q * 0.22); }
    }
    S.ellipse(mx, my, 10, 10, (x, y, nx, ny) => {
      if (Math.hypot(nx - 0.42, ny + 0.18) < 0.92) return null;   // a parte escura (crescente)
      return pick(T(['#C8B888', '#E2D4A6', '#F4EACC', '#FFF8E6']), 0.95 - nx * 0.3 - ny * 0.2 - (h01(x, y, 952) < 0.15 ? 0.2 : 0), x, y);
    });

    // a cidade: os prédios ao longe (mais claros, sem janela) e os de perto com as janelas acesas
    const line = new Int16Array(W).fill(HORIZON);   // o alto da silhueta em cada x (para as estrelas)
    const city = (seed, minH, maxH, col, lit) => {
      let x = 0;
      while (x < W) {
        const bw = 9 + Math.floor(h01(x, 1, seed) * 18), bh = minH + Math.floor(h01(x, 2, seed) * (maxH - minH));
        const top = HORIZON - bh;
        for (let xx = x; xx < Math.min(W, x + bw); xx++) {
          line[xx] = Math.min(line[xx], top);
          for (let y = top; y < HORIZON; y++) {
            let c = col[y === top ? 2 : xx === x ? 1 : 0];
            if (lit && (xx - x) % 4 === 2 && (y - top) % 4 === 2 && y < HORIZON - 2 && h01(xx, y, seed + 1) < 0.32) c = h01(xx, y, seed + 2) < 0.7 ? '#E8B860' : '#8AC0E8';
            S.put(xx, y, c);
          }
        }
        x += bw + (h01(x, 3, seed) < 0.3 ? 2 : 0);
      }
    };
    city(953, 10, 26, ['#221C40', '#282248', '#342C58'], false);
    city(954, 4, 18, ['#110D22', '#15112A', '#241E40'], true);
    // a torre de treliça: as quatro pernas abrindo para baixo, os cruzados, o mirante e a antena
    const tx = TOWER.x, base = HORIZON, deck = 128;
    const half = y => 2 + (y - TOWER.top - 14) * 0.13;
    for (let y = TOWER.top + 14; y < base; y++) {
      const hw = Math.round(half(y));
      for (const side of [-1, 1]) { S.put(tx + side * hw, y, '#2E2650'); S.put(tx + side * (hw - 1), y, '#1A1530'); }
      // os cruzados da treliça
      const k = (y - TOWER.top) % 8, hw2 = hw - 1;
      if (hw2 > 1) { S.put(Math.round(tx - hw2 + (k / 8) * 2 * hw2), y, '#241E40'); S.put(Math.round(tx + hw2 - (k / 8) * 2 * hw2), y, '#241E40'); }
    }
    for (let x = tx - 9; x <= tx + 9; x++) for (let y = deck; y < deck + 5; y++) S.put(x, y, y === deck ? '#4A3E70' : (x + y) % 3 === 0 && y === deck + 2 ? '#F2C86A' : '#1C1734');
    for (let x = tx - 6; x <= tx + 6; x++) S.put(x, deck + 5, '#2E2650');
    for (let y = TOWER.top; y < TOWER.top + 15; y++) { S.put(tx, y, '#3A3060'); if (y > TOWER.top + 6) S.put(tx + 1, y, '#1A1530'); }
    line[tx] = TOWER.top;
    for (let x = tx - 12; x <= tx + 12; x++) line[x] = Math.min(line[x], deck - 2);

    // o chão: um gramado escuro, a poça de luz embaixo dos dois e uns tufos
    for (let y = HORIZON; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - W / 2) / 78, (y - 197) / 16);
      let tt = 0.28 - (y - HORIZON) / (H - HORIZON) * 0.2 + (vnoise(x, y, 9, 955) - 0.5) * 0.08;
      if (d < 1) tt += Math.floor((1 - d) * 4 + bay(x, y) * 0.999) / 4 * 0.3;
      S.put(x, y, pick(T(['#08070F', '#0E0C1A', '#141126', '#1C1834', '#282242', '#352C52']), tt, x, y));
    }
    for (let x = 0; x < W; x++) S.put(x, HORIZON, '#2E2752');
    for (let k = 0; k < 60; k++) {
      const x = Math.floor(h01(k, 1, 956) * W), y = HORIZON + 6 + Math.floor(h01(k, 2, 956) * (H - HORIZON - 10));
      if (Math.abs(x - W / 2) < 90 && y < 215) continue;
      S.put(x, y, '#1E1A34'); S.put(x + 1, y - 1, '#1E1A34'); S.put(x + 2, y, '#1E1A34');
    }
    return { cv: S.canvas(), line };
  }

  function makeStars(skyline) {
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const out = [];
    for (let i = 0; i < 70; i++) {
      const r = rnd();
      const s = {
        x: Math.floor(rnd() * W), y: Math.floor(rnd() * (HORIZON - 20)),
        ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.8,
        c: r < 0.15 ? '#F2C14E' : r < 0.5 ? '#CFC8E8' : '#FFF4DA'
      };
      // nada de estrela na frente da lua ou dos prédios
      if (Math.hypot(s.x - MOON.x, s.y - MOON.y) < 15 || s.y >= skyline[s.x] - 2) continue;
      out.push(s);
    }
    return out;
  }

  // coração com a luz de cima e da esquerda
  function heart(x, y) {
    HEART.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] !== '#') continue;
        const d = i + j;
        Gfx.rect(x + i, y + j, 1, 1, d < 3 ? '#F7A1B5' : d > 10 ? '#B83A5A' : '#E85C7A');
      }
    });
    Gfx.rect(x + 2, y + 1, 1, 1, '#FFE4EC');
  }

  // a estrela cadente: a cada ~9 s, um risco descendo da esquerda para a direita
  function shootingStar(ctx) {
    const cyc = t % 9.3;
    if (cyc > 0.7) return;
    const k = cyc / 0.7, n = Math.floor(t / 9.3);
    const x0 = 150 + Art.hash(n, 1, 957) * 160, y0 = 10 + Art.hash(n, 2, 957) * 30;
    const x = x0 + k * 70, y = y0 + k * 26;
    for (let i = 0; i < 12; i++) {
      ctx.globalAlpha = (1 - i / 12) * (1 - k) * 0.9;
      Gfx.rect(Math.round(x - i * 2.7), Math.round(y - i), 1, 1, i < 2 ? '#FFFFFF' : '#CFC8E8');
    }
    ctx.globalAlpha = 1;
  }

  return {
    enter() {
      if (!sky) { const b = build(); sky = b.cv; stars = makeStars(b.line); }
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
      shootingStar(ctx);
      // a luz vermelha no alto da torre
      if (Math.floor(t * 1.2) % 2 === 0) { Gfx.rect(TOWER.x, TOWER.top - 1, 1, 2, '#FF5A4A'); ctx.globalAlpha = 0.35; Gfx.rect(TOWER.x - 1, TOWER.top - 2, 3, 4, '#FF5A4A'); ctx.globalAlpha = 1; }

      Gfx.text(cfg.name, cx, 52 + Math.round(Math.sin(t * 1.5)), '#F2C14E', { scale: 2, align: 'center', shadow: '#5A3A12' });
      Gfx.text(cfg.subtitle, cx, 85, '#CFC8E8', { align: 'center', shadow: '#07060E' });

      // a Ellen e o Fabio do presente, frente a frente
      const feet = 196;
      Chars.draw(ctx, Chars.sprite('ELLEN_NOW', { dir: 'right' }), cx - 14, feet);
      Chars.draw(ctx, Chars.sprite('FABIO_NOW', { dir: 'left' }), cx + 14, feet);
      heart(cx - 4, 132 + Math.round(Math.sin(t * 2) * 1.9));

      Gfx.text(cfg.start, cx, 222, '#FFF4DA', { align: 'center', shadow: '#07060E' });
      if (Math.floor(t * 1.6) % 2 === 0) Gfx.text('>', cx - Gfx.textWidth(cfg.start) / 2 - 12, 222, '#F2C14E');
    },

    skip() { Flow.newGame(); }
  };
})();

Game.register('title', TitleState);
