// Fase 2 ("Late Summer"): roupas por data (SPEC, Apêndice A) e os amigos do Brazilian Day
// (Apêndice B). Da fase 2 em diante, o cabelo da Ellen é platinado dourado.
(() => {
  // rosto e cabelo do Fabio; as letras da roupa vêm em `o`
  const fab = o => Object.assign({ s: '#D19A72', S: '#A9714F', b: '#2B201C', d: '#1E1512', e: '#1E1512', g: '#2B201C', h: '#2B201C', H: '#4F4248', j: '#140E0B', l: '#FFFFFF', m: '#6E3828', w: '#F6F6F2', W: '#CFCFC5' }, o);
  // a Ellen platinada; glasses: óculos de grau (armação rosada)
  const ell = (o, glasses = true) => Object.assign({
    s: '#F6D7C6', S: '#E2B19F', b: '#F2ABA3', d: '#B8904A', e: '#3A2832', m: '#C76C6C',
    h: '#F2D78E', H: '#FFF3C8', j: '#D9B565',
    g: glasses ? '#A3716A' : '#F6D7C6', l: glasses ? '#FFFFFF' : '#F6D7C6'
  }, o);
  const sunglasses = { g: '#1E1E24', l: '#4A4A58', e: '#1E1E24' };
  const skinFabio = { c: '#D19A72', C: '#A9714F', Q: '#E2B08A', k: '#D19A72', u: '#D19A72', a: '#D19A72', A: '#A9714F', v: '#D19A72', V: '#A9714F' };
  const bareEllen = { u: '#F6D7C6', a: '#F6D7C6', A: '#E2B19F', v: '#F6D7C6', V: '#E2B19F' };

  // A1 — no mar: ele sem camisa, bermuda azul-marinho; ela de top preto com turquesa e legging preta
  const fabioSea = fab(Object.assign({}, skinFabio, { p: '#0E2A55', P: '#08193A', n: '#D19A72', N: '#A9714F', f: '#D19A72', F: '#A9714F' }));
  const ellenSea = ell(Object.assign({}, bareEllen, {
    c: '#22232B', C: '#16171D', Q: '#2A8FB5', k: '#2A8FB5', u: '#2A8FB5',
    p: '#1E2027', P: '#121318', n: '#1E2027', N: '#121318', f: '#F6D7C6', F: '#E2B19F'
  }), false);

  Object.assign(window.CHARACTERS, {
    FABIO_F2A1: { head: 'fabio', body: 'reg', palette: fabioSea },
    ELLEN_F2A1: { head: 'ellen', body: 'slim', palette: ellenSea },

    // A2 — nas cadeiras: boné cáqui com os óculos azuis; chapéu de palha, óculos escuros, toalha
    // rosa e chinelo de tubarão
    FABIO_F2A2: { head: 'fabio', body: 'reg', extras: ['F2_CAP'],
      palette: Object.assign({}, fabioSea, { x: '#C8A77A', X: '#9E8058', y: '#A88A60', i: '#2F7FD8' }) },
    ELLEN_F2A2: { head: 'ellen', body: 'slim', extras: ['F2_STRAW_HAT', 'F2_TOWEL'],
      palette: Object.assign({}, ellenSea, sunglasses, { x: '#D9A55B', X: '#B08440', y: '#F0C880', z: '#1E1E24', t: '#EBC3C4', T: '#C89EA0', f: '#ECE6EA', F: '#C8C0C8' }) },

    // B1/B2 — cinema: camiseta branca e bermuda branca com folhas verdes e flores laranja;
    // regata canelada preta, calça jeans azul-escura, óculos de grau
    FABIO_F2B: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#F2F0EA', C: '#C8C6BE', Q: '#FFFFFF', k: '#F2F0EA', u: '#F2F0EA', a: '#F2F0EA', A: '#C8C6BE', v: '#D19A72', V: '#A9714F',
        p: '#F0EEE8', P: '#C8C6BE', n: '#D19A72', N: '#A9714F', f: '#F4F4F2', F: '#C2C6CE' }),
      patterns: [{ on: 'pP', color: '#2E7D4F', rule: 'dots' }, { on: 'pP', color: '#E08A2C', rule: 'floral' }] },
    ELLEN_F2B: { head: 'ellen', body: 'slim',
      palette: ell(Object.assign({}, bareEllen, { c: '#1F1D1B', C: '#141312', Q: '#3A3633', k: '#1F1D1B',
        p: '#24365E', P: '#182644', n: '#24365E', N: '#182644', f: '#F0EEE8', F: '#C8C6BE' })),
      patterns: [{ on: 'c', color: '#2C2A27', rule: 'ribbed' }] },

    // C1 — corona: o Fabio doente, coberto (compressa de gel na testa); a Ellen de pijama rosa
    FABIO_F2C1: { head: 'fabio', body: 'reg', extras: ['F2_GEL'],
      palette: fab({ c: '#9AA8C0', C: '#7A88A0', Q: '#B8C4D8', k: '#9AA8C0', u: '#9AA8C0', a: '#9AA8C0', A: '#7A88A0', v: '#D19A72', V: '#A9714F',
        p: '#5A6478', P: '#444C5E', n: '#5A6478', N: '#444C5E', f: '#D19A72', F: '#A9714F', y: '#BFE6F6' }) },
    ELLEN_F2C1: { head: 'ellen', body: 'slim',
      palette: ell({ c: '#F2A7BE', C: '#D888A0', Q: '#F8C8D8', k: '#F2A7BE', u: '#F2A7BE', a: '#F2A7BE', A: '#D888A0', v: '#F2A7BE', V: '#D888A0',
        p: '#F2A7BE', P: '#D888A0', n: '#F2A7BE', N: '#D888A0', f: '#F4E8EC', F: '#D8C8D0' }),
      patterns: [{ on: 'cp', color: '#F8D0DC', rule: 'dots' }] },

    // C2 — Brazilian Day: camiseta verde, bermuda grafite, máscara branca e óculos azuis na cabeça;
    // vestido verde (corpete sálvia, saia pistache), meia-calça branca rendada, óculos escuros, coque
    FABIO_F2C2: { head: 'fabio', body: 'reg', extras: ['F2_MASK', 'F2_HEAD_GLASSES'],
      palette: fab({ c: '#2EA35A', C: '#1F7A40', Q: '#5CC47E', k: '#2EA35A', u: '#2EA35A', a: '#2EA35A', A: '#1F7A40', v: '#D19A72', V: '#A9714F',
        p: '#1F2E40', P: '#14202E', n: '#D19A72', N: '#A9714F', f: '#F4F4F2', F: '#C2C6CE', y: '#E9ECF2', i: '#2F7FD8' }) },
    ELLEN_F2C2: { head: 'ellen', body: 'slim', extras: ['F2_BUN'],
      palette: Object.assign(ell(Object.assign({}, bareEllen, { c: '#B9C493', C: '#98A472', Q: '#D2DCAC', k: '#B9C493',
        p: '#D3DCA4', P: '#B4BE84', n: '#F3EEEA', N: '#D8D2CC', f: '#E8E4DC', F: '#C2C0B8' }), false), sunglasses),
      patterns: [{ on: 'c', color: '#E8EECC', rule: 'dots' }] },

    // amigos do Brazilian Day (Apêndice B)
    F2_FRIEND_1: { head: 'woman', body: 'slim', colors: { skin: '#F0CDB0', hair: '#6A4430', top: '#1E1C22', inner: '#F2F0EA', bottom: '#2A3550', shoes: '#E8E4DC', sleeves: 'short' } },
    F2_FRIEND_2: { head: 'woman', body: 'slim', extras: ['F2_CAP_PLAIN'], colors: { skin: '#F2D2BC', hair: '#1A1416', top: '#F4F2EC', bottom: '#2A2A32', shoes: '#2A2630', sleeves: 'short' },
      add: { x: '#E8E0D0', X: '#C8C0B0', y: '#D8D0C0' } },
    F2_FRIEND_3: { head: 'man', body: 'reg', colors: { skin: '#D9A47E', hair: '#1E1A22', top: '#F2D02A', inner: '#2E8A4A', bottom: '#2E5AA8', shoes: '#F0EEE8', sleeves: 'short' } },

    // gente da praia e do cinema, e a atendente da pipoca
    F2_BEACH_1: { head: 'man', body: 'reg', colors: { skin: '#E0B48E', hair: '#3A2A20', top: '#E0B48E', bottom: '#D8443A', shoes: '#E0B48E', sleeves: 'none', legs: 'bare' } },
    F2_BEACH_2: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#8A5A3A', top: '#F08AA8', bottom: '#F08AA8', shoes: '#F2D2BC', sleeves: 'none', legs: 'bare' } },
    F2_STAFF: { head: 'woman', body: 'slim', colors: { skin: '#F0CDB0', hair: '#2A1E1A', top: '#B8323A', inner: '#F4F2EC', bottom: '#1E1C22', shoes: '#1E1C22', sleeves: 'short' } }
  });
})();
