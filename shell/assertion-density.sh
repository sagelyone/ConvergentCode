#!/usr/bin/env bash
set -euo pipefail

find . -name '*.go' -o -name '*.ts' -o -name '*.js' | head -100 | while read -r f; do
  assertions=$(grep -cE '(assert|expect|require|t\.Error|t\.Fatal)' "$f" 2>/dev/null || true)
  lines=$(wc -l < "$f" | tr -d ' ')
  [ "$lines" -gt 0 ] && density=$(echo "scale=2; $assertions / $lines" | bc)
  echo "$f: $assertions assertions / $lines lines = ${density:-0} density"
done
