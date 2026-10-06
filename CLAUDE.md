# Memories from the Future

Jogo do pedido de casamento do Fabio para a Ellen. Tudo está no `SPEC.md`: leia o arquivo inteiro antes de começar e siga as etapas da seção 12, com um commit no fim de cada etapa. **Prazo: quinta-feira, 08/10/2026.** Se o tempo apertar, use a lista de cortes da seção 12.

## Estado

- Etapas 1 (base) e 2 (núcleo de stealth no F1 A1) prontas. A próxima é a etapa 3 (fase 1 completa).
- O repositório `Memories-from-the-future` já existe no GitHub, mas ainda não tem remote configurado aqui: peça o link ao Fabio antes do primeiro push. Ele usa o GitHub Desktop.
- `suspicionUpPerSec` está em 2.0, não no 1.0 do SPEC: com 1.0 ninguém era pega no F1 A1, nem parada no corredor. O motivo está no comentário do `config.js`.
- Pendências para a etapa 3:
  - `Flow.roomDone` recomeça a sala; falta ligar ao corredor, ao baú e à máquina.
  - A passagem da esquerda do primeiro cenário da sala está fechada por uma parede invisível (em `room.js`) até existirem os corredores.
  - Os corpos `slim` e `reg` ainda andam com os troncos do jaleco e do moletom. Crie troncos genéricos quando alguém do passado ou um NPC andar (o garçom do F1 C1).
  - Faltam as poses deitado e beijando (F1 B2, F1 C2).

## Como testar

- O painel do navegador não interage com `file://`. Use `preview_start` com o nome `jogo` (servidor Python na porta 8765, configurado em `.claude/launch.json`) e confira se o console está sem erros. Se a porta já estiver ocupada por outra conversa, abra `http://127.0.0.1:8765/index.html` com `preview_start` + `url`: é a mesma pasta.
- O navegador guarda os scripts em cache. Antes de recarregar, rode `fetch(src, { cache: 'reload' })` em cada `script[src]`.
- Com o painel oculto, o `requestAnimationFrame` para e o jogo congela. Para medir a jogabilidade sem depender disso, chame `StealthState.enter({ stage: 1, room: 0, codes: ['F1A1'], at: 0 })` e depois `StealthState.update(1/60)` em sequência. `StealthState.inspect()` devolve a sala, a Ellen, o Fabio e a fase.
- Teclas simuladas: dispare `KeyboardEvent` em `window` com `code` (ex.: `ArrowRight`, `Space`, `KeyD` + `ctrlKey`/`shiftKey`).

## Convenções do código

- Scripts clássicos carregados em ordem pelo `index.html`, sem módulos ES nem `fetch`. Os dados ficam em `window.GAME_CONFIG`, `SPRITES`, `PALETTES`, `FONT`, `CHARACTERS` (roupas por data) e `SCENES` (um arquivo por cenário em `data/scenes/`).
- Todo texto, pista, senha, data e dificuldade fica em `data/config.js`. Os comentários do código são em português.
- Objetos globais do motor: `Display`, `Gfx` (desenho, sprites, `Gfx.text`/`textWidth`/`wrap`), `Input` (ações: up/down/left/right/run/confirm/cancel; `interact` = `confirm`), `Loop`, `Sound`, `Save`, `Camera`, `Dialog` (`say`/`toast`, linhas `"NOME: fala"`, `[ação]` chama `onAction`), `Game` (`register`/`go`/`transition`/`notice`), `Debug` (`addJump`, `flags.invisible/boxes/fps`), `Hud`, `Flow`.
- Objetos globais do jogo:
  - `Chars.sprite(roupa, { pose, dir, head, frame })` monta e guarda em cache. O corpo é a camada de pernas com o tronco por cima, e nos passos o tronco desce 1 px.
  - `Scenery` tem os pintores de piso e parede e a biblioteca de objetos, cada um com `solid`, `sight` e `draw`.
  - `Room.build(códigos)` junta os cenários da sala.
  - `Vision` faz o raycasting. `inside()` usa a mesma conta do desenho do cone.
  - `Guard.create` cria o vigia com a linha do tempo em loop.
  - `StealthState` é o estado `stealth`.
- Cenário = só dados: `look` (piso, parede, portas), `start`, `props`, `npcs` e `guards`. Ângulos em graus: 0 é direita, 90 baixo, 180 esquerda e 270 cima.
- Cada estado é um objeto com `enter`/`update`/`render` e, se quiser, `idle` (roda durante um diálogo), `skip` (Ctrl+Shift+K) e `pausable`.
- `referencias/` tem fotos pessoais: fica fora do git. Abra só as fotos do cenário que estiver construindo.
