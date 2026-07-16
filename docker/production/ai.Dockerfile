# Build: venv com torch CPU-only
FROM python:3.11-slim-bookworm AS build

RUN pip install --no-cache-dir uv

WORKDIR /build
COPY app/backend/python/pyproject.toml ./

# Torch CPU primeiro: o resolver padrão traria as wheels CUDA (~5 GB de nvidia-*)
RUN uv venv /venv \
    && uv pip install --python /venv/bin/python \
        --index-url https://download.pytorch.org/whl/cpu torch==2.12.1+cpu \
    && uv pip install --python /venv/bin/python -r pyproject.toml

# Runtime: mesma base do build para o venv ser portável
FROM python:3.11-slim-bookworm

ENV PATH="/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

COPY --from=build /venv /venv

WORKDIR /app
COPY app/backend/python/main.py ./
COPY app/backend/python/pong_ai ./pong_ai

CMD ["python", "main.py"]
