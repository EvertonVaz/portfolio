defmodule Portfolio.AuthTest do
  use ExUnit.Case, async: false
  use Plug.Test

  alias Portfolio.Auth

  setup do
    original = Application.get_env(:portfolio, :auth_token)
    Application.put_env(:portfolio, :auth_token, "salt-de-teste-com-32-bytes-ok!!!")
    on_exit(fn -> Application.put_env(:portfolio, :auth_token, original) end)
    :ok
  end

  describe "generate_token/1" do
    test "emite um token assinado, não o segredo em si" do
      token = Auth.generate_token("sessao-a")

      assert is_binary(token)
      refute token == Application.get_env(:portfolio, :auth_token)
      refute token =~ "sessao-a"
    end
  end

  describe "validate_token/2" do
    test "aceita o token da própria sessão" do
      token = Auth.generate_token("sessao-a")
      assert Auth.validate_token(token, "sessao-a") == true
    end

    test "recusa token de outra sessão" do
      token = Auth.generate_token("sessao-a")
      assert Auth.validate_token(token, "sessao-b") == false
    end

    test "recusa token expirado" do
      antigo = System.system_time(:second) - Auth.max_age() - 60
      token = Auth.generate_token("sessao-a", signed_at: antigo)

      assert Auth.validate_token(token, "sessao-a") == false
    end

    test "aceita token ainda dentro da validade" do
      recente = System.system_time(:second) - 5
      token = Auth.generate_token("sessao-a", signed_at: recente)

      assert Auth.validate_token(token, "sessao-a") == true
    end

    test "recusa token adulterado" do
      token = Auth.generate_token("sessao-a") <> "x"
      assert Auth.validate_token(token, "sessao-a") == false
    end

    test "recusa token assinado com outro segredo" do
      token = Auth.generate_token("sessao-a")
      Application.put_env(:portfolio, :auth_token, "outro-salt-com-32-bytes-aqui!!!!")

      assert Auth.validate_token(token, "sessao-a") == false
    end

    test "recusa nil, vazio e sessão ausente" do
      token = Auth.generate_token("sessao-a")

      assert Auth.validate_token(nil, "sessao-a") == false
      assert Auth.validate_token("", "sessao-a") == false
      assert Auth.validate_token(token, nil) == false
    end

    test "o token estático antigo não vale mais" do
      assert Auth.validate_token("valid-terminal-token", "sessao-a") == false
    end
  end

  describe "validate_request/1" do
    test "returns :ok when x-terminal-request header is true" do
      conn = conn(:get, "/") |> put_req_header("x-terminal-request", "true")
      assert Auth.validate_request(conn) == {:ok, conn}
    end

    test "returns :error when x-terminal-request header is missing" do
      conn = conn(:get, "/")
      assert Auth.validate_request(conn) == {:error, :unauthorized}
    end

    test "returns :error when x-terminal-request header is incorrect" do
      conn = conn(:get, "/") |> put_req_header("x-terminal-request", "false")
      assert Auth.validate_request(conn) == {:error, :unauthorized}
    end
  end
end
