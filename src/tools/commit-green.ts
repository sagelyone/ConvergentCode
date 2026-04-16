import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "commit_green",
  description: "Create git commit on successful task completion",
  args: [
    { name: "task_id", type: "string", description: "Task identifier" },
    { name: "message", type: "string", description: "Commit message" }
  ],
  run: async ({ bash }, { task_id, message }) => 
    bash(`.sdlc/tools/sdlc-tool commit-green "${task_id}" "${message}"`)
})
