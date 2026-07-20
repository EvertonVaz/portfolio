defmodule Portfolio.Auth do
  @moduledoc """
  Autenticação dos websockets do terminal.

  O cliente recebe um `Phoenix.Token` de vida curta, assinado e amarrado à sua
  sessão — não um segredo estático. `AUTH_SECRET_KEY` entra como salt: rotacionar
  a variável invalida de uma vez todos os tokens já emitidos.
  """

  require Logger

  # janela curta: o front pede o token imediatamente antes de abrir o socket
  @max_age 300

  def max_age, do: @max_age

  def generate_token(session_id, opts \\ [])

  def generate_token(session_id, opts) when is_binary(session_id) do
    Phoenix.Token.sign(PortfolioWeb.Endpoint, salt(), session_id, opts)
  end

  def generate_token(_session_id, _opts), do: nil

  def validate_token(token, session_id)
      when is_binary(token) and token != "" and is_binary(session_id) do
    case Phoenix.Token.verify(PortfolioWeb.Endpoint, salt(), token, max_age: @max_age) do
      {:ok, ^session_id} ->
        true

      {:ok, _outra_sessao} ->
        Logger.warning("[Auth] token válido, mas de outra sessão")
        false

      {:error, reason} ->
        Logger.warning("[Auth] token recusado: #{inspect(reason)}")
        false
    end
  end

  def validate_token(_token, _session_id), do: false

  def validate_request(conn) do
    # Check for x-terminal-request header as required in previous specs
    case Plug.Conn.get_req_header(conn, "x-terminal-request") do
      ["true"] -> {:ok, conn}
      _ -> {:error, :unauthorized}
    end
  end

  defp salt do
    Application.get_env(:portfolio, :auth_token) ||
      raise "AUTH_SECRET_KEY não configurado"
  end
end
