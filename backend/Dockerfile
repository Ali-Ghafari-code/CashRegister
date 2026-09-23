FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=Asia/Tehran

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      default-libmysqlclient-dev \
      pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python -m scripts.wait_for_db && alembic upgrade head && (if [ \"$SEED_ON_START\" = \"1\" ]; then python -m scripts.seed || true; fi) && uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers"]
