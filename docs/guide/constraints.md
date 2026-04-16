# Constraints Guide

Understanding phase-sensitive limits and why they exist.

## Core Principle

Constraints exist to ensure:
1. **Attributable failures** - When tests fail, you know exactly why
2. **Minimal blast radius** - Changes don't break unrelated things
3. **Reviewability** - Small changes are easier to understand
4. **Rollback safety** - Less to revert if needed

## Phase-Sensitive Limits

### Phases 1-2: Scaffolding

```jsonc
{
  "constraints": {
    "max_lines": { "scaffold": 120 },
    "max_files": 4
  }
}
```

**Why 120 lines?**

New modules need structure:
- Package declarations and imports
- Type definitions
- Interface contracts
- Initial implementation

Capping at 50 would force artificial decomposition that wastes escape budget on transient failures.

**When this applies:**
- Creating new modules
- Setting up data layer
- Establishing architecture

### Phases 3-5: Modification

```jsonc
{
  "constraints": {
    "max_lines": { "modify": 50 },
    "max_files": 4
  }
}
```

**Why 50 lines?**

Modifications should be surgical:
- Small diffs are attributable
- Attributable failures are diagnosable
- Easy to review and understand
- Fast to revert if needed

**When this applies:**
- Adding features to existing code
- Bug fixes
- Refactoring

## max_files: 4

**The interface boundary pattern:**

```
1. Implementation file (service.go)
2. Service interface (service.go)
3. Type definitions (types.go)
4. One more (test, mock, etc.)
```

**Why not more?**

- Cross-cutting changes are risky
- Harder to attribute failures
- Review becomes difficult
- Rollback becomes complex

## diff_hash_window: 8

**What it does:**

Detects when agents are making similar changes repeatedly (stuck in a loop).

**How it works:**

1. Hash the diff after each implementation
2. Check last 8 iterations for collision
3. If collision detected → Escape L1

**Why 8?**

Typical subtask cluster:
- 2-3 related tasks
- 2-3 iterations each
- Covers legitimate revisits without false positives

## log_tail Configuration

```jsonc
{
  "log_tail": {
    "worker": 20,         // Recent context for focused work
    "orchestrator": 50,   // Trend visibility for coordination
    "gate_reviewer": "current_phase"  // Full phase picture
  }
}
```

**Rationale:**

- Workers need recent context (what just happened)
- Orchestrator needs trend visibility (where are we going)
- Gate reviewer needs full picture (is phase complete?)

## Enforcement

### Pre-implement Hook

```
IF lines_changed > max_lines:
  REJECT: "Scope exceeds limit. Decompose task."

IF files_touched > max_files:
  REJECT: "Too many files. Focus on single responsibility."
```

### Post-test Hook

```
IF diff_hash collision:
  ROLLBACK and Escape L1
```

## Decomposition Strategy

When scope exceeds limits, decompose:

```
Too big: "Implement full user authentication"
         → 500 lines, 8 files

Decomposed:
  Task 1: "Create User model with email validation"
          → 40 lines, 2 files
  Task 2: "Add password hashing utility"
          → 30 lines, 1 file
  Task 3: "Implement login endpoint"
          → 50 lines, 2 files
```

## Overriding Constraints

Generally **don't**. Constraints exist for good reasons.

If you must (temporary, exceptional cases):

```jsonc
{
  "constraints": {
    "max_lines": {
      "scaffold": 150,  // Temporary increase
      "modify": 75
    }
  }
}
```

Document why in state.md:

```markdown
**Last action:** Increased scaffold limit to 150 for database migration framework setup
**Reason:** Requires extensive DDL generation code
**Reverted:** Will revert to 120 after Phase 1
```

## Anti-patterns

### ❌ Chronic Override

Repeatedly overriding constraints indicates:
- Poor task decomposition
- Inadequate specification
- Wrong abstraction level

### ❌ Progressive Expansion

Each task gets a little bigger:
- Task 1: 50 lines
- Task 2: 60 lines
- Task 3: 80 lines
- Task 10: 200 lines

This is specification drift. Revisit Phase 0.

### ❌ File Sprawl

Touching many files per task:
- Hard to review
- Hard to debug
- Hard to rollback

Reconsider scope or decompose.

## Best Practices

### ✅ Single Responsibility

One task, one purpose, one concept.

### ✅ Observable Behavior

Each task changes something testable.

### ✅ Independence

Tasks can be completed in any order (mostly).

### ✅ Document Scope

In todo.md:

```markdown
### P2-003 Create OrderRepository
**Scope:** 
- OrderRepository interface
- Postgres implementation
- Unit tests
- ≤ 120 lines, 3 files
```
