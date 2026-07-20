defmodule PortfolioWeb.GameChannelTest do
  use ExUnit.Case, async: false
  import Phoenix.ChannelTest

  @endpoint PortfolioWeb.Endpoint

  alias PortfolioWeb.UserSocket

  setup do
    original = Application.get_env(:portfolio, :pong)
    Application.put_env(:portfolio, :pong, Keyword.put(original, :idle_grace_ms, 100))
    on_exit(fn -> Application.put_env(:portfolio, :pong, original) end)
    :ok
  end

  defp session(room_id), do: [connect_info: %{session: %{"pong_room" => room_id}}]

  test "recusa a conexão sem sessão" do
    assert :error = connect(UserSocket, %{}, connect_info: %{session: nil})
  end

  test "a sala vem da sessão, não do tópico enviado pelo cliente" do
    {:ok, socket} = connect(UserSocket, %{}, session("sala-da-sessao"))
    # o cliente pede outro tópico de propósito; deve ser ignorado
    {:ok, _, socket} = subscribe_and_join(socket, "game:tentativa-do-cliente", %{})

    assert socket.assigns.room_id == "sala-da-sessao"
    assert Registry.lookup(Portfolio.Pong.Registry, "sala-da-sessao") != []
    assert Registry.lookup(Portfolio.Pong.Registry, "tentativa-do-cliente") == []
  end

  test "sessões diferentes jogam em salas diferentes" do
    {:ok, s1} = connect(UserSocket, %{}, session("sala-a"))
    {:ok, s2} = connect(UserSocket, %{}, session("sala-b"))
    {:ok, _, s1} = subscribe_and_join(s1, "game:pong", %{})
    {:ok, _, s2} = subscribe_and_join(s2, "game:pong", %{})

    refute s1.assigns.room_id == s2.assigns.room_id

    push(s1, "player_move", %{"direction" => "up"})
    # o estado de cada sala é independente
    assert_push("game_state", state_a, 500)
    assert is_map(state_a)
  end

  test "a sala encerra quando o último channel sai" do
    {:ok, socket} = connect(UserSocket, %{}, session("sala-efemera"))
    {:ok, _, socket} = subscribe_and_join(socket, "game:pong", %{})

    [{game, _}] = Registry.lookup(Portfolio.Pong.Registry, "sala-efemera")
    ref = Process.monitor(game)

    # o processo de teste está linkado ao channel; sair sem derrubar o teste junto
    Process.unlink(socket.channel_pid)
    leave(socket)

    assert_receive {:DOWN, ^ref, :process, ^game, :normal}, 1_000
  end
end
