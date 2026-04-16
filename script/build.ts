#!/usr/bin/env node
import { execSync } from "child_process"
import { rmSync, mkdirSync, cpSync, existsSync } from "fs"

console.log("Building ConvergentCode...")
console.log("")

console.log("1. Cleaning dist/...")
rmSync("dist", { recursive: true, force: true })
mkdirSync("dist", { recursive: true })
console.log("  ✓ Cleaned")

console.log("")
console.log("2. Bundling TypeScript plugin into dist/convergentcode.js...")

function hasCommand(cmd: string): boolean {
  try { execSync(`which ${cmd}`, { stdio: "pipe" }); return true } catch { return false }
}

try {
  if (hasCommand("bun")) {
    execSync(
      "bun build ./src/index.ts --outfile ./dist/convergentcode.js --target node --bundle --minify",
      { stdio: "inherit" }
    )
  } else {
    execSync(
      "npx esbuild ./src/index.ts --bundle --platform=node --format=esm --outfile=./dist/convergentcode.js --minify",
      { stdio: "inherit" }
    )
  }
  console.log("  ✓ Plugin bundled")
} catch (error) {
  console.error("  ✗ Plugin bundle failed")
  process.exit(1)
}

console.log("")
console.log("3. Building Go binary (sdlc-tool) for current platform...")
try {
  execSync("cd sdlc-tool && go build -o ../dist/sdlc-tool .", { stdio: "pipe" })
  console.log("  ✓ sdlc-tool built for current platform")
} catch {
  console.log("  ⚠ Go build skipped (Go not installed or build failed)")
  console.log("     Run: cd sdlc-tool && go build -o ~/.local/bin/sdlc-tool .")
}

console.log("")
console.log("4. Copying declarative assets to dist/...")

const assetDirs = ["agents", "commands", "rules", "skills"]
for (const dir of assetDirs) {
  const src = `.opencode/${dir}`
  const dest = `dist/.opencode/${dir}`
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log(`  ✓ .opencode/${dir}`)
  }
}

for (const dir of ["shell", "templates"]) {
  if (existsSync(dir)) {
    cpSync(dir, `dist/${dir}`, { recursive: true })
    console.log(`  ✓ ${dir}/`)
  }
}

console.log("")
console.log("✅ Build complete!")
console.log("")
console.log("Output in ./dist/:")
console.log("  convergentcode.js  → copy to .opencode/plugins/")
console.log("  sdlc-tool          → copy to ~/.local/bin/")
console.log("  .opencode/         → merge into project's .opencode/")
console.log("  shell/             → copy to project root")
console.log("  templates/         → used by /init-project")
