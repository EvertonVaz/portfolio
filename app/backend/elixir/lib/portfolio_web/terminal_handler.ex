defmodule PortfolioWeb.TerminalHandler do
  @moduledoc """
  WebSocket do terminal: cada conexão abre uma sessão do minishell real no
  shell-sandbox (docker/sandbox), num PTY, e repassa bytes crus nos dois sentidos:
  teclas do xterm.js para o minishell, saída do PTY de volta em frames binários.

  A segurança está na jaula do sandbox, não aqui — este handler só transporta.
  Quando o minishell termina (exit, timeout da jaula), o websocket fecha junto;
  quando o websocket fecha, o socket fecha e o minishell recebe EOF.

  Ociosidade é controlada aqui e fecha com 1000: o frontend só reconecta sozinho em
  outros códigos, então uma aba parada não fica abrindo sessões novas na jaula.
  """
  require Logger

  @max_input 1_024
  @connect_timeout 3_000
  @idle_timeout 300_000

  def init(opts) do
    config = Keyword.merge(Application.get_env(:portfolio, :sandbox, []), opts)
    host = config |> Keyword.fetch!(:host) |> String.to_charlist()

    case :gen_tcp.connect(host, Keyword.fetch!(config, :port), [:binary, active: true], @connect_timeout) do
      {:ok, socket} ->
        state = %{socket: socket, idle_timeout: Keyword.get(config, :idle_timeout, @idle_timeout)}
        {:ok, schedule_idle(state)}

      {:error, reason} ->
        Logger.error("[TerminalHandler] shell-sandbox indisponível: #{inspect(reason)}")
        {:stop, :normal, 1000, [{:text, "[ERROR: SANDBOX UNAVAILABLE]"}], %{socket: nil}}
    end
  end

  # Sem sessão (sandbox fora do ar): o websocket já está fechando, o frame não tem destino
  def handle_in(_frame, %{socket: nil} = state), do: {:ok, state}

  def handle_in({text, _opcode}, state) when byte_size(text) > @max_input do
    {:push, [{:text, "[ERROR: INPUT TOO LONG]"}], state}
  end

  def handle_in({text, _opcode}, state) do
    :ok = :gen_tcp.send(state.socket, text)
    {:ok, schedule_idle(state)}
  end

  # Binário: um pacote pode cortar um caractere UTF-8 ao meio
  def handle_info({:tcp, socket, data}, %{socket: socket} = state) do
    {:push, [{:binary, data}], state}
  end

  def handle_info({:tcp_closed, socket}, %{socket: socket} = state) do
    {:stop, :normal, 1000, [{:text, "[PROCESS TERMINATED]"}], state}
  end

  def handle_info({:idle, ref}, %{idle_ref: ref} = state) do
    :gen_tcp.close(state.socket)
    {:stop, :normal, 1000, [{:text, "[SESSION IDLE]"}], %{state | socket: nil}}
  end

  def handle_info(_msg, state) do
    {:ok, state}
  end

  def terminate(_reason, %{socket: socket}) when is_port(socket) do
    :gen_tcp.close(socket)
    :ok
  end

  def terminate(_reason, _state), do: :ok

  # Cada prazo tem uma ref própria: um aviso antigo que já estava na caixa de
  # mensagens quando um comando chegou cai no handle_info genérico e é ignorado
  defp schedule_idle(state) do
    if timer = state[:idle_timer], do: Process.cancel_timer(timer)
    ref = make_ref()
    timer = Process.send_after(self(), {:idle, ref}, state.idle_timeout)
    Map.merge(state, %{idle_ref: ref, idle_timer: timer})
  end
end
