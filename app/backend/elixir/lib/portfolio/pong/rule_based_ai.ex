defmodule Portfolio.Pong.RuleBasedAI do
  def next_y(paddle_y, ball, paddle_height, paddle_speed, height) do
    target = ball.y - paddle_height / 2.0

    cond do
      paddle_y < target - 1 -> min((height - paddle_height) * 1.0, paddle_y + paddle_speed)
      paddle_y > target + 1 -> max(0.0, paddle_y - paddle_speed)
      true -> paddle_y
    end
  end
end
