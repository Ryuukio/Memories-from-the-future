// HUD das fases (Apêndice E.1): "STAGE n · dd/mm/yyyy · Título" e, à direita, MEMORY com 5 segmentos.
// `memory` vai de 0 a 5 e pode ser fracionário (animação do segmento enchendo).
const Hud = {
  H: 30,

  draw(stage, date, title, memory = 0) {
    const sh = { shadow: '#07060E' }, y = 10;
    Gfx.vgrad(0, 0, Display.W, 29, '#24203F', '#16132B');
    Gfx.rect(0, 29, Display.W, 1, '#5B4F92');

    // sem data (corredor, baú): "STAGE n · título da fase"
    let x = Gfx.text('STAGE ' + stage, 10, y, '#F2C14E', sh) + 6;
    if (date) {
      x = Gfx.text('·', x, y, '#CFC8E8', sh) + 6;
      x = Gfx.text(date, x, y, '#CFC8E8', sh) + 6;
    }
    const segX = Display.W - 10 - 5 * 12 - 4 * 5;
    let label = true;
    if (title) {
      x = Gfx.text('·', x, y, '#CFC8E8', sh) + 6;
      // título comprido (ex.: o festival de Yanai): esconde a palavra MEMORY e, se ainda não
      // couber, corta o título com reticências
      let t = title;
      const room = segX - 10 - x;
      if (Gfx.textWidth(t) > room - Gfx.textWidth('MEMORY') - 10) label = false;
      while (t.length > 3 && Gfx.textWidth(t) > room) t = t.slice(0, -4) + '...';
      Gfx.text(t, x, y, '#FFF4DA', sh);
    }

    if (label) Gfx.text('MEMORY', segX - 8, y, '#CFC8E8', { shadow: '#07060E', align: 'right' });
    for (let i = 0; i < 5; i++) {
      const sx = segX + i * 17, fill = Math.max(0, Math.min(1, memory - i));
      Gfx.rect(sx, 9, 12, 11, '#5B4F92');
      Gfx.rect(sx + 1, 10, 10, 9, '#16132B');
      if (fill > 0) {
        const fw = Math.max(1, Math.round(10 * fill));
        Gfx.rect(sx + 1, 10, fw, 9, '#F2C14E');
        Gfx.rect(sx + 1, 10, fw, 2, '#FFE08A');
      }
    }
  },

  // data de hoje, do relógio do computador (fase 5)
  today() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }
};
