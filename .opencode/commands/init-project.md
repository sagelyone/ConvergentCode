# /init-project

Scaffold the `.sdlc/` state directory for a new project.

## Usage

```
/init-project [intent-seed.md]
```

## Actions

1. **Call the `init_project` tool** — this handles everything automatically:
   - Creates `.sdlc/` and `docs/` directories
   - Auto-detects language and test framework from project files (go.mod, package.json, Cargo.toml, pyproject.toml)
   - Writes all state files with correct format
   - Writes docs templates with default intents (crash resistance, performance, accessibility, error recovery) and expectations
   - Writes `.sdlc/config.json` with auto-detected settings pre-filled
   - If `intent-seed.md` is provided, uses it as `docs/intent.md` instead of the template

2. **Review the result** — the tool returns `detected_language` and `detected_test_command`. Use the `question` tool to confirm or correct:

```
question({ questions: [{
  question: "I detected your project uses [language] with [test_command]. Correct?",
  header: "Language Detection",
  options: [
    { label: "Yes, correct", description: "Use detected settings" },
    { label: "No, let me specify", description: "I'll provide the correct language and test command" }
  ]
}]})
```

3. **If the user provided project intent** — begin Phase 0 interview using the `question` tool (see Convergence Orchestrator agent prompt for interview flow).

## What the Tool Creates

| File | Content |
|---|---|
| `.sdlc/state.md` | Phase 0 initial state |
| `.sdlc/todo.md` | Phase 0 tasks with SMART criteria |
| `.sdlc/phases.md` | All 7 phases (Phase 0 ACTIVE, rest LOCKED) |
| `.sdlc/spec-gaps.md` | Empty |
| `.sdlc/blockers.md` | Empty |
| `.sdlc/agent.log` | Empty |
| `.sdlc/config.json` | Default config with auto-detected language/test settings |
| `docs/intent.md` | Template with 4 default intents + optional seed |
| `docs/expectations.md` | Template with 4 default expectations |
| `docs/spec.md` | Template with BDD scenario format |

## Auto-Detection

| File Detected | language | test.command |
|---|---|---|
| `go.mod` | go | go test |
| `package.json` with `"vitest"` | typescript | npx vitest run |
| `package.json` with `"jest"` | typescript | npx jest |
| `Cargo.toml` | rust | cargo test |
| `pyproject.toml` with `"pytest"` | python | pytest |

If no markers are found, `language` and `test.command` are left empty for the user to configure.
