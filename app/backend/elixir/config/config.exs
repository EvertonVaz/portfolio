import Config

config :portfolio, PortfolioWeb.Endpoint,
  adapter: Bandit.PhoenixAdapter,
  url: [host: "localhost"],
  server: true,
  check_origin: false,
  pubsub_server: Portfolio.PubSub

config :phoenix, :json_library, Jason

# Sessão compartilhada entre o endpoint HTTP (que emite o cookie) e o socket
# (que o lê no handshake). Cookie assinado com o secret_key_base do endpoint.
config :portfolio, :session_options,
  store: :cookie,
  key: "_portfolio_session",
  signing_salt: "pong_room_v1",
  same_site: "Lax",
  http_only: true,
  max_age: 86_400

