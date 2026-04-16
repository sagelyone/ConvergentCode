import type { Hooks } from "@opencode-ai/plugin"

export function createHooks(): Pick<Hooks, "tool.execute.before" | "tool.execute.after"> {
  return {
    "tool.execute.before": async (input, output) => {
      const toolName = input.tool
      if (toolName === "bash" || toolName === "write" || toolName === "edit") {
        const args = output.args as Record<string, unknown>
        const command = typeof args.command === "string" ? args.command : ""
        const filePath = typeof args.path === "string" ? args.path : ""
        if (command.includes("test") || filePath.includes("_test.")) {
          // no-op: let test execution proceed
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      const toolName = input.tool
      if (toolName === "bash") {
        const out = output.output || ""
        if (out.includes("FAIL") || out.includes("Error")) {
          output.metadata = { ...output.metadata, test_passed: false }
        }
      }
      if (toolName === "loss_compute") {
        try {
          const parsed = JSON.parse(output.output)
          if (parsed.delta > 0) {
            output.metadata = { ...output.metadata, loss_increased: true, loss_delta: parsed.delta }
          }
        } catch { /* not JSON, ignore */ }
      }
    },
  }
}
