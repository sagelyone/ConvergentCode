export const DEFAULTS = {
  provider: {
    name: "openrouter",
    base_url: "https://openrouter.ai/api/v1",
    model: "z-ai/glm-5.1",
  },
  escape: {
    L1: 3,
    L2: 5,
    L3: 7,
    L4: 9,
  },
  loss_weights: {
    acceptance: 100,
    unit: 50,
    property: 50,
    unimplemented: 25,
    expectations: 15,
    intents: 10,
    lint: 5,
    blocked: 3,
    spec_gaps: 1,
  },
  constraints: {
    max_lines: {
      scaffold: 120,
      modify: 50,
    },
    max_files: 4,
    diff_hash_window: 8,
    log_tail: {
      worker: 20,
      orchestrator: 50,
      gate_reviewer: "current_phase" as const,
    },
  },
}
