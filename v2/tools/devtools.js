// Ferramentas de teste para o console do navegador (só para desenvolver; o jogo não carrega este
// arquivo). Com o jogo aberto pelo servidor de teste, carregue com:
//   await new Promise(r => { const s = document.createElement('script'); s.src = 'tools/devtools.js?' + Date.now(); s.onload = r; document.body.appendChild(s); });
//
// Ao carregar, o loop do navegador fica congelado (window.__frozen = true) e o jogo só anda com
// __run(segundos). Assim os testes dão o mesmo resultado com o painel visível ou oculto.
//
//   __reload()                 recarrega os scripts sem cache e a página (carregue este arquivo de novo depois)
//   __run(s)                   avança o jogo s segundos (passos de 1/60) e desenha
//   __snap(x, y, w, h, escala) copia um pedaço da tela ampliado para um canvas fixo no canto (para o print)
//   __lineup(roupas) / __poses(roupa)   as roupas lado a lado (frente, lado, costas, andando, sentada,
//                              no chão) e todas as poses de uma roupa, para conferir os sprites (26×48)
//   __open(códigos, cenário, sala, fase)   abre uma sala direto no cenário (sem a fala de entrada)
//   __look(x, y)               põe a Ellen em (x, y) e a câmera nela
//   __at(t)                    leva os vigias e quem anda ao tempo t do loop
//   __key / __tap / __hold     teclas simuladas (code: 'ArrowRight', 'Space', 'KeyK' + { ctrlKey, shiftKey })
//   __st()                     estado atual (tela, sala, cenário, posição, fase, salvamento)
//   __tp(x, y)                 teleporta a Ellen e o Fabio
// Balanceamento (SPEC, seção 5):
//   __plan(códigos, i, { run, t0 })      caminho mais rápido sem ser vista, saindo no tempo t0 do loop
//   __sweep(códigos, i, período)         o mesmo para várias fases do loop
//   __naive(códigos, i, período)         jogadora que anda reto sem olhar: suspeita máxima por fase (3 = pega)
//   __stats(texto do __naive)            % das fases com susto (≥ 2) e com a Ellen pega (3)
//   __heat / __drawHeat / __drawPath     mapa de calor dos cones e o caminho, por cima do print
// Partida de teste: __drive(segundos) joga sozinho de onde estiver até a tela final (ver no fim do
// arquivo). Do título: Flow.newGame() e depois __drive(110) algumas vezes. A partida inteira, jogando
// perfeito e sem ser pega, leva ~250 s de jogo.
// Som (não precisa ouvir): await Sound.render('battle', 10) ou Sound.render('alert1', 2) toca offline
// e devolve o pico e o RMS da saída. Hoje: músicas com pico ~0,35 e RMS ~0,085 (a valsa da fase 3,
// 0,057); alertas com pico ~0,2 a 0,25, o tiro final ~0,9 (sozinho, no silêncio).
// Fase 1, depois do balanceamento: andando reto sem olhar, ela é pega em 11% a 21% das fases do
// loop de cada cenário; esperando a janela, passa sempre (6 a 9,5 s jogando perfeito).
// V2: coordenadas novas (as da V1 × 1,25; cenário de 480 × 240). As medidas daqui seguem: células de
// 5 px (a grade continua 96 × 48 por cenário), a velocidade e a suspeita vêm do config, e os pés e a
// caixa de colisão da Ellen são os do stealth (__geo).
//   __balance()                __naive e __stats de todos os cenários (andando reto pela altura da porta)

window.__geo = {
  K: Room.K, SW: Room.SW, SH: Room.SH, C: 5,
  SAMPLES: [[0, -2.5], [-5, -2.5], [5, -2.5]],                    // pontos dos pés (stealth.js)
  box: (x, y) => ({ x: x - 6.25, y: y - 7.5, w: 12.5, h: 7.5 }),   // caixa de colisão (stealth.js)
  speed: run => run ? GAME_CONFIG.difficulty.runSpeed : GAME_CONFIG.difficulty.walkSpeed,
  lit: (lights, ox, x, y) => !lights || lights.some(([lx, ly, r]) => Math.hypot(x - (ox + lx), (y - 3.75 - ly) * 1.5) < r * 0.85),
  // suspeita como no stealth.js
  sus: (v, seen, dt) => seen ? Math.min(3, v + GAME_CONFIG.difficulty.suspicionUpPerSec * dt) : Math.max(0, v - GAME_CONFIG.difficulty.suspicionDownPerSec * dt)
};

window.__snap = (sx = 0, sy = 0, sw = Display.W, sh = Display.H, sc = 0) => {
  // sc = 0: a maior escala inteira que cabe na largura da janela
  // (o print do painel mostra no máximo ~800×600 da janela)
  if (!sc) sc = Math.max(1, Math.floor(Math.min(Math.min(innerWidth, 790) * devicePixelRatio / sw, Math.min(innerHeight, 590) * devicePixelRatio / sh)));
  let o = document.getElementById('__snap');
  if (!o) { o = document.createElement('canvas'); o.id = '__snap'; document.body.appendChild(o); }
  o.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;image-rendering:pixelated;background:#000;width:100vw;height:100vh';
  o.width = Math.round(innerWidth * devicePixelRatio); o.height = Math.round(innerHeight * devicePixelRatio);
  const c = o.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#000'; c.fillRect(0, 0, o.width, o.height);
  c.drawImage(Display.canvas, sx, sy, sw, sh, 0, 0, sw * sc, sh * sc);
  return 'ok';
};
window.__hide = () => { const o = document.getElementById('__snap'); if (o) o.style.display = 'none'; };
window.__reload = async () => {
  await Promise.all([...document.querySelectorAll('script[src]')].map(s => fetch(s.src, { cache: 'reload' })));
  location.reload();
};

// congela o loop do navegador (o __run continua avançando o jogo na mão)
if (!Game.__orig) {
  Game.__orig = { update: Game.update.bind(Game), render: Game.render.bind(Game) };
  Game.update = dt => { if (!window.__frozen) Game.__orig.update(dt); };
  Game.render = c => { if (!window.__frozen) Game.__orig.render(c); };
}
window.__frozen = true;
window.__run = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) { Game.__orig.update(1 / 60); if (Input.endTick) Input.endTick(); } Game.__orig.render(Gfx.ctx); };
window.__open = (codes, at, room = 0, stage = 1) => {
  Game.go('stealth', { stage, kind: 'room', room, codes, at }, { instant: true });
  __run(0.2); Dialog.close(); __run(0.05);
};
window.__look = (x, y) => { const s = StealthState.inspect(); s.ellen.x = x; if (y !== undefined) s.ellen.y = y; Camera.follow(x, s.room.w); Game.__orig.render(Gfx.ctx); };
window.__at = (t) => { const s = StealthState.inspect(); s.room.movers.concat(s.room.guards).forEach(g => { g.reset(); for (let k = 0; k < t; k += 0.25) g.update(Math.min(0.25, t - k)); }); s.room.guards.forEach(g => Vision.cast(g.cone(), s.room.sight, 24)); Game.__orig.render(Gfx.ctx); };
window.__stats = (str) => { const v = str.split(' ').map(parseFloat); return { n: v.length, scare: Math.round(100 * v.filter(x => x >= 2).length / v.length), caught: Math.round(100 * v.filter(x => x >= 3).length / v.length) }; };

// ---------- planejador: caminho mais rápido sem ser vista (busca no espaço × tempo) ----------
// __plan(['F1A1','F1A2'], 0, { run: true, t0: 0 }) → { time, path }
// o.from: [x, y] do cenário (em vez do começo); o.blind: ignora os cones (só confere a passagem).
// Com terreno lento (look.slow), usa o fator mais lento do cenário: o caminho vale em qualquer ponto.
// Células de 5 px; a cada passo a Ellen anda até 2 células (10 px, em qualquer direção) ou espera.
// "Vista" = algum ponto dos pés (os mesmos SAMPLES do stealth) dentro de um cone ativo.
window.__plan = (codes, si, o = {}) => {
  const G = __geo, room = Room.build(codes), ox = si * G.SW, C = G.C, W = G.SW / C, H = G.SH / C;
  const look = room.scenes[si].data.look;
  const slowK = Math.min(1, ...(look.slow || []).map(z => z[4]));
  const speed = G.speed(o.run) * (look.water ? (look.water.speed || 0.65) : 1) * slowK, R = 2, dt = R * C / speed, T = o.T || 60;
  const lights = look.lightOnly ? ((look.tint && look.tint.lights) || []) : null;
  const lit = (x, y) => G.lit(lights, ox, x, y);
  const SAMPLES = G.SAMPLES, box = G.box;
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const px = i => ox + i * C + C / 2, py = j => j * C + C / 2;
  const walk = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const b = box(px(i), py(j));
    walk[j * W + i] = b.x >= 0 && b.x + b.w <= room.w && !room.solids.some(r => overlap(b, r)) ? 1 : 0;
  }
  const st = room.scenes[si].data.start;
  let s0 = Math.round((st.x - C / 2) / C) + Math.round((st.y - C / 2) / C) * W;
  if (o.from) s0 = Math.round((o.from[0] - C / 2) / C) + Math.round((o.from[1] - C / 2) / C) * W;
  const isTarget = i => px(i % W) >= ox + G.SW - 7.5 && walk[i];
  // avança o mundo até t0
  const all = room.movers.concat(room.guards);
  all.forEach(g => g.reset());
  for (let t = 0; t < (o.t0 || 0); t += 0.25) all.forEach(g => g.update(Math.min(0.25, (o.t0 || 0) - t)));
  const seenAt = () => {
    const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
    const cones = room.guards.map(g => { Vision.cast(g.cone(), sight, 24); return g; }).filter(g => g.coneActive()).map(g => g._cone);
    const seen = new Uint8Array(W * H), block = new Uint8Array(W * H);
    const mrect = room.movers.filter(m => m.block).map(m => m.rect())
      .concat(room.guards.filter(g => g.pose !== 'sit' && g.pose !== 'lie' && !g.def.ride).map(g => g.rect()));
    for (let k = 0; k < W * H; k++) {
      if (!walk[k]) continue;
      const x = px(k % W), y = py((k / W) | 0);
      if (!o.blind && lit(x, y) && cones.some(c => SAMPLES.some(([a, b]) => Vision.inside(c, x + a, y + b)))) seen[k] = 1;
      if (mrect.length) { const b = box(x, y); if (mrect.some(r => overlap(b, r))) block[k] = 1; }
    }
    return { seen, block };
  };
  let front = new Uint8Array(W * H); front[s0] = 1;
  const parents = [];
  let seenSum = 0, cells = 0;
  for (let k = 1; k <= T / dt; k++) {
    all.forEach(g => g.update(dt));
    const { seen, block } = seenAt();
    const next = new Uint8Array(W * H), par = new Int32Array(W * H).fill(-1);
    for (let c = 0; c < W * H; c++) {
      if (!front[c]) continue;
      const ci = c % W, cj = (c / W) | 0;
      for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
        if (di * di + dj * dj > R * R) continue;
        const ni = ci + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        const n = nj * W + ni;
        if (next[n] || !walk[n] || block[n] || seen[n]) continue;
        next[n] = 1; par[n] = c;
      }
    }
    parents.push(par);
    let hit = -1;
    for (let c = 0; c < W * H; c++) if (next[c] && isTarget(c)) { hit = c; break; }
    if (hit >= 0) {
      const path = [];
      for (let kk = parents.length - 1, c = hit; kk >= 0 && c >= 0; kk--) { path.push([px(c % W), py((c / W) | 0)]); c = parents[kk][c]; }
      return { time: +(k * dt).toFixed(2), path: path.reverse(), dt };
    }
    let any = 0; for (let c = 0; c < W * H; c++) if (next[c]) { any = 1; break; }
    if (!any) return { time: null, stuck: k * dt };
    front = next;
  }
  return { time: null };
};
// tempos de travessia para várias fases do loop (t0 de 0 a `period`)
window.__sweep = (codes, si, period, o = {}) => {
  const out = [];
  for (let t0 = 0; t0 < period; t0 += o.step || 1) out.push([t0, (__plan(codes, si, Object.assign({}, o, { t0 })).time)]);
  return out.map(([a, b]) => a + ':' + b).join('  ');
};
// desenha o caminho por cima do print
window.__drawPath = (path, color = '#00FF88') => { const c = Gfx.ctx; c.fillStyle = color; path.forEach(([x, y]) => c.fillRect(x - Camera.x, y + Hud.H - 1, 2, 2)); };

// mapa de calor: fração do loop em que cada célula do cenário fica dentro de algum cone
window.__heat = (codes, si, period, o = {}) => {
  const G = __geo, room = Room.build(codes), ox = si * G.SW, C = G.C, W = G.SW / C, H = G.SH / C, dt = 0.1;
  const SAMPLES = G.SAMPLES;
  const all = room.movers.concat(room.guards);
  all.forEach(g => g.reset());
  const heat = new Float32Array(W * H);
  const n = Math.round(period / dt);
  for (let k = 0; k < n; k++) {
    all.forEach(g => g.update(dt));
    const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
    const cones = room.guards.map(g => { Vision.cast(g.cone(), sight, 24); return g; }).filter(g => g.coneActive()).map(g => g._cone);
    for (let c = 0; c < W * H; c++) {
      const x = ox + (c % W) * C + C / 2, y = ((c / W) | 0) * C + C / 2;
      if (cones.some(cn => SAMPLES.some(([a, b]) => Vision.inside(cn, x + a, y + b)))) heat[c] += 1 / n;
    }
  }
  return { heat, ox, W, H, C };
};
window.__drawHeat = (h) => {
  const c = Gfx.ctx;
  for (let k = 0; k < h.W * h.H; k++) {
    if (!h.heat[k]) continue;
    c.globalAlpha = Math.min(0.85, 0.15 + h.heat[k]);
    c.fillStyle = h.heat[k] > 0.5 ? '#FF2020' : h.heat[k] > 0.25 ? '#FF9020' : '#FFE040';
    c.fillRect(h.ox + (k % h.W) * h.C - Camera.x, ((k / h.W) | 0) * h.C + Hud.H, h.C, h.C);
  }
  c.globalAlpha = 1;
};

// Jogadora ingênua: anda reto pelo corredor (o.y, ou 140: a altura da porta), do começo do cenário até
// a saída, sem esperar. Devolve a suspeita máxima de cada vigia (3 = pega) para cada fase t0 do loop.
window.__naive = (codes, si, period, o = {}) => {
  const res = [], G = __geo;
  for (let t0 = 0; t0 < period; t0 += (o.step || 0.5)) {
    const room = Room.build(codes), ox = si * G.SW;
    const all = room.movers.concat(room.guards);
    all.forEach(g => { g.reset(); g.sus = 0; });
    const look = room.scenes[si].data.look;
    const lights = look.lightOnly ? ((look.tint && look.tint.lights) || []) : null;
    for (let t = 0; t < t0; t += 0.25) all.forEach(g => g.update(Math.min(0.25, t0 - t)));
    const y0 = o.y || 140, speed = G.speed(o.run) * (look.water ? (look.water.speed || 0.65) : 1), dt = 1 / 30;
    let x = ox + room.scenes[si].data.start.x, y = y0, maxSus = 0, blocked = false;
    const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const free = (xx, yy) => { const b = G.box(xx, yy); return !room.solids.some(r => overlap(b, r)) && !room.movers.some(m => m.block && overlap(b, m.rect())); };
    const slowAt = (xx, yy) => (look.slow || []).reduce((f, [zx, zy, zw, zh, s]) => (xx - ox >= zx && xx - ox < zx + zw && yy >= zy && yy < zy + zh ? Math.min(f, s) : f), 1);
    for (let steps = 0; x < ox + G.SW - 5 && steps < 1800; steps++) {
      all.forEach(g => g.update(dt));
      const v = speed * dt * slowAt(x, y);
      // anda para a direita; se algo bloquear, contorna por baixo (ou por cima) e depois volta para a linha
      if (free(x + v, y)) { x += v; if (y !== y0 && free(x, y + Math.sign(y0 - y) * Math.min(v, Math.abs(y0 - y)))) y += Math.sign(y0 - y) * Math.min(v, Math.abs(y0 - y)); }
      else if (free(x, y + v)) { y += v; blocked = true; }
      else if (free(x, y - v)) { y -= v; blocked = true; }
      else blocked = true;
      const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
      const isLit = G.lit(lights, ox, x, y);
      room.guards.forEach(g => {
        Vision.cast(g.cone(), sight, 24);
        const seen = isLit && g.coneActive() && G.SAMPLES.some(([a, c]) => Vision.inside(g._cone, x + a, y + c));
        g.sus = G.sus(g.sus, seen, dt);
        maxSus = Math.max(maxSus, g.sus);
      });
      if (maxSus >= 3) break;
    }
    res.push(+maxSus.toFixed(1) + (blocked ? 'b' : ''));
  }
  return res.join(' ');
};

// ---------- teclas simuladas e estado ----------
window.__key = (code, type = 'down', mods = {}) => window.dispatchEvent(new KeyboardEvent('key' + type, Object.assign({ code, key: mods.key || code, bubbles: true }, mods)));
window.__tap = (code, mods = {}) => { __key(code, 'down', mods); __run(2 / 60); __key(code, 'up', mods); __run(2 / 60); };
window.__hold = (code, sec, mods = {}) => { __key(code, 'down', mods); __run(sec); __key(code, 'up', mods); __run(1 / 60); };
window.__st = () => {
  const o = { state: Game.name, dialog: Dialog.isBlocking ? Dialog.isBlocking() : null };
  if (Game.name === 'stealth') {
    const s = StealthState.inspect();
    Object.assign(o, { kind: s.params.kind, codes: s.params.codes.join(','), cur: s.cur, phase: s.phase, x: Math.round(s.ellen.x), y: Math.round(s.ellen.y), memory: Flow.memory });
  }
  o.save = JSON.stringify(Save.load());
  return o;
};
// teleporta a Ellen (e o Fabio) para (x, y) da sala
window.__tp = (x, y) => { const s = StealthState.inspect(); s.ellen.x = x; s.ellen.y = y; s.fabio.x = x - 22.5; s.fabio.y = y; Camera.follow(x, s.room.w); };
'devtools ok';

// fileira de roupas para conferir os sprites (V2: 26×48): cada roupa de frente, de lado, de costas,
// andando, sentada de lado e sentada no chão. poses: lista de { pose, dir, frame, head } (opcional)
const __LINEUP_POSES = [{ dir: 'down' }, { dir: 'right' }, { dir: 'up' }, { dir: 'right', frame: 0 }, { pose: 'sit', dir: 'right' }, { pose: 'floor', dir: 'down' }];
window.__lineup = (ids, bg = '#5A6A7A', poses = __LINEUP_POSES) => {
  const c = Gfx.ctx, W = Chars.W, H = Chars.H, bw = poses.length * (W + 1) + 6;
  const cols = Math.max(1, Math.floor((Display.W - 4) / bw));
  Gfx.rect(0, 0, Display.W, Display.H, bg);
  ids.forEach((id, i) => {
    const x = 4 + (i % cols) * bw, y = 2 + Math.floor(i / cols) * (H + 11);
    poses.forEach((o, k) => c.drawImage(Chars.sprite(id, o), x + k * (W + 1), y));
    Gfx.text(id.replace(/^(FABIO|ELLEN)_/, '$1 '), x, y + H, '#FFFFFF');
  });
  return 'ok';
};
// todas as poses de uma roupa: andando nas 4 direções (4 quadros), sentado e no chão nas 4,
// deitado, nadando, foto, olhos fechados
window.__poses = (id, bg = '#5A6A7A') => {
  const c = Gfx.ctx, W = Chars.W, H = Chars.H;
  Gfx.rect(0, 0, Display.W, Display.H, bg);
  const dirs = ['down', 'right', 'up', 'left'];
  dirs.forEach((dir, j) => [-1, 0, 1, 2, 3].forEach((f, i) => c.drawImage(Chars.sprite(id, { dir, frame: f }), 2 + i * (W + 1), 2 + j * (H + 1))));
  dirs.forEach((dir, j) => c.drawImage(Chars.sprite(id, { pose: 'sit', dir }), 140 + j * (W + 1), 2));
  dirs.forEach((dir, j) => c.drawImage(Chars.sprite(id, { pose: 'floor', dir }), 140 + j * (W + 1), 51));
  c.drawImage(Chars.sprite(id, { pose: 'sit', dir: 'right', frame: 1 }), 140, 100);
  c.drawImage(Chars.sprite(id, { pose: 'sit', dir: 'right', head: 'down' }), 167, 100);
  c.drawImage(Chars.sprite(id, { pose: 'photo' }), 194, 100);
  c.drawImage(Chars.sprite(id, { dir: 'down', eyes: 'closed' }), 221, 100);
  c.drawImage(Chars.sprite(id, { pose: 'lie', dir: 'left' }), 250, 2);
  c.drawImage(Chars.sprite(id, { pose: 'lie', dir: 'right', head: 'up', eyes: 'closed' }), 250, 30);
  c.drawImage(Chars.sprite(id, { pose: 'lie', dir: 'left', cover: '#1E2A4A', eyes: 'closed' }), 250, 58);
  c.drawImage(Chars.sprite(id, { pose: 'swim', dir: 'right', frame: 0 }), 300, 2);
  c.drawImage(Chars.sprite(id, { pose: 'swim', dir: 'left', frame: 2 }), 300, 30);
  c.drawImage(Chars.sprite(id, { pose: 'swim', dir: 'up', frame: 1 }), 350, 2);
  c.drawImage(Chars.sprite(id, { pose: 'swim', dir: 'down', frame: 3 }), 377, 2);
  Gfx.text(id, 250, 150, '#FFFFFF');
  return 'ok';
};

// Como o __naive, mas seguindo uma rota de pontos [[x, y], ...] (coordenadas do cenário), sem
// esperar: devolve a suspeita máxima para cada fase t0 do loop (3 = pega).
window.__route = (codes, si, period, pts, o = {}) => {
  const res = [];
  for (let t0 = 0; t0 < period; t0 += (o.step || 1)) {
    const G = __geo, room = Room.build(codes), ox = si * G.SW, all = room.movers.concat(room.guards);
    all.forEach(g => { g.reset(); g.sus = 0; });
    for (let t = 0; t < t0; t += 0.25) all.forEach(g => g.update(Math.min(0.25, t0 - t)));
    const speed = G.speed(o.run), dt = 1 / 30;
    let k = 0, x = ox + pts[0][0], y = pts[0][1], maxSus = 0;
    for (let steps = 0; k < pts.length - 1 && steps < 3000; steps++) {
      all.forEach(g => g.update(dt));
      const tx = ox + pts[k + 1][0], ty = pts[k + 1][1], d = Math.hypot(tx - x, ty - y), v = speed * dt;
      if (d <= v) { x = tx; y = ty; k++; } else { x += (tx - x) / d * v; y += (ty - y) / d * v; }
      const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
      room.guards.forEach(g => {
        Vision.cast(g.cone(), sight, 24);
        const seen = g.coneActive() && G.SAMPLES.some(([a, c]) => Vision.inside(g._cone, x + a, y + c));
        g.sus = G.sus(g.sus, seen, dt);
        maxSus = Math.max(maxSus, g.sus);
      });
      if (maxSus >= 3) break;
    }
    res.push(+maxSus.toFixed(1));
  }
  return res.join(' ');
};

// ---------- piloto automático (partida de teste) ----------
// __drive(segundos) joga sozinho a partir de onde estiver: avança as falas e os cartões, atravessa
// cada cenário pelo caminho do __plan (com os vigias no mesmo tempo do loop e as setas apertadas de
// verdade), passa pelo corredor, abre o baú, digita a primeira resposta aceita na máquina, ganha a
// batalha (um tiro errado, o Mounjaro e o tiro final) e anda até a escada. Para na tela final.
// Devolve o que passou (cada tela, com o tempo de jogo) e quantas vezes a Ellen foi pega em cada
// cenário. Chame em pedaços: __drive(120) e depois __drive(120) de novo continua de onde parou.
(() => {
  const held = {};
  const hold = (code, on) => { if (!!held[code] === on) return; held[code] = on; __key(code, on ? 'down' : 'up'); };
  const release = () => Object.keys(held).forEach(c => hold(c, false));
  const D = window.__driveState = { t: 0, log: [], caught: {}, plan: null, visit: '', typed: false, shots: 0, lastPos: null, still: 0, wasCaught: false };

  function steer(tx, ty, run) {
    const e = StealthState.inspect().ellen, dx = tx - e.x, dy = ty - e.y;
    hold('ArrowRight', dx > 1.9); hold('ArrowLeft', dx < -1.9);
    hold('ArrowDown', dy > 1.9); hold('ArrowUp', dy < -1.9);
    hold('ShiftLeft', !!run);
    return Math.hypot(dx, dy);
  }
  const step = s => { __run(s); D.t += s; return s; };

  // caminho em grade de 5 px até um ponto que satisfaça goal(x, y), contornando o que é sólido
  function route(room, sx, sy, goal) {
    const G = __geo, C = G.C, W = Math.ceil(room.w / C), H = G.SH / C, ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const free = (x, y) => { const b = G.box(x, y); return b.x >= 0 && b.x + b.w <= room.w && !room.solids.some(r => ov(b, r)); };
    const cx = i => i * C + C / 2, cy = j => j * C + C / 2;
    const s0 = Math.round((sx - C / 2) / C) + Math.round((sy - C / 2) / C) * W, par = new Int32Array(W * H).fill(-2);
    par[s0] = -1;
    const q = [s0];
    for (let h = 0; h < q.length; h++) {
      const c = q[h], i = c % W, j = (c / W) | 0;
      if (goal(cx(i), cy(j))) {
        const out = [];
        for (let k = c; k >= 0; k = par[k]) out.push([cx(k % W), cy((k / W) | 0)]);
        return out.reverse();
      }
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const ni = i + di, nj = j + dj, n = nj * W + ni;
        if (ni < 0 || nj < 0 || ni >= W || nj >= H || par[n] !== -2 || !free(cx(ni), cy(nj))) continue;
        par[n] = c;
        q.push(n);
      }
    }
    return null;
  }

  // anda pelo caminho até o objetivo (replaneja se ficar presa)
  function walkTo(s, key, goal, run) {
    const e = s.ellen;
    if (!D.path || D.pathKey !== key) { D.path = route(s.room, e.x, e.y, goal) || [[e.x + 30, e.y]]; D.pathKey = key; D.pi = 0; }
    while (D.pi < D.path.length - 1 && Math.hypot(D.path[D.pi][0] - e.x, D.path[D.pi][1] - e.y) < 3) D.pi++;
    const [tx, ty] = D.path[D.pi];
    steer(tx, ty, run);
    const pos = Math.round(e.x) + ',' + Math.round(e.y);
    D.still = pos === D.lastPos ? D.still + 1 / 60 : 0;
    D.lastPos = pos;
    if (D.still > 1.5) { D.path = null; D.still = 0; }
    return D.pi >= D.path.length - 1 && Math.hypot(tx - e.x, ty - e.y) < 3;
  }
  const tap = () => { release(); __tap('Space'); D.t += 4 / 60; };

  function typeAnswer(stage) {
    const ans = GAME_CONFIG.stages[stage - 1].anomaly.answers[0];
    for (const ch of ans) {
      const code = /[a-z]/i.test(ch) ? 'Key' + ch.toUpperCase() : 'Digit' + ch;
      __key(code, 'down', { key: ch }); __key(code, 'up', { key: ch }); step(1 / 60);
    }
    __key('Enter', 'down'); step(0.05); __key('Enter', 'up');
  }

  function where() {
    if (Game.name !== 'stealth') return Game.name;
    const s = StealthState.inspect();
    return 'stealth:' + s.params.kind + ':' + s.params.codes.join(',') + (s.params.kind === 'room' ? ':' + s.cur : '');
  }

  // um cenário de memória: segue o caminho planejado; sem caminho, anda reto para a direita
  function room(s) {
    const e = s.ellen, ox = s.cur * __geo.SW;
    if (!D.plan || D.plan.cur !== s.cur) {
      const g = s.room.guards[0] || s.room.movers[0];
      const p = __plan(s.params.codes, s.cur, { run: true, t0: g ? g.time : 0, from: [e.x - ox, e.y] });
      D.plan = { cur: s.cur, path: p.path || [], dt: p.dt || 1, start: D.t, ok: p.time !== null };
      D.still = 0;
    }
    const P = D.plan, j = Math.min(P.path.length - 1, Math.floor((D.t - P.start) / P.dt));
    const done = !P.ok || j >= P.path.length - 1;
    const [tx, ty] = done ? [ox + 525, P.path.length ? P.path[P.path.length - 1][1] : e.y] : P.path[j];
    steer(tx, ty, true);
    // preso (empurrando alguém que passa na frente): planeja de novo
    const pos = Math.round(e.x) + ',' + Math.round(e.y);
    D.still = pos === D.lastPos && Math.hypot(tx - e.x, ty - e.y) > 5 ? D.still + 1 / 60 : 0;
    D.lastPos = pos;
    if (D.still > 1.5) D.plan = null;
    return step(1 / 60);
  }

  function stealth() {
    const s = StealthState.inspect();
    if (s.phase === 'caught') {
      if (!D.wasCaught) { const code = s.room.scenes[s.cur].code; D.caught[code] = (D.caught[code] || 0) + 1; D.wasCaught = true; }
      release(); D.plan = null; return step(0.1);
    }
    D.wasCaught = false;
    if (s.phase === 'chest') { tap(); return step(0.25); }
    if (s.phase !== 'play') { release(); return step(0.1); }
    const k = s.params.kind;
    if (k === 'room') return room(s);
    const it = s.room.interact.find(i => !i.p.used);
    if ((k === 'chest' || (k === 'story' && s.params.onInteract)) && it) {
      // a conta do nearby() do stealth, com uma folga
      const r = it.rect, near = (x, y) => x > r.x - 7.5 && x < r.x + r.w + 7.5 && y - 3.75 > r.y - 5 && y - 3.75 < r.y + r.h + 12.5;
      if (walkTo(s, 'it' + r.x + ',' + r.y, near, false)) tap();
      return step(1 / 60);
    }
    const ex = s.room.exit;
    if (ex && s.params.player) {
      const into = (x, y) => x + 6.25 > ex.x + 2.5 && x - 6.25 < ex.x + ex.w - 2.5 && y > ex.y + 2.5 && y - 7.5 < ex.y + ex.h - 2.5;
      if (walkTo(s, 'ex' + ex.x + ',' + ex.y, into, false)) steer(ex.x + ex.w + 25, ex.y + ex.h / 2, false);
      return step(1 / 60);
    }
    release();
    return step(0.1);
  }

  function battle() {
    const b = BattleState.inspect();
    if (b.phase === 'retry') { tap(); return step(0.2); }
    if (b.phase !== 'menu') return step(0.1);
    const pick = id => { const want = b.options.indexOf(id); for (let i = 0; i < want; i++) { __tap('ArrowDown'); D.t += 4 / 60; } tap(); };
    if (b.sub) pick('mounjaro');
    else if (D.shots === 0 || !b.tempted) { D.shots++; pick('shoot'); }
    else pick('item');
    return step(0.2);
  }

  window.__drive = (sec = 60) => {
    const end = D.t + sec, from = D.log.length;
    while (D.t < end) {
      const w = where();
      if (w !== D.visit) { D.visit = w; D.plan = null; D.path = null; D.typed = false; D.log.push(D.t.toFixed(1) + ' ' + w); }
      if (Game.name === 'ending') { release(); break; }
      if (Dialog.isBlocking()) { tap(); step(0.15); continue; }
      if (Game.name === 'stealth') stealth();
      else if (Game.name === 'battle') battle();
      else if (Game.name === 'anomaly') {
        if (!D.typed) { step(5); typeAnswer((Save.load() || {}).stage || 1); D.typed = true; }
        step(0.5);
      } else { tap(); step(0.3); }   // título, cartões
    }
    release();
    return { t: +D.t.toFixed(1), log: D.log.slice(from), caught: D.caught };
  };
})();

// Balanceamento de todos os cenários: o __naive (andando reto pela altura da porta da esquerda, de
// 0,25 em 0,25 s do loop) e o __stats de cada um. período = o loop mais comprido dos vigias do cenário
// (de 4 a 30 s). Devolve { F1A1: { period, y, n, scare, caught }, ... }.
window.__balance = (o = {}) => {
  const out = {};
  GAME_CONFIG.stages.forEach(st => {
    Flow.rooms(st.id).forEach(codes => {
      codes.forEach((code, si) => {
        const room = Room.build(codes), s = room.scenes[si];
        const sum = l => (l || []).reduce((a, x) => a + (x.t || 0), 0);
        const period = Math.min(30, Math.max(4, ...room.guards.filter(g => g.scene === si).map(g => sum(g.def.loop))));
        const door = (s.data.look.doors || {}).left;
        const y = door ? (door[0] + door[1]) / 2 + (o.dy || 0) : undefined;
        const str = __naive(codes, si, period, { y, step: 0.25 });
        out[code] = Object.assign({ period: +period.toFixed(1), y }, __stats(str.replace(/b/g, '')));
      });
    });
  });
  return out;
};
