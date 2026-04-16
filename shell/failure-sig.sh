#!/usr/bin/env bash
set -euo pipefail
test_id="$1"; first_err=$(echo "$2" | head -1)
sig=$(echo "${test_id}:${first_err}" | sha256sum | cut -c1-12)
count=$(grep -c "$sig" .sdlc/todo.md 2>/dev/null || true)
jq -n --arg s "$sig" --argjson c "$count" '{signature:$s,repeat_count:$c}'
