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

  # Main WebSocket for Terminal
  get "/ws" do
    conn
    |> WebSockAdapter.upgrade(Portfolio.SocketHandler, [], timeout: 60_000)
    |> halt()
  end

  # WebSocket for Philosophers (maintaining backward compatibility with my recent change)
  get "/socket" do
    conn
    |> WebSockAdapter.upgrade(Portfolio.SocketHandler, [], timeout: 60_000)
    |> halt()
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
