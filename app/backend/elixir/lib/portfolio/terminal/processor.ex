defmodule Portfolio.Terminal.Processor do
  @moduledoc """
  Processes terminal commands.
  """
  alias Portfolio.Terminal.Command
  alias Portfolio.Terminal.CmdExecutor
  alias Portfolio.Terminal.Sanitizer

  require Logger

  def process(input) do
    %Command{input: input}
    |> execute()
    |> Sanitizer.sanitize_response()
    |> format()
    |> finalize()
  end

  defp execute(%Command{input: input} = command) do
    parts = String.split(input)

    case parts do
      ["help"] ->
        %{command | raw_output: help_text()}

      ["about"] ->
        %{command | raw_output: about_text()}

      _ ->
        case CmdExecutor.execute(input) do
          {:ok, output} -> %{command | raw_output: output}
          {:error, reason} -> %{command | error: reason}
        end
    end
  end

  defp format(%Command{error: nil, raw_output: output} = command) do
    %{command | formatted_output: output}
  end

  defp format(%Command{error: reason} = command) do
    %{command | formatted_output: "[ERROR] #{reason}"}
  end

  defp finalize(%Command{formatted_output: formatted}), do: formatted

  defp help_text do
    """
    Available commands:
    - help: Show this help
    - about: Show portfolio info
    - echo <text>: Echo text
    - date: Show server date
    """
  end

  defp about_text do
    """
    Portfolio Backend v1.0
    Running on Elixir.
    """
  end
end
