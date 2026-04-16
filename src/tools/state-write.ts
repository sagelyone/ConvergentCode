import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "state_write",
  description: "Write validated update to state.md with monotonic progress check",
  args: [
    { name: "update_json", type: "string", description: "JSON string of state updates" }
  ],
  run: async ({ bash }, { update_json }) => 
    bash(`.sdlc/tools/sdlc-tool state-write '${update_json}'`)
})
