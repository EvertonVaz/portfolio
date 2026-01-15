defmodule Messaging.Sanitizer do
  @permitted_words ["ls", "pwd", "echo", "cat", "exit", "clear", "whoami"]

  def sanitize(message) do
    case contains_permitted?(message) do
      false -> {:error, "Permission denied"}
      true -> {:ok, message}
    end
  end

  defp contains_permitted?(message) do
    message
    |> String.split(~r/&&|\|\||\||;/)
    |> Enum.map(&String.trim/1)
    |> Enum.all?(&permitted_command?/1)
  end

  defp permitted_command?(part) do
    case String.split(part) do
      [command | _args] -> String.downcase(command) in @permitted_words
      _ -> false
    end
  end

  def sanitize_response(message, command) when is_binary(message) do
    case String.valid?(message) do
      true -> do_sanitize_response(message, command)
      false -> "Arquivo binário detectado. O conteúdo não pode ser exibido."
    end
  end

  defp do_sanitize_response(message, command) do
    ansi_regex = ~r/\x1b\[[0-9;]*[a-zA-Z]/

    message
    |> String.replace([command, "@minishell $>", "exit"], "")
    |> String.replace(ansi_regex, "")
    |> String.split("\n", trim: true)
    |> format_output()
    |> String.trim()
  end

  defp format_output([]), do: ""
  defp format_output([single]), do: single

  defp format_output([first | rest]) when length(rest) > 1 do
    {mid, [last]} = Enum.split(rest, -1)
    "#{first} #{Enum.join(mid, ", ")} #{last}"
  end

  defp format_output(list), do: Enum.join(list, "")
end
