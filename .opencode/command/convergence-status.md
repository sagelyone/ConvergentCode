# /convergence-status

Display convergence trajectory and escape frequency report.

## Usage

```
/convergence-status
```

## Actions

1. Read agent.log
2. Compute loss trajectory over time
3. Count escape events by level
4. Generate ASCII sparkline
5. Report convergence metrics

## Output

```
Convergence Status
==================

Loss Trajectory (last 50 iterations):
50.0 │                                  ╭─╮
40.0 │                              ╭──╯ │
30.0 │          ╭─╮             ╭──╯     ╰──╮
20.0 │     ╭────╯ ╰────╮   ╭───╯            ╰──
10.0 │ ╭───╯           ╰───╯
 0.0 │─╯
     └────────────────────────────────────────

Current Loss: 15
Target Loss: 0
Convergence: 70% ████████░░

Escape Events:
  L1 (×3): 2 events
  L2 (×5): 1 event
  L3 (×7): 0 events
  L4 (×9): 0 events

Phase Progress:
  Phase 0: CLEARED ████████████
  Phase 1: ACTIVE  ██░░░░░░░░░░
  Phase 2: LOCKED  ░░░░░░░░░░░░
  Phase 3: LOCKED  ░░░░░░░░░░░░
  Phase 4: LOCKED  ░░░░░░░░░░░░
  Phase 5: LOCKED  ░░░░░░░░░░░░
  Phase 6: LOCKED  ░░░░░░░░░░░░
```
