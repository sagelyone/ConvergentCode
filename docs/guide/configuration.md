# Configuration Guide

Complete reference for ConvergentCode configuration.

## Config File Location

`.sdlc/config.json`

ConvergentCode-specific settings live in `.sdlc/config.json` (not in `.opencode/config.jsonc`). This file is created automatically by `/init-project`. OpenCode's own settings (provider, model, etc.) go in `.opencode/config.jsonc` as usual.

## Full Schema

```jsonc
{
  // Project language (empty = not configured, agents will detect or ask)
  "language": "",
  // Log verbosity: "minimal" | "verbose" | "debug"
  "log_level": "minimal",
  // Seconds before assuming a worker is hung
  "stale_threshold": 300,
  // Source file glob patterns for assertion density scanning
  "source_extensions": ["*.go", "*.py", "*.rs", "*.ts", "*.js"],

  // Test runner configuration
  "test": {
    "command": "",           // Test command (e.g., "go test", "pytest", "bun test")
    "unit": "",              // Unit test pattern
    "property": "",          // Property test pattern
    "acceptance": "",        // Acceptance test pattern
    "lint": "true",          // Lint command ("true" = no-op)
    "build": "",             // Build command (e.g., "go build ./...", "tsc --noEmit")
    "timeout": "120s"        // Test timeout
  },

  // Escape protocol thresholds
  "escape": {
    "L1": 3,   // Rotate strategy after 3 repeated failures
    "L2": 5,   // Decompose after 5
    "L3": 7,   // Verify environment after 7
    "L4": 9    // Block task after 9
  },

  // Loss function weights
  "loss_weights": {
    "acceptance": 100,      // Failing acceptance test
    "unit": 50,             // Failing unit test
    "property": 50,         // Failing property test
    "unimplemented": 25,    // Unimplemented scenario
    "expectations": 15,     // Uncovered expectation
    "intents": 10,          // Unconfirmed intent
    "lint": 5,              // Lint error
    "blocked": 3,           // Blocked task
    "spec_gaps": 1          // Spec gap
  },

  // Development constraints
  "constraints": {
    "max_lines": {
      "scaffold": 120,      // Max lines for new files (Phases 1-2)
      "modify": 50          // Max lines for modifications (Phases 3-5)
    },
    "max_files": 4,         // Max files touched per task
    "diff_hash_window": 8,  // Window for diff hash collision detection
    "log_tail": {
      "worker": 20,         // Lines of agent.log for workers
      "orchestrator": 50,   // Lines for orchestrator
      "gate_reviewer": "current_phase"  // Lines for gate reviewer
    }
  }
}
```

## Provider Options

Provider and model settings are configured in OpenCode's own `.opencode/config.jsonc`, not in `.sdlc/config.json`. See OpenCode documentation for provider configuration.

### OpenRouter (default)

```jsonc
// In .opencode/config.jsonc
{
  "provider": {
    "name": "openrouter",
    "base_url": "https://openrouter.ai/api/v1",
    "model": "z-ai/glm-5.1"
  }
}
```

### OpenAI

```jsonc
// In .opencode/config.jsonc
{
  "provider": {
    "name": "openai",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4"
  }
}
```

### Anthropic

```jsonc
// In .opencode/config.jsonc
{
  "provider": {
    "name": "anthropic",
    "base_url": "https://api.anthropic.com/v1",
    "model": "claude-3-opus-20240229"
  }
}
```

## Test Configuration by Language

### Go

```jsonc
{
  "language": "go",
  "test": {
    "command": "go test",
    "unit": "./...",
    "property": "-run Prop ./...",
    "acceptance": "-run Acceptance ./...",
    "lint": "golangci-lint run",
    "build": "go build ./...",
    "timeout": "120s"
  }
}
```

### TypeScript/JavaScript

```jsonc
{
  "language": "typescript",
  "test": {
    "command": "bun test",
    "unit": "src/**/*.test.ts",
    "property": "-t property",
    "acceptance": "-t acceptance",
    "lint": "eslint .",
    "timeout": "60s"
  }
}
```

### Python

```jsonc
{
  "language": "python",
  "test": {
    "command": "pytest",
    "unit": "tests/unit",
    "property": "tests/property",
    "acceptance": "tests/acceptance",
    "lint": "flake8",
    "timeout": "120s"
  }
}
```

## Loss Weights Rationale

Weights reflect severity and fix cost:

- **Acceptance (100)**: Highest - represents user-facing failure
- **Unit/Property (50)**: High - represents component failure
- **Unimplemented (25)**: Medium - known missing functionality
- **Expectations (15)**: Lower - design-level gap
- **Intents (10)**: Lower - goal-level gap
- **Lint (5)**: Lowest - style issue
- **Blocked (3)**: Escalation artifact
- **Spec gaps (1)**: Informational

## Escape Thresholds

Escape protocol triggers on **repeated failure signatures**, not raw iteration count.

A task that fails 5 times with 5 different signatures is exploring productively.
A task that fails 3 times with the same signature is stuck.

Adjust thresholds based on:
- **Lower** (2/4/6/8): Stricter, faster escalation
- **Higher** (5/7/9/11): More tolerant, more exploration

## Constraints Rationale

### max_lines

- **Scaffold (120)**: New files need structural code (imports, types, setup)
- **Modify (50)**: Changes should be minimal and attributable

### max_files (4)

Balances:
- Interface boundary pattern (impl + service + types + one more)
- Prevents cross-cutting blast radius

### diff_hash_window (8)

Typical subtask cluster: 2-3 tasks × 2-3 iterations each

## Environment Variables

Override config with environment variables:

```bash
CONVERGENTCODE_PROVIDER_MODEL=z-ai/glm-5.1
CONVERGENTCODE_TEST_COMMAND="pytest"
CONVERGENTCODE_TEST_TIMEOUT="120s"
CONVERGENTCODE_ESCAPE_L1=3
```

## Validation

Config is validated on plugin load. Errors are reported to the agent.

Run validation:

```
/check-gate
```
