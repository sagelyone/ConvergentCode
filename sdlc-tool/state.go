package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"time"
)

func handleStateWrite(args []string) {
	if len(args) < 1 {
		fmt.Fprintln(os.Stderr, "Usage: sdlc-tool state-write '<json>'")
		os.Exit(1)
	}

	var update map[string]interface{}
	if err := json.Unmarshal([]byte(args[0]), &update); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	flock := NewFileLock(".sdlc/state.md")
	if err := flock.Lock(); err != nil {
		fmt.Fprintf(os.Stderr, "Error acquiring lock: %v\n", err)
		os.Exit(1)
	}
	defer flock.Unlock()

	if err := applyStateUpdate(update); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating state: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("State updated")
}

func applyStateUpdate(update map[string]interface{}) error {
	data, err := os.ReadFile(".sdlc/state.md")
	if err != nil {
		return err
	}

	content := string(data)

	if phase, ok := update["phase"].(float64); ok {
		content = updateField(content, "Phase", fmt.Sprintf("%.0f", phase))
	}

	if task, ok := update["active_task"].(string); ok {
		content = updateField(content, "Active task", task)
	}

	if loss, ok := update["loss"].(float64); ok {
		oldLoss := extractLoss(content)
		content = updateField(content, "Loss", fmt.Sprintf("total=%.0f", loss))
		content = updateField(content, "Loss delta", fmt.Sprintf("%+.0f", loss-oldLoss))

		if loss > oldLoss {
			content = updateField(content, "Escape status", "WARNING: Loss increased")
		}
	}

	if action, ok := update["last_action"].(string); ok {
		content = updateField(content, "Last action", action)
	}

	content = updateField(content, "Timestamp", time.Now().UTC().Format(time.RFC3339))

	return os.WriteFile(".sdlc/state.md", []byte(content), 0644)
}

func updateField(content, field, value string) string {
	pattern := regexp.MustCompile(fmt.Sprintf(`(?m)(\*\*%s:\*\*\s+).*$`, regexp.QuoteMeta(field)))
	return pattern.ReplaceAllString(content, fmt.Sprintf("${1}%s", value))
}

func extractLoss(content string) float64 {
	re := regexp.MustCompile(`total=(\d+)`)
	match := re.FindStringSubmatch(content)
	if len(match) > 1 {
		val, _ := strconv.ParseFloat(match[1], 64)
		return val
	}
	return 0
}
