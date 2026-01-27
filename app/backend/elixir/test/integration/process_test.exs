defmodule Portfolio.IntegrationTest do
  use ExUnit.Case

  test "full flow execution" do
    # This is similar to unit test in this simple architecture,
    # but could test more interacting parts if we had them.
    assert Portfolio.Terminal.execute("whoami") =~ "root"
  end
end
