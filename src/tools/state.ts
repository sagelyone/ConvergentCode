import { spawn } from "child_process"
import { readText, writeText, updateField, extractLoss, getCurrentPhase, getPhaseName, countMatches } from "./file-utils.js"
import { stateQueue } from "./write-queue.js"

async function stateWriteCore(dir: string, updateJson: string): Promise<string> {
  let update: Record<string, unknown>
  try {
    update = JSON.parse(updateJson)
  } catch {
    return `Error: invalid JSON in update`
  }

  return stateQueue.write(async () => {
    const content = await readText(dir, ".sdlc/state.md")
    if (!content) return "Error: .sdlc/state.md not found"

    let updated = content

    if (typeof update["phase"] === "number") {
      updated = updateField(updated, "Phase", `${update["phase"]}`)
    }
    if (typeof update["active_task"] === "string") {
      updated = updateField(updated, "Active task", update["active_task"] as string)
    }
    if (typeof update["loss"] === "number") {
      const oldLoss = extractLoss(updated)
      const d = (update["loss"] as number) - oldLoss
      updated = updateField(updated, "Loss", `total=${update["loss"]} delta=${d >= 0 ? "+" : ""}${d}`)
      if (d > 0) {
        updated = updateField(updated, "Escape status", "WARNING: Loss increased")
      }
    }
    if (typeof update["last_action"] === "string") {
      updated = updateField(updated, "Last action", update["last_action"] as string)
    }
    if (typeof update["escape_status"] === "string") {
      updated = updateField(updated, "Escape status", update["escape_status"] as string)
    }

    updated = updateField(updated, "Timestamp", new Date().toISOString())

    await writeText(dir, ".sdlc/state.md", updated)
    return "State updated"
  })
}

function addTask(content: string, taskId: string): string {
  return content + `\n### ${taskId} [ ] - New Task\n- **S:** \n- **M:** \n- **A:** \n- **R:** \n- **T:** \n- **Type:** task\n- **Depends on:** none\n- **Scenarios:** []\n- **Repro:** \n- **Iteration count:** 0\n- **Failure signatures:** []\n`
}

function markTaskActive(content: string, taskId: string): string {
  const escaped = taskId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  content = content.replace(new RegExp(`### ${escaped} \\[ \\]`), `### ${taskId} [ACTIVE]`)
  content = content.replace(new RegExp(`### ${escaped} \\[BLOCKED\\]`, "i"), `### ${taskId} [ACTIVE]`)
  content = content.replace(new RegExp(`### ${escaped} \\[active\\]`), `### ${taskId} [ACTIVE]`)
  return content
}

function markTaskComplete(content: string, taskId: string): string {
  const escaped = taskId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  content = content.replace(new RegExp(`### ${escaped} \\[ACTIVE\\]`, "i"), `### ${taskId} [COMPLETED]`)
  content = content.replace(new RegExp(`### ${escaped} \\[BLOCKED\\]`, "i"), `### ${taskId} [COMPLETED]`)
  content = content.replace(new RegExp(`### ${escaped} \\[ \\]`), `### ${taskId} [COMPLETED]`)
  content = content.replace(new RegExp(`### ${escaped} (?!\\[)`), `### ${taskId} [COMPLETED]`)
  return content
}

function markTaskBlocked(content: string, taskId: string): string {
  const escaped = taskId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  content = content.replace(new RegExp(`### ${escaped} \\[ACTIVE\\]`, "i"), `### ${taskId} [BLOCKED]`)
  content = content.replace(new RegExp(`### ${escaped} \\[ \\]`), `### ${taskId} [BLOCKED]`)
  return content
}

async function autoCommit(dir: string, taskId: string): Promise<void> {
  const msg = `ConvergentCode: ${taskId} completed — ${new Date().toISOString()}`
  await new Promise<void>((res, rej) => {
    const proc = spawn("git", ["add", "."], { cwd: dir, stdio: "pipe" })
    proc.on("close", (code) => code === 0 ? res() : rej(new Error("git add failed")))
    proc.on("error", rej)
  })
  await new Promise<void>((res, rej) => {
    const proc = spawn("git", ["commit", "-m", msg], { cwd: dir, stdio: "pipe" })
    proc.on("close", (code) => code === 0 ? res() : rej(new Error("git commit failed")))
    proc.on("error", rej)
  })
}

async function todoUpdateCore(dir: string, action: string, taskId: string, testResult?: string): Promise<string> {
  if (action === "complete" && testResult !== "PASS") {
    return "Error: Cannot complete task without test result PASS"
  }

  return stateQueue.write(async () => {
    const content = await readText(dir, ".sdlc/todo.md")
    if (!content) return "Error: .sdlc/todo.md not found"

    let updated = content
    switch (action) {
      case "add": updated = addTask(updated, taskId); break
      case "start": updated = markTaskActive(updated, taskId); break
      case "complete": updated = markTaskComplete(updated, taskId); break
      case "block": updated = markTaskBlocked(updated, taskId); break
      default: return `Error: unknown action '${action}'`
    }

    await writeText(dir, ".sdlc/todo.md", updated)

    if (action === "complete" && testResult === "PASS") {
      try { await autoCommit(dir, taskId) } catch { /* non-fatal */ }
    }

    return `Task ${taskId} ${action}`
  })
}

async function gateCheckCore(dir: string): Promise<{
  cleared: boolean
  checked: number
  total: number
  unresolved_gaps: number
}> {
  const stateContent = await readText(dir, ".sdlc/state.md")
  const phase = getCurrentPhase(stateContent)

  const phasesContent = await readText(dir, ".sdlc/phases.md")
  const phaseRe = new RegExp(`^## Phase ${phase} `)
  const nextPhaseRe = /^## Phase /
  const checkRe = /^- \[/
  const checkedRe = /^- \[x\]/

  const lines = phasesContent.split("\n")
  let inPhase = false
  let total = 0
  let checked = 0

  for (const line of lines) {
    if (phaseRe.test(line)) { inPhase = true; continue }
    if (inPhase && nextPhaseRe.test(line)) break
    if (inPhase && checkRe.test(line)) {
      total++
      if (checkedRe.test(line)) checked++
    }
  }

  if (total === 0) {
    return { cleared: false, checked: 0, total: 0, unresolved_gaps: 0 }
  }

  const gapsContent = await readText(dir, ".sdlc/spec-gaps.md")
  const gaps = countMatches(gapsContent, /awaiting_human/g)

  return { cleared: checked === total && gaps === 0, checked, total, unresolved_gaps: gaps }
}

async function phaseAdvanceCore(dir: string): Promise<string> {
  return stateQueue.write(async () => {
    const stateContent = await readText(dir, ".sdlc/state.md")
    if (!stateContent) return "Error: .sdlc/state.md not found"
    const currentPhase = getCurrentPhase(stateContent)

    let phasesContent = await readText(dir, ".sdlc/phases.md")
    if (!phasesContent) return "Error: .sdlc/phases.md not found"

    const oldActive = `## Phase ${currentPhase} — ${getPhaseName(currentPhase)} [ACTIVE]`
    const newCleared = `## Phase ${currentPhase} — ${getPhaseName(currentPhase)} [CLEARED]`
    phasesContent = phasesContent.replace(oldActive, newCleared)

    const nextPhase = currentPhase + 1
    const oldLocked = `## Phase ${nextPhase} — ${getPhaseName(nextPhase)} [LOCKED]`
    const newActive = `## Phase ${nextPhase} — ${getPhaseName(nextPhase)} [ACTIVE]`
    phasesContent = phasesContent.replace(oldLocked, newActive)

    await writeText(dir, ".sdlc/phases.md", phasesContent)

    let updatedState = stateContent.replace(/Phase:\*\*\s*\d+/, `Phase:** ${nextPhase}`)
    updatedState = updateField(updatedState, "Timestamp", new Date().toISOString())
    await writeText(dir, ".sdlc/state.md", updatedState)

    return `Advanced from Phase ${currentPhase} to Phase ${nextPhase}`
  })
}

export { stateWriteCore, todoUpdateCore, gateCheckCore, phaseAdvanceCore }
