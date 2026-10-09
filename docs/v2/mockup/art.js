// Mockup "32 bits" do F1 A2 (sorvete na Mirai Tower): tudo desenhado pixel a pixel em 480×270.
(() => {
  const W = 480, H = 270, TOP = 30, GROUND = 122, PATH0 = 170, PATH1 = 206;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H), D = img.data;

  // ---------- cores e pixels ----------
  const cache = {};
  const rgb = c => {
    if (Array.isArray(c)) return c;
    if (cache[c]) return cache[c];
    return (cache[c] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
  };
  const mix = (a, b, t) => { a = rgb(a); b = rgb(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  const mul = (a, k) => { a = rgb(a); return [a[0] * k[0], a[1] * k[1], a[2] * k[2]]; };
  const c01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bay = (x, y) => (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
  const pick = (ramp, t, x, y) => {
    t = c01(t);
    const f = t * (ramp.length - 1);
    let i = Math.floor(f);
    if (f - i > bay(x, y)) i++;
    return ramp[Math.min(ramp.length - 1, i)];
  };
  const hash = (x, y, s = 0) => {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const vnoise = (x, y, sc, s = 0) => {
    const gx = x / sc, gy = y / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(x0, y0, s), b = hash(x0 + 1, y0, s), c = hash(x0, y0 + 1, s), d = hash(x0 + 1, y0 + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  function put(x, y, c, a = 1) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
    const i = (y * W + x) * 4, v = rgb(c);
    if (a >= 1) { D[i] = v[0]; D[i + 1] = v[1]; D[i + 2] = v[2]; }
    else { D[i] += (v[0] - D[i]) * a; D[i + 1] += (v[1] - D[i + 1]) * a; D[i + 2] += (v[2] - D[i + 2]) * a; }
    D[i + 3] = 255;
  }
  const get = (x, y) => { const i = (y * W + x) * 4; return [D[i], D[i + 1], D[i + 2]]; };
  const rect = (x, y, w, h, c, a = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c, a); };
  // transparência em degraus (como a mistura de cores dos 16 bits)
  const tput = (x, y, c, a) => put(x, y, c, Math.round(c01(a) * 8) / 8);
  function line(x0, y0, x1, y1, c, a = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      put(x0, y0, c, a);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }

  // ---------- sprites ----------
  const spr = (w, h) => ({ w, h, c: new Array(w * h).fill(null) });
  const sset = (s, x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < s.w && y < s.h) s.c[y * s.w + x] = c === null ? null : rgb(c); };
  const sget = (s, x, y) => (x >= 0 && y >= 0 && x < s.w && y < s.h ? s.c[y * s.w + x] : null);
  // contorno de fora com a cor de dentro escurecida (selout)
  function outline(s, k = 0.38) {
    const add = [];
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      if (sget(s, x, y)) continue;
      let n = null;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const v = sget(s, x + dx, y + dy);
        if (v && (!n || v[0] + v[1] + v[2] < n[0] + n[1] + n[2])) n = v;
      }
      if (n) add.push([x, y, [n[0] * k + 26 * (1 - k) * 0.6, n[1] * k + 18 * (1 - k) * 0.6, n[2] * k + 34 * (1 - k) * 0.6]]);
    }
    add.forEach(([x, y, c]) => sset(s, x, y, c));
    return s;
  }
  const blit = (s, ox, oy) => { for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.c[y * s.w + x]; if (c) put(ox + x, oy + y, c); } };
  const L = (() => { const v = [-0.55, -0.72, 0.42], m = Math.hypot(...v); return v.map(a => a / m); })();
  const sphere = (nx, ny) => { const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)); return c01(0.5 + 0.62 * (nx * L[0] + ny * L[1] + nz * L[2])); };
  // elipse sombreada como esfera dentro do sprite
  function ball(s, cx, cy, rx, ry, ramp, bias = 0, cond = null) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny > 1) continue;
      if (cond && !cond(x, y, nx, ny)) continue;
      sset(s, x, y, pick(ramp, sphere(nx, ny) + bias, x, y));
    }
  }
  // membro grosso de (x0,y0) a (x1,y1), claro do lado esquerdo
  function limb(s, x0, y0, x1, y1, w, ramp, bias = 0) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      for (let i = 0; i < w; i++) {
        const px = Math.round(x - w / 2 + i + 0.5), py = Math.round(y);
        sset(s, px, py, pick(ramp, 0.85 - (i / Math.max(1, w - 1)) * 0.7 + bias, px, py));
      }
    }
  }

  // ---------- sombras compridas da tarde ----------
  const SH = new Uint8Array(W * H);
  function castShadow(s, ox, oy, by, k = [0.95, 0.34]) {
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      if (!s.c[y * s.w + x]) continue;
      const h = Math.max(0, by - (oy + y));
      const tx = Math.round(ox + x + h * k[0]), ty = Math.round(by + h * k[1]);
      for (const dx of [0, 1]) if (ty >= GROUND && ty < H && tx + dx < W) SH[ty * W + tx + dx] = 1;
    }
  }
  function contact(cx, cy, rx, ry) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) { const i = (cy + y) * W + cx + x; if (i >= 0 && i < W * H) SH[i] = 2; }
  }
  function applyShadows() {
    for (let y = GROUND; y < H; y++) for (let x = 0; x < W; x++) {
      const v = SH[y * W + x];
      if (!v) continue;
      const c = get(x, y);
      put(x, y, mul(c, v === 2 ? [0.5, 0.55, 0.66] : [0.64, 0.7, 0.82]));
    }
  }

  // ======================================================================
  // céu
  const SKY = ['#3A72C6', '#4580D0', '#528ED8', '#619CDF', '#72AAE4', '#86B8E8', '#9BC5EB', '#B1D1EC', '#C7DCEA', '#DBE2E0', '#ECE2CC'];
  for (let y = TOP; y < GROUND; y++) for (let x = 0; x < W; x++) {
    put(x, y, pick(SKY, (y - TOP) / (GROUND - 8 - TOP) + (vnoise(x, y, 40, 3) - 0.5) * 0.05, x, y));
  }
  // sol e brilho
  const SUN = [62, 56];
  for (let y = TOP; y < GROUND; y++) for (let x = 0; x < 200; x++) {
    const r = Math.hypot(x - SUN[0], y - SUN[1]);
    if (r < 64) put(x, y, '#FFF2CC', c01(Math.pow(1 - r / 64, 2) * 0.75 + (bay(x, y) - 0.5) * 0.06));
    if (r < 8.5) put(x, y, r < 5.5 ? '#FFFEF4' : pick(['#FFE7A0', '#FFF4CC', '#FFFEF4'], 1 - (r - 5.5) / 3, x, y));
  }
  // nuvens (cúmulos): bolas sombreadas, base reta
  function cloud(cx, cy, parts, flat) {
    const RAMP = ['#AFB9DA', '#C2CCE6', '#D6DEF0', '#E9EEF7', '#FAFBFD', '#FFFFFF'];
    let x0 = 1e9, x1 = -1e9, y0 = 1e9;
    parts.forEach(([dx, dy, r]) => { x0 = Math.min(x0, cx + dx - r); x1 = Math.max(x1, cx + dx + r); y0 = Math.min(y0, cy + dy - r); });
    for (let y = Math.floor(y0); y <= cy + flat; y++) for (let x = Math.floor(x0); x <= x1; x++) {
      let best = null;
      parts.forEach(([dx, dy, r]) => { const d = Math.hypot(x + 0.5 - cx - dx, y + 0.5 - cy - dy) / r; if (d <= 1 && (!best || dy - r < best.top)) best = { nx: (x + 0.5 - cx - dx) / r, ny: (y + 0.5 - cy - dy) / r, top: dy - r, d }; });
      if (!best) continue;
      let t = sphere(best.nx, best.ny) * 0.75 + 0.35 - ((y - y0) / (cy + flat - y0)) * 0.35;
      const edge = best.d > 0.88;
      let c = pick(RAMP, t, x, y);
      if (best.nx < -0.55 && t > 0.6) c = mix(c, '#FFEBD0', 0.45);      // borda do lado do sol
      if (edge && bay(x, y) < 0.5) c = mix(get(x, y), c, 0.6);
      put(x, y, c);
    }
  }
  cloud(160, 58, [[-22, 2, 9], [-10, -4, 12], [5, -7, 13], [19, -1, 10], [30, 3, 7], [-30, 5, 6]], 6);
  cloud(338, 48, [[-12, 0, 8], [0, -5, 10], [13, -1, 8], [22, 3, 5]], 5);
  cloud(440, 70, [[-8, 0, 6], [2, -3, 7], [11, 1, 5]], 4);
  cloud(26, 88, [[-6, 0, 5], [3, -2, 6], [11, 1, 4]], 3);

  // prédios ao longe (duas camadas, a de trás mais apagada)
  function skyline(base, seed, hmin, hmax, ramp, win, warm) {
    let x = -4;
    while (x < W) {
      const w = 9 + Math.floor(hash(x, 1, seed) * 18), h = hmin + Math.floor(hash(x, 2, seed) * (hmax - hmin));
      const top = base - h;
      for (let y = top; y < base; y++) for (let i = 0; i < w; i++) {
        const px = x + i;
        let c = i < 2 ? ramp[2] : i > w - 3 ? ramp[0] : ramp[1];
        if (y === top) c = ramp[3];
        if (i > 1 && i < w - 2 && y > top + 2 && (y - top) % 3 === 1 && (i % 3) === 1) c = hash(px, y, seed + 9) < 0.1 && warm ? warm : win;
        put(px, y, c);
      }
      if (hash(x, 3, seed) < 0.4) { const ax = x + 2 + Math.floor(hash(x, 4, seed) * (w - 4)); line(ax, top - 1, ax, top - 4 - Math.floor(hash(x, 5, seed) * 4), ramp[0]); }
      if (hash(x, 6, seed) < 0.35) rect(x + 2, top - 2, 4, 2, ramp[0]);
      x += w + (hash(x, 7, seed) < 0.3 ? 2 : 0);
    }
  }
  skyline(110, 11, 6, 20, ['#9EB7CE', '#AFC6DA', '#BED2E3', '#CADBE8'], '#BCD0E2', null);
  skyline(117, 23, 8, 26, ['#7F9AB7', '#8EA8C3', '#A0B8D0', '#B0C6DA'], '#A3BCD3', '#F4E4B8');

  // a Mirai Tower: treliça de aço com o mirante fechado, o mirante aberto e a antena
  const TX = 250;
  const legHalf = y => 8 + 22 * Math.pow((y - 74) / 48, 1.7);
  const LIT = '#F6F0E6', MID = '#BCC5D0', DARK = '#7C8898';
  const levels = [74, 79, 85, 92, 100, 109, 120];
  for (let y = 74; y <= 122; y++) {
    const h = legHalf(y);
    put(TX - h, y, LIT); put(TX - h + 1, y, MID);
    put(TX + h, y, DARK); put(TX + h - 1, y, MID);
  }
  for (let k = 0; k < levels.length - 1; k++) {
    const ya = levels[k], yb = levels[k + 1], ha = legHalf(ya), hb = legHalf(yb);
    line(TX - ha, ya, TX + ha, ya, MID);
    line(TX - ha + 1, ya + 1, TX + hb - 1, yb, LIT);
    line(TX + ha - 1, ya + 1, TX - hb + 1, yb, DARK);
  }
  // seção de cima, mais fina
  for (let y = 50; y < 64; y++) { const h = 4 + (y - 50) / 14 * 3; put(TX - h, y, LIT); put(TX + h, y, DARK); }
  [50, 54, 58, 62].forEach((y, k, a) => { const h = 4 + (y - 50) / 14 * 3; line(TX - h, y, TX + h, y, MID); if (k < a.length - 1) { const y2 = a[k + 1], h2 = 4 + (y2 - 50) / 14 * 3; line(TX - h, y, TX + h2, y2, LIT); line(TX + h, y, TX - h2, y2, DARK); } });
  // mirante fechado
  for (let y = 63; y <= 74; y++) for (let x = TX - 16; x <= TX + 16; x++) {
    let c;
    if (y <= 64) c = y === 63 ? '#F2F5F8' : '#C9D0D8';
    else if (y >= 72) c = y === 74 ? '#6E7886' : '#8A94A2';
    else {
      const u = (x - (TX - 16)) / 32;
      c = pick(['#6FA9CF', '#8CC4E4', '#B4DDF2', '#DDF2FC'], 0.9 - u * 0.75 + ((x + y) % 7 === 0 ? 0.35 : 0), x, y);
      if ((x - TX) % 4 === 0) c = '#5D748C';
    }
    if (x === TX - 16 || x === TX + 16) c = x < TX ? '#DDE3EA' : '#7E8A98';
    put(x, y, c);
  }
  // mirante aberto e a antena
  rect(TX - 8, 46, 17, 1, '#E8EDF2'); rect(TX - 8, 47, 17, 3, '#AEB8C4'); rect(TX - 8, 49, 17, 1, '#7E8A98');
  for (let x = TX - 7; x <= TX + 7; x += 2) put(x, 48, '#E8EDF2');
  for (let y = 31; y < 46; y++) { const red = Math.floor((y - 31) / 3) % 2 === 0; put(TX, y, red ? '#D8443A' : '#F6F2EA'); put(TX + 1, y, red ? '#A8302A' : '#C9C4BA'); }
  put(TX, 30 + 1, '#FF6A5A');

  // o Oasis 21 (a "nave" de vidro com água em cima) aparecendo atrás das árvores
  for (let y = 90; y <= 101; y++) for (let x = 322; x <= 414; x++) {
    const nx = (x + 0.5 - 368) / 46, ny = (y + 0.5 - 95) / 4.2;
    if (nx * nx + ny * ny > 1) continue;
    let c;
    if (ny < -0.55) c = '#F4F8FA';
    else if (ny > 0.45) c = pick(['#5E7E96', '#7896AC'], 0.6 - nx * 0.4, x, y);
    else c = pick(['#7EC0E0', '#9ED4EC', '#C4E8F6', '#E6F6FC'], 0.55 - nx * 0.35 + ((x * 2 - y * 5) % 11 === 0 ? 0.4 : 0), x, y);
    if ((x - 322) % 9 === 0 && ny > -0.5) c = '#D8ECF4';
    put(x, y, c);
  }
  for (const x of [338, 368, 398]) for (let y = 99; y < 108; y++) put(x, y, '#C8D4DC');
  // pássaros ao longe
  [[300, 64], [309, 60], [318, 67], [196, 40]].forEach(([x, y]) => { put(x - 1, y - 1, '#46506A'); put(x, y, '#46506A'); put(x + 1, y - 1, '#46506A'); put(x - 2, y - 1, '#6A7490', 0.6); put(x + 2, y - 1, '#6A7490', 0.6); });

  // fileira de árvores no fundo
  const TREE = ['#22492B', '#2C5C35', '#38703E', '#468447', '#569851', '#6AAC5A', '#83C066', '#A3D47C'];
  function lump(cx, cy, r, bias, seed) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / (r * 0.85);
      const d = nx * nx + ny * ny, rough = (vnoise(x, y, 2.5, seed) - 0.5) * 0.5;
      if (d > 1 + rough * 0.6) continue;
      let t = sphere(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny))) + bias + (vnoise(x, y, 3, seed + 1) - 0.5) * 0.45;
      if (hash(x, y, seed) < 0.05) t += 0.25;
      put(x, y, pick(TREE, t, x, y));
    }
  }
  for (let x = -6, k = 0; x < W + 10; x += 11 + Math.floor(hash(k, 1, 40) * 7), k++) lump(x, 104 + hash(k, 2, 40) * 5, 10 + hash(k, 3, 40) * 5, -0.12, k);
  for (let x = 0, k = 0; x < W + 10; x += 13 + Math.floor(hash(k, 1, 41) * 8), k++) lump(x, 115 + hash(k, 2, 41) * 4, 9 + hash(k, 3, 41) * 4, 0.02, 100 + k);

  // grama
  const GRASS = ['#3B7F36', '#46903D', '#529E44', '#5FAB4C', '#6DB755', '#7CC260', '#8ECD6E', '#A2D87E'];
  for (let y = GROUND; y < H; y++) for (let x = 0; x < W; x++) {
    let t = 0.5 + (vnoise(x, y, 26, 5) - 0.5) * 0.55 + (vnoise(x, y, 7, 7) - 0.5) * 0.3 + (vnoise(x, y, 2, 8) - 0.5) * 0.18;
    t += (GROUND + 30 - y) / 300;                         // mais longe, mais claro
    if (vnoise(x, y, 34, 9) > 0.66) t += 0.16;            // manchas de sol
    put(x, y, pick(GRASS, t, x, y));
  }
  // sombra embaixo das árvores do fundo
  for (let y = GROUND - 2; y < GROUND + 8; y++) for (let x = 0; x < W; x++) tput(x, y, '#1E3A22', (1 - (y - GROUND + 2) / 10) * 0.55 + (bay(x, y) - 0.5) * 0.1);
  // tufos e florzinhas
  for (let y = GROUND + 4; y < H; y++) for (let x = 1; x < W - 1; x++) {
    const r = hash(x, y, 12);
    if (r < 0.035) { put(x, y, '#2F6A2C'); put(x, y - 1, '#4E9A43'); if (hash(x, y, 13) < 0.5) put(x + 1, y - 1, '#3E8638'); put(x - 1, y, '#3E8638'); if (hash(x, y, 14) < 0.4) put(x, y - 2, '#9CD47A'); }
    else if (r < 0.0385) { const fc = ['#F8F6EC', '#F6DA5C', '#F4A8C4', '#C8A8F0'][Math.floor(hash(x, y, 15) * 4)]; put(x, y, fc); put(x, y + 1, '#2F6A2C'); if (hash(x, y, 16) < 0.5) { put(x - 1, y, mix(fc, '#5FAB4C', 0.5)); put(x + 1, y, mix(fc, '#5FAB4C', 0.5)); } }
  }

  // caminho de pedra
  const STONE = ['#DCD3C0', '#D2C8B4', '#E3DBCA', '#CCC2AD', '#D8CFBB', '#E0D6C2'];
  rect(0, PATH0, W, PATH1 - PATH0, '#8C8270');
  const rows = [[PATH0 + 3, 10], [PATH0 + 13, 10], [PATH0 + 23, 10]];
  rows.forEach(([ry, rh], ri) => {
    let x = -Math.floor(hash(ri, 1, 50) * 14);
    let k = 0;
    while (x < W) {
      const w = 15 + Math.floor(hash(ri, k, 51) * 10), base = STONE[Math.floor(hash(ri, k, 52) * STONE.length)];
      for (let j = 0; j < rh - 1; j++) for (let i = 0; i < w - 1; i++) {
        const px = x + i, py = ry + j;
        let c = rgb(base), n = hash(px, py, 53);
        if (n < 0.1) c = mul(c, [0.93, 0.92, 0.9]); else if (n > 0.93) c = mix(c, '#F4EFE4', 0.5);
        c = mix(c, '#BDB29C', vnoise(px, py, 5, 54 + ri) * 0.35);
        if (j === 0 || i === 0) c = mix(c, '#F2ECE0', 0.55);
        if (j === rh - 2 || i === w - 2) c = mix(c, '#A89C86', 0.55);
        put(px, py, c);
      }
      // rachadura de vez em quando
      if (hash(ri, k, 55) < 0.22) { const cx0 = x + 4 + Math.floor(hash(ri, k, 56) * (w - 8)); let cy0 = ry + 2; for (let s = 0; s < 5; s++) { put(cx0 + (s % 2), cy0 + s, '#9E9380'); } }
      // musgo nas juntas
      if (hash(ri, k, 57) < 0.45) { put(x + w - 1, ry + 3 + Math.floor(hash(ri, k, 58) * 5), '#6E9A4A'); put(x + w - 1, ry + 4 + Math.floor(hash(ri, k, 58) * 5), '#5A8A40'); }
      x += w; k++;
    }
  });
  // meio-fio
  for (let x = 0; x < W; x++) {
    put(x, PATH0, '#E2DACB'); put(x, PATH0 + 1, '#B9AF9B'); put(x, PATH0 + 2, '#9C927E');
    put(x, PATH1 - 3, '#D9D0BE'); put(x, PATH1 - 2, '#B3A992'); put(x, PATH1 - 1, '#857B68');
    if (x % 23 === 0) { put(x, PATH0 + 1, '#8E8470'); put(x, PATH1 - 2, '#7E7462'); }
  }
  // grama passando por cima do meio-fio
  for (let x = 0; x < W; x++) {
    if (hash(x, 1, 60) < 0.32) { put(x, PATH0, '#4E9A43'); if (hash(x, 2, 60) < 0.5) put(x, PATH0 + 1, '#3E8638'); }
    if (hash(x, 3, 60) < 0.28) { put(x, PATH1 - 1, '#5FAB4C'); if (hash(x, 4, 60) < 0.4) put(x, PATH1 - 2, '#7CC260'); }
  }

  // ======================================================================
  // objetos
  // poste de luz
  function lamp() {
    const s = spr(11, 50);
    for (let y = 11; y < 47; y++) { sset(s, 4, y, '#6A7E74'); sset(s, 5, y, '#43544D'); sset(s, 6, y, '#2E3A35'); }
    for (let y = 45; y < 50; y++) for (let x = 2 + (49 - y > 2 ? 1 : 0); x < 9 - (49 - y > 2 ? 1 : 0); x++) sset(s, x, y, x < 5 ? '#5E7068' : x < 7 ? '#3E4E48' : '#2A3530');
    for (let x = 1; x < 10; x++) { sset(s, x, 0, '#3E4E48'); sset(s, x, 1, x < 5 ? '#5E7068' : '#2E3A35'); }
    for (let y = 2; y < 10; y++) for (let x = 2; x < 9; x++) sset(s, x, y, x === 2 || x === 8 ? '#3A4A44' : pick(['#D8D6C8', '#ECEADC', '#FBFAF0', '#FFFFFF'], 0.95 - (x - 3) * 0.12 - (y - 2) * 0.03, x, y));
    for (let x = 2; x < 9; x++) sset(s, x, 10, '#2E3A35');
    sset(s, 3, 3, '#FFFFFF'); sset(s, 3, 4, '#FFFFFF');
    return outline(s);
  }

  // máquina de bebidas (vermelha, sem marca)
  function vending() {
    const s = spr(26, 44), RED = ['#6E1216', '#8E181C', '#AE2024', '#C82A2E', '#DE4446', '#F06A6A'];
    for (let y = 0; y < 42; y++) for (let x = 0; x < 25; x++) {
      let c;
      if (y < 3) c = pick(RED, 0.95 - x * 0.012, x, y);                 // tampa
      else if (x >= 21) c = pick(RED, 0.18 - (x - 21) * 0.04, x, y);    // lateral na sombra
      else c = pick(RED, 0.78 - x * 0.025 + (x < 2 ? 0.25 : 0), x, y);
      sset(s, x, y, c);
    }
    // vitrine com as latas
    for (let y = 5; y < 22; y++) for (let x = 3; x < 19; x++) sset(s, x, y, pick(['#14161E', '#1E2230', '#2A3042'], 0.7 - (y - 5) / 22, x, y));
    const CANS = ['#E8E4D8', '#4A8CD8', '#E05A4A', '#F2C84E', '#58B86A', '#8A5AC8', '#F08A3A'];
    [7, 13].forEach((ry, r) => {
      for (let k = 0; k < 5; k++) {
        const cx = 4 + k * 3, col = CANS[(k * 3 + r * 2) % CANS.length];
        for (let j = 0; j < 4; j++) { sset(s, cx, ry + j, col); sset(s, cx + 1, ry + j, mix(col, '#000000', 0.25)); }
        sset(s, cx, ry, mix(col, '#FFFFFF', 0.5));
        sset(s, cx, ry + 5, '#7AE6FF');                                 // botão aceso
      }
    });
    for (let x = 3; x < 19; x++) sset(s, x, 19, '#3A4256');
    for (let k = 0; k < 14; k++) { const x = 6 + k, y = 6 + k; if (x < 19 && y < 22 && sget(s, x, y)) sset(s, x, y, mix(sget(s, x, y), '#FFFFFF', 0.28)); }
    // painel claro, moedeiro e saída das latas
    for (let y = 24; y < 31; y++) for (let x = 3; x < 19; x++) sset(s, x, y, x === 3 || y === 24 ? '#F6F6F8' : '#D8DAE0');
    sset(s, 14, 26, '#2A2A30'); sset(s, 14, 27, '#2A2A30'); sset(s, 15, 26, '#4A4A54');
    for (let x = 6; x < 11; x++) sset(s, x, 27, '#2A2A30');
    sset(s, 16, 29, '#5AE07A');
    for (let y = 33; y < 38; y++) for (let x = 4; x < 18; x++) sset(s, x, y, y === 33 ? '#2A0A0C' : '#121218');
    for (let x = 4; x < 18; x++) sset(s, x, 38, '#E4484A');
    for (let y = 40; y < 42; y++) for (let x = 0; x < 25; x++) sset(s, x, y, '#4A0C10');
    return outline(s);
  }

  // banco do parque visto por trás (as costas do casal aparecem por cima e pelas frestas)
  function bench() {
    const s = spr(72, 28), WOOD = ['#5E3A1E', '#7A4E2A', '#985F34', '#B57442', '#CD8C54', '#E0A86E'];
    const slat = (y0, h) => {
      for (let y = y0; y < y0 + h; y++) for (let x = 3; x < 69; x++) {
        let t = 0.62 - (y - y0) / h * 0.4 - x * 0.002 + (vnoise(x, y, 4, 70 + y0) - 0.5) * 0.2;
        if (y === y0) t += 0.3;
        if (hash(x, y0, 71) < 0.06 && y > y0) t -= 0.25;               // veio da madeira
        sset(s, x, y, pick(WOOD, t, x, y));
      }
    };
    slat(2, 5); slat(8, 5); slat(15, 3);
    for (let y = 0; y < 28; y++) for (const [x0, x1] of [[0, 4], [67, 71]]) for (let x = x0; x < x1; x++) {
      if (y < 2 && (x === x0 || x === x1 - 1)) continue;
      sset(s, x, y, x === x0 ? '#56685F' : x === x1 - 1 ? '#1E2724' : '#34423D');
    }
    for (let y = 18; y < 28; y++) { sset(s, 35, y, '#34423D'); sset(s, 36, y, '#1E2724'); }
    return outline(s);
  }

  // árvore grande
  function bigTree() {
    const s = spr(84, 92), BARK = ['#35231A', '#4E3424', '#6A4A32', '#8A6646', '#A8835E'];
    for (let y = 52; y < 90; y++) {
      const half = 4 + (y > 82 ? (y - 82) * 0.9 : 0);
      for (let x = Math.round(42 - half); x <= Math.round(42 + half); x++) {
        let t = 0.85 - (x - (42 - half)) / (2 * half) * 0.75 + (vnoise(x, y, 2, 80) - 0.5) * 0.35;
        if ((x + Math.floor(y / 3)) % 5 === 0) t -= 0.2;
        sset(s, x, y, pick(BARK, t, x, y));
      }
    }
    const parts = [[42, 36, 26], [24, 44, 16], [60, 44, 17], [32, 24, 17], [54, 22, 18], [42, 14, 15], [18, 32, 12], [66, 32, 12], [42, 50, 16]];
    parts.forEach(([cx, cy, r], k) => {
      for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r, rough = (vnoise(x, y, 3, 90 + k) - 0.5) * 0.45;
        if (nx * nx + ny * ny > 1 + rough) continue;
        let t = sphere(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny))) + (vnoise(x, y, 2.2, 91 + k) - 0.5) * 0.55 - (k === 0 || k === 8 ? 0.1 : 0);
        if (hash(x, y, 92) < 0.05) t += 0.3;
        sset(s, x, y, pick(TREE, t + 0.08, x, y));
      }
    });
    return outline(s, 0.5);
  }

  function bush(seed) {
    const s = spr(34, 20);
    [[10, 12, 8], [20, 10, 9], [27, 13, 6], [6, 14, 5]].forEach(([cx, cy, r], k) => {
      for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r;
        if (nx * nx + ny * ny > 1 + (vnoise(x, y, 2, seed + k) - 0.5) * 0.5 || y > 18) continue;
        sset(s, x, y, pick(TREE, sphere(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny))) + (vnoise(x, y, 2, seed + 9 + k) - 0.5) * 0.5 + 0.12, x, y));
      }
    });
    return outline(s, 0.5);
  }

  // carrinho de sorvete (toldo listrado e um sorvete desenhado na lateral, sem marca)
  function iceCart() {
    const s = spr(50, 44), BLUE = ['#4E8EBA', '#6AA8D2', '#88C0E2', '#ABD6EE', '#D2EAF8'];
    for (let y = 8; y < 22; y++) { sset(s, 6, y, '#C8CCD4'); sset(s, 43, y, '#8E949E'); }
    for (let y = 0; y < 9; y++) for (let x = 2; x < 48; x++) {
      if (y === 8 && x % 4 === 2) continue;
      const stripe = Math.floor((x - 2) / 4) % 2 === 0;
      let c = stripe ? (y < 2 ? '#F79AB8' : '#EC6E96') : (y < 2 ? '#FFFFFF' : '#F6EAF0');
      if (y > 5) c = mix(c, '#000000', 0.12);
      sset(s, x, y, c);
    }
    for (let y = 20; y < 36; y++) for (let x = 3; x < 47; x++) {
      let c = pick(BLUE, 0.82 - x * 0.012, x, y);
      if (y === 20) c = '#FFFFFF';
      if (y === 21) c = '#E8F4FC';
      if (y > 33) c = '#3E6E92';
      sset(s, x, y, c);
    }
    // potes de sorvete na vitrine de cima
    [['#F7B6CC', 10], ['#B8EED8', 18], ['#FFF0C8', 26], ['#C89A70', 34]].forEach(([c, x]) => { for (let i = 0; i < 6; i++) { sset(s, x + i, 18, mix(c, '#FFFFFF', 0.4)); sset(s, x + i, 19, c); } });
    // o desenho do sorvete
    for (let j = 0; j < 9; j++) for (let i = -Math.floor((8 - j) / 2); i <= Math.floor((8 - j) / 2); i++) sset(s, 25 + i, 25 + j, (i + j) % 3 === 0 ? '#B07A3A' : '#E0A860');
    for (const [cx, cy, c] of [[22, 23, '#F7A6C2'], [28, 23, '#A8E6CF'], [25, 20, '#FFF2D0']]) for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (i * i + j * j <= 5) sset(s, cx + i, cy + j, i + j < -1 ? mix(c, '#FFFFFF', 0.5) : c);
    sset(s, 25, 17, '#E8404A');
    // rodas
    for (const wx of [11, 38]) for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const d = i * i + j * j; if (d <= 10) sset(s, wx + i, 39 + j, d <= 2 ? '#C8CCD4' : d <= 5 ? '#2A2A30' : '#18181C'); }
    return outline(s);
  }

  function flowerBed() {
    const s = spr(64, 26), FL = ['#E8504A', '#F4CF4A', '#F49AC2', '#F8F6F0', '#9A6AD0', '#F49A3A'];
    for (let y = 0; y < 26; y++) for (let x = 0; x < 64; x++) {
      const nx = (x + 0.5 - 32) / 32, ny = (y + 0.5 - 13) / 12, d = nx * nx + ny * ny;
      if (d > 1) continue;
      if (d > 0.62) sset(s, x, y, ny < -0.2 ? '#DCD5C6' : ny > 0.3 ? '#8E8676' : '#B9B1A2');
      else sset(s, x, y, pick(['#3E2A1E', '#5A3E2C', '#6E4E38'], 0.5 + (vnoise(x, y, 2, 120) - 0.5), x, y));
    }
    for (let k = 0; k < 44; k++) {
      const a = hash(k, 1, 121) * Math.PI * 2, r = Math.sqrt(hash(k, 2, 121)) * 0.7;
      const fx = Math.round(32 + Math.cos(a) * r * 26), fy = Math.round(13 + Math.sin(a) * r * 8), col = FL[k % FL.length];
      sset(s, fx - 1, fy + 1, '#3E8A3A'); sset(s, fx + 1, fy + 1, '#5AAA48'); sset(s, fx, fy + 2, '#2E6A2C');
      sset(s, fx, fy - 1, col); sset(s, fx - 1, fy, col); sset(s, fx + 1, fy, mix(col, '#000000', 0.15)); sset(s, fx, fy + 1, mix(col, '#000000', 0.2));
      sset(s, fx, fy, col === '#F4CF4A' ? '#C8742A' : '#FFE27A');
    }
    return s;
  }

  function pigeon(peck, flip) {
    const s = spr(11, 9);
    const P = [
      peck ? '.....hh....' : '...........',
      peck ? '....hhnn...' : '......hh...',
      peck ? '...bbnn.e..' : '.....hhne..',
      '..bbbbn.ko.',
      '.wbbbbbb...',
      'wwwbbbbb...',
      '.wwwWWbb...',
      '...k.k.....',
      '...........'
    ];
    const col = { h: '#8A909A', n: '#5AA88A', e: '#F09A4A', k: '#E88A6A', o: '#E8C070', b: '#9AA0AA', w: '#6E747E', W: '#4E525A' };
    P.forEach((row, y) => [...row].forEach((ch, x) => { if (col[ch]) sset(s, flip ? 10 - x : x, y, col[ch]); }));
    sset(s, flip ? 4 : 6, peck ? 2 : 1, '#2A2A30');
    return outline(s, 0.45);
  }

  // ---------- personagens ----------
  const SKIN_E = ['#C68A7A', '#E0AE9C', '#F6D7C6', '#FFE9DE', '#FFF5EF'];
  const SKIN_F = ['#7E4E34', '#A0694A', '#C58C64', '#D9A47C', '#ECC29A'];
  const HAIR_E = ['#5A3E20', '#7E5A30', '#A07644', '#BC9058', '#D6AE72'];
  const HAIR_F = ['#08070A', '#110E10', '#1C1718', '#2A2426', '#4A4450'];
  const PLAT = ['#A8803E', '#C8A25A', '#E4C67A', '#F4DC94', '#FFF0C0'];
  const COAT = ['#8C94A4', '#B8BFCC', '#DCE0E8', '#F2F4F8', '#FFFFFF'];
  const MUST = ['#7A5810', '#A07818', '#C99A26', '#DCB038', '#F0CC62'];
  const JEANS = ['#141A2C', '#1C2440', '#283454', '#384870', '#4A5C88'];
  const DARKP = ['#12141E', '#1A1D2C', '#252A3E', '#343A54', '#444C68'];
  const SHIRT = ['#25478A', '#2F57A2', '#3E6CBC', '#5482CC', '#6E9ADA'];
  const HALTER = ['#2E5EA6', '#3E72BE', '#5088D2', '#64A0E0', '#86B8EC'];

  // cabeça de lado (virada para a direita)
  function headSide(s, cx, cy, o) {
    ball(s, cx, cy, 7.5, 8, o.skin, 0.08);
    // cabelo
    const R = o.hair;
    for (let y = cy - 11; y <= cy + 13; y++) for (let x = cx - 10; x <= cx + 9; x++) {
      const nx = (x + 0.5 - cx) / 8.6, ny = (y + 0.5 - cy) / (o.short ? 9.4 : 9);
      const inCap = nx * nx + ny * ny <= 1;
      let hair = false;
      if (o.short) {
        // cabelo curto com volume em cima
        const vol = (x + 0.5 - cx) / 9, vy = (y + 0.5 - (cy - 1.5)) / 9.6;
        hair = vol * vol + vy * vy <= 1 && (y < cy - 3 - Math.max(0, x - cx - 1) * 0.35 || (x < cx - 3 && y < cy + 4));
      } else {
        hair = inCap && (y < cy - 1 || x < cx - 1.5 || (x < cx + 0.5 && y < cy + 4));
        // comprimento atrás, até o ombro
        if (!hair && x >= cx - 9 && x < cx - 1 && y >= cy && y <= cy + 11 - Math.pow((x - (cx - 9)) / 8, 2) * 3) hair = true;
      }
      if (!hair) continue;
      const sx = Math.max(-1, Math.min(1, nx)), sy = Math.max(-1, Math.min(1, ny));
      let t = sphere(sx, sy) + 0.05;
      if ((x * 2 + y) % 5 === 0 && t > 0.25) t -= 0.14;                      // fios
      const dd = Math.hypot(x + 0.5 - (cx - 1), y + 0.5 - (cy - 1));
      if (Math.abs(dd - 6.3) < 0.8 && y < cy - 2 && x < cx + 3) t = 1;       // brilho
      let ramp = R;
      if (o.plat && y > cy + 1) ramp = PLAT;                                 // pontas platinadas
      sset(s, x, y, pick(ramp, t, x, y));
    }
    // franja reta
    if (!o.short) for (let x = cx; x <= cx + 7; x++) if (sget(s, x, cy - 1)) sset(s, x, cy - 1, pick(R, 0.42, x, cy - 1));
    // olho, sobrancelha, boca e bochecha
    const E = '#2A2030';
    sset(s, cx + 3, cy + 1, '#FFFFFF'); sset(s, cx + 4, cy + 1, E);
    sset(s, cx + 3, cy + 2, E); sset(s, cx + 4, cy + 2, '#5A4A78');
    sset(s, cx + 3, cy + 3, E); sset(s, cx + 4, cy + 3, E);
    if (o.short) { sset(s, cx - 2, cy + 1, o.skin[3]); sset(s, cx - 1, cy + 1, o.skin[2]); sset(s, cx - 2, cy + 2, o.skin[2]); sset(s, cx - 1, cy + 2, o.skin[1]); sset(s, cx - 2, cy + 3, o.skin[1]); sset(s, cx - 1, cy + 3, o.skin[2]); }
    if (o.short) { sset(s, cx + 2, cy - 1, HAIR_F[1]); sset(s, cx + 3, cy - 1, HAIR_F[1]); sset(s, cx + 4, cy - 1, HAIR_F[2]); }
    sset(s, cx + 7, cy + 3, mix(o.skin[1], o.skin[2], 0.4));
    if (o.beard) {
      [[cx + 4, cy + 5], [cx + 5, cy + 5], [cx + 6, cy + 5], [cx + 3, cy + 5]].forEach(([x, y]) => sset(s, x, y, HAIR_F[2]));
      [[cx + 4, cy + 7], [cx + 5, cy + 7], [cx + 4, cy + 8], [cx + 3, cy + 7]].forEach(([x, y]) => sset(s, x, y, HAIR_F[2]));
      sset(s, cx + 5, cy + 6, '#8A4E3E');
      for (let y = cy + 3; y <= cy + 7; y++) if (sget(s, cx + 1, y)) sset(s, cx + 1, y, mix(sget(s, cx + 1, y), HAIR_F[2], 0.35));
    } else {
      sset(s, cx + 5, cy + 5, '#C0706A');
      sset(s, cx + 2, cy + 4, mix(o.skin[2], '#F08A8A', 0.45)); sset(s, cx + 3, cy + 4, mix(o.skin[2], '#F08A8A', 0.3));
    }
    if (o.glasses) {
      const G = '#9A6466';
      for (let x = cx + 2; x <= cx + 6; x++) { sset(s, x, cy, G); sset(s, x, cy + 4, G); }
      for (let y = cy; y <= cy + 4; y++) { sset(s, cx + 2, y, G); sset(s, cx + 6, y, G); }
      for (let x = cx - 1; x < cx + 2; x++) sset(s, x, cy + 1, G);
      sset(s, cx + 5, cy + 1, '#FFFFFF'); sset(s, cx + 3, cy + 1, '#FFFFFF');
    }
    if (o.bandage) {
      [[cx + 2, cy - 6], [cx + 3, cy - 6], [cx + 4, cy - 6], [cx + 1, cy - 5], [cx + 2, cy - 5], [cx + 3, cy - 5], [cx + 4, cy - 5], [cx + 5, cy - 5], [cx + 2, cy - 4], [cx + 3, cy - 4], [cx + 4, cy - 4]]
        .forEach(([x, y]) => sset(s, x, y, y === cy - 6 ? '#FFFFFF' : '#ECE6D8'));
      sset(s, cx + 3, cy - 5, '#CFC5B0'); sset(s, cx + 3, cy - 6, '#E2DACA');
    }
  }

  // a Ellen do presente andando: jaleco, blusa escura, calça escura, bota
  function ellenNow() {
    const s = spr(28, 50), cx = 13, cy = 10;
    limb(s, 10, 20, 7, 30, 3, COAT, -0.25);                 // braço de trás
    sset(s, 7, 31, SKIN_E[1]); sset(s, 8, 31, SKIN_E[1]);
    // pernas
    limb(s, 12, 36, 9, 44, 3, DARKP, -0.1);
    limb(s, 15, 36, 18, 44, 3, DARKP, 0.08);
    // botas
    for (let x = 6; x <= 11; x++) for (let y = 44; y <= 47; y++) sset(s, x, y, y === 44 ? '#3A3A48' : x === 6 ? '#2A2A34' : '#18181E');
    for (let x = 16; x <= 22; x++) for (let y = 44; y <= 47; y++) sset(s, x, y, y === 44 ? '#4A4A58' : x >= 21 ? '#2A2A34' : '#1A1A22');
    sset(s, 21, 44, '#6A6A78');
    // jaleco em A
    for (let y = 18; y <= 37; y++) {
      const xl = Math.round(8.5 - (y - 18) * 0.16), xr = Math.round(18 + (y - 18) * 0.14);
      for (let x = xl; x <= xr; x++) {
        let t = 0.95 - (x - xl) / (xr - xl) * 0.55 - (y - 18) * 0.008;
        if ((x === 11 || x === 15) && y > 25) t -= 0.2;                // dobras
        if (y === 37) t -= 0.3;
        let c = pick(COAT, t, x, y);
        if (x >= xr - 2 && y >= 19 && y <= 31) c = x === xr - 2 ? '#C8CED8' : pick(['#20222E', '#2B2D3A', '#3A3D50'], 0.5 - (y - 19) / 30, x, y);
        sset(s, x, y, c);
      }
    }
    for (let x = 9; x <= 12; x++) sset(s, x, 30, '#B8BFCC');                    // bolso
    sset(s, 12, 19, '#FFFFFF'); sset(s, 13, 20, '#FFFFFF'); sset(s, 14, 21, '#DCE0E8');   // gola
    limb(s, 14, 20, 18, 29, 3, COAT, 0.05);                 // braço da frente
    sset(s, 18, 30, SKIN_E[3]); sset(s, 19, 30, SKIN_E[2]); sset(s, 18, 31, SKIN_E[2]); sset(s, 19, 31, SKIN_E[1]);
    headSide(s, cx, cy, { skin: SKIN_E, hair: HAIR_E, glasses: true });
    return outline(s);
  }

  // o Fabio do presente: moletom mostarda com capuz, jeans, tênis branco e o curativo na cabeça
  function fabioNow() {
    const s = spr(28, 50), cx = 13, cy = 10;
    limb(s, 10, 20, 8, 30, 4, MUST, -0.3);
    sset(s, 7, 31, SKIN_F[1]); sset(s, 8, 31, SKIN_F[2]);
    limb(s, 15, 35, 11, 44, 4, JEANS, -0.1);
    limb(s, 14, 35, 18, 44, 4, JEANS, 0.1);
    for (let x = 7; x <= 13; x++) for (let y = 44; y <= 47; y++) sset(s, x, y, y === 47 ? '#9AA0A8' : x === 7 ? '#C8CCD2' : '#F2F2EE');
    for (let x = 15; x <= 22; x++) for (let y = 44; y <= 47; y++) sset(s, x, y, y === 47 ? '#9AA0A8' : y === 44 ? '#FFFFFF' : '#ECECE6');
    sset(s, 18, 45, '#B8BCC4'); sset(s, 10, 45, '#B8BCC4');
    // capuz atrás do pescoço
    ball(s, 8, 18, 4, 3.5, MUST, -0.15);
    for (let y = 18; y <= 36; y++) {
      const xl = Math.round(7.5 - (y > 30 ? 0 : (y - 18) * 0.04)), xr = Math.round(19 + (y > 30 ? 0 : 0));
      for (let x = xl; x <= xr; x++) {
        let t = 0.9 - (x - xl) / (xr - xl) * 0.6;
        if (y >= 34) t -= 0.25;                                   // barra canelada
        if (y >= 28 && y <= 31 && x >= 12 && x <= 18) t -= 0.12;  // bolso canguru
        sset(s, x, y, pick(MUST, t, x, y));
      }
    }
    sset(s, 17, 20, '#FFF2C8'); sset(s, 17, 21, '#FFF2C8'); sset(s, 17, 22, '#F0DCA0'); sset(s, 18, 23, '#F0DCA0');   // cordinha
    limb(s, 15, 20, 19, 29, 4, MUST, 0.05);
    sset(s, 19, 30, SKIN_F[3]); sset(s, 20, 30, SKIN_F[2]); sset(s, 19, 31, SKIN_F[2]); sset(s, 20, 31, SKIN_F[1]);
    headSide(s, cx, cy, { skin: SKIN_F, hair: HAIR_F, short: true, beard: true, bandage: true });
    return outline(s);
  }

  // cabeça de costas
  function headBack(s, cx, cy, o) {
    for (const ex of [cx - 8, cx + 7]) for (let y = cy + 1; y <= cy + 3; y++) sset(s, ex, y, o.skin[ex < cx ? 3 : 1]);
    for (let y = cy - 11; y <= cy + 16; y++) for (let x = cx - 10; x <= cx + 10; x++) {
      const nx = (x + 0.5 - cx) / 8.4, ny = (y + 0.5 - cy) / 8.8;
      let hair = nx * nx + ny * ny <= 1;
      if (o.short) hair = hair && y < cy + 5;
      if (o.long && !hair && Math.abs(x + 0.5 - cx) < 8.2 - Math.max(0, y - cy - 8) * 0.25 && y > cy && y < cy + 15 + Math.round(hash(x, 0, 5) * 2)) hair = true;
      if (!hair) continue;
      let t = sphere(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny * 0.8))) + 0.05;
      if ((x * 3 + y) % 6 === 0) t -= 0.15;
      const dd = Math.hypot(x + 0.5 - cx, y + 0.5 - (cy + 1));
      if (Math.abs(dd - 6.5) < 0.75 && y < cy - 2 && x < cx + 2) t = 1;
      let ramp = o.hair;
      if (o.plat) ramp = y < cy - 4 + (hash(x, y, 7) < 0.5 ? 1 : 0) ? o.hair : PLAT;
      sset(s, x, y, pick(ramp, t, x, y));
    }
  }

  // casquinha de sorvete
  function cone(s, x, y, scoop) {
    for (let j = 0; j < 6; j++) for (let i = 0; i < 4 - Math.floor(j / 2); i++) sset(s, x + i + Math.floor(j / 2) / 2, y + j, (i + j) % 2 ? '#B07A3A' : '#E0A860');
    for (let j = -3; j <= 0; j++) for (let i = -1; i <= 4; i++) if ((i - 1.5) * (i - 1.5) + (j + 1) * (j + 1) * 1.6 <= 7) sset(s, x + i, y + j, i + j < 0 ? mix(scoop, '#FFFFFF', 0.5) : scoop);
  }

  // o Fabio do passado sentado de costas: camisa azul florida, sorvete na mão direita
  function fabioPastBack() {
    const s = spr(30, 36), cx = 14, cy = 10;
    for (let y = 16; y <= 35; y++) {
      const half = y < 19 ? 6 + (y - 16) * 1.6 : 11;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        let t = 0.88 - (x - (cx - half)) / (2 * half) * 0.6;
        if (y === 16) t = 0.95;
        let c = pick(SHIRT, t, x, y);
        // estampa floral do mesmo tom
        const fx = (x + (y % 6 < 3 ? 2 : 0)) % 5, fy = y % 6;
        if ((fx === 2 && (fy === 1 || fy === 3)) || (fy === 2 && (fx === 1 || fx === 3))) c = mix(c, '#8DB4EC', 0.7);
        if (fx === 2 && fy === 2) c = '#C8DCF6';
        sset(s, x, y, c);
      }
    }
    for (let x = cx - 2; x <= cx + 2; x++) { sset(s, x, 15, SKIN_F[1]); sset(s, x, 16, '#A9C6EE'); }   // nuca e gola
    limb(s, 4, 27, 2, 18, 3, SHIRT, 0.1);
    for (let y = 16; y <= 18; y++) for (let x = 1; x <= 3; x++) sset(s, x, y, SKIN_F[y === 16 ? 3 : 2]);
    cone(s, 1, 10, '#F4A6C0');
    headBack(s, cx, cy, { skin: SKIN_F, hair: HAIR_F, short: true });
    return outline(s);
  }

  // a Ellen do passado sentada de costas: cabelo meio a meio, frente única azul, sorvete na mão esquerda
  function ellenPastBack() {
    const s = spr(30, 36), cx = 15, cy = 10;
    for (let y = 17; y <= 35; y++) {
      const half = y < 20 ? 5.5 + (y - 17) * 1.4 : 9.5;
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        const top = y < 23;
        let c;
        if (top) c = pick(SKIN_E, 0.95 - (x - (cx - half)) / (2 * half) * 0.6, x, y);   // ombros de fora
        else {
          c = pick(HALTER, 0.9 - (x - (cx - half)) / (2 * half) * 0.6, x, y);
          if (x % 2 === 0) c = mix(c, '#3A6AB4', 0.35);                                  // canelado
        }
        sset(s, x, y, c);
      }
    }
    limb(s, 24, 27, 26, 18, 3, SKIN_E, -0.1);
    cone(s, 25, 10, '#A8E6CF');
    for (let y = 16; y <= 18; y++) for (let x = 25; x <= 28; x++) sset(s, x, y, SKIN_E[y === 16 ? 3 : 2]);
    headBack(s, cx, cy, { skin: SKIN_E, hair: HAIR_E, plat: true, long: true });
    // laço da frente única aparecendo na nuca
    sset(s, cx - 1, 17, '#5088D2'); sset(s, cx + 1, 17, '#5088D2'); sset(s, cx, 18, '#3E72BE');
    return outline(s);
  }

  // ======================================================================
  // fachada do restaurante (borda esquerda)
  function facade() {
    for (let y = 88; y < 232; y++) for (let x = 0; x < 30; x++) {
      let c;
      if (x >= 27) c = x === 29 ? '#5A4636' : '#7E6450';                       // espessura da parede
      else if (x < 3 || (x >= 22 && x < 25)) c = pick(['#4A2E1A', '#6B4529', '#86593A'], x < 3 ? 0.7 - x * 0.2 : 0.5 - (x - 22) * 0.2, x, y);
      else c = pick(['#D8C9A8', '#E8DCC0', '#F2E8D2', '#FAF3E4'], 0.75 - x * 0.012 + (vnoise(x, y, 3, 150) - 0.5) * 0.3, x, y);
      if (y >= 118 && y <= 120 && x < 27) c = y === 118 ? '#86593A' : '#4A2E1A';
      put(x, y, c);
    }
    // telhado
    for (let y = 84; y < 92; y++) for (let x = 0; x < 34; x++) put(x, y, y === 84 ? '#6A6874' : pick(['#24232A', '#34333C', '#46454F'], 0.6 - (y - 85) * 0.08 + ((x + y) % 4 === 0 ? 0.3 : 0), x, y));
    // porta com a cortina (noren) na altura do caminho
    for (let y = 164; y < PATH1; y++) for (let x = 3; x < 22; x++) put(x, y, pick(['#1A120E', '#2A1E18', '#3E2C22'], 0.35 + (y - 164) / 80, x, y));
    for (let y = 164; y < 184; y++) for (let x = 3; x < 22; x++) {
      if ((x === 9 || x === 15) && y > 168) continue;
      let c = pick(['#1E2C5E', '#283A78', '#33489A', '#4A60B4'], 0.75 - (x % 6) * 0.08 - (y - 164) * 0.01, x, y);
      if (y === 178 || y === 179) c = '#E8ECF4';
      put(x, y, c);
    }
    for (let x = 2; x < 23; x++) put(x, 163, '#6B4529');
    // lanterna vermelha (chochin) com brilho
    const LX = 34, LY = 150;
    for (let y = LY - 26; y < LY + 26; y++) for (let x = LX - 26; x < LX + 26; x++) { const r = Math.hypot(x - LX, (y - LY) * 1.1); if (r < 24) tput(x, y, '#FF9A50', Math.pow(1 - r / 24, 2) * 0.45); }
    for (let y = LY - 9; y <= LY + 9; y++) for (let x = LX - 7; x <= LX + 7; x++) {
      const nx = (x + 0.5 - LX) / 7, ny = (y + 0.5 - LY) / 9;
      if (nx * nx + ny * ny > 1) continue;
      let c = Math.abs(ny) > 0.78 ? '#2A1A16' : pick(['#8E1A16', '#B82822', '#DA3A2E', '#F2624A', '#FF9A7A'], sphere(nx, ny) + 0.15, x, y);
      if (!(Math.abs(ny) > 0.78) && (y - LY) % 4 === 0) c = mix(c, '#7A1612', 0.4);
      put(x, y, c);
    }
    line(LX, LY - 13, LX, LY - 10, '#2A1A16');
    line(30, LY - 13, LX, LY - 13, '#2A1A16');
  }

  // cone de visão vermelho sobre o chão (some aos poucos no fim)
  function coneFx(ox, oy, ang, range, half) {
    for (let y = Math.floor(oy - range); y <= oy + range; y++) for (let x = Math.floor(ox - range); x <= ox + range; x++) {
      if (y < 100) continue;
      const dx = x + 0.5 - ox, dy = y + 0.5 - oy, d = Math.hypot(dx, dy);
      if (d > range || d < 2) continue;
      let da = Math.atan2(dy, dx) * 180 / Math.PI - ang;
      da = ((da + 540) % 360) - 180;
      if (Math.abs(da) > half) continue;
      const edge = Math.abs(da) > half - 2.2 || d > range - 1.5;
      const c = get(x, y), lum = (c[0] + c[1] + c[2]) / 765;
      put(x, y, edge ? mix('#FF8C7C', '#FFD0C4', lum * 0.4) : mix(c, mix('#C8241C', '#FF9080', lum), c01(0.64 * (1 - d / range * 0.4) + (bay(x, y) - 0.5) * 0.1)));
    }
  }

  // ======================================================================
  // montagem
  facade();
  const objs = [];
  const add = (s, x, y, by, shadow = true) => objs.push({ s, x, y, by, shadow });
  const L1 = lamp(), L2 = lamp(), VM = vending(), BN = bench(), TR = bigTree(), FP = fabioPastBack(), EP = ellenPastBack();
  add(L1, 98, 118, 167);
  add(VM, 128, 123, 166);
  add(FP, 220, 112, 160);
  add(EP, 246, 112, 160);
  add(BN, 213, 140, 166);
  add(TR, 380, 80, 170);
  add(bush(200), 300, 150, 168);
  add(bush(210), 446, 154, 170);
  add(bush(220), 52, 214, 232);
  add(iceCart(), 156, 188, 230);
  add(L2, 322, 176, 225);
  add(flowerBed(), 368, 208, 232, false);
  add(pigeon(true, false), 330, 182, 190);
  add(pigeon(false, true), 352, 188, 196);
  add(pigeon(false, false), 374, 180, 188);
  add(fabioNow(), 74, 152, 199);
  add(ellenNow(), 100, 154, 201);

  objs.forEach(o => { if (o.shadow) castShadow(o.s, o.x, o.y, o.by); });
  contact(110, 199, 7, 2); contact(87, 197, 7, 2); contact(141, 166, 13, 2); contact(103, 167, 4, 1); contact(326, 225, 4, 1); contact(180, 230, 18, 2);
  applyShadows();
  // os vigias olham a torre
  coneFx(234, 150, 270, 46, 24);
  coneFx(261, 150, 270, 46, 24);
  objs.sort((a, b) => a.by - b.by).forEach(o => blit(o.s, o.x, o.y));
  // o banco fica na frente do casal
  blit(BN, 213, 140);

  // ======================================================================
  // luz da tarde: raios de sol, poeirinha brilhando e vinheta
  for (let y = TOP; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x - SUN[0]) * 0.55 - (y - SUN[1]) * 0.84, v = (x - SUN[0]) * 0.84 + (y - SUN[1]) * 0.55;
    if (v > 0) { const band = Math.sin(u / 9 + 1.3) * Math.sin(u / 23); if (band > 0.55) tput(x, y, '#FFF0C8', (band - 0.55) * 0.22 * Math.max(0, 1 - v / 420) + (bay(x, y) - 0.5) * 0.04); }
    const c = get(x, y), warm = 1 - Math.min(1, Math.hypot(x - SUN[0], y - SUN[1]) / 500);
    put(x, y, [c[0] * (1.0 + warm * 0.06), c[1] * (0.99 + warm * 0.02), c[2] * (0.95 - warm * 0.02)]);
    const vx = (x - W / 2) / (W / 2), vy = (y - (TOP + H) / 2) / ((H - TOP) / 2), vg = Math.max(0, vx * vx + vy * vy - 0.55);
    if (vg > 0) put(x, y, '#141022', c01(vg * 0.2 + (bay(x, y) - 0.5) * 0.03));
  }
  // borboletas perto do canteiro
  [[392, 196, '#FFFFFF', '#F4D658'], [414, 188, '#F6D25A', '#E89A3A'], [70, 226, '#FFFFFF', '#B8D8F8']].forEach(([x, y, a, b]) => {
    put(x, y, '#2A2420'); put(x, y + 1, '#2A2420');
    put(x - 1, y, a); put(x - 2, y - 1, a); put(x - 1, y - 1, b); put(x + 1, y, a); put(x + 2, y - 1, a); put(x + 1, y - 1, b);
    put(x - 1, y + 1, b); put(x + 1, y + 1, b);
  });
  for (let k = 0; k < 26; k++) {
    const x = Math.floor(hash(k, 1, 300) * W), y = TOP + 10 + Math.floor(hash(k, 2, 300) * 170);
    put(x, y, '#FFF8E0', 0.85); if (hash(k, 3, 300) < 0.4) { put(x + 1, y, '#FFF8E0', 0.4); put(x, y + 1, '#FFF8E0', 0.4); }
  }

  // ======================================================================
  // HUD e caixa de diálogo, com a fonte do jogo
  function text(str, x, y, color, shadow) {
    let cx = x;
    for (const ch of str) {
      if (ch === ' ') { cx += 3; continue; }
      const g = FONT[ch] || FONT['?'];
      if (!g) { cx += 4; continue; }
      g.forEach((row, j) => [...row].forEach((p, i) => { if (p === '#') { if (shadow) put(cx + i + 1, y + j + 1, shadow); } }));
      g.forEach((row, j) => [...row].forEach((p, i) => { if (p === '#') put(cx + i, y + j, color); }));
      cx += g[0].length + 1;
    }
    return cx;
  }
  const textW = str => { let w = 0; for (const ch of str) w += ch === ' ' ? 3 : ((FONT[ch] || FONT['?'] || ['....'])[0].length + 1); return w; };

  for (let y = 0; y < TOP; y++) for (let x = 0; x < W; x++) put(x, y, pick(['#100E28', '#16143A', '#1C1A48', '#22205A'], 0.15 + y / TOP * 0.8, x, y));
  for (let x = 0; x < W; x++) { put(x, TOP - 2, '#3C3888'); put(x, TOP - 1, '#7A74CC'); put(x, 0, '#2A2860'); }
  let hx = text('STAGE 1', 12, 11, '#F2C14E', '#5A3A12');
  hx = text('·', hx + 4, 11, '#8C86C8', '#0A0820');
  hx = text('16/08/2025', hx + 4, 11, '#E4E0FF', '#0A0820');
  hx = text('·', hx + 4, 11, '#8C86C8', '#0A0820');
  text('Ice cream at Mirai Tower', hx + 4, 11, '#FFF4DA', '#0A0820');
  const memX = W - 12 - 5 * 11;
  text('MEMORY', memX - textW('MEMORY') - 6, 11, '#CFC8E8', '#0A0820');
  for (let k = 0; k < 5; k++) {
    const bx = memX + k * 11;
    rect(bx, 9, 9, 10, '#6A64B8'); rect(bx + 1, 10, 7, 8, '#14123A'); rect(bx + 1, 10, 7, 1, '#2A2766');
  }

  // caixa de diálogo
  const BX = 14, BY = 236, BW = W - 28, BH = 30;
  for (let y = BY; y < BY + BH; y++) for (let x = BX; x < BX + BW; x++) {
    const corner = (x === BX || x === BX + BW - 1) && (y === BY || y === BY + BH - 1);
    if (corner) continue;
    let c;
    if (x === BX || x === BX + BW - 1 || y === BY || y === BY + BH - 1) c = '#CFC9F4';
    else if (x === BX + 1 || x === BX + BW - 2 || y === BY + 1 || y === BY + BH - 2) c = '#4C4796';
    else c = pick(['#110F2C', '#161438', '#1C1A46', '#22204F'], 0.9 - (y - BY) / BH * 0.8, x, y);
    put(x, y, c, 0.96);
  }
  // aba com o nome
  for (let y = 224; y < 237; y++) for (let x = 26; x < 66; x++) {
    if ((x === 26 || x === 65) && y === 224) continue;
    put(x, y, x === 26 || x === 65 || y === 224 ? '#CFC9F4' : y < 227 ? '#FFFFFF' : '#F0EEFC');
  }
  text('Ellen', 46 - Math.floor(textW('Ellen') / 2), 227, '#2A2650', null);
  text('We came to have ice cream as dessert, and a good view.', 26, 246, '#F4F2FF', '#0A0920');
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [1, 1], [2, 1], [3, 1], [2, 2]].forEach(([i, j]) => put(W - 30 + i, 257 + j, '#F2C14E'));

  ctx.putImageData(img, 0, 0);
  document.title = 'done';
})();
