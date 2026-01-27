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
    allowed_commands = ["echo", "date", "whoami", "ls", "cat", "env", "help"]

    cmd_part = command |> String.split() |> List.first()

    if cmd_part in allowed_commands do
      case System.shell("echo '#{command}' | #{executable_path}", stderr_to_stdout: true) do
        {output, 0} -> {:ok, output}
        {output, _} -> {:error, output}
      end
    else
      {:error, "Command not allowed: #{cmd_part}"}
    end
  end
end
