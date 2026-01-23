defmodule Messaging.Infrastructure.OutputFormatterTest do
  use ExUnit.Case
  alias Messaging.Infrastructure.OutputFormatter

  describe "format/2" do
    test "removes minishell prompt and echoed command" do
      output = "ls\n@minishell $>\nfile1\nfile2"
      formatted = OutputFormatter.format(output, "ls")
      assert formatted == "file1, file2"
    end

    test "removes ANSI escape codes" do
      output = "\x1b[31mred text\x1b[0m"
      formatted = OutputFormatter.format(output, "echo")
      assert formatted == "red text"
    end

    test "handles binary data error" do
      binary_data = <<0, 255, 128>>
      assert OutputFormatter.format(binary_data, "cat") == "Arquivo binário detectado. O conteúdo não pode ser exibido."
    end
  end
end
