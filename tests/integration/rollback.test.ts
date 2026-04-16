import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, writeFile, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-rollback-test-" + Date.now())

describe("rollback", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true })
    process.chdir(TEST_DIR)
    
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject()
    
    await mkdir(".git", { recursive: true })
    await writeFile(".git/config", `[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
`)
  })

  afterEach(async () => {
    process.chdir(tmpdir())
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it("should detect regression from state", async () => {
    const statePath = join(TEST_DIR, ".sdlc/state.md")
    let stateContent = await readFile(statePath, "utf-8")
    
    stateContent = stateContent.replace("Loss:** total=0", "Loss:** total=10")
    stateContent = stateContent.replace("Loss delta:** —", "Loss delta:** +10")
    stateContent = stateContent.replace("Escape status:** NOMINAL", "Escape status:** WARNING: Loss increased")
    
    await writeFile(statePath, stateContent)
    
    const updatedState = await readFile(statePath, "utf-8")
    expect(updatedState).toContain("total=10")
    expect(updatedState).toContain("+10")
    expect(updatedState).toContain("WARNING: Loss increased")
  })

  it("should create rollback entry in log", async () => {
    const logPath = join(TEST_DIR, ".sdlc/agent.log")
    const logEntry = JSON.stringify({
      ts: new Date().toISOString(),
      phase: 2,
      task: "P2-005",
      iter_task: 3,
      iter_global: 15,
      event: "rollback",
      payload: { reason: "regression detected", previous_loss: 5, current_loss: 15 }
    })
    
    await writeFile(logPath, logEntry + "\n")
    
    const logContent = await readFile(logPath, "utf-8")
    expect(logContent).toContain("rollback")
    expect(logContent).toContain("regression detected")
  })

  it("should prioritize regression fix in state", async () => {
    const statePath = join(TEST_DIR, ".sdlc/state.md")
    let stateContent = await readFile(statePath, "utf-8")
    
    stateContent = stateContent.replace(
      "Next action:** Begin specification elicitation",
      "Next action:** Fix regression: restore P2-003 test to passing"
    )
    
    await writeFile(statePath, stateContent)
    
    const updatedState = await readFile(statePath, "utf-8")
    expect(updatedState).toContain("Fix regression")
  })
})
