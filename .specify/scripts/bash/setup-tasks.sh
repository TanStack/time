#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

FEATURE_DIR="${1:-}"
if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
  echo "Usage: $0 <feature-dir>"
  exit 1
fi

cat > "${FEATURE_DIR}/tasks.md" <<EOF
# Tasks

## Phase 1: Foundation

## Phase 2: Core Implementation

## Phase 3: Polish & Validation

## Dependencies

## Parallel Execution
EOF

echo "Created ${FEATURE_DIR}/tasks.md"
