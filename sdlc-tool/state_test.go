package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUpdateField(t *testing.T) {
	content := "**Phase:** 0\n**Active task:** P0-001"

	result := updateField(content, "Phase", "1")
	assert.Contains(t, result, "**Phase:** 1")
	assert.Contains(t, result, "**Active task:** P0-001")
}

func TestExtractLoss(t *testing.T) {
	content := "**Loss:** total=50"

	loss := extractLoss(content)
	assert.Equal(t, 50.0, loss)
}
