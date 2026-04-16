#!/usr/bin/env node
import { execSync } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const pkgPath = join(process.cwd(), "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))

console.log(`Current version: ${pkg.version}`)
console.log("")

const versionType = process.argv[2] || "patch"

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error("Usage: bun run publish [patch|minor|major]")
  process.exit(1)
}

console.log(`Bumping ${versionType} version...`)

const [major, minor, patch] = pkg.version.split(".").map(Number)
let newVersion: string

switch (versionType) {
  case "major":
    newVersion = `${major + 1}.0.0`
    break
  case "minor":
    newVersion = `${major}.${minor + 1}.0`
    break
  case "patch":
  default:
    newVersion = `${major}.${minor}.${patch + 1}`
    break
}

console.log(`New version: ${newVersion}`)
console.log("")

pkg.version = newVersion
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
console.log("✓ Updated package.json")

try {
  execSync("git diff --quiet", { stdio: "pipe" })
} catch {
  console.log("⚠ Uncommitted changes detected. Committing...")
  execSync("git add package.json")
  execSync(`git commit -m "Bump version to ${newVersion}"`)
  console.log("✓ Committed version bump")
}

console.log("")
console.log("Building...")
execSync("bun run build", { stdio: "inherit" })
console.log("✓ Build complete")

console.log("")
console.log("Publishing to npm...")
execSync("npm publish", { stdio: "inherit" })
console.log("✓ Published to npm")

console.log("")
console.log(`✅ Successfully published version ${newVersion}`)
console.log("")
console.log("Next steps:")
console.log("1. Tag the release: git tag v" + newVersion)
console.log("2. Push tags: git push && git push --tags")
console.log("3. Create GitHub release")
