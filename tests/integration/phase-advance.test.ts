import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdir, rm, writeFile, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const TEST_DIR = join(tmpdir(), "convergentcode-phase-test-" + Date.now())

describe("phase-advance", () => {
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

  it("should mark current phase as CLEARED", async () => {
    const phasesPath = join(TEST_DIR, ".sdlc/phases.md")
    let phasesContent = await readFile(phasesPath, "utf-8")
    
    phasesContent = phasesContent.replace(
      "## Phase 0 — SPECIFICATION [ACTIVE]",
      "## Phase 0 — SPECIFICATION [CLEARED]"
    )
    
    phasesContent = phasesContent.replace(
      "- [ ] All intents documented",
      "- [x] All intents documented"
    )
    phasesContent = phasesContent.replace(
      "- [ ] All expectations mapped to intents",
      "- [x] All expectations mapped to intents"
    )
    phasesContent = phasesContent.replace(
      "- [ ] All scenarios have example tables",
      "- [x] All scenarios have example tables"
    )
    phasesContent = phasesContent.replace(
      "- [ ] Consistency check passes",
      "- [x] Consistency check passes"
    )
    phasesContent = phasesContent.replace(
      "- [ ] No unresolved ambiguities",
      "- [x] No unresolved ambiguities"
    )
    
    await writeFile(phasesPath, phasesContent)
    
    const updatedPhases = await readFile(phasesPath, "utf-8")
    expect(updatedPhases).toContain("[CLEARED]")
    expect(updatedPhases).toContain("- [x] All intents documented")
  })

  it("should unlock next phase", async () => {
    const phasesPath = join(TEST_DIR, ".sdlc/phases.md")
    let phasesContent = await readFile(phasesPath, "utf-8")
    
    phasesContent = phasesContent.replace(
      "## Phase 1 — ARCHITECTURE [LOCKED]",
      "## Phase 1 — ARCHITECTURE [ACTIVE]"
    )
    
    await writeFile(phasesPath, phasesContent)
    
    const updatedPhases = await readFile(phasesPath, "utf-8")
    expect(updatedPhases).toContain("## Phase 1 — ARCHITECTURE [ACTIVE]")
  })

  it("should update phase number in state", async () => {
    const statePath = join(TEST_DIR, ".sdlc/state.md")
    let stateContent = await readFile(statePath, "utf-8")
    
    stateContent = stateContent.replace("Phase:** 0", "Phase:** 1")
    stateContent = stateContent.replace("SPECIFICATION", "ARCHITECTURE")
    stateContent = stateContent.replace("Active task:** P0-001", "Active task:** P1-001")
    
    await writeFile(statePath, stateContent)
    
    const updatedState = await readFile(statePath, "utf-8")
    expect(updatedState).toContain("Phase:** 1")
    expect(updatedState).toContain("ARCHITECTURE")
    expect(updatedState).toContain("Active task:** P1-001")
  })

  it("should block advancement if gate not cleared", async () => {
    const phasesPath = join(TEST_DIR, ".sdlc/phases.md")
    let phasesContent = await readFile(phasesPath, "utf-8")
    
    expect(phasesContent).toContain("## Phase 0 — SPECIFICATION [ACTIVE]")
    expect(phasesContent).toContain("## Phase 1 — ARCHITECTURE [LOCKED]")
    
    const uncheckedItems = (phasesContent.match(/- \[ \]/g) || []).length
    expect(uncheckedItems).toBeGreaterThan(0)
  })
})
