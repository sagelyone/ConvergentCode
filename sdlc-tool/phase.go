package main

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

func handlePhaseAdvance(args []string) {
	flock := NewFileLock(".sdlc/phases.md")
	if err := flock.Lock(); err != nil {
		fmt.Fprintf(os.Stderr, "Error acquiring lock: %v\n", err)
		os.Exit(1)
	}
	defer flock.Unlock()

	stateFlock := NewFileLock(".sdlc/state.md")
	if err := stateFlock.Lock(); err != nil {
		fmt.Fprintf(os.Stderr, "Error acquiring state lock: %v\n", err)
		os.Exit(1)
	}
	defer stateFlock.Unlock()

	currentPhase, err := getCurrentPhase()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error getting current phase: %v\n", err)
		os.Exit(1)
	}

	if err := markPhaseCleared(currentPhase); err != nil {
		fmt.Fprintf(os.Stderr, "Error marking phase cleared: %v\n", err)
		os.Exit(1)
	}

	if err := unlockNextPhase(currentPhase); err != nil {
		fmt.Fprintf(os.Stderr, "Error unlocking next phase: %v\n", err)
		os.Exit(1)
	}

	if err := incrementStatePhase(currentPhase + 1); err != nil {
		fmt.Fprintf(os.Stderr, "Error updating state: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Advanced from Phase %d to Phase %d\n", currentPhase, currentPhase+1)
}

func getCurrentPhase() (int, error) {
	data, err := os.ReadFile(".sdlc/state.md")
	if err != nil {
		return 0, err
	}

	re := regexp.MustCompile(`Phase:\*\*\s*(\d+)`)
	match := re.FindStringSubmatch(string(data))
	if len(match) > 1 {
		return strconv.Atoi(match[1])
	}
	return 0, fmt.Errorf("could not find current phase")
}

func markPhaseCleared(phase int) error {
	data, err := os.ReadFile(".sdlc/phases.md")
	if err != nil {
		return err
	}

	content := string(data)
	oldPattern := fmt.Sprintf("## Phase %d — %s [ACTIVE]", phase, getPhaseName(phase))
	newPattern := fmt.Sprintf("## Phase %d — %s [CLEARED]", phase, getPhaseName(phase))
	content = strings.Replace(content, oldPattern, newPattern, 1)

	return os.WriteFile(".sdlc/phases.md", []byte(content), 0644)
}

func unlockNextPhase(phase int) error {
	data, err := os.ReadFile(".sdlc/phases.md")
	if err != nil {
		return err
	}

	content := string(data)
	oldPattern := fmt.Sprintf("## Phase %d — %s [LOCKED]", phase+1, getPhaseName(phase+1))
	newPattern := fmt.Sprintf("## Phase %d — %s [ACTIVE]", phase+1, getPhaseName(phase+1))
	content = strings.Replace(content, oldPattern, newPattern, 1)

	return os.WriteFile(".sdlc/phases.md", []byte(content), 0644)
}

func incrementStatePhase(newPhase int) error {
	data, err := os.ReadFile(".sdlc/state.md")
	if err != nil {
		return err
	}

	content := string(data)
	re := regexp.MustCompile(`Phase:\*\*\s*\d+`)
	content = re.ReplaceAllString(content, fmt.Sprintf("Phase:** %d", newPhase))

	return os.WriteFile(".sdlc/state.md", []byte(content), 0644)
}

func getPhaseName(phase int) string {
	names := map[int]string{
		0: "SPECIFICATION",
		1: "ARCHITECTURE",
		2: "FOUNDATION",
		3: "CORE_LOGIC",
		4: "INTERFACE",
		5: "HARDENING",
		6: "ALIGNMENT",
	}
	return names[phase]
}
