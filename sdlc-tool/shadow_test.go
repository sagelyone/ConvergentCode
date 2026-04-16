package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractScenariosFromTest(t *testing.T) {
	content := `func TestSomething(t *testing.T) {}
func TestAnother(t *testing.T) {}`

	scenarios := extractScenariosFromTest(content)
	assert.Len(t, scenarios, 2)
}
