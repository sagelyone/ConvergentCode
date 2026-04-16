import type { ToolDefinition } from "@opencode/tool"

import lossCompute from "./loss-compute.js"
import failureSig from "./failure-sig.js"
import diffHash from "./diff-hash.js"
import stateWrite from "./state-write.js"
import todoUpdate from "./todo-update.js"
import logEmit from "./log-emit.js"
import gateCheck from "./gate-check.js"
import phaseAdvance from "./phase-advance.js"
import commitGreen from "./commit-green.js"
import rollback from "./rollback.js"
import scenarioMatrix from "./scenario-matrix.js"

const tools: ToolDefinition[] = [
  lossCompute,
  failureSig,
  diffHash,
  stateWrite,
  todoUpdate,
  logEmit,
  gateCheck,
  phaseAdvance,
  commitGreen,
  rollback,
  scenarioMatrix,
]

export function registerTools(toolsRegistry: { register: (tool: ToolDefinition) => void }) {
  for (const tool of tools) {
    toolsRegistry.register(tool)
  }
}

export {
  lossCompute,
  failureSig,
  diffHash,
  stateWrite,
  todoUpdate,
  logEmit,
  gateCheck,
  phaseAdvance,
  commitGreen,
  rollback,
  scenarioMatrix,
}
