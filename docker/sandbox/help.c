/*
** help do terminal do portfólio.
** A jaula não tem shell (nem para rodar um script), então o help é um binário.
*/
#include <unistd.h>

static const char	g_text[] =
	"minishell — o shell em C que escrevi em dupla na 42 São Paulo\n"
	"\n"
	"programas:  ls  cat  whoami  clear  help\n"
	"builtins:   echo  pwd  cd  export  unset  env  exit\n"
	"sintaxe:    |  >  >>  <  << (heredoc)  &&  ||  $VAR  $?  'aspas'  \"aspas\"\n"
	"teclas:     Tab completa · ↑↓ histórico · Ctrl+C interrompe · Ctrl+D sai · Ctrl+L limpa\n"
	"\n"
	"comece por: cat about.txt\n";

int	main(void)
{
	return (write(STDOUT_FILENO, g_text, sizeof(g_text) - 1) < 0);
}
