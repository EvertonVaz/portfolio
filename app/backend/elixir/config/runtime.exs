import Config

port = String.to_integer(System.get_env("PORT") || "4000")

# atenção: "" é truthy em Elixir — uma env var vazia precisa cair no default
secret_key_base =
  case System.get_env("SECRET_KEY_BASE") do
    value when is_binary(value) and byte_size(value) >= 64 ->
      value

    _ ->
      if config_env() == :prod do
        raise """
        SECRET_KEY_BASE ausente ou com menos de 64 bytes.
        Gere um com: mix phx.gen.secret
        """
      end

      "dev_only_secret_key_base_replace_in_production_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  end

# token do websocket do terminal — mesmo cuidado com env var vazia
auth_token =
  case System.get_env("AUTH_SECRET_KEY") do
    value when is_binary(value) and byte_size(value) >= 32 ->
      value

    _ ->
      if config_env() == :prod do
        raise """
        AUTH_SECRET_KEY ausente ou com menos de 32 bytes.
        Gere um com: mix phx.gen.secret 32
        """
      end

      "dev_only_auth_token_replace_in_production_xxxxxx"
  end

config :portfolio, :auth_token, auth_token

config :portfolio, PortfolioWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: port],
  secret_key_base: secret_key_base

config :portfolio, :pong,
  width:         String.to_integer(System.get_env("GAME_WIDTH",       "800")),
  height:        String.to_integer(System.get_env("GAME_HEIGHT",      "600")),
  paddle_width:  String.to_integer(System.get_env("PADDLE_WIDTH",     "12")),
  paddle_height: String.to_integer(System.get_env("PADDLE_HEIGHT",    "80")),
  paddle_speed:  String.to_float(  System.get_env("PADDLE_SPEED",     "5.0")),
  ball_radius:   String.to_integer(System.get_env("BALL_RADIUS",      "8")),
  player_x:      String.to_integer(System.get_env("PLAYER_X",         "20")),
  ai_x:          String.to_integer(System.get_env("AI_X",             "768")),
  win_score:     String.to_integer(System.get_env("WIN_SCORE",        "7")),
  tick_ms:       String.to_integer(System.get_env("TICK_MS",          "16")),
  max_ball_speed: String.to_float( System.get_env("MAX_BALL_SPEED",   "10.0")),
  ball_accel:     String.to_float( System.get_env("BALL_ACCEL",       "1.05")),
  idle_grace_ms:  String.to_integer(System.get_env("IDLE_GRACE_MS",   "30000"))
