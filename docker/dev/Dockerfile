FROM node:25

RUN apt update && \
    apt install -y zsh curl gnupg git nano sqlite3 libsqlite3-dev build-essential wget lsb-release inotify-tools ca-certificates

RUN apt install -y libssl-dev libncurses5-dev automake autoconf libxml2-utils unzip
RUN rm -rf /var/lib/apt/lists/*

ENV MISE_INSTALL_PATH=/usr/local/bin/mise
RUN curl https://mise.jdx.dev/install.sh | sh

ENV MISE_DATA_DIR=/opt/mise
ENV PATH="/opt/mise/shims:$PATH"
ENV ELIXIR_ERL_OPTIONS="+fnu"

RUN mise use --global erlang@latest elixir@latest

RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix archive.install hex phx_new --force

RUN RUNZSH=no sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" && \
    chsh -s $(which zsh) && \
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k && \
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting && \
    git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && \
    ~/.fzf/install --all


COPY ./scripts/.zshrc /root/.zshrc
COPY ./scripts/start.sh /start/start.sh

WORKDIR /src

CMD ["/start/start.sh"]