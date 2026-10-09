// Fase 3 ("Through the Seasons"): roupas por data (SPEC, Apêndice A), os amigos do churrasco e o
// amigo do barco de Nara.
(() => {
  const fab = o => Object.assign({ s: '#D19A72', S: '#A9714F', b: '#2B201C', d: '#1E1512', e: '#1E1512', g: '#2B201C', h: '#2B201C', H: '#4F4248', j: '#140E0B', l: '#FFFFFF', m: '#6E3828', w: '#F6F6F2', W: '#CFCFC5' }, o);
  const ell = (o, glasses = true) => Object.assign({
    s: '#F6D7C6', S: '#E2B19F', b: '#F2ABA3', d: '#B8904A', e: '#3A2832', m: '#C76C6C',
    h: '#F2D78E', H: '#FFF3C8', j: '#D9B565',
    g: glasses ? '#A3716A' : '#F6D7C6', l: glasses ? '#FFFFFF' : '#F6D7C6'
  }, o);
  const sunglasses = { g: '#1E1E24', l: '#4A4A58', e: '#1E1E24' };
  // roupa inteira de uma cor (tronco, mangas compridas, calça)
  const suit = (c, C, Q, p, P, f, F) => ({ c, C, Q, k: c, u: c, a: c, A: C, v: c, V: C, p, P, n: p, N: P, f, F });

  Object.assign(window.CHARACTERS, {
    // A1 — aniversários na cozinha: camisa branca e calça azul-escura (os dois)
    FABIO_F3A1: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#F2F0EA', C: '#C8C6BE', Q: '#FFFFFF', k: '#F2F0EA', u: '#F2F0EA', a: '#F2F0EA', A: '#C8C6BE', v: '#D19A72', V: '#A9714F',
        p: '#24365E', P: '#182644', n: '#24365E', N: '#182644', f: '#2A2630', F: '#1C1A20' }) },
    ELLEN_F3A1: { head: 'ellen', body: 'slim',
      palette: ell({ c: '#F2F0EA', C: '#C8C6BE', Q: '#FFFFFF', k: '#F2F0EA', u: '#F2F0EA', a: '#F2F0EA', A: '#C8C6BE', v: '#F6D7C6', V: '#E2B19F',
        p: '#24365E', P: '#182644', n: '#24365E', N: '#182644', f: '#F0EEE8', F: '#C8C6BE' }) },

    // A2 — Shirakawa-go: gorro laranja-ferrugem, jaqueta verde-oliva aberta sobre o colete azul-marinho,
    // calça verde-oliva; gorro cinza, óculos escuros, jaqueta preta com zíper branco, calça cargo preta
    FABIO_F3A2: { head: 'fabio', body: 'reg', extras: ['F3_BEANIE'],
      palette: fab({ c: '#2E2C3A', C: '#1E1C28', Q: '#5E574B', k: '#F2F0EA', u: '#5E574B', a: '#5E574B', A: '#46413A', v: '#5E574B', V: '#46413A',
        p: '#6E6C52', P: '#54523E', n: '#6E6C52', N: '#54523E', f: '#1E1C22', F: '#141218', x: '#B9622E', X: '#8E4A22', y: '#D07A42' }) },
    ELLEN_F3A2: { head: 'ellen', body: 'slim', extras: ['F3_BEANIE'],
      palette: Object.assign(ell(Object.assign({ x: '#9C9C9C', X: '#7A7A7A', y: '#B8B8B8' }, suit('#1C1C22', '#121216', '#3A3A44', '#1E1B22', '#141216', '#1E1C22', '#141218'), { k: '#F2F0EA' }), false), sunglasses) },

    // B1 — esqui: macacão vermelho com detalhes cinza, capacete preto e óculos de lente vermelha;
    // macacão pied-de-poule preto e branco, capacete preto, óculos azul espelhado, luvas pretas
    FABIO_F3B1: { head: 'fabio', body: 'reg', extras: ['F3_HELMET'],
      palette: fab(Object.assign(suit('#C8283C', '#9A1E2E', '#E85060', '#C8283C', '#9A1E2E', '#1C1D22', '#121216'), { k: '#9EA3A8', x: '#1C1D22', X: '#121216', y: '#3A3B44', i: '#D04545' })) },
    ELLEN_F3B1: { head: 'ellen', body: 'slim', extras: ['F3_HELMET'],
      palette: ell(Object.assign(suit('#EDEDED', '#C8C8CC', '#FFFFFF', '#EDEDED', '#C8C8CC', '#1C1D22', '#121216'), { v: '#1B1B1F', V: '#121216', x: '#1C1D22', X: '#121216', y: '#3A3B44', i: '#2A4FD0' }), false),
      patterns: [{ on: 'cCpPuaAn', color: '#1B1B1F', rule: 'check' }] },
    F3_SKIER_1: { head: 'man', body: 'reg', extras: ['F3_HELMET'], colors: { skin: '#E0B48E', hair: '#2A2420', top: '#3A78C8', bottom: '#2A3550', shoes: '#1C1D22', sleeves: 'long' },
      add: { x: '#F4F4F2', X: '#C8C8CC', y: '#FFFFFF', i: '#F2C14E' } },
    F3_SKIER_2: { head: 'woman', body: 'slim', extras: ['F3_HELMET'], colors: { skin: '#F2D2BC', hair: '#5A3A28', top: '#5DAA62', bottom: '#2A2A32', shoes: '#1C1D22', sleeves: 'long' },
      add: { x: '#E8823A', X: '#B8622A', y: '#F2A060', i: '#5DD0F0' } },

    // B2 — churrasco: camisa xadrez azul-clara aberta sobre camiseta branca, chapéu bege-claro, jeans;
    // duas tranças platinadas, óculos de grau, jaqueta jeans, vestido azul-violeta, bota preta
    FABIO_F3B2: { head: 'fabio', body: 'reg', extras: ['F3_HAT'],
      palette: fab({ c: '#7FAEDD', C: '#5E8EC0', Q: '#A9CBEB', k: '#F2F0EA', u: '#7FAEDD', a: '#7FAEDD', A: '#5E8EC0', v: '#7FAEDD', V: '#5E8EC0',
        p: '#3E5A8A', P: '#2C4268', n: '#3E5A8A', N: '#2C4268', f: '#5A3A22', F: '#3A2414', x: '#E3D6BC', X: '#C2B496', z: '#8A7A5E' }),
      patterns: [{ on: 'cCua', color: '#A9CBEB', rule: 'check' }] },
    ELLEN_F3B2: { head: 'ellen', body: 'slim', extras: ['F3_BRAIDS'],
      palette: ell({ c: '#5C4FC2', C: '#463A9A', Q: '#7A6EDA', k: '#5C4FC2', u: '#3F5F92', a: '#3F5F92', A: '#2C4670', v: '#3F5F92', V: '#2C4670',
        p: '#5C4FC2', P: '#463A9A', n: '#F6D7C6', N: '#E2B19F', f: '#1E1C22', F: '#141218' }) },
    F3_FRIEND_1: { head: 'man', body: 'reg', colors: { skin: '#E8C0A0', hair: '#1E1A1E', top: '#D8CBB0', bottom: '#1E1C22', shoes: '#1E1C22', sleeves: 'long', legs: 'bare' } },
    F3_FRIEND_2: { head: 'woman', body: 'slim', colors: { skin: '#F0CDB0', hair: '#1A1416', top: '#D6D02A', bottom: '#1E1C22', shoes: '#1E1C22', sleeves: 'long' } },
    F3_FRIEND_3: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#1A1416', top: '#A7A7A5', bottom: '#8FA8C8', shoes: '#E8E4DC', sleeves: 'long' } },
    F3_FRIEND_4: { head: 'woman', body: 'slim', colors: { skin: '#F4D6C2', hair: '#A8784A', top: '#1E1C22', inner: '#C8923A', bottom: '#3E5A8A', shoes: '#1E1C22', sleeves: 'long' } },
    F3_FRIEND_5: { head: 'man', body: 'reg', colors: { skin: '#D9A47E', hair: '#1E1A22', top: '#1E1C22', inner: '#D8443A', bottom: '#3E5A8A', shoes: '#2A2630', sleeves: 'long', glasses: '#4A4A58' },
      patterns: [{ on: 'avV', color: '#3A78C8', rule: 'stripes' }] },

    // C1 — Himeji: camiseta azul-marinho e moletom cinza-claro; jaqueta e saia pretas, meia-calça
    // preta, tênis branco, óculos escuros
    FABIO_F3C1: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#232848', C: '#161A30', Q: '#3A4068', k: '#232848', u: '#232848', a: '#232848', A: '#161A30', v: '#D19A72', V: '#A9714F',
        p: '#B4B4B4', P: '#909094', n: '#B4B4B4', N: '#909094', f: '#F4F4F2', F: '#C2C6CE' }) },
    ELLEN_F3C1: { head: 'ellen', body: 'slim',
      palette: Object.assign(ell(Object.assign(suit('#1E1C22', '#141218', '#3A3840', '#1E1C22', '#141218', '#F4F4F2', '#C2C6CE'), { n: '#2A2830', N: '#1E1C22' }), false), sunglasses) },

    // C2 — Nara (barco): camiseta e moletom cinza-claros; camiseta preta, calça cargo verde-oliva,
    // óculos escuros, cabelo preso; o amigo de camisa creme listrada, jeans claro e boné
    FABIO_F3C2: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#B9BCC0', C: '#95989E', Q: '#D8DADE', k: '#B9BCC0', u: '#B9BCC0', a: '#B9BCC0', A: '#95989E', v: '#D19A72', V: '#A9714F',
        p: '#B4B4B4', P: '#909094', n: '#B4B4B4', N: '#909094', f: '#F4F4F2', F: '#C2C6CE' }) },
    ELLEN_F3C2: { head: 'ellen', body: 'slim', extras: ['F2_BUN'],
      palette: Object.assign(ell({ c: '#1E1C22', C: '#141218', Q: '#3A3840', k: '#1E1C22', u: '#1E1C22', a: '#F6D7C6', A: '#E2B19F', v: '#F6D7C6', V: '#E2B19F',
        p: '#6E6B48', P: '#54523A', n: '#6E6B48', N: '#54523A', f: '#F4F4F2', F: '#C2C6CE' }, false), sunglasses) },
    F3_ROWER: { head: 'man', body: 'reg', extras: ['F2_CAP_PLAIN'], colors: { skin: '#E0B48E', hair: '#2A2420', top: '#E8E0CC', bottom: '#8FA8C8', shoes: '#1E1C22', sleeves: 'short' },
      patterns: [{ on: 'cC', color: '#8A7A5E', rule: 'stripes' }], add: { x: '#A9B8C8', X: '#8494A8', y: '#7A8AA0' } },

    // turistas de Himeji e visitantes
    F3_TOURIST_1: { head: 'man', body: 'reg', colors: { skin: '#F0C8A8', hair: '#C8A060', top: '#5A8AC8', bottom: '#C8B890', shoes: '#F0EEE8', sleeves: 'short' } },
    F3_TOURIST_2: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#2A1E1A', top: '#F2A7BE', bottom: '#F4F2EC', shoes: '#F0EEE8', sleeves: 'long' } }
  });
})();
