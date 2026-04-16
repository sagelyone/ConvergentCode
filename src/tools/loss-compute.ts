import { spawn } from "child_process"
import { readText, countMatches, extractLoss } from "./file-utils.js"
import { readConfig } from "../config.js"

async function runCommand(cmd: string, args: string[], cwd: string): Promise<boolean> {
  return new Promise((res) => {
    const proc = spawn(cmd, args, { cwd, stdio: "pipe" })
    proc.on("close", (code) => res(code === 0))
    proc.on("error", () => res(false))
  })
}

function splitArgs(str: string): string[] {
  return str ? str.split(/\s+/).filter(Boolean) : []
}

async function computeLoss(dir: string): Promise<{
  total: number
  delta: number
  components: {
    failing_acceptance: number
    failing_unit: number
    failing_property: number
    unimplemented: number
    uncovered_expectations: number
    unconfirmed_intents: number
    lint_errors: number
    blocked: number
    spec_gaps: number
  }
}> {
  const config = await readConfig(dir)
  const weights = config.loss_weights ?? {
    acceptance: 100, unit: 50, property: 50,
    unimplemented: 25, expectations: 15, intents: 10,
    lint: 5, blocked: 3, spec_gaps: 1,
  }

  let acceptFail = 0
  let unitFail = 0
  let propFail = 0

  const testCmd = config.test?.command ?? ""
  if (testCmd) {
    const cmdParts = splitArgs(testCmd)
    const cmd = cmdParts[0]
    const baseArgs = cmdParts.slice(1)

    if (config.test?.unit) {
      const args = [...baseArgs, ...splitArgs(config.test.unit)]
      if (!await runCommand(cmd, args, dir)) unitFail = 1
    }

    if (config.test?.property) {
      const args = [...baseArgs, ...splitArgs(config.test.property)]
      if (!await runCommand(cmd, args, dir)) propFail = 1
    }

    if (config.test?.acceptance) {
      const args = [...baseArgs, ...splitArgs(config.test.acceptance)]
      if (!await runCommand(cmd, args, dir)) acceptFail = 1
    }
  }

  let lintErrors = 0
  const lintCmd = config.test?.lint ?? "true"
  if (lintCmd !== "true") {
    const parts = splitArgs(lintCmd)
    if (!await runCommand(parts[0], parts.slice(1), dir)) lintErrors = 1
  }

  const specContent = await readText(dir, "docs/spec.md")
  const expContent = await readText(dir, "docs/expectations.md")
  const intContent = await readText(dir, "docs/intent.md")

  const unimpl = countMatches(specContent, /\*\*Status:\*\* \[ \]/g)
  const uncovExp = countMatches(expContent, /none — needs implementation/g)
  const unconfInt = countMatches(intContent, /\*\*Status:\*\* \[ \]/g)

  const blockersContent = await readText(dir, ".sdlc/blockers.md")
  const blocked = countMatches(blockersContent, /^## \[/gm)

  const gapsContent = await readText(dir, ".sdlc/spec-gaps.md")
  const gaps = countMatches(gapsContent, /awaiting_human/g)

  const total =
    acceptFail * weights.acceptance +
    unitFail * weights.unit +
    propFail * weights.property +
    unimpl * weights.unimplemented +
    uncovExp * weights.expectations +
    unconfInt * weights.intents +
    lintErrors * weights.lint +
    blocked * weights.blocked +
    gaps * weights.spec_gaps

  const stateContent = await readText(dir, ".sdlc/state.md")
  const prev = extractLoss(stateContent)
  const delta = total - prev

  return {
    total,
    delta,
    components: {
      failing_acceptance: acceptFail,
      failing_unit: unitFail,
      failing_property: propFail,
      unimplemented: unimpl,
      uncovered_expectations: uncovExp,
      unconfirmed_intents: unconfInt,
      lint_errors: lintErrors,
      blocked,
      spec_gaps: gaps,
    },
  }
}

export { computeLoss }
