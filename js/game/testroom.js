// Sala de teste (etapa 1): duas telas lado a lado para testar loop, entrada, câmera, colisão,
// diálogo, pausa, salvamento e modo de teste. Fale com o Fabio (Espaço) para testar a caixa de diálogo.
const TestRoomState = (() => {
  const T = 16, COLS = 48, ROWS = 12, TOP = Hud.H;
  const ROOM_W = COLS * T, ROOM_H = ROWS * T;
  const CRATES = [[6, 4], [7, 4], [12, 8], [16, 3], [19, 7], [30, 4], [31, 4], [35, 8], [40, 3], [43, 7]];

  // textos só de teste (não fazem parte do jogo): cobrem todos os caracteres especiais
  const TEST_LINES = [
    "FABIO: Hello! This is the test room. Space completes the line; press it again to continue.",
    "ELLEN: Characters: STAGE 1 — The First Date. AMMO ×5. Islands, Rings & Lanterns.",
    "FABIO: More: Iced tea at the café, Guaraná, 3³, \"Reduces cravings.\" (BULLETS: 5) 100% + 1;",
    "NARRATOR: Fabio fell into a deep food coma. When he woke up, he couldn't remember anything. Not even her. This line is long on purpose, to test pages.",
    "[testAction]",
    "TONY: Arrows or WASD to move. Shift to run. Space to interact.",
    "HEYMANS: Bring him back, Ellen.",
    "TONY & HEYMANS: Good luck!",
    "BIG JIMMY JUNK: I'll take him back... with a side of fries!",
    "MACHINE: DESTINATION: 16 AUGUST 2025.",
    "BIG JIMMY JUNK used TEMPTATION!"
  ];

  const solid = [];
  for (let r = 0; r < ROWS; r++) {
    solid.push([]);
    for (let c = 0; c < COLS; c++) {
      const wall = r < 2 || r === ROWS - 1 || c === 0 || c === COLS - 1;
      const divider = (c === 23 || c === 24) && (r < 5 || r > 7);   // passagem entre as duas metades
      solid[r].push(wall || divider);
    }
  }
  CRATES.forEach(([c, r]) => { solid[r][c] = true; });
  const isSolid = (tx, ty) => tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS || solid[ty][tx];
  const isCrate = (c, r) => CRATES.some(([cc, rr]) => cc === c && rr === r);

  const ellen = { x: 0, y: 0, face: 'right', moving: false, anim: 0 };
  const fabio = { x: 9 * T + 8, y: 6 * T + 8, face: 'left' };
  let bg = null;

  // ---------- colisão: caixa de 10×6 px nos pés ----------
  const hitbox = (px, py) => ({ l: px - 5, r: px + 5, t: py - 6, b: py });
  const overlaps = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

  function blocked(px, py) {
    const h = hitbox(px, py);
    for (let ty = Math.floor(h.t / T); ty <= Math.floor((h.b - 0.01) / T); ty++) {
      for (let tx = Math.floor(h.l / T); tx <= Math.floor((h.r - 0.01) / T); tx++) {
        if (isSolid(tx, ty)) return true;
      }
    }
    return overlaps(h, hitbox(fabio.x, fabio.y));
  }

  // anda em passos de no máximo 1 px, para encostar nas paredes sem atravessar
  function move(e, dx, dy) {
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    for (let i = 0; i < steps; i++) {
      const nx = e.x + dx / steps, ny = e.y + dy / steps;
      if (blocked(nx, ny)) return;
      e.x = nx;
      e.y = ny;
    }
  }

  // ---------- cenário ----------
  const hash = (a, b) => {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };

  function floorTile(c, x, y, col, row) {
    for (let i = 0; i < 4; i++) {
      const tone = ['#9C6B43', '#A57249', '#93653F'][hash(col, row * 4 + i) % 3];
      Gfx.rect(x, y + i * 4, T, 4, tone, c);
      Gfx.rect(x, y + i * 4 + 3, T, 1, '#7A4E30', c);
      if ((col + i) % 2 === 0) Gfx.rect(x + 2 + hash(col * 7, row * 4 + i) % 12, y + i * 4, 1, 3, '#7A4E30', c);
    }
  }

  function block(c, x, y, front) {
    Gfx.rect(x, y, T, T, '#3B3150', c);
    Gfx.rect(x, y, T, 1, '#5B4F7A', c);
    if (front) {
      Gfx.rect(x, y + 9, T, 4, '#E9DFC4', c);
      Gfx.rect(x, y + 13, T, 3, '#8A5A3C', c);
    }
  }

  function crate(c, x, y) {
    c.save();
    c.globalAlpha = 0.3;
    Gfx.rect(x + 3, y + 14, 13, 3, '#1E1826', c);
    c.restore();
    Gfx.rect(x + 1, y + 1, 14, 14, '#3A2A22', c);
    Gfx.rect(x + 2, y + 2, 12, 8, '#C08A55', c);
    Gfx.rect(x + 2, y + 2, 12, 1, '#DDA875', c);
    Gfx.rect(x + 7, y + 3, 1, 7, '#9A6A3E', c);
    Gfx.rect(x + 2, y + 10, 12, 4, '#8F6238', c);
  }

  function buildBackground() {
    const cv = Gfx.canvas(ROOM_W, ROOM_H), c = cv.cx;
    for (let r = 2; r < ROWS - 1; r++) {
      for (let col = 1; col < COLS - 1; col++) floorTile(c, col * T, r * T, col, r);
    }
    // parede do fundo: creme em cima, lambri de madeira embaixo
    Gfx.rect(0, 0, ROOM_W, 21, '#E9DFC4', c);
    Gfx.rect(0, 21, ROOM_W, 9, '#8A5A3C', c);
    Gfx.rect(0, 21, ROOM_W, 1, '#B07A50', c);
    Gfx.rect(0, 30, ROOM_W, 2, '#4A3024', c);
    c.save();
    c.globalAlpha = 0.25;
    Gfx.rect(0, 32, ROOM_W, 3, '#1E1826', c);
    c.restore();
    Gfx.text('TEST ROOM · A', 12 * T, 7, '#8A5A3C', { ctx: c, align: 'center' });
    Gfx.text('TEST ROOM · B', 36 * T, 7, '#8A5A3C', { ctx: c, align: 'center' });
    // paredes laterais, de baixo, divisória e caixotes
    for (let r = 2; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        if (!solid[r][col]) continue;
        if (isCrate(col, r)) crate(c, col * T, r * T);
        else block(c, col * T, r * T, !isSolid(col, r + 1));
      }
    }
    return cv;
  }

  function drawBoxes(ctx) {
    const c0 = Math.floor(Camera.x / T);
    for (let r = 0; r < ROWS; r++) {
      for (let col = c0; col <= c0 + 24 && col < COLS; col++) {
        if (solid[r][col]) Gfx.box(col * T - Camera.x, TOP + r * T, T, T, 'rgba(255,58,50,0.6)');
      }
    }
    [ellen, fabio].forEach(e => {
      const h = hitbox(e.x, e.y);
      Gfx.box(h.l - Camera.x, TOP + h.t, h.r - h.l, h.b - h.t, '#F2C14E');
    });
  }

  return {
    pausable: true,

    enter() {
      if (!bg) bg = buildBackground();
      ellen.x = 3 * T;
      ellen.y = 7 * T;
      ellen.face = 'right';
      Camera.follow(ellen.x, ROOM_W);
      // a fala de entrada do F1 A1, lida do config.js, para testar o modo "toast"
      Dialog.toast(GAME_CONFIG.stages[0].scenes[0].line);
    },

    update(dt) {
      const d = GAME_CONFIG.difficulty;
      const a = Input.axis();
      const speed = Input.down('run') ? d.runSpeed : d.walkSpeed;
      move(ellen, a.x * speed * dt, 0);
      move(ellen, 0, a.y * speed * dt);
      ellen.moving = !!(a.x || a.y);
      if (a.x) ellen.face = a.x > 0 ? 'right' : 'left';
      ellen.anim = ellen.moving ? ellen.anim + dt * speed / 16 : 0;
      fabio.face = ellen.x < fabio.x ? 'left' : 'right';
      Camera.follow(ellen.x, ROOM_W);

      if (Input.pressed('interact') && Math.hypot(ellen.x - fabio.x, ellen.y - fabio.y) < 26) {
        Input.consume('interact');
        Dialog.say(TEST_LINES, { onAction: name => Game.notice('ACTION: ' + name) });
      }
    },

    render(ctx) {
      ctx.drawImage(bg, Camera.x, 0, Display.W, ROOM_H, 0, TOP, Display.W, ROOM_H);
      const frame = ellen.moving ? Math.floor(ellen.anim * 2) % 4 : -1;
      const actors = [
        { e: fabio, img: Chars.sprite('FABIO_NOW', { dir: fabio.face }) },
        { e: ellen, img: Chars.sprite('ELLEN_NOW', { dir: ellen.face, frame }) }
      ].sort((p, q) => p.e.y - q.e.y);
      actors.forEach(({ e }) => Gfx.shadow(e.x - Camera.x, TOP + e.y - 1, 12, 4));
      actors.forEach(({ e, img }) => Gfx.draw(img, e.x - 8 - Camera.x, TOP + e.y - 31));
      if (Debug.flags.boxes) drawBoxes(ctx);
      Hud.draw(0, Hud.today(), 'Test room', 0);
    },

    // atalho de emergência: aqui só leva a Ellen para a outra metade da sala
    skip() {
      ellen.x = 44 * T;
      ellen.y = 6 * T;
    }
  };
})();

Game.register('testroom', TestRoomState);
