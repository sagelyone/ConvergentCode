package main

import (
	"fmt"
	"os"
	"regexp"
	"strings"
)

type ScenarioCell struct {
	EntityState  string
	Operation    string
	Precondition string
	Covered      bool
}

func handleScenarioMatrix(args []string) {
	data, err := os.ReadFile("docs/spec.md")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading spec: %v\n", err)
		os.Exit(1)
	}

	cells := parseScenarioCells(string(data))
	uncovered := filterUncovered(cells)

	fmt.Printf("Total cells: %d\n", len(cells))
	fmt.Printf("Uncovered cells: %d\n", len(uncovered))
	fmt.Println()

	for _, cell := range uncovered {
		fmt.Printf("- Entity: %s | Operation: %s | Precondition: %s\n",
			cell.EntityState, cell.Operation, cell.Precondition)
	}
}

func parseScenarioCells(content string) []ScenarioCell {
	var cells []ScenarioCell

	givenPattern := regexp.MustCompile(`Given\s+(\w+)`)
	whenPattern := regexp.MustCompile(`When\s+(\w+)`)
	statusPattern := regexp.MustCompile(`\*\*Status:\*\*\s*\[x\]`)

	scenarios := strings.Split(content, "### Scenario:")

	for _, scenario := range scenarios[1:] {
		entityMatch := givenPattern.FindStringSubmatch(scenario)
		operationMatch := whenPattern.FindStringSubmatch(scenario)

		entity := "unknown"
		if len(entityMatch) > 1 {
			entity = entityMatch[1]
		}

		operation := "unknown"
		if len(operationMatch) > 1 {
			operation = operationMatch[1]
		}

		covered := statusPattern.MatchString(scenario)

		cells = append(cells, ScenarioCell{
			EntityState:  entity,
			Operation:    operation,
			Precondition: "default",
			Covered:      covered,
		})
	}

	return cells
}

func filterUncovered(cells []ScenarioCell) []ScenarioCell {
	var uncovered []ScenarioCell
	for _, cell := range cells {
		if !cell.Covered {
			uncovered = append(uncovered, cell)
		}
	}
	return uncovered
}
