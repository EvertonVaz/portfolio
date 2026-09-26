# :sandbox precisa do shell-sandbox no ar (docker compose); rode com `mix test --only sandbox`
ExUnit.start(exclude: [:sandbox])
