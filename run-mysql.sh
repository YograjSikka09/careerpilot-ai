#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is required for MySQL mode. Start Docker Desktop and try again."
  exit 1
fi
docker compose up --build
