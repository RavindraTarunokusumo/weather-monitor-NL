#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
compose_file="$repo_root/infra/docker/docker-compose.yml"

docker compose -f "$compose_file" up -d postgres

cat <<'EOF'
PostgreSQL is running.

Next steps:
  cd apps/api && uv run fastapi dev app/main.py
  cd apps/web && npm run dev
EOF
