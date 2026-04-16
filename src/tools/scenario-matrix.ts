import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "scenario_matrix",
  description: "Enumerate uncovered scenario cells from spec.md",
  run: async ({ bash }) => bash(".sdlc/tools/sdlc-tool scenario-matrix")
})
