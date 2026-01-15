defmodule Messaging.Processor do
  def process_message(payload) do

    Messaging.Sanitizer.sanitize(payload)
    |> after_sanitaze()
  end

  defp after_sanitaze({:ok, valid_msg}) do
    result = Messaging.Executor.execute(valid_msg)
    Messaging.Sanitizer.sanitize_response(result, valid_msg)
    |> before_response()
  end

  defp after_sanitaze({:error, reason}) do
    before_response({:error, reason})
  end

  defp before_response({_, message}) do
    queue = System.get_env("VITE_QUEUE_RESPONSE") || "responses"

    Messaging.Producer.publish(queue, message)
  end

end
