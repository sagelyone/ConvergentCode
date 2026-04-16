import { mkdir, readFile, writeFile, access, stat } from "fs/promises"
import { join, resolve } from "path"

interface DetectedConfig {
  language?: string
  test?: {
    command: string
    unit: string
    property: string
    acceptance: string
    lint: string
    build: string
    timeout: string
  }
}

const EMBEDDED_TEMPLATES: Record<string, string> = {
  "state.md": `# State

**Phase:** 0 — SPECIFICATION
**Active task:** P0-001
**Iteration:** task=0 phase=0 global=0
**Loss:** total=0 delta=0
**Last action:** Project initialized
**Last test:** none
**Failure signature:** none
**Escape status:** clear
**Next action:** Begin specification elicitation
`,

  "todo.md": `# Task List — Phase 0: SPECIFICATION

### P0-001: Draft intent statements [ACTIVE]
- **S:** Elicit goals from stakeholder. Produce docs/intent.md.
- **M:** intent.md with ≥ 1 intent, each with Goal/Motivation/Success.
- **A:** Conversational.
- **R:** Ground truth for the system.
- **T:** Human-paced.
- **Type:** task
- **Depends on:** none
- **Scenarios:** []
- **Repro:**
- **Iteration count:** 0
- **Failure signatures:** []

### P0-002: Draft expectations [ ]
- **S:** Derive invariants from intents. Produce docs/expectations.md.
- **M:** Each expectation references ≥ 1 intent.
- **A:** Conversational.
- **R:** EXP-001+ trace to INT-001+.
- **T:** Human-paced.
- **Type:** task
- **Depends on:** P0-001
- **Scenarios:** []
- **Repro:**
- **Iteration count:** 0
- **Failure signatures:** []

### P0-003: Draft BDD scenarios [ ]
- **S:** Write Given/When/Then scenarios. Produce docs/spec.md.
- **M:** Every scenario has example table; traceability complete.
- **A:** Conversational.
- **R:** Scenarios trace to expectations and intents.
- **T:** Human-paced.
- **Type:** task
- **Depends on:** P0-002
- **Scenarios:** []
- **Repro:**
- **Iteration count:** 0
- **Failure signatures:** []

### P0-004: Consistency check [ ]
- **S:** Check spec.md for collisions and traceability gaps.
- **M:** No Given/When collisions. No untraceable scenarios.
- **A:** Automated.
- **R:** Phase 0 gate condition.
- **T:** L1 at sig×3 · L2 at sig×5 · L3 at sig×7 · BLOCKED at sig×9.
- **Type:** task
- **Depends on:** P0-003
- **Scenarios:** []
- **Repro:**
- **Iteration count:** 0
- **Failure signatures:** []

## Blocked Tasks
## Completed Tasks
`,

  "phases.md": `# Phase Gate Tracker

## Phase 0 — SPECIFICATION [ACTIVE]
- [ ] All intents documented
- [ ] All expectations mapped to intents
- [ ] All scenarios have example tables
- [ ] Consistency check passes
- [ ] No unresolved ambiguities

## Phase 1 — ARCHITECTURE [LOCKED]
- [ ] All acceptance tests have plausible implementation path
- [ ] Property test candidates identified for all expectations
- [ ] No circular dependencies

## Phase 2 — FOUNDATION [LOCKED]
- [ ] Data layer unit tests green
- [ ] Data invariant property tests green
- [ ] No external service calls from data layer

## Phase 3 — CORE_LOGIC [LOCKED]
- [ ] Business logic unit and property tests green
- [ ] No UI dependency in logic layer

## Phase 4 — INTERFACE [LOCKED]
- [ ] Integration tests green
- [ ] Differential implementation check complete
- [ ] All ambiguities resolved

## Phase 5 — HARDENING [LOCKED]
- [ ] All acceptance tests green
- [ ] All property tests green
- [ ] Coverage ≥ threshold
- [ ] Scenario matrix complete

## Phase 6 — ALIGNMENT [LOCKED]
- [ ] All intents confirmed by human oracle
- [ ] All shadow scenarios reviewed
- [ ] All spec-gaps resolved or excluded
`,

  "spec-gaps.md": `# Specification Gaps

Detected gaps in specification adequacy. Each entry follows the format:

## [GAP-001] awaiting_human
**Detected:** [ISO 8601 timestamp]
**Status:** awaiting_human
**Description:** [Description of the gap]
**Suggested resolution:** [Concrete suggestion for human]

---

*This file is written by agents, status changed by humans only.*
`,

  "blockers.md": `# Blockers

Active blockers preventing task completion. Escalation protocol engaged.

## [BLK-001] L4 Escape
**Task:** P0-001
**Escape Level:** 4
**Description:** [Description of blocker]
**Question:** [Question for human, if needs_human_input]
**Created:** [ISO 8601 timestamp]
**Resolution:** [None | Moved to next task | Human intervention required | needs_human_input]

---

*L4 escapes automatically create entries here.*
`,

  "intent.md": `# Intent

## INT-001 [ ] - [Title]

**Goal:** [What the system should achieve]

**Motivation:** [Why this matters]

**Success Criteria:**
- [Criterion 1]
- [Criterion 2]

**Priority:** [Critical/High/Medium/Low]

**Source:** [Human conversation / Document / Derived]

**Status:** [ ]

---

## INT-DEF-01 [ ] - Crash Resistance

**Goal:** No sequence of inputs or events causes the application to panic,
crash, or exit unexpectedly.

**Motivation:** A crashed application erases user work and breaks trust.

**Success Criteria:**
- No panic under any input sequence
- No unhandled errors that terminate the process
- Fuzz testing produces zero crashes

**Priority:** High
**Source:** ConvergentCode default
**Status:** [ ]

---

## INT-DEF-02 [ ] - Performance

**Goal:** Operations complete within acceptable time bounds.

**Motivation:** Unresponsive software is unusable software.

**Success Criteria:**
- User-facing operations complete within [configurable]ms
- No memory leaks under sustained use

**Priority:** Medium
**Source:** ConvergentCode default
**Status:** [ ]

---

## INT-DEF-03 [ ] - Accessibility

**Goal:** All functionality is accessible via both keyboard and pointer
input when the platform supports both.

**Motivation:** Users have different interaction preferences and abilities.

**Success Criteria:**
- Every action achievable via keyboard has an equivalent pointer path
- Every action achievable via pointer has an equivalent keyboard path

**Priority:** Medium
**Source:** ConvergentCode default
**Status:** [ ]

---

## INT-DEF-04 [ ] - Error Recovery

**Goal:** Error states are recoverable without data loss.

**Motivation:** Errors happen. Users should be able to continue working.

**Success Criteria:**
- Every error state has a documented recovery path
- Recovery preserves all data entered before the error
- Clear error messages explain what went wrong

**Priority:** High
**Source:** ConvergentCode default
**Status:** [ ]

---

*This file is sealed after Phase 0. Changes require human approval.*
`,

  "expectations.md": `# Expectations

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
`,

  "spec.md": `# Specification

## Feature: [Feature Name]

### Background
Given [context]
And [more context]

### Scenario: [Scenario ID] - [Title]
**Traces to:** EXP-001, INT-001
**Status:** [ ] unimplemented | [x] implemented

**Given** [precondition]
**And** [more preconditions]

**When** [action/event]
**And** [more actions]

**Then** [expected outcome]
**And** [more outcomes]

**Examples:**
| Field1 | Field2 | Expected |
|--------|--------|----------|
| val1   | val2   | result   |

---

*Specifications are immutable after Phase 0. Gaps go to .sdlc/spec-gaps.md*
`,

  "sdlc-config.json": JSON.stringify({
    language: "",
    log_level: "minimal",
    stale_threshold: 300,
    source_extensions: ["*.go", "*.py", "*.rs", "*.ts", "*.js"],
    test: {
      command: "",
      unit: "",
      property: "",
      acceptance: "",
      lint: "true",
      build: "",
      timeout: "120s",
    },
    escape: { L1: 3, L2: 5, L3: 7, L4: 9 },
    loss_weights: {
      acceptance: 100, unit: 50, property: 50,
      unimplemented: 25, expectations: 15, intents: 10,
      lint: 5, blocked: 3, spec_gaps: 1,
    },
    constraints: {
      max_lines: { scaffold: 120, modify: 50 },
      max_files: 4,
      diff_hash_window: 8,
      log_tail: { worker: 20, orchestrator: 50, gate_reviewer: "current_phase" },
    },
  }, null, 2),
}

const LANGUAGE_DETECTORS: Array<{
  file: string
  language: string
  testCommand: string
  testUnit: string
  testBuild: string
  detect?: (content: string) => boolean
}> = [
  {
    file: "go.mod",
    language: "go",
    testCommand: "go test",
    testUnit: "./...",
    testBuild: "go build ./...",
  },
  {
    file: "package.json",
    language: "typescript",
    testCommand: "npx vitest run",
    testUnit: "--reporter=verbose",
    testBuild: "npx tsc --noEmit",
    detect: (content: string) => content.includes('"vitest"'),
  },
  {
    file: "package.json",
    language: "typescript",
    testCommand: "npx jest",
    testUnit: "--verbose",
    testBuild: "npx tsc --noEmit",
    detect: (content: string) => content.includes('"jest"') && !content.includes('"vitest"'),
  },
  {
    file: "Cargo.toml",
    language: "rust",
    testCommand: "cargo test",
    testUnit: "",
    testBuild: "cargo build",
  },
  {
    file: "pyproject.toml",
    language: "python",
    testCommand: "pytest",
    testUnit: "-v",
    testBuild: "",
    detect: (content: string) => content.includes("pytest"),
  },
]

async function detectLanguage(projectDir: string): Promise<DetectedConfig> {
  for (const detector of LANGUAGE_DETECTORS) {
    try {
      const filePath = join(projectDir, detector.file)
      const content = await readFile(filePath, "utf-8")
      if (detector.detect && !detector.detect(content)) continue
      return {
        language: detector.language,
        test: {
          command: detector.testCommand,
          unit: detector.testUnit,
          property: "",
          acceptance: "",
          lint: "true",
          build: detector.testBuild,
          timeout: "120s",
        },
      }
    } catch {
      continue
    }
  }
  return {}
}

async function findTemplatesDir(projectDir: string): Promise<string | null> {
  const candidates = [
    join(projectDir, "templates"),
    join(projectDir, ".opencode", "templates"),
    join(projectDir, "..", "templates"),
  ]
  for (const dir of candidates) {
    try {
      const s = await stat(dir)
      if (s.isDirectory()) return dir
    } catch { /* not found */ }
  }
  return null
}

async function getTemplate(name: string, templatesDir: string | null): Promise<string> {
  if (templatesDir) {
    try {
      return await readFile(join(templatesDir, name), "utf-8")
    } catch { /* fall through to embedded */ }
  }
  const embedded = EMBEDDED_TEMPLATES[name]
  if (embedded) return embedded
  throw new Error(`Template not found: ${name}`)
}

export async function initProject(seedFile?: string): Promise<{
  detectedLanguage: string
  detectedTestCommand: string
}> {
  const projectDir = process.cwd()
  const templatesDir = await findTemplatesDir(projectDir)
  const detected = await detectLanguage(projectDir)

  try {
    await mkdir(join(projectDir, ".sdlc"), { recursive: true })
    await mkdir(join(projectDir, "docs"), { recursive: true })
  } catch (err) {
    throw new Error(`Failed to create directories: ${err}`)
  }

  const files = [
    { src: "state.md", dest: ".sdlc/state.md" },
    { src: "todo.md", dest: ".sdlc/todo.md" },
    { src: "phases.md", dest: ".sdlc/phases.md" },
    { src: "spec-gaps.md", dest: ".sdlc/spec-gaps.md" },
    { src: "blockers.md", dest: ".sdlc/blockers.md" },
    { src: "expectations.md", dest: "docs/expectations.md" },
    { src: "spec.md", dest: "docs/spec.md" },
  ]

  for (const { src, dest } of files) {
    try {
      const template = await getTemplate(src, templatesDir)
      await writeFile(join(projectDir, dest), template)
    } catch (err) {
      throw new Error(`Failed to write ${dest}: ${err}`)
    }
  }

  try {
    await writeFile(join(projectDir, ".sdlc/agent.log"), "")
  } catch (err) {
    throw new Error(`Failed to create agent.log: ${err}`)
  }

  try {
    const configDest = join(projectDir, ".sdlc/config.json")
    try {
      await access(configDest)
    } catch {
      let configContent = await getTemplate("sdlc-config.json", templatesDir)
      if (detected.language || detected.test) {
        try {
          const config = JSON.parse(configContent)
          if (detected.language) config.language = detected.language
          if (detected.test) Object.assign(config.test, detected.test)
          configContent = JSON.stringify(config, null, 2)
        } catch { /* use template as-is */ }
      }
      await writeFile(configDest, configContent)
    }
  } catch (err) {
    throw new Error(`Failed to create config.json: ${err}`)
  }

  if (seedFile) {
    try {
      await access(seedFile)
      const seed = await readFile(seedFile, "utf-8")
      await writeFile(join(projectDir, "docs/intent.md"), seed)
    } catch (err) {
      throw new Error(`Failed to read seed file ${seedFile}: ${err}`)
    }
  } else {
    try {
      const intentTemplate = await getTemplate("intent.md", templatesDir)
      await writeFile(join(projectDir, "docs/intent.md"), intentTemplate)
    } catch (err) {
      throw new Error(`Failed to write intent.md: ${err}`)
    }
  }

  return {
    detectedLanguage: detected.language ?? "",
    detectedTestCommand: detected.test?.command ?? "",
  }
}
