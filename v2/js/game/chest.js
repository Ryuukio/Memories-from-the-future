// O baú no fim de cada fase (SPEC, seção 7): a Ellen abre com Espaço, a tampa abre, aparece o
// cartão do item (sprite e texto) com um jingle, a barra de memória ganha um segmento com
// animação e o Fabio do presente diz o que lembrou. Roda dentro do stealth, na salinha do baú.
// Chest.open(fase, objeto do baú, ao terminar)
const Chest = (() => {
  const FILL_TIME = 1.4;
  let s = null;   // { stage, p, t, step, done, card, from }

  const cfg = () => GAME_CONFIG.stages[s.stage - 1];

  function open(stage, p, done) {
    s = { stage, p, t: 0, step: 'lid', done, card: 0, from: Flow.memory };
    p.open = 0;
    Sound.sfx('chest');
  }

  function go(step) {
    s.step = step;
    s.t = 0;
  }

  function anim(dt) {
    if (!s) return;
    if (s.step === 'lid') s.p.open = Math.min(1, s.t / 0.4);
    if (s.step === 'card' || s.step === 'item') s.card = Math.min(1, s.card + dt / 0.35);
    if (s.step === 'memory' || s.step === 'line' || s.step === 'end') s.card = Math.max(0, s.card - dt / 0.3);
  }

  // durante as falas o jogo fica parado; só as animações andam
  function idle(dt) {
    if (!s) return;
    s.t += dt;
    anim(dt);
  }

  function update(dt) {
    if (!s) return;
    s.t += dt;
    anim(dt);
    if (s.step === 'lid' && s.t >= 0.7) {
      go('card');
      Sound.sfx('item');
    } else if (s.step === 'card' && s.t >= 0.5) {
      go('item');
      Dialog.say([cfg().chest.text], { onDone: () => { go('memory'); Sound.sfx('memory'); } });
    } else if (s.step === 'memory') {
      const k = Math.min(1, s.t / FILL_TIME);
      Flow.memory = Math.max(s.from, Math.min(5, s.stage - 1 + k * k * (3 - 2 * k)));
      if (k >= 1) {
        Flow.memory = Math.max(Flow.memory, s.stage);
        go('line');
        Dialog.say([{ who: 'Fabio', text: cfg().memoryLine }], { onDone: () => go('end') });
      }
    } else if (s.step === 'end' && s.t >= 0.4) {
      const done = s.done;
      s = null;
      done();
    }
  }

  // raios girando atrás do item
  function rays(ctx, cx, cy, r, t) {
    ctx.save();
    ctx.globalAlpha = 0.35 * s.card;
    for (let i = 0; i < 12; i++) {
      const a = t * 0.6 + i * Math.PI / 6;
      for (let k = 6; k < r; k += 2) {
        Gfx.rect(Math.round(cx + Math.cos(a) * k), Math.round(cy + Math.sin(a) * k * 0.8), 1, 1, i % 2 ? '#F2C14E' : '#FFF4DA');
      }
    }
    ctx.restore();
  }

  function render(ctx) {
    if (!s || s.card <= 0) return;
    const img = Items.sprite(cfg().chest.icon || 'revolver');
    const scale = 4, iw = img.width * scale, ih = img.height * scale;   // V2: 3 × 1,25 ≈ 4
    const name = cfg().chest.item;
    const w = Math.max(iw + 50, Gfx.textWidth(name) + 36), h = ih + 55;
    const x = Math.round((Display.W - w) / 2), y = Math.round(55 + (1 - s.card) * 12);
    ctx.save();
    ctx.globalAlpha = s.card;
    Gfx.panel(x, y, w, h);
    ctx.restore();
    if (s.card < 0.5) return;
    const cx = Display.W / 2, cy = y + 18 + ih / 2;
    rays(ctx, cx, cy, Math.min(w, h) / 2, Loop.time);
    ctx.drawImage(img, 0, 0, img.width, img.height, Math.round(cx - iw / 2), Math.round(cy - ih / 2 + Math.sin(Loop.time * 3)), iw, ih);
    Gfx.text(name, cx, y + h - 21, '#F2C14E', { align: 'center', shadow: '#07060E' });
  }

  return {
    open,
    update,
    idle,
    render,
    // atalho de emergência: termina o baú na hora
    skip() {
      if (!s) return;
      Dialog.close();
      Flow.memory = Math.max(Flow.memory, s.stage);
      const done = s.done;
      s = null;
      done();
    }
  };
})();
