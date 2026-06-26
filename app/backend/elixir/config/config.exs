import Config

config :portfolio, PortfolioWeb.Endpoint,
  adapter: Bandit.PhoenixAdapter,
  url: [host: "localhost"],
  server: true,
  check_origin: false,
  pubsub_server: Portfolio.PubSub

config :phoenix, :json_library, Jason

