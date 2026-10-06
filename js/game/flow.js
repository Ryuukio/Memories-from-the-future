// Ordem do jogo: prólogo → fases 1 a 4 (salas A, B, C, baú, máquina) → fase 5 → batalha → final.
// As salas saem da lista de cenários de cada fase no config.js, em pares (A1+A2, B1+B2, C1+C2),
// só com os cenários que já têm arquivo em data/scenes.
// Etapa 2: só existe o F1 A1. A etapa 3 traz os corredores, o baú, a máquina e as transições;
// a etapa 5, o prólogo.
const Flow = {
  memory: 0,   // segmentos da barra de memória (0 a 5)

  rooms(stage) {
    const st = GAME_CONFIG.stages[stage - 1], out = [];
    for (let i = 0; i < st.scenes.length; i += 2) {
      const codes = st.scenes.slice(i, i + 2).map(s => s.code).filter(c => window.SCENES && SCENES[c]);
      if (codes.length) out.push(codes);
    }
    return out;
  },

  // entra na sala que contém o cenário, começando por ele
  startScene(code) {
    for (const st of GAME_CONFIG.stages) {
      const rooms = this.rooms(st.id);
      for (let r = 0; r < rooms.length; r++) {
        const at = rooms[r].indexOf(code);
        if (at >= 0) {
          Game.go('stealth', { stage: st.id, room: r, codes: rooms[r], at });
          return true;
        }
      }
    }
    return false;
  },

  newGame() {
    Save.clear();
    this.memory = 0;
    this.startScene('F1A1');   // etapa 5: começar pelo prólogo
  },

  continueGame(save) {
    this.memory = save.memory || 0;
    if (!this.startScene(save.scene)) this.startScene('F1A1');
  },

  // a Ellen saiu pela última passagem da sala
  roomDone(p) {
    const rooms = this.rooms(p.stage);
    if (p.room + 1 < rooms.length) {
      Game.go('stealth', { stage: p.stage, room: p.room + 1, codes: rooms[p.room + 1], at: 0 });
      return;
    }
    // etapa 3: corredor, baú e tela da máquina. Por enquanto, recomeça a primeira sala da fase.
    Game.go('stealth', { stage: p.stage, room: 0, codes: rooms[0], at: 0 });
  }
};
