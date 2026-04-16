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
console.log("3. Copying declarative assets to dist/...")

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

if (existsSync("templates")) {
  cpSync("templates", "dist/templates", { recursive: true })
  console.log("  ✓ templates/")
}

console.log("")
console.log("✅ Build complete!")
console.log("")
console.log("Output in ./dist/:")
console.log("  convergentcode.js  → copy to .opencode/plugins/")
console.log("  .opencode/         → merge into project's .opencode/")
console.log("  templates/         → used by /init-project")
