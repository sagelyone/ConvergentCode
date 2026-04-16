import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "rollback",
  description: "Revert to last known-good commit",
  args: [
    { name: "to_task", type: "string", description: "Revert to specific task commit", optional: true }
  ],
  run: async ({ bash }, { to_task }) => {
    const taskFlag = to_task ? ` --to-task ${to_task}` : ""
    return bash(`.sdlc/tools/sdlc-tool rollback${taskFlag}`)
  }
})
