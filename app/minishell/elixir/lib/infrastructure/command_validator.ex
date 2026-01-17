defmodule Messaging.Infrastructure.CommandValidator do
  @moduledoc """
  Concrete implementation of Command Validator using a permitted list.
  """
  @behaviour Messaging.Behaviors.Validator

  @permitted_words ["ls", "pwd", "echo", "cat", "exit", "clear", "whoami"]

  @impl true
  def validate(message) do
    case contains_permitted?(message) do
      false -> {:error, "Permission denied"}
      true -> {:ok, message}
    end
  end

  defp contains_permitted?(message) do
    message
    |> String.split(~r/&&|\|\||\||;/)
    |> Enum.map(&String.trim/1)
    |> Enum.all?(&permitted_command?/1)
  end

  defp permitted_command?(part) do
    case String.split(part) do
      [command | _args] -> String.downcase(command) in @permitted_words
      _ -> false
    end
  end
end
