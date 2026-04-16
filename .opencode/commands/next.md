# /next

Perform whatever action comes next based on the current project state.
This is the primary command for driving ConvergentCode — no need to remember
specific phase commands.

## Usage

```
/next
```

## Behavior

Reads `.sdlc/state.md`, `.sdlc/todo.md`, and `.sdlc/phases.md` to determine
the current state, then performs the next logical action:

| Current State | Next Action |
|---|---|
| No `.sdlc/` directory | Call `init_project` tool, then confirm detected settings via `question` |
| Phase 0, no intents written | Begin requirements interview via `question` tool |
| Phase 0, intents partially written | Continue interview, derive expectations/scenarios |
| Phase 0, all docs complete, gate not checked | Run `gate_check` |
| Phase 0, gate cleared | Confirm phase advancement via `question`, then `phase_advance` |
| Phase 1-5, active task exists | Dispatch APIT Worker via `task` with `subagent_type: "apit-worker"` |
| Phase 1-5, no active task, tasks remain | Start next task from todo.md |
| Phase 1-5, all tasks complete | Run `gate_check` |
| Phase 1-5, gate cleared | Confirm phase advancement via `question`, then `phase_advance` |
| Phase 1-5, gate blocked | Surface spec-gaps via `question`, wait for human |
| Phase 6 | Generate shadow scenarios, present to human via `question` |
| Loss = 0, Phase 6 complete | Report convergence achieved |

## Principle

One command to rule them all. The user should be able to type `/next` repeatedly
to drive the entire SDLC from specification to alignment without needing to know
which specific command or agent to invoke at each stage.

## Output

Brief description of what was done and what the next `/next` will do.
