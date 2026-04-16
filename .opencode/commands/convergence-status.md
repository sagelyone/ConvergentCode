# /convergence-status

Display current status, convergence trajectory, and escape frequency report.

## Usage

```
/convergence-status
```

## Actions

1. Read `.sdlc/state.md` for current phase, task, loss
2. Read `.sdlc/todo.md` for task completion summary
3. Read `.sdlc/config.json` for language
4. Compute current loss via `loss_compute`
5. Read agent.log for trajectory and escape events
6. Compute loss trajectory over time
7. Count escape events by level
8. Generate ASCII sparkline
9. Report convergence metrics

## Output

```
ConvergentCode Status
─────────────────────
Phase:     3 — CORE_LOGIC
Language:  go
Active:    T3-002: Implement calculation engine [ACTIVE]
Loss:      total=85 delta=-15 (↓ improving)
Tasks:     2/5 complete, 1 active, 0 blocked
Spec gaps: 0 unresolved
Next:      Dispatch APIT Worker for T3-002

Loss Trajectory (last 50 iterations):
50.0 │                                  ╭─╮
40.0 │                              ╭──╯ │
30.0 │          ╭─╮             ╭──╯     ╰──╮
20.0 │     ╭────╯ ╰────╮   ╭───╯            ╰──
10.0 │ ╭───╯           ╰───╯
 0.0 │─╯
      └────────────────────────────────────────

Current Loss: 85
Target Loss: 0
Convergence: 30% ███░░░░░░░

Escape Events:
  L1 (×3): 2 events
  L2 (×5): 1 event
  L3 (×7): 0 events
  L4 (×9): 0 events

Phase Progress:
  Phase 0: CLEARED ████████████
  Phase 1: CLEARED ████████████
  Phase 2: CLEARED ████████████
  Phase 3: ACTIVE  ██░░░░░░░░░░
  Phase 4: LOCKED  ░░░░░░░░░░░░
  Phase 5: LOCKED  ░░░░░░░░░░░░
  Phase 6: LOCKED  ░░░░░░░░░░░░
```

This command is read-only — it never modifies state.
