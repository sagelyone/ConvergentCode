# /check-gate

Run phase gate checks without advancing to next phase.

## Usage

```
/check-gate [phase-number]
```

## Actions

1. Invoke Phase Gate Reviewer
2. Run all 7 middle-loop checks
3. Report results incrementally
4. Update phases.md checkboxes
5. Report gate status (cleared/blocked)

## Output

```
Phase X Gate Check
==================
Check 1: Traceability        [PASS]
Check 2: Test Coverage       [WARNING] 3 scenarios untested
Check 3: Architecture        [PASS]
Check 4: Spec Adequacy       [PASS]
Check 5: Escape Analysis     [PASS]
Check 6: Loss Trend          [PASS]
Check 7: Completeness        [FAIL] 2 unresolved spec gaps

Gate Status: BLOCKED
Unresolved gaps:
- GAP-001: Missing error handling spec
- GAP-002: Ambiguous timeout behavior
```
