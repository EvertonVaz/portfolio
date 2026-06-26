defmodule PortfolioWeb.GameChannel do
  use Phoenix.Channel

  @impl true
  def join("game:" <> room_id, _params, socket) do
    case Portfolio.Pong.GameSupervisor.start_game(room_id) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      error -> throw(error)
    end

    Phoenix.PubSub.subscribe(Portfolio.PubSub, "game:#{room_id}")
    socket = assign(socket, :room_id, room_id)
    send(self(), :push_initial_state)
    {:ok, socket}
  end

  @impl true
  def handle_in("player_move", %{"direction" => dir}, socket) do
    direction = case dir do
      "up" -> :up
      "down" -> :down
      _ -> :stop
    end
    Portfolio.Pong.GameServer.set_player_direction(socket.assigns.room_id, direction)
    {:noreply, socket}
  end

  def handle_in("restart", _params, socket) do
    Portfolio.Pong.GameServer.restart(socket.assigns.room_id)
    {:noreply, socket}
  end

  @impl true
  def handle_info(:push_initial_state, socket) do
    state = Portfolio.Pong.GameServer.get_state(socket.assigns.room_id)
    push(socket, "game_state", encode_state(state))
    {:noreply, socket}
  end

  def handle_info({:game_state, state}, socket) do
    push(socket, "game_state", encode_state(state))
    {:noreply, socket}
  end

  defp encode_state(state) do
    %{
      ball: %{x: state.ball.x, y: state.ball.y},
      player: %{y: state.player.y, score: state.player.score},
      ai: %{y: state.ai.y, score: state.ai.score},
      status: state.status
    }
  end
end
