// Tela da máquina do tempo (SPEC, seções 7 e 11.7): terminal retrô verde-água, com o texto
// surgindo letra por letra. Mostra a pista do álbum o tempo todo e o campo para digitar a
// resposta. A validação ignora maiúsculas, acentos, espaços e pontuação. Errou: a tela treme
// ("ANOMALY NOT RECOGNISED. LOOK AGAIN."), sem limite de tentativas. Acertou: "ANOMALY
// CONFIRMED. TIMELINE REPAIRED." (na fase 3, com a frase extra) → tela preta → próxima fase.
//
// Game.go('anomaly', { stage: 1 })
// V2: um monitor de tubo: a moldura de metal escuro com os parafusos e as luzinhas, o vidro curvo
// (mais escuro nos cantos, em degraus pontilhados), as marcas nos cantos da tela, o texto com o
// brilho do fósforo e as linhas de varredura. O texto fica no mesmo lugar.
const AnomalyState = (() => {
  const W = Display.W, H = Display.H;
  const C = { bg: '#04130F', bg2: '#062019', text: '#3FE0C0', dim: '#1E8C78', bright: '#B4FFEC', warn: '#FF6A5A', frame: '#145C4E' };
  const MAX_INPUT = 22, CPS = 70, LEFT = 30, INPUT_Y = 158;
  let stage = 1, lines = [], total = 0, shown = 0, t = 0, typedSfx = 0;
  let input = '', state = 'typing', shake = 0, msg = null, doneT = 0, bg = null;
  const R0 = 14, RAD = 14;   // a borda do vidro e o raio dos cantos

  // o monitor: a moldura, o vidro e as marcas dos cantos (pronto uma vez só)
  function monitor() {
    const S = Art.surface(W, H), T = Art.tones, { pick, vnoise } = Art;
    const BEZEL = T(['#0E1412', '#161E1C', '#1E2826', '#283432', '#34423E', '#44544E', '#586A62']);
    const GLASS = T(['#010806', '#030E0B', '#05150F', '#071C15', '#0A251C', '#0E2E23']);
    // distância de (x, y) para dentro do vidro (negativa = fora), com os cantos arredondados
    const inside = (x, y) => {
      const cx = Math.max(R0 + RAD, Math.min(W - R0 - RAD, x + 0.5)), cy = Math.max(R0 + RAD, Math.min(H - R0 - RAD, y + 0.5));
      return RAD - Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = inside(x, y);
      let c;
      if (d >= 0) {
        // o vidro: mais claro no meio, os cantos escurecendo (a curva do tubo)
        const v = Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2));
        c = pick(GLASS, 0.75 - v * v * 0.55 + (vnoise(x, y, 30, 950) - 0.5) * 0.06, x, y);
        if (d < 1.5) c = GLASS[0];
      } else {
        // a moldura: chanfro claro em cima e à esquerda da borda de fora, escuro perto do vidro
        const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
        let t = 0.45 + (vnoise(x * 0.4, y, 6, 951) - 0.5) * 0.08;
        if (edge < 2) t += x < W / 2 && y < H / 2 ? 0.3 : -0.2;
        else if (edge < 4) t += (x < y ? 0.12 : -0.06);
        if (d > -3) t = 0.08 + (d + 3) * 0.02;        // o rebaixo em volta do vidro
        else if (d > -4) t += 0.35;                    // a quina clara do rebaixo
        c = pick(BEZEL, t, x, y);
      }
      S.put(x, y, c);
    }
    // os parafusos nos cantos da moldura
    for (const [px, py] of [[6, 6], [W - 8, 6], [6, H - 8], [W - 8, H - 8]]) {
      S.ellipse(px + 1, py + 1, 2.4, 2.4, (x, y, nx, ny) => pick(BEZEL, Art.sphere(nx, ny) + 0.25, x, y));
      S.put(px, py + 1, BEZEL[0]); S.put(px + 1, py + 1, BEZEL[0]); S.put(px + 2, py + 1, BEZEL[0]);
    }
    // as marcas em L nos cantos da tela
    for (const [cx, cy, sx, sy] of [[22, 22, 1, 1], [W - 23, 22, -1, 1], [22, H - 23, 1, -1], [W - 23, H - 23, -1, -1]]) {
      for (let i = 0; i < 7; i++) { S.put(cx + i * sx, cy, C.frame); S.put(cx, cy + i * sy, C.frame); }
    }
    return S.canvas();
  }

  // sem acentos, maiúsculas, só letras e números
  const plain = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const norm = s => plain(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

  function build() {
    const m = GAME_CONFIG.texts.machine;
    const a = GAME_CONFIG.stages[stage - 1].anomaly;
    // [texto, x, y, cor, escala] (medidas da V2, 480×270)
    // o título é centralizado pela largura inteira, para não andar enquanto é digitado
    lines = [[m.title, Math.round(W / 2 - Gfx.textWidth(m.title)), 28, C.bright, 2]];
    m.body.forEach((b, i) => lines.push([b, LEFT, 65 + i * 15, C.text, 1]));
    lines.push([m.clueLabel, LEFT, 130, C.dim, 1]);
    lines.push([a.clue, LEFT + Gfx.textWidth(m.clueLabel) + 10, 130, C.bright, 1]);
    lines.push([m.inputLabel, LEFT, 158, C.dim, 1]);
    total = lines.reduce((n, l) => n + l[0].length, 0);
  }

  function submit() {
    const a = GAME_CONFIG.stages[stage - 1].anomaly;
    const answer = norm(input);
    if (!answer) return;
    if (a.answers.some(x => norm(x) === answer)) {
      success();
    } else {
      Sound.sfx('wrong');
      shake = 0.45;
      msg = { text: GAME_CONFIG.texts.machine.wrong, color: C.warn, t: 0 };
      input = '';
    }
  }

  function success() {
    const m = GAME_CONFIG.texts.machine, a = GAME_CONFIG.stages[stage - 1].anomaly;
    state = 'done';
    doneT = 0;
    Input.setTextMode(false);
    Sound.sfx('right');
    msg = { text: m.right, color: C.bright, t: 0, extra: a.extra || '' };
  }

  // o texto com o brilho do fósforo em volta (a mesma cor, bem fraca, 1 px para cada lado)
  function drawText(str, x, y, color, scale, align, ox) {
    const ctx = Gfx.ctx;
    ctx.globalAlpha = 0.22;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) Gfx.text(str, x + ox + dx, y + dy, color, { scale, align });
    ctx.globalAlpha = 1;
    Gfx.text(str, x + ox, y, color, { scale, align, shadow: '#021009' });
  }

  return {
    enter(p) {
      stage = p.stage || 1;
      build();
      shown = 0;
      t = 0;
      typedSfx = 0;
      input = '';
      state = 'typing';
      shake = 0;
      msg = null;
      Input.setTextMode(false);
      Save.write({ stage, scene: 'MACHINE', memory: Flow.memory });
      Sound.music('lab');
    },

    exit() { Input.setTextMode(false); },

    update(dt) {
      t += dt;
      shake = Math.max(0, shake - dt);
      if (msg) msg.t += dt;

      if (state === 'typing') {
        shown = Math.min(total, shown + CPS * dt);
        if (Math.floor(shown / 3) > typedSfx) { typedSfx = Math.floor(shown / 3); Sound.sfx('type'); }
        if (Input.pressed('confirm')) shown = total;
        if (shown >= total) {
          state = 'input';
          Input.setTextMode(true);
        }
        return;
      }

      if (state === 'input') {
        Input.takeTyped().forEach(ch => {
          if (ch === '\b') input = input.slice(0, -1);
          else if (input.length < MAX_INPUT) input += plain(ch).toUpperCase();
          Sound.sfx('key');
          msg = null;   // voltou a digitar: some o aviso de erro
        });
        if (Input.pressed('confirm')) submit();
        return;
      }

      // acertou: um tempo para ler e tela preta para a próxima fase
      doneT += dt;
      const wait = msg && msg.extra ? 4.5 : 3;
      if (doneT >= wait || (doneT >= 1.2 && Input.pressed('confirm'))) {
        state = 'leaving';
        Flow.anomalySolved(stage);
      }
    },

    render(ctx) {
      const ox = shake > 0 ? Math.round(Math.sin(t * 70) * 3.75 * (shake / 0.45)) : 0;
      if (!bg) bg = monitor();
      Gfx.rect(0, 0, W, H, '#050807');
      ctx.drawImage(bg, ox, 0);
      // as luzinhas da moldura: verde ligada, âmbar piscando enquanto digita, vermelha no erro
      Gfx.rect(W - 46 + ox, H - 9, 3, 2, '#5DF0A8');
      if (state === 'typing' || (state === 'input' && Math.floor(t * 3) % 2)) Gfx.rect(W - 39 + ox, H - 9, 3, 2, '#F2C14E');
      else Gfx.rect(W - 39 + ox, H - 9, 3, 2, '#3A3418');
      Gfx.rect(W - 32 + ox, H - 9, 3, 2, shake > 0 ? '#FF6A5A' : '#3A1814');

      let left = Math.floor(shown);
      for (const [str, x, y, color, scale] of lines) {
        if (left <= 0) break;
        drawText(str.slice(0, left), x, y, color, scale, 'left', ox);
        left -= str.length;
      }
      // o título pisca de leve, como um alarme
      if (state !== 'typing' && Math.floor(t * 2) % 2 === 0) {
        Gfx.rect(22 + ox, 28, 5, 18, C.warn);
        Gfx.rect(W - 27 + ox, 28, 5, 18, C.warn);
      }

      if (state !== 'typing') {
        const m = GAME_CONFIG.texts.machine;
        const ix = LEFT + Gfx.textWidth(m.inputLabel) + 10, iy = INPUT_Y;
        Gfx.rect(ix - 4 + ox, iy - 4, MAX_INPUT * 7 + 10, 17, '#082A23');
        Gfx.box(ix - 5 + ox, iy - 5, MAX_INPUT * 7 + 12, 19, C.dim);
        Gfx.rect(ix - 4 + ox, iy - 4, MAX_INPUT * 7 + 10, 1, '#0E3A30');
        drawText(input, ix, iy, C.bright, 1, 'left', ox);
        const end = ix + Gfx.textWidth(input);
        if (state === 'input' && Math.floor(t * 2.5) % 2 === 0) Gfx.rect((input ? end + 2 : ix) + ox, iy, 6, 9, C.text);
      }

      if (msg) {
        // centralizado pela largura inteira, para não andar enquanto é digitado
        const n = Math.floor(msg.t * CPS), mx = Math.round(W / 2 - Gfx.textWidth(msg.text) / 2);
        drawText(msg.text.slice(0, n), mx, 190, msg.color, 1, 'left', ox);
        if (msg.extra) {
          const n2 = Math.floor(msg.t * CPS - msg.text.length - 20);
          const ex = Math.round(W / 2 - Gfx.textWidth(msg.extra) / 2);
          if (n2 > 0) Gfx.text(msg.extra.slice(0, n2), ex + ox, 210, C.text, { italic: true, shadow: '#021009' });
        }
      }

      // linhas de varredura do monitor (só no vidro) e uma faixa mais clara descendo devagar
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let y = R0 + (Math.floor(t * 20) % 3); y < H - R0; y += 3) Gfx.rect(R0 + ox, y, W - R0 * 2, 1, '#000000');
      ctx.globalAlpha = 0.05;
      const band = R0 + ((t * 40) % (H - R0 * 2 + 30)) - 30;
      for (let y = Math.max(R0, Math.round(band)); y < Math.min(H - R0, band + 30); y++) Gfx.rect(R0 + ox, y, W - R0 * 2, 1, '#7AF0D0');
      ctx.restore();
    },

    // atalho de emergência: aceita a senha
    skip() {
      if (state === 'typing') shown = total;
      if (state === 'typing' || state === 'input') success();
    }
  };
})();

Game.register('anomaly', AnomalyState);
