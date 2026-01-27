defmodule Portfolio.Router do
  use Plug.Router

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  get "/api/token" do
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
  get "/ws/minishell" do
    token = get_req_header(conn, "sec-websocket-protocol") |> List.first()
    Logger.info("[Router] WebSocket request to /minishell with token: #{inspect(token)}")

    if Portfolio.Auth.validate_token(token) do
      conn = if token, do: put_resp_header(conn, "sec-websocket-protocol", token), else: conn

      conn
      |> WebSockAdapter.upgrade(PortfolioWeb.TerminalHandler, [], timeout: 60_000)
      |> halt()
    else
      Logger.warning("[Router] Connection rejected for /minishell: Invalid token")
      send_resp(conn, 401, "Unauthorized")
    end
  end

  # Dedicated WebSocket for Philosophers
  get "/ws/philosophers" do
    token = get_req_header(conn, "sec-websocket-protocol") |> List.first()
    Logger.info("[Router] WebSocket request to /philosophers with token: #{inspect(token)}")

    if Portfolio.Auth.validate_token(token) do
      conn = if token, do: put_resp_header(conn, "sec-websocket-protocol", token), else: conn

      conn
      |> WebSockAdapter.upgrade(PortfolioWeb.PhilosophersHandler, [], timeout: 60_000)
      |> halt()
    else
      Logger.warning("[Router] Connection rejected for /philosophers: Invalid token")
      send_resp(conn, 401, "Unauthorized")
    end
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
