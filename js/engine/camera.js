// Câmera: acompanha a Ellen na horizontal, como no Mario, sem passar dos limites da sala.
const Camera = {
  x: 0,

  follow(targetX, roomWidth, viewWidth = Display.W) {
    this.x = Math.max(0, Math.min(roomWidth - viewWidth, Math.round(targetX - viewWidth / 2)));
  }
};
