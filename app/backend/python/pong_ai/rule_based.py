def compute_direction(state: dict) -> str:
    ai_y: float = state["ai_y"]
    ball_y: float = state["ball"]["y"]
    paddle_height: float = state["paddle_height"]

    target = ball_y - paddle_height / 2.0

    if ai_y < target - 2:
        return "down"
    elif ai_y > target + 2:
        return "up"
    return "stop"
