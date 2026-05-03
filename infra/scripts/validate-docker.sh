#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Docker CLI was not found on PATH.

Install Docker Desktop or Docker Engine with Compose support, then rerun:
  bash infra/scripts/validate-docker.sh
EOF
  exit 127
fi

docker compose -f infra/docker/docker-compose.yml config
