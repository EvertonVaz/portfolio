defmodule Messaging.Infrastructure.CommandValidatorTest do
  use ExUnit.Case
  alias Messaging.Infrastructure.CommandValidator

  describe "validate/1" do
    test "allows permitted single commands" do
      assert CommandValidator.validate("ls") == {:ok, "ls"}
      assert CommandValidator.validate("pwd") == {:ok, "pwd"}
    end

    test "allows permitted commands with arguments" do
      assert CommandValidator.validate("ls -la") == {:ok, "ls -la"}
      assert CommandValidator.validate("echo hello") == {:ok, "echo hello"}
    end

    test "blocks unpermitted single commands" do
      assert CommandValidator.validate("grep") == {:error, "Permission denied"}
      assert CommandValidator.validate("rm -rf /") == {:error, "Permission denied"}
    end

    test "allows permitted pipelines" do
      assert CommandValidator.validate("ls | cat") == {:ok, "ls | cat"}
      assert CommandValidator.validate("pwd | echo") == {:ok, "pwd | echo"}
      assert CommandValidator.validate("pwd || echo") == {:ok, "pwd || echo"}
      assert CommandValidator.validate("pwd && echo") == {:ok, "pwd && echo"}
      assert CommandValidator.validate("pwd ; echo") == {:ok, "pwd ; echo"}
    end

    test "blocks pipelines with unpermitted commands" do
      assert CommandValidator.validate("ls | grep i") == {:error, "Permission denied"}
      assert CommandValidator.validate("echo test | grep t") == {:error, "Permission denied"}
      assert CommandValidator.validate("grep i | ls") == {:error, "Permission denied"}
      assert CommandValidator.validate("grep i || ls") == {:error, "Permission denied"}
      assert CommandValidator.validate("grep i && ls") == {:error, "Permission denied"}
      assert CommandValidator.validate("ls ; grep i") == {:error, "Permission denied"}
    end

    test "is case insensitive for the command but preserves case for args" do
      assert CommandValidator.validate("LS -la") == {:ok, "LS -la"}
    end

    test "handles multiple spaces and empty segments" do
      assert CommandValidator.validate("ls  |  cat") == {:ok, "ls  |  cat"}
      assert CommandValidator.validate("ls | ") == {:error, "Permission denied"}
      assert CommandValidator.validate("ls  ||  cat") == {:ok, "ls  ||  cat"}
      assert CommandValidator.validate("ls  &&  cat") == {:ok, "ls  &&  cat"}
      assert CommandValidator.validate("ls  ;  cat") == {:ok, "ls  ;  cat"}
    end
  end
end
