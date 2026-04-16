# ConvergentCode Agents

This repository is the ConvergentCode OpenCode plugin. It provides 7 specialized agents and 13 custom tools for convergence-driven autonomous development.

## Quick reference

| Agent | Role | Writes code? | Uses `question` tool? |
|---|---|---|---|
| convergence-orchestrator | Reads state, dispatches work, manages phases, conducts Phase 0 interview, proxies human questions for workers | No (docs in Phase 0) | Yes |
| apit-worker | Executes one Analyze→Plan→Implement→Test cycle; infers from docs, defers gaps | Yes | No (uses L4.5 blocker proxy) |
| spec-writer | Phase 0 specification reference agent | No | Yes |
| phase-gate-reviewer | Middle loop quality checks at phase boundaries | No | Yes |
| intent-alignment-oracle | Outer loop shadow scenario generation | No | Yes |
| differential-implementer | Phase 4 ambiguity detection (spec-only) | Yes (sandboxed) | Yes |
| spec-gap-detector | Continuous specification adequacy monitoring | No | Yes |

**Key architecture decisions:**
- The Convergence Orchestrator handles Phase 0 directly (conducting the spec interview
  using the `question` tool) rather than delegating to the Spec Writer via `task`.
- APIT Workers infer from docs when ambiguous, defer gaps to spec-gaps.md, and use
  L4.5 (needs_human_input) blockers when truly stuck. The Orchestrator proxies
  questions to the human on the worker's behalf.
- One APIT Worker dispatched at a time (sequential — prevents merge conflicts).

## Commands

| Command | Description |
|---|---|
| /init-project | Scaffold .sdlc/ state directory (with auto-detection and guided onboarding) |
| /next | Do whatever comes next based on current state |
| /run-phase | Execute APIT loop until phase gate clears |
| /check-gate | Run middle loop checks without advancing |
| /review-intent | Trigger outer loop human oracle |
| /compute-loss | Report current loss by component |
| /convergence-status | Current status, loss trajectory, and escape event frequency |

## Development

```bash
bun install
bun run typecheck
bun test
```

## Framework Overview

ConvergentCode guides AI agents through 7 phases of software development:

1. **SPECIFICATION** - Define what to build
2. **ARCHITECTURE** - Design how to build it
3. **FOUNDATION** - Build the data layer
4. **CORE_LOGIC** - Build the business logic
5. **INTERFACE** - Build the integration layer
6. **HARDENING** - Ensure quality and coverage
7. **ALIGNMENT** - Verify against original intent

Each phase has a gate that must clear before advancing. The loss function measures progress. The escape protocol handles stuck situations.

## Non-obvious Learnings

- **Loss, not time**: Progress is measured by decreasing loss, not elapsed time
- **Spec first**: Ground truth documents are sealed after Phase 0
- **Escape early**: Repeated failures trigger escalating recovery, not endless retries
- **Human at boundaries**: Humans specify (Phase 0) and confirm (Phase 6)
- **Agents in between**: Phases 1-5 run autonomously
- **Phase detection is automatic**: On startup, the Orchestrator reads .sdlc/state.md or infers from docs/
- **Language is configurable**: Set `language` in `.sdlc/config.json` to adapt all commands
- **Bug/feedback protocol uses todo.md**: Bugs and features are tracked with Type/Repro fields
- **`question` tool for human interaction**: All agents use the `question` tool for interactive prompts instead of plain text
- **Flattened Phase 0**: The Orchestrator conducts the spec interview directly, not via sub-agent delegation
- **`/next` is the primary command**: One command drives the entire SDLC — no need to remember specific commands

## Architecture

```
User
  ↓
OpenCode ←→ Plugin (dist/convergentcode.js)
              ↓
         ┌────┴────┐
         ↓         ↓
     Agents     Tools
     (7)        (13)
         ↓         ↓
   State Files   Pure TS
   (.sdlc/)    (no externals)
```

### Plugin internals

```
src/
├── index.ts              # export default async (input) => Hooks
├── config.ts             # reads .sdlc/config.json
├── types.ts              # Zod v4 schemas + ConvergentConfig type
├── tools/
│   ├── index.ts          # all 13 tool() definitions + re-exports
│   ├── write-queue.ts    # in-process write serialization
│   ├── file-utils.ts     # markdown read/write, regex helpers
│   ├── loss-compute.ts   # composite loss from tests + state
│   ├── state.ts          # stateWrite, todoUpdate, phaseAdvance, gateCheck
│   ├── git.ts            # commitGreen, rollback
│   ├── analysis.ts       # failureSig, diffHash, scenarioMatrix, assertionDensity
│   └── logging.ts        # logEmit
├── hooks/index.ts        # tool.execute.before / after hooks
└── features/
    └── init-project/
        └── scaffolder.ts # embedded template fallbacks
```

Config is split: ConvergentCode settings in `.sdlc/config.json`, OpenCode provider/model settings in `.opencode/config.jsonc`.

## Invariants

1. Monotonic progress (loss should decrease)
2. Test before complete
3. Ground truth immutable
4. Minimal diffs
5. Structured logs
6. Phase scope
7. Traceability
8. No unilateral spec resolution
