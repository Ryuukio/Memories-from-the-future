// Itens dos baús (SPEC, seção 7), no desenho da V2: no tamanho de verdade (100 × 58, sem ampliar),
// com as rampas pontilhadas, a luz de cima e da esquerda e o contorno seletivo das ferramentas do Art
// (como os objetos dos cenários). Usados no cartão do baú (chest.js).
// Items.sprite('revolver') → canvas com o item já contornado (revolver, mounjaro, ammo ou ring).
const Items = (() => {
  const W = 100, H = 58;
  const cache = {};

  // ponto (centro do pixel) dentro do polígono [[x, y], ...]?
  function inPoly(pts, x, y) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // pinta o polígono com shade(x, y) → cor
  function poly(s, pts, shade) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.floor(Math.min(...xs)), y0 = Math.floor(Math.min(...ys));
    s.fill(x0, y0, Math.ceil(Math.max(...xs)) - x0 + 1, Math.ceil(Math.max(...ys)) - y0 + 1,
      (x, y) => (inPoly(pts, x + 0.5, y + 0.5) ? shade(x, y) : null));
  }
  // brilho de quatro pontas (depois do contorno: sem contorno)
  function glint(s, x, y, r, c = '#FFFFFF') {
    s.put(x, y, c);
    for (let k = 1; k <= r; k++) {
      const a = k === r ? 0.5 : 1;
      s.put(x + k, y, c, a); s.put(x - k, y, c, a); s.put(x, y + k, c, a); s.put(x, y - k, c, a);
    }
  }

  const DRAW = {
    // velho e enferrujado, virado para a direita: cano com a mira, tambor com as caneluras, cão,
    // guarda-mato com o gatilho e o cabo de madeira inclinado (veios, parafuso e a chapa de baixo)
    revolver(s, A) {
      const T = A.tones, pick = A.pick;
      const STEEL = T(['#22252E', '#343844', '#4A505E', '#646C7C', '#828A9A', '#A4ABB8', '#C8CDD6', '#EDF0F4']);
      const RUST = T(['#4A2414', '#6A361C', '#8A4C26', '#A86434', '#C27E48']);
      const WOOD = T(['#341A0C', '#4E2A16', '#683A20', '#84502C', '#A0683A', '#BC8452', '#D4A070']);
      // aço com ferrugem em manchas
      const metal = (x, y, t) => {
        const n = A.vnoise(x, y, 4, 71) * 0.7 + A.vnoise(x, y, 2, 72) * 0.3;
        if (n > 0.71) return pick(RUST, 0.3 + (n - 0.71) * 2.5 + (t - 0.5) * 0.4, x, y);
        if (A.hash(x, y, 73) < 0.012) return RUST[2];
        return pick(STEEL, t, x, y);
      };
      // cabo de madeira, inclinado para trás
      const grip = [[21, 27], [34, 31], [31, 43], [27, 53], [24, 56], [9, 56], [7, 52], [14, 38]];
      poly(s, grip, (x, y) => {
        if (y >= 53) return metal(x, y, 0.62 - (y - 53) * 0.12);   // a chapa de baixo
        const u = x + y * 0.42, v = y - x * 0.42;                  // de través e ao longo do cabo
        const grain = A.vnoise(u * 2.6, v * 0.35, 3, 74);
        let t = 0.48 + (grain - 0.5) * 0.55 - (u - 22) * 0.012;
        if (A.vnoise(x, y, 5, 75) > 0.7) t += 0.18;                // gasto pelo uso
        return pick(WOOD, t, x, y);
      });
      s.ellipse(20.5, 43.5, 1.8, 1.8, (x, y, nx, ny) => pick(STEEL, A.sphere(nx, ny) + 0.15, x, y));   // parafuso
      // guarda-mato e gatilho
      s.ellipse(38, 35.5, 9, 7, (x, y, nx, ny) => {
        if (y < 31 || nx * nx * 1.9 + ny * ny * 2.2 < 1) return null;
        return metal(x, y, 0.62 - (y - 31) * 0.04 - nx * 0.1);
      });
      s.line(39, 31, 36, 38, STEEL[2]); s.line(40, 31, 37, 37, STEEL[4]);
      // armação em volta do tambor
      poly(s, [[23, 10], [48, 10], [48, 30], [40, 32], [26, 32], [21, 23]], (x, y) => metal(x, y, 0.56 - (y - 10) / 22 * 0.32));
      // cão (atrás do tambor), com a ponta serrilhada
      poly(s, [[24, 12], [20, 7], [17, 5], [18, 3], [22, 4], [27, 8], [28, 12]], (x, y) =>
        metal(x, y, 0.68 - (y - 3) * 0.03 + ((x + y) % 2 && y < 6 ? -0.25 : 0)));
      // tambor: cilindro deitado, claro em cima, com as caneluras
      s.fill(28, 9, 19, 23, (x, y) => {
        const cx = Math.min(x - 28, 46 - x), cy = Math.min(y - 9, 31 - y);
        if (cx + cy < 2) return null;
        let t = 0.95 - (y - 9) / 22 * 0.78;
        if (x === 28 || x === 46) t -= 0.18;
        if ((y === 15 || y === 16 || y === 23 || y === 24) && x > 30 && x < 44) t -= 0.3;
        if (y === 14 || y === 22) t += 0.08;
        return metal(x, y, t);
      });
      // cano com a faixa de cima, a mira e a boca; o tubo da vareta embaixo
      s.fill(48, 11, 43, 2, (x, y) => metal(x, y, 0.5 - (y - 11) * 0.15));
      s.fill(47, 13, 49, 9, (x, y) => metal(x, y, 0.92 - (y - 13) / 8 * 0.74 + (y === 14 ? 0.1 : 0) - (x === 95 ? 0.3 : 0)));
      s.rect(95, 16, 1, 3, '#121318');
      s.fill(88, 7, 4, 4, (x, y) => (y === 7 && (x === 88 || x === 91) ? null : metal(x, y, 0.55 - (y - 7) * 0.05)));
      s.fill(50, 22, 30, 4, (x, y) => (x === 79 && (y === 22 || y === 25) ? null : metal(x, y, 0.62 - (y - 22) * 0.15)));
      s.outline(0.42);
      glint(s, 60, 14, 2);
    },

    // caneta de injeção genérica (sem marca): ponta cinza, corpo branco com a faixa roxa do rótulo,
    // o visor da dose, o serrilhado e o botão roxo na ponta
    mounjaro(s, A) {
      const T = A.tones, pick = A.pick;
      const WHITE = T(['#6E7088', '#9296AE', '#B8BCCC', '#D6D9E4', '#EAECF2', '#F8F9FB', '#FFFFFF']);
      const PURPLE = T(['#2A1A56', '#422C7A', '#5A409C', '#7658BC', '#957AD6', '#B8A2EA', '#DCD0F8']);
      const GREY = T(['#3A3E4A', '#565C6A', '#767C8A', '#989EAA', '#BCC0CA', '#DCDFE6']);
      const GLASS = T(['#1E4A66', '#2E6888', '#4A8EAE', '#76B6D2', '#A8D8EC', '#DCF2FA']);
      const cy = 29;
      // cilindro deitado: claro em cima (ny = -1 em cima, 1 embaixo)
      const tube = (x, y, r) => A.sphere(-0.15, A.clamp1((y + 0.5 - cy) / r));
      const part = (x0, x1, r, shade) => {
        for (let x = x0; x <= x1; x++) for (let y = Math.ceil(cy - r); y <= Math.floor(cy + r); y++) {
          const c = shade(x, y, r);
          if (c) s.put(x, y, c);
        }
      };
      // ponta da agulha (cinza, arredondada)
      part(3, 11, 8, (x, y, r) => {
        const e = Math.max(0, 6 - (x - 3)) * 0.9;
        return Math.abs(y + 0.5 - cy) > r - e * 0.6 ? null : pick(GREY, tube(x, y, r) + (x === 11 ? -0.2 : 0), x, y);
      });
      // corpo branco
      part(12, 73, 11, (x, y, r) => pick(WHITE, tube(x, y, r) - 0.05, x, y));
      // faixa roxa do rótulo, com "letras" claras
      part(22, 42, 11.5, (x, y, r) => {
        let t = tube(x, y, r) - 0.08;
        if (x === 22 || x === 42) t -= 0.2;
        if ((y === 26 || y === 29) && x > 25 && x < 39 && A.hash(x, y, 81) < 0.7) return pick(WHITE, t + 0.25, x, y);
        return pick(PURPLE, t, x, y);
      });
      // visor da dose: vidro azulado com os números e o ponteiro vermelho
      s.fill(50, 24, 15, 10, (x, y) => {
        if ((x === 50 || x === 64) && (y === 24 || y === 33)) return null;
        let t = 0.75 - (y - 24) * 0.06 - (x === 50 || y === 24 ? 0.35 : 0);
        if (x % 3 === 0 && x > 51 && x < 63 && y > 26 && y < 31) return '#22304A';
        if (x === 57 && y > 24 && y < 33) return '#D8443A';
        return pick(GLASS, t, x, y);
      });
      // serrilhado antes do botão
      part(68, 73, 11, (x, y, r) => pick(WHITE, tube(x, y, r) - (x % 2 ? 0.25 : 0), x, y));
      // botão roxo, mais fino, arredondado na ponta
      part(74, 96, 8, (x, y, r) => {
        const e = Math.max(0, x - 92);
        if (Math.abs(y + 0.5 - cy) > r - e * e * 0.5) return null;
        return pick(PURPLE, tube(x, y, r) + (x < 76 ? 0.15 : 0) + (x === 76 ? -0.2 : 0), x, y);
      });
      s.outline(0.42);
      glint(s, 30, 21, 2);
    },

    // cinco balas em pé: estojo de latão com o friso e o aro, ponta de cobre arredondada
    ammo(s, A) {
      const T = A.tones, pick = A.pick;
      const BRASS = T(['#4E3410', '#6E4E18', '#926C22', '#B48A30', '#D2A844', '#EAC866', '#FAE6A0']);
      const COPPER = T(['#3E1A0C', '#622C14', '#884020', '#AC5A30', '#C87A48', '#E2A070', '#F6CCA4']);
      for (let i = 0; i < 5; i++) {
        const cx = 12 + i * 19;
        for (let y = 5; y <= 54; y++) {
          // meia largura: a ponta (ogiva) de 5 a 22, o estojo, o friso do extrator e o aro
          let hw;
          if (y < 22) { const k = (y - 5) / 17; hw = Math.max(1, 6.5 * Math.sqrt(1 - (1 - k) * (1 - k))); }
          else if (y === 48 || y === 49) hw = 5.5;
          else if (y >= 50) hw = 7.5;
          else hw = 6.5;
          for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw); x++) {
            const nx = (x + 0.5 - cx) / (hw + 0.5);
            if (Math.abs(nx) > 1) continue;
            if (y < 22) {
              const k = (y - 5) / 17;
              s.put(x, y, pick(COPPER, A.sphere(nx, -0.6 * (1 - k)) + 0.05, x, y));
            } else {
              let t = A.sphere(nx, 0) - 0.02;
              if (y === 22 || y === 23) t -= 0.22;          // a dobra que prende a ponta
              if (y === 48 || y === 49) t -= 0.3;           // o friso
              if (y === 50) t += 0.12;
              if (y === 54) t -= 0.2;
              s.put(x, y, pick(BRASS, t, x, y));
            }
          }
        }
      }
      s.outline(0.42);
      glint(s, 88, 9, 2);
    },

    // anel de platina com um diamante grande: o aro visto de cima e de lado (a parte de trás mais
    // escura), as garras e as facetas da pedra, com brilhos
    ring(s, A) {
      const T = A.tones, pick = A.pick;
      const PLAT = T(['#323644', '#4E5462', '#6E7482', '#9298A6', '#B8BCC8', '#DCDFE6', '#FFFFFF']);
      const ICE = T(['#2E5C86', '#4A84B0', '#72AAD4', '#A2CEEC', '#D0EAF8', '#F2FAFF', '#FFFFFF']);
      const L = A.L, cx = 50, cy = 41, ro = [22, 14.5], ri = [16.5, 9];
      // o aro: um tubo em volta da elipse; a normal sai do meio do tubo para fora e para dentro
      s.fill(cx - 23, cy - 16, 47, 33, (x, y) => {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const o = Math.hypot(dx / ro[0], dy / ro[1]), i = Math.hypot(dx / ri[0], dy / ri[1]);
        if (o > 1 || i < 1) return null;
        const a = Math.atan2(dy / ro[1], dx / ro[0]);
        const u = (1 - o) / Math.max(0.0001, (1 - o) + (i - 1));   // 0 na borda de fora, 1 na de dentro
        const side = 1 - 2 * u;                                    // 1 fora, -1 dentro
        const nx = Math.cos(a) * side * 0.9, ny = Math.sin(a) * side * 0.9, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        let t = 0.5 + 0.62 * (nx * L[0] + ny * L[1] + nz * L[2]);
        if (dy < -2) t -= 0.14;                                    // a parte de trás do aro
        return pick(PLAT, t, x, y);
      });
      // a base das garras em cima do aro
      poly(s, [[42, 23], [58, 23], [55, 30], [45, 30]], (x, y) => pick(PLAT, 0.75 - (y - 23) * 0.06 - (x - 42) * 0.015, x, y));
      // o diamante: coroa (de 6 a 15, com a mesa em cima) e pavilhão (de 16 até a ponta, em 28)
      const crown = [[44, 6], [56, 6], [63, 14], [37, 14]], pav = [[37, 15], [63, 15], [50, 28]];
      poly(s, crown, (x, y) => {
        if (y === 6) return pick(ICE, 0.95, x, y);
        const f = Math.floor((x - 37 + (y - 6) * (x < 50 ? 0.8 : -0.8)) / 4.5);
        return pick(ICE, [0.55, 0.85, 0.65, 0.95, 0.7, 0.4][((f % 6) + 6) % 6] - (x - 37) * 0.006, x, y);
      });
      s.fill(37, 14, 27, 2, (x, y) => (inPoly(crown, x + 0.5, y - 0.5) || inPoly(pav, x + 0.5, y + 1.5) ? pick(ICE, 0.9 - (x - 37) * 0.012, x, y) : null));   // a cinta
      poly(s, pav, (x, y) => {
        const f = Math.floor((Math.atan2(x + 0.5 - 50, 28 - y) + 1) / 0.28);
        return pick(ICE, [0.35, 0.6, 0.45, 0.8, 0.5, 0.25, 0.65, 0.4][((f % 8) + 8) % 8], x, y);
      });
      // as garras
      [[39, 13], [45, 13], [55, 13], [61, 13]].forEach(([x, y]) => { s.put(x, y, PLAT[5]); s.put(x, y + 1, PLAT[4]); });
      s.outline(0.42);
      glint(s, 46, 9, 3);
      glint(s, 64, 5, 2);
      glint(s, 33, 38, 1);
    }
  };

  // miniaturas da batalha, no mesmo estilo: o revólver na mão da Ellen (virado para a direita) e a
  // bala do contador (cheia ou gasta). Superfícies com 1 px de margem para o contorno.
  const MINI = {
    revolver(A) {
      const s = A.surface(17, 11), T = A.tones, pick = A.pick;
      const STEEL = T(['#22252E', '#343844', '#4A505E', '#646C7C', '#828A9A', '#A4ABB8', '#C8CDD6']);
      const WOOD = T(['#341A0C', '#4E2A16', '#683A20', '#84502C', '#A0683A']);
      [[2, 5, 3], [2, 6, 3], [1, 7, 3], [1, 8, 3], [1, 9, 3]].forEach(([x, y, w], j) => {
        for (let i = 0; i < w; i++) s.put(x + i, y, pick(WOOD, 0.65 - i * 0.18 - j * 0.04, x + i, y));
      });
      s.fill(3, 1, 4, 5, (x, y) => pick(STEEL, 0.85 - (y - 1) * 0.15 - (x === 6 ? 0.15 : 0), x, y));   // tambor
      s.put(2, 1, STEEL[3]); s.put(1, 0, STEEL[4]);                                                  // cão
      s.fill(7, 2, 9, 2, (x, y) => pick(STEEL, y === 2 ? 0.8 : 0.4, x, y));                          // cano
      s.put(14, 1, STEEL[3]);                                                                       // mira
      s.put(6, 6, STEEL[2]); s.put(7, 6, STEEL[2]); s.put(5, 6, STEEL[3]);                           // guarda-mato
      s.outline(0.42);
      return s.canvas();
    },
    bullet(A, on) {
      const s = A.surface(7, 13), T = A.tones, pick = A.pick;
      const BRASS = T(['#4E3410', '#926C22', '#B48A30', '#D2A844', '#EAC866', '#FAE6A0']);
      const COPPER = T(['#622C14', '#884020', '#AC5A30', '#C87A48', '#E2A070']);
      const DULL = T(['#1E1A30', '#2A2640', '#36324E', '#444060', '#524E70']);
      const rows = [[3, 1], [2, 3], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5]];
      rows.forEach(([x0, w], j) => {
        for (let i = 0; i < w; i++) {
          const x = x0 + i, y = j + 1, t = A.sphere((x + 0.5 - 3.5) / 2.6, j < 3 ? -0.5 : 0) - (j === 3 ? 0.2 : 0) - (j === 9 ? 0.25 : 0);
          s.put(x, y, pick(on ? (j < 3 ? COPPER : BRASS) : DULL, t, x, y));
        }
      });
      s.outline(0.42);
      return s.canvas();
    }
  };

  return {
    W, H,
    // miniatura da batalha: Items.mini('revolver') ou Items.mini('bullet', cheia?)
    mini(name, on = true) {
      const key = 'mini:' + name + (on ? '' : ':off');
      if (!cache[key]) cache[key] = MINI[name](Art, on);
      return cache[key];
    },
    sprite(name) {
      if (!cache[name]) {
        const s = Art.surface(W, H);
        (DRAW[name] || DRAW.revolver)(s, Art);
        cache[name] = s.canvas();
      }
      return cache[name];
    }
  };
})();
