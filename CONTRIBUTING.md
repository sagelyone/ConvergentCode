# Contributing to ConvergentCode

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/sagelyone/ConvergentCode.git
cd ConvergentCode

# Install dependencies
npm install

# Build the Go binary
cd sdlc-tool && go build -o sdlc-tool . && cd ..

# Run type check
npm run typecheck

# Run tests
npm test
npm run test:go
```

## Project Structure

```
.
├── src/               # TypeScript source
│   ├── agents/        # Agent prompt builders
│   ├── tools/         # Tool shims
│   ├── hooks/         # Lifecycle hooks
│   ├── features/      # Features (init-project, etc.)
│   ├── cli/           # CLI entry point
│   ├── config/        # Configuration schema
│   └── shared/        # Constants and types
├── .opencode/         # OpenCode configuration
│   ├── agent/         # Agent prompts
│   ├── command/       # Command definitions
│   ├── skill/         # Skills
│   └── rules/         # Invariant rules
├── sdlc-tool/         # Go binary
├── shell/             # Bash tools
├── templates/         # State file templates
├── tests/             # Test suites
│   └── integration/   # Integration tests
├── docs/              # Documentation
└── script/            # Build scripts
```

## Making Changes

### Adding a new tool

1. Create shim in `src/tools/<tool-name>.ts`
2. Export from `src/tools/index.ts`
3. Add shell script in `shell/<tool-name>.sh` (if needed)
4. Add Go subcommand in `sdlc-tool/` (if needed)
5. Write test
6. Update documentation

### Adding a new agent

1. Create prompt in `.opencode/agent/<agent-name>.md`
2. Create builder in `src/agents/<agent-name>/system-prompt.ts`
3. Register in `src/agents/index.ts`
4. Add tool restrictions in `src/agents/tool-restrictions.ts`
5. Write test
6. Update AGENTS.md

### Adding a new command

1. Create definition in `.opencode/command/<command-name>.md`
2. Implement handler in `src/cli/<command-name>/` (if complex)
3. Update README.md
4. Write test

## Testing

### Unit Tests

```bash
# TypeScript
npm test

# Go
cd sdlc-tool && go test ./...
```

### Integration Tests

```bash
npm run test:integration
```

### Manual Testing

1. Build: `npm run build`
2. Install locally: `npm link`
3. Test in a fresh project

## Code Style

- **TypeScript**: Use strict mode, no implicit any
- **Go**: Follow standard Go conventions (gofmt)
- **Bash**: Use `set -euo pipefail`

## Commit Messages

Follow conventional commits:

```
feat: add new scenario-matrix tool
fix: correct loss computation for Go projects
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

# Minor release (0.1.0 -> 0.2.0)
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# Major release (0.x.x -> 1.0.0)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build cross-platform Go binaries
- Create a GitHub Release
- Generate release notes
- Attach binaries and checksums

## Questions?

Open an [issue](https://github.com/sagelyone/ConvergentCode/issues) on GitHub.
