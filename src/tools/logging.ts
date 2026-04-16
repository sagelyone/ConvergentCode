import { appendFile } from "fs/promises"
import { resolve } from "path"
import { readText } from "./file-utils.js"
import { readConfig } from "../config.js"

async function logEmitCore(dir: string, event: string, payload?: string): Promise<string> {
  const config = await readConfig(dir)
  const logLevel = config.log_level ?? "minimal"

  if (logLevel === "minimal" && event === "debug") {
    return ""
  }

  const stateContent = await readText(dir, ".sdlc/state.md")

  const phaseMatch = stateContent.match(/Phase:\*\*\s*(\d+)/)
  const phase = phaseMatch ? parseInt(phaseMatch[1], 10) : 0

  const taskMatch = stateContent.match(/Active task:\*\*\s*(\S+)/)
  const task = taskMatch?.[1] ?? "none"

  const iterTMatch = stateContent.match(/task=(\d+)/)
  const iterT = iterTMatch ? parseInt(iterTMatch[1], 10) : 0

  const iterGMatch = stateContent.match(/global=(\d+)/)
  const iterG = iterGMatch ? parseInt(iterGMatch[1], 10) : 0

  let parsedPayload: Record<string, unknown> = {}
  if (payload) {
    try { parsedPayload = JSON.parse(payload) } catch { parsedPayload = { raw: payload } }
  }

  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    phase,
    task,
    iter_task: iterT,
    iter_global: iterG,
    event,
    payload: parsedPayload,
  })

  const logPath = resolve(dir, ".sdlc/agent.log")
  await appendFile(logPath, entry + "\n")

  return "Log entry emitted"
}

export { logEmitCore }
