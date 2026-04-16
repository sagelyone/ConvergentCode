import { createHash } from "crypto"
import { readFile, readdir } from "fs/promises"
import { join } from "path"
import { readText, countMatches } from "./file-utils.js"

async function failureSigCore(dir: string, testId: string, errorOutput: string): Promise<{
  signature: string
  repeat_count: number
}> {
  const firstErr = errorOutput.split("\n")[0]
  const sig = createHash("sha256").update(`${testId}:${firstErr}`).digest("hex").slice(0, 12)

  const todoContent = await readText(dir, ".sdlc/todo.md")
  const count = countMatches(todoContent, new RegExp(sig, "g"))

  return { signature: sig, repeat_count: count }
}

async function diffHashCore(dir: string): Promise<{
  hash: string
  collision: boolean
}> {
  let hash = ""
  let hasGit = false

  try {
    const { execSync } = await import("child_process")
    const diff = execSync("git diff", { cwd: dir, encoding: "utf-8" })
    hasGit = true
    if (diff.trim()) {
      hash = createHash("sha256").update(diff).digest("hex").slice(0, 12)
    } else {
      const cachedDiff = execSync("git diff --cached", { cwd: dir, encoding: "utf-8" })
      hash = cachedDiff.trim()
        ? createHash("sha256").update(cachedDiff).digest("hex").slice(0, 12)
        : ""
    }
  } catch { /* no git or not a repo */ }

  if (!hash) return { hash: hasGit ? "empty" : "no-git", collision: false }

  let collision = false
  try {
    const config = await readText(dir, ".sdlc/config.json")
    const window = config ? JSON.parse(config).constraints?.diff_hash_window ?? 8 : 8
    const logContent = await readText(dir, ".sdlc/agent.log")
    if (logContent) {
      const lines = logContent.trim().split("\n").slice(-(window * 4))
      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          if (entry.payload?.diff_hash === hash) { collision = true; break }
        } catch { /* skip malformed */ }
      }
    }
  } catch { /* no config or log */ }

  return { hash, collision }
}

interface ScenarioCell {
  entity: string
  operation: string
  precondition: string
  covered: boolean
}

async function scenarioMatrixCore(dir: string): Promise<string> {
  const specContent = await readText(dir, "docs/spec.md")
  if (!specContent) return "Error: docs/spec.md not found"

  const scenarios = specContent.split("### Scenario:").slice(1)
  const cells: ScenarioCell[] = []

  for (const scenario of scenarios) {
    const entityMatch = scenario.match(/Given\s+(\w+)/)
    const operationMatch = scenario.match(/When\s+(\w+)/)
    const covered = /\*\*Status:\*\*\s*\[x\]/.test(scenario)

    cells.push({
      entity: entityMatch?.[1] ?? "unknown",
      operation: operationMatch?.[1] ?? "unknown",
      precondition: "default",
      covered,
    })
  }

  const uncovered = cells.filter((c) => !c.covered)

  let output = `Total cells: ${cells.length}\nUncovered cells: ${uncovered.length}\n\n`
  for (const cell of uncovered) {
    output += `- Entity: ${cell.entity} | Operation: ${cell.operation} | Precondition: ${cell.precondition}\n`
  }

  return output
}

function globToSuffixes(globs: string[]): string[] {
  const suffixes: string[] = []
  for (const g of globs) {
    const lastSlash = g.lastIndexOf("/")
    const basename = lastSlash >= 0 ? g.slice(lastSlash + 1) : g
    const starIdx = basename.indexOf("*")
    if (starIdx >= 0) {
      suffixes.push(basename.slice(starIdx + 1))
    } else if (basename.startsWith(".")) {
      suffixes.push(basename)
    }
  }
  return suffixes.filter((s) => s.length > 0)
}

async function assertionDensityCore(dir: string): Promise<string> {
  const config = await readText(dir, ".sdlc/config.json")
  let extensions = ["*.go", "*.py", "*.rs", "*.ts", "*.js"]
  if (config) {
    try {
      const parsed = JSON.parse(config)
      if (parsed.source_extensions?.length) extensions = parsed.source_extensions
    } catch { /* use defaults */ }
  }

  const suffixes = globToSuffixes(extensions)
  const results: string[] = []

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue
      const fullPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (suffixes.some((s) => entry.name.endsWith(s))) {
        try {
          const content = await readFile(fullPath, "utf-8")
          const lines = content.split("\n").length
          const assertions = countMatches(content, /(assert|expect|require|t\.Error|t\.Fatal|assertEquals|assert_)/g)
          const density = lines > 0 ? (assertions / lines).toFixed(2) : "0"
          results.push(`${fullPath}: ${assertions} assertions / ${lines} lines = ${density} density`)
        } catch { /* skip unreadable */ }
      }
    }
  }

  await walk(dir)
  return results.slice(0, 100).join("\n")
}

export { failureSigCore, diffHashCore, scenarioMatrixCore, assertionDensityCore }
