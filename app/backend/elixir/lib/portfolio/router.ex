defmodule Portfolio.Router do
  use Plug.Router

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  get "/" do
    send_resp(conn, 200, "Portfolio Backend API")
  end

  get "/token" do
    case Portfolio.Auth.validate_request(conn) do
      {:ok, _} ->
        token = Portfolio.Auth.generate_token()

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{token: token}))

      {:error, _} ->
        send_resp(conn, 401, "Unauthorized")
    end
  end

  require Logger

  # Main WebSocket for Terminal
  get "/ws" do
    token = get_req_header(conn, "sec-websocket-protocol") |> List.first()
    Logger.info("[Router] WebSocket request to /ws with token: #{inspect(token)}")

    if Portfolio.Auth.validate_token(token) do
      conn
      |> put_resp_header("sec-websocket-protocol", token)
      |> WebSockAdapter.upgrade(Portfolio.SocketHandler, [], timeout: 60_000)
      |> halt()
    else
      Logger.warning("[Router] Connection rejected for /ws: Invalid token")
      send_resp(conn, 401, "Unauthorized")
    end
  end

  # Dedicated WebSocket for Philosophers
  get "/socket" do
    token = get_req_header(conn, "sec-websocket-protocol") |> List.first()
    Logger.info("[Router] WebSocket request to /socket with token: #{inspect(token)}")

    if Portfolio.Auth.validate_token(token) do
      conn
      |> put_resp_header("sec-websocket-protocol", token)
      |> WebSockAdapter.upgrade(Portfolio.SocketHandler, [], timeout: 60_000)
      |> halt()
    else
      Logger.warning("[Router] Connection rejected for /socket: Invalid token")
      send_resp(conn, 401, "Unauthorized")
    end
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
