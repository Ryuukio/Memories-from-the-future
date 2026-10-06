// Personagens montados a partir dos moldes do Apêndice E (data/sprites.js), com cache.
// Etapa 1: só a Ellen e o Fabio do presente, de lado. A etapa 2 traz frente e costas,
// o ciclo de andar de 4 quadros, as poses e as roupas de cada data (data/characters.js).
const Chars = (() => {
  const cache = {};
  const bothSides = img => ({ right: img, left: Gfx.flip(img) });

  const builders = {
    ellenNow: () => bothSides(Gfx.buildSprite(
      Gfx.compose(SPRITES.HEAD_ELLEN_SIDE, SPRITES.BODY_COAT_WALK),
      PALETTES.ELLEN_NOW)),

    // Fabio do presente: curativo (linhas 3 e 4 da cabeça viram w e W) e capuz do moletom
    fabioNow: () => {
      const head = Gfx.paintRow(Gfx.paintRow(SPRITES.HEAD_FABIO_SIDE, 3, 'w'), 4, 'W');
      const rows = Gfx.overlay(Gfx.compose(head, SPRITES.BODY_HOODIE_WALK), SPRITES.HOOD_OVERLAY);
      return bothSides(Gfx.buildSprite(rows, PALETTES.FABIO_NOW));
    }
  };

  return {
    get(name) { return cache[name] || (cache[name] = builders[name]()); }
  };
})();
