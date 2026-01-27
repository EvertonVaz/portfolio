defmodule Portfolio.Philosophers.Parser do
  @moduledoc """
  Parses output lines from the Philosophers simulation.
  Expected format: "timestamp philo_id message..."
  Example: "0 1 🍽 has taken a fork"
  """

  @doc """
  Parses a line of text into a structured map.
  Returns `{:ok, map}` or `{:error, reason}`.
  """
  def parse(line) do
    parts = String.split(line, " ", parts: 3)

    case parts do
      [timestamp, philo_id, _action] ->
        with {time_int, ""} <- Integer.parse(timestamp),
             {id_int, ""} <- Integer.parse(philo_id) do
          {:ok,
           %{
             time: time_int,
             philo_id: id_int,
             action:
               line |> String.split(" ", parts: 3) |> List.last() |> strip_ansi() |> String.trim()
           }}
        else
          _ -> {:error, :invalid_format}
        end

      _ ->
        {:error, :invalid_format}
    end
  end

  defp strip_ansi(text) do
    # Regex to remove ANSI escape sequences
    Regex.replace(~r/\e\[[0-9;]*[mK]/, text, "")
  end
end
