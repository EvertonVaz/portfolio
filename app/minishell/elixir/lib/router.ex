defmodule Messaging.Router do
  use Plug.Router
  require Logger

  plug Plug.Logger
  # Libera CORS para o frontend React
  plug Corsica, origins: "*", allow_headers: ["content-type"]
  plug :fetch_query_params
  plug :match
  plug :dispatch

  get "/token" do
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
