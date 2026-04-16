package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFilterUncovered(t *testing.T) {
	cells := []ScenarioCell{
		{EntityState: "A", Operation: "B", Covered: true},
		{EntityState: "C", Operation: "D", Covered: false},
	}

	uncovered := filterUncovered(cells)
	assert.Len(t, uncovered, 1)
	assert.Equal(t, "C", uncovered[0].EntityState)
}
