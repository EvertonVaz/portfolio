defmodule Messaging.Consumer do
  def wait_for_messages do
    host = System.get_env("RABBITMQ_HOST") || "rabbitmq"
    {:ok, connection} = AMQP.Connection.open(host: host)
    {:ok, channel} = AMQP.Channel.open(connection)

    AMQP.Queue.declare(channel, "commands")
    AMQP.Basic.consume(channel, "commands", nil, no_ack: true)

    IO.puts(" [*] Waiting for messages. To exit press CTRL+C, CTRL+C")

    receive_messages()
  end

  defp receive_messages do
    receive do
      {:basic_deliver, payload, _meta} ->
        IO.puts(" [x] Received command: #{payload}")

        process_message(payload)

        receive_messages()
    end
  end

  defp process_message(payload) do
    case Messaging.Sanitizer.sanitize(payload) do
      {:ok, valid_msg} ->
        result = Messaging.Executer.execute(valid_msg)
        result = Messaging.Sanitizer.sinitize_response(result, valid_msg)
        Messaging.Producer.publish("responses", result)

      {:error, reason} ->
        IO.puts(" [!] Sanitization error: #{reason}")
        Messaging.Producer.publish("responses", reason)
    end
  end
end
