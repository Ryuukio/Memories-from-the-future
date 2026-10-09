// Itens dos baús (SPEC, seção 7): desenhados em código e contornados no estilo do Apêndice E
// (contorno colorido, nunca preto puro). Usados no cartão do baú e, na etapa 5, na batalha.
// Items.sprite('revolver') → canvas com o item já contornado.
const Items = (() => {
  const cache = {};

  const DRAW = {
    // velho e enferrujado: cano, tambor, cão e cabo de madeira inclinado
    revolver(R) {
      R(9, 3, 13, 3, '#8E949E');
      R(9, 3, 13, 1, '#C4C9D2');
      R(9, 5, 13, 1, '#5E6470');
      R(20, 2, 1, 1, '#5E6470');
      R(21, 3, 1, 3, '#3A3E48');
      R(4, 2, 6, 6, '#6E7480');
      R(4, 2, 6, 1, '#A4AAB4');
      R(6, 3, 5, 4, '#9AA0AA');
      R(6, 3, 5, 1, '#D0D4DC');
      R(7, 4, 1, 3, '#5E6470');
      R(9, 4, 1, 3, '#5E6470');
      R(3, 1, 2, 2, '#5E6470');
      R(2, 0, 2, 1, '#5E6470');
      R(6, 8, 5, 1, '#5E6470');
      R(10, 7, 1, 1, '#5E6470');
      R(8, 7, 1, 1, '#3A3E48');
      for (let k = 0; k < 6; k++) R(4 - Math.floor(k / 2), 7 + k, 4, 1, k % 2 ? '#7A4A22' : '#8E5A2C');
      R(2, 12, 4, 1, '#5E3418');
      R(4, 8, 1, 3, '#B07A44');
      // ferrugem
      R(14, 4, 1, 1, '#A0603A');
      R(17, 3, 1, 1, '#A0603A');
      R(12, 5, 2, 1, '#8A5434');
      R(5, 5, 1, 1, '#A0603A');
    },
    // caneta de injeção genérica: corpo branco, faixa colorida, visor e botão
    mounjaro(R) {
      R(2, 2, 18, 6, '#E8ECF2');
      R(2, 2, 18, 1, '#FFFFFF');
      R(2, 7, 18, 1, '#B4BAC6');
      R(7, 2, 6, 6, '#8A6AC8');
      R(7, 2, 6, 1, '#A88AE0');
      R(7, 7, 6, 1, '#6A50A8');
      R(14, 4, 3, 2, '#9ED8E8');
      R(14, 4, 3, 1, '#D8F2FA');
      R(20, 3, 2, 4, '#6A50A8');
      R(20, 3, 2, 1, '#8A6AC8');
      R(0, 3, 2, 4, '#B4BAC6');
      R(0, 3, 2, 1, '#DCE0E8');
    },
    // cinco balas em pé
    ammo(R) {
      for (let i = 0; i < 5; i++) {
        const x = i * 4;
        R(x, 5, 3, 7, '#D8A84A');
        R(x, 5, 1, 7, '#F2D27A');
        R(x + 2, 5, 1, 7, '#B08430');
        R(x, 11, 3, 1, '#A07828');
        R(x, 2, 3, 3, '#B8683A');
        R(x + 1, 1, 1, 1, '#B8683A');
        R(x, 2, 1, 2, '#D88A5A');
      }
    },
    // anel de platina com diamante
    ring(R) {
      const band = [[3, 6, 6], [2, 7, 1], [9, 7, 1], [1, 8, 1], [10, 8, 1], [1, 9, 1], [10, 9, 1], [1, 10, 1], [10, 10, 1], [2, 11, 1], [9, 11, 1], [3, 12, 6]];
      band.forEach(([x, y, w]) => R(x, y, w, 1, '#C9D0DA'));
      R(3, 6, 2, 1, '#F2F6FA');
      R(1, 8, 1, 2, '#F2F6FA');
      R(6, 12, 3, 1, '#8E96A4');
      R(10, 9, 1, 2, '#8E96A4');
      R(4, 5, 4, 1, '#A8B0BC');
      R(4, 1, 4, 1, '#E8F6FF');
      R(3, 2, 6, 2, '#BEE6FA');
      R(4, 2, 1, 1, '#FFFFFF');
      R(4, 4, 4, 1, '#8CC8EA');
      R(5, 5, 2, 1, '#8CC8EA');
    }
  };

  // contorno de 1 px: 70% de #1E1826 + 30% da cor vizinha (Apêndice E.1)
  function outline(src) {
    const w = src.width + 2, h = src.height + 2;
    const cv = Gfx.canvas(w, h);
    cv.cx.drawImage(src, 1, 1);
    const d = cv.cx.getImageData(0, 0, w, h).data;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? null : d[(y * w + x) * 4 + 3] ? (y * w + x) * 4 : null);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (at(x, y) !== null) continue;
        const n = [at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1)].find(i => i !== null);
        if (n === undefined) continue;
        cv.cx.fillStyle = Gfx.mix('#1E1826', Gfx.hex(d[n], d[n + 1], d[n + 2]), 0.3);
        cv.cx.fillRect(x, y, 1, 1);
      }
    }
    return cv;
  }

  return {
    sprite(name) {
      if (!cache[name]) {
        const raw = Gfx.canvas(24, 14);
        (DRAW[name] || DRAW.revolver)((x, y, w, h, c) => Gfx.rect(x, y, w, h, c, raw.cx));
        cache[name] = outline(raw);
      }
      return cache[name];
    }
  };
})();
