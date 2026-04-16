# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **APIT Workers now infer from docs instead of asking humans** — when faced with ambiguity, workers read intent.md, expectations.md, and spec.md to infer what a human would decide. Gaps are deferred to spec-gaps.md, not asked about mid-cycle.
- **L4.5 escape level added** — when a worker truly cannot proceed without human input and cannot defer, it writes a `needs_human_input` blocker with a `**Question:**` field. The Orchestrator proxies the question to the human and re-dispatches the worker with the answer.
- Blocker template updated with `**Question:**` field and `needs_human_input` resolution option.

### Added

- `init_project` tool — the scaffolder is now a registered plugin tool. Calling `init_project` auto-detects language/test framework, creates all state files and docs templates, and returns detected settings for confirmation. No longer dead code. Tool count is now 13 (was 12 at v0.3.0).

## [0.3.0] - 2025-04-16

### Changed

- **Consolidated to TypeScript only** — removed Go binary (`sdlc-tool/`) and Bash scripts (`shell/`). All 12 tools are now pure TypeScript running in-process via the OpenCode plugin.
- Replaced `flock`-based file locking with `WriteQueue` (in-process promise chain). Sequential agent dispatch makes OS-level locking unnecessary.
- Loss computation uses exit codes instead of parsing test output — language-agnostic and universally compatible.
- Task status transitions now case-insensitive and handle bare headers (no bracket) — fixes scaffold template mismatch.
- Agent log entries include full phase/task/iteration context from state.md.
- Build process no longer requires Go compiler — single `bun build` step.
- CI no longer runs Go test matrix or cross-compilation.
- Release tarball no longer includes platform-specific binaries.
- **Flattened Phase 0 architecture** — the Convergence Orchestrator now conducts the spec interview directly using the `question` tool instead of delegating to a sub-agent. The `task` tool cannot create interactive sub-sessions in OpenCode.
- Fixed Loss delta bug — `stateWriteCore` now writes `total=N delta=+N` on a single `**Loss:**` line instead of attempting to write to a non-existent `**Loss delta:**` field.
- Standardized phase names to CORE_LOGIC (was inconsistently "Core Logic" or "CORE LOGIC").
- Updated all agent prompts to use the `question` tool for human interaction instead of printing plain text.
- APIT Workers now dispatched one at a time (sequential, not concurrent) — prevents merge conflicts and state races.
- Shell script references (`loss-compute.sh`, `failure-sig.sh`) removed from commands and docs — replaced by TypeScript tools.

### Added

- `assertion_density` tool — computes assertion-to-line ratio across source files (was shell-only, now first-class tool)
- `source_extensions` config field — configurable file glob patterns for assertion density scanning
- `language`, `log_level`, `stale_threshold`, `test.build` config fields
- 4 default intents in template: Crash Resistance, Performance, Accessibility, Error Recovery
- 4 corresponding default expectations in template
- Task template fields: Type, Depends on, Scenarios, Repro
- WriteQueue for in-process write serialization
- `uninstall.sh` — clean removal of ConvergentCode from a project
- `--upgrade` flag on `install.sh` — merges new config defaults while preserving existing settings
- Phase detection on startup — Orchestrator automatically infers project state
- `/next` command — auto-detects current state and performs the next logical action
- Auto-detection of language/test-framework in `/init-project` — checks go.mod, package.json, Cargo.toml, pyproject.toml
- Guided onboarding in `/init-project` — uses `question` tool to confirm detected settings and gather initial intent
- `question` tool usage in all 7 agent prompts — interactive prompts rendered in OpenCode TUI
- `**Status:** [ ]` fields in intent.md, expectations.md, spec.md templates — enables loss tracking
- SMART criteria fields in todo.md template matching state.ts parser format

### Removed

- `sdlc-tool/` directory — 658 lines of Go (replaced by ~550 lines of TypeScript)
- `shell/` directory — 434 lines of Bash (replaced by TypeScript tool implementations)
- `flock` / `syscall.Flock` dependency — not needed for single-process architecture
- External runtime dependencies: `jq`, `sha256sum`, `bc`, `flock` command
- `shadow-scenarios` tool — removed per design decision (Intent Alignment Oracle handles this)
- `test:go` npm script
- Go cross-compilation in release workflow

## [0.2.0] - 2025-04-15

### Changed

- **Complete rewrite** against the `@opencode-ai/plugin` API — the published plugin was non-functional before this
- Plugin entry point now exports `async function(input: PluginInput): Promise<Hooks>` per the official plugin spec
- All tools use `tool()` from `@opencode-ai/plugin` with Zod v4 schemas (via `tool.schema`)
- Tool argument order corrected to `execute(args, ctx)` (was `execute(ctx, args)`)
- Config moved from `.opencode/config.jsonc` to `.sdlc/config.json` — config reader now uses `readFile` + `JSON.parse` + schema validation
- `.opencode/agent/` renamed to `agents/`, `command/` to `commands/`, `skill/` to `skills/` (OpenCode convention)

### Added

- `install.sh` — primary distribution mechanism
- `templates/sdlc-config.json` — default ConvergentCode configuration template
- Integration tests: `plugin.test.ts`, `init-project.test.ts`

### Removed

- `@opencode-ai/sdk` dependency (not needed; `@opencode-ai/plugin` is sufficient)
- Old consolidated tool file — tools now in individual modules under `src/tools/`

## [0.1.0] - 2025-04-16

### Added

- Initial release of ConvergentCode
- 7 SDLC phases: SPECIFICATION, ARCHITECTURE, FOUNDATION, CORE_LOGIC, INTERFACE, HARDENING, ALIGNMENT
- 7 specialized agents: Convergence Orchestrator, APIT Worker, Spec Writer, Phase Gate Reviewer, Intent Alignment Oracle, Differential Implementer, Spec Gap Detector
- Custom tools for state management and testing
- Escape protocol with 4 escalation levels (L1-L4)
- Immutable ground truth documentation system
- Loss-driven development metrics
- GitHub Actions CI/CD pipeline

[Unreleased]: https://github.com/sagelyone/ConvergentCode/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/sagelyone/ConvergentCode/releases/tag/v0.3.0
[0.2.0]: https://github.com/sagelyone/ConvergentCode/releases/tag/v0.2.0
[0.1.0]: https://github.com/sagelyone/ConvergentCode/releases/tag/v0.1.0
