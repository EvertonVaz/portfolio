defmodule Portfolio.Router do
  use Plug.Router

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  get "/" do
    send_resp(conn, 200, "Portfolio Backend API")
  end

  # WebSocket upgrade
  get "/socket" do
    conn
    |> WebSockAdapter.upgrade(Portfolio.SocketHandler, [], timeout: 60_000)
    |> halt()
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
