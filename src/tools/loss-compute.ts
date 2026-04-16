import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "loss_compute",
  description: "Compute composite loss from test results and state files",
  run: async ({ bash }) => bash("bash .sdlc/tools/loss-compute.sh")
})
