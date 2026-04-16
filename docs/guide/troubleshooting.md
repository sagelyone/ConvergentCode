# Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### Plugin not loading

**Symptom:** Commands not available after installation

**Check:**
1. Is the plugin file in `.opencode/plugins/convergentcode.js`?
   ```bash
   ls -la .opencode/plugins/convergentcode.js
   ```

2. Are the declarative assets in place?
   ```bash
   ls .opencode/agents/ .opencode/commands/ .opencode/rules/
   ```

3. Restart OpenCode after installation

### Missing state files

**Symptom:** Errors about missing `.sdlc/state.md`

**Solution:**
```
/init-project
```

## Configuration Issues

### Loss computation failing

**Symptom:** `loss_compute` returns errors

**Check:**
1. Test command is configured and works (use your project's test runner):
    ```bash
    go test ./...      # Go
    pytest              # Python
    bun test            # TypeScript
    ```

2. Config has test settings:
    ```jsonc
    {
      "test": {
        "command": "go test",  // or "pytest", "bun test", etc.
        "unit": "./..."        // or "tests/unit", "src/**/*.test.ts", etc.
      }
    }
    ```

### Escape protocol not triggering

**Symptom:** Agents retry same approach indefinitely

**Check:**
1. Escape thresholds configured:
   ```jsonc
   { "escape": { "L1": 3, "L2": 5, "L3": 7, "L4": 9 } }
   ```

2. Failure signatures being computed:
    Use the `failure_sig` tool with the task ID and error output

## State Issues

### State corruption

**Symptom:** State files have invalid format

**Solution:**
1. Backup current state:
   ```bash
   cp -r .sdlc .sdlc.backup
   ```

2. Reinitialize:
   ```bash
   rm -rf .sdlc
   /init-project
   ```

3. Restore any critical data from backup

### Phase not advancing

**Symptom:** Gate check shows incomplete but tasks are done

**Check:**
1. All checkboxes in phases.md:
   ```bash
   cat .sdlc/phases.md | grep "\- \[ \]"
   ```

2. No unresolved spec gaps:
   ```bash
   grep "awaiting_human" .sdlc/spec-gaps.md
   ```

3. Run gate check manually:
   ```
   /check-gate
   ```

## Test Issues

### Tests not found

**Symptom:** Test runner says no test files

**Check:**
1. Test files have correct suffix:
   - Go: `*_test.go`
   - TypeScript: `*.test.ts`
   - Python: `test_*.py`

2. Test command has correct pattern for your language:
    ```jsonc
    // Go
    { "test": { "unit": "./..." } }
    // Python
    { "test": { "unit": "tests/unit" } }
    // TypeScript
    { "test": { "unit": "src/**/*.test.ts" } }
    ```

### Property tests failing

**Symptom:** Unit tests pass but property tests fail

**This is expected behavior** - property tests validate invariants.

**Investigate:**
1. Read property test output
2. Check if invariant is actually violated
3. Fix implementation or update expectation

### Regression not detected

**Symptom:** Tests pass locally but fail in CI

**Check:**
1. Are tests deterministic?
2. Check for state leakage between tests
3. Verify test isolation

## Escape Issues

### False L1 escapes

**Symptom:** Agents rotate strategy too often

**Solution:**
Increase L1 threshold:
```jsonc
{ "escape": { "L1": 5 } }
```

### L4 blocking too many tasks

**Symptom:** Many tasks end up in blockers.md

**Investigate:**
1. Check if specification is unclear
2. Review if environment is correctly set up
3. Consider human intervention earlier

### Escape status not updating

**Symptom:** State shows NOMINAL but should show escape level

**Check:**
1. Agents updating state correctly:
   ```
   state_write '{"escape_status":"L1"}'
   ```

2. State file permissions:
   ```bash
   ls -la .sdlc/state.md
   ```

## Performance Issues

### Slow iteration times

**Symptom:** Each APIT cycle takes too long

**Optimizations:**
1. Reduce test scope:
   ```jsonc
   { "test": { "unit": "./pkg/..." } }
   ```

2. Increase timeout only if needed:
   ```jsonc
   { "test": { "timeout": "300s" } }
   ```

3. Use parallel test execution where safe

### High token usage

**Symptom:** Excessive API costs

**Optimizations:**
1. Reduce log_tail size:
   ```jsonc
   { "constraints": { "log_tail": { "worker": 10 } } }
   ```

2. Use selective Step 0 reads (agents already do this)

3. Ensure tasks are well-scoped (small changes = less context)

## Lock Issues

### Write queue errors

**Symptom:** State updates not applying or appearing delayed

**Solution:**
1. The plugin uses an in-process write queue — state writes are serialized automatically
2. If running multiple OpenCode instances against the same project, state files may conflict. Run one instance at a time per project
3. Restart OpenCode if the write queue appears stuck

### Concurrent modification

**Symptom:** State changes lost or corrupted

**Solution:**
1. Reduce concurrency:
    - Max 1 APIT worker at a time (sequential execution)
    - The plugin uses in-process write serialization — state writes are queued sequentially

2. The plugin uses in-process write serialization — state writes are queued sequentially. If running multiple OpenCode instances against the same project, state files may conflict. Run one instance at a time per project.

## Git Issues

### Commit failing

**Symptom:** `commit_green` fails

**Check:**
1. Git initialized:
   ```bash
   git status
   ```

2. Identity configured:
   ```bash
   git config user.name
   git config user.email
   ```

3. No merge conflicts

### Rollback failing

**Symptom:** `rollback` doesn't revert changes

**Check:**
1. Previous commit exists:
   ```bash
   git log --oneline -5
   ```

2. No uncommitted changes blocking revert:
   ```bash
   git status
   ```

## Getting Help

### Debug mode

Enable verbose logging in `.sdlc/config.json`:

```jsonc
{ "log_level": "verbose" }
```

Or for full debug output:

```jsonc
{ "log_level": "debug" }
```

### Check system health

```
/convergence-status
/compute-loss
/check-gate
```

### Report issues

Include:
1. State files (`.sdlc/`)
2. Agent log (`.sdlc/agent.log`)
3. Config (`.sdlc/config.json`)
4. Error messages
5. Steps to reproduce
