# ConvergentCode

[![GitHub Release](https://img.shields.io/github/v/release/sagelyone/ConvergentCode)](https://github.com/sagelyone/ConvergentCode/releases)
[![CI](https://github.com/sagelyone/ConvergentCode/workflows/CI/badge.svg)](https://github.com/sagelyone/ConvergentCode/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Convergence-driven autonomous development harness for OpenCode.

## Overview

ConvergentCode brings structured, phase-gated, loss-driven software development to OpenCode. It includes:

- **7 specialized agents** for different SDLC phases
- **11 custom tools** for state management and testing
- **6 commands** for project initialization and control
- **Escape protocol** for handling stuck situations
- **Immutable ground truth** for specification integrity

## Installation

ConvergentCode consists of **four components** that must all be present for full functionality:

| Component | Required? | What breaks without it |
|---|---|---|
| `.opencode/agents/`, `commands/`, `rules/`, `skills/` | **Required** | No agents or commands appear in OpenCode |
| `.opencode/plugins/convergentcode.js` | **Required** | The 11 custom tools (loss_compute, gate_check, etc.) are unavailable |
| `shell/` directory in project root | **Required** | loss_compute, gate_check, diff_hash, failure_sig, log_emit return empty/zero defaults silently |
| `sdlc-tool` binary on PATH | **Required** | state_write, todo_update, phase_advance, commit_green, rollback, scenario_matrix return errors |

**Nothing goes in the `plugins` array of `.opencode/config.json`.** OpenCode auto-loads files from `.opencode/plugins/` and the declarative asset directories.

### Option 1: Clone and build (most reliable)

This is the only method that guarantees all four components are installed correctly.

```bash
# Clone and build
git clone https://github.com/sagelyone/ConvergentCode.git
cd ConvergentCode
npm install
npm run build                          # produces dist/convergentcode.js

# Build and install the Go binary
cd sdlc-tool && go build -o ~/.local/bin/sdlc-tool . && cd ..

# Install everything into your project (replace /path/to/project)
CC=/path/to/ConvergentCode
PROJ=/path/to/your/project

cp dist/convergentcode.js "$PROJ/.opencode/plugins/convergentcode.js"
cp -r .opencode/agents/*   "$PROJ/.opencode/agents/"
cp -r .opencode/commands/* "$PROJ/.opencode/commands/"
cp -r .opencode/rules/*    "$PROJ/.opencode/rules/"
cp -r .opencode/skills/*   "$PROJ/.opencode/skills/"
cp -r shell/               "$PROJ/shell/"
chmod +x "$PROJ/shell/"*
```

Or use the install script after building:
```bash
./install.sh --source . --project /path/to/your/project
```

### Option 2: Manual asset copy (no build tools needed)

If you don't have Node.js/Bun or Go, you can deploy just the declarative assets. You will get the 7 agents and 6 commands, but the 11 tools will be unavailable. This is enough to use the phase structure and agent guidance without automated loss computation.

```bash
CC=/path/to/ConvergentCode
PROJ=/path/to/your/project

mkdir -p "$PROJ/.opencode/agents" "$PROJ/.opencode/commands" "$PROJ/.opencode/rules" "$PROJ/.opencode/skills"

cp $CC/.opencode/agents/*.md   "$PROJ/.opencode/agents/"
cp $CC/.opencode/commands/*.md "$PROJ/.opencode/commands/"
cp $CC/.opencode/rules/*.md    "$PROJ/.opencode/rules/"
cp -r $CC/.opencode/skills/*   "$PROJ/.opencode/skills/"
```

**Limitations of manual copy only:**
- The 11 tools (`loss_compute`, `gate_check`, etc.) will not be registered — no automated loss tracking or escape protocol
- You must manually manage state files and phase transitions
- To add tools later, you must build the plugin (`npm run build`) and copy `dist/convergentcode.js` to `.opencode/plugins/`

### Option 3: `install.sh` (requires published GitHub Release)

Once a release is published on GitHub, this one-liner handles everything:

```bash
curl -fsSL https://raw.githubusercontent.com/sagelyone/ConvergentCode/main/install.sh | bash
```

For a specific project:
```bash
curl -fsSL https://raw.githubusercontent.com/sagelyone/ConvergentCode/main/install.sh | bash -s -- --project /path/to/your/project
```

**Note:** This option requires a GitHub Release to exist. If no release is available yet, use Option 1 or 2.

### What gets installed where

| Artifact | Destination | Installed by |
|---|---|---|
| `dist/convergentcode.js` | `<project>/.opencode/plugins/convergentcode.js` | Option 1, 3 |
| `.opencode/agents/*.md` | `<project>/.opencode/agents/` | All options |
| `.opencode/commands/*.md` | `<project>/.opencode/commands/` | All options |
| `.opencode/rules/*.md` | `<project>/.opencode/rules/` | All options |
| `.opencode/skills/` | `<project>/.opencode/skills/` | All options |
| `shell/*.sh` | `<project>/shell/` | Option 1, 3 |
| `sdlc-tool` binary | `~/.local/bin/sdlc-tool` | Option 1, 3 |
| `.sdlc/config.json` | `<project>/.sdlc/config.json` | Created by `/init-project` |

## Quick Start

1. **Install ConvergentCode** (see Installation above)

2. **Initialize a new project**
   ```
   /init-project
   ```

3. **Run Phase 0: Specification** (human-interactive)
   ```
   /run-phase 0
   ```
   Work with the Spec Writer agent to define intents, expectations, and BDD scenarios.

4. **Run subsequent phases** (autonomous)
   ```
   /run-phase 1  # Architecture
   /run-phase 2  # Foundation
   /run-phase 3  # Core Logic
   /run-phase 4  # Interface
   /run-phase 5  # Hardening
   ```

5. **Phase 6: Alignment** (human review)
   ```
   /review-intent
   ```

6. **Check convergence status**
   ```
   /convergence-status
   ```

## The 7 Phases

| Phase | Name | Description | Mode |
|-------|------|-------------|------|
| 0 | **SPECIFICATION** | Define intents, expectations, BDD scenarios | Human-interactive |
| 1 | **ARCHITECTURE** | Design acceptance test paths, identify properties | Autonomous |
| 2 | **FOUNDATION** | Data layer with unit and property tests | Autonomous |
| 3 | **CORE_LOGIC** | Business logic, no UI dependency | Autonomous |
| 4 | **INTERFACE** | Integration tests, differential check | Autonomous |
| 5 | **HARDENING** | All tests green, coverage threshold | Autonomous |
| 6 | **ALIGNMENT** | Human oracle confirms intents | Human-interactive |

## The 7 Agents

| Agent | Role | Writes Code? |
|-------|------|--------------|
| `convergence-orchestrator` | Reads state, dispatches work, manages phases | No |
| `apit-worker` | Executes one Analyze→Plan→Implement→Test cycle | Yes |
| `spec-writer` | Phase 0 specification elicitation with human | No |
| `phase-gate-reviewer` | Middle loop quality checks at phase boundaries | No |
| `intent-alignment-oracle` | Outer loop shadow scenario generation | No |
| `differential-implementer` | Phase 4 ambiguity detection (spec-only) | Yes (sandboxed) |
| `spec-gap-detector` | Continuous specification adequacy monitoring | No |

## The 6 Commands

| Command | Description |
|---------|-------------|
| `/init-project` | Scaffold .sdlc/ state directory |
| `/run-phase` | Execute APIT loop until phase gate clears |
| `/check-gate` | Run middle loop checks without advancing |
| `/review-intent` | Trigger outer loop human oracle |
| `/compute-loss` | Report current loss by component |
| `/convergence-status` | Loss trajectory and escape event frequency |

## Configuration

ConvergentCode-specific configuration lives in `.sdlc/config.json` (not in `.opencode/config.json`). This file is created automatically by `/init-project` from `templates/sdlc-config.json`.

Example `.sdlc/config.json`:

```json
{
  "test": {
    "command": "go test",
    "unit": "./...",
    "property": "-run Prop ./...",
    "acceptance": "-run Acceptance ./...",
    "lint": "true",
    "timeout": "120s"
  },
  "escape": { "L1": 3, "L2": 5, "L3": 7, "L4": 9 },
  "loss_weights": {
    "acceptance": 100, "unit": 50, "property": 50,
    "unimplemented": 25, "expectations": 15, "intents": 10,
    "lint": 5, "blocked": 3, "spec_gaps": 1
  },
  "constraints": {
    "max_lines": { "scaffold": 120, "modify": 50 },
    "max_files": 4,
    "diff_hash_window": 8
  }
}
```

## State Files

ConvergentCode maintains state in `.sdlc/`:

- `config.json` - Project-specific ConvergentCode settings
- `state.md` - Current phase, task, metrics
- `todo.md` - Task list with SMART criteria
- `phases.md` - Phase gate checklist
- `spec-gaps.md` - Detected specification gaps
- `blockers.md` - L4 blocked tasks
- `agent.log` - Structured event log

And in `docs/` (sealed after Phase 0):

- `intent.md` - Original stakeholder intents
- `expectations.md` - Derived invariants
- `spec.md` - BDD scenarios

## Escape Protocol

When agents get stuck, the escape protocol triggers:

| Level | Trigger | Action |
|-------|---------|--------|
| L1 | Same error × 3 | Rotate strategy |
| L2 | Same error × 5 | Decompose into subtasks |
| L3 | Same error × 7 | Verify environment |
| L4 | Same error × 9 | Block task, move on |

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Run tests
npm run test

# Run all tests (TypeScript + Go)
npm run test:all

# Build (produces dist/convergentcode.js + cross-compiled Go binaries)
npm run build
```

### Releasing

1. Update version in `package.json` and `CHANGELOG.md`
2. Create a new tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
3. Push tag: `git push origin v0.1.0`
4. GitHub Actions will automatically create a release with the plugin bundle, `sdlc-tool` binaries, and a `.tar.gz`

## License

MIT

## Contributing

See CONTRIBUTING.md