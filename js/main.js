// Início: liga os atalhos de sistema, registra os destinos do modo de teste,
// abre a tela de título e começa o loop.
(() => {
  const cfg = GAME_CONFIG;

  // o som só pode começar depois de um gesto da jogadora
  Input.onAnyKey(() => Sound.unlock());
  window.addEventListener('pointerdown', () => Sound.unlock());

  Input.hotkey('F', () => Display.toggleFullscreen());
  Input.hotkey('M', () => {
    const muted = Sound.toggleMute();
    Game.notice(muted ? cfg.notices.soundOff : cfg.notices.soundOn);
  });
  Input.hotkey(cfg.debug.menuKeys, () => Debug.toggle(), true);
  Input.hotkey(cfg.debug.skipKeys, () => Game.skip(), true);

  Debug.addJump('Go to: Title screen', () => Game.go('title'));
  Debug.addJump('Go to: Prologue', () => Flow.prologue());
  Debug.addJump('Go to: Prologue · lab (walk to the machine)', () => { Flow.memory = 0; Flow.labWalk(); });
  // para cada fase: o cartão, cada cenário que já tem arquivo em data/scenes, o corredor, o baú e a máquina
  cfg.stages.forEach(st => {
    const built = st.scenes.filter(s => window.SCENES && SCENES[s.code]);
    if (!built.length) return;
    const n = st.id;
    Debug.addJump('Go to: Stage ' + n + ' card', () => { Flow.memory = n - 1; Flow.startStage(n); });
    built.forEach(s => {
      Debug.addJump('Go to: ' + s.code + ' · ' + s.title, () => { Flow.memory = n - 1; Flow.startScene(s.code); });
    });
    Debug.addJump('Go to: Stage ' + n + ' corridor', () => { Flow.memory = n - 1; Flow.hall(n, Math.min(1, Flow.rooms(n).length - 1)); });
    Debug.addJump('Go to: Stage ' + n + ' chest', () => { Flow.memory = n - 1; Flow.chestRoom(n); });
    Debug.addJump('Go to: Stage ' + n + ' machine', () => { Flow.memory = n; Flow.machine(n); });
  });
  Debug.addJump('Go to: Stage 5 · bookshop', () => { Flow.memory = 4; Flow.shop(); });
  Debug.addJump('Go to: Battle', () => Flow.battle());
  Debug.addJump('Go to: After the battle (stairs)', () => Flow.afterBattle());
  Debug.addJump('Go to: Final screen', () => Game.go('ending'));
  Debug.addJump('Go to: Test room', () => Game.go('testroom'));

  Game.go('title', {}, { instant: true });

  Loop.start(dt => {
    if (!Debug.update(dt)) Game.update(dt);
    Input.endTick();
  }, () => {
    Game.render(Gfx.ctx);
    Debug.render(Gfx.ctx);
  });
})();
