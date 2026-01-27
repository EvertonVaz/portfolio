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
      assert result =~ "test"
    end

    test "returns error for unknown command" do
      result = Processor.process("unknown_cmd")
      assert result =~ "[ERROR]"
    end
  end
end
