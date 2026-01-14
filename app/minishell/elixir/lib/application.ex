defmodule Messaging.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Inicia o consumidor como uma Task supervisionada
      {Task, fn -> Messaging.Consumer.wait_for_messages() end}
    ]

    opts = [strategy: :one_for_one, name: Messaging.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
