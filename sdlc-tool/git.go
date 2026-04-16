package main

import (
	"fmt"
	"os"
	"os/exec"
)

func handleCommitGreen(args []string) {
	if len(args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: sdlc-tool commit-green <task-id> <message>")
		os.Exit(1)
	}

	taskID := args[0]
	message := args[1]

	commitMsg := fmt.Sprintf("SDLC: %s — %s", taskID, message)

	cmd := exec.Command("git", "add", ".")
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error staging changes: %v\n", err)
		os.Exit(1)
	}

	cmd = exec.Command("git", "commit", "-m", commitMsg)
	if err := cmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error committing: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Committed: %s\n", commitMsg)
}

func handleRollback(args []string) {
	toTask := ""
	for i := 0; i < len(args); i++ {
		if args[i] == "--to-task" && i+1 < len(args) {
			toTask = args[i+1]
			i++
		}
	}

	if toTask != "" {
		if err := revertToTask(toTask); err != nil {
			fmt.Fprintf(os.Stderr, "Error reverting to task: %v\n", err)
			os.Exit(1)
		}
	} else {
		cmd := exec.Command("git", "revert", "HEAD", "--no-edit")
		if err := cmd.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Error reverting: %v\n", err)
			os.Exit(1)
		}
	}

	fmt.Println("Rollback complete")
}

func revertToTask(taskID string) error {
	cmd := exec.Command("git", "log", "--oneline", "--grep", fmt.Sprintf("SDLC: %s", taskID), "-n", "1")
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("could not find commit for task %s", taskID)
	}

	commit := string(output)
	if len(commit) < 7 {
		return fmt.Errorf("invalid commit hash")
	}

	hash := commit[:7]

	cmd = exec.Command("git", "revert", "--no-commit", hash+"..HEAD")
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("git", "commit", "-m", fmt.Sprintf("Rollback to %s", taskID))
	return cmd.Run()
}
