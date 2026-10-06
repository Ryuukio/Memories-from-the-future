// Cartão em tela preta: o título de cada fase ("STAGE 1 — The First Date") e, na etapa 5, os
// cartões do prólogo ("Some years later..."). Fica alguns segundos (ou até Espaço) e segue.
// Game.go('card', { text, seconds, then })   text com " — " vira duas linhas: a de cima em dourado
const CardState = (() => {
  let p = {}, t = 0, top = '', bottom = '';

  return {
    enter(params) {
      p = params;
      t = 0;
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

    render() {
      Gfx.rect(0, 0, Display.W, Display.H, '#07060E');
      const cx = Display.W / 2;
      const fit = (str, max) => (Gfx.textWidth(str) * 2 <= max ? 2 : 1);
      if (bottom) {
        Gfx.text(top, cx, 82, '#F2C14E', { scale: fit(top, 360), align: 'center', shadow: '#5A3A12' });
        const s = fit(bottom, 360);
        Gfx.text(bottom, cx, 112, '#FFF4DA', { scale: s, align: 'center', shadow: '#07060E' });
        Gfx.rect(cx - 40, 102, 80, 1, '#5B4F92');
      } else {
        Gfx.text(top, cx, 100, '#CFC8E8', { italic: !!p.italic, align: 'center', shadow: '#07060E' });
      }
    },

    skip() { if (p.then) { const f = p.then; p.then = null; f(); } }
  };
})();

Game.register('card', CardState);
