// Vigias: o Fabio e a Ellen do passado. Cada um tem uma linha do tempo em loop, um cone de
// visão e um nível de suspeita de 0 a 3 (SPEC, seção 5).
//
// Definição no arquivo do cenário (posições relativas ao cenário, ângulos em graus:
// 0 = direita, 90 = baixo, 180 = esquerda, 270 = cima):
//   { who: 'ELLEN_F1', x, y, pose: 'sit', face: 'left', chair: true,
//     look: 180, range: 44, half: 22, eye: [0, -8], anim: 'cook',
//     loop: [ { t: 4 }, { t: 0.5, look: 115, range: 72, half: 30 }, ... ] }
// Cada passo do loop dura `t` segundos. Durante o passo, look, range, half e to: [x, y]
// (andar até lá) vão do valor atual até o novo, com giro suave pelo lado mais curto.
// Sem `look`, quem anda olha para onde está indo. pose, face, head, anim e cone
// (false = olhos fechados) mudam no começo do passo.
const Guard = (() => {
  const RAD = Math.PI / 180;
  const ease = p => p * p * (3 - 2 * p);
  const turn = (from, to) => from + ((((to - from) % 360) + 540) % 360 - 180);

  function create(def, ox) {
    const d = () => GAME_CONFIG.difficulty;
    const g = { def, sus: 0, seeing: false, time: 0 };

    function startStep(i) {
      g.i = i;
      g.st = 0;
      const s = def.loop[i] || {};
      ['pose', 'face', 'anim'].forEach(k => { if (s[k] !== undefined) g[k] = s[k]; });
      if (s.head !== undefined) g.head = s.head;
      if (s.cone !== undefined) g.coneOn = s.cone;
      g.from = { look: g.look, range: g.range, half: g.half, x: g.x, y: g.y };
      g.to = {
        range: s.range !== undefined ? s.range : g.range,
        half: s.half !== undefined ? s.half : g.half,
        x: s.to ? ox + s.to[0] : g.x,
        y: s.to ? s.to[1] : g.y
      };
      const moving = g.to.x !== g.x || g.to.y !== g.y;
      const heading = moving ? Math.atan2(g.to.y - g.y, g.to.x - g.x) / RAD : g.look;
      g.followHeading = s.look === undefined && moving;
      g.to.look = turn(g.look, s.look !== undefined ? s.look : heading);
    }

    g.reset = () => {
      g.x = ox + def.x;
      g.y = def.y;
      g.pose = def.pose || 'stand';
      g.face = def.face || 'down';
      g.head = def.head || null;
      g.anim = def.anim || null;
      g.look = def.look !== undefined ? def.look : 90;
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
    };

    g.update = dt => {
      g.time += dt;
      g.coneScale = Math.max(0, Math.min(1, g.coneScale + (g.coneOn ? dt : -dt) / 0.15));
      if (!def.loop || !def.loop.length) return;
      let left = dt;
      const px = g.x, py = g.y;
      for (let guard = 0; guard < 20; guard++) {
        const s = def.loop[g.i], dur = s.t || 0;
        const used = Math.min(left, Math.max(0, dur - g.st));
        g.st += used;
        left -= used;
        const p = dur > 0 ? Math.min(1, g.st / dur) : 1;
        const e = ease(p), f = g.from, to = g.to;
        // quem anda vira rápido para onde vai; os giros parados usam o passo inteiro
        const lp = g.followHeading ? ease(Math.min(1, g.st / Math.min(0.3, dur || 0.3))) : e;
        g.look = f.look + (to.look - f.look) * lp;
        g.range = f.range + (to.range - f.range) * e;
        g.half = f.half + (to.half - f.half) * e;
        g.x = f.x + (to.x - f.x) * p;
        g.y = f.y + (to.y - f.y) * p;
        if (p < 1) break;
        g.look = ((to.look % 360) + 360) % 360;
        startStep((g.i + 1) % def.loop.length);
        if (left <= 0) break;
      }
      const moved = Math.hypot(g.x - px, g.y - py);
      g.moving = moved > 0.01;
      g.dist += moved;
    };

    // cone no mundo: origem nos "olhos" (no chão, perto do corpo), ângulos em radianos
    g.cone = () => {
      const eye = def.eye || (g.pose === 'sit' ? [0, -8] : [0, -3]);
      g._cone = g._cone || {};
      return Object.assign(g._cone, {
        x: g.x + eye[0], y: g.y + eye[1],
        look: g.look * RAD, half: g.half * RAD, range: g.range * g.coneScale
      });
    };

    g.coneActive = () => g.coneOn && g.coneScale > 0.6;

    g.stage = () => Math.min(3, Math.floor(g.sus));

    g.sprite = () => {
      const lookDir = Chars.dirOf(g.look);
      if (g.pose === 'sit') {
        const frame = g.anim === 'cook' && Math.floor(g.time / 0.35) % 2 ? 1 : 0;
        return Chars.sprite(def.who, { pose: 'sit', dir: g.face, head: g.head || lookDir, frame });
      }
      const frame = g.moving ? Math.floor(g.dist / 8) % 4 : -1;
      return Chars.sprite(def.who, { dir: lookDir, frame });
    };

    g.draw = ctx => Chars.draw(ctx, g.sprite(), g.x, g.y, { chair: def.chair, dir: g.face, pose: g.pose });

    g.reset();
    return g;
  }

  // balão acima da cabeça: "??", "??!!", "!!!!" (seção 5)
  const BUBBLE = ['', '??', '??!!', '!!!!'];
  function bubble(ctx, x, y, stage, t) {
    if (stage < 1) return;
    const text = BUBBLE[stage], w = Gfx.textWidth(text) + 8, h = 13;
    const shake = stage === 3 ? Math.round(Math.sin(t * 60)) : 0;
    const cx = Math.round(x) + shake, bx = Math.round(x - w / 2) + shake, by = Math.round(y - h - 3);
    Gfx.rect(bx + 1, by, w - 2, h, '#1E1826');
    Gfx.rect(bx, by + 1, w, h - 2, '#1E1826');
    Gfx.rect(bx + 1, by + 1, w - 2, h - 2, '#FFFFFF');
    Gfx.rect(bx + 1, by + h - 2, w - 2, 1, '#DDE2EE');
    // rabinho apontando para a cabeça
    Gfx.rect(cx - 1, by + h - 1, 3, 1, '#DDE2EE');
    Gfx.rect(cx - 1, by + h, 1, 1, '#1E1826');
    Gfx.rect(cx, by + h, 1, 1, '#DDE2EE');
    Gfx.rect(cx + 1, by + h, 1, 1, '#1E1826');
    Gfx.rect(cx, by + h + 1, 1, 1, '#1E1826');
    Gfx.text(text, bx + 4, by + 3, '#D8283C');
  }

  return { create, bubble };
})();
