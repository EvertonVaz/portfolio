defmodule Portfolio.Pong.GameSupervisor do
  use DynamicSupervisor

  def start_link(_opts) do
    DynamicSupervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def start_game(room_id) do
    DynamicSupervisor.start_child(__MODULE__, {Portfolio.Pong.GameServer, room_id})
  end

  @impl true
  def init(:ok) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end
end
