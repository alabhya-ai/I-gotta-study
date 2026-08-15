FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    FLASK_APP=run

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /app/instance \
    && chown -R app /app
USER app

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "run:app"]
