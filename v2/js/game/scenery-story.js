// Cenários da história (etapa 5): a lanchonete do vilão (prólogo, cena 1), o quarto do apartamento
// (cena 2), o laboratório (cena 3) e a livraria-café de hoje (fase 5). Pisos, paredes e objetos.
(() => {
  const { R, hash, glow, alpha, props, FLOORS, WALLS, EDGES, planks } = Scenery;

  function ell(c, x, y, w, h, color) {
    for (let j = 0; j < h; j++) {
      const dy = (j + 0.5 - h / 2) / (h / 2);
      const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * w / 2;
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) R(x0, y + j, x1 - x0, 1, color, c);
    }
  }
  const shadowRect = (c, x, y, w, h, a = 0.3) => alpha(c, a, () => R(x, y, w, h, '#140F1E', c));

  // borda lateral lisa (parede do cômodo), com uma cor de parede e uma de sombra
  function plainEdge(colors) {
    return (c, x, top, gap, side) => {
      const segs = gap ? [[top - 6, gap[0]], [gap[1], 192]] : [[top - 6, 192]];
      segs.forEach(([a, b]) => {
        R(x, a, 4, b - a, colors[0], c);
        R(side === 'left' ? x + 3 : x, a, 1, b - a, colors[1], c);
      });
    };
  }

  // ======================================================================
  //  Prólogo, cena 1 · JIMMY'S JUNK PALACE — lanchonete de fast-food à noite
  // ======================================================================

  // piso xadrez vermelho e creme, encerado
  FLOORS.diner = (c, x, y, w, h) => {
    for (let j = 0; j < h; j += 12) {
      for (let i = 0; i < w; i += 12) {
        const red = ((i + j) / 12) % 2 === 0;
        R(x + i, y + j, 12, 12, red ? '#B8323A' : '#EFE2C8', c);
        R(x + i, y + j, 12, 1, red ? '#D04A4E' : '#FFF4DE', c);
        R(x + i, y + j + 11, 12, 1, red ? '#962830' : '#D8C8A8', c);
      }
    }
    // brilho do neon refletido no chão, perto da parede
    glow(c, x, y, w, 18, '#F070C8', (i, j) => 0.35 * (1 - j / 18));
  };

  // parede vinho com faixa de azulejo e o rodapé cromado
  WALLS.diner = (c, x, w, h) => {
    R(x, 0, w, h, '#4A1A2A', c);
    for (let i = 0; i < w * h / 30; i++) {
      const v = hash(i, x + 41);
      R(x + v % w, (v >>> 9) % (h - 12), 1, 1, (v >>> 4) % 3 ? '#5A2234' : '#3A1220', c);
    }
    R(x, 0, w, 4, '#1E0E16', c);
    const band = h - 14;
    for (let k = x; k < x + w; k += 8) {
      R(k, band, 8, 10, (k / 8) % 2 ? '#EFE2C8' : '#D8C8A8', c);
      R(k, band, 1, 10, '#B8A888', c);
    }
    R(x, h - 4, w, 3, '#C9CED6', c);
    R(x, h - 4, w, 1, '#F4F6F8', c);
    R(x, h - 1, w, 1, '#5E6470', c);
  };
  EDGES.diner = plainEdge(['#3A1220', '#1E0E16']);

  // letreiro de neon (texto do config): letras rosa com halo pontilhado
  props.neon = {
    layer: 'back',
    size: p => [Gfx.textWidth(p.text || '') * 2 + 20, 26],
    draw(c, p) {
      const [w, h] = props.neon.size(p);
      R(0, 0, w, h, '#1E0E16', c);
      R(1, 1, w - 2, h - 2, '#2A0E1E', c);
      glow(c, 2, 2, w - 4, h - 4, '#7A2A6A', (i, j) => 0.6 - Math.abs(j - h / 2 + 2) / h);
      // halo e letras
      // halo rosa em volta das letras e o tubo claro por cima
      const halo = Gfx.canvas(w, h);
      Gfx.text(p.text || '', 10, 5, '#FF5CC0', { ctx: halo.cx, scale: 2 });
      c.globalAlpha = 0.45;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) c.drawImage(halo, dx, dy);
      c.globalAlpha = 1;
      Gfx.text(p.text || '', 10, 5, '#FFD8F2', { ctx: c, scale: 2 });
      R(4, h - 3, w - 8, 1, '#F2C14E', c);
    }
  };

  // painel de cardápio iluminado: hambúrguer, batata, refrigerante
  props.menuPanel = {
    layer: 'back',
    size: () => [40, 24],
    draw(c, p) {
      R(0, 0, 40, 24, '#1E1826', c);
      R(1, 1, 38, 22, '#FFF4DA', c);
      R(1, 1, 38, 4, '#D8443A', c);
      const k = p.item || 0;
      if (k === 0) { ell(c, 10, 8, 20, 7, '#E0A048'); R(10, 14, 20, 2, '#5DAA3A'); R(10, 16, 20, 2, '#7A4228'); ell(c, 10, 17, 20, 4, '#D8913E'); }
      if (k === 1) { for (let i = 0; i < 6; i++) R(13 + i * 2, 7 + (i % 3), 1, 7, '#F2C42E'); R(12, 13, 14, 7, '#D8283C'); R(16, 15, 6, 2, '#F2C14E'); }
      if (k === 2) { R(15, 8, 10, 13, '#D8443A'); R(15, 8, 10, 2, '#E8ECF2'); R(22, 4, 1, 5, '#F4F0E8'); R(17, 12, 6, 2, '#F4F0E8'); }
      R(30, 18, 7, 3, '#D8443A');
    }
  };

  // janela da cozinha com as fritadeiras acesas
  props.kitchenWindow = {
    layer: 'back',
    size: () => [70, 30],
    draw(c) {
      R(0, 0, 70, 30, '#C9CED6', c);
      R(2, 2, 66, 26, '#3A2A2A', c);
      glow(c, 2, 2, 66, 26, '#E87A2A', (i, j) => 0.2 + 0.5 * (j / 26));
      for (let k = 0; k < 3; k++) {
        R(6 + k * 21, 16, 16, 10, '#8A929E', c);
        R(7 + k * 21, 17, 14, 4, '#F2A02A', c);
        R(7 + k * 21, 17, 14, 1, '#FFE07A', c);
      }
      R(0, 26, 70, 4, '#F4F6F8', c);
      R(0, 29, 70, 1, '#8A929E', c);
    }
  };

  // balcão comprido vermelho com tampo branco e duas caixas registradoras
  props.dinerCounter = {
    size: p => [p.w || 200, 26],
    solid: p => [0, 6, p.w || 200, 18],
    sight: p => [0, 6, p.w || 200, 16],
    base: 24,
    draw(c, p) {
      const w = p.w || 200;
      shadowRect(c, 2, 22, w, 4, 0.35);
      R(0, 6, w, 4, '#F4F6F8', c);
      R(0, 6, w, 1, '#FFFFFF', c);
      R(0, 10, w, 12, '#C8323A', c);
      R(0, 10, w, 1, '#E04A50', c);
      for (let k = 8; k < w; k += 16) R(k, 12, 2, 8, '#A82830', c);
      R(0, 22, w, 2, '#5E6470', c);
      [[24, 0], [w - 52, 0]].forEach(([x]) => {
        R(x, 0, 18, 7, '#3A3F4A', c);
        R(x + 1, 1, 16, 3, '#6AD0A0', c);
        R(x + 2, 2, 6, 1, '#2A6A50', c);
      });
      R(w / 2 - 10, 3, 20, 3, '#D8283C', c);
      R(w / 2 - 9, 3, 18, 1, '#F2687A', c);
    }
  };

  // mesa com sofá vermelho (booth), vista de cima
  props.booth = {
    size: () => [48, 40],
    solid: () => [0, 8, 48, 26],
    sight: () => [0, 0, 6, 34],
    base: 34,
    draw(c) {
      shadowRect(c, 2, 34, 46, 5, 0.35);
      R(0, 0, 6, 34, '#A82830', c);
      R(0, 0, 6, 2, '#E04A50', c);
      R(42, 0, 6, 34, '#A82830', c);
      R(42, 0, 6, 2, '#E04A50', c);
      R(10, 12, 28, 16, '#F4F6F8', c);
      R(10, 12, 28, 1, '#FFFFFF', c);
      R(10, 28, 28, 2, '#8A929E', c);
      R(14, 15, 6, 4, '#D8443A', c);
      R(28, 18, 4, 6, '#F2C42E', c);
    }
  };

  // o Big Jimmy Junk como objeto do cenário (aparece com [show:jimmy] ou [villainArrives]). Já é o
  // desenho da V2: liveNew desenha fora da camada velha, em coordenadas novas (os pés no mesmo ponto
  // do cenário, × 1,25)
  props.jimmy = {
    size: () => [96, 80],
    base: 74,
    liveNew(ctx, p, world) {
      Jimmy.draw(ctx, (p.x + 48) * Legacy.K, (p.y + 74) * Legacy.K, { t: world.t, form: p.form || 'normal' });
    },
    draw() {}
  };

  // ======================================================================
  //  Prólogo, cena 2 · o quarto do apartamento (Apêndice C)
  // ======================================================================

  FLOORS.aptWood = {
    tones: [['#E2C28E', '#D6B27E', '#C8A06C'], ['#E8CA98', '#DCBA86', '#CCA872'], ['#DEBC88', '#D0AC78', '#C29C66']],
    seam: '#A07E52', grain: '#B8945E'
  };

  // parede branca com rodameio de madeira escura
  WALLS.apt = (c, x, w, h) => {
    R(x, 0, w, h, '#F2EEE6', c);
    for (let i = 0; i < w * h / 40; i++) {
      const v = hash(i, x + 77);
      R(x + v % w, (v >>> 9) % h, 1, 1, '#E6E0D4', c);
    }
    R(x, 0, w, 3, '#D8D0C0', c);
    R(x, h - 12, w, 2, '#5E3A20', c);
    R(x, h - 10, w, 9, '#F6F2EA', c);
    R(x, h - 1, w, 1, '#5E3A20', c);
  };
  EDGES.apt = plainEdge(['#E6E0D4', '#C8C0B0']);

  // janela da varanda com a cortina azul lisa
  props.curtainWindow = {
    layer: 'back',
    size: () => [64, 38],
    draw(c) {
      R(0, 0, 64, 38, '#C8C0B0', c);
      Gfx.dither(c, 3, 3, 58, 32, ['#2A3A6E', '#4A5E9A', '#7A8EC0'], 3);
      for (let k = 0; k < 5; k++) R(12 + k * 9, 6 + (k % 2), 1, 1, '#F2E8CC', c);
      [[0, 22], [42, 22]].forEach(([x, w]) => {
        R(x, 0, w, 38, '#4A78C8', c);
        for (let k = x + 3; k < x + w; k += 5) R(k, 1, 1, 36, '#3A64B0', c);
        R(x, 0, w, 2, '#6A98E0', c);
      });
    }
  };

  // ar-condicionado na parede
  props.aircon = {
    layer: 'back',
    size: () => [40, 13],
    draw(c) {
      R(0, 0, 40, 12, '#F8F8F4', c);
      R(0, 11, 40, 2, '#C9CED6', c);
      R(2, 8, 36, 2, '#B4BAC4', c);
      R(33, 3, 3, 1, '#5DD07A', c);
    }
  };

  // portas de correr do armário embutido, de madeira marrom
  props.closet = {
    layer: 'back',
    size: () => [56, 38],
    draw(c) {
      R(0, 0, 56, 38, '#5E3A20', c);
      R(2, 2, 25, 36, '#8A5A32', c);
      R(29, 2, 25, 36, '#8A5A32', c);
      R(2, 2, 25, 1, '#A87442', c);
      R(29, 2, 25, 1, '#A87442', c);
      R(23, 18, 2, 6, '#3A2214', c);
      R(31, 18, 2, 6, '#3A2214', c);
    }
  };

  // colchão azul no chão com travesseiros azul-claros
  props.mattress = {
    size: () => [56, 70],
    solid: () => [0, 4, 56, 64],
    base: 10,
    draw(c) {
      shadowRect(c, 2, 4, 56, 66, 0.25);
      R(0, 2, 56, 66, '#2E4AA8', c);
      R(0, 2, 56, 2, '#4A68C8', c);
      R(1, 66, 54, 2, '#1E3478', c);
      R(6, 6, 20, 10, '#9AB4EC', c);
      R(30, 6, 20, 10, '#9AB4EC', c);
      R(7, 7, 18, 2, '#C0D2F6', c);
      R(31, 7, 18, 2, '#C0D2F6', c);
      // cobertor azul-marinho dobrado no pé
      R(0, 44, 56, 22, '#1E2A4A', c);
      R(0, 44, 56, 2, '#3A4A7A', c);
      for (let k = 4; k < 56; k += 9) R(k, 50, 4, 1, '#2A3A62', c);
    }
  };

  // tapete cinza felpudo
  props.fluffyRug = {
    layer: 'back',
    size: () => [80, 40],
    draw(c) {
      ell(c, 0, 0, 80, 40, '#8A8A8E');
      ell(c, 2, 2, 76, 36, '#A8A8AC');
      for (let i = 0; i < 160; i++) {
        const v = hash(i, 5), x = 6 + v % 68, y = 4 + (v >>> 8) % 32;
        if (((x - 40) / 38) ** 2 + ((y - 20) / 18) ** 2 < 1) R(x, y, 1, 2, (v >>> 3) % 2 ? '#BCBCC0' : '#96969A', c);
      }
    }
  };

  // mesinha branca baixa (de sentar no chão)
  props.lowTable = {
    size: () => [36, 22],
    solid: () => [0, 4, 36, 16],
    base: 18,
    draw(c) {
      shadowRect(c, 2, 16, 36, 5, 0.3);
      R(0, 2, 36, 14, '#F8F6F2', c);
      R(0, 2, 36, 1, '#FFFFFF', c);
      R(0, 14, 36, 2, '#C9C2B0', c);
      R(2, 16, 3, 4, '#C9C2B0', c);
      R(31, 16, 3, 4, '#C9C2B0', c);
      R(8, 6, 6, 5, '#F2F0EA', c); R(9, 7, 4, 3, '#C88A5A', c);
      R(22, 6, 8, 6, '#E8E0D0', c);
    }
  };

  // ======================================================================
  //  Prólogo, cena 3 · o laboratório: o quadro do Tony, as plantas e amostras da Heymans,
  //  o caderno do Dr King na mesa e a máquina do tempo no centro
  // ======================================================================

  FLOORS.labTile = (c, x, y, w, h) => {
    for (let j = 0; j < h; j += 16) {
      for (let i = 0; i < w; i += 16) {
        const v = hash(i + x, j) % 3;
        R(x + i, y + j, 16, 16, ['#C8CED6', '#C2C8D0', '#CCD2DA'][v], c);
        R(x + i, y + j, 16, 1, '#DCE2EA', c);
        R(x + i, y + j, 1, 16, '#DCE2EA', c);
        R(x + i + 15, y + j, 1, 16, '#A8AEB8', c);
        R(x + i, y + j + 15, 16, 1, '#A8AEB8', c);
      }
    }
  };

  WALLS.lab = (c, x, w, h) => {
    R(x, 0, w, h, '#D8E2DA', c);
    for (let i = 0; i < w * h / 34; i++) {
      const v = hash(i, x + 13);
      R(x + v % w, (v >>> 9) % h, 1, 1, '#CAD6CE', c);
    }
    R(x, 0, w, 4, '#5E6A70', c);
    R(x, 4, w, 1, '#8A969C', c);
    R(x, h - 8, w, 7, '#8A969C', c);
    R(x, h - 8, w, 1, '#A8B4BA', c);
    R(x, h - 1, w, 1, '#4A5258', c);
  };
  EDGES.lab = plainEdge(['#A8B4BA', '#6A767C']);

  // quadro-negro cheio de contas (rabiscos de giz)
  props.blackboard = {
    layer: 'back',
    size: () => [112, 40],
    draw(c) {
      R(0, 0, 112, 40, '#8A5A32', c);
      R(2, 2, 108, 34, '#2A4A3A', c);
      for (let row = 0; row < 5; row++) {
        let x = 6 + (row % 2) * 4;
        while (x < 104) {
          const v = hash(row * 31 + x, 7), len = 3 + v % 9;
          const y = 6 + row * 6;
          if (v % 7 === 0) { R(x, y + 1, 3, 1, '#E8ECE8', c); R(x + 1, y, 1, 3, '#E8ECE8', c); x += 6; continue; }
          for (let k = 0; k < len; k++) if ((v >>> k) & 1 || k === 0) R(x + k, y + ((v >>> (k + 3)) & 1), 1, 1 + ((v >>> (k + 5)) & 1), '#E8ECE8', c);
          x += len + 3;
        }
      }
      // uma equação mais clara e um diagrama
      R(70, 25, 26, 1, '#F2E8A0', c);
      ell(c, 14, 24, 12, 8, '#2A4A3A');
      R(20, 24, 1, 8, '#E8ECE8', c); R(14, 28, 12, 1, '#E8ECE8', c);
      R(0, 36, 112, 4, '#6A4228', c);
      R(10, 36, 8, 2, '#F4F4F0', c);
      R(24, 37, 5, 1, '#F2C8D8', c);
    }
  };

  // prateleira da Heymans: plantas e frascos de amostras
  props.plantShelf = {
    layer: 'back',
    size: () => [88, 46],
    draw(c) {
      [10, 26, 42].forEach(y => { R(0, y, 88, 3, '#F4F6F8', c); R(0, y + 3, 88, 1, '#A8B0B8', c); });
      const plants = [[6, 10], [30, 26], [62, 10], [12, 42], [70, 42]];
      plants.forEach(([x, y], i) => {
        R(x, y - 6, 9, 6, '#C8724A', c); R(x, y - 6, 9, 1, '#E08A5A', c);
        for (let k = 0; k < 5; k++) R(x - 1 + k * 2, y - 12 + (k % 2) * 2, 2, 7, i % 2 ? '#3F8A4E' : '#5DAA62', c);
      });
      const jars = [[22, 10, '#7FD0E0'], [46, 10, '#F2A8C8'], [52, 26, '#B8E07A'], [8, 26, '#F2E07A'], [36, 42, '#A8C8F0'], [52, 42, '#E8B07A']];
      jars.forEach(([x, y, col]) => {
        R(x, y - 8, 6, 8, '#E8F2F4', c);
        R(x + 1, y - 5, 4, 5, col, c);
        R(x + 1, y - 9, 4, 1, '#8A929E', c);
        R(x + 1, y - 7, 1, 2, '#FFFFFF', c);
      });
    }
  };

  // relógio redondo
  props.labClock = {
    layer: 'back',
    size: () => [14, 14],
    draw(c) {
      ell(c, 0, 0, 14, 14, '#4A5258');
      ell(c, 1, 1, 12, 12, '#F8F8F4');
      R(6, 3, 1, 4, '#1E1826', c);
      R(7, 6, 3, 1, '#1E1826', c);
    }
  };

  // mesa de trabalho com o caderno de couro marrom do Dr King
  props.labDesk = {
    size: () => [64, 30],
    solid: () => [0, 6, 64, 20],
    sight: () => null,
    base: 26,
    draw(c) {
      shadowRect(c, 2, 24, 64, 5, 0.3);
      R(0, 6, 64, 16, '#8A929E', c);
      R(0, 6, 64, 2, '#C9CED6', c);
      R(0, 22, 64, 3, '#5E6470', c);
      R(2, 25, 3, 4, '#5E6470', c); R(59, 25, 3, 4, '#5E6470', c);
      // o caderno do Dr King (couro marrom gasto)
      R(8, 8, 18, 12, '#5A3420', c);
      R(9, 9, 16, 10, '#7A4A2A', c);
      R(9, 9, 16, 1, '#9A6238', c);
      R(16, 8, 1, 12, '#3A2214', c);
      R(20, 12, 3, 2, '#C9A24A', c);
      // papéis, caneca e um tubo de ensaio
      R(34, 9, 12, 9, '#F4F0E6', c); R(36, 11, 8, 1, '#8A929E', c); R(36, 13, 6, 1, '#8A929E', c);
      R(50, 9, 6, 7, '#F2F0EA', c); R(51, 10, 4, 3, '#6A3A22', c);
    }
  };

  // a máquina do tempo: um anel de metal com luzes; p.on: 0 desligada, 1 faiscando, 2 pronta
  props.timeMachine = {
    size: () => [60, 70],
    solid: () => [6, 52, 48, 14],
    sight: () => [6, 30, 48, 36],
    base: 64,
    live(ctx, p, world) {
      const x = p.x, y = p.y, t = world.t, on = p.on || 0;
      Gfx.shadow(x + 30, y + 62, 56, 10);
      // base
      Gfx.rect(x + 4, y + 52, 52, 12, '#4A5258');
      Gfx.rect(x + 4, y + 52, 52, 2, '#8A969C');
      for (let k = 0; k < 6; k++) Gfx.rect(x + 8 + k * 8, y + 57, 4, 2, on && Math.floor(t * 4 + k) % 2 ? '#5DE0A0' : '#2A3A34');
      // anel
      ctx.save();
      for (let a = 0; a < 64; a++) {
        const ang = a / 64 * Math.PI * 2;
        const rx = x + 30 + Math.cos(ang) * 24, ry = y + 30 + Math.sin(ang) * 26;
        Gfx.rect(Math.round(rx) - 2, Math.round(ry) - 2, 5, 5, '#5E6A70');
      }
      for (let a = 0; a < 64; a++) {
        const ang = a / 64 * Math.PI * 2;
        const rx = x + 30 + Math.cos(ang) * 24, ry = y + 30 + Math.sin(ang) * 26;
        Gfx.rect(Math.round(rx) - 1, Math.round(ry) - 1, 3, 3, ang > Math.PI ? '#A8B4BA' : '#8A969C');
      }
      // luzes no anel
      for (let k = 0; k < 8; k++) {
        const ang = k / 8 * Math.PI * 2 + (on === 2 ? t * 1.5 : 0);
        const lit = on === 2 || (on === 1 && Math.sin(t * 9 + k * 2) > 0.6);
        Gfx.rect(Math.round(x + 30 + Math.cos(ang) * 24) - 1, Math.round(y + 30 + Math.sin(ang) * 26) - 1, 3, 3, lit ? '#7FF0D8' : '#2A3A44');
      }
      // dentro do anel
      if (on === 2) {
        for (let r = 20; r > 2; r -= 3) {
          ctx.globalAlpha = 0.25;
          const k = (r + Math.floor(t * 18)) % 3;
          Gfx.rect(x + 30 - r * 0.9, y + 30 - r, r * 1.8, r * 2, ['#5DE0D0', '#9A7AF0', '#F2F0FF'][k]);
        }
        ctx.globalAlpha = 1;
      } else if (on === 1 && Math.sin(t * 13) > 0.8) {
        Gfx.rect(x + 22, y + 20, 2, 2, '#F2F0A0'); Gfx.rect(x + 36, y + 34, 2, 2, '#F2F0A0');
      }
      ctx.restore();
      // cabos no chão
      Gfx.rect(x + 56, y + 60, 18, 2, '#2A2E36');
      Gfx.rect(x - 14, y + 62, 18, 2, '#2A2E36');
    },
    draw() {}
  };

  // painel de controle ao lado da máquina
  props.console = {
    size: () => [26, 30],
    solid: () => [0, 14, 26, 14],
    sight: () => null,
    base: 28,
    draw(c) {
      shadowRect(c, 2, 26, 26, 4, 0.3);
      R(0, 8, 26, 20, '#5E6470', c);
      R(0, 8, 26, 2, '#8A929E', c);
      R(3, 0, 20, 12, '#2A2E36', c);
      R(4, 1, 18, 9, '#2A6A5A', c);
      for (let k = 0; k < 4; k++) R(6 + k * 4, 3 + (k % 2) * 3, 3, 1, '#7FF0D8', c);
      [[4, 16, '#D8443A'], [10, 16, '#F2C14E'], [16, 16, '#5DD07A'], [4, 21, '#5DA8F0']].forEach(([x, y, col]) => R(x, y, 4, 3, col, c));
    }
  };

  // ======================================================================
  //  Fase 5 · a livraria-café, hoje (fotos SHOP_*)
  // ======================================================================

  // carpete escuro
  FLOORS.carpet = (c, x, y, w, h) => {
    R(x, y, w, h, '#33343C', c);
    for (let i = 0; i < w * h / 6; i++) {
      const v = hash(i, x + 91);
      R(x + v % w, y + (v >>> 9) % h, 1, 1, (v >>> 4) % 3 ? '#3A3B44' : '#2C2D34', c);
    }
  };

  // parede creme com teto preto, sanca branca e a janela no fundo
  WALLS.shop = (c, x, w, h) => {
    R(x, 0, w, h, '#EFE2BC', c);
    for (let i = 0; i < w * h / 40; i++) {
      const v = hash(i, x + 63);
      R(x + v % w, 10 + (v >>> 9) % (h - 12), 1, 1, '#E2D4AC', c);
    }
    // corações pintados na parede (como na foto)
    for (let k = 0; k < 7; k++) {
      const v = hash(k, 9), hx = x + 150 + v % 70, hy = 20 + (v >>> 8) % 30;
      R(hx, hy, 1, 1, '#8A8478', c); R(hx + 2, hy, 1, 1, '#8A8478', c); R(hx + 1, hy + 1, 1, 1, '#8A8478', c);
    }
    R(x, 0, w, 8, '#26272E', c);
    R(x, 8, w, 2, '#F4F2EC', c);
    R(x, h - 2, w, 2, '#C8B890', c);
  };
  EDGES.shop = (c, x, top, gap, side) => {
    // parede da esquerda: a estante branca de nichos continua descendo
    if (side === 'left') {
      R(x - 4, top - 8, 18, 192 - top + 8, '#F4F2EC', c);
      for (let y = top - 6; y < 192; y += 18) {
        R(x - 2, y, 14, 15, '#3A3830', c);
        for (let k = 0; k < 5; k++) {
          const v = hash(y, k);
          R(x - 1 + k * 3 - (v % 2), y + 3 + v % 4, 2, 11 - v % 4, ['#D8443A', '#4A78C8', '#F2C14E', '#5DAA62', '#E8E0D0', '#8A5AB8'][v % 6], c);
        }
        R(x - 4, y + 15, 18, 3, '#F4F2EC', c);
        R(x - 4, y + 17, 18, 1, '#C8C4B8', c);
      }
      R(x + 14, top - 8, 1, 192 - top + 8, '#C8C4B8', c);
      return;
    }
    R(x, top - 8, 4, 192 - top + 8, '#E2D4AC', c);
    R(x, top - 8, 1, 192 - top + 8, '#C8B890', c);
  };

  // estante branca de nichos na parede, cheia de livros, com etiquetas (A05, B23...)
  props.cubeShelf = {
    layer: 'back',
    size: p => [p.w || 120, 62],
    draw(c, p) {
      const w = p.w || 120, cols = Math.floor(w / 20), rows = 3;
      R(0, 0, w, 62, '#F4F2EC', c);
      R(w - 1, 0, 1, 62, '#C8C4B8', c);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = 2 + i * 20, y = 3 + j * 19, v = hash(i * 7 + j, 33);
          R(x, y, 17, 15, '#3A3830', c);
          if (v % 9 === 0) {
            // nicho com um enfeite em vez de livros
            R(x + 5, y + 7, 7, 8, '#C8724A', c); R(x + 6, y + 3, 5, 4, '#5DAA62', c);
          } else {
            let bx = x + 1;
            while (bx < x + 16) {
              const b = hash(bx, j + 3), bw = 2 + b % 2, bh = 9 + b % 5;
              if (bx + bw > x + 16) break;
              R(bx, y + 15 - bh, bw, bh, ['#D8443A', '#4A78C8', '#F2C14E', '#5DAA62', '#E8E0D0', '#8A5AB8', '#F08AA8', '#2E8A8A'][b % 8], c);
              R(bx, y + 15 - bh, 1, bh, '#FFFFFF33', c);
              bx += bw;
            }
          }
          // prateleira e etiqueta
          R(x - 2, y + 15, 21, 2, '#F4F2EC', c);
          R(x + 7, y + 15, 4, 1, (i + j) % 2 ? '#4A78C8' : '#F2C14E', c);
        }
      }
      R(0, 59, w, 3, '#E2DED2', c);
    }
  };

  // janela do fundo
  props.shopWindow = {
    layer: 'back',
    size: () => [30, 36],
    draw(c) {
      R(0, 0, 30, 36, '#F4F2EC', c);
      Gfx.dither(c, 2, 2, 26, 32, ['#CFE6F6', '#E8F2FA', '#BFD6E8'], 3);
      R(2, 22, 26, 12, '#9AA8B8', c);
      R(4, 24, 7, 10, '#B8C4D0', c); R(16, 26, 9, 8, '#A8B4C2', c);
      R(14, 2, 2, 32, '#F4F2EC', c);
      R(2, 16, 26, 2, '#F4F2EC', c);
    }
  };

  // parede do balcão: prateleira preta com livros, quadros autografados, xícaras e a luminária de
  // casquinha de sorvete (sem marca)
  props.counterWall = {
    layer: 'back',
    size: () => [120, 56],
    draw(c) {
      R(0, 0, 120, 56, '#F2F2EE', c);
      // prateleira de livros em cima
      R(0, 6, 120, 15, '#1E1C22', c);
      let bx = 3;
      while (bx < 116) {
        const b = hash(bx, 11), bw = 2 + b % 2, bh = 8 + b % 4;
        R(bx, 19 - bh, bw, bh, ['#E8E0D0', '#D8443A', '#4A78C8', '#F2C14E', '#5DAA62', '#F08AA8', '#2E8A8A', '#F4F4F0'][b % 8], c);
        bx += bw;
      }
      R(0, 19, 120, 2, '#2A282E', c);
      // quadros autografados (shikishi)
      for (let k = 0; k < 6; k++) {
        R(4 + k * 13, 24, 11, 11, '#F8F6EE', c);
        R(4 + k * 13, 34, 11, 1, '#C8C2B0', c);
        R(6 + k * 13, 27 + (k % 2), 6, 1, '#3A3A48', c);
        R(7 + k * 13, 30, 4 + (k % 3), 1, '#3A3A48', c);
      }
      // xícaras numa prateleira preta
      R(4, 44, 74, 2, '#1E1C22', c);
      for (let k = 0; k < 7; k++) {
        R(7 + k * 10, 40, 5, 4, ['#4AA8B8', '#F4F4F0', '#2E3A4A', '#F4F4F0', '#4AA8B8', '#8A929E', '#2E3A4A'][k], c);
        R(12 + k * 10, 41, 1, 2, '#8A929E', c);
      }
      // a luminária de casquinha de sorvete
      ell(c, 92, 24, 14, 10, '#FFFDF6');
      ell(c, 94, 20, 10, 8, '#FFFDF6');
      R(97, 17, 4, 4, '#FFFDF6', c);
      R(99, 15, 1, 2, '#FFFDF6', c);
      for (let j = 0; j < 18; j++) {
        const hw = Math.round(7 - j * 0.38);
        R(99 - hw, 33 + j, hw * 2, 1, j % 3 ? '#F2A23A' : '#D8862A', c);
      }
      glow(c, 82, 12, 34, 30, '#FFF4C8', (i, j) => Math.max(0, 0.5 - Math.hypot(i - 17, j - 12) / 34));
      R(0, 52, 120, 4, '#E6E6E0', c);
    }
  };

  // balcão branco com tampo preto, máquina de café e caixa
  props.shopCounter = {
    size: () => [100, 30],
    solid: () => [0, 8, 100, 18],
    sight: () => [0, 8, 100, 16],
    base: 26,
    draw(c) {
      shadowRect(c, 2, 24, 100, 5, 0.35);
      R(0, 8, 100, 4, '#1E1C22', c);
      R(0, 8, 100, 1, '#3A3840', c);
      R(0, 12, 100, 12, '#F4F4F0', c);
      for (let k = 0; k < 100; k += 25) { R(k, 12, 1, 12, '#C9CED6', c); R(k + 11, 16, 3, 1, '#A8AEB8', c); }
      R(0, 24, 100, 2, '#C9CED6', c);
      // máquina de café (preta e prata)
      R(62, 0, 22, 10, '#2A2A30', c);
      R(64, 1, 18, 3, '#8A929E', c);
      R(66, 5, 4, 3, '#C9CED6', c); R(74, 5, 4, 3, '#C9CED6', c);
      R(80, 2, 2, 2, '#F2C14E', c);
      // caixa
      R(12, 2, 16, 7, '#2A2E36', c);
      R(13, 3, 14, 3, '#5DA8C8', c);
      // copos e porta-guardanapo
      R(40, 4, 3, 5, '#E8F2F4', c); R(44, 4, 3, 5, '#E8F2F4', c); R(48, 4, 3, 5, '#E8F2F4', c);
    }
  };

  // a escada para o 2º andar, à direita do balcão (degraus subindo para o fundo)
  props.stairs = {
    layer: 'back',
    size: () => [52, 92],
    draw(c) {
      for (let k = 0; k < 9; k++) {
        const y = 82 - k * 9, x = 4 + k * 2, w = 44 - k * 2;
        R(x, y, w, 9, k % 2 ? '#8A6A48' : '#9A7A56', c);
        R(x, y, w, 2, '#B8946A', c);
        R(x, y + 8, w, 1, '#5E4630', c);
      }
      // corrimão preto
      for (let k = 0; k < 10; k++) R(48 - k * 0, 10 + k * 8, 2, 8, '#2A2830', c);
      R(0, 0, 4, 92, '#E2D4AC', c);
      // um tapetinho na base
      R(8, 86, 36, 6, '#6A2E3A', c);
      R(8, 86, 36, 1, '#8A4050', c);
    }
  };

  // mesa preta quadrada com duas cadeiras de encosto curvo (madeira clara, hastes pretas em X)
  props.shopTable = {
    size: () => [40, 46],
    solid: () => [6, 14, 28, 18],
    sight: () => null,
    base: 34,
    draw(c) {
      // cadeira de trás (encosto curvo visto de frente)
      R(12, 0, 16, 8, '#C89A62', c); R(12, 0, 16, 1, '#E0B880', c);
      R(14, 3, 1, 4, '#1E1C22', c); R(25, 3, 1, 4, '#1E1C22', c);
      shadowRect(c, 4, 30, 34, 5, 0.35);
      R(4, 10, 32, 20, '#2A282E', c);
      R(4, 10, 32, 2, '#46424C', c);
      R(4, 28, 32, 2, '#141218', c);
      R(6, 30, 2, 4, '#141218', c); R(32, 30, 2, 4, '#141218', c);
      // xícara preta e copo d'água
      R(10, 15, 5, 4, '#1E1C22', c); R(15, 16, 1, 2, '#1E1C22', c);
      R(26, 14, 4, 5, '#D8ECF4', c);
      // cadeira da frente (de costas para a câmera)
      R(12, 32, 16, 12, '#C89A62', c);
      R(12, 32, 16, 2, '#E0B880', c);
      R(13, 35, 2, 9, '#1E1C22', c); R(25, 35, 2, 9, '#1E1C22', c);
      R(15, 38, 10, 1, '#1E1C22', c); R(17, 36, 6, 1, '#1E1C22', c);
    }
  };

  // divisória de vidro deslizante com moldura de madeira, revisteiro e mural de avisos
  props.glassPartition = {
    size: () => [44, 62],
    solid: () => [0, 50, 44, 8],
    sight: () => null,
    base: 56,
    draw(c) {
      // vidro (bloqueia a passagem, mas não a visão)
      R(0, 0, 4, 58, '#D8C8A8', c);
      R(40, 0, 4, 58, '#D8C8A8', c);
      R(0, 0, 44, 3, '#D8C8A8', c);
      alpha(c, 0.35, () => R(4, 3, 36, 55, '#BFE0F0', c));
      R(8, 6, 1, 20, '#FFFFFF', c); R(10, 6, 1, 8, '#FFFFFF', c);
      // revisteiro de madeira
      R(6, 30, 32, 3, '#6A4A30', c);
      for (let k = 0; k < 4; k++) R(8 + k * 8, 18, 6, 12, ['#8A5A3A', '#C8724A', '#5A6A8A', '#A88A5A'][k], c);
      R(6, 44, 32, 3, '#6A4A30', c);
      for (let k = 0; k < 4; k++) R(8 + k * 8, 34, 6, 10, ['#5A6A8A', '#8A5A3A', '#A88A5A', '#C8724A'][k], c);
      R(0, 56, 44, 2, '#A8946E', c);
    }
  };

  // mural de avisos (papéis coloridos)
  props.noticeBoard = {
    layer: 'back',
    size: () => [22, 34],
    draw(c) {
      R(0, 0, 22, 34, '#F4F2EC', c);
      const papers = [[2, 2, 8, 9, '#F2E07A'], [12, 2, 8, 7, '#A8D8F0'], [2, 13, 8, 8, '#F2B0C8'], [12, 11, 8, 10, '#C8E8A8'], [2, 23, 9, 9, '#F4F4F0'], [13, 23, 7, 9, '#F2C88A']];
      papers.forEach(([x, y, w, h, col]) => { R(x, y, w, h, col, c); R(x + 1, y + 2, w - 3, 1, '#8A8478', c); R(x + 1, y + 4, w - 4, 1, '#8A8478', c); });
    }
  };

  // luminária geométrica dourada com planta pendurada (fica por cima de tudo, presa no teto)
  props.geoLamp = {
    hidden: true,
    size: () => [1, 1],
    fx(ctx, p, world) {
      const x = Math.round(p.x), y = Math.round(p.y);
      Gfx.rect(x, 0, 1, y - 6, '#1E1C22');
      const lit = 0.55 + 0.1 * Math.sin(world.t * 2 + p.x);
      ctx.globalAlpha = lit * 0.5;
      for (let r = 10; r > 0; r -= 3) Gfx.rect(x - r, y - r / 2, r * 2, r, '#FFF4C8');
      ctx.globalAlpha = 1;
      // a gaiola dourada (losango)
      for (let k = 0; k < 6; k++) { Gfx.rect(x - k, y - 6 + k, 1, 1, '#C9A24A'); Gfx.rect(x + k, y - 6 + k, 1, 1, '#C9A24A'); Gfx.rect(x - 5 + k, y + k, 1, 1, '#C9A24A'); Gfx.rect(x + 5 - k, y + k, 1, 1, '#C9A24A'); }
      Gfx.rect(x - 1, y - 1, 3, 3, '#FFF4C8');
      // folhas penduradas
      for (let k = 0; k < 7; k++) {
        const lx = x - 6 + k * 2, len = 3 + (k * 5) % 7;
        for (let j = 0; j < len; j++) Gfx.rect(lx + (j % 2), y + 2 + j, 1, 1, j % 3 ? '#5DAA3A' : '#8AD060');
      }
    }
  };
})();
