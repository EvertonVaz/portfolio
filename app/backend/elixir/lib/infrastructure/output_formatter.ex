defmodule Messaging.Infrastructure.OutputFormatter do
  @moduledoc """
  Concrete implementation of Output Formatter.
  """
  @behaviour Messaging.Behaviors.Formatter

  @impl true
  def format(message, command) when is_binary(message) do
    case String.valid?(message) do
      true -> do_format(message, command)
      false -> "Arquivo binário detectado. O conteúdo não pode ser exibido."
    end
  end

  defp do_format(message, command) do
    ansi_regex = ~r/\x1b\[[0-9;]*[a-zA-Z]/

    message
    |> String.replace([command, "@minishell $>", "exit"], "")
    |> String.replace(ansi_regex, "")
    |> String.split("\n", trim: true)
    |> format_output()
    |> String.trim()
  end

  defp format_output(list), do: Enum.join(list, ", ")
end
