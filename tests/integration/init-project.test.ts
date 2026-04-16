import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, stat, readFile, copyFile, access } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-test-" + Date.now())
const REPO_ROOT = join(import.meta.dir, "../../..")

describe("init-project", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true })
    process.chdir(TEST_DIR)

    await mkdir(join(TEST_DIR, "templates"), { recursive: true })
    const templateFiles = [
      "state.md", "todo.md", "phases.md", "spec-gaps.md",
      "blockers.md", "expectations.md", "spec.md", "intent.md",
    ]
    for (const f of templateFiles) {
      try {
        await copyFile(join(REPO_ROOT, "templates", f), join(TEST_DIR, "templates", f))
      } catch {
        await Bun.write(join(TEST_DIR, "templates", f), `# ${f}\n\nPlaceholder template.\n`)
      }
    }
    try {
      await copyFile(join(REPO_ROOT, "templates", "sdlc-config.json"), join(TEST_DIR, "templates", "sdlc-config.json"))
    } catch {
      await Bun.write(join(TEST_DIR, "templates", "sdlc-config.json"), JSON.stringify({
        test: { command: "go test", unit: "./..." },
        escape: { L1: 3, L2: 5, L3: 7, L4: 9 },
        loss_weights: { acceptance: 100 },
        constraints: { max_files: 4 },
      }))
    }
  })

  afterEach(async () => {
    process.chdir(tmpdir())
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  it("should create .sdlc directory with all state files", async () => {
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
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
      ".sdlc/config.json",
    ]

    for (const file of expectedFiles) {
      const filePath = join(TEST_DIR, file)
      const fileStats = await stat(filePath)
      expect(fileStats.isFile()).toBe(true)
    }
  })

  it("should create docs directory with templates", async () => {
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
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

  it("should create config.json with defaults", async () => {
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject()

    const configContent = await readFile(join(TEST_DIR, ".sdlc/config.json"), "utf-8")
    const config = JSON.parse(configContent)
    expect(config.test).toBeDefined()
    expect(config.escape).toBeDefined()
    expect(config.loss_weights).toBeDefined()
    expect(config.constraints).toBeDefined()
  })

  it("should not overwrite existing config.json", async () => {
    await mkdir(join(TEST_DIR, ".sdlc"), { recursive: true })
    await Bun.write(join(TEST_DIR, ".sdlc/config.json"), JSON.stringify({ custom: true }))

    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject()

    const configContent = await readFile(join(TEST_DIR, ".sdlc/config.json"), "utf-8")
    const config = JSON.parse(configContent)
    expect(config.custom).toBe(true)
  })

  it("should use seed file when provided", async () => {
    const seedContent = "# Custom Intent\n\nThis is a custom intent."
    const seedPath = join(TEST_DIR, "seed.md")
    await Bun.write(seedPath, seedContent)

    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject(seedPath)

    const intentContent = await readFile(join(TEST_DIR, "docs/intent.md"), "utf-8")
    expect(intentContent).toContain("Custom Intent")
    expect(intentContent).toContain("This is a custom intent.")
  })

  it("should create empty agent.log", async () => {
    const { initProject } = await import("../../src/features/init-project/scaffolder.js")
    await initProject()

    const logContent = await readFile(join(TEST_DIR, ".sdlc/agent.log"), "utf-8")
    expect(logContent).toBe("")
  })
})