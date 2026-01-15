defmodule Messaging do
  @moduledoc """
  Documentation for `Messaging`.
  """

  @doc """
  Hello world.

  ## Examples

      iex> Messaging.hello()
      :world

  """
  def process(payload) do
    case Messaging.Sanitizer.sanitize(payload) do
      {:ok, valid_msg} ->
        result = Messaging.Executer.execute(valid_msg)
        result = Messaging.Sanitizer.sanitize_response(result, valid_msg)
        {:ok, result}

      {:error, reason} ->
        {:error, reason}
    end
  end

  def hello do
    :world
  end
end
