#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

FEATURE_NAME="${1:-}"
if [ -z "$FEATURE_NAME" ]; then
  echo "Usage: $0 <feature-name>"
  exit 1
fi

ID=$(next_feature_id)
SLUG=$(slugify "$FEATURE_NAME")
FEATURE_DIR="${SPECS_DIR}/${ID}-${SLUG}"

mkdir -p "$FEATURE_DIR"

cat > "${FEATURE_DIR}/spec.md" <<EOF
# Specification: ${FEATURE_NAME}

## User Stories

As a user, I want...

## Functional Requirements

1. Requirement 1
2. Requirement 2

## Non-Functional Requirements

- Performance: ...
- Compatibility: ...

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Review & Acceptance Checklist

- [ ] Requirements are clear and unambiguous
- [ ] All user stories have acceptance criteria
- [ ] Edge cases are documented
- [ ] Dependencies are identified
- [ ] No over-engineered components
- [ ] Aligns with project constitution
EOF

echo "Created ${FEATURE_DIR}/spec.md"
