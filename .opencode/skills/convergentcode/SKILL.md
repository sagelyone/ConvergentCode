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
3. **CORE_LOGIC** - Business logic, no UI dependency
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

## Phase Detection

On startup, ConvergentCode detects the project's phase automatically:
1. .sdlc/state.md exists → use its Phase field
2. All three docs exist → Phase 0 cleared, start at Phase 1
3. Partial or no docs → Phase 0 (Orchestrator conducts interview directly)

## Language Support

ConvergentCode is language-agnostic. Configure `.sdlc/config.json`:
- `language`: project language (go, python, typescript, etc.)
- `test.command`: test runner (go test, pytest, vitest, etc.)
- `test.unit/property/acceptance`: test patterns
- `test.lint`: linter command
- `test.build`: build command

Agents read these settings to adapt build, test, and verification commands.

## Bug & Feedback Protocol

User-reported issues flow through the existing file structure:
- Implementation bugs → todo.md (Type: bug, Repro: steps)
- Spec gaps revealed by bugs → spec-gaps.md + todo.md
- Feature requests → todo.md (Type: feature)

## Resilience

- Stale workers: if state.md hasn't updated in stale_threshold seconds,
  Orchestrator dispatches a replacement worker
- API errors: agents log failures and try alternative approaches
- Token limits: agents stop at 3000 words and continue next turn

## Commands

- `/init-project` - Scaffold state directory (with auto-detection and guided onboarding)
- `/next` - Do whatever comes next based on current state (primary driving command)
- `/run-phase` - Execute APIT loop until phase gate clears
- `/check-gate` - Run gate checks
- `/review-intent` - Outer loop review
- `/compute-loss` - Show loss breakdown
- `/convergence-status` - Status, trajectory, and escape frequency

## Human Interaction: The `question` Tool

ConvergentCode uses the `question` tool for human interaction in the main agent
context (Orchestrator, Spec Writer, Gate Reviewer, Oracle). This renders interactive,
selectable questions in the OpenCode TUI — not plain text.

Key interaction points:
- Phase 0: Requirements elicitation (Orchestrator conducts directly)
- Init-project: Confirm auto-detected language/test settings
- Gate results: Present check results and ask whether to advance
- Spec gaps: Present detected gaps and ask for resolution
- Phase 6: Shadow scenario review

**Workers and human questions:** APIT Workers run in subagent contexts where
`question` may not work. Instead, workers:
1. **Infer from docs** — read intent.md, expectations.md, spec.md to make decisions
2. **Defer gaps** — append to spec-gaps.md and move on to concrete work
3. **L4.5 blocker proxy** — if truly stuck, write `needs_human_input` to blockers.md
   with a `**Question:**` field. The Orchestrator reads it, asks the human via
   `question`, writes the answer back, and re-dispatches the worker.

Example:
```
question({ questions: [{
  question: "What operations should it support?",
  header: "Operations",
  options: [
    { label: "Basic (+, -, *, /)", description: "Four standard operations" },
    { label: "Basic + extended", description: "Add modulo, power, etc." },
    { label: "Full scientific", description: "Comprehensive set" }
  ]
}]})
```
