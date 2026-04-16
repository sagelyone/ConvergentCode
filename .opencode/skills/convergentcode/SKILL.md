# SKILL: ConvergentCode

ConvergentCode framework for convergence-driven autonomous software development.

## Core Principles

1. **Loss-Driven Development**: Minimize composite loss function
2. **Phase-Gated Progress**: 7 phases from specification to alignment
3. **Escape Protocol**: Escalating recovery on repeated failures
4. **Immutable Ground Truth**: Sealed docs after Phase 0
5. **Monotonic Progress**: Loss should decrease (or explain why not)

## The 7 Phases

0. **SPECIFICATION** - Intent, expectations, BDD scenarios (human-interactive)
1. **ARCHITECTURE** - Design acceptance test paths, identify properties
2. **FOUNDATION** - Data layer with unit and property tests
3. **CORE LOGIC** - Business logic, no UI dependency
4. **INTERFACE** - Integration tests, differential implementation check
5. **HARDENING** - All tests green, coverage threshold
6. **ALIGNMENT** - Human oracle confirms intents (outer loop)

## The APIT Cycle

Each iteration:
1. **Analyze** - Read state, compute loss, apply priority rules
2. **Plan** - SMART task with scope limits
3. **Implement** - Minimal change
4. **Test** - Run tests, handle pass/fail/regression
5. **Observe** - Watch for spec gaps

## Escape Protocol

Triggered by repeated failure signatures (not iteration count):

- **L1 (×3)**: Rotate strategy
- **L2 (×5)**: Decompose into subtasks
- **L3 (×7)**: Verify environment
- **L4 (×9)**: Block task, move on

## Invariants

1. Monotonic progress
2. Test before complete
3. Ground truth immutable
4. Minimal diffs
5. Structured logs
6. Phase scope
7. Traceability
8. No unilateral spec resolution

## State Files

- `.sdlc/state.md` - Current phase, task, metrics
- `.sdlc/todo.md` - Task list with SMART criteria
- `.sdlc/phases.md` - Phase gate checklist
- `.sdlc/spec-gaps.md` - Detected gaps (human resolves)
- `.sdlc/blockers.md` - L4 blocked tasks
- `.sdlc/agent.log` - Structured event log

## Commands

- `/init-project` - Scaffold state directory
- `/run-phase` - Execute APIT loop
- `/check-gate` - Run gate checks
- `/review-intent` - Outer loop review
- `/compute-loss` - Show loss breakdown
- `/convergence-status` - Trajectory report
