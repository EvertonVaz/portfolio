defmodule Messaging.ProcessTest do
  use ExUnit.Case

  describe "Executor/1" do
    test "allows permitted single commands" do
      assert {:ok, output} = Messaging.process("ls -la")
      assert output =~ "minishell"
      assert {:ok, output} = Messaging.process("pwd")
      assert output =~ "/"
    end

    test "rejects forbidden commands" do
      assert {:error, _reason} = Messaging.process("rm -rf /")
      assert {:error, _reason} = Messaging.process("shutdown now")
    end

    test "handles command read binary data" do
      assert {:error, output} = Messaging.process("cat minishell")
      assert byte_size(output) > 0
    end

  end
end
