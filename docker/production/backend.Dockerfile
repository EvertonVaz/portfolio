# Build: mix release com ERTS embutido
FROM hexpm/elixir:1.20.2-erlang-29.0.3-debian-bookworm-20260713-slim AS build

ENV MIX_ENV=prod
WORKDIR /build

RUN mix local.hex --force && mix local.rebar --force

COPY app/backend/elixir/mix.exs app/backend/elixir/mix.lock ./
RUN mix deps.get --only prod && mix deps.compile

COPY app/backend/elixir/config ./config
COPY app/backend/elixir/lib ./lib

# Versão unificada com o frontend: o package.json é a fonte única do número.
# Lê daqui e passa pro mix via PORTFOLIO_VERSION (o mix.exs já usa essa env),
# sem hardcode no mix.exs. O sha do commit fica por conta do Coolify em runtime.
COPY app/frontend/package.json ./frontend-package.json
RUN export PORTFOLIO_VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' frontend-package.json | head -1)" \
    && echo "release version: ${PORTFOLIO_VERSION:-<vazio>}" \
    && mix release --overwrite

# Runtime: glibc (bookworm) — o ERTS e os binários C do 42 são linkados contra glibc
FROM debian:12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libssl3 libncursesw6 libstdc++6 libreadline8 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

WORKDIR /app

COPY --from=build /build/_build/prod/rel/portfolio ./
# O backend invoca ./minishell e ./philosophers relativos ao cwd (Path.expand)
COPY app/backend/elixir/minishell app/backend/elixir/philosophers ./

EXPOSE 4000

CMD ["./bin/portfolio", "start"]
