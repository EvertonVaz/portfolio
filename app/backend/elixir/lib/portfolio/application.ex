defmodule Portfolio.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    port = String.to_integer(System.get_env("PORT") || "4000")

    children = [
      {Bandit, plug: Portfolio.Router, scheme: :http, port: port, ip: {0, 0, 0, 0}}
    ]

    opts = [strategy: :one_for_one, name: Portfolio.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
