import { defineCommand } from "@opencode/tool"

export default defineCommand({
  name: "log_emit",
  description: "Emit structured log entry to agent.log with flock",
  args: [
    { name: "event", type: "string", description: "Event type" },
    { name: "payload", type: "string", description: "JSON payload", optional: true }
  ],
  run: async ({ bash }, { event, payload }) => 
    bash(`bash .sdlc/tools/log-emit.sh "${event}" '${payload ?? "{}"}'`)
})
