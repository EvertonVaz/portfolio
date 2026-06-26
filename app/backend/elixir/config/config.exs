import Config

config :portfolio, PortfolioWeb.Endpoint,
  adapter: Bandit.PhoenixAdapter,
  url: [host: "localhost"]

config :phoenix, :json_library, Jason
