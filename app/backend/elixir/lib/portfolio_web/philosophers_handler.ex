defmodule PortfolioWeb.PhilosophersHandler do
  @moduledoc """
  Handles WebSocket connections for the Dining Philosophers simulation.
  """
  require Logger

  def init(args) do
    Logger.info("[PhilosophersHandler] New connection established with args: #{inspect(args)}")
    {:ok, []}
  end

  def handle_in({text, _opcode}, state) do
    # Execute command via Philosophers Context
    response = Portfolio.Philosophers.execute(text, self())
    {:push, {:text, response}, state}
  end

  # Handle messages sent from GenServers (like Philosophers Simulation)
  def handle_info({:philosophers_update, data}, state) do
    Logger.debug("[PhilosophersHandler] Received philosophers_update: #{inspect(data)}")

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

  def handle_info(_msg, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end
end
