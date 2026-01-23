defmodule Messaging.Services.CommandProcessor do
  @moduledoc """
  Application service that orchestrates command execution.
  """
  alias Messaging.Domain.Command

  @validator Application.compile_env(:messaging, :validator, Messaging.Infrastructure.CommandValidator)
  @executor Application.compile_env(:messaging, :executor, Messaging.Infrastructure.ShellExecutor)
  @formatter Application.compile_env(:messaging, :formatter, Messaging.Infrastructure.OutputFormatter)

  @doc """
  Processes a raw command string through validation, execution, and formatting.
  """
  def process(input) do
    %Command{input: input}
    |> validate()
    |> execute()
    |> format()
    |> finalize()
  end

  defp validate(%Command{input: input} = command) do
    case @validator.validate(input) do
      {:ok, validated_input} -> %{command | input: validated_input}
      {:error, reason} -> %{command | error: reason}
    end
  end

  defp execute(%Command{error: nil, input: input} = command) do
    case @executor.execute(input) do
      {:ok, output} -> %{command | raw_output: output}
      {:error, reason} -> %{command | error: reason}
    end
  end

  defp execute(command), do: command

  defp format(%Command{error: nil, raw_output: output, input: input} = command) do
    formatted = @formatter.format(output, input)
    %{command | formatted_output: formatted}
  end

  defp format(command), do: command

  defp finalize(%Command{error: nil, formatted_output: formatted}), do: formatted
  defp finalize(%Command{error: reason}), do: "Error: #{reason}"
end
