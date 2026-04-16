import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "gate_check",
  description: "Check if current phase gate is cleared",
  run: async ({ bash }) => bash("bash .sdlc/tools/gate-check.sh")
})
