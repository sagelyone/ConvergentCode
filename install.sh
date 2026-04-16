#!/usr/bin/env bash
set -euo pipefail

REPO="sagelyone/ConvergentCode"
CONFIG_DIR="${HOME}/.config/opencode"
RELEASE_BASE="https://github.com/${REPO}/releases/latest/download"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

download_file() {
  local url="$1" dest="$2"
  if command -v curl &>/dev/null; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget &>/dev/null; then
    wget -q "$url" -O "$dest"
  else
    return 1
  fi
}

download_and_extract_release() {
  local dest_dir="$1"
  local tarball_url="${RELEASE_BASE}/convergentcode-latest.tar.gz"
  local tmpdir
  tmpdir="$(mktemp -d)"

  info "Downloading ConvergentCode release assets..."
  if download_file "$tarball_url" "${tmpdir}/convergentcode.tar.gz" 2>/dev/null; then
    tar xzf "${tmpdir}/convergentcode.tar.gz" -C "$tmpdir"
    local extracted
    extracted="$(find "$tmpdir" -maxdepth 1 -type d -name 'convergentcode*' | head -1)"
    if [ -n "$extracted" ]; then
      echo "$extracted"
      return 0
    fi
  fi

  rm -rf "$tmpdir"
  return 1
}

copy_assets() {
  local target_dir="$1"
  local src_dir="$2"

  mkdir -p "${target_dir}/agents" "${target_dir}/commands" "${target_dir}/rules" "${target_dir}/skills"

  for subdir in agents commands rules skills; do
    if [ -d "${src_dir}/.opencode/${subdir}" ]; then
      cp -r "${src_dir}/.opencode/${subdir}/"* "${target_dir}/${subdir}/" 2>/dev/null || true
    fi
  done

  info "Copied .opencode/ assets to ${target_dir}"
}

copy_templates() {
  local src_dir="$1"
  local dest_dir="$2"

  if [ -d "${src_dir}/templates" ]; then
    mkdir -p "${dest_dir}/templates"
    cp -r "${src_dir}/templates/"* "${dest_dir}/templates/" 2>/dev/null || true
    info "Copied templates/ to ${dest_dir}/templates/"
  fi
}

copy_plugin() {
  local plugin_src="$1"
  local plugin_dest="$2"

  mkdir -p "$plugin_dest"
  cp "$plugin_src" "${plugin_dest}/convergentcode.js"
  info "Installed plugin to ${plugin_dest}/convergentcode.js"
}

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS]

Install ConvergentCode for OpenCode.

Options:
  --global       Install assets and plugin globally (~/.config/opencode/)
  --project DIR  Install assets into a specific project directory (default: current directory)
  --source DIR   Use local clone as source instead of downloading
  --upgrade      Overwrite existing config.json with new defaults (preserves custom values)
  -h, --help     Show this help message

Default behavior: download the latest release, copy .opencode/ assets and
the plugin to the current project directory.

ConvergentCode is a pure TypeScript plugin — no binary installation needed.

Upgrade: re-run install.sh to overwrite agents, commands, rules, skills,
and the plugin with the latest versions. Your .sdlc/ state files and docs/
are never modified. Use --upgrade to also update config.json.

Uninstall: run uninstall.sh from this repository.
EOF
}

GLOBAL=false
PROJECT_DIR=""
SOURCE_DIR=""
UPGRADE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global)       GLOBAL=true; shift ;;
    --project)      PROJECT_DIR="$2"; shift 2 ;;
    --source)       SOURCE_DIR="$2"; shift 2 ;;
    --upgrade)      UPGRADE=true; shift ;;
    -h|--help)      usage; exit 0 ;;
    *)              error "Unknown option: $1" ;;
  esac
done

if [ -z "$PROJECT_DIR" ]; then
  PROJECT_DIR="$(pwd)"
fi

info "Installing ConvergentCode..."

DOWNLOADED_DIR=""
if [ -z "$SOURCE_DIR" ]; then
  DOWNLOADED_DIR="$(download_and_extract_release /tmp || true)"
  if [ -n "$DOWNLOADED_DIR" ]; then
    SOURCE_DIR="$DOWNLOADED_DIR"
    info "Using downloaded release assets"
  else
    warn "Could not download release tarball."
    warn "For full install, use: ./install.sh --source /path/to/ConvergentCode"
  fi
fi

if [ "$GLOBAL" = true ]; then
  opencode_dir="${CONFIG_DIR}"
else
  opencode_dir="${PROJECT_DIR}/.opencode"
fi

if [ -n "$SOURCE_DIR" ]; then
  copy_assets "$opencode_dir" "$SOURCE_DIR"
  copy_templates "$SOURCE_DIR" "$PROJECT_DIR"
fi

plugin_src=""
if [ -n "$SOURCE_DIR" ] && [ -f "${SOURCE_DIR}/dist/convergentcode.js" ]; then
  plugin_src="${SOURCE_DIR}/dist/convergentcode.js"
fi

if [ -n "$plugin_src" ]; then
  if [ "$GLOBAL" = true ]; then
    copy_plugin "$plugin_src" "${CONFIG_DIR}/plugins"
  else
    copy_plugin "$plugin_src" "${PROJECT_DIR}/.opencode/plugins"
  fi
else
  warn "Plugin file not found. Build it first with: bun run build"
  warn "Then copy dist/convergentcode.js to .opencode/plugins/"
fi

if [ "$UPGRADE" = true ] && [ "$GLOBAL" = false ]; then
  CONFIG_DEST="${PROJECT_DIR}/.sdlc/config.json"
  if [ -f "$CONFIG_DEST" ]; then
    EXISTING_LANG=$(jq -r '.language // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_CMD=$(jq -r '.test.command // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_UNIT=$(jq -r '.test.unit // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_PROP=$(jq -r '.test.property // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_ACCEPT=$(jq -r '.test.acceptance // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_LINT=$(jq -r '.test.lint // "true"' "$CONFIG_DEST" 2>/dev/null || echo "true")
    EXISTING_BUILD=$(jq -r '.test.build // ""' "$CONFIG_DEST" 2>/dev/null || echo "")
    EXISTING_EXTS=$(jq -c '.source_extensions // []' "$CONFIG_DEST" 2>/dev/null || echo "[]")
    if [ -n "$SOURCE_DIR" ] && [ -f "${SOURCE_DIR}/templates/sdlc-config.json" ]; then
      NEW_CONFIG=$(cat "${SOURCE_DIR}/templates/sdlc-config.json")
    else
      NEW_CONFIG=$(cat <<'CONFIGEOF'
{"language":"","log_level":"minimal","stale_threshold":300,"source_extensions":["*.go","*.py","*.rs","*.ts","*.js"],"test":{"command":"","unit":"","property":"","acceptance":"","lint":"true","build":"","timeout":"120s"},"escape":{"L1":3,"L2":5,"L3":7,"L4":9},"loss_weights":{"acceptance":100,"unit":50,"property":50,"unimplemented":25,"expectations":15,"intents":10,"lint":5,"blocked":3,"spec_gaps":1},"constraints":{"max_lines":{"scaffold":120,"modify":50},"max_files":4,"diff_hash_window":8,"log_tail":{"worker":20,"orchestrator":50,"gate_reviewer":"current_phase"}}}
CONFIGEOF
      )
    fi
    MERGED=$(echo "$NEW_CONFIG" | jq --arg lang "$EXISTING_LANG" --arg cmd "$EXISTING_CMD" \
      --arg unit "$EXISTING_UNIT" --arg prop "$EXISTING_PROP" --arg accept "$EXISTING_ACCEPT" \
      --arg lint "$EXISTING_LINT" --arg build "$EXISTING_BUILD" --argjson exts "$EXISTING_EXTS" '
      if $lang != "" then .language = $lang else . end |
      if $cmd != "" then .test.command = $cmd else . end |
      if $unit != "" then .test.unit = $unit else . end |
      if $prop != "" then .test.property = $prop else . end |
      if $accept != "" then .test.acceptance = $accept else . end |
      if $lint != "true" then .test.lint = $lint else . end |
      if $build != "" then .test.build = $build else . end |
      if ($exts | length) > 0 then .source_extensions = $exts else . end
    ')
    echo "$MERGED" | jq '.' > "$CONFIG_DEST"
    info "Upgraded config.json (preserved existing settings)"
  fi
fi

if [ -n "$DOWNLOADED_DIR" ]; then
  rm -rf "$DOWNLOADED_DIR"
fi

info ""
info "Installation complete!"
info ""
info "Next steps:"
info "  1. Open your project in OpenCode"
info "  2. Run /init-project to scaffold the .sdlc/ directory"
info "  3. Edit .sdlc/config.json — set language, test.command, and test.build"
info "  4. Run /run-phase 0 to start the SPECIFICATION phase"
