import { spawn } from "child_process"

function runGit(args: string[], cwd: string): Promise<string> {
  return new Promise((res, rej) => {
    const proc = spawn("git", args, { cwd, stdio: ["pipe", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString() })
    proc.on("close", (code) => {
      if (code === 0) res(stdout.trim())
      else rej(new Error(`git ${args.join(" ")} failed (exit ${code}): ${stderr.trim() || stdout.trim()}`))
    })
    proc.on("error", rej)
  })
}

async function commitGreenCore(dir: string, taskId: string, message: string): Promise<string> {
  const commitMsg = `SDLC: ${taskId} — ${message}`
  await runGit(["add", "."], dir)
  await runGit(["commit", "-m", commitMsg], dir)
  return `Committed: ${commitMsg}`
}

async function rollbackCore(dir: string, toTask?: string): Promise<string> {
  if (toTask) {
    const logOutput = await runGit(["log", "--oneline", "--grep", `SDLC: ${toTask}`, "-n", "1"], dir)
    const hash = logOutput.split(/\s+/)[0]
    if (!hash || hash.length < 7) {
      return `Error: could not find commit for task ${toTask}`
    }
    await runGit(["revert", "--no-commit", `${hash}..HEAD`], dir)
    await runGit(["commit", "-m", `Rollback to ${toTask}`], dir)
  } else {
    await runGit(["revert", "HEAD", "--no-edit"], dir)
  }
  return "Rollback complete"
}

export { commitGreenCore, rollbackCore }
