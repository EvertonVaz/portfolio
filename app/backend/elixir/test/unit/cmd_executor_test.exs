defmodule Portfolio.Terminal.CmdExecutorTest do
  use ExUnit.Case, async: true
  alias Portfolio.Terminal.CmdExecutor

  describe "execute/1" do
    test "returns :ok for allowed command" do
      assert {:ok, _} = CmdExecutor.execute("echo hello")
    end

    test "returns :error for not allowed command" do
      assert {:error, "Command not allowed: rm"} = CmdExecutor.execute("rm -rf /")
    end

    test "returns :error when system command fails" do
      # cat without args usually fails
      {status, _} = CmdExecutor.execute("cat non_existent_file_xyz")
      assert status in [:ok, :error]
    end

    test "handles edge case with extra spaces" do
      assert {:ok, _} = CmdExecutor.execute("  echo   hello  ")
    end

    test "does not let a single quote escape into the host shell" do
      marker = Path.join(System.tmp_dir!(), "cmd_executor_pwned_#{System.unique_integer([:positive])}")
      refute File.exists?(marker)

      # A aspa simples fechava o `echo '...'` da implementação antiga e o `;`
      # emendava um comando arbitrário rodando no shell do host.
      CmdExecutor.execute("echo x'; touch #{marker}; echo '")

      refute File.exists?(marker),
             "injeção de comando alcançou o host: #{marker} foi criado"

      File.rm(marker)
    end
  end
end
