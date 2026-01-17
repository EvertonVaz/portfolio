defmodule Messaging.Application do
  use Application

  @impl true
  def start(_type, _args) do
    # Configura a porta do servidor (default 4000)
    port = String.to_integer(System.get_env("PORT") || "4000")

    children = [
      # Inicia o servidor Bandit com o nosso Router
      {Bandit, plug: Messaging.Router, port: port}
    ]

    opts = [strategy: :one_for_one, name: Messaging.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
