package main

import (
	"os"
	"syscall"
)

type FileLock struct {
	path string
	file *os.File
}

func NewFileLock(path string) *FileLock {
	return &FileLock{path: path}
}

func (fl *FileLock) Lock() error {
	file, err := os.OpenFile(fl.path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	fl.file = file

	return syscall.Flock(int(file.Fd()), syscall.LOCK_EX)
}

func (fl *FileLock) Unlock() error {
	if fl.file == nil {
		return nil
	}

	err := syscall.Flock(int(fl.file.Fd()), syscall.LOCK_UN)
	fl.file.Close()
	fl.file = nil

	return err
}
