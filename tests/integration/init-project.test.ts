import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, stat, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-test-" + Date.now())

describe("init-project", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true })
    process.chdir(TEST_DIR)
  })

  afterEach(async () => {
    process.chdir(tmpdir())
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it("should create .sdlc directory with all state files", async () => {
    const { initProject } = await import("../src/features/init-project/scaffolder.js")
    await initProject()

    const sdlcDir = join(TEST_DIR, ".sdlc")
    const sdlcStats = await stat(sdlcDir)
    expect(sdlcStats.isDirectory()).toBe(true)

    const expectedFiles = [
      ".sdlc/state.md",
      ".sdlc/todo.md",
      ".sdlc/phases.md",
      ".sdlc/spec-gaps.md",
      ".sdlc/blockers.md",
      ".sdlc/agent.log",
    ]

    for (const file of expectedFiles) {
      const filePath = join(TEST_DIR, file)
      const fileStats = await stat(filePath)
      expect(fileStats.isFile()).toBe(true)
    }
  })

  it("should create docs directory with templates", async () => {
    const { initProject } = await import("../src/features/init-project/scaffolder.js")
    await initProject()

    const docsDir = join(TEST_DIR, "docs")
    const docsStats = await stat(docsDir)
    expect(docsStats.isDirectory()).toBe(true)

    const expectedFiles = [
      "docs/intent.md",
      "docs/expectations.md",
      "docs/spec.md",
    ]

    for (const file of expectedFiles) {
      const filePath = join(TEST_DIR, file)
      const fileStats = await stat(filePath)
      expect(fileStats.isFile()).toBe(true)
    }
  })

  it("should initialize state.md with Phase 0", async () => {
    const { initProject } = await import("../src/features/init-project/scaffolder.js")
    await initProject()

    const stateContent = await readFile(join(TEST_DIR, ".sdlc/state.md"), "utf-8")
    expect(stateContent).toContain("Phase:** 0")
    expect(stateContent).toContain("SPECIFICATION")
    expect(stateContent).toContain("P0-001")
  })

  it("should use seed file when provided", async () => {
    const seedContent = "# Custom Intent\n\nThis is a custom intent."
    const seedPath = join(TEST_DIR, "seed.md")
    await Bun.write(seedPath, seedContent)

    const { initProject } = await import("../src/features/init-project/scaffolder.js")
    await initProject(seedPath)

    const intentContent = await readFile(join(TEST_DIR, "docs/intent.md"), "utf-8")
    expect(intentContent).toContain("Custom Intent")
    expect(intentContent).toContain("This is a custom intent.")
  })

  it("should create empty agent.log", async () => {
    const { initProject } = await import("../src/features/init-project/scaffolder.js")
    await initProject()

    const logContent = await readFile(join(TEST_DIR, ".sdlc/agent.log"), "utf-8")
    expect(logContent).toBe("")
  })
})
