import type { HookRegistry, HookContext } from "@opencode/hooks"

export function registerHooks(hooks: HookRegistry) {
  hooks.register("post-test", async (context: HookContext) => {
    const testResults = context.testResults as { passed: boolean; output: string } | undefined
    const lossDelta = context.lossDelta as number | undefined
    
    if (testResults && !testResults.passed) {
      return { 
        success: false, 
        error: "Tests failed. Fix before proceeding." 
      }
    }
    
    if (lossDelta && lossDelta > 0) {
      return {
        success: false,
        warning: "Loss increased. Review changes.",
        shouldRollback: true
      }
    }
    
    return { success: true }
  })
  
  hooks.register("pre-implement", async (context: HookContext) => {
    const linesChanged = context.linesChanged as number | undefined
    const filesTouched = context.filesTouched as number | undefined
    const maxLines = context.maxLines as number | undefined
    const maxFiles = context.maxFiles as number | undefined
    
    if (linesChanged && maxLines && linesChanged > maxLines) {
      return { 
        allowed: false, 
        error: `Scope exceeds limit: ${linesChanged} lines > ${maxLines} max. Decompose task.` 
      }
    }
    
    if (filesTouched && maxFiles && filesTouched > maxFiles) {
      return { 
        allowed: false, 
        error: `Too many files: ${filesTouched} > ${maxFiles} max. Focus on single responsibility.` 
      }
    }
    
    return { allowed: true }
  })
  
  hooks.register("phase-transition", async (context: HookContext) => {
    const gateCleared = context.gateCleared as boolean | undefined
    const unresolvedGaps = context.unresolvedGaps as number | undefined
    
    if (gateCleared === false) {
      return { 
        continue: false, 
        error: "Phase gate not cleared. Complete all checks first." 
      }
    }
    
    if (unresolvedGaps && unresolvedGaps > 0) {
      return {
        continue: false,
        error: `Unresolved spec gaps: ${unresolvedGaps}. Resolve or document exclusions.`
      }
    }
    
    return { continue: true }
  })
  
  hooks.register("escape-escalation", async (context: HookContext) => {
    const escapeLevel = context.escapeLevel as number | undefined
    
    const actions: Record<number, string> = {
      1: "Rotate strategy. Try fundamentally different approach.",
      2: "Decompose into 2-3 subtasks with independent tests.",
      3: "Verify environment independently.",
      4: "BLOCKED. Move to next task."
    }
    
    const level = escapeLevel || 1
    
    return { 
      handled: true, 
      level: level,
      action: actions[level] || "Unknown escape level",
      shouldBlock: level >= 4
    }
  })
}
