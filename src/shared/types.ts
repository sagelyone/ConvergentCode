
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
export interface AgentPermissions {
  edit: "allow" | "deny" | "sandbox"
  bash?: "allow" | "deny"
  allowed_paths?: string[]
  denied_paths?: string[]
}
