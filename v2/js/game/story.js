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

  // seta dourada piscando, apontando para baixo, em cima de um ponto do mundo (desenho da V1: o
  // stealth chama dentro da camada velha, em coordenadas velhas)
  function marker(ctx, x, y, t) {
    if (Math.floor(t * 3) % 2) return;
    const bx = Math.round(x) - 4, by = Math.round(y) - 12 + Math.round(Math.sin(t * 6) * 2);
    const rows = ['#########', '.#######.', '..#####..', '...###...', '....#....'];
    rows.forEach((r, j) => {
      for (let i = 0; i < r.length; i++) if (r[i] === '#') Gfx.rect(bx + i, by + j, 1, 1, j === 0 ? '#FFE08A' : '#F2C14E');
    });
    Gfx.rect(bx + 2, by - 4, 5, 4, '#F2C14E');
    Gfx.rect(bx + 2, by - 4, 5, 1, '#FFE08A');
  }

  return { reset, action, update, render, shake, marker, find: id => find(id) };
})();
