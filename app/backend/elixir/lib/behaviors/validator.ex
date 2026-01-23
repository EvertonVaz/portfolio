defmodule Messaging.Behaviors.Validator do
  @moduledoc """
  Behavior for command input validation and sanitization.
  """
  @callback validate(String.t()) :: {:ok, String.t()} | {:error, String.t()}
end
