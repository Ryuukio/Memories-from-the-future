// Fase 4 ("Islands, Rings & Lanterns"): roupas por data (SPEC, Apêndice A), visitantes, o
// instrutor da oficina das alianças e os mergulhadores.
(() => {
  const fab = o => Object.assign({ s: '#D19A72', S: '#A9714F', b: '#2B201C', d: '#1E1512', e: '#1E1512', g: '#2B201C', h: '#2B201C', H: '#4F4248', j: '#140E0B', l: '#FFFFFF', m: '#6E3828', w: '#F6F6F2', W: '#CFCFC5' }, o);
  const ell = (o, glasses = false) => Object.assign({
    s: '#F6D7C6', S: '#E2B19F', b: '#F2ABA3', d: '#B8904A', e: '#3A2832', m: '#C76C6C',
    h: '#F2D78E', H: '#FFF3C8', j: '#D9B565',
    g: glasses ? '#A3716A' : '#F6D7C6', l: glasses ? '#FFFFFF' : '#F6D7C6'
  }, o);
  const sunglasses = { g: '#1E1E24', l: '#4A4A58', e: '#1E1E24' };
  const bareF = { v: '#D19A72', V: '#A9714F' }, bareE = { v: '#F6D7C6', V: '#E2B19F' };
  const wetsuit = { c: '#1B1C20', C: '#121216', Q: '#26272C', k: '#26272C', u: '#1B1C20', a: '#1B1C20', A: '#121216', v: '#1B1C20', V: '#121216',
    p: '#1B1C20', P: '#121216', n: '#1B1C20', N: '#121216', f: '#1B1C20', F: '#121216' };

  Object.assign(window.CHARACTERS, {
    // A1 — zoológico: camiseta preta, bermuda azul-marinho; camiseta e short pretos largos
    FABIO_F4A1: { head: 'fabio', body: 'reg',
      palette: fab(Object.assign({ c: '#1C1C20', C: '#121216', Q: '#34343C', k: '#1C1C20', u: '#1C1C20', a: '#1C1C20', A: '#121216',
        p: '#1F2E40', P: '#14202E', n: '#D19A72', N: '#A9714F', f: '#F4F4F2', F: '#C2C6CE' }, bareF)) },
    ELLEN_F4A1: { head: 'ellen', body: 'slim',
      palette: ell(Object.assign({ c: '#1E1D22', C: '#141218', Q: '#34323A', k: '#1E1D22', u: '#1E1D22', a: '#1E1D22', A: '#141218',
        p: '#1E1D22', P: '#141218', n: '#F6D7C6', N: '#E2B19F', f: '#F4F4F2', F: '#C2C6CE' }, bareE)) },

    // A2 — aquário: camisa branca com coqueiros marrons, bermuda turquesa, boné preto para trás;
    // vestido branco sem manga com flores laranja e azuis
    FABIO_F4A2: { head: 'fabio', body: 'reg', extras: ['F4_CAP_BACK'],
      palette: fab(Object.assign({ c: '#F2EEE6', C: '#C8C2B6', Q: '#FFFFFF', k: '#F2EEE6', u: '#F2EEE6', a: '#F2EEE6', A: '#C8C2B6',
        p: '#2A86A6', P: '#1E6A86', n: '#D19A72', N: '#A9714F', f: '#1E1C22', F: '#141218', x: '#1E1C22', X: '#141218', y: '#2A2830' }, bareF)),
      patterns: [{ on: 'cCua', color: '#6B4A2E', rule: 'floral' }] },
    ELLEN_F4A2: { head: 'ellen', body: 'slim',
      palette: ell(Object.assign({ c: '#F4F1EC', C: '#D2CEC6', Q: '#FFFFFF', k: '#F4F1EC', u: '#F6D7C6', a: '#F6D7C6', A: '#E2B19F',
        p: '#F4F1EC', P: '#D2CEC6', n: '#F6D7C6', N: '#E2B19F', f: '#F4F4F2', F: '#C2C6CE' }, bareE)),
      patterns: [{ on: 'cCpP', color: '#E8702A', rule: 'floral' }, { on: 'cCpP', color: '#3B6FC4', rule: 'dots' }] },

    // B1 — mergulho: neoprene preto, colete preto; máscara turquesa (ele) e branca (ela)
    FABIO_F4B1: { head: 'fabio', body: 'reg', extras: ['F4_DIVE_MASK'],
      palette: fab(Object.assign({}, wetsuit, { x: '#2CB5B0', i: '#9ADCEA', y: '#FFFFFF', t: '#1B1C20', z: '#2CB5B0' })) },
    ELLEN_F4B1: { head: 'ellen', body: 'slim', extras: ['F4_DIVE_MASK', 'F2_BUN'],
      palette: ell(Object.assign({}, wetsuit, { x: '#E9E8D8', i: '#BFE6F2', y: '#FFFFFF', t: '#1B1C20', z: '#F4F4F2' })) },

    // B2 — oficina das alianças: avental verde-oliva; camisa de tricô azul-petróleo sobre camiseta
    // branca; braços de fora e coque
    FABIO_F4B2: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#5F5E3C', C: '#48472C', Q: '#787652', k: '#F2F0EA', u: '#2F3F45', a: '#2F3F45', A: '#222E33', v: '#2F3F45', V: '#222E33',
        p: '#2A2E36', P: '#1E2228', n: '#2A2E36', N: '#1E2228', f: '#1E1C22', F: '#141218' }) },
    ELLEN_F4B2: { head: 'ellen', body: 'slim', extras: ['F2_BUN'],
      palette: ell(Object.assign({ c: '#5F5E3C', C: '#48472C', Q: '#787652', k: '#F2C14E', u: '#F6D7C6', a: '#F6D7C6', A: '#E2B19F',
        p: '#2A2E36', P: '#1E2228', n: '#2A2E36', N: '#1E2228', f: '#F4F4F2', F: '#C2C6CE' }, bareE)) },
    F4_INSTRUCTOR: { head: 'man', body: 'reg', colors: { skin: '#E8C0A0', hair: '#4A3A30', top: '#5F5E3C', inner: '#F2F0EA', bottom: '#2A2E36', shoes: '#1E1C22', sleeves: 'long', glasses: '#4A4A58' } },

    // C1 — Yanai: yukata cinza-amarronzado com ondas brancas e geta; camiseta rosa-clara, manguitos
    // rosa, short branco de babados, óculos escuros na cabeça, cabelo preso
    FABIO_F4C1: { head: 'fabio', body: 'reg',
      palette: fab({ c: '#8A7A6A', C: '#6A5C4E', Q: '#A8988A', k: '#F2F0EA', u: '#8A7A6A', a: '#8A7A6A', A: '#6A5C4E', v: '#8A7A6A', V: '#6A5C4E',
        p: '#8A7A6A', P: '#6A5C4E', n: '#D19A72', N: '#A9714F', f: '#B8945A', F: '#8A6A3A' }),
      patterns: [{ on: 'cCuapP', color: '#EFEAE2', rule: 'waves' }] },
    ELLEN_F4C1: { head: 'ellen', body: 'slim', extras: ['F2_BUN', 'F4_HEAD_SUNGLASSES'],
      palette: ell({ c: '#F2C6CC', C: '#D8A4AC', Q: '#FAE0E4', k: '#F2C6CC', u: '#F0C9CF', a: '#F0C9CF', A: '#D8A8B0', v: '#F0C9CF', V: '#D8A8B0',
        p: '#F6F2EA', P: '#D8D2C8', n: '#F6D7C6', N: '#E2B19F', f: '#F4F4F2', F: '#C2C6CE', i: '#1E1E24' }) },

    // C2 — Tottori: boné branco, camisa de tricô aberta sobre a regata branca, bermuda branca com
    // folhas e flores, descalço; o vestido verde, óculos aviador, descalça, rabo de cavalo
    FABIO_F4C2: { head: 'fabio', body: 'reg', extras: ['F2_CAP_PLAIN'],
      palette: fab({ c: '#2F3F45', C: '#222E33', Q: '#45585E', k: '#F4F4F4', u: '#2F3F45', a: '#2F3F45', A: '#222E33', v: '#D19A72', V: '#A9714F',
        p: '#F0EEE8', P: '#C8C6BE', n: '#D19A72', N: '#A9714F', f: '#D19A72', F: '#A9714F', x: '#F2F2F2', X: '#C8C8CC', y: '#DADADE' }),
      patterns: [{ on: 'pP', color: '#2E7D4F', rule: 'dots' }, { on: 'pP', color: '#E08A2C', rule: 'floral' }] },
    ELLEN_F4C2: { head: 'ellen', body: 'slim', extras: ['F4_PONYTAIL'],
      palette: Object.assign(ell(Object.assign({ c: '#B9C493', C: '#98A472', Q: '#D2DCAC', k: '#B9C493', u: '#F6D7C6', a: '#F6D7C6', A: '#E2B19F',
        p: '#D3DCA4', P: '#B4BE84', n: '#F6D7C6', N: '#E2B19F', f: '#F6D7C6', F: '#E2B19F', z: '#1E1C22' }, bareE)), sunglasses),
      patterns: [{ on: 'c', color: '#E8EECC', rule: 'dots' }] },

    // visitantes do zoológico e do aquário
    F4_VISITOR_1: { head: 'man', body: 'reg', colors: { skin: '#E0B48E', hair: '#2A2420', top: '#E8823A', bottom: '#3A4A6A', shoes: '#F0EEE8', sleeves: 'short' } },
    F4_VISITOR_2: { head: 'woman', body: 'slim', colors: { skin: '#F2D2BC', hair: '#5A3A28', top: '#5DA8D8', bottom: '#F4F2EC', shoes: '#F0EEE8', sleeves: 'short' } },
    F4_VISITOR_3: { head: 'woman', body: 'slim', colors: { skin: '#E8C0A0', hair: '#1A1416', top: '#F2E07A', bottom: '#2A3550', shoes: '#2A2630', sleeves: 'none' } },
    F4_KID: { head: 'man', body: 'reg', colors: { skin: '#F0CDB0', hair: '#3A2A20', top: '#D8443A', bottom: '#2A3550', shoes: '#F0EEE8', sleeves: 'short', legs: 'bare' } }
  });
})();
