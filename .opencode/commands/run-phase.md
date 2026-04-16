# /run-phase

Execute the APIT loop for the current phase until the gate clears or becomes blocked.

## Usage

```
/run-phase [phase-number]
```

If no phase number provided, uses current phase from state.md.

## Phase-Specific Behavior

### Phase 0 — SPECIFICATION

The Convergence Orchestrator conducts the requirements interview **directly**
using the `question` tool. No sub-agent delegation — the `task` tool cannot
create interactive sub-sessions.

Flow:
1. Read current state from `.sdlc/state.md`
2. Use `question` tool to interview the human stakeholder
3. Write docs/intent.md, docs/expectations.md, docs/spec.md
4. Run consistency check
5. When gate clears: confirm advancement via `question`

### Phases 1-5 — IMPLEMENTATION

The Convergence Orchestrator dispatches APIT Workers via the `task` tool.

Flow:
1. Read current state from `.sdlc/state.md`
2. Dispatch ONE APIT Worker at a time via `task` with `subagent_type: "apit-worker"`
3. Worker receives: interface contract, relevant SC-IDs, project layout, language config
4. After worker completes: verify build + tests pass
5. If verification fails: dispatch fix worker with error output
6. Update state.md with results
7. When all tasks complete: run gate check
8. If gate clears: confirm advancement via `question` tool

### Phase 6 — ALIGNMENT

The Convergence Orchestrator reads source and tests, generates shadow scenarios,
and presents them to the human via the `question` tool.

## Concurrency

- Max 1 APIT Worker at a time (sequential — prevents merge conflicts and state races)
- Sequential write queue for state file updates
- Atomic state updates

## Output

Real-time progress via agent.log
Final report: tasks completed, loss delta, next actions
