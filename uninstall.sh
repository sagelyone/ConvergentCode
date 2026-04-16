#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${HOME}/.config/opencode"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

GLOBAL=false
PROJECT_DIR=""
REMOVE_SDLC=false

usage() {
  cat <<'EOF'
Usage: uninstall.sh [OPTIONS]

Uninstall ConvergentCode from a project or globally.

Options:
  --global         Remove global assets from ~/.config/opencode/
  --project DIR    Remove project-level assets from a specific directory (default: current directory)
  --remove-sdlc    Also remove the .sdlc/ state directory (project-level only)
  -h, --help       Show this help message

Default behavior: remove ConvergentCode assets from the current project directory.
The .sdlc/ directory and docs/ are NOT removed by default (use --remove-sdlc).
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global)       GLOBAL=true; shift ;;
    --project)      PROJECT_DIR="$2"; shift 2 ;;
    --remove-sdlc)  REMOVE_SDLC=true; shift ;;
    -h|--help)      usage; exit 0 ;;
    *)              error "Unknown option: $1" ;;
  esac
done

if [ -z "$PROJECT_DIR" ]; then
  PROJECT_DIR="$(pwd)"
fi

info "Uninstalling ConvergentCode..."

if [ "$GLOBAL" = true ]; then
  ASSETS_DIR="${CONFIG_DIR}"
else
  ASSETS_DIR="${PROJECT_DIR}/.opencode"
fi

for subdir in agents commands rules skills; do
  TARGET="${ASSETS_DIR}/${subdir}"
  if [ -d "$TARGET" ]; then
    found_cc=false
    for f in "${TARGET}/"*.md; do
      [ -f "$f" ] || continue
      if grep -ql 'ConvergentCode\|convergence-orchestrator\|apit-worker\|spec-writer\|phase-gate-reviewer\|intent-alignment-oracle\|differential-implementer\|spec-gap-detector\|run-phase\|check-gate\|review-intent\|compute-loss\|convergence-status\|init-project\|agentic-sdlc\|escape-protocol' "$f" 2>/dev/null; then
        found_cc=true
        rm -f "$f"
      fi
    done
    if [ "$found_cc" = true ]; then
      info "Removed ConvergentCode ${subdir}/ assets from ${ASSETS_DIR}"
    fi
  fi
done

PLUGIN_DIR="${ASSETS_DIR}/plugins"
PLUGIN_FILE="${PLUGIN_DIR}/convergentcode.js"
if [ -f "$PLUGIN_FILE" ]; then
  rm -f "$PLUGIN_FILE"
  info "Removed ${PLUGIN_FILE}"
  rmdir "$PLUGIN_DIR" 2>/dev/null || true
fi

if [ "$GLOBAL" = false ]; then
  if [ "$REMOVE_SDLC" = true ]; then
    SDLC_DIR="${PROJECT_DIR}/.sdlc"
    if [ -d "$SDLC_DIR" ]; then
      rm -rf "$SDLC_DIR"
      info "Removed ${SDLC_DIR}"
    fi
  else
    info "Kept .sdlc/ directory (use --remove-sdlc to remove it)"
  fi

  TEMPLATES_DIR="${PROJECT_DIR}/templates"
  if [ -d "$TEMPLATES_DIR" ]; then
    cc_templates=(sdlc-config.json state.md todo.md phases.md spec-gaps.md blockers.md intent.md expectations.md spec.md)
    for tmpl in "${cc_templates[@]}"; do
      rm -f "${TEMPLATES_DIR}/${tmpl}"
    done
    remaining=$(find "$TEMPLATES_DIR" -type f 2>/dev/null | wc -l)
    if [ "$remaining" -eq 0 ]; then
      rmdir "$TEMPLATES_DIR" 2>/dev/null || true
      info "Removed templates/ directory"
    else
      info "Removed ConvergentCode templates (other files remain)"
    fi
  fi
fi

info ""
info "Uninstall complete."
info ""
info "Note: docs/intent.md, docs/expectations.md, and docs/spec.md were NOT removed."
info "Remove them manually if no longer needed: rm -rf docs/"
