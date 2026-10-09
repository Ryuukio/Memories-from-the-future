// Tela da máquina do tempo (SPEC, seções 7 e 11.7): terminal retrô verde-água, com o texto
// surgindo letra por letra. Mostra a pista do álbum o tempo todo e o campo para digitar a
// resposta. A validação ignora maiúsculas, acentos, espaços e pontuação. Errou: a tela treme
// ("ANOMALY NOT RECOGNISED. LOOK AGAIN."), sem limite de tentativas. Acertou: "ANOMALY
// CONFIRMED. TIMELINE REPAIRED." (na fase 3, com a frase extra) → tela preta → próxima fase.
//
// Game.go('anomaly', { stage: 1 })
const AnomalyState = (() => {
  const W = Display.W, H = Display.H;
  const C = { bg: '#04130F', bg2: '#062019', text: '#3FE0C0', dim: '#1E8C78', bright: '#B4FFEC', warn: '#FF6A5A', frame: '#145C4E' };
  const MAX_INPUT = 22, CPS = 70, LEFT = 30, INPUT_Y = 158;
  let stage = 1, lines = [], total = 0, shown = 0, t = 0, typedSfx = 0;
  let input = '', state = 'typing', shake = 0, msg = null, doneT = 0;

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

  function drawText(str, x, y, color, scale, align, ox) {
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
      Gfx.vgrad(0, 0, W, H, C.bg2, C.bg);
      // moldura do terminal
      Gfx.box(10 + ox, 10, W - 20, H - 20, C.frame);
      Gfx.box(13 + ox, 13, W - 26, H - 26, '#0B3A31');

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
        const end = Gfx.text(input, ix + ox, iy, C.bright, { shadow: '#021009' });
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

      // linhas de varredura do monitor
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let y = (Math.floor(t * 20) % 3); y < H; y += 3) Gfx.rect(0, y, W, 1, '#000000');
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
