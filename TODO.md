# TODO

## Deploy / Produção

- [ ] Passar `PORTFOLIO_VERSION` como build arg no `backend.Dockerfile` — o `mix.exs` lê em build time; hoje a release sai como `0.1.0`

## Segurança

- [ ] Decidir destino do `{:joken, "~> 2.6"}` no `mix.exs` — dependência sem uso desde o refactor `30ed25e`; reusar na tarefa acima ou remover

## Frontend

- [ ] Limpar os 25 erros de ESLint pré-existentes (imports não usados, `motion` em JSX member expression, `__dirname` no vite.config)
- [ ] Avaliar code splitting — bundle principal com ~540 kB minificado (warning do Vite); `React.lazy` nas rotas de demo resolveria
- [ ] Suavizar o scroll duplo na âncora do `/journey` se incomodar — re-alinhamento de 400ms na `JourneyPage` corrige o undershoot do HashLink

## Conteúdo (pivot do portfolio)

- [ ] Revisar copy do `/journey` em inglês com olhar de falante nativo
- [ ] Considerar cards externos no `/work` (GitHub dos projetos da 42, por exemplo)
