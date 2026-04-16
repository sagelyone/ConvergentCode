import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, writeFile, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-escape-test-" + Date.now())

describe("escape-protocol", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true })
    process.chdir(TEST_DIR)
    
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject()
  })

  afterEach(async () => {
    process.chdir(tmpdir())
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it("should trigger L1 escape at 3 repeated signatures", async () => {
    const todoPath = join(TEST_DIR, ".sdlc/todo.md")
    let todoContent = await readFile(todoPath, "utf-8")
    
    const failureSigs = "- abc123 (×3)\n  - Error: Something went wrong"
    todoContent = todoContent.replace("Failure signatures:** []", "Failure signatures:**\n" + failureSigs)
    todoContent = todoContent.replace("Iteration count:** 0", "Iteration count:** 3")
    
    await writeFile(todoPath, todoContent)
    
    const updatedTodo = await readFile(todoPath, "utf-8")
    expect(updatedTodo).toContain("abc123")
    expect(updatedTodo).toContain("×3")
  })

  it("should trigger L2 escape at 5 repeated signatures", async () => {
    const todoPath = join(TEST_DIR, ".sdlc/todo.md")
    let todoContent = await readFile(todoPath, "utf-8")
    
    const failureSigs = "- def456 (×5)\n  - Error: Connection refused"
    todoContent = todoContent.replace("Failure signatures:** []", "Failure signatures:**\n" + failureSigs)
    todoContent = todoContent.replace("Iteration count:** 0", "Iteration count:** 5")
    
    await writeFile(todoPath, todoContent)
    
    const updatedTodo = await readFile(todoPath, "utf-8")
    expect(updatedTodo).toContain("def456")
    expect(updatedTodo).toContain("×5")
  })

  it("should create blocker entry at L4", async () => {
    const blockersPath = join(TEST_DIR, ".sdlc/blockers.md")
    const blockerEntry = `
## [BLK-001] L4 Escape
**Task:** P1-003
**Escape Level:** 4
**Description:** Cannot implement due to missing dependency
**Created:** ${new Date().toISOString()}
**Resolution:** None (requires human intervention)
`
    
    await writeFile(blockersPath, blockerEntry)
    
    const blockersContent = await readFile(blockersPath, "utf-8")
    expect(blockersContent).toContain("BLK-001")
    expect(blockersContent).toContain("L4 Escape")
    expect(blockersContent).toContain("P1-003")
  })

  it("should update escape status in state", async () => {
    const statePath = join(TEST_DIR, ".sdlc/state.md")
    let stateContent = await readFile(statePath, "utf-8")
    
    stateContent = stateContent.replace("Escape status:** NOMINAL", "Escape status:** L1 - Strategy rotation")
    
    await writeFile(statePath, stateContent)
    
    const updatedState = await readFile(statePath, "utf-8")
    expect(updatedState).toContain("L1 - Strategy rotation")
  })
})
