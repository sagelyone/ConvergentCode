import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "todo_update",
  description: "Update todo.md with SMART-validated task operations",
  args: [
    { name: "action", type: "string", description: "add|start|complete|block" },
    { name: "task_id", type: "string", description: "Task identifier" },
    { name: "test_result", type: "string", description: "PASS|FAIL (required for complete)" }
  ],
  run: async ({ bash }, { action, task_id, test_result }) => {
    const testFlag = test_result ? ` --test-result ${test_result}` : ""
    return bash(`.sdlc/tools/sdlc-tool todo-update ${action} ${task_id}${testFlag}`)
  }
})
