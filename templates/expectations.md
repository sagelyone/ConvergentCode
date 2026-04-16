# Expectations

## EXP-001 - [Title]
**Traces to:** INT-001
**Status:** none — needs implementation

**Invariant:** [What must always be true]

**Preconditions:** [When this applies]

**Postconditions:** [What must hold after]

**Property Test Candidate:** [Yes/No - if yes, describe property]

---

## EXP-DEF-01 - No Crash Under Any Input
**Traces to:** INT-DEF-01
**Status:** none — needs implementation

**Invariant:** No sequence of valid or invalid inputs causes the
application to panic, crash, or exit unexpectedly.

**Property Test Candidate:** Yes — fuzz with random input sequences,
assert no panics.

---

## EXP-DEF-02 - Operations Complete in Bounded Time
**Traces to:** INT-DEF-02
**Status:** none — needs implementation

**Invariant:** Every user-facing operation completes within the
configured time bound.

**Property Test Candidate:** Yes — measure operation duration,
assert under threshold.

---

## EXP-DEF-03 - Keyboard and Pointer Parity
**Traces to:** INT-DEF-03
**Status:** none — needs implementation

**Invariant:** For every action, keyboard input and pointer input
produce identical state changes.

**Property Test Candidate:** Yes — stateAfter(keyboard(action)) ==
stateAfter(pointer(action)).

---

## EXP-DEF-04 - Error States Are Recoverable
**Traces to:** INT-DEF-04
**Status:** none — needs implementation

**Invariant:** After any error state, a clear/recovery action returns
the application to a working state without data loss.

**Property Test Candidate:** Yes — enter error state, recover,
assert working state and data preserved.

---

*Expectations are derived from intents. Each must trace to ≥1 intent.*
