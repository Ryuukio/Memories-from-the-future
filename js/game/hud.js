// HUD das fases (Apêndice E.1): "STAGE n · dd/mm/yyyy · Título" e, à direita, MEMORY com 5 segmentos.
// `memory` vai de 0 a 5 e pode ser fracionário (animação do segmento enchendo).
const Hud = {
  H: 24,

  draw(stage, date, title, memory = 0) {
    const sh = { shadow: '#07060E' }, y = 8;
    Gfx.vgrad(0, 0, Display.W, 23, '#24203F', '#16132B');
    Gfx.rect(0, 23, Display.W, 1, '#5B4F92');

    let x = Gfx.text('STAGE ' + stage, 8, y, '#F2C14E', sh) + 5;
    x = Gfx.text('·', x, y, '#CFC8E8', sh) + 5;
    x = Gfx.text(date, x, y, '#CFC8E8', sh) + 5;
    x = Gfx.text('·', x, y, '#CFC8E8', sh) + 5;
    Gfx.text(title, x, y, '#FFF4DA', sh);

    const segX = Display.W - 8 - 5 * 10 - 4 * 4;
    Gfx.text('MEMORY', segX - 6, y, '#CFC8E8', { shadow: '#07060E', align: 'right' });
    for (let i = 0; i < 5; i++) {
      const sx = segX + i * 14, fill = Math.max(0, Math.min(1, memory - i));
      Gfx.rect(sx, 7, 10, 9, '#5B4F92');
      Gfx.rect(sx + 1, 8, 8, 7, '#16132B');
      if (fill > 0) {
        const fw = Math.max(1, Math.round(8 * fill));
        Gfx.rect(sx + 1, 8, fw, 7, '#F2C14E');
        Gfx.rect(sx + 1, 8, fw, 2, '#FFE08A');
      }
    }
  },

  // data de hoje, do relógio do computador (fase 5)
  today() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }
};
