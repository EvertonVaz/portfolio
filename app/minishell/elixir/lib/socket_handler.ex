defmodule Messaging.SocketHandler do
  require Logger

  @behaviour WebSock

  @impl true
  def init(_options) do
    Logger.info("[SOCKET] Conexão estabelecida e autenticada.")
    {:ok, %{authenticated: true}}
  end

  @impl true
  def handle_in({text, [opcode: :text]}, state) do
    Logger.info("[SOCKET] Comando recebido: #{text}")

    response = Messaging.Processor.process_message(text)

    {:reply, :ok, {:text, response}, state}
  end

  @impl true
  def handle_info(message, state) do
    # Captura mensagens do sistema (ex: encerramento de comandos shell) sem quebrar o processo
    Logger.debug("[SOCKET] Mensagem de sistema recebida: #{inspect(message)}")
    {:ok, state}
  end

  @impl true
  def terminate(reason, _state) do
    Logger.info("[SOCKET] Conexão encerrada: #{inspect(reason)}")
    :ok
  end
end
