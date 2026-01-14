defmodule Messaging.Producer do
  def publish(queue, message) do
    host = System.get_env("VITE_RABBITMQ_HOST") || "rabbitmq"
    {:ok, connection} = AMQP.Connection.open(host: host)
    {:ok, channel} = AMQP.Channel.open(connection)

    AMQP.Queue.declare(channel, queue)
    AMQP.Basic.publish(channel, "", queue, message)

    IO.puts(" [x] Sent to '#{queue}': '#{message}'")

    AMQP.Connection.close(connection)
  end

  # Mantendo retrocompatibilidade para testes rápidos se necessário
  def send_hello do
    publish("hello", "Hello World em Elixir!")
  end
end
