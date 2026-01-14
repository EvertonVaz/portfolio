defmodule Messaging.Sanitizer do
  @restricted_words ["sudo", "rm", "chmod", "chown", "mkfs"]

  def sanitize(message) do
    case contains_restricted?(message) do
      true -> {:error, "Permission denied"}
      false -> {:ok, message}
    end
  end

  defp contains_restricted?(message) do
    message
    |> String.downcase()
    |> String.split()
    |> Enum.any?(fn word -> word in @restricted_words end)
  end

  def sanitize_response(message, command) do
    ansi_regex = ~r/\x1b\[[0-9;]*[a-zA-Z]/

    message
    |> String.replace(["@minishell $>", "exit", command], "")
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
