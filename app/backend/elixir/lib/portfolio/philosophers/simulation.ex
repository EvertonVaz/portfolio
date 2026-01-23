defmodule Portfolio.Philosophers.Simulation do
  @moduledoc """
  GenServer that manages the execution of the Philosophers C binary.
  """
  use GenServer

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

    executable_path = Path.expand("../../../_build/prod/philosophers", __DIR__)

    # Verify if binary exists, if not try a fallback or fail gracefully
    # For now, we assume it exists or use a simple mock if needed for dev
    cmd = executable_path

    port = Port.open({:spawn_executable, cmd}, [:binary, :exit_status, args: converted_args])

    {:ok, %{port: port, caller: caller}}
  end

  @impl true
  def handle_info({port, {:data, data}}, %{port: port} = state) do
    # Data might contain multiple lines
    data
    |> String.split("\n", trim: true)
    |> Enum.each(fn line ->
      case Parser.parse(line) do
        {:ok, parsed} ->
          send_to_caller(state.caller, {:philosophers_update, parsed})

        _ ->
          # Maybe log raw output or ignored lines
          :ok
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
