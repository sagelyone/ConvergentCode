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

### Option 1: GitHub URL (easiest)

Add to your `.opencode/config.jsonc`:

```jsonc
{
  "plugins": ["github:sagelyone/ConvergentCode"]
}
```

### Option 2: Download Release

1. Download the latest release from [GitHub Releases](https://github.com/sagelyone/ConvergentCode/releases)
2. Extract to your project
3. Add to your `.opencode/config.jsonc`:

```jsonc
{
  "plugins": ["./path/to/convergentcode"]
}
```

### Option 3: Clone and Build

```bash
git clone https://github.com/sagelyone/ConvergentCode.git
cd ConvergentCode
npm install
npm run build
```

Then add to your `.opencode/config.jsonc`:

```jsonc
{
  "plugins": ["/path/to/ConvergentCode"]
}
```

## Quick Start

1. **Initialize a new project**
   ```
   /init-project
   ```

2. **Run Phase 0: Specification** (human-interactive)
   ```
   /run-phase 0
   ```
   Work with the Spec Writer agent to define intents, expectations, and BDD scenarios.

3. **Run subsequent phases** (autonomous)
   ```
   /run-phase 1  # Architecture
   /run-phase 2  # Foundation
   /run-phase 3  # Core Logic
   /run-phase 4  # Interface
   /run-phase 5  # Hardening
   ```

4. **Phase 6: Alignment** (human review)
   ```
   /review-intent
   ```

5. **Check convergence status**
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

Create `.opencode/config.jsonc`:

```jsonc
{
  "harness": "convergentcode",
  "provider": {
    "name": "openrouter",
    "model": "z-ai/glm-5.1"
  },
  "test": {
    "command": "go test",
    "unit": "./...",
    "property": "-run Prop ./...",
    "acceptance": "-run Acceptance ./...",
    "lint": "golangci-lint run",
    "timeout": "120s"
  },
  "escape": {
    "L1": 3,
    "L2": 5,
    "L3": 7,
    "L4": 9
  },
  "loss_weights": {
    "acceptance": 100,
    "unit": 50,
    "property": 50,
    "unimplemented": 25,
    "expectations": 15,
    "intents": 10,
    "lint": 5,
    "blocked": 3,
    "spec_gaps": 1
  },
  "constraints": {
    "max_lines": {
      "scaffold": 120,
      "modify": 50
    },
    "max_files": 4,
    "diff_hash_window": 8
  }
}
```

## State Files

ConvergentCode maintains state in `.sdlc/`:

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

# Build
npm run build
```

### Releasing

1. Update version in `package.json` and `CHANGELOG.md`
2. Create a new tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
3. Push tag: `git push origin v0.1.0`
4. GitHub Actions will automatically create a release with binaries

## License

MIT

## Contributing

See CONTRIBUTING.md
