defmodule Portfolio.Terminal.ProcessorTest do
  use ExUnit.Case, async: true

  alias Portfolio.Terminal.Processor

  describe "process/1" do
    test "processes 'help' command" do
      result = Processor.process("help")
      assert result =~ "ls" and result =~ "cat"
    end

    test "processes 'echo' command in pure Elixir" do
      result = Processor.process("echo test")
      assert result =~ "test"
    end

    test "processes 'ls' command" do
      result = Processor.process("ls")
      assert result =~ "about.txt"
    end

    test "returns error for unknown command" do
      result = Processor.process("unknown_cmd")
      assert result =~ "[ERROR]"
    end
  end
end
