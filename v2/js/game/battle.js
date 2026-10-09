// Batalha final por turnos (SPEC, seções 8 e 11.9), no estilo Pokémon: o Big Jimmy Junk em cima,
// à direita, com os capangas; a Ellen de costas embaixo, à esquerda, com o Fabio do lado. Caixa
// de texto embaixo, com o menu SHOOT / ITEM.
//
// Roteiro: o vilão ataca primeiro com TEMPTATION e a Ellen fica TEMPTED (as mãos tremem).
//   SHOOT tentada → sempre erra, gasta uma bala, mensagem sorteada e uma provocação do vilão.
//   ITEM → MOUNJARO → tira o TEMPTED; o vilão faz o discurso e vira SUPERSIZE.
//   SHOOT depois do Mounjaro → silêncio, "BANG.", a vida zera de uma vez e ele cai.
//   ITEM → MYSTERIOUS RING → "Not here. Not yet." (não gasta o turno).
//   Sem balas antes de vencer → COMBO MEAL, a Ellen desmaia, "Try again?" e tudo recomeça.
// Os textos vêm de GAME_CONFIG.texts.battle.
// V2: as caixas, o menu, os textos, o vilão, os capangas, a Ellen e o Fabio no tamanho novo (480×270;
// a Ellen e o Fabio de costas, com o sprite em 2×); o fundo e os efeitos (cheiro, tiro) ainda são o
// desenho da V1, em coordenadas velhas (384×216), ampliado (Legacy.screen).
const BattleState = (() => {
  const W = Display.W, H = Display.H, W0 = 384, H0 = 216;
  const ENEMY = { x: 288, y: 100 }, PLAYER = { x: 92, y: 162 };   // em coordenadas velhas
  const K = Legacy.K;
  const T = () => GAME_CONFIG.texts.battle;

  let time, phase, intro, bullets, tempted, usedMounjaro, form, hp, hpShown;
  let menu, sel, sub, subSel, fall, faint, shot, waves, shake, flash, bg = null, retryShown;

  const pick = list => list[Math.floor(Math.random() * list.length)];

  // ---------- fundo: a livraria-café, simplificada (V1) ----------
  function background() {
    const W = W0, H = H0, cv = Gfx.canvas(W, H), c = cv.cx, R = (x, y, w, h, col) => Gfx.rect(x, y, w, h, col, c);
    R(0, 0, W, 120, '#EFE2BC');
    R(0, 0, W, 10, '#26272E');
    R(0, 10, W, 2, '#F4F2EC');
    // estante de nichos à esquerda e a prateleira do balcão à direita, desbotadas
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 6; i++) {
        R(6 + i * 22, 20 + j * 24, 19, 20, '#E6E0D2');
        for (let k = 0; k < 5; k++) R(8 + i * 22 + k * 3, 26 + j * 24 + (k % 2), 2, 14 - (k % 3), ['#D8A0A0', '#A0B8D8', '#E8D8A0', '#A8C8A0', '#C8B8D8'][(i + j + k) % 5]);
      }
    }
    R(240, 28, 140, 12, '#3A3840');
    for (let k = 0; k < 30; k++) R(244 + k * 4.5, 30, 3, 9, ['#E8E0D0', '#D8A0A0', '#A0B8D8', '#E8D8A0'][k % 4]);
    R(0, 112, W, 8, '#D8C8A0');
    // carpete
    Gfx.dither(c, 0, 120, W, H - 120, ['#3A3B44', '#33343C', '#2C2D34'], 2);
    // plataformas (elipses) de cada lado
    const plat = (cx, cy, w, h) => {
      for (let j = 0; j < h; j++) {
        const dy = (j + 0.5 - h / 2) / (h / 2), half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
        R(Math.round(cx - half), cy - h / 2 + j, Math.round(half * 2), 1, j < 3 ? '#8A8478' : j > h - 4 ? '#46444E' : '#6A6670');
      }
    };
    plat(ENEMY.x, ENEMY.y, 150, 26);
    plat(PLAYER.x + 12, PLAYER.y, 150, 26);
    return cv;
  }

  // ---------- caixas de informação ----------
  function enemyBox() {
    const x = 12, y = 15, w = 212, h = 42;
    Gfx.panel(x, y, w, h);
    Gfx.text(T().villain, x + 10, y + 8, '#FFF4DA', { shadow: '#07060E' });
    Gfx.text(T().level, x + w - 10, y + 8, '#F2C14E', { align: 'right', shadow: '#07060E' });
    Gfx.text('HP', x + 10, y + 25, '#F2C14E');
    const bx = x + 30, bw = w - 42;
    Gfx.rect(bx, y + 25, bw, 8, '#1E1826');
    const f = Math.max(0, hpShown);
    const col = f > 0.5 ? '#5DD07A' : f > 0.2 ? '#F2C14E' : '#D8443A';
    if (f > 0) { Gfx.rect(bx + 1, y + 26, Math.round((bw - 2) * f), 6, col); Gfx.rect(bx + 1, y + 26, Math.round((bw - 2) * f), 1, '#C8F8D0'); }
  }

  function playerBox() {
    const x = 268, y = 160, w = 200, h = 42;
    Gfx.panel(x, y, w, h);
    Gfx.text('ELLEN', x + 10, y + 8, '#FFF4DA', { shadow: '#07060E' });
    if (tempted) {
      const tw = Gfx.textWidth('TEMPTED') + 8;
      Gfx.rect(x + w - tw - 10, y + 6, tw, 13, '#D8443A');
      Gfx.text('TEMPTED', x + w - tw - 6, y + 8, '#FFF4DA');
    }
    // balas
    for (let i = 0; i < 5; i++) {
      const bx = x + 12 + i * 11, by = y + 24, on = i < bullets;
      Gfx.rect(bx, by + 2, 5, 9, on ? '#C9A24A' : '#3A3650');
      Gfx.rect(bx + 1, by, 3, 2, on ? '#E8B888' : '#3A3650');
      if (on) Gfx.rect(bx, by + 2, 1, 9, '#F2D27A');
    }
    Gfx.text(T().menu.bullets.replace('{n}', bullets), x + w - 10, y + 26, '#CFC8E8', { align: 'right' });
  }

  // ---------- menu ----------
  function options() {
    if (sub) {
      const m = T().menu, out = [];
      if (!usedMounjaro) out.push({ id: 'mounjaro', label: m.mounjaro });
      out.push({ id: 'ring', label: m.ring });
      return out;
    }
    return [
      { id: 'shoot', label: T().menu.shoot + '  (' + T().menu.bullets.replace('{n}', bullets) + ')' },
      { id: 'item', label: T().menu.item }
    ];
  }

  function drawMenu() {
    const x = 11, w = 458, h = 52, y = H - 8 - h;
    Gfx.panel(x, y, w, h);
    Gfx.text(T().menu.prompt || '', x + 12, y + 10, '#CFC8E8');
    const opts = options(), cur = sub ? subSel : sel;
    const mx = x + 232;
    Gfx.rect(mx - 10, y + 5, 1, h - 10, '#7F74BC');
    opts.forEach((o, i) => {
      const oy = y + 10 + i * 16;
      Gfx.text(o.label, mx + 10, oy, i === cur ? '#FFF4DA' : '#7F74BC');
      if (i === cur && Math.floor(time * 2.5) % 2 === 0) Gfx.text('>', mx, oy, '#F2C14E');
    });
  }

  // ---------- falas e ações ----------
  function say(lines, then) {
    phase = 'talk';
    Dialog.say(lines, { onAction: act, onDone: () => { if (then) then(); } });
  }

  function act(name, resume) {
    const wait = s => { later = { t: s, fn: resume }; return true; };
    switch (name) {
      case 'smell': waves = 2.6; Sound.sfx('smell'); return wait(1.4);
      case 'tempted': tempted = true; Sound.sfx('caught'); return false;
      case 'calm': tempted = false; Sound.sfx('memory'); return false;
      case 'shake': shake = 0.9; Sound.sfx('rumble'); return wait(0.9);
      case 'grow': if (Sound.music) Sound.music('transform'); return false;
      case 'super': form = 'super'; flash = 1; shake = 0.6; Sound.sfx('rumble'); return wait(0.8);
      case 'miss': shot = { t: 0, hit: false }; Sound.sfx('miss'); return wait(0.6);
      case 'silence': if (Sound.music) Sound.music(null); return wait(1.2);
      case 'bang': shot = { t: 0, hit: true }; flash = 1; Sound.sfx('bang'); return wait(0.9);
      case 'hpZero': hp = 0; return wait(0.6);
      case 'fall': fall = 0.001; Sound.sfx('fall'); return wait(1.2);
      case 'combo': waves = 2; shake = 0.8; flash = 0.8; Sound.sfx('rumble'); return wait(1.0);
      case 'faint': faint = 0.001; Sound.sfx('caught'); return wait(1.0);
    }
    return false;
  }
  let later = null;

  // ---------- turnos ----------
  function start() {
    time = 0;
    phase = 'intro';
    intro = 0;
    bullets = 5;
    tempted = false;
    usedMounjaro = false;
    form = 'normal';
    hp = 1;
    hpShown = 1;
    sel = 0;
    sub = false;
    subSel = 0;
    fall = 0;
    faint = 0;
    shot = null;
    waves = 0;
    shake = 0;
    flash = 0;
    later = null;
    retryShown = false;
    if (Sound.music) Sound.music('battle');
  }

  function villainOpens() {
    say([T().intro, '[smell]', T().temptation[0], '[tempted]', T().temptation[1]], toMenu);
  }

  function toMenu() {
    phase = 'menu';
    sub = false;
    sel = 0;
  }

  function choose(id) {
    Sound.sfx('confirm');
    if (id === 'item') { sub = true; subSel = 0; return; }
    if (id === 'ring') { say([T().ring], toMenu); return; }
    if (id === 'mounjaro') {
      usedMounjaro = true;
      const tr = T().transform;
      say(['[calm]', T().mounjaro, '[grow]'].concat(tr.slice(0, tr.length - 2), ['[shake]', tr[tr.length - 2], '[super]', tr[tr.length - 1]]), toMenu);
      return;
    }
    if (id === 'shoot') {
      bullets--;
      if (!tempted) {
        const f = T().finalShot;
        say(['[silence]', f[0], '[bang]', f[1], '[hpZero]', '[fall]', f[2]].concat(T().victory), () => Flow.afterBattle());
        return;
      }
      if (bullets <= 0) {
        say(['[miss]', pick(T().miss), '[combo]', T().defeat[0], '[faint]', T().defeat[1]], () => { phase = 'retry'; retryShown = true; });
        return;
      }
      say(['[miss]', pick(T().miss), pick(T().taunt)], toMenu);
    }
  }

  // ---------- desenho ----------
  // a Ellen de costas, com o Fabio do lado (sprites da V2 em 2×, em coordenadas novas)
  function drawEllen(ctx, tremble) {
    const e = Chars.sprite('ELLEN_NOW', { dir: 'up' }), f = Chars.sprite('FABIO_NOW', { dir: 'up' });
    const SW = Chars.W, SH = Chars.H;
    const slide = (phase === 'intro' ? Math.max(0, 1 - intro / 1.2) * -160 : 0) * K;
    const ex = Math.round(PLAYER.x * K - SW + slide + (tremble ? Math.round(Math.sin(time * 40) * 1.25) : 0)), feet = Math.round((PLAYER.y + 2) * K);
    const ey = feet - SH * 2 + 1;
    Gfx.shadow(PLAYER.x * K + slide, feet - 1, 36, 8);
    Gfx.shadow(PLAYER.x * K + 56 + slide, feet + 2, 36, 8);
    ctx.drawImage(f, 0, 0, SW, SH, Math.round(PLAYER.x * K + 56 - SW + slide), feet + 3 - SH * 2 + 1, SW * 2, SH * 2);
    if (faint) {
      ctx.save();
      ctx.translate(Math.round(PLAYER.x * K + slide), feet);
      ctx.rotate(Math.min(1, faint) * Math.PI / 2);
      ctx.drawImage(e, 0, 0, SW, SH, -SW, -SH * 2 + 1, SW * 2, SH * 2);
      ctx.restore();
    } else {
      ctx.drawImage(e, 0, 0, SW, SH, ex, ey, SW * 2, SH * 2);
      // o revólver velho na mão direita
      Gfx.rect(ex + 39, ey + 60, 9, 3, '#5E6470');
      Gfx.rect(ex + 39, ey + 60, 9, 1, '#8A909C');
      Gfx.rect(ex + 39, ey + 63, 3, 4, '#8A5A32');
    }
  }

  // o vilão e os capangas (desenho da V2, em coordenadas novas)
  function drawJimmy(ctx) {
    const slide = phase === 'intro' ? Math.max(0, 1 - intro / 1.2) * 180 : 0;
    const x = (ENEMY.x + slide - (form === 'super' ? 6 : 0)) * K, y = (ENEMY.y + (form === 'super' ? 14 : 0)) * K;
    // capangas dos lados
    if (!fall) {
      ctx.drawImage(Jimmy.minion('fry', Math.floor(time * 3) % 2), Math.round(x - 98), Math.round(y - 30));
      ctx.drawImage(Jimmy.minion('cup', Math.floor(time * 3 + 1) % 2), Math.round(x + 75), Math.round(y - 30));
      ctx.drawImage(Jimmy.minion('fry', Math.floor(time * 3 + 1) % 2), Math.round(x + 52), Math.round(y - 20));
    }
    Jimmy.draw(ctx, x, y, { form, t: time, fall: fall ? Math.min(1, fall) : 0 });
  }

  // tiro: um risco de luz da mão da Ellen; errando, desvia para o canto
  function drawShot() {
    if (!shot) return;
    const k = Math.min(1, shot.t / 0.25);
    const sx = PLAYER.x + 14, sy = PLAYER.y - 26;
    const tx = shot.hit ? ENEMY.x : ENEMY.x - 120, ty = shot.hit ? ENEMY.y - 40 : ENEMY.y - 70;
    Gfx.rect(sx - 2, sy - 2, 5, 5, shot.t < 0.1 ? '#FFF4C8' : '#F2C14E');
    const x = sx + (tx - sx) * k, y = sy + (ty - sy) * k;
    Gfx.rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, '#FFF4DA');
    if (k >= 1 && !shot.hit && shot.t < 0.45) Gfx.text('*', Math.round(tx), Math.round(ty), '#FFF4DA');
  }

  function drawWaves(ctx) {
    const k = Math.min(1, waves / 0.6);
    for (let w = 0; w < 6; w++) {
      const y0 = 70 + w * 18;
      const x0 = ENEMY.x - 30 - ((time * (80 + w * 10) + w * 50) % 260);
      for (let i = 0; i < 70; i += 2) {
        const x = Math.round(x0 + i), y = Math.round(y0 + Math.sin((i + time * 60) * 0.13 + w) * 4);
        ctx.globalAlpha = 0.55 * k * Math.min(1, Math.min(i, 70 - i) / 14);
        Gfx.rect(x, y, 2, 1, ['#F2C14E', '#E8A040', '#FFE08A'][w % 3]);
      }
    }
    ctx.globalAlpha = 1;
  }

  return {
    enter() {
      if (!bg) bg = background();
      start();
    },

    update(dt) {
      time += dt;
      hpShown += (hp - hpShown) * Math.min(1, dt * 12);
      waves = Math.max(0, waves - dt);
      shake = Math.max(0, shake - dt);
      flash = Math.max(0, flash - dt / 0.4);
      if (shot) shot.t += dt;
      if (fall) fall += dt / 0.9;
      if (faint) faint += dt / 0.6;
      if (later && (later.t -= dt) <= 0) { const f = later.fn; later = null; f(); }

      if (phase === 'intro') {
        intro += dt;
        if (intro >= 1.4) villainOpens();
        return;
      }
      if (phase === 'menu') {
        const n = options().length;
        if (Input.pressed('up') || Input.pressed('down')) {
          Sound.sfx('move');
          if (sub) subSel = (subSel + (Input.pressed('down') ? 1 : n - 1)) % n;
          else sel = (sel + (Input.pressed('down') ? 1 : n - 1)) % n;
        }
        if (Input.pressed('cancel') && sub) { Input.consume('cancel'); sub = false; Sound.sfx('move'); }
        if (Input.pressed('confirm')) {
          Input.consume('confirm');
          const o = options()[sub ? subSel : sel];
          if (o) choose(o.id);
        }
        return;
      }
      if (phase === 'retry' && Input.pressed('confirm')) {
        Input.consume('confirm');
        Sound.sfx('confirm');
        start();
      }
    },

    // durante as falas: as animações continuam
    idle(dt) {
      time += dt;
      hpShown += (hp - hpShown) * Math.min(1, dt * 12);
      waves = Math.max(0, waves - dt);
      shake = Math.max(0, shake - dt);
      flash = Math.max(0, flash - dt / 0.4);
      if (shot) shot.t += dt;
      if (fall) fall += dt / 0.9;
      if (faint) faint += dt / 0.6;
      if (later && (later.t -= dt) <= 0) { const f = later.fn; later = null; f(); }
    },

    render(ctx) {
      ctx.save();
      if (shake > 0) ctx.translate(Math.round(Math.sin(time * 70) * 3.75), Math.round(Math.cos(time * 51) * 2.5));
      // o fundo é o desenho da V1, em coordenadas velhas, ampliado; os personagens já são os da V2
      Legacy.screen(ctx, lc => lc.drawImage(bg, 0, 0));
      drawJimmy(ctx);
      drawEllen(ctx, tempted);
      if (waves > 0 || shot) {
        Legacy.screen(ctx, lc => {
          if (waves > 0) drawWaves(lc);
          drawShot();
        });
      }
      ctx.restore();
      if (phase !== 'intro' || intro > 1.1) { enemyBox(); playerBox(); }
      if (phase === 'menu') drawMenu();
      if (phase === 'retry') {
        Gfx.panel(165, 115, 150, 45);
        Gfx.text(T().retry, W / 2, 126, '#F2C14E', { align: 'center', scale: 1 });
        if (Math.floor(time * 2.5) % 2 === 0) Gfx.text('>', W / 2 - 2, 143, '#FFF4DA');
      }
      // abertura: três clarões
      if (phase === 'intro' && intro < 0.6 && Math.floor(intro * 10) % 2 === 0) Gfx.rect(0, 0, W, H, '#FFFFFF');
      if (flash > 0) { ctx.globalAlpha = flash; Gfx.rect(0, 0, W, H, '#FFFFFF'); ctx.globalAlpha = 1; }
    },

    // atalho de emergência: vence a batalha
    skip() {
      Dialog.close();
      later = null;
      Flow.afterBattle();
    },

    inspect: () => ({ phase, bullets, tempted, usedMounjaro, form, hp, sub, options: options().map(o => o.id) })
  };
})();

Game.register('battle', BattleState);
