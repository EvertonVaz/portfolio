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

  def sinitize_response(message, command) do
    message
    |> String.replace(["@minishell $>", "exit", command], "")
    |> String.trim()
    |> String.split("\n")
    |> (fn
      [first | rest] when length(rest) > 1 ->
        {mid, [last]} = Enum.split(rest, -1)
        "#{first} #{Enum.join(mid, ", ")} #{last}"

      list ->
        Enum.join(list, "")
    end).()
  end
end
