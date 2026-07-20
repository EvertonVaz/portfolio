defmodule Portfolio.Pong.GameServerTest do
  use ExUnit.Case, async: false

  alias Portfolio.Pong.{GameServer, GameSupervisor}

  setup do
    original = Application.get_env(:portfolio, :pong)
    # grace curto para o teste não esperar 30s
    Application.put_env(:portfolio, :pong, Keyword.put(original, :idle_grace_ms, 100))
    on_exit(fn -> Application.put_env(:portfolio, :pong, original) end)
    :ok
  end

  defp unique_room, do: "test-#{System.unique_integer([:positive])}"

  test "encerra sozinho quando o último viewer sai" do
    room = unique_room()
    {:ok, game} = GameSupervisor.start_game(room)
    ref = Process.monitor(game)

    viewer = spawn(fn -> Process.sleep(:infinity) end)
    GameServer.viewer_joined(room, viewer)
    # barreira síncrona: garante que o cast de viewer_joined foi processado
    _ = GameServer.get_state(room)

    Process.exit(viewer, :kill)

    assert_receive {:DOWN, ^ref, :process, ^game, :normal}, 1_000
  end

  test "segue vivo enquanto houver ao menos um viewer" do
    room = unique_room()
    {:ok, game} = GameSupervisor.start_game(room)

    v1 = spawn(fn -> Process.sleep(:infinity) end)
    v2 = spawn(fn -> Process.sleep(:infinity) end)
    GameServer.viewer_joined(room, v1)
    GameServer.viewer_joined(room, v2)
    _ = GameServer.get_state(room)

    Process.exit(v1, :kill)
    # espera mais que o grace: v2 ainda está vivo, não pode encerrar
    Process.sleep(300)

    assert Process.alive?(game)
  end

  test "encerra se nenhum viewer se registrar (game órfão)" do
    room = unique_room()
    {:ok, game} = GameSupervisor.start_game(room)
    ref = Process.monitor(game)

    assert_receive {:DOWN, ^ref, :process, ^game, :normal}, 1_000
  end
end
