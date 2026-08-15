#!/usr/bin/env bash
set -e

PROJECT_DIR="/Users/alabhyapahari/Documents/projects/personalProjects/I-gotta-study"
APP_URL="http://localhost"

cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Starting Docker Desktop..."
    open -a Docker
    until docker info >/dev/null 2>&1; do sleep 1; done
fi

echo "Bringing up the stack..."
docker compose up -d

echo "Ensuring database schema exists..."
docker compose exec -T backend flask init-db

echo "Waiting for the app to accept connections..."
until curl -sf "$APP_URL" >/dev/null; do sleep 1; done

echo "Opening $APP_URL"
open "$APP_URL"
