// Tela final (SPEC, seções 4 e 11.10): a escada da livraria subindo para a luz do segundo andar,
// a Ellen e o Fabio do presente de mãos dadas no pé da escada, corações subindo e a mensagem:
// "YOU WON." · "Now... go to the second floor." (textos do config). Fica parada até o fim.
// V2: tudo no tamanho novo (480×270): a escada de madeira com a passadeira vinho, os corrimãos pretos,
// as paredes na penumbra, a porta lá em cima acesa (a luz quente descendo pelos degraus, com a poeira
// brilhando), os corações e os dois (sprites da V2 em 2×).
const EndingState = (() => {
  const W = Display.W, H = Display.H;
  const TOPY = 128, BOTY = 252, N = 12;   // o alto e o pé da escada, e o número de degraus
  const DOOR = { x0: 202, x1: 278, y0: 98, y1: TOPY };   // a porta acesa do 2º andar
  let t = 0, bg = null, heartImg = null;

  // a escada em perspectiva: o degrau k (0 = o de baixo) vai de y0 a y1, entre x0 e x1
  function step(k) {
    const f0 = k / N, f1 = (k + 1) / N, ease = f => 1 - Math.pow(1 - f, 1.25);
    const y1 = BOTY - (BOTY - TOPY) * ease(f0), y0 = BOTY - (BOTY - TOPY) * ease(f1);
    const half = 150 - 106 * ease(f0);
    return { y0: Math.round(y0), y1: Math.round(y1), x0: Math.round(W / 2 - half), x1: Math.round(W / 2 + half) };
  }

  function background() {
    const A = Art, T = Art.tones, { pick, vnoise, mix, bay } = Art, h01 = Art.hash;
    const S = A.surface(W, H);
    const DARK = T(['#0A0812', '#110E1C', '#191428', '#221C34', '#2C2440', '#382E4E']);
    const WALLW = T(['#2A2230', '#3A2E3C', '#4C3E48', '#605058', '#78666A', '#94807C']);
    const OAK = T(['#3A2414', '#52341E', '#6E4828', '#8A5E36', '#A87848', '#C8955E', '#E2B47A', '#F4D29C']);
    const RUNNER = T(['#2E0A12', '#46101C', '#5E1826', '#782232', '#943040', '#B04452']);
    // o fundo: o vão escuro da escada, com as paredes dos lados ficando mais claras perto da luz
    const light = (x, y) => {
      const d = Math.hypot((x - W / 2) / 150, (y - (DOOR.y0 + DOOR.y1) / 2) / 120);
      return Math.max(0, 1 - d);
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let c = pick(DARK, 0.25 + light(x, y) * 0.9 + (vnoise(x, y, 12, 800) - 0.5) * 0.08, x, y);
      // as paredes laterais (a penumbra creme) e o rodapé subindo junto com a escada
      const wl = x < W / 2 ? (W / 2 - x) : (x - W / 2);
      if (y > 40 && wl > 52 + (y - 40) * 0.0) c = pick(WALLW, 0.15 + light(x, y) * 1.1 + (vnoise(x, y, 5, 801) - 0.5) * 0.06, x, y);
      S.put(x, y, c);
    }
    // o teto preto em cima e o friso
    for (let y = 0; y < 30; y++) for (let x = 0; x < W; x++) S.put(x, y, pick(DARK, 0.1 + (vnoise(x, y, 8, 802) - 0.5) * 0.1 + light(x, y + 30) * 0.3, x, y));
    for (let x = 0; x < W; x++) { S.put(x, 30, pick(WALLW, 0.6 + light(x, 30) * 0.5, x, 30)); S.put(x, 31, DARK[1]); }
    // a porta acesa do 2º andar: a luz quente, o batente e o brilho espalhando em degraus pontilhados
    for (let y = DOOR.y0 - 30; y < DOOR.y1 + 40; y++) for (let x = DOOR.x0 - 70; x < DOOR.x1 + 70; x++) {
      const dx = x < DOOR.x0 ? DOOR.x0 - x : x > DOOR.x1 ? x - DOOR.x1 : 0, dy = y < DOOR.y0 ? DOOR.y0 - y : y > DOOR.y1 ? y - DOOR.y1 : 0;
      const d = Math.hypot(dx / 70, dy / 34);
      if (d >= 1 || (dx === 0 && dy === 0)) continue;
      const q = Math.floor(Math.pow(1 - d, 1.4) * 5 + bay(x, y) * 0.999) / 5;
      if (q > 0) S.put(x, y, '#FFD89A', q * 0.55);
    }
    for (let y = DOOR.y0; y < DOOR.y1; y++) for (let x = DOOR.x0; x < DOOR.x1; x++) {
      const d = Math.hypot((x - W / 2) / 40, (y - DOOR.y0 - 6) / 30);
      S.put(x, y, pick(T(['#F2B860', '#F8CE7E', '#FCE2A6', '#FFF2D2', '#FFFCF0']), 1 - d * 0.6, x, y));
    }
    for (let y = DOOR.y0 - 3; y < DOOR.y1; y++) for (const x of [DOOR.x0 - 3, DOOR.x0 - 2, DOOR.x0 - 1, DOOR.x1, DOOR.x1 + 1, DOOR.x1 + 2]) S.put(x, y, pick(OAK, x < W / 2 ? 0.55 : 0.75, x, y));
    for (let x = DOOR.x0 - 3; x < DOOR.x1 + 3; x++) for (let y = DOOR.y0 - 3; y < DOOR.y0; y++) S.put(x, y, pick(OAK, 0.6 + (y === DOOR.y0 - 3 ? 0.2 : 0), x, y));
    // os degraus: o piso (claro) e o espelho (escuro), com a passadeira vinho no meio e as varetas
    // douradas; a luz de cima pega mais nos degraus de cima
    for (let k = 0; k < N; k++) {
      const st = step(k), tread = Math.max(2, Math.round((st.y1 - st.y0) * 0.38)), lit = 0.15 + k / N * 0.55;
      const rw = (st.x1 - st.x0) * 0.42, rx0 = W / 2 - rw / 2, rx1 = W / 2 + rw / 2;
      for (let y = st.y0; y < st.y1; y++) for (let x = st.x0; x < st.x1; x++) {
        const j = y - st.y0, isTread = j < tread, onRunner = x >= rx0 && x < rx1;
        let c;
        if (onRunner) {
          let tt = (isTread ? 0.55 : 0.25) + lit * 0.5 - (j === tread ? 0.1 : 0) + (vnoise(x, y, 3, 803 + k) - 0.5) * 0.1;
          if (x < rx0 + 2 || x >= rx1 - 2) tt -= 0.2;
          c = pick(RUNNER, tt, x, y);
          if (!isTread && j === tread + 1) c = pick(T(['#8A6A2A', '#C9A24A', '#F6E09A']), 0.5 + lit * 0.5, x, y);
        } else {
          let tt = (isTread ? 0.5 + (j === 0 ? 0.2 : 0) : 0.18 - (j - tread) * 0.01) + lit * 0.45 + (vnoise(x * 0.25, y * 2, 3, 804 + k) - 0.5) * 0.12;
          tt -= Math.abs(x - W / 2) / 300 * 0.2;
          c = pick(OAK, tt, x, y);
        }
        S.put(x, y, c);
      }
      // os corrimãos pretos com as hastes, um de cada lado
      for (const side of [-1, 1]) {
        const px = side < 0 ? st.x0 + 4 : st.x1 - 5, top = st.y0 - Math.round((st.y1 - st.y0) * 2.1);
        for (let y = top; y < st.y0 + 1; y++) { S.put(px, y, '#14121A'); S.put(px + side, y, '#2A2632'); }
      }
    }
    // o corrimão (a barra de cima), seguindo a ponta das hastes
    for (const side of [-1, 1]) {
      let prev = null;
      for (let k = 0; k < N; k++) {
        const st = step(k), px = side < 0 ? st.x0 + 4 : st.x1 - 5, top = st.y0 - Math.round((st.y1 - st.y0) * 2.1);
        if (prev) {
          const n = Math.max(Math.abs(px - prev[0]), Math.abs(top - prev[1]));
          for (let q = 0; q <= n; q++) {
            const x = Math.round(prev[0] + (px - prev[0]) * q / n), y = Math.round(prev[1] + (top - prev[1]) * q / n);
            S.put(x, y, '#3A3442'); S.put(x, y + 1, '#14121A'); S.put(x, y + 2, '#0A080E');
          }
        }
        prev = [px, top];
      }
    }
    // o chão da livraria no pé da escada (o carpete escuro)
    for (let y = BOTY; y < H; y++) for (let x = 0; x < W; x++) S.put(x, y, pick(T(['#1A1B22', '#22232B', '#2A2B34', '#33343E']), 0.45 + (h01(x, y, 805) - 0.5) * 0.25 - (y - BOTY) * 0.02, x, y));
    for (let x = 0; x < W; x++) S.mul(x, BOTY, '#6A6474', 0.6);
    void mix;
    return S.canvas();
  }

  // coração pequeno com a luz de cima e da esquerda
  function heart() {
    if (heartImg) return heartImg;
    const rows = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
    const s = Art.surface(9, 8), R = Art.tones(['#A8284E', '#D03A62', '#F0587E', '#F88AA4', '#FFC8D6']);
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') s.put(i + 1, j + 1, Art.pick(R, 0.75 - (i + j) * 0.07, i, j)); });
    s.put(2, 2, '#FFFFFF');
    s.outline(0.45);
    return (heartImg = s.canvas());
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
      ctx.drawImage(bg, 0, 0);
      dust(ctx);
      hearts(ctx);
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

  // a poeira brilhando na luz da porta
  function dust(ctx) {
    for (let k = 0; k < 18; k++) {
      const h = Art.hash(k, 1, 806), ph = (t * (0.04 + h * 0.05) + Art.hash(k, 2, 806)) % 1;
      const x = Math.round(DOOR.x0 - 20 + Art.hash(k, 3, 806) * (DOOR.x1 - DOOR.x0 + 40) + Math.sin(t * 0.7 + k) * 6);
      const y = Math.round(DOOR.y1 + 40 - ph * 70);
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
      Gfx.rect(x, y, 1, 1, k % 3 ? '#FFF2C8' : '#FFFFFF');
    }
    ctx.globalAlpha = 1;
  }

  // os corações subindo pela escada, dos dois até a porta
  function hearts(ctx) {
    const img = heart();
    for (let k = 0; k < 7; k++) {
      const ph = (t * 0.16 + k / 7) % 1;
      const x = Math.round(W / 2 + Math.sin(t * 1.3 + k * 2) * (48 - ph * 38)) - 4, y = Math.round(225 - ph * 125);
      ctx.globalAlpha = ph < 0.8 ? Math.min(1, ph * 6) * 0.95 : (1 - ph) * 4.75;
      ctx.drawImage(img, x, y);
    }
    ctx.globalAlpha = 1;
  }

  // os dois de costas, no pé da escada, de mãos dadas (sprites da V2 em 2×)
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
