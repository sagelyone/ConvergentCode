# Escape Protocol

Procedures for handling repeated failures and getting unstuck.

## Trigger Condition

Escape protocol triggers on **repeated failure signatures**, not raw iteration count.

```
failure_sig = hash(task_id + first_error_line)
repeat_count = occurrences in todo.md
```

A task that fails 5 times with 5 different signatures is exploring productively.
A task that fails 3 times with the same signature is stuck.

## Escape Levels

### L1: Rotate Strategy (sig × 3)

**Trigger**: Same failure signature appears 3 times

**Action**:
1. Disqualify previous approach
2. Try fundamentally different strategy
3. Document rotation in state.md

**Example**:
```
Previous: Direct file modification
New: Use AST parsing for safer edits
```

### L2: Decompose (sig × 5)

**Trigger**: Same failure signature appears 5 times

**Action**:
1. Split task into 2-3 smaller subtasks
2. Each subtask has independent test
3. Spawn child sessions for each
4. Update todo.md with subtasks

**Example**:
```
Original: "Implement user authentication"
Subtask 1: "Create user model with validation"
Subtask 2: "Implement password hashing"
Subtask 3: "Add login endpoint"
```

### L3: Verify Environment (sig × 7)

**Trigger**: Same failure signature appears 7 times

**Action**:
1. Independently verify environment
2. Check: dependencies, versions, config
3. Run isolated test of failing component
4. Document findings

**Example**:
```
Check: go version, node version, database connection
Run: minimal reproduction of failure
Verify: test framework works independently
```

### L4: Block Task (sig × 9)

**Trigger**: Same failure signature appears 9 times

**Action**:
1. Mark task BLOCKED in todo.md
2. Create entry in blockers.md
3. Move to next task
4. Surface to human at next opportunity

**Blocker Entry**:
```markdown
## [BLK-NNN] L4 Escape
**Task:** P2-003
**Escape Level:** 4
**Description:** Cannot implement due to [reason]
**Question:** [Question for human, if needs_human_input]
**Created:** 2025-01-15T10:30:00Z
**Resolution:** None (requires human intervention)
```

### L4.5: Needs Human Input (not failure-based)

**Trigger**: Worker cannot infer from spec, cannot defer, and cannot proceed

This is NOT triggered by repeated failures. It is triggered when a worker encounters
an unresolvable ambiguity that cannot be inferred from `docs/intent.md`,
`docs/expectations.md`, or `docs/spec.md`, and deferring the gap is not viable.

**Action**:
1. Write to `.sdlc/blockers.md` with `**Resolution:** needs_human_input`
2. Include a `**Question:**` field with the specific question for the human
3. Mark the task as BLOCKED via `todo_update`
4. The Orchestrator reads the blocker, asks the human via `question` tool,
   writes the answer back, and re-dispatches the worker with the answer

**Blocker Entry**:
```markdown
## [BLK-NNN] needs_human_input
**Task:** P3-005
**Escape Level:** 4.5
**Description:** Cannot determine [specific thing] from spec
**Question:** Should [option A] or [option B] be the behavior when [condition]?
**Created:** 2025-01-15T10:30:00Z
**Resolution:** needs_human_input
```

## Implementation Notes

- Escape counts reset on task change
- L4 tasks can be retried after human intervention
- Document all escape events in agent.log
- Review escape patterns in retrospectives
