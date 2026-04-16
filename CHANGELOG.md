# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-04-15

### Changed

- **Complete rewrite** against the `@opencode-ai/plugin` API — the published plugin was non-functional before this
- Plugin entry point now exports `async function(input: PluginInput): Promise<Hooks>` per the official plugin spec
- All 11 tools use `tool()` from `@opencode-ai/plugin` with Zod v4 schemas (via `tool.schema`)
- Tool argument order corrected to `execute(args, ctx)` (was `execute(ctx, args)`)
- Config moved from `.opencode/config.jsonc` to `.sdlc/config.json` — config reader now uses `readFile` + `JSON.parse` + schema validation
- `.opencode/agent/` renamed to `agents/`, `command/` to `commands/`, `skill/` to `skills/` (OpenCode convention)
- `shellPath()` fixed to resolve relative to `ctx.directory` instead of `import.meta.url` (broke in bundled plugin)
- Shell scripts updated to read from `.sdlc/config.json`

### Added

- `install.sh` — primary distribution mechanism (binary download, Go build fallback, asset copying)
- `templates/sdlc-config.json` — default ConvergentCode configuration template
- Integration tests: `plugin.test.ts` (8 tests), `init-project.test.ts` (6 tests)
- `tsconfig.json` now sets `declaration: false` (Zod v4 types can't be named from our package)
- `.sdlc/` added to `.gitignore`
- Release workflow now produces cross-compiled `.tar.gz` bundles instead of npm publish

### Removed

- `@opencode-ai/sdk` dependency (not needed; `@opencode-ai/plugin` is sufficient)
- `src/agents/`, `src/cli/`, `src/shared/`, `src/config/` directories (functionality consolidated)
- Individual tool files (`src/tools/loss-compute.ts` etc.) — all tools now in `src/tools/index.ts`
- `script/publish.ts` (no longer publishing to npm)
- Old test files: `tests/integration/apit-cycle.test.ts`, `escape-protocol.test.ts`, `phase-advance.test.ts`, `rollback.test.ts`

## [0.1.0] - 2024-04-16

### Added

- Initial release of ConvergentCode
- 7 SDLC phases: Specification, Architecture, Foundation, Core Logic, Interface, Hardening, Alignment
- 7 specialized agents: Convergence Orchestrator, APIT Worker, Spec Writer, Phase Gate Reviewer, Intent Alignment Oracle, Differential Implementer, Spec Gap Detector
- 11 custom tools for state management and testing
- Escape protocol with 4 escalation levels (L1-L4)
- Immutable ground truth documentation system
- Loss-driven development metrics
- GitHub Actions CI/CD pipeline
- Cross-platform Go binaries (macOS, Linux, Windows)

[Unreleased]: https://github.com/sagelyone/ConvergentCode/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sagelyone/ConvergentCode/releases/tag/v0.2.0
[0.1.0]: https://github.com/sagelyone/ConvergentCode/releases/tag/v0.1.0
