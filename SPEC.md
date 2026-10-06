# Memories from the Future

**Especificação completa do jogo, para o Claude Code construir.**

Jogo feito pelo Fabio para a Ellen, como parte de um pedido de casamento. O documento está em português; os textos que aparecem no jogo estão em inglês britânico, porque a Ellen é inglesa.

> **Como começar (para o Fabio)**
> 1. Crie uma pasta `memories-from-the-future` e salve este arquivo nela como `SPEC.md`.
> 2. Dentro dela, crie a pasta `referencias/` e coloque as duas imagens de preview (`preview_16bit_sala_A.png` e `preview_16bit_detalhe.png`). As fotos dos cenários são opcionais.
> 3. Abra o Claude Code nessa pasta e peça: *"Leia o SPEC.md inteiro e faça a etapa 1 da seção 12."*
> 4. Para cada etapa seguinte, abra uma conversa nova e peça a próxima do mesmo jeito. Conversas curtas gastam menos do limite de uso.

---

## 0. Para o Code: como trabalhar

- Leia o documento inteiro antes de começar.
- Construa em etapas (seção 12) e use git, com um commit no fim de cada etapa.
- Prioridades, nesta ordem:
  1. Dá pra jogar do começo ao fim sem travar.
  2. Os cenários e as roupas lembram as memórias reais do casal.
  3. Charme visual e sonoro.
- Tudo o que o Fabio pode querer mudar fica em `data/config.js`: textos, pistas, senhas, datas, legendas e dificuldade. Nada disso pode ficar fixo no código.
- Se existir a pasta `referencias/`, use as fotos como referência visual. O nome de cada foto começa com o código do cenário (ex.: `F1A1_okonomiyaki.jpg`). Se a pasta não existir, siga as descrições deste documento.
- O estilo visual-alvo está em duas imagens:
  - `referencias/preview_16bit_sala_A.png`: as duas telas da sala A da fase 1, na resolução real.
  - `referencias/preview_16bit_detalhe.png`: zoom nos personagens.
  - Os moldes dos personagens dessas imagens estão no Apêndice E.
- **Direitos (obrigatório):** nenhum logo, marca, mascote ou personagem de terceiros no visual. Restaurantes, lojas e roupas aparecem genéricos (cores lisas ou estampas comuns). Nomes de lugares podem aparecer em texto (ex.: "Saizeriya" numa legenda), mas nunca o logotipo. Pôsteres de cinema são genéricos. O vilão é um personagem original.

---

## 1. Visão geral

- **Gênero:** stealth visto de cima, em pixel art no estilo "16-bit leve" (como os jogos de Super Nintendo e Game Boy Advance), com música chiptune.
- **Ideia:** a Ellen (a jogadora) volta no tempo levando o Fabio, que perdeu a memória. Ela atravessa as memórias reais do casal sem ser vista pelas versões do passado dos dois. A cada fase, ela devolve parte da memória dele.
- **Escape room na vida real:** no fim de cada fase, uma pista leva a um álbum de fotos escondido numa estante da livraria-café onde ela está jogando. No álbum, uma foto falsa (a "anomalia") é a senha que destrava a fase seguinte.
- **Duração alvo:** 15 a 20 minutos de jogo, fora o tempo procurando os álbuns.
- **Onde roda:** navegador (Chrome) no notebook do Fabio, offline, em tela cheia 16:9. Mais tarde, o mesmo jogo vai para o site do Fabio, para ela jogar de novo (mesmo jogo, sem modo especial).
- **Sem dicas no jogo:** o Fabio vai estar do lado dela durante a partida.

---

## 2. Requisitos técnicos

- Site estático: `index.html`, JavaScript e CSS. Sem servidor, sem etapa de build, sem internet e sem bibliotecas baixadas da web.
- Tem que abrir com dois cliques no `index.html` (protocolo `file://`) e também funcionar hospedado num site. Por isso:
  - não use módulos ES (`type="module"`); use `<script>` clássicos, em ordem;
  - não carregue JSON com `fetch`; os dados ficam em arquivos `.js` que atribuem a uma variável global (ex.: `window.GAME_CONFIG = {...}`).
- **Tela:** Canvas 2D com resolução interna de 384×216 (16:9), ampliada em escala inteira com pixels nítidos (`image-rendering: pixelated`) e barras pretas se sobrar espaço. A tecla F alterna a tela cheia.
- **Loop:** passo fixo de 60 atualizações por segundo, independente da taxa de quadros.
- **Entrada separada do resto do código.** O jogo lê ações (cima, baixo, esquerda, direita, interagir, correr, confirmar, cancelar), não teclas. Assim, dá para colocar controles de toque no futuro sem mexer no jogo. Mapeamento atual:
  - Setas ou WASD: andar
  - Shift: correr
  - Espaço ou Enter: interagir, avançar diálogo, confirmar
  - Esc: pausar
  - Na tela de senha, o teclado digita normalmente
- **Áudio:** Web Audio, com música e efeitos gerados por código (ondas quadrada, triangular e ruído). Começa depois da primeira tecla. A tecla M liga e desliga o som.
- **Salvamento automático** no `localStorage` no começo de cada cenário. A tela de título mostra "Continue" se houver progresso. Tudo dentro de try/catch: se o armazenamento falhar, o jogo segue sem salvar.
- **Pixel art desenhada pelo próprio Code,** em código, a partir dos moldes do Apêndice E, sem baixar nada.
- **Fonte bitmap 5×7 do Apêndice E,** com maiúsculas, minúsculas, números e pontuação básica. Os textos ainda precisam de alguns caracteres, que o Code cria no mesmo estilo: "—", "×", "&", aspas, "é", "á" e o expoente do "3³" (um 3 pequeno elevado).

### Estrutura de pastas sugerida

```
memories-from-the-future/
  index.html
  css/style.css
  js/engine/    loop, entrada, render, câmera, áudio, texto, salvamento, modo de teste
  js/game/      estados: title, cutscene, stealth, chest, anomaly, shop, battle, ending
  data/config.js        textos, pistas, senhas, datas, dificuldade (o Fabio edita)
  data/characters.js    personagens, roupas e paletas por data (Apêndice A)
  data/sprites.js       moldes de sprites, paletas de exemplo e fonte (Apêndice E)
  data/cutscenes.js     prólogo e cenas com diálogo
  data/scenes/          um arquivo por cenário: F1A1.js ... F4C2.js, SHOP.js
  referencias/          opcional: fotos de referência (não publicar no site)
```

Cada cenário é só dados (mapa, objetos, vigias e o loop deles). O código dos cenários é um sistema único, reaproveitado pelos 24.

---

## 3. História

Tom: romântico, bem-humorado, com piadas internas do casal.

- Big Jimmy Junk, o vilão da junk food, derrota o Fabio com o golpe Temptation. O Fabio cai num coma alimentar e perde a memória, inclusive da Ellen.
- A Ellen, que é física, decide construir uma máquina do tempo para devolver as memórias dele. Pede ajuda ao professor Tony Robinson (matemática), que vira o tutor, e leva o caderno de anotações do Dr Barry King, o professor de física dela, como homenagem. O Dr King faleceu em 2019 e a Ellen sabe; trate com carinho, sem tristeza explícita.
- Anos depois, a máquina funciona, mas as cobaias não sobrevivem à viagem. Isso só é dito em diálogo, nada é mostrado. A Ellen chama a professora Heymans (biologia), para que um humano sobreviva.
- Mais anos depois, a máquina está pronta. O Tony explica as regras e avisa que não vai dar para manter contato. Os dois professores se despedem com "good luck". Depois disso, eles não falam mais no jogo.
- A Ellen leva o Fabio de volta ao passado. Ela precisa atravessar as memórias sem ser vista pelas versões do passado dos dois. Cada fase concluída devolve 20% da memória dele.
- Na fase 5, eles caem num lugar que não é uma memória: a livraria-café, hoje. O Fabio reconhece o lugar, lembra de tudo, e o vilão aparece. Batalha final. A Ellen vence e recebe a mensagem para ir ao segundo andar, onde, na vida real, acontece o pedido.
- O cabelo da Ellen marca a passagem do tempo no prólogo: platinado dourado → meio a meio (raiz loiro-escura crescida) → todo loiro-escuro. A Ellen do presente, que a jogadora controla, tem o cabelo loiro-escuro.

---

## 4. Fluxo do jogo

1. **Tela de título:** "MEMORIES FROM THE FUTURE", "a game by Fabio, for Ellen", "Press Space" (e "Continue", se houver progresso).
2. **Prólogo** (cerca de 2 min): cenas curtas com diálogo; Espaço avança. No fim, a jogadora anda com a Ellen até a máquina no laboratório. É ali que ela aprende a andar.
3. **Fases 1 a 4.** Cada fase tem:
   - um cartão de título ("STAGE 1 — The First Date");
   - três salas (A, B, C), da esquerda para a direita. Cada sala tem duas metades (cenários 1 e 2), cada uma com o Fabio e a Ellen do passado em loop. Entre uma sala e outra há um corredor curto com porta, que é zona segura;
   - depois da sala C, uma salinha com um baú: item, barra de memória sobe 20% e o Fabio diz o que lembrou;
   - a tela da máquina (anomalia), com a pista do álbum e o campo da senha. Acertou: tela preta e próxima fase.
4. **Fase 5:** a livraria-café, hoje. Diálogo, a memória fica completa, o vilão aparece.
5. **Batalha final** por turnos.
6. **Final:** a Ellen anda até a escada (desenho da escada real da loja) e aparece a mensagem para ir ao segundo andar.

### HUD (durante as fases)

- Barra no topo: `STAGE n · dd/mm/yyyy · Título do cenário` e, à direita, `MEMORY` com 5 segmentos.
- A data e o título mudam a cada cenário. No F3 A1 (duas cozinhas), a data muda quando a Ellen passa para a segunda cozinha.
- Na fase 5, a data é a do dia, puxada do relógio do computador, e o título é "Here and now".
- Sem inventário e sem menu fora da batalha.

---

## 5. Mecânica de stealth

### Mundo e câmera

- Visão de cima, em 3/4, como no Pokémon. Tiles de 16×16 px.
- HUD de 24 px no topo e área de jogo de 24×12 tiles (384×192 px).
- Cada cenário ocupa uma tela. A sala é a junção dos dois cenários lado a lado, ligados por uma passagem. A câmera acompanha a Ellen na horizontal, como no Mario.
- Personagens com sprites de 16×32 px, em 4 direções, com animação de andar de 4 quadros e poses especiais: sentado, deitado, nadando, remando, esquiando, fazendo pose para foto, se beijando, assoprando velas etc. Os moldes estão no Apêndice E.

### Jogadora

- A Ellen do presente anda livre em 8 direções, com colisão. Andando: cerca de 60 px/s. Correndo (Shift): cerca de 110 px/s. Correr não faz barulho.
- O Fabio do presente segue atrás dela, como os seguidores do Pokémon, sem colisão. Ele não conta para a detecção.

### Vigias (o Fabio e a Ellen do passado)

- Cada vigia tem um cone de visão com posição, direção, meia-abertura (padrão 30°) e alcance (padrão 72 px), configuráveis por cenário.
- O cone aparece desenhado no chão, vermelho e semitransparente. Ele é cortado pelo que bloqueia a visão (paredes, móveis altos, árvores, barracas, cardumes etc.), com raycasting simples de cerca de 24 raios.
- A Ellen é vista quando está dentro do cone e com linha de visão livre.
- O comportamento de cada vigia é uma linha do tempo em loop, definida no arquivo do cenário: posições, caminhos, direção (com giro suave), pose, cone ligado ou desligado (olhos fechados) e alcance.

### Detecção em três estágios

- Cada vigia tem um nível de suspeita de 0 a 3. Com a Ellen no cone, sobe um estágio por segundo; fora do cone, desce meio estágio por segundo.
- Balão acima da cabeça do vigia: estágio 1 "??", estágio 2 "??!!", estágio 3 "!!!!".
- No estágio 3: pausa curta, flash, uma fala sorteada do Fabio do presente (ex.: "That was close. Too close."), tela escura, e a Ellen volta para o começo daquele cenário (não da sala inteira). Os loops dos vigias recomeçam.
- Todos esses tempos e tamanhos ficam em `config.difficulty`.

### Componentes reaproveitáveis

- Vigia parado alternando o olhar (o mais comum).
- Vigia andando por um caminho, com o cone na direção do movimento.
- Vigia cujo cone segue outro personagem (ski).
- Grupo que se move junto e gira (o barco de Nara).
- Obstáculo móvel que bloqueia a passagem, mas não vê (cervos, pessoas andando, garçom).
- Bloqueador de visão móvel (cardumes).
- Zonas de luz: a detecção só acontece com a Ellen numa área iluminada (festival de Yanai).
- Evento que faz os vigias virarem a cabeça (o tubarão-baleia no aquário).
- Movimento debaixo d'água: mais lento, com leve deriva.
- Terreno lento (areia das dunas, neve funda).

### NPCs

- Inofensivos: não detectam ninguém. Servem de ambientação e alguns bloqueiam a passagem. Podem ter animação parada.

### Balanceamento

- Quem nunca jogou tem que atravessar cada cenário em cerca de 30 segundos, sendo pega no máximo uma ou duas vezes.
- Todo loop precisa ter uma janela clara para passar. Em cenários mais longos, coloque um esconderijo no meio do caminho.

---

## 6. Fases e cenários

Para cada cenário: legenda do HUD, ambiente, vigias e loop, janela para passar, NPCs e obstáculos. A fala de entrada de cada cenário (da Ellen ou do Fabio do presente) está na seção 11. As roupas de cada data estão no Apêndice A.

### Fase 1 — 16/08/2025 — "The First Date"

Todos os cenários são do mesmo dia, com a mesma roupa. A luz vai da tarde ensolarada até a noite.

**F1 A1 · Okonomiyaki**
- **Ambiente:** restaurante de okonomiyaki. Mesas de madeira escura com uma chapa grande retangular embutida no meio, cadeiras de madeira com assento e encosto pretos, um banco comprido preto encostado na parede do fundo, paredes creme, luz quente embutida no teto, piso de madeira avermelhada. Nas mesas, espátulas, temperos e garrafas de molho.
- **Vigias:** os dois sentados frente a frente numa mesa no meio do salão. O Fabio mexe na chapa sem a comida nunca ficar pronta (cone curto, para a chapa). A Ellen olha para o Fabio (cerca de 4 s) e depois olha o salão, varrendo o corredor (cerca de 2 s).
- **Janela:** quando a Ellen olha para o Fabio.
- **NPCs e esconderijos:** clientes nas outras mesas; os encostos altos das cadeiras e o banco bloqueiam a visão.

**F1 A2 · Ice cream at Mirai Tower**
- **Ambiente:** parque em Sakae, numa tarde de verão, com a Mirai Tower (torre de treliça metálica com mirante) ao fundo, no topo da tela. Caminho de pedra, canteiro de flores, árvores, poste, máquina de bebidas, carrinho de sorvete e pombos no caminho.
- **Vigias:** sentados num banco, de costas para o caminho, tomando sorvete e olhando a torre (cones para cima). De tempos em tempos um dos dois vira para trás, e o cone desce sobre o caminho. Alterna quem vira.
- **Janela:** enquanto os dois olham a torre.
- **Esconderijos:** a máquina de bebidas e o carrinho de sorvete.

**F1 B1 · Iced tea at the café**
- **Ambiente:** café com janelas grandes na parede de cima, com letreiro dourado em francês (genérico). Mesa comprida de madeira de frente para as janelas, cadeiras de madeira clara com encosto de ripas e assento creme, balcão branco com vitrine de doces e sanduíches, cardápios pendurados, piso xadrez cinza e bege.
- **Vigias:** sentados lado a lado na mesa comprida, de frente para a janela, com chá gelado. Loop: olham a janela (cones para cima) → viram um para o outro (cones de lado, ao longo da mesa) → de vez em quando um vira para trás, para o balcão (cone desce).
- **Janela:** quando olham pela janela.
- **Esconderijo:** a vitrine do balcão.

**F1 B2 · Planetarium**
- **Ambiente:** sala escura de planetário, cúpula com estrelas e luzes rosa e roxas, camas redondas azuis no chão.
- **Vigias:** deitados lado a lado numa cama redonda azul. Foi aqui o primeiro beijo dos dois. Loop:
  1. Olham o "céu" (cones para cima, cerca de 3 s).
  2. Viram um para o outro e se beijam, de olhos fechados (sem cone, cerca de 3 s).
  3. Sentam e olham em volta (os cones varrem a sala, cerca de 2 s).
  4. Voltam a deitar.
- **Janela:** o beijo. Enquanto olham o céu, também dá para passar pela parte de baixo da sala.
- **NPCs:** outros casais deitados nas camas, que bloqueiam a passagem.

**F1 C1 · Dinner at Saizeriya**
- **Ambiente:** restaurante familiar italiano genérico, sem logo: mesas com sofá, máquina de bebidas, garçom.
- **Vigias:** sentados frente a frente comendo massa. Olham um para o outro (cones na horizontal, sobre a mesa). De vez em quando um olha para a máquina de bebidas, e o cone vai para o corredor.
- **Janela:** quando conversam olhando um para o outro.
- **Obstáculo móvel:** o garçom andando entre as mesas.

**F1 C2 · A kiss in the park**
- **Ambiente:** parque de bairro à noite. Área aberta de terra cercada de árvores densas, um banco embaixo das árvores no fundo (topo da tela), um poste de luz e um brinquedo pequeno de parquinho.
- **Vigias:** sentados no banco. Se beijam de olhos fechados (sem cone, cerca de 3 s) e depois abrem os olhos e olham o parque (cones para baixo, cerca de 3 s).
- **Janela:** durante o beijo.
- **Esconderijo:** as árvores.

### Fase 2 — "Late Summer"

**F2 A1 · 24/08/2025 · Beach day**
- **Ambiente:** praia de areia clara, morro verde ao fundo, posto de salva-vidas, barracas, guarda-sóis e boias.
- **Vigias:** no mar (parte de cima da tela), brincando numa área pequena e jogando água um no outro; os cones giram. De vez em quando se abraçam (cerca de 2 s, sem cone).
- **Janela:** o abraço.
- **Caminho:** pela areia, embaixo. Barracas e guarda-sóis bloqueiam a visão.
- **Roupas:** de banho, sem chapéu, toalha ou óculos.

**F2 A2 · 24/08/2025 · Shaved ice by the sea**
- **Ambiente:** a mesma praia, perto das barracas.
- **Vigias:** em duas cadeiras de praia lado a lado, de frente para o mar (cones para cima), comendo raspadinha rosa. De vez em quando os dois viram para olhar as barracas (cones para baixo).
- **Janela:** quando olham o mar.
- **Roupas:** ela com chapéu de palha, óculos escuros, toalha rosa e chinelo de tubarão; ele com boné cáqui e os óculos azuis em cima.

**F2 B1 · 30/08/2025 · Cinema: Kimetsu no Yaiba**
- **Ambiente:** saguão de cinema com fila organizada por cordas, bilheteria e pôsteres genéricos na parede (nenhuma arte de filme real). O nome do filme aparece só na legenda do HUD.
- **Vigias:** na fila do ingresso, andando aos pouquinhos para a frente com a fila. Olham os pôsteres (cones para cima) e às vezes o saguão (cones para baixo).
- **NPCs:** pessoas na fila, que bloqueiam a passagem.

**F2 B2 · 30/08/2025 · Cinema: popcorn**
- **Ambiente:** balcão de pipoca e bebidas, máquina de pipoca, mesinhas.
- **Vigias:** esperando no balcão (cones para cima). De vez em quando viram para trás (cones para baixo).
- **NPC:** atendente atrás do balcão.

**F2 C1 · 05/09/2025 · Corona days**
- **Ambiente:** o apartamento do casal visto de cima, cabendo numa tela (detalhes no Apêndice C). Varanda embaixo, atravessando os dois quartos; quarto da esquerda (entrada da jogadora, pela varanda); quarto da direita (o da cama); cozinha em cima, no meio; banheiro e lavabo em cima, à esquerda; porta de entrada (genkan) em cima, à direita, que é a saída.
- **Vigias:** o Fabio deitado no colchão azul no chão, coberto com o cobertor azul-marinho, quase sempre de olhos fechados; às vezes abre os olhos e olha para a porta do quarto. A Ellen, de pijama rosa, faz a ronda: quarto da cama → cozinha → banheiro → volta, levando toalha e copo d'água. O cone dela segue a direção em que anda.
- **Janela:** quando ela está no banheiro.
- É o cenário mais tenso do jogo.

**F2 C2 · 06/09/2025 · Brazilian Day**
- **Ambiente:** parque com barracas de comida brasileira (bandeirinhas verdes e amarelas, toldos verdes), multidão e uma árvore grande com sombra. Um carro esportivo de exposição ao fundo é opcional.
- **Vigias:** cinco amigos sentados em roda na sombra da árvore: o Fabio e a Ellen do passado, mais duas amigas e um amigo (roupas no Apêndice A). Os cones do Fabio e da Ellen apontam para dentro da roda; de vez em quando olham para fora, para as barracas.
- **Janela:** quando conversam dentro da roda.
- **Obstáculos móveis:** pessoas andando entre as barracas.

### Fase 3 — "Through the Seasons"

**F3 A1 · 04/11/2025 e 27/11/2025 · Birthdays**
- **Ambiente:** a cozinha do apartamento, duplicada lado a lado (cada cópia ocupa meia tela).
  - Parede de cima: portas de correr de madeira marrom, fechadas; estante preta de arame com cestos e uma lava-louças branca; armário baixo marrom com vaso de folhas de outono vermelhas e laranja.
  - À esquerda: armário branco com porta de vidro preta, com fritadeira elétrica e chaleira de vidro em cima.
  - À direita: bancada com armários marrom-escuros, azulejo creme, coifa, fogão, janela e geladeira pequena prateada com micro-ondas em cima.
  - Paredes creme com moldura de madeira escura, piso de madeira clara, mesa de madeira escura com cadeiras de assento creme.
- **Cozinha da esquerda — 04/11/2025, aniversário do Fabio:** decoração de festa genérica (faixa "HAPPY BIRTHDAY", balões coloridos, torta de frutas vermelhas com velas "33", presente azul, sacola listrada). Só o Fabio do passado: assopra as velas, que acendem de novo sozinhas (cone para o bolo), e entre uma vez e outra olha em volta (o cone varre a cozinha).
- **Cozinha da direita — 27/11/2025, aniversário da Ellen:** toalha roxa, luzes coloridas, cartões, balões, enfeites brilhantes, duas pizzas grandes nas pontas da mesa e um bolinho decorado no centro. Só a Ellen do passado: abre os cartões (cone para baixo) e de vez em quando olha em volta.
- A data do HUD muda quando a jogadora passa para a segunda cozinha.
- Nada de One Piece no desenho. A referência fica só na fala do Fabio do presente.

**F3 A2 · 06/12/2025 · Shirakawa-go**
- **Ambiente:** vilarejo com casas de telhado de palha cobertas de neve, torii de madeira, um pequeno santuário, árvores sem folhas com neve e caminho de neve pisada.
- **Vigias:** andando pela rua do vilarejo, para lá e para cá, parando para olhar as casas. Os cones vão na direção do movimento.
- **Esconderijos:** as casas e o santuário.

**F3 B1 · 31/01/2026 · Ski trip**
- **Ambiente:** pista de ski de cima a baixo, pinheiros com neve e teleférico ao fundo.
- **Vigias:** o Fabio desce a pista de esqui sem parar (some embaixo e reaparece no topo), com o cone na direção da descida. A Ellen, parada na lateral, filma com o celular: o cone dela segue o Fabio.
- **Desafio:** a jogadora atravessa a pista da esquerda para a direita, escolhendo a hora certa.
- **Terreno e obstáculos:** neve funda nas bordas (terreno lento); outros esquiadores descendo (obstáculos móveis).

**F3 B2 · 01/03/2026 · BBQ with friends**
- **Ambiente:** área de churrasco num parque. Mesa comprida na vertical, para 6: a Ellen do passado e os cinco amigos (roupas no Apêndice A). Churrasqueira em cima, um pouco afastada da mesa. O Fabio do passado fica entre a mesa e a churrasqueira.
- **Vigias:** o Fabio alterna entre olhar a churrasqueira (cone para cima) e a mesa (cone para baixo). A Ellen alterna entre olhar o Fabio, a mesa e o caminho.
- **Janela:** quando a Ellen olha para o Fabio ou para a mesa e o Fabio olha para a churrasqueira.
- Sem mecânica de fumaça.

**F3 C1 · 28/03/2026 · Himeji Castle**
- **Ambiente:** o castelo branco de Himeji no fundo (topo da tela), muralha de pedra, cerejeiras floridas, pétalas caindo e chão de terra clara.
- **Vigias:** passeando devagar debaixo das cerejeiras. Param para olhar o castelo (cones para cima) e depois viram para o caminho (cones para baixo).
- **Esconderijos:** os troncos das cerejeiras.
- **NPCs:** turistas.

**F3 C2 · 29/03/2026 · Nara**
- **Ambiente:** lagoa na parte de cima da tela, cerejeiras no topo e caminho com cervos na parte de baixo.
- **Vigias:** num barco a remo. O amigo (NPC) rema no meio, o Fabio fica atrás olhando para a frente e a Ellen fica na frente olhando para trás. Os cones seguem o eixo do barco, um para cada lado. O barco anda e gira devagar pela lagoa.
- **Janela:** quando o barco fica paralelo ao caminho, os cones apontam para os lados da lagoa e a passagem abre. Quando o barco fica perpendicular, um dos cones desce até o caminho e fecha a passagem.
- **Obstáculos móveis:** os cervos andam pelo caminho e bloqueiam a passagem (inofensivos).

### Fase 4 — "Islands, Rings & Lanterns"

**F4 A1 · 26/04/2026 · Zoo**
- **Ambiente:** zoológico com cercados na parte de cima (elefante, leão, macacos, girafa, os que couberem). Os outros animais aparecem em placas com setas. Barraquinhas de comida (sorvete, crepe, takoyaki).
- **Vigias:** andam entre dois cercados e param para olhar os bichos (cones para cima); depois viram para o caminho (cones para baixo).
- **NPCs:** visitantes andando.

**F4 A2 · 03/05/2026 · Okinawa aquarium**
- **Ambiente:** sala escura com um tanque gigante na parede de cima: azul brilhante, corais, cardumes, raias-manta e um tubarão-baleia que atravessa o tanque devagar, indo e voltando.
- **Vigias:** em pé diante do vidro. Quando o tubarão-baleia passa, os dois viram a cabeça para acompanhar, e os cones varrem a sala na mesma direção.
- **Janela:** quando o tubarão está do outro lado e eles olham para o tanque.
- **NPCs:** visitantes, que bloqueiam a visão e a passagem.

**F4 B1 · 04/05/2026 · Diving in Okinawa**
- **Ambiente:** fundo do mar com corais, luz entrando de cima e bolhas.
- **Movimento:** debaixo d'água, mais lento e com leve deriva, para a jogadora e o Fabio do presente.
- **Vigias:** nadam devagar em círculos ao redor de um coral, com o cone na direção do nado.
- **Esconderijos móveis:** cardumes que passam e bloqueiam a visão.

**F4 B2 · 13/06/2026 · Making our rings**
- **Ambiente:** oficina de alianças. Teto de ripas de madeira com lâmpadas penduradas, vitrines de vidro com anéis e uma bancada de trabalho perto de uma janela, à esquerda. Sem logo da loja.
- **Vigias:** sentados lado a lado na bancada, de avental verde-oliva, trabalhando nos anéis (cones curtos, para a bancada). De vez em quando levantam a cabeça para mostrar o anel um para o outro e olham o salão (os cones varrem a oficina).
- **Obstáculo móvel:** o instrutor andando pela oficina.

**F4 C1 · 13/08/2026 · Yanai Goldfish Lantern Festival**
- **Ambiente:** rua à noite com casas de paredes brancas e fileiras de lanternas de peixinho dourado penduradas (vermelhas e brancas, com olhos grandes), que fazem círculos de luz no chão. Opcional: um arco de folhas amarelas com peixinhos coloridos.
- **Vigias:** andam devagar pela rua, olhando as lanternas.
- **Zonas de luz:** eles só veem a Ellen quando ela está num círculo de luz. A sombra é segura.

**F4 C2 · 15/08/2026 · Tottori Sand Dunes**
- **Ambiente:** dunas de areia com o mar no topo, céu nublado de fim de tarde e um pau de madeira fincado na areia, com o celular preso nele.
- **Vigias:** loop da foto com timer. Vão até o celular e ligam o timer (cones para o celular) → correm até o lugar da foto → fazem pose olhando para o celular (cones apontam para o celular) → voltam para conferir a foto.
- **Zona da foto:** durante a pose, a área entre eles e o celular é a "zona da foto". Se a Ellen for pega ali, a fala é "Photobomb detected!".
- **Terreno:** areia fofa (terreno lento).

### Fase 5 · hoje · "Here and now" — a livraria-café

- **Ambiente** (baseado nas fotos da loja):
  - Parede da esquerda: a estante branca de nichos, com as etiquetas (A05, B23 etc.).
  - Teto preto, luminárias geométricas douradas com plantas penduradas, paredes creme e uma janela no fundo.
  - Mesas pretas com cadeiras de encosto curvo de madeira e hastes pretas; carpete escuro.
  - Divisória de vidro deslizante com revisteiro e mural de avisos.
  - Balcão com máquina de café e caixa; em cima, prateleira preta com livros, quadros autografados, xícaras e uma luminária em forma de casquinha de sorvete (sem marca).
  - A escada para o 2º andar fica à direita do balcão.
- Não há vigias. É uma cena curta de diálogo (seção 11), seguida da aparição do vilão e da batalha.
- Depois da vitória, uma seta pisca sobre a escada. Quando a Ellen chega na escada, aparece a tela final.

---

## 7. Baús, memória e anomalias

### O baú (fim de cada fase)

- A salinha do baú fica depois da sala C. A Ellen abre o baú com Espaço.
- Animação de abrir, cartão do item com sprite e texto, e um jingle.
- A barra de memória ganha um segmento (20%) com animação, e o Fabio do presente diz a fala daquela fase.
- Itens (só são usados na batalha final):
  - Fase 1: Old Revolver
  - Fase 2: Mounjaro
  - Fase 3: Ammo ×5
  - Fase 4: Mysterious Ring (anel de platina com diamante)

### A tela da máquina (anomalia)

- Logo depois do baú, aparece a tela da máquina do tempo: um terminal retrô verde-água, com o texto surgindo letra por letra.
- Mostra o título "TIMELINE ANOMALY DETECTED", uma explicação curta, a pista do álbum e o campo para digitar a resposta. A pista fica visível o tempo todo enquanto a tela estiver aberta.
- Validação: ignora maiúsculas e minúsculas, acentos, espaços e pontuação, e compara com a lista de respostas aceitas da fase.
- Errou: a tela treme e mostra "ANOMALY NOT RECOGNISED. LOOK AGAIN." Sem limite de tentativas e sem dicas.
- Acertou: "ANOMALY CONFIRMED. TIMELINE REPAIRED." (na fase 3, com uma frase extra) → tela preta → próxima fase.

### Pistas, nichos e senhas (ficam em `config.js`)

A estante tem 18 nichos por fileira: A 1–18, B 19–36, C 37–54, D 55–72, E 73–90, F 91–108. Os números não se repetem.

- **Fase 1 · nicho A16**
  - Pista: *The day it all began.*
  - Anomalia no álbum: os dois se beijando num escritório. A legenda no álbum diz que eles trabalhavam juntos em Hokkaido, onde se conheceram.
  - Respostas aceitas: HOKKAIDO, HOKAIDO, OFFICE, WORK, JOB
- **Fase 2 · nicho B27**
  - Pista: *3³* (com o 3 pequeno elevado)
  - Anomalia: os dois no Rio de Janeiro
  - Respostas aceitas: BRAZIL, BRASIL, RIO, RIODEJANEIRO
- **Fase 3 · nicho F92**
  - Pista: *My initial. The year I was born.*
  - Anomalia: os dois com um canguru na Austrália
  - Respostas aceitas: AUSTRALIA, KANGAROO, SYDNEY
  - Depois de acertar, mostrar também: *Note: this memory hasn't happened… yet.*
- **Fase 4 · nicho E73**
  - Pista: *Your initial. Your favourite numbers.*
  - Anomalia: os dois na London Eye
  - Respostas aceitas: LONDON, LONDONEYE, FERRISWHEEL

---

## 8. Batalha final

### Visual

- Estilo Pokémon. O Big Jimmy Junk fica em cima, à direita (sprite grande, cerca de 64×64 px, com capangas batata-frita ao lado). A Ellen fica de costas embaixo, à esquerda, com o Fabio ao lado. Caixa de texto embaixo, com o menu.
- Barra de vida do vilão ("BIG JIMMY JUNK Lv. 99") e contador de balas da Ellen (5).
- Menu: SHOOT (com as balas restantes) e ITEM (Mounjaro, Mysterious Ring).

### Roteiro

1. **Abertura:** transição com flash, música de batalha e "BIG JIMMY JUNK wants to supersize you!".
2. **O vilão sempre ataca primeiro** com TEMPTATION: ondas de cheiro de fritura. A Ellen fica TEMPTED (as mãos tremem).
3. **Turno da Ellen:**
   - **SHOOT enquanto TEMPTED:** sempre erra e gasta uma bala. Mensagem engraçada sorteada. Depois, o vilão faz uma provocação sem dano.
   - **ITEM → Mounjaro:** tira o TEMPTED. No turno dele, o vilão faz o discurso de transformação, longo e dramático, com tremor de tela e música subindo, e vira SUPERSIZE (sprite maior, cerca de 96×96 px, com batata e refrigerante gigantes).
   - **SHOOT depois do Mounjaro:** a música para, silêncio, "BANG." Um único tiro derruba o vilão: a barra de vida zera de uma vez e ele cai de um jeito ridículo.
   - **ITEM → Mysterious Ring:** "Not here. Not yet." Não gasta o turno.
4. **Se as balas acabarem antes da vitória:** o vilão usa COMBO MEAL (golpe crítico), a Ellen desmaia, aparece "Try again?" e a batalha recomeça do zero (5 balas e o Mounjaro de volta).
5. **Vitória:** o Fabio diz "We could've done that from the start?" e a cena volta para a loja.

---

## 9. Áudio

- **Músicas** (chiptune gerado por código, em loop): título; prólogo (tensa na luta, curiosa no laboratório); exploração, uma por fase, com o clima de cada uma (verão, inverno, primavera, noite); batalha; transformação do vilão; final (romântica e calma).
- Para soar mais cheio, no estilo 16-bit, passe a música por um eco leve (delay curto, com pouco retorno).
- **Efeitos:** passos, porta, baú, jingle de memória, balões "??", "??!!" e "!!!!" (cada um mais agudo), ser pega, digitar no terminal, senha errada, senha certa, tiro, tiro errado.
- Volume geral em `config.js`. A tecla M liga e desliga o som.

---

## 10. Ferramentas de teste (só para o Fabio)

- **Modo de teste (Ctrl+Shift+D):** menu para pular para qualquer fase, cenário, baú, tela da máquina, fase 5 ou batalha; liga e desliga os cones (invisibilidade); mostra as caixas de colisão e o FPS.
- **Atalho de emergência (Ctrl+Shift+K):** pula o cenário atual ou aceita a senha da tela aberta. Não aparece em lugar nenhum da tela.
- Os dois atalhos ficam configuráveis em `config.js`.

---

## 11. Textos do jogo (inglês britânico)

Todos os textos desta seção ficam em `data/config.js`, para o Fabio revisar e trocar sem mexer no código.

- **Formato das falas:** `NOME: fala`. Na caixa de diálogo, o nome aparece numa aba acima da caixa, na cor do personagem: Ellen, Fabio, Tony, Heymans, Big Jimmy Junk.
- **Sem aba:** o NARRATOR aparece sem aba e em itálico (ou cor diferente). As linhas entre colchetes são ações e não aparecem na tela.
- **Exibição:** o texto surge letra por letra. Espaço completa a linha; se ela já estiver completa, avança.

### 11.1 Tela de título

- MEMORIES FROM THE FUTURE
- a game by Fabio, for Ellen
- Press Space
- Se houver jogo salvo: menu com **Continue** e **New game**.
- Pausa (Esc): **PAUSED** · Press Esc to continue

### 11.2 Prólogo

**Cena 1 — lanchonete de fast-food à noite, letreiro neon "JIMMY'S JUNK PALACE"**

- NARRATOR: Nagoya. An ordinary night.
- FABIO: Just one burger. Then I'm going home to Ellen.
- BIG JIMMY JUNK: Just one? Nobody stops at just one!
- BIG JIMMY JUNK used TEMPTATION!
- FABIO: My... memories... smell like... chips...
- NARRATOR: Fabio fell into a deep food coma. When he woke up, he couldn't remember anything. Not even her.

**Cena 2 — o apartamento**

- FABIO: Sorry... have we met?
- ELLEN: ...
- ELLEN: Right. I'm going to fix this.

**Cena 3 — o laboratório (Ellen de cabelo platinado dourado)**

- ELLEN: Professor Robinson, I need your help. I'm building a time machine.
- TONY: Of course you are. Let's start with the maths.
- ELLEN: I brought these too. Dr King's old notes. They might help.
- TONY: Barry's notes... He'd be proud of you, Ellen.
- [cartão] *Some years later...* (Ellen com o cabelo meio a meio)
- TONY: Good news: the machine works.
- TONY: Bad news: the test subjects did not enjoy the trip.
- ELLEN: Then we need someone who understands living things. I know exactly who to call.
- HEYMANS: Ellen! My favourite student. So... you need a human to survive time travel?
- ELLEN: Two humans, actually.
- [cartão] *Some more years later...* (Ellen com o cabelo todo loiro-escuro)
- HEYMANS: Biology: sorted.
- TONY: Maths: checked. Twice.
- TONY: Listen carefully. Once you're inside, we can't reach you.
- TONY: Your past selves must not see you. Stay out of their sight. If they spot you, time will push you back.
- TONY: Arrows or WASD to move. Shift to run. Space to interact.
- TONY: Every memory you put back will bring a piece of him home.
- HEYMANS: Bring him back, Ellen.
- TONY & HEYMANS: Good luck!
- ELLEN: Come on, you. We're going on a trip.
- FABIO: Do I... know you?
- ELLEN: Not yet. You will.
- [a jogadora anda até a máquina e aperta Espaço]
- MACHINE: DESTINATION: 16 AUGUST 2025.

**Chegada ao passado (antes do F1 A1)**

- FABIO: Where are we?
- ELLEN: Our first date. Stay close, and don't let them see us.
- FABIO: Them?
- FABIO: Is that... me? I look great.

### 11.3 Cartões das fases

- STAGE 1 — The First Date
- STAGE 2 — Late Summer
- STAGE 3 — Through the Seasons
- STAGE 4 — Islands, Rings & Lanterns
- STAGE 5 — Here and Now

### 11.4 Fala ao entrar em cada cenário

Quem fala é a Ellen ou o Fabio do presente: a Ellen conta a memória, e o Fabio, ainda sem memória, comenta o que vê. A caixa mostra o nome de quem fala, aparece por cerca de 3 segundos sem pausar o jogo e some sozinha (ou com Espaço).

| Cenário | Quem fala | Fala |
|---|---|---|
| F1 A1 | Ellen | This was our first date. You prepared the best okonomiyaki. |
| F1 A2 | Ellen | We came to have ice cream as dessert, and a good view. |
| F1 B1 | Fabio | Iced tea... The conversation seems to be going so well. |
| F1 B2 | Ellen | This was where we had our first kiss. |
| F1 C1 | Ellen | It was the first time I'd been to Saizeriya. |
| F1 C2 | Fabio | So many mosquit... Wait... are they...? OMG! |
| F2 A1 | Fabio | The sea! I think they are having so much fun. |
| F2 A2 | Fabio | Pink shaved ice. Is that my favourite? |
| F2 B1 | Ellen | Movie time! We came to watch an anime movie. |
| F2 B2 | Fabio | What a great smell! Popcorn. Large. Obviously. |
| F2 C1 | Fabio | Poor guy. And an angel looking after him. |
| F2 C2 | Fabio | I smell BBQ... and Guaraná! |
| F3 A1 (cozinha da esquerda) | Fabio | My birthday! The One Piece party! |
| F3 A1 (cozinha da direita) | Fabio | Your birthday. Pizza AND cake. Respect. |
| F3 A2 | Fabio | Snow on the roofs. It looks like a fairy tale. |
| F3 B1 | Fabio | Me? Skiing? Gracefully, I hope. |
| F3 B2 | Fabio | The smell is amazing! They are having so much fun. |
| F3 C1 | Fabio | A white castle and cherry blossoms. Unreal. |
| F3 C2 | Fabio | Careful. The deer here mean business. |
| F4 A1 | Fabio | Lions, elephants... and us. |
| F4 A2 | Ellen | You made one of my dreams come true. |
| F4 B1 | Fabio | Diving! Looks so fun... So many fish! |
| F4 B2 | Fabio | Rings? Why does this feel important? |
| F4 C1 | Ellen | We travelled for hours to come to my favourite festival. |
| F4 C2 | Ellen | One of our happiest moments. |

### 11.5 Ao ser pega (fala sorteada do Fabio)

- That was close. Too close.
- They almost saw us!
- Time says no. Again!
- Maybe try not to wave at them?
- Só no F4 C2, se for pega na zona da foto: Photobomb detected!

### 11.6 Baús e memória

| Fase | Texto do item | Fala do Fabio (memória +20%) |
|---|---|---|
| 1 | You found an OLD REVOLVER. It looks completely useless. Better keep it anyway. | Okonomiyaki, a tower, a kiss in the park... I remember our first date! |
| 2 | You found MOUNJARO. "Reduces cravings." Might come in handy. | The beach, the cinema... you looking after me when I was ill. I remember! |
| 3 | You found AMMO ×5. Five bullets. Make them count. | Birthdays, snow, cherry blossoms... We did so much together. |
| 4 | You found a MYSTERIOUS RING. It sparkles. It feels... important. | Okinawa, the rings, the lanterns, the dunes... It's all coming back. |

### 11.7 Tela da máquina

```
TIMELINE ANOMALY DETECTED

Our trip through time has changed one of your memories.
Somewhere on the bookshelf, a photo album holds the proof:
one photo shows something that never happened.

FIND THE ALBUM:  [pista da fase]
ENTER THE ANOMALY:  [campo de texto]
```

- Errou: **ANOMALY NOT RECOGNISED. LOOK AGAIN.**
- Acertou: **ANOMALY CONFIRMED. TIMELINE REPAIRED.**
- Só na fase 3, depois de acertar: *Note: this memory hasn't happened... yet.*

### 11.8 Fase 5 — a livraria-café

- ELLEN: Wait. Where are we? This isn't one of our memories.
- FABIO: No... but I know this place. The books, the shelf... I've been here. Today.
- FABIO: Argh! My head!
- ELLEN: Fabio!
- [a barra de memória enche até 100%, com o jingle]
- FABIO: I remember. Everything. You. Us. All of it.
- [as luzes piscam, ondas de cheiro de fritura entram na tela]
- BIG JIMMY JUNK: Not so fast! A memory like that is far too healthy.
- BIG JIMMY JUNK: I'll take him back... with a side of fries!

### 11.9 Batalha

- **Abertura:** BIG JIMMY JUNK wants to supersize you!
- **Ataque inicial:** BIG JIMMY JUNK used TEMPTATION! The smell of fresh chips fills the room...
- Ellen is TEMPTED! Her hands are shaking.
- **Menu:** SHOOT (BULLETS: n) · ITEM → MOUNJARO, MYSTERIOUS RING
- **Tiro errado (sorteado):**
  - Missed! Ellen is thinking about chips.
  - The bullet hit a fry soldier. It didn't even notice.
  - Missed! Was that a milkshake?
  - So close! The smell is too strong.
- **Provocação do vilão depois de um erro (sorteada):**
  - Go on, have a bite!
  - Would you like fries with that?
- **Mounjaro:** Ellen used MOUNJARO! Cravings: gone. Focus: restored.
- **Discurso de transformação:**
  - BIG JIMMY JUNK: What?! You dare refuse me?!
  - BIG JIMMY JUNK: I am the king of grease! The lord of late-night snacks!
  - BIG JIMMY JUNK: Every midnight craving, every "just one more"... that was ME!
  - BIG JIMMY JUNK: Behold my final form...
  - BIG JIMMY JUNK: SUPER... SIZE!!!
  - BIG JIMMY JUNK became SUPERSIZE!
- **O tiro final:** ... → BANG. → Big Jimmy Junk was defeated with a single shot.
- FABIO: We could've done that from the start?
- ELLEN: Where's the fun in that?
- **Anel:** Ellen looks at the ring... "Not here. Not yet."
- **Derrota:** BIG JIMMY JUNK used COMBO MEAL! It's super effective! → Ellen fainted... → Try again?

### 11.10 Final

- FABIO: Ellen... thank you for bringing me back.
- FABIO: There's one memory left. It hasn't happened yet.
- FABIO: It's waiting for you on the second floor.
- [uma seta pisca sobre a escada; a Ellen anda até lá]
- Tela final: **YOU WON.** · *Now... go to the second floor.*

---

## 12. Etapas de implementação

O jogo precisa ficar pronto em três noites. Construa nesta ordem e faça um commit no git ao fim de cada etapa. Ao fim da etapa 3, a fase 1 já precisa estar jogável do começo ao fim, para o Fabio testar e corrigir o rumo cedo.

1. **Base:** `index.html`, canvas com escala inteira, loop, entrada, caixa de diálogo com a fonte, salvamento e modo de teste. Teste numa sala vazia.
2. **Núcleo de stealth no F1 A1:** a Ellen com o Fabio seguidor, vigias com linha do tempo, cones com raycasting, detecção em três estágios e volta ao começo do cenário. É nesta etapa que se acerta a sensação do jogo.
3. **Fase 1 completa:** os seis cenários, os corredores, o baú, a barra de memória, a tela da máquina com a validação da senha e a transição.
4. **Fases 2 a 4,** com os componentes especiais: barco, esqui, zonas de luz, mergulho, tubarão-baleia e zona da foto.
5. **Prólogo, fase 5, batalha e final.**
6. **Áudio:** músicas e efeitos.
7. **Polimento e balanceamento:** cerca de 30 s por cenário e 15 a 20 min no total. No fim, uma partida completa de teste.

**Ritmo sugerido:**
- Noite 1: etapas 1 a 3.
- Noite 2: etapa 4.
- Noite 3: etapas 5 a 7.

### Se o tempo apertar (cortes, nesta ordem)

1. Uma música de exploração só, para todas as fases.
2. Menos NPCs, e todos parados.
3. Animação de andar com 2 quadros em vez de 4.
4. Prólogo com cenas paradas (fundo e diálogo), andando só no trecho até a máquina.
5. Componentes especiais simplificados: o barco de Nara vira um vigia que só gira, e o mergulho usa o movimento normal.

**Nunca corte:** as senhas, a tela da máquina, a batalha, o final e o atalho de emergência.

---

## 13. Critérios de pronto

- Abre com dois cliques no `index.html`, offline, no Chrome, sem erros no console.
- Dá para jogar do começo ao fim.
- As 4 senhas funcionam, com todas as variações, e o atalho de emergência funciona.
- Todos os textos, pistas, senhas, datas e a dificuldade vêm do `config.js`.
- "Continue" funciona depois de fechar e abrir o navegador.
- Nenhum logo, marca ou personagem de terceiros nos gráficos.
- Em tela cheia num notebook 1920×1080, a imagem fica nítida (escala 5×).

---

## 14. Publicação futura (site do Fabio)

- Basta copiar a pasta para o site. É o mesmo jogo, sem modo especial.
- Proteja com senha ou com um link escondido, porque é um jogo pessoal.
- Não publique a pasta `referencias/`, que tem fotos pessoais.
- As senhas continuam as mesmas, e o atalho Ctrl+Shift+K continua funcionando.

---

## Apêndice A — Roupas e paletas

Os hex já estão ajustados para pixel art (não são a média crua das fotos, que vem distorcida pela luz). Os rostos seguem as fotos de referência.

**Regra geral**
- Logos, marcas e estampas de desenho, personagem ou foto não entram: a peça vira cor lisa.
- Estampas genéricas ficam, simplificadas em poucos pixels: xadrez, flores, folhas, listras, coqueiros e as ondas (seigaiha) do yukata.

### Base dos personagens

**Fabio**
- Pele #D19A72 (sombra #A9714F).
- Cabelo preto, curto, com volume em cima (às vezes ondulado): #2B201C.
- Bigode e cavanhaque: #2B201C.
- Acessório recorrente: óculos espelhados azuis #2F7FD8 (no rosto, na cabeça ou em cima do boné).
- Relógio preto (smartwatch) em vários cenários.

**Ellen**
- Pele bem clara e rosada: #F6D7C6 (sombra #E3B5A3).
- Franja curta e reta.
- Óculos de grau com armação transparente/rosada clara #E9D9D3 (no sprite, use um tom mais escuro para aparecer). Só onde a ficha indica: F1, cinema da F2, churrasco da F3, as cenas em casa (corona e aniversário) e a Ellen do presente. Nas outras, sem óculos ou de óculos escuros.
- Cabelo:
  - 16/08/2025 (fase 1): meio a meio. Raiz e franja loiro-escuro #A87E48, comprimento platinado dourado #F2D78E (visual de raiz crescida).
  - A partir de 24/08/2025: platinado dourado #F2D78E (sombra #D9B565). O penteado varia por cena (solto, preso, tranças).
- Tatuagens: alguns pixels escuros #3A3A48 nos braços e pernas.

### Presente

- **Ellen do presente:** jaleco branco #F4F6F8 (sombra #C9CED6) por cima de blusa escura #2B2D3A, calça escura #2A2E44, bota preta, cabelo todo loiro-escuro #A87E48 e óculos de grau.
- **Fabio do presente:** moletom com capuz mostarda #D9A62E (sombra #B0841F), calça jeans escura #2A3550, tênis branco e curativo branco #F4F4F0 na cabeça. A cor mostarda não aparece em nenhum cenário do passado, para ele nunca se confundir com o Fabio do passado.

### Fase 1 — 16/08/2025 (os 6 cenários)

- **Fabio:** camisa de botão de manga curta azul #4778C6, com estampa floral do mesmo tom (pixels #6E9BE0); short branco #F0EFEA; tênis branco.
- **Ellen:** blusa canelada frente única azul #5C94DC; short jeans rasgado #7A9CC4 (rasgos #DCE6F0); cabelo meio a meio; óculos de grau.

### Fase 2

**A1 — 24/08/2025 — praia, no mar**
- Fabio: sem camisa; bermuda de praia azul-marinho #0E2A55.
- Ellen: top de natação preto #22232B com ombros e laterais turquesa #2A8FB5; legging preta #1E2027 até abaixo do joelho. Sem chapéu, toalha ou óculos.

**A2 — 24/08/2025 — praia, cadeiras**
- Fabio: igual ao A1, mais boné cáqui #C8A77A com os óculos azuis em cima e raspadinha (kakigōri) rosa #F07A9A em copo branco na mão.
- Ellen: igual ao A1, mais chapéu de palha #D9A55B com faixa preta, óculos escuros pretos #1E1E24, toalha rosa-clara #EBC3C4 no pescoço e chinelo de tubarão branco-pastel #ECE6EA. Sem bolsa.

**B1/B2 — 30/08/2025 — cinema**
- Fabio: camiseta branca #F2F0EA, sem estampa; bermuda branca com folhas verdes #2E7D4F e flores laranja #E08A2C (a mesma de Tottori).
- Ellen: regata canelada frente única preta #1F1D1B; calça jeans azul-escura #24365E; manguito preto #151413 num braço; óculos de grau.

**C1 — 05/09/2025 — corona**
- Fabio: deitado no colchão, coberto com cobertor azul-marinho #1E2A4A.
- Ellen: pijama rosa #F2A7BE; óculos de grau.

**C2 — 06/09/2025 — Brazilian Day**
- Fabio: camiseta verde #2EA35A, sem estampa; bermuda azul-marinho/grafite #1F2E40; máscara branca #E9ECF2; óculos azuis na cabeça; relógio preto.
- Ellen: vestido verde-claro, com corpete verde-sálvia #B9C493 (bordado de flores e cordão) e saia de chiffon verde-pistache #D3DCA4; meia-calça branca rendada #F3EEEA; óculos escuros pretos #1E1E24; cabelo preso.

### Fase 3

**A1 — 04/11/2025 — aniversário do Fabio (só o Fabio do passado)**
- Fabio: camisa branca #F2F0EA; calça azul-escura #24365E (se aparecer atrás da mesa).

**A1 — 27/11/2025 — aniversário da Ellen (só a Ellen do passado)**
- Ellen: blusa branca #F2F0EA e calça azul-escura #24365E; óculos de grau.

**A2 — 06/12/2025 — Shirakawa-go (neve)**
- Fabio: gorro de tricô laranja-ferrugem #B9622E; jaqueta verde-oliva escura #5E574B aberta; colete acolchoado azul-marinho #2E2C3A; camiseta branca por baixo; calça verde-oliva #6E6C52; sapato preto.
- Ellen: gorro de tricô cinza #9C9C9C; óculos escuros #1E1E24; jaqueta preta #1C1C22 com zíper branco; calça cargo preta #1E1B22; bota preta; luvas pretas; bolsa transversal preta; cabelo solto.

**B1 — 31/01/2026 — ski**
- Fabio: macacão de ski vermelho #C8283C (detalhes cinza #9EA3A8); capacete preto #1C1D22; óculos de ski de lente vermelha #D04545; esquis.
- Ellen: macacão de ski pied-de-poule preto e branco (#EDEDED + #1B1B1F); capacete preto; óculos de ski azul espelhado #2A4FD0; luvas pretas.

**B2 — 01/03/2026 — churrasco**
- Fabio: camisa xadrez azul-clara #7FAEDD (quadriculado #A9CBEB) aberta; camiseta branca; chapéu bege-claro #E3D6BC; calça jeans #3E5A8A; relógio preto.
- Ellen: cabelo platinado em duas tranças; óculos de grau; jaqueta jeans #3F5F92; vestido azul-violeta #5C4FC2; bota preta.
- Amigos (NPCs, na mesa de 6 com a Ellen):
  1. Jaqueta fleece bege-creme #D8CBB0, short preto, bota preta, cabelo preto curto.
  2. Jaqueta acolchoada amarelo-limão #D6D02A, calça preta, cabelo preto preso.
  3. Suéter cinza felpudo #A7A7A5, jeans claro #8FA8C8, cabelo preto comprido.
  4. Casaco preto, cachecol de oncinha, jeans, cabelo castanho-claro curto.
  5. Colete preto, blusa listrada vermelho/azul, cabelo preto curto, óculos na cabeça.

**C1 — 28/03/2026 — Himeji**
- Fabio: camiseta azul-marinho #232848, sem logo; calça de moletom cinza-clara #B4B4B4; tênis branco; relógio preto.
- Ellen: jaqueta corta-vento preta; camiseta preta sem estampa; saia curta preta; meia-calça preta; tênis branco; óculos escuros; bolsa transversal preta; cabelo solto.

**C2 — 29/03/2026 — Nara (barco)**
- Fabio: camiseta cinza-clara #B9BCC0; calça de moletom cinza-clara #B4B4B4; tênis branco.
- Ellen: camiseta preta sem estampa; calça cargo verde-oliva #6E6B48; casaco cinza-claro #D9DCE0 amarrado na cintura; tênis branco; óculos escuros; bolsa transversal preta; cabelo preso.
- Amigo (NPC, remando): camisa creme #E8E0CC com listras finas marrons #8A7A5E; jeans claro #8FA8C8; cinto preto; sapato preto; boné cinza-azulado #A9B8C8; relógio.

### Fase 4

**A1 — 26/04/2026 — zoológico**
- Fabio: camiseta preta #1C1C20 sem estampa; bermuda azul-marinho escura #1F2E40; mochila azul-marinho; relógio preto.
- Ellen: camiseta preta larga sem estampa; short preto largo #1E1D22; cabelo solto; sem óculos.

**A2 — 03/05/2026 — aquário**
- Fabio: camisa branca #F2EEE6 com estampa de coqueiros marrom #6B4A2E; bermuda azul-turquesa #2A86A6; boné preto virado para trás; chinelo preto; colar de cordão.
- Ellen: vestido branco sem manga #F4F1EC com flores laranja #E8702A e azuis #3B6FC4; tênis branco; cabelo solto; sem óculos.

**B1 — 04/05/2026 — mergulho**
- Os dois: roupa de neoprene preta #1B1C20, colete preto #26272C e sapatilha preta.
- Fabio: máscara e snorkel turquesa #2CB5B0; luvas cinza #9A9DA3.
- Ellen: máscara branca/transparente #E9E8D8 e snorkel branco; luvas pretas; cabelo preso.

**B2 — 13/06/2026 — oficina de alianças**
- Os dois: avental verde-oliva #5F5E3C, sem logo.
- Fabio: camisa de tricô azul-petróleo #2F3F45 sobre camiseta branca.
- Ellen: braços de fora (regata por baixo do avental); cabelo preso em coque; colar; sem óculos.

**C1 — 13/08/2026 — festival de Yanai (noite)**
- Fabio: yukata cinza-amarronzado #8A7A6A com ondas brancas (seigaiha) #EFEAE2; camiseta branca por baixo; geta.
- Ellen: camiseta rosa-clara #F2C6CC; manguitos longos rosa #F0C9CF com babados; short branco de babados #F6F2EA; tênis branco; óculos escuros na cabeça; cabelo preso.
- Lanternas: peixinho vermelho e branco, com olhos grandes.

**C2 — 15/08/2026 — dunas de Tottori**
- Fabio: boné branco #F2F2F2; camisa de tricô azul-petróleo #2F3F45 aberta (a mesma da oficina); regata branca #F4F4F4; bermuda branca com folhas verdes #2E7D4F e flores laranja #E08A2C; descalço; relógio preto.
- Ellen: o mesmo vestido verde do Brazilian Day; óculos aviador escuros; descalça; cabelo em rabo de cavalo; colar e pulseiras.

---

## Apêndice B — Personagens extras e vilão

- **Tony Robinson (tutor):** paletó de tweed marrom com remendos no cotovelo, óculos redondos, barba grisalha, giz na mão.
- **Professora Heymans:** loira de coque, cardigã verde, prancheta. Sem jaleco, para não se confundir com a Ellen.
- **Dr Barry King:** aparece só como o caderno de anotações, de capa de couro marrom gasta, em cima da mesa do laboratório.
- **Big Jimmy Junk:**
  - Um cheeseburger gigante, com queijo derretendo e gergelim no topo.
  - Bigode de ketchup e mostarda.
  - Corrente de ouro com pingente de donut.
  - Um copo de refrigerante gigante como cetro.
  - Capangas: batatas fritas soldado e copos de refrigerante.
  - Temptation aparece como ondas de cheiro de fritura.
  - Na batalha, mede cerca de 64×64 px. A forma final, SUPERSIZE, mede cerca de 96×96 px, com batata e refrigerante gigantes.
- **Lanchonete do prólogo:** fast-food genérica à noite, com letreiro neon "JIMMY'S JUNK PALACE" (nome inventado, sem marcas reais).
- **Laboratório:** o quadro do Tony cheio de equações, as plantas e amostras da Heymans, o caderno do Dr King na mesa e a máquina no centro.
- **Amigos do Brazilian Day (F2 C2):**
  - Amiga 1: cabelo chanel castanho, top preto franzido com babado sobre camiseta branca, jeans escuro com fendas, tênis claro.
  - Amiga 2: cabelo preto comprido, boné claro, camiseta branca, calça escura, caipirinha na mão.
  - Amigo (roupa inventada): camiseta amarela com detalhes verdes (sem escudo) e bermuda azul.
- **Amigos do churrasco (F3 B2) e amigo de Nara (F3 C2):** ver Apêndice A.
- **Instrutor da oficina de alianças (F4 B2):** genérico, de avental verde-oliva.
- **NPCs genéricos:** varie cabelo, pele e roupa trocando a paleta.

---

## Apêndice C — O apartamento (F2 C1 e F3 A1)

**Planta**
- Varanda embaixo, atravessando os dois quartos.
- Quarto da esquerda: entrada da jogadora, pela varanda.
- Quarto da direita: o da cama.
- Cozinha (DK) em cima, no meio.
- Banheiro, lavabo e armário embutido em cima, à esquerda.
- Porta de entrada (genkan) em cima, à direita. É a saída.

**Os dois quartos**
- Mesmas paredes e cortinas: cortina azul lisa na janela da varanda e cortina azul-marinho com risquinhos brancos na outra janela.
- Paredes brancas com rodameio de madeira escura, piso de madeira clara, portas de armário de correr de madeira marrom e ar-condicionado na parede.
- Quarto da cama: colchão azul no chão com travesseiros azul-claros, tapete cinza felpudo e uma mesinha branca baixa (de sentar no chão).

**Cozinha**
- Mesa de jantar de madeira escura com 4 cadeiras (estrutura de madeira escura, assento e encosto creme).
- Em cima: portas de correr de madeira marrom, estante preta de arame com cestos, uma lava-louças branca e um armário baixo marrom com um vaso de folhas de outono vermelhas e laranja.
- À esquerda: armário branco com porta de vidro preta (temperos), com fritadeira elétrica e chaleira de vidro em cima.
- À direita, a bancada: armários altos marrom-escuros, azulejo creme, coifa, fogão, janela, geladeira pequena prateada com micro-ondas em cima e um suporte de parede com temperos e utensílios.
- Paredes creme com moldura de madeira escura, piso de madeira clara e luminária redonda no teto.

---

## Apêndice D — Esqueleto do `data/config.js`

Os textos completos estão na seção 11. Os nichos (`niche`) servem só para o Fabio se organizar; o jogo não os mostra.

```js
window.GAME_CONFIG = {
  title: { name: "MEMORIES FROM THE FUTURE", subtitle: "a game by Fabio, for Ellen", press: "Press Space" },
  audio: { volume: 0.6 },
  difficulty: {
    coneHalfAngleDeg: 30, coneLength: 72,
    suspicionUpPerSec: 1.0, suspicionDownPerSec: 0.5,
    walkSpeed: 60, runSpeed: 110
  },
  debug: { menuKeys: "Ctrl+Shift+D", skipKeys: "Ctrl+Shift+K" },
  stages: [
    {
      id: 1, title: "The First Date",
      scenes: [
        { code: "F1A1", date: "16/08/2025", title: "Okonomiyaki", line: { who: "Ellen", text: "This was our first date. You prepared the best okonomiyaki." } },
        { code: "F1A2", date: "16/08/2025", title: "Ice cream at Mirai Tower", line: { who: "Ellen", text: "We came to have ice cream as dessert, and a good view." } },
        { code: "F1B1", date: "16/08/2025", title: "Iced tea at the café", line: { who: "Fabio", text: "Iced tea... The conversation seems to be going so well." } },
        { code: "F1B2", date: "16/08/2025", title: "Planetarium", line: { who: "Ellen", text: "This was where we had our first kiss." } },
        { code: "F1C1", date: "16/08/2025", title: "Dinner at Saizeriya", line: { who: "Ellen", text: "It was the first time I'd been to Saizeriya." } },
        { code: "F1C2", date: "16/08/2025", title: "A kiss in the park", line: { who: "Fabio", text: "So many mosquit... Wait... are they...? OMG!" } }
      ],
      chest: { item: "OLD REVOLVER", text: "You found an OLD REVOLVER. It looks completely useless. Better keep it anyway." },
      memoryLine: "Okonomiyaki, a tower, a kiss in the park... I remember our first date!",
      anomaly: { niche: "A16", clue: "The day it all began.", answers: ["HOKKAIDO", "HOKAIDO", "OFFICE", "WORK", "JOB"] }
    },
    {
      id: 2, title: "Late Summer",
      scenes: [
        { code: "F2A1", date: "24/08/2025", title: "Beach day", line: { who: "Fabio", text: "The sea! I think they are having so much fun." } },
        { code: "F2A2", date: "24/08/2025", title: "Shaved ice by the sea", line: { who: "Fabio", text: "Pink shaved ice. Is that my favourite?" } },
        { code: "F2B1", date: "30/08/2025", title: "Cinema: Kimetsu no Yaiba", line: { who: "Ellen", text: "Movie time! We came to watch an anime movie." } },
        { code: "F2B2", date: "30/08/2025", title: "Cinema: popcorn", line: { who: "Fabio", text: "What a great smell! Popcorn. Large. Obviously." } },
        { code: "F2C1", date: "05/09/2025", title: "Corona days", line: { who: "Fabio", text: "Poor guy. And an angel looking after him." } },
        { code: "F2C2", date: "06/09/2025", title: "Brazilian Day", line: { who: "Fabio", text: "I smell BBQ... and Guaraná!" } }
      ],
      chest: { item: "MOUNJARO", text: "You found MOUNJARO. \"Reduces cravings.\" Might come in handy." },
      memoryLine: "The beach, the cinema... you looking after me when I was ill. I remember!",
      anomaly: { niche: "B27", clue: "3³", answers: ["BRAZIL", "BRASIL", "RIO", "RIODEJANEIRO"] }
    },
    {
      id: 3, title: "Through the Seasons",
      scenes: [
        { code: "F3A1", dates: ["04/11/2025", "27/11/2025"], title: "Birthdays",
          lines: [{ who: "Fabio", text: "My birthday! The One Piece party!" },
                  { who: "Fabio", text: "Your birthday. Pizza AND cake. Respect." }] },
        { code: "F3A2", date: "06/12/2025", title: "Shirakawa-go", line: { who: "Fabio", text: "Snow on the roofs. It looks like a fairy tale." } },
        { code: "F3B1", date: "31/01/2026", title: "Ski trip", line: { who: "Fabio", text: "Me? Skiing? Gracefully, I hope." } },
        { code: "F3B2", date: "01/03/2026", title: "BBQ with friends", line: { who: "Fabio", text: "The smell is amazing! They are having so much fun." } },
        { code: "F3C1", date: "28/03/2026", title: "Himeji Castle", line: { who: "Fabio", text: "A white castle and cherry blossoms. Unreal." } },
        { code: "F3C2", date: "29/03/2026", title: "Nara", line: { who: "Fabio", text: "Careful. The deer here mean business." } }
      ],
      chest: { item: "AMMO ×5", text: "You found AMMO ×5. Five bullets. Make them count." },
      memoryLine: "Birthdays, snow, cherry blossoms... We did so much together.",
      anomaly: { niche: "F92", clue: "My initial. The year I was born.", answers: ["AUSTRALIA", "KANGAROO", "SYDNEY"],
                 extra: "Note: this memory hasn't happened... yet." }
    },
    {
      id: 4, title: "Islands, Rings & Lanterns",
      scenes: [
        { code: "F4A1", date: "26/04/2026", title: "Zoo", line: { who: "Fabio", text: "Lions, elephants... and us." } },
        { code: "F4A2", date: "03/05/2026", title: "Okinawa aquarium", line: { who: "Ellen", text: "You made one of my dreams come true." } },
        { code: "F4B1", date: "04/05/2026", title: "Diving in Okinawa", line: { who: "Fabio", text: "Diving! Looks so fun... So many fish!" } },
        { code: "F4B2", date: "13/06/2026", title: "Making our rings", line: { who: "Fabio", text: "Rings? Why does this feel important?" } },
        { code: "F4C1", date: "13/08/2026", title: "Yanai Goldfish Lantern Festival", line: { who: "Ellen", text: "We travelled for hours to come to my favourite festival." } },
        { code: "F4C2", date: "15/08/2026", title: "Tottori Sand Dunes", line: { who: "Ellen", text: "One of our happiest moments." } }
      ],
      chest: { item: "MYSTERIOUS RING", text: "You found a MYSTERIOUS RING. It sparkles. It feels... important." },
      memoryLine: "Okinawa, the rings, the lanterns, the dunes... It's all coming back.",
      anomaly: { niche: "E73", clue: "Your initial. Your favourite numbers.", answers: ["LONDON", "LONDONEYE", "FERRISWHEEL"] }
    }
  ],
  shop: { hudTitle: "Here and now" },   // a data do HUD vem do relógio do computador
  texts: {
    prologue: [ /* seção 11.2 */ ],
    arrival: [ /* seção 11.2, chegada */ ],
    caught: ["That was close. Too close.", "They almost saw us!", "Time says no. Again!", "Maybe try not to wave at them?"],
    caughtPhoto: "Photobomb detected!",
    machine: { /* seção 11.7 */ },
    shop: [ /* seção 11.8 */ ],
    battle: { /* seção 11.9 */ },
    ending: [ /* seção 11.10 */ ]
  }
};
```

---

## Apêndice E — Moldes de pixel art (16-bit leve)

As imagens `referencias/preview_16bit_sala_A.png` e `referencias/preview_16bit_detalhe.png` mostram o estilo-alvo. Os personagens delas foram gerados com os moldes abaixo. Copie o bloco de código para `data/sprites.js` e expanda a partir dele.

### E.1 Regras de estilo

- **Luz:** vem de cima, à esquerda. Cada material tem 3 a 4 tons (base, sombra e brilho), e a sombra puxa para um tom mais frio.
- **Contorno colorido**, nunca preto puro. Cada pixel `o` recebe a mistura de 70% de #1E1826 com 30% da cor vizinha mais escura.
- **Sombra no chão:** uma elipse escura, com cerca de 35% de opacidade, embaixo de cada personagem e objeto. No parque à tarde, as sombras saem esticadas para baixo e para a direita.
- **Luz e brilho** (luminárias, lanternas, sol): em níveis concêntricos com pontilhado (matriz Bayer 4×4), não em degradê liso. O céu também usa faixas com pontilhado entre elas.
- **Cones de visão:**
  - Preenchimento vermelho #FF3A32 com cerca de 23% de opacidade, um pouco mais forte na metade perto do vigia.
  - Borda #FF5C50 com cerca de 70% de opacidade.
  - Ficam na camada do chão, embaixo dos móveis e dos personagens.
- **HUD:**
  - Fundo em degradê de #24203F a #16132B, com linha inferior #5B4F92.
  - "STAGE n" em #F2C14E, data em #CFC8E8, título em #FFF4DA.
  - Texto com sombra #07060E deslocada 1 px.
- **Caixa de diálogo:**
  - Fundo de #28245A a #151233, com cerca de 93% de opacidade.
  - Borda externa #F2E8CC e borda interna #7F74BC.
  - Seta ▼ piscando em #F2C14E.
  - Aba com o nome, na cor do personagem: Fabio #D9A62E, Ellen #F4F6F8 (texto escuro), Tony #8A5A3C, Heymans #4E8A5A, Big Jimmy Junk #D8443A.

### E.2 Como os moldes funcionam

- **Montagem:** cada sprite tem 16×32 px. É uma cabeça (15 linhas) seguida de um corpo (17 linhas).
- **Pixels do molde:** `.` é transparente, `o` é contorno, e cada letra é um material, pintado pela paleta da roupa (Apêndice A).
- **Materiais:**
  - Pele: `s`/`S` (base e sombra).
  - Cabelo: `h`/`H`/`j` (base, brilho e sombra). Raiz do cabelo meio a meio: `r`/`R`/`q`.
  - Rosto: `e` olho, `l` reflexo da lente, `g` armação dos óculos, `d` sobrancelha, `m` boca.
  - `b` é a bochecha corada (Ellen) ou a barba (Fabio).
  - Roupa de cima: `c`/`C`/`Q` (base, sombra e brilho). `k` é a camada de dentro (blusa sob o jaleco, cordão do moletom). `u` são os ombros e `a`/`A` o braço; ficam com a cor da roupa ou da pele, conforme a manga.
  - Parte de baixo: `p`/`P`. `n`/`N` é a canela, com a cor da calça ou da pele (short).
  - Calçado: `f`/`F`. Curativo: `w`/`W`.
- **Transformações:**
  - **Cabelo meio a meio** (fase 1 e a fase do meio do prólogo): troque `h→r`, `H→R`, `j→q` nas linhas 0–6 das cabeças de lado e de frente, e nas linhas 0–5 da de costas.
  - **Curativo do Fabio do presente:** linhas 3 e 4 da cabeça viram `w` e `W`.
  - **Espelhamento:** para virar para o outro lado.
- **Estampas:**
  - Floral da camisa do Fabio na fase 1: pixel #8DB4EC onde `(x*5 + y*3) % 7 == 0`.
  - Canelado da blusa da Ellen na fase 1: colunas ímpares em #5089D2.
  - Rasgos do short dela: #DCE6F0 onde `(x*3 + y*7) % 11 == 0`.
- **O que já existe:**
  - Cabeças de lado, de frente e de costas da Ellen; de lado e de costas do Fabio; e uma de frente de homem genérico.
  - Corpos andando de lado (jaleco e moletom), sentado de lado e sentado de costas.
- **O que o Code cria, com as mesmas proporções e regras:**
  - A cabeça de frente do Fabio.
  - Corpos andando de frente e de costas, com o ciclo de 4 quadros em todas as direções.
  - As poses: deitado, nadando, remando, esquiando, posando para foto, beijando, assoprando velas etc.
  - Outros penteados: tranças, coque, rabo de cavalo.
  - Os NPCs, trocando a paleta.

### E.3 Moldes, paletas de exemplo e fonte

```js
// data/sprites.js — moldes 16×32 (cabeça de 15 linhas + corpo de 17), paletas e fonte
window.SPRITES = {
  HEAD_ELLEN_SIDE: [
    ".....oooooo.....",
    "...ooHHHhhhoo...",
    "..oHHHhhhhhhho..",
    ".oHHhhhhhhhhhho.",
    ".oHhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhjjjjjjo",
    "ohhhhhhhhjssggso",
    "ohhhhhhhhgggelso",
    "ohhhhhhhhjsgesso",
    "ohhhhhhhhjssggso",
    "ohhhhhhhhjsbssso",
    "ohhhhhhhhjSssmo.",
    "ojhhhhhhjjoSSo..",
    ".ojjjjjjSSooo...",
  ],
  HEAD_ELLEN_FRONT: [
    "....oooooooo....",
    "..ooHHHhhhhhoo..",
    ".oHHHhhhhhhhhho.",
    ".oHHhhhhhhhhhho.",
    "ohHhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohhjjjjjjjjjjhho",
    "ohhggggssgggghho",
    "ohhgleggggelghho",
    "ohhgsegssgesghho",
    "ohhggggssgggghho",
    "ohhbssssssssbhho",
    "ohjssssmmssssjho",
    "ohjjSssssssSjjho",
    "ojjjooSSSSoojjjo",
  ],
  HEAD_ELLEN_BACK: [
    "....oooooooo....",
    "..ooHHHhhhhhoo..",
    ".oHHHhhhhhhhhho.",
    ".oHHhhhhhhhhhho.",
    "ohHhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhjo",
    "ohhhhhhhhhhhhhjo",
    "ohhhhhhhhhhhhhjo",
    "ohhhhhjhhhhhhjjo",
    "ohhhhhjhhhhjhjjo",
    "ohjhhjjhhjhjjjjo",
    "ojjjjjjjjjjjjjjo",
    ".oooooSssSooooo.",
  ],
  HEAD_FABIO_SIDE: [
    ".....ooooooo....",
    "...ooHHhhhhhoo..",
    "..oHHhhhhhhhhho.",
    ".oHhhhhhhhhhhhho",
    ".ohhhhhhhhhhhhjo",
    ".ohhhhhhhhjsssso",
    ".ohhhhhhhjssddso",
    ".ohhhhosSjssesso",
    ".ohhhhosSjssesso",
    ".ohhhhosssssssSo",
    "..ohhhhosssssbbo",
    "...ooossssssmbo.",
    "......oSssssbbo.",
    ".......oSSSbbo..",
    ".......oSSooo...",
  ],
  HEAD_FABIO_BACK: [
    "....oooooooo....",
    "..ooHHHhhhhhoo..",
    ".oHHhhhhhhhhhho.",
    ".oHhhhhhhhhhhho.",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhjo",
    "osshhhhhhhhhhsso",
    "osShhhhhhhhhhSso",
    "osshhhhhhhhhhsso",
    ".oohhhhhhhhhhoo.",
    "..ohhhhhhhhhjo..",
    "..ojjjjjjjjjjo..",
    "...oossssssoo...",
    "....oSSSSSSo....",
  ],
  HEAD_MAN_FRONT: [
    "....oooooooo....",
    "..ooHHHhhhhhoo..",
    ".oHHhhhhhhhhhho.",
    ".oHhhhhhhhhhhho.",
    "ohhhhhhhhhhhhhho",
    "ohhhhhhhhhhhhhho",
    "ohssssssssssssho",
    "osssddssssddssso",
    "ossssessssesssso",
    "ossssessssesssso",
    "oSssssssssssssSo",
    "ossssssSSsssssso",
    ".osssssmmssssso.",
    "..ossssssssSso..",
    "...ooSSSSSSoo...",
  ],
  BODY_COAT_WALK: [
    "...occcccckko...",
    "..oQccCcccCkko..",
    "..oQccCcccCkko..",
    "..oQccCcccCcko..",
    "..oQccCcccCcko..",
    "..oQccCcccCcco..",
    "..oQccCcccCcco..",
    "..oQcccossocco..",
    "..oQccccoocccCo.",
    ".oQcccccccccCCo.",
    ".ooCCCCCCCCCCoo.",
    "...oppPo.oppPo..",
    "...oppPo.oppPo..",
    "...oppPo..oppPo.",
    "...offFo..offFFo",
    "....ooo....oooo.",
    "................",
  ],
  BODY_HOODIE_WALK: [
    "..occcccCkko....",
    ".oQccCcccCcko...",
    ".oQccCcccCcko...",
    ".oQccCcccCcco...",
    ".oQccCcccCcco...",
    ".oQccCcccCcco...",
    ".oQccCCCCCcco...",
    ".oQccossSocco...",
    ".oCCCCoooCCCo...",
    "..oppppppppo....",
    "..opppPoopppPo..",
    "..opppPoopppPo..",
    "..opppPo.opppPo.",
    "..opppPo.opppPo.",
    "..offfFo.offfFFo",
    "...oooo...ooooo.",
    "................",
  ],
  BODY_SIT: [
    "...oQcuuuuo.....",
    "..oQcaaaACco....",
    "..oQcaaaACco....",
    "..oQcaaaACco....",
    "..oQcAAAACco....",
    "..oQcossssssso..",
    "..oQcoSSSSSSSo..",
    "..oQccoooooooo..",
    "..oQccccCo......",
    "..oppppppppppo..",
    "..opppppppppPPo.",
    "..oPPPPPPPPnnno.",
    "...oooooooonnNo.",
    "..........onnNo.",
    "..........offFFo",
    "...........oooo.",
    "................",
  ],
  BODY_BACK_SIT: [
    "...ouuuuuuuuo...",
    "..ouuuuuuuuuuo..",
    ".oaAccccccccAao.",
    ".oaAccccccccAao.",
    ".oaAccccccccAao.",
    ".oaAccccccccAao.",
    ".ossCccccccCsso.",
    ".ossCccccccCsso.",
    ".oSSoccccccoSSo.",
    "..ooocCCCCcooo..",
    "....oppppppo....",
    "....oppppppo....",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  // capuz do moletom: [x, y, letra], aplicado só onde a cabeça é transparente
  HOOD_OVERLAY: [[3, 13, "o"], [4, 13, "o"], [5, 13, "o"], [6, 13, "o"], [2, 14, "o"], [3, 14, "Q"], [4, 14, "c"], [5, 14, "c"], [6, 14, "c"]],
};

window.PALETTES = {
  ELLEN_NOW: { C: "#C3CAD6", F: "#48424F", H: "#CCA468", P: "#1B1E2E", Q: "#FFFFFF", S: "#E2B19F", b: "#F2ABA3", c: "#F4F6F8", d: "#7A572B", e: "#3A2832", f: "#25222A", g: "#A3716A", h: "#A87E48", j: "#7A572B", k: "#2B2D3A", l: "#FFFFFF", m: "#C76C6C", p: "#2A2E44", s: "#F6D7C6" },
  FABIO_NOW: { C: "#AD811B", F: "#C2C6CE", H: "#4F4248", P: "#1B2440", Q: "#F0C552", S: "#A9714F", W: "#CFCFC5", b: "#2B201C", c: "#D9A62E", d: "#1E1512", e: "#1E1512", f: "#F4F4F2", g: "#2B201C", h: "#2B201C", j: "#140E0B", k: "#F2F0EA", l: "#FFFFFF", m: "#6E3828", p: "#2A3550", s: "#D19A72", w: "#F6F6F2" },
  FABIO_F1: { A: "#33599C", C: "#33599C", F: "#C2C6CE", H: "#4F4248", N: "#A9714F", P: "#C8C5BA", Q: "#6A98E0", S: "#A9714F", a: "#4778C6", b: "#2B201C", c: "#4778C6", d: "#1E1512", e: "#1E1512", f: "#F4F4F2", g: "#2B201C", h: "#2B201C", j: "#140E0B", k: "#4778C6", l: "#FFFFFF", m: "#6E3828", n: "#D19A72", p: "#F0EFEA", s: "#D19A72", u: "#4778C6" },
  ELLEN_F1: { A: "#E2B19F", C: "#3F6FB6", F: "#C2C6CE", H: "#FFF3C8", N: "#E2B19F", P: "#5A7AA6", Q: "#80B3EE", R: "#C99F63", S: "#E2B19F", a: "#F6D7C6", b: "#F2ABA3", c: "#5C94DC", d: "#7A572B", e: "#3A2832", f: "#F4F4F2", g: "#A3716A", h: "#F2D78E", j: "#D0AA5A", k: "#5C94DC", l: "#FFFFFF", m: "#C76C6C", n: "#F6D7C6", p: "#7A9CC4", q: "#7A572B", r: "#A87E48", s: "#F6D7C6", u: "#F6D7C6" },
};

// fonte 5×7 (maiúsculas e números com 7 linhas; minúsculas com 9, por causa das descendentes)
window.FONT = {
  "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  "C": [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  "G": [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "I": ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"],
  "J": ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  "N": ["#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"],
  "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".##.", "#..#", "#.##", "##.#", "#..#", "#..#", ".##."],
  "1": [".#.", "##.", ".#.", ".#.", ".#.", ".#.", "###"],
  "2": [".##.", "#..#", "...#", "..#.", ".#..", "#...", "####"],
  "3": ["###.", "...#", "...#", ".##.", "...#", "...#", "###."],
  "4": ["#..#", "#..#", "#..#", "####", "...#", "...#", "...#"],
  "5": ["####", "#...", "#...", "###.", "...#", "...#", "###."],
  "6": [".##.", "#...", "#...", "###.", "#..#", "#..#", ".##."],
  "7": ["####", "...#", "...#", "..#.", ".#..", ".#..", ".#.."],
  "8": [".##.", "#..#", "#..#", ".##.", "#..#", "#..#", ".##."],
  "9": [".##.", "#..#", "#..#", ".###", "...#", "...#", ".##."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
  "!": ["#", "#", "#", "#", "#", ".", "#"],
  "?": [".##.", "#..#", "...#", "..#.", ".#..", "....", ".#.."],
  "'": ["#", "#", ".", ".", ".", ".", "."],
  ":": [".", ".", "#", ".", ".", ".", "#"],
  "·": [".", ".", ".", "#", ".", ".", "."],
  "/": ["...#", "..#.", "..#.", ".#..", ".#..", "#...", "#..."],
  "-": ["...", "...", "...", "###", "...", "...", "..."],
  "a": [".....", ".....", ".###.", "....#", ".####", "#...#", ".####", ".....", "....."],
  "b": ["#....", "#....", "####.", "#...#", "#...#", "#...#", "####.", ".....", "....."],
  "c": ["....", "....", ".###", "#...", "#...", "#...", ".###", "....", "...."],
  "d": ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####", ".....", "....."],
  "e": [".....", ".....", ".###.", "#...#", "#####", "#....", ".###.", ".....", "....."],
  "f": ["..##", ".#..", "####", ".#..", ".#..", ".#..", ".#..", "....", "...."],
  "g": [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", ".###."],
  "h": ["#....", "#....", "####.", "#...#", "#...#", "#...#", "#...#", ".....", "....."],
  "i": ["#", ".", "#", "#", "#", "#", "#", ".", "."],
  "j": ["..#", "...", "..#", "..#", "..#", "..#", "..#", "..#", "##."],
  "k": ["#...", "#...", "#..#", "#.#.", "##..", "#.#.", "#..#", "....", "...."],
  "l": ["#.", "#.", "#.", "#.", "#.", "#.", ".#", "..", ".."],
  "m": [".....", ".....", "####.", "#.#.#", "#.#.#", "#.#.#", "#.#.#", ".....", "....."],
  "n": ["....", "....", "###.", "#..#", "#..#", "#..#", "#..#", "....", "...."],
  "o": [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###.", ".....", "....."],
  "p": [".....", ".....", "####.", "#...#", "#...#", "#...#", "####.", "#....", "#...."],
  "q": [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", "....#"],
  "r": ["....", "....", "#.##", "##..", "#...", "#...", "#...", "....", "...."],
  "s": ["....", "....", ".###", "#...", ".##.", "...#", "###.", "....", "...."],
  "t": [".#..", ".#..", "####", ".#..", ".#..", ".#..", "..##", "....", "...."],
  "u": ["....", "....", "#..#", "#..#", "#..#", "#..#", ".###", "....", "...."],
  "v": [".....", ".....", "#...#", "#...#", "#...#", ".#.#.", "..#..", ".....", "....."],
  "w": [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#.", ".....", "....."],
  "x": [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", ".....", "....."],
  "y": ["....", "....", "#..#", "#..#", "#..#", "#..#", ".###", "...#", "###."],
  "z": ["....", "....", "####", "...#", "..#.", ".#..", "####", "....", "...."],
  ",": ["..", "..", "..", "..", "..", "..", ".#", ".#", "#."],
};
```
