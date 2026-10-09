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
// balanceamento da V1 se mantém. O desenho é todo da V2, em coordenadas novas:
//   room.bg                 o fundo pintado (480 × 240 por cenário)
//   room.sorted, fx, npcs   em coordenadas velhas (p = o objeto como no arquivo; z é a base velha).
//                           Nos objetos parados, big/bx/by = a imagem e a posição nova; os que animam
//                           desenham pelo liveNew (ver stealth.js)
//   room.steam              o vapor da comida, em coordenadas novas
//   room.interact           { kind, p, rect, repeat }: objetos com `interact` (o baú, a máquina; com
//                           `repeat: true` não se gastam) e NPCs com `talk: 'chave'` (sempre repetem)
//   room.scenes[i].data     o cenário com as coordenadas novas (look, start, photoZone, stairs,
//                           guards, movers; props e npcs ficam como no arquivo)
//   room.scenes[i].src      o arquivo do cenário como está (coordenadas velhas)
//   room.scenes[i].ox / ox0 começo do cenário na sala, em coordenadas novas / velhas
//
// Além do que está em scenery.js, o `look` de um cenário pode ter:
//   bounds: [x0, x1]   paredes laterais em x0 e x1 (o resto fica escuro e fechado; corredor e baú)
//   edgeWidth: { left: 12 }   parede lateral mais grossa que os 4 px de sempre
//   bottom: y          o chão termina em y (abaixo disso é parede)
//   tint: { color, lights: [[x, y, raio, cor, clara], ...] }   luz do ambiente (noite, planetário):
//                      tudo é multiplicado pela cor, e as luzes clareiam em volta (V2: `clara` = a
//                      cor do ambiente bem perto da luz; padrão, branco quente)
//   shadow: 'long'     sombras esticadas para baixo e para a direita (parque à tarde)
//   coneLum: 0.4       V2: o cone vê o chão mais escuro (vermelho mais fundo), para o chão claro e frio
//
// Todo cenário é da V2 (o estilo da parede existe em Art.walls; ver art.js): o fundo é pintado
// direto em coordenadas novas pelos pintores do Art, os objetos com `art` vêm no tamanho novo e
// projetam a sombra no chão (look.light), os efeitos com fxNew e a luz do ambiente (look.tint)
// também são novos. O fundo pronto de cada cenário fica em cache pelo código.
//   room.scenes[i].art     true (cenário da V2; sem pintor da V2, o Room.build dá erro)
//   room.scenes[i].amb     luz do ambiente pronta ({ dark, glow }, 480 × 240), se tiver look.tint
//   room.scenes[i].post    camada de luz por cima de tudo (Art.posts: raios de sol), se tiver
//   room.scenes[i].fx      animação do cenário inteiro (Art.scenefx: poeira na luz), se tiver
//   room.lum               o brilho do chão em cada pixel do fundo (o cone muda de tom com ele)
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
    if (L.tint) look.tint = Object.assign({}, L.tint, { lights: (L.tint.lights || []).map(([x, y, r, ...rest]) => [k(x), k(y), k(r), ...rest]) });
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

  // ---------- arte da V2 ----------
  const isNew = look => !!Art.walls[look.wall.style];
  const artCache = {}, bgCache = {}, ambCache = {}, postCache = {};

  // Desenho novo de um objeto (o art dele, em cache): { spr, img, dx, dy, shadow, H, base, contact }.
  // dx, dy = deslocamento em px novos a partir de (x, y) × 1,25. p = o objeto no cenário
  // (coordenadas velhas, x relativo ao cenário).
  function propArt(def, p) {
    const key = JSON.stringify(p);
    if (!artCache[key]) {
      const a = Object.assign({ dx: 0, dy: 0, shadow: 'up' }, def.art(p));
      a.img = a.spr.canvas();
      artCache[key] = a;
    }
    return artCache[key];
  }

  // Fundo de um cenário da V2 (480 × 240): piso, parede, bordas, os objetos do fundo e as sombras
  // dos objetos parados (casters: [{ a, x, y, base }], em px novos do cenário)
  function paintNew(s, backs, casters) {
    if (bgCache[s.code]) return bgCache[s.code];
    const look = s.data.look, S = Art.surface(SW, SH), wallH = look.wall.height;
    const floor = Art.floors[look.floor];
    if (!floor) throw new Error('Piso sem pintor da V2: ' + look.floor);
    floor(S, look);
    Art.walls[look.wall.style](S, look);
    const doors = look.doors || {}, [b0, b1] = look.bounds || [0, SW], w5 = k(WALL);
    ['left', 'right'].forEach(side => {
      const style = (look.edges && look.edges[side]) || look.edge || 'wood';
      const edge = Art.edges[style];
      if (!edge) throw new Error('Borda sem pintor da V2: ' + style);
      S.clip();
      edge(S, side === 'left' ? b0 : b1 - w5, wallH, doors[side] || null, side, look);
    });
    S.clip();
    backs.forEach(b => S.blit(b.a.spr, b.x, b.y));
    if (look.light) {
      const mask = Art.shadowMask(SW, SH), kk = look.light.k || [0.2, 0.1];
      casters.forEach(c => {
        if (c.a.shadow) Art.cast(mask, c.a.spr, c.x, c.y, c.base, kk, c.a.shadow, c.a.H || 0);
        if (c.a.contact) { const [cx, cy, rx, ry] = c.a.contact; Art.contact(mask, c.x + cx, c.y + cy, rx, ry); }
      });
      Art.applyShadows(S, mask, look.light, wallH);
    }
    return (bgCache[s.code] = S.canvas());
  }

  // Pinta antes os fundos da V2 (a primeira montagem leva uns 0,2 s por sala; depois fica em cache):
  // uma sala por vez, só enquanto o estado `while` (o cartão da fase) estiver na tela
  function warm(list, whileState) {
    const queue = list.filter(codes => codes.some(c => SCENES[c] && isNew(SCENES[c].look)));
    let started = false, tries = 0;
    const next = () => {
      if (!queue.length) return;
      // o cartão entra com a transição: espera ele aparecer (até ~2 s); depois que sair, para
      if (Game.name !== whileState) { if (!started && tries++ < 20) setTimeout(next, 100); return; }
      started = true;
      try { build(queue.shift()); } catch (e) { console.error(e); return; }
      setTimeout(next, 40);
    };
    setTimeout(next, 150);
  }

  // brilho de cada pixel do fundo (0 a 255), para o cone mudar de tom conforme o chão
  function groundLum(cv) {
    const d = cv.cx.getImageData(0, 0, cv.width, cv.height).data, out = new Uint8Array(cv.width * cv.height);
    for (let i = 0; i < out.length; i++) out[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;
    return out;
  }

  // a montagem mede os letreiros (o size dos objetos) com a fonte da V1, como na V1: o tamanho, a
  // colisão e a visão continuam os mesmos (o desenho novo usa a fonte nova; ver Art.text)
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

    const news = [];
    scenes.forEach((s, idx) => {
      const { src, ox0: ox } = s, look = src.look, wallH = look.wall.height;
      const [bx0, bx1] = look.bounds || [0, SW0];
      if (!isNew(look)) throw new Error('Cenário sem pintor da V2 (Art.walls): ' + s.code);
      s.art = true;
      const backs = [], casters = [];

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
        const g = Scenery.geometry(p), def = g.def;
        if (g.solid) solid(g.solid, false);
        if (g.sight) room.sight.push(kRect(g.sight));
        if (def.art && !def.hidden) {
          // o desenho, em px novos do cenário (lx, ly) e da sala (s.ox + lx)
          const a = propArt(def, Object.assign({}, p, { x: p0.x }));
          const lx = k(p0.x) + a.dx, ly = k(p.y) + a.dy, base = a.base !== undefined ? ly + a.base : k(g.z);
          if (def.layer === 'back') backs.push({ a, x: lx, y: ly });
          else if (!def.liveNew) room.sorted.push({ z: g.z, big: a.img, bx: s.ox + lx, by: ly, x: p.x, y: p.y, w: g.w, p });
          if (a.shadow || a.contact) casters.push({ a, x: lx, y: ly, base });
        }
        // o que anima desenha a cada quadro (liveNew), na ordem dos personagens
        if (def.liveNew) room.sorted.push({ z: g.z, x: p.x, y: p.y, w: g.w, p });
        // efeito animado por cima de tudo ou no chão (fxNew), em coordenadas novas
        if (def.fxNew) room.fx.push({ def, p, layer: def.fxLayer || 'top' });
        if (p.interact) room.interact.push({ kind: p.interact, p, repeat: !!p.repeat, rect: kRect({ x: p.x, y: p.y, w: g.w, h: g.h }), base: g.solid && kRect(g.solid) });
        if (p.food && p.steam !== false) room.steam.push({ x: (p.x + 32) * K, y: (p.y + 6) * K, seed: room.steam.length * 1.7 });
      });

      // NPCs parados: inofensivos, mas ocupam lugar e bloqueiam a visão
      (src.npcs || []).forEach(n => {
        const npc = Object.assign({ pose: 'sit', dir: 'down' }, n, { x: ox + n.x });
        const f = footprint(npc.x, npc.y, npc.pose, npc.dir);
        if (f && n.solid !== false) solid(f, n.sight !== false);
        room.npcs.push(npc);
        // talk: 'chave' = Espaço perto dele abre uma conversa (não se gasta; ver Flow.labWalk)
        if (n.talk) room.interact.push({ kind: n.talk, p: npc, repeat: true, rect: kRect({ x: npc.x - 10, y: npc.y - 16, w: 20, h: 18 }) });
      });

      // NPCs que andam (garçom, pessoas, cervos, cardumes, o barco): linha do tempo como a dos
      // vigias, sem cone. Não veem ninguém. block: false = não bloqueia a passagem; sight: false =
      // não tapa a visão (os cardumes tapam a visão e não a passagem). prop: 'tipo' = desenhado
      // pelo objeto do Scenery (liveNew); size: [w, h] = tamanho no chão.
      // Os vigias e quem anda já são criados em coordenadas novas (s.data).
      s.data.movers.forEach(md => {
        const m = Guard.create(Object.assign({ cone: false }, md, { loop: (md.loop || []).map(st => Object.assign({ cone: false }, st)) }), s.ox, find);
        m.scene = idx;
        m.harmless = true;
        m.block = md.block !== false;
        m.blocksSight = md.sight !== false;
        room.movers.push(m);
      });

      // vigias: ocupam lugar, mas não bloqueiam a visão um do outro
      s.data.guards.forEach((gd, j) => {
        const g = Guard.create(gd, s.ox, find), g0 = src.guards[j];
        g.scene = idx;
        room.guards.push(g);
        if (gd.pose === 'sit' && !gd.ride) solid(footprint(ox + g0.x, g0.y, 'sit', gd.face), false);
      });

      news.push({ s, cv: paintNew(s, backs, casters) });
      const L2 = s.data.look, tint = L2.tint, post = Art.posts[L2.wall.style];
      if (tint) s.amb = ambCache[s.code] || (ambCache[s.code] = Art.ambient(SW, SH, tint));
      if (post && !postCache[s.code]) { const P = Art.surface(SW, SH); post(P, L2); postCache[s.code] = P.canvas(); }
      if (post) s.post = postCache[s.code];
      s.fx = Art.scenefx[L2.wall.style] || null;
    });
    room.bg = Gfx.canvas(scenes.length * SW, SH);
    news.forEach(n => room.bg.cx.drawImage(n.cv, n.s.ox, 0));
    room.lum = groundLum(room.bg);
    // look.coneLum: o cone enxerga o chão mais escuro (fica vermelho mais fundo), para aparecer no chão
    // claro de cor fria (debaixo d'água, a areia verde-azulada viraria salmão acinzentado)
    scenes.forEach(s => {
      const f = s.data.look.coneLum;
      if (!f) return;
      for (let y = 0; y < SH; y++) for (let x = s.ox; x < s.ox + SW; x++) room.lum[y * room.w + x] *= f;
    });
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

  return { build, warm, sceneConfig, footprint, npcSprite, scaled: scaleScene, SW, SH, SW0, SH0, K };
})();
