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
        result = Messaging.Executor.execute(valid_msg)
        Messaging.Sanitizer.sanitize_response(result, valid_msg)

      {:error, reason} ->
        {:error, reason}
    end
  end

  def hello do
    :world
  end
end
