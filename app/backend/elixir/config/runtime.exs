import Config

port = String.to_integer(System.get_env("PORT") || "4000")

secret_key_base =
  System.get_env("SECRET_KEY_BASE") ||
    "dev_only_secret_key_base_replace_in_production_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

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
  ball_accel:     String.to_float( System.get_env("BALL_ACCEL",       "1.05"))
