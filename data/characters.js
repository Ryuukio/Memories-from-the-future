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
    palette: PALETTES.FABIO_F1,
    patterns: [{ on: 'cau', color: '#8DB4EC', rule: 'floral' }]
  },

  // blusa canelada frente única azul, short jeans rasgado, cabelo meio a meio, óculos de grau
  ELLEN_F1: {
    head: 'ellen', body: 'slim', hair: 'half',
    palette: PALETTES.ELLEN_F1,
    patterns: [
      { on: 'c', color: '#5089D2', rule: 'ribbed' },
      { on: 'p', color: '#DCE6F0', rule: 'rips' }
    ]
  },

  // ---------- NPCs genéricos (trocando a paleta) ----------
  // sleeves: 'short' (manga curta), 'long' ou 'none' (sem manga); legs: 'pants' ou 'bare' (short, saia)

  CUSTOMER_GREEN: { head: 'man',   body: 'reg',  colors: { skin: '#EBC29E', hair: '#231A18', top: '#5A8A4E', bottom: '#2E3448', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_TEAL:  { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#6B4430', top: '#3E9A8E', bottom: '#3A3F5A', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_GREY:  { head: 'man',   body: 'reg',  colors: { skin: '#E0B48E', hair: '#A3A2A8', top: '#7A5A3E', bottom: '#3A3A44', shoes: '#2A2630', sleeves: 'long' } },
  CUSTOMER_RED:   { head: 'man',   body: 'reg',  colors: { skin: '#D9A47E', hair: '#1E1A22', top: '#B8423E', bottom: '#2E3448', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_NAVY:  { head: 'woman', body: 'slim', colors: { skin: '#C98E66', hair: '#2A1E1A', top: '#2E4470', bottom: '#4A4A52', shoes: '#2A2630', sleeves: 'short' } },
  CUSTOMER_LILAC: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#8A4E36', top: '#8A6AB8', bottom: '#E8E2D6', shoes: '#F0EEE8', sleeves: 'none', legs: 'bare' } }
};
