defmodule Messaging.Producer do
  def publish(queue, message) do
    host = System.get_env("VITE_RABBITMQ_HOST") || "rabbitmq"
    case AMQP.Connection.open(host: host) do
      {:ok, connection} ->
        {:ok, channel} = AMQP.Channel.open(connection)

        AMQP.Queue.declare(channel, queue, durable: true)
        AMQP.Basic.publish(channel, "", queue, message)

        IO.puts(" [x] Sent to '#{queue}': '#{message}'")

        AMQP.Connection.close(connection)

      {:error, reason} ->
        IO.puts(" [!] Failed to publish message to '#{queue}': #{inspect(reason)}")
    end
  end

  # Mantendo retrocompatibilidade para testes rápidos se necessário
  def send_hello do
    publish("hello", "Hello World em Elixir!")
  end
end
