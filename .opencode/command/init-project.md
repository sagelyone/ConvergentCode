# /init-project

Scaffold the `.sdlc/` state directory for a new project.

## Usage

```
/init-project [intent-seed.md]
```

## Actions

1. Create `.sdlc/` directory
2. Copy all templates from `templates/` to `.sdlc/`
3. Create `docs/` directory if not exists
4. Copy spec templates to `docs/`
5. Initialize `agent.log` empty file
6. If `intent-seed.md` provided, copy to `docs/intent.md`

## Output

- `.sdlc/state.md` - Initialized state
- `.sdlc/todo.md` - Phase 0 tasks
- `.sdlc/phases.md` - All phases locked except 0
- `.sdlc/spec-gaps.md` - Empty
- `.sdlc/blockers.md` - Empty
- `.sdlc/agent.log` - Empty
- `docs/intent.md` - From seed or template
- `docs/expectations.md` - Template
- `docs/spec.md` - Template
