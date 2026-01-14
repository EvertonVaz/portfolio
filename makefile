all: build

build: front-build back-build

front-build:
	cd ./app/frontend && npm run build

back-build:
	cd ./app/minishell/elixir && MIX_ENV=prod mix release --overwrite

