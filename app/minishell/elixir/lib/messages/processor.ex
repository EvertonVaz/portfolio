defmodule Messaging.Processor do
  def process_message(payload) do
    Messaging.Sanitizer.sanitize(payload)
    |> after_sanitize()
  end

  defp after_sanitize({:ok, valid_msg}) do
    result = Messaging.Executor.execute(valid_msg)
    # Retorna o resultado higienizado para o socket
    Messaging.Sanitizer.sanitize_response(result, valid_msg)
    |> elem(1)
  end

  defp after_sanitize({:error, reason}) do
    "Error: #{reason}"
  end
end
