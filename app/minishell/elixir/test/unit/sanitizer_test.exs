defmodule Messaging.SanitizerTest do
  use ExUnit.Case
  alias Messaging.Sanitizer

  describe "sanitize/1" do
    test "allows permitted single commands" do
      assert Sanitizer.sanitize("ls") == {:ok, "ls"}
      assert Sanitizer.sanitize("pwd") == {:ok, "pwd"}
    end

    test "allows permitted commands with arguments" do
      assert Sanitizer.sanitize("ls -la") == {:ok, "ls -la"}
      assert Sanitizer.sanitize("echo hello") == {:ok, "echo hello"}
    end

    test "blocks unpermitted single commands" do
      assert Sanitizer.sanitize("grep") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("rm -rf /") == {:error, "Permission denied"}
    end

    test "allows permitted pipelines" do
      assert Sanitizer.sanitize("ls | cat") == {:ok, "ls | cat"}
      assert Sanitizer.sanitize("pwd | echo") == {:ok, "pwd | echo"}
      assert Sanitizer.sanitize("pwd || echo") == {:ok, "pwd || echo"}
      assert Sanitizer.sanitize("pwd && echo") == {:ok, "pwd && echo"}
      assert Sanitizer.sanitize("pwd ; echo") == {:ok, "pwd ; echo"}
    end

    test "blocks pipelines with unpermitted commands" do
      assert Sanitizer.sanitize("ls | grep i") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("echo test | grep t") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("grep i | ls") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("grep i || ls") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("grep i && ls") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("ls ; grep i") == {:error, "Permission denied"}
    end

    test "is case insensitive for the command but preserves case for args" do
      assert Sanitizer.sanitize("LS -la") == {:ok, "LS -la"}
    end

    test "handles multiple spaces and empty segments" do
      assert Sanitizer.sanitize("ls  |  cat") == {:ok, "ls  |  cat"}
      assert Sanitizer.sanitize("ls | ") == {:error, "Permission denied"}
      assert Sanitizer.sanitize("ls  ||  cat") == {:ok, "ls  ||  cat"}
      assert Sanitizer.sanitize("ls  &&  cat") == {:ok, "ls  &&  cat"}
      assert Sanitizer.sanitize("ls  ;  cat") == {:ok, "ls  ;  cat"}
    end
  end
end
