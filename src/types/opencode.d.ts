// Type declarations for OpenCode Plugin API
// These types represent the runtime API provided by OpenCode when loading plugins

declare module "@opencode/tool" {
  export interface ToolContext {
    bash: (command: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>
    readFile: (path: string) => Promise<string>
    writeFile: (path: string, content: string) => Promise<void>
    editFile: (path: string, search: string, replace: string) => Promise<void>
  }

  export interface ToolArg {
    name: string
    type: "string" | "number" | "boolean"
    description: string
    optional?: boolean
  }

  export interface ToolDefinition {
    name: string
    description: string
    args?: ToolArg[]
    run: (context: ToolContext, args: Record<string, unknown>) => Promise<unknown>
  }

  export function defineCommand(definition: ToolDefinition): ToolDefinition
}

declare module "@opencode/agent" {
  export interface AgentRegistry {
    register: (name: string, config: { systemPrompt: string }) => void
  }
}

declare module "@opencode/hooks" {
  export interface HookContext {
    [key: string]: unknown
  }

  export interface HookRegistry {
    register: (name: string, handler: (context: HookContext) => Promise<unknown>) => void
  }
}
