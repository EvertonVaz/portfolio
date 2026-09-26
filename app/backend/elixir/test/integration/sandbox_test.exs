defmodule PortfolioWeb.SandboxIntegrationTest do
  # Contra o shell-sandbox de verdade: minishell real, num PTY, dentro da jaula.
  # As garantias de segurança da jaula estão em docker/sandbox/test-jail.sh.
  use ExUnit.Case, async: true
  @moduletag :sandbox

  alias PortfolioWeb.TerminalHandler

  # Digita as teclas (como o xterm.js) e junta tudo que o PTY devolveu até a sessão acabar
  defp run(keys) do
    {:ok, state} = TerminalHandler.init([])
    Process.sleep(300)
    {:ok, state} = TerminalHandler.handle_in({keys, [opcode: :text]}, state)
    collect(state, "")
  end

  defp collect(state, acc) do
    receive do
      msg when elem(msg, 0) in [:tcp, :tcp_closed] ->
        case TerminalHandler.handle_info(msg, state) do
          {:push, [{:binary, data}], st} -> collect(st, acc <> data)
          {:stop, :normal, 1000, [{:text, "[PROCESS TERMINATED]"}], _} -> acc
        end
    after
      5_000 -> flunk("sessão não terminou; saída até aqui: #{inspect(acc)}")
    end
  end

  test "roda o minishell real num PTY" do
    out = run("echo hi\rwhoami\recho abc | cat\rexit\r")
    assert out =~ "\rhi\r\n"
    assert out =~ "\rborn2code\r\n"
    assert out =~ "\rabc\r\n"
  end

  test "Tab completa o nome do arquivo (readline de verdade)" do
    assert run("cat abo\t\rexit\r") =~ "Everton Vaz"
  end

  test "comando inexistente na jaula não executa" do
    out = run("rm about.txt\rls\rexit\r")
    assert out =~ "about.txt"
    assert out =~ "command not found" or out =~ "No such file"
  end
end
