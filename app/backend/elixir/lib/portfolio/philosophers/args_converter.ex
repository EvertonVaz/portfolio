defmodule Portfolio.Philosophers.ArgsConverter do
  @moduledoc """
  Handles conversion of terminal string arguments to format expected by C binary.
  Converts seconds to milliseconds for specific arguments.
  """

  @doc """
  Converts arguments list.
  Expected format: [num_philosophers, time_die, time_eat, time_sleep, optional_repeat]
  """
  def convert(args) when is_list(args) do
    [num | rest_times] = args

    converted_times =
      rest_times
      |> Enum.with_index()
      |> Enum.map(fn {val, idx} ->
        if idx < 3 do
          convert_time(val)
        else
          val
        end
      end)

    [num | converted_times]
  end

  defp convert_time(val) do
    case Float.parse(val) do
      {f, _} ->
        trunc(f * 1000) |> to_string()

      :error ->
        case Integer.parse(val) do
          {i, _} -> (i * 1000) |> to_string()
          :error -> val
        end
    end
  end
end
