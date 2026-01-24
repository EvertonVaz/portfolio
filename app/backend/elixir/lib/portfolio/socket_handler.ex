defmodule Portfolio.SocketHandler do
  @moduledoc """
  Handles WebSocket connections.
  """

  # WebSock behaviour is implicitly used via WebSockAdapter

  require Logger

  def init(args) do
    Logger.info("[SocketHandler] New connection established with args: #{inspect(args)}")
    {:ok, []}
  end

  def handle_in({text, _opcode}, state) do
    # Execute command via Terminal Context, passing self() as caller_pid
    # for async command support (like philosophers simulation)
    response = Portfolio.Terminal.execute(text, self())
    {:push, {:text, response}, state}
  end

  # Handle messages sent from GenServers (like Philosophers Simulation)
  # Expected format: {:philosophers_update, map}
  def handle_info({:philosophers_update, data}, state) do
    # Convert map to JSON string (using Jason)
    json_response =
      Jason.encode!(%{
        type: "philosophers_update",
        data: data
      })

    {:push, {:text, json_response}, state}
  end

  def handle_info({:philosophers_exit, status}, state) do
    json_response =
      Jason.encode!(%{
        type: "philosophers_exit",
        status: status
      })

    {:push, {:text, json_response}, state}
  end

  def handle_info(_, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end
end
