defmodule Portfolio.AuthTest do
  use ExUnit.Case, async: true
  use Plug.Test

  alias Portfolio.Auth

  describe "generate_token/0" do
    test "returns a valid terminal token" do
      assert Auth.generate_token() == "valid-terminal-token"
    end
  end

  describe "validate_token/1" do
    test "returns true for valid terminal token" do
      assert Auth.validate_token("valid-terminal-token") == true
    end

    test "returns false for invalid token" do
      assert Auth.validate_token("invalid") == false
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
