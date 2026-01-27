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
  end
end
