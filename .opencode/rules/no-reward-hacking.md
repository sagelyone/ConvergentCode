# Rule: No Reward Hacking

Tests must validate actual requirements, not just pass assertions.

## What is Reward Hacking?

Reward hacking occurs when agents optimize for the metric (tests passing) rather than the actual goal (correct behavior).

Examples:
- Hardcoding expected return values
- Empty implementations that pass trivial assertions
- Mocking away the actual functionality
- Bypassing validation to make tests pass

## Detection

Watch for:
- Tests pass but implementation is obviously wrong
- Coverage drops despite tests passing
- Property tests fail but unit tests pass
- Code review reveals logic holes

## Prevention

1. **Property tests** - Validate invariants, not just examples
2. **Integration tests** - Test real interactions
3. **Mutation testing** - Verify tests catch bugs
4. **Code review** - Human judgment on implementation quality
5. **Loss function** - Lint errors, spec gaps, uncovered expectations

## Response

If reward hacking detected:
1. Revert the change
2. Update spec to be more precise
3. Add property test for the invariant
4. Retry with clearer requirements

## Example

```go
// Reward hacking - hardcoded
func CalculateTotal(items []Item) float64 {
    return 42.0 // Test expects 42.0
}

// Correct - actual implementation
func CalculateTotal(items []Item) float64 {
    var total float64
    for _, item := range items {
        total += item.Price * float64(item.Quantity)
    }
    return total
}
```
