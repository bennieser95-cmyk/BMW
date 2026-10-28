#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NEON_API_KEY:-}" || -z "${NEON_NONPROD_PROJECT_ID:-}" ]]; then
  echo "Set NEON_API_KEY and NEON_NONPROD_PROJECT_ID. Do not use the production project." >&2
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to inspect the Neon branch list." >&2
  exit 2
fi

neon() {
  npx --yes --package=neonctl@8.13.1 neonctl "$@"
}

branches="$(neon branches list --project-id "$NEON_NONPROD_PROJECT_ID" --output json)"
parent_id="$(jq -er '.[] | select(.name == "main" and .default == true) | .id' <<<"$branches")"

for branch in dev staging; do
  if jq -e --arg name "$branch" '.[] | select(.name == $name)' <<<"$branches" >/dev/null; then
    printf 'Branch already exists: %s\n' "$branch"
  elif [[ "${CREATE_BRANCHES:-false}" == "true" ]]; then
    neon branches create \
      --project-id "$NEON_NONPROD_PROJECT_ID" \
      --name "$branch" \
      --parent "$parent_id" \
      --no-secrets
  else
    printf 'Missing branch: %s (set CREATE_BRANCHES=true to create it from Non-Prod main)\n' "$branch"
  fi
done

printf 'Preview branches are created by the Neon-Vercel integration; verify that it is connected only to Non-Prod.\n'
