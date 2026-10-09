// Estados do jogo (título, cutscene, stealth, baú, máquina, loja, batalha, final) e transições.
// Cada estado é um objeto com enter(params), update(dt) e render(ctx) e, se quiser:
//   exit()       ao sair do estado
//   idle(dt)     roda no lugar de update enquanto um diálogo pausa o jogo (animações)
//   skip()       atalho de emergência (Ctrl+Shift+K)
//   pausable     true = Esc pausa
const Game = (() => {
  const states = {};
  const FADE_TIME = 0.3;
  const fade = { a: 0, dir: 0, then: null };
  let state = null, name = '', paused = false, notice = null;

  function swap(next, params) {
    if (!states[next]) throw new Error('Estado desconhecido: ' + next);
    if (state && state.exit) state.exit();
    Dialog.close();
    paused = false;
    name = next;
    state = states[next];
    if (state.enter) state.enter(params || {});
  }

  // escurece a tela, roda fn e clareia de novo
  function transition(fn) {
    fade.dir = 1;
    fade.then = fn;
  }

  function go(next, params, o = {}) {
    if (o.instant || !state) swap(next, params);
    else transition(() => swap(next, params));
  }

  function update(dt) {
    if (notice && (notice.t -= dt) <= 0) notice = null;

    if (fade.dir === 1) {
      fade.a = Math.min(1, fade.a + dt / FADE_TIME);
      if (fade.a >= 1) {
        const fn = fade.then;
        fade.then = null;
        fade.dir = -1;
        if (fn) fn();
      }
      return;   // escurecendo: o estado fica parado
    }
    if (fade.dir === -1) {
      fade.a = Math.max(0, fade.a - dt / FADE_TIME);
      if (fade.a === 0) fade.dir = 0;
    }
    if (!state) return;

    if (state.pausable && Input.pressed('cancel')) {
      Input.consume('cancel');
      paused = !paused;
      Sound.sfx('pause');
    }
    if (paused) return;

    Dialog.update(dt);
    if (Dialog.isBlocking()) {
      if (state.idle) state.idle(dt);
    } else {
      state.update(dt);
    }
  }

  function drawPause() {
    const p = GAME_CONFIG.pause, ctx = Gfx.ctx;
    ctx.save();
    ctx.globalAlpha = 0.55;
    Gfx.rect(0, 0, Display.W, Display.H, '#07060E');
    ctx.restore();
    const w = Math.max(Gfx.textWidth(p.hint) + 36, 140), h = 58;
    const x = Math.round((Display.W - w) / 2), y = 103;
    Gfx.panel(x, y, w, h);
    Gfx.text(p.title, Display.W / 2, y + 11, '#F2C14E', { scale: 2, align: 'center', shadow: '#07060E' });
    Gfx.text(p.hint, Display.W / 2, y + 38, '#CFC8E8', { align: 'center' });
  }

  function render(ctx) {
    if (state) state.render(ctx);
    Dialog.render(ctx);
    if (notice) Gfx.text(notice.text, Display.W - 8, 35, '#FFF4DA', { align: 'right', shadow: '#07060E' });
    if (paused) drawPause();
    if (fade.a > 0) {
      ctx.save();
      ctx.globalAlpha = fade.a;
      Gfx.rect(0, 0, Display.W, Display.H, '#000');
      ctx.restore();
    }
  }

  return {
    register(n, s) { states[n] = s; },
    go,
    transition,
    skip() {
      if (!state || !state.skip || fade.dir) return;
      paused = false;
      state.skip();
    },
    // aviso curto no canto (ex.: SOUND OFF)
    notice(text, secs = 1.2) { notice = { text, t: secs }; },
    get name() { return name; },
    get state() { return state; },
    get paused() { return paused; },
    update,
    render
  };
})();
