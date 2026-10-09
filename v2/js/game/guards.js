// Vigias: o Fabio e a Ellen do passado. Cada um tem uma linha do tempo em loop, um cone de
// visão e um nível de suspeita de 0 a 3 (SPEC, seção 5).
//
// Definição no arquivo do cenário (posições relativas ao cenário, ângulos em graus:
// 0 = direita, 90 = baixo, 180 = esquerda, 270 = cima). Na V2, o arquivo continua nas coordenadas
// da V1 e o Room.build entrega a definição já ampliada 1,25× (def0 = a velha, para o desenho):
//   { who: 'ELLEN_F1', x, y, pose: 'sit', face: 'left', chair: true,
//     look: 180, range: 44, half: 22, eye: [0, -8], anim: 'cook',
//     loop: [ { t: 4 }, { t: 0.5, look: 115, range: 72, half: 30 }, ... ] }
// Cada passo do loop dura `t` segundos. Durante o passo, look, range, half e to: [x, y]
// (andar até lá) vão do valor atual até o novo, com giro suave pelo lado mais curto.
// Sem `look`, quem anda olha para onde está indo. pose ('sit', 'floor', 'lie', 'stand', 'swim',
// 'photo'), face (deitado: o lado da cabeça), head, anim, eye, eyes ('closed' no beijo), fx
// ('heart' = coraçõezinhos subindo, em heartAt: [dx, dy]) e cone (false = olhos fechados) mudam
// no começo do passo.
//
// Componentes especiais (SPEC, seção 5):
//   jump: [x, y]    no começo do passo, aparece direto ali (o esquiador some embaixo e volta no topo)
//   track: 'id'     o olhar segue quem tem esse id (vigia ou quem anda), em vez do `look` do loop;
//                   trackOffset: graus somados. track: null para de seguir. (a Ellen filmando o
//                   esqui; os dois virando a cabeça para o tubarão-baleia). Na definição,
//                   trackMirror: true espelha o ângulo para baixo (o alvo passa no tanque, em cima,
//                   e o cone varre a sala no mesmo sentido dele)
//   photo: true     enquanto valer, o vigia está posando para a foto: se a Ellen for pega dentro
//                   da `photoZone` do cenário, a fala é a do photobomb (F4 C2)
// Na definição (não no loop):
//   id: 'nome'      para os outros acharem (track, ride)
//   ride: 'id', at: [dx, dy]   vai junto com outro (o barco): a posição é a do outro mais `at`
//                   girado pela direção dele, e o `look` do loop vira relativo à direção dele
//   wade: n         dentro da água: esconde as n linhas de baixo do sprite (o mar do F2 A1)
//   gear: 'ski'     esquis e bastões nos pés
const Guard = (() => {
  const RAD = Math.PI / 180;
  const ease = p => p * p * (3 - 2 * p);
  const turn = (from, to) => from + ((((to - from) % 360) + 540) % 360 - 180);

  // find(id) → o vigia ou quem anda com aquele id (para track e ride); vem do Room.build
  function create(def, ox, find) {
    const d = () => GAME_CONFIG.difficulty;
    const g = { def, id: def.id || null, sus: 0, seeing: false, time: 0 };
    const norm = a => ((a % 360) + 360) % 360;

    function startStep(i) {
      g.i = i;
      g.st = 0;
      const s = def.loop[i] || {};
      if (s.jump) { g.x = ox + s.jump[0]; g.y = s.jump[1]; }
      ['pose', 'face', 'anim', 'eye', 'eyes', 'fx', 'photo'].forEach(k => { if (s[k] !== undefined) g[k] = s[k]; });
      if (s.head !== undefined) g.head = s.head;
      if (s.cone !== undefined) g.coneOn = s.cone;
      if (s.track !== undefined) g.track = s.track;
      if (s.trackOffset !== undefined) g.trackOffset = s.trackOffset;
      g.from = { look: g.base, range: g.range, half: g.half, x: g.x, y: g.y };
      g.to = {
        range: s.range !== undefined ? s.range : g.range,
        half: s.half !== undefined ? s.half : g.half,
        x: s.to ? ox + s.to[0] : g.x,
        y: s.to ? s.to[1] : g.y
      };
      const moving = g.to.x !== g.x || g.to.y !== g.y;
      const heading = moving ? Math.atan2(g.to.y - g.y, g.to.x - g.x) / RAD : g.base;
      g.followHeading = s.look === undefined && moving;
      g.to.look = turn(g.base, s.look !== undefined ? s.look : heading);
    }

    g.reset = () => {
      g.x = ox + def.x;
      g.y = def.y;
      g.pose = def.pose || 'stand';
      g.face = def.face || 'down';
      g.head = def.head || null;
      g.anim = def.anim || null;
      g.eye = def.eye || null;
      g.eyes = def.eyes || 'open';
      g.fx = def.fx || null;
      g.photo = def.photo || false;
      g.track = def.track || null;
      g.trackOffset = def.trackOffset || 0;
      g.base = def.look !== undefined ? def.look : 90;   // o olhar do loop (relativo, se for junto com outro)
      g.look = g.base;
      g.range = def.range || d().coneLength;
      g.half = def.half || d().coneHalfAngleDeg;
      g.coneOn = def.cone !== false;
      g.coneScale = g.coneOn ? 1 : 0;
      g.sus = 0;
      g.seeing = false;
      g.moving = false;
      g.dist = 0;
      g.time = 0;
      if (def.loop && def.loop.length) startStep(0);
      ride(0);
    };

    // vai junto com outro (o barco): posição e olhar a partir dele
    function ride(dt) {
      const v = def.ride && find && find(def.ride);
      if (!v) return false;
      const a = v.look * RAD, at = def.at || [0, 0];
      const px = g.x, py = g.y;
      g.x = v.x + at[0] * Math.cos(a) - at[1] * Math.sin(a);
      g.y = v.y + at[0] * Math.sin(a) + at[1] * Math.cos(a);
      g.look = norm(v.look + g.base);
      if (dt) {
        const moved = Math.hypot(g.x - px, g.y - py);
        g.moving = false;
        g.dist += moved;
      }
      return true;
    }

    g.update = dt => {
      g.time += dt;
      g.coneScale = Math.max(0, Math.min(1, g.coneScale + (g.coneOn ? dt : -dt) / 0.15));
      const px = g.x, py = g.y;
      if (def.loop && def.loop.length) {
        let left = dt;
        for (let guard = 0; guard < 20; guard++) {
          const s = def.loop[g.i], dur = s.t || 0;
          const used = Math.min(left, Math.max(0, dur - g.st));
          g.st += used;
          left -= used;
          const p = dur > 0 ? Math.min(1, g.st / dur) : 1;
          const e = ease(p), f = g.from, to = g.to;
          // quem anda vira rápido para onde vai; os giros parados usam o passo inteiro
          const lp = g.followHeading ? ease(Math.min(1, g.st / Math.min(0.3, dur || 0.3))) : e;
          g.base = f.look + (to.look - f.look) * lp;
          g.range = f.range + (to.range - f.range) * e;
          g.half = f.half + (to.half - f.half) * e;
          g.x = f.x + (to.x - f.x) * p;
          g.y = f.y + (to.y - f.y) * p;
          if (p < 1) break;
          g.base = norm(to.look);
          startStep((g.i + 1) % def.loop.length);
          if (left <= 0) break;
        }
      }
      if (ride(dt)) return;
      const moved = Math.hypot(g.x - px, g.y - py);
      // um salto (jump) não conta como passo
      g.moving = moved > 0.01 && moved < 25;
      if (g.moving) g.dist += moved;
      // seguindo alguém com o olhar: gira até ele, no máximo 300° por segundo
      const target = g.track && find && find(g.track);
      if (target) {
        const c = g.cone();
        let want = Math.atan2(target.y - 10 - c.y, target.x - c.x) / RAD;
        // trackMirror: o alvo está acima (no tanque), e o cone varre a sala no mesmo sentido dele
        if (def.trackMirror) want = -want;
        want += g.trackOffset;
        const diff = turn(g.look, want) - g.look, maxStep = 300 * dt;
        g.look = norm(g.look + Math.max(-maxStep, Math.min(maxStep, diff)));
      } else {
        g.look = norm(g.base);
      }
    };

    // ordem de desenho: quem vai junto com outro fica por cima dele
    g.z = () => {
      const v = def.ride && find && find(def.ride);
      return v ? v.y + 1 + (g.y - v.y) / 100 : g.y;
    };

    // cone no mundo: origem nos "olhos" (no chão, perto do corpo), ângulos em radianos
    // (os olhos de cada pose são os da V1 × 1,25)
    g.cone = () => {
      const eye = g.eye || (g.pose === 'sit' ? [0, -10] : g.pose === 'floor' ? [0, -7.5] : g.pose === 'lie' ? [g.face === 'right' ? 10 : -10, -10] : [0, -3.75]);
      g._cone = g._cone || {};
      return Object.assign(g._cone, {
        x: g.x + eye[0], y: g.y + eye[1],
        look: g.look * RAD, half: g.half * RAD, range: g.range * g.coneScale
      });
    };

    g.coneActive = () => g.coneOn && g.coneScale > 0.6;

    // topo da cabeça do sprite, para o balão de suspeita
    g.headTop = () => {
      const side = g.pose === 'lie' ? g.face : g.pose === 'swim' ? Chars.dirOf(g.look) : null;
      const [dx, dy] = Chars.headTop(g.pose, side);
      return { x: g.x + dx, y: g.y + dy };
    };

    g.stage = () => Math.min(3, Math.floor(g.sus));

    g.sprite = () => {
      const lookDir = Chars.dirOf(g.look), eyes = g.eyes;
      if (g.pose === 'lie') return Chars.sprite(def.who, { pose: 'lie', dir: g.face, head: g.head || 'sky', eyes, cover: def.cover });
      if (g.pose === 'floor') return Chars.sprite(def.who, { pose: 'floor', dir: g.face, head: g.head || lookDir, eyes });
      if (g.pose === 'photo') return Chars.sprite(def.who, { pose: 'photo', dir: 'down', eyes });
      // nadando: o corpo vai na direção do cone, batendo as pernas
      if (g.pose === 'swim') return Chars.sprite(def.who, { pose: 'swim', dir: lookDir, frame: Math.floor(g.time * 4) % 4, eyes });
      if (g.pose === 'sit') {
        const frame = (g.anim === 'cook' || g.anim === 'eat') && Math.floor(g.time / (g.anim === 'eat' ? 0.5 : 0.35)) % 2 ? 1 : 0;
        // quem vai junto com outro (no barco) senta virado para onde olha
        return Chars.sprite(def.who, { pose: 'sit', dir: def.ride ? lookDir : g.face, head: g.head || lookDir, frame, eyes });
      }
      const frame = g.moving ? Math.floor(g.dist / 10) % 4 : -1;   // um quadro a cada 10 px (8 na V1)
      // parado, quem não vigia (garçom) olha para `face`; vigias olham para o cone
      return Chars.sprite(def.who, { dir: g.moving || !g.harmless ? lookDir : g.face, frame, eyes });
    };

    // a pessoa, no tamanho da V2 (coordenadas novas)
    g.draw = (ctx, shadow) => {
      Chars.draw(ctx, g.sprite(), g.x, g.y, { chair: def.chair, dir: g.face, pose: g.pose, shadow, wade: def.wade, gear: def.gear, look: Chars.dirOf(g.look), t: g.time });
    };

    // Quem anda pode ser desenhado por um objeto do Scenery (prop: 'deer', 'shark'...): o live
    // recebe este vigia como instância (x, y, look, moving, dist, time, def).
    // k = 1,25: desenho da V1, em coordenadas velhas (a posição e o caminho divididos por k, e a
    // definição velha, def0), dentro da camada velha (legacy.js)
    g.drawProp = (ctx, world, k = 1) => {
      const v = k === 1 ? g : Object.assign(Object.create(g), { x: g.x / k, y: g.y / k, dist: g.dist / k, def: g.def0 || def });
      Scenery.props[def.prop].live(ctx, v, world || { t: g.time });
    };

    // área no chão (para quem anda bloquear a passagem da Ellen); size: [w, h] muda o tamanho
    g.rect = () => {
      const [w, h] = def.size || [12.5, 7.5];
      return { x: g.x - w / 2, y: g.y - h, w, h };
    };

    g.reset();
    return g;
  }

  // balão acima da cabeça: "??", "??!!", "!!!!" (seção 5), no tamanho da V2 (x, y em coordenadas
  // novas da tela; a ponta do rabinho fica em y)
  const BUBBLE = ['', '??', '??!!', '!!!!'];
  function bubble(ctx, x, y, stage, t) {
    if (stage < 1) return;
    const text = BUBBLE[stage], w = Gfx.textWidth(text) + 10, h = 16;
    const shake = stage === 3 ? Math.round(Math.sin(t * 60) * 1.25) : 0;
    const cx = Math.round(x) + shake, bx = Math.round(x - w / 2) + shake, by = Math.round(y - h - 4);
    Gfx.rect(bx + 1, by, w - 2, h, '#1E1826');
    Gfx.rect(bx, by + 1, w, h - 2, '#1E1826');
    Gfx.rect(bx + 1, by + 1, w - 2, h - 2, '#FFFFFF');
    Gfx.rect(bx + 1, by + h - 2, w - 2, 1, '#DDE2EE');
    // rabinho apontando para a cabeça
    Gfx.rect(cx - 1, by + h - 1, 3, 1, '#DDE2EE');
    Gfx.rect(cx - 2, by + h, 1, 1, '#1E1826');
    Gfx.rect(cx - 1, by + h, 3, 1, '#DDE2EE');
    Gfx.rect(cx + 2, by + h, 1, 1, '#1E1826');
    Gfx.rect(cx - 1, by + h + 1, 1, 1, '#1E1826');
    Gfx.rect(cx, by + h + 1, 1, 1, '#DDE2EE');
    Gfx.rect(cx + 1, by + h + 1, 1, 1, '#1E1826');
    Gfx.rect(cx, by + h + 2, 1, 1, '#1E1826');
    Gfx.text(text, bx + 5, by + 3, '#D8283C');
  }

  // coraçõezinhos subindo no beijo
  const HEART = ['.#.#.', '#####', '#####', '.###.', '..#..'];
  function hearts(ctx, x, y, t) {
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.6 + k * 0.5) % 1;
      const hx = Math.round(x + Math.sin((t + k * 1.3) * 3) * 2) - 2, hy = Math.round(y - ph * 14);
      ctx.globalAlpha = ph < 0.75 ? 1 : (1 - ph) * 4;
      HEART.forEach((row, j) => {
        for (let i = 0; i < 5; i++) if (row[i] === '#') Gfx.rect(hx + i, hy + j, 1, 1, j === 1 && i === 1 ? '#FFC2D2' : '#F0587E');
      });
    }
    ctx.globalAlpha = 1;
  }

  return { create, bubble, hearts };
})();
