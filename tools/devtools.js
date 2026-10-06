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
// Fase 1, depois do balanceamento: andando reto sem olhar, ela é pega em 11% a 21% das fases do
// loop de cada cenário; esperando a janela, passa sempre (6 a 9,5 s jogando perfeito).

window.__snap = (sx = 0, sy = 0, sw = 384, sh = 216, sc = 3) => {
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
// Células de 4 px; a cada passo a Ellen anda até 2 células (8 px, em qualquer direção) ou espera.
// "Vista" = algum ponto dos pés (os mesmos SAMPLES do stealth) dentro de um cone ativo.
window.__plan = (codes, si, o = {}) => {
  const room = Room.build(codes), ox = si * 384, C = 4, W = 96, H = 48;
  const look = room.scenes[si].data.look;
  const speed = (o.run ? 110 : 60) * (look.water ? (look.water.speed || 0.65) : 1), R = 2, dt = R * C / speed, T = o.T || 60;
  const lights = look.lightOnly ? ((look.tint && look.tint.lights) || []) : null;
  const lit = (x, y) => !lights || lights.some(([lx, ly, r]) => Math.hypot(x - (ox + lx), (y - 3 - ly) * 1.5) < r * 0.85);
  const SAMPLES = [[0, -2], [-4, -2], [4, -2]];
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const box = (x, y) => ({ x: x - 5, y: y - 6, w: 10, h: 6 });
  const px = i => ox + i * C + 2, py = j => j * C + 2;
  const walk = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const b = box(px(i), py(j));
    walk[j * W + i] = b.x >= 0 && b.x + b.w <= room.w && !room.solids.some(r => overlap(b, r)) ? 1 : 0;
  }
  const st = room.scenes[si].data.start;
  let s0 = Math.round((st.x - 2) / C) + Math.round((st.y - 2) / C) * W;
  if (o.from) s0 = Math.round((o.from[0] - 2) / C) + Math.round((o.from[1] - 2) / C) * W;
  const isTarget = i => px(i % W) >= ox + 378 && walk[i];
  // avança o mundo até t0
  const all = room.movers.concat(room.guards);
  all.forEach(g => g.reset());
  for (let t = 0; t < (o.t0 || 0); t += 0.25) all.forEach(g => g.update(Math.min(0.25, (o.t0 || 0) - t)));
  const seenAt = () => {
    const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
    const cones = room.guards.map(g => { Vision.cast(g.cone(), sight, 24); return g; }).filter(g => g.coneActive()).map(g => g._cone);
    const seen = new Uint8Array(W * H), block = new Uint8Array(W * H);
    const mrect = room.movers.filter(m => m.block).map(m => m.rect());
    for (let k = 0; k < W * H; k++) {
      if (!walk[k]) continue;
      const x = px(k % W), y = py((k / W) | 0);
      if (lit(x, y) && cones.some(c => SAMPLES.some(([a, b]) => Vision.inside(c, x + a, y + b)))) seen[k] = 1;
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
      return { time: +(k * dt).toFixed(2), path: path.reverse() };
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
window.__drawPath = (path, color = '#00FF88') => { const c = Gfx.ctx; c.fillStyle = color; path.forEach(([x, y]) => c.fillRect(x - Camera.x, y + 24 - 1, 2, 2)); };

// mapa de calor: fração do loop em que cada célula do cenário fica dentro de algum cone
window.__heat = (codes, si, period, o = {}) => {
  const room = Room.build(codes), ox = si * 384, C = 4, W = 96, H = 48, dt = 0.1;
  const SAMPLES = [[0, -2], [-4, -2], [4, -2]];
  const all = room.movers.concat(room.guards);
  all.forEach(g => g.reset());
  const heat = new Float32Array(W * H);
  const n = Math.round(period / dt);
  for (let k = 0; k < n; k++) {
    all.forEach(g => g.update(dt));
    const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
    const cones = room.guards.map(g => { Vision.cast(g.cone(), sight, 24); return g; }).filter(g => g.coneActive()).map(g => g._cone);
    for (let c = 0; c < W * H; c++) {
      const x = ox + (c % W) * C + 2, y = ((c / W) | 0) * C + 2;
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
    c.fillRect(h.ox + (k % h.W) * h.C - Camera.x, ((k / h.W) | 0) * h.C + 24, h.C, h.C);
  }
  c.globalAlpha = 1;
};

// Jogadora ingênua: anda reto pelo corredor (y = via, ou a altura da porta), do começo do cenário até a
// saída, sem esperar. Devolve a suspeita máxima de cada vigia (3 = pega) para cada fase t0 do loop.
window.__naive = (codes, si, period, o = {}) => {
  const res = [];
  for (let t0 = 0; t0 < period; t0 += (o.step || 0.5)) {
    const room = Room.build(codes), ox = si * 384;
    const all = room.movers.concat(room.guards);
    all.forEach(g => { g.reset(); g.sus = 0; });
    const look = room.scenes[si].data.look;
    const lights = look.lightOnly ? ((look.tint && look.tint.lights) || []) : null;
    for (let t = 0; t < t0; t += 0.25) all.forEach(g => g.update(Math.min(0.25, t0 - t)));
    const y0 = o.y || 112, speed = (o.run ? 110 : 60) * (look.water ? (look.water.speed || 0.65) : 1), dt = 1 / 30;
    let x = ox + room.scenes[si].data.start.x, y = y0, maxSus = 0, blocked = false;
    const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const free = (xx, yy) => { const b = { x: xx - 5, y: yy - 6, w: 10, h: 6 }; return !room.solids.some(r => overlap(b, r)) && !room.movers.some(m => m.block && overlap(b, m.rect())); };
    for (let steps = 0; x < ox + 380 && steps < 1800; steps++) {
      all.forEach(g => g.update(dt));
      const v = speed * dt;
      // anda para a direita; se algo bloquear, contorna por baixo (ou por cima) e depois volta para a linha
      if (free(x + v, y)) { x += v; if (y !== y0 && free(x, y + Math.sign(y0 - y) * Math.min(v, Math.abs(y0 - y)))) y += Math.sign(y0 - y) * Math.min(v, Math.abs(y0 - y)); }
      else if (free(x, y + v)) { y += v; blocked = true; }
      else if (free(x, y - v)) { y -= v; blocked = true; }
      else blocked = true;
      const sight = room.sight.concat(room.movers.filter(m => m.blocksSight).map(m => m.rect()));
      const isLit = !lights || lights.some(([lx, ly, r]) => Math.hypot(x - (ox + lx), (y - 3 - ly) * 1.5) < r * 0.85);
      room.guards.forEach(g => {
        Vision.cast(g.cone(), sight, 24);
        const seen = isLit && g.coneActive() && [[0, -2], [-4, -2], [4, -2]].some(([a, c]) => Vision.inside(g._cone, x + a, y + c));
        g.sus = seen ? Math.min(3, g.sus + 2 * dt) : Math.max(0, g.sus - 0.5 * dt);
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
window.__tp = (x, y) => { const s = StealthState.inspect(); s.ellen.x = x; s.ellen.y = y; s.fabio.x = x - 18; s.fabio.y = y; Camera.follow(x, s.room.w); };
'devtools ok';
