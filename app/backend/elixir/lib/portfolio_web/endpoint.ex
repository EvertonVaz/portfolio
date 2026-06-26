defmodule PortfolioWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :portfolio

  socket "/socket", PortfolioWeb.UserSocket,
    websocket: true,
    longpoll: false

  plug Corsica,
    origins: "*",
    allow_headers: ["content-type", "authorization", "sec-websocket-protocol"]

  plug Portfolio.Router
end
