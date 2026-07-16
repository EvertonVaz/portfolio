defmodule Portfolio.Pong.GameServer do
  use GenServer

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

  def set_mode(room_id, mode) do
    GenServer.cast(via(room_id), {:set_mode, mode})
  end

  def set_models(room_id, ai_model, player_model) do
    GenServer.cast(via(room_id), {:set_models, ai_model, player_model})
  end

  def set_ai_direction(room_id, direction, nn_viz \\ nil, player_direction \\ nil) do
    GenServer.cast(via(room_id), {:ai_direction, direction, nn_viz, player_direction})
  end

  defp via(room_id) do
    {:via, Registry, {Portfolio.Pong.Registry, room_id}}
  end

  @impl true
  def init(room_id) do
    cfg = Application.get_env(:portfolio, :pong) |> Map.new()
    Process.send_after(self(), :tick, cfg.tick_ms)
    {:ok, initial_state(room_id, cfg)}
  end

  @impl true
  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  @impl true
  # Em aivai a raquete esquerda é controlada pelo agente — ignora input humano
  def handle_cast({:player_direction, _direction}, %{mode: :aivai} = state) do
    {:noreply, state}
  end

  def handle_cast({:player_direction, direction}, state) do
    {:noreply, %{state | player_direction: direction}}
  end

  def handle_cast(:restart, state) do
    {:noreply, initial_state(state.room_id, state.cfg, state.mode, state.ai_model, state.player_model)}
  end

  def handle_cast({:set_mode, mode}, state) do
    {:noreply, initial_state(state.room_id, state.cfg, mode, state.ai_model, state.player_model)}
  end

  # Troca de modelo ao vivo — não reinicia a partida
  def handle_cast({:set_models, ai_model, player_model}, state) do
    {:noreply, %{state | ai_model: ai_model, player_model: player_model}}
  end

  def handle_cast({:ai_direction, direction, nn_viz, player_direction}, state) do
    state = %{state | ai_direction: direction, nn_viz: nn_viz}

    state =
      if state.mode == :aivai and player_direction != nil,
        do: %{state | player_direction: player_direction},
        else: state

    {:noreply, state}
  end

  @impl true
  def handle_info(:tick, %{status: :game_over} = state) do
    Phoenix.PubSub.broadcast(Portfolio.PubSub, "game:#{state.room_id}", {:game_state, state})
    Process.send_after(self(), :tick, state.cfg.tick_ms)
    {:noreply, state}
  end

  def handle_info(:tick, state) do
    new_state = tick(state)
    Phoenix.PubSub.broadcast(Portfolio.PubSub, "game:#{state.room_id}", {:game_state, new_state})
    maybe_publish_ai_state(new_state)
    Process.send_after(self(), :tick, state.cfg.tick_ms)
    {:noreply, new_state}
  end

  @ai_publish_every 3

  defp maybe_publish_ai_state(%{tick_count: n} = state) when rem(n, @ai_publish_every) == 0 do
    Portfolio.Pong.AmqpBridge.publish_state(state.room_id, state)
  end
  defp maybe_publish_ai_state(_state), do: :ok

  defp initial_state(room_id, cfg, mode \\ :pvp, ai_model \\ "ppo", player_model \\ "ppo") do
    %{
      room_id: room_id,
      cfg: cfg,
      mode: mode,
      ai_model: ai_model,
      player_model: player_model,
      ball: %{x: cfg.width / 2.0, y: cfg.height / 2.0, vx: 4.0, vy: 3.0},
      player: %{y: (cfg.height - cfg.paddle_height) / 2.0, score: 0},
      ai: %{y: (cfg.height - cfg.paddle_height) / 2.0, score: 0},
      player_direction: :stop,
      ai_direction: nil,
      nn_viz: nil,
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

  defp move_player(%{player: player, player_direction: dir, cfg: cfg} = state) do
    new_y = case dir do
      :up   -> max(0.0, player.y - cfg.paddle_speed)
      :down -> min((cfg.height - cfg.paddle_height) * 1.0, player.y + cfg.paddle_speed)
      _     -> player.y
    end
    %{state | player: %{player | y: new_y}}
  end

  # Direção recebida do serviço Python — mantém até chegar a próxima
  # (não reseta para nil: a ação persiste entre mensagens, como no treino)
  defp move_ai(%{ai_direction: dir, cfg: cfg} = state) when not is_nil(dir) do
    new_y = case dir do
      :up   -> max(0.0, state.ai.y - cfg.paddle_speed)
      :down -> min((cfg.height - cfg.paddle_height) * 1.0, state.ai.y + cfg.paddle_speed)
      :stop -> state.ai.y
    end
    %{state | ai: %{state.ai | y: new_y}}
  end

  # Serviço Python nunca respondeu — fallback rule-based
  defp move_ai(%{cfg: cfg} = state) do
    new_y = Portfolio.Pong.RuleBasedAI.next_y(
      state.ai.y, state.ball, cfg.paddle_height, cfg.paddle_speed, cfg.height
    )
    %{state | ai: %{state.ai | y: new_y}}
  end

  defp move_ball(%{ball: ball} = state) do
    %{state | ball: %{ball | x: ball.x + ball.vx, y: ball.y + ball.vy}}
  end

  defp check_collisions(%{ball: ball, cfg: cfg} = state) do
    ball =
      ball
      |> bounce_walls(cfg)
      |> bounce_player_paddle(state.player.y, cfg)
      |> bounce_ai_paddle(state.ai.y, cfg)

    %{state | ball: ball}
  end

  defp bounce_walls(%{y: y, vy: vy} = ball, cfg) do
    cond do
      y - cfg.ball_radius <= 0          -> %{ball | y: cfg.ball_radius * 1.0, vy: abs(vy)}
      y + cfg.ball_radius >= cfg.height -> %{ball | y: (cfg.height - cfg.ball_radius) * 1.0, vy: -abs(vy)}
      true -> ball
    end
  end

  defp bounce_player_paddle(%{x: x, y: y, vx: vx} = ball, paddle_y, cfg) do
    if vx < 0 and x - cfg.ball_radius <= cfg.player_x + cfg.paddle_width and
       y >= paddle_y and y <= paddle_y + cfg.paddle_height do
      relative = (y - (paddle_y + cfg.paddle_height / 2.0)) / (cfg.paddle_height / 2.0)
      %{ball | x: (cfg.player_x + cfg.paddle_width + cfg.ball_radius) * 1.0, vx: accelerate(vx, cfg), vy: relative * 5.0}
    else
      ball
    end
  end

  defp bounce_ai_paddle(%{x: x, y: y, vx: vx} = ball, paddle_y, cfg) do
    if vx > 0 and x + cfg.ball_radius >= cfg.ai_x and
       y >= paddle_y and y <= paddle_y + cfg.paddle_height do
      relative = (y - (paddle_y + cfg.paddle_height / 2.0)) / (cfg.paddle_height / 2.0)
      %{ball | x: (cfg.ai_x - cfg.ball_radius) * 1.0, vx: -accelerate(vx, cfg), vy: relative * 5.0}
    else
      ball
    end
  end

  # Bola acelera a cada rebatida de raquete até o teto — torna a defesa
  # perfeita impossível em ralis longos, forçando o jogo ofensivo
  defp accelerate(vx, cfg) do
    min(abs(vx) * cfg.ball_accel, cfg.max_ball_speed)
  end

  defp check_score(%{ball: ball, cfg: cfg} = state) do
    cond do
      ball.x < 0 ->
        new_score = state.ai.score + 1
        if new_score >= cfg.win_score do
          %{state | ai: %{state.ai | score: new_score}, status: :game_over}
        else
          reset_ball(%{state | ai: %{state.ai | score: new_score}}, :left)
        end

      ball.x > cfg.width ->
        new_score = state.player.score + 1
        if new_score >= cfg.win_score do
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
    %{state | ball: %{x: state.cfg.width / 2.0, y: state.cfg.height / 2.0, vx: vx, vy: vy}, player_direction: :stop}
  end
end
