#!/usr/bin/env bash
set -euo pipefail
phase=$(grep -oP 'Phase:\*\*\s*\K[0-9]+' .sdlc/state.md 2>/dev/null || echo 0)
task=$(grep -oP 'Active task:\*\*\s*\K\S+' .sdlc/state.md 2>/dev/null || echo none)
iter_t=$(grep -oP 'task=\K[0-9]+' .sdlc/state.md 2>/dev/null || echo 0)
iter_g=$(grep -oP 'global=\K[0-9]+' .sdlc/state.md 2>/dev/null || echo 0)
flock .sdlc/agent.log jq -nc \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson phase "$phase" \
  --arg task "$task" --argjson it "$iter_t" --argjson ig "$iter_g" \
  --arg event "$1" --argjson payload "${2:-\{\}}" \
  '{ts:$ts,phase:$phase,task:$task,iter_task:$it,iter_global:$ig,
    event:$event,payload:$payload}' >> .sdlc/agent.log
