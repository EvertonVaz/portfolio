defmodule Portfolio.Terminal.Processor do
  @moduledoc """
  Processa os comandos da vitrine do terminal — inteiramente em Elixir.

  Nenhuma entrada do visitante chega a um shell nem ao filesystem real:
  `ls`/`cat` operam sobre um filesystem virtual em memória (`@files`), então
  não há leitura arbitrária nem path traversal possível. O binário `minishell`
  segue no projeto como vitrine, mas não é mais invocado.
  """

  @user "born2code"
  @home "/home/born2code"

  # Filesystem virtual: edite aqui o conteúdo mostrado por `ls`/`cat`.
  @files %{
    "about.txt" => """
    born2code — estudante da 42 São Paulo.
    Este terminal é uma vitrine do projeto minishell, agora servido em Elixir.
    """,
    "projects.txt" => """
    minishell     - shell em C (parsing, pipes, redireções)
    philosophers  - jantar dos filósofos (threads e mutex)
    pong          - jogo com IA (PPO e algoritmo genético)
    """,
    "contact.txt" => """
    github: github.com/EvertonVaz
    """
  }

  def process(input) do
    case input |> String.trim() |> split() do
      {"echo", arg} -> arg
      {"pwd", _} -> @home
      {"whoami", _} -> @user
      {"ls", _} -> @files |> Map.keys() |> Enum.sort() |> Enum.join("\n")
      {"cat", arg} -> cat(arg)
      {"exit", _} -> "logout"
      {"help", _} -> help_text()
      {"", _} -> ""
      {other, _} -> "[ERROR] Command not found: #{other}"
    end
  end

  defp split(input) do
    case String.split(input, " ", parts: 2) do
      [cmd] -> {cmd, ""}
      [cmd, arg] -> {cmd, String.trim(arg)}
    end
  end

  defp cat(""), do: "cat: missing operand"

  defp cat(name) do
    case Map.fetch(@files, name) do
      {:ok, content} -> String.trim_trailing(content)
      :error -> "cat: #{name}: No such file or directory"
    end
  end

  defp help_text do
    "Comandos: ls, pwd, echo, cat, whoami, exit"
  end
end
