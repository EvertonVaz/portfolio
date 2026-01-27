defmodule PortfolioWeb.TerminalHandlerTest do
  use ExUnit.Case, async: true
  alias PortfolioWeb.TerminalHandler

  describe "init/1" do
    test "initializes with empty state" do
      assert TerminalHandler.init([]) == {:ok, []}
    end
  end

  describe "handle_in/2" do
    test "handles text input and returns response" do
      assert {:push, {:text, response}, []} = TerminalHandler.handle_in({"help", :text}, [])
      assert response =~ "Available commands"
    end
  end

  describe "handle_info/2" do
    test "ignores unknown messages" do
      assert TerminalHandler.handle_info(:unknown, []) == {:ok, []}
    end
  end

  describe "terminate/2" do
    test "terminates cleanly" do
      assert TerminalHandler.terminate(:normal, []) == :ok
    end
  end
end
