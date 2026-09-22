#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

FEATURE_DIR="${1:-}"
if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
  echo "Usage: $0 <feature-dir>"
  exit 1
fi

cat > "${FEATURE_DIR}/plan.md" <<EOF
# Implementation Plan

## Overview

## Tech Stack

## Architecture

## Data Model

## API Contracts

## Implementation Phases

## Risk Analysis

## Research Notes
EOF

mkdir -p "${FEATURE_DIR}/contracts"

echo "Created ${FEATURE_DIR}/plan.md"
