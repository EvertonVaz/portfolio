defmodule Portfolio.Pong.GameServer do
  use GenServer

  @tick_ms 16
  @width 800
  @height 600
  @paddle_width 12
  @paddle_height 80
  @paddle_speed 5.0
  @ball_radius 8
  @player_x 20
  @ai_x 768
  @win_score 7

  def start_link(room_id) do
    GenServer.start_link(__MODULE__, room_id, name: via(room_id))
  end

  def set_player_direction(room_id, direction) do
    GenServer.cast(via(room_id), {:player_direction, direction})
  end

  def get_state(room_id) do
    GenServer.call(via(room_id), :get_state)
  end

  def restart(room_id) do
    GenServer.cast(via(room_id), :restart)
  end

  def set_ai_direction(room_id, direction) do
    GenServer.cast(via(room_id), {:ai_direction, direction})
  end

  defp via(room_id) do
    {:via, Registry, {Portfolio.Pong.Registry, room_id}}
  end

  @impl true
  def init(room_id) do
    schedule_tick()
    {:ok, initial_state(room_id)}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_cast({:player_direction, direction}, state) do
    {:noreply, %{state | player_direction: direction}}
  end

  def handle_cast(:restart, state) do
    new_state = initial_state(state.room_id)
    schedule_tick()
    {:noreply, new_state}
  end

  def handle_cast({:ai_direction, direction}, state) do
    {:noreply, %{state | ai_direction: direction}}
  end

  @impl true
  def handle_info(:tick, %{status: :game_over} = state) do
    Phoenix.PubSub.broadcast(Portfolio.PubSub, "game:#{state.room_id}", {:game_state, state})
    schedule_tick()
    {:noreply, state}
  end

  def handle_info(:tick, state) do
    new_state = tick(state)
    Phoenix.PubSub.broadcast(Portfolio.PubSub, "game:#{state.room_id}", {:game_state, new_state})
    maybe_publish_ai_state(new_state)
    schedule_tick()
    {:noreply, new_state}
  end

  @ai_publish_every 3

  defp maybe_publish_ai_state(%{tick_count: n} = state) when rem(n, @ai_publish_every) == 0 do
    Portfolio.Pong.AmqpBridge.publish_state(state.room_id, state)
  end
  defp maybe_publish_ai_state(_state), do: :ok

  defp schedule_tick, do: Process.send_after(self(), :tick, @tick_ms)

  defp initial_state(room_id) do
    %{
      room_id: room_id,
      ball: %{x: @width / 2.0, y: @height / 2.0, vx: 4.0, vy: 3.0},
      player: %{y: (@height - @paddle_height) / 2.0, score: 0},
      ai: %{y: (@height - @paddle_height) / 2.0, score: 0},
      player_direction: :stop,
      ai_direction: nil,
      tick_count: 0,
      status: :playing
    }
  end

  defp tick(state) do
    state
    |> Map.update!(:tick_count, &(&1 + 1))
    |> move_player()
    |> move_ai()
    |> move_ball()
    |> check_collisions()
    |> check_score()
  end

  defp move_player(%{player: player, player_direction: dir} = state) do
    new_y = case dir do
      :up -> max(0.0, player.y - @paddle_speed)
      :down -> min((@height - @paddle_height) * 1.0, player.y + @paddle_speed)
      _ -> player.y
    end
    %{state | player: %{player | y: new_y}}
  end

  defp move_ai(%{ai_direction: dir} = state) when not is_nil(dir) do
    new_y = case dir do
      :up -> max(0.0, state.ai.y - @paddle_speed)
      :down -> min((@height - @paddle_height) * 1.0, state.ai.y + @paddle_speed)
      :stop -> state.ai.y
    end
    %{state | ai: %{state.ai | y: new_y}, ai_direction: nil}
  end

  defp move_ai(state) do
    new_y = Portfolio.Pong.RuleBasedAI.next_y(
      state.ai.y, state.ball, @paddle_height, @paddle_speed, @height
    )
    %{state | ai: %{state.ai | y: new_y}}
  end

  defp move_ball(%{ball: ball} = state) do
    %{state | ball: %{ball | x: ball.x + ball.vx, y: ball.y + ball.vy}}
  end

  defp check_collisions(%{ball: ball} = state) do
    ball =
      ball
      |> bounce_walls()
      |> bounce_player_paddle(state.player.y)
      |> bounce_ai_paddle(state.ai.y)

    %{state | ball: ball}
  end

  defp bounce_walls(%{y: y, vy: vy} = ball) do
    cond do
      y - @ball_radius <= 0 -> %{ball | y: @ball_radius * 1.0, vy: abs(vy)}
      y + @ball_radius >= @height -> %{ball | y: (@height - @ball_radius) * 1.0, vy: -abs(vy)}
      true -> ball
    end
  end

  defp bounce_player_paddle(%{x: x, y: y, vx: vx} = ball, paddle_y) do
    if vx < 0 and x - @ball_radius <= @player_x + @paddle_width and
       y >= paddle_y and y <= paddle_y + @paddle_height do
      relative = (y - (paddle_y + @paddle_height / 2.0)) / (@paddle_height / 2.0)
      %{ball | x: (@player_x + @paddle_width + @ball_radius) * 1.0, vx: abs(vx), vy: relative * 5.0}
    else
      ball
    end
  end

  defp bounce_ai_paddle(%{x: x, y: y, vx: vx} = ball, paddle_y) do
    if vx > 0 and x + @ball_radius >= @ai_x and
       y >= paddle_y and y <= paddle_y + @paddle_height do
      relative = (y - (paddle_y + @paddle_height / 2.0)) / (@paddle_height / 2.0)
      %{ball | x: (@ai_x - @ball_radius) * 1.0, vx: -abs(vx), vy: relative * 5.0}
    else
      ball
    end
  end

  defp check_score(%{ball: ball} = state) do
    cond do
      ball.x < 0 ->
        new_score = state.ai.score + 1
        if new_score >= @win_score do
          %{state | ai: %{state.ai | score: new_score}, status: :game_over}
        else
          reset_ball(%{state | ai: %{state.ai | score: new_score}}, :left)
        end

      ball.x > @width ->
        new_score = state.player.score + 1
        if new_score >= @win_score do
          %{state | player: %{state.player | score: new_score}, status: :game_over}
        else
          reset_ball(%{state | player: %{state.player | score: new_score}}, :right)
        end

      true ->
        state
    end
  end

  defp reset_ball(state, scored_side) do
    vx = if scored_side == :right, do: 4.0, else: -4.0
    vy = if :rand.uniform() > 0.5, do: 3.0, else: -3.0
    %{state | ball: %{x: @width / 2.0, y: @height / 2.0, vx: vx, vy: vy}, player_direction: :stop}
  end
end
