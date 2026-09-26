# Sandbox do minishell: cada conexão TCP ganha um minishell novo dentro da jaula.
# A imagem não recebe nenhum segredo; o isolamento extra (read_only, capabilities,
# limites, rede interna) fica no compose.
# Build a partir da raiz do repo: precisa do binário em app/backend/elixir/minishell.

# help.c compilado à parte: o compilador não vai para a imagem final
FROM debian:12-slim AS help
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*
COPY docker/sandbox/help.c /help.c
RUN gcc -Wall -Wextra -Werror -O2 -o /help /help.c

FROM debian:12-slim

# libreadline8: o ldd do build-jail precisa resolver as libs do minishell
RUN apt-get update && apt-get install -y --no-install-recommends socat libreadline8 \
    && rm -rf /var/lib/apt/lists/*

COPY docker/sandbox/ /sandbox/
COPY app/backend/elixir/minishell /tmp/minishell
COPY --from=help /help /tmp/help
RUN /sandbox/build-jail.sh /jail /tmp/minishell /tmp/help && rm /tmp/minishell /tmp/help

EXPOSE 7000

# max-children: teto de sessões simultâneas.
# pty,setsid,ctty: o minishell ganha um terminal de verdade (Tab, setas, Ctrl+C do readline)
CMD ["socat", "TCP-LISTEN:7000,reuseaddr,fork,max-children=20", "EXEC:/sandbox/run-minishell,pty,setsid,ctty,stderr"]
