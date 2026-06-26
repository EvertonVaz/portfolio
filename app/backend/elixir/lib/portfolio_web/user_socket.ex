defmodule PortfolioWeb.UserSocket do
  use Phoenix.Socket

  # Channels — to be added when implementing Pong
  # channel "game:*", PortfolioWeb.GameChannel

  @impl true
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  @impl true
  def id(_socket), do: nil
end
