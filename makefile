-include envs/.env.pong
export

all: build

build: front-build back-build

front-build:
	cd ./app/frontend && npm run build

back-build:
	cd ./app/backend/elixir && MIX_ENV=prod mix release --overwrite

test:
	cd ./app/backend/elixir && mix test --cover

front:
	clear && cd ./app/frontend && npm run dev -- --host

back:
	clear && cd ./app/backend/elixir && mix run --no-halt

ai:
	clear && cd ./app/backend/python && uv run python main.py

train-ppo:
	clear && cd ./app/backend/python && uv run python -m pong_ai.train_ppo

train-es:
	clear && cd ./app/backend/python && uv run python -m pong_ai.train_es

train-server:
	clear && cd ./app/backend/python && uv run python -m pong_ai.train_server

rabbitmq:
	docker run -d --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management

DOCKER_COMPOSE = docker compose
COMPOSE_FILE = ./docker/production/docker-compose.yml

deploy:
	bash ./deploy/deploy.sh

docker-up: docker-down
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d --build

docker-down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --rmi all -v

docker-logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f