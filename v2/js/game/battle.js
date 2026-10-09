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
// V2: tudo no tamanho novo (480×270): as caixas, o menu, os textos, o vilão, os capangas, a Ellen e o
// Fabio (de costas, com o sprite em 2×), o fundo (a livraria, com os objetos do SHOP) e os efeitos.
const BattleState = (() => {
  const W = Display.W, H = Display.H;
  const ENEMY = { x: 288, y: 100 }, PLAYER = { x: 92, y: 162 };   // em coordenadas da V1 (× K)
  const K = Legacy.K;
  const T = () => GAME_CONFIG.texts.battle;

  let time, phase, intro, bullets, tempted, usedMounjaro, form, hp, hpShown;
  let menu, sel, sub, subSel, fall, faint, shot, waves, shake, flash, bg = null, retryShown;

  const pick = list => list[Math.floor(Math.random() * list.length)];

  // ---------- fundo: a livraria-café ----------
  // O teto preto, a parede creme com os coraçõezinhos, a estante de nichos à esquerda, a janela, a
  // parede do balcão à direita (os mesmos desenhos do SHOP), as luminárias e o carpete; os dois ficam
  // em tapetes redondos (as plataformas do estilo Pokémon), com a luz de cima.
  const FLOOR_Y = 112;
  function background() {
    const A = Art, T = Art.tones, { pick, vnoise, bay } = Art, h01 = Art.hash;
    const S = A.surface(W, H);
    const CREAMS = T(['#C8B488', '#D8C69C', '#E4D4AC', '#EEE0BC', '#F6EACC', '#FCF4DE']);
    const CARPET = T(['#24252D', '#2B2C35', '#33343E', '#3B3C46', '#444550', '#4E4F5A']);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let c;
      if (y < 13) c = pick(T(['#0E0C12', '#16141A', '#1E1C24', '#28262E']), 0.4 + (vnoise(x, y, 8, 700) - 0.5) * 0.2 - (y === 12 ? 0.3 : 0), x, y);
      else if (y < 16) c = pick(T(['#C8C6C0', '#E6E4DE', '#FAF8F2']), y === 13 ? 0.95 : y === 14 ? 0.6 : 0.3, x, y);
      else if (y < FLOOR_Y - 3) {
        let t = 0.55 + (vnoise(x, y, 6, 701) - 0.5) * 0.08 - (y - 16) * 0.002;
        for (const lx of [205, 452]) { const d = Math.hypot((x - lx) / 70, (y - 64) / 40); if (d < 1) t += (1 - d) * 0.2; }
        c = pick(CREAMS, t, x, y);
      } else if (y < FLOOR_Y) c = pick(CREAMS, y === FLOOR_Y - 3 ? 0.25 : 0.1, x, y);
      else {
        // o carpete, mais claro perto da parede (a luz das luminárias) e escurecendo para a frente
        const tx = Math.floor(x / 48), ty = Math.floor((y - FLOOR_Y) / 26), alt = (tx + ty) % 2;
        let t = 0.5 - (y - FLOOR_Y) / (H - FLOOR_Y) * 0.25 + (alt ? 0.03 : -0.02) + (h01(x, y, 702) - 0.5) * 0.16;
        if (alt ? (x + y * 2) % 5 === 0 : (x * 2 + y) % 5 === 0) t += 0.06;
        c = pick(CARPET, t, x, y);
      }
      S.put(x, y, c);
    }
    for (let x = 0; x < W; x++) for (let y = FLOOR_Y; y < FLOOR_Y + 5; y++) S.mul(x, y, '#7A7480', (1 - (y - FLOOR_Y) / 5) * 0.7);
    // os coraçõezinhos pintados na parede
    for (let k = 0; k < 14; k++) {
      const hx = 158 + Math.floor(h01(k, 1, 703) * 120), hy = 24 + Math.floor(h01(k, 2, 703) * 70);
      for (const [dx, dy] of [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) S.put(hx + dx, hy + dy, '#7A6E5C');
    }
    // a estante de nichos, a janela, o mural e a parede do balcão (os desenhos do SHOP)
    const P = Scenery.props, blit = (a, x, y) => S.blit(a.spr, x, y);
    blit(P.cubeShelf.art({ w: 120 }), 0, 16);
    for (let y = 94; y < FLOOR_Y; y++) for (let x = 0; x < 150; x++) S.put(x, y, pick(T(['#C8C6C0', '#DEDCD6', '#F2F0EA']), y === 94 ? 0.9 : 0.5 - (y - 94) * 0.02, x, y));
    blit(P.shopWindow.art(), 176, 34);
    blit(P.noticeBoard.art(), 226, 40);
    blit(P.counterWall.art(), 300, 26);
    for (let y = 96; y < FLOOR_Y; y++) for (let x = 300; x < 450; x++) S.put(x, y, pick(T(['#1E1C24', '#34323C', '#4A4852']), y === 96 ? 0.9 : 0.3, x, y));
    // os tapetes redondos (plataformas), com a borda dourada e a luz de cima
    const rug = (cx, cy, rx, ry) => {
      for (let y = Math.floor(cy - ry - 3); y <= cy + ry + 3; y++) for (let x = Math.floor(cx - rx - 3); x <= cx + rx + 3; x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, d = Math.hypot(nx, ny);
        if (d > 1.04) {
          // a sombra do tapete no carpete, embaixo e à direita
          const ds = Math.hypot((x + 0.5 - cx - 3) / rx, (y + 0.5 - cy - 3) / ry);
          if (ds <= 1.02) S.mul(x, y, '#6A6474', 0.7);
          continue;
        }
        let c;
        if (d > 0.92) c = pick(T(['#5A4218', '#8A6A2A', '#C9A24A', '#E2C068']), 0.75 - ny * 0.3 - nx * 0.15 - (d > 0.99 ? 0.4 : 0), x, y);
        else if (d > 0.86) c = pick(T(['#3A121C', '#4A1A24', '#62202E']), 0.5 - ny * 0.2, x, y);
        else {
          let t = 0.45 - ny * 0.18 - nx * 0.08 + (vnoise(x, y, 3, 704) - 0.5) * 0.1;
          // o desenho do tapete: um losango e os anéis
          const m = Math.abs(Math.abs(nx) * 1.6 + Math.abs(ny) * 1.6 - 0.75);
          if (m < 0.06) t += 0.25;
          if (Math.abs(d - 0.6) < 0.025) t += 0.2;
          c = pick(T(['#2E0E16', '#46141F', '#5E1C2A', '#7A2A3A', '#943A48', '#B05462']), t, x, y);
        }
        S.put(x, y, c);
      }
    };
    rug(ENEMY.x * K, ENEMY.y * K, 96, 17);
    rug(PLAYER.x * K + 15, PLAYER.y * K + 1, 96, 17);
    const cv = S.canvas();
    // as luminárias geométricas penduradas (o mesmo desenho do SHOP, desenhado no fundo)
    const prev = Gfx.target(cv.cx);
    for (const [lx, ly] of [[205, 40], [452, 34]]) Scenery.props.geoLamp.fxNew(cv.cx, { x: lx / K, y: (ly + 6) / K }, { t: 0 });
    Gfx.target(prev);
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
      Gfx.ctx.drawImage(Items.mini('bullet', on), bx - 1, by - 1);
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
      // o revólver velho na mão direita (o cano de ex + 39 a ex + 48, na altura ey + 60)
      ctx.drawImage(Items.mini('revolver'), ex + 32, ey + 58);
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

  // tiro: o clarão na boca do revólver, a bala com o rastro e, no fim, o impacto (acertou: um clarão
  // em anel no vilão; errou: a faísca no canto)
  function drawShot(ctx) {
    if (!shot) return;
    const k = Math.min(1, shot.t / 0.25);
    const sx = 138, sy = 170;
    // errando, a bala passa longe e bate na parede, entre a janela e o balcão (fora das caixas)
    const tx = shot.hit ? ENEMY.x * K : 262, ty = shot.hit ? (ENEMY.y - 40) * K : 58;
    if (shot.t < 0.12) {
      const r = shot.t < 0.06 ? 4 : 3;
      Gfx.rect(sx - r, sy, r * 2 + 1, 1, '#FFE08A');
      Gfx.rect(sx, sy - r, 1, r * 2 + 1, '#FFE08A');
      Gfx.rect(sx - 1, sy - 1, 3, 3, '#FFFFFF');
      for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) Gfx.rect(sx + dx, sy + dy, 1, 1, '#F2C14E');
    }
    if (k < 1) {
      const x = sx + (tx - sx) * k, y = sy + (ty - sy) * k;
      for (let q = 4; q >= 1; q--) {
        const kk = Math.max(0, k - q * 0.035);
        ctx.globalAlpha = 0.18 * (5 - q);
        Gfx.rect(Math.round(sx + (tx - sx) * kk) - 1, Math.round(sy + (ty - sy) * kk) - 1, 2, 2, '#FFE08A');
      }
      ctx.globalAlpha = 1;
      Gfx.rect(Math.round(x) - 1, Math.round(y) - 1, 3, 3, '#FFF4DA');
      Gfx.rect(Math.round(x), Math.round(y), 1, 1, '#FFFFFF');
      return;
    }
    const after = shot.t - 0.25;
    if (shot.hit && after < 0.35) {
      // o anel de luz abrindo
      const r = 4 + after * 60;
      ctx.globalAlpha = Math.max(0, 1 - after / 0.35);
      for (let a = 0; a < 24; a++) {
        const an = a / 24 * Math.PI * 2;
        Gfx.rect(Math.round(tx + Math.cos(an) * r), Math.round(ty + Math.sin(an) * r * 0.8), 2, 2, a % 2 ? '#FFF4DA' : '#F2C14E');
      }
      ctx.globalAlpha = 1;
    } else if (!shot.hit && after < 0.2) {
      // a faísca: um asterisco que pisca
      const r = 3 + Math.round(after * 10);
      Gfx.rect(tx - r, ty, r * 2 + 1, 1, '#FFF4DA');
      Gfx.rect(tx, ty - r, 1, r * 2 + 1, '#FFF4DA');
      Gfx.rect(tx - 1, ty - 1, 3, 3, '#FFFFFF');
    }
  }

  // ondas de cheiro de fritura saindo do vilão para a esquerda, pixeladas, com o começo e o fim
  // pontilhados
  function drawWaves(ctx) {
    const k = Math.min(1, waves / 0.6), cols = ['#F2C14E', '#E8A040', '#FFE08A'];
    for (let w = 0; w < 6; w++) {
      const y0 = 88 + w * 22;
      const x0 = ENEMY.x * K - 38 - ((time * (100 + w * 12) + w * 62) % 325);
      for (let i = 0; i < 88; i += 2) {
        const x = Math.round(x0 + i), y = Math.round(y0 + Math.sin((i + time * 75) * 0.105 + w) * 5);
        const edge = Math.min(i, 88 - i) / 18;
        if (edge < 1 && ((x + y) & 1)) continue;
        ctx.globalAlpha = 0.6 * k * Math.min(1, edge + 0.3);
        Gfx.rect(x, y, 2, 1, cols[w % 3]);
        if (i % 8 === 0) Gfx.rect(x, y - 5, 1, 1, cols[(w + 1) % 3]);
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
      ctx.drawImage(bg, 0, 0);
      drawJimmy(ctx);
      drawEllen(ctx, tempted);
      if (waves > 0) drawWaves(ctx);
      drawShot(ctx);
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

    inspect: () => ({ phase, bullets, tempted, usedMounjaro, form, hp, sub, shot: shot && shot.t, waves, options: options().map(o => o.id) })
  };
})();

Game.register('battle', BattleState);
