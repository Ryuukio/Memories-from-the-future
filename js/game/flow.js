// Ordem do jogo: prólogo → fases 1 a 4 → fase 5 → batalha → final (SPEC, seção 4).
// Cada fase: cartão do título → sala A → corredor → sala B → corredor → sala C → salinha do
// baú → tela da máquina → tela preta → próxima fase. As salas saem da lista de cenários de
// cada fase no config.js, em pares (A1+A2, B1+B2, C1+C2), só com os cenários que já têm
// arquivo em data/scenes. O corredor (HALL) e a salinha do baú (CHEST) também são cenários.
// Etapa 5: o prólogo antes da fase 1 e a livraria-café depois da fase 4.
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
    Game.go('card', {
      text,
      then: () => {
        if (!rooms.length) { Game.go('title'); return; }   // fase ainda não construída
        this.enterRoom(n, 0, 0, n === 1 ? GAME_CONFIG.texts.arrival : null);
      }
    });
  },

  // depois da fase 4: a livraria-café (etapa 5). Enquanto ela não existe, volta ao título.
  afterStages() {
    Game.go(window.ShopState ? 'shop' : 'title');
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
    this.startStage(1);   // etapa 5: começar pelo prólogo
  },

  continueGame(save) {
    this.memory = save.memory || 0;
    const stage = save.stage || 1;
    if (save.scene === 'CHEST') this.chestRoom(stage);
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
