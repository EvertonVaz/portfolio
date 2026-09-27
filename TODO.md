# TODO

## Deploy / Produção

- [ ]

## Segurança

- [x] Decidir destino do `{:joken, "~> 2.6"}` no `mix.exs` — dependência sem uso desde o refactor `30ed25e`; removida
- [ ] verificar se exsiste algum alguma divida tecnica no projeto

## Frontend


## Conteúdo (pivot do portfolio)

- [ ] Considerar cards externos no `/work` (GitHub dos projetos da 42, por exemplo)
- [ ] Criar um devlog para todos os projetos do labs.playground
- [ ] Criar um projeto para o portfolio que valide minhas skills de RAG / LLMs

## Sincronização career-mcp ↔ portfolio

Fonte canônica: `career.yml` (career-mcp). Legenda: **→P** corrigir portfolio · **→C** corrigir career.yml · **?** decidir antes.
Toda mudança de copy vale para `pt` **e** `en` no `src/i18n.js`.

### Parte 0 — Decisões (bloqueiam o resto)

- [x] Fatos que só existem no portfolio ("100 mil certificados", "SCORM") → **saem do site**
- [x] Stat de experiência → **4+ anos** (dev em tempo integral desde 2022)
- [x] Nomes das empresas (Tribo Teen, DentalBolt etc.) → **podem ser citados**
- [x] Faculdade de Administração (Pitágoras, 2013–2017) → **entra na `/journey`**

### Parte 1 — Home / hero (`i18n.js` `hero.*`, `HeroCards.jsx`)

- [x] **→P** `hero.professional_desc` cita só Despertar, LTI e certificadora: incluir Rediplast (atual) e alinhar ao headline do career (full-stack, Python · TypeScript · Go, integrações e tempo real)
- [x] **→P** Stat de anos de experiência conforme decisão da Parte 0
- [x] **→P** Labels dos stats (`anos exp`, `são paulo`, `curiosidade`) estão hardcoded em PT — aparecem em PT no site em inglês

### Parte 2 — Journey (`journey.releases.*`, `JourneyPage.jsx`)

- [x] **→P** v30 (2022): site diz que o scraper pega "preços, imagens, descrições"; career diz só preços, com regra de 2% abaixo do concorrente, FastAPI + GitHub Actions, em produção desde 2022
- [x] **→P** v35 (42): "Tudo em C" — career tem C++ (webserv), Docker (inception), Python/ML (ft_linear_regression) e GenAI (chatbot RAG)
- [x] **→P** v40 (Despertar): tirar SCORM; alinhar ao career (Metabase com JWT, integração Kaits, empregabilidade, planos de aula, CI)
- [x] **→P** v45 (EmpreendaLab): tirar "100 mil certificados"; alinhar ao career (AGS, créditos com Stripe + BullMQ, RBAC, E2E com Playwright)
- [x] **→P** Nova release para a faculdade de Administração (Pitágoras, 2013–2017), entre v1.x e v2.0
- [x] **→P** Citar Tribo Teen (v1.0/v1.x) e DentalBolt (v3.0) pelo nome
- [x] **→P** v50 "hoje": não menciona Rediplast (freelance atual, desde 09/2026), Juno nem career-mcp. Criar release nova (v5.5?) ou reescrever a v50
- [x] **→P** Tags do `RELEASES` em `JourneyPage.jsx` seguem a copy nova
- [x] **→P** `HomeTeasers.jsx` (`tail -3 journey.log`) aponta para as 3 últimas releases: atualizar se entrar release nova

### Parte 3 — Work (`work.cases.*`, `Work.jsx`)

- [x] **→P** Faltam os 3 destaques do career (`highlight: true`): Juno, career-mcp, portfolio. E a experiência Rediplast
- [x] **→P** c01 "BI de Varejo": atribui Python/Postgres ao app de BI; no career o BI é Power BI (M/DAX) e Python/Postgres é o DW (c02)
- [x] **→P** c03 "Monitor de Preços": mesma correção da v30
- [x] **→P** c04 e c05: mesmas correções de v40 e v45
- [x] ~~**?** Projetos da 42 sem demo~~ → **não entram por enquanto** (webserv, cub3d, inception, ft_linear_regression, chatbot RAG, Amparo) viram card? Resolve junto o item "cards externos" acima
- [ ] Dívida: `ProjectCard` com `type: 'external'` renderiza `<button>` sem link — card não consegue apontar pra repo externo

### Parte 4 — Labs e demos (`work.projects.*`, páginas das demos)

- [x] **→P** p04 Pong: diz "modelo DQN"; career, `pong.intro` e o devlog dizem Algoritmo Genético + PPO. DQN não existe no projeto
- [x] **→P** `pong.intro` cita só o Algoritmo Genético; mencionar o PPO (que é o que vence)
- [x] **→P** p02 Fractal: diz "HTML5 Canvas"; a própria página diz WebGL/shaders GLSL
- [x] **→P** p03 Philosophers: "resolvendo deadlock com GenServers" — no career o anti-deadlock é ordem par/ímpar de garfos com mutex em C; o GenServer só supervisiona e transmite
- [x] **→P** Terminal: `terminal.remote_commands` lista `ls`, `pwd`, `cat`, `whoami`, mas desde `6fc52d3` só `echo`, `date`, `help` e `about` existem (em Elixir, sem minishell). `lab_description` e a arquitetura ainda dizem que executa o minishell
- [x] **→P** Incluir notas da 42 onde couber (fractol 125, philosophers 125, minishell 116)
- [x] Fractal: rodapé citava MiniLibX; o career diz MLX42
- [x] Terminal refeito após o restore `bd87bb5`: comandos remotos voltam a ser `ls`, `pwd`, `echo`, `cat`, `exit`, `whoami` (emulados em Elixir, filesystem virtual)
- [x] Filesystem virtual do terminal: `about.txt` diz "estudante da 42" (formado em 2024); `projects.txt` e `contact.txt` não refletem o career → resolvido no home da jaula (S1)
- [ ] Dívida: `mix test` sobe o endpoint na porta 4000, a mesma do `make back` — com o dev rodando, a suíte falha com `:eaddrinuse` (contorno: `PORT=4099 mix test`)

### Parte 5 — career.yml (via career-mcp)

- [x] **→C** Projeto `portfolio`: "demos do terminal e dos filósofos executam binários via Port" — o terminal não executa mais o minishell desde `6fc52d3`
- [x] **→C** Projeto `portfolio`: "68 testes em Elixir" — contagem atual é 65
- [x] **→C** Projeto `portfolio`: incluir o explorador de fractais em WebGL (não aparece no career)
- [x] **→C** `mark_verified` nas skills que o portfolio comprova: Elixir, Phoenix, React, PyTorch, Machine Learning, RabbitMQ
- [x] **→C** Revisar as outras 3 skills não verificadas: RAG / LLMs, ChromaDB, Clean Architecture / DDD

### Parte 6 — Fechamento

- [x] Rodar `validate_all` e `diff_channels` no career-mcp (resume, LinkedIn e portfolio `current`)
- [ ] Revisão visual do site em PT e EN, página por página

