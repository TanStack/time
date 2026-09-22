#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SPECS_DIR="${ROOT_DIR}/specs"
SPECIFY_DIR="${ROOT_DIR}/.specify"
MEMORY_DIR="${SPECIFY_DIR}/memory"
TEMPLATES_DIR="${SPECIFY_DIR}/templates"

next_feature_id() {
  local max_id=0
  for dir in "${SPECS_DIR}"/*/; do
    if [ -d "$dir" ]; then
      local id=$(basename "$dir" | cut -d'-' -f1)
      if [[ "$id" =~ ^[0-9]+$ ]]; then
        if [ "$id" -gt "$max_id" ]; then
          max_id=$id
        fi
      fi
    fi
  done
  printf "%03d" $((max_id + 1))
}

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-' | sed 's/-*$//'
}

check_prerequisites() {
  if [ ! -f "${MEMORY_DIR}/constitution.md" ]; then
    echo "ERROR: No constitution found. Run /speckit.constitution first."
    exit 1
  fi
}
