import { mkdir, readFile, writeFile, access } from "fs/promises"
import { join } from "path"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export async function initProject(seedFile?: string): Promise<void> {
  const templatesDir = join(__dirname, "../../../templates")
  
  try {
    await mkdir(".sdlc", { recursive: true })
    await mkdir("docs", { recursive: true })
  } catch (err) {
    throw new Error(`Failed to create directories: ${err}`)
  }
  
  const files = [
    { src: "state.md", dest: ".sdlc/state.md" },
    { src: "todo.md", dest: ".sdlc/todo.md" },
    { src: "phases.md", dest: ".sdlc/phases.md" },
    { src: "spec-gaps.md", dest: ".sdlc/spec-gaps.md" },
    { src: "blockers.md", dest: ".sdlc/blockers.md" },
    { src: "expectations.md", dest: "docs/expectations.md" },
    { src: "spec.md", dest: "docs/spec.md" },
  ]
  
  for (const { src, dest } of files) {
    try {
      const template = await readFile(join(templatesDir, src), "utf-8")
      await writeFile(dest, template)
    } catch (err) {
      throw new Error(`Failed to copy ${src} to ${dest}: ${err}`)
    }
  }
  
  try {
    await writeFile(".sdlc/agent.log", "")
  } catch (err) {
    throw new Error(`Failed to create agent.log: ${err}`)
  }
  
  if (seedFile) {
    try {
      await access(seedFile)
      const seed = await readFile(seedFile, "utf-8")
      await writeFile("docs/intent.md", seed)
    } catch (err) {
      throw new Error(`Failed to read seed file ${seedFile}: ${err}`)
    }
  } else {
    try {
      const intentTemplate = await readFile(join(templatesDir, "intent.md"), "utf-8")
      await writeFile("docs/intent.md", intentTemplate)
    } catch (err) {
      throw new Error(`Failed to copy intent.md: ${err}`)
    }
  }
}
