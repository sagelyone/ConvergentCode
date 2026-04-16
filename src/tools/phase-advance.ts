import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "phase_advance",
  description: "Advance to next phase atomically",
  run: async ({ bash }) => bash(".sdlc/tools/sdlc-tool phase-advance")
})
