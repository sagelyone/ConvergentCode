# Rule: Immutable Ground Truth

Documents in `docs/` are sealed after Phase 0 and cannot be modified by agents.

## Scope

- `docs/intent.md` - Original stakeholder intents
- `docs/expectations.md` - Derived invariants
- `docs/spec.md` - BDD scenarios

## Enforcement

1. **chmod 444** - Files are read-only
2. **Git pre-commit hook** - Rejects changes to docs/*.md
3. **Agent restrictions** - No write access to docs/*.md

## Exceptions

Only human can:
- Modify sealed documents
- Change status in spec-gaps.md
- Override phase gate decisions

## Rationale

Without immutable ground truth:
- Agents drift from original intent
- Specifications erode over time
- Tests pass but requirements violated
- No accountability for changes

## Process

```
Phase 0: Human + Spec Writer create docs/*.md
        ↓
Seal: chmod 444 docs/*.md
      Install git hook
        ↓
Phase 1-6: Agents read-only
          Gaps go to spec-gaps.md
          Human resolves gaps
```
