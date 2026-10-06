# Memories from the Future

Jogo do pedido de casamento do Fabio para a Ellen. Tudo está no `SPEC.md`: leia o arquivo inteiro antes de começar e siga as etapas da seção 12, com um commit no fim de cada etapa. **Prazo: quinta-feira, 08/10/2026.** Se o tempo apertar, use a lista de cortes da seção 12.

## Estado

- Etapas 1 (base), 2 (núcleo de stealth no F1 A1) e 3 (fase 1 completa) prontas e commitadas. A próxima é a etapa 4 (fases 2 a 4).
- Fase 1 jogável do começo ao fim: cartão da fase (`card.js`) → chegada (`texts.arrival`) → sala A → corredor (`HALL`) → sala B → corredor → sala C → salinha do baú (`CHEST`, `chest.js` + `items.js`) → tela da máquina (`anomaly.js`) → cartão da fase 2 (enquanto a fase 2 não tiver cenários, volta ao título). O fluxo está em `flow.js`. Salva no começo de cada cenário e também em `CHEST` e `MACHINE`; o Continue volta para lá. O Ctrl+Shift+K funciona no cartão, em cada cenário, no corredor, no baú e na máquina.
- Cenários da fase 1 em `data/scenes/F1A1.js` … `F1C2.js`, desenhados em `scenery.js` (F1 A1) e `scenery-f1.js`; corredor e baú em `scenery-hall.js`. Cada cenário é recortado no próprio espaço ao pintar o fundo (nada vaza para o vizinho).
- Poses: `lie` é deitado na horizontal (32×16, `dir` = lado da cabeça, `head: 'sky' | 'up' | 'down'`), `floor` é sentado de pernas cruzadas, de frente (`BODY_FLOOR_SIT`). No planetário, os casais deitam na horizontal nas camas redondas, e o casal do passado senta de pernas cruzadas para olhar a sala.
- Balanceamento da fase 1 (medido com `tools/devtools.js`): andando reto sem olhar, a Ellen é pega em 11% a 21% das fases do loop de cada cenário e leva susto ("??!!") em 17% a 29%; esperando a janela, passa sempre, em 6 a 9,5 s jogando perfeito. Os cones das viradas andam da esquerda para a direita, junto com quem passa (é isso que pega quem não espera). Use os mesmos números como referência nas fases seguintes, subindo um pouco a cada fase.
- O repositório `Memories-from-the-future` já existe no GitHub, mas ainda não tem remote configurado aqui: peça o link ao Fabio antes do primeiro push. Ele usa o GitHub Desktop.
- `suspicionUpPerSec` está em 2.0, não no 1.0 do SPEC: com 1.0 ninguém era pega no F1 A1, nem parada no corredor. O motivo está no comentário do `config.js`.

## Como testar

- O painel do navegador não interage com `file://`. Use `preview_start` com o nome `jogo` (servidor Python na porta 8765, configurado em `.claude/launch.json`) e confira se o console está sem erros. Se a porta já estiver ocupada por outra conversa, abra `http://127.0.0.1:8765/index.html` com `preview_start` + `url`: é a mesma pasta.
- Numa worktree (`.claude/worktrees/...`), o servidor da porta 8765 mostra a pasta principal, não a sua. Crie outra configuração no `.claude/launch.json` da worktree, com outra porta e o caminho da worktree **com barras normais** (`C:/Users/...`): com `\` o caminho chega quebrado ao Python e tudo dá 404.
- `tools/devtools.js` tem as ferramentas de teste (o jogo não carrega esse arquivo): congelar o loop e avançar na mão (`__run`), print ampliado (`__snap`), abrir cenário, teclas simuladas e as medidas de balanceamento (`__plan`, `__naive`, `__stats`, `__heat`). O jeito de carregar e a lista estão no topo do arquivo. Depois de `__reload()`, espere a página carregar numa chamada separada antes de carregar o arquivo de novo.
- O navegador guarda os scripts em cache. Antes de recarregar, rode `fetch(src, { cache: 'reload' })` em cada `script[src]`.
- Com o painel oculto, o `requestAnimationFrame` para e o jogo congela. Para medir a jogabilidade sem depender disso, chame `StealthState.enter({ stage: 1, room: 0, codes: ['F1A1'], at: 0 })` e depois `StealthState.update(1/60)` em sequência. `StealthState.inspect()` devolve a sala, a Ellen, o Fabio e a fase.
- Teclas simuladas: dispare `KeyboardEvent` em `window` com `code` (ex.: `ArrowRight`, `Space`, `KeyD` + `ctrlKey`/`shiftKey`). Na tela da máquina, o texto vai pelo `key` (ex.: `{ key: 'h', code: 'KeyH' }`) e Enter confirma.
- Para abrir um cenário direto: `Game.go('stealth', { stage: 1, kind: 'room', room: 0, codes: ['F1B1', 'F1B2'], at: 1 }, { instant: true })`. Corredor: `kind: 'hall', codes: ['HALL'], nextRoom: 1`; baú: `kind: 'chest', codes: ['CHEST']`; máquina: `Game.go('anomaly', { stage: 1 })`.
- O print do painel às vezes sai ampliado e cortado (zoom de 1,5×). Para ver os pixels, desenhe o canvas ampliado num `<canvas>` com `position: fixed; left: 0; top: 0` e tire o print.

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
- Cenário = só dados: `look` (piso, parede, portas), `start`, `props`, `npcs`, `movers` e `guards`. Ângulos em graus: 0 é direita, 90 baixo, 180 esquerda e 270 cima. Os comentários no topo de `room.js`, `scenery.js` e `guards.js` listam todas as opções.
- Nos pintores e objetos, use `>>>` (e não `>>`) para tirar números do `hash`: com `>>` o resultado fica negativo e pinta fora do lugar.
- Cada estado é um objeto com `enter`/`update`/`render` e, se quiser, `idle` (roda durante um diálogo), `skip` (Ctrl+Shift+K) e `pausable`.
- `referencias/` tem fotos pessoais: fica fora do git. Abra só as fotos do cenário que estiver construindo.
