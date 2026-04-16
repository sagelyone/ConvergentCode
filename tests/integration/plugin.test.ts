import { describe, it, expect } from "bun:test"
import { allTools } from "../../src/tools/index.js"
import { createHooks } from "../../src/hooks/index.js"

describe("plugin entry point", () => {
  it("should export a default async function that returns Hooks", async () => {
    const pluginModule = await import("../../src/index.js")
    const plugin = pluginModule.default
    expect(typeof plugin).toBe("function")
  })

  it("should return a Hooks object with tools and hooks when called", async () => {
    const { default: plugin } = await import("../../src/index.js")
    const mockInput = {
      client: {} as any,
      project: {} as any,
      directory: "/tmp/test-project",
      worktree: "/tmp/test-project",
      experimental_workspace: {
        register: () => {},
      },
      serverUrl: new URL("http://localhost:3000"),
      $: {} as any,
    }
    const hooks = await plugin(mockInput)

    expect(hooks).toBeDefined()
    expect(typeof hooks).toBe("object")
    expect(hooks.tool).toBeDefined()
    expect(typeof hooks.tool).toBe("object")
  })
})

describe("tool definitions", () => {
  const toolNames = Object.keys(allTools)

  it("should register all 13 tools", () => {
    expect(toolNames.length).toBe(13)
  })

  it("should have the expected tool names", () => {
    const expected = [
      "init_project",
      "loss_compute",
      "failure_sig",
      "diff_hash",
      "state_write",
      "todo_update",
      "log_emit",
      "gate_check",
      "phase_advance",
      "commit_green",
      "rollback",
      "scenario_matrix",
      "assertion_density",
    ]
    for (const name of expected) {
      expect(toolNames).toContain(name)
    }
  })

  it("should have a description for every tool", () => {
    for (const [name, toolDef] of Object.entries(allTools)) {
      expect(toolDef.description).toBeTruthy()
      expect(typeof toolDef.description).toBe("string")
    }
  })

  it("should have a valid Zod schema for every tool with args", () => {
    for (const [name, toolDef] of Object.entries(allTools)) {
      if (name === "loss_compute" || name === "diff_hash" || name === "gate_check" ||
          name === "phase_advance" || name === "scenario_matrix") {
        expect(toolDef.args).toBeDefined()
      }
      if (toolDef.args && typeof toolDef.args === "object") {
        for (const [key, schema] of Object.entries(toolDef.args as Record<string, any>)) {
          expect(schema).toBeDefined()
          expect(typeof schema._def).toBe("object")
        }
      }
    }
  })

  it("should have an execute function for every tool", () => {
    for (const [name, toolDef] of Object.entries(allTools)) {
      expect(typeof toolDef.execute).toBe("function")
    }
  })
})

describe("hooks", () => {
  it("should create hooks with tool.execute.before and tool.execute.after", () => {
    const hooks = createHooks()
    expect(hooks["tool.execute.before"]).toBeDefined()
    expect(hooks["tool.execute.after"]).toBeDefined()
    expect(typeof hooks["tool.execute.before"]).toBe("function")
    expect(typeof hooks["tool.execute.after"]).toBe("function")
  })
})