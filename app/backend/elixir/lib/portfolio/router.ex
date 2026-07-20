defmodule Portfolio.Router do
  use Plug.Router

  @session_options Application.compile_env!(:portfolio, :session_options)

  plug(Plug.Logger)
  plug(Plug.Session, @session_options)
  plug(:match)
  plug(:dispatch)

  get "/api/token" do
    case Portfolio.Auth.validate_request(conn) do
      {:ok, _} ->
        conn = fetch_session(conn)
        session_id = session_id(conn)
        token = Portfolio.Auth.generate_token(session_id)

        conn
        |> put_session("terminal_sid", session_id)
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{token: token}))

      {:error, _} ->
        send_resp(conn, 401, "Unauthorized")
    end
  end

  # o token do terminal vale só para a sessão que o pediu — vazá-lo não permite
  # conectar de outro navegador
  defp session_id(conn) do
    get_session(conn, "terminal_sid") ||
      16 |> :crypto.strong_rand_bytes() |> Base.url_encode64(padding: false)
  end

  defp authorized_ws?(conn) do
    conn = fetch_session(conn)
    token = conn |> get_req_header("sec-websocket-protocol") |> List.first()
    Portfolio.Auth.validate_token(token, get_session(conn, "terminal_sid"))
  end

  # A identidade da sala é do backend: o cliente nunca escolhe nem lê o room_id.
  # Fica na sessão (cookie HttpOnly assinado), que viaja sozinha no handshake do
  # WebSocket. Reabrir a página reusa a mesma sala; outro navegador ganha a sua.
  get "/api/pong/room" do
    conn = fetch_session(conn)

    room_id =
      get_session(conn, "pong_room") ||
        16 |> :crypto.strong_rand_bytes() |> Base.url_encode64(padding: false)

    # o socket valida o CSRF contra o state guardado na sessão; o token em si é
    # público (só o room_id é secreto). O state é reaproveitado entre requests
    # para não invalidar tokens já entregues (ex.: reconexão do socket).
    csrf_state =
      conn
      |> get_session("_csrf_token")
      |> Plug.CSRFProtection.dump_state_from_session()

    Plug.CSRFProtection.load_state(conn.secret_key_base, csrf_state)
    csrf_token = Plug.CSRFProtection.get_csrf_token()

    conn
    |> put_session("pong_room", room_id)
    |> put_session("_csrf_token", Plug.CSRFProtection.dump_state())
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{csrf_token: csrf_token}))
  end

  require Logger

  # Main WebSocket for Terminal
  get "/ws/minishell" do
    token = get_req_header(conn, "sec-websocket-protocol") |> List.first()
    Logger.info("[Router] WebSocket request to /minishell")

    if authorized_ws?(conn) do
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
    Logger.info("[Router] WebSocket request to /philosophers")

    if authorized_ws?(conn) do
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
