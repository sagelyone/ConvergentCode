package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUpdateTodoFile(t *testing.T) {
	content := "### T-001 Task one\n### T-002 Task two"

	result := markTaskComplete(content, "T-001")
	assert.Contains(t, result, "### T-001 [COMPLETED]")
	assert.Contains(t, result, "### T-002 Task two")
}

func TestMarkTaskBlocked(t *testing.T) {
	content := "### T-001 Task one"

	result := markTaskBlocked(content, "T-001")
	assert.Contains(t, result, "### T-001 [BLOCKED]")
}
