# Rule: Minimal Diffs

Make the smallest change that satisfies the requirement.

## Scope Limits

Phase 1-2 (Scaffolding):
- Max 120 lines changed per task
- Max 4 files touched

Phase 3-5 (Modification):
- Max 50 lines changed per task
- Max 4 files touched

## Why Small Diffs?

1. **Attributable failures** - When tests fail, you know exactly why
2. **Easier review** - Small changes are easier to understand
3. **Safer rollback** - Less to revert if needed
4. **Faster iteration** - Less code to test and debug

## Enforcement

Pre-implement hook checks scope:
```
IF lines_changed > max_lines:
  REJECT with: "Scope exceeds limit. Decompose task."
  
IF files_touched > max_files:
  REJECT with: "Too many files. Focus on single responsibility."
```

## Decomposition

When scope exceeds limits:
1. Split into smaller tasks
2. Each with independent test
3. Sequential or parallel execution
4. Compose results

## Example

```
Too big: "Implement full user authentication system"
         → 500 lines, 8 files

Decomposed:
  Task 1: "Create User model with email validation"
          → 40 lines, 2 files
  Task 2: "Add password hashing utility"
          → 30 lines, 1 file
  Task 3: "Implement login endpoint"
          → 50 lines, 2 files
```
