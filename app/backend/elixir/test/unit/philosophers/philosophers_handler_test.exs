defmodule PortfolioWeb.PhilosophersHandlerTest do
  use ExUnit.Case, async: true
  alias PortfolioWeb.PhilosophersHandler

  describe "init/1" do
    test "initializes with empty state" do
      assert PhilosophersHandler.init([]) == {:ok, []}
    end
  end

  describe "handle_in/2" do
    test "handles philosophers command" do
      # Mocking execution result
      assert {:push, {:text, response}, []} =
               PhilosophersHandler.handle_in({"philosophers_client_init", :text}, [])

      assert response =~ "context initialized"
    end
  end

  describe "handle_info/2" do
    test "handles :philosophers_update" do
      data = %{time: 100, philo_id: 1, action: "eating"}

      assert {:push, {:text, json}, []} =
               PhilosophersHandler.handle_info({:philosophers_update, data}, [])

      decoded = Jason.decode!(json)
      assert decoded["type"] == "philosophers_update"
      assert decoded["data"]["philo_id"] == 1
    end

    test "handles :philosophers_exit" do
      assert {:push, {:text, json}, []} =
               PhilosophersHandler.handle_info({:philosophers_exit, 0}, [])

      decoded = Jason.decode!(json)
      assert decoded["type"] == "philosophers_exit"
      assert decoded["status"] == 0
    end
  end
end
