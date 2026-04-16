#!/usr/bin/env bash
set -euo pipefail
phase=$(grep -oP 'Phase:\*\*\s*\K[0-9]+' .sdlc/state.md)
in_phase=false; total=0; checked=0
while IFS= read -r line; do
  if echo "$line" | grep -q "^## Phase ${phase} "; then in_phase=true; continue; fi
  if $in_phase && echo "$line" | grep -q "^## Phase "; then break; fi
  if $in_phase && echo "$line" | grep -q '^\- \['; then
    total=$((total + 1))
    echo "$line" | grep -q '^\- \[x\]' && checked=$((checked + 1))
  fi
done < .sdlc/phases.md
gaps=$(grep -c 'awaiting_human' .sdlc/spec-gaps.md 2>/dev/null || true)
jq -n --argjson ch "$checked" --argjson to "$total" --argjson ga "$gaps" \
  '{cleared:($ch == $to and $ga == 0),checked:$ch,total:$to,unresolved_gaps:$ga}'
