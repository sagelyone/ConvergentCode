import type { PluginInput, Hooks } from "@opencode-ai/plugin"
import { allTools } from "./tools/index.js"
import { createHooks } from "./hooks/index.js"

export default async function plugin(input: PluginInput): Promise<Hooks> {
  const hooks = createHooks()

  return {
    tool: allTools,
    "tool.execute.before": hooks["tool.execute.before"],
    "tool.execute.after": hooks["tool.execute.after"],
  }
}
