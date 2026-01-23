defmodule Portfolio.Terminal.ProcessorTest do
  use ExUnit.Case, async: true

  alias Portfolio.Terminal.Processor

  describe "process/2" do
    test "processes 'help' command" do
      result = Processor.process("help")
      assert result =~ "Available commands"
    end

    test "processes 'about' command" do
      result = Processor.process("about")
      assert result =~ "Portfolio Backend v1.0"
    end

    test "processes 'echo' command via CmdExecutor" do
      result = Processor.process("echo test")
      assert result =~ "[SUCCESS]"
      assert result =~ "test"
    end

    test "returns error for unknown command" do
      result = Processor.process("unknown_cmd")
      assert result =~ "[ERROR]"
    end

    test "processes 'philosophers' command with valid args and caller_pid" do
      # We just check the start message, as it starts a GenServer
      result = Processor.process("philosophers 5 0.8 0.2 0.2", self())
      assert result =~ "[SUCCESS]"
      assert result =~ "Simulation started"
    end

    test "returns error for 'philosophers' command WITHOUT caller_pid" do
      result = Processor.process("philosophers 5 0.8 0.2 0.2")
      assert result =~ "[ERROR]"
      assert result =~ "requires a connected client"
    end

    test "returns error for 'philosophers' command with invalid args" do
      result = Processor.process("philosophers 1 2", self())
      assert result =~ "[ERROR]"
      assert result =~ "Usage: philosophers"
    end
  end
end
