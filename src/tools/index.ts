import { tool } from "@opencode-ai/plugin"
import { spawn } from "child_process"
import { resolve } from "path"
import { readFile, appendFile } from "fs/promises"
import { createHash } from "crypto"

const z = tool.schema

async function findSdlcTool(): Promise<string> {
  const home = process.env.HOME || process.env.USERPROFILE || ""
  const fullPath = resolve(home, ".local/bin/sdlc-tool")
  try {
    const { access } = await import("fs/promises")
    await access(fullPath)
    return fullPath
  } catch {
    return "sdlc-tool"
  }
}

function runCommand(cmd: string, args: string[], cwd: string): Promise<string> {
  return new Promise((res, rej) => {
    const proc = spawn(cmd, args, { cwd, stdio: ["pipe", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString() })
    proc.on("close", (code) => {
      if (code === 0) res(stdout.trim())
      else rej(new Error(`Command failed (exit ${code}): ${stderr.trim() || stdout.trim()}`))
    })
    proc.on("error", rej)
  })
}

function shellPath(projectDir: string, name: string): string {
  return resolve(projectDir, "shell", name)
}

export const lossCompute = tool({
  description: "Compute composite loss from test results and state files",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await runCommand("bash", [shellPath(ctx.directory, "loss-compute.sh")], ctx.directory)
      return result
    } catch {
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
      const result = await runCommand("bash", [shellPath(ctx.directory, "failure-sig.sh"), test_id, error_output], ctx.directory)
      return result
    } catch {
      const firstErr = error_output.split("\n")[0]
      const sig = createHash("sha256").update(`${test_id}:${firstErr}`).digest("hex").slice(0, 12)
      let count = 0
      try {
        const todo = await readFile(resolve(ctx.directory, ".sdlc/todo.md"), "utf-8")
        const matches = todo.match(new RegExp(sig, "g"))
        if (matches) count = matches.length
      } catch { /* empty */ }
      return JSON.stringify({ signature: sig, repeat_count: count })
    }
  },
})

export const diffHash = tool({
  description: "Compute hash of current diff and check for collision",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await runCommand("bash", [shellPath(ctx.directory, "diff-hash.sh")], ctx.directory)
      return result
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
    const bin = await findSdlcTool()
    try {
      const result = await runCommand(bin, ["state-write", update_json], ctx.directory)
      return result || "State updated"
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
    const bin = await findSdlcTool()
    const args = ["todo-update", action, task_id]
    if (test_result) args.push("--test-result", test_result)
    try {
      const result = await runCommand(bin, args, ctx.directory)
      return result || "Todo updated"
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
      const result = await runCommand("bash", [shellPath(ctx.directory, "log-emit.sh"), event, payload ?? "{}"], ctx.directory)
      return result || "Log entry emitted"
    } catch {
      const logPath = resolve(ctx.directory, ".sdlc/agent.log")
      const entry = JSON.stringify({
        ts: new Date().toISOString(),
        event,
        payload: payload ? JSON.parse(payload) : {},
      })
      try {
        await appendFile(logPath, entry + "\n")
        return "Log entry emitted"
      } catch (err) {
        return `Error emitting log: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  },
})

export const gateCheck = tool({
  description: "Check if current phase gate is cleared",
  args: {},
  execute: async (_args, ctx) => {
    try {
      const result = await runCommand("bash", [shellPath(ctx.directory, "gate-check.sh")], ctx.directory)
      return result
    } catch {
      return JSON.stringify({ cleared: false, checked: 0, total: 0, unresolved_gaps: 0 })
    }
  },
})

export const phaseAdvance = tool({
  description: "Advance to next phase atomically",
  args: {},
  execute: async (_args, ctx) => {
    const bin = await findSdlcTool()
    try {
      const result = await runCommand(bin, ["phase-advance"], ctx.directory)
      return result || "Phase advanced"
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
    const bin = await findSdlcTool()
    try {
      const result = await runCommand(bin, ["commit-green", task_id, message], ctx.directory)
      return result || "Committed"
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
    const bin = await findSdlcTool()
    const args = ["rollback"]
    if (to_task) args.push("--to-task", to_task)
    try {
      const result = await runCommand(bin, args, ctx.directory)
      return result || "Rolled back"
    } catch (err) {
      return `Error rolling back: ${err instanceof Error ? err.message : String(err)}`
    }
  },
})

export const scenarioMatrix = tool({
  description: "Enumerate uncovered scenario cells from spec.md",
  args: {},
  execute: async (_args, ctx) => {
    const bin = await findSdlcTool()
    try {
      const result = await runCommand(bin, ["scenario-matrix"], ctx.directory)
      return result || "No scenarios found"
    } catch (err) {
      return `Error computing scenario matrix: ${err instanceof Error ? err.message : String(err)}`
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
}