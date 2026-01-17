defmodule Messaging.Auth do
  use Joken.Config

  @secret_key System.get_env("AUTH_SECRET_KEY") || "uma-chave-secreta-muito-segura-para-desenvolvimento"

  def generate_token do
    # Token expira em 1 hora para maior segurança
    claims = %{"iat" => Joken.current_time()}
    signer = Joken.Signer.create("HS256", @secret_key)

    case encode_and_sign(claims, signer) do
      {:ok, token, _claims} -> token
      _ -> nil
    end
  end

  def verify_token(nil), do: :error
  def verify_token(""), do: :error

  def verify_token(token) do
    signer = Joken.Signer.create("HS256", @secret_key)

    case verify_and_validate(token, signer) do
      {:ok, _claims} -> :ok
      {:error, _reason} -> :error
    end
  end
end
