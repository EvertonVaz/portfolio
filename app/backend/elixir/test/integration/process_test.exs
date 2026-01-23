defmodule Messaging.ProcessTest do
  use ExUnit.Case

  describe "CommandProcessor.process/1" do
    test "allows permitted single commands" do
      output = Messaging.process("ls -la")
      assert is_binary(output)
      assert output =~ "minishell"

      output = Messaging.process("pwd")
      assert output =~ "/"
    end

    test "rejects forbidden commands" do
      output = Messaging.process("rm -rf /")
      assert output == "Error: Permission denied"

      output = Messaging.process("shutdown now")
      assert output == "Error: Permission denied"
    end

    test "handles command read binary data" do
      output = Messaging.process("cat minishell")
      assert output == "Arquivo binário detectado. O conteúdo não pode ser exibido."
    end
  end
end
