defmodule Portfolio.TerminalTest do
  use ExUnit.Case

  alias Portfolio.Terminal

  describe "execute/1" do
    test "echo command returns the given text" do
      assert Terminal.execute("echo hello") =~ "hello"
    end

    test "echo is pure Elixir and never runs a shell" do
      # Metacaracteres de shell são só texto agora: nada é executado.
      result = Terminal.execute("echo a && id")
      assert result =~ "a && id"
      refute result =~ "uid="
    end

    test "date command returns a date" do
      assert Terminal.execute("date") =~ to_string(Date.utc_today().year)
    end

    test "unknown command returns error" do
      result = Terminal.execute("rm -rf /")
      assert result =~ "[ERROR]"
    end

    test "help command returns help text" do
      assert Terminal.execute("help") =~ "Available commands"
    end
  end
end
