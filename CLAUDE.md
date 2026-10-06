# Memories from the Future

Jogo do pedido de casamento do Fabio para a Ellen. Tudo está no `SPEC.md`: leia o arquivo inteiro antes de começar e siga as etapas da seção 12, com um commit no fim de cada etapa. **Prazo: quinta-feira, 08/10/2026.** Se o tempo apertar, use a lista de cortes da seção 12.

## Estado

- Etapas 1 (base) e 2 (núcleo de stealth no F1 A1) prontas e commitadas.
- **Etapa 3 em andamento**: o commit "Etapa 3 (parcial)" tem tudo o que já foi feito. Já feito nesta etapa:
  - Fluxo completo em `flow.js`: cartão da fase (`card.js`) → sala A → corredor (`HALL`) → sala B → corredor → sala C → salinha do baú (`CHEST`) → tela da máquina (`anomaly.js`) → cartão da próxima fase (sem cenários, volta ao título). Na fase 1, a sala A abre com as falas de chegada (`texts.arrival`). Salva também em `CHEST` e `MACHINE`, e o Continue volta para lá.
  - Baú (`chest.js` + desenhos dos itens em `items.js`), barra de memória animada, fala do Fabio. Máquina testada: aceita "  hOkkaidô! ", recusa errado com tremor.
  - Os 5 cenários novos em `data/scenes/F1A2.js` … `F1C2.js`, desenhados em `js/game/scenery-f1.js`; corredor e baú em `scenery-hall.js`. Todos montam sem erro (`Room.build`). F1 A2 e F1 B1 já foram vistos e estão bons.
  - Troncos genéricos `TORSO_REG_*`/`TORSO_SLIM_*` (letras `v`/`V` = antebraço), pose `lie` (`BODY_LIE`), `eyes: 'closed'`, coraçõezinhos no beijo (`fx: 'heart'`, `heartAt`), cadeira estilo `'cafe'`, garçom andando (`movers` no cenário: bloqueia passagem e visão), luz do ambiente (`look.tint` + `lights`), sombras longas (`look.shadow: 'long'`), objetos `live`/`fx`/`hidden`, `look.bounds`/`bottom`/`edgeWidth`.
  - Modo de teste: atalhos para o cartão, cada cenário, corredor, baú e máquina de cada fase.
- **Falta para fechar a etapa 3:**
  1. Ver F1 B2, F1 C1 e F1 C2 na tela. No planetário, os casais deitados (`pose: 'lie'`) parecem gente em pé: deixar claro que estão deitados (travesseiro sob a cabeça, corpo mais curto ou sem as pernas visíveis, coberta etc.).
  2. Balancear os loops dos 6 cenários (SPEC 5: cerca de 30 s por cenário, pega no máximo 1–2 vezes, janela clara). Dá para simular o loop com `g.update(1/60)` e checar `Vision.inside` ao longo do caminho.
  3. Jogar a fase 1 inteira: New game → cartão → chegada → A → corredor → B → corredor → C → baú → máquina → cartão da fase 2. Testar o Continue no baú e na máquina e o Ctrl+Shift+K em cada parte.
  4. A porta do corredor (`hallDoor` em `scenery-hall.js`) abre dentro do `live` (no desenho), não no update: funciona, mas depende da taxa de quadros.
  5. Atualizar esta seção e fazer o commit "Etapa 3: fase 1 completa".
- O repositório `Memories-from-the-future` já existe no GitHub, mas ainda não tem remote configurado aqui: peça o link ao Fabio antes do primeiro push. Ele usa o GitHub Desktop.
- `suspicionUpPerSec` está em 2.0, não no 1.0 do SPEC: com 1.0 ninguém era pega no F1 A1, nem parada no corredor. O motivo está no comentário do `config.js`.

## Como testar

- O painel do navegador não interage com `file://`. Use `preview_start` com o nome `jogo` (servidor Python na porta 8765, configurado em `.claude/launch.json`) e confira se o console está sem erros. Se a porta já estiver ocupada por outra conversa, abra `http://127.0.0.1:8765/index.html` com `preview_start` + `url`: é a mesma pasta.
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
