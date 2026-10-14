SHELL := /bin/bash
.DEFAULT_GOAL := help

ifneq (,$(wildcard .env))
include .env
endif

ifneq (,$(wildcard envs/.env.pong))
include envs/.env.pong
endif

export

COMPOSE := docker compose

.PHONY: help all env deps build front-build back-build test front back ai \
	train-ppo train-ga train-ga-fresh train-server rabbitmq up-dev \
	release docker-up docker-down docker-logs sandbox-test lint

help: ## Lista os comandos disponíveis
	@echo "Comandos:"
	@grep -hE '^[a-z][a-zA-Z0-9_-]*:.*##' $(MAKEFILE_LIST) \
	  | sed -E 's/:.*## /|/' \
	  | awk -F'|' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

all: help

# ── ambiente ─────────────────────────────────────────────────────────────────

env:
	@test -f .env || { \
	  echo ".env não existe. Local: cp .env.example .env && echo \"PROJECT_DIR=$$PWD\" >> .env"; \
	  echo "Servidor (Coolify): as variáveis vêm do painel, não de .env."; \
	  exit 1; }

# O compose do dev só funciona empilhado no da raiz: sozinho, a pasta do
# projeto vira .devcontainer/ e o .env e os caminhos relativos somem.
up-dev: env ## Sobe o container de desenvolvimento
	@$(COMPOSE) -f docker-compose.yml -f .devcontainer/docker-compose.yml up -d dev

# ── dependências e build ─────────────────────────────────────────────────────

deps: ## Instala as dependências do front, Elixir e Python
	@cd ./app/frontend && npm install
	@cd ./app/backend/elixir && mix deps.get
	@cd ./app/backend/python && uv sync

build: front-build back-build ## Compila front e back

front-build: ## Compila o frontend
	@cd ./app/frontend && npm run build

back-build: ## Gera o release Elixir de produção
	@cd ./app/backend/elixir && MIX_ENV=prod mix release --overwrite

# ── desenvolvimento ──────────────────────────────────────────────────────────

test: ## Roda os testes do backend Elixir com cobertura
	@cd ./app/backend/elixir && mix test --cover

front: ## Sobe o frontend em modo dev, exposto na rede
	@clear && cd ./app/frontend && npm run dev -- --host

back: ## Sobe o backend Elixir
	@clear && cd ./app/backend/elixir && mix run --no-halt

ai: ## Sobe o serviço de IA em Python
	@clear && cd ./app/backend/python && uv run python main.py

rabbitmq: ## Sobe o RabbitMQ em container (portas 5672 e 15672)
	@docker run -d --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management

# ── treino da IA ─────────────────────────────────────────────────────────────
# Treinos são longos e custam CPU; ficam fora de build e test de propósito.

train-ppo: ## Treina a IA com PPO
	@clear && cd ./app/backend/python && uv run python -m pong_ai.train_ppo

train-ga: ## Treina a IA com algoritmo genético, retomando o último estado
	@clear && cd ./app/backend/python && uv run python -m pong_ai.train_ga

train-ga-fresh: ## Treina com algoritmo genético do zero
	@clear && cd ./app/backend/python && uv run python -m pong_ai.train_ga --fresh

train-server: ## Sobe o servidor de treino
	@clear && cd ./app/backend/python && uv run python -m pong_ai.train_server

# ── produção (docker) ────────────────────────────────────────────────────────

release: ## Executa o script de release
	@bash ./scripts/release.sh

# O compose recria só o que mudou; derrubar tudo antes custaria imagens e volumes a cada subida.
docker-up: env ## Sobe a stack de produção com build (frontend em localhost:FRONTEND_PORT)
	@$(COMPOSE) up -d --build

docker-down: ## Derruba a stack e apaga imagens e volumes (exige CONFIRM=sim)
	@test "$(CONFIRM)" = "sim" || { \
	  echo "isto remove as imagens e os volumes da stack de produção."; \
	  echo "se é isso mesmo: make docker-down CONFIRM=sim"; \
	  exit 1; }
	@$(COMPOSE) down --rmi all -v

docker-logs: ## Acompanha os logs da stack
	@$(COMPOSE) logs -f

# Roda no container real para validar read_only, capabilities e limites do compose.
sandbox-test: env ## Testa a segurança da jaula do minishell
	@$(COMPOSE) run --rm --build shell-sandbox /sandbox/test-jail.sh /sandbox/run-minishell

# ── qualidade ────────────────────────────────────────────────────────────────

lint: ## Roda o lint do frontend
	@cd ./app/frontend && npm run lint
# 	cd ./app/backend/elixir && mix format --check-formatted
# 	cd ./app/backend/python && black --check .
