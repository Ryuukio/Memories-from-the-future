// Ordem do jogo: prólogo → fases 1 a 4 → fase 5 → batalha → final (SPEC, seção 4).
// Cada fase: cartão do título → sala A → corredor → sala B → corredor → sala C → salinha do
// baú → tela da máquina → tela preta → próxima fase. As salas saem da lista de cenários de
// cada fase no config.js, em pares (A1+A2, B1+B2, C1+C2), só com os cenários que já têm
// arquivo em data/scenes. O corredor (HALL) e a salinha do baú (CHEST) também são cenários.
// Antes da fase 1, o prólogo (lanchonete → apartamento → laboratório, onde a jogadora aprende a
// andar até a máquina); depois da fase 4, a livraria-café (fase 5) → batalha → final.
// As cenas da história usam o mesmo estado do stealth (kind: 'story', ver stealth.js e story.js).
const Flow = {
  memory: 0,   // segmentos da barra de memória (0 a 5)

  rooms(stage) {
    const st = GAME_CONFIG.stages[stage - 1], out = [];
    if (!st) return out;
    for (let i = 0; i < st.scenes.length; i += 2) {
      const codes = st.scenes.slice(i, i + 2).map(s => s.code).filter(c => window.SCENES && SCENES[c]);
      if (codes.length) out.push(codes);
    }
    return out;
  },

  // sala `room` da fase, entrando pelo cenário `at`
  enterRoom(stage, room, at = 0, intro = null) {
    const rooms = this.rooms(stage);
    Game.go('stealth', { stage, kind: 'room', room, codes: rooms[room], at, intro });
  },

  // cartão do título da fase e a primeira sala (na fase 1, com a chegada ao passado)
  startStage(n) {
    const st = GAME_CONFIG.stages[n - 1];
    if (!st) { this.afterStages(); return; }
    const rooms = this.rooms(n);
    if (rooms.length) Save.write({ stage: n, scene: rooms[0][0], memory: this.memory });
    const text = GAME_CONFIG.texts.stageCard.replace('{n}', n).replace('{title}', st.title);
    Sound.music('f' + n);
    Game.go('card', {
      text,
      then: () => {
        if (!rooms.length) { Game.go('title'); return; }   // fase ainda não construída
        this.enterRoom(n, 0, 0, n === 1 ? GAME_CONFIG.texts.arrival : null);
      }
    });
  },

  // depois da fase 4: a livraria-café
  afterStages() {
    this.shop();
  },

  // ---------- prólogo (seção 11.2) ----------
  story(codes, o) {
    Game.go('stealth', Object.assign({ kind: 'story', stage: 0, codes, player: false, hud: false }, o));
  },

  prologue() {
    this.memory = 0;
    Save.write({ stage: 0, scene: 'PROLOGUE', memory: 0 });
    const P = GAME_CONFIG.texts.prologue;
    const card = (text, then) => Game.go('card', { text, italic: true, seconds: 2.6, then });
    this.story(['PRO1'], {
      music: null,
      script: P.fastfood,
      then: () => this.story(['PRO2'], {
        music: 'sad',
        script: P.apartment,
        then: () => this.lab(1, () => card(P.card1, () => this.lab(2, () => card(P.card2, () => this.labWalk()))))
      })
    });
  },

  // o laboratório: parte 1 (Ellen platinada e o Tony) e parte 2 (meio a meio, o Tony e a Heymans)
  lab(part, then) {
    const P = GAME_CONFIG.texts.prologue;
    this.story(['LAB'], {
      music: 'lab',
      cast: { ellen1: part === 1, ellen2: part === 2, tony: true, heymans: false },
      setup: find => { find('machine').on = part - 1; },
      script: part === 1 ? P.lab1 : P.lab2,
      then
    });
  },

  // parte 3: as últimas falas e a jogadora anda com a Ellen (e o Fabio atrás) até a máquina
  labWalk() {
    const P = GAME_CONFIG.texts.prologue;
    this.story(['LAB'], {
      music: 'lab',
      player: true,
      cast: { ellen1: false, ellen2: false, tony: true, heymans: true },
      setup: find => { find('machine').on = 2; },
      script: P.lab3,
      then: () => {},
      onInteract: kind => {
        if (kind !== 'machine') return;
        Dialog.say(['[shake]'].concat(P.machine, ['[flash]']), {
          onAction: (name, resume) => Story.action(name, resume),
          onDone: () => this.startStage(1)
        });
      },
      onSkip: () => this.startStage(1)
    });
  },

  // ---------- fase 5: a livraria-café, a batalha e o final (seções 6, 8, 11.8–11.10) ----------
  shopParams(o) {
    const sh = GAME_CONFIG.shop;
    return Object.assign({ kind: 'story', stage: 5, codes: ['SHOP'], player: true, hud: true, title: sh.hudTitle, date: Hud.today(), music: 'shop' }, o);
  },

  shop() {
    Save.write({ stage: 5, scene: 'SHOP', memory: this.memory });
    const sh = GAME_CONFIG.shop;
    Sound.music('shop');
    Game.go('card', {
      text: GAME_CONFIG.texts.stageCard.replace('{n}', 5).replace('{title}', sh.title),
      then: () => Game.go('stealth', this.shopParams({ script: GAME_CONFIG.texts.shop, then: () => this.battle() }))
    });
  },

  battle() {
    this.memory = 5;
    Save.write({ stage: 5, scene: 'BATTLE', memory: 5 });
    Game.go('battle');
  },

  // depois da vitória: as falas do final, a seta pisca sobre a escada e a Ellen anda até lá
  afterBattle() {
    this.memory = 5;
    Save.write({ stage: 5, scene: 'ENDING', memory: 5 });
    const st = SCENES.SHOP.stairs;
    Game.go('stealth', this.shopParams({
      music: 'ending',
      script: GAME_CONFIG.texts.ending.lines,
      then: () => {},
      marker: st.marker,
      exitZone: { x: st.zone[0], y: st.zone[1], w: st.zone[2], h: st.zone[3] },
      onExit: () => Game.go('ending'),
      onSkip: () => Game.go('ending')
    }));
  },

  // entra na sala que contém o cenário, começando por ele (continuar e modo de teste)
  startScene(code) {
    for (const st of GAME_CONFIG.stages) {
      const rooms = this.rooms(st.id);
      for (let r = 0; r < rooms.length; r++) {
        const at = rooms[r].indexOf(code);
        if (at >= 0) {
          this.enterRoom(st.id, r, at);
          return true;
        }
      }
    }
    return false;
  },

  hall(stage, nextRoom) {
    Game.go('stealth', { stage, kind: 'hall', codes: ['HALL'], nextRoom });
  },

  chestRoom(stage) {
    Game.go('stealth', { stage, kind: 'chest', codes: ['CHEST'] });
  },

  machine(stage) {
    Game.go('anomaly', { stage });
  },

  newGame() {
    Save.clear();
    this.memory = 0;
    this.prologue();
  },

  continueGame(save) {
    this.memory = save.memory || 0;
    const stage = save.stage || 1;
    if (save.scene === 'PROLOGUE') this.prologue();
    else if (save.scene === 'SHOP') this.shop();
    else if (save.scene === 'BATTLE') this.battle();
    else if (save.scene === 'ENDING') this.afterBattle();
    else if (save.scene === 'CHEST') this.chestRoom(stage);
    else if (save.scene === 'MACHINE') this.machine(stage);
    else if (!this.startScene(save.scene)) this.startStage(stage);
  },

  // a Ellen saiu pela última passagem da sala ou pela porta do corredor
  roomDone(p) {
    if (p.kind === 'hall') {
      this.enterRoom(p.stage, p.nextRoom, 0);
      return;
    }
    const rooms = this.rooms(p.stage);
    if (p.room + 1 < rooms.length) this.hall(p.stage, p.room + 1);
    else this.chestRoom(p.stage);
  },

  // o baú foi aberto e a memória subiu: tela da máquina
  chestDone(stage) {
    this.memory = Math.max(this.memory, stage);
    this.machine(stage);
  },

  // senha certa: tela preta e a próxima fase
  anomalySolved(stage) {
    this.memory = Math.max(this.memory, stage);
    if (stage >= GAME_CONFIG.stages.length) {
      Save.write({ stage: stage + 1, scene: 'SHOP', memory: this.memory });
      this.afterStages();
      return;
    }
    this.startStage(stage + 1);
  }
};
