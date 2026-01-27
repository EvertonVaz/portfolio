defmodule Portfolio.Philosophers do
  @moduledoc """
  Public API for the Philosophers Context.
  """
  alias Portfolio.Philosophers.Processor

  @doc """
  Executes a philosophers-related command.
  """
  def execute(input, caller_pid \\ nil) do
    Processor.process(input, caller_pid)
  end
end
