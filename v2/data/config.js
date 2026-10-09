// =====================================================================
//  MEMORIES FROM THE FUTURE — configuração
//
//  Tudo o que o Fabio pode querer mudar fica aqui: textos, pistas,
//  senhas, datas, legendas e dificuldade. Nada disso fica no código.
//
//  Formato das falas: "NOME: fala". Os nomes reconhecidos estão em
//  `speakers` (a aba da caixa de diálogo usa a cor de cada um).
//  NARRATOR aparece sem aba e em itálico. Linhas entre colchetes,
//  como "[memoryFull]", são ações do jogo e não aparecem na tela.
//
//  Os textos do jogo estão em inglês britânico.
// =====================================================================
window.GAME_CONFIG = {

  title: {
    name: "MEMORIES FROM THE FUTURE",
    subtitle: "a game by Fabio, for Ellen",
    start: "Start"   // a única opção: começa o jogo do início (sem Continue)
  },

  pause: { title: "PAUSED", hint: "Press Esc to continue" },

  notices: { soundOn: "SOUND ON", soundOff: "SOUND OFF" },

  // volume geral, de 0 a 1 (a tecla M liga e desliga o som)
  audio: { volume: 0.6 },

  text: {
    charsPerSecond: 45,   // velocidade do texto letra por letra
    toastSeconds: 3       // quanto tempo a fala de entrada do cenário fica na tela depois de escrita
  },

  difficulty: {
    // V2: a tela é 1,25× maior que a da V1 (480×270), então tudo o que está em px é o da V1 × 1,25
    // (alcance 72 → 90, andar 60 → 75, correr 110 → 137,5). Os tempos são os mesmos.
    coneHalfAngleDeg: 30, coneLength: 90,              // cone de visão padrão (meia-abertura em graus, alcance em px)
    coneRays: 24,                                      // raios por cone (o cone é cortado por paredes e móveis altos)
    // estágios de suspeita (0 a 3) por segundo. O SPEC sugeria subir 1.0/s, mas assim ninguém é pega
    // no F1 A1 nem parada no corredor (a varredura nunca fica 3 s seguidos em cima dela).
    // Com 2.0: esperar a janela é seguro, passar na hora errada dá um susto ("??!!") e quem hesita é pega.
    suspicionUpPerSec: 2.0, suspicionDownPerSec: 0.5,
    walkSpeed: 75, runSpeed: 137.5,                    // velocidade da Ellen, em px por segundo
    caughtPause: 0.5,                                  // ao ser pega: pausa curta antes do flash (s)
    caughtLineSeconds: 1.4                             // quanto tempo a fala do Fabio fica na tela depois de escrita (s)
  },

  // atalhos de teste (só para o Fabio): menu de teste e atalho de emergência
  debug: { menuKeys: "Ctrl+Shift+D", skipKeys: "Ctrl+Shift+K" },

  // quem fala: nome na aba e cor da aba (Apêndice E.1)
  speakers: {
    "ELLEN":          { name: "Ellen",          color: "#F4F6F8" },
    "FABIO":          { name: "Fabio",          color: "#D9A62E" },
    "TONY":           { name: "Tony",           color: "#8A5A3C" },
    "HEYMANS":        { name: "Heymans",        color: "#4E8A5A" },
    "BIG JIMMY JUNK": { name: "Big Jimmy Junk", color: "#D8443A" },
    "TONY & HEYMANS": { name: "Tony & Heymans", color: "#6B7244" },
    "MACHINE":        { name: "Machine",        color: "#2FB8A6" },
    "NARRATOR":       { tab: false, italic: true, textColor: "#CFC8E8" }
  },

  // Fases 1 a 4. Os nichos (`niche`) servem só para o Fabio se organizar; o jogo não os mostra.
  // chest.icon é o desenho do item no cartão do baú: revolver, mounjaro, ammo ou ring.
  // Respostas: o jogo ignora maiúsculas, acentos, espaços e pontuação.
  stages: [
    {
      id: 1, title: "The First Date",
      scenes: [
        { code: "F1A1", date: "16/08/2025", title: "Okonomiyaki", line: { who: "Ellen", text: "This was our first date. You prepared the best okonomiyaki." },
          sign: "OKONOMIYAKI" },   // placa na parede do restaurante
        { code: "F1A2", date: "16/08/2025", title: "Ice cream at Mirai Tower", line: { who: "Ellen", text: "We came to have ice cream as dessert, and a good view." } },
        { code: "F1B1", date: "16/08/2025", title: "Iced tea at the café", line: { who: "Fabio", text: "Iced tea... The conversation seems to be going so well." },
          windowText: "Une tasse de bonheur" },   // letreiro dourado (genérico) no vidro do café
        { code: "F1B2", date: "16/08/2025", title: "Planetarium", line: { who: "Ellen", text: "This was where we had our first kiss." } },
        { code: "F1C1", date: "16/08/2025", title: "Dinner at Saizeriya", line: { who: "Ellen", text: "It was the first time I'd been to Saizeriya." } },
        { code: "F1C2", date: "16/08/2025", title: "A kiss in the park", line: { who: "Fabio", text: "So many mosquit... Wait... are they...? OMG!" } }
      ],
      chest: { item: "OLD REVOLVER", icon: "revolver", text: "You found an OLD REVOLVER. It looks completely useless. Better keep it anyway." },
      memoryLine: "Okonomiyaki, a tower, a kiss in the park... I remember our first date!",
      anomaly: { niche: "A16", clue: "The day it all began.", answers: ["HOKKAIDO", "HOKAIDO", "OFFICE", "WORK", "JOB"] }
    },
    {
      id: 2, title: "Late Summer",
      scenes: [
        { code: "F2A1", date: "24/08/2025", title: "Beach day", line: { who: "Fabio", text: "The sea! I think they are having so much fun." } },
        { code: "F2A2", date: "24/08/2025", title: "Shaved ice by the sea", line: { who: "Fabio", text: "Pink shaved ice. Is that my favourite?" } },
        { code: "F2B1", date: "30/08/2025", title: "Cinema: Kimetsu no Yaiba", line: { who: "Ellen", text: "Movie time! We came to watch an anime movie." },
          boothText: "TICKETS" },   // placa da bilheteria
        { code: "F2B2", date: "30/08/2025", title: "Cinema: popcorn", line: { who: "Fabio", text: "What a great smell! Popcorn. Large. Obviously." } },
        { code: "F2C1", date: "05/09/2025", title: "Corona days", line: { who: "Fabio", text: "Poor guy. And an angel looking after him." } },
        { code: "F2C2", date: "06/09/2025", title: "Brazilian Day", line: { who: "Fabio", text: "I smell BBQ... and Guaraná!" },
          stall1: "Pastel", stall2: "Coxinha", stall3: "Guaraná" }   // placas das barracas
      ],
      chest: { item: "MOUNJARO", icon: "mounjaro", text: "You found MOUNJARO. \"Reduces cravings.\" Might come in handy." },
      memoryLine: "The beach, the cinema... you looking after me when I was ill. I remember!",
      anomaly: { niche: "B27", clue: "3³", answers: ["BRAZIL", "BRASIL", "RIO", "RIODEJANEIRO"] }
    },
    {
      id: 3, title: "Through the Seasons",
      scenes: [
        { code: "F3A1", dates: ["04/11/2025", "27/11/2025"], title: "Birthdays",
          lines: [{ who: "Fabio", text: "My birthday! The One Piece party!" },
                  { who: "Fabio", text: "Your birthday. Pizza AND cake. Respect." }],
          banner: "HAPPY BIRTHDAY" },   // faixa na cozinha do aniversário do Fabio
        { code: "F3A2", date: "06/12/2025", title: "Shirakawa-go", line: { who: "Fabio", text: "Snow on the roofs. It looks like a fairy tale." } },
        { code: "F3B1", date: "31/01/2026", title: "Ski trip", line: { who: "Fabio", text: "Me? Skiing? Gracefully, I hope." } },
        { code: "F3B2", date: "01/03/2026", title: "BBQ with friends", line: { who: "Fabio", text: "The smell is amazing! They are having so much fun." } },
        { code: "F3C1", date: "28/03/2026", title: "Himeji Castle", line: { who: "Fabio", text: "A white castle and cherry blossoms. Unreal." } },
        { code: "F3C2", date: "29/03/2026", title: "Nara", line: { who: "Fabio", text: "Careful. The deer here mean business." } }
      ],
      chest: { item: "AMMO ×5", icon: "ammo", text: "You found AMMO ×5. Five bullets. Make them count." },
      memoryLine: "Birthdays, snow, cherry blossoms... We did so much together.",
      anomaly: { niche: "F92", clue: "My initial. The year I was born.", answers: ["AUSTRALIA", "KANGAROO", "SYDNEY"],
                 extra: "Note: this memory hasn't happened... yet." }
    },
    {
      id: 4, title: "Islands, Rings & Lanterns",
      scenes: [
        { code: "F4A1", date: "26/04/2026", title: "Zoo", line: { who: "Fabio", text: "Lions, elephants... and us." },
          signs: "Pandas →|Penguins ←|Zebras →",               // placa com setas (uma linha por "|")
          stand1: "Ice cream", stand2: "Crêpes", stand3: "Takoyaki" },   // barraquinhas
        { code: "F4A2", date: "03/05/2026", title: "Okinawa aquarium", line: { who: "Ellen", text: "You made one of my dreams come true." } },
        { code: "F4B1", date: "04/05/2026", title: "Diving in Okinawa", line: { who: "Fabio", text: "Diving! Looks so fun... So many fish!" } },
        { code: "F4B2", date: "13/06/2026", title: "Making our rings", line: { who: "Fabio", text: "Rings? Why does this feel important?" } },
        { code: "F4C1", date: "13/08/2026", title: "Yanai Goldfish Lantern Festival", line: { who: "Ellen", text: "We travelled for hours to come to my favourite festival." } },
        { code: "F4C2", date: "15/08/2026", title: "Tottori Sand Dunes", line: { who: "Ellen", text: "One of our happiest moments." } }
      ],
      chest: { item: "MYSTERIOUS RING", icon: "ring", text: "You found a MYSTERIOUS RING. It sparkles. It feels... important." },
      memoryLine: "Okinawa, the rings, the lanterns, the dunes... It's all coming back.",
      anomaly: { niche: "E73", clue: "Your initial. Your favourite numbers.", answers: ["LONDON", "LONDONEYE", "FERRISWHEEL"] }
    }
  ],

  // Fase 5, a livraria-café. A data do HUD vem do relógio do computador.
  shop: { title: "Here and Now", hudTitle: "Here and now" },

  texts: {

    // cartão de cada fase: "STAGE 1 — The First Date"
    stageCard: "STAGE {n} — {title}",

    prologue: {
      // Cena 1 — lanchonete de fast-food à noite, letreiro neon "JIMMY'S JUNK PALACE"
      fastfood: [
        "NARRATOR: Nagoya. An ordinary night.",
        "FABIO: Just one burger. Then I'm going home to Ellen.",
        "[villainArrives]",          // as luzes piscam e o Big Jimmy Junk aparece
        "[face:fabio:right]",
        "BIG JIMMY JUNK: Just one? Nobody stops at just one!",
        "[smell]",                   // ondas de cheiro de fritura
        "BIG JIMMY JUNK used TEMPTATION!",
        "FABIO: My... memories... smell like... chips...",
        "[pose:fabio:lie:left]",     // o Fabio desmaia
        "[shake]",
        "NARRATOR: Fabio fell into a deep food coma. When he woke up, he couldn't remember anything. Not even her."
      ],
      neonSign: "JIMMY'S JUNK PALACE",

      // Cena 2 — o apartamento
      apartment: [
        "FABIO: Sorry... have we met?",
        "ELLEN: ...",
        "ELLEN: Right. I'm going to fix this."
      ],

      // Cena 3 — o laboratório (Ellen de cabelo platinado dourado)
      lab1: [
        "ELLEN: Professor Robinson, I need your help. I'm building a time machine.",
        "TONY: Of course you are. Let's start with the maths.",
        "ELLEN: I brought these too. Dr King's old notes. They might help.",
        "TONY: Barry's notes... He'd be proud of you, Ellen."
      ],
      card1: "Some years later...",       // Ellen com o cabelo meio a meio
      lab2: [
        "TONY: Good news: the machine works.",
        "TONY: Bad news: the test subjects did not enjoy the trip.",
        "ELLEN: Then we need someone who understands living things. I know exactly who to call.",
        "[show:heymans]",            // a professora Heymans chega
        "HEYMANS: Ellen! My favourite student. So... you need a human to survive time travel?",
        "ELLEN: Two humans, actually."
      ],
      card2: "Some more years later...",  // Ellen com o cabelo todo loiro-escuro
      lab3: [
        "HEYMANS: Biology: sorted.",
        "TONY: Maths: checked. Twice.",
        "TONY: Listen carefully. Once you're inside, we can't reach you.",
        "TONY: Your past selves must not see you. Stay out of their sight. If they spot you, time will push you back.",
        "TONY: Arrows or WASD to move. Shift to run. Space to interact.",
        "TONY: Every memory you put back will bring a piece of him home.",
        "HEYMANS: Bring him back, Ellen.",
        "TONY & HEYMANS: Good luck!",
        "ELLEN: Come on, you. We're going on a trip.",
        "FABIO: Do I... know you?",
        "ELLEN: Not yet. You will."
      ],
      // depois que a jogadora anda até a máquina e aperta Espaço
      machine: [
        "MACHINE: DESTINATION: 16 AUGUST 2025."
      ]
    },

    // chegada ao passado, antes do F1 A1
    arrival: [
      "FABIO: Where are we?",
      "ELLEN: Our first date. Stay close, and don't let them see us.",
      "FABIO: Them?",
      "FABIO: Is that... me? I look great."
    ],

    // ao ser pega: uma fala sorteada do Fabio do presente
    caught: [
      "That was close. Too close.",
      "They almost saw us!",
      "Time says no. Again!",
      "Maybe try not to wave at them?"
    ],
    caughtPhoto: "Photobomb detected!",   // só no F4 C2, se for pega na zona da foto

    // tela da máquina do tempo (anomalia)
    machine: {
      title: "TIMELINE ANOMALY DETECTED",
      body: [
        "Our trip through time has changed one of your memories.",
        "Somewhere on the bookshelf, a photo album holds the proof:",
        "one photo shows something that never happened."
      ],
      clueLabel: "FIND THE ALBUM:",
      inputLabel: "ENTER THE ANOMALY:",
      wrong: "ANOMALY NOT RECOGNISED. LOOK AGAIN.",
      right: "ANOMALY CONFIRMED. TIMELINE REPAIRED."
    },

    // fase 5, a livraria-café
    shop: [
      "ELLEN: Wait. Where are we? This isn't one of our memories.",
      "FABIO: No... but I know this place. The books, the shelf... I've been here. Today.",
      "FABIO: Argh! My head!",
      "ELLEN: Fabio!",
      "[memoryFull]",        // a barra de memória enche até 100%, com o jingle
      "FABIO: I remember. Everything. You. Us. All of it.",
      "[villainArrives]",    // as luzes piscam e entram ondas de cheiro de fritura
      "BIG JIMMY JUNK: Not so fast! A memory like that is far too healthy.",
      "BIG JIMMY JUNK: I'll take him back... with a side of fries!"
    ],

    battle: {
      villain: "BIG JIMMY JUNK",
      level: "Lv. 99",
      intro: "BIG JIMMY JUNK wants to supersize you!",
      temptation: [
        "BIG JIMMY JUNK used TEMPTATION! The smell of fresh chips fills the room...",
        "Ellen is TEMPTED! Her hands are shaking."
      ],
      menu: { prompt: "What will Ellen do?", shoot: "SHOOT", bullets: "BULLETS: {n}", item: "ITEM", mounjaro: "MOUNJARO", ring: "MYSTERIOUS RING" },
      // tiro errado (sorteado)
      miss: [
        "Missed! Ellen is thinking about chips.",
        "The bullet hit a fry soldier. It didn't even notice.",
        "Missed! Was that a milkshake?",
        "So close! The smell is too strong."
      ],
      // provocação do vilão depois de um erro (sorteada)
      taunt: [
        "BIG JIMMY JUNK: Go on, have a bite!",
        "BIG JIMMY JUNK: Would you like fries with that?"
      ],
      mounjaro: "Ellen used MOUNJARO! Cravings: gone. Focus: restored.",
      transform: [
        "BIG JIMMY JUNK: What?! You dare refuse me?!",
        "BIG JIMMY JUNK: I am the king of grease! The lord of late-night snacks!",
        "BIG JIMMY JUNK: Every midnight craving, every \"just one more\"... that was ME!",
        "BIG JIMMY JUNK: Behold my final form...",
        "BIG JIMMY JUNK: SUPER... SIZE!!!",
        "BIG JIMMY JUNK became SUPERSIZE!"
      ],
      finalShot: ["...", "BANG.", "Big Jimmy Junk was defeated with a single shot."],
      victory: [
        "FABIO: We could've done that from the start?",
        "ELLEN: Where's the fun in that?"
      ],
      ring: "Ellen looks at the ring... \"Not here. Not yet.\"",
      defeat: [
        "BIG JIMMY JUNK used COMBO MEAL! It's super effective!",
        "Ellen fainted..."
      ],
      retry: "Try again?"
    },

    ending: {
      lines: [
        "FABIO: Ellen... thank you for bringing me back.",
        "FABIO: There's one memory left. It hasn't happened yet.",
        "FABIO: It's waiting for you on the second floor."
      ],
      won: "YOU WON.",
      next: "Now... go to the second floor."
    }
  }
};
