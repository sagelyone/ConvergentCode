import { ConvergentConfigSchema, type ConvergentConfig } from "./types.js"
import { join } from "path"
import { readFile } from "fs/promises"

const DEFAULT_CONFIG: ConvergentConfig = {
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
    log_tail: { worker: 20, orchestrator: 50, gate_reviewer: "current_phase" },
  },
}

export async function readConfig(projectDir: string): Promise<ConvergentConfig> {
  const configPath = join(projectDir, ".sdlc", "config.json")
  try {
    const text = await readFile(configPath, "utf-8")
    const raw = JSON.parse(text)
    return ConvergentConfigSchema.parse(raw)
  } catch {
    return DEFAULT_CONFIG
  }
}

export function getDefaultConfig(): ConvergentConfig {
  return DEFAULT_CONFIG
}

export function getTestCommand(config: ConvergentConfig): string {
  return config.test?.command ?? "go test"
}

export function getTestUnit(config: ConvergentConfig): string {
  return config.test?.unit ?? "./..."
}

export function getTestProperty(config: ConvergentConfig): string {
  return config.test?.property ?? "-run Prop ./..."
}

export function getTestAcceptance(config: ConvergentConfig): string {
  return config.test?.acceptance ?? "-run Acceptance ./..."
}

export function getLintCommand(config: ConvergentConfig): string {
  return config.test?.lint ?? "true"
}

export function getTimeout(config: ConvergentConfig): string {
  return config.test?.timeout ?? "120s"
}
