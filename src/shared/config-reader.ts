import type { ConvergentCodeConfig } from "../config/schema.js"

export function readConfig(): ConvergentCodeConfig {
  try {
    Bun.file(".opencode/config.jsonc")
    return {} as ConvergentCodeConfig
  } catch {
    return {}
  }
}

export function getTestCommand(config: ConvergentCodeConfig): string {
  return config.test?.command ?? "go test"
}

export function getTestUnit(config: ConvergentCodeConfig): string {
  return config.test?.unit ?? "./..."
}

export function getTestProperty(config: ConvergentCodeConfig): string {
  return config.test?.property ?? "-run Prop ./..."
}

export function getTestAcceptance(config: ConvergentCodeConfig): string {
  return config.test?.acceptance ?? "-run Acceptance ./..."
}

export function getLintCommand(config: ConvergentCodeConfig): string {
  return config.test?.lint ?? "true"
}

export function getTimeout(config: ConvergentCodeConfig): string {
  return config.test?.timeout ?? "120s"
}
