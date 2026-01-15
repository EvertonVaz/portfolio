defmodule Messaging.VerifyBinaryTest do
  use ExUnit.Case
  alias Messaging.Sanitizer

  describe "sanitize_response" do
    test "Testing with valid UTF-8 string..." do
      valid_string = "Hello, world!"
      assert Sanitizer.sanitize_response(valid_string, "cat") == {:ok, "Hello, world!"}
    end

    test "Testing with binary data (invalid UTF-8)..." do
      # ELF Header: 0x7f, 'E', 'L', 'F' + invalid bytes
      binary_data = <<0x7F, 0x45, 0x4C, 0x46, 0xFF, 0xFE, 0xFD>>

      assert Sanitizer.sanitize_response(binary_data, "cat") ==
               {:error, "Arquivo binário detectado. O conteúdo não pode ser exibido."}
    end
  end
end
