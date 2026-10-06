// Sala: um ou dois cenários lado a lado, ligados por uma passagem (SPEC, seção 5).
// Room.build(['F1A1', 'F1A2']) lê data/scenes/*.js e devolve tudo o que o stealth precisa:
// o fundo pintado, as caixas de colisão (solids), as que bloqueiam a visão (sight), os objetos
// ordenados pela base, os NPCs e os vigias. Coordenadas da sala: x de 0 até 384 × cenários,
// y de 0 a 192 (a área de jogo, abaixo do HUD).
const Room = (() => {
  const SW = 384, SH = 192, WALL = 4;

  // configuração de um cenário em GAME_CONFIG.stages (legenda, data, fala de entrada)
  function sceneConfig(code) {
    for (const st of GAME_CONFIG.stages) {
      for (const s of st.scenes) if (s.code === code) return Object.assign({ stage: st.id }, s);
    }
    return { code, title: code, date: '' };
  }

  // área que um personagem ocupa no chão, conforme a pose
  function footprint(x, y, pose, dir) {
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
    const room = { scenes, w, h: SH, bg, solids: [], sight: [], sorted: [], npcs: [], guards: [], steam: [], exitY: null };
    const solid = (r, blocksSight) => {
      room.solids.push(r);
      if (blocksSight) room.sight.push(r);
    };

    scenes.forEach((s, idx) => {
      const { data, ox } = s, look = data.look, wallH = look.wall.height;
      Scenery.paintBase(bg.cx, ox, look);

      // parede do fundo e paredes laterais, com as passagens
      solid({ x: ox, y: 0, w: SW, h: wallH }, true);
      const doors = look.doors || {};
      [['left', ox], ['right', ox + SW - WALL]].forEach(([side, x]) => {
        const gap = doors[side];
        if (!gap) { solid({ x, y: wallH, w: WALL, h: SH - wallH }, true); return; }
        solid({ x, y: wallH, w: WALL, h: gap[0] - wallH }, true);
        solid({ x, y: gap[1], w: WALL, h: SH - gap[1] }, true);
        // a entrada da sala fica fechada (o corredor vem na etapa 3); a saída é a última passagem
        if (side === 'left' && idx === 0) solid({ x: ox, y: gap[0], w: 2, h: gap[1] - gap[0] }, false);
        if (side === 'right' && idx === scenes.length - 1) room.exitY = gap;
      });
      solid({ x: ox, y: SH - 2, w: SW, h: 2 }, false);

      // objetos
      (data.props || []).forEach(p0 => {
        const p = Object.assign({}, p0, { x: ox + p0.x });
        if (p.textKey) p.text = s.cfg[p.textKey] || '';
        const g = Scenery.geometry(p), img = Scenery.render(p);
        if (g.solid) solid(g.solid, false);
        if (g.sight) room.sight.push(g.sight);
        if (g.def.layer === 'back') bg.cx.drawImage(img, p.x, p.y);
        else room.sorted.push({ z: g.z, img, x: p.x, y: p.y, w: g.w });
        if (p.food && p.steam !== false) room.steam.push({ x: p.x + 32, y: p.y + 6, seed: room.steam.length * 1.7 });
      });

      // NPCs: inofensivos, mas ocupam lugar e bloqueiam a visão
      (data.npcs || []).forEach(n => {
        const npc = Object.assign({ pose: 'sit', dir: 'down' }, n, { x: ox + n.x });
        const f = footprint(npc.x, npc.y, npc.pose, npc.dir);
        solid(f, true);
        room.npcs.push(npc);
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

  // sprite de um NPC (com a pequena animação de comer, se tiver)
  function npcSprite(n, t) {
    if (n.pose !== 'sit') return Chars.sprite(n.who, { dir: n.dir, head: n.head });
    const frame = n.anim === 'eat' && Math.floor((t + (n.x % 7) * 0.31) / 0.6) % 3 === 0 ? 1 : 0;
    return Chars.sprite(n.who, { pose: n.pose, dir: n.dir, head: n.head, frame });
  }

  return { build, sceneConfig, footprint, npcSprite, SW, SH };
})();
