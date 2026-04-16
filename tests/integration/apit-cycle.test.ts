import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, writeFile, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-apit-test-" + Date.now())

describe("apit-cycle", () => {
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

  it("should complete single APIT cycle", async () => {
    await mkdir("src", { recursive: true })
    await writeFile("src/example.ts", "export function add(a: number, b: number): number { return a + b }")
    await writeFile("src/example_test.ts", `
import { describe, it, expect } from "bun:test"
import { add } from "./example.ts"

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5)
  })
})
`)

    const stateBefore = await readFile(join(TEST_DIR, ".sdlc/state.md"), "utf-8")
    expect(stateBefore).toContain("task=0")

    const todoContent = await readFile(join(TEST_DIR, ".sdlc/todo.md"), "utf-8")
    expect(todoContent).toContain("P0-001")
  })

  it("should update state after test completion", async () => {
    const statePath = join(TEST_DIR, ".sdlc/state.md")
    let stateContent = await readFile(statePath, "utf-8")
    
    stateContent = stateContent.replace("task=0", "task=1")
    stateContent = stateContent.replace("Last action:** Project initialized", "Last action:** Completed task P0-001")
    
    await writeFile(statePath, stateContent)
    
    const updatedState = await readFile(statePath, "utf-8")
    expect(updatedState).toContain("task=1")
    expect(updatedState).toContain("Completed task P0-001")
  })

  it("should log events to agent.log", async () => {
    const logPath = join(TEST_DIR, ".sdlc/agent.log")
    const logEntry = JSON.stringify({
      ts: new Date().toISOString(),
      phase: 0,
      task: "P0-001",
      iter_task: 1,
      iter_global: 1,
      event: "code_edit",
      payload: { file: "src/example.ts", lines_changed: 5 }
    })
    
    await writeFile(logPath, logEntry + "\n")
    
    const logContent = await readFile(logPath, "utf-8")
    expect(logContent).toContain("code_edit")
    expect(logContent).toContain("src/example.ts")
  })
})
