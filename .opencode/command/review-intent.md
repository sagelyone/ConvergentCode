# /review-intent

Trigger the outer loop intent alignment review.

## Usage

```
/review-intent
```

## Actions

1. Invoke Intent Alignment Oracle
2. Generate shadow scenarios from actual behavior
3. Compare to spec scenarios
4. Identify traceability gaps
5. Present findings to human
6. Update spec-gaps.md with questions

## When to Use

- Phase 6 (required)
- Any time implementation seems to diverge from intent
- When acceptance tests pass but something feels wrong

## Output

Intent Alignment Report with:
- Shadow scenarios (what the system actually does)
- Traceability gaps
- Questions for human oracle
- Recommendations
