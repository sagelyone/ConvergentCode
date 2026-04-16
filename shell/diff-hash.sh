#!/usr/bin/env bash
set -euo pipefail
window=$(jq -r '.constraints.diff_hash_window // 8' .sdlc/config.json 2>/dev/null || echo 8)
hash=$(git diff 2>/dev/null | sha256sum | cut -c1-12)
[ "$hash" = "e3b0c44298fc" ] && hash=$(git diff --cached 2>/dev/null | sha256sum | cut -c1-12)
collision=$(tail -$((window * 4)) .sdlc/agent.log 2>/dev/null | \
  jq -r '.payload.diff_hash // empty' | grep -c "^${hash}$" || true)
jq -n --arg h "$hash" --argjson c "$collision" '{hash:$h,collision:($c > 0)}'
