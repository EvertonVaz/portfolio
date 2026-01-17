defmodule Messaging.Infrastructure.ShellExecutor do
  @moduledoc """
  Concrete implementation of Shell Executor.
  """
  @behaviour Messaging.Behaviors.Executor

  @minishell_path "./minishell"

  @impl true
  def execute(command) do
    try do
      {output, _exit_code} =
        System.shell("echo '#{command}' | #{@minishell_path}", stderr_to_stdout: true)

      {:ok, String.trim(output)}
    rescue
      e ->
        {:error, "Error executing minishell: #{inspect(e)}"}
    end
  end
end
