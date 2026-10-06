// Loop de passo fixo: 60 atualizações por segundo, independente da taxa de quadros da tela.
const Loop = (() => {
  const STEP = 1 / 60;
  const L = { STEP, fps: 0, time: 0 };
  let last = 0, acc = 0, frames = 0, fpsClock = 0, errors = 0;

  L.start = (update, render) => {
    const frame = ms => {
      requestAnimationFrame(frame);
      const now = ms / 1000;
      let dt = last ? now - last : STEP;
      last = now;
      if (dt > 0.25) dt = 0.25;                     // voltou de outra aba: não tenta recuperar tudo
      if (Math.abs(dt - STEP) < 0.002) dt = STEP;   // tira o tremido do vsync em telas de 60 Hz
      acc += dt;
      try {
        let n = 0;
        while (acc >= STEP && n < 10) {
          update(STEP);
          L.time += STEP;
          acc -= STEP;
          n++;
        }
        if (n >= 10) acc = 0;
        render();
      } catch (e) {
        // um erro não pode congelar o jogo durante a partida: registra e segue
        if (errors++ < 5) console.error(e);
      }
      frames++;
      fpsClock += dt;
      if (fpsClock >= 0.5) {
        L.fps = Math.round(frames / fpsClock);
        frames = 0;
        fpsClock = 0;
      }
    };
    requestAnimationFrame(frame);
  };

  return L;
})();
