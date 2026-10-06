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
