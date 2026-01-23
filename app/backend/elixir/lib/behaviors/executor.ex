defmodule Messaging.Behaviors.Executor do
  @moduledoc """
  Behavior for executing shell commands.
  """
  @callback execute(String.t()) :: {:ok, String.t()} | {:error, String.t()}
end
