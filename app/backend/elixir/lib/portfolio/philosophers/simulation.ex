defmodule Portfolio.Philosophers.Simulation do
  @moduledoc """
  GenServer that manages the execution of the Philosophers C binary.
  """
  use GenServer
  require Logger

  alias Portfolio.Philosophers.Parser

  # Client API

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  def stop(pid) do
    GenServer.stop(pid)
  end

  # Server Callbacks

  @impl true
  def init(opts) do
    args = opts[:args] || []
    caller = opts[:caller]

    # Convert seconds to milliseconds
    converted_args = Portfolio.Philosophers.ArgsConverter.convert(args)

    executable_path = Path.expand("./philosophers")

    # Use stdbuf -oL to force line-buffering on stdout
    # to ensure real-time log delivery via WebSocket.
    cmd = "/usr/bin/stdbuf"
    execution_args = ["-oL", executable_path] ++ converted_args

    Logger.info("[Simulation] Starting Port with cmd: #{cmd}, args: #{inspect(execution_args)}")

    port = Port.open({:spawn_executable, cmd}, [:binary, :exit_status, args: execution_args])

    {:ok, %{port: port, caller: caller}}
  end

  @impl true
  def handle_info({port, {:data, data}}, %{port: port} = state) do
    Logger.info("[Simulation] Received data: #{inspect(data)}")

    # Data might contain multiple lines
    data
    |> String.split("\n", trim: true)
    |> Enum.each(fn line ->
      Logger.debug("[Simulation] Processing line: #{inspect(line)}")

      case Parser.parse(line) do
        {:ok, parsed} ->
          Logger.debug("[Simulation] Parsed successfully: #{inspect(parsed)}")
          send_to_caller(state.caller, {:philosophers_update, parsed})

        {:error, reason} ->
          Logger.warning("[Simulation] Parse error for line #{inspect(line)}: #{inspect(reason)}")
      end
    end)

    {:noreply, state}
  end

  @impl true
  def handle_info({port, {:exit_status, status}}, %{port: port} = state) do
    send_to_caller(state.caller, {:philosophers_exit, status})
    {:stop, :normal, state}
  end

  defp send_to_caller(pid, msg) do
    if pid && Process.alive?(pid) do
      send(pid, msg)
    end
  end
end
