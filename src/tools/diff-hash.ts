import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "diff_hash",
  description: "Compute hash of current diff and check for collision",
  run: async ({ bash }) => bash("bash .sdlc/tools/diff-hash.sh")
})
