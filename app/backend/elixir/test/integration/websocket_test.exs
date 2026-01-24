defmodule Portfolio.WebSocketTest do
  use ExUnit.Case, async: true
  import Plug.Test
  import Plug.Conn

  alias Portfolio.Router

  @opts Router.init([])
  @valid_token "valid-terminal-token"

  describe "WebSocket authentication" do
    test "GET /ws returns 401 when token is missing" do
      conn = %{conn(:get, "/ws") | host: "localhost"}
      conn = Router.call(conn, @opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /ws fails with invalid token" do
      conn =
        %{conn(:get, "/ws") | host: "localhost"}
        |> put_req_header("sec-websocket-protocol", "invalid-token")

      conn = Router.call(conn, @opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /socket returns 401 when token is missing" do
      conn = %{conn(:get, "/socket") | host: "localhost"}
      conn = Router.call(conn, @opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /socket fails with invalid token" do
      conn =
        %{conn(:get, "/socket") | host: "localhost"}
        |> put_req_header("sec-websocket-protocol", "invalid-token")

      conn = Router.call(conn, @opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /socket passes auth with valid token" do
      conn =
        %{conn(:get, "/socket") | host: "localhost"}
        |> put_req_header("sec-websocket-protocol", @valid_token)
        |> put_req_header("upgrade", "websocket")
        |> put_req_header("connection", "upgrade")
        |> put_req_header("sec-websocket-version", "13")
        |> put_req_header("sec-websocket-key", "dGhlIHNhbXBsZSBub25jZQ==")

      # We catch the WrapperError because WebSockAdapter needs a real transport/host header to succeed,
      # but reaching the 'upgrade' call inside Router means auth passed.
      assert_raise Plug.Conn.WrapperError, fn ->
        Router.call(conn, @opts)
      end
    end
  end
end
