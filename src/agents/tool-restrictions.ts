export interface AgentPermission {
  edit: "allow" | "deny" | "sandbox"
  bash?: "allow" | "deny"
  allowed_paths?: string[]
  denied_paths?: string[]
}

export const AGENT_PERMISSIONS: Record<string, AgentPermission> = {
  "convergence-orchestrator": {
    edit: "deny",
    bash: "allow",
  },
  "apit-worker": {
    edit: "allow",
    denied_paths: ["docs/intent.md", "docs/spec.md", "docs/expectations.md", "*_test.go", "*_test.ts"],
  },
  "spec-writer": {
    edit: "allow",
    allowed_paths: ["docs/*.md"],
    bash: "deny",
  },
  "phase-gate-reviewer": {
    edit: "deny",
    allowed_paths: [".sdlc/spec-gaps.md", ".sdlc/phases.md"],
  },
  "intent-alignment-oracle": {
    edit: "deny",
    allowed_paths: [".sdlc/spec-gaps.md"],
  },
  "differential-implementer": {
    edit: "sandbox",
    allowed_paths: [".sdlc/sandbox/*"],
  },
  "spec-gap-detector": {
    edit: "deny",
    allowed_paths: [".sdlc/spec-gaps.md"],
  },
}

export type AgentName = keyof typeof AGENT_PERMISSIONS

export function canEdit(agent: AgentName, path: string): boolean {
  const perms = AGENT_PERMISSIONS[agent]
  
  if (perms.edit === "deny") return false
  if (perms.edit === "sandbox") return path.startsWith(".sdlc/sandbox/")
  
  if (perms.allowed_paths) {
    return perms.allowed_paths.some((pattern: string) => {
      if (pattern.includes("*")) {
        const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")
        return regex.test(path)
      }
      return path === pattern || path.startsWith(pattern)
    })
  }
  
  if (perms.denied_paths) {
    return !perms.denied_paths.some((pattern: string) => {
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"))
        return regex.test(path)
      }
      return path === pattern || path.includes(pattern)
    })
  }
  
  return true
}

export function canBash(agent: AgentName): boolean {
  const perms = AGENT_PERMISSIONS[agent]
  return perms.bash !== "deny"
}
