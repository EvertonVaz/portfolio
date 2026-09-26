defmodule PortfolioWeb.TerminalHandlerTest do
  use ExUnit.Case, async: true
  alias PortfolioWeb.TerminalHandler

  @prompt "\e[32mborn2code@minishell $>\e[m"

  # Sandbox falso: um servidor TCP de verdade no lugar do shell-sandbox.
  # O handler roda no processo do teste, então as mensagens {:tcp, ...} chegam aqui.
  setup do
    {:ok, listen} = :gen_tcp.listen(0, [:binary, active: false, reuseaddr: true])
    {:ok, port} = :inet.port(listen)
    on_exit(fn -> :gen_tcp.close(listen) end)
    %{listen: listen, opts: [host: "127.0.0.1", port: port]}
  end

  defp connect(%{listen: listen, opts: opts}) do
    {:ok, state} = TerminalHandler.init(opts)
    {:ok, sandbox} = :gen_tcp.accept(listen, 1_000)
    {state, sandbox}
  end

  defp next_tcp_message(state) do
    receive do
      {:tcp, _, _} = msg -> TerminalHandler.handle_info(msg, state)
      {:tcp_closed, _} = msg -> TerminalHandler.handle_info(msg, state)
    after
      1_000 -> flunk("nenhuma mensagem do sandbox")
    end
  end

  describe "init/1" do
    test "abre uma sessão no sandbox", ctx do
      {state, _sandbox} = connect(ctx)
      assert is_port(state.socket)
    end

    # 1000 e não 1011: com código de erro o frontend reconecta sozinho a cada 5s em loop;
    # assim ele espera o visitante digitar de novo para tentar outra sessão
    test "sandbox fora do ar fecha o websocket sem disparar reconexão", %{listen: listen, opts: opts} do
      :gen_tcp.close(listen)
      assert {:stop, :normal, 1000, [{:text, msg}], _} = TerminalHandler.init(opts)
      assert msg =~ "SANDBOX"
    end
  end

  describe "handle_in/2" do
    # Tecla por tecla, como o xterm.js manda: Tab, Enter (\r) e Ctrl+C chegam intactos ao PTY
    test "repassa as teclas cruas para o minishell", ctx do
      {state, sandbox} = connect(ctx)
      assert {:ok, _} = TerminalHandler.handle_in({"cat abo\t\r\x03", [opcode: :text]}, state)
      assert {:ok, "cat abo\t\r\x03"} = :gen_tcp.recv(sandbox, 0, 1_000)
    end

    test "comando que chega enquanto o websocket fecha (sandbox fora do ar) é ignorado",
         %{listen: listen, opts: opts} do
      :gen_tcp.close(listen)
      {:stop, :normal, _, _, state} = TerminalHandler.init(opts)
      assert TerminalHandler.handle_in({"ls", [opcode: :text]}, state) == {:ok, state}
    end

    test "recusa entrada grande demais sem mandar nada", ctx do
      {state, sandbox} = connect(ctx)
      huge = String.duplicate("a", 1_025)
      assert {:push, [{:text, msg}], ^state} = TerminalHandler.handle_in({huge, [opcode: :text]}, state)
      assert msg =~ "ERROR"
      assert {:error, :timeout} = :gen_tcp.recv(sandbox, 0, 100)
    end
  end

  describe "handle_info/2" do
    # O xterm.js interpreta ANSI e prompt. Frame binário porque um pacote pode
    # cortar um caractere UTF-8 ao meio, e frame de texto exige UTF-8 válido.
    test "repassa a saída crua do PTY em frame binário", ctx do
      {state, sandbox} = connect(ctx)
      raw = @prompt <> "ls\r\nabout.txt  bin\r\n" <> <<0xC3>>
      :ok = :gen_tcp.send(sandbox, raw)
      assert {:push, [{:binary, ^raw}], _} = next_tcp_message(state)
    end

    test "fim do minishell (exit, timeout) encerra o websocket", ctx do
      {state, sandbox} = connect(ctx)
      :gen_tcp.close(sandbox)
      assert {:stop, :normal, 1000, [{:text, "[PROCESS TERMINATED]"}], _} = next_tcp_message(state)
    end

    test "sessão ociosa fecha com 1000 (sem reconexão automática) e encerra o minishell",
         %{listen: listen, opts: opts} do
      {:ok, state} = TerminalHandler.init(Keyword.put(opts, :idle_timeout, 50))
      {:ok, sandbox} = :gen_tcp.accept(listen, 1_000)
      assert_receive {:idle, _} = idle, 500
      assert {:stop, :normal, 1000, [{:text, "[SESSION IDLE]"}], _} = TerminalHandler.handle_info(idle, state)
      assert {:error, :closed} = :gen_tcp.recv(sandbox, 0, 1_000)
    end

    test "comando reinicia o prazo de ociosidade", %{listen: listen, opts: opts} do
      {:ok, state} = TerminalHandler.init(Keyword.put(opts, :idle_timeout, 50))
      {:ok, _sandbox} = :gen_tcp.accept(listen, 1_000)
      {:ok, state} = TerminalHandler.handle_in({"ls", [opcode: :text]}, state)
      # aviso do prazo antigo, já na caixa de mensagens quando o comando chegou
      assert TerminalHandler.handle_info({:idle, make_ref()}, state) == {:ok, state}
      %{idle_ref: ref} = state
      assert_receive {:idle, ^ref}, 500
      assert {:stop, :normal, 1000, _, _} = TerminalHandler.handle_info({:idle, ref}, state)
    end

    test "ignora mensagens desconhecidas", ctx do
      {state, _sandbox} = connect(ctx)
      assert TerminalHandler.handle_info(:unknown, state) == {:ok, state}
    end
  end

  describe "terminate/2" do
    test "fecha a sessão no sandbox", ctx do
      {state, sandbox} = connect(ctx)
      assert TerminalHandler.terminate(:normal, state) == :ok
      assert {:error, :closed} = :gen_tcp.recv(sandbox, 0, 1_000)
    end
  end
end
