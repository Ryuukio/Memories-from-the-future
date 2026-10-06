// =====================================================================
//  Personagens, roupas e paletas por data (SPEC, Apêndice A).
//
//  Cada roupa diz:
//    head     qual cabeça usar: ellen, fabio, man (homem genérico) ou woman (mulher genérica)
//    body     qual corpo: coat (jaleco), hoodie (moletom), slim (Ellen) ou reg (Fabio e homens)
//    palette  a cor de cada letra dos moldes (legenda no Apêndice E.2)
//    ou colors, para os NPCs: cores-base que o jogo transforma em paleta, com sombra e brilho
//    hair     'half' = cabelo meio a meio (raiz loiro-escura crescida)
//    bandage  curativo na cabeça (Fabio do presente)
//    patterns estampas: { on: letras, color, rule } — regras: floral, ribbed, rips
//
//  Os cenários usam o nome da roupa, ex.: { who: 'FABIO_F1' }.
// =====================================================================
window.CHARACTERS = {

  // ---------- presente (quem a jogadora controla e quem a segue) ----------

  ELLEN_NOW: {
    head: 'ellen', body: 'coat',
    palette: Object.assign({}, PALETTES.ELLEN_NOW, {
      u: '#F4F6F8', a: '#F4F6F8', A: '#C3CAD6',   // mangas do jaleco (poses sentadas)
      n: '#2A2E44', N: '#1B1E2E'                  // calça escura
    })
  },

  FABIO_NOW: {
    head: 'fabio', body: 'hoodie', bandage: true,
    palette: Object.assign({}, PALETTES.FABIO_NOW, {
      u: '#D9A62E', a: '#D9A62E', A: '#AD811B',   // mangas do moletom
      n: '#2A3550', N: '#1B2440'                  // jeans escuro
    })
  },

  // ---------- fase 1 — 16/08/2025 (os 6 cenários) ----------

  // camisa de botão azul com estampa floral do mesmo tom, short branco, tênis branco
  FABIO_F1: {
    head: 'fabio', body: 'reg',
    palette: Object.assign({}, PALETTES.FABIO_F1, { v: '#D19A72', V: '#A9714F' }),   // manga curta
    patterns: [{ on: 'cau', color: '#8DB4EC', rule: 'floral' }]
  },

  // blusa canelada frente única azul, short jeans rasgado, cabelo meio a meio, óculos de grau
  ELLEN_F1: {
    head: 'ellen', body: 'slim', hair: 'half',
    palette: Object.assign({}, PALETTES.ELLEN_F1, { v: '#F6D7C6', V: '#E2B19F' }),   // frente única: braços de fora
    patterns: [
      { on: 'c', color: '#5089D2', rule: 'ribbed' },
      { on: 'p', color: '#DCE6F0', rule: 'rips' }
    ]
  },

  // ---------- prólogo (seção 11.2) ----------

  // o Fabio na lanchonete, antes do coma: o moletom de sempre, ainda sem o curativo
  FABIO_PRE: {
    head: 'fabio', body: 'hoodie',
    palette: Object.assign({}, PALETTES.FABIO_NOW, {
      u: '#D9A62E', a: '#D9A62E', A: '#AD811B', n: '#2A3550', N: '#1B2440'
    })
  },

  // a Ellen em casa (cabelo platinado dourado): blusa lilás, calça jeans, óculos de grau
  ELLEN_HOME: {
    head: 'ellen', body: 'slim',
    palette: Object.assign({}, PALETTES.ELLEN_NOW, {
      h: '#F2D78E', H: '#FFF3C8', j: '#D9B565', d: '#B8904A',
      c: '#B9A2D8', C: '#8E78B4', Q: '#D8C8F0', k: '#B9A2D8',
      u: '#B9A2D8', a: '#B9A2D8', A: '#8E78B4', v: '#F6D7C6', V: '#E2B19F',
      p: '#3E5A8A', P: '#2A4068', n: '#3E5A8A', N: '#2A4068', f: '#F4F4F2', F: '#C2C6CE'
    })
  },

  // a Ellen no laboratório: jaleco do presente, cabelo platinado (1) e depois meio a meio (2)
  ELLEN_LAB1: {
    head: 'ellen', body: 'coat',
    palette: Object.assign({}, PALETTES.ELLEN_NOW, {
      h: '#F2D78E', H: '#FFF3C8', j: '#D9B565', d: '#B8904A',
      u: '#F4F6F8', a: '#F4F6F8', A: '#C3CAD6', n: '#2A2E44', N: '#1B1E2E'
    })
  },
  ELLEN_LAB2: {
    head: 'ellen', body: 'coat', hair: 'half',
    palette: Object.assign({}, PALETTES.ELLEN_NOW, {
      h: '#F2D78E', H: '#FFF3C8', j: '#D9B565', r: '#A87E48', R: '#C99F63', q: '#7A572B', d: '#7A572B',
      u: '#F4F6F8', a: '#F4F6F8', A: '#C3CAD6', n: '#2A2E44', N: '#1B1E2E'
    })
  },

  // professor Tony Robinson (Apêndice B): paletó de tweed marrom com remendos, óculos redondos,
  // barba grisalha
  TONY: {
    head: 'man', body: 'reg', extras: ['TONY_BEARD', 'TONY_GLASSES'],
    colors: { skin: '#EBC2A0', hair: '#A8A4A0', top: '#7A5A3C', inner: '#E8E0CC', bottom: '#5E5650', shoes: '#3A2A22', sleeves: 'long', beard: '#B4B0AA', glasses: '#4A3A30' },
    patterns: [{ on: 'cC', color: '#6A4A30', rule: 'check' }]
  },

  // professora Heymans: loira de coque, cardigã verde, prancheta
  HEYMANS: {
    head: 'woman', body: 'slim', extras: ['HEYMANS_BUN', 'HEYMANS_CLIPBOARD'],
    colors: { skin: '#F2D2BC', hair: '#E8C878', top: '#4E8A5A', inner: '#F2F0EA', bottom: '#4A4E5E', shoes: '#3A2A22', sleeves: 'long' },
    add: { x: '#8A5A32', y: '#F4F0E6', z: '#9AA0B0' }
  },

  // ---------- NPCs genéricos (trocando a paleta) ----------
  // sleeves: 'short' (manga curta), 'long' ou 'none' (sem manga); legs: 'pants' ou 'bare' (short, saia)

  CUSTOMER_GREEN: { head: 'man',   body: 'reg',  colors: { skin: '#EBC29E', hair: '#231A18', top: '#5A8A4E', bottom: '#2E3448', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_TEAL:  { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#6B4430', top: '#3E9A8E', bottom: '#3A3F5A', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_GREY:  { head: 'man',   body: 'reg',  colors: { skin: '#E0B48E', hair: '#A3A2A8', top: '#7A5A3E', bottom: '#3A3A44', shoes: '#2A2630', sleeves: 'long' } },
  CUSTOMER_RED:   { head: 'man',   body: 'reg',  colors: { skin: '#D9A47E', hair: '#1E1A22', top: '#B8423E', bottom: '#2E3448', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_NAVY:  { head: 'woman', body: 'slim', colors: { skin: '#C98E66', hair: '#2A1E1A', top: '#2E4470', bottom: '#4A4A52', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_LILAC: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#8A4E36', top: '#8A6AB8', bottom: '#E8E2D6', shoes: '#F0EEE8', sleeves: 'none', legs: 'bare' } },
  CUSTOMER_BEIGE: { head: 'man',   body: 'reg',  colors: { skin: '#E8BC96', hair: '#2E2420', top: '#D8C8A4', bottom: '#4A4E5E', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_PINK:  { head: 'woman', body: 'slim', colors: { skin: '#F4D6C2', hair: '#1E1A22', top: '#E888A8', bottom: '#3A3F5A', shoes: '#F0EEE8', sleeves: 'short' } },
  CUSTOMER_MINT:  { head: 'woman', body: 'slim', colors: { skin: '#E8C0A0', hair: '#5A3A28', top: '#9AD8C0', bottom: '#E8E2D6', shoes: '#F0EEE8', sleeves: 'none', legs: 'bare' } },
  CUSTOMER_BLACK: { head: 'man',   body: 'reg',  colors: { skin: '#C99070', hair: '#1A1416', top: '#2A2A32', bottom: '#5A6A8A', shoes: '#F0EEE8', sleeves: 'short' } },
  CUSTOMER_ORANGE:{ head: 'man',   body: 'reg',  colors: { skin: '#F0C8A8', hair: '#8A5A3A', top: '#E8823A', bottom: '#E8E2D6', shoes: '#2A2630', sleeves: 'short', legs: 'bare' } },

  // atendente do café (avental marrom) e garçom do Saizeriya (camisa branca, calça preta)
  CAFE_STAFF:     { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#3A2420', top: '#8A5A3A', inner: '#F2F0EA', bottom: '#5A3A2A', shoes: '#2A2630', sleeves: 'short' } },
  WAITER:         { head: 'man',   body: 'reg',  colors: { skin: '#E0B48E', hair: '#1E1A22', top: '#F4F2EC', inner: '#2A2630', bottom: '#22232B', shoes: '#141218', sleeves: 'long' } }
};
