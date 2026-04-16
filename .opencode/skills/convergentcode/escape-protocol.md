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
**Task**: P2-003
**Escape Level**: 4
**Description**: Cannot implement due to [reason]
**Failure Signature**: abc123
**Created**: 2024-01-15T10:30:00Z
**Resolution**: None (requires human intervention)
```

## Implementation Notes

- Escape counts reset on task change
- L4 tasks can be retried after human intervention
- Document all escape events in agent.log
- Review escape patterns in retrospectives
