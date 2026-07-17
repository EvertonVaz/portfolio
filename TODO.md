# TODO

## Deploy / Produção

- [ ] Configurar envs no Coolify: `SECRET_KEY_BASE` (obrigatória), `RABBITMQ_USER`/`RABBITMQ_PASS`, `PORTFOLIO_VERSION` — referência em `envs/.env.production`
- [x] ~~Modelo da AI~~ — resolvido: `main.py` agora carrega `ppo.pt`/`es.pt` diretamente
- [ ] Garantir que `pong_ai/models/*.pt` chegue ao build de produção — o diretório não está no git; o Coolify builda a partir do repo, então a imagem da AI subiria sem modelos (fallback rule-based). Commitar os `.pt` (são <10 kB) ou baixá-los no build
- [ ] Passar `PORTFOLIO_VERSION` como build arg no `backend.Dockerfile` — o `mix.exs` lê em build time; hoje a release sai como `0.1.0`

## Segurança

- [ ] Restaurar auth JWT no websocket do terminal — `Portfolio.Auth` valida token estático hardcoded (`valid-terminal-token`), visível no bundle do frontend; implementação Joken antiga de referência no commit `5f62285` (usava `AUTH_SECRET_KEY`, HS256, expiração 1h)
- [ ] Decidir destino do `{:joken, "~> 2.6"}` no `mix.exs` — dependência sem uso desde o refactor `30ed25e`; reusar na tarefa acima ou remover

## Frontend

- [ ] Limpar os 25 erros de ESLint pré-existentes (imports não usados, `motion` em JSX member expression, `__dirname` no vite.config)
- [ ] Avaliar code splitting — bundle principal com ~540 kB minificado (warning do Vite); `React.lazy` nas rotas de demo resolveria
- [ ] Suavizar o scroll duplo na âncora do `/journey` se incomodar — re-alinhamento de 400ms na `JourneyPage` corrige o undershoot do HashLink

## Conteúdo (pivot do portfolio)

- [ ] Revisar copy do `/journey` em inglês com olhar de falante nativo
- [ ] Considerar cards externos no `/work` (GitHub dos projetos da 42, por exemplo)
