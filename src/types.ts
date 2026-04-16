import { tool } from "@opencode-ai/plugin"
const z = tool.schema

export const ConvergentConfigSchema = z.object({
  language: z.string().optional(),
  log_level: z.enum(["minimal", "verbose", "debug"]).optional(),
  stale_threshold: z.number().optional(),
  source_extensions: z.array(z.string()).optional(),
  test: z.object({
    command: z.string(),
    unit: z.string(),
    property: z.string(),
    acceptance: z.string(),
    lint: z.string(),
    build: z.string().optional(),
    timeout: z.string(),
  }).optional(),
  escape: z.object({
    L1: z.number(),
    L2: z.number(),
    L3: z.number(),
    L4: z.number(),
  }).optional(),
  loss_weights: z.object({
    acceptance: z.number(),
    unit: z.number(),
    property: z.number(),
    unimplemented: z.number(),
    expectations: z.number(),
    intents: z.number(),
    lint: z.number(),
    blocked: z.number(),
    spec_gaps: z.number(),
  }).optional(),
  constraints: z.object({
    max_lines: z.object({
      scaffold: z.number(),
      modify: z.number(),
    }).optional(),
    max_files: z.number().optional(),
    diff_hash_window: z.number().optional(),
    log_tail: z.object({
      worker: z.number().optional(),
      orchestrator: z.number().optional(),
      gate_reviewer: z.union([z.number(), z.string()]).optional(),
    }).optional(),
  }).optional(),
})

export type ConvergentConfig = {
  language?: string
  log_level?: "minimal" | "verbose" | "debug"
  stale_threshold?: number
  source_extensions?: string[]
  test?: {
    command: string
    unit: string
    property: string
    acceptance: string
    lint: string
    build?: string
    timeout: string
  }
  escape?: { L1: number; L2: number; L3: number; L4: number }
  loss_weights?: {
    acceptance: number
    unit: number
    property: number
    unimplemented: number
    expectations: number
    intents: number
    lint: number
    blocked: number
    spec_gaps: number
  }
  constraints?: {
    max_lines?: { scaffold: number; modify: number }
    max_files?: number
    diff_hash_window?: number
    log_tail?: {
      worker?: number
      orchestrator?: number
      gate_reviewer?: number | string
    }
  }
}
