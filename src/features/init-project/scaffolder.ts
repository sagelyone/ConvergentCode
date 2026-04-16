import { mkdir, readFile, writeFile, access, copyFile, stat } from "fs/promises"
import { join, resolve } from "path"

const EMBEDDED_TEMPLATES: Record<string, string> = {
  "state.md": `# State\n\n**Phase:** 0 — SPECIFICATION\n**Active task:** P0-001\n**Iteration:** task=1 phase=1 global=1\n**Loss:** total=0 delta=0\n**Last action:** init\n**Last test:** none\n**Failure signature:** none\n**Escape status:** clear\n**Next action:** Elicit requirements from human\n`,
  "todo.md": `# Todo\n\n## Phase 0 — SPECIFICATION\n\n### P0-001: Elicit stakeholder intents [active]\n- [ ] Define project goals and success criteria\n- [ ] Document stakeholder expectations\n- [ ] Create BDD scenarios\n`,
  "phases.md": `# Phases\n\n## Phase 0 — SPECIFICATION [ACTIVE]\n- [ ] All intents documented\n- [ ] All expectations mapped to intents\n- [ ] All scenarios have example tables\n- [ ] Consistency check passes\n- [ ] No unresolved ambiguities\n\n## Phase 1 — ARCHITECTURE [LOCKED]\n- [ ] Acceptance test paths identified\n- [ ] Properties defined\n- [ ] Module boundaries established\n- [ ] Dependency graph documented\n- [ ] Architecture review complete\n\n## Phase 2 — FOUNDATION [LOCKED]\n- [ ] Data models implemented\n- [ ] Unit tests for data layer\n- [ ] Property tests for invariants\n- [ ] No test failures\n\n## Phase 3 — CORE_LOGIC [LOCKED]\n- [ ] Business logic implemented\n- [ ] Unit tests pass\n- [ ] Property tests pass\n- [ ] No UI dependency\n\n## Phase 4 — INTERFACE [LOCKED]\n- [ ] Integration tests pass\n- [ ] Differential check complete\n- [ ] API contracts verified\n\n## Phase 5 — HARDENING [LOCKED]\n- [ ] All tests green\n- [ ] Coverage threshold met\n- [ ] No lint errors\n- [ ] No spec gaps\n\n## Phase 6 — ALIGNMENT [LOCKED]\n- [ ] All intents confirmed by human\n- [ ] Loss = 0\n`,
  "spec-gaps.md": `# Spec Gaps\n\n(No gaps detected yet)\n`,
  "blockers.md": `# Blockers\n\n(No blockers yet)\n`,
  "expectations.md": `# Expectations\n\n(To be defined during Phase 0)\n`,
  "spec.md": `# Specification\n\n(To be defined during Phase 0)\n`,
  "intent.md": `# Intent\n\n(To be defined during Phase 0)\n`,
  "sdlc-config.json": JSON.stringify({
    test: {
      command: "go test",
      unit: "./...",
      property: "-run Prop ./...",
      acceptance: "-run Acceptance ./...",
      lint: "true",
      timeout: "120s",
    },
    escape: { L1: 3, L2: 5, L3: 7, L4: 9 },
    loss_weights: {
      acceptance: 100, unit: 50, property: 50,
      unimplemented: 25, expectations: 15, intents: 10,
      lint: 5, blocked: 3, spec_gaps: 1,
    },
    constraints: {
      max_lines: { scaffold: 120, modify: 50 },
      max_files: 4,
      diff_hash_window: 8,
    },
  }, null, 2),
}

async function findTemplatesDir(projectDir: string): Promise<string | null> {
  const candidates = [
    join(projectDir, "templates"),
    join(projectDir, ".opencode", "templates"),
    join(projectDir, "..", "templates"),
  ]
  for (const dir of candidates) {
    try {
      const s = await stat(dir)
      if (s.isDirectory()) return dir
    } catch { /* not found */ }
  }
  return null
}

async function getTemplate(name: string, templatesDir: string | null): Promise<string> {
  if (templatesDir) {
    try {
      return await readFile(join(templatesDir, name), "utf-8")
    } catch { /* fall through to embedded */ }
  }
  const embedded = EMBEDDED_TEMPLATES[name]
  if (embedded) return embedded
  throw new Error(`Template not found: ${name}`)
}

export async function initProject(seedFile?: string): Promise<void> {
  const projectDir = process.cwd()
  const templatesDir = await findTemplatesDir(projectDir)

  try {
    await mkdir(join(projectDir, ".sdlc"), { recursive: true })
    await mkdir(join(projectDir, "docs"), { recursive: true })
  } catch (err) {
    throw new Error(`Failed to create directories: ${err}`)
  }

  const files = [
    { src: "state.md", dest: ".sdlc/state.md" },
    { src: "todo.md", dest: ".sdlc/todo.md" },
    { src: "phases.md", dest: ".sdlc/phases.md" },
    { src: "spec-gaps.md", dest: ".sdlc/spec-gaps.md" },
    { src: "blockers.md", dest: ".sdlc/blockers.md" },
    { src: "expectations.md", dest: "docs/expectations.md" },
    { src: "spec.md", dest: "docs/spec.md" },
  ]

  for (const { src, dest } of files) {
    try {
      const template = await getTemplate(src, templatesDir)
      await writeFile(join(projectDir, dest), template)
    } catch (err) {
      throw new Error(`Failed to write ${dest}: ${err}`)
    }
  }

  try {
    await writeFile(join(projectDir, ".sdlc/agent.log"), "")
  } catch (err) {
    throw new Error(`Failed to create agent.log: ${err}`)
  }

  try {
    const configDest = join(projectDir, ".sdlc/config.json")
    try {
      await access(configDest)
    } catch {
      const configContent = await getTemplate("sdlc-config.json", templatesDir)
      await writeFile(configDest, configContent)
    }
  } catch (err) {
    throw new Error(`Failed to create config.json: ${err}`)
  }

  if (seedFile) {
    try {
      await access(seedFile)
      const seed = await readFile(seedFile, "utf-8")
      await writeFile(join(projectDir, "docs/intent.md"), seed)
    } catch (err) {
      throw new Error(`Failed to read seed file ${seedFile}: ${err}`)
    }
  } else {
    try {
      const intentTemplate = await getTemplate("intent.md", templatesDir)
      await writeFile(join(projectDir, "docs/intent.md"), intentTemplate)
    } catch (err) {
      throw new Error(`Failed to write intent.md: ${err}`)
    }
  }
}