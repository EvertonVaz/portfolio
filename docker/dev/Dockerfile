FROM node:25

ARG USER_NAME=etovaz
ARG USER_UID=1000
ARG USER_GID=1000

RUN apt update && \
    apt install -y zsh curl gnupg git nano sqlite3 libsqlite3-dev build-essential wget lsb-release inotify-tools ca-certificates sudo

RUN apt install -y libssl-dev libncurses5-dev automake autoconf libxml2-utils unzip
RUN rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    getent passwd "${USER_UID}" | cut -d: -f1 | grep -vx "${USER_NAME}" | xargs -r -I{} usermod -l "${USER_NAME}" -d "/home/${USER_NAME}" -m -s /usr/bin/zsh {}; \
    getent group  "${USER_GID}" | cut -d: -f1 | grep -vx "${USER_NAME}" | xargs -r -I{} groupmod -n "${USER_NAME}" {}; \
    getent group  "${USER_GID}" > /dev/null || groupadd --gid "${USER_GID}" "${USER_NAME}"; \
    id "${USER_NAME}" 2>/dev/null         || useradd --uid "${USER_UID}" --gid "${USER_GID}" --create-home --shell /usr/bin/zsh "${USER_NAME}"; \
    usermod --append --groups sudo "${USER_NAME}"; \
    printf '%s ALL=(ALL) NOPASSWD:ALL\n' "${USER_NAME}" > "/etc/sudoers.d/${USER_NAME}"; \
    chmod 0440 "/etc/sudoers.d/${USER_NAME}"; \
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
ENV ELIXIR_ERL_OPTIONS="+fnu"

RUN mise use --global erlang@latest elixir@latest

RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix archive.install hex phx_new --force

RUN RUNZSH=no sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" && \
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k && \
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting && \
    git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && \
    ~/.fzf/install --all

RUN curl -fsSL https://claude.ai/install.sh | bash

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

COPY ./scripts/.zshrc /home/${USER_NAME}/.zshrc

WORKDIR /src

CMD ["/start/start.sh"]