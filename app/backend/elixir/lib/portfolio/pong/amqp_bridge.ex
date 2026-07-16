defmodule Portfolio.Pong.AmqpBridge do
  use GenServer
  require Logger

  @state_queue "game.state"
  @action_queue "game.ai_action"
  @reconnect_ms 5_000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def publish_state(room_id, game_state) do
    GenServer.cast(__MODULE__, {:publish_state, room_id, game_state})
  end

  def connected?() do
    GenServer.call(__MODULE__, :connected?)
  end

  @impl true
  def init(:ok) do
    send(self(), :connect)
    {:ok, %{conn: nil, chan: nil, connected: false}}
  end

  @impl true
  def handle_info(:connect, state) do
    url = System.get_env("RABBITMQ_URL") || "amqp://guest:guest@rabbitmq"

    case AMQP.Connection.open(url) do
      {:ok, conn} ->
        {:ok, chan} = AMQP.Channel.open(conn)
        AMQP.Queue.declare(chan, @state_queue, durable: true,
          arguments: [{"x-message-ttl", :long, 50}])
        AMQP.Queue.declare(chan, @action_queue, durable: true,
          arguments: [{"x-message-ttl", :long, 200}])
        AMQP.Basic.consume(chan, @action_queue, nil, no_ack: true)
        Logger.info("[AmqpBridge] Connected to RabbitMQ")
        {:noreply, %{conn: conn, chan: chan, connected: true}}

      {:error, reason} ->
        Logger.warning("[AmqpBridge] Connection failed: #{inspect(reason)}. Retrying in #{@reconnect_ms}ms")
        Process.send_after(self(), :connect, @reconnect_ms)
        {:noreply, state}
    end
  end

  # Mensagens de controle do AMQP.Basic.consume
  def handle_info({:basic_consume_ok, _}, state), do: {:noreply, state}
  def handle_info({:basic_cancel, _}, state), do: {:noreply, state}
  def handle_info({:basic_cancel_ok, _}, state), do: {:noreply, state}

  def handle_info({:basic_deliver, payload, _meta}, state) do
    case Jason.decode(payload) do
      {:ok, %{"room_id" => room_id, "direction" => dir} = msg} ->
        nn_viz = Map.get(msg, "nn_viz")
        player_direction =
          case Map.get(msg, "player_direction") do
            nil -> nil
            pdir -> decode_direction(pdir)
          end

        Portfolio.Pong.GameServer.set_ai_direction(
          room_id, decode_direction(dir), nn_viz, player_direction
        )

      _ ->
        Logger.warning("[AmqpBridge] Unexpected payload: #{inspect(payload)}")
    end

    {:noreply, state}
  end

  defp decode_direction("up"), do: :up
  defp decode_direction("down"), do: :down
  defp decode_direction(_), do: :stop

  @impl true
  def handle_cast({:publish_state, room_id, game_state}, %{chan: chan, connected: true} = state) do
    payload = Jason.encode!(%{
      room_id: room_id,
      mode: game_state.mode,
      ai_model: game_state.ai_model,
      player_model: game_state.player_model,
      ball: %{x: game_state.ball.x, y: game_state.ball.y, vx: game_state.ball.vx, vy: game_state.ball.vy},
      ai_y: game_state.ai.y,
      player_y: game_state.player.y,
      paddle_height: game_state.cfg.paddle_height,
      height: game_state.cfg.height,
      width: game_state.cfg.width
    })
    AMQP.Basic.publish(chan, "", @state_queue, payload)
    {:noreply, state}
  end

  def handle_cast({:publish_state, _room_id, _game_state}, state) do
    {:noreply, state}
  end

  @impl true
  def handle_call(:connected?, _from, state) do
    {:reply, state.connected, state}
  end
end
