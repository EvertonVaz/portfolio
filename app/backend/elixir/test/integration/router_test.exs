defmodule Portfolio.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  alias Portfolio.Router

  @opts Router.init([])

  describe "HTTP endpoints" do
    test "GET /token returns 200 with token when authorized" do
      conn =
        conn(:get, "/api/token")
        |> Map.put(:secret_key_base, PortfolioWeb.Endpoint.config(:secret_key_base))
        |> put_req_header("x-terminal-request", "true")
        |> Router.call(@opts)

      assert conn.status == 200
      assert %{"token" => token} = Jason.decode!(conn.resp_body)
      # o token é assinado e de vida curta, não o segredo da env
      refute token == Application.get_env(:portfolio, :auth_token)
      assert conn.resp_cookies["_portfolio_session"].http_only
    end

    test "GET /token returns 401 when unauthorized" do
      conn = conn(:get, "/api/token")
      conn = Router.call(conn, @opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /non-existent returns 404" do
      conn = conn(:get, "/non-existent")
      conn = Router.call(conn, @opts)

      assert conn.status == 404
      assert conn.resp_body == "Not found"
    end

    test "GET /api/pong/room returns a csrf token and sets an HttpOnly session cookie" do
      conn = pong_conn() |> Router.call(@opts)

      assert conn.status == 200
      assert %{"csrf_token" => token} = Jason.decode!(conn.resp_body)
      assert is_binary(token) and token != ""

      cookie = conn.resp_cookies["_portfolio_session"]
      assert cookie.http_only
      assert cookie.same_site == "Lax"
      # o room_id nunca vai no corpo — só na sessão assinada
      refute conn.resp_body =~ "pong_room"
    end

    test "clientes distintos recebem salas distintas" do
      c1 = pong_conn() |> Router.call(@opts)
      c2 = pong_conn() |> Router.call(@opts)

      refute session_room(c1) == session_room(c2)
    end

    test "o mesmo cliente reusa a sala ao recarregar" do
      first = pong_conn() |> Router.call(@opts)

      second =
        pong_conn()
        |> put_req_header("cookie", "_portfolio_session=#{session_cookie(first)}")
        |> Router.call(@opts)

      assert second.status == 200
      assert session_room(second) == session_room(first)
    end
  end

  # o Phoenix.Endpoint injeta o secret_key_base em runtime; aqui o Router roda solto
  defp pong_conn do
    conn(:get, "/api/pong/room")
    |> Map.put(:secret_key_base, PortfolioWeb.Endpoint.config(:secret_key_base))
  end

  defp session_cookie(conn), do: conn.resp_cookies["_portfolio_session"].value

  defp session_room(conn) do
    opts =
      :portfolio
      |> Application.get_env(:session_options)
      |> Keyword.drop([:store, :key])
      |> Plug.Session.COOKIE.init()

    {_, session} = Plug.Session.COOKIE.get(conn, session_cookie(conn), opts)
    session["pong_room"]
  end

  # WebSocket upgrade tests are omitted from integration suite as they require
  # full transport mocks (Bandit/WebSockAdapter) to handle 101 Switching Protocols.
  # Routing is verified by other tests.
end
