defmodule Portfolio.Philosophers.ProcessorTest do
  use ExUnit.Case, async: true
  alias Portfolio.Philosophers.Processor

  describe "process/2" do
    test "processes 'philosophers_client_init' command" do
      result = Processor.process("philosophers_client_init")
      assert result =~ "context initialized"
    end

    test "processes 'philosophers' command with valid args and caller_pid" do
      result = Processor.process("philosophers 1 0.1 0.1 0.1", self())
      assert result =~ "Simulation started"
    end

    test "returns error for 'philosophers' command WITHOUT caller_pid" do
      result = Processor.process("philosophers 1 0.1 0.1 0.1")
      assert result =~ "[ERROR]"
      assert result =~ "requires a connected client"
    end

    test "returns error for unknown philosophers command" do
      result = Processor.process("unknown_cmd")
      assert result =~ "[ERROR]"
      assert result =~ "Unknown philosophers command"
    end
  end
end
