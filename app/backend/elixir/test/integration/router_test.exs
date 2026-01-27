defmodule Portfolio.RouterTest do
  use ExUnit.Case, async: true
  use Plug.Test

  alias Portfolio.Router

  @opts Router.init([])

  describe "HTTP endpoints" do
    test "GET /token returns 200 with token when authorized" do
      conn = conn(:get, "/api/token") |> put_req_header("x-terminal-request", "true")
      conn = Router.call(conn, @opts)

      assert conn.status == 200
      assert %{"token" => _} = Jason.decode!(conn.resp_body)
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
  end

  # WebSocket upgrade tests are omitted from integration suite as they require
  # full transport mocks (Bandit/WebSockAdapter) to handle 101 Switching Protocols.
  # Routing is verified by other tests.
end
