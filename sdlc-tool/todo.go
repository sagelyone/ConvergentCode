package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

func handleTodoUpdate(args []string) {
	if len(args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: sdlc-tool todo-update <action> <task-id> [--test-result PASS|FAIL]")
		os.Exit(1)
	}

	action := args[0]
	taskID := args[1]

	testResult := ""
	for i := 2; i < len(args); i++ {
		if args[i] == "--test-result" && i+1 < len(args) {
			testResult = args[i+1]
			i++
		}
	}

	if action == "complete" && testResult != "PASS" {
		fmt.Fprintln(os.Stderr, "Error: Cannot complete task without test result PASS")
		os.Exit(1)
	}

	if err := updateTodoFile(action, taskID, testResult); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating todo: %v\n", err)
		os.Exit(1)
	}

	if action == "complete" && testResult == "PASS" {
		if err := autoCommit(taskID); err != nil {
			fmt.Fprintf(os.Stderr, "Warning: auto-commit failed: %v\n", err)
		}
	}

	fmt.Printf("Task %s %s\n", taskID, action)
}

func updateTodoFile(action, taskID, testResult string) error {
	flock := NewFileLock(".sdlc/todo.md")
	if err := flock.Lock(); err != nil {
		return err
	}
	defer flock.Unlock()

	data, err := os.ReadFile(".sdlc/todo.md")
	if err != nil {
		return err
	}

	content := string(data)

	switch action {
	case "add":
		content = addTask(content, taskID)
	case "start":
		content = markTaskActive(content, taskID)
	case "complete":
		content = markTaskComplete(content, taskID)
	case "block":
		content = markTaskBlocked(content, taskID)
	}

	return os.WriteFile(".sdlc/todo.md", []byte(content), 0644)
}

func addTask(content, taskID string) string {
	taskTemplate := fmt.Sprintf(`
### %s [ ] - New Task
- **S:** 
- **M:** 
- **A:** 
- **R:** 
- **T:** 
- **Iteration count:** 0
- **Failure signatures:** []

`, taskID)
	return content + taskTemplate
}

func markTaskActive(content, taskID string) string {
	content = strings.Replace(content, "### "+taskID+" [ ]", "### "+taskID+" [ACTIVE]", 1)
	content = strings.Replace(content, "### "+taskID+" [BLOCKED]", "### "+taskID+" [ACTIVE]", 1)
	return content
}

func markTaskComplete(content, taskID string) string {
	content = strings.Replace(content, "### "+taskID, "### "+taskID+" [COMPLETED]", 1)
	content = strings.Replace(content, "### "+taskID+" [ACTIVE]", "### "+taskID+" [COMPLETED]", 1)
	content = strings.Replace(content, "### "+taskID+" [BLOCKED]", "### "+taskID+" [COMPLETED]", 1)
	return content
}

func markTaskBlocked(content, taskID string) string {
	content = strings.Replace(content, "### "+taskID, "### "+taskID+" [BLOCKED]", 1)
	content = strings.Replace(content, "### "+taskID+" [ACTIVE]", "### "+taskID+" [BLOCKED]", 1)
	return content
}

func autoCommit(taskID string) error {
	commitMsg := fmt.Sprintf("ConvergentCode: %s completed — %s", taskID, time.Now().Format(time.RFC3339))

	cmd := exec.Command("git", "add", ".")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to stage changes: %w", err)
	}

	cmd = exec.Command("git", "commit", "-m", commitMsg)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to commit: %w", err)
	}

	return nil
}
