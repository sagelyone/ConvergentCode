import { readFile, writeFile } from "fs/promises"
import { resolve } from "path"

export async function readText(dir: string, relPath: string): Promise<string> {
  try {
    return await readFile(resolve(dir, relPath), "utf-8")
  } catch {
    return ""
  }
}

export async function writeText(dir: string, relPath: string, content: string): Promise<void> {
  await writeFile(resolve(dir, relPath), content, "utf-8")
}

export function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern)
  return matches ? matches.length : 0
}

export function updateField(content: string, field: string, value: string): string {
  const re = new RegExp(`(\\*\\*${field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\*\\*\\s+).*$`, "m")
  return content.replace(re, `$1${value}`)
}

export function extractLoss(content: string): number {
  const m = content.match(/total=(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

const PHASE_NAMES: Record<number, string> = {
  0: "SPECIFICATION",
  1: "ARCHITECTURE",
  2: "FOUNDATION",
  3: "CORE_LOGIC",
  4: "INTERFACE",
  5: "HARDENING",
  6: "ALIGNMENT",
}

export function getPhaseName(phase: number): string {
  return PHASE_NAMES[phase] ?? "UNKNOWN"
}

export function getCurrentPhase(stateContent: string): number {
  const m = stateContent.match(/Phase:\*\*\s*(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}
