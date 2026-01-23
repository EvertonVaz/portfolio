defmodule Portfolio.Terminal.Command do
  @moduledoc """
  Represents a command execution context in the Portfolio Terminal.
  """
  defstruct [:input, :raw_output, :formatted_output, :error]

  @type t :: %__MODULE__{
          input: String.t(),
          raw_output: String.t() | nil,
          formatted_output: String.t() | nil,
          error: String.t() | nil
        }
end
