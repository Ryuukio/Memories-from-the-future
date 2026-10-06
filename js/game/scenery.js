// Cenários: pintores de piso e parede e a biblioteca de objetos (mesas, cadeiras, decoração).
// Os arquivos de data/scenes/ só dizem qual pintor usar e onde fica cada objeto; o desenho
// fica aqui, reaproveitado por todos os cenários.
//
// Objeto: Scenery.props[tipo] = {
//   size(p)          → [w, h] do desenho (p = a instância, com as opções do cenário)
//   solid(p)         → [x, y, w, h] colisão no chão, relativo ao canto do desenho (null = nenhuma)
//   sight(p)         → [x, y, w, h] bloqueia a visão dos vigias (null = não bloqueia)
//   layer            'back' = pintado no fundo (parede, banco); 'sorted' (padrão) = ordenado pela base
//   draw(c, p)       pinta no canvas c, a partir de (0, 0)
// }
const Scenery = (() => {
  const R = Gfx.rect;

  // ruído determinístico: o mesmo cenário sai sempre igual
  const hash = (a, b) => {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };

  function alpha(c, a, fn) {
    c.save();
    c.globalAlpha = a;
    fn();
    c.restore();
  }

  // pontilhado Bayer 4×4 com uma cor sobre uma área, mais denso de um lado (luz, brilho)
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function glow(c, x, y, w, h, color, density) {
    c.fillStyle = color;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (density(i, j) * 16 > BAYER[(y + j) & 3][(x + i) & 3] + 0.5) c.fillRect(x + i, y + j, 1, 1);
      }
    }
  }

  // ================= pisos =================

  const FLOORS = {
    // tábuas avermelhadas do restaurante (preview_16bit_sala_A): brilho, 3 de base, sombra, junta
    redWood: {
      tones: [['#A96B4A', '#9C5A3A', '#894D32'], ['#B2734E', '#A6633F', '#925537'], ['#A16142', '#934F31', '#82442B']],
      seam: '#5C2E1E', grain: '#7E4129'
    }
  };

  function planks(c, x0, y0, w, h, f, seed) {
    c.save();
    c.beginPath();
    c.rect(x0, y0, w, h);
    c.clip();
    for (let row = 0, y = y0; y < y0 + h; row++, y += 6) {
      let x = x0 - (hash(row, seed) % 40), i = 0;
      while (x < x0 + w) {
        const len = 22 + hash(row * 31 + i, seed) % 30;
        const t = f.tones[hash(row * 7 + i * 13, seed + 1) % f.tones.length];
        R(x, y, len, 1, t[0], c);
        R(x, y + 1, len, 3, t[1], c);
        R(x, y + 4, len, 1, t[2], c);
        R(x, y + 5, len, 1, f.seam, c);
        R(x + len - 1, y, 1, 5, f.seam, c);
        // veios: um ou dois tracinhos mais escuros
        const g = hash(row * 5 + i, seed + 2);
        if (g % 3) R(x + 4 + g % (len - 12), y + 2 + (g >> 4) % 2, 3 + (g >> 6) % 4, 1, f.grain, c);
        x += len;
        i++;
      }
    }
    c.restore();
  }

  // ================= paredes =================

  // Parede do fundo do restaurante: viga escura, luz quente embutida no teto, parede creme
  // com textura, rodameio e lambri de madeira. `h` = altura total (o piso começa aí).
  function restaurantWall(c, x0, w, h) {
    R(x0, 0, w, h, '#E8D8B2', c);
    // textura pontilhada do reboco
    for (let i = 0; i < w * h / 26; i++) {
      const v = hash(i, x0 + 7);
      R(x0 + v % w, 6 + (v >> 9) % (h - 22), 1, 1, (v >> 4) % 3 ? '#D6C296' : '#F6ECD4', c);
    }
    // luz quente: faixa clara logo abaixo da viga, espalhando em pontilhado
    R(x0, 4, w, 1, '#FFF4DA', c);
    glow(c, x0, 5, w, 7, '#F6ECD4', (i, j) => 1 - j / 7);
    // viga do teto
    R(x0, 0, w, 4, '#3A2216', c);
    R(x0, 3, w, 1, '#5E4634', c);
    // rodameio e lambri
    const rail = h - 16;
    R(x0, rail, w, 2, '#6A4129', c);
    R(x0, rail + 2, w, 14, '#4A2B1C', c);
    R(x0, rail + 2, w, 1, '#2E190F', c);
    for (let x = x0 + 6; x < x0 + w; x += 24) {
      R(x, rail + 4, 1, 10, '#3A2216', c);
      R(x + 1, rail + 4, 1, 10, '#5A3622', c);
    }
    R(x0, h - 1, w, 1, '#2E190F', c);
  }

  const WALLS = { restaurant: restaurantWall };

  // ================= objetos =================

  const props = {};

  // ---------- mesa de madeira escura com a chapa embutida (F1 A1) ----------
  function okonomiyaki(c, x, y) {
    R(x + 2, y, 14, 1, '#8A5426', c);
    R(x, y + 1, 18, 6, '#8A5426', c);
    R(x + 2, y + 7, 14, 1, '#8A5426', c);
    R(x + 2, y + 1, 14, 6, '#C8823A', c);
    R(x + 1, y + 2, 16, 4, '#C8823A', c);
    R(x + 3, y + 2, 12, 4, '#5A2C1A', c);          // molho
    for (let i = 0; i < 6; i++) R(x + 4 + i * 2, y + 3 + (i % 2), 1, 1, '#F4F0E8', c);   // maionese em zigue-zague
    R(x + 5, y + 2, 1, 1, '#5DAA62', c);
    R(x + 10, y + 4, 1, 1, '#5DAA62', c);
    R(x + 13, y + 3, 1, 1, '#E8A08A', c);          // katsuobushi
    R(x + 7, y + 5, 1, 1, '#E8A08A', c);
  }

  function bottle(c, x, y, body, cap) {
    R(x, y, 2, 1, cap, c);
    R(x, y + 1, 2, 4, body, c);
    R(x, y + 1, 1, 1, '#FFFFFF', c);
  }

  props.grillTable = {
    size: () => [64, 26],
    solid: () => [0, 2, 64, 18],
    sight: () => null,
    base: 20,
    draw(c, p) {
      alpha(c, 0.35, () => R(2, 21, 62, 5, '#140F1E', c));
      // tampo
      R(0, 0, 64, 18, '#4E2F21', c);
      R(0, 0, 64, 1, '#6A4330', c);
      R(0, 0, 1, 18, '#5C3828', c);
      // chapa: moldura de inox e a chapa escura
      R(10, 2, 44, 14, '#7E8494', c);
      R(11, 3, 42, 12, '#232429', c);
      R(12, 4, 40, 10, '#5C616D', c);
      R(12, 4, 40, 1, '#6E7380', c);
      R(14, 6, 3, 1, '#8A90A0', c);
      R(47, 6, 3, 1, '#8A90A0', c);
      R(45, 11, 2, 1, '#8A90A0', c);
      // frente da mesa
      R(0, 18, 64, 2, '#33201A', c);
      R(0, 20, 64, 1, '#24150F', c);
      R(0, 21, 64, 1, '#1A0F0B', c);
      if (p.food) okonomiyaki(c, 23, 5);
      // espátulas na beirada da chapa
      if (p.spatulas !== false) {
        R(13, 13, 5, 1, '#B4BAC6', c);
        R(10, 13, 3, 1, '#8A5426', c);
        R(46, 4, 5, 1, '#B4BAC6', c);
        R(51, 4, 3, 1, '#8A5426', c);
      }
      // temperos e garrafas de molho numa ponta, copo na outra
      const items = p.items || 'left';
      const left = items === 'left' || items === 'both';
      const right = items === 'right' || items === 'both';
      if (left) {
        bottle(c, 3, 4, '#5A2C1A', '#D8443A');
        bottle(c, 6, 5, '#F0EFEA', '#D8443A');
        R(3, 11, 2, 3, '#C8C2B4', c);
        R(3, 11, 2, 1, '#6E6A60', c);
      }
      if (right) {
        R(57, 5, 4, 6, '#E8B23A', c);
        R(57, 4, 4, 2, '#FFFFFF', c);
        R(60, 6, 1, 4, '#C8902A', c);
      }
      if (p.glass) {
        R(56, 12, 3, 4, '#DDE6F0', c);
        R(56, 12, 3, 1, '#FFFFFF', c);
      }
    }
  };

  // ---------- cadeiras: madeira clara, assento e encosto pretos ----------
  const WOOD = '#B47A42', WOOD_D = '#8A5730', WOOD_DD = '#5E3A20';
  const CUSH = '#2A2630', CUSH_H = '#4C4656', CUSH_D = '#1C1A21';

  // Cadeira vista de lado, assento virado para a direita (encosto à esquerda). Mesmo canvas
  // de 16×32 do personagem sentado, para desenhar por baixo dele.
  function chairSide(c) {
    R(0, 12, 2, 16, WOOD_D, c);
    R(1, 12, 1, 16, WOOD, c);
    R(0, 14, 3, 9, CUSH, c);
    R(0, 14, 3, 1, CUSH_H, c);
    R(1, 25, 12, 2, CUSH, c);
    R(1, 25, 12, 1, CUSH_H, c);
    R(1, 27, 12, 1, WOOD, c);
    R(2, 28, 1, 4, WOOD_D, c);
    R(11, 28, 1, 4, WOOD_D, c);
  }

  // Encosto visto de trás (pessoa de costas para a câmera): desenhado por cima dela.
  function chairBack(c) {
    R(2, 19, 12, 11, WOOD_D, c);
    R(2, 19, 12, 1, WOOD, c);
    R(3, 20, 10, 8, CUSH, c);
    R(3, 20, 10, 1, CUSH_H, c);
    R(3, 27, 10, 1, CUSH_D, c);
    R(3, 30, 1, 4, WOOD_DD, c);
    R(12, 30, 1, 4, WOOD_DD, c);
  }

  // cadeira vazia, de costas (encosto alto: bloqueia a visão)
  props.chair = {
    size: () => [16, 34],
    solid: () => [3, 24, 10, 9],
    sight: () => [3, 19, 10, 14],
    base: 33,
    draw(c, p) {
      alpha(c, 0.35, () => R(2, 31, 12, 3, '#140F1E', c));
      if (p.dir === 'right' || p.dir === 'left') {
        if (p.dir === 'left') { c.save(); c.translate(16, 0); c.scale(-1, 1); }
        chairSide(c);
        if (p.dir === 'left') c.restore();
      } else {
        chairBack(c);
      }
    }
  };

  // ---------- banco comprido preto encostado na parede do fundo ----------
  props.bench = {
    layer: 'back',
    size: p => [p.w, 26],
    solid: p => [0, 0, p.w, 24],
    sight: p => [0, 0, p.w, 24],
    draw(c, p) {
      const w = p.w;
      R(0, 0, w, 14, '#2A2630', c);
      R(0, 0, w, 1, '#4C4656', c);
      for (let x = 30; x < w - 4; x += 30) R(x, 2, 1, 11, CUSH_D, c);
      R(0, 14, w, 7, '#35303C', c);
      R(0, 14, w, 1, '#4C4656', c);
      R(0, 21, w, 2, CUSH_D, c);
      R(0, 23, w, 1, '#121016', c);
      alpha(c, 0.3, () => R(0, 24, w, 2, '#140F1E', c));
    }
  };

  // ---------- decoração da parede (fundo, sem colisão) ----------
  props.clock = {
    layer: 'back',
    size: () => [14, 14],
    draw(c) {
      const ring = [[4, 0, 6], [2, 1, 10], [1, 2, 12], [1, 3, 12], [0, 4, 14], [0, 5, 14], [0, 6, 14], [0, 7, 14], [0, 8, 14], [0, 9, 14], [1, 10, 12], [1, 11, 12], [2, 12, 10], [4, 13, 6]];
      ring.forEach(([x, y, w]) => R(x, y, w, 1, '#3A2216', c));
      ring.slice(1, -1).forEach(([x, y, w]) => R(x + 1, y, w - 2, 1, '#F6F2E8', c));
      R(2, 4, 1, 3, '#D6CCB8', c);
      R(7, 3, 1, 4, '#2A2030', c);
      R(7, 7, 3, 1, '#2A2030', c);
      R(7, 8, 1, 3, '#C8323A', c);
    }
  };

  // tiras de cardápio penduradas (traços abstratos, sem texto de verdade)
  props.menuStrips = {
    layer: 'back',
    size: p => [(p.n || 6) * 9, 24],
    draw(c, p) {
      for (let i = 0; i < (p.n || 6); i++) {
        const x = i * 9;
        R(x + 3, 0, 1, 2, '#3A2216', c);
        R(x, 2, 7, 21, '#F2EAD6', c);
        R(x + 6, 2, 1, 21, '#D6C8A8', c);
        R(x, 22, 7, 1, '#C8B890', c);
        for (let k = 0; k < 6; k++) {
          const v = hash(i * 11 + k, 3);
          if (v % 4) R(x + 2 + v % 2, 5 + k * 3, 2 + (v >> 3) % 2, 1, '#3A2A22', c);
        }
        if (i % 3 === 1) R(x + 2, 17, 3, 3, '#C8323A', c);
      }
    }
  };

  // placa de madeira com texto (o texto vem do config.js: p.text)
  props.sign = {
    layer: 'back',
    size: p => [Gfx.textWidth(p.text || '') + 16, 15],
    draw(c, p) {
      const [w, h] = props.sign.size(p);
      alpha(c, 0.25, () => R(2, 2, w, h - 1, '#2E190F', c));
      R(0, 0, w - 1, h - 1, '#2E190F', c);
      R(1, 1, w - 3, h - 3, '#4A2B1C', c);
      R(1, 1, w - 3, 1, '#6A4129', c);
      Gfx.text(p.text || '', 7, 3, '#F2E8CC', { ctx: c });
    }
  };

  // lanterna de papel vermelha
  props.lantern = {
    layer: 'back',
    size: () => [10, 18],
    draw(c) {
      R(4, 0, 1, 5, '#2E190F', c);
      R(3, 5, 4, 1, '#1E1826', c);
      R(1, 6, 8, 1, '#B8342E', c);
      R(0, 7, 10, 6, '#D8443A', c);
      R(1, 13, 8, 1, '#B8342E', c);
      R(0, 9, 10, 1, '#A02C28', c);
      R(0, 11, 10, 1, '#A02C28', c);
      R(2, 8, 2, 1, '#F07A6A', c);
      R(3, 14, 4, 1, '#1E1826', c);
    }
  };

  // porta da cozinha com noren azul-marinho (ondas brancas)
  props.noren = {
    layer: 'back',
    size: () => [48, 44],
    draw(c) {
      R(0, 0, 48, 44, '#4A2B1C', c);
      R(3, 3, 42, 41, '#22140F', c);
      R(3, 3, 42, 1, '#120A07', c);
      for (let i = 0; i < 3; i++) {
        const x = 5 + i * 13;
        R(x, 4, 12, 20, '#2D3C70', c);
        R(x, 4, 1, 20, '#41539A', c);
        R(x + 11, 4, 1, 20, '#1E2A52', c);
        for (let k = 0; k < 12; k++) R(x + k, 13 + (k % 4 < 2 ? 0 : 1), 1, 1, '#E8ECF6', c);
      }
    }
  };

  // planta num vaso de barro
  props.plant = {
    size: () => [18, 30],
    solid: () => [3, 22, 12, 8],
    sight: () => [3, 20, 12, 10],
    base: 30,
    draw(c) {
      alpha(c, 0.35, () => R(2, 27, 15, 3, '#140F1E', c));
      const leaves = [[8, 0, 9], [5, 3, 7], [11, 2, 8], [3, 7, 5], [13, 6, 6], [7, 4, 8], [10, 5, 8], [1, 11, 4], [15, 10, 4]];
      leaves.forEach(([x, y, h], i) => {
        R(x, y, 2, h + 6, i % 2 ? '#2E6A3E' : '#3F8A4E', c);
        R(x, y, 1, h + 4, '#5DAA62', c);
      });
      R(3, 19, 12, 2, '#C8724A', c);
      R(4, 21, 10, 8, '#A85A3A', c);
      R(4, 21, 2, 8, '#C8724A', c);
      R(12, 21, 2, 8, '#8A4A30', c);
    }
  };

  // ================= montagem =================

  // tamanho, colisão e bloqueio de visão de uma instância, já com a posição dela
  function geometry(p) {
    const def = props[p.type];
    if (!def) throw new Error('Objeto desconhecido: ' + p.type);
    const [w, h] = def.size(p);
    const abs = r => (r ? { x: p.x + r[0], y: p.y + r[1], w: r[2], h: r[3] } : null);
    return {
      def, w, h,
      solid: abs(def.solid ? def.solid(p) : null),
      sight: abs(def.sight ? def.sight(p) : null),
      z: p.y + (def.base !== undefined ? def.base : h)
    };
  }

  function render(p) {
    const g = geometry(p), cv = Gfx.canvas(g.w, g.h);
    g.def.draw(cv.cx, p);
    return cv;
  }

  return {
    hash, glow, props, geometry, render, planks, FLOORS, WALLS,
    chairSide, chairBack,
    // fundo de um cenário: piso + parede do fundo + paredes laterais com as portas
    paintBase(c, ox, look) {
      const wallH = look.wall.height;
      planks(c, ox, wallH, 384, 192 - wallH, FLOORS[look.floor], ox + 1);
      // sombra da parede no chão
      alpha(c, 0.25, () => R(ox, wallH, 384, 2, '#140F1E', c));
      WALLS[look.wall.style](c, ox, 384, wallH);
      // postes laterais, com as passagens
      const doors = look.doors || {};
      [['left', ox], ['right', ox + 380]].forEach(([side, x]) => {
        const gap = doors[side];
        const segs = gap ? [[wallH - 8, gap[0]], [gap[1], 192]] : [[wallH - 8, 192]];
        segs.forEach(([a, b]) => {
          R(x, a, 4, b - a, '#4A2B1C', c);
          R(side === 'left' ? x + 3 : x, a, 1, b - a, '#2E190F', c);
          R(side === 'left' ? x + 1 : x + 2, a, 1, b - a, '#6A4129', c);
        });
        if (gap) {
          // luz que entra pela passagem
          const inward = side === 'left' ? 1 : -1;
          glow(c, side === 'left' ? ox : ox + 372, gap[0] + 2, 12, gap[1] - gap[0] - 4, '#C88A62',
            i => 0.55 * (inward > 0 ? 1 - i / 12 : i / 12));
          R(x, gap[0] - 1, 4, 2, '#2E190F', c);
          R(x, gap[1] - 1, 4, 2, '#2E190F', c);
        }
      });
    }
  };
})();
