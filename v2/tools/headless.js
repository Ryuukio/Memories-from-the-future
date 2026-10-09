// Testes no Chrome sem janela, pelo file:// (só para desenvolver; o jogo não carrega este arquivo).
// A página tools/headless.html carrega o jogo inteiro, o devtools.js e este arquivo; o que fazer vem
// depois do # do endereço, e o resultado vai para um <pre id="out"> escondido (leia com --dump-dom).
// Erros e avisos do console também vão para o resultado (errs). Assim dá para conferir a partida
// inteira e tirar prints em 1920×1080 sem o painel do navegador. Comandos (no Git Bash):
//   C="/c/Program Files/Google/Chrome/Application/chrome.exe"
//   U="file:///C:/Users/minia/Desktop/App%20dev/Memories%20from%20the%20Future/v2/tools/headless.html"
//   "$C" --headless=new --disable-gpu --user-data-dir=<pasta temporária> --force-device-scale-factor=1
//        --window-size=1920,1080 --virtual-time-budget=60000 --dump-dom "$U#drive"
//   (para um print, troque --dump-dom por --hide-scrollbars --screenshot=arquivo.png e use #shot=...)
// Depois do #:
//   drive              a partida inteira com o piloto automático (__drive), do título à tela final
//   balance            o __balance() dos 24 cenários
//   battle             os caminhos da batalha: o anel, 5 tiros errados (Try again?), o Mounjaro e o tiro
//   pw                 as 4 senhas: cada resposta aceita com variações (minúsculas, acentos, espaços,
//                      pontuação) e umas erradas, digitadas de verdade
//   jumps              cada destino do menu de teste (Ctrl+Shift+D) e depois o Ctrl+Shift+K duas vezes
//   labtalk            as conversas do laboratório (caderno, Tony, Heymans) 3 vezes cada, e a máquina
//   shot=CÓDIGO,t,n    abre uma cena, avança n falas e t segundos (para o print). CÓDIGO: um cenário
//                      (F1A1...), PRO1, PRO2, LAB1, LAB2, LAB3, SHOP, STAIRS, HALL, CHEST, MACHINE,
//                      BATTLE, SUPER, RETRY, FALL, ENDING, CARD, CARD2, TITLE, PAUSE ou DEBUG
//                      Sprites: HEADS (roupas inteiras em 2×), HEADZ:ROUPA/direção:... (só as
//                      cabeças em 4×), HEADSET:página (as cabeças com acessório, 15 por página)
//                      e POSES:ROUPA (o __poses). LABTALK:quem:vezes = a conversa do laboratório
//                      (notes, tony ou heymans) aberta na vez `vezes`. HOME = a imagem da página
//                      inicial (ver o topo de home/home.js). ITEM:n = o cartão do item do baú da fase n
(() => {
  const errs = [];
  window.addEventListener('error', e => errs.push('ERR ' + e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
  const oe = console.error, ow = console.warn;
  console.error = (...a) => { errs.push('CE ' + a.map(String).join(' ')); oe.apply(console, a); };
  console.warn = (...a) => { errs.push('CW ' + a.map(String).join(' ')); ow.apply(console, a); };
  const out = txt => { const p = document.createElement('pre'); p.id = 'out'; p.textContent = txt; p.style.display = 'none'; document.body.appendChild(p); };
  const h = decodeURIComponent(location.hash.slice(1));

  // batalha: avança as falas até o menu (ou o Try again?) e escolhe uma opção pelo id
  const B = () => BattleState.inspect();
  const toMenu = () => { for (let i = 0; i < 80 && B().phase !== 'menu' && B().phase !== 'retry' && Game.name === 'battle'; i++) { __tap('Space'); __run(0.3); } };
  const choose = id => {
    toMenu();
    if (B().phase !== 'menu') return;
    for (let k = 0; k < B().options.indexOf(id); k++) __tap('ArrowDown');
    __tap('Space');
    __run(0.2);
  };

  // o laboratório da parte 3 (Flow.labWalk) já depois das falas do lab3
  const LAB_SPOTS = { notes: [110, 200], tony: [100, 140], heymans: [370, 147] };   // perto de cada um (coordenadas novas)
  const untilFree = () => { for (let i = 0; i < 200 && Dialog.isBlocking(); i++) { __tap('Space'); __run(0.1); } };
  function labWalk() {
    Game.go('title', {}, { instant: true }); __run(0.1);
    Flow.labWalk(); __run(1);
    untilFree();
  }

  function open(code) {
    for (const st of GAME_CONFIG.stages) {
      Flow.memory = st.id - 1;
      const rooms = Flow.rooms(st.id);
      for (let r = 0; r < rooms.length; r++) {
        const i = rooms[r].indexOf(code);
        if (i >= 0) { __open(rooms[r], i, r, st.id); return; }
      }
    }
    const P = GAME_CONFIG.texts.prologue;
    const story = (codes, o) => Game.go('stealth', Object.assign({ kind: 'story', stage: 0, codes, player: false, hud: false }, o), { instant: true });
    if (code === 'PRO1') story(['PRO1'], { script: P.fastfood });
    else if (code === 'PRO2') story(['PRO2'], { script: P.apartment });
    else if (code === 'LAB1') story(['LAB'], { cast: { ellen1: true, ellen2: false, tony: true, heymans: false }, setup: f => { f('machine').on = 0; }, script: P.lab1 });
    else if (code === 'LAB2') story(['LAB'], { cast: { ellen1: false, ellen2: true, tony: true, heymans: true }, setup: f => { f('machine').on = 1; } });
    else if (code === 'LAB3') story(['LAB'], { player: true, cast: { ellen1: false, ellen2: false, tony: true, heymans: true }, setup: f => { f('machine').on = 2; } });
    else if (code === 'SHOP') { Flow.memory = 4; Game.go('stealth', Flow.shopParams({ script: GAME_CONFIG.texts.shop, then: () => {} }), { instant: true }); }
    else if (code === 'STAIRS') { Flow.memory = 5; Flow.afterBattle(); }
    else if (code === 'HALL') Game.go('stealth', { stage: 2, kind: 'hall', codes: ['HALL'], nextRoom: 1 }, { instant: true });
    else if (code === 'CHEST') Game.go('stealth', { stage: 3, kind: 'chest', codes: ['CHEST'] }, { instant: true });
    else if (code === 'MACHINE') Game.go('anomaly', { stage: 3 }, { instant: true });
    else if (code === 'BATTLE') Game.go('battle', {}, { instant: true });
    else if (code === 'ENDING') Game.go('ending', {}, { instant: true });
    else if (code === 'CARD') Game.go('card', { text: GAME_CONFIG.texts.stageCard.replace('{n}', 4).replace('{title}', GAME_CONFIG.stages[3].title), seconds: 99 }, { instant: true });
    else if (code === 'CARD2') Game.go('card', { text: P.card1, italic: true, seconds: 99 }, { instant: true });
    else if (code === 'TITLE') Game.go('title', {}, { instant: true });
    else if (code === 'SUPER' || code === 'RETRY' || code === 'FALL') {
      Game.go('battle', {}, { instant: true });
      __run(2);
      if (code === 'RETRY') { for (let k = 0; k < 5; k++) choose('shoot'); toMenu(); return; }
      choose('item'); choose('mounjaro'); toMenu();
      if (code === 'FALL') { choose('shoot'); for (let i = 0; i < 40 && B().hp !== 0; i++) { __tap('Space'); __run(0.25); } __run(0.5); }
    }
    else if (code === 'PAUSE') { open('F1A1'); __run(0.5); __tap('Escape'); }
    else if (code.startsWith('ITEM:')) {
      // o cartão do item do baú da fase n (ITEM:1 ... ITEM:4), já aberto
      const n = +code.slice(5);
      Flow.memory = n - 1;
      Game.go('stealth', { stage: n, kind: 'chest', codes: ['CHEST'] }, { instant: true });
      __run(0.5); Dialog.close(); Game.skip(); __run(1.5);
    }
    else if (code === 'HOME') {
      // a imagem da página inicial (home/32bit.png): o F1 A2 inteiro, a Ellen e o Fabio escondidos
      // atrás do carrinho de sorvete e os dois do passado no banco (o mesmo enquadramento do
      // home/shot-v1.html, nas coordenadas da V1 × 1,25)
      open('F1A2');
      Debug.flags.invisible = true;
      const K = Room.K, ox = Room.SW, st = StealthState.inspect();
      __tp(ox + 112 * K, 158 * K); st.ellen.dir = 'right'; st.fabio.dir = 'right';
      __at(3.5); __run(0.6);
      window.__after = () => { st.fabio.dir = 'right'; Camera.follow(ox + Room.SW / 2, st.room.w); Dialog.close(); Game.__orig.render(Gfx.ctx); };
    }
    else if (code.startsWith('LABTALK')) {
      // o laboratório depois das falas, a Ellen perto de quem (notes, tony ou heymans) e Espaço
      // `vezes` vezes (as conversas anteriores passam inteiras; a última fica aberta para o print)
      const [, who, times] = code.split(':');
      labWalk();
      for (let k = 0; k < (+times || 1); k++) {
        if (k) untilFree();
        LAB_SPOTS[who] && __tp(...LAB_SPOTS[who]); __run(0.1);
        __tap('Space'); __run(1.5);
      }
    }
    else if (code.startsWith('HEADZ')) {
      // só as cabeças (linhas 0 a 21) em 4×, 4 por linha: HEADZ:ROUPA/direção:...
      const list = code.split(':').slice(1);
      if (!list.length) list.push('ELLEN_NOW/down', 'ELLEN_NOW/right', 'ELLEN_NOW/up', 'CUSTOMER_TEAL/right',
        'FABIO_NOW/down', 'FABIO_NOW/right', 'FABIO_NOW/up', 'CUSTOMER_GREEN/right',
        'CUSTOMER_GREEN/down', 'TONY/down', 'TONY/right', 'HEYMANS/right');
      Game.go('title', {}, { instant: true });
      window.__after = () => {
        const c = Gfx.ctx; c.imageSmoothingEnabled = false;
        Gfx.rect(0, 0, Display.W, Display.H, '#5A6A7A');
        list.forEach((it, i) => {
          const [id, dir] = it.split('/');
          c.drawImage(Chars.sprite(id, { dir }), 0, 0, Chars.W, 22, 8 + (i % 4) * 118, 2 + Math.floor(i / 4) * 89, Chars.W * 4, 88);
        });
      };
    }
    else if (code.startsWith('POSES:')) {
      // todas as poses de uma roupa (__poses)
      Game.go('title', {}, { instant: true });
      window.__after = () => __poses(code.slice(6));
    }
    else if (code.startsWith('HEADSET')) {
      // as cabeças (frente, lado, costas) em 2× das roupas com acessório na cabeça ou cabelo meio
      // a meio, 15 por página: HEADSET:página (0, 1, ...)
      const page = +(code.split(':')[1] || 0);
      const ids = Object.keys(CHARACTERS).filter(id => (CHARACTERS[id].extras || []).length || CHARACTERS[id].hair).slice(page * 15, page * 15 + 15);
      Game.go('title', {}, { instant: true });
      window.__after = () => {
        const c = Gfx.ctx; c.imageSmoothingEnabled = false;
        Gfx.rect(0, 0, Display.W, Display.H, '#5A6A7A');
        ids.forEach((id, i) => ['down', 'right', 'up'].forEach((dir, k) => {
          const x = 4 + (i % 3) * 160 + k * 52, y = 2 + Math.floor(i / 3) * 53;
          c.drawImage(Chars.sprite(id, { dir }), 0, 0, Chars.W, 22, x, y, Chars.W * 2, 44);
          if (!k) Gfx.text(id, x, y + 43, '#FFFFFF');
        }));
      };
    }
    else if (code.startsWith('HEADS')) {
      // as roupas de frente, de lado e de costas em 2× (3 por linha), para julgar a forma da cabeça;
      // HEADS:ID1:ID2... escolhe as roupas (padrão: os dois, o Tony, a Heymans e um casal genérico)
      const ids = code.split(':').slice(1);
      if (!ids.length) ids.push('ELLEN_NOW', 'FABIO_NOW', 'TONY', 'HEYMANS', 'CUSTOMER_GREEN', 'CUSTOMER_TEAL');
      Game.go('title', {}, { instant: true });
      window.__after = () => {
      const c = Gfx.ctx; c.imageSmoothingEnabled = false;
      Gfx.rect(0, 0, Display.W, Display.H, '#5A6A7A');
      ids.forEach((id, i) => ['down', 'right', 'up'].forEach((dir, k) => {
        const x = 6 + (i % 3) * 158 + k * 52, y = 4 + Math.floor(i / 3) * 132;
        c.drawImage(Chars.sprite(id, { dir }), x, y, Chars.W * 2, Chars.H * 2);
        if (!k) Gfx.text(id, x, y + 100, '#FFFFFF');
      }));
      };
    }
    else if (code === 'DEBUG') { open('F3B1'); __run(0.5); __tap('KeyD', { ctrlKey: true, shiftKey: true, key: 'D' }); }
  }

  const modes = {
    drive() {
      Game.go('title', {}, { instant: true });
      __run(1);
      Flow.newGame();
      const r1 = __drive(200), r2 = __drive(200);
      return { t: r2.t, end: Game.name, caught: r2.caught, log: r1.log.concat(r2.log) };
    },

    labtalk() {
      // as conversas do laboratório: cada uma 3 vezes (tem que voltar à primeira), quem fala vira
      // para a Ellen, a Ellen do passado escondida não conta, e depois a máquina leva à fase 1
      const log = [], said = [];
      const say = Dialog.say.bind(Dialog);
      Dialog.say = (lines, o) => { said.push([].concat(lines)[0]); return say(lines, o); };
      labWalk();
      const s = StealthState.inspect(), npc = id => s.room.npcs.find(n => n.id === id);
      ['notes', 'tony', 'heymans'].forEach(who => {
        for (let k = 0; k < 3; k++) {
          __tp(...LAB_SPOTS[who]); __run(0.1);
          said.length = 0;
          __tap('Space'); __run(0.5);
          log.push(who + ' ' + k + ': ' + (said[0] || '(nada)') + (npc(who) ? ' [vira: ' + npc(who).dir + ']' : ''));
          untilFree();
        }
      });
      log.push('escondidas: ' + s.room.npcs.filter(n => n.hidden).map(n => n.id).join(','));
      // a máquina, depois das conversas
      __tp(240, 165); __run(0.1);
      const it = s.room.interact.find(i => i.kind === 'machine');
      const r = it.rect; __tp(r.x + r.w / 2, r.y + r.h + 8); __run(0.1);
      __tap('Space');
      for (let i = 0; i < 60 && Game.name === 'stealth' && StealthState.inspect().params.kind === 'story'; i++) { __tap('Space'); __run(0.3); }
      __run(4);
      log.push('máquina: ' + Game.name + (Game.name === 'stealth' ? ' ' + StealthState.inspect().params.codes.join('+') : ''));
      // o Ctrl+Shift+K depois de conversar: vai para a fase 1
      labWalk(); __tp(...LAB_SPOTS.tony); __run(0.1); __tap('Space'); __run(0.5); untilFree();
      const skips = [];
      for (let k = 0; k < 3 && Game.name === 'stealth' && StealthState.inspect().params.kind === 'story'; k++) { __tap('KeyK', { ctrlKey: true, shiftKey: true, key: 'K' }); __run(4); skips.push(Game.name); }
      log.push('Ctrl+Shift+K: ' + skips.join(' > ') + ' ' + (Game.name === 'stealth' ? StealthState.inspect().params.codes.join('+') : ''));
      Dialog.say = say;
      return { log };
    },

    balance() {
      const b = __balance();
      return { b: Object.fromEntries(Object.entries(b).map(([k, v]) => [k, [v.scare, v.caught, v.n, v.period, v.y]])) };
    },

    battle() {
      const log = [];
      Game.go('battle', {}, { instant: true });
      __run(2);
      choose('item'); choose('ring'); toMenu();
      log.push('anel: ' + JSON.stringify({ bullets: B().bullets, tempted: B().tempted, phase: B().phase }));
      for (let k = 0; k < 5; k++) choose('shoot');
      toMenu();
      log.push('5 tiros: ' + JSON.stringify({ bullets: B().bullets, phase: B().phase }));
      __tap('Space'); __run(2); toMenu();
      log.push('try again: ' + JSON.stringify({ bullets: B().bullets, used: B().usedMounjaro, tempted: B().tempted, phase: B().phase }));
      choose('item'); choose('mounjaro'); toMenu();
      log.push('mounjaro: ' + JSON.stringify({ form: B().form, tempted: B().tempted, options: B().options }));
      choose('shoot');
      for (let i = 0; i < 80 && Game.name === 'battle'; i++) { __tap('Space'); __run(0.3); }
      log.push('fim: ' + Game.name + ' ' + (Game.name === 'stealth' ? StealthState.inspect().params.codes.join('+') : ''));
      return { log };
    },

    pw() {
      const key = (type, ch, code) => window.dispatchEvent(new KeyboardEvent('key' + type, { key: ch, code, bubbles: true }));
      const type = str => {
        for (const ch of str) {
          const code = /[a-z]/i.test(ch) ? 'Key' + ch.toUpperCase() : ch === ' ' ? 'Space' : 'Digit0';
          key('down', ch, code); __run(1 / 30); key('up', ch, code);
        }
      };
      const tryAnswer = (stage, str) => {
        __run(10);   // deixa terminar as transições da tentativa anterior
        Game.go('anomaly', { stage }, { instant: true });
        __run(6);
        type(str);
        key('down', 'Enter', 'Enter'); __run(1 / 30); key('up', 'Enter', 'Enter');
        __run(6);
        return Game.name !== 'anomaly';
      };
      // o campo aceita até 22 letras: a resposta comprida com espaço entre as letras não caberia
      const vary = a => [a, a.toLowerCase(), ' ' + a.slice(0, 1) + a.slice(1).toLowerCase() + '!', a.length * 2 - 1 <= 22 ? a.split('').join(' ') : a.slice(0, 3) + ' ' + a.slice(3), a.replace(/A/g, 'á').replace(/E/g, 'é')];
      const problems = [];
      GAME_CONFIG.stages.forEach(st => {
        st.anomaly.answers.forEach(a => vary(a).forEach(v => { if (!tryAnswer(st.id, v)) problems.push('RECUSOU ' + st.id + ' "' + v + '"'); }));
        ['tokyo', 'paris', 'xx', st.anomaly.answers[0].slice(0, -1)].forEach(v => { if (tryAnswer(st.id, v)) problems.push('ACEITOU ' + st.id + ' "' + v + '"'); });
      });
      return { problems };
    },

    jumps() {
      const key = (code, type) => window.dispatchEvent(new KeyboardEvent('key' + type, { code, key: code, bubbles: true }));
      const tick = () => { if (!Debug.update(1 / 60)) Game.__orig.update(1 / 60); Input.endTick(); };
      const press = code => { key(code, 'down'); tick(); key(code, 'up'); tick(); };
      const res = [];
      for (let i = 0; i < 48; i++) {
        Game.go('title', {}, { instant: true });
        __run(0.2);
        Debug.toggle();
        for (let k = 0; k < i; k++) press('ArrowDown');
        const before = errs.length;
        press('Space');
        if (Debug.open) { Debug.toggle(); continue; }   // opção que não sai do menu (os liga/desliga)
        __run(3);
        const g1 = Game.name + (Game.name === 'stealth' ? ':' + StealthState.inspect().params.codes.join('+') : '');
        Game.skip(); __run(3);
        const g2 = Game.name;
        Game.skip(); __run(2);
        res.push(i + ' ' + g1 + ' > ' + g2 + ' > ' + Game.name + (errs.length > before ? ' ERR' : ''));
      }
      return { res };
    }
  };

  window.addEventListener('load', () => {
    try {
      if (modes[h]) { out(JSON.stringify(Object.assign(modes[h](), { errs }), null, 1)); return; }
      if (h.startsWith('shot=')) {
        const [code, t, taps] = h.slice(5).split(',');
        open(code);
        for (let i = 0; i < (+taps || 0); i++) { __tap('Space'); __run(0.3); }
        __run(+t || 0.5);
        if (window.__after) window.__after();
        out(JSON.stringify({ code, game: Game.name, errs }));
      }
    } catch (e) {
      errs.push('EXC ' + e.message + ' ' + e.stack);
      out(JSON.stringify({ errs }));
    }
  });
})();
