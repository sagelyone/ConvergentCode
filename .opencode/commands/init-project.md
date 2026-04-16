# /init-project

Scaffold the `.sdlc/` state directory for a new project.

## Prerequisites

Before running this command, ensure ConvergentCode is installed:
- `.opencode/plugins/convergentcode.js` exists (the plugin file)
- `.opencode/agents/`, `.opencode/commands/`, `.opencode/rules/`, `.opencode/skills/` contain ConvergentCode markdown files

If any prerequisite is missing, follow the installation instructions in the ConvergentCode README first.

## Usage

```
/init-project [intent-seed.md]
```

## Actions

1. Create `.sdlc/` directory
2. Create `docs/` directory if not exists
3. Write `.sdlc/state.md` with Phase 0 initial state
4. Write `.sdlc/todo.md` with Phase 0 tasks
5. Write `.sdlc/phases.md` with all phases (Phase 0 ACTIVE, rest LOCKED)
6. Write `.sdlc/spec-gaps.md` empty
7. Write `.sdlc/blockers.md` empty
8. Write `.sdlc/agent.log` as empty file
9. Write `.sdlc/config.json` with default ConvergentCode configuration (if not already present)
10. Write `docs/intent.md`, `docs/expectations.md`, `docs/spec.md` with templates
11. If `intent-seed.md` provided, use it as `docs/intent.md` instead

## Output

- `.sdlc/state.md` - Initialized state (Phase 0, SPECIFICATION)
- `.sdlc/todo.md` - Phase 0 tasks
- `.sdlc/phases.md` - All phases locked except 0
- `.sdlc/spec-gaps.md` - Empty
- `.sdlc/blockers.md` - Empty
- `.sdlc/agent.log` - Empty
- `.sdlc/config.json` - Default configuration (test commands, escape thresholds, loss weights, constraints)
- `docs/intent.md` - From seed or template
- `docs/expectations.md` - Template
- `docs/spec.md` - Template

## Default Config

If `.sdlc/config.json` does not already exist, create it with these defaults:

```json
{
  "language": "",
  "log_level": "minimal",
  "stale_threshold": 300,
  "test": {
    "command": "",
    "unit": "",
    "property": "",
    "acceptance": "",
    "lint": "true",
    "build": "",
    "timeout": "120s"
  },
  "escape": { "L1": 3, "L2": 5, "L3": 7, "L4": 9 },
  "loss_weights": {
    "acceptance": 100, "unit": 50, "property": 50,
    "unimplemented": 25, "expectations": 15, "intents": 10,
    "lint": 5, "blocked": 3, "spec_gaps": 1
  },
  "constraints": {
    "max_lines": { "scaffold": 120, "modify": 50 },
    "max_files": 4,
    "diff_hash_window": 8,
    "log_tail": {
      "worker": 20,
      "orchestrator": 50,
      "gate_reviewer": "current_phase"
    }
  }
}
```

Set `language` and `test.command` to match your project's language and test framework.
See `docs/guide/configuration.md` for language-specific examples.