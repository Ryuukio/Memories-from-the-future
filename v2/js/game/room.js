// Sala: um ou mais cenários lado a lado, ligados por passagens (SPEC, seção 5).
// Room.build(['F1A1', 'F1A2']) lê data/scenes/*.js e devolve tudo o que o stealth precisa:
// o fundo pintado, as caixas de colisão (solids), as que bloqueiam a visão (sight), os objetos
// ordenados pela base, os efeitos animados (fx), os NPCs parados, os que andam (movers), os
// vigias, os objetos interativos (o baú) e a saída. Coordenadas da sala: x de 0 até 480 ×
// cenários, y de 0 a 240 (a área de jogo, abaixo do HUD).
//
// V2: os arquivos de data/scenes/ continuam nas coordenadas da V1 (cenário de 384 × 192). A sala é
// montada como na V1, em coordenadas velhas, e tudo o que o jogo usa (colisão, visão, saída, vigias e
// os loops deles, o começo, as zonas do look) é ampliado 1,25× (Legacy.K) e arredondado. Assim o
// balanceamento da V1 se mantém. O desenho que ainda é da V1 (o fundo, os objetos, os NPCs parados,
// os efeitos) fica em coordenadas velhas e é ampliado na tela (legacy.js):
//   room.bg                 o fundo pintado, já ampliado (480 × 240 por cenário)
//   room.sorted, fx, steam, npcs   em coordenadas velhas (só desenho; z é a base velha). Nos objetos
//                           parados, big/bx/by = a imagem já ampliada e a posição nova
//   (os personagens e o que tem liveNew já são desenhados no tamanho novo; ver stealth.js)
//   room.scenes[i].data     o cenário com as coordenadas novas (look, start, photoZone, stairs,
//                           guards, movers; props e npcs ficam como no arquivo)
//   room.scenes[i].src      o arquivo do cenário como está (coordenadas velhas, para os pintores)
//   room.scenes[i].ox / ox0 começo do cenário na sala, em coordenadas novas / velhas
//
// Além do que está em scenery.js, o `look` de um cenário pode ter:
//   bounds: [x0, x1]   paredes laterais em x0 e x1 (o resto fica escuro e fechado; corredor e baú)
//   edgeWidth: { left: 12 }   parede lateral mais grossa que os 4 px de sempre
//   bottom: y          o chão termina em y (abaixo disso é parede)
//   tint: { color, lights: [[x, y, raio, cor], ...] }   luz do ambiente (noite, planetário):
//                      tudo é multiplicado pela cor, e as luzes clareiam em volta
//   shadow: 'long'     sombras esticadas para baixo e para a direita (parque à tarde)
const Room = (() => {
  const K = Legacy.K;
  const SW0 = 384, SH0 = 192, WALL = 4;   // um cenário na V1 (coordenadas velhas)
  const SW = SW0 * K, SH = SH0 * K;       // e na V2: 480 × 240

  // ---------- da V1 para a V2: × 1,25, arredondado ----------
  const k = n => Math.round(n * K);
  // retângulo pelas bordas: o que encostava continua encostando
  const kRect = r => {
    const x = k(r.x), y = k(r.y);
    return { x, y, w: k(r.x + r.w) - x, h: k(r.y + r.h) - y };
  };
  const kBox = ([x, y, w, h, ...rest]) => [k(x), k(y), k(x + w) - k(x), k(y + h) - k(y), ...rest];
  const kPair = p => p.map(k);

  // vigia ou quem anda: posição, alcance, tamanho no chão, lugar no barco, olhos e os passos do loop
  // (heartAt é só desenho e fica velho)
  function scaleActor(d) {
    const o = Object.assign({}, d);
    ['x', 'y', 'range'].forEach(key => { if (typeof d[key] === 'number') o[key] = k(d[key]); });
    ['size', 'at', 'eye'].forEach(key => { if (d[key]) o[key] = kPair(d[key]); });
    if (d.loop) {
      o.loop = d.loop.map(st => {
        const s = Object.assign({}, st);
        if (st.to) s.to = kPair(st.to);
        if (st.jump) s.jump = kPair(st.jump);
        if (typeof st.range === 'number') s.range = k(st.range);
        return s;
      });
    }
    return o;
  }

  const scaled = {};
  function scaleScene(code) {
    if (scaled[code]) return scaled[code];
    const src = SCENES[code], L = src.look, look = Object.assign({}, L);
    look.wall = Object.assign({}, L.wall, { height: k(L.wall.height) });
    if (L.doors) {
      look.doors = {};
      Object.keys(L.doors).forEach(side => { if (L.doors[side]) look.doors[side] = kPair(L.doors[side]); });
    }
    if (L.edgeWidth) {
      look.edgeWidth = {};
      Object.keys(L.edgeWidth).forEach(side => { look.edgeWidth[side] = k(L.edgeWidth[side]); });
    }
    ['bounds', 'path', 'sea', 'pond', 'slope'].forEach(key => { if (L[key]) look[key] = kPair(L[key]); });
    ['bottom', 'split'].forEach(key => { if (typeof L[key] === 'number') look[key] = k(L[key]); });
    if (L.tint) look.tint = Object.assign({}, L.tint, { lights: (L.tint.lights || []).map(([x, y, r, c]) => [k(x), k(y), k(r), c]) });
    if (L.slow) look.slow = L.slow.map(kBox);
    if (L.water) look.water = Object.assign({}, L.water, L.water.drift ? { drift: L.water.drift * K } : {});
    const data = Object.assign({}, src, {
      look,
      start: Object.assign({}, src.start, { x: k(src.start.x), y: k(src.start.y) }),
      guards: (src.guards || []).map(scaleActor),
      movers: (src.movers || []).map(scaleActor)
    });
    if (src.photoZone) data.photoZone = kBox(src.photoZone);
    if (src.stairs) data.stairs = { zone: kBox(src.stairs.zone), marker: kPair(src.stairs.marker) };
    return (scaled[code] = data);
  }

  // configuração de um cenário em GAME_CONFIG.stages (legenda, data, fala de entrada)
  function sceneConfig(code) {
    for (const st of GAME_CONFIG.stages) {
      for (const s of st.scenes) if (s.code === code) return Object.assign({ stage: st.id }, s);
    }
    return { code, title: '', date: '' };
  }

  // área que um personagem ocupa no chão, conforme a pose (null = não ocupa: deitado na cama).
  // Em coordenadas velhas (vai para a sala pelo solid, que amplia)
  function footprint(x, y, pose, dir) {
    if (pose === 'lie') return null;
    if (pose !== 'sit') return { x: x - 5, y: y - 6, w: 10, h: 6 };
    if (dir === 'up') return { x: x - 6, y: y - 9, w: 12, h: 11 };
    if (dir === 'down') return { x: x - 6, y: y - 8, w: 12, h: 8 };
    return { x: x - 7, y: y - 10, w: 14, h: 10 };
  }

  // a montagem desenha a arte velha (fundo e objetos, com os letreiros na fonte da V1)
  function build(codes) {
    const prevFont = Gfx.font('v1');
    try {
      return assemble(codes);
    } finally {
      Gfx.font(prevFont);
    }
  }

  function assemble(codes) {
    const scenes = codes.map((code, i) => {
      const src = window.SCENES && SCENES[code];
      if (!src) throw new Error('Cenário sem arquivo em data/scenes: ' + code);
      return { code, i, ox: i * SW, ox0: i * SW0, data: scaleScene(code), src, cfg: sceneConfig(code) };
    });
    const bg0 = Gfx.canvas(scenes.length * SW0, SH0);
    const room = {
      scenes, w: scenes.length * SW, h: SH, bg: null, solids: [], sight: [], sorted: [], fx: [], npcs: [], movers: [], guards: [],
      steam: [], interact: [], exit: null
    };
    // daqui até o fim do forEach, tudo em coordenadas velhas, como na V1; o que é do jogo é
    // ampliado ao entrar na sala
    const solid = (r, blocksSight) => {
      room.solids.push(kRect(r));
      if (blocksSight) room.sight.push(kRect(r));
    };

    scenes.forEach((s, idx) => {
      const { src, ox0: ox } = s, look = src.look, wallH = look.wall.height;
      const [bx0, bx1] = look.bounds || [0, SW0];
      Scenery.paintBase(bg0.cx, ox, look);

      // parede do fundo e paredes laterais, com as passagens (edgeWidth: parede mais grossa, ex.: a
      // fachada do restaurante no parque)
      solid({ x: ox, y: 0, w: SW0, h: wallH }, true);
      const doors = look.doors || {}, ew = look.edgeWidth || {};
      [['left', ox + bx0], ['right', ox + bx1]].forEach(([side, edge]) => {
        const gap = doors[side], ww = ew[side] || WALL, x = side === 'left' ? edge : edge - ww;
        if (!gap) { solid({ x, y: wallH, w: ww, h: SH0 - wallH }, true); return; }
        solid({ x, y: wallH, w: ww, h: gap[0] - wallH }, true);
        solid({ x, y: gap[1], w: ww, h: SH0 - gap[1] }, true);
        // a entrada da sala fica fechada (a Ellen não volta para o corredor); a saída é a última passagem
        if (side === 'left' && idx === 0) solid({ x: x, y: gap[0], w: 2, h: gap[1] - gap[0] }, false);
        if (side === 'right' && idx === scenes.length - 1) room.exit = kRect({ x: edge - WALL, y: gap[0], w: WALL, h: gap[1] - gap[0] });
      });
      // fora dos limites (corredor, salinha do baú): fechado
      if (bx0 > 0) solid({ x: ox, y: 0, w: bx0, h: SH0 }, true);
      if (bx1 < SW0) solid({ x: ox + bx1, y: 0, w: SW0 - bx1, h: SH0 }, true);
      solid({ x: ox, y: look.bottom || SH0 - 2, w: SW0, h: SH0 - (look.bottom || SH0 - 2) }, false);

      // objetos
      (src.props || []).forEach(p0 => {
        const p = Object.assign({}, p0, { x: ox + p0.x });
        if (p.textKey) p.text = s.cfg[p.textKey] || '';
        // texto em outro lugar do config (ex.: 'texts.prologue.neonSign')
        if (p.textPath) p.text = p.textPath.split('.').reduce((o, k) => (o ? o[k] : ''), GAME_CONFIG) || '';
        const g = Scenery.geometry(p), img = Scenery.render(p);
        if (g.solid) solid(g.solid, false);
        if (g.sight) room.sight.push(kRect(g.sight));
        if (g.def.layer === 'back') bg0.cx.drawImage(img, p.x, p.y);
        else if (!g.def.hidden) {
          const o = { z: g.z, img, x: p.x, y: p.y, w: g.w, p };
          // o que não anima vai para a tela já ampliado (big), no meio dos personagens novos
          if (!g.def.live && !g.def.liveNew) { const u = Legacy.upAt(img, p.x, p.y); o.big = u.img; o.bx = u.x; o.by = u.y; }
          room.sorted.push(o);
        }
        if (g.def.fx) room.fx.push({ def: g.def, p, layer: g.def.fxLayer || 'top' });
        if (p.interact) room.interact.push({ kind: p.interact, p, rect: kRect({ x: p.x, y: p.y, w: g.w, h: g.h }), base: g.solid && kRect(g.solid) });
        if (p.food && p.steam !== false) room.steam.push({ x: p.x + 32, y: p.y + 6, seed: room.steam.length * 1.7 });
      });

      // NPCs parados: inofensivos, mas ocupam lugar e bloqueiam a visão
      (src.npcs || []).forEach(n => {
        const npc = Object.assign({ pose: 'sit', dir: 'down' }, n, { x: ox + n.x });
        const f = footprint(npc.x, npc.y, npc.pose, npc.dir);
        if (f && n.solid !== false) solid(f, n.sight !== false);
        room.npcs.push(npc);
      });

      // NPCs que andam (garçom, pessoas, cervos, cardumes, o barco): linha do tempo como a dos
      // vigias, sem cone. Não veem ninguém. block: false = não bloqueia a passagem; sight: false =
      // não tapa a visão (os cardumes tapam a visão e não a passagem). prop: 'tipo' = desenhado
      // pelo objeto do Scenery; size: [w, h] = tamanho no chão.
      // Os vigias e quem anda já são criados em coordenadas novas (s.data); def0 = a definição
      // velha, para o desenho.
      s.data.movers.forEach((md, j) => {
        const m = Guard.create(Object.assign({ cone: false }, md, { loop: (md.loop || []).map(st => Object.assign({ cone: false }, st)) }), s.ox, find);
        m.def0 = src.movers[j];
        m.scene = idx;
        m.harmless = true;
        m.block = md.block !== false;
        m.blocksSight = md.sight !== false;
        room.movers.push(m);
      });

      // vigias: ocupam lugar, mas não bloqueiam a visão um do outro
      s.data.guards.forEach((gd, j) => {
        const g = Guard.create(gd, s.ox, find), g0 = src.guards[j];
        g.def0 = g0;
        g.scene = idx;
        room.guards.push(g);
        if (gd.pose === 'sit' && !gd.ride) solid(footprint(ox + g0.x, g0.y, 'sit', gd.face), false);
      });
    });
    room.bg = Legacy.up(bg0);
    // quem vai junto com outro (ride) anda depois dele
    room.movers.sort((a, b) => (a.def.ride ? 1 : 0) - (b.def.ride ? 1 : 0));
    room.movers.concat(room.guards).forEach(g => g.reset());
    return room;

    function find(id) {
      return room.movers.find(m => m.id === id) || room.guards.find(g => g.id === id);
    }
  }

  // sprite de um NPC parado (com a pequena animação de comer, se tiver)
  function npcSprite(n, t) {
    if (n.pose === 'lie') return Chars.sprite(n.who, { pose: 'lie', dir: n.dir === 'right' ? 'right' : 'left', head: n.head, eyes: n.eyes, cover: n.cover });
    if (n.pose === 'floor') return Chars.sprite(n.who, { pose: 'floor', dir: n.dir, head: n.head, eyes: n.eyes });
    if (n.pose === 'swim') return Chars.sprite(n.who, { pose: 'swim', dir: n.dir, frame: Math.floor(t * 4 + n.x) % 4 });
    if (n.pose === 'photo') return Chars.sprite(n.who, { pose: 'photo', eyes: n.eyes });
    if (n.pose !== 'sit') return Chars.sprite(n.who, { dir: n.dir, head: n.head });
    const frame = n.anim === 'eat' && Math.floor((t + (n.x % 7) * 0.31) / 0.6) % 3 === 0 ? 1 : 0;
    return Chars.sprite(n.who, { pose: n.pose, dir: n.dir, head: n.head, frame });
  }

  return { build, sceneConfig, footprint, npcSprite, scaled: scaleScene, SW, SH, SW0, SH0, K };
})();
