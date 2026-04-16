import { AGENTS } from "../shared/constants.js"
import { createConvergenceOrchestrator } from "./convergence-orchestrator/system-prompt.js"
import { createApitWorkerPrompt } from "./apit-worker/system-prompt.js"
import { createSpecWriterPrompt } from "./spec-writer/system-prompt.js"
import { createPhaseGateReviewerPrompt } from "./phase-gate-reviewer/system-prompt.js"
import { createIntentAlignmentOraclePrompt } from "./intent-alignment-oracle/system-prompt.js"
import { createDifferentialImplementerPrompt } from "./differential-implementer/system-prompt.js"
import { createSpecGapDetectorPrompt } from "./spec-gap-detector/system-prompt.js"

export function registerAgents(agents: any) {
  agents.register(AGENTS.CONVERGENCE_ORCHESTRATOR, {
    systemPrompt: createConvergenceOrchestrator(),
  })
  
  agents.register(AGENTS.APIT_WORKER, {
    systemPrompt: createApitWorkerPrompt(),
  })
  
  agents.register(AGENTS.SPEC_WRITER, {
    systemPrompt: createSpecWriterPrompt(),
  })
  
  agents.register(AGENTS.PHASE_GATE_REVIEWER, {
    systemPrompt: createPhaseGateReviewerPrompt(),
  })
  
  agents.register(AGENTS.INTENT_ALIGNMENT_ORACLE, {
    systemPrompt: createIntentAlignmentOraclePrompt(),
  })
  
  agents.register(AGENTS.DIFFERENTIAL_IMPLEMENTER, {
    systemPrompt: createDifferentialImplementerPrompt(),
  })
  
  agents.register(AGENTS.SPEC_GAP_DETECTOR, {
    systemPrompt: createSpecGapDetectorPrompt(),
  })
}
