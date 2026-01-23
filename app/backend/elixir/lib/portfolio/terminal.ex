defmodule Portfolio.Terminal do
  @moduledoc """
  Public API for the Terminal Context.
  """
  alias Portfolio.Terminal.Processor

  @doc """
  Executes a command string and returns the formatted output.
  Accepts an optional caller_pid for async updates.
  """
  def execute(input, caller_pid \\ nil) do
    Processor.process(input, caller_pid)
  end
end
