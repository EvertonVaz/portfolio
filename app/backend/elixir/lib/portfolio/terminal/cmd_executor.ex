defmodule Portfolio.Terminal.CmdExecutor do
  @moduledoc """
  Wraps system command execution.
  """

  @doc """
  Executes a shell command.
  """
  def execute(command) do
    executable_path = Path.expand("./minishell")

    # Simple whitelist for safety - in a real app this would be more robust
    allowed_commands = ["echo", "date", "whoami", "ls", "cat", "help"]

    cmd_part = command |> String.split() |> List.first()

    if cmd_part in allowed_commands do
      # O comando vai pro minishell via stdin, nunca interpolado numa string de
      # shell. `printf` só imprime o valor de $MINISHELL_CMD literalmente — o
      # shell não reinterpreta o conteúdo de uma env var, então aspas e `;` no
      # input do usuário não escapam pro host.
      case System.cmd("sh", ["-c", "printf '%s\\n' \"$MINISHELL_CMD\" | #{executable_path}"],
             env: [{"MINISHELL_CMD", command}],
             stderr_to_stdout: true
           ) do
        {output, 0} -> {:ok, output}
        {output, _} -> {:error, output}
      end
    else
      {:error, "Command not allowed: #{cmd_part}"}
    end
  end
end
