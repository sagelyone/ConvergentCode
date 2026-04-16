package main

import (
	"fmt"
	"os"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: sdlc-tool <command> [args...]")
		fmt.Fprintln(os.Stderr, "Commands: todo-update, state-write, phase-advance, commit-green, rollback, scenario-matrix, shadow-scenarios")
		os.Exit(1)
	}

	cmd := os.Args[1]

	switch cmd {
	case "todo-update":
		handleTodoUpdate(os.Args[2:])
	case "state-write":
		handleStateWrite(os.Args[2:])
	case "phase-advance":
		handlePhaseAdvance(os.Args[2:])
	case "commit-green":
		handleCommitGreen(os.Args[2:])
	case "rollback":
		handleRollback(os.Args[2:])
	case "scenario-matrix":
		handleScenarioMatrix(os.Args[2:])
	case "shadow-scenarios":
		handleShadowScenarios(os.Args[2:])
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n", cmd)
		os.Exit(1)
	}
}
