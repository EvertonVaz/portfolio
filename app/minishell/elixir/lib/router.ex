defmodule Messaging.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  # Libera CORS de forma controlada
  plug Corsica,
    origins: "*",
    allow_headers: ["content-type", "x-terminal-request"]

  plug :fetch_query_params
  plug :match
  plug :dispatch

  # Middleware para blindar o endpoint de token
  defp validate_terminal_request(conn, _opts) do
    is_same_origin = get_req_header(conn, "sec-fetch-site") in [["same-origin"], []]
    has_custom_header = get_req_header(conn, "x-terminal-request") == ["true"]

    if is_same_origin and has_custom_header do
      conn
    else
      Logger.warn("[SECURITY] Tentativa de acesso bloqueada ao /token. Origin: #{inspect(get_req_header(conn, "sec-fetch-site"))}")
      conn |> send_resp(403, "Forbidden") |> halt()
    end
  end

  get "/token" do
    conn
    |> validate_terminal_request([])
    |> do_get_token()
  end

  defp do_get_token(conn) do
    token = Messaging.Auth.generate_token()
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{token: token}))
  end

  get "/ws" do
    token =
      conn
      |> get_req_header("sec-websocket-protocol")
      |> List.first()

    case Messaging.Auth.verify_token(token) do
      :ok ->
        conn
        |> put_resp_header("sec-websocket-protocol", token)
        |> WebSockAdapter.upgrade(Messaging.SocketHandler, [], timeout: 60_000)
        |> halt()

      :error ->
        conn
        |> send_resp(401, "Unauthorized")
        |> halt()
    end
  end

  match _ do
    send_resp(conn, 404, "Not Found")
  end
end
