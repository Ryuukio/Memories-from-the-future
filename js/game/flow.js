// Ordem do jogo: prólogo → fases 1 a 4 (cenários, baú, máquina) → fase 5 → batalha → final.
// Etapa 1: só existe a sala de teste. As etapas 3 e 5 preenchem este fluxo.
const Flow = {
  newGame() {
    Save.clear();
    Game.go('testroom');   // etapa 5: começar pelo prólogo
  },

  continueGame(save) {
    Game.go('testroom');   // etapa 3: voltar ao começo do cenário salvo (save.stage, save.scene)
  }
};
