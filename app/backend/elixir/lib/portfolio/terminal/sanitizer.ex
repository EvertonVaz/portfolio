defmodule Portfolio.Terminal.Sanitizer do
  alias Portfolio.Terminal.Command

  @doc """
  Sanitizes the response from the minishell.
  """
  def sanitize_response(%Command{raw_output: nil} = command), do: command

  def sanitize_response(%Command{raw_output: raw_output, input: input} = command) do
    ansi_regex = ~r/\x1b\[[0-9;]*[a-zA-Z]/

    sanitized =
      raw_output
      |> String.replace(["@minishell $>", "exit", input], "")
      |> String.replace(ansi_regex, "")
      |> String.split("\n", trim: true)
      |> format_output()
      |> String.trim()

    %{command | raw_output: sanitized}
  end

  defp format_output([]), do: ""
  defp format_output([single]), do: single

  defp format_output([first | rest]) when length(rest) > 1 do
    {mid, [last]} = Enum.split(rest, -1)
    "#{first} #{Enum.join(mid, ", ")} #{last}"
  end

  defp format_output(list), do: Enum.join(list, "")
end
