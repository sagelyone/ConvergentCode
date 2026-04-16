import { tool } from "@opencode-ai/plugin"
const z = tool.schema

export const ConvergentConfigSchema = z.object({
  test: z.object({
    command: z.string(),
    unit: z.string(),
    property: z.string(),
    acceptance: z.string(),
    lint: z.string(),
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
  test?: {
    command: string
    unit: string
    property: string
    acceptance: string
    lint: string
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

export interface LossComponents {
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

export interface LossResult {
  total: number
  delta: number
  components: LossComponents
}

export interface FailureSignature {
  signature: string
  repeat_count: number
}

export interface DiffHashResult {
  hash: string
  collision: boolean
}

export interface GateCheckResult {
  cleared: boolean
  checked: number
  total: number
  unresolved_gaps: number
}

export interface StateUpdate {
  timestamp: string
  phase: number
  active_task: string
  iter_task: number
  iter_phase: number
  iter_global: number
  loss: number
  loss_delta: number
  last_action: string
  last_test: string
  failure_signature: string
  escape_status: string
  next_action: string
}

export interface Task {
  id: string
  title: string
  description: string
  iteration_count: number
  failure_signatures: string[]
  status: "active" | "blocked" | "completed"
}

export interface TodoList {
  phase: number
  phase_name: string
  tasks: Task[]
  blocked_tasks: Task[]
  completed_tasks: Task[]
}

export interface LogEntry {
  ts: string
  phase: number
  task: string
  iter_task: number
  iter_global: number
  event: string
  payload: Record<string, unknown>
}

export interface PhaseCheck {
  description: string
  checked: boolean
}

export interface Phase {
  number: number
  name: string
  status: "ACTIVE" | "CLEARED" | "LOCKED"
  checks: PhaseCheck[]
}

export interface SpecGap {
  id: string
  description: string
  status: "detected" | "awaiting_human" | "resolved"
  detected_at: string
  resolved_at?: string
}

export interface Blocker {
  id: string
  task_id: string
  description: string
  escape_level: number
  created_at: string
}