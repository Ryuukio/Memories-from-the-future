// Cartão em tela preta: o título de cada fase ("STAGE 1 — The First Date") e, na etapa 5, os
// cartões do prólogo ("Some years later..."). Fica alguns segundos (ou até Espaço) e segue.
// Game.go('card', { text, seconds, then })   text com " — " vira duas linhas: a de cima em dourado
// V2: o fundo tem um brilho índigo bem fraco no meio (em degraus pontilhados) e estrelinhas piscando;
// o título da fase ganha um friso dourado com um losango no meio, e o cartão em itálico, uma
// ampulheta com a areia caindo.
const CardState = (() => {
  const W = Display.W, H = Display.H;
  let p = {}, t = 0, top = '', bottom = '', bg = null, glass = null;

  function background() {
    const s = Art.surface(W, H), { bay } = Art;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - W / 2) / 230, (y - H / 2) / 120);
      const q = Math.floor(Math.max(0, 1 - d) * 4 + bay(x, y) * 0.999) / 4;
      s.put(x, y, Art.mix('#07060E', '#1C1638', q * 0.8));
    }
    return s.canvas();
  }

  // a ampulheta (moldura dourada, o vidro e a areia), 15 × 21
  function hourglass() {
    if (glass) return glass;
    const s = Art.surface(15, 21), G = Art.tones(['#6A4A1A', '#AE8A3A', '#E2C068', '#F6E09A']);
    for (let x = 0; x < 15; x++) for (const y of [0, 1, 19, 20]) s.put(x, y, Art.pick(G, (y === 0 || y === 19 ? 0.9 : 0.35) - x * 0.02, x, y));
    for (let y = 2; y < 19; y++) {
      const half = Math.max(1, Math.round(Math.abs(y - 10.5) * 0.62));
      for (let x = 7 - half; x <= 7 + half; x++) s.put(x, y, x === 7 - half || x === 7 + half ? '#8A9AB8' : '#1E2440', 0.9);
      s.put(1, y, G[2]); s.put(13, y, G[1]);
    }
    return (glass = s.canvas());
  }

  function drawHourglass(ctx, x, y) {
    ctx.drawImage(hourglass(), x, y);
    // a areia: em cima diminuindo, embaixo crescendo, e o fiozinho caindo no meio
    const k = Math.max(0, Math.min(1, t / ((p.seconds || 2.6) * 0.9)));
    const upper = Math.round((1 - k) * 6), lower = Math.round(k * 6);
    for (let j = 0; j < upper; j++) { const yy = 10 - j, half = Math.max(0, Math.round(Math.abs(yy - 10.5) * 0.62) - 1); Gfx.rect(x + 7 - half, y + yy, half * 2 + 1, 1, '#F2C86A'); }
    for (let j = 0; j < lower; j++) { const yy = 18 - j, half = Math.max(0, Math.round(Math.abs(yy - 10.5) * 0.62) - 1); Gfx.rect(x + 7 - half, y + yy, half * 2 + 1, 1, j === lower - 1 ? '#FFE6A0' : '#E8B050'); }
    if (k < 1) for (let yy = 11; yy < 18 - lower + 1; yy++) if ((yy + Math.floor(t * 12)) % 2) Gfx.rect(x + 7, y + yy, 1, 1, '#F2C86A');
  }

  // o friso dourado: a linha que some nas pontas (pontilhada) e o losango no meio
  function divider(cx, y) {
    for (let i = 0; i < 60; i++) {
      const fade = i / 60;
      for (const sx of [-1, 1]) {
        const x = cx + sx * (6 + i);
        if (fade > 0.6 && (x + y) % 2) continue;
        Gfx.rect(x, y, 1, 1, fade < 0.3 ? '#F2C14E' : fade < 0.6 ? '#C9A24A' : '#8A6A2A');
      }
    }
    Gfx.rect(cx - 1, y - 3, 3, 7, '#F2C14E');
    Gfx.rect(cx - 3, y - 1, 7, 3, '#F2C14E');
    Gfx.rect(cx - 2, y - 2, 5, 5, '#F2C14E');
    Gfx.rect(cx, y - 2, 1, 1, '#FFF6D0');
    Gfx.rect(cx - 1, y - 1, 1, 1, '#FFF6D0');
  }

  // estrelinhas piscando no escuro
  function stars() {
    for (let i = 0; i < 26; i++) {
      const on = Math.sin(t * (0.7 + Art.hash(i, 1, 900) * 1.6) + i * 2.1);
      if (on < 0.5) continue;
      const x = Math.round(Art.hash(i, 2, 900) * W), y = Math.round(Art.hash(i, 3, 900) * H);
      if (Math.abs(y - H / 2) < 36) continue;   // longe do texto
      Gfx.rect(x, y, 1, 1, on > 0.9 ? '#FFFFFF' : '#8E86C8');
    }
  }

  return {
    enter(params) {
      p = params;
      t = 0;
      if (!bg) bg = background();
      const parts = String(p.text || '').split(' — ');
      top = parts[0];
      bottom = parts.slice(1).join(' — ');
    },

    update(dt) {
      t += dt;
      const secs = p.seconds || 2.6;
      if (t >= secs || (t >= 0.6 && Input.pressed('confirm'))) {
        t = -Infinity;   // sai uma vez só
        if (p.then) p.then();
      }
    },

    render(ctx) {
      ctx.drawImage(bg, 0, 0);
      stars();
      const cx = Display.W / 2;
      const fit = (str, max) => (Gfx.textWidth(str) * 2 <= max ? 2 : 1);
      if (bottom) {
        Gfx.text(top, cx, 102, '#F2C14E', { scale: fit(top, 450), align: 'center', shadow: '#5A3A12' });
        const s = fit(bottom, 450);
        Gfx.text(bottom, cx, 140, '#FFF4DA', { scale: s, align: 'center', shadow: '#07060E' });
        divider(cx, 128);
      } else {
        if (p.italic) drawHourglass(ctx, cx - 7, 96);
        Gfx.text(top, cx, 125, '#CFC8E8', { italic: !!p.italic, align: 'center', shadow: '#07060E' });
      }
    },

    skip() { if (p.then) { const f = p.then; p.then = null; f(); } }
  };
})();

Game.register('card', CardState);
