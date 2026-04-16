import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "failure_sig",
  description: "Compute failure signature for escape protocol tracking",
  args: [
    { name: "test_id", type: "string", description: "Task/test identifier" },
    { name: "error_output", type: "string", description: "Test error output" }
  ],
  run: async ({ bash }, { test_id, error_output }) => 
    bash(`bash .sdlc/tools/failure-sig.sh "${test_id}" "${error_output}"`)
})
