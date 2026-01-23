defmodule Portfolio.Philosophers.ParserTest do
  use ExUnit.Case
  alias Portfolio.Philosophers.Parser

  test "parses correct line format" do
    line = "0 1 🍽 has taken a fork"
    assert {:ok, result} = Parser.parse(line)
    assert result.time == 0
    assert result.philo_id == 1
    assert result.action == "🍽 has taken a fork"
  end

  test "parses line with larger numbers" do
    line = "1234 200 is thinking"
    assert {:ok, result} = Parser.parse(line)
    assert result.time == 1234
    assert result.philo_id == 200
  end

  test "returns error on invalid format" do
    assert {:error, :invalid_format} = Parser.parse("invalid line")
    assert {:error, :invalid_format} = Parser.parse("123 only_one_number")
  end
end
