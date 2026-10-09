# Memories from the Future — V2 em "32 bits"

**Pedido para uma conversa nova do Claude Code.** O Fabio cola esta mensagem:

> Leia o `V2_32BITS.md` inteiro, depois o `CLAUDE.md` e o `SPEC.md`, e faça a etapa 1 da V2.

Para as etapas seguintes, abra uma conversa nova para cada uma e peça "faça a etapa N da V2". Conversas curtas gastam menos do limite de uso.

---

## 1. O que é a V2

A V1 está pronta, foi a do pedido de casamento e está na `main` (commit `56f777a`, "Versão final: tela de título só com Start"). A V2 é **uma cópia do jogo em que só o desenho muda**: o mesmo jogo com um visual mais detalhado, no estilo dos jogos de 32 bits em 2D (Game Boy Advance, as fases 2D do PlayStation): mais resolução, mais cores, sombreado com degradê pontilhado, luz de cada horário do dia e personagens maiores.

A meta visual está em `docs/v2/`:
- `F1A2_detalhado_32bits.png`: o F1 A2 (sorvete na Mirai Tower) do jeito que a V2 deve ficar, em 1920×1080.
- `F1A2_comparacao.png`: a V1 em cima e a simulação embaixo, no mesmo cenário.
- `mockup/`: o código que desenhou a simulação (`art.js`, aberto pelo `index.html` com dois cliques). As técnicas da seção 4 estão todas lá: use como referência, não como código final.

**Não muda nada além do visual:** história, fluxo, textos, pistas, senhas, falas, músicas, efeitos, controles, mecânica de stealth, balanceamento (medido de novo, ver seção 8), salvamento, atalhos de teste e a tela de título só com "Start". Tudo o que está no `config.js` continua lá, com as mesmas chaves.

## 2. Regras

- **A V2 fica na pasta `v2/`**, uma cópia completa do jogo: `v2/index.html`, `v2/css/`, `v2/js/`, `v2/data/` e `v2/tools/`. As duas versões convivem: o `index.html` da raiz continua sendo a V1, e o `v2/index.html` é a V2. Antes de copiar, marque a V1 com a tag `v1` (`git tag v1 56f777a`).
- **A V1 não muda.** Nenhum arquivo fora de `v2/` (e deste `V2_32BITS.md` e do `CLAUDE.md`) pode ser alterado.
- **Dentro da cópia, só o desenho muda:** os pintores e objetos (`scenery*.js`), os moldes e paletas (`sprites*.js`, `chars.js`, `jimmy.js`), a fonte, e a parte que desenha de cada tela (HUD, diálogo, título, cartões, máquina, batalha, final). O que não é desenho só pode mudar para acompanhar a resolução nova (seção 3), e sempre com o mesmo comportamento da V1.
- O `v2/data/config.js` começa igual ao da V1: textos, pistas, senhas, datas e dificuldade são os mesmos.
- Continuam valendo todas as regras do `SPEC.md` e do `CLAUDE.md`: abre com dois cliques (`file://`), offline, scripts clássicos, sem `fetch`, sem módulos ES, sem bibliotecas da web; textos e dificuldade no `config.js`; comentários do código em português; nenhum logo, marca ou personagem de terceiros.
- `referencias/` tem fotos pessoais: fica fora do git. Abra só as fotos do cenário que estiver construindo.
- Um commit no fim de cada etapa, com mensagem em português.
- Ao terminar cada etapa, atualize a seção "Estado" do `CLAUDE.md` com o que mudou na V2.

## 3. Resolução e coordenadas

- **Tela interna de 480×270** (antes 384×216). Em 1920×1080 a escala fica 4×, inteira e nítida.
- **HUD de 30 px** (antes 24) e **área de jogo de 480×240** (antes 384×192). Cada cenário continua ocupando uma tela.
- Os caminhos desta seção são os da cópia (`v2/...`).
- **Tudo cresce 1,25×.** O jeito recomendado é **não reescrever os 30 arquivos de `data/scenes/`**: o `Room.build` multiplica as coordenadas por 1,25 ao carregar (posições, tamanhos, portas, faixas de `look`, `start`, os `to`/`jump`/`at` dos loops, `range` dos cones, `photoZone`, `exitZone` e as zonas do `look.slow`). A escada da livraria (`SCENES.SHOP.stairs`) é lida no `flow.js` e precisa da mesma escala. Assim o balanceamento da V1 se mantém e os arquivos de cenário ficam como estão. Arredonde para inteiros.
- No `config.js`, as velocidades (`walkSpeed` 60 → 75, `runSpeed` 110 → 137,5) e tudo o que estiver em pixels sobem 1,25×. Os tempos (em segundos) não mudam.
- No `stealth.js`, `FOLLOW`, `STRIDE` e os `SAMPLES` dos pés crescem junto. As constantes de tamanho estão em `display.js` (384×216), `hud.js` (`H: 24`) e `room.js` (`SW = 384, SH = 192`).
- O cone continua com o raycasting de 24 raios.

## 4. Como desenhar (técnicas da simulação)

- **Rampas de cor:** cada material tem de 5 a 8 tons, e a passagem entre um tom e outro é pontilhada com matriz de Bayer 4×4 (`pick()` no `art.js`). Isso substitui as cores lisas da V1.
- **Sombreado de esfera:** cabeças, copas, nuvens e objetos redondos recebem luz pela normal da elipse, com a luz vindo de cima e da esquerda.
- **Contorno seletivo (selout):** o contorno de fora é a cor de dentro escurecida, e não preto (`outline()`).
- **Sombras de cada horário:** cada objeto e personagem projeta a sombra no chão pelo próprio desenho (`castShadow()`): curta ao meio-dia e comprida à tarde, na direção oposta ao sol, e só uma mancha de contato à noite. Isso vira uma opção do `look` de cada cenário (ex.: `light: { sun: [x, y], long: 0.95, color }`).
- **Cor e luz do ambiente por cenário:** tarde quente, noite azulada, planetário roxo, debaixo d'água verde-azulado. As luzes (lanterna, poste, lanternas de Yanai) clareiam em volta com pontilhado. A V1 já tem `look.tint`; a V2 deixa isso mais rico.
- **Fundo em camadas:** céu com degradê, nuvens com volume, prédios ao longe em dois planos e o ponto marcante de cada lugar em detalhe (Mirai Tower, castelo de Himeji, Shirakawa-go, o tanque do aquário etc.).
- **Texturas:** grama com tufos e florzinhas, pedra com rachaduras e musgo, madeira com veios, tecido com dobras.
- **Cone de visão:** vermelho que muda de tom conforme o chão (`coneFx()` no `art.js`), para não ficar marrom na grama.
- **Brilhos:** poeira brilhando na luz, reflexo no vidro, vinheta leve. Sem exagero: o jogo tem que continuar fácil de ler.

## 5. Personagens

- Sprites de cerca de **26×48** (antes 16×32), com cabeça grande (estilo chibi), olhos com brilho, cabelo com mechas e brilho, roupas com dobras e sombra.
- **Não desenhe as 69 roupas uma a uma.** Mantenha o sistema da V1 (`chars.js`, `data/sprites.js`, `data/characters*.js`): moldes de cabeça e corpo + paleta por roupa + estampas. Na V2, os moldes ficam maiores e cada letra de cor da paleta vira uma rampa gerada a partir da cor base (sombra puxando para o azul ou roxo, luz para o amarelo). Assim as paletas do `characters*.js` (o Apêndice A do SPEC) continuam valendo quase sem mudança.
- Todas as poses da V1 precisam existir no tamanho novo: andar em 4 direções (4 quadros), em pé (`stand`), sentado (`sit`), deitado (`lie`), sentado no chão (`floor`), nadando (`swim`), foto (`photo`), com esqui (`gear: 'ski'`), dentro da água (`wade`), sentados no barco (`ride`), os extras (curativo, óculos, chapéus, aventais etc.), o vilão e os capangas (`jimmy.js`, inclusive a forma SUPERSIZE).
- Os rostos seguem as fotos de referência de cada cenário, como na V1.

## 6. Fonte, HUD e caixas

- A fonte 5×7 fica pequena em 480×270. Faça uma fonte de pixel de **6×9** (ou parecida) com os mesmos caracteres da V1, inclusive "—", "×", "&", aspas, "é", "á", "ê", "³" e as setas "→" e "←".
- HUD, caixa de diálogo, aba do nome, cartões das fases, tela da máquina, batalha e tela final no tamanho novo, com o mesmo layout da V1.

## 7. Etapas

1. **Base da V2:** a tag `v1`; a cópia do jogo em `v2/` (antes de mudar qualquer coisa, confira que `v2/index.html` roda igual à V1); resolução 480×270, HUD de 30 px; escala 1,25× das coordenadas no carregamento; velocidades e constantes; fonte nova; HUD e caixas. Nesta etapa a arte velha pode aparecer ampliada: o que importa é o jogo inteiro rodar igual no tamanho novo. Rode o piloto automático (seção 8) e as medidas de balanceamento.
2. **Personagens:** moldes novos, rampas automáticas das paletas e todas as poses. Confira com o `__lineup` do devtools.
3. **Fase 1** (os 6 cenários, o corredor e a salinha do baú), com a luz indo da tarde até a noite. O F1 A2 tem que ficar como a simulação.
4. **Fases 2, 3 e 4** (uma conversa por fase, se precisar).
5. **Prólogo, livraria, batalha, tela final, cartões e tela da máquina.**
6. **Polimento:** uma partida inteira com o piloto automático, balanceamento conferido, console sem erros, `file://` e tela cheia em 1920×1080. A V1 (o `index.html` da raiz) tem que continuar jogável do começo ao fim, igual a antes.

**Se o tempo apertar (cortes, nesta ordem):**
1. Fundos de cenário mais simples (uma camada de fundo em vez de duas).
2. Andar com 2 quadros nas poses raras (nadando, esquiando).
3. Manter 384×216 e só enriquecer a arte (rampas, sombreado, sombras e luz). É o "16 bits bem detalhado": menos trabalho, sem mudar coordenada nenhuma.

## 8. Como testar

- Tudo o que está em "Como testar" no `CLAUDE.md` continua valendo (servidor de teste, cache, painel do navegador). O servidor de teste serve a raiz do repositório: a V2 abre em `http://localhost:PORTA/v2/index.html`.
- As ferramentas são as da cópia, `v2/tools/devtools.js`.
- `tools/devtools.js`:
  - `__drive(segundos)` joga a partida inteira com teclas de verdade. Do título: `Flow.newGame()` e depois `__drive(110)` algumas vezes, até a tela final. Use depois de cada etapa: foi ele que achou uma passagem fechada entre dois cenários na V1.
  - `__naive`, `__stats` e `__sweep` medem o balanceamento. Na V2, os números têm que ficar perto dos da V1 (estão no `CLAUDE.md`): andando reto sem olhar, a Ellen é pega em cerca de 10% a 30% das vezes, e jogando perfeito passa sempre. Ajuste as ferramentas para a escala nova (velocidades, células, a borda de saída em 384 → 480).
  - `__snap` e `__lineup` para conferir a arte de perto.
- Para gerar um print em 1920×1080 sem o painel: Chrome sem janela (`chrome.exe --headless=new --force-device-scale-factor=1 --window-size=1920,1080 --screenshot=...`), como em `docs/v2/mockup`.
