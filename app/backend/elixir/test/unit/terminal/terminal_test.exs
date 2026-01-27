defmodule Portfolio.TerminalTest do
  use ExUnit.Case

  alias Portfolio.Terminal

  describe "execute/1" do
    test "echo command returns matched input" do
      result = Terminal.execute("echo hello")
      assert result =~ "hello"
    end

    test "date command returns a date" do
      result = Terminal.execute("date")
      assert result =~ to_string(Date.utc_today().year)
    end

    test "unknown/forbidden command returns error" do
      result = Terminal.execute("rm -rf /")
      assert result =~ "[ERROR]"
      assert result =~ "Command not allowed"
    end

    test "help command returns help text" do
      result = Terminal.execute("help")
      assert result =~ "Available commands"
    end
  end
end
