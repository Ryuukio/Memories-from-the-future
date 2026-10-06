// Modo de teste (só para o Fabio). Ctrl+Shift+D abre o menu: pular para qualquer parte do jogo,
// ficar invisível (os vigias não detectam), ver as caixas de colisão e o FPS.
// Cada etapa registra seus destinos com Debug.addJump(rótulo, função). Atalhos em GAME_CONFIG.debug.
const Debug = (() => {
  const flags = { invisible: false, boxes: false, fps: false };
  const jumps = [];
  const VISIBLE = 12;
  let open = false, sel = 0, top = 0, saveLabel = '';
  const onOff = v => (v ? 'ON' : 'OFF');

  function items() {
    return jumps.map(j => ({ label: j.label, run: j.fn })).concat([
      { label: 'Invisible (no detection): ' + onOff(flags.invisible), run: () => { flags.invisible = !flags.invisible; }, stay: true },
      { label: 'Collision boxes: ' + onOff(flags.boxes), run: () => { flags.boxes = !flags.boxes; }, stay: true },
      { label: 'FPS counter: ' + onOff(flags.fps), run: () => { flags.fps = !flags.fps; }, stay: true },
      { label: 'Fake save at F1A1', run: () => { Save.write({ stage: 1, scene: 'F1A1', memory: 0 }); readSave(); }, stay: true },
      { label: 'Clear save', run: () => { Save.clear(); readSave(); }, stay: true },
      { label: 'Close', run: () => {} }
    ]);
  }

  function readSave() {
    const s = Save.load();
    saveLabel = 'save: ' + (s && s.scene ? s.scene : 'none');
  }

  function toggle() {
    open = !open;
    if (open) { sel = 0; top = 0; readSave(); }
  }

  // devolve true enquanto o menu está aberto (o jogo fica parado)
  function update() {
    if (!open) return false;
    const list = items();
    if (Input.pressed('up')) { sel = (sel + list.length - 1) % list.length; Sound.sfx('move'); }
    if (Input.pressed('down')) { sel = (sel + 1) % list.length; Sound.sfx('move'); }
    if (sel < top) top = sel;
    if (sel >= top + VISIBLE) top = sel - VISIBLE + 1;
    if (Input.pressed('cancel')) { open = false; return true; }
    if (Input.pressed('confirm')) {
      const it = list[sel];
      if (!it.stay) open = false;
      Sound.sfx('confirm');
      it.run();
    }
    return true;
  }

  function render(ctx) {
    if (flags.fps) Gfx.text('FPS ' + Loop.fps, 4, Display.H - 12, '#7CFC9A', { shadow: '#07060E' });
    if (!open) return;
    ctx.save();
    ctx.globalAlpha = 0.6;
    Gfx.rect(0, 0, Display.W, Display.H, '#07060E');
    ctx.restore();
    const x = 70, y = 14, w = 244, h = 188;
    Gfx.panel(x, y, w, h);
    Gfx.text('TEST MODE', x + 10, y + 8, '#F2C14E', { shadow: '#07060E' });
    Gfx.text(saveLabel, x + w - 10, y + 8, '#9C93C8', { align: 'right' });
    const list = items();
    for (let i = top; i < Math.min(list.length, top + VISIBLE); i++) {
      const ly = y + 24 + (i - top) * 12;
      if (i === sel) Gfx.text('>', x + 10, ly, '#F2C14E');
      Gfx.text(list[i].label, x + 20, ly, i === sel ? '#FFF4DA' : '#9C93C8');
    }
    if (top > 0) Gfx.text('-', x + w - 14, y + 24, '#9C93C8');
    if (top + VISIBLE < list.length) Gfx.text('+', x + w - 14, y + 24 + (VISIBLE - 1) * 12, '#9C93C8');
    Gfx.text('Up/Down · Space · Esc', x + w / 2, y + h - 14, '#6E6699', { align: 'center' });
  }

  return {
    flags,
    addJump(label, fn) { jumps.push({ label, fn }); },
    toggle,
    update,
    render,
    get open() { return open; }
  };
})();
