all: build

build: front-build back-build

front-build:
	cd ./app/frontend && npm run build

back-build:
	cd ./app/backend/elixir && MIX_ENV=prod mix release --overwrite

test:
	cd ./app/backend/elixir && mix test --cover

front:
	cd ./app/frontend && npm run dev -- --host

back:
	cd ./app/backend/elixir && mix run --no-halt

DOCKER_COMPOSE = docker compose
COMPOSE_FILE = ./deploy/docker-compose.prod-test.yml

docker-up: docker-down
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d --build

docker-down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --rmi all -v

docker-logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f