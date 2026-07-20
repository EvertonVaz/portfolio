defmodule PortfolioWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :portfolio

  @session_options Application.compile_env!(:portfolio, :session_options)

  socket "/socket", PortfolioWeb.UserSocket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: false

  plug Corsica,
    origins: "*",
    allow_headers: ["content-type", "authorization", "sec-websocket-protocol"]

  plug Portfolio.Router
end
