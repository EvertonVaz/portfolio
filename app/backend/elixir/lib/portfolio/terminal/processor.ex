defmodule Portfolio.Terminal.Processor do
  @moduledoc """
  Processes terminal commands.
  """
  alias Portfolio.Terminal.Command
  alias Portfolio.System.CmdExecutor
  alias Portfolio.Philosophers.Simulation

  def process(input, caller_pid \\ nil) do
    %Command{input: input}
    |> execute(caller_pid)
    |> format()
    |> finalize()
  end

  defp execute(%Command{input: input} = command, caller_pid) do
    parts = String.split(input)

    case parts do
      ["help"] ->
        %{command | raw_output: help_text()}

      ["about"] ->
        %{command | raw_output: about_text()}

      ["philosophers_client_init"] ->
        %{command | raw_output: "Philosophers simulation context initialized."}

      ["philosophers" | args] ->
        if caller_pid do
          case validate_philosophers_args(args) do
            :ok ->
              Simulation.start_link(args: args, caller: caller_pid)
              %{command | raw_output: "Simulation started..."}

            {:error, msg} ->
              %{command | error: msg}
          end
        else
          %{command | error: "Philosophers simulation requires a connected client."}
        end

      _ ->
        case CmdExecutor.execute(input) do
          {:ok, output} -> %{command | raw_output: output}
          {:error, reason} -> %{command | error: reason}
        end
    end
  end

  defp validate_philosophers_args(args) do
    # Requires at least 4 args (number, die, eat, sleep)
    if length(args) >= 4 do
      :ok
    else
      {:error, "Usage: philosophers <number> <die> <eat> <sleep> [cycles]"}
    end
  end

  defp format(%Command{error: nil, raw_output: output} = command) do
    %{command | formatted_output: "[SUCCESS]\n#{output}"}
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
    - philosophers <n> <die> <eat> <sleep>: Start simulation (times in seconds)
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
