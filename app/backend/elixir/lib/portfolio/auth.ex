defmodule Portfolio.Auth do
  @moduledoc """
  Minimal authentication for the terminal websocket.
  """

  def generate_token do
    # For now, return a simple static token or a signed one
    # If Joken was used before, we can use it, but keeping it simple for now.
    "valid-terminal-token"
  end

  require Logger

  def validate_token(token) do
    Logger.debug("[Auth] Validating token: #{inspect(token)}")
    token == "valid-terminal-token"
  end

  def validate_request(conn) do
    # Check for x-terminal-request header as required in previous specs
    case Plug.Conn.get_req_header(conn, "x-terminal-request") do
      ["true"] -> {:ok, conn}
      _ -> {:error, :unauthorized}
    end
  end
end
