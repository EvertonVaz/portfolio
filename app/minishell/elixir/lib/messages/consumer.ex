defmodule Messaging.Consumer do
  def wait_for_messages do
    host = System.get_env("VITE_RABBITMQ_HOST") || "rabbitmq"

    case AMQP.Connection.open(host: host) do
      {:ok, connection} ->
        {:ok, channel} = AMQP.Channel.open(connection)
        queue_command = System.get_env("VITE_QUEUE_COMMAND") || "commands"

        AMQP.Queue.declare(channel, queue_command, durable: true)
        AMQP.Basic.consume(channel, queue_command, nil, no_ack: true)

        IO.puts(" [*] Waiting for messages. To exit press CTRL+C, CTRL+C")
        receive_messages()

      {:error, :econnrefused} ->
        IO.puts(" [!] RabbitMQ connection refused. Retrying in 2 seconds...")
        :timer.sleep(2000)
        wait_for_messages()

      {:error, reason} ->
        IO.puts(" [!] Failed to connect to RabbitMQ: #{inspect(reason)}")
        :timer.sleep(5000)
        wait_for_messages()
    end
  end

  defp receive_messages do
    receive do
      {:basic_deliver, payload, _meta} ->
        IO.puts(" [x] Received command: #{payload}")

        Messaging.Processor.process_message(payload)

        receive_messages()
    end
  end

end
