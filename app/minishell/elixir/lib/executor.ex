defmodule Messaging.Executor do
  @minishell_path "./minishell"

  def execute(command) do
    try do
      {output, _exit_code} =
        System.shell("echo '#{command}' | #{@minishell_path}", stderr_to_stdout: true)

      String.trim(output)
    rescue
      e ->
        "Error executing minishell: #{inspect(e)}"
    end
  end
end
