// Sala: um ou mais cenários lado a lado, ligados por passagens (SPEC, seção 5).
// Room.build(['F1A1', 'F1A2']) lê data/scenes/*.js e devolve tudo o que o stealth precisa:
// o fundo pintado, as caixas de colisão (solids), as que bloqueiam a visão (sight), os objetos
// ordenados pela base, os efeitos animados (fx), os NPCs parados, os que andam (movers), os
// vigias, os objetos interativos (o baú) e a saída. Coordenadas da sala: x de 0 até 384 ×
// cenários, y de 0 a 192 (a área de jogo, abaixo do HUD).
//
// Além do que está em scenery.js, o `look` de um cenário pode ter:
//   bounds: [x0, x1]   paredes laterais em x0 e x1 (o resto fica escuro e fechado; corredor e baú)
//   edgeWidth: { left: 12 }   parede lateral mais grossa que os 4 px de sempre
//   bottom: y          o chão termina em y (abaixo disso é parede)
//   tint: { color, lights: [[x, y, raio, cor], ...] }   luz do ambiente (noite, planetário):
//                      tudo é multiplicado pela cor, e as luzes clareiam em volta
//   shadow: 'long'     sombras esticadas para baixo e para a direita (parque à tarde)
const Room = (() => {
  const SW = 384, SH = 192, WALL = 4;

  // configuração de um cenário em GAME_CONFIG.stages (legenda, data, fala de entrada)
  function sceneConfig(code) {
    for (const st of GAME_CONFIG.stages) {
      for (const s of st.scenes) if (s.code === code) return Object.assign({ stage: st.id }, s);
    }
    return { code, title: '', date: '' };
  }

  // área que um personagem ocupa no chão, conforme a pose (null = não ocupa: deitado na cama)
  function footprint(x, y, pose, dir) {
    if (pose === 'lie') return null;
    if (pose !== 'sit') return { x: x - 5, y: y - 6, w: 10, h: 6 };
    if (dir === 'up') return { x: x - 6, y: y - 9, w: 12, h: 11 };
    if (dir === 'down') return { x: x - 6, y: y - 8, w: 12, h: 8 };
    return { x: x - 7, y: y - 10, w: 14, h: 10 };
  }

  function build(codes) {
    const scenes = codes.map((code, i) => {
      const data = window.SCENES && SCENES[code];
      if (!data) throw new Error('Cenário sem arquivo em data/scenes: ' + code);
      return { code, i, ox: i * SW, data, cfg: sceneConfig(code) };
    });
    const w = scenes.length * SW;
    const bg = Gfx.canvas(w, SH);
    const room = {
      scenes, w, h: SH, bg, solids: [], sight: [], sorted: [], fx: [], npcs: [], movers: [], guards: [],
      steam: [], interact: [], exit: null
    };
    const solid = (r, blocksSight) => {
      room.solids.push(r);
      if (blocksSight) room.sight.push(r);
    };

    scenes.forEach((s, idx) => {
      const { data, ox } = s, look = data.look, wallH = look.wall.height;
      const [bx0, bx1] = look.bounds || [0, SW];
      Scenery.paintBase(bg.cx, ox, look);

      // parede do fundo e paredes laterais, com as passagens (edgeWidth: parede mais grossa, ex.: a
      // fachada do restaurante no parque)
      solid({ x: ox, y: 0, w: SW, h: wallH }, true);
      const doors = look.doors || {}, ew = look.edgeWidth || {};
      [['left', ox + bx0], ['right', ox + bx1]].forEach(([side, edge]) => {
        const gap = doors[side], ww = ew[side] || WALL, x = side === 'left' ? edge : edge - ww;
        if (!gap) { solid({ x, y: wallH, w: ww, h: SH - wallH }, true); return; }
        solid({ x, y: wallH, w: ww, h: gap[0] - wallH }, true);
        solid({ x, y: gap[1], w: ww, h: SH - gap[1] }, true);
        // a entrada da sala fica fechada (a Ellen não volta para o corredor); a saída é a última passagem
        if (side === 'left' && idx === 0) solid({ x: x, y: gap[0], w: 2, h: gap[1] - gap[0] }, false);
        if (side === 'right' && idx === scenes.length - 1) room.exit = { x: edge - WALL, y: gap[0], w: WALL, h: gap[1] - gap[0] };
      });
      // fora dos limites (corredor, salinha do baú): fechado
      if (bx0 > 0) solid({ x: ox, y: 0, w: bx0, h: SH }, true);
      if (bx1 < SW) solid({ x: ox + bx1, y: 0, w: SW - bx1, h: SH }, true);
      solid({ x: ox, y: look.bottom || SH - 2, w: SW, h: SH - (look.bottom || SH - 2) }, false);

      // objetos
      (data.props || []).forEach(p0 => {
        const p = Object.assign({}, p0, { x: ox + p0.x });
        if (p.textKey) p.text = s.cfg[p.textKey] || '';
        const g = Scenery.geometry(p), img = Scenery.render(p);
        if (g.solid) solid(g.solid, false);
        if (g.sight) room.sight.push(g.sight);
        if (g.def.layer === 'back') bg.cx.drawImage(img, p.x, p.y);
        else if (!g.def.hidden) room.sorted.push({ z: g.z, img, x: p.x, y: p.y, w: g.w, p });
        if (g.def.fx) room.fx.push({ def: g.def, p, layer: g.def.fxLayer || 'top' });
        if (p.interact) room.interact.push({ kind: p.interact, p, rect: { x: p.x, y: p.y, w: g.w, h: g.h }, base: g.solid });
        if (p.food && p.steam !== false) room.steam.push({ x: p.x + 32, y: p.y + 6, seed: room.steam.length * 1.7 });
      });

      // NPCs parados: inofensivos, mas ocupam lugar e bloqueiam a visão
      (data.npcs || []).forEach(n => {
        const npc = Object.assign({ pose: 'sit', dir: 'down' }, n, { x: ox + n.x });
        const f = footprint(npc.x, npc.y, npc.pose, npc.dir);
        if (f && n.solid !== false) solid(f, n.sight !== false);
        room.npcs.push(npc);
      });

      // NPCs que andam (garçom, pessoas passando): linha do tempo como a dos vigias, sem cone.
      // Bloqueiam a passagem e a visão, mas não veem ninguém.
      (data.movers || []).forEach(md => {
        const m = Guard.create(Object.assign({ cone: false }, md, { loop: (md.loop || []).map(st => Object.assign({ cone: false }, st)) }), ox);
        m.scene = idx;
        m.harmless = true;
        room.movers.push(m);
      });

      // vigias: ocupam lugar, mas não bloqueiam a visão um do outro
      (data.guards || []).forEach(gd => {
        const g = Guard.create(gd, ox);
        g.scene = idx;
        room.guards.push(g);
        if (gd.pose === 'sit') solid(footprint(g.x, g.y, 'sit', gd.face), false);
      });
    });
    return room;
  }

  // sprite de um NPC parado (com a pequena animação de comer, se tiver)
  function npcSprite(n, t) {
    if (n.pose === 'lie') return Chars.sprite(n.who, { pose: 'lie', dir: n.dir === 'right' ? 'right' : 'left', head: n.head, eyes: n.eyes });
    if (n.pose === 'floor') return Chars.sprite(n.who, { pose: 'floor', dir: 'down', head: n.head, eyes: n.eyes });
    if (n.pose !== 'sit') return Chars.sprite(n.who, { dir: n.dir, head: n.head });
    const frame = n.anim === 'eat' && Math.floor((t + (n.x % 7) * 0.31) / 0.6) % 3 === 0 ? 1 : 0;
    return Chars.sprite(n.who, { pose: n.pose, dir: n.dir, head: n.head, frame });
  }

  return { build, sceneConfig, footprint, npcSprite, SW, SH };
})();
