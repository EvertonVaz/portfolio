defmodule Portfolio.WebSocketTest do
  use ExUnit.Case, async: false
  import Plug.Test
  import Plug.Conn

  alias Portfolio.Router

  @opts Router.init([])
  @session_cookie "_portfolio_session"

  defp base_conn(path) do
    %{conn(:get, path) | host: "localhost"}
    |> Map.put(:secret_key_base, PortfolioWeb.Endpoint.config(:secret_key_base))
  end

  # pede um token pelo fluxo real e devolve {token, cookie de sessão}
  defp issue_token do
    conn =
      base_conn("/api/token")
      |> put_req_header("x-terminal-request", "true")
      |> Router.call(@opts)

    %{"token" => token} = Jason.decode!(conn.resp_body)
    {token, conn.resp_cookies[@session_cookie].value}
  end

  defp ws_conn(path, token, cookie) do
    base_conn(path)
    |> put_req_header("sec-websocket-protocol", token)
    |> put_req_header("cookie", "#{@session_cookie}=#{cookie}")
    |> put_req_header("upgrade", "websocket")
    |> put_req_header("connection", "upgrade")
    |> put_req_header("sec-websocket-version", "13")
    |> put_req_header("sec-websocket-key", "dGhlIHNhbXBsZSBub25jZQ==")
  end

  describe "WebSocket authentication" do
    test "GET /minishell returns 401 when token is missing" do
      conn = base_conn("/ws/minishell") |> Router.call(@opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /minishell fails with invalid token" do
      conn =
        base_conn("/ws/minishell")
        |> put_req_header("sec-websocket-protocol", "invalid-token")
        |> Router.call(@opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /philosophers returns 401 when token is missing" do
      conn = base_conn("/ws/philosophers") |> Router.call(@opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /philosophers fails with invalid token" do
      conn =
        base_conn("/ws/philosophers")
        |> put_req_header("sec-websocket-protocol", "invalid-token")
        |> Router.call(@opts)

      assert conn.status == 401
      assert conn.resp_body == "Unauthorized"
    end

    test "GET /philosophers passes auth with a token issued to this session" do
      {token, cookie} = issue_token()

      # We catch the WrapperError because WebSockAdapter needs a real transport/host header to succeed,
      # but reaching the 'upgrade' call inside Router means auth passed.
      assert_raise Plug.Conn.WrapperError, fn ->
        ws_conn("/ws/philosophers", token, cookie) |> Router.call(@opts)
      end
    end

    test "token válido não serve para outra sessão" do
      {token, _cookie} = issue_token()
      {_outro_token, outro_cookie} = issue_token()

      conn = ws_conn("/ws/philosophers", token, outro_cookie) |> Router.call(@opts)

      assert conn.status == 401
    end

    test "token sem o cookie da sessão é recusado" do
      {token, _cookie} = issue_token()

      conn =
        base_conn("/ws/philosophers")
        |> put_req_header("sec-websocket-protocol", token)
        |> Router.call(@opts)

      assert conn.status == 401
    end
  end
end
