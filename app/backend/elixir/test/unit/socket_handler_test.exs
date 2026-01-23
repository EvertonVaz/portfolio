defmodule Portfolio.SocketHandlerTest do
  use ExUnit.Case, async: true

  alias Portfolio.SocketHandler

  describe "init/1" do
    test "initializes with empty state" do
      assert SocketHandler.init([]) == {:ok, []}
    end
  end

  describe "handle_in/2" do
    test "handles text input and returns response" do
      # Note: handle_in returns {:push, {:text, response}, state}
      assert {:push, {:text, response}, []} = SocketHandler.handle_in({"help", :text}, [])
      assert response =~ "Available commands"
    end
  end

  describe "handle_info/2" do
    test "handles :philosophers_update" do
      data = %{time: 100, philo_id: 1, action: "eating"}

      assert {:push, {:text, json}, []} =
               SocketHandler.handle_info({:philosophers_update, data}, [])

      decoded = Jason.decode!(json)
      assert decoded["type"] == "philosophers_update"
      assert decoded["data"]["philo_id"] == 1
    end

    test "handles :philosophers_exit" do
      assert {:push, {:text, json}, []} = SocketHandler.handle_info({:philosophers_exit, 0}, [])

      decoded = Jason.decode!(json)
      assert decoded["type"] == "philosophers_exit"
      assert decoded["status"] == 0
    end

    test "ignores unknown messages" do
      assert SocketHandler.handle_info(:unknown, []) == {:ok, []}
    end
  end

  describe "terminate/2" do
    test "terminates cleanly" do
      assert SocketHandler.terminate(:normal, []) == :ok
    end
  end
end
