defmodule PortfolioWeb.TerminalHandler do
  @moduledoc """
  Handles WebSocket connections for the Minishell Terminal.
  """
  require Logger

  def init(args) do
    Logger.info("[TerminalHandler] New connection established with args: #{inspect(args)}")
    {:ok, []}
  end

  def handle_in({text, _opcode}, state) do
    # Execute command via Terminal Context
    response = Portfolio.Terminal.execute(text)
    {:push, {:text, response}, state}
  end

  def handle_info(_msg, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end
end
