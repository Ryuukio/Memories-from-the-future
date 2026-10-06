# Memories from the Future

Jogo do pedido de casamento do Fabio para a Ellen. Tudo está no `SPEC.md`: leia o arquivo inteiro antes de começar e siga as etapas da seção 12, com um commit no fim de cada etapa. **Prazo: quinta-feira, 08/10/2026.** Se o tempo apertar, use a lista de cortes da seção 12.

## Estado

- Etapa 1 (base) pronta. A próxima é a etapa 2 (núcleo de stealth no F1 A1).
- O repositório `Memories-from-the-future` já existe no GitHub, mas ainda não tem remote configurado aqui: peça o link ao Fabio antes do primeiro push. Ele usa o GitHub Desktop.

## Como testar

- O painel do navegador não interage com `file://`. Use `preview_start` com o nome `jogo` (servidor Python na porta 8765, configurado em `.claude/launch.json`) e confira se o console está sem erros.
- Teclas simuladas: dispare `KeyboardEvent` em `window` com `code` (ex.: `ArrowRight`, `Space`, `KeyD` + `ctrlKey`/`shiftKey`).

## Convenções do código

- Scripts clássicos carregados em ordem pelo `index.html`, sem módulos ES nem `fetch`. Os dados ficam em `window.GAME_CONFIG`, `SPRITES`, `PALETTES` e `FONT`.
- Todo texto, pista, senha, data e dificuldade fica em `data/config.js`. Os comentários do código são em português.
- Objetos globais do motor: `Display`, `Gfx` (desenho, sprites, `Gfx.text`/`textWidth`/`wrap`), `Input` (ações: up/down/left/right/run/confirm/cancel; `interact` = `confirm`), `Loop`, `Sound`, `Save`, `Camera`, `Dialog` (`say`/`toast`, linhas `"NOME: fala"`, `[ação]` chama `onAction`), `Game` (`register`/`go`/`transition`/`notice`), `Debug` (`addJump`, `flags.invisible/boxes/fps`), `Hud`, `Chars`, `Flow`.
- Cada estado é um objeto com `enter`/`update`/`render` e, se quiser, `idle` (roda durante um diálogo), `skip` (Ctrl+Shift+K) e `pausable`.
- `referencias/` tem fotos pessoais: fica fora do git. Abra só as fotos do cenário que estiver construindo.
