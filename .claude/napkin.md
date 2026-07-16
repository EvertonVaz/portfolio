# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execução & Validação (Maior Prioridade)

1. **[2026-06-26] Build do frontend antes de subir nginx**
   Do instead: rodar `make front-build` antes de `docker-up`; o nginx serve de `app/frontend/dist`, que só existe após o build.

2. **[2026-06-26] Variáveis de ambiente vêm de `envs/.env.production`**
   Do instead: verificar/editar `envs/.env.production` antes de subir qualquer serviço Docker; ambos os containers (dev e nginx) carregam esse arquivo.

3. **[2026-06-26] Backend Elixir não usa Phoenix — usa Bandit direto**
   Do instead: ao criar rotas/controllers, seguir o padrão Bandit + WebSock; não procurar `router.ex` do Phoenix nem usar `Phoenix.Router`.

4. **[2026-07-16] Produção: compose em `docker/production/`, envs via Coolify**
   Do instead: `make docker-up` usa `docker/production/docker-compose.yml`; exige `SECRET_KEY_BASE` no ambiente. Backend roda em debian-slim (nunca alpine: `minishell`/`philosophers` são binários glibc pré-compilados). AI instala torch CPU-only via índice do PyTorch antes das deps (evita ~5GB de wheels CUDA do uv.lock). Pendências: `pong_ai/models/dqn.pt` não existe (AI cai em rule-based) e auth do terminal é token estático (JWT antigo no commit 5f62285).

## Shell & Comandos Úteis

1. **[2026-06-26] Makefile como ponto de entrada**
   Do instead: usar `make front` (Vite dev), `make back` (Elixir), `make build` (prod), `make test` (mix test), `make docker-up/down/logs`.

2. **[2026-06-26] Dev container monta volume em `/src`**
   Do instead: dentro do container dev, o projeto fica em `/src`; usar esse path ao executar comandos via `docker compose exec dev`.

## Arquitetura do Frontend

1. **[2026-06-26] Frontend sem lógica de negócio — REGRA ABSOLUTA**
   Do instead: frontend é só UI e orquestração de chamadas; validações, cálculos, regras e decisões de domínio vivem no backend Elixir. Se sentir vontade de escrever lógica de negócio no React, mover para o backend.

2. **[2026-06-26] Módulos por feature em `src/modules/`**
   Do instead: criar novo código em `app/frontend/src/modules/<nome-do-modulo>/`; os módulos existentes são: `fractal`, `home`, `philosophers`, `portfolio`, `terminal`.

2. **[2026-06-26] Tailwind v4 — configuração via Vite plugin**
   Do instead: não procurar `tailwind.config.js`; v4 configura via `@tailwindcss/vite` no `vite.config.js` e diretivas CSS.

3. **[2026-06-26] WebSocket via STOMP (`@stomp/stompjs`)**
   Do instead: comunicação realtime usa protocolo STOMP sobre WebSocket; backend Elixir trata via `WebSock`/`websock_adapter`.

4. **[2026-06-26] i18n ativo — textos via `react-i18next`**
   Do instead: novos textos de UI devem usar `useTranslation()` e adicionar chaves nos arquivos de tradução; não hardcodar strings em português/inglês diretamente no JSX.

## Arquitetura do Backend

1. **[2026-06-26] Dois projetos Elixir em `app/backend/elixir/`**
   Do instead: verificar `lib/portfolio/` (lógica de negócio) e `lib/portfolio_web/` (HTTP/WebSocket handlers) ao navegar no backend.

2. **[2026-06-26] JWT via Joken**
   Do instead: autenticação/autorização usa `joken`; ao debugar tokens, checar módulos em `lib/portfolio/` relacionados a Joken.

## Diretivas do Usuário

1. **[2026-06-26] Sem resumo no final das respostas**
   Do instead: terminar respostas sem "Pronto!", "Feito!" ou recapitulação do diff.

2. **[2026-06-26] Commit em inglês, imperativo, sem co-autoria**
   Do instead: `git commit -m "Add feature X"` — sem `Co-Authored-By`.

3. **[2026-06-26] Sem over-engineering — escopo exato do pedido**
   Do instead: implementar exatamente o que foi solicitado; não adicionar abstrações, helpers ou features extras.
