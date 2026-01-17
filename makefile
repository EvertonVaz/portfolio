all: build

build: front-build back-build

front-build:
	cd ./app/frontend && npm run build

back-build:
	cd ./app/minishell/elixir && MIX_ENV=prod mix release --overwrite

front:
	cd ./app/frontend && npm run dev - --host

docker-up: docker-down docker-logs
	docker-compose -f ./deploy/docker-compose.prod-test.yml up -d --build

docker-down:
	clear
	docker-compose -f ./deploy/docker-compose.prod-test.yml down --rmi all -v

docker-logs:
	docker-compose -f ./deploy/docker-compose.prod-test.yml logs -f