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
    Messaging.Services.CommandProcessor.process(payload)
  end

  def hello do
    :world
  end
end
