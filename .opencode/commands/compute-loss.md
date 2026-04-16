# /compute-loss

Compute and display current loss by component.

## Usage

```
/compute-loss
```

## Actions

1. Run loss-compute.sh
2. Parse results
3. Display breakdown

## Output

```
Loss Computation
================
Total Loss: 42 (Δ -8)

Components:
  Failing Acceptance: 0  × 100 = 0
  Failing Unit:       0  × 50  = 0
  Failing Property:   0  × 50  = 0
  Unimplemented:      1  × 25  = 25
  Uncovered Exp:      1  × 15  = 15
  Unconfirmed Int:    0  × 10  = 0
  Lint Errors:        0  × 5   = 0
  Blocked:            0  × 3   = 0
  Spec Gaps:          2  × 1   = 2
```
