#!/bin/sh
# Testes de segurança da jaula do minishell.
# As sessões passam pelo mesmo caminho da produção: socat com PTY (como no Dockerfile).
# Uso (como root, pois o launcher faz chroot): JAIL=/jail ./test-jail.sh ./run-minishell
set -u

LAUNCHER="$1"
FAILS=0

# Entrada bruta (stdin) → sessão numa PTY → saída sem ANSI, \r, prompt e eco do heredoc.
# Com PTY o kernel também ecoa o que é digitado fora do readline: as asserções
# procuram saída que o eco da entrada não reproduz.
pty_session() {
    SECRET_KEY_BASE=must-not-leak RABBITMQ_URL=must-not-leak \
        socat -t 2 - EXEC:"$LAUNCHER",pty,setsid,ctty,stderr 2>&1 \
        | sed 's/\x1b\[[0-9;?]*[a-zA-Z]//g; s/\r//g' \
        | grep -v -e '@minishell \$>' -e '^\$> '
}

# Mesma sessão, mas com a saída crua (ANSI intacto)
pty_raw() {
    socat -t 2 - EXEC:"$LAUNCHER",pty,setsid,ctty,stderr 2>&1
}

# Uma linha por argumento. A sentinela no fim prova que a sessão rodou —
# sem ela, teste negativo passa no vazio.
session() {
    { sleep 0.3; printf '%s\n' "$@" 'echo SESSION-ALIVE'; sleep 1; } | pty_session
}

check() {
    if [ "$2" -eq 0 ]; then
        echo "ok   - $1"
    else
        echo "FAIL - $1"
        FAILS=$((FAILS + 1))
    fi
}

has() { printf '%s' "$1" | grep -q -- "$2"; }
alive() { has "$1" '^SESSION-ALIVE$'; }

# --- o projeto funciona ---
out=$(session 'echo hi')
has "$out" '^hi$'; check "echo funciona" $?

out=$(session 'whoami')
has "$out" '^born2code$'; check "whoami é born2code" $?

out=$(session 'ls')
has "$out" 'about.txt'; check "ls lista a vitrine" $?

out=$(session 'cat contact.txt')
has "$out" 'github.com/EvertonVaz'; check "cat lê a vitrine" $?

out=$(session 'echo abc | cat')
has "$out" '^abc$'; check "pipe funciona" $?

out=$(session 'export A=42' 'echo $A')
has "$out" '^42$'; check "estado persiste na sessão" $?

out=$(session 'export A=ok' 'cat << EOF' 'heredoc-$A' 'EOF')
has "$out" '^heredoc-ok$'; check "heredoc funciona (tmpfs)" $?

# --- terminal de verdade ---
out=$(session "$(printf 'cat abo\t')")
has "$out" 'Everton Vaz'; check "Tab completa nome de arquivo" $?

out=$(session 'help')
has "$out" 'whoami' && has "$out" 'Ctrl+C' && has "$out" 'heredoc'; check "help lista comandos e atalhos" $?

out=$( { sleep 0.3; printf 'clear\n'; sleep 1; } | pty_raw)
printf '%s' "$out" | grep -q "$(printf '\033')\\[2J"; check "clear limpa a tela" $?

# o readline só redesenha a linha direito (setas, Tab) com o terminfo do TERM dentro da jaula
out=$(session 'echo $TERM' 'ls /lib/terminfo/x')
[ "$(printf '%s\n' "$out" | grep -c '^xterm-256color$')" -eq 2 ]; check "TERM xterm-256color com terminfo na jaula" $?

# sem o Ctrl+C, o cat engoliria a linha da sentinela e só a repetiria
out=$( { sleep 0.3; printf 'cat\n'; sleep 0.5; printf '\003'; sleep 0.3; printf 'echo SESSION-ALIVE\n'; sleep 1; } | pty_session)
alive "$out"; check "Ctrl+C interrompe o cat e o shell segue vivo" $?

# --- nada além da jaula ---
out=$(session 'sh -c "echo PWN""ED"' '/bin/sh -c "echo PWN""ED"' 'bash -c "echo PWN""ED"')
alive "$out" && ! has "$out" 'PWNED'; check "nenhum outro shell existe" $?

out=$(session 'rm about.txt' 'ls')
has "$out" 'about.txt'; check "rm não existe" $?

out=$(session 'echo X > about.txt' 'echo X > novo.txt' 'cat about.txt' 'ls')
alive "$out" && ! has "$out" '^X$' && ! has "$out" '^novo.txt$'; check "fora do /tmp é somente leitura" $?

out=$(session 'cd ..' 'cd /..' 'ls')
has "$out" 'about.txt' && ! has "$out" 'usr'; check "cd .. não sai da jaula" $?

out=$(session 'ls /proc' 'cat /proc/1/environ' 'cat /proc/self/environ')
alive "$out" && ! has "$out" 'must-not-leak'; check "/proc não existe" $?

out=$(session 'env')
alive "$out" && has "$out" '^PATH=' && ! has "$out" 'must-not-leak' && ! has "$out" 'SECRET'; check "ambiente limpo" $?

out=$(session 'cat /etc/shadow' 'ls /root' 'ls /app')
alive "$out" && ! has "$out" 'root:' && ! has "$out" 'portfolio'; check "arquivos do host invisíveis" $?

# --- limites ---
start=$(date +%s)
pipeline='ls'
i=0
while [ $i -lt 200 ]; do pipeline="$pipeline | cat"; i=$((i + 1)); done
out=$(session "$pipeline")
elapsed=$(( $(date +%s) - start ))
alive "$out" && [ "$elapsed" -lt 15 ]; check "pipeline de 200 processos não trava (${elapsed}s)" $?

# O sleep mantém a entrada aberta, como um visitante parado. O launcher pode até
# retornar, mas o que importa é não sobrar processo da jaula depois do timeout.
{ sleep 0.3; echo 'cat'; sleep 6; } | SESSION_TIMEOUT=2 pty_session > /dev/null &
sleep 4
left=$(grep -l '^Uid:[[:space:]]*65534' /proc/[0-9]*/status 2>/dev/null | wc -l)  # sem ps na imagem slim
wait
[ "$left" -eq 0 ]; check "timeout mata a sessão inteira (${left} processo(s) vivos após o timeout)" $?

[ "$FAILS" -eq 0 ] && echo "todos os testes passaram" || echo "$FAILS falha(s)"
exit "$FAILS"
