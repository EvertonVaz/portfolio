defmodule Portfolio.TerminalTest do
  use ExUnit.Case

  alias Portfolio.Terminal

  describe "execute/1 — comandos da vitrine (Elixir puro, sem shell)" do
    test "echo returns the given text" do
      assert Terminal.execute("echo hello") =~ "hello"
    end

    test "echo never runs a shell — metacaracteres são só texto" do
      result = Terminal.execute("echo a && whoami")
      assert result =~ "a && whoami"
      refute result =~ "born2code"
    end

    test "pwd returns a path" do
      assert Terminal.execute("pwd") =~ "/home"
    end

    test "whoami returns the showcase user" do
      assert Terminal.execute("whoami") =~ "born2code"
    end

    test "ls lists the virtual files" do
      assert Terminal.execute("ls") =~ "projects.txt"
    end

    test "cat reads a virtual file" do
      assert Terminal.execute("cat projects.txt") =~ "minishell"
    end

    test "cat cannot read real files (no arbitrary read, no traversal)" do
      for arg <- ["/etc/passwd", "../../../../etc/passwd", "/proc/self/environ"] do
        result = Terminal.execute("cat #{arg}")
        assert result =~ "No such file"
        refute result =~ "root:"
      end
    end

    test "exit returns a logout message" do
      assert Terminal.execute("exit") =~ "logout"
    end

    test "unknown command returns error" do
      assert Terminal.execute("rm -rf /") =~ "[ERROR]"
    end
  end
end
