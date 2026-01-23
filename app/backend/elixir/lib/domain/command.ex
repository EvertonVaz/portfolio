defmodule Messaging.Domain.Command do
  @moduledoc """
  Domain struct representing a command execution context.
  """
  defstruct [:input, :raw_output, :formatted_output, :error]

  @type t :: %__MODULE__{
          input: String.t(),
          raw_output: String.t() | nil,
          formatted_output: String.t() | nil,
          error: String.t() | nil
        }
end
