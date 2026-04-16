#!/usr/bin/env bash
set -euo pipefail

REPO="sagelyone/ConvergentCode"
BINARY_NAME="sdlc-tool"
LOCAL_BIN="${HOME}/.local/bin"
CONFIG_DIR="${HOME}/.config/opencode"
RELEASE_BASE="https://github.com/${REPO}/releases/latest/download"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

detect_platform() {
  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "$os" in
    linux)  os="linux" ;;
    darwin) os="darwin" ;;
    *)      error "Unsupported OS: $os" ;;
  esac
  case "$arch" in
    x86_64|amd64) arch="amd64" ;;
    aarch64|arm64) arch="arm64" ;;
    *)             error "Unsupported architecture: $arch" ;;
  esac
  echo "${os}-${arch}"
}

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

install_binary() {
  local platform="$1"
  local dest_dir="${LOCAL_BIN}"
  local binary_url="${RELEASE_BASE}/sdlc-tool-${platform}"
  local dest_path="${dest_dir}/${BINARY_NAME}"

  mkdir -p "$dest_dir"

  info "Downloading sdlc-tool for ${platform}..."
  if download_file "$binary_url" "$dest_path" 2>/dev/null; then
    chmod +x "$dest_path"
    info "Installed sdlc-tool to ${dest_path}"
  else
    warn "Pre-built binary not available. Falling back to Go build."
    build_from_source
  fi
}

build_from_source() {
  if ! command -v go &>/dev/null; then
    error "Go is not installed. Install Go from https://go.dev/dl/ or download the pre-built binary manually."
  fi
  info "Building sdlc-tool from source..."
  local tmpdir
  tmpdir="$(mktemp -d)"
  git clone --depth 1 "https://github.com/${REPO}.git" "$tmpdir/convergentcode"
  (cd "$tmpdir/convergentcode/sdlc-tool" && go build -o "${LOCAL_BIN}/${BINARY_NAME}" .)
  rm -rf "$tmpdir"
  info "Built and installed sdlc-tool to ${LOCAL_BIN}/${BINARY_NAME}"
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

copy_shell() {
  local src_dir="$1"
  local dest_dir="$2"

  if [ -d "${src_dir}/shell" ]; then
    mkdir -p "${dest_dir}/shell"
    cp -r "${src_dir}/shell/"* "${dest_dir}/shell/" 2>/dev/null || true
    chmod +x "${dest_dir}/shell/"* 2>/dev/null || true
    info "Copied shell/ scripts to ${dest_dir}/shell/"
  fi
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

print_path_note() {
  if ! echo ":${PATH}:" | grep -q ":${LOCAL_BIN}:"; then
    warn "${LOCAL_BIN} is not in your PATH."
    echo "  Add it by running:"
    echo "    echo 'export PATH=\"\${HOME}/.local/bin:\$PATH\"' >> ~/.bashrc"
    echo "    source ~/.bashrc"
  fi
}

usage() {
  cat <<'EOF'
Usage: install.sh [OPTIONS]

Install ConvergentCode for OpenCode.

Options:
  --global       Install assets and plugin globally (~/.config/opencode/)
  --project DIR  Install assets into a specific project directory (default: current directory)
  --source DIR   Use local clone as source instead of downloading
  --skip-binary  Skip sdlc-tool binary installation
  --skip-plugin  Skip plugin file installation
  -h, --help     Show this help message

Default behavior: download the latest release, install sdlc-tool binary to
~/.local/bin/, copy .opencode/ assets to the current project directory,
and copy the plugin file to <project>/.opencode/plugins/.
EOF
}

GLOBAL=false
PROJECT_DIR=""
SOURCE_DIR=""
SKIP_BINARY=false
SKIP_PLUGIN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --global)       GLOBAL=true; shift ;;
    --project)      PROJECT_DIR="$2"; shift 2 ;;
    --source)       SOURCE_DIR="$2"; shift 2 ;;
    --skip-binary)  SKIP_BINARY=true; shift ;;
    --skip-plugin)  SKIP_PLUGIN=true; shift ;;
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
    warn "Could not download release tarball. Installing binary only."
    warn "For full install, use: ./install.sh --source /path/to/ConvergentCode"
  fi
fi

if [ "$SKIP_BINARY" = false ]; then
  platform="$(detect_platform)"
  if [ -n "$SOURCE_DIR" ] && [ -f "${SOURCE_DIR}/dist/sdlc-tool" ]; then
    mkdir -p "$LOCAL_BIN"
    cp "${SOURCE_DIR}/dist/sdlc-tool" "${LOCAL_BIN}/${BINARY_NAME}"
    chmod +x "${LOCAL_BIN}/${BINARY_NAME}"
    info "Installed sdlc-tool from local build to ${LOCAL_BIN}/${BINARY_NAME}"
  elif [ -n "$SOURCE_DIR" ] && [ -d "${SOURCE_DIR}/sdlc-tool-binaries" ]; then
    mkdir -p "$LOCAL_BIN"
    cp "${SOURCE_DIR}/sdlc-tool-binaries/sdlc-tool-${platform}" "${LOCAL_BIN}/${BINARY_NAME}" 2>/dev/null && \
      chmod +x "${LOCAL_BIN}/${BINARY_NAME}" && \
      info "Installed sdlc-tool to ${LOCAL_BIN}/${BINARY_NAME}" || \
      install_binary "$platform"
  else
    install_binary "$platform"
  fi
  print_path_note
fi

if [ "$GLOBAL" = true ]; then
  opencode_dir="${CONFIG_DIR}"
else
  opencode_dir="${PROJECT_DIR}/.opencode"
fi

if [ -n "$SOURCE_DIR" ]; then
  copy_assets "$opencode_dir" "$SOURCE_DIR"
  copy_shell "$SOURCE_DIR" "$PROJECT_DIR"
  copy_templates "$SOURCE_DIR" "$PROJECT_DIR"
fi

if [ "$SKIP_PLUGIN" = false ]; then
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
info "  3. Run /run-phase 0 to start the SPECIFICATION phase"
info ""
info "Configuration: Edit .sdlc/config.json for test commands, escape thresholds, etc."