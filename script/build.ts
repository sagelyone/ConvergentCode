#!/usr/bin/env node
import { execSync } from "child_process"
import { platform } from "os"

console.log("Building ConvergentCode...")
console.log("")

console.log("1. Compiling TypeScript...")
try {
  execSync("bun run typecheck", { stdio: "inherit" })
  execSync("bun build ./src/index.ts --outdir ./dist --target node", { stdio: "inherit" })
  console.log("✓ TypeScript compiled")
} catch (error) {
  console.error("✗ TypeScript compilation failed")
  process.exit(1)
}

console.log("")
console.log("2. Building Go binary (sdlc-tool)...")

const targets = [
  { os: "darwin", arch: "arm64", suffix: "darwin-arm64" },
  { os: "darwin", arch: "amd64", suffix: "darwin-amd64" },
  { os: "linux", arch: "arm64", suffix: "linux-arm64" },
  { os: "linux", arch: "amd64", suffix: "linux-amd64" },
  { os: "windows", arch: "amd64", suffix: "windows-amd64.exe" },
]

for (const target of targets) {
  const outputName = target.os === "windows" 
    ? `sdlc-tool-${target.suffix}`
    : `sdlc-tool-${target.suffix}`
  
  try {
    execSync(
      `cd sdlc-tool && GOOS=${target.os} GOARCH=${target.arch} go build -o ../dist/sdlc-tool/${outputName}`,
      { stdio: "pipe" }
    )
    console.log(`  ✓ ${target.os}/${target.arch}`)
  } catch (error) {
    console.error(`  ✗ ${target.os}/${target.arch} failed`)
  }
}

console.log("")
console.log("3. Copying resources...")

const resources = [
  ".opencode",
  "shell",
  "templates",
  "docs",
]

for (const resource of resources) {
  try {
    execSync(`cp -r ${resource} dist/`, { stdio: "pipe" })
    console.log(`  ✓ ${resource}`)
  } catch (error) {
    console.error(`  ✗ ${resource} failed`)
  }
}

console.log("")
console.log("✅ Build complete!")
console.log("")
console.log("Output in ./dist/")
console.log("Ready to publish with: bun run publish")
