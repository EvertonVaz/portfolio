defmodule Portfolio.System.CmdExecutor do
  @moduledoc """
  Wraps system command execution.
  """

  @doc """
  Executes a shell command.
  """
  def execute(command) do
    # Simple whitelist for safety - in a real app this would be more robust
    allowed_commands = ["echo", "date", "whoami", "ls", "cat", "help"]

    cmd_part = command |> String.split() |> List.first()

    if cmd_part in allowed_commands do
      case System.cmd("sh", ["-c", command], stderr_to_stdout: true) do
        {output, 0} -> {:ok, output}
        {output, _} -> {:error, output}
      end
    else
      {:error, "Command not allowed: #{cmd_part}"}
    end
  end
end
