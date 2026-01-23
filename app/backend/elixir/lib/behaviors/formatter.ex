defmodule Messaging.Behaviors.Formatter do
  @moduledoc """
  Behavior for formatting command execution output.
  """
  @callback format(String.t(), String.t()) :: String.t()
end
