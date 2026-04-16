# Contributing to ConvergentCode

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/sagelyone/ConvergentCode.git
cd ConvergentCode

# Install dependencies
bun install

# Run type check
bun run typecheck

# Run tests
bun test
```

## Project Structure

```
.
├── src/               # TypeScript source
│   ├── index.ts       # Plugin entry point
│   ├── config.ts      # .sdlc/config.json reader
│   ├── types.ts       # Zod v4 schemas + shared types
│   ├── tools/
│   │   ├── index.ts          # Tool definitions + re-exports
│   │   ├── write-queue.ts    # In-process write serialization
│   │   ├── file-utils.ts     # Markdown read/write, regex helpers
│   │   ├── loss-compute.ts   # Composite loss from tests + state
│   │   ├── state.ts          # stateWrite, todoUpdate, phaseAdvance, gateCheck
│   │   ├── git.ts            # commitGreen, rollback
│   │   ├── analysis.ts       # failureSig, diffHash, scenarioMatrix, assertionDensity
│   │   └── logging.ts        # logEmit
│   ├── hooks/
│   │   └── index.ts   # Lifecycle hooks
│   └── features/
│       └── init-project/
│           └── scaffolder.ts
├── .opencode/         # OpenCode configuration
│   ├── agents/        # Agent prompts
│   ├── commands/      # Command definitions
│   ├── skills/        # Skills
│   └── rules/         # Invariant rules
├── templates/         # State file templates
├── tests/
│   └── integration/   # Integration tests
├── docs/              # Documentation
└── script/            # Build scripts
```

## Making Changes

### Adding a new tool

1. Add tool implementation in `src/tools/<category>.ts`
2. Add tool definition in `src/tools/index.ts` using the `tool()` helper from `@opencode-ai/plugin`
3. Write test
4. Update documentation

### Adding a new agent

1. Create prompt in `.opencode/agents/<agent-name>.md`
2. Write test
3. Update AGENTS.md

### Adding a new command

1. Create definition in `.opencode/commands/<command-name>.md`
2. Update README.md
3. Write test

## Testing

### Unit Tests

```bash
bun test
```

### Integration Tests

```bash
bun test tests/integration/
```

### Manual Testing

1. Build: `bun run build`
2. Copy: `cp dist/convergentcode.js ~/.opencode/plugins/`
3. Test in a fresh project with `/init-project`

## Code Style

- **TypeScript**: Use strict mode, no implicit any
- No comments unless explicitly requested

## Commit Messages

Follow conventional commits:

```
feat: add new scenario-matrix tool
fix: correct loss computation for edge cases
docs: update quickstart guide
refactor: simplify state file parsing
test: add integration test for escape protocol
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Update documentation
7. Submit pull request

## Release Process

Maintainers only:

1. Update `CHANGELOG.md` with new version
2. Update version in `package.json` if needed
3. Create and push a new tag:

```bash
# Patch release (0.0.1 -> 0.0.2)
git tag -a v0.0.2 -m "Release v0.0.2"
git push origin v0.0.2

# Minor release (0.3.0 -> 0.4.0)
git tag -a v0.4.0 -m "Release v0.4.0"
git push origin v0.4.0

# Major release (0.x.x -> 1.0.0)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build the TypeScript plugin bundle
- Create a GitHub Release with `.tar.gz` bundle and checksums

## Questions?

Open an [issue](https://github.com/sagelyone/ConvergentCode/issues) on GitHub.
