defmodule PortfolioWeb.UserSocket do
  use Phoenix.Socket

  channel "game:*", PortfolioWeb.GameChannel

  # O room_id vem da sessão criada em GET /api/pong/room — o cliente não escolhe
  # em qual sala entra. Sem sessão válida, não há conexão.
  @impl true
  def connect(_params, socket, connect_info) do
    case connect_info do
      %{session: %{"pong_room" => room_id}} when is_binary(room_id) ->
        {:ok, assign(socket, :room_id, room_id)}

      _ ->
        :error
    end
  end

  @impl true
  def id(socket), do: "pong:#{socket.assigns.room_id}"
end
