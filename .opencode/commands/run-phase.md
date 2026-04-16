# /run-phase

Execute the APIT loop for the current phase until the gate clears or becomes blocked.

## Usage

```
/run-phase [phase-number]
```

If no phase number provided, uses current phase from state.md.

## Actions

1. Read current state from `.sdlc/state.md`
2. Start Convergence Orchestrator session
3. Orchestrator spawns APIT Worker sessions as needed
4. Monitor via log entries
5. On task completion: auto-commit
6. On escape: follow protocol
7. When all tasks complete: run gate check
8. If gate clears: offer to advance phase

## Concurrency

- Max 3 concurrent APIT Worker sessions
- File locking via flock on state files
- Atomic state updates

## Output

Real-time progress via agent.log
Final report: tasks completed, loss delta, next actions
