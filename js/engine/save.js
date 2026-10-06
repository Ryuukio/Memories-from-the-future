// Salvamento automático no localStorage, no começo de cada cenário.
// Tudo em try/catch: se o navegador bloquear o armazenamento, o jogo segue sem salvar.
const Save = {
  KEY: 'memories-from-the-future.save.v1',

  load() {
    try {
      const s = window.localStorage.getItem(this.KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  // ex.: Save.write({ stage: 1, scene: 'F1A1', memory: 0 })
  write(data) {
    try {
      window.localStorage.setItem(this.KEY, JSON.stringify(Object.assign({ v: 1, at: Date.now() }, data)));
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try { window.localStorage.removeItem(this.KEY); } catch (e) { /* sem armazenamento */ }
  }
};
