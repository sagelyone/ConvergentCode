package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetPhaseName(t *testing.T) {
	assert.Equal(t, "SPECIFICATION", getPhaseName(0))
	assert.Equal(t, "ARCHITECTURE", getPhaseName(1))
	assert.Equal(t, "FOUNDATION", getPhaseName(2))
	assert.Equal(t, "CORE_LOGIC", getPhaseName(3))
	assert.Equal(t, "INTERFACE", getPhaseName(4))
	assert.Equal(t, "HARDENING", getPhaseName(5))
	assert.Equal(t, "ALIGNMENT", getPhaseName(6))
}
