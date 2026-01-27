defmodule Portfolio.Philosophers.Processor do
  @moduledoc """
  Processes commands for the Dining Philosophers simulation.
  """
  alias Portfolio.Philosophers.Simulation

  require Logger

  def process(input, caller_pid \\ nil) do
    parts = String.split(input)

    case parts do
      ["philosophers_client_init"] ->
        "Philosophers simulation context initialized."

      ["philosophers" | args] ->
        Logger.info("Starting philosophers simulation with args: #{inspect(args)}")

        if caller_pid do
          case validate_args(args) do
            :ok ->
              case Simulation.start_link(args: args, caller: caller_pid) do
                {:ok, _pid} ->
                  "Simulation started..."

                {:error, reason} ->
                  "[ERROR] Failed to start simulation: #{inspect(reason)}"
              end

            {:error, msg} ->
              "[ERROR] #{msg}"
          end
        else
          "[ERROR] Philosophers simulation requires a connected client."
        end

      _ ->
        "[ERROR] Unknown philosophers command: #{input}"
    end
  end

  defp validate_args(args) do
    if length(args) >= 4 do
      :ok
    else
      {:error, "Usage: philosophers <number> <die> <eat> <sleep> [cycles]"}
    end
  end
end
