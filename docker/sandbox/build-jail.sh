#!/bin/sh
# Monta a jaula do minishell: o binário, ls, cat, whoami, clear e help, as libs deles e os arquivos da vitrine.
# Nada além disso existe lá dentro — nem outro shell, nem /proc, nem /dev.
# Uso: ./build-jail.sh <jaula> <binário do minishell> <binário do help (help.c)>
set -eu

JAIL="$1"
MINISHELL="$2"
HELP="$3"
HOME_FILES="$(dirname "$0")/home"

mkdir -p "$JAIL/bin" "$JAIL/etc" "$JAIL/tmp"
install -m 0755 "$MINISHELL" "$JAIL/bin/minishell"
install -m 0755 "$HELP" "$JAIL/bin/help"
for cmd in ls cat whoami clear; do
    install -m 0755 "$(command -v "$cmd")" "$JAIL/bin/$cmd"
done

# Libs dinâmicas no mesmo caminho em que o loader as procura
for bin in "$JAIL"/bin/*; do
    ldd "$bin" | grep -o '/[^ ]*' | while read -r lib; do
        mkdir -p "$JAIL$(dirname "$lib")"
        cp -L "$lib" "$JAIL$lib"
    done
done

# Terminfo do TERM usado no launcher: sem ele o readline cai no modo dumb (sem setas nem redesenho)
mkdir -p "$JAIL/lib/terminfo/x"
cp /lib/terminfo/x/xterm-256color "$JAIL/lib/terminfo/x/"

# Usuário sem privilégio (uid do nobody) com o nome que o whoami mostra
echo 'born2code:x:65534:65534:born2code:/:/bin/minishell' > "$JAIL/etc/passwd"
echo 'born2code:x:65534:' > "$JAIL/etc/group"

# A raiz da jaula é o home: chroot --userspec sempre começa em /
install -m 0644 "$HOME_FILES"/* "$JAIL/"
chmod 1777 "$JAIL/tmp"
