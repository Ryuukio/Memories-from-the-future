// Cenas da história (prólogo e livraria, SPEC seções 4 e 11): as ações do roteiro e os efeitos
// por cima do cenário. O StealthState chama Story.reset ao entrar, Story.update a cada passo (também
// durante as falas) e Story.render depois de desenhar o cenário.
//
// Ações nas falas ("[nome]" ou "[nome:arg:arg]"; não aparecem na tela):
//   show:id / hide:id        mostra ou esconde um ator (NPC ou objeto com esse id no cenário)
//   pose:id:pose[:dir]       muda a pose de um ator (ex.: o Fabio desmaiando, 'lie')
//   face:id:dir[:head]       vira um ator
//   smell                    ondas de cheiro de fritura atravessando a tela
//   flicker                  as luzes piscam
//   shake                    a tela treme
//   flash                    clarão branco
//   wait[:s]                 pausa (segundos)
//   memoryFull               a barra de memória enche até 100%, com o jingle
//   villainArrives           luzes piscando, cheiro de fritura e o Big Jimmy Junk aparecendo (id 'jimmy')
// Outros nomes vão para params.actions[nome](resume, arg) do Flow (devolva true para esperar o resume).
const Story = (() => {
  let room = null, params = {};
  let smell = 0, flicker = 0, shakeT = 0, flash = 0, time = 0;
  let timers = [], mem = null;

  // cast: { id: true/false } mostra ou esconde atores ao entrar; setup(find) ajusta o resto
  // (ex.: a máquina do tempo ligada)
  function reset(r, p) {
    room = r;
    params = p;
    smell = flicker = shakeT = flash = 0;
    timers = [];
    mem = null;
    if (p.cast) Object.keys(p.cast).forEach(id => { const t = find(id); if (t) t.hidden = !p.cast[id]; });
    if (p.setup) p.setup(find);
  }

  function find(id) {
    const n = room.npcs.find(a => a.id === id);
    if (n) return n;
    const o = room.sorted.find(a => a.p && a.p.id === id);
    return o ? o.p : null;
  }

  function later(seconds, fn) { timers.push({ t: seconds, fn }); }

  function action(name, resume) {
    const [cmd, a, b, c] = name.split(':');
    const wait = s => { later(s, resume); return true; };
    const t = a ? find(a) : null;
    switch (cmd) {
      case 'show': if (t) t.hidden = false; Sound.sfx('pop'); return false;
      case 'hide': if (t) t.hidden = true; return false;
      case 'pose': if (t) { t.pose = b; if (c) t.dir = c; } return false;
      case 'face': if (t) { t.dir = b; t.head = c || null; } return false;
      case 'smell': smell = 2.6; Sound.sfx('smell'); return wait(1.6);
      case 'flicker': flicker = 1.4; Sound.sfx('flicker'); return wait(1.4);
      case 'shake': shakeT = 0.8; Sound.sfx('rumble'); return wait(0.8);
      case 'flash': flash = 1; return wait(0.35);
      case 'wait': return wait(parseFloat(a) || 0.8);
      case 'memoryFull':
        mem = { from: Flow.memory, t: 0 };
        Sound.sfx('memory');
        return wait(1.9);
      case 'villainArrives':
        flicker = 1.8;
        Sound.music('tense');
        smell = 3.2;
        Sound.sfx('flicker');
        later(0.9, () => { const j = find('jimmy'); if (j) j.hidden = false; flash = 0.8; shakeT = 0.5; Sound.sfx('smell'); Sound.sfx('rumble'); });
        return wait(2.2);
    }
    if (params.actions && params.actions[cmd]) return params.actions[cmd](resume, a) === true;
    return false;
  }

  function update(dt) {
    time += dt;
    smell = Math.max(0, smell - dt);
    flicker = Math.max(0, flicker - dt);
    shakeT = Math.max(0, shakeT - dt);
    flash = Math.max(0, flash - dt / 0.35);
    if (mem) {
      mem.t += dt;
      Flow.memory = Math.min(5, mem.from + (5 - mem.from) * Math.min(1, mem.t / 1.6));
      if (mem.t >= 1.6) mem = null;
    }
    const due = timers.filter(k => (k.t -= dt) <= 0);
    timers = timers.filter(k => k.t > 0);
    due.forEach(k => k.fn());
  }

  // ondas de cheiro de fritura: faixas onduladas amareladas que atravessam a tela da direita
  // para a esquerda (pixeladas, com pontilhado nas pontas). Medidas da V1 × 1,25
  function drawSmell(ctx) {
    const k = Math.min(1, smell / 0.6);
    const colors = ['#F2C14E', '#E8A040', '#FFE08A'];
    for (let w = 0; w < 7; w++) {
      const y0 = 50 + w * 27.5 + Math.sin(time * 1.3 + w) * 7.5;
      const speed = (70 + w * 9) * 1.25;
      const x0 = ((Display.W + 150) - ((time * speed + w * 121) % (Display.W + 300)));
      for (let i = 0; i < 112; i += 2) {
        const x = Math.round(x0 + i), y = Math.round(y0 + Math.sin((i * 0.8 + time * 60) * 0.12 + w) * 5);
        const edge = Math.min(i, 112 - i) / 25;
        if (edge < 1 && ((x + y) & 1)) continue;
        ctx.globalAlpha = 0.55 * k;
        Gfx.rect(x, y, 2, 1, colors[w % 3]);
        if (i % 6 === 0) Gfx.rect(x, y - 4, 1, 1, colors[(w + 1) % 3]);
      }
    }
    ctx.globalAlpha = 1;
  }

  function render(ctx) {
    if (smell > 0) drawSmell(ctx);
    if (flicker > 0) {
      const on = Math.floor(time * 14) % 3 !== 0 && Math.sin(time * 37) > -0.3;
      ctx.globalAlpha = on ? 0.15 : 0.7;
      Gfx.rect(0, Hud.H, Display.W, Display.H - Hud.H, '#07060E');
      ctx.globalAlpha = 1;
    }
    if (flash > 0) {
      ctx.globalAlpha = flash;
      Gfx.rect(0, 0, Display.W, Display.H, '#FFFFFF');
      ctx.globalAlpha = 1;
    }
  }

  // tremor da tela: deslocamento do desenho
  function shake() {
    if (shakeT <= 0) return [0, 0];
    return [Math.round(Math.sin(time * 70) * 2.5), Math.round(Math.cos(time * 53) * 1.9)];
  }

  // seta dourada piscando, apontando para baixo, em cima de um ponto do mundo (coordenadas novas; o
  // stealth chama com o ctx já deslocado para o mundo): o ouro com a luz da esquerda e o contorno
  let arrow = null;
  function arrowImg() {
    if (arrow) return arrow;
    const rows = ['....#####....', '....#####....', '....#####....', '....#####....', '#############', '.###########.', '..#########..', '...#######...', '....#####....', '.....###.....', '......#......'];
    const s = Art.surface(15, 13), G = Art.tones(['#8A5A12', '#B8862A', '#E2B040', '#F2C14E', '#FFE08A', '#FFF6D0']);
    rows.forEach((r, j) => {
      for (let i = 0; i < r.length; i++) {
        if (r[i] !== '#') continue;
        const left = r.indexOf('#'), right = r.lastIndexOf('#');
        let t = 0.8 - (i - left) / Math.max(1, right - left) * 0.55 - j * 0.02;
        if (i === left) t += 0.2;
        s.put(i + 1, j + 1, Art.pick(G, t, i, j));
      }
    });
    s.outline(0.4);
    return (arrow = s.canvas());
  }
  function marker(ctx, x, y, t) {
    if (Math.floor(t * 3) % 2) return;
    const img = arrowImg();
    ctx.drawImage(img, Math.round(x) - 7, Math.round(y) - 24 + Math.round(Math.sin(t * 6) * 2.5));
  }

  // o caderno do Dr King aberto, em close (no laboratório, enquanto a Ellen lê): capa de couro,
  // páginas amareladas com a letra corrida em rabiscos, o diagrama do laço do tempo, a onda e as
  // perguntinhas na margem. a = 0 a 1 (aparecendo); desenhado por cima do cenário, sob a caixa de fala.
  let book = null;
  const BOOK_W = 176, BOOK_H = 102, INK = '#2E2A48', RED = '#A8342E';
  function bookImg() {
    if (book) return book;
    const A = Art, T = A.tones, h01 = A.hash;
    const LEATHER = T(['#2A160C', '#3A2014', '#4E2C1A', '#643A22', '#7A4A2C', '#905C38']);
    const PAPER = T(['#A8916A', '#BCA67E', '#CEBA92', '#DCCAA4', '#E8DAB6', '#F2E8CA', '#F8F2DC']);
    const s = A.surface(BOOK_W, BOOK_H);
    // capa (um pouco maior que as páginas), cantos arredondados
    s.fill(0, 2, BOOK_W, BOOK_H - 2, (x, y) => {
      const cx = Math.min(x, BOOK_W - 1 - x), cy = Math.min(y - 2, BOOK_H - 1 - y);
      if (cx + cy < 3) return null;
      let t = 0.55 + (A.vnoise(x, y, 4, 470) - 0.5) * 0.35 - (y - 2) / BOOK_H * 0.2;
      if (cx === 0 || cy === 0) t -= 0.25;
      if (cx === 1 || cy === 1) t += 0.12;
      if (h01(x, y, 471) < 0.04) t += 0.2;
      return A.pick(LEATHER, t, x, y);
    });
    // as duas páginas: mais escuras perto da lombada e nas bordas, manchas de tempo
    const pages = [[7, 87], [89, 169]];
    pages.forEach(([x0, x1], side) => s.fill(x0, 5, x1 - x0, BOOK_H - 11, (x, y) => {
      const g = side ? (x - x0) / (x1 - x0) : (x1 - 1 - x) / (x1 - x0);   // 0 na lombada
      let t = 0.78 - Math.max(0, 0.18 - g) * 2.2 - (y > BOOK_H - 9 ? 0.12 : 0) - (y < 7 ? 0.08 : 0);
      t += (A.vnoise(x, y, 9, 472 + side) - 0.5) * 0.18;
      if (A.vnoise(x, y, 5, 474) > 0.82) t -= 0.12;   // manchas
      // a marca redonda de uma xícara de café na página da esquerda
      const r = Math.hypot(x - 66, (y - 74) * 1.1);
      if (r > 9 && r < 11 && h01(x, y, 475) < 0.75) t -= 0.22;
      return A.pick(PAPER, t, x, y);
    }));
    // lombada e a sombra das folhas por baixo (borda de baixo)
    for (let y = 5; y < BOOK_H - 6; y++) { s.put(87, y, '#6A5638'); s.put(88, y, '#4A3A26'); }
    for (let x = 7; x < 169; x++) if (x < 87 || x > 88) { s.put(x, BOOK_H - 6, '#C9B48C'); s.put(x, BOOK_H - 5, '#A8916A'); }
    // pauta clarinha
    for (const [x0, x1] of pages) for (let y = 16; y < BOOK_H - 10; y += 7) for (let x = x0 + 3; x < x1 - 3; x++) s.put(x, y, '#9AA4B8', 0.28);
    // a letra corrida: "palavras" em ziguezague sobre a pauta (rabiscos, não texto)
    const scribble = (x0, x1, y, seed) => {
      let x = x0;
      while (x < x1 - 4) {
        const len = 4 + Math.floor(h01(x, y, seed) * 11);
        let py = y - 2;
        for (let i = 0; i < len && x + i < x1; i++) {
          const ny = y - 1 - Math.floor(h01(x + i, y, seed + 1) * 3.2);
          s.line(x + i - 1, py, x + i, ny, INK, 0.85);
          if (h01(x + i, y, seed + 2) < 0.08) s.put(x + i, y - 5, INK, 0.8);   // as hastes (l, t, d)
          py = ny;
        }
        x += len + 2 + Math.floor(h01(x, y, seed + 3) * 3);
      }
    };
    for (let y = 16, k = 0; y < BOOK_H - 10; y += 7, k++) scribble(12, k === 9 ? 50 : 84, y, 480 + k * 7);
    // página da direita: o laço do tempo (círculo com seta), a onda e umas linhas embaixo
    s.ellipse(112, 31, 13, 11, (x, y, nx, ny) => { const d = nx * nx + ny * ny; return d > 0.78 ? INK : null; });
    s.line(122, 21, 126, 21, INK); s.line(122, 21, 123, 25, INK);   // ponta da seta
    s.put(112, 31, RED); s.put(113, 31, RED); s.put(112, 32, RED); s.put(113, 32, RED);   // "agora"
    for (let x = 132; x < 164; x++) s.put(x, Math.round(31 + Math.sin((x - 132) / 32 * Math.PI * 3) * 5), INK, 0.9);
    s.line(132, 38, 164, 38, INK, 0.5); s.line(132, 24, 132, 38, INK, 0.5);
    for (let y = 65, k = 0; y < BOOK_H - 10; y += 7, k++) scribble(94, 164, y, 520 + k * 5);
    // fita marcadora vermelha pendurada da lombada
    for (let y = 4; y < BOOK_H + 0; y++) { const x = 90 + Math.round(Math.sin(y / 9) * 1.2); s.put(x, y, '#9A2A30'); s.put(x + 1, y, '#C8424A'); }
    s.outline(0.4);
    return (book = s.canvas());
  }
  function notebook(ctx, a) {
    if (a <= 0) return;
    const x = Math.round((Display.W - BOOK_W) / 2), y = Math.round(66 + (1 - a) * 10);
    ctx.save();
    ctx.globalAlpha = 0.4 * a;
    Gfx.rect(0, 30, Display.W, Display.H - 30, '#07060E');
    ctx.globalAlpha = a;
    ctx.drawImage(bookImg(), x, y);
    // as perguntinhas na margem e a conta do laço, na letra do jogo
    if (a > 0.6) {
      Gfx.text('t -> -t ?', x + 100, y + 46, INK);
      Gfx.text('?', x + 10, y + 6, RED);
      Gfx.text('why?', x + 54, y + 73, RED);
      Gfx.text('?', x + 163, y + 46, RED);
    }
    ctx.restore();
  }

  return { reset, action, update, render, shake, marker, notebook, find: id => find(id) };
})();
