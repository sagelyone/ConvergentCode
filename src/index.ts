import { registerAgents } from "./agents/index.js"
import { registerTools } from "./tools/index.js"
import { registerHooks } from "./hooks/index.js"
import type { AgentRegistry } from "@opencode/agent"
import type { ToolDefinition } from "@opencode/tool"
import type { HookRegistry } from "@opencode/hooks"

export default {
  name: "convergentcode",
  displayName: "ConvergentCode",
  version: "0.1.0",
  setup({ agents, tools, hooks }: { 
    agents: AgentRegistry
    tools: { register: (tool: ToolDefinition) => void }
    hooks: HookRegistry 
  }) {
    registerAgents(agents)
    registerTools(tools)
    registerHooks(hooks)
  }
}
