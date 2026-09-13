defmodule Portfolio.Terminal.Processor do
  @moduledoc """
  Processa os comandos da vitrine do terminal — inteiramente em Elixir.

  Nenhuma entrada do visitante chega a um shell: `echo` só devolve texto e os
  demais comandos são respostas fixas. O binário `minishell` segue no projeto
  como vitrine, mas não é mais invocado com entrada livre.
  """

  def process(input) do
    case String.trim(input) do
      "help" -> help_text()
      "about" -> about_text()
      "date" -> current_date()
      "echo" -> ""
      "echo " <> rest -> rest
      other -> "[ERROR] Command not found: #{first_word(other)}"
    end
  end

  defp first_word(input), do: input |> String.split() |> List.first() || ""

  defp current_date do
    DateTime.utc_now() |> DateTime.to_string()
  end

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
