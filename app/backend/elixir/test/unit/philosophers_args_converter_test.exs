defmodule Portfolio.Philosophers.ArgsConverterTest do
  use ExUnit.Case, async: true
  alias Portfolio.Philosophers.ArgsConverter

  describe "convert/1" do
    test "converts seconds to milliseconds for time arguments" do
      input = ["5", "0.8", "0.2", "0.2"]
      expected = ["5", "800", "200", "200"]
      assert ArgsConverter.convert(input) == expected
    end

    test "handles integer strings correctly" do
      input = ["5", "1", "2", "3"]
      expected = ["5", "1000", "2000", "3000"]
      assert ArgsConverter.convert(input) == expected
    end

    test "preserves the 5th argument (repeat count) if present" do
      input = ["5", "0.8", "0.2", "0.2", "10"]
      expected = ["5", "800", "200", "200", "10"]
      assert ArgsConverter.convert(input) == expected
    end

    test "handles mixed float and int strings" do
      input = ["5", "0.5", "1", "0.1"]
      expected = ["5", "500", "1000", "100"]
      assert ArgsConverter.convert(input) == expected
    end

    test "handles arbitrary strings by returning them as is" do
      input = ["5", "invalid", "1.0", "0.5"]
      assert ArgsConverter.convert(input) == ["5", "invalid", "1000", "500"]
    end
  end
end
