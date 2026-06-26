import Config

port = String.to_integer(System.get_env("PORT") || "4000")

# In production, set SECRET_KEY_BASE to a random 64+ char string.
# Generate with: mix phx.gen.secret
secret_key_base =
  System.get_env("SECRET_KEY_BASE") ||
    "dev_only_secret_key_base_replace_in_production_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

config :portfolio, PortfolioWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: port],
  secret_key_base: secret_key_base
