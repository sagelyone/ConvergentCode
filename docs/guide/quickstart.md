# Quickstart Guide

Get started with ConvergentCode in 5 minutes.

## Prerequisites

- OpenCode installed
- Node.js or Bun
- Git repository initialized

## Step 1: Install the Plugin

### Option A: One-line install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/sagelyone/ConvergentCode/main/install.sh | bash
```

### Option B: Clone and build

```bash
git clone https://github.com/sagelyone/ConvergentCode.git
cd ConvergentCode
npm install && npm run build
./install.sh --source . --project /path/to/your/project
```

No entry in the `plugins` array of `.opencode/config.json` is needed — OpenCode auto-loads plugins from `.opencode/plugins/`.

ConvergentCode-specific settings go in `.sdlc/config.json` (created by `/init-project`), not in `.opencode/config.jsonc`.

## Step 2: Initialize Project

In OpenCode:

```
/init-project
```

This creates:
- `.sdlc/` with state files
- `docs/` with templates

## Step 3: Phase 0 - Specification

Run:

```
/run-phase 0
```

The Spec Writer agent will interview you to create:
- `docs/intent.md` - Your goals and motivations
- `docs/expectations.md` - System invariants
- `docs/spec.md` - BDD scenarios

Answer questions honestly. The spec becomes immutable after this phase.

## Step 4: Autonomous Development

Run phases 1-5:

```
/run-phase 1
/run-phase 2
/run-phase 3
/run-phase 4
/run-phase 5
```

These run autonomously. The agents will:
1. Read state files
2. Analyze current situation
3. Plan next task
4. Implement
5. Test
6. Update state

You can check progress:

```
/convergence-status
```

## Step 5: Phase 6 - Alignment

Run:

```
/review-intent
```

Review the shadow scenarios and confirm alignment with original intent.

## Understanding Output

### Loss

Lower is better. Components:

- Failing acceptance tests (×100)
- Failing unit tests (×50)
- Failing property tests (×50)
- Unimplemented scenarios (×25)
- Uncovered expectations (×15)
- Unconfirmed intents (×10)
- Lint errors (×5)
- Blocked tasks (×3)
- Spec gaps (×1)

Target: 0

### Escape Events

If agents get stuck:

- L1 (×3): Strategy rotation
- L2 (×5): Task decomposition
- L3 (×7): Environment verification
- L4 (×9): Block task

## Next Steps

- Read the full [Configuration Guide](./configuration.md)
- Learn about [Constraints](./constraints.md)
- See [Troubleshooting](./troubleshooting.md)
