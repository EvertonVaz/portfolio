# Base: imagem oficial do Node (Debian, o resto deste arquivo usa apt).
# Erlang/Elixir vêm do mise.
FROM node:25

# Sem padrão de propósito: vêm do .env pelo .devcontainer/docker-compose.yml.
# Padrão aqui geraria, num build manual, uma imagem de outra máquina sem aviso.
ARG USER_NAME
ARG USER_UID=1000
ARG USER_GID=1000
# Caminho do repositório no host: o projeto é montado no mesmo lugar aqui dentro.
ARG PROJECT_DIR

# Valida se os argumentos obrigatórios foram passados
RUN test -n "$USER_NAME" -a -n "$PROJECT_DIR" \
 || { echo "adicione PROJECT_DIR ao .env ou passe --build-arg USER_NAME e PROJECT_DIR"; exit 1; }

# Install dependencies for the container
RUN apt update && \
    apt install -y zsh curl gnupg git nano sqlite3 libsqlite3-dev build-essential wget lsb-release inotify-tools ca-certificates sudo xz-utils unzip procps

# Install GitHub CLI
RUN (type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y

# Docker CLI + compose: fala com o daemon do host pelo socket montado no compose
RUN install -m 0755 -d /etc/apt/keyrings \
	&& curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
	&& chmod a+r /etc/apt/keyrings/docker.asc \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list \
	&& apt update \
	&& apt install -y docker-ce-cli docker-compose-plugin

RUN rm -rf /var/lib/apt/lists/*

# Create a non-root user to run our application so that we don't run as root inside the container
# Se a imagem base já tem um usuário/grupo com esse UID/GID (ex.: `node` na
# imagem oficial do Node), ele é renomeado em vez de duplicado.
RUN set -eux; \
    getent passwd "${USER_UID}" | cut -d: -f1 | grep -vx "${USER_NAME}" | xargs -r -I{} usermod -l "${USER_NAME}" -d "/home/${USER_NAME}" -m -s /usr/bin/zsh {}; \
    getent group  "${USER_GID}" | cut -d: -f1 | grep -vx "${USER_NAME}" | xargs -r -I{} groupmod -n "${USER_NAME}" {}; \
    getent group  "${USER_GID}" > /dev/null || groupadd --gid "${USER_GID}" "${USER_NAME}"; \
    id "${USER_NAME}" 2>/dev/null         || useradd --uid "${USER_UID}" --gid "${USER_GID}" --create-home --shell /usr/bin/zsh "${USER_NAME}"; \
    usermod --append --groups sudo "${USER_NAME}"; \
    printf '%s ALL=(ALL) NOPASSWD:ALL\n' "${USER_NAME}" > "/etc/sudoers.d/${USER_NAME}"; \
    chmod 0440 "/etc/sudoers.d/${USER_NAME}"; \
    mkdir -p "${PROJECT_DIR}"; \
    chown "${USER_NAME}:${USER_NAME}" "${PROJECT_DIR}"; \
    chown -R "${USER_NAME}:${USER_NAME}" "/home/${USER_NAME}"

ENV MISE_INSTALL_PATH=/usr/local/bin/mise
RUN curl https://mise.jdx.dev/install.sh | sh

COPY ./scripts/start.sh /start/start.sh

RUN mkdir -p /opt/mise && \
    chown -R ${USER_NAME} /opt/mise /start

ENV HOME=/home/${USER_NAME}

USER ${USER_NAME}

ENV MISE_DATA_DIR=/opt/mise
ENV PATH="/opt/mise/shims:$PATH"

RUN mise use -g github:akitaonrails/ai-memory
RUN mise use -g jq@latest
RUN mise use -g tmux@latest

# ── stack do projeto ──────────────────────────────────────────────────
# Runtime e gerenciador de pacotes da stack. Com base debian:bookworm, o
# runtime vem do mise; com a imagem oficial, ele já está lá e só entra o
# gerenciador, se faltar. Exemplos:
#   RUN mise use -g python@3.14
#   RUN curl -LsSf https://astral.sh/uv/install.sh | sh
#   ENV UV_PYTHON_DOWNLOADS=never
#   RUN mise use -g node@lts
ENV ELIXIR_ERL_OPTIONS="+fnu"
RUN mise use -g erlang@latest elixir@latest

RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix archive.install hex phx_new --force

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Oh My Zsh and plugins
RUN RUNZSH=no sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" && \
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k && \
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting && \
    git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && \
    ~/.fzf/install --all

RUN curl -fsSL https://claude.ai/install.sh | bash

COPY ./scripts/.zshrc /home/${USER_NAME}/.zshrc

WORKDIR ${PROJECT_DIR}

CMD ["/start/start.sh"]
