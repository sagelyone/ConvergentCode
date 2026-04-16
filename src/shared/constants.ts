
export const PHASES = {
  0: "SPECIFICATION",
  1: "ARCHITECTURE",
  2: "FOUNDATION",
  3: "CORE_LOGIC",
  4: "INTERFACE",
  5: "HARDENING",
  6: "ALIGNMENT",
} as const
export const ESCAPE_LEVELS = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
} as const
export const ESCAPE_DESCRIPTIONS = {
  [ESCAPE_LEVELS.L1]: "Rotate strategy. Previous approach disqualified.",
  [ESCAPE_LEVELS.L2]: "Decompose into 2-3 subtasks with independent tests.",
  [ESCAPE_LEVELS.L3]: "Verify environment independently.",
  [ESCAPE_LEVELS.L4]: "BLOCKED. Move to next task.",
} as const
export const LOSS_WEIGHTS = {
  acceptance: 100,
  unit: 50,
  property: 50,
  unimplemented: 25,
  expectations: 15,
  intents: 10,
  lint: 5,
  blocked: 3,
  spec_gaps: 1,
} as const
export const PATHS = {
  STATE_DIR: ".sdlc",
  DOCS_DIR: "docs",
  STATE_FILE: ".sdlc/state.md",
  TODO_FILE: ".sdlc/todo.md",
  PHASES_FILE: ".sdlc/phases.md",
  SPEC_GAPS_FILE: ".sdlc/spec-gaps.md",
  BLOCKERS_FILE: ".sdlc/blockers.md",
  AGENT_LOG: ".sdlc/agent.log",
  INTENT_FILE: "docs/intent.md",
  EXPECTATIONS_FILE: "docs/expectations.md",
  SPEC_FILE: "docs/spec.md",
} as const
export const AGENTS = {
  CONVERGENCE_ORCHESTRATOR: "convergence-orchestrator",
  APIT_WORKER: "apit-worker",
  SPEC_WRITER: "spec-writer",
  PHASE_GATE_REVIEWER: "phase-gate-reviewer",
  INTENT_ALIGNMENT_ORACLE: "intent-alignment-oracle",
  DIFFERENTIAL_IMPLEMENTER: "differential-implementer",
  SPEC_GAP_DETECTOR: "spec-gap-detector",
} as const
export const TOOLS = {
  LOSS_COMPUTE: "loss_compute",
  FAILURE_SIG: "failure_sig",
  DIFF_HASH: "diff_hash",
  STATE_WRITE: "state_write",
  TODO_UPDATE: "todo_update",
  LOG_EMIT: "log_emit",
  GATE_CHECK: "gate_check",
  PHASE_ADVANCE: "phase_advance",
  COMMIT_GREEN: "commit_green",
  ROLLBACK: "rollback",
  SCENARIO_MATRIX: "scenario_matrix",
} as const
export const HOOKS = {
  POST_TEST: "post-test",
  PRE_IMPLEMENT: "pre-implement",
  PHASE_TRANSITION: "phase-transition",
  ESCAPE_ESCALATION: "escape-escalation",
} as const
export const COMMANDS = {
  INIT_PROJECT: "init-project",
  RUN_PHASE: "run-phase",
  CHECK_GATE: "check-gate",
  REVIEW_INTENT: "review-intent",
  COMPUTE_LOSS: "compute-loss",
  CONVERGENCE_STATUS: "convergence-status",
} as const
