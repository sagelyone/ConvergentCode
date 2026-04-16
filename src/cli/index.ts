#!/usr/bin/env node
import { initProject } from "../features/init-project/scaffolder.js"

const args = process.argv.slice(2)
const seedFile = args[0]

initProject(seedFile)
  .then(() => {
    console.log("Project initialized successfully")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Failed to initialize project:", err)
    process.exit(1)
  })
