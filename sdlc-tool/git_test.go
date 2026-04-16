package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRevertToTask(t *testing.T) {
	err := revertToTask("NONEXISTENT")
	assert.Error(t, err)
}
