// Stealth (SPEC, seção 5): a Ellen do presente atravessa a sala sem ser vista pelos vigias, com o
// Fabio do presente seguindo atrás (sem colisão e sem contar para a detecção). Com a Ellen no
// cone, a suspeita do vigia sobe; no estágio 3 ela é pega e volta ao começo do cenário em que
// está, e os loops dos vigias recomeçam.
//
// O mesmo estado anda também pelo corredor entre as salas (zona segura) e pela salinha do baú.
// Game.go('stealth', { stage: 1, kind: 'room', room: 0, codes: ['F1A1', 'F1A2'], at: 0, intro })
//   kind   'room' (memória), 'hall' (corredor) ou 'chest' (salinha do baú)
//   at     cenário de entrada; intro = falas antes de começar (chegada ao passado)
const StealthState = (() => {
  const TOP = Hud.H, VIEW_W = Display.W, VIEW_H = Display.H - Hud.H;
  const FOLLOW = 18;   // distância do Fabio atrás da Ellen, medida pelo caminho que ela fez
  const STRIDE = 8;    // px andados a cada quadro do ciclo de andar
  const SAMPLES = [[0, -2], [-4, -2], [4, -2]];   // pontos dos pés da Ellen testados nos cones

  let room = null, params = {};
  let ellen, fabio, trail, cur, entered, phase, timer, flash, time, sightNow;
  let lastLine = -1, lineShown = false;

  const d = () => GAME_CONFIG.difficulty;
  const hitbox = (x, y) => ({ x: x - 5, y: y - 6, w: 10, h: 6 });
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const sceneAt = x => Math.max(0, Math.min(room.scenes.length - 1, Math.floor(x / Room.SW)));
  const world = { t: 0, ellen: null };

  // ---------- colisão ----------
  // quem anda (garçom) bloqueia, mas se já estiver em cima da Ellen ela pode sair
  function blocked(x, y) {
    const h = hitbox(x, y);
    if (h.x < 0 || h.y < 0 || h.x + h.w > room.w) return true;
    for (let i = 0; i < room.solids.length; i++) if (overlap(h, room.solids[i])) return true;
    const now = hitbox(ellen.x, ellen.y);
    for (let i = 0; i < room.movers.length; i++) {
      const r = room.movers[i].rect();
      if (overlap(h, r) && !overlap(now, r)) return true;
    }
    return false;
  }

  // anda em passos de no máximo 1 px, para encostar sem atravessar
  function step(e, dx, dy) {
    const n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    for (let i = 0; i < n; i++) {
      const nx = e.x + dx / n, ny = e.y + dy / n;
      if (blocked(nx, ny)) return false;
      e.x = nx;
      e.y = ny;
    }
    return true;
  }

  // andando reto contra uma quina, desliza até 5 px para o lado livre (passar por portas e mesas)
  function nudge(e, sx, sy, amount) {
    for (let k = 1; k <= 5; k++) {
      for (const s of [-1, 1]) {
        const ox = sy ? s * k : 0, oy = sx ? s * k : 0;
        let free = true;
        for (let j = 1; j <= k && free; j++) free = !blocked(e.x + Math.sign(ox) * j, e.y + Math.sign(oy) * j);
        if (free && !blocked(e.x + ox + sx, e.y + oy + sy)) {
          step(e, Math.sign(ox) * Math.min(amount, k), Math.sign(oy) * Math.min(amount, k));
          return;
        }
      }
    }
  }

  function move(e, vx, vy) {
    const okX = step(e, vx, 0), okY = step(e, 0, vy);
    if (!okX && !vy) nudge(e, Math.sign(vx), 0, Math.abs(vx));
    if (!okY && !vx) nudge(e, 0, Math.sign(vy), Math.abs(vy));
  }

  // direção do sprite: nas diagonais mantém a que já tinha, para não ficar trocando
  function faceFrom(cur, dx, dy) {
    const ax = Math.abs(dx), ay = Math.abs(dy);
    const h = dx > 0 ? 'right' : 'left', v = dy > 0 ? 'down' : 'up';
    if ((cur === h && ax > 0 && ax >= ay * 0.5) || (cur === v && ay > 0 && ay >= ax * 0.5)) return cur;
    return ax >= ay ? h : v;
  }

  // ---------- o Fabio do presente segue o rastro da Ellen ----------
  function follow() {
    const last = trail[trail.length - 1];
    if (Math.hypot(ellen.x - last.x, ellen.y - last.y) >= 1) trail.push({ x: ellen.x, y: ellen.y });
    let need = FOLLOW, px = ellen.x, py = ellen.y, tx = trail[0].x, ty = trail[0].y;
    for (let i = trail.length - 1; i >= 0; i--) {
      const q = trail[i], seg = Math.hypot(px - q.x, py - q.y);
      if (seg >= need) {
        const t = need / seg;
        tx = px + (q.x - px) * t;
        ty = py + (q.y - py) * t;
        trail.splice(0, i);
        break;
      }
      need -= seg;
      px = q.x;
      py = q.y;
    }
    const dx = tx - fabio.x, dy = ty - fabio.y, m = Math.hypot(dx, dy);
    fabio.moving = m > 0.05;
    if (fabio.moving) {
      fabio.dist += m;
      fabio.dir = faceFrom(fabio.dir, dx, dy);
    }
    fabio.x = tx;
    fabio.y = ty;
  }

  // ---------- cenários ----------
  function placeAt(i) {
    const s = room.scenes[i], st = s.data.start;
    const dir = st.dir || 'right';
    ellen = { x: s.ox + st.x, y: st.y, dir, moving: false, dist: 0 };
    world.ellen = ellen;
    const back = { right: [-1, 0], left: [1, 0], down: [0, -1], up: [0, 1] }[dir];
    fabio = { x: ellen.x + back[0] * FOLLOW, y: ellen.y + back[1] * FOLLOW, dir, moving: false, dist: 0 };
    trail = [{ x: fabio.x, y: fabio.y }, { x: ellen.x, y: ellen.y }];
    room.guards.forEach(g => g.reset());
    room.movers.forEach(m => m.reset());
    castCones();
    Camera.follow(ellen.x, room.w);
  }

  function enterScene(i) {
    cur = i;
    const s = room.scenes[i];
    if (params.kind === 'hall') return;
    if (params.kind === 'chest') {
      Save.write({ stage: params.stage, scene: 'CHEST', memory: Flow.memory });
      return;
    }
    Save.write({ stage: params.stage, scene: s.code, memory: Flow.memory });
    if (!entered[i]) {
      entered[i] = true;
      const line = s.cfg.line || (s.cfg.lines && s.cfg.lines[0]);
      if (line) Dialog.toast(line);
    }
  }

  function exitRoom() {
    phase = 'exit';
    Sound.sfx('door');
    Flow.roomDone(params);
  }

  // ---------- vigias, cones e detecção ----------
  function castCones() {
    const rays = d().coneRays || 24;
    // quem anda (garçom) também tapa a visão
    sightNow = room.movers.length ? room.sight.concat(room.movers.map(m => m.rect())) : room.sight;
    room.guards.forEach(g => Vision.cast(g.cone(), sightNow, rays));
  }

  function detect(dt) {
    room.guards.forEach(g => {
      const cone = g._cone, before = g.stage();
      g.seeing = g.coneActive() && !Debug.flags.invisible &&
        SAMPLES.some(([ox, oy]) => Vision.inside(cone, ellen.x + ox, ellen.y + oy));
      g.sus = g.seeing
        ? Math.min(3, g.sus + d().suspicionUpPerSec * dt)
        : Math.max(0, g.sus - d().suspicionDownPerSec * dt);
      const after = g.stage();
      if (after > before) Sound.sfx('alert' + after);
      if (after >= 3 && phase === 'play') caught();
    });
  }

  // estágio 3: pausa curta, flash, uma fala sorteada do Fabio, tela escura e volta ao começo
  function caught() {
    phase = 'caught';
    timer = 0;
    lineShown = false;
    Sound.sfx('caught');
  }

  function caughtLine() {
    const lines = GAME_CONFIG.texts.caught;
    let i = Math.floor(Math.random() * lines.length);
    if (lines.length > 1 && i === lastLine) i = (i + 1) % lines.length;
    lastLine = i;
    return { who: 'Fabio', text: lines[i] };
  }

  function restart() {
    const i = sceneAt(ellen.x);
    placeAt(i);
    if (i !== cur) enterScene(i);
    phase = 'play';
  }

  function updateCaught(dt) {
    timer += dt;
    if (!lineShown && timer >= d().caughtPause) {
      lineShown = true;
      flash = 1;
      Dialog.toast(caughtLine(), { seconds: d().caughtLineSeconds, onDone: () => Game.transition(restart) });
    }
  }

  // ---------- objetos interativos (o baú) ----------
  function nearby() {
    const fx = ellen.x, fy = ellen.y - 3;
    return room.interact.find(it => !it.p.used &&
      fx > it.rect.x - 8 && fx < it.rect.x + it.rect.w + 8 && fy > it.rect.y - 6 && fy < it.rect.y + it.rect.h + 12);
  }

  function interact(it) {
    if (it.kind === 'chest') {
      it.p.used = true;
      phase = 'chest';
      ellen.moving = false;
      fabio.moving = false;
      Chest.open(params.stage, it.p, () => Flow.chestDone(params.stage));
    }
  }

  // ---------- desenho ----------
  function drawSteam(ctx) {
    room.steam.forEach(s => {
      for (let k = 0; k < 3; k++) {
        const ph = (time * 0.7 + k / 3 + s.seed) % 1;
        const x = s.x - 3 + k * 3 + Math.round(Math.sin((time + k) * 2.5));
        ctx.globalAlpha = 0.75 * (1 - ph);
        Gfx.rect(x, s.y - 2 - ph * 14, 1, 2, '#F2ECE0');
      }
    });
    ctx.globalAlpha = 1;
  }

  // Luz do ambiente (noite, planetário): multiplica a parte visível do cenário pela cor e
  // acende as luzes (lanterna, poste) com pontilhado, em volta delas.
  function drawTint(ctx, cam) {
    room.scenes.forEach(s => {
      const tint = s.data.look.tint;
      if (!tint) return;
      const x0 = Math.max(s.ox, cam), x1 = Math.min(s.ox + Room.SW, cam + VIEW_W);
      if (x1 <= x0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, 0, x1 - x0, VIEW_H);
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      Gfx.rect(x0, 0, x1 - x0, VIEW_H, tint.color);
      ctx.globalCompositeOperation = 'lighter';
      (tint.lights || []).forEach(([lx, ly, r, color]) => {
        const img = Lights.get(r, color || '#3A2A10');
        ctx.drawImage(img, Math.round(s.ox + lx - r), Math.round(ly - r));
      });
      ctx.restore();
    });
  }

  function shadowAt(x) {
    return room.scenes[sceneAt(x)].data.look.shadow;
  }

  function drawDebug(ctx) {
    room.sight.forEach(r => Gfx.box(r.x, r.y, r.w, r.h, 'rgba(80,220,255,0.8)'));
    room.solids.forEach(r => Gfx.box(r.x, r.y, r.w, r.h, 'rgba(242,193,78,0.8)'));
    room.movers.forEach(m => { const r = m.rect(); Gfx.box(r.x, r.y, r.w, r.h, 'rgba(255,120,220,0.9)'); });
    if (room.exit) Gfx.box(room.exit.x, room.exit.y, room.exit.w, room.exit.h, '#FF5CF0');
    const h = hitbox(ellen.x, ellen.y);
    Gfx.box(h.x, h.y, h.w, h.h, '#7CFC9A');
    room.guards.forEach(g => Gfx.rect(g._cone.x - 1, g._cone.y - 1, 3, 3, '#FFFFFF'));
  }

  function hudTitle() {
    const st = GAME_CONFIG.stages[params.stage - 1] || {};
    if (params.kind !== 'room') return { date: '', title: st.title || '' };
    const s = room.scenes[cur].cfg;
    return { date: s.date || (s.dates ? s.dates[0] : ''), title: s.title };
  }

  return {
    pausable: true,

    enter(p) {
      params = Object.assign({ kind: 'room' }, p);
      room = Room.build(params.codes);
      entered = {};
      time = 0;
      flash = 0;
      phase = 'play';
      placeAt(params.at || 0);
      if (params.intro && params.intro.length) {
        // chegada ao passado: as falas vêm antes da fala de entrada do cenário
        Dialog.say(params.intro, { onDone: () => enterScene(params.at || 0) });
        cur = params.at || 0;
      } else {
        enterScene(params.at || 0);
      }
    },

    update(dt) {
      time += dt;
      world.t = time;
      flash = Math.max(0, flash - dt / 0.3);
      if (phase === 'caught') { updateCaught(dt); return; }
      if (phase === 'chest') { Chest.update(dt); return; }
      if (phase !== 'play') return;

      room.guards.forEach(g => g.update(dt));
      room.movers.forEach(m => m.update(dt));

      // a Ellen: 8 direções, Shift corre
      const a = Input.axis();
      const speed = Input.down('run') ? d().runSpeed : d().walkSpeed;
      const bx = ellen.x, by = ellen.y;
      move(ellen, a.x * speed * dt, a.y * speed * dt);
      const moved = Math.hypot(ellen.x - bx, ellen.y - by);
      ellen.moving = moved > 0.01;
      ellen.dist += moved;
      if (a.x || a.y) ellen.dir = faceFrom(ellen.dir, a.x, a.y);
      follow();
      Camera.follow(ellen.x, room.w);

      castCones();
      detect(dt);
      if (phase !== 'play') return;

      if (Input.pressed('interact')) {
        const it = nearby();
        if (it) { Input.consume('interact'); interact(it); return; }
      }

      const i = sceneAt(ellen.x);
      if (i !== cur) enterScene(i);
      if (room.exit && overlap(hitbox(ellen.x, ellen.y), room.exit)) exitRoom();
    },

    idle(dt) {
      time += dt;
      world.t = time;
      if (phase === 'chest') Chest.idle(dt);
    },

    render(ctx) {
      const cam = Camera.x;
      ctx.drawImage(room.bg, cam, 0, VIEW_W, VIEW_H, 0, TOP, VIEW_W, VIEW_H);

      // cones no chão, por baixo dos móveis e dos personagens
      Vision.begin(VIEW_W, VIEW_H);
      const pulse = 0.5 + 0.5 * Math.sin(time * 14);
      room.guards.forEach(g => { if (g.coneScale > 0) Vision.paint(g._cone, cam, 0, g.seeing ? pulse : 0); });
      Vision.end(ctx, 0, TOP);

      ctx.save();
      ctx.translate(-cam, TOP);
      const visible = (x, w) => x + w >= cam - 16 && x <= cam + VIEW_W + 16;
      room.fx.forEach(f => { if (f.layer === 'ground' && visible(f.p.x, 64)) f.def.fx(ctx, f.p, world); });

      const list = [];
      room.sorted.forEach(o => {
        if (!visible(o.x, o.w)) return;
        if (o.p && Scenery.props[o.p.type].live) list.push({ z: o.z, draw: () => Scenery.props[o.p.type].live(ctx, o.p, world, o.img) });
        else list.push({ z: o.z, draw: () => ctx.drawImage(o.img, o.x, o.y) });
      });
      room.npcs.forEach(n => {
        if (visible(n.x - 8, 16)) list.push({ z: n.y, draw: () => Chars.draw(ctx, Room.npcSprite(n, time), n.x, n.y, { chair: n.chair, dir: n.dir, pose: n.pose, shadow: shadowAt(n.x) }) });
      });
      room.guards.concat(room.movers).forEach(g => list.push({ z: g.y, draw: () => g.draw(ctx, shadowAt(g.x)) }));
      const fFrame = fabio.moving ? Math.floor(fabio.dist / STRIDE) % 4 : -1;
      const eFrame = ellen.moving ? Math.floor(ellen.dist / STRIDE) % 4 : -1;
      list.push({ z: fabio.y, draw: () => Chars.draw(ctx, Chars.sprite('FABIO_NOW', { dir: fabio.dir, frame: fFrame }), fabio.x, fabio.y, { shadow: shadowAt(fabio.x) }) });
      list.push({ z: ellen.y, draw: () => Chars.draw(ctx, Chars.sprite('ELLEN_NOW', { dir: ellen.dir, frame: eFrame }), ellen.x, ellen.y, { shadow: shadowAt(ellen.x) }) });
      list.sort((p, q) => p.z - q.z).forEach(o => o.draw());

      drawSteam(ctx);
      room.fx.forEach(f => { if (f.layer === 'top' && visible(f.p.x, 64)) f.def.fx(ctx, f.p, world); });
      drawTint(ctx, cam);
      room.guards.forEach(g => {
        if (g.fx === 'heart') {
          const at = g.def.heartAt || [0, -34];
          Guard.hearts(ctx, g.x + at[0], g.y + at[1], time);
        }
        Guard.bubble(ctx, g.x, g.y - (g.pose === 'lie' ? 34 : 31), g.stage(), time);
      });
      if (Debug.flags.boxes) drawDebug(ctx);
      ctx.restore();

      if (phase === 'chest') Chest.render(ctx);
      const h = hudTitle();
      Hud.draw(params.stage, h.date, h.title, Flow.memory);

      if (flash > 0) {
        ctx.globalAlpha = flash;
        Gfx.rect(0, 0, Display.W, Display.H, '#FFFFFF');
        ctx.globalAlpha = 1;
      }
    },

    // leitura do estado, para depurar pelo console do navegador
    inspect: () => ({ room, ellen, fabio, phase, cur, params }),

    // atalho de emergência: pula o cenário atual (no baú, abre o baú)
    skip() {
      if (phase === 'chest') { Chest.skip(); return; }
      if (phase !== 'play') return;
      Dialog.close();
      if (params.kind === 'chest') {
        const it = room.interact.find(i => !i.p.used);
        if (it) interact(it);
        return;
      }
      if (cur < room.scenes.length - 1) {
        placeAt(cur + 1);
        enterScene(cur + 1);
      } else {
        exitRoom();
      }
    }
  };
})();

// Luzes (poste, lanterna): círculos em níveis concêntricos com pontilhado Bayer, somados
// por cima da luz do ambiente (Apêndice E.1). Guardados em cache por raio e cor.
const Lights = (() => {
  const cache = {};
  return {
    get(r, color) {
      const key = r + color;
      if (!cache[key]) {
        const cv = Gfx.canvas(r * 2, r * 2);
        Scenery.glow(cv.cx, 0, 0, r * 2, r * 2, color, (i, j) => {
          const dd = Math.hypot(i + 0.5 - r, (j + 0.5 - r) * 1.5) / r;
          return dd >= 1 ? 0 : Math.min(1, Math.ceil((1 - dd) * 4) / 4 * 1.1);
        });
        cache[key] = cv;
      }
      return cache[key];
    }
  };
})();

Game.register('stealth', StealthState);
