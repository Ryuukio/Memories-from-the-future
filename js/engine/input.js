// Entrada: o jogo lê ações, não teclas. Ações: up, down, left, right, run, confirm, cancel.
// "interact" é o mesmo que "confirm" (Espaço/Enter interagem, avançam o diálogo e confirmam).
// Input.setVirtual(ação, apertada) existe para controles de toque no futuro, sem mexer no jogo.
const Input = (() => {
  const KEYS = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ShiftLeft: 'run', ShiftRight: 'run',
    Space: 'confirm', Enter: 'confirm', NumpadEnter: 'confirm',
    Escape: 'cancel'
  };
  const ALIAS = { interact: 'confirm' };
  const act = a => ALIAS[a] || a;

  const keys = {};        // código da tecla → apertada?
  const virtual = {};     // ação → apertada? (toque)
  let pressed = {};       // ação → apertada neste passo do loop
  const hotkeys = [];     // atalhos de sistema: F, M, modo de teste...
  const anyKey = [];
  let textMode = false;   // tela de senha: o teclado digita normalmente
  let typed = [];

  // "Ctrl+Shift+D" → { ctrl, shift, alt, meta, code: 'KeyD' }
  function parseCombo(str) {
    const parts = String(str).split('+').map(s => s.trim().toLowerCase());
    const key = parts.pop();
    let code = key;
    if (/^[a-z]$/.test(key)) code = 'Key' + key.toUpperCase();
    else if (/^[0-9]$/.test(key)) code = 'Digit' + key;
    else if (key.length > 1) code = key[0].toUpperCase() + key.slice(1);
    return {
      code,
      ctrl: parts.includes('ctrl'), shift: parts.includes('shift'),
      alt: parts.includes('alt'), meta: parts.includes('meta')
    };
  }

  function matches(h, e) {
    if (e.code !== h.code || e.ctrlKey !== h.ctrl || e.altKey !== h.alt || e.metaKey !== h.meta) return false;
    // atalho de uma tecla só (F, M) funciona mesmo correndo com Shift
    return (h.ctrl || h.alt || h.meta) ? e.shiftKey === h.shift : true;
  }

  window.addEventListener('keydown', e => {
    anyKey.forEach(fn => fn(e));

    for (const h of hotkeys) {
      if (matches(h, e) && (!textMode || h.inText)) {
        e.preventDefault();
        if (!e.repeat) h.fn();
        return;
      }
    }

    if (textMode && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key === 'Backspace') { e.preventDefault(); typed.push('\b'); return; }
      if (e.key.length === 1) { e.preventDefault(); typed.push(e.key); return; }
    }

    const a = KEYS[e.code];
    if (!a || e.ctrlKey || e.altKey || e.metaKey) return;
    e.preventDefault();
    if (!keys[e.code] && !e.repeat) pressed[a] = true;
    keys[e.code] = true;
  });

  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  return {
    // segurando a ação?
    down(a) {
      a = act(a);
      if (virtual[a]) return true;
      for (const code in keys) if (keys[code] && KEYS[code] === a) return true;
      return false;
    },
    // apertou neste passo?
    pressed: a => !!pressed[act(a)],
    // gasta o aperto, para ninguém mais reagir a ele neste passo
    consume(a) { pressed[act(a)] = false; },
    // chamado pelo loop no fim de cada passo
    endTick() { pressed = {}; },

    // direção de movimento normalizada (8 direções)
    axis() {
      let x = 0, y = 0;
      if (this.down('left')) x -= 1;
      if (this.down('right')) x += 1;
      if (this.down('up')) y -= 1;
      if (this.down('down')) y += 1;
      if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },

    setVirtual(a, isDown) {
      a = act(a);
      if (isDown && !virtual[a]) pressed[a] = true;
      virtual[a] = isDown;
    },

    // atalho de sistema; inText = funciona também na tela de senha
    hotkey(combo, fn, inText = false) { hotkeys.push(Object.assign(parseCombo(combo), { fn, inText })); },
    onAnyKey(fn) { anyKey.push(fn); },

    setTextMode(on) { textMode = !!on; typed = []; },
    // letras digitadas desde a última chamada ("\b" = apagar)
    takeTyped() { const t = typed; typed = []; return t; }
  };
})();
