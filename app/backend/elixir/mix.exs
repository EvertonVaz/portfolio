defmodule Portfolio.MixProject do
  use Mix.Project

  def project do
    [
      app: :portfolio,
      version: System.get_env("PORTFOLIO_VERSION") || "0.1.0",
      elixir: "~> 1.19",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Portfolio.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:bandit, "~> 1.6"},
      {:phoenix, "~> 1.7"},
      {:phoenix_pubsub, "~> 2.1"},
      {:websock_adapter, "~> 0.5"},
      {:joken, "~> 2.6"},
      {:jason, "~> 1.4"},
      {:corsica, "~> 2.1"},
      {:amqp, "~> 4.1"}
    ]
  end
end
