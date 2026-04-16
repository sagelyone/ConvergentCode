import { tool } from "@opencode-ai/plugin"
import { computeLoss } from "./loss-compute.js"
import { stateWriteCore, todoUpdateCore, gateCheckCore, phaseAdvanceCore } from "./state.js"
import { commitGreenCore, rollbackCore } from "./git.js"
import { failureSigCore, diffHashCore, scenarioMatrixCore, assertionDensityCore } from "./analysis.js"
import { logEmitCore } from "./logging.js"
import { initProject } from "../features/init-project/scaffolder.js"

const z = tool.schema

export const lossCompute = tool({
  description: "Compute composite loss from test results and state files",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await computeLoss(ctx.directory)
      return JSON.stringify(result)
    } catch (err) {
      return JSON.stringify({
        total: 0, delta: 0,
        components: {
          failing_acceptance: 0, failing_unit: 0, failing_property: 0,
          unimplemented: 0, uncovered_expectations: 0, unconfirmed_intents: 0,
          lint_errors: 0, blocked: 0, spec_gaps: 0,
        },
      })
    }
  },
})

export const failureSig = tool({
  description: "Compute failure signature for escape protocol tracking",
  args: {
    test_id: z.string().describe("Task/test identifier"),
    error_output: z.string().describe("Test error output"),
  },
  execute: async ({ test_id, error_output }, ctx) => {
    try {
      const result = await failureSigCore(ctx.directory, test_id, error_output)
      return JSON.stringify(result)
    } catch {
      const firstErr = error_output.split("\n")[0]
      const sig = firstErr.slice(0, 12)
      return JSON.stringify({ signature: sig, repeat_count: 0 })
    }
  },
})

export const diffHash = tool({
  description: "Compute hash of current diff and check for collision",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await diffHashCore(ctx.directory)
      return JSON.stringify(result)
    } catch {
      return JSON.stringify({ hash: "unknown", collision: false })
    }
  },
})

export const stateWrite = tool({
  description: "Write validated update to state.md with monotonic progress check",
  args: {
    update_json: z.string().describe("JSON string of state updates"),
  },
  execute: async ({ update_json }, ctx) => {
    try {
      return await stateWriteCore(ctx.directory, update_json)
    } catch (err) {
      return `Error updating state: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const todoUpdate = tool({
  description: "Update todo.md with SMART-validated task operations",
  args: {
    action: z.string().describe("add|start|complete|block"),
    task_id: z.string().describe("Task identifier"),
    test_result: z.string().optional().describe("PASS|FAIL (required for complete)"),
  },
  execute: async ({ action, task_id, test_result }, ctx) => {
    try {
      return await todoUpdateCore(ctx.directory, action, task_id, test_result)
    } catch (err) {
      return `Error updating todo: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const logEmit = tool({
  description: "Emit structured log entry to agent.log",
  args: {
    event: z.string().describe("Event type"),
    payload: z.string().optional().describe("JSON payload"),
  },
  execute: async ({ event, payload }, ctx) => {
    try {
      return await logEmitCore(ctx.directory, event, payload)
    } catch (err) {
      return `Error emitting log: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const gateCheck = tool({
  description: "Check if current phase gate is cleared",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await gateCheckCore(ctx.directory)
      return JSON.stringify(result)
    } catch {
      return JSON.stringify({ cleared: false, checked: 0, total: 0, unresolved_gaps: 0 })
    }
  },
})

export const phaseAdvance = tool({
  description: "Advance to next phase atomically",
  args: {},
  execute: async (_args, ctx) => {
    try {
      return await phaseAdvanceCore(ctx.directory)
    } catch (err) {
      return `Error advancing phase: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const commitGreen = tool({
  description: "Create git commit on successful task completion",
  args: {
    task_id: z.string().describe("Task identifier"),
    message: z.string().describe("Commit message"),
  },
  execute: async ({ task_id, message }, ctx) => {
    try {
      return await commitGreenCore(ctx.directory, task_id, message)
    } catch (err) {
      return `Error committing: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const rollback = tool({
  description: "Revert to last known-good commit",
  args: {
    to_task: z.string().optional().describe("Revert to specific task commit"),
  },
  execute: async ({ to_task }, ctx) => {
    try {
      return await rollbackCore(ctx.directory, to_task)
    } catch (err) {
      return `Error rolling back: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const scenarioMatrix = tool({
  description: "Enumerate uncovered scenario cells from spec.md",
  args: {},
  execute: async (_args, ctx) => {
    try {
      return await scenarioMatrixCore(ctx.directory)
    } catch (err) {
      return `Error computing scenario matrix: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const assertionDensity = tool({
  description: "Compute assertion density across source files",
  args: {},
  execute: async (_args, ctx) => {
    try {
      return await assertionDensityCore(ctx.directory)
    } catch (err) {
      return `Error computing assertion density: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const initProjectTool = tool({
  description: "Scaffold .sdlc/ state directory with auto-detected language and test framework. Creates all state files, docs templates with default intents/expectations, and config.json. Returns detected language and test command for confirmation.",
  args: {
    seed_file: z.string().optional().describe("Optional path to intent seed file (replaces default intent.md template)"),
  },
  execute: async ({ seed_file }, ctx) => {
    try {
      const result = await initProject(seed_file)
      return JSON.stringify({
        status: "initialized",
        detected_language: result.detectedLanguage,
        detected_test_command: result.detectedTestCommand,
        files_created: [
          ".sdlc/state.md",
          ".sdlc/todo.md",
          ".sdlc/phases.md",
          ".sdlc/spec-gaps.md",
          ".sdlc/blockers.md",
          ".sdlc/agent.log",
          ".sdlc/config.json",
          "docs/intent.md",
          "docs/expectations.md",
          "docs/spec.md",
        ],
      })
    } catch (err) {
      return `Error initializing project: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const allTools = {
  loss_compute: lossCompute,
  failure_sig: failureSig,
  diff_hash: diffHash,
  state_write: stateWrite,
  todo_update: todoUpdate,
  log_emit: logEmit,
  gate_check: gateCheck,
  phase_advance: phaseAdvance,
  commit_green: commitGreen,
  rollback: rollback,
  scenario_matrix: scenarioMatrix,
  assertion_density: assertionDensity,
  init_project: initProjectTool,
}
