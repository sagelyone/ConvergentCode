package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type ShadowScenario struct {
	Given string
	When  string
	Then  string
}

func handleShadowScenarios(args []string) {
	scenarios := []ShadowScenario{}

	err := filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() || !strings.HasSuffix(path, "_test.go") {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		fileScenarios := extractScenariosFromTest(string(data))
		scenarios = append(scenarios, fileScenarios...)

		return nil
	})

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error walking files: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Generated %d shadow scenarios:\n\n", len(scenarios))

	for i, s := range scenarios {
		fmt.Printf("### Shadow-%03d\n", i+1)
		fmt.Printf("Given %s\n", s.Given)
		fmt.Printf("When %s\n", s.When)
		fmt.Printf("Then %s\n\n", s.Then)
	}
}

func extractScenariosFromTest(content string) []ShadowScenario {
	var scenarios []ShadowScenario

	funcPattern := regexp.MustCompile(`func\s+(Test\w+)\s*\(`)
	matches := funcPattern.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		funcName := match[1]
		scenario := ShadowScenario{
			Given: "the system is in initial state",
			When:  fmt.Sprintf("executing %s", funcName),
			Then:  "behavior is observed",
		}
		scenarios = append(scenarios, scenario)
	}

	return scenarios
}
