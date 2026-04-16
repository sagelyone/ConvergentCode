import { z } from "zod"

export const ConvergentCodeConfigSchema = z.object({
  harness: z.literal("convergentcode"),
  provider: z.object({
    name: z.string().default("openrouter"),
    base_url: z.string().default("https://openrouter.ai/api/v1"),
    model: z.string().default("z-ai/glm-5.1"),
  }),
  agents: z.record(z.object({
    model: z.string().default("z-ai/glm-5.1"),
  })).optional(),
  test: z.object({
    command: z.string(),
    unit: z.string(),
    property: z.string(),
    acceptance: z.string(),
    lint: z.string().default("true"),
    timeout: z.string().default("120s"),
  }),
  escape: z.object({
    L1: z.number().default(3),
    L2: z.number().default(5),
    L3: z.number().default(7),
    L4: z.number().default(9),
  }),
  loss_weights: z.object({
    acceptance: z.number().default(100),
    unit: z.number().default(50),
    property: z.number().default(50),
    unimplemented: z.number().default(25),
    expectations: z.number().default(15),
    intents: z.number().default(10),
    lint: z.number().default(5),
    blocked: z.number().default(3),
    spec_gaps: z.number().default(1),
  }),
  constraints: z.object({
    max_lines: z.object({
      scaffold: z.number().default(120),
      modify: z.number().default(50),
    }),
    max_files: z.number().default(4),
    diff_hash_window: z.number().default(8),
    log_tail: z.object({
      worker: z.number().default(20),
      orchestrator: z.number().default(50),
      gate_reviewer: z.union([z.number(), z.literal("current_phase")]).default("current_phase"),
    }),
  }),
}).partial()

export type ConvergentCodeConfig = z.infer<typeof ConvergentCodeConfigSchema>

export const AgenticSdlcConfigSchema = ConvergentCodeConfigSchema
export type AgenticSdlcConfig = ConvergentCodeConfig
