defmodule Portfolio.IntegrationTest do
  use ExUnit.Case

  test "full flow execution" do
    # Fluxo completo entrada -> Processor -> saída, tudo em Elixir (sem shell).
    result = Portfolio.Terminal.execute("echo integração")
    assert result =~ "integração"
    refute result =~ "[ERROR]"
  end
end
