# Memories from the Future — Melhorias: cabeça redonda, conversas no laboratório e página inicial

**Pedido para uma conversa nova do Claude Code.** O Fabio cola esta mensagem:

> Leia o `MELHORIAS.md` inteiro, depois o `CLAUDE.md`, e faça a parte 1.

São três partes pequenas. Faça na ordem, **uma parte de cada vez**, com um commit no fim de cada uma (e leve para a `main` e para o GitHub, como nas etapas da V2). Se a conversa ainda tiver fôlego depois de uma parte, pode seguir para a próxima; se o limite de uso apertar, abra uma conversa nova e peça "faça a parte N do MELHORIAS.md". Conversas ao mesmo tempo neste projeto já deram conflito: só comece uma parte depois que a anterior estiver na `main`.

---

## 1. O que muda

| Parte | O quê | Onde |
|---|---|---|
| 1 | A cabeça dos personagens mais arredondada (hoje parece achatada na frente) | só na V2 (`v2/`) |
| 2 | No laboratório (prólogo, cena 3), interagir com as anotações do Dr King e conversar rapidinho com o Tony e a Heymans | só na V2 (`v2/`) |
| 3 | Uma página inicial dividida ao meio: à esquerda, uma imagem do jogo em **8-bit** com um botão PLAY (abre a V1); à direita, uma imagem do jogo em **32-bit** com outro PLAY (abre a V2) | raiz do repositório |

Nada mais muda: história, fluxo, textos que já existem, senhas, balanceamento, músicas, controles, atalhos de teste e a tela de título de cada versão.

## 2. Regras

- **A V1 continua congelada** (é a versão do pedido de casamento, marcada com a tag `v1`). As partes 1 e 2 são só na V2. Os arquivos do jogo da V1 (`css/`, `js/`, `data/` e `tools/` da raiz) não mudam em nenhuma parte. A única exceção é a da parte 3: a entrada da V1 muda de nome (`index.html` → `v1.html`, ver a seção 5), sem mudar o conteúdo.
- Continuam valendo todas as regras do `SPEC.md`, do `CLAUDE.md` e do `V2_32BITS.md`: abre com dois cliques (`file://`), offline, scripts clássicos, sem `fetch`, sem módulos ES, sem bibliotecas da web; texto e dificuldade no `config.js` (na V2, `v2/data/config.js`); comentários do código em português; nenhum logo, marca ou personagem de terceiros.
- Os textos novos que aparecem no jogo são em inglês britânico. As falas da parte 2 abaixo são sugestões: ficam no `config.js` para o Fabio revisar e trocar.
- Ao terminar cada parte, atualize a seção "Estado" do `CLAUDE.md`.

## 3. Parte 1 — cabeça mais arredondada (V2)

**O problema.** Nos moldes de 26×48 da V2, a cabeça é quase um retângulo. De lado, a frente do rosto é uma linha reta vertical, da testa ao queixo: não tem a curva da testa, a ponta do nariz nem o queixo voltando para trás (por isso parece achatada na frente). De frente e de costas, os lados também descem retos e o queixo é quadrado.

**Onde estão.** Em `v2/data/sprites.js`, linhas 0 a 20 de cada molde (o topo do arquivo explica a legenda e as ajudas `symRows`/`padRows`):

- `HEAD_ELLEN_FRONT`, `HEAD_ELLEN_SIDE`, `HEAD_ELLEN_BACK`: a Ellen e todas as mulheres (`head: 'woman'` usa os mesmos moldes, ver `js/game/chars.js`, linha ~50);
- `HEAD_FABIO_FRONT`, `HEAD_FABIO_SIDE`, `HEAD_FABIO_BACK`: o Fabio;
- `HEAD_MAN_FRONT`, `HEAD_MAN_SIDE`: os homens (o de costas é o do Fabio).

De lado, o molde está virado para a direita: a frente do rosto é a coluna mais à direita de cada linha. Hoje, no `HEAD_ELLEN_SIDE`, essa coluna é a 23 da linha 7 até a 16; no `HEAD_FABIO_SIDE` e no `HEAD_MAN_SIDE`, é a 23 ou 24 da linha 8 até a 17.

**Como deve ficar.**

- **De lado:** um perfil curvo, como um "D". A testa vem um pouco para trás em cima (as linhas da franja e do topo do cabelo, 1 coluna a menos que o rosto); o ponto mais à frente fica na altura dos olhos e do nariz (dê ao nariz 1 pixel de ponta, na cor da pele); embaixo, a bochecha e o queixo voltam para trás de pouco em pouco até o pescoço (cada linha 1 coluna a menos que a de cima). A nuca e o alto da cabeça também ficam redondos, sem quinas.
- **De frente:** o alto da cabeça como uma cúpula (as primeiras linhas abrem aos poucos); as bochechas um pouco cheias na altura dos olhos e o queixo arredondado (as últimas linhas fecham aos poucos, sem o canto quadrado). No Fabio, a barba acompanha o queixo novo.
- **De costas:** o mesmo contorno redondo da frente.
- O estilo continua chibi (cabeça grande). É só tirar o "quadrado".

**O que não pode mudar** (para os acessórios e o resto continuarem encaixando):

- a altura da cabeça (21 linhas), a linha 1 como topo (o `Chars.headTop`, os balões "??!!" e os coraçõezinhos dependem dela) e as linhas 19 e 20, onde a cabeça encontra o tronco;
- a linha e as colunas dos olhos, dos óculos (`g`, `l`, `L`) e da boca: os óculos do Tony, a máscara de mergulho, os óculos na cabeça e os óculos escuros são desenhados por cima, nesses lugares;
- as letras dos materiais e a lógica do `chars.js` (rampas, luz, contorno calculado). Mude só os moldes. Se precisar mexer em algum acessório para encaixar no contorno novo, mexa no acessório.

**Os acessórios que ficam na cabeça**, para conferir um por um depois: em `v2/data/sprites.js` o curativo do Fabio, `TONY_BEARD`, `TONY_GLASSES` e `HEYMANS_BUN`; em `sprites-f2.js` os `F2_CAP`, `F2_CAP_PLAIN`, `F2_STRAW_HAT`, `F2_MASK`, `F2_HEAD_GLASSES`, `F2_BUN` e `F2_GEL`; em `sprites-f3.js` os `F3_BEANIE`, `F3_HELMET`, `F3_HAT` e `F3_BRAIDS`; em `sprites-f4.js` os `F4_CAP_BACK`, `F4_DIVE_MASK`, `F4_PONYTAIL` e `F4_HEAD_SUNGLASSES`. Confira também os penteados que vêm da paleta (`hair: 'half'`, o cabelo meio a meio da Ellen na fase 1 e no laboratório).

**Como conferir.**

- `__lineup` com todas as roupas (as 78) e `__poses` nas principais (`ELLEN_NOW`, `FABIO_NOW`, `TONY`, `HEYMANS`, um homem e uma mulher genéricos, e quem usa cada acessório acima), em todas as poses: andando nas 4 direções, sentado, no chão, deitado (a cabeça deitada reaproveita os moldes), nadando, foto, olhos fechados.
- O print em 4× ajuda a julgar a forma. No Chrome sem janela (ver o `CLAUDE.md`, "Como testar"), desenhe o `__lineup` e tire o print em 1920×1080.
- Só o desenho muda: o `__balance()` tem que dar exatamente os mesmos números (estão no `CLAUDE.md`) e o piloto automático (`v2/tools/headless.html#drive`) tem que jogar do título à tela final sem ser pega e sem nada no console.
- Mande ao Fabio um antes e depois (as duas Ellen e os dois Fabio, de frente e de lado, ampliados) para ele aprovar antes do commit.

## 4. Parte 2 — conversas no laboratório (V2)

**Quando.** Só na última parte do laboratório (`Flow.labWalk`, em `v2/js/game/flow.js`): depois das falas do `lab3`, quando a jogadora já anda com a Ellen até a máquina, com o Tony e a Heymans na sala. Tudo é opcional: dá para ir direto para a máquina, como hoje.

**O que acontece.**

- **As anotações do Dr King:** o caderno de couro marrom fica na mesa de trabalho (`labDesk`, no canto de baixo à esquerda, perto de onde a Ellen começa). Com a Ellen perto da mesa, Espaço abre uma conversa curta sobre o caderno.
- **O Tony e a Heymans:** com a Ellen perto de um deles, Espaço abre uma fala curta. Quem fala vira para a Ellen (`dir` do NPC, para o lado em que ela está) e continua virado depois.
- Cada um tem uma lista de conversas curtas. A cada Espaço, toca a próxima; no fim da lista, volta para a primeira. Diferente da máquina e do baú, essas interações não se gastam (dá para repetir).
- O jeito de falar é o mesmo do resto do jogo: a caixa de diálogo com a aba do nome (`Dialog.say`), Espaço avança.
- O `SPEC.md` diz que, depois do "good luck", os professores não falam mais no jogo. Estas falas são na mesma cena, antes da viagem: continua valendo.

**Textos** (no `v2/data/config.js`, dentro de `texts.prologue`, ao lado do `lab3`; cada lista de dentro é uma conversa). Sugestões, para o Fabio revisar (o Dr King faleceu em 2019 e a Ellen sabe: com carinho, sem tristeza explícita, como no `SPEC.md`):

```js
labTalk: {
  notes: [
    ["NARRATOR: Dr King's old notebook. The margins are full of little questions.",
     "ELLEN: Still teaching me, Dr King. Thank you."],
    ["FABIO: Who's Dr King?",
     "ELLEN: My physics teacher. He'd have liked you."]
  ],
  tony: [
    ["TONY: Good luck, Ellen."],
    ["TONY: I always believed you could do it."]
  ],
  heymans: [
    ["HEYMANS: You deserve all the joy! Have a nice trip."],
    ["HEYMANS: Look after him. And yourself."]
  ]
}
```

**Como fazer** (o motor hoje só tem interação em objetos, e cada uma se gasta depois de usada):

- `v2/data/scenes/LAB.js`: `interact: 'notes'` na mesa (`labDesk`) e `talk: 'tony'` / `talk: 'heymans'` nos dois NPCs (as chaves novas são só da interação; não mudam colisão nem visão).
- `v2/js/game/room.js`: os NPCs com `talk` também entram no `room.interact`, com um retângulo em volta deles, e marcados para repetir (não se gastam).
- `v2/js/game/stealth.js`: no `nearby()`, ignore o que estiver escondido (`p.hidden`; no `labWalk` as Ellen do passado ficam escondidas) e, se houver mais de um perto, escolha o mais próximo da Ellen. No `interact()`, o que repete não ganha `used`.
- `v2/js/game/flow.js`: no `onInteract` do `labWalk`, além de `'machine'`, trate `'notes'`, `'tony'` e `'heymans'`: vire o NPC para a Ellen, toque a próxima conversa do `labTalk` com `Dialog.say` e guarde qual foi (para a próxima vez tocar a seguinte).
- Opcional, se sobrar tempo: enquanto a Ellen lê, mostrar um close do caderno aberto em cima da caixa de diálogo (páginas amareladas com a letra corrida em rabiscos e um diagrama), desenhado em código como o cartão do item do baú.

**Como conferir.**

- No `v2/tools/headless.js`, acrescente um código de print que abre o `labWalk` já depois das falas, põe a Ellen perto de cada um (`__tp`) e aperta Espaço: tire o print das três conversas e confira que elas se repetem e voltam ao começo.
- A máquina continua funcionando, inclusive depois de conversar; o Ctrl+Shift+K no laboratório continua levando para a fase 1.
- O piloto automático (`#drive`) continua jogando do título à tela final (ele vai direto para a máquina) e o console fica sem nada.
- Nada no `__balance()` muda (o laboratório não tem vigias).

## 5. Parte 3 — página inicial: 8-bit ou 32-bit

**Onde.** A página inicial passa a ser o `index.html` da raiz: é ele que o Fabio abre com dois cliques (e, no futuro, a página do site). Por isso a entrada da V1 muda de nome: `git mv index.html v1.html`. O conteúdo do arquivo fica idêntico; como ele continua na raiz, os caminhos (`css/`, `js/`, `data/`) continuam funcionando. A tag `v1` guarda o original. A V2 continua em `v2/index.html`.

> Alternativa (se o Fabio preferir pastas iguais para as duas): mover a V1 inteira para `v1/` (`v1/index.html`, `v1/css/`, `v1/js/`, `v1/data/`, `v1/tools/`), sem mudar nenhum conteúdo. Fica mais arrumado, mas o diff é bem maior e os caminhos do `CLAUDE.md` mudam todos. A recomendação é a do `v1.html`.

**Arquivos novos.** `index.html` (a página inicial), `home/home.css`, `home/home.js` (o código e, no topo, um `HOME_CONFIG` com os textos e os destinos) e as duas imagens, `home/8bit.png` e `home/32bit.png`. Não carregue scripts da V1 nem da V2 inteiros: os nomes globais são os mesmos nas duas e um apaga o outro (se quiser a fonte de pixel da V2, o `v2/data/sprites.js` sozinho pode ser carregado; ele só define dados, como o `FONT`).

**Como fica** (pedido do Fabio): a tela inteira dividida ao meio.

```
+--------------------------+--------------------------+
|                          |                          |
|   imagem do jogo 8-bit   |  imagem do jogo 32-bit   |
|                          |                          |
|        [  PLAY  ]        |        [  PLAY  ]        |
|          8-BIT           |          32-BIT          |
|                          |                          |
+--------------------------+--------------------------+
             a divisória vertical no meio
```

- **A divisória** no meio, de cima a baixo: uma faixa fina e clara (dourada, como os frisos dos cartões das fases), com um losango no centro.
- **Metade da esquerda:** a imagem do jogo em 8-bit (a V1) cobrindo a metade inteira, centrada e cortada nas laterais. No meio da imagem, um botão **PLAY**, que abre a V1 (`v1.html`). Logo abaixo do botão, o nome **8-BIT** (e, se quiser, uma linha curta, ex.: "The original").
- **Metade da direita:** o mesmo, com a imagem do jogo em 32-bit (a V2) e outro botão **PLAY**, que abre a V2 (`v2/index.html`). Embaixo, **32-BIT** (ex.: "Remastered").
- **As imagens são prints do próprio jogo**, não fotos nem nada baixado. Use o mesmo cenário nas duas versões, para comparar: a sugestão é o F1 A2 (o sorvete na Mirai Tower, o cenário que serviu de modelo para a V2), com a Ellen e o Fabio do presente na tela e sem caixa de diálogo. Guarde cada uma na resolução da versão: 384×216 para a V1 e 480×270 para a V2. Para tirar, use o Chrome sem janela em 1920×1080 (a V1 sai em 5× e a V2 em 4×) e reduza pelo pixel mais próximo. Anote no topo do `home.js` como refazer as imagens.
- **Nítidas, em escala inteira:** cada metade é uma `<div>` com a imagem de fundo em `background-size: cover` e `image-rendering: pixelated`. Numa tela de 1080 de altura, a V1 fica em 5× e a V2 em 4×, as duas sem borrar. Confira também em 125% e 150% de zoom do Windows (a altura em pixels físicos continua 1080).
- **O botão PLAY no estilo do jogo:** um painel de pixels como os do jogo (moldura clara, fundo índigo em degradê, como o `Gfx.panel` da V2) e o texto na fonte de pixel. Ele pode ser desenhado num `<canvas>` pequeno ampliado com `image-rendering: pixelated`, usando o `FONT` do `v2/data/sprites.js`, ou ser uma imagem pequena gerada do mesmo jeito. Use letras de pixel, não uma fonte do sistema.
- **Para o botão aparecer:** um véu escuro por cima de cada imagem. A metade escolhida (com o mouse em cima, ou pelas setas) fica mais clara e o botão dela acende em dourado. A outra metade escurece um pouco.
- Opcional: o título "MEMORIES FROM THE FUTURE" numa faixa em cima, atravessando as duas metades.
- Os nomes "8-bit" e "32-bit" são os que o Fabio pediu (a V1 é no estilo "16-bit leve" do `SPEC.md`, mas na página aparece "8-bit"). Todos os textos da página (PLAY, os nomes, as linhas curtas, as dicas) ficam no `HOME_CONFIG`, para trocar sem mexer no código.

**Controles.** Com o mouse, passar por cima de uma metade a escolhe, e clicar no botão (ou em qualquer lugar da metade) abre. Pelo teclado, as setas ← → (ou A/D) escolhem e Espaço ou Enter abre. Os botões são `<a href>` (ou `<button>`) de verdade, então o Tab também funciona. Abrir é só ir para `v1.html` ou `v2/index.html`, o que funciona no `file://`. A tecla F alterna a tela cheia, como no jogo. **Atenção:** o navegador sai da tela cheia ao trocar de página. Então o Fabio aperta F de novo dentro do jogo; a página inicial pode lembrar isso numa linha pequena embaixo (ex.: "Press F in the game for full screen"). Para voltar à página inicial, o botão "voltar" do navegador basta (as telas de título não mudam).

**Depois de mudar o nome da V1**, atualize no `CLAUDE.md`: a V1 abre em `http://127.0.0.1:8765/v1.html` (e no `file://`, pelo `v1.html`), o `http://127.0.0.1:8765/` mostra a página inicial, e as ferramentas da V1 continuam carregando do mesmo jeito (`tools/devtools.js` é relativo à página, que continua na raiz).

**Como conferir.**

- Pelo `file://`, com dois cliques no `index.html`: a página abre, os dois PLAY levam para a versão certa e o "voltar" do navegador traz de volta.
- As duas imagens são do mesmo cenário, nítidas (escala inteira) e sem nada do `referencias/` (que é pessoal e fica fora do git).
- No Chrome sem janela, o print da página em 1920×1080 e, com o zoom do Windows, em 125% e 150%: a divisória no meio, as duas imagens nítidas e os botões no centro de cada metade.
- Teclado e mouse (no painel do navegador, pelo servidor de teste: setas, Espaço, Enter, clique).
- A V1, aberta pelo `v1.html`, continua jogável do começo ao fim com o piloto automático dela (`tools/devtools.js`, `Flow.newGame()` e `__drive`). A V2 também (`v2/tools/headless.html#drive`).
- `git diff v1 --stat -- css js data tools` continua vazio (o jogo da V1 não mudou).

## 6. Ao terminar cada parte

- Um commit em português no fim da parte, levado para a `main` e enviado (`git push origin main`).
- A seção "Estado" do `CLAUDE.md` atualizada com o que mudou (e, na parte 3, os caminhos novos em "Como testar").
- Diga ao Fabio que a parte está na `main` e qual é a próxima. Na parte 1, mostre o antes e depois das cabeças; na parte 2, os prints das conversas; na parte 3, o print da página inicial.
